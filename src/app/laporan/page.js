"use client";

import { useState, useEffect } from "react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export default function Laporan() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transaksi, setTransaksi] = useState([]);
  const [userNama, setUserNama] = useState("Abil");
  const [bulanAktif, setBulanAktif] = useState(new Date().getMonth());
  const [tahunAktif, setTahunAktif] = useState(new Date().getFullYear());
  const [modeLaporan, setModeLaporan] = useState("bulan"); // 'bulan' atau 'tahun'

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
    const dataLama = localStorage.getItem("catatan_bear_v4");
    if (dataLama) setTransaksi(JSON.parse(dataLama));
    const savedName = localStorage.getItem("user_name_bear");
    if (savedName) setUserNama(savedName);
  }, []);

  // Filter Data Berdasarkan Waktu yang Dipilih
  const transaksiTersaring = transaksi.filter((t) => {
    const d = new Date(t.tanggal);
    if (modeLaporan === "bulan") {
      return d.getMonth() === bulanAktif && d.getFullYear() === tahunAktif;
    } else {
      // Kalau mode tahun, cuma cek tahunnya aja
      return d.getFullYear() === tahunAktif;
    }
  });

  const pemasukan = transaksiTersaring
    .filter((t) => t.tipe === "pemasukan")
    .reduce((a, b) => a + b.jumlah, 0);
  const pengeluaran = transaksiTersaring
    .filter((t) => t.tipe === "pengeluaran")
    .reduce((a, b) => a + b.jumlah, 0);

  const dataGrafik = [
    { name: "Masuk", value: pemasukan || 0 },
    { name: "Keluar", value: pengeluaran || 0 },
  ];
  const COLORS = ["#8E977D", "#D4A373"];

  // --- LOGIKA EKSPOR ---
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      transaksiTersaring.map((t) => ({
        Tanggal: new Date(t.tanggal).toLocaleDateString("id-ID"),
        Keterangan: t.nama,
        Tipe: t.tipe.toUpperCase(),
        Jumlah: t.jumlah,
        Sumber: t.sumber,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");

    // LOGIKA NAMA FILE DINAMIS:
    const namaFile =
      modeLaporan === "bulan"
        ? `Laporan_Cookies_${daftarBulan[bulanAktif]}_${tahunAktif}`
        : `Laporan_Cookies_Tahunan_${tahunAktif}`;

    XLSX.writeFile(wb, `${namaFile}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // LOGIKA JUDUL DINAMIS:
    const judulPeriode =
      modeLaporan === "bulan"
        ? `Periode: ${daftarBulan[bulanAktif]} ${tahunAktif}`
        : `Periode: Tahunan ${tahunAktif}`;

    doc.text(`Laporan Keuangan: ${userNama}`, 14, 15);
    doc.text(judulPeriode, 14, 22);

    autoTable(doc, {
      head: [["Tanggal", "Keterangan", "Jumlah", "Sumber"]],
      body: transaksiTersaring.map((t) => [
        new Date(t.tanggal).toLocaleDateString("id-ID"),
        t.nama,
        t.tipe === "pemasukan" ? `+${t.jumlah}` : `-${t.jumlah}`,
        t.sumber,
      ]),
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [138, 118, 80] },
    });

    // LOGIKA NAMA FILE DINAMIS:
    const namaFilePdf =
      modeLaporan === "bulan"
        ? `Laporan_Cookies_${daftarBulan[bulanAktif]}`
        : `Laporan_Cookies_Tahunan_${tahunAktif}`;

    doc.save(`${namaFilePdf}.pdf`);
  };

  return (
    <div
      className={`${poppins.className} min-h-screen bg-[#ECE7D1] text-[#8A7650] relative overflow-x-hidden`}
    >
      {/* OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR (Sama dengan Page Utama) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#8A7650] text-[#ECE7D1] z-[70] transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 shadow-2xl p-6 rounded-r-[3rem]`}
      >
        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center mt-10 mb-12 text-center">
            <div className="bg-[#DBCEA5] w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-white/20 shadow-lg">
              🧸
            </div>
            <h2 className="font-black text-xl tracking-tight leading-none uppercase italic">
              {userNama}
            </h2>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em] mt-2 italic">
              Cookies Member
            </p>
          </div>
          <nav className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-4 p-4 hover:bg-white/10 rounded-2xl transition font-black uppercase text-xs tracking-widest"
            >
              📜 Catat
            </Link>
            <Link
              href="/laporan"
              className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl transition font-black uppercase text-xs tracking-widest"
            >
              📊 Laporan
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-10">
        {/* Header Laporan */}
        <div className="flex items-center gap-4 mb-8 pt-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="bg-[#DBCEA5] w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm border-2 border-white/50 active:scale-90 transition"
          >
            ☰
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black leading-none uppercase tracking-tighter">
              Laporan Keuangan
            </h1>
            <p className="text-[9px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1 italic">
              Berikut Statistik Keuanganmu {userNama}
            </p>
          </div>
        </div>

        {/* NAVIGATION + MODE TOGGLE */}
        <div className="bg-[#8A7650] text-[#ECE7D1] p-5 rounded-[2.5rem] mb-6 shadow-xl space-y-4">
          {/* Toggle Switch */}
          <div className="flex bg-black/10 p-1 rounded-full mx-auto w-fit">
            <button
              onClick={() => setModeLaporan("bulan")}
              className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${modeLaporan === "bulan" ? "bg-[#8E977D] text-white shadow-md" : "opacity-40"}`}
            >
              Bulan
            </button>
            <button
              onClick={() => setModeLaporan("tahun")}
              className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${modeLaporan === "tahun" ? "bg-[#8E977D] text-white shadow-md" : "opacity-40"}`}
            >
              Tahun
            </button>
          </div>

          {/* Panah Navigasi */}
          <div className="flex justify-between items-center relative z-10 px-2">
            <button
              onClick={() => {
                if (modeLaporan === "bulan") {
                  if (bulanAktif === 0) {
                    setBulanAktif(11);
                    setTahunAktif((prev) => prev - 1);
                  } else {
                    setBulanAktif((prev) => prev - 1);
                  }
                } else {
                  setTahunAktif((prev) => prev - 1);
                }
              }}
              className="w-10 h-10 flex items-center justify-center hover:scale-125 transition active:opacity-50 text-xl"
            >
              ◀
            </button>

            <div className="text-center">
              <span className="font-black text-[12px] tracking-[0.2em] uppercase">
                {modeLaporan === "bulan"
                  ? `${daftarBulan[bulanAktif]} ${tahunAktif}`
                  : `Tahun ${tahunAktif}`}
              </span>
            </div>

            <button
              onClick={() => {
                if (modeLaporan === "bulan") {
                  if (bulanAktif === 11) {
                    setBulanAktif(0);
                    setTahunAktif((prev) => prev + 1);
                  } else {
                    setBulanAktif((prev) => prev + 1);
                  }
                } else {
                  setTahunAktif((prev) => prev + 1);
                }
              }}
              className="w-10 h-10 flex items-center justify-center hover:scale-125 transition active:opacity-50 text-xl"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Card Grafik Utama */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] border-2 border-white shadow-2xl mb-6 text-center">
          <div className="h-64 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataGrafik}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {dataGrafik.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="focus:outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    fontSize: "10px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "9px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    paddingTop: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#8E977D]/10 p-3 rounded-2xl border border-[#8E977D]/10">
              <p className="text-[8px] font-black opacity-50 uppercase">
                Total Masuk
              </p>
              <p className="text-xs font-black text-[#8E977D]">
                Rp {pemasukan.toLocaleString()}
              </p>
            </div>
            <div className="bg-[#D4A373]/10 p-3 rounded-2xl border border-[#D4A373]/10">
              <p className="text-[8px] font-black opacity-50 uppercase">
                Total Keluar
              </p>
              <p className="text-xs font-black text-[#D4A373]">
                Rp {pengeluaran.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportExcel}
              className="bg-[#8A7650] text-[#ECE7D1] py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              Excel 📁
            </button>
            <button
              onClick={exportPDF}
              className="bg-[#8A7650] text-[#ECE7D1] py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              PDF 📄
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] font-black opacity-20 uppercase tracking-[0.5em] mt-12 mb-6">
          Cookies Pocket v1.0 🍪
        </p>
      </div>
    </div>
  );
}
