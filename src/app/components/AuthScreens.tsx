import { signIn, signOut } from "next-auth/react";

export function LoadingScreen() {
  return <div className="min-h-screen bg-darkBg flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgundy"></div></div>;
}

export function LoginScreen() {
  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0"><img src="/ygm.jpg" alt="BG" className="w-full h-full object-cover blur-sm scale-110" /><div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div></div>
      <div className="bg-cardBg/90 backdrop-blur-lg p-10 rounded-3xl border border-burgundy shadow-[0_0_80px_rgba(128,0,32,0.4)] text-center max-w-sm w-full relative z-10">
        <h1 className="text-4xl font-black text-white mb-2 italic tracking-widest uppercase">YGM <span className="text-burgundyLight">Center</span></h1>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-10 border-b border-gray-800 pb-3">Management & Staff Portal</p>
        <button onClick={() => signIn('discord')} className="w-full bg-burgundy hover:bg-burgundyLight text-white py-4 mt-2 rounded-2xl font-black transition shadow-lg text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95">LOGIN WITH DISCORD</button>
      </div>
    </div>
  );
}

export function UnauthorizedScreen() {
  return (
    <div className="min-h-screen bg-darkBg text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-cardBg border border-red-600 p-10 rounded-3xl">
        <h1 className="text-4xl font-black text-red-600 mb-4 uppercase italic">Access Revoked</h1>
        <button onClick={() => signOut()} className="bg-red-600 px-8 py-3 rounded-xl font-bold uppercase tracking-widest mt-8">Logout</button>
      </div>
    </div>
  );
}