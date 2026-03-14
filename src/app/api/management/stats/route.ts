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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetWeek = searchParams.get('week'); 

    const sheets = await initSheets();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    // AMBIL 3 TAB (Sales, Expense, Absensi)
    const [salesRes, expenseRes, absensiRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Log_Penjualan!A2:G' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Log_Pengeluaran!A2:F' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Absensi!A2:F' })
    ]);

    const salesRows = salesRes.data.values || [];
    const expenseRows = expenseRes.data.values || [];
    const absensiRows = absensiRes.data.values || [];

    // --- 1. HITUNG KAS GLOBAL (SEPANJANG MASA) ---
    let globalBruto = 0;
    salesRows.forEach(row => globalBruto += (parseInt(row[5]?.toString().replace(/[^0-9]/g, "")) || 0));
    let globalExpense = 0;
    expenseRows.forEach(row => globalExpense += (parseInt(row[5]?.toString().replace(/[^0-9]/g, "")) || 0));
    
    // Rumus lama Bos: Duit Klub (80%) dikurangi semua pengeluaran
    const totalKasGlobal = (globalBruto * 0.8) - globalExpense;

    // --- 2. INITIALIZE DATA MINGGUAN ---
    let weekBruto = 0;
    let weekModal = 0;
    let weekExpense = 0;
    const staffStats: any = {};
    const itemSalesStats: any = {};
    const expensesList: any[] = [];

    // --- 3. PROSES ABSENSI (JAM KERJA) ---
    absensiRows.forEach(row => {
      if (row[1] === targetWeek) {
        const name = row[2];
        const hours = parseFloat((row[5] || "0").replace(" Jam", "")) || 0;
        if (!staffStats[name]) staffStats[name] = { name, totalSales: 0, totalHours: 0 };
        staffStats[name].totalHours += hours;
      }
    });

    // --- 4. PROSES PENJUALAN ---
    salesRows.forEach(row => {
      if (row[1] === targetWeek) {
        const name = row[2];
        const item = row[3];
        const qty = parseInt(row[4]) || 0;
        const amount = parseInt(row[5]?.toString().replace(/[^0-9]/g, "")) || 0;
        const modal = parseInt(row[6]?.toString().replace(/[^0-9]/g, "")) || 0;

        weekBruto += amount;
        weekModal += modal;

        if (!staffStats[name]) staffStats[name] = { name, totalSales: 0, totalHours: 0 };
        staffStats[name].totalSales += amount;

        if (!itemSalesStats[item]) itemSalesStats[item] = { name: item, qty: 0, total: 0 };
        itemSalesStats[item].qty += qty;
        itemSalesStats[item].total += amount;
      }
    });

    // --- 5. PROSES PENGELUARAN ---
    expenseRows.forEach(row => {
      if (row[1] === targetWeek) {
        const amount = parseInt(row[5]?.toString().replace(/[^0-9]/g, "")) || 0;
        weekExpense += amount;
        expensesList.push({ 
          date: row[0], week: row[1], pic: row[2], 
          kategori: row[3], keterangan: row[4], amount 
        });
      }
    });

    // --- 6. KALKULASI AKHIR ---
    const setoran20 = weekBruto * 0.2; 
    const netProfit = (weekBruto * 0.8) - weekExpense;

    // --- 7. RETURN DATA (GABUNGAN LAMA + BARU) ---
    return NextResponse.json({
      // Data untuk Audit Galak (BARU)
      totalSalesGlobal: weekBruto,
      totalExpenseGlobal: weekExpense,
      totalKasGlobal: totalKasGlobal, // Ini saldo riil hasil hitungan rumus 80%
      
      // Data untuk StatCards (LAMA)
      finance: {
        bruto: weekBruto,
        modal: weekModal,
        expense: weekExpense,
        setoran: setoran20,
        net: netProfit
      },
      
      // Data untuk Table & Chart (LAMA)
      leaderboard: Object.values(staffStats).sort((a: any, b: any) => b.totalSales - a.totalSales),
      itemSales: Object.values(itemSalesStats).sort((a: any, b: any) => b.qty - a.qty),
      expensesList: expensesList.reverse()
    });
    
  } catch (error) {
    console.error("STATS_ERROR:", error);
    return NextResponse.json({ error: "Gagal memproses data" }, { status: 500 });
  }
}