export default function StaffPanel(props: any) {
  if (!props.isCheckedIn && props.userRole === 'staff') {
    return (
      <div className="bg-cardBg border border-gray-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-xl min-h-[400px]">
        <div className="w-20 h-20 bg-burgundy/10 rounded-full flex items-center justify-center mb-6 border border-burgundy/30"><svg className="w-10 h-10 text-burgundyLight" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>
        <h2 className="text-2xl font-black italic uppercase mb-4">Akses Terkunci</h2>
        <p className="text-gray-400 mb-8 text-sm">Silakan <strong className="text-burgundyLight">Check In</strong> untuk akses brankas.</p>
        <button onClick={props.handleAbsensi} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase animate-pulse">Mulai Shift</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-cardBg border border-gray-800 rounded-3xl p-8 shadow-xl">
        <h3 className="text-xs text-gray-400 font-bold flex items-center gap-3 uppercase mb-8"><span className="w-2 h-2 rounded-full bg-burgundy animate-pulse"></span> Live Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {props.inventory.map((item: any, index: number) => (
            <div key={index} className="p-5 rounded-2xl border bg-darkBg border-gray-800 hover:border-burgundy/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div><p className="font-black italic text-lg uppercase">{item.name}</p><p className="text-[10px] text-gray-500">$ {item.price?.toLocaleString('id-ID')}</p></div>
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${item.stock > 0 ? 'bg-burgundy/20 text-burgundy' : 'bg-red-900/30 text-red-500'}`}>{item.stock} QTY</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => props.openInventoryModal(item.name, 'ambil', item.stock)} className="flex-1 bg-burgundy/80 py-2.5 rounded-xl font-bold text-[10px] uppercase">Ambil</button>
                <button onClick={() => props.openInventoryModal(item.name, 'taruh', item.stock)} className="flex-1 bg-gray-800 py-2.5 rounded-xl font-bold text-[10px] uppercase">Taruh</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-cardBg border border-gray-800 rounded-3xl p-8 shadow-xl flex flex-col h-full">
        <h3 className="text-xs text-gray-400 font-bold mb-6 uppercase italic border-l-2 border-yellow-600 pl-3">Kasir Analytics</h3>
        <div className="grid grid-cols-2 gap-4 mb-6 border-b border-gray-800 pb-6">
          <div className="bg-darkBg p-4 rounded-2xl border border-gray-800 shadow-inner"><p className="text-[9px] text-gray-500 mb-1 uppercase font-bold">Sales (Wk)</p><p className="text-lg font-black text-green-500">$ {props.totalSales.toLocaleString('id-ID')}</p></div>
          <div className="bg-darkBg p-4 rounded-2xl border border-gray-800 shadow-inner"><p className="text-[9px] text-gray-500 mb-1 uppercase font-bold">Shift (Wk)</p><p className="text-lg font-mono font-bold text-burgundyLight">{props.totalHours.toFixed(2)} H</p></div>
        </div>
        <div className="mb-6"><p className="text-[10px] text-gray-500 mb-1 uppercase font-bold">Sales Shift Ini</p><p className="text-3xl font-black text-yellow-500 tracking-tight">$ {props.todaySales.toLocaleString('id-ID')}</p></div>
        <div className="flex-1 min-h-[120px] mb-6"><p className="text-[10px] text-gray-500 mb-3 uppercase font-bold border-b border-gray-800 pb-2">Item Terjual</p>
          <ul className="space-y-2 overflow-y-auto max-h-[150px] pr-2">{props.todayItems.map((item: any, idx: number) => (<li key={idx} className="flex justify-between items-center border-b border-gray-800/50 pb-1"><span className="font-bold text-xs text-gray-300 uppercase">{item.item}</span><span className="font-mono text-xs text-yellow-500 font-black">x{item.qty}</span></li>))}</ul>
        </div>
        <div className="mt-auto pt-4 border-t border-gray-800"><p className="text-[10px] text-gray-500 mb-1 uppercase font-bold">Durasi Shift</p><p className="text-xl font-mono font-bold tracking-widest">{props.time}</p></div>
      </div>
    </div>
  );
}