import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  GraduationCap,
  Clock,
  HelpCircle,
  Lightbulb,
  Check,
  AlertCircle,
  UserCheck,
  Building2,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Sliders,
} from 'lucide-react';
import { CurriculumType, EducationLevel, LessonPlan, SchoolIdentity } from '../types';
import { saveDefaultSchoolIdentity } from '../utils/storage';
import { generatePedagogicalLessonPlan } from '../services/pedagogicalFallback';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (newPlan: LessonPlan) => void;
  defaultSchool: SchoolIdentity;
  onUpdateDefaultSchool?: (school: SchoolIdentity) => void;
}

const LEVEL_CONFIG: Record<
  EducationLevel,
  {
    grades: string[];
    defaultTime: string;
    subjects: string[];
    popularTopics: { subject: string; topic: string; subTopic?: string }[];
  }
> = {
  SD: {
    grades: ['Kelas I (Fase A)', 'Kelas II (Fase A)', 'Kelas III (Fase B)', 'Kelas IV (Fase B)', 'Kelas V (Fase C)', 'Kelas VI (Fase C)'],
    defaultTime: '2 x 35 Menit',
    subjects: ['IPAS', 'Matematika', 'Bahasa Indonesia', 'Pendidikan Pancasila', 'Bahasa Inggris', 'Seni Rupa', 'PJOK', 'Pendidikan Agama Islam'],
    popularTopics: [
      { subject: 'IPAS', topic: 'Ekosistem dan Rantai Makanan', subTopic: 'Peran Produsen dan Konsumen' },
      { subject: 'Matematika', topic: 'Pecahan Senilai', subTopic: 'Membandingkan dan Mengurutkan Pecahan' },
      { subject: 'Bahasa Indonesia', topic: 'Teks Cerita Fiksi', subTopic: 'Menemukan Unsur Intrinsik Cerita' },
      { subject: 'Pendidikan Pancasila', topic: 'Gotong Royong di Lingkungan Sekitarku' },
    ],
  },
  SMP: {
    grades: ['Kelas VII (Fase D)', 'Kelas VIII (Fase D)', 'Kelas IX (Fase D)'],
    defaultTime: '2 x 40 Menit',
    subjects: ['Matematika', 'IPA', 'IPS', 'Bahasa Indonesia', 'Bahasa Inggris', 'Informatika', 'PPKn / Pancasila', 'Seni Budaya', 'PJOK'],
    popularTopics: [
      { subject: 'IPA', topic: 'Sistem Pencernaan Manusia', subTopic: 'Uji Nutrisi Makanan Sehat' },
      { subject: 'Matematika', topic: 'Persamaan Linier Satu Variabel', subTopic: 'Penyelesaian Masalah Kontekstual' },
      { subject: 'Bahasa Inggris', topic: 'Descriptive Text', subTopic: 'Describing Indonesian Historical Tourism' },
      { subject: 'Informatika', topic: 'Berpikir Komputasional', subTopic: 'Dekomposisi dan Algoritma Pencarian' },
    ],
  },
  SMA: {
    grades: ['Kelas X (Fase E)', 'Kelas XI (Fase F)', 'Kelas XII (Fase F)'],
    defaultTime: '2 x 45 Menit',
    subjects: ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Biologi', 'Fisika', 'Kimia', 'Ekonomi', 'Sosiologi', 'Geografi', 'Sejarah', 'Informatika'],
    popularTopics: [
      { subject: 'Biologi', topic: 'Bioteknologi Konvensional dan Modern', subTopic: 'Fermentasi Makanan Tradisional' },
      { subject: 'Fisika', topic: 'Energi Terbarukan dan Dampak Lingkungan', subTopic: 'Panel Surya Sederhana' },
      { subject: 'Ekonomi', topic: 'Literasi Keuangan dan Investasi Generasi Muda', subTopic: 'Pengelolaan Anggaran Mandiri' },
      { subject: 'Bahasa Indonesia', topic: 'Teks Eksplanasi Fenomena Alam dan Sosial' },
    ],
  },
  SMK: {
    grades: ['Kelas X (Fase E Vokasi)', 'Kelas XI (Fase F Kejuruan)', 'Kelas XII (Fase F Industri)'],
    defaultTime: '3 x 45 Menit',
    subjects: ['Dasar Program Keahlian', 'Informatika', 'Matematika Terapan', 'Bahasa Inggris Vokasi', 'Projek Kreatif & Kewirausahaan'],
    popularTopics: [
      { subject: 'Projek Kreatif & Kewirausahaan', topic: 'Perencanaan Usaha dan Prototype Produk' },
      { subject: 'Dasar Program Keahlian', topic: 'Keselamatan dan Kesehatan Kerja (K3LH)' },
    ],
  },
  PAUD: {
    grades: ['Kelompok A (Usia 4-5 Tahun)', 'Kelompok B (Usia 5-6 Tahun)'],
    defaultTime: '1 x 60 Menit',
    subjects: ['Fondasi Literasi & Steam', 'Jati Diri & Karakter', 'Nilai Agama & Budi Pekerti'],
    popularTopics: [
      { subject: 'Fondasi Literasi & Steam', topic: 'Tanaman di Sekitarku', subTopic: 'Menanam Biji Kacang Hijau' },
    ],
  },
};

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerated,
  defaultSchool,
  onUpdateDefaultSchool,
}) => {
  const [curriculum, setCurriculum] = useState<CurriculumType>('merdeka');
  const [level, setLevel] = useState<EducationLevel>('SD');
  const [grade, setGrade] = useState('Kelas IV (Fase B)');
  const [subject, setSubject] = useState('IPAS');
  const [topic, setTopic] = useState('Ekosistem dan Rantai Makanan');
  const [subTopic, setSubTopic] = useState('Peran Produsen dan Konsumen');
  const [timeAllocation, setTimeAllocation] = useState('2 x 35 Menit');
  const [modelPembelajaran, setModelPembelajaran] = useState('Problem Based Learning (PBL)');
  const [specialInstructions, setSpecialInstructions] = useState('Sertakan pembelajaran berdiferensiasi dan aktivitas berbasis kelompok dengan LKPD aplikatif.');

  // Customizable Teacher & School Identity
  const [schoolIdentity, setSchoolIdentity] = useState<SchoolIdentity>(defaultSchool);
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [isIdentityExpanded, setIsIdentityExpanded] = useState(true);
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isHighDemand, setIsHighDemand] = useState(false);

  // Sync state whenever modal opens or defaultSchool updates
  useEffect(() => {
    if (isOpen) {
      setSchoolIdentity(defaultSchool);
    }
  }, [isOpen, defaultSchool]);

  if (!isOpen) return null;

  const currentLevelConfig = LEVEL_CONFIG[level] || LEVEL_CONFIG.SD;

  const handleLevelChange = (newLevel: EducationLevel) => {
    setLevel(newLevel);
    const config = LEVEL_CONFIG[newLevel];
    setGrade(config.grades[0] || '');
    setSubject(config.subjects[0] || '');
    setTimeAllocation(config.defaultTime);
    if (config.popularTopics.length > 0) {
      setTopic(config.popularTopics[0].topic);
      setSubTopic(config.popularTopics[0].subTopic || '');
    }
  };

  const handleApplyTopicPreset = (preset: { subject: string; topic: string; subTopic?: string }) => {
    setSubject(preset.subject);
    setTopic(preset.topic);
    setSubTopic(preset.subTopic || '');
  };

  const executeGenerate = async (forceFallback = false) => {
    if (!topic.trim()) {
      setErrorMessage('Harap masukkan topik atau materi pembelajaran.');
      setIsHighDemand(false);
      return;
    }

    if (!schoolIdentity.teacherName.trim()) {
      setErrorMessage('Harap isi Nama Guru / Penyusun terlebih dahulu.');
      setIsHighDemand(false);
      return;
    }

    if (!schoolIdentity.schoolName.trim()) {
      setErrorMessage('Harap isi Nama Satuan Pendidikan / Sekolah terlebih dahulu.');
      setIsHighDemand(false);
      return;
    }

    setErrorMessage('');
    setIsHighDemand(false);
    setIsLoading(true);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 2200);

    try {
      let finalPlan: LessonPlan | null = null;

      if (!forceFallback) {
        try {
          const response = await fetch('/api/generate-rpp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              curriculum,
              level,
              grade,
              subject,
              topic,
              subTopic,
              timeAllocation,
              modelPembelajaran,
              specialInstructions,
              semester,
              academicYear,
              schoolIdentity,
              forceFallback: false,
            }),
          });

          if (response.ok) {
            const data = await response.json().catch(() => ({}));
            if (data.success && data.lessonPlan) {
              finalPlan = data.lessonPlan;
            }
          } else if (response.status === 404) {
            // Hosting Netlify / static hosting: tidak ada backend Node.js yang aktif di port 3000
            console.warn(
              'Endpoint /api/generate-rpp mengembalikan 404 (lingkungan hosting statis Netlify). Menjalankan perancang perangkat ajar kurikulum langsung di peramban.',
            );
            // Fallback to client-side pedagogical generator
            finalPlan = generatePedagogicalLessonPlan({
              curriculum,
              level,
              grade,
              subject,
              topic,
              subTopic,
              timeAllocation,
              modelPembelajaran,
              specialInstructions,
              semester,
              academicYear,
              schoolIdentity,
            });
          } else {
            const errJson = await response.json().catch(() => ({}));
            const rawErr = errJson.error || `Server error: ${response.status}`;
            throw new Error(rawErr);
          }
        } catch (fetchErr: any) {
          const errMsg = String(fetchErr?.message || fetchErr || '');
          // If Netlify 404 or network fetch error, gracefully handle with browser-based generator
          if (
            errMsg.includes('404') ||
            errMsg.includes('Failed to fetch') ||
            errMsg.includes('NetworkError') ||
            errMsg.includes('Load failed')
          ) {
            console.warn('Backend server tidak merespons, beralih ke penyusun kurikulum lokal.');
            finalPlan = generatePedagogicalLessonPlan({
              curriculum,
              level,
              grade,
              subject,
              topic,
              subTopic,
              timeAllocation,
              modelPembelajaran,
              specialInstructions,
              semester,
              academicYear,
              schoolIdentity,
            });
          } else {
            throw fetchErr;
          }
        }
      } else {
        // Explicit forceFallback requested
        finalPlan = generatePedagogicalLessonPlan({
          curriculum,
          level,
          grade,
          subject,
          topic,
          subTopic,
          timeAllocation,
          modelPembelajaran,
          specialInstructions,
          semester,
          academicYear,
          schoolIdentity,
        });
      }

      clearInterval(stepInterval);

      if (finalPlan) {
        if (saveAsDefault) {
          saveDefaultSchoolIdentity(schoolIdentity);
          onUpdateDefaultSchool?.(schoolIdentity);
        }
        onGenerated(finalPlan);
        onClose();
        return;
      } else {
        throw new Error('Gagal menyusun perangkat ajar. Silakan coba kembali.');
      }
    } catch (err: any) {
      console.error('Error in AI generator:', err);
      const rawMsg = String(err.message || err);
      const isDemandError =
        rawMsg.includes('503') ||
        rawMsg.includes('high demand') ||
        rawMsg.includes('UNAVAILABLE') ||
        rawMsg.includes('antrean') ||
        rawMsg.includes('quota') ||
        rawMsg.includes('rate limit');

      setIsHighDemand(isDemandError);
      if (isDemandError) {
        setErrorMessage(
          'Layanan AI Google saat ini sedang mengalami lonjakan antrean trafik (503 Service High Demand).',
        );
      } else {
        setErrorMessage(
          rawMsg || 'Gagal memproses pembuatan RPP. Periksa koneksi atau coba topik lain.',
        );
      }
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeGenerate(false);
  };

  const loadingStepsText = [
    'Menganalisis capaian kurikulum & taksonomi pembelajaran...',
    'Menyusun rumusan Tujuan Pembelajaran & Profil Pelajar Pancasila...',
    'Merancang alur sintaks kegiatan inti dengan durasi menit presisi...',
    'Menyusun Asesmen, Rubrik Kriteria, dan Lembar Kerja Siswa (LKPD)...',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Pembuat RPP & Modul Ajar Otomatis</h2>
              <p className="text-xs text-blue-100">
                Didukung AI untuk menyusun dokumen pembelajaran siap pakai & berstandar nasional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isLoading ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                <Sparkles className="w-8 h-8 animate-pulse text-indigo-600" />
              </div>
            </div>

            <div className="max-w-md">
              <h3 className="text-base font-bold text-slate-800">
                Sedang Merancang Perangkat Pembelajaran...
              </h3>
              <p className="text-xs text-blue-600 font-medium mt-1">
                {loadingStepsText[Math.min(loadingStep - 1, loadingStepsText.length - 1)] || loadingStepsText[0]}
              </p>
              <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(loadingStep * 25, 95)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Menghasilkan struktur resmi lengkap: Capaian, Profil Pancasila, Sintaks Pembelajaran, Asesmen & LKPD.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {errorMessage && (
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start justify-between gap-3 text-xs ${
                  isHighDemand
                    ? 'bg-amber-50/90 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1">
                  {isHighDemand ? (
                    <Clock className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold text-sm text-slate-800">
                      {isHighDemand
                        ? 'Trafik AI Sedang Penuh (Model High Demand - 503)'
                        : 'Kendala Pembuatan Dokumen'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {isHighDemand
                        ? 'Server AI sedang memproses antrean tinggi. Anda dapat mencoba lagi dalam beberapa detik, atau membuat draf kurikulum standar secara instan.'
                        : errorMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => executeGenerate(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs hover:text-slate-900 transition-colors"
                  >
                    Coba Lagi
                  </button>
                  <button
                    type="button"
                    onClick={() => executeGenerate(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-2xs transition-colors"
                  >
                    Draf Standar Instan
                  </button>
                </div>
              </div>
            )}

            {/* Curriculum Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pilih Format Kurikulum
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCurriculum('merdeka')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    curriculum === 'merdeka'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Kurikulum Merdeka</span>
                    {curriculum === 'merdeka' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Modul Ajar, Capaian Pembelajaran (CP), Profil Pelajar Pancasila, Pemahaman Bermakna & Pertanyaan Pemantik.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCurriculum('k13')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    curriculum === 'k13'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Kurikulum 2013 (K13)</span>
                    {curriculum === 'k13' && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    RPP Format KI-KD, Indikator Pencapaian (IPK), Pendekatan Saintifik (5M), dan Penguatan Karakter (PPK).
                  </p>
                </button>
              </div>
            </div>

            {/* Jenjang & Kelas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jenjang Pendidikan
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['SD', 'SMP', 'SMA', 'SMK', 'PAUD'] as EducationLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleLevelChange(lvl)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        level === lvl
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tingkat Kelas & Fase
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currentLevelConfig.grades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mata Pelajaran & Quick Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mata Pelajaran
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Matematika, IPAS, Bahasa Indonesia..."
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span className="text-[11px] text-slate-400 self-center mr-1">Cepat:</span>
                {currentLevelConfig.subjects.slice(0, 6).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubject(sub)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Topik / Materi Pembelajaran */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Topik / Materi Pembelajaran <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  Pilih rekomendasi di bawah atau ketik bebas
                </span>
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Ekosistem dan Rantai Makanan, Teorema Pythagoras, dll"
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              {/* Sub-topik */}
              <div className="mt-2">
                <input
                  type="text"
                  value={subTopic}
                  onChange={(e) => setSubTopic(e.target.value)}
                  placeholder="Sub-topik (Opsional, misal: Peran Produsen dan Dekomposer)"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Popular Topic Presets */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {currentLevelConfig.popularTopics.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTopicPreset(item)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/50 transition-colors text-left"
                  >
                    <span className="font-semibold">{item.subject}:</span> {item.topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Pembelajaran & Alokasi Waktu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Model Pembelajaran
                </label>
                <select
                  value={modelPembelajaran}
                  onChange={(e) => setModelPembelajaran(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Problem Based Learning (PBL)">Problem Based Learning (PBL)</option>
                  <option value="Project Based Learning (PjBL)">Project Based Learning (PjBL)</option>
                  <option value="Discovery Learning">Discovery Learning</option>
                  <option value="Inquiry Learning Terbimbing">Inquiry Learning Terbimbing</option>
                  <option value="Cooperative Learning (Jigsaw/STAD)">Cooperative Learning</option>
                  <option value="Diferensiasi Konten & Proses">Pembelajaran Berdiferensiasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alokasi Waktu
                </label>
                <input
                  type="text"
                  value={timeAllocation}
                  onChange={(e) => setTimeAllocation(e.target.value)}
                  placeholder="Contoh: 2 x 35 Menit (1 Pertemuan)"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Special Instructions (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <span>Instruksi Khusus / Penyesuaian Guru</span>
                <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={2}
                placeholder="Contoh: Sertakan media kartu bergambar, fokus pada kemampuan bernalar kritis, tambahkan soal studi kasus di LKPD..."
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Informasi Umum & Identitas Penyusun (Bisa Disesuaikan Langsung) */}
            <div className="border border-indigo-200 bg-linear-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      <span>Informasi Umum & Identitas Dokumen</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                        Bisa Disesuaikan
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                      {schoolIdentity.teacherName || 'Nama Guru'} • {schoolIdentity.schoolName || 'Satuan Pendidikan'} • Semester {semester} ({academicYear})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsIdentityExpanded(!isIdentityExpanded)}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shrink-0"
                >
                  {isIdentityExpanded ? (
                    <>
                      <span>Tutup</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Sesuaikan Identitas</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {isIdentityExpanded && (
                <div className="mt-3.5 pt-3.5 border-t border-indigo-100/80 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nama Guru / Penyusun */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Nama Guru / Penyusun & Gelar <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={schoolIdentity.teacherName}
                        onChange={(e) => setSchoolIdentity({ ...schoolIdentity, teacherName: e.target.value })}
                        placeholder="Contoh: Dra. Hj. Nurjanah, M.Pd."
                        className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                        required
                      />
                    </div>

                    {/* NIP / NUPTK Guru */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        NIP / NUPTK Guru <span className="text-slate-400 font-normal">(Isi "-" jika belum ada)</span>
                      </label>
                      <input
                        type="text"
                        value={schoolIdentity.teacherNip}
                        onChange={(e) => setSchoolIdentity({ ...schoolIdentity, teacherNip: e.target.value })}
                        placeholder="Contoh: 19850101 201001 1 001 atau -"
                        className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Satuan Pendidikan */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Nama Satuan Pendidikan / Sekolah <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={schoolIdentity.schoolName}
                        onChange={(e) => setSchoolIdentity({ ...schoolIdentity, schoolName: e.target.value })}
                        placeholder="Contoh: SD Negeri 1 Merdeka"
                        className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                        required
                      />
                    </div>

                    {/* Kota / Kabupaten */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Kota / Kabupaten
                      </label>
                      <input
                        type="text"
                        value={schoolIdentity.city}
                        onChange={(e) => setSchoolIdentity({ ...schoolIdentity, city: e.target.value })}
                        placeholder="Contoh: Bandung, Surabaya, Jakarta Pusat"
                        className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Semester */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Semester
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                        className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                      >
                        <option value="Ganjil">Semester 1 (Ganjil)</option>
                        <option value="Genap">Semester 2 (Genap)</option>
                      </select>
                    </div>

                    {/* Tahun Pelajaran */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Tahun Pelajaran
                      </label>
                      <input
                        type="text"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        placeholder="Contoh: 2025/2026"
                        className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>

                    {/* Tempat & Tanggal Pengesahan */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Tempat & Tanggal Pengesahan
                      </label>
                      <input
                        type="text"
                        value={schoolIdentity.signatureDatePlace}
                        onChange={(e) => setSchoolIdentity({ ...schoolIdentity, signatureDatePlace: e.target.value })}
                        placeholder="Contoh: Bandung, 20 Juli 2025"
                        className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Kepala Sekolah */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Nama Kepala Sekolah & Gelar
                      </label>
                      <input
                        type="text"
                        value={schoolIdentity.principalName}
                        onChange={(e) => setSchoolIdentity({ ...schoolIdentity, principalName: e.target.value })}
                        placeholder="Contoh: Drs. H. Suryanto, M.M."
                        className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        NIP Kepala Sekolah
                      </label>
                      <input
                        type="text"
                        value={schoolIdentity.principalNip}
                        onChange={(e) => setSchoolIdentity({ ...schoolIdentity, principalNip: e.target.value })}
                        placeholder="Contoh: 19720315 199802 1 003 atau -"
                        className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Save as default preference */}
                  <div className="pt-2 flex items-center justify-between border-t border-indigo-100/60">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        Simpan identitas ini sebagai profil default untuk pembuatan RPP selanjutnya
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => executeGenerate(true)}
                  title="Susun perangkat ajar instan mengikuti standar kurikulum nasional tanpa menunggu antrean AI"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Draf Standar Instan</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm shadow-blue-500/30 transition-all hover:shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Buat dengan AI</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
