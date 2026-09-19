import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Plus,
  BookOpen,
  FileCheck,
  Download,
  School,
  GraduationCap,
  Layers,
  Calendar,
  AlertCircle,
  FileText,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { LessonPlan, SchoolIdentity, CurriculumType, EducationLevel } from './types';
import {
  loadSavedRPPs,
  saveRPPs,
  loadDefaultSchoolIdentity,
  saveDefaultSchoolIdentity,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { RPPCard } from './components/RPPCard';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { RPPEditor } from './components/RPPEditor';
import { RPPPreviewModal } from './components/RPPPreviewModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { exportLessonPlanToDocx, downloadBlob } from './services/docxExport';

export default function App() {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [defaultSchool, setDefaultSchool] = useState<SchoolIdentity>(loadDefaultSchoolIdentity());

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [curriculumFilter, setCurriculumFilter] = useState<'all' | 'merdeka' | 'k13'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | EducationLevel>('all');

  // Modals state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSchoolSettingsOpen, setIsSchoolSettingsOpen] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<LessonPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBatchExporting, setIsBatchExporting] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const loaded = loadSavedRPPs();
    setPlans(loaded);
    setDefaultSchool(loadDefaultSchoolIdentity());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save changes to storage whenever plans change
  const handleUpdatePlans = (newPlans: LessonPlan[]) => {
    setPlans(newPlans);
    saveRPPs(newPlans);
  };

  // Add new generated plan
  const handlePlanGenerated = (newPlan: LessonPlan) => {
    const updated = [newPlan, ...plans];
    handleUpdatePlans(updated);
    showToast(`Berhasil membuat "${newPlan.title}"! Dokumen siap diunduh dalam format Word.`);
    setPreviewPlan(newPlan); // automatically open preview so teacher can immediately inspect & download!
  };

  // Duplicate Plan
  const handleDuplicatePlan = (planToDuplicate: LessonPlan) => {
    const duplicated: LessonPlan = {
      ...planToDuplicate,
      id: `rpp-${Date.now()}`,
      title: `${planToDuplicate.title} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [duplicated, ...plans];
    handleUpdatePlans(updated);
    showToast(`RPP "${duplicated.title}" berhasil diduplikat!`);
  };

  // Delete Plan
  const handleDeletePlan = (id: string) => {
    const updated = plans.filter((p) => p.id !== id);
    handleUpdatePlans(updated);
    showToast('Rencana pembelajaran telah dihapus.');
    if (previewPlan?.id === id) setPreviewPlan(null);
    if (editingPlan?.id === id) setEditingPlan(null);
  };

  // Save edited plan
  const handleSaveEditedPlan = (updated: LessonPlan) => {
    const newPlans = plans.map((p) => (p.id === updated.id ? updated : p));
    handleUpdatePlans(newPlans);
    setEditingPlan(null);
    showToast('Perubahan dokumen berhasil disimpan.');
    if (previewPlan?.id === updated.id) {
      setPreviewPlan(updated);
    }
  };

  // Save Default School Settings
  const handleSaveSchoolSettings = (updatedSchool: SchoolIdentity) => {
    setDefaultSchool(updatedSchool);
    saveDefaultSchoolIdentity(updatedSchool);
    showToast('Identitas sekolah & pengesahan berhasil diperbarui.');
  };

  // Create Manual Blank Plan
  const handleCreateManual = () => {
    const newBlankPlan: LessonPlan = {
      id: `rpp-${Date.now()}`,
      title: 'Modul Ajar Baru (Kurikulum Merdeka)',
      curriculum: 'merdeka',
      level: 'SD',
      grade: 'Kelas IV (Fase B)',
      fase: 'Fase B',
      subject: 'IPAS',
      topic: 'Materi Pembelajaran Baru',
      semester: 'Ganjil',
      academicYear: '2025/2026',
      meetingCount: 1,
      timeAllocation: '2 x 35 Menit',
      schoolIdentity: { ...defaultSchool },
      capaianPembelajaran: 'Peserta didik memahami konsep dasar materi...',
      tujuanPembelajaran: [
        'Melalui pengamatan dan diskusi, peserta didik mampu mengidentifikasi konsep materi dengan tepat.',
        'Peserta didik mampu menyelesaikan LKPD secara berkelompok dengan nalar kritis.',
      ],
      indikatorKetercapaian: ['Menjelaskan konsep utama materi.', 'Mempresentasikan hasil kerja.'],
      profilPelajarPancasila: ['Bernalar Kritis', 'Bergotong Royong', 'Mandiri'],
      saranaPrasarana: 'Buku teks, proyektor, LKPD.',
      targetPesertaDidik: 'Peserta Didik Reguler/Tipikal',
      modelPembelajaran: 'Problem Based Learning (PBL)',
      metodePembelajaran: 'Diskusi, Tanya Jawab, Penugasan',
      pemahamanBermakna: 'Materi ini bermanfaat dalam kehidupan sehari-hari...',
      pertanyaanPemantik: ['Mengapa kita perlu mempelajari materi ini?'],
      kegiatanPendahuluan: [
        {
          id: 'p-1',
          phaseName: 'Orientasi & Apersepsi',
          description: 'Guru membuka kelas dengan salam, doa, dan mengaitkan materi dengan pengalaman nyata.',
          durationMinutes: 10,
        },
      ],
      kegiatanInti: [
        {
          id: 'i-1',
          phaseName: 'Fase 1: Orientasi Siswa pada Masalah',
          description: 'Guru menyajikan stimulasi atau permasalahan kontekstual.',
          durationMinutes: 15,
        },
        {
          id: 'i-2',
          phaseName: 'Fase 2: Penyelidikan & Kerja Kelompok',
          description: 'Siswa berdiskusi menyelesaikan lembar kerja dengan bimbingan guru.',
          durationMinutes: 25,
        },
        {
          id: 'i-3',
          phaseName: 'Fase 3: Penyajian Hasil Karya & Evaluasi',
          description: 'Perwakilan siswa mempresentasikan hasil diskusi dan guru memberikan penguatan.',
          durationMinutes: 10,
        },
      ],
      kegiatanPenutup: [
        {
          id: 'pen-1',
          phaseName: 'Refleksi & Doa',
          description: 'Guru bersama siswa merefleksikan kegiatan hari ini dan menutup dengan doa.',
          durationMinutes: 10,
        },
      ],
      asesmenDiagnostik: 'Pertanyaan lisan apersepsi awal',
      asesmenFormatif: 'Observasi keaktifan diskusi dan ketepatan pengerjaan LKPD',
      asesmenSumatif: 'Tes tertulis akhir materi',
      rubrikPenilaian: [
        {
          id: 'rub-1',
          criteria: 'Pemahaman Konsep Materi',
          needsGuidance: 'Belum memahami konsep.',
          developing: 'Mulai memahami sebagian konsep.',
          proficient: 'Memahami konsep dengan baik.',
          advanced: 'Sangat memahami dan mampu menjelaskan ke teman lain.',
        },
      ],
      lkpd: {
        title: 'Lembar Kerja Peserta Didik (LKPD)',
        instructions: 'Diskusikan bersama kelompok dan selesaikan pertanyaan di bawah ini!',
        tasks: ['Jelaskan konsep yang dipelajari hari ini!', 'Tuliskan contoh penerapannya!'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newBlankPlan, ...plans];
    handleUpdatePlans(updated);
    setEditingPlan(newBlankPlan);
  };

  // Export JSON Backup
  const handleExportAllJson = () => {
    const dataStr = JSON.stringify(plans, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    downloadBlob(blob, `Backup_RPP_${new Date().toISOString().split('T')[0]}.json`);
    showToast('Backup data berhasil diunduh.');
  };

  // Import JSON Backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          handleUpdatePlans(parsed);
          showToast(`Berhasil mengimpor ${parsed.length} rencana pembelajaran!`);
        } else {
          alert('Format file JSON tidak sesuai.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered Plans
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const matchQuery =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.schoolIdentity.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCurriculum =
        curriculumFilter === 'all' || p.curriculum === curriculumFilter;

      const matchLevel = levelFilter === 'all' || p.level === levelFilter;

      return matchQuery && matchCurriculum && matchLevel;
    });
  }, [plans, searchQuery, curriculumFilter, levelFilter]);

  // Statistics
  const merdekaCount = plans.filter((p) => p.curriculum === 'merdeka').length;
  const k13Count = plans.filter((p) => p.curriculum === 'k13').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenManualCreate={handleCreateManual}
        onOpenSchoolSettings={() => setIsSchoolSettingsOpen(true)}
        onExportAllJson={handleExportAllJson}
        onImportJson={handleImportJson}
        totalPlans={plans.length}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Banner / Overview Card */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
          {/* Subtle Decorative Background circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/15">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ekspor Otomatis Format Microsoft Word (.docx)</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Penyusunan RPP & Modul Ajar Cepat, Rapi, & Berstandar
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Bantu bapak/ibu guru menyusun RPP Kurikulum Merdeka (Modul Ajar) dan Kurikulum 2013 lengkap
              dengan Tujuan Pembelajaran, Sintaks Pembelajaran, Rubrik Asesmen, serta Lembar Kerja Siswa (LKPD).
              Setiap rencana pembelajaran dapat langsung diunduh dalam format <strong>Word (.docx)</strong>.
            </p>

            {/* Quick CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md shadow-blue-500/25 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Buat Modul Ajar Otomatis (AI)</span>
              </button>

              <button
                onClick={handleCreateManual}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Mulai dari Lembar Kosong</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar at bottom */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Total Dokumen RPP</p>
              <p className="text-lg font-bold text-white mt-0.5">{plans.length} Modul</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Kurikulum Merdeka</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{merdekaCount} Modul Ajar</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Kurikulum 2013</p>
              <p className="text-lg font-bold text-indigo-300 mt-0.5">{k13Count} RPP K13</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Satuan Pendidikan</p>
              <p className="text-xs font-semibold text-slate-200 mt-1 truncate">
                {defaultSchool.schoolName}
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari topik, mata pelajaran, guru..."
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
              {/* Kurikulum Filter */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setCurriculumFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    curriculumFilter === 'all'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setCurriculumFilter('merdeka')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    curriculumFilter === 'merdeka'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Merdeka
                </button>
                <button
                  onClick={() => setCurriculumFilter('k13')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    curriculumFilter === 'k13'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  K13
                </button>
              </div>

              {/* Jenjang Filter */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Jenjang</option>
                <option value="SD">Jenjang SD</option>
                <option value="SMP">Jenjang SMP</option>
                <option value="SMA">Jenjang SMA</option>
                <option value="SMK">Jenjang SMK</option>
                <option value="PAUD">Jenjang PAUD</option>
              </select>
            </div>
          </div>
        </div>

        {/* RPP Card List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Daftar Rencana Pembelajaran ({filteredPlans.length})
            </h3>
            <span className="text-xs text-slate-500">
              Klik <strong>Unduh Word</strong> untuk mengunduh berkas .docx resmi
            </span>
          </div>

          {filteredPlans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Tidak ada rencana pembelajaran yang sesuai filter
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Coba ubah kata kunci pencarian, sesuaikan filter kurikulum, atau buat RPP baru dengan generator AI.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurriculumFilter('all');
                  setLevelFilter('all');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlans.map((plan) => (
                <RPPCard
                  key={plan.id}
                  plan={plan}
                  onPreview={(p) => setPreviewPlan(p)}
                  onEdit={(p) => setEditingPlan(p)}
                  onDuplicate={handleDuplicatePlan}
                  onDelete={handleDeletePlan}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Aplikasi Pembuat RPP & Modul Ajar Lengkap untuk Guru Indonesia • Format Standar Kemendikbudristek
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Word (.docx) Support</span>
            <span>•</span>
            <span>Kurikulum Merdeka & K13</span>
            <span>•</span>
            <span>Asesmen & LKPD</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. AI Generator Modal */}
      <AIGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerated={handlePlanGenerated}
        defaultSchool={defaultSchool}
        onUpdateDefaultSchool={handleSaveSchoolSettings}
      />

      {/* 2. School Settings Modal */}
      <SchoolSettingsModal
        isOpen={isSchoolSettingsOpen}
        onClose={() => setIsSchoolSettingsOpen(false)}
        identity={defaultSchool}
        onSave={handleSaveSchoolSettings}
      />

      {/* 3. Document Preview & Print Modal */}
      <RPPPreviewModal
        plan={previewPlan}
        isOpen={!!previewPlan}
        onClose={() => setPreviewPlan(null)}
        onEdit={(p) => {
          setPreviewPlan(null);
          setEditingPlan(p);
        }}
      />

      {/* 4. RPP Comprehensive Editor */}
      {editingPlan && (
        <RPPEditor
          initialPlan={editingPlan}
          isOpen={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={handleSaveEditedPlan}
          onPreview={(p) => {
            setEditingPlan(null);
            setPreviewPlan(p);
          }}
        />
      )}
    </div>
  );
}
