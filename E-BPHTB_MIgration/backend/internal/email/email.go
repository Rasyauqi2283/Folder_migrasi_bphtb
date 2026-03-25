package email

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
	"strings"
	"time"
)

const supportReplyFooterPlain = "(Balas pesan ini untuk menerima jawaban lanjutan apabila permasalahan belum terselesaikan, terimakasih!. Apabila tidak dijawab dalam jangka waktu 2 hari ticket akan dinyatakan hangus dan perlu memperbarui ticket kembali)"

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

// SendPenelitiRejectionNotification mengirim email saat dokumen ditolak oleh Peneliti.
func SendPenelitiRejectionNotification(to, targetName, nobooking, reason string) error {
	subject := "Dokumen Anda Ditolak - BAPPENDA BPHTB"
	text := fmt.Sprintf("Halo %s,\n\nDokumen dengan No. Booking %s ditolak oleh Peneliti.\nAlasan: %s\n\nSilakan perbaiki data lalu ajukan kembali.\n\nTerima kasih,\nTim BAPPENDA BPHTB", targetName, nobooking, reason)
	html := fmt.Sprintf(`<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
<h2 style="color: #b91c1c;">Dokumen Ditolak</h2>
<p>Halo <strong>%s</strong>,</p>
<p>Dokumen Anda dengan No. Booking berikut ditolak oleh Peneliti:</p>
<div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ef4444;">
  <p style="margin: 0;"><strong>No. Booking:</strong> <code>%s</code></p>
  <p style="margin: 8px 0 0;"><strong>Alasan:</strong> %s</p>
</div>
<p>Silakan lakukan perbaikan data dan ajukan ulang dokumen.</p>
<p>Terima kasih,<br>Tim BAPPENDA BPHTB</p>
</div>`, targetName, nobooking, reason)
	if !canSendEmail() {
		log.Printf("[EMAIL] Rejection notification skipped (email not configured) to %s", to)
		return nil
	}
	return sendViaSMTP(to, subject, text, html)
}

// SendSupportTicketConfirmation mengirim email konfirmasi nomor tiket ke pengunjung landing page.
func SendSupportTicketConfirmation(to, nama, ticketID, subject, pesan string) error {
	sub := "[E-BPHTB Support] Tiket Anda #" + ticketID
	html := fmt.Sprintf(`<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
<h2 style="color: #0f766e;">Tiket bantuan telah diterima</h2>
<p>Halo <strong>%s</strong>,</p>
<p>Terima kasih telah menghubungi kami. Tim Customer Service akan meninjau pesan Anda dan membalas melalui email ini.</p>
<div style="background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 16px; margin: 16px 0;">
  <p style="margin:0;"><strong>Nomor tiket:</strong> <code style="font-size:1.1em;">%s</code></p>
  <p style="margin:8px 0 0;"><strong>Subjek:</strong> %s</p>
</div>
<div style="background:#f8fafc; padding:12px; border-radius:8px; margin:12px 0;">
  <p style="margin:0 0 8px; color:#64748b; font-size:12px;">Isi laporan Anda:</p>
  <p style="margin:0; white-space:pre-wrap;">%s</p>
</div>
<p style="color:#64748b; font-size:13px;">Simpan nomor tiket ini jika Anda perlu menindaklanjuti dengan CS.</p>
<p>Salam,<br><strong>Tim BAPPENDA BPHTB</strong><br><span style="color:#94a3b8;">Pesan otomatis — mohon tidak membalas langsung ke alamat ini jika tidak diperlukan.</span></p>
</div>`, escapeHTML(nama), escapeHTML(ticketID), escapeHTML(subject), escapeHTML(pesan))

	text := fmt.Sprintf("Halo %s,\n\nTiket Anda: %s\nSubjek: %s\n\n%s\n\n— Tim BAPPENDA BPHTB", nama, ticketID, subject, pesan)
	if !canSendEmail() {
		log.Printf("[EMAIL] Support ticket confirmation skipped (SMTP not configured) to %s ticket=%s", to, ticketID)
		return nil
	}
	return sendViaSMTP(to, sub, text, html)
}

// SendSupportTicketReply mengirim balasan CS ke pengguna (thread: keluhan awal + balasan).
func SendSupportTicketReply(to, ticketID, subject, originalMessage, replyBody string) error {
	sub := "[E-BPHTB Support] Balasan untuk Tiket Anda #" + ticketID
	replyWithFooter := strings.TrimRight(replyBody, " \n\r\t") + "\n\n" + supportReplyFooterPlain
	html := fmt.Sprintf(`<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
<h2 style="color: #0f766e;">Balasan dari Customer Service</h2>
<p style="color:#64748b; font-size:14px;">Tiket: <strong>%s</strong> · Subjek: %s</p>
<div style="border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin:12px 0; background:#fafafa;">
  <p style="margin:0 0 8px; color:#64748b; font-size:12px;">Pesan Anda sebelumnya:</p>
  <p style="margin:0; white-space:pre-wrap;">%s</p>
</div>
<div style="border-left:4px solid #14b8a6; padding:12px 16px; margin:16px 0; background:#f0fdfa;">
  <p style="margin:0 0 8px; font-weight:600;">Balasan tim kami:</p>
  <p style="margin:0; white-space:pre-wrap;">%s</p>
  <p style="margin:10px 0 0; white-space:pre-wrap; font-size:13px; color:#0f172a; font-weight:800;">%s</p>
</div>
<p style="color:#64748b; font-size:13px;">Jika masih ada kendala, balas email ini dengan menyebutkan nomor tiket.</p>
<p>Salam,<br><strong>Tim BAPPENDA BPHTB — Customer Service</strong></p>
</div>`, escapeHTML(ticketID), escapeHTML(subject), escapeHTML(originalMessage), escapeHTML(replyBody), escapeHTML(supportReplyFooterPlain))

	text := fmt.Sprintf("Tiket %s\nSubjek: %s\n\n--- Pesan Anda ---\n%s\n\n--- Balasan CS ---\n%s\n", ticketID, subject, originalMessage, replyWithFooter)
	if !canSendEmail() {
		log.Printf("[EMAIL] Support ticket reply skipped (SMTP not configured) to %s ticket=%s", to, ticketID)
		return nil
	}
	return sendViaSMTP(to, sub, text, html)
}

func escapeHTML(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	s = strings.ReplaceAll(s, `"`, "&quot;")
	return s
}

func sendViaSMTP(to, subject, text, html string) error {
	user := os.Getenv("EMAIL_USER")
	pass := os.Getenv("EMAIL_PASS")
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	if host == "" {
		// Fallback ringan: gunakan domain dari EMAIL_USER → smtp.<domain>.
		// Tetap disarankan mengisi SMTP_HOST secara eksplisit di environment.
		if at := strings.LastIndex(user, "@"); at > -1 && at < len(user)-1 {
			host = "smtp." + strings.TrimSpace(user[at+1:])
		}
	}
	if port == "" {
		port = "587"
	}
	if host == "" {
		return fmt.Errorf("SMTP_HOST belum dikonfigurasi")
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
