"use client";

export default function StockBalance({ inventory, mgmtStats }: any) {
  // 1. Ambil data Penjualan per item
  const soldMap = mgmtStats?.itemSales?.reduce((acc: any, item: any) => {
    acc[item.name.toLowerCase()] = item.qty;
    return acc;
  }, {}) || {};

  // 2. Ambil data Restock per item (hasil scan Log_Pengeluaran)
  const restockMap = mgmtStats?.expensesList?.reduce((acc: any, exp: any) => {
    if (exp.kategori === 'Restock Barang') {
      const match = exp.keterangan.match(/Restock (\d+)x (.+)/);
      if (match) {
        const qty = parseInt(match[1]);
        const name = match[2].trim().toLowerCase();
        acc[name] = (acc[name] || 0) + qty;
      }
    }
    return acc;
  }, {}) || {};

  return (
    <div className="bg-cardBg border border-gray-800 rounded-3xl overflow-hidden shadow-2xl mt-8">
      <div className="p-6 border-b border-gray-800 bg-darkBg/50 flex justify-between items-center">
        <div>
          <h3 className="font-black italic uppercase tracking-widest text-sm text-blue-400">📊 Stock Balance</h3>
          <p className="text-[10px] text-gray-500 uppercase mt-1">Perbandingan Barang Masuk dan Keluar Minggu Ini</p>
        </div>
        <div className="flex gap-4">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-[10px] font-bold uppercase text-gray-400">Restock</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-[10px] font-bold uppercase text-gray-400">Sold</span>
            </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] text-gray-500 uppercase border-b border-gray-800 bg-gray-900/30">
              <th className="p-4">Nama Item</th>
              <th className="p-4 text-center">Restock (+)</th>
              <th className="p-4 text-center">Terjual (-)</th>
              <th className="p-4 text-center">Live Inventory</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {inventory.map((item: any, idx: number) => {
              const totalRestock = restockMap[item.name.toLowerCase()] || 0;
              const totalSold = soldMap[item.name.toLowerCase()] || 0;
              
              return (
                <tr key={idx} className="border-b border-gray-900/50 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-black uppercase text-gray-300">{item.name}</td>
                  <td className="p-4 text-center font-bold text-orange-500">
                    {totalRestock > 0 ? `+${totalRestock}` : "-"}
                  </td>
                  <td className="p-4 text-center font-bold text-green-500">
                    {totalSold > 0 ? `-${totalSold}` : "-"}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-black px-3 py-1 rounded-lg ${
                        item.stock <= 5 ? 'bg-red-900/30 text-red-500' : 'bg-gray-800 text-gray-300'
                    }`}>
                        {item.stock} Pcs
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {item.stock <= 5 ? (
                      <span className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-black uppercase animate-pulse">Low Stock</span>
                    ) : (
                      <span className="text-[10px] bg-green-600/20 text-green-500 px-2 py-1 rounded font-black uppercase">Healthy</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-blue-900/10 border-t border-gray-800">
          <p className="text-[9px] text-blue-400 italic text-center uppercase tracking-widest font-bold">
            Jika (Restock - Terjual) tidak sinkron dengan Live Inventory manual di brankas.
          </p>
      </div>
    </div>
  );
}