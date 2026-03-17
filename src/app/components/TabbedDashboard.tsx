"use client";

import React, { useState } from 'react';
import PocketMonitor from './PocketMonitor';
import StockBalance from './StockBalance';
import ValuasiGudang from './ValuasiGudang';
import FinanceAudit from './FinanceAudit';

export default function TabbedDashboard({ inventory, mgmtStats, userName }: any) {
  // State buat nyimpen posisi menu yang lagi dibuka
  const [activeTab, setActiveTab] = useState('radar');

  return (
    <div className="w-full mt-6">
      
      {/* 🎛️ PANEL NAVIGASI (TABS) */}
      <div className="flex flex-wrap gap-2 md:gap-4 p-2 bg-black/40 border border-gray-800 rounded-2xl mb-6">
        
        <button 
          onClick={() => setActiveTab('radar')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all duration-300 ${
            activeTab === 'radar' 
              ? 'bg-red-600/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(255,0,0,0.2)]' 
              : 'bg-transparent text-gray-500 hover:bg-gray-800 hover:text-gray-300 border border-transparent'
          }`}
        >
          <span className={`${activeTab === 'radar' ? 'animate-pulse' : ''}`}>🚨</span> Live Radar
        </button>

        <button 
          onClick={() => setActiveTab('gudang')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all duration-300 ${
            activeTab === 'gudang' 
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(0,0,255,0.2)]' 
              : 'bg-transparent text-gray-500 hover:bg-gray-800 hover:text-gray-300 border border-transparent'
          }`}
        >
          📦 Gudang & Audit
        </button>

        <button 
          onClick={() => setActiveTab('keuangan')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all duration-300 ${
            activeTab === 'keuangan' 
              ? 'bg-green-600/20 text-green-400 border border-green-500/50 shadow-[0_0_15px_rgba(0,255,0,0.2)]' 
              : 'bg-transparent text-gray-500 hover:bg-gray-800 hover:text-gray-300 border border-transparent'
          }`}
        >
          💰 Keuangan
        </button>

      </div>

      {/* 📺 LAYAR KONTEN UTAMA (Yang ganti-ganti pas diklik) */}
      <div className="transition-all duration-500 ease-in-out">
        
        {/* TAB 1: RADAR KANTONG */}
        {activeTab === 'radar' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PocketMonitor userName={userName} />
          </div>
        )}

        {/* TAB 2: AUDIT GUDANG */}
        {activeTab === 'gudang' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StockBalance inventory={inventory} mgmtStats={mgmtStats} />
            <ValuasiGudang inventory={inventory} />
          </div>
        )}

        {/* TAB 3: REKONSILIASI KEUANGAN */}
        {activeTab === 'keuangan' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FinanceAudit mgmtStats={mgmtStats} inventory={inventory} />
          </div>
        )}

      </div>

    </div>
  );
}