import React from 'react';


"use client"
import { signIn, signOut, useSession } from "next-auth/react"

export default function Dashboard() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="bg-cardBg p-10 rounded-2xl border border-burgundy shadow-2xl text-center">
          <h1 className="text-3xl font-black text-white mb-6 italic">Y-CLUB <span className="text-burgundy">HQ</span></h1>
          <button 
            onClick={() => signIn('discord')}
            className="bg-burgundy hover:bg-burgundyLight text-white px-8 py-3 rounded-lg font-bold transition flex items-center gap-3 mx-auto"
          >
            LOGIN WITH DISCORD
          </button>
        </div>
      </div>
    )
  }
return (
    <div className="min-h-screen bg-darkBg text-white font-sans selection:bg-burgundy">
      
      {/* HEADER */}
      <header className="flex justify-between items-center p-6 border-b border-gray-800 bg-cardBg">
        <div className="flex items-center gap-4">
          <div className="bg-burgundy text-white font-bold p-2 rounded-lg tracking-widest">
            YLC
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-wider">Y-CLUB HQ</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-gray-600 bg-gray-800" 
            />
            <div className="text-left hidden md:block">
              <p className="text-sm font-bold uppercase">KenzieIsHere</p>
              <p className="text-xs text-burgundyLight font-semibold italic">Authorized Management</p>
            </div>
          </div>
          
          <div className="bg-darkBg border border-gray-700 px-4 py-2 rounded-xl flex items-center gap-4">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Saldo Kas</p>
              <p className="text-sm font-bold text-burgundyLight">Rp 800,000</p>
            </div>
            {/* Icon dompet sederhana */}
            <div className="w-6 h-6 rounded bg-burgundy/20 flex items-center justify-center text-burgundy">
               $
            </div>
          </div>
          
          <button className="text-gray-500 hover:text-white transition">
            {/* Icon Logout */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-8 max-w-[1400px] mx-auto space-y-8">
        
        {/* CONTROLS (Week, New Item, New Expense) */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center bg-cardBg border border-gray-800 rounded-lg px-4 py-2">
            <span className="text-xs text-gray-400 font-bold mr-2">WEEK</span>
            <span className="text-sm font-bold text-burgundyLight">1</span>
          </div>
          <button className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition">
            + NEW ITEM
          </button>
          <button className="bg-burgundy hover:bg-burgundyLight text-white px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition">
             $ NEW EXPENSE
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-cardBg border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-gray-600 transition">
            <p className="text-xs text-gray-400 font-bold tracking-widest mb-4">PEMASUKAN KOTOR</p>
            <p className="text-3xl font-bold">Rp 0</p>
          </div>
          
          <div className="bg-cardBg border border-gray-800 p-6 rounded-2xl relative overflow-hidden hover:border-gray-600 transition">
            <p className="text-xs text-gray-400 font-bold tracking-widest mb-4">TOTAL PENGELUARAN</p>
            <p className="text-3xl font-bold text-red-500">Rp 200,000</p>
          </div>
          
          <div className="bg-cardBg border border-burgundy/50 shadow-[0_0_30px_rgba(128,0,32,0.1)] p-6 rounded-2xl relative overflow-hidden">
            <p className="text-xs text-gray-400 font-bold tracking-widest mb-4">PEMASUKAN BERSIH</p>
            <p className="text-3xl font-bold text-burgundyLight">Rp -200,000</p>
          </div>
        </div>

        {/* INVENTORY & LEADERBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LIVE INVENTORY */}
          <div className="lg:col-span-2 bg-cardBg border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xs text-gray-400 font-bold tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-burgundy animate-pulse"></span> LIVE INVENTORY
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item Card */}
              <div className="bg-darkBg border border-gray-800 rounded-xl p-4 flex justify-between items-center hover:border-burgundy/50 transition">
                <p className="font-bold italic tracking-wide">DEVIL WHISKEY</p>
                <span className="bg-burgundy/20 text-burgundy font-bold text-xs px-3 py-1 rounded-full">5 QTY</span>
              </div>
              <div className="bg-darkBg border border-gray-800 rounded-xl p-4 flex justify-between items-center hover:border-burgundy/50 transition">
                <p className="font-bold italic tracking-wide">VODKA</p>
                <span className="bg-gray-800 text-gray-400 font-bold text-xs px-3 py-1 rounded-full">0 QTY</span>
              </div>
            </div>
          </div>

          {/* STAFF LEADERBOARD */}
          <div className="bg-cardBg border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xs text-gray-400 font-bold tracking-widest mb-6">STAFF LEADERBOARD</h3>
            <div className="flex flex-col gap-4">
              <div className="text-sm text-gray-500 text-center py-8 border border-dashed border-gray-700 rounded-lg">
                Belum ada data staff minggu ini.
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
  // ... (Paste kode UI Dashboard kamu yang kemarin di sini) ...
}
