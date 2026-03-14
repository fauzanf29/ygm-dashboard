export default function ActionBar(props: any) {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between">
      <div className="flex gap-3">
        {['staff', 'management', 'supervisor'].includes(props.userRole) && (
          <button onClick={props.handleAbsensi} className={`px-8 py-2.5 rounded-xl font-bold text-xs transition uppercase tracking-widest ${props.isCheckedIn ? 'bg-red-600' : 'bg-green-600'}`}>
            {props.isCheckedIn ? 'Check Out' : 'Check In'}
          </button>
        )}
        {(props.isCheckedIn || props.userRole === 'management') && (
          <button onClick={props.openKasir} className="px-8 py-2.5 rounded-xl font-bold text-xs bg-yellow-600 hover:bg-yellow-500 text-white uppercase tracking-widest">$ Buka Kasir</button>
        )}
        {props.userRole === 'management' && (
          <>
            <button onClick={props.openExpense} className="px-8 py-2.5 rounded-xl font-bold text-xs bg-red-800 hover:bg-red-700 text-white uppercase tracking-widest">💸 Catat Pengeluaran</button>
            <button onClick={props.sendReport} disabled={props.isSending} className="px-8 py-2.5 rounded-xl font-bold text-xs bg-[#5865F2] hover:bg-[#4752C4] text-white uppercase tracking-widest">{props.isSending ? 'Mengirim...' : '📢 Kirim Laporan'}</button>
          </>
        )}
        {(props.userRole === 'management' || (props.isCheckedIn && ['staff', 'supervisor'].includes(props.userRole))) && (
          <button onClick={props.openReimburse} className="px-8 py-2.5 rounded-xl font-bold text-xs transition bg-blue-600 hover:bg-blue-500 text-white uppercase tracking-widest shadow-lg active:scale-95">🧾 Ajukan Reimburse</button>
        )}
      </div>
      <div className="flex items-center bg-cardBg border border-gray-800 rounded-xl px-5 py-2.5">
         <span className="text-[10px] text-gray-500 font-bold mr-4 uppercase tracking-widest">Work Timer</span>
         <span className={`font-mono text-lg font-bold ${props.isCheckedIn ? 'text-burgundyLight' : 'text-gray-600'}`}>{props.time}</span>
      </div>
    </div>
  );
}