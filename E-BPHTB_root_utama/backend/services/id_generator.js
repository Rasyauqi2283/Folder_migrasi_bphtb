import { ID_PATTERNS, PPAT_RANGE, getDivisiCode } from '../utils/constant.js';

export const generateUserID = async (client, divisiName) => {
    const divisiCode = getDivisiCode(divisiName);
  const pattern = ID_PATTERNS[divisiName] || ID_PATTERNS.default;
  const prefix = pattern.prefix || divisiCode;
  const totalLength = prefix.length + pattern.digits;

  const lastIDResult = await client.query(
    `SELECT userid FROM a_2_verified_users 
     WHERE userid LIKE $1 
       AND LENGTH(userid) = $2
       AND verifiedstatus = 'complete'
     ORDER BY userid DESC 
     LIMIT 1 FOR UPDATE`,
    [`${prefix}%`, totalLength]
  );

  let nextNum = 1;
  if (lastIDResult.rows.length > 0) {
    const lastID = lastIDResult.rows[0].userid;
    const lastNum = parseInt(lastID.slice(prefix.length)) || 0;
    nextNum = lastNum + 1;
    if (nextNum >= Math.pow(10, pattern.digits)) {
      throw new Error(`Nomor ID untuk divisi ${divisiName} telah mencapai batas maksimum`);
    }
  }

  return prefix + nextNum.toString().padStart(pattern.digits, '0');
};

export const generatePPATNumber = async (client) => {
    const lastPpat = await client.query(
    `SELECT ppat_khusus FROM a_2_verified_users 
       WHERE ppat_khusus IS NOT NULL 
         AND ppat_khusus != ''
         AND ppat_khusus ~ '^[0-9]+$'  -- Only numeric values
         AND divisi IN ('PPAT', 'PPATS')
       ORDER BY ppat_khusus::INTEGER DESC 
       LIMIT 1 FOR UPDATE`
  );
  
  let nextNum = PPAT_RANGE.min;
  if (lastPpat.rows[0]?.ppat_khusus) {
    nextNum = parseInt(lastPpat.rows[0].ppat_khusus) + 1;
    if (nextNum > PPAT_RANGE.max) {
      throw new Error("Nomor PPAT khusus telah mencapai batas maksimum");
    }
  }
  
  return nextNum.toString().padStart(5, '0');
};