"use client";

import { useState, useEffect } from "react";
import { Poppins } from "next/font/google";
import Swal from "sweetalert2";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Home() {
  const [transaksi, setTransaksi] = useState([]);
  const [namaTransaksi, setNamaTransaksi] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [tipe, setTipe] = useState("pengeluaran");
  const [sumber, setSumber] = useState("");
  const [editId, setEditId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State untuk Identitas & Filter Waktu
  const [userNama, setUserNama] = useState("");
  const [bulanAktif, setBulanAktif] = useState(new Date().getMonth());
  const [tahunAktif, setTahunAktif] = useState(new Date().getFullYear());

  const daftarBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  useEffect(() => {
    // Ambil Data Transaksi
    const dataLama = localStorage.getItem("catatan_bear_v4");
    if (dataLama) setTransaksi(JSON.parse(dataLama));

    // Cek Nama User
    const savedName = localStorage.getItem("user_name_bear");
    if (savedName) {
      setUserNama(savedName);
    } else {
      tanyaNama();
    }
  }, []);

  // 1. Tambahkan satu state lagi di atas
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // 2. Di useEffect ambil data, set isFirstLoad jadi false
  useEffect(() => {
    const dataLama = localStorage.getItem("catatan_bear_v4");
    if (dataLama) setTransaksi(JSON.parse(dataLama));
    setIsFirstLoad(false); // Tandanya data sudah selesai ditarik

    // ... (logic nama user)
  }, []);

  // 3. Di useEffect simpan data, cek isFirstLoad
  useEffect(() => {
    if (!isFirstLoad) {
      localStorage.setItem("catatan_bear_v4", JSON.stringify(transaksi));
    }
  }, [transaksi, isFirstLoad]);

  const tanyaNama = () => {
    Swal.fire({
      title: "Halo, aku Cookies! 🧸",
      text: "Boleh tau siapa nama kamu? ",
      input: "text",
      inputPlaceholder: "Ketik namamu di sini...",
      confirmButtonText: "Salam Kenal",
      confirmButtonColor: "#8E977D",
      background: "#ECE7D1", // Biar warnanya senada sama web kamu
      color: "#8A7650", // Warna teks cokelat biar estetik
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value) {
        setUserNama(result.value);
        localStorage.setItem("user_name_bear", result.value);

        // Munculin pesan salam kenal yang gemes
        Swal.fire({
          title: `Salam kenal, ${result.value}! ✨`,
          text: "Cookies siap bantu catat keuangan kamu!",
          icon: "success",
          showConfirmButton: false,
          timer: 5000,
          background: "#ECE7D1",
          color: "#8A7650",
        });
      }
    });
  };

  const simpanData = (e) => {
    e.preventDefault();
    if (!namaTransaksi || !jumlah) {
      return Swal.fire({
        icon: "warning",
        title: "Ups!",
        text: "Isi dulu ya Beruang!",
        confirmButtonColor: "#8E977D",
      });
    }

    if (editId) {
      setTransaksi(
        transaksi.map((t) =>
          t.id === editId
            ? {
                ...t,
                nama: namaTransaksi,
                jumlah: Number(jumlah),
                tipe,
                sumber: tipe === "pemasukan" ? sumber : "-",
              }
            : t,
        ),
      );
      setEditId(null);
      Swal.fire({
        icon: "success",
        title: "Berhasil Update!",
        showConfirmButton: false,
        timer: 1000,
      });
    } else {
      const baru = {
        id: Date.now(),
        nama: namaTransaksi,
        jumlah: Number(jumlah),
        tipe,
        sumber: tipe === "pemasukan" ? sumber : "-",
        tanggal: new Date().toISOString(),
      };
      setTransaksi([baru, ...transaksi]);
      Swal.fire({
        icon: "success",
        title: "Tersimpan!",
        showConfirmButton: false,
        timer: 1000,
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setNamaTransaksi("");
    setJumlah("");
    setSumber("");
    setEditId(null);
  };

  const hapusData = (id) => {
    Swal.fire({
      title: "Hapus catatan ini?",
      text: "Data yang dihapus nggak bisa balik lagi lho!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8A7650",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setTransaksi(transaksi.filter((t) => t.id !== id));
      }
    });
  };

  const mulaiEdit = (t) => {
    setEditId(t.id);
    setNamaTransaksi(t.nama);
    setJumlah(t.jumlah);
    setTipe(t.tipe);
    setSumber(t.sumber === "-" ? "" : t.sumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigasiWaktu = (arah) => {
    if (arah === "next") {
      if (bulanAktif === 11) {
        setBulanAktif(0);
        setTahunAktif((prev) => prev + 1);
      } else {
        setBulanAktif((prev) => prev + 1);
      }
    } else {
      if (bulanAktif === 0) {
        setBulanAktif(11);
        setTahunAktif((prev) => prev - 1);
      } else {
        setBulanAktif((prev) => prev - 1);
      }
    }
  };

  // Filter berdasarkan Bulan DAN Tahun
  const transaksiTersaring = transaksi.filter((t) => {
    const d = new Date(t.tanggal);
    return d.getMonth() === bulanAktif && d.getFullYear() === tahunAktif;
  });

  const pemasukan = transaksiTersaring
    .filter((t) => t.tipe === "pemasukan")
    .reduce((a, b) => a + b.jumlah, 0);
  const pengeluaran = transaksiTersaring
    .filter((t) => t.tipe === "pengeluaran")
    .reduce((a, b) => a + b.jumlah, 0);

  return (
    <div
      className={`${poppins.className} min-h-screen bg-[#ECE7D1] p-4 text-[#8A7650]`}
    >
      {/* OVERLAY (Latar hitam transparan saat menu buka) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#8A7650] text-[#ECE7D1] z-[70] transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out shadow-2xl p-6 rounded-r-[3rem]`}
      >
        <div className="flex flex-col h-full">
          {/* Profile di Sidebar */}
          <div className="flex flex-col items-center mt-10 mb-12">
            <div className="bg-[#DBCEA5] w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-white/20">
              🧸
            </div>
            <h2 className="font-black text-xl tracking-tight">Halo, Abil!</h2>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1">
              Cookies Member
            </p>
          </div>

          {/* Menu Links */}
          <nav className="space-y-4">
            <Link
              href="/"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-4 p-4 hover:bg-white/10 rounded-2xl transition font-black uppercase text-xs tracking-widest"
            >
              📜 Catat
            </Link>
            <Link
              href="/laporan"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-4 p-4 hover:bg-white/10 rounded-2xl transition font-black uppercase text-xs tracking-widest"
            >
              📊 Laporan Keuangan
            </Link>
          </nav>

          {/* Footer Sidebar */}
          <div className="mt-auto pb-6 text-center">
            <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em]">
              Cookies Pocket v1.0
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto pb-10">
        {/* Header - PERSIS GAMBAR TERBARU */}
        <div className="flex justify-between items-center mb-8 px-2 pt-2">
          <div className="flex items-center gap-4">
            <div className="bg-[#DBCEA5] w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-inner border-2 border-white/50">
              🧸
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black leading-none tracking-tight">
                  {userNama || "..."}
                </h1>
                <button
                  onClick={() => tanyaNama()}
                  className="opacity-30 hover:opacity-100 transition text-sm"
                >
                  ✎
                </button>
              </div>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1.5">
                Daily Pocket Tracker
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Icon */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="bg-[#DBCEA5] w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm border-2 border-white/50 active:scale-90 transition"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Dashboard dengan Tahun */}
        <div className="bg-[#8A7650] text-[#ECE7D1] p-6 rounded-[2.5rem] mb-8 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 relative z-10">
            <button
              onClick={() => navigasiWaktu("prev")}
              className="hover:scale-125 transition"
            >
              ◀
            </button>
            <div className="text-center">
              <span className="font-bold text-[10px] tracking-[0.2em] uppercase bg-[#8E977D] px-4 py-1 rounded-full">
                {daftarBulan[bulanAktif]} {tahunAktif}
              </span>
            </div>
            <button
              onClick={() => navigasiWaktu("next")}
              className="hover:scale-125 transition"
            >
              ▶
            </button>
          </div>
          <p className="text-xs text-center opacity-80 mb-1">Sisa Uang Saku</p>
          <h2 className="text-4xl font-black text-center mb-6 tracking-tighter">
            Rp {(pemasukan - pengeluaran).toLocaleString()}
          </h2>
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#ECE7D1]/20">
            <div className="text-center">
              <p className="text-[10px] opacity-70">Masuk</p>
              <p className="font-bold text-sm">+{pemasukan.toLocaleString()}</p>
            </div>
            <div className="text-center border-l border-[#ECE7D1]/20">
              <p className="text-[10px] opacity-70">Keluar</p>
              <p className="font-bold text-sm">
                -{pengeluaran.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form
          onSubmit={simpanData}
          className="bg-[#DBCEA5]/30 p-4 sm:p-5 rounded-[2rem] border-2 border-[#DBCEA5] mb-8 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2 px-1 text-xs sm:text-sm font-black uppercase tracking-wider">
            <span>{editId ? "📝" : "✨"}</span>
            {editId ? "Ubah Catatan" : "Tambah Catatan"}
          </div>

          <input
            type="text"
            placeholder="Keterangan..."
            className="w-full bg-[#ECE7D1] p-4 rounded-2xl outline-none text-sm placeholder:text-[#8A7650]/50"
            value={namaTransaksi}
            onChange={(e) => setNamaTransaksi(e.target.value)}
          />

          {/* Bagian ini sering bikin meluber di layar < 375px */}
          <div className="flex gap-2">
            <div className="flex-[2] min-w-0"> 
              <input
                type="number"
                placeholder="Rp"
                className="w-full bg-[#ECE7D1] p-4 rounded-2xl outline-none text-sm"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-0">
              <select
                className="w-full bg-[#ECE7D1] p-4 rounded-2xl font-black text-[10px] sm:text-xs h-full appearance-none"
                value={tipe}
                onChange={(e) => setTipe(e.target.value)}
              >
                <option value="pengeluaran">Keluar</option>
                <option value="pemasukan">Masuk</option>
              </select>
            </div>
          </div>

          {tipe === "pemasukan" && (
            <input
              type="text"
              placeholder="Sumber uang: (Contoh Gajian)"
              className="w-full bg-[#ECE7D1] p-4 rounded-2xl outline-none border-2 border-[#8E977D]/30 animate-in slide-in-from-top-2 text-sm"
              value={sumber}
              onChange={(e) => setSumber(e.target.value)}
            />
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-[3] bg-[#8E977D] text-[#ECE7D1] p-4 rounded-2xl font-black shadow-lg uppercase tracking-widest text-xs sm:text-sm active:scale-95 transition-transform"
            >
              {editId ? "Update" : "Simpan"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-red-400 text-white p-4 rounded-2xl font-black shadow-lg uppercase text-sm"
              >
                X
              </button>
            )}
          </div>
        </form>

        {/* Riwayat */}
        <div className="px-2 space-y-4">
          <h3 className="font-black flex items-center gap-2">
            📜 Riwayat {daftarBulan[bulanAktif]}
          </h3>

          {transaksiTersaring.length === 0 ? (
            <div className="text-center py-16 bg-[#DBCEA5]/20 rounded-4xl border-2 border-dashed border-[#DBCEA5]">
              <p className="text-sm italic opacity-50 font-medium">
                Belum ada catatan di bulan ini.
              </p>
            </div>
          ) : (
            transaksiTersaring.map((item) => (
              <div
                key={item.id}
                className="bg-white/60 backdrop-blur-sm p-4 rounded-3xl flex justify-between items-center border border-[#DBCEA5] shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm text-[#8A7650]">
                      {item.nama}
                    </p>
                    {item.sumber !== "-" && (
                      <span className="text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter bg-[#DBCEA5] text-[#8A7650]">
                        {item.sumber}
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] font-bold opacity-40 uppercase">
                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`text-sm font-black ${item.tipe === "pemasukan" ? "text-[#8E977D]" : "text-[#8A7650]"}`}
                  >
                    {item.tipe === "pemasukan" ? "+" : "-"}{" "}
                    {item.jumlah.toLocaleString()}
                  </p>

                  <div className="flex gap-3 justify-end mt-1">
                    <button
                      onClick={() => mulaiEdit(item)}
                      className="text-[9px] font-black text-blue-500/60 hover:text-blue-500 uppercase tracking-tighter"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => hapusData(item.id)}
                      className="text-[9px] font-black text-red-400/60 hover:text-red-600 uppercase tracking-tighter"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="text-center text-[10px] font-black opacity-20 mt-12 mb-6 uppercase tracking-[0.4em]">
          Cookies Pocket 1.0 🧸
        </p>
      </div>
    </div>
  );
}
