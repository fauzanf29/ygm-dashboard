"use client";

import React, { useState, useEffect } from 'react';

export default function FinanceAudit({ mgmtStats, inventory }: any) {
  // --- STATE UNTUK KALKULATOR MANUAL ---
  // Default kita isi pakai angka sisa kas Bos kemarin biar gampang
  const [kasAwal, setKasAwal] = useState<number>(3356790); 
  const [uangFisik, setUangFisik] = useState<number>(0);

  // --- HITUNGAN MINGGU INI (DATA API) ---
  const totalSalesGross = mgmtStats?.totalSalesGlobal || 0;
  const potonganSetoran = totalSalesGross * 0.2;
  const totalSalesNet = totalSalesGross * 0.8;
  
  // Total semua pengeluaran minggu ini
  const totalExpenseWeek = mgmtStats?.totalExpenseGlobal || 0;

  // Profit Bersih Minggu Ini (Hak Brankas - Pengeluaran)
  const profitMingguIni = totalSalesNet - totalExpenseWeek;

  // --- HITUNGAN AUDIT FINAL ---
  // Target = Kas Kemarin + Profit Minggu Ini
  const expectedAkhir = kasAwal + profitMingguIni;
  
  // Selisih = Uang Fisik In-Game - Target Seharusnya
  const selisihKas = uangFisik - expectedAkhir;
  const isMissingKas = selisihKas < 0 && uangFisik > 0; // Merah kalau uang fisik diisi dan hasilnya minus
  const missingAmount = Math.abs(selisihKas);

  // --- AI DETEKTIF ---
  let aiConclusion = "Silakan masukkan Jumlah Uang di Brangkas Sekarang pada kolom di atas untuk mulai memindai kebocoran dana.";
  if (uangFisik > 0) {
    if (isMissingKas) {
      aiConclusion = `🚨 KEBOCORAN DANA! Uang di brankas kurang $ ${missingAmount.toLocaleString('id-ID')}.`;
    } else if (selisihKas > 0) {
      aiConclusion = `⚠️ UANG BERLEBIH! Ada kelebihan uang $ ${selisihKas.toLocaleString('id-ID')} di brankas.`;
    } else {
      aiConclusion = `✅ BALANCE SEMPURNA! Pembukuan 100% dengan fisik uang di dalam brankas.`;
    }
  }

  return (
    <div className={`bg-cardBg border-2 ${isMissingKas ? 'border-red-600 shadow-[0_0_30px_rgba(255,0,0,0.2)]' : 'border-gray-800'} rounded-3xl overflow-hidden mt-8`}>
      
      {/* HEADER */}
      <div className={`p-6 border-b ${isMissingKas ? 'border-red-600 bg-red-600/10' : 'border-gray-800 bg-darkBg/50'} flex justify-between items-center`}>
        <div>
          <h3 className={`font-black italic uppercase tracking-widest text-sm ${isMissingKas ? 'text-red-500' : 'text-yellow-500'} flex items-center gap-2`}>
            {isMissingKas ? '🚨 INTERNAL AUDIT: KEBOCORAN DANA' : '💰 REKONSILIASI KEUANGAN MINGGUAN'}
          </h3>
          <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Sistem Perhitungan Siklus Mingguan</p>
        </div>
      </div>

      {/* INPUT KALKULATOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-black/40 border-b border-gray-800">
        <div>
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 block">Kas Sisa Minggu Lalu (Modal Awal)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black">$</span>
            <input 
              type="number" 
              value={kasAwal}
              onChange={(e) => setKasAwal(Number(e.target.value))}
              className="w-full bg-darkBg border border-gray-700 rounded-xl py-3 pl-8 pr-4 text-white font-black outline-none focus:border-yellow-500 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mb-1 block">Jumlah Uang di BRANKAS SEKARANG</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 font-black">$</span>
            <input 
              type="number" 
              value={uangFisik}
              onChange={(e) => setUangFisik(Number(e.target.value))}
              className="w-full bg-yellow-900/20 border border-yellow-700/50 rounded-xl py-3 pl-8 pr-4 text-yellow-500 font-black outline-none focus:border-yellow-400 transition-colors"
              placeholder="Cek brankas di GTA, ketik di sini..."
            />
          </div>
        </div>
      </div>

      {/* METRIK MINGGU INI */}
      <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-800">
        <div className="p-4"><p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Bruto (Kotor)</p><p className="text-lg font-black text-gray-300">$ {totalSalesGross.toLocaleString('id-ID')}</p></div>
        <div className="p-4 bg-red-900/10"><p className="text-[9px] text-red-400 font-bold uppercase mb-1">Setoran (-20%)</p><p className="text-lg font-black text-red-400">$ {potonganSetoran.toLocaleString('id-ID')}</p></div>
        <div className="p-4 bg-green-900/10"><p className="text-[9px] text-green-500 font-bold uppercase mb-1">Hak Brankas (80%)</p><p className="text-lg font-black text-green-500">$ {totalSalesNet.toLocaleString('id-ID')}</p></div>
        <div className="p-4 bg-orange-900/10"><p className="text-[9px] text-orange-500 font-bold uppercase mb-1">Total Pengeluaran (-)</p><p className="text-lg font-black text-orange-500">$ {totalExpenseWeek.toLocaleString('id-ID')}</p></div>
        <div className="p-4 bg-blue-900/20"><p className="text-[9px] text-blue-400 font-bold uppercase mb-1">Profit Minggu Ini</p><p className="text-lg font-black text-blue-400">{profitMingguIni >= 0 ? '+' : ''}$ {profitMingguIni.toLocaleString('id-ID')}</p></div>
      </div>

      {/* HASIL AUDIT */}
      <div className={`p-6 border-t ${isMissingKas ? 'border-red-600 bg-red-900/10' : 'border-gray-800 bg-black/20'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
               Saldo Seharusnya (Awal + Profit)
            </p>
            <h4 className="text-2xl font-black text-white">
              $ {expectedAkhir.toLocaleString('id-ID')}
            </h4>
          </div>
          
          {uangFisik > 0 && (
            <div className={`px-6 py-3 rounded-2xl border ${isMissingKas ? 'bg-red-950/50 border-red-500' : selisihKas > 0 ? 'bg-yellow-950/50 border-yellow-500' : 'bg-green-950/50 border-green-500'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isMissingKas ? 'text-red-400' : selisihKas > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                {isMissingKas ? 'STATUS: MINUS / HILANG' : selisihKas > 0 ? 'STATUS: UANG BERLEBIH' : 'STATUS: SESUAI'}
              </p>
              <h4 className={`text-xl font-black ${isMissingKas ? 'text-red-500' : selisihKas > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                {selisihKas < 0 ? '-' : selisihKas > 0 ? '+' : ''}$ {Math.abs(selisihKas).toLocaleString('id-ID')}
              </h4>
            </div>
          )}
        </div>

        {/* --- KOTAK DETEKTIF AI --- */}
        <div className={`p-4 rounded-xl border-l-4 ${uangFisik === 0 ? 'border-gray-500 bg-gray-900/30' : isMissingKas ? 'border-red-500 bg-red-950/40' : selisihKas > 0 ? 'border-yellow-500 bg-yellow-900/20' : 'border-green-500 bg-green-900/20'} flex gap-4 items-start`}>
          <div className="text-2xl mt-1">🤖</div>
          <div>
            <p className={`text-[10px] font-black tracking-widest uppercase mb-1 ${uangFisik === 0 ? 'text-gray-400' : isMissingKas ? 'text-red-400' : selisihKas > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              Sistem Analisis Bukti
            </p>
            <p className={`text-xs font-medium leading-relaxed ${uangFisik === 0 ? 'text-gray-500' : isMissingKas ? 'text-red-200' : selisihKas > 0 ? 'text-yellow-200' : 'text-green-200'}`}>
              {aiConclusion}
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}