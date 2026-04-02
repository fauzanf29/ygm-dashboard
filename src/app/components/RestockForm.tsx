"use client";

import { useState } from "react";

export default function RestockForm({ currentWeek = "Minggu 7", spvName = "SPV_Asep", inventory = [] }: any) {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<any[]>([]); 
  const [formData, setFormData] = useState({ itemName: "", qty: "" });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddToCart = (e: any) => {
    e.preventDefault();
    if (!formData.itemName || !formData.qty) {
      alert("Pilih barang dan masukkan Qty yang benar!");
      return;
    }
    
    setCart([...cart, {
      itemName: formData.itemName,
      qty: Number(formData.qty),
      totalPrice: 0 // <--- Diset 0 biar API backend ga error saat nyatet log
    }]);
    
    // Reset form
    setFormData({ itemName: "", qty: "" });
  };

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSubmitAll = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/inventory/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,        
          pic: spvName,
          week: currentWeek
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Sukses! ${cart.length} macam barang berhasil di-restock.`);
        setCart([]); 
        window.location.reload(); 
      } else {
        alert(`❌ Gagal: ${data.error}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem pas ngirim data!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cardBg border border-gray-800 p-8 rounded-3xl shadow-xl mt-8">
      <h2 className="text-lg font-black italic text-orange-500 mb-6 uppercase tracking-widest border-l-4 border-orange-500 pl-3">
        📦 Restock Barang 
      </h2>
      
      <form onSubmit={handleAddToCart} className="flex flex-col md:flex-row gap-4 mb-6">
        {/* DROPDOWN BARANG */}
        <div className="flex-1">
          <select 
            name="itemName" 
            value={formData.itemName} 
            onChange={handleChange} 
            required
            className="w-full bg-darkBg border border-gray-700 text-white p-3 rounded-xl focus:outline-none focus:border-orange-500 font-bold text-sm appearance-none cursor-pointer"
          >
            <option value="" disabled>-- Pilih Barang --</option>
            {inventory.map((item: any, idx: number) => (
              <option key={idx} value={item.name}>
                {item.name} (Stok: {item.stock})
              </option>
            ))}
          </select>
        </div>

        {/* INPUT QTY */}
        <div className="w-full md:w-32">
          <input 
            type="number" 
            name="qty" 
            value={formData.qty} 
            onChange={handleChange} 
            placeholder="Qty" 
            min="1" 
            required 
            className="w-full bg-darkBg border border-gray-700 text-white p-3 rounded-xl focus:outline-none focus:border-orange-500 text-center font-black" 
          />
        </div>

        <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-3 rounded-xl uppercase text-xs transition-all whitespace-nowrap">
          + Tambah List
        </button>
      </form>

      {/* Tabel Keranjang Restock */}
      <div className="bg-darkBg border border-gray-800 rounded-xl overflow-hidden mb-6 min-h-[100px]">
        {cart.length === 0 ? (
          <p className="text-center text-[10px] text-gray-500 italic uppercase p-6 tracking-widest">Belum ada barang yang mau di-restock</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase border-b border-gray-800 bg-gray-900/50">
                <th className="p-3">Nama Barang</th>
                <th className="p-3 text-center">Jumlah Restock</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-3 font-bold uppercase text-gray-200">{item.itemName}</td>
                  <td className="p-3 text-center font-black text-orange-400">+{item.qty}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleRemoveItem(idx)} className="text-red-500 font-bold text-xs hover:text-red-400">✖</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer: Konfirmasi */}
      <div className="flex justify-end items-center bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <button 
          onClick={handleSubmitAll}
          disabled={loading || cart.length === 0}
          className={`px-8 py-4 rounded-xl font-bold text-xs uppercase transition-all shadow-lg ${
            loading || cart.length === 0 
            ? "bg-gray-800 text-gray-600 cursor-not-allowed shadow-none" 
            : "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/20"
          }`}
        >
          {loading ? "Memproses Data..." : `🚀 Konfirmasi Restock (${cart.length} Item)`}
        </button>
      </div>
    </div>
  );
}