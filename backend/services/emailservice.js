import nodemailer from 'nodemailer';
import { pool } from '../../db.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Timeout configuration untuk mencegah hanging
    connectionTimeout: 10000, // 10 detik
    greetingTimeout: 5000,    // 5 detik
    socketTimeout: 15000,     // 15 detik
    // Pool configuration
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5
});

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
            await sendOTPWithRetry(email, otp, 2); // Coba 2 kali saja untuk async
            console.log(`✅ Async OTP sent successfully to ${email}`);
        } catch (error) {
            console.error(`❌ Async OTP failed for ${email}:`, error.message);
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