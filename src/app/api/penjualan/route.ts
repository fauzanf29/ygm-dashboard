import { NextResponse } from "next/server";
import { google } from "googleapis";

async function initSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemName, quantity, userName } = body;
    const qty = parseInt(quantity) || 1;

    const sheets = await initSheets();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    // 1. Cek Harga Jual & Harga Modal
    const invRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Inventory!A:F',
    });
    const rows = invRes.data.values || [];
    
    let hargaSatuan = 0;
    let hargaModalSatuan = 0;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === itemName) {
        hargaSatuan = parseInt(rows[i][4]?.toString().replace(/[^0-9]/g, "")) || 0;
        hargaModalSatuan = parseInt(rows[i][5]?.toString().replace(/[^0-9]/g, "")) || 0;
        break;
      }
    }

    if (hargaSatuan === 0) return NextResponse.json({ error: "Harga jual belum disetting di Kolom E!" }, { status: 400 });
    if (hargaModalSatuan === 0) return NextResponse.json({ error: "Harga modal belum disetting di Kolom F!" }, { status: 400 });

    const totalHarga = hargaSatuan * qty;
    const totalModal = hargaModalSatuan * qty;
    
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const timeStr = now.toLocaleString('id-ID');

    const epoch = new Date('2026-01-24T00:00:00+07:00').getTime();
    const nowMs = now.getTime();
    const diffInDays = Math.floor((nowMs - epoch) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffInDays / 7) + 1;
    const weekStr = `Minggu ${weekNumber > 0 ? weekNumber : 1}`;

    // 2. Catat ke Log_Penjualan
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Log_Penjualan!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timeStr, weekStr, userName, itemName, qty, totalHarga, totalModal]],
      },
    });

    // ==========================================
    // 3. JURUS POTONG BERANTAI (Mutasi_Stok)
    // ==========================================
    const mutasiRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Mutasi_Stok!A2:H' });
    const mutasiRows = mutasiRes.data.values || [];

    let remainingDeduct = qty; // Sisa botol yang harus dipotong dari kantong
    const updates = [];

    // Cari histori dari baris atas (lama) ke bawah (baru) - FIFO System
    for (let i = 0; i < mutasiRows.length; i++) {
      if (remainingDeduct <= 0) break; // Kalau udah lunas kepotong semua, stop nyari.

      const row = mutasiRows[i];
      if (row[2] === userName && row[3] === itemName && row[7] === "Keliling") {
        let currentTerjual = parseInt(row[5]?.toString().replace(/[^0-9]/g, "")) || 0;
        let currentSisa = parseInt(row[6]?.toString().replace(/[^0-9]/g, "")) || 0;

        if (currentSisa > 0) {
          // Potong sesuai sisa botol di baris itu
          let potong = Math.min(currentSisa, remainingDeduct);
          let newTerjual = currentTerjual + potong;
          let newSisa = currentSisa - potong;
          let newStatus = newSisa === 0 ? "Selesai" : "Keliling";

          // Simpan instruksi perubahannya
          updates.push({
            range: `Mutasi_Stok!F${i + 2}:H${i + 2}`,
            values: [[newTerjual, newSisa, newStatus]]
          });

          // Kurangi total utang botol yang lagi dicari
          remainingDeduct -= potong;
        }
      }
    }

    // Eksekusi semua potongan secara massal (Batch Update) biar cepet & hemat kuota
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates
        }
      });
    }

    return NextResponse.json({ message: "Sukses", totalHarga });
  } catch (error) {
    console.error("API_KASIR_ERROR:", error);
    return NextResponse.json({ error: "Gagal mencatat penjualan" }, { status: 500 });
  }
}