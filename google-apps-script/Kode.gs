/**
 * ============================================================================
 * SMANKAIH / 7 KAIH — GOOGLE APPS SCRIPT BACKEND RESMI
 * Platform Pembentukan Karakter Siswa SMA
 * Zona Waktu Resmi: Asia/Jayapura (WIT - Wamena, Papua Pegunungan)
 * ============================================================================
 * 
 * STRUKTUR RESMI 13 KOLOM GOOGLE SHEETS:
 * 1.  Waktu              : Tanggal & jam penyelesaian aktivitas ("dd/MM/yyyy HH:mm:ss", format 24 jam)
 * 2.  Nama Siswa         : Nama lengkap asli siswa dari formulir login
 * 3.  Kelas              : Kelas siswa (contoh: X-9, X-10, XI-1, XII-2)
 * 4.  Poin               : Poin yang diperoleh dari aktivitas yang baru diselesaikan (+1 saat selesai, -1 saat batal, 0 saat login/reset)
 * 5.  dikerjakan/tidak   : "Dikerjakan" jika siswa sudah menyelesaikan minimal 1 aktivitas, "Belum dikerjakan" jika belum ada
 * 6.  Total Poin         : Akumulasi seluruh poin siswa (0 sampai 7)
 * 7.  Pertanyaan 1       : "✓" jika Pilar 01 (Bangun Pagi) selesai, kosong "" jika belum
 * 8.  Pertanyaan 2       : "✓" jika Pilar 02 (Beribadah) selesai, kosong "" jika belum
 * 9.  Pertanyaan 3       : "✓" jika Pilar 03 (Berolahraga) selesai, kosong "" jika belum
 * 10. Pertanyaan 4       : "✓" jika Pilar 04 (Makan Sehat dan Bergizi) selesai, kosong "" jika belum
 * 11. Pertanyaan 5       : "✓" jika Pilar 05 (Gemar Belajar) selesai, kosong "" jika belum
 * 12. Pertanyaan 6       : "✓" jika Pilar 06 (Bermasyarakat) selesai, kosong "" jika belum
 * 13. Pertanyaan 7       : "✓" jika Pilar 07 (Tidur Cepat) selesai, kosong "" jika belum
 * 
 * ATURAN & MEKANISME:
 * - Menggunakan mekanisme pembaruan (upsert) berdasarkan kombinasi Nama Siswa & Kelas
 *   sehingga setiap siswa memiliki baris yang terakumulasi dengan rapi tanpa menghapus data lama.
 * - Mencegah penambahan poin ganda jika tombol selesai ditekan berulang kali.
 * - Waktu dicatat secara otomatis dalam zona waktu "Asia/Jayapura" (WIT, UTC+9) format 24 jam.
 * ============================================================================
 */

// Konfigurasi Zona Waktu Resmi & Nama 13 Kolom
var TIMEZONE_RESMI = "Asia/Jayapura"; // WIT (UTC+9)
var SHEET_NAME = "SMANKAIH"; // Nama sheet default jika belum ada

var COLUMN_HEADERS = [
  "Waktu",
  "Nama Siswa",
  "Kelas",
  "Poin",
  "dikerjakan/tidak",
  "Total Poin",
  "Pertanyaan 1",
  "Pertanyaan 2",
  "Pertanyaan 3",
  "Pertanyaan 4",
  "Pertanyaan 5",
  "Pertanyaan 6",
  "Pertanyaan 7"
];

/**
 * Format Tanggal & Jam 24 Jam Resmi: "dd/MM/yyyy HH:mm:ss"
 * Menggunakan zona waktu "Asia/Jayapura" (WIT, UTC+9) tanpa penambahan 9 jam manual ganda.
 */
function getJayapuraTime24(d) {
  var dateObj = d || new Date();
  return Utilities.formatDate(dateObj, TIMEZONE_RESMI, "dd/MM/yyyy HH:mm:ss");
}

/**
 * Mencari sheet tujuan yang memuat struktur 13 kolom, atau sheet aktif / Sheet1
 */
function getTargetSheet(ss) {
  // 1. Cek apakah ada sheet dengan nama SMANKAIH
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (sheet) {
    ensureHeaders(sheet);
    return sheet;
  }
  
  // 2. Cek semua sheet yang ada, cari sheet yang header-nya memuat "Nama Siswa" atau "Pertanyaan 1"
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var s = sheets[i];
    var firstRow = s.getRange(1, 1, 1, Math.min(s.getLastColumn() || 1, 13)).getValues()[0];
    var rowText = firstRow.join(" ").toLowerCase();
    if (rowText.indexOf("nama siswa") !== -1 || rowText.indexOf("pertanyaan 1") !== -1 || rowText.indexOf("dikerjakan") !== -1) {
      ensureHeaders(s);
      return s;
    }
  }
  
  // 3. Jika belum ada, gunakan sheet pertama atau buat baru
  sheet = sheets[0] || ss.insertSheet(SHEET_NAME);
  ensureHeaders(sheet);
  return sheet;
}

/**
 * Memastikan 13 Header Kolom Terpasang Rapi di Baris 1
 */
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMN_HEADERS);
    formatHeaderRow(sheet);
  } else {
    var currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 13)).getValues()[0];
    var headerStr = currentHeaders.join(" ").toLowerCase();
    // Jika baris 1 kosong atau belum 13 kolom lengkap
    if (headerStr.trim() === "" || headerStr.indexOf("nama") === -1) {
      sheet.getRange(1, 1, 1, 13).setValues([COLUMN_HEADERS]);
      formatHeaderRow(sheet);
    }
  }
}

/**
 * Format Visual Header (Navy Slate, Huruf Tebal Putih, Rata Tengah, Freeze Baris 1)
 */
function formatHeaderRow(sheet) {
  var range = sheet.getRange(1, 1, 1, 13);
  range.setBackground("#1E293B"); // Slate dark elegan
  range.setFontColor("#FFFFFF");
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

/**
 * Endpoint GET: Memeriksa kesiapan Web App dan koneksi Spreadsheet
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getTargetSheet(ss);
    var nowWIT = getJayapuraTime24(new Date());
    
    var info = {
      status: "success",
      message: "SMANKAIH Google Apps Script Web App Aktif & Siap Menerima Data 13 Kolom",
      spreadsheetName: ss.getName(),
      sheetName: sheet.getName(),
      timezone: TIMEZONE_RESMI,
      currentTimeWIT: nowWIT,
      columns: COLUMN_HEADERS
    };
    
    return ContentService.createTextOutput(JSON.stringify(info))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString(),
      timezone: TIMEZONE_RESMI
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint POST: Menerima dan mencatat data ke 13 Kolom Google Sheets
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(25000); // Kunci 25 detik untuk keandalan konkurensi
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getTargetSheet(ss);
    
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : "";
    var data = {};
    
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    // 1. Ekstraksi Waktu (Utamakan waktu HP lokal siswa WIT, fallback ke waktu server Jayapura WIT)
    var now = new Date();
    var waktuStr = (data.waktu || data.clientTime || data.browserTime || getJayapuraTime24(now)).toString().trim();
    // Bersihkan akhiran WIT jika ada, pastikan format "dd/MM/yyyy HH:mm:ss"
    waktuStr = waktuStr.replace(/\s*WIT\s*/gi, "").trim();
    if (!waktuStr.match(/\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/)) {
      waktuStr = getJayapuraTime24(now);
    }
    
    // 2. Ekstraksi Identitas Siswa
    var namaSiswa = (data.namaSiswa || data.name || data.nama || data.fullName || "").toString().trim();
    var kelas = (data.kelas || data.grade || data.userClass || "").toString().trim();
    
    if (!namaSiswa) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Nama siswa wajib diisi. Data tidak dapat disimpan tanpa nama lengkap."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Ekstraksi Poin Aktivitas & Total Poin
    var poin = 0;
    if (typeof data.poin !== "undefined") {
      poin = Number(data.poin);
    } else if (typeof data.activityPoint !== "undefined") {
      poin = Number(data.activityPoint);
    }
    
    var totalPoin = 0;
    if (typeof data.totalPoin !== "undefined") {
      totalPoin = Number(data.totalPoin);
    } else if (typeof data.totalPoints !== "undefined") {
      totalPoin = Number(data.totalPoints);
    }
    
    // 4. Kolom dikerjakan/tidak
    // "Dikerjakan" jika sudah menyelesaikan minimal 1 aktivitas (totalPoin > 0), "Belum dikerjakan" jika belum
    var statusDikerjakan = totalPoin > 0 ? "Dikerjakan" : "Belum dikerjakan";
    if (data.statusPengerjaan) {
      statusDikerjakan = data.statusPengerjaan;
    }
    
    // 5. Ekstraksi Centang Pertanyaan 1 sampai Pertanyaan 7
    // Menghasilkan tanda "✓" jika selesai, atau "" jika belum
    var p1 = formatCheckmark(data.p1 || data.pertanyaan1);
    var p2 = formatCheckmark(data.p2 || data.pertanyaan2);
    var p3 = formatCheckmark(data.p3 || data.pertanyaan3);
    var p4 = formatCheckmark(data.p4 || data.pertanyaan4);
    var p5 = formatCheckmark(data.p5 || data.pertanyaan5);
    var p6 = formatCheckmark(data.p6 || data.pertanyaan6);
    var p7 = formatCheckmark(data.p7 || data.pertanyaan7);
    
    // Jika dikirim via array completedIds (contoh: [1, 3])
    if (Array.isArray(data.completedIds)) {
      if (data.completedIds.indexOf(1) !== -1) p1 = "✓";
      if (data.completedIds.indexOf(2) !== -1) p2 = "✓";
      if (data.completedIds.indexOf(3) !== -1) p3 = "✓";
      if (data.completedIds.indexOf(4) !== -1) p4 = "✓";
      if (data.completedIds.indexOf(5) !== -1) p5 = "✓";
      if (data.completedIds.indexOf(6) !== -1) p6 = "✓";
      if (data.completedIds.indexOf(7) !== -1) p7 = "✓";
    }
    
    // 6. Pembaruan ke Spreadsheet (Cari baris siswa berdasarkan Nama Siswa & Kelas)
    var dataRows = sheet.getDataRange().getValues();
    var foundRowIndex = -1;
    
    for (var r = 1; r < dataRows.length; r++) {
      var rowName = (dataRows[r][1] || "").toString().trim().toLowerCase();
      var rowClass = (dataRows[r][2] || "").toString().trim().toLowerCase();
      
      if (rowName === namaSiswa.toLowerCase() && (kelas === "" || rowClass === kelas.toLowerCase())) {
        foundRowIndex = r + 1; // 1-indexed baris spreadsheet
        break;
      }
    }
    
    // Jika siswa sudah ada di sheet: Perbarui baris siswa tersebut (Upsert tanpa menghapus baris lain)
    if (foundRowIndex > 0) {
      // Pertahankan tanda centang yang sebelumnya sudah pernah dikerjakan jika payload tidak mengirimkan pembatalan
      var existingRow = sheet.getRange(foundRowIndex, 1, 1, 13).getValues()[0];
      if (!p1 && existingRow[6] === "✓" && data.action !== "RESET" && data.habitId !== 1) p1 = "✓";
      if (!p2 && existingRow[7] === "✓" && data.action !== "RESET" && data.habitId !== 2) p2 = "✓";
      if (!p3 && existingRow[8] === "✓" && data.action !== "RESET" && data.habitId !== 3) p3 = "✓";
      if (!p4 && existingRow[9] === "✓" && data.action !== "RESET" && data.habitId !== 4) p4 = "✓";
      if (!p5 && existingRow[10] === "✓" && data.action !== "RESET" && data.habitId !== 5) p5 = "✓";
      if (!p6 && existingRow[11] === "✓" && data.action !== "RESET" && data.habitId !== 6) p6 = "✓";
      if (!p7 && existingRow[12] === "✓" && data.action !== "RESET" && data.habitId !== 7) p7 = "✓";
      
      // Hitung ulang total poin aktual dari centang jika diperlukan
      var checkCount = 0;
      if (p1 === "✓") checkCount++;
      if (p2 === "✓") checkCount++;
      if (p3 === "✓") checkCount++;
      if (p4 === "✓") checkCount++;
      if (p5 === "✓") checkCount++;
      if (p6 === "✓") checkCount++;
      if (p7 === "✓") checkCount++;
      
      if (data.action !== "LOGIN" && data.action !== "RESET") {
        totalPoin = Math.max(totalPoin, checkCount);
        statusDikerjakan = totalPoin > 0 ? "Dikerjakan" : "Belum dikerjakan";
      }
      
      var updatedRowValues = [
        waktuStr,
        namaSiswa,
        kelas || existingRow[2],
        poin,
        statusDikerjakan,
        totalPoin,
        p1,
        p2,
        p3,
        p4,
        p5,
        p6,
        p7
      ];
      
      sheet.getRange(foundRowIndex, 1, 1, 13).setValues([updatedRowValues]);
      
    } else {
      // Siswa baru: Tambahkan baris baru ke bawah tanpa menghapus data lama
      var newRowValues = [
        waktuStr,
        namaSiswa,
        kelas,
        poin,
        statusDikerjakan,
        totalPoin,
        p1,
        p2,
        p3,
        p4,
        p5,
        p6,
        p7
      ];
      sheet.appendRow(newRowValues);
    }
    
    var output = {
      status: "success",
      waktu: waktuStr,
      namaSiswa: namaSiswa,
      kelas: kelas,
      poin: poin,
      dikerjakan: statusDikerjakan,
      totalPoin: totalPoin,
      pertanyaan: {
        p1: p1,
        p2: p2,
        p3: p3,
        p4: p4,
        p5: p5,
        p6: p6,
        p7: p7
      }
    };
    
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

/**
 * Normalisasi Centang Tanda "✓"
 */
function formatCheckmark(val) {
  if (!val) return "";
  var s = val.toString().trim();
  if (s === "✓" || s === "1" || s === "true" || s.toLowerCase() === "selesai" || s.toLowerCase() === "ya") {
    return "✓";
  }
  return "";
}

/**
 * ============================================================================
 * FUNGSI PENGUJIAN MANDIRI MANUAL DI APPS SCRIPT:
 * Jalankan fungsi ini untuk memverifikasi penulisan 13 kolom dengan tepat!
 * ============================================================================
 */
function testWrite13Columns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getTargetSheet(ss);
  
  var now = new Date();
  var waktuTest = getJayapuraTime24(now);
  var namaUji = "ESRON PASARIBU";
  var kelasUji = "X-9";
  
  Logger.log(">>> Menjalankan Pengujian 13 Kolom SMANKAIH...");
  
  // Simulasi 1: Selesaikan Pertanyaan 1 (Bangun Pagi) -> Poin 1, Total 1, P1: ✓
  var sim1 = {
    postData: {
      contents: JSON.stringify({
        waktu: waktuTest,
        name: namaUji,
        kelas: kelasUji,
        poin: 1,
        totalPoints: 1,
        p1: "✓",
        p2: "",
        p3: "",
        p4: "",
        p5: "",
        p6: "",
        p7: "",
        completedIds: [1]
      })
    }
  };
  var res1 = doPost(sim1);
  Logger.log("Hasil Uji Pertanyaan 1: " + res1.getContent());
  
  // Simulasi 2: Selesaikan Pertanyaan 2 (Beribadah) -> Poin 1, Total 2, P1: ✓, P2: ✓
  var sim2 = {
    postData: {
      contents: JSON.stringify({
        waktu: getJayapuraTime24(new Date(now.getTime() + 60000)),
        name: namaUji,
        kelas: kelasUji,
        poin: 1,
        totalPoints: 2,
        p1: "✓",
        p2: "✓",
        completedIds: [1, 2]
      })
    }
  };
  var res2 = doPost(sim2);
  Logger.log("Hasil Uji Pertanyaan 2: " + res2.getContent());
  
  Logger.log("=== PENGUJIAN 13 KOLOM SELESAI DENGAN SUKSES ===");
}
