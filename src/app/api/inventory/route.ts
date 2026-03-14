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

// Fungsi buat nentuin Minggu Ke-Berapa (Otomatis)
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
      range: 'Inventory!A2:F', // Baca sampai Kolom F sesuai Sheet Bos
    });
    
    const rows = response.data.values || [];
    const items = rows.map(row => ({
      name: row[0],
      stock: parseInt(row[1]?.toString().replace(/[^0-9]/g, "")) || 0,
      price: parseInt(row[4]?.toString().replace(/[^0-9]/g, "")) || 0, // Harga di Kolom E (Index 4)
      modal: parseInt(row[5]?.toString().replace(/[^0-9]/g, "")) || 0, // Modal di Kolom F (Index 5)
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
    // 3. FITUR LAMA: Update Tab Inventory & Catat di Log_Inventory
    // ==========================================
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Inventory!B${rowIndex}:D${rowIndex}`, // Update Stok, Jam, dan Nama
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
    // 4. FITUR BARU: RADAR KANTONG (Mutasi_Stok)
    // ==========================================
    if (action === 'ambil') {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Mutasi_Stok!A:H',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            timeStr, week, userName, itemName, 
            qty, // Jumlah Ambil
            0,   // Terjual awal pasti 0
            qty, // Sisa Kantong
            "Keliling" // Status
          ]]
        }
      });
    } else if (action === 'taruh') {
      // Cari histori ngambil terakhir staf ini yang belum "Selesai"
      const mutasiRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Mutasi_Stok!A2:H' });
      const mutasiRows = mutasiRes.data.values || [];
      
      let targetRowIndex = -1;
      let currentSisa = 0;

      for (let i = mutasiRows.length - 1; i >= 0; i--) {
        const row = mutasiRows[i];
        if (row[2] === userName && row[3] === itemName && row[7] === "Keliling") {
          targetRowIndex = i;
          currentSisa = parseInt(row[6]?.toString().replace(/[^0-9]/g, "")) || 0;
          break; 
        }
      }

      // Potong sisa di kantong
      if (targetRowIndex !== -1) {
        const newSisa = Math.max(0, currentSisa - qty);
        const newStatus = newSisa === 0 ? "Selesai" : "Keliling";

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Mutasi_Stok!G${targetRowIndex + 2}:H${targetRowIndex + 2}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[newSisa, newStatus]] }
        });
      }
    }

    return NextResponse.json({ message: "Sukses", newStock });
  } catch (error) {
    console.error("API_ERROR:", error);
    return NextResponse.json({ error: "Gagal update stok" }, { status: 500 });
  }
}