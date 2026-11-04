/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  RotateCcw,
  LogOut,
  ArrowRight,
  Sparkles,
  History,
  Check,
  Undo2,
  Sheet,
  Info,
  X,
  Send,
  AlertTriangle,
  MapPin
} from 'lucide-react';

// Aset Lokal 7 Pilar (Rasio 16:9, Kualitas Realistis & Bebas Link Rusak)
import pilar01Img from '/images/pilar_01_bangun_pagi.jpg';
import pilar02Img from '/images/pilar_02_beribadah.jpg';
import pilar03Img from '/images/pilar_03_berolahraga.jpg';
import pilar04Img from '/images/pilar_04_makan_sehat.jpg';
import pilar05Img from '/images/pilar_05_gemar_belajar.jpg';
import pilar06Img from '/images/pilar_06_bermasyarakat.jpg';
import pilar07Img from '/images/pilar_07_tidur_cepat.jpg';

// Endpoint Resmi Google Apps Script Web App SMANKAIH
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwK_ev2yzIhyXp4hO36aa-DEe2lOX7fDwZxHExEfYLM-t6d2dIkMJqTlxu5hHGkWzOQvw/exec';

// Zona Waktu Resmi Sekolah di Wamena, Papua Pegunungan (WIT, UTC+9)
const OFFICIAL_TIMEZONE = 'Asia/Jayapura';

interface HabitItem {
  id: number;
  number: string;
  questionNumber: string;
  title: string;
  subtitle: string;
  description: string;
  principle: string;
  points: number;
  icon: string;
  tag: string;
  imageUrl: string;
}

interface CompletedRecord {
  habitId: number;
  completedAt: string;
  timestamp: number;
}

const HABITS_SMA: HabitItem[] = [
  {
    id: 1,
    number: '01',
    questionNumber: 'Pertanyaan 1',
    title: 'Bangun Pagi',
    subtitle: 'Optimalisasi Ritme Sirkadian & Disiplin Diri',
    description: 'Bangun lebih awal sebelum fajar di kamar yang rapi, menyambut sinar matahari pagi dengan penuh kesegaran kognitif dan kesiapan mental untuk memulai hari.',
    principle: 'Disiplin bangun pagi adalah fondasi karakter pemenang dan ketajaman fokus akademis sepanjang hari.',
    points: 1,
    icon: '☀️',
    tag: 'Disiplin Waktu',
    imageUrl: pilar01Img
  },
  {
    id: 2,
    number: '02',
    questionNumber: 'Pertanyaan 2',
    title: 'Beribadah',
    subtitle: 'Nilai Ketuhanan Universal & Kerukunan Beragama',
    description: 'Menunaikan kewajiban ibadah dan doa sesuai keyakinan masing-masing (Islam, Kristen Protestan, Katolik, Hindu, Buddha, Konghucu) dengan menjunjung tinggi toleransi, ketenangan batin, dan budi pekerti luhur.',
    principle: 'Sila Pertama Pancasila: Ketakwaan pada Tuhan Yang Maha Esa dan saling menghormati antarsesama dalam keharmonisan bangsa.',
    points: 1,
    icon: '🤲',
    tag: 'Karakter & Iman',
    imageUrl: pilar02Img
  },
  {
    id: 3,
    number: '03',
    questionNumber: 'Pertanyaan 3',
    title: 'Berolahraga',
    subtitle: 'Ketahanan Fisik, Stamina & Kerja Sama Tim',
    description: 'Melakukan gerak aktif, olahraga lari, sepak bola, atau latihan kebugaran di lingkungan sekolah untuk menjaga stamina prima dan memperlancar sirkulasi darah ke otak.',
    principle: 'Mens sana in corpore sano: pikiran produktif dan emosi stabil bertumpu pada tubuh yang bugar.',
    points: 1,
    icon: '🏃‍♂️',
    tag: 'Kesehatan Fisik',
    imageUrl: pilar03Img
  },
  {
    id: 4,
    number: '04',
    questionNumber: 'Pertanyaan 4',
    title: 'Makan Sehat dan Bergizi',
    subtitle: 'Nutrisi Berimbang untuk Efisiensi Kognitif Otak',
    description: 'Mengonsumsi makanan bergizi seimbang khas Indonesia: nasi, sayuran segar, lauk berprotein (ayam, ikan, tempe, tahu), buah-buahan segar, dan mencukupi asupan air putih.',
    principle: 'Makanan sehat dan bergizi adalah bahan bakar terbaik bagi metabolisme dan konsentrasi belajar optimal.',
    points: 1,
    icon: '🥗',
    tag: 'Manajemen Energi',
    imageUrl: pilar04Img
  },
  {
    id: 5,
    number: '05',
    questionNumber: 'Pertanyaan 5',
    title: 'Gemar Belajar',
    subtitle: 'Literasi Kritis, Rasa Ingin Tahu & Diskusi Ilmiah',
    description: 'Membaca buku literatur, aktif berdiskusi di perpustakaan sekolah, mengeksplorasi wawasan baru, dan mengerjakan tugas dengan tekun demi meraih cita-cita masa depan.',
    principle: 'Rasa ingin tahu dan budaya literasi membuka jendela wawasan global serta daya nalar berpikir kritis.',
    points: 1,
    icon: '📖',
    tag: 'Intelektualitas',
    imageUrl: pilar05Img
  },
  {
    id: 6,
    number: '06',
    questionNumber: 'Pertanyaan 6',
    title: 'Bermasyarakat',
    subtitle: 'Gotong Royong, Kepedulian Sosial & Persahabatan',
    description: 'Aktif bergotong royong membersihkan lingkungan sekolah, saling membantu rekan yang kesulitan, dan berkontribusi positif dalam kegiatan sosial kemasyarakatan.',
    principle: 'Kepemimpinan sejati dibentuk dari kerendahan hati melayani sesama dan memupuk semangat kebersamaan.',
    points: 1,
    icon: '🤝',
    tag: 'Kepemimpinan Sosial',
    imageUrl: pilar06Img
  },
  {
    id: 7,
    number: '07',
    questionNumber: 'Pertanyaan 7',
    title: 'Tidur Cepat',
    subtitle: 'Regenerasi Mental, Sel Tubuh & Istirahat Cukup',
    description: 'Mempersiapkan diri untuk tidur tepat waktu di kamar yang tenang dan nyaman, mengistirahatkan gawai sebelum tidur demi pemulihan sel dan ketahanan fisik esok hari.',
    principle: 'Tidur cukup dan berkualitas menjaga ketajaman memori, stabilitas emosional, dan vitalitas masa muda.',
    points: 1,
    icon: '🌙',
    tag: 'Pemulihan & Siklus',
    imageUrl: pilar07Img
  }
];

// Helper Waktu Asia/Jayapura (WIT - Wamena, Papua)
export function getJayapuraParts(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: OFFICIAL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);

  const getVal = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return {
    day: getVal('day'),
    month: getVal('month'),
    year: getVal('year'),
    hour: getVal('hour'),
    minute: getVal('minute'),
    second: getVal('second')
  };
}

// Format 24 Jam Resmi Google Sheets: "dd/MM/yyyy HH:mm:ss"
export function formatJayapuraTime24(date: Date = new Date()): string {
  const p = getJayapuraParts(date);
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}:${p.second}`;
}

export function getJayapuraClockString(date: Date = new Date()): string {
  const p = getJayapuraParts(date);
  return `${p.hour}:${p.minute}:${p.second}`;
}

export function getJayapuraIndonesianDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: OFFICIAL_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export default function App() {
  const [stage, setStage] = useState<'login' | 'dashboard'>('login');
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [showSheetsModal, setShowSheetsModal] = useState<boolean>(false);
  
  // Data Asli Siswa (Dimulai Kosong Tanpa Teks Dummy)
  const [fullName, setFullName] = useState<string>('');
  const [grade, setGrade] = useState<string>(''); // Bebas diketik: X-9, X-10, XI-2, XII-1
  const [userId, setUserId] = useState<string>('');
  
  const [completedRecords, setCompletedRecords] = useState<CompletedRecord[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [syncFeedback, setSyncFeedback] = useState<string>('');

  // Inisialisasi Sesi dari LocalStorage
  useEffect(() => {
    try {
      let storedId = localStorage.getItem('7kaih_user_id');
      if (!storedId) {
        storedId = 'SISWA-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        localStorage.setItem('7kaih_user_id', storedId);
      }
      setUserId(storedId);

      const savedName = localStorage.getItem('7kaih_user_name');
      const savedGrade = localStorage.getItem('7kaih_user_grade');
      const savedRecords = localStorage.getItem('7kaih_records');
      const savedDate = localStorage.getItem('7kaih_date');
      
      const p = getJayapuraParts(new Date());
      const todayJayapuraStr = `${p.year}-${p.month}-${p.day}`;

      if (savedName && savedName.trim().length > 0) {
        setFullName(savedName.trim());
        if (savedGrade) setGrade(savedGrade.trim());

        if (savedDate === todayJayapuraStr && savedRecords) {
          try {
            setCompletedRecords(JSON.parse(savedRecords));
          } catch {
            setCompletedRecords([]);
          }
        } else {
          setCompletedRecords([]);
          localStorage.setItem('7kaih_date', todayJayapuraStr);
        }
        setStage('dashboard');
      }
    } catch (e) {
      console.error('Inisialisasi sesi error:', e);
    }
  }, []);

  // Jam digital live per detik (zona waktu Asia/Jayapura WIT)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Helper pengiriman data ke Google Apps Script Web App (Struktur 13 Kolom)
  const sendTo13ColumnsSheets = async (params: {
    studentName: string;
    studentGrade: string;
    activityPoint: number;
    newCompletedRecords: CompletedRecord[];
    habitId?: number;
    actionType: string;
  }) => {
    const { studentName, studentGrade, activityPoint, newCompletedRecords, habitId, actionType } = params;

    if (!studentName || !studentGrade) {
      triggerToast('Peringatan: Nama atau kelas siswa belum terisi lengkap.', 'warning');
      return false;
    }

    setSyncStatus('syncing');
    setSyncFeedback('Mengirim data ke Google Sheets...');

    const timestamp24 = formatJayapuraTime24();
    const completedIds = newCompletedRecords.map((r) => r.habitId);
    const totalPoin = newCompletedRecords.length;
    const statusDikerjakan = totalPoin > 0 ? 'Dikerjakan' : 'Belum dikerjakan';

    // Format 13 Kolom
    const payload = {
      waktu: timestamp24,
      clientTime: timestamp24,
      namaSiswa: studentName,
      name: studentName,
      nama: studentName,
      kelas: studentGrade,
      grade: studentGrade,
      poin: activityPoint,
      activityPoint: activityPoint,
      dikerjakan: statusDikerjakan,
      statusPengerjaan: statusDikerjakan,
      totalPoin: totalPoin,
      totalPoints: totalPoin,
      p1: completedIds.includes(1) ? '✓' : '',
      p2: completedIds.includes(2) ? '✓' : '',
      p3: completedIds.includes(3) ? '✓' : '',
      p4: completedIds.includes(4) ? '✓' : '',
      p5: completedIds.includes(5) ? '✓' : '',
      p6: completedIds.includes(6) ? '✓' : '',
      p7: completedIds.includes(7) ? '✓' : '',
      completedIds: completedIds,
      habitId: habitId,
      action: actionType,
      userId: userId
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      setSyncStatus('synced');
      setLastSyncTime(timestamp24);
      setSyncFeedback(`Data terkirim (${timestamp24} WIT)`);
      return true;
    } catch (err) {
      console.warn('Google Sheets warning:', err);
      setSyncStatus('error');
      setSyncFeedback('Gagal mengirim data. Periksa jaringan internet.');
      return false;
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanGrade = grade.trim();

    if (!cleanName || !cleanGrade) {
      triggerToast('Nama Lengkap dan Jenjang / Kelas wajib diisi sebelum masuk.', 'warning');
      return;
    }

    const p = getJayapuraParts(new Date());
    const todayJayapuraStr = `${p.year}-${p.month}-${p.day}`;

    try {
      localStorage.setItem('7kaih_user_name', cleanName);
      localStorage.setItem('7kaih_user_grade', cleanGrade);
      localStorage.setItem('7kaih_date', todayJayapuraStr);
    } catch (err) {
      console.error(err);
    }

    setStage('dashboard');
    setShowWelcomeModal(true);
    triggerToast(`Selamat datang, ${cleanName} (${cleanGrade})!`, 'success');

    // Catat sesi login siswa ke Google Sheets
    sendTo13ColumnsSheets({
      studentName: cleanName,
      studentGrade: cleanGrade,
      activityPoint: 0,
      newCompletedRecords: completedRecords,
      actionType: 'LOGIN'
    });
  };

  // Tandai selesai kebiasaan: tepat 1 poin & centang "✓" pada kolom Pertanyaan
  const completeHabit = (id: number) => {
    const cleanName = fullName.trim();
    const cleanGrade = grade.trim();

    if (!cleanName || !cleanGrade) {
      triggerToast('Identitas siswa belum lengkap. Silakan login kembali.', 'warning');
      setStage('login');
      return;
    }

    // Cegah penambahan poin ganda jika tombol ditekan berulang kali pada aktivitas yang sama
    const alreadyDone = completedRecords.find((r) => r.habitId === id);
    if (alreadyDone) return;

    const timeWIT = getJayapuraClockString();
    const newRecord: CompletedRecord = {
      habitId: id,
      completedAt: `${timeWIT} WIT`,
      timestamp: Date.now()
    };

    const next = [...completedRecords, newRecord];
    setCompletedRecords(next);
    try {
      localStorage.setItem('7kaih_records', JSON.stringify(next));
    } catch (err) {
      console.error(err);
    }

    const habitData = HABITS_SMA.find((h) => h.id === id);
    triggerToast(`+1 Poin: ${habitData?.questionNumber} (${habitData?.title}) selesai!`, 'success');

    // Kirim pembaruan 13 Kolom ke Google Sheets (Poin: 1, Total Poin: next.length, Centang ✓)
    sendTo13ColumnsSheets({
      studentName: cleanName,
      studentGrade: cleanGrade,
      activityPoint: 1,
      newCompletedRecords: next,
      habitId: id,
      actionType: 'ACTIVITY'
    });
  };

  const undoHabit = (id: number) => {
    const cleanName = fullName.trim();
    const cleanGrade = grade.trim();

    if (!cleanName || !cleanGrade) {
      triggerToast('Identitas siswa belum lengkap. Silakan login kembali.', 'warning');
      setStage('login');
      return;
    }

    const next = completedRecords.filter((r) => r.habitId !== id);
    setCompletedRecords(next);
    try {
      localStorage.setItem('7kaih_records', JSON.stringify(next));
    } catch (err) {
      console.error(err);
    }
    triggerToast('Pilar kebiasaan dibatalkan (-1 Poin).', 'info');

    // Kirim Pembatalan (-1 Poin, centang dicabut)
    sendTo13ColumnsSheets({
      studentName: cleanName,
      studentGrade: cleanGrade,
      activityPoint: -1,
      newCompletedRecords: next,
      habitId: id,
      actionType: 'HABIT_UNDO'
    });
  };

  // Header Button 1: Open Motivation Modal
  const handleOpenMotivation = () => {
    setShowWelcomeModal(true);
  };

  // Header Button 2: Reset Checklist Hari Ini
  const handleResetChecklist = () => {
    const cleanName = fullName.trim();
    const cleanGrade = grade.trim();

    setCompletedRecords([]);
    try {
      localStorage.removeItem('7kaih_records');
    } catch (err) {
      console.error(err);
    }
    triggerToast('Seluruh progres dan skor hari ini telah diatur ulang ke 0.', 'info');

    if (cleanName && cleanGrade) {
      sendTo13ColumnsSheets({
        studentName: cleanName,
        studentGrade: cleanGrade,
        activityPoint: 0,
        newCompletedRecords: [],
        actionType: 'RESET'
      });
    }
  };

  // Header Button 3: Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('7kaih_user_name');
      localStorage.removeItem('7kaih_user_grade');
      localStorage.removeItem('7kaih_records');
      localStorage.removeItem('7kaih_date');
      localStorage.clear();
    } catch (err) {
      console.error(err);
    }
    setCompletedRecords([]);
    setFullName('');
    setGrade('');
    setShowWelcomeModal(false);
    setStage('login');
    triggerToast('Sesi telah direset. Berhasil kembali ke menu login.', 'info');
  };

  // Uji Transmisi Data Koneksi (Menggunakan Nama & Kelas Asli Siswa yang Sedang Aktif)
  const handleTestConnection = async () => {
    const cleanName = fullName.trim();
    const cleanGrade = grade.trim();

    if (!cleanName || !cleanGrade) {
      triggerToast('Mohon masukkan nama dan kelas terlebih dahulu pada formulir login.', 'warning');
      return;
    }

    triggerToast(`Menguji transmisi untuk: ${cleanName} (${cleanGrade})...`, 'info');

    const success = await sendTo13ColumnsSheets({
      studentName: cleanName,
      studentGrade: cleanGrade,
      activityPoint: 0,
      newCompletedRecords: completedRecords,
      actionType: 'PING_TEST'
    });

    if (success) {
      triggerToast(`✓ Uji transmisi untuk "${cleanName}" berhasil terkirim ke Google Sheets!`, 'success');
    }
  };

  // 1 poin per kebiasaan -> Total 7 poin maksimal
  const totalPoints = completedRecords.length;
  const maxPoints = 7;
  const progressPercent = Math.round((completedRecords.length / 7) * 100);

  const isFormValid = fullName.trim().length > 0 && grade.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
          toastType === 'warning'
            ? 'bg-amber-900 border-amber-700 text-amber-100'
            : toastType === 'info'
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-slate-900 border-slate-700 text-white'
        }`}>
          {toastType === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================= */}
      {/* 1. MENU LOGIN SMAN7KAIH */}
      {/* ======================================================= */}
      {stage === 'login' && (
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 max-w-xl mx-auto w-full">
          <div className="w-full text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-50 border border-indigo-200/80 rounded-full text-xs font-semibold text-indigo-700 mb-4">
              <span>🇮🇩</span>
              <span>Platform Pembentukan Karakter Siswa SMA</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              SMAN<span className="text-indigo-600">7KAIH</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider mt-1">
              7 Kebiasaan Anak Indonesia Hebat • Edisi SMA
            </p>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
              Membangun karakter pemuda unggul berintegritas melalui kedisiplinan diri, kerukunan spiritual, literasi kritis, dan gaya hidup sehat.
            </p>
          </div>

          <div className="w-full bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-slate-900">Masuk ke Sesi Produktivitas</h2>
              <p className="text-xs text-slate-500 mt-0.5">Lengkapi identitas diri Anda untuk memulai pencatatan harian</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Field 1: Nama Lengkap (Input Bersih) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap siswa..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-900 font-medium text-sm transition-all"
                />
              </div>

              {/* Field 2: JENJANG / KELAS (Input Teks Bebas) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  JENJANG / KELAS
                </label>
                <input
                  type="text"
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Contoh: X-9, X-10, XI-2, XII-1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-900 font-medium text-sm transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Ketik nama kelas Anda secara bebas, contoh: X-9, X-10, XI-1, XII-1.
                </p>
              </div>

              {/* Indikator Zona Waktu & Google Sheets 13 Kolom */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Zona Waktu Resmi:</span>
                  </span>
                  <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-bold">
                    Asia/Jayapura (WIT)
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-500 text-[11px] pt-1 border-t border-slate-200/70">
                  <Sheet className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Tersambung ke Google Sheets (Waktu, Nama, Kelas, Poin, dikerjakan/tidak, Total Poin, Pertanyaan 1 s.d. 7).</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isFormValid
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Time & Creator Credit at Bottom of Login Card */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-bold text-slate-700">{getJayapuraClockString(currentTime)} WIT</span>
                <span className="text-slate-300">•</span>
                <span className="font-sans text-slate-500">{getJayapuraIndonesianDate(currentTime)}</span>
              </span>
              <span className="text-slate-600 font-semibold font-sans">
                Developed by <span className="text-slate-800 font-bold uppercase">ESRON PASARIBU</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 2. POP-UP MOTIVASI AWAL SETELAH LOGIN (MODAL) */}
      {/* ======================================================= */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6" />
            </div>

            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
              Komitmen Karakter Pemuda
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-4">
              Halo, <span className="text-indigo-600">{fullName || 'Siswa'}</span>.
            </h2>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 mb-6 text-slate-700 text-sm leading-relaxed">
              <p className="italic font-serif text-slate-800">
                “Halo, {fullName || 'Siswa'}. Disiplin hari ini adalah investasi masa depanmu. Konsistensi dalam 7 kebiasaan hebat akan membentuk karakter pemimpin masa depan.”
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-sans">
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  Kelas: {grade || '-'}
                </span>
                <span className="font-mono text-slate-600">
                  {getJayapuraClockString(currentTime)} WIT
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowWelcomeModal(false)}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>Mulai Sesi Hari Ini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL STATUS & INTEGRASI GOOGLE SHEETS (13 KOLOM) */}
      {/* ======================================================= */}
      {showSheetsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Sheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Integrasi Google Sheets SMANKAIH</h3>
                  <p className="text-xs text-slate-500">Struktur resmi 13 kolom & waktu 24 jam WIT</p>
                </div>
              </div>
              <button
                onClick={() => setShowSheetsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                  Struktur 13 Kolom Spreadsheet:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] font-mono text-slate-700">
                  <span className="bg-white px-2 py-1 rounded border">1. Waktu</span>
                  <span className="bg-white px-2 py-1 rounded border">2. Nama Siswa</span>
                  <span className="bg-white px-2 py-1 rounded border">3. Kelas</span>
                  <span className="bg-white px-2 py-1 rounded border">4. Poin</span>
                  <span className="bg-white px-2 py-1 rounded border">5. dikerjakan/tidak</span>
                  <span className="bg-white px-2 py-1 rounded border">6. Total Poin</span>
                  <span className="bg-white px-2 py-1 rounded border text-indigo-700">7. Pertanyaan 1</span>
                  <span className="bg-white px-2 py-1 rounded border text-indigo-700">8. Pertanyaan 2</span>
                  <span className="bg-white px-2 py-1 rounded border text-indigo-700">9. Pertanyaan 3</span>
                  <span className="bg-white px-2 py-1 rounded border text-indigo-700">10. Pertanyaan 4</span>
                  <span className="bg-white px-2 py-1 rounded border text-indigo-700">11. Pertanyaan 5</span>
                  <span className="bg-white px-2 py-1 rounded border text-indigo-700">12. Pertanyaan 6</span>
                  <span className="bg-white px-2 py-1 rounded border text-indigo-700 col-span-2 sm:col-span-1">13. Pertanyaan 7</span>
                </div>
              </div>

              {/* Status Transmisi Terkini */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-900 block">Status Transmisi:</span>
                <div className="text-emerald-800 font-mono text-[11px]">
                  {syncFeedback || 'Siap mengirim pembaruan data'}
                </div>
                {lastSyncTime && (
                  <div className="text-[10px] text-emerald-700">
                    Waktu terakhir transmisi: <span className="font-mono font-bold">{lastSyncTime} WIT</span>
                  </div>
                )}
              </div>

              {/* Data Identitas Aktif Siswa */}
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900">Siswa Aktif:</span>
                  <span className="font-semibold text-indigo-800">{fullName || '-'} ({grade || '-'})</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] text-indigo-700">
                  <span>Status Aktivitas:</span>
                  <span className="font-bold">{totalPoints > 0 ? 'Dikerjakan' : 'Belum dikerjakan'} ({totalPoints}/7 Poin)</span>
                </div>
              </div>

              {/* Tombol Pengujian Koneksi Profil Siswa Aktif */}
              <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Uji Koneksi Data Siswa:</span>
                  <span className="text-[11px] text-slate-500">Kirim data verifikasi sesuai nama dan kelas yang sedang aktif</span>
                </div>
                <button
                  onClick={handleTestConnection}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Data Uji</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                *Format Waktu Google Sheets: <strong>dd/MM/yyyy HH:mm:ss</strong> (24 jam, zona waktu Asia/Jayapura).
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSheetsModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 3. HALAMAN UTAMA DASHBOARD SMAN7KAIH */}
      {/* ======================================================= */}
      {stage === 'dashboard' && (
        <div className="flex-1 flex flex-col">
          {/* Header Bar */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
              {/* Sapaan Personal Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
                  7K
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 tracking-tight">SMAN7KAIH</span>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium border border-indigo-200">
                      Edisi SMA
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Halo, <span className="font-bold text-slate-900">{fullName}</span> — <span className="text-indigo-600 font-semibold">{grade}</span>
                  </p>
                </div>
              </div>

              {/* WIDGET JAM & TANGGAL LIVE (Asia/Jayapura - Wamena, Papua / WIT) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
                <Clock className="w-4 h-4 text-indigo-600" />
                <div className="text-left font-mono">
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {getJayapuraClockString(currentTime)}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 ml-1">WIT</span>
                </div>
                <div className="h-4 w-px bg-slate-300" />
                <div className="text-xs font-medium text-slate-600 flex items-center gap-1.5 font-sans">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{getJayapuraIndonesianDate(currentTime)}</span>
                </div>
              </div>

              {/* Header Actions: Status Sinkronisasi, Motivasi, Reset, Logout */}
              <div className="flex items-center gap-2">
                {/* Badge Google Sheets Status */}
                <button
                  onClick={() => setShowSheetsModal(true)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 cursor-pointer transition-colors ${
                    syncStatus === 'syncing'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : syncStatus === 'synced'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                  title="Lihat status sinkronisasi Google Sheets"
                >
                  <Sheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Sheets</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </button>

                {/* Total Poin Badge */}
                <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 rounded-xl">
                  <span className="text-xs font-bold text-indigo-700 uppercase">Poin:</span>
                  <span className="text-sm font-extrabold text-indigo-900 font-mono tabular-nums">
                    {totalPoints} / {maxPoints}
                  </span>
                </div>

                {/* 1. Tombol Motivasi */}
                <button
                  id="btn-header-motivasi"
                  onClick={handleOpenMotivation}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-200 cursor-pointer transition-colors flex items-center gap-1.5 active:scale-95"
                  title="Tampilkan Kembali Pop-up Motivasi"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Motivasi</span>
                </button>

                {/* 2. Tombol Reset Checklist */}
                <button
                  id="btn-header-reset"
                  onClick={handleResetChecklist}
                  className="px-3 py-2 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 cursor-pointer transition-colors active:scale-95 flex items-center gap-1.5"
                  title="Reset Checklist Hari Ini (Kembali ke 0 Poin)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reset</span>
                </button>

                {/* 3. Tombol Logout */}
                <button
                  id="btn-header-logout"
                  onClick={handleLogout}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Keluar / Ganti Akun (Hapus Data Sesi & Kembali ke Login)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Dashboard Body */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
            {/* Metric Strip */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Skor Produktivitas: 1 Poin per Tugas */}
              <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Total Skor Produktivitas
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                      {totalPoints}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">/ {maxPoints} Poin</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">Status Pengerjaan:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md border font-mono ${
                    totalPoints > 0
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-slate-500 bg-slate-100 border-slate-200'
                  }`}>
                    {totalPoints > 0 ? 'Dikerjakan' : 'Belum dikerjakan'}
                  </span>
                </div>
              </div>

              {/* Tingkat Ketercapaian */}
              <div className="md:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Target Harian Siswa ({grade || 'SMA'})
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        completedRecords.length === 7
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : completedRecords.length >= 4
                          ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                          : 'text-slate-600 bg-slate-100 border-slate-200'
                      }`}
                    >
                      {completedRecords.length === 7
                        ? 'Sempurna (100%)'
                        : `${completedRecords.length} / ${maxPoints} Selesai`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        completedRecords.length === 7
                          ? 'bg-emerald-500'
                          : completedRecords.length >= 4
                          ? 'bg-indigo-600'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {completedRecords.length === 7
                      ? 'Luar biasa! Seluruh 7 Pertanyaan / Pilar Tuntas Hari Ini.'
                      : completedRecords.length >= 4
                      ? 'Progres konsisten! Lanjutkan pilar berikutnya.'
                      : 'Konsistensi membentuk karakter dan masa depan gemilang.'}
                  </span>
                  <span className="font-mono font-bold text-slate-700 tabular-nums">
                    {progressPercent}%
                  </span>
                </div>
              </div>
            </section>

            {/* Grid 7 Kebiasaan & Activity Log */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* 7 Pilar Cards */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      7 Pilar Karakter SMAN7KAIH (Pertanyaan 1 - 7)
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Selesaikan dan dapatkan 1 poin per kebiasaan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {HABITS_SMA.map((habit) => {
                    const record = completedRecords.find((r) => r.habitId === habit.id);
                    const isDone = !!record;

                    return (
                      <div
                        key={habit.id}
                        className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                          isDone
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-1 ring-slate-800'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        {/* Gambar Ilustrasi Relevan & Estetik (16:9 Banner) */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                          <img
                            src={habit.imageUrl}
                            alt={habit.title}
                            className={`w-full h-full object-cover transition-transform duration-300 ${
                              isDone ? 'brightness-75' : 'hover:scale-105'
                            }`}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/25" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 bg-black/60 text-white backdrop-blur-md rounded-md border border-white/20">
                              {habit.questionNumber}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 bg-white/90 text-slate-800 backdrop-blur-md rounded-md shadow-xs">
                              {habit.tag}
                            </span>
                          </div>

                          {/* Title Overlay */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 text-white">
                            <span className="text-2xl drop-shadow-md">{habit.icon}</span>
                            <div>
                              <h3 className="text-base font-bold leading-tight drop-shadow-md text-white">
                                {habit.title}
                              </h3>
                              <p className="text-xs text-slate-200 font-medium line-clamp-1 drop-shadow-sm">
                                {habit.subtitle}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <p
                              className={`text-xs leading-relaxed mb-3 ${
                                isDone ? 'text-slate-300' : 'text-slate-600'
                              }`}
                            >
                              {habit.description}
                            </p>

                            <div
                              className={`rounded-xl p-2.5 text-xs mb-4 border ${
                                isDone
                                  ? 'bg-slate-800/80 border-slate-700/80 text-slate-300'
                                  : 'bg-slate-50 border-slate-100 text-slate-500'
                              }`}
                            >
                              <span className="font-semibold text-slate-400 block mb-0.5">
                                Nilai Karakter:
                              </span>
                              {habit.principle}
                            </div>
                          </div>

                          {/* Action Area & History Timestamp */}
                          <div className="pt-3 border-t border-slate-200/40">
                            {isDone ? (
                              <div className="space-y-2">
                                {/* Catatan Jam Penyelesaian Real-Time (Wamena WIT) */}
                                <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-300 font-mono">
                                  <span className="font-sans font-semibold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" />
                                    Tuntas (Tercatat ✓ di Sheet)
                                  </span>
                                  <span>{record.completedAt}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    disabled
                                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold cursor-not-allowed border border-slate-700"
                                  >
                                    1 Poin Didapat
                                  </button>
                                  <button
                                    onClick={() => undoHabit(habit.id)}
                                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                                    title="Batalkan tugas ini"
                                  >
                                    <Undo2 className="w-3.5 h-3.5" />
                                    <span>Batal</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => completeHabit(habit.id)}
                                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                              >
                                <span>Tandai Selesai</span>
                                <span className="text-indigo-200 font-mono">(+1 Poin)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar: Activity Log Panel */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-24">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Riwayat Aktivitas Hari Ini
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {completedRecords.length}/{maxPoints} Pilar
                  </span>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {completedRecords.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Clock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-600">Belum ada aktivitas tercatat</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Selesaikan salah satu dari 7 kebiasaan di samping untuk mencatat waktu penyelesaian.
                      </p>
                    </div>
                  ) : (
                    completedRecords.map((rec) => {
                      const habit = HABITS_SMA.find((h) => h.id === rec.habitId);
                      if (!habit) return null;

                      return (
                        <div
                          key={rec.habitId}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="text-xl mt-0.5">{habit.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight">
                                {habit.title}
                              </p>
                              <span className="text-xs text-slate-500 block mt-0.5">
                                {habit.questionNumber} • {habit.tag}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-emerald-600 block font-mono">
                              +1 Poin
                            </span>
                            <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                              {rec.completedAt}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sinkron Google Sheets</span>
                    </span>
                    <span className="font-mono text-emerald-600 font-bold">
                      {lastSyncTime ? 'Terkirim' : 'Otomatis'}
                    </span>
                  </div>
                  {lastSyncTime && (
                    <span className="text-[10px] text-slate-400 font-mono truncate">
                      {lastSyncTime} WIT
                    </span>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* ======================================================= */}
          {/* 4. CREDIT FOOTER HALAMAN UTAMA */}
          {/* ======================================================= */}
          <footer className="bg-white border-t border-slate-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span className="font-semibold text-slate-700">SMAN7KAIH</span>
                <span>•</span>
                <span>7 Kebiasaan Anak Indonesia Hebat (Edisi SMA)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSheetsModal(true)}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sheet className="w-3.5 h-3.5" />
                  <span>Info Spreadsheet & Uji</span>
                </button>
                <span>•</span>
                <div className="font-medium text-slate-700 tracking-wide">
                  Developed by <span className="font-bold text-slate-900 uppercase">ESRON PASARIBU</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
