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

    // 1. Cek Harga Jual & Harga Modal di Inventory (Kolom A sampai F)
    const invRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Inventory!A:F',
    });
    const rows = invRes.data.values || [];
    
    let hargaSatuan = 0;
    let hargaModalSatuan = 0;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === itemName) {
        // [UPDATE]: Ditambahin .replace biar kebal sama format titik/dolar di Google Sheets
        hargaSatuan = parseInt(rows[i][4]?.toString().replace(/[^0-9]/g, "")) || 0; // Kolom E (Harga Jual)
        hargaModalSatuan = parseInt(rows[i][5]?.toString().replace(/[^0-9]/g, "")) || 0; // Kolom F (Harga Modal)
        break;
      }
    }

    if (hargaSatuan === 0) return NextResponse.json({ error: "Harga jual belum disetting di Kolom E!" }, { status: 400 });
    if (hargaModalSatuan === 0) return NextResponse.json({ error: "Harga modal belum disetting di Kolom F!" }, { status: 400 });

    // 2. Hitung Total Pendapatan & Total Modal
    const totalHarga = hargaSatuan * qty;
    const totalModal = hargaModalSatuan * qty;
    
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const timeStr = now.toLocaleString('id-ID');

    const epoch = new Date('2026-01-24T00:00:00+07:00').getTime();
    const nowMs = now.getTime();
    const diffInDays = Math.floor((nowMs - epoch) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffInDays / 7) + 1;
    const weekStr = `Minggu ${weekNumber > 0 ? weekNumber : 1}`;

    // 3. Catat ke Log_Penjualan (Kodingan Lama Bos)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Log_Penjualan!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        // [Waktu, Minggu, Nama, Item, Qty, Total Pendapatan, Total Modal]
        values: [[timeStr, weekStr, userName, itemName, qty, totalHarga, totalModal]],
      },
    });

    // ==========================================
    // 4. FITUR BARU: RADAR KANTONG (Update Tab Mutasi_Stok)
    // ==========================================
    const mutasiRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Mutasi_Stok!A2:H' });
    const mutasiRows = mutasiRes.data.values || [];

    let targetRowIndex = -1;
    let currentTerjual = 0;
    let currentSisa = 0;

    // Cari histori staf ini dari bawah ke atas (cari yang belum disetor / "Keliling")
    for (let i = mutasiRows.length - 1; i >= 0; i--) {
      const row = mutasiRows[i];
      if (row[2] === userName && row[3] === itemName && row[7] === "Keliling") {
        targetRowIndex = i;
        currentTerjual = parseInt(row[5]?.toString().replace(/[^0-9]/g, "")) || 0; // Kolom F (Terjual)
        currentSisa = parseInt(row[6]?.toString().replace(/[^0-9]/g, "")) || 0;    // Kolom G (Sisa)
        break;
      }
    }

    if (targetRowIndex !== -1) {
      // Kalkulasi update kantong staf
      const newTerjual = currentTerjual + qty;
      const newSisa = Math.max(0, currentSisa - qty); // Biar sisa kantong ga jadi minus
      const newStatus = newSisa === 0 ? "Selesai" : "Keliling";

      // Timpa angka lama di Sheet Mutasi_Stok
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Mutasi_Stok!F${targetRowIndex + 2}:H${targetRowIndex + 2}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[newTerjual, newSisa, newStatus]] }
      });
    }

    return NextResponse.json({ message: "Sukses", totalHarga });
  } catch (error) {
    console.error("API_KASIR_ERROR:", error);
    return NextResponse.json({ error: "Gagal mencatat penjualan" }, { status: 500 });
  }
}