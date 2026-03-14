export default function ReimbursePanel({ pendingReimbursements, fetchPendingReimbursements, handleReimburseAction }: any) {
  return (
    <div className="bg-cardBg border border-blue-600/30 rounded-3xl overflow-hidden shadow-xl mt-4">
      <div className="p-4 border-b border-gray-800 bg-blue-900/20 flex justify-between items-center">
        <h3 className="font-black italic uppercase tracking-widest text-xs text-blue-400">🚨 Request Reimburse ({pendingReimbursements.length})</h3>
        <button onClick={fetchPendingReimbursements} className="text-[10px] bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full font-bold uppercase">Refresh</button>
      </div>
      <div className="p-4 overflow-y-auto max-h-[300px]">
        {pendingReimbursements.length === 0 ? (
          <p className="text-center text-[10px] text-gray-500 uppercase italic my-4">Nihil Request.</p>
        ) : (
          <ul className="space-y-3">
            {pendingReimbursements.map((req: any, idx: number) => (
              <li key={idx} className="bg-darkBg border border-gray-800 p-4 rounded-xl flex justify-between items-center shadow-inner">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-200">{req.nama} <span className="text-gray-500 text-[9px] ml-2 font-mono">{req.waktu}</span></p>
                  <p className="text-[10px] text-blue-400 italic">"{req.keterangan}"</p>
                  <p className="font-black text-sm text-yellow-500">$ {req.jumlah.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleReimburseAction(req, 'acc')} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase">✔️ ACC</button>
                  <button onClick={() => handleReimburseAction(req, 'tolak')} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase">❌ Tolak</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}