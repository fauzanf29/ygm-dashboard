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

function getCurrentWeek() {
  const diffInDays = Math.floor((Date.now() - new Date('2026-01-24T00:00:00+07:00').getTime()) / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(diffInDays / 7) + 1;
  return `Minggu ${weekNum > 0 ? weekNum : 1}`;
}

export async function GET() {
  try {
    const sheets = await initSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Inventory!A2:F',
    });
    
    const rows = response.data.values || [];
    const items = rows.map(row => ({
      name: row[0],
      stock: parseInt(row[1]?.toString().replace(/[^0-9]/g, "")) || 0,
      price: parseInt(row[4]?.toString().replace(/[^0-9]/g, "")) || 0,
      modal: parseInt(row[5]?.toString().replace(/[^0-9]/g, "")) || 0,
    }));
    
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat inventory" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemName, action, userName, quantity } = body;
    const qty = parseInt(quantity) || 1; 

    if (!itemName || !action || !userName || qty <= 0) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const sheets = await initSheets();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    // 1. Cek Stok Saat Ini
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Inventory!A:F',
    });
    const rows = response.data.values || [];
    let rowIndex = -1;
    let currentStock = 0;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === itemName) {
        rowIndex = i + 1; 
        currentStock = parseInt(rows[i][1]?.toString().replace(/[^0-9]/g, "")) || 0;
        break;
      }
    }

    if (rowIndex === -1) return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });

    // 2. Kalkulasi Matematika Brankas
    let newStock = currentStock;
    if (action === 'taruh') newStock += qty;
    if (action === 'ambil') {
      if (currentStock < qty) return NextResponse.json({ error: `Stok brankas ga cukup! Sisa: ${currentStock}` }, { status: 400 });
      newStock -= qty;
    }

    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const timeStr = now.toLocaleString('id-ID');
    const week = getCurrentWeek();

    // ==========================================
    // 3. Update Tab Inventory & Catat di Log_Inventory
    // ==========================================
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Inventory!B${rowIndex}:D${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[newStock, timeStr, userName]] },
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Log_Inventory!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timeStr, userName, itemName, action.toUpperCase(), qty, newStock]],
      },
    });

    // ==========================================
    // 4. JURUS POTONG BERANTAI (Mutasi_Stok)
    // ==========================================
    if (action === 'ambil') {
      // Kalau ambil, tambahin baris baru kayak biasa
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Mutasi_Stok!A:H',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[timeStr, week, userName, itemName, qty, 0, qty, "Keliling"]]
        }
      });
    } else if (action === 'taruh') {
      // Kalau taruh, bayar utang berantai (LIFO - dari yang paling baru diambil)
      const mutasiRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Mutasi_Stok!A2:H' });
      const mutasiRows = mutasiRes.data.values || [];
      
      let remainingDeduct = qty; // Jumlah botol yang mau ditaruh balik
      const updates = [];

      // Cari dari baris bawah (terbaru) ke atas
      for (let i = mutasiRows.length - 1; i >= 0; i--) {
        if (remainingDeduct <= 0) break; // Kalau udah lunas, stop nyari

        const row = mutasiRows[i];
        if (row[2] === userName && row[3] === itemName && row[7] === "Keliling") {
          let currentSisa = parseInt(row[6]?.toString().replace(/[^0-9]/g, "")) || 0;

          if (currentSisa > 0) {
            let potong = Math.min(currentSisa, remainingDeduct);
            let newSisa = currentSisa - potong;
            let newStatus = newSisa === 0 ? "Selesai" : "Keliling";

            // Simpan perubahan ke memori dulu
            updates.push({
              range: `Mutasi_Stok!G${i + 2}:H${i + 2}`, // Cuma update Kolom G (Sisa) & H (Status)
              values: [[newSisa, newStatus]]
            });

            remainingDeduct -= potong;
          }
        }
      }

      // Tembak perubahannya ke Sheets sekaligus
      if (updates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updates
          }
        });
      }
    }

    return NextResponse.json({ message: "Sukses", newStock });
  } catch (error) {
    console.error("API_ERROR:", error);
    return NextResponse.json({ error: "Gagal update stok" }, { status: 500 });
  }
}