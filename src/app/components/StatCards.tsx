export default function StatCards({ mgmtStats }: { mgmtStats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-cardBg border border-gray-800 p-6 rounded-2xl shadow-lg">
        <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Gross Profit (Wk)</p>
        <p className="text-2xl font-black text-green-500">$ {mgmtStats?.finance?.bruto?.toLocaleString('id-ID') || 0}</p>
      </div>
      <div className="bg-cardBg border border-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-l-red-600">
        <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Pengeluaran (Wk)</p>
        <p className="text-2xl font-black text-red-500">$ {mgmtStats?.finance?.expense?.toLocaleString('id-ID') || 0}</p>
      </div>
      <div className="bg-cardBg border border-gray-800 p-6 rounded-2xl shadow-lg">
        <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Potongan (20%)</p>
        <p className="text-2xl font-black text-yellow-500">$ {mgmtStats?.finance?.setoran?.toLocaleString('id-ID') || 0}</p>
      </div>
      <div className="bg-cardBg border border-burgundy/30 p-6 rounded-2xl bg-gradient-to-br from-cardBg to-burgundy/5 shadow-xl">
        <p className="text-[10px] text-burgundyLight font-bold uppercase mb-2">Net (80% - Exp)</p>
        <p className="text-2xl font-black text-white">$ {mgmtStats?.finance?.net?.toLocaleString('id-ID') || 0}</p>
      </div>
      <div className="bg-cardBg border border-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-l-orange-500">
        <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 tracking-widest">Total COGS (Modal)</p>
        <p className="text-2xl font-black text-orange-500">$ {mgmtStats?.finance?.modal?.toLocaleString('id-ID') || 0}</p>
        <p className="text-[9px] text-gray-600 italic mt-1">*Beban modal dari barang laku</p>
      </div>
    </div>
  );
}