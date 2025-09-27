# KTP Preview Security & Audit System

## 🔒 **FITUR KEAMANAN KTP PREVIEW**

### **🎯 OVERVIEW:**
Sistem preview KTP dengan watermark dan audit trail untuk admin yang mengakses data pribadi pengguna baru yang belum diverifikasi.

---

## 📋 **FITUR UTAMA:**

### **1. Secure File Access:**
- ✅ **Enkripsi AES-256-GCM** untuk file KTP
- ✅ **Role-based access control** (hanya Admin/Super Admin)
- ✅ **Session validation** untuk memastikan admin terautentikasi
- ✅ **File path validation** untuk mencegah directory traversal

### **2. Watermark Security:**
- ✅ **Dynamic watermark** dengan informasi admin
- ✅ **Timestamp** dengan timezone Indonesia
- ✅ **IP address** tracking
- ✅ **Admin name** dari session
- ✅ **Visual deterrent** untuk mencegah penyalahgunaan

### **3. Audit Trail:**
- ✅ **Database logging** di tabel `log_file_access`
- ✅ **File-based logging** untuk backup
- ✅ **Comprehensive tracking** (admin, user, IP, timestamp, user-agent)
- ✅ **Compliance** dengan regulasi perlindungan data

---

## 🗄️ **DATABASE SCHEMA:**

### **Tabel `log_file_access`:**
```sql
CREATE TABLE log_file_access (
    log_id SERIAL PRIMARY KEY,
    admin_name TEXT NOT NULL,           -- Nama admin yang mengakses
    userid VARCHAR(100),                -- ID user yang diakses
    ip VARCHAR(100) NOT NULL,           -- IP address admin
    user_agent TEXT,                    -- Browser/device info
    access_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 **API ENDPOINT:**

### **GET `/api/admin/ktp-preview/:userId`**

#### **Request:**
```http
GET /api/admin/ktp-preview/123
Authorization: Session cookie required
```

#### **Response:**
```http
Content-Type: image/png
Content-Disposition: inline; filename="ktp_John_Doe_preview.png"
Cache-Control: no-cache, no-store, must-revalidate
```

#### **Security Headers:**
- `Cache-Control: no-cache, no-store, must-revalidate`
- `Pragma: no-cache`
- `Expires: 0`

---

## 🛡️ **SECURITY FEATURES:**

### **1. Access Control:**
```javascript
const verifyAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const userRole = req.session.user.divisi;
  if (userRole !== 'Admin' && userRole !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  
  next();
};
```

### **2. Watermark Generation:**
```javascript
const wmText = `Akses Admin: ${adminUser.nama} | ${timestamp} | IP: ${req.ip}`;
const watermarked = await addWatermark(buffer, wmText);
```

### **3. Audit Logging:**
```javascript
await pool.query(
  'INSERT INTO log_file_access(admin_name, userid, ip, user_agent, access_time) VALUES($1, $2, $3, $4, NOW())',
  [adminUser.nama, userId, req.ip, req.headers['user-agent']]
);
```

---

## 📊 **WATERMARK SPECIFICATIONS:**

### **Visual Properties:**
- **Font Size:** 36px
- **Color:** `rgba(255,0,0,0.4)` (Red with 40% opacity)
- **Position:** Center of image
- **Rotation:** -30 degrees
- **Text Anchor:** Middle
- **Format:** SVG overlay

### **Content Format:**
```
Akses Admin: [Admin Name] | [DD/MM/YYYY HH:MM:SS] | IP: [IP Address]
```

### **Example:**
```
Akses Admin: John Admin | 15/12/2024 14:30:25 | IP: 192.168.1.100
```

---

## 🔍 **AUDIT TRAIL:**

### **Database Log:**
```sql
SELECT 
    log_id,
    admin_name,
    userid,
    ip,
    user_agent,
    access_time
FROM log_file_access 
WHERE userid = '123'
ORDER BY access_time DESC;
```

### **File Log:**
```json
{
  "timestamp": "2024-12-15T14:30:25.000Z",
  "fileId": "abc123-def456",
  "userId": "123",
  "requesterRole": "admin",
  "action": "READ",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

---

## 🚨 **SECURITY CONSIDERATIONS:**

### **1. Data Protection:**
- ✅ **Encrypted storage** dengan AES-256-GCM
- ✅ **Secure file paths** di luar public directory
- ✅ **Access logging** untuk compliance
- ✅ **Watermark** untuk visual deterrent

### **2. Privacy Compliance:**
- ✅ **Audit trail** untuk tracking access
- ✅ **Admin identification** dalam watermark
- ✅ **Timestamp** untuk temporal tracking
- ✅ **IP logging** untuk geolocation tracking

### **3. Operational Security:**
- ✅ **No caching** untuk mencegah storage
- ✅ **Session validation** untuk authentication
- ✅ **Role-based access** untuk authorization
- ✅ **Error handling** tanpa information leakage

---

## 📱 **FRONTEND INTEGRATION:**

### **HTML Button:**
```html
<button class="btn btn-info btn-preview" data-id="{{id}}">Preview KTP</button>
```

### **JavaScript Handler:**
```javascript
document.addEventListener('click', e => {
  if(e.target.classList.contains('btn-preview')){
    const id = e.target.dataset.id;
    const url = `/api/admin/ktp-preview/${id}?t=${Date.now()}`;
    openModal(url);
  }
});
```

### **Modal Display:**
```javascript
function openModal(imageUrl) {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <img src="${imageUrl}" alt="KTP Preview" style="max-width: 100%; height: auto;">
        <button onclick="this.closest('.modal-overlay').remove()">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}
```

---

## 🔧 **DEPLOYMENT CHECKLIST:**

### **Environment Variables:**
- [ ] `FILE_ENCRYPTION_KEY` (32-byte hex string)
- [ ] Database connection configured
- [ ] Session store configured

### **Dependencies:**
- [ ] `sharp` package for image processing
- [ ] `crypto` for encryption/decryption
- [ ] `fs` for file operations
- [ ] `path` for file path handling

### **Database Setup:**
- [ ] `log_file_access` table created
- [ ] Proper indexes on `userid` and `access_time`
- [ ] Backup strategy for audit logs

### **File System:**
- [ ] `secure_storage/ktp/` directory created
- [ ] `secure_storage/logs/` directory created
- [ ] Proper file permissions set

---

## 📈 **MONITORING & ALERTS:**

### **Key Metrics:**
- **Access frequency** per admin
- **Unusual access patterns** (off-hours, multiple users)
- **Failed access attempts**
- **File access volume**

### **Alert Conditions:**
- Multiple KTP access in short time
- Access from unusual IP addresses
- Failed authentication attempts
- Large number of file downloads

---

## 🎯 **BENEFITS:**

### **1. Security:**
- **Visual deterrent** dengan watermark
- **Complete audit trail** untuk compliance
- **Encrypted storage** untuk data protection
- **Access control** untuk authorization

### **2. Compliance:**
- **GDPR compliance** dengan audit logging
- **Data protection** dengan encryption
- **Access tracking** untuk accountability
- **Privacy preservation** dengan watermarking

### **3. Operational:**
- **Admin accountability** dengan identification
- **Incident investigation** dengan detailed logs
- **Performance monitoring** dengan access metrics
- **User trust** dengan transparent security

---

## 🚀 **FUTURE ENHANCEMENTS:**

### **Planned Features:**
- [ ] **Real-time alerts** untuk suspicious access
- [ ] **Geolocation tracking** untuk IP addresses
- [ ] **Advanced watermarking** dengan QR codes
- [ ] **Automated compliance reports**
- [ ] **Machine learning** untuk anomaly detection

### **Integration Opportunities:**
- [ ] **SIEM integration** untuk security monitoring
- [ ] **LDAP/AD integration** untuk user management
- [ ] **API rate limiting** untuk abuse prevention
- [ ] **Multi-factor authentication** untuk admin access

---

**Sistem KTP Preview dengan watermark dan audit trail telah berhasil diimplementasikan untuk meningkatkan keamanan dan compliance!** 🔒✨
