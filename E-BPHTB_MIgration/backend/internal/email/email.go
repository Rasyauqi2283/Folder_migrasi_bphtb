package email

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
)

// SendOTP sends OTP email to the given address.
// Uses SendGrid if SENDGRID_API_KEY is set, else SMTP (EMAIL_USER, EMAIL_PASS).
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

	if apiKey := os.Getenv("SENDGRID_API_KEY"); apiKey != "" {
		return sendViaSendGrid(to, subject, text, html)
	}
	if user := os.Getenv("EMAIL_USER"); user != "" && os.Getenv("EMAIL_PASS") != "" {
		return sendViaSMTP(to, subject, text, html)
	}
	return fmt.Errorf("email tidak dikonfigurasi: set SENDGRID_API_KEY atau EMAIL_USER+EMAIL_PASS di .env")
}

// SendPasswordResetOTP sends OTP for password reset.
// Uses SendGrid if SENDGRID_API_KEY is set, else SMTP (EMAIL_USER, EMAIL_PASS).
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

	if apiKey := os.Getenv("SENDGRID_API_KEY"); apiKey != "" {
		return sendViaSendGrid(to, subject, text, html)
	}
	if user := os.Getenv("EMAIL_USER"); user != "" && os.Getenv("EMAIL_PASS") != "" {
		return sendViaSMTP(to, subject, text, html)
	}
	return fmt.Errorf("email tidak dikonfigurasi: set SENDGRID_API_KEY atau EMAIL_USER+EMAIL_PASS di .env")
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
	if apiKey := os.Getenv("SENDGRID_API_KEY"); apiKey != "" {
		return sendViaSendGrid(to, subject, text, html)
	}
	if user := os.Getenv("EMAIL_USER"); user != "" && os.Getenv("EMAIL_PASS") != "" {
		return sendViaSMTP(to, subject, text, html)
	}
	return fmt.Errorf("email tidak dikonfigurasi")
}

func sendViaSendGrid(to, subject, text, html string) error {
	apiKey := os.Getenv("SENDGRID_API_KEY")
	fromEmail := os.Getenv("EMAIL_USER")
	if fromEmail == "" {
		fromEmail = "noreply@bappenda.com"
	}
	fromName := "BAPPENDA BPHTB"
	if n := os.Getenv("EMAIL_FROM_NAME"); n != "" {
		fromName = n
	}

	body := map[string]interface{}{
		"personalizations": []map[string]interface{}{
			{
				"to":      []map[string]string{{"email": to}},
				"subject": subject,
			},
		},
		"from": map[string]string{
			"email": fromEmail,
			"name":  fromName,
		},
		"content": []map[string]string{
			{"type": "text/plain", "value": text},
			{"type": "text/html", "value": html},
		},
	}
	jsonBody, _ := json.Marshal(body)
	req, err := http.NewRequest("POST", "https://api.sendgrid.com/v3/mail/send", bytes.NewReader(jsonBody))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Printf("[EMAIL] OTP sent via SendGrid to %s", to)
		return nil
	}
	var buf bytes.Buffer
	buf.ReadFrom(resp.Body)
	return fmt.Errorf("SendGrid error %d: %s", resp.StatusCode, buf.String())
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
	log.Printf("[EMAIL] OTP sent via SMTP to %s", to)
	return nil
}
