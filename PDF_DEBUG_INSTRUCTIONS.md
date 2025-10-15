# 🐛 PDF Generation Debug Instructions

## **Problem:**
Error saat klik "View Dokumen" pada preview dokumen permohonan:
```
Error: Error: Gagal mengambil PDF
at viewPDF (badan-table-bookingsspd.js:572:19)
```

## **🔧 Debug Changes Applied:**

### **Frontend Changes (badan-table-bookingsspd.js):**
- ✅ Enhanced error logging to show HTTP status and response body
- ✅ More detailed error messages

### **Backend Changes (generatepdfbooking_ppat.js):**
- ✅ Added request logging
- ✅ Added booking query result logging  
- ✅ Added creator data logging
- ✅ Added main data query result logging
- ✅ Enhanced error logging with stack trace

## **🧪 Testing Steps:**

### **1. Restart Server:**
```bash
# Stop server (Ctrl+C)
npm start
```

### **2. Test PDF Generation:**
1. Open browser and login to application
2. Go to PPATK booking list
3. Click "View Dokumen" button for any booking
4. **Check browser console** for detailed error messages
5. **Check server console** for backend logs

### **3. Expected Logs:**

#### **Browser Console:**
```
📡 Response error: [HTTP_STATUS] [ERROR_MESSAGE]
```

#### **Server Console:**
```
📄 [PDF] Generating mohon validasi PDF for nobooking: [NOBOOKING]
📄 [PDF] Request headers: {...}
📄 [PDF] Booking query result: [COUNT] rows found
📄 [PDF] Booking data found: [NOBOOKING] [NAMA_PEMBUAT]
📄 [PDF] Creator data: {userid: "...", nama: "..."}
📄 [PDF] Main data query result: [COUNT] rows found
```

### **4. Possible Issues to Check:**

#### **Issue 1: Missing Data**
- ❌ "No data found for nobooking"
- **Solution:** Check if nobooking exists in database

#### **Issue 2: Missing User Data**  
- ❌ "Missing userid or nama"
- **Solution:** Check if user data exists in pat_1_bookingsspd

#### **Issue 3: Missing Main Data**
- ❌ "No main data found for userid"
- **Solution:** Check if related data exists in joined tables

#### **Issue 4: PDF Generation Error**
- ❌ "Error generating PDF"
- **Solution:** Check PDF generation logic

## **🔍 Quick Database Check:**

```sql
-- Check if nobooking exists
SELECT nobooking, userid, nama FROM pat_1_bookingsspd WHERE nobooking = '20011-2025-000003';

-- Check related data
SELECT COUNT(*) FROM pat_4_objek_pajak WHERE nobooking = '20011-2025-000003';
SELECT COUNT(*) FROM pat_5_penghitungan_njop WHERE nobooking = '20011-2025-000003';
SELECT COUNT(*) FROM pat_8_validasi_tambahan WHERE nobooking = '20011-2025-000003';
```

## **📋 Next Steps:**

1. **Run test** with enhanced logging
2. **Share logs** from both browser and server console
3. **Identify specific error** based on logs
4. **Apply targeted fix** for the identified issue

The enhanced logging will help pinpoint exactly where the PDF generation is failing!
