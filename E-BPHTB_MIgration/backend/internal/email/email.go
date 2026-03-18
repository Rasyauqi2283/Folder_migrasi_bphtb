package email

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
	"time"
)

// canSendEmail returns true if EMAIL_USER and EMAIL_PASS are set (SMTP dipakai untuk dev & production).
func canSendEmail() bool {
	return os.Getenv("EMAIL_USER") != "" && os.Getenv("EMAIL_PASS") != ""
}

// SendOTP sends OTP email to the given address via SMTP (EMAIL_USER, EMAIL_PASS).
func SendOTP(to, otp string) error {
	subject := "OTP untuk Registrasi - BAPPENDA BPHTB"
	text := fmt.Sprintf("Kode OTP Anda adalah: %s. Silakan masukkan kode ini untuk melanjutkan proses verifikasi. Kode berlaku 10 menit.", otp)
	html := fmt.Sprintf(`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #2c3e50;">Kode OTP untuk Registrasi</h2>
<p>Halo,</p>
<p>Berikut adalah kode OTP Anda untuk melanjutkan proses registrasi:</p>
<div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
<h1 style="color: #e74c3c; font-size: 32px; margin: 0;">%s</h1>
</div>
<p>Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
<p>Terima kasih,<br>Tim BAPPENDA BPHTB</p>
</div>`, otp)

	if !canSendEmail() {
		return fmt.Errorf("email tidak dikonfigurasi: set EMAIL_USER dan EMAIL_PASS di .env")
	}
	return sendViaSMTP(to, subject, text, html)
}

// SendPasswordResetOTP sends OTP for password reset via SMTP.
func SendPasswordResetOTP(to, otp string) error {
	subject := "OTP Reset Kata Sandi - BAPPENDA BPHTB"
	text := fmt.Sprintf("Kode OTP reset kata sandi Anda adalah: %s. Kode berlaku 10 menit.", otp)
	html := fmt.Sprintf(`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #2c3e50;">Reset Kata Sandi</h2>
<p>Halo,</p>
<p>Berikut adalah kode OTP untuk reset kata sandi akun Anda:</p>
<div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
<h1 style="color: #e74c3c; font-size: 32px; margin: 0;">%s</h1>
</div>
<p>Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
<p>Terima kasih,<br>Tim BAPPENDA BPHTB</p>
</div>`, otp)

	if !canSendEmail() {
		return fmt.Errorf("email tidak dikonfigurasi: set EMAIL_USER dan EMAIL_PASS di .env")
	}
	return sendViaSMTP(to, subject, text, html)
}

// SendUserIDNotification mengirim email ke user WP setelah verify OTP berhasil (userid telah dibuat).
func SendUserIDNotification(to, nama, userid string) error {
	subject := "Akun Anda Telah Aktif - BAPPENDA BPHTB"
	text := fmt.Sprintf("Halo %s,\n\nAkun Anda telah berhasil dibuat.\n\nUser ID Anda: %s\n\nSilakan gunakan User ID atau email ini untuk masuk ke dashboard.\n\nTerima kasih,\nTim BAPPENDA BPHTB", nama, userid)
	html := fmt.Sprintf(`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #2c3e50;">Akun Anda Telah Aktif</h2>
<p>Halo <strong>%s</strong>,</p>
<p>Akun Anda telah berhasil dibuat. Berikut detail akun Anda:</p>
<div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
<p style="margin: 0;"><strong>User ID:</strong> <code>%s</code></p>
</div>
<p>Silakan gunakan <strong>User ID</strong> atau <strong>email</strong> ini untuk masuk ke dashboard.</p>
<p>Terima kasih,<br>Tim BAPPENDA BPHTB</p>
</div>`, nama, userid)
	if !canSendEmail() {
		return fmt.Errorf("email tidak dikonfigurasi: set EMAIL_USER dan EMAIL_PASS di .env")
	}
	return sendViaSMTP(to, subject, text, html)
}

// SendPasswordChangeNotification mengirim pemberitahuan ke email user setelah kata sandi diubah.
func SendPasswordChangeNotification(to, userid, nama string) error {
	tanggal := time.Now().Format("02 January 2006, 15:04 WIB")
	subject := "Pemberitahuan Perubahan Kata Sandi - BAPPENDA BPHTB"
	text := fmt.Sprintf("Pada tanggal %s, untuk akun dengan userid %s dan nama %s, diberitahukan bahwa password telah diubah.\n\nJika Anda tidak melakukan perubahan ini, segera hubungi administrator.", tanggal, userid, nama)
	html := fmt.Sprintf(`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #2c3e50;">Pemberitahuan Perubahan Kata Sandi</h2>
<p>Pada tanggal <strong>%s</strong>, untuk akun dengan:</p>
<ul>
<li><strong>User ID:</strong> %s</li>
<li><strong>Nama:</strong> %s</li>
</ul>
<p>diberitahukan bahwa <strong>kata sandi telah diubah</strong>.</p>
<p style="color: #666; font-size: 0.9em;">Jika Anda tidak melakukan perubahan ini, segera hubungi administrator.</p>
<p>Terima kasih,<br>Tim BAPPENDA BPHTB</p>
</div>`, tanggal, userid, nama)
	if !canSendEmail() {
		log.Printf("[EMAIL] Password change notification skipped (email not configured) to %s", to)
		return nil
	}
	return sendViaSMTP(to, subject, text, html)
}

// SendWpSignInvitation mengirim email ke WP saat PU meminta persetujuan dokumen.
func SendWpSignInvitation(to, wpNama, puNama, nobooking string) error {
	subject := "Permintaan Persetujuan Dokumen - BAPPENDA BPHTB"
	text := fmt.Sprintf("Halo %s,\n\nAda dokumen yang perlu disetujui oleh '%s'.\n\nNo. Booking: %s\n\nSilakan login ke dashboard Wajib Pajak untuk melihat dan menyetujui.\n\nTerima kasih,\nTim BAPPENDA BPHTB", wpNama, puNama, nobooking)
	html := fmt.Sprintf(`<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
<h2 style="color: #2c3e50;">Permintaan Persetujuan Dokumen</h2>
<p>Halo <strong>%s</strong>,</p>
<p>Ada dokumen yang perlu disetujui oleh <strong>'%s'</strong>.</p>
<div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #0ea5e9;">
  <p style="margin: 0;"><strong>No. Booking:</strong> <code>%s</code></p>
</div>
<p>Silakan login ke dashboard <strong>Wajib Pajak</strong> untuk melihat dan menyetujui.</p>
<p>Terima kasih,<br>Tim BAPPENDA BPHTB</p>
</div>`, wpNama, puNama, nobooking)

	if !canSendEmail() {
		return fmt.Errorf("email tidak dikonfigurasi: set EMAIL_USER dan EMAIL_PASS di .env")
	}
	return sendViaSMTP(to, subject, text, html)
}

func sendViaSMTP(to, subject, text, html string) error {
	user := os.Getenv("EMAIL_USER")
	pass := os.Getenv("EMAIL_PASS")
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	if host == "" {
		host = "smtp.gmail.com"
	}
	if port == "" {
		port = "587"
	}
	addr := host + ":" + port
	auth := smtp.PlainAuth("", user, pass, host)

	from := user
	msg := []byte("From: BAPPENDA BPHTB <" + from + ">\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=UTF-8\r\n" +
		"\r\n" + html)

	err := smtp.SendMail(addr, auth, from, []string{to}, msg)
	if err != nil {
		return err
	}
	log.Printf("[EMAIL] Sent via SMTP to %s", to)
	return nil
}
