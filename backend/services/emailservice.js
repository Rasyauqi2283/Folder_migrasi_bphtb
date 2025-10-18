import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { pool } from '../../db.js';

// Email service configuration and initialization
let emailService = null;
let smtpTransporter = null;

try {
  // SendGrid configuration (primary)
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    emailService = 'sendgrid';
    console.log('✅ SendGrid email service initialized');
  } 
  // SMTP fallback
  else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 5000,
      greetingTimeout: 3000,
      socketTimeout: 10000
    });
    emailService = 'smtp';
    console.log('✅ SMTP email service initialized (fallback)');
  } else {
    console.warn('⚠️ No email credentials found; email notifications disabled');
  }
} catch (e) {
  console.error('❌ Failed to initialize email service:', e);
}

// Central email helpers
export function getEmailService() {
  return emailService;
}

// SendGrid email function
export async function sendEmailViaSendGrid(to, subject, text, html = null) {
  try {
    const msg = {
      to: to,
      from: process.env.EMAIL_USER || 'noreply@bappenda.com',
      subject: subject,
      text: text,
      html: html || text
    };

    const response = await Promise.race([
      sgMail.send(msg),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SendGrid timeout after 15 seconds')), 15000)
      )
    ]);

    console.log(`✅ Email sent via SendGrid to ${to}: ${response[0].statusCode}`);
    return response;
  } catch (error) {
    console.error(`❌ SendGrid email failed to ${to}:`, error.message);
    throw error;
  }
}

// SMTP email function (fallback)
export async function sendEmailViaSMTP(to, subject, text, html = null) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      html: html || text
    };

    const info = await Promise.race([
      smtpTransporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SMTP timeout after 20 seconds')), 20000)
      )
    ]);

    console.log(`✅ Email sent via SMTP to ${to}: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`❌ SMTP email failed to ${to}:`, error.message);
    throw error;
  }
}

// Universal email function with fallback
export async function sendEmail(to, subject, text, html = null, maxRetries = 2) {
  if (!emailService) {
    throw new Error('No email service available');
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Email attempt ${attempt}/${maxRetries} to ${to}`);

      // Add timeout wrapper for the entire email operation
      const emailPromise = emailService === 'sendgrid' 
        ? sendEmailViaSendGrid(to, subject, text, html)
        : sendEmailViaSMTP(to, subject, text, html);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email operation timeout after 30 seconds')), 30000)
      );

      return await Promise.race([emailPromise, timeoutPromise]);
    } catch (error) {
      console.error(`❌ Email attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        // Try fallback service if primary fails
        if (emailService === 'sendgrid' && smtpTransporter) {
          console.log('🔄 Trying SMTP fallback...');
          try {
            const fallbackPromise = sendEmailViaSMTP(to, subject, text, html);
            const fallbackTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Fallback email timeout after 30 seconds')), 30000)
            );
            return await Promise.race([fallbackPromise, fallbackTimeout]);
          } catch (fallbackError) {
            console.error('❌ Both email services failed:', fallbackError.message);
          }
        }
        throw new Error(`Email delivery failed after ${maxRetries} attempts`);
      }

      // Wait before retry
      const waitTime = attempt * 2000; // 2s, 4s
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

export async function sendEmailSafe(mailOptions) {
  try {
    if (!emailService) {
      console.warn('⚠️ No email service available; skipping email send', { to: mailOptions?.to, subject: mailOptions?.subject });
      return { skipped: true };
    }

    // Jika ada attachments, gunakan jalur yang mendukung lampiran
    if (Array.isArray(mailOptions.attachments) && mailOptions.attachments.length > 0) {
      const result = await sendEmailWithFallback(mailOptions);
      return { success: true, info: result };
    }

    // Extract email data from mailOptions
    const { to, subject, text, html } = mailOptions;
    
    // Use universal email function with SendGrid/SMTP (tanpa lampiran)
    const result = await sendEmail(to, subject, text, html);
    
    console.log('✅ Email sent successfully', { 
      to: mailOptions?.to, 
      subject: mailOptions?.subject,
      service: emailService,
      messageId: result?.[0]?.headers?.['x-message-id'] || 'N/A'
    });
    
    return { success: true, info: result };
  } catch (err) {
    console.warn('Email send failed', { error: err?.message, to: mailOptions?.to, subject: mailOptions?.subject });
    return { success: false, error: err };
  }
}

// Gmail SMTP configuration sebagai fallback
const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 5000,
    greetingTimeout: 3000,
    socketTimeout: 10000,
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    rateDelta: 2000,
    rateLimit: 2,
    secure: true,
    tls: {
        rejectUnauthorized: false
    }
});

// Fallback transporter untuk testing
const testTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
    }
});

// Test koneksi email
export const testEmailConnection = async () => {
    try {
        console.log('📧 Testing email connection...');
        
        // Test SendGrid first
        if (process.env.SENDGRID_API_KEY) {
            // SendGrid doesn't have a verify method, so we'll test with a simple API call
            console.log('✅ SendGrid API key is configured');
            return true;
        }
        
        // Fallback to Gmail SMTP
        await gmailTransporter.verify();
        console.log('✅ Gmail SMTP connection successful');
        return true;
    } catch (error) {
        console.error('❌ Email connection failed:', error.message);
        return false;
    }
};

// SendGrid email service dengan fallback ke Gmail
export const sendEmailWithFallback = async (mailOptions, maxRetries = 2) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📧 Email attempt ${attempt}/${maxRetries} to ${mailOptions.to}`);
            
            let info;
            
            // Try SendGrid first if API key is available
            if (process.env.SENDGRID_API_KEY) {
                console.log('🚀 Using SendGrid API...');
                
                const sgMessage = {
                    to: mailOptions.to,
                    from: mailOptions.from,
                    subject: mailOptions.subject,
                    text: mailOptions.text,
          html: mailOptions.html,
          attachments: Array.isArray(mailOptions.attachments)
            ? mailOptions.attachments.map(att => ({
                content: att.contentBase64 || att.content || att.base64, // base64 string
                filename: att.filename,
                type: att.contentType || att.mimeType || 'application/octet-stream',
                disposition: att.disposition || 'attachment'
              }))
            : undefined
                };
                
                info = await Promise.race([
                    sgMail.send(sgMessage),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('SendGrid timeout after 15 seconds')), 15000)
                    )
                ]);
                
                console.log(`✅ Email sent via SendGrid to ${mailOptions.to}`);
                
            } else {
                // Fallback to Gmail SMTP
                console.log('📧 Using Gmail SMTP fallback...');
                
                const isConnected = await testEmailConnection();
                if (!isConnected) {
                    throw new Error('SMTP connection failed');
                }
                
        const smtpOptions = {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          text: mailOptions.text,
          html: mailOptions.html,
          attachments: Array.isArray(mailOptions.attachments)
            ? mailOptions.attachments.map(att => ({
                filename: att.filename,
                content: att.buffer || (att.contentBase64 ? Buffer.from(att.contentBase64, 'base64') : att.content),
                contentType: att.contentType || att.mimeType || 'application/octet-stream'
              }))
            : undefined
        };

        info = await Promise.race([
          gmailTransporter.sendMail(smtpOptions),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Gmail SMTP timeout after 20 seconds')), 20000)
                    )
                ]);
                
                console.log(`✅ Email sent via Gmail SMTP to ${mailOptions.to}: ${info.response}`);
            }
            
            return info;
            
        } catch (error) {
            console.error(`❌ Email attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                console.error('❌ All email attempts failed, logging OTP for manual verification');
                
                // Log OTP ke database untuk manual verification
                try {
                    const otpMatch = mailOptions.text.match(/Kode OTP Anda adalah: (\d{6})/);
                    const otp = otpMatch ? otpMatch[1] : 'unknown';
                    
                    await pool.query(
                        'INSERT INTO otp_logs (email, otp, created_at, status) VALUES ($1, $2, NOW(), $3)',
                        [mailOptions.to, otp, 'failed_to_send']
                    );
                } catch (dbError) {
                    console.error('Failed to log OTP to database:', dbError.message);
                }
                
                throw new Error(`Email delivery failed after ${maxRetries} attempts`);
            }
            
            // Wait before retry
            const waitTime = attempt * 2000; // 2s, 4s
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
};

// Note: transporter lama sudah tidak digunakan, menggunakan sendEmailSafe() untuk semua pengiriman email

// Test koneksi email service
export const testEmailService = async () => {
    try {
        console.log('🔍 Testing email service connection...');
        
        if (!emailService) {
            console.warn('⚠️ No email service available');
            return { success: false, error: 'No email service configured' };
        }
        
        console.log(`📧 Using email service: ${emailService}`);
        
        // Test dengan email sederhana
        const testResult = await sendEmailSafe({
            to: process.env.EMAIL_USER || 'test@example.com',
            subject: 'Test Email Service',
            text: 'This is a test email to verify email service functionality.',
            html: '<p>This is a test email to verify email service functionality.</p>'
        });
        
        if (testResult.success) {
            console.log('✅ Email service test successful');
            return { success: true, service: emailService };
        } else {
            console.error('❌ Email service test failed:', testResult.error);
            return { success: false, error: testResult.error };
        }
        
    } catch (error) {
        console.error('❌ Email service test error:', error.message);
        return { success: false, error: error.message };
    }
};

// patch 1
// pembuatan otp
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const validateOTPFormat = (otp) => {
    return /^\d{6}$/.test(otp);
};

// Async OTP sender dengan SendGrid - tidak menghalangi proses registrasi
export const sendOTPAsync = async (email, otp) => {
    // Kirim OTP secara async tanpa menunggu response
    setImmediate(async () => {
        try {
            console.log(`📧 [ASYNC] Sending OTP to ${email}`);
            await sendOTPWithRetry(email, otp, 2); // Gunakan retry dengan 2 attempts
            console.log(`✅ [ASYNC] OTP sent successfully to ${email}`);
        } catch (error) {
            console.error(`❌ [ASYNC] OTP failed for ${email}:`, error.message);
            
            // Fallback: Simpan OTP di database untuk admin bisa cek
            try {
                await pool.query(
                    'INSERT INTO otp_logs (email, otp, created_at, status) VALUES ($1, $2, NOW(), $3)',
                    [email, otp, 'failed_to_send']
                );
                console.log(`📝 [ASYNC] OTP logged to database for ${email}: ${otp}`);
            } catch (dbError) {
                console.error('Failed to log OTP to database:', dbError.message);
            }
        }
    });
    
    return { success: true, message: 'OTP sedang dikirim...' };
};

export const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'OTP untuk Registrasi',
        text: `Kode OTP Anda adalah: ${otp}. Silakan masukkan kode ini untuk melanjutkan proses verifikasi.`
    };
    
    try {
        // Menggunakan sendEmailSafe untuk error handling yang robust
        const result = await sendEmailSafe(mailOptions);
        
        if (result.success) {
            console.log(`✅ OTP telah dikirim ke email ${email}`);
            return result.info;
        } else {
            throw new Error(result.error?.message || 'Failed to send OTP email');
        }
    } catch (error) {
        console.error('❌ Gagal mengirim OTP:', error.message);
        throw error;
    }
};

export const sendOTPWithRetry = async (email, otp, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`📧 Attempt ${attempt}/${retries}: Sending OTP to ${email}`);
            
            // Try SendGrid first
            if (process.env.SENDGRID_API_KEY) {
                console.log('🚀 Using SendGrid API...');
                const msg = {
                    to: email,
                    from: process.env.EMAIL_USER || 'noreply@bappenda.com',
                    subject: 'OTP untuk Registrasi - BAPPENDA BPHTB',
                    text: `Kode OTP Anda adalah: ${otp}. Silakan masukkan kode ini untuk melanjutkan proses verifikasi.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #2c3e50;">Kode OTP untuk Registrasi</h2>
                            <p>Halo,</p>
                            <p>Berikut adalah kode OTP Anda untuk melanjutkan proses registrasi:</p>
                            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
                                <h1 style="color: #e74c3c; font-size: 32px; margin: 0;">${otp}</h1>
                            </div>
                            <p>Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
                            <p>Terima kasih,<br>Tim BAPPENDA BPHTB</p>
                        </div>
                    `
                };
                
                const response = await Promise.race([
                    sgMail.send(msg),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('SendGrid timeout after 15 seconds')), 15000)
                    )
                ]);
                
                console.log(`✅ Email sent via SendGrid to ${email}`);
                return response;
            }
            
            // Fallback to Gmail SMTP
            console.log('📧 Using Gmail SMTP fallback...');
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'OTP untuk Registrasi - BAPPENDA BPHTB',
                text: `Kode OTP Anda adalah: ${otp}. Silakan masukkan kode ini untuk melanjutkan proses verifikasi.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">Kode OTP untuk Registrasi</h2>
                        <p>Halo,</p>
                        <p>Berikut adalah kode OTP Anda untuk melanjutkan proses registrasi:</p>
                        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
                            <h1 style="color: #e74c3c; font-size: 32px; margin: 0;">${otp}</h1>
                        </div>
                        <p>Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
                        <p>Terima kasih,<br>Tim BAPPENDA BPHTB</p>
                    </div>
                `
            };
            
            const info = await Promise.race([
                gmailTransporter.sendMail(mailOptions),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Gmail SMTP timeout after 15 seconds')), 15000)
                )
            ]);
            
            console.log(`✅ Email sent via Gmail SMTP to ${email}`);
            return info;
            
        } catch (error) {
            console.error(`❌ Attempt ${attempt}/${retries} failed: ${error.message}`);
            
            if (attempt === retries) {
                console.error(`❌ Semua percobaan gagal untuk mengirim OTP ke: ${email}`);
                throw new Error(`Failed to send OTP after ${retries} attempts: ${error.message}`);
            }
            
            // Wait before retry (exponential backoff)
            const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
};

// Mengirim notifikasi email ke pengguna yang sudah dibuatkan akun
export const sendEmailNotification = async (email, userID, ppatkNumber) => {
    try {
        console.log(`📧 Sending user notification email to ${email} for userID: ${userID}`);
        
        const userQuery = await pool.query(
            'SELECT nama, divisi FROM a_2_verified_users WHERE email = $1', 
            [email]
        );
        
        if (!userQuery.rows.length) {
            console.warn(`⚠️ User ${email} tidak ditemukan`);
            return { success: false, error: 'User not found' };
        }
        
        const user = userQuery.rows[0];
        
        const mailOptions = {
            to: email,
            subject: 'UserID Anda Telah Aktif - Sistem BAPPENDA',
            text: `Halo ${user.nama},\n\nAkun Anda telah aktif dengan detail:\nUser ID: ${userID}\n${ppatkNumber ? `Nomor PPAT: ${ppatkNumber}\n` : ''}Divisi: ${user.divisi}\n\nAnda sekarang dapat login ke sistem menggunakan email ini.\n\nHormat kami,\nTim Sistem`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">🎉 Akun Anda Telah Aktif</h1>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                        <p style="font-size: 16px; color: #333;">Halo <strong style="color: #2c3e50;">${user.nama}</strong>,</p>
                        
                        <p style="color: #666; line-height: 1.6;">Selamat! Akun Anda telah berhasil dibuat dan aktif. Berikut adalah detail akun Anda:</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h3 style="color: #2c3e50; margin-top: 0;">📋 Detail Akun</h3>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">User ID:</strong> <span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${userID}</span></p>
                            ${ppatkNumber ? `<p style="margin: 10px 0;"><strong style="color: #495057;">Nomor PPAT:</strong> <span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${ppatkNumber}</span></p>` : ''}
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Divisi:</strong> <span style="color: #28a745; font-weight: bold;">${user.divisi}</span></p>
                        </div>
                        
                        <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold;">✅ Status: Akun Aktif</p>
                            <p style="margin: 5px 0 0 0;">Anda sekarang dapat login ke sistem menggunakan email ini.</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'https://bphtb-bappenda.up.railway.app'}/login.html" 
                               style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                                🚀 Login ke Sistem
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
                        
                        <p style="color: #666; font-size: 14px; margin: 0;">
                            <strong>Hormat kami,</strong><br>
                            <span style="color: #2c3e50;">Tim Sistem BAPPENDA</span>
                        </p>
                    </div>
                </div>
            `
        };
        
        // Menggunakan sendEmailSafe untuk error handling yang robust
        const result = await sendEmailSafe(mailOptions);
        
        if (result.success) {
            console.log(`✅ Email notification sent successfully to ${email} for userID: ${userID}`);
            return { success: true, message: 'Email sent successfully' };
        } else {
            console.error(`❌ Failed to send email notification to ${email}:`, result.error);
            return { success: false, error: result.error };
        }
        
    } catch (error) {
        console.error(`❌ Error in sendEmailNotification for ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};

// patch 3
// mengirim email reset ke pengguna

export const sendResetEmail = async (to, link) => {
    const mailOptions = {
        from: `"BAPPENDA" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reset Password - E-BPHTB',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Reset Password</h2>
                <p>Klik tombol berikut untuk reset password Anda:</p>
                <a href="${link}" 
                   style="display: inline-block; padding: 10px 20px; 
                          background-color: #3498db; color: white; 
                          text-decoration: none; border-radius: 5px;">
                    Reset Password
                </a>
                <p style="margin-top: 20px;">
                    <small>Link akan kadaluarsa dalam 1 jam</small>
                </p>
            </div>
        `
    };

    try {
        const result = await sendEmailSafe(mailOptions);
        
        if (result.success) {
            console.log(`✅ Reset password email sent successfully to ${to}`);
        } else {
            console.error(`❌ Failed to send reset password email to ${to}:`, result.error);
            throw new Error('Gagal mengirim email reset password');
        }
    } catch (err) {
        console.error('❌ Email Error:', err.message);
        throw new Error('Gagal mengirim email');
    }
};

// Mengirim notifikasi email pengiriman dokumen (Draft → Diolah)
export const sendDocumentSubmissionEmail = async (email, nobooking, noRegistrasi, userType = 'PPAT') => {
    try {
        console.log(`📧 Sending document submission email to ${email} for nobooking: ${nobooking}`);
        
        // Ambil data user dari database untuk personalisasi
        const userQuery = await pool.query(
            'SELECT nama FROM a_2_verified_users WHERE email = $1', 
            [email]
        );
        
        const userName = userQuery.rows.length > 0 ? userQuery.rows[0].nama : 'Bapak/Ibu';
        const userTypeFormal = userType === 'PPATS' ? 'PPATS (Pejabat Pembuat Akta Tanah Sementara)' : 'PPAT (Pejabat Pembuat Akta Tanah)';
        
        const mailOptions = {
            to: email,
            subject: `Dokumen Permohonan Telah Dikirim - ${nobooking}`,
            text: `Halo ${userName},\n\nDokumen permohonan Anda telah berhasil dikirimkan ke sistem BAPPENDA.\n\nDetail Pengiriman:\n- Nomor Booking: ${nobooking}\n- Nomor Registrasi: ${noRegistrasi}\n- Status: Sedang Diolah\n\nMohon ditunggu hingga dokumen selesai diproses. Anda akan menerima notifikasi email ketika dokumen telah selesai.\n\nHormat kami,\nTim BAPPENDA`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">📤 Dokumen Telah Dikirim</h1>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                        <p style="font-size: 16px; color: #333;">Halo <strong style="color: #2c3e50;">${userName}</strong>,</p>
                        
                        <p style="color: #666; line-height: 1.6;">Kami informasikan bahwa dokumen permohonan Anda telah berhasil dikirimkan ke sistem BAPPENDA dan sedang dalam proses pengolahan.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h3 style="color: #2c3e50; margin-top: 0;">📋 Detail Pengiriman</h3>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Nomor Booking:</strong> <span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${nobooking}</span></p>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Nomor Registrasi:</strong> <span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${noRegistrasi}</span></p>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Jenis Pengguna:</strong> <span style="color: #28a745; font-weight: bold;">${userTypeFormal}</span></p>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Status Saat Ini:</strong> <span style="color: #ffc107; font-weight: bold;">Sedang Diolah</span></p>
                        </div>
                        
                        <div style="background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin: 0 0 10px 0; color: #0c5460;">⏳ Proses Selanjutnya:</h4>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>Dokumen sedang dalam tahap pengolahan dan verifikasi</li>
                                <li>Tim BAPPENDA akan memeriksa kelengkapan dokumen</li>
                                <li>Proses validasi akan dilakukan sesuai ketentuan yang berlaku</li>
                                <li>Anda akan menerima notifikasi email ketika dokumen telah selesai</li>
                            </ul>
                        </div>
                        
                        <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold;">✅ Status: Dokumen Berhasil Dikirim</p>
                            <p style="margin: 5px 0 0 0;">Mohon ditunggu hingga dokumen selesai diproses oleh tim BAPPENDA.</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'https://bphtb-bappenda.up.railway.app'}/login.html" 
                               style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                                📊 Cek Status Dokumen
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
                        
                        <p style="color: #666; font-size: 14px; margin: 0;">
                            <strong>Hormat kami,</strong><br>
                            <span style="color: #2c3e50;">Tim Sistem BAPPENDA Kabupaten Bogor</span>
                        </p>
                    </div>
                </div>
            `
        };
        
        // Menggunakan sendEmailSafe untuk error handling yang robust
        const result = await sendEmailSafe(mailOptions);
        
        if (result.success) {
            console.log(`✅ Document submission email sent successfully to ${email} for nobooking: ${nobooking}`);
            return { success: true, message: 'Document submission email sent successfully' };
        } else {
            console.error(`❌ Failed to send document submission email to ${email}:`, result.error);
            return { success: false, error: result.error };
        }
        
    } catch (error) {
        console.error(`❌ Error in sendDocumentSubmissionEmail for ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};

// Mengirim notifikasi email penyelesaian dokumen (Diolah → Diserahkan)
export const sendDocumentCompletionEmail = async (email, nobooking, noRegistrasi, noValidasi, userType = 'PPAT', options = {}) => {
    try {
        console.log(`📧 Sending document completion email to ${email} for nobooking: ${nobooking}`);
    const { attachments = [], publicDownloadUrl = null } = options || {};
        
        // Ambil data user dari database untuk personalisasi
        const userQuery = await pool.query(
            'SELECT nama FROM a_2_verified_users WHERE email = $1', 
            [email]
        );
        
        const userName = userQuery.rows.length > 0 ? userQuery.rows[0].nama : 'Bapak/Ibu';
        const userTypeFormal = userType === 'PPATS' ? 'PPATS (Pejabat Pembuat Akta Tanah Sementara)' : 'PPAT (Pejabat Pembuat Akta Tanah)';
        
    const mailOptions = {
            to: email,
            subject: `Dokumen Permohonan Telah Selesai - ${nobooking}`,
            text: `Halo ${userName},\n\nDokumen permohonan Anda telah dinyatakan lulus dan selesai diproses.\n\nDetail Penyelesaian:\n- Nomor Booking: ${nobooking}\n- Nomor Registrasi: ${noRegistrasi}\n- Nomor Validasi: ${noValidasi}\n- Status: Diserahkan\n\nDokumen telah selesai diproses dan dapat diambil sesuai ketentuan yang berlaku.\n\nHormat kami,\nTim BAPPENDA`,
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">🎉 Dokumen Telah Selesai</h1>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                        <p style="font-size: 16px; color: #333;">Halo <strong style="color: #2c3e50;">${userName}</strong>,</p>
                        
                        <p style="color: #666; line-height: 1.6;">Kami informasikan bahwa dokumen permohonan Anda telah dinyatakan <strong style="color: #28a745;">lulus</strong> dan selesai diproses oleh tim BAPPENDA.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h3 style="color: #2c3e50; margin-top: 0;">📋 Detail Penyelesaian</h3>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Nomor Booking:</strong> <span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${nobooking}</span></p>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Nomor Registrasi:</strong> <span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${noRegistrasi}</span></p>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Nomor Validasi:</strong> <span style="background: #d4edda; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #155724; font-weight: bold;">${noValidasi}</span></p>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Jenis Pengguna:</strong> <span style="color: #007bff; font-weight: bold;">${userTypeFormal}</span></p>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Status:</strong> <span style="color: #28a745; font-weight: bold;">Diserahkan</span></p>
                        </div>
                        
                        <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Status: Dokumen Lulus dan Selesai</h4>
                            <p style="margin: 0;">Dokumen permohonan Anda telah berhasil diproses dan dinyatakan lulus sesuai dengan ketentuan yang berlaku.</p>
                        </div>
                        
                        <div style="background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin: 0 0 10px 0; color: #0c5460;">📄 Informasi Dokumen:</h4>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>Dokumen telah divalidasi dan disetujui</li>
                                <li>Nomor validasi telah diterbitkan: <strong>${noValidasi}</strong></li>
                                <li>Dokumen siap untuk diambil sesuai prosedur</li>
                                <li>QR Code telah terintegrasi untuk verifikasi keaslian</li>
                            </ul>
                        </div>

            ${publicDownloadUrl ? `
            <div style="text-align: center; margin: 24px 0;">
              <a href="${publicDownloadUrl}" style="background: #10b981; color: white; padding: 12px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">⬇️ Unduh Dokumen Tanpa Login</a>
              <p style="margin-top:8px; color:#6b7280; font-size:12px;">Tautan berlaku terbatas waktu untuk keamanan.</p>
            </div>
            ` : ''}
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'https://bphtb-bappenda.up.railway.app'}/login.html" 
                               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                                📊 Lihat Dokumen Lengkap
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
                        
                        <p style="color: #666; font-size: 14px; margin: 0;">
                            <strong>Hormat kami,</strong><br>
                            <span style="color: #2c3e50;">Tim Sistem BAPPENDA Kabupaten Bogor</span>
                        </p>
                    </div>
                </div>
      `,
      attachments: attachments
    };
        
        // Menggunakan sendEmailSafe untuk error handling yang robust
        const result = await sendEmailSafe(mailOptions);
        
        if (result.success) {
            console.log(`✅ Document completion email sent successfully to ${email} for nobooking: ${nobooking}`);
            return { success: true, message: 'Document completion email sent successfully' };
        } else {
            console.error(`❌ Failed to send document completion email to ${email}:`, result.error);
            return { success: false, error: result.error };
        }
        
    } catch (error) {
        console.error(`❌ Error in sendDocumentCompletionEmail for ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};

// Mengirim notifikasi email penolakan dokumen
export const sendRejectionEmail = async (email, nobooking, rejectionReason, rejectedBy, documentType = 'Dokumen Permohonan') => {
    try {
        console.log(`📧 Sending rejection email to ${email} for nobooking: ${nobooking}`);
        
        // Ambil data user dari database untuk personalisasi
        const userQuery = await pool.query(
            'SELECT nama FROM a_2_verified_users WHERE email = $1', 
            [email]
        );
        
        const userName = userQuery.rows.length > 0 ? userQuery.rows[0].nama : 'Bapak/Ibu';
        
        const mailOptions = {
            to: email,
            subject: `Dokumen Permohonan Ditolak - ${nobooking}`,
            text: `Halo ${userName},\n\nDokumen permohonan dengan nomor booking ${nobooking} telah ditolak.\n\nAlasan penolakan: ${rejectionReason}\n\nDitolak oleh: ${rejectedBy}\n\nSilakan perbaiki dokumen sesuai dengan alasan penolakan dan ajukan kembali.\n\nHormat kami,\nTim BAPPENDA`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">❌ Dokumen Ditolak</h1>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                        <p style="font-size: 16px; color: #333;">Halo <strong style="color: #2c3e50;">${userName}</strong>,</p>
                        
                        <p style="color: #666; line-height: 1.6;">Kami informasikan bahwa dokumen permohonan Anda telah ditolak dan memerlukan perbaikan.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h3 style="color: #2c3e50; margin-top: 0;">📋 Detail Penolakan</h3>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Nomor Booking:</strong> <span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${nobooking}</span></p>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Jenis Dokumen:</strong> <span style="color: #6c757d;">${documentType}</span></p>
                            <p style="margin: 10px 0;"><strong style="color: #495057;">Ditolak oleh:</strong> <span style="color: #dc3545; font-weight: bold;">${rejectedBy}</span></p>
                        </div>
                        
                        <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin: 0 0 10px 0; color: #721c24;">📝 Alasan Penolakan:</h4>
                            <p style="margin: 0; font-style: italic;">"${rejectionReason}"</p>
                        </div>
                        
                        <div style="background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin: 0 0 10px 0; color: #0c5460;">📌 Langkah Selanjutnya:</h4>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>Perbaiki dokumen sesuai dengan alasan penolakan</li>
                                <li>Pastikan semua dokumen lengkap dan sesuai ketentuan</li>
                                <li>Ajukan kembali dokumen yang telah diperbaiki</li>
                                <li>Data yang ditolak akan otomatis dihapus setelah 10 hari</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'https://bphtb-bappenda.up.railway.app'}/login.html" 
                               style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                                🔄 Login untuk Ajukan Ulang
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
                        
                        <p style="color: #666; font-size: 14px; margin: 0;">
                            <strong>Hormat kami,</strong><br>
                            <span style="color: #2c3e50;">Tim Sistem BAPPENDA</span>
                        </p>
                    </div>
                </div>
            `
        };
        
        // Menggunakan sendEmailSafe untuk error handling yang robust
        const result = await sendEmailSafe(mailOptions);
        
        if (result.success) {
            console.log(`✅ Rejection email sent successfully to ${email} for nobooking: ${nobooking}`);
            return { success: true, message: 'Rejection email sent successfully' };
        } else {
            console.error(`❌ Failed to send rejection email to ${email}:`, result.error);
            return { success: false, error: result.error };
        }
        
    } catch (error) {
        console.error(`❌ Error in sendRejectionEmail for ${email}:`, error.message);
        return { success: false, error: error.message };
    }
};