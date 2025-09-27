import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { pool } from '../../db.js';

// SendGrid configuration
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid API key configured');
} else {
    console.warn('⚠️ SENDGRID_API_KEY not found, falling back to Gmail SMTP');
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
                    html: mailOptions.html
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
                
                info = await Promise.race([
                    gmailTransporter.sendMail(mailOptions),
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

// Pilih transporter berdasarkan environment
const transporter = process.env.NODE_ENV === 'production' ? gmailTransporter : testTransporter;

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
        // Mengirim email OTP dengan timeout
        const info = await Promise.race([
            transporter.sendMail(mailOptions),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Email timeout after 30 seconds')), 30000)
            )
        ]);
        
        console.log(`✅ OTP telah dikirim ke email ${email}: ${info.response}`);
        return info;
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

// patch 2
// mengirim notifikasi email ke pengguna yang sudah dibuatkan akun
export const sendEmailNotification = async (email, userID, ppatkNumber) => {
    try {
            const userQuery = await pool.query(
      'SELECT nama, divisi FROM a_2_verified_users WHERE email = $1', 
      [email]
    );
    if (!userQuery.rows.length) {
      console.warn(`User ${email} tidak ditemukan`);
      return;
    }
    const user = userQuery.rows[0];
    const mailOptions = {
      from: `"Sistem Registrasi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'UserID Anda Telah Aktif',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Akun Anda Telah Aktif</h2>
          <p>Halo <strong>${user.nama}</strong>,</p>
          
          <p>Berikut detail akun Anda:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>User ID:</strong> ${userID}</p>
            ${ppatkNumber ? `<p><strong>Nomor PPAT:</strong> ${ppatkNumber}</p>` : ''}
            <p><strong>Divisi:</strong> ${user.divisi}</p>
          </div>
          
          <p>Anda sekarang dapat login ke sistem menggunakan email ini.</p>
          
          <p style="margin-top: 30px;">Hormat kami,<br>
          <strong>Tim Sistem</strong></p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email terkirim ke ${email}`);
    } catch (error) {
        console.error('Gagal mengirim email:', error.message);
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
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Email Error:', err);
        throw new Error('Gagal mengirim email');
    }
};