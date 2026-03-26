'use client';

import { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700'] 
});

export default function Home() {
  const [transaksi, setTransaksi] = useState([]);
  const [nama, setNama] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [tipe, setTipe] = useState('pengeluaran');
  const [sumber, setSumber] = useState('Ortu');
  const [sumberLainnya, setSumberLainnya] = useState(''); // State baru untuk ketik sendiri
  const [editId, setEditId] = useState(null);
  const [bulanAktif, setBulanAktif] = useState(new Date().getMonth());

  const daftarBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  useEffect(() => {
    const dataLama = localStorage.getItem('catatan_bear_v3');
    if (dataLama) setTransaksi(JSON.parse(dataLama));
  }, []);

  useEffect(() => {
    localStorage.setItem('catatan_bear_v3', JSON.stringify(transaksi));
  }, [transaksi]);

  const simpanData = (e) => {
    e.preventDefault();
    if (!nama || !jumlah) return alert("Isi dulu ya Beruang!");

    // Tentukan label sumber yang akan disimpan
    let labelSumber = tipe === 'pemasukan' ? (sumber === 'Lainnya' ? sumberLainnya : sumber) : '-';

    if (editId) {
      setTransaksi(transaksi.map(t => t.id === editId ? { ...t, nama, jumlah: Number(jumlah), tipe, sumber: labelSumber } : t));
      setEditId(null);
    } else {
      const baru = {
        id: Date.now(),
        nama,
        jumlah: Number(jumlah),
        tipe,
        sumber: labelSumber,
        tanggal: new Date().toISOString(),
      };
      setTransaksi([baru, ...transaksi]);
    }
    setNama(''); setJumlah(''); setSumberLainnya(''); setEditId(null);
  };

  const hapusData = (id) => {
    if(confirm("Hapus catatan ini, Beruang?")) {
      const sisa = transaksi.filter(t => t.id !== id);
      setTransaksi(sisa);
    }
  };

  const mulaiEdit = (t) => {
    setEditId(t.id);
    setNama(t.nama);
    setJumlah(t.jumlah);
    setTipe(t.tipe);
    if (t.tipe === 'pemasukan') {
        if (['Ortu', 'Tabungan'].includes(t.sumber)) {
            setSumber(t.sumber);
        } else {
            setSumber('Lainnya');
            setSumberLainnya(t.sumber);
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStabilo = (s) => {
    if (s === 'Ortu') return 'bg-[#8E977D] text-white';
    if (s === 'Tabungan') return 'bg-[#8A7650] text-white';
    if (s === '-') return 'hidden'; // Sembunyikan badge kalau pengeluaran
    return 'bg-[#DBCEA5] text-[#8A7650]'; // Untuk 'Lainnya'
  };

  const transaksiBulanIni = transaksi.filter(t => new Date(t.tanggal).getMonth() === bulanAktif);
  const pemasukan = transaksiBulanIni.filter(t => t.tipe === 'pemasukan').reduce((a, b) => a + b.jumlah, 0);
  const pengeluaran = transaksiBulanIni.filter(t => t.tipe === 'pengeluaran').reduce((a, b) => a + b.jumlah, 0);

  return (
    <div className={`${poppins.className} min-h-screen bg-[#ECE7D1] p-4 text-[#8A7650]`}>
      <div className="max-w-md mx-auto pb-10">
        
        {/* Header & Dashboard tetap sama seperti sebelumnya... */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Catat Beruang 🧸</h1>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Abil Zuhrotin</p>
          </div>
          <div className="bg-[#DBCEA5] p-3 rounded-2xl text-xl shadow-inner text-center">🐾</div>
        </div>

        <div className="bg-[#8A7650] text-[#ECE7D1] p-6 rounded-[2.5rem] mb-8 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 relative z-10">
            <button onClick={() => setBulanAktif(prev => prev === 0 ? 11 : prev - 1)}>◀</button>
            <span className="font-bold text-sm tracking-widest uppercase bg-[#8E977D] px-4 py-1 rounded-full">{daftarBulan[bulanAktif]}</span>
            <button onClick={() => setBulanAktif(prev => prev === 11 ? 0 : prev + 1)}>▶</button>
          </div>
          <p className="text-xs text-center opacity-80 mb-1">Sisa Uang Saku</p>
          <h2 className="text-4xl font-black text-center mb-6 tracking-tighter">Rp {(pemasukan - pengeluaran).toLocaleString()}</h2>
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#ECE7D1]/20">
            <div className="text-center"><p className="text-[10px] opacity-70">Masuk</p><p className="font-bold text-sm">+{pemasukan.toLocaleString()}</p></div>
            <div className="text-center border-l border-[#ECE7D1]/20"><p className="text-[10px] opacity-70">Keluar</p><p className="font-bold text-sm">-{pengeluaran.toLocaleString()}</p></div>
          </div>
        </div>

        {/* Form Section - Update di sini */}
        <form onSubmit={simpanData} className="bg-[#DBCEA5]/30 p-5 rounded-[2rem] border-2 border-[#DBCEA5] mb-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 px-1 text-sm font-bold uppercase">
             <span>{editId ? '📝' : '✨'}</span> {editId ? 'Ubah Catatan' : 'Tambah Catatan'}
          </div>
          
          <input 
            type="text" placeholder="Keterangan..." 
            className="w-full bg-[#ECE7D1] p-4 rounded-2xl outline-none"
            value={nama} onChange={(e) => setNama(e.target.value)}
          />
          
          <div className="flex gap-2">
            <input 
              type="number" placeholder="Rp" 
              className="flex-[2] bg-[#ECE7D1] p-4 rounded-2xl outline-none"
              value={jumlah} onChange={(e) => setJumlah(e.target.value)}
            />
            <select className="flex-1 bg-[#ECE7D1] p-4 rounded-2xl font-bold text-xs" value={tipe} onChange={(e) => setTipe(e.target.value)}>
               <option value="pengeluaran">OUT</option>
               <option value="pemasukan">IN</option>
            </select>
          </div>

          {/* Kondisional: Tampilkan Sumber hanya jika tipe == pemasukan */}
          {tipe === 'pemasukan' && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 bg-[#ECE7D1] p-2 rounded-2xl">
                <p className="text-[10px] font-black pl-3 uppercase opacity-50">Sumber:</p>
                <div className="flex gap-1 overflow-x-auto">
                  {['Ortu', 'Tabungan', 'Lainnya'].map((opt) => (
                    <button
                      key={opt} type="button" onClick={() => setSumber(opt)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold transition ${sumber === opt ? 'bg-[#8E977D] text-white' : 'text-[#8A7650]'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input teks tambahan jika pilih 'Lainnya' */}
              {sumber === 'Lainnya' && (
                <input 
                  type="text" placeholder="Dari mana? (misal: Lomba)" 
                  className="w-full bg-[#ECE7D1] p-4 rounded-2xl outline-none border-2 border-[#8E977D]/30 animate-in slide-in-from-top-2"
                  value={sumberLainnya} onChange={(e) => setSumberLainnya(e.target.value)}
                />
              )}
            </div>
          )}

          <button className="w-full bg-[#8E977D] text-[#ECE7D1] p-4 rounded-2xl font-black shadow-lg uppercase tracking-widest text-sm">
            {editId ? 'Update Data' : 'Simpan Catatan'}
          </button>
        </form>

        {/* Riwayat tetap sama... */}
  <div className="px-2 space-y-4">
          <h3 className="font-black flex items-center gap-2">📜 Riwayat {daftarBulan[bulanAktif]}</h3>
          
          {transaksiBulanIni.length === 0 ? (
            <div className="text-center py-16 bg-[#DBCEA5]/20 rounded-[2rem] border-2 border-dashed border-[#DBCEA5]">
              <p className="text-sm italic opacity-50 font-medium">Kosong... ayo mulai mencatat!</p>
            </div>
          ) : (
            transaksiBulanIni.map((item) => (
              <div key={item.id} className="bg-white/60 backdrop-blur-sm p-4 rounded-[1.5rem] flex justify-between items-center border border-[#DBCEA5] shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm text-[#8A7650]">{item.nama}</p>
                    {/* Badge Stabilo hanya muncul jika bukan pengeluaran */}
                    {item.sumber !== '-' && (
                      <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter ${getStabilo(item.sumber)}`}>
                        {item.sumber}
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] font-bold opacity-40 uppercase">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className={`text-sm font-black ${item.tipe === 'pemasukan' ? 'text-[#8E977D]' : 'text-[#8A7650]'}`}>
                    {item.tipe === 'pemasukan' ? '+' : '-'} {item.jumlah.toLocaleString()}
                  </p>
                  
                  {/* TOMBOL EDIT & HAPUS ADA DI SINI */}
                  <div className="flex gap-3 justify-end mt-1">
                    <button 
                      onClick={() => mulaiEdit(item)} 
                      className="text-[9px] font-black text-blue-500/60 hover:text-blue-500 uppercase tracking-tighter transition"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => hapusData(item.id)} 
                      className="text-[9px] font-black text-red-400/60 hover:text-red-600 uppercase tracking-tighter transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}