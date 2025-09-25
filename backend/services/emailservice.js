import nodemailer from 'nodemailer';
import { pool } from '../../db.js';

// Gmail SMTP configuration dengan fallback
const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Timeout configuration yang lebih agresif
    connectionTimeout: 5000,  // 5 detik
    greetingTimeout: 3000,    // 3 detik
    socketTimeout: 10000,     // 10 detik
    // Pool configuration
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    rateDelta: 2000,
    rateLimit: 2,
    // TLS options untuk Railway
    secure: true,
    tls: {
        rejectUnauthorized: false
    }
});

// Fallback transporter untuk testing
const testTransporter = nodemailer.createTransporter({
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
        await gmailTransporter.verify();
        console.log('✅ Gmail SMTP connection successful');
        return true;
    } catch (error) {
        console.error('❌ Gmail SMTP connection failed:', error.message);
        return false;
    }
};

// Fallback email service dengan logging
export const sendEmailWithFallback = async (mailOptions, maxRetries = 2) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📧 Email attempt ${attempt}/${maxRetries} to ${mailOptions.to}`);
            
            // Test koneksi dulu
            const isConnected = await testEmailConnection();
            if (!isConnected) {
                throw new Error('SMTP connection failed');
            }
            
            // Kirim email dengan timeout yang lebih pendek
            const info = await Promise.race([
                gmailTransporter.sendMail(mailOptions),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Email timeout after 20 seconds')), 20000)
                )
            ]);
            
            console.log(`✅ Email sent successfully to ${mailOptions.to}: ${info.response}`);
            return info;
            
        } catch (error) {
            console.error(`❌ Email attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                console.error('❌ All email attempts failed, logging OTP for manual verification');
                
                // Log OTP ke database untuk manual verification
                try {
                    await pool.query(
                        'INSERT INTO otp_logs (email, otp, created_at, status) VALUES ($1, $2, NOW(), $3)',
                        [mailOptions.to, mailOptions.text.split(': ')[1].split('.')[0], 'failed_to_send']
                    );
                } catch (dbError) {
                    console.error('Failed to log OTP to database:', dbError.message);
                }
                
                throw new Error(`Email delivery failed after ${maxRetries} attempts`);
            }
            
            // Wait before retry
            const waitTime = attempt * 3000; // 3s, 6s
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

// Async OTP sender - tidak menghalangi proses registrasi
export const sendOTPAsync = async (email, otp) => {
    // Kirim OTP secara async tanpa menunggu response
    setImmediate(async () => {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'OTP untuk Registrasi',
                text: `Kode OTP Anda adalah: ${otp}. Silakan masukkan kode ini untuk melanjutkan proses verifikasi.`
            };
            
            await sendEmailWithFallback(mailOptions, 2);
            console.log(`✅ Async OTP sent successfully to ${email}`);
        } catch (error) {
            console.error(`❌ Async OTP failed for ${email}:`, error.message);
            
            // Fallback: Simpan OTP di database untuk admin bisa cek
            try {
                await pool.query(
                    'INSERT INTO otp_logs (email, otp, created_at, status) VALUES ($1, $2, NOW(), $3)',
                    [email, otp, 'failed_to_send']
                );
                console.log(`📝 OTP logged to database for ${email}: ${otp}`);
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
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'OTP untuk Registrasi',
        text: `Kode OTP Anda adalah: ${otp}. Silakan masukkan kode ini untuk melanjutkan proses verifikasi.`
    };
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`📧 Attempt ${attempt}/${retries}: Sending OTP to ${email}`);
            
            // Mengirim email OTP dengan timeout
            const info = await Promise.race([
                transporter.sendMail(mailOptions),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Email timeout after 30 seconds')), 30000)
                )
            ]);
            
            console.log(`✅ OTP berhasil dikirim ke email ${email} (attempt ${attempt}): ${info.response}`);
            return info;
            
        } catch (error) {
            console.error(`❌ Attempt ${attempt}/${retries} failed:`, error.message);
            
            if (attempt === retries) {
                console.error('❌ Semua percobaan gagal untuk mengirim OTP ke:', email);
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