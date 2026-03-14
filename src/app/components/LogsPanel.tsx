export default function LogsPanel({ mgmtStats }: { mgmtStats: any }) {
  // --- LOGIKA "SIHIR" BUAT BACA DATA RESTOCK ---
  // Web bakal nge-scan log pengeluaran, nyari kata "Restock", terus ngitung total botolnya
  const restockedData = mgmtStats?.expensesList?.reduce((acc: any, exp: any) => {
    if (exp.kategori === 'Restock Barang') {
      // Nge-scan teks misal: "Restock 50x Whiskey"
      const match = exp.keterangan.match(/Restock (\d+)x (.+)/);
      if (match) {
        const qty = parseInt(match[1]);
        const name = match[2].trim();
        
        // Cek kalau barangnya udah ada di list, tinggal tambahin jumlahnya
        const existing = acc.find((i: any) => i.name === name);
        if (existing) existing.qty += qty;
        else acc.push({ name, qty });
      }
    }
    return acc;
  }, []);

  // Urutin dari restock yang paling banyak
  restockedData?.sort((a: any, b: any) => b.qty - a.qty);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      
      {/* 1. Tabel Item Terjual (Top Items) */}
      <div className="bg-cardBg border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 bg-darkBg/50">
          <h3 className="font-black italic uppercase tracking-widest text-xs text-green-500">Top Items (Terjual)</h3>
        </div>
        <div className="p-4 overflow-y-auto max-h-[300px]">
          <ul className="space-y-3">
            {!mgmtStats?.itemSales?.length ? (
              <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest my-4">Belum ada penjualan</p>
            ) : (
              mgmtStats.itemSales.map((item: any, idx: number) => (
                <li key={idx} className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                  <span className="font-bold uppercase text-xs text-gray-300">{item.name}</span>
                  <span className="bg-green-900/20 text-green-500 px-3 py-1 rounded-full text-[10px] font-black">{item.qty} Pcs</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* 2. Tabel Item Restock (BARU) */}
      <div className="bg-cardBg border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 bg-darkBg/50">
          <h3 className="font-black italic uppercase tracking-widest text-xs text-orange-500">Top Restock (Minggu Ini)</h3>
        </div>
        <div className="p-4 overflow-y-auto max-h-[300px]">
          <ul className="space-y-3">
            {!restockedData?.length ? (
              <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest my-4">Belum ada restock</p>
            ) : (
              restockedData.map((item: any, idx: number) => (
                <li key={idx} className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                  <span className="font-bold uppercase text-xs text-gray-300">{item.name}</span>
                  <span className="bg-orange-900/20 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black">+{item.qty} Pcs</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* 3. Tabel Log Pengeluaran */}
      <div className="bg-cardBg border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 bg-darkBg/50">
          <h3 className="font-black italic uppercase tracking-widest text-xs text-red-500">Log Pengeluaran</h3>
        </div>
        <div className="p-4 overflow-y-auto max-h-[300px]">
          <ul className="space-y-4">
            {!mgmtStats?.expensesList?.length ? (
              <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest my-4">Nihil Pengeluaran</p>
            ) : (
              mgmtStats.expensesList.map((exp: any, idx: number) => (
                <li key={idx} className="border-b border-gray-800/50 pb-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs uppercase text-red-400">{exp.kategori}</span>
                    <span className="font-black text-xs text-red-500">- $ {exp.amount.toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 italic mb-1">{exp.keterangan}</p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Oleh: {exp.pic}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

    </div>
  );
} 