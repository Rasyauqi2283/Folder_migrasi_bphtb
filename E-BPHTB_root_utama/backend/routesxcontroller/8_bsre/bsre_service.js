// tempat sambungan BSRE dengan server backend
import axios from 'axios';
import crypto from 'crypto';

function getConfig() {
  return {
    env: process.env.BSRE_ENV || 'sandbox', // default to 'sandbox' to satisfy DB constraint
    baseUrl: process.env.BSRE_BASE_URL || '',
    tokenPath: process.env.BSRE_TOKEN_PATH || '/oauth/token',
    initiatePath: process.env.BSRE_INITIATE_PATH || '/sign/initiate',
    clientId: process.env.BSRE_CLIENT_ID || '',
    clientSecret: process.env.BSRE_CLIENT_SECRET || ''
  };
}

export async function getAccessToken(db) {
  const cfg = getConfig();
  const environment = cfg.env;

  // 1) Try cache (valid > 60s)
  const { rows } = await db.query(
    `SELECT id, access_token, expires_at
     FROM pv_3_bsre_token_cache
     WHERE environment = $1 AND (expires_at IS NULL OR expires_at > NOW() + INTERVAL '60 seconds')
     ORDER BY expires_at DESC NULLS LAST, id DESC
     LIMIT 1`,
    [environment]
  );
  if (rows.length > 0 && rows[0].access_token) {
    return rows[0].access_token;
  }

  // 2) Fetch new token
  let accessToken = '';
  let expiresAt = null;

  if (environment === 'mock' || !cfg.baseUrl || !cfg.clientId || !cfg.clientSecret) {
    accessToken = `mock-${crypto.randomBytes(16).toString('hex')}`;
    expiresAt = new Date(Date.now() + 55 * 60 * 1000); // 55 minutes
  } else {
    try {
      const url = `${cfg.baseUrl}${cfg.tokenPath}`;
      const resp = await axios.post(url, {
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        grant_type: 'client_credentials'
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
      accessToken = resp.data?.access_token || '';
      const expiresIn = Number(resp.data?.expires_in || 3000); // seconds
      expiresAt = new Date(Date.now() + expiresIn * 1000);
    } catch (err) {
      // Fallback to mock token if remote fails (useful while not yet onboarded)
      accessToken = `mock-${crypto.randomBytes(16).toString('hex')}`;
      expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    }
  }

  await db.query(
    `INSERT INTO pv_3_bsre_token_cache (environment, access_token, expires_at, obtained_at, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW(), NOW())`,
    [environment, accessToken, expiresAt]
  );

  return accessToken;
}

export async function initiateSigning({ accessToken, noValidasi, nobooking, pdfPath, pdfSHA256, appearance }) {
  const cfg = getConfig();
  if (cfg.env === 'mock' || !cfg.baseUrl) {
    return { bsreRequestId: `MOCK-${crypto.randomBytes(12).toString('hex')}` };
  }

  const url = `${cfg.baseUrl}${cfg.initiatePath}`;
  const payload = {
    reference: noValidasi,
    nobooking,
    pdf_path: pdfPath,
    pdf_sha256: pdfSHA256,
    appearance
  };
  const headers = { Authorization: `Bearer ${accessToken}` };
  const resp = await axios.post(url, payload, { headers, timeout: 30000 });
  const bsreRequestId = resp.data?.request_id || resp.data?.id || null;
  if (!bsreRequestId) throw new Error('BSrE initiate response missing request_id');
  return { bsreRequestId };
}

export async function authorizeSigning({ accessToken, bsreRequestId, passphrase, otp }) {
  const cfg = getConfig();
  if (cfg.env === 'mock' || !cfg.baseUrl) {
    return { success: true, bsreSignatureId: `MOCK-SIG-${crypto.randomBytes(8).toString('hex')}` };
  }
  const url = `${cfg.baseUrl}/sign/authorize`;
  const payload = { request_id: bsreRequestId, passphrase, otp };
  const headers = { Authorization: `Bearer ${accessToken}` };
  const resp = await axios.post(url, payload, { headers, timeout: 30000 });
  const ok = !!resp.data?.success || resp.status === 200;
  if (!ok) throw new Error('BSrE authorize failed');
  return { success: true, bsreSignatureId: resp.data?.signature_id || null };
}
