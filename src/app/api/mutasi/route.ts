
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { google } from "googleapis";

async function initSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function GET() {
  try {
    const sheets = await initSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Mutasi_Stok!A2:H',
    });

    const rows = res.data.values || [];
    
    // Filter cuma yang statusnya masih "Keliling" (Belum disetor semua)
    const activePockets = rows
      .filter(row => row[7] === "Keliling" && parseInt(row[6]) > 0)
      .map(row => ({
        waktu: row[0],
        minggu: row[1],
        nama: row[2],
        item: row[3],
        ambil: parseInt(row[4]) || 0,
        terjual: parseInt(row[5]) || 0,
        sisa: parseInt(row[6]) || 0,
      }))
      .reverse(); // Dibalik biar yang paling baru ngambil ada di atas

    return NextResponse.json(activePockets);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data mutasi" }, { status: 500 });
  }
}