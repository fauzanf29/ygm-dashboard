export default function FloatingDetector({ mgmtStats, inventory }: { mgmtStats: any, inventory: any[] }) {
  if (!mgmtStats?.leaderboard) return null;

  // 👇 DAFTAR NAMA MANAGEMENT (VIP) YANG KEBAL DETEKTOR 👇
  const kebalHukum = ["Akew C", "NamaBos2", "NamaBos3"]; 

  const floatingList: any[] = [];
  let totalPotensiModal = 0;
  let totalPotensiJual = 0;

  // Mesin Intelijen: Periksa setiap staf
  mgmtStats.leaderboard.forEach((staff: any) => {
    
    // 🛡️ JURUS PENGECUALIAN VIP
    if (kebalHukum.includes(staff.name)) return;

    const itemMap: any = {};

    // 1. Catat semua barang yang DIAMBIL
    staff.historyAmbil?.forEach((log: any) => {
      if (!itemMap[log.item]) itemMap[log.item] = 0;
      itemMap[log.item] += log.qty;
    });

    // 2. Kurangi dengan barang yang DITARUH (Dikembalikan)
    staff.historyTaruh?.forEach((log: any) => {
      if (itemMap[log.item]) itemMap[log.item] -= log.qty;
    });

    // 3. Kurangi dengan barang yang LAKU TERJUAL
    staff.historySales?.forEach((log: any) => {
      if (itemMap[log.item]) itemMap[log.item] -= log.qty;
    });

    // 4. Periksa apakah ada SISA NGAMBANG
    Object.keys(itemMap).forEach(itemName => {
      const sisaQty = itemMap[itemName];
      if (sisaQty > 0) {
        // Cari data barang di database inventory
        const invItem = inventory?.find((i: any) => i.name === itemName || i.item === itemName);
        
        // Cek harga Modal dan harga Jual
        const modalSatu = invItem?.modal || invItem?.cogs || invItem?.hargaModal || 0; 
        const hargaSatu = invItem?.price || invItem?.harga || invItem?.hargaJual || 0; 
        
        const totalRugiModal = sisaQty * modalSatu;
        const totalRugiJual = sisaQty * hargaSatu;
        
        totalPotensiModal += totalRugiModal;
        totalPotensiJual += totalRugiJual;

        floatingList.push({
          staff: staff.name,
          item: itemName,
          sisaQty,
          totalRugiModal,
          totalRugiJual
        });
      }
    });
  });

  // Kalau nggak ada yang ngambang, sembunyikan!
  if (floatingList.length === 0) return null; 

  return (
    <div className="bg-red-950/30 border border-red-500/50 rounded-2xl p-6 mb-8 shadow-[0_0_30px_rgba(255,0,0,0.1)]">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl animate-pulse">🚨</span>
        <div>
          <h2 className="text-xl font-black text-red-500 uppercase tracking-wider">Detektor Barang Ngambang</h2>
          <p className="text-[11px] text-red-300/80 uppercase tracking-widest mt-1">Peringatan: Ada aset yang belum dikembalikan ke gudang!</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-red-900/40 text-red-400">
            <tr>
              <th className="p-3 rounded-tl-lg uppercase text-[10px] tracking-widest">Nama Staf</th>
              <th className="p-3 uppercase text-[10px] tracking-widest">Nama Barang</th>
              <th className="p-3 text-center uppercase text-[10px] tracking-widest">Sisa</th>
              <th className="p-3 text-right uppercase text-[10px] tracking-widest">Minus (Modal)</th>
              <th className="p-3 text-right rounded-tr-lg uppercase text-[10px] tracking-widest text-orange-400">Minus (Jual)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-900/30">
            {floatingList.map((data, idx) => (
              <tr key={idx} className="hover:bg-red-900/20 transition-colors">
                <td className="p-3 font-bold text-white">{data.staff}</td>
                <td className="p-3">{data.item}</td>
                <td className="p-3 text-center font-bold text-red-400">{data.sisaQty} Pcs</td>
                
                {/* Kolom Potensi Minus Modal */}
                <td className="p-3 text-right text-red-300 font-mono">
                  {data.totalRugiModal > 0 ? `-$ ${data.totalRugiModal.toLocaleString('id-ID')}` : '-'}
                </td>
                
                {/* Kolom Potensi Minus Jual (Warna Orange) */}
                <td className="p-3 text-right text-orange-300 font-mono">
                  {data.totalRugiJual > 0 ? `-$ ${data.totalRugiJual.toLocaleString('id-ID')}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
          {(totalPotensiModal > 0 || totalPotensiJual > 0) && (
            <tfoot className="bg-red-950/80 border-t border-red-500/30">
              <tr>
                <td colSpan={3} className="p-4 text-right font-black text-red-500 uppercase tracking-widest">TOTAL POTENSI MINUS:</td>
                <td className="p-4 text-right font-black text-red-500 text-base font-mono">-$ {totalPotensiModal.toLocaleString('id-ID')}</td>
                <td className="p-4 text-right font-black text-orange-500 text-base font-mono">-$ {totalPotensiJual.toLocaleString('id-ID')}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}