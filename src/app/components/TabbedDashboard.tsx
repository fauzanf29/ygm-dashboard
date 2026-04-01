"use client";

import React from 'react';
import PocketMonitor from './PocketMonitor';

export default function TabbedDashboard({ inventory, mgmtStats, userName }: any) {
  return (
    <div className="w-full mt-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Langsung memanggil komponen Pocket Monitor tanpa sistem Tab */}
        <PocketMonitor userName={userName} />
      </div>
    </div>
  );
}