export default function Leaderboard({ mgmtStats, selectedWeek, setSelectedWeek }: any) {
  return (
    <div className="bg-cardBg border border-gray-800 rounded-3xl overflow-hidden shadow-xl mt-8">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-darkBg/50">
        <h3 className="font-black italic uppercase tracking-widest text-sm">Staff Leaderboard</h3>
        <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className="bg-darkBg border border-gray-700 rounded-lg px-4 py-2 text-xs font-bold text-burgundyLight outline-none">
          {[...Array(52)].map((_, i) => ( <option key={i} value={`Minggu ${i + 1}`}>Minggu {i + 1}</option> ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-gray-500 uppercase border-b border-gray-800">
              <th className="p-4">Rank</th><th className="p-4">Nama Staff</th><th className="p-4 text-center">Durasi Kerja</th><th className="p-4 text-right">Penjualan</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {mgmtStats?.leaderboard?.map((staff: any, idx: number) => (
              <tr key={idx} className="border-b border-gray-900/50 hover:bg-white/5 transition-colors">
                <td className="p-4">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}</td>
                <td className="p-4 font-bold uppercase">{staff.name}</td>
                <td className="p-4 text-center font-mono text-burgundyLight">{staff.totalHours.toFixed(2)} Jam</td>
                <td className="p-4 text-right font-black text-green-500">$ {staff.totalSales.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}