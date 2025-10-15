# 🔧 Fix 403 Forbidden Error - Peneliti Access

## ❌ Error yang Terjadi
```
GET https://bphtb-bappenda.up.railway.app/api/peneliti_get-berkas-fromltb 403 (Forbidden)
```

## 🔍 Analisis Penyebab
Error 403 terjadi karena kondisi ini tidak terpenuhi:
```javascript
if (!req.session.user || req.session.user.divisi !== 'Peneliti') {
    return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya pengguna dengan divisi Peneliti yang dapat mengakses data ini.'
    });
}
```

## 🛠️ Solusi yang Tersedia

### **Solusi 1: Cek Session dan Login (Recommended)**

#### **Step 1: Pastikan Login dengan User Peneliti**
1. **Logout** dari aplikasi
2. **Login kembali** dengan user yang memiliki divisi "Peneliti"
3. **Verify** di browser dev tools:
   ```javascript
   // Cek di browser console
   fetch('/api/peneliti_get-berkas-fromltb')
     .then(r => r.json())
     .then(console.log);
   ```

#### **Step 2: Cek Session di Browser**
```javascript
// Di browser console, cek session
fetch('/api/check-session')
  .then(r => r.json())
  .then(data => {
    console.log('Session user:', data.user);
    console.log('Divisi:', data.user?.divisi);
  });
```

### **Solusi 2: Temporary Fix - Relax Access (Untuk Testing)**

Update endpoint untuk debugging:

```javascript
// Temporary fix untuk debugging
app.get('/api/peneliti_get-berkas-fromltb', async (req, res) => {
    console.log('[DEBUG] Session user:', req.session.user);
    console.log('[DEBUG] Session ID:', req.sessionID);
    
    // Temporary: Allow access for debugging
    if (!req.session.user) {
        console.log('[DEBUG] No session user found');
        return res.status(403).json({
            success: false,
            message: 'No session user found. Please login first.'
        });
    }
    
    // Check divisi (case insensitive)
    const userDivisi = req.session.user.divisi?.toLowerCase();
    if (userDivisi !== 'peneliti') {
        console.log('[DEBUG] User divisi:', req.session.user.divisi);
        return res.status(403).json({
            success: false,
            message: `Akses ditolak. User divisi: ${req.session.user.divisi}, Required: Peneliti`
        });
    }
    
    // Continue with original logic...
});
```

### **Solusi 3: Add Session Debugging Endpoint**

Tambahkan endpoint untuk debug session:

```javascript
// Debug endpoint
app.get('/api/debug-session', async (req, res) => {
    res.json({
        sessionExists: !!req.session.user,
        sessionUser: req.session.user,
        sessionId: req.sessionID,
        divisi: req.session.user?.divisi,
        userid: req.session.user?.userid
    });
});
```

### **Solusi 4: Check Database User Divisi**

```sql
-- Cek users dengan divisi Peneliti
SELECT userid, nama, divisi, status
FROM a_2_verified_users 
WHERE LOWER(divisi) LIKE '%peneliti%' OR divisi = 'Peneliti'
ORDER BY userid;

-- Cek session yang aktif
SELECT * FROM user_sessions 
WHERE expires_at > NOW()
ORDER BY created_at DESC;
```

## 🧪 Testing Steps

### **1. Run Debug Script**
```bash
node debug_peneliti_session.js
```

### **2. Test Session**
```bash
# Test session endpoint
curl -X GET "https://bphtb-bappenda.up.railway.app/api/debug-session" \
     -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

### **3. Test Peneliti Endpoint**
```bash
# Test with session cookie
curl -X GET "https://bphtb-bappenda.up.railway.app/api/peneliti_get-berkas-fromltb" \
     -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

## 🎯 Expected Results After Fix

### **✅ Successful Response:**
```json
{
  "success": true,
  "data": [
    {
      "no_registrasi": "2025O00001",
      "nobooking": "20011-2025-000009",
      "trackstatus": "Dilanjutkan",
      "status": "Diajukan",
      "namawajibpajak": "John Doe"
    }
  ]
}
```

### **✅ UI Should Show:**
- Data table populated with records
- No "Terjadi Kesalahan" message
- No "HTTP error! status: 403"

## 📝 Common Issues & Solutions

### **Issue 1: Session Expired**
**Solution:** Login again with Peneliti user

### **Issue 2: Wrong Divisi**
**Solution:** Check database user divisi, ensure it's exactly "Peneliti"

### **Issue 3: No Data Available**
**Solution:** Check if data meets gate conditions (LTB + Bank approval)

### **Issue 4: Session Not Persisting**
**Solution:** Check session configuration and cookies

## 🚀 Quick Fix Commands

```bash
# 1. Run debug script
node debug_peneliti_session.js

# 2. Check Railway logs
railway logs

# 3. Test endpoint directly
curl -X GET "https://bphtb-bappenda.up.railway.app/api/debug-session"
```
