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

    // 1. Cek Harga Jual SAJA (Harga Modal dihapus)
    const invRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Inventory!A:F',
    });
    const rows = invRes.data.values || [];
    
    let hargaSatuan = 0;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === itemName) {
        hargaSatuan = parseInt(rows[i][4]?.toString().replace(/[^0-9]/g, "")) || 0;
        break;
      }
    }

    if (hargaSatuan === 0) return NextResponse.json({ error: "Harga jual belum disetting di Kolom E!" }, { status: 400 });

    const totalHarga = hargaSatuan * qty;
    
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const timeStr = now.toLocaleString('id-ID');

    const epoch = new Date('2026-01-24T00:00:00+07:00').getTime();
    const nowMs = now.getTime();
    const diffInDays = Math.floor((nowMs - epoch) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffInDays / 7) + 1;
    const weekStr = `Minggu ${weekNumber > 0 ? weekNumber : 1}`;

    // 2. Catat ke Log_Penjualan (Hanya 6 Kolom, Kolom Modal Dihilangkan)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Log_Penjualan!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timeStr, weekStr, userName, itemName, qty, totalHarga]],
      },
    });

    // 3. JURUS POTONG BERANTAI (Mutasi_Stok)
    const mutasiRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Mutasi_Stok!A2:H' });
    const mutasiRows = mutasiRes.data.values || [];

    let remainingDeduct = qty; 
    const updates = [];

    for (let i = 0; i < mutasiRows.length; i++) {
      if (remainingDeduct <= 0) break; 

      const row = mutasiRows[i];
      if (row[2] === userName && row[3] === itemName && row[7] === "Keliling") {
        let currentTerjual = parseInt(row[5]?.toString().replace(/[^0-9]/g, "")) || 0;
        let currentSisa = parseInt(row[6]?.toString().replace(/[^0-9]/g, "")) || 0;

        if (currentSisa > 0) {
          let potong = Math.min(currentSisa, remainingDeduct);
          let newTerjual = currentTerjual + potong;
          let newSisa = currentSisa - potong;
          let newStatus = newSisa === 0 ? "Selesai" : "Keliling";

          updates.push({
            range: `Mutasi_Stok!F${i + 2}:H${i + 2}`,
            values: [[newTerjual, newSisa, newStatus]]
          });

          remainingDeduct -= potong;
        }
      }
    }

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