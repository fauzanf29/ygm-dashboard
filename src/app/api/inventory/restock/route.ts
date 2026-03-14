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
    // 1. TANGKAP DATA KERANJANG ("items") DARI FRONTEND
    const { items, pic, week } = await req.json();
    
    // Kalau keranjangnya kosong, tolak!
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Keranjang restock kosong!" }, { status: 400 });
    }

    const sheets = await initSheets();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    // 2. TARIK DATA INVENTORY DARI SHEETS
    const getInv = await sheets.spreadsheets.values.get({ 
      spreadsheetId, 
      range: 'Inventory!A2:F' 
    });
    const rows = getInv.data.values || [];
    
    const waktuSekarang = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    let logsToAppend: any[] = []; 

    // 3. LOOPING: PROSES SEMUA BARANG DI KERANJANG SATU PER SATU
    for (const item of items) {
      // Cari baris barang pake item.itemName (bukan itemName doang)
      const rowIndex = rows.findIndex(row => 
        row[0]?.toString().trim().toLowerCase() === item.itemName?.toString().trim().toLowerCase()
      );

      if (rowIndex !== -1) {
        const currentRow = rows[rowIndex];
        const currentStock = parseInt(currentRow[1]?.toString().replace(/[^0-9\-]/g, "")) || 0; 
        const newStock = currentStock + parseInt(item.qty);
        
        // Update stok di tab Inventory
        const cellToUpdate = `Inventory!B${rowIndex + 2}:D${rowIndex + 2}`; 
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: cellToUpdate,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[newStock, waktuSekarang, pic]] }
        });

        // Simpan nota pengeluaran ke memori sementara
        logsToAppend.push([
          waktuSekarang,                      
          week || "Minggu 1",                               
          pic || "SPV",                                
          "Restock Barang",                   
          `Restock ${item.qty}x ${item.itemName}`, 
          item.totalPrice                          
        ]);
      }
    }

    // 4. TEMBAK SEMUA NOTA KE LOG PENGELUARAN SEKALIGUS
    if (logsToAppend.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Log_Pengeluaran!A2:F',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: logsToAppend
        }
      });
    }

    return NextResponse.json({ success: true, message: "Bulk Restock sukses!" });

  } catch (error) {
    console.error("RESTOCK_ERROR:", error);
    return NextResponse.json({ error: "Gagal memproses Restock ke sistem" }, { status: 500 });
  }
}