import { useState } from 'react';

export default function Leaderboard({ mgmtStats, selectedWeek, setSelectedWeek }: any) {
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // ==========================================
  // 🧠 JURUS RANGKUM DATA (AGGREGATION)
  // ==========================================
  let aggregatedItems: any[] = [];
  
  if (selectedStaff) {
    const itemMap: any = {};

    // 1. Kumpulin data Ambil
    selectedStaff.historyAmbil?.forEach((h: any) => {
      if (!itemMap[h.item]) itemMap[h.item] = { name: h.item, ambil: 0, taruh: 0, jualQty: 0, jualTotal: 0 };
      itemMap[h.item].ambil += h.qty;
    });

    // 2. Kumpulin data Taruh
    selectedStaff.historyTaruh?.forEach((h: any) => {
      if (!itemMap[h.item]) itemMap[h.item] = { name: h.item, ambil: 0, taruh: 0, jualQty: 0, jualTotal: 0 };
      itemMap[h.item].taruh += h.qty;
    });

    // 3. Kumpulin data Penjualan
    selectedStaff.historySales?.forEach((h: any) => {
      if (!itemMap[h.item]) itemMap[h.item] = { name: h.item, ambil: 0, taruh: 0, jualQty: 0, jualTotal: 0 };
      itemMap[h.item].jualQty += h.qty;
      itemMap[h.item].jualTotal += h.amount;
    });

    // Ubah format Map jadi Array biar gampang dibikin tabel
    aggregatedItems = Object.values(itemMap);
  }

  return (
    <div className="bg-[#0a0a0a] border border-gray-800/60 rounded-3xl overflow-hidden shadow-2xl mt-8">
      
      {/* HEADER LEADERBOARD */}
      <div className="p-6 border-b border-gray-800/50 flex justify-between items-center bg-[#111]">
        <h3 className="font-black italic uppercase tracking-[0.2em] text-xs text-gray-300 border-l-2 border-yellow-600 pl-3">Staff Leaderboard</h3>
        <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className="bg-darkBg border border-gray-700 rounded-lg px-4 py-2 text-xs font-bold text-burgundyLight outline-none cursor-pointer">
          {[...Array(52)].map((_, i) => ( <option key={i} value={`Minggu ${i + 1}`}>Minggu {i + 1}</option> ))}
        </select>
      </div>
      
      {/* TABEL LEADERBOARD UTAMA */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] text-gray-500 uppercase tracking-widest border-b border-gray-800 bg-[#0a0a0a]">
              <th className="p-5 font-bold">Rank</th>
              <th className="p-5 font-bold">Nama Staff</th>
              <th className="p-5 text-center font-bold">Durasi Kerja</th>
              <th className="p-5 text-right font-bold">Total Disetor</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {mgmtStats?.leaderboard?.map((staff: any, idx: number) => (
              <tr key={idx} className="border-b border-gray-800/30 hover:bg-gray-900/40 transition-colors duration-300 group">
                <td className="p-5 text-lg">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : <span className="text-sm text-gray-500 font-bold ml-1">#{idx + 1}</span>}</td>
                
                {/* NAMA STAFF BISA DI KLIK */}
                <td className="p-5">
                  <button 
                    onClick={() => setSelectedStaff(staff)}
                    className="font-black uppercase tracking-wide text-left text-gray-300 group-hover:text-blue-400 transition-colors flex items-center gap-3"
                  >
                    {staff.name}
                    <span className="text-[9px] bg-blue-600/10 border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300">
                      🔍 Buka Audit
                    </span>
                  </button>
                </td>
                
                <td className="p-5 text-center font-mono font-bold text-gray-400">{staff.totalHours.toFixed(2)} <span className="text-[10px] text-gray-600">Jam</span></td>
                <td className="p-5 text-right font-black tracking-wider text-green-500">$ {staff.totalSales.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========================================== */}
      {/* 🕵️‍♂️ MODAL AUDIT STAFF (TABEL GABUNGAN) */}
      {/* ========================================== */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0a0a0a] border border-gray-700/50 rounded-3xl p-6 md:p-8 w-full max-w-5xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center border-b border-gray-800 pb-5 mb-6">
              <div>
                <h2 className="text-2xl font-black italic uppercase text-gray-200 tracking-wide">
                  Audit Log: <span className="text-blue-500">{selectedStaff.name}</span>
                </h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">
                  Rekap Aktivitas {selectedWeek}
                </p>
              </div>
              <button 
                onClick={() => setSelectedStaff(null)} 
                className="bg-gray-800/80 hover:bg-red-600 text-gray-300 hover:text-white w-10 h-10 rounded-full font-black transition-all duration-300 flex items-center justify-center text-lg"
              >
                ✕
              </button>
            </div>

            {/* Ringkasan Singkat */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-950/20 border border-green-900/30 p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-green-600/80 uppercase font-black tracking-widest mb-1">Total Setoran Uang</p>
                  <p className="text-2xl font-black text-green-500 tracking-wider">$ {selectedStaff.totalSales?.toLocaleString('id-ID')}</p>
                </div>
                <div className="text-3xl opacity-50">💰</div>
              </div>
              <div className="bg-[#111] border border-gray-800/50 p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Durasi Shift (Wk)</p>
                  <p className="text-2xl font-mono font-black text-burgundyLight">{selectedStaff.totalHours?.toFixed(2)} <span className="text-sm text-gray-500">H</span></p>
                </div>
                <div className="text-3xl opacity-50 text-gray-500">⏱️</div>
              </div>
            </div>

            {/* TABEL GABUNGAN (CORE AUDIT) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-800/60 rounded-2xl bg-[#111]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#0a0a0a] shadow-md z-10">
                  <tr className="text-[9px] text-gray-400 uppercase tracking-widest border-b border-gray-800/80">
                    <th className="p-4 pl-6 font-bold">Nama Item</th>
                    <th className="p-4 text-center font-bold text-blue-500/80">📦 Ambil</th>
                    <th className="p-4 text-center font-bold text-gray-500">🔙 Taruh</th>
                    <th className="p-4 text-center font-bold text-green-500/80">✅ Terjual</th>
                    <th className="p-4 text-right font-bold text-yellow-500/80">💵 Omset</th>
                    <th className="p-4 pr-6 text-center font-bold text-red-500/80 border-l border-gray-800/50">🚨 Sisa/Selisih</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {aggregatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-xs text-gray-600 uppercase tracking-widest font-bold">
                        Tidak ada catatan aktivitas di minggu ini.
                      </td>
                    </tr>
                  ) : (
                    aggregatedItems.map((item: any, idx: number) => {
                      // RUMUS DEWA: Sisa = Ambil - Taruh - Terjual
                      const sisa = item.ambil - item.taruh - item.jualQty;
                      const isWarning = sisa > 0;
                      
                      return (
                        <tr key={idx} className={`border-b border-gray-800/30 hover:bg-gray-900/30 transition-colors ${isWarning ? 'bg-red-950/10' : ''}`}>
                          <td className="p-4 pl-6 font-black uppercase text-gray-300 text-xs">{item.name}</td>
                          <td className="p-4 text-center font-bold text-blue-400 bg-blue-950/10">{item.ambil || "-"}</td>
                          <td className="p-4 text-center font-bold text-gray-400">{item.taruh || "-"}</td>
                          <td className="p-4 text-center font-black text-green-500">{item.jualQty || "-"}</td>
                          <td className="p-4 text-right font-mono font-bold text-yellow-500">
                            {item.jualTotal > 0 ? `$ ${item.jualTotal.toLocaleString('id-ID')}` : "-"}
                          </td>
                          <td className={`p-4 pr-6 text-center font-black border-l border-gray-800/50 ${isWarning ? 'text-red-500' : 'text-gray-600'}`}>
                            {isWarning ? (
                              <div className="flex flex-col items-center">
                                <span className="text-lg animate-pulse">{sisa}</span>
                                <span className="text-[8px] bg-red-900/30 px-1.5 py-0.5 rounded uppercase tracking-widest mt-1">Hilang/Kantong</span>
                              </div>
                            ) : (
                              <span className="text-[10px] uppercase">Aman</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                <span className="text-red-500">🚨 Sisa/Selisih</span> = (Total Ambil Gudang) dikurangi (Total Taruh Balik + Total Terjual)
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}