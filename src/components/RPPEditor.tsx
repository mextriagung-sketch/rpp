import React, { useState } from 'react';
import {
  X,
  Save,
  Download,
  Eye,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  LessonPlan,
  ActivityStep,
  AssessmentRubricItem,
  CurriculumType,
  EducationLevel,
} from '../types';
import { exportLessonPlanToDocx, downloadBlob } from '../services/docxExport';

interface RPPEditorProps {
  initialPlan: LessonPlan;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: LessonPlan) => void;
  onPreview: (plan: LessonPlan) => void;
}

export const RPPEditor: React.FC<RPPEditorProps> = ({
  initialPlan,
  isOpen,
  onClose,
  onSave,
  onPreview,
}) => {
  const [plan, setPlan] = useState<LessonPlan>({ ...initialPlan });
  const [activeTab, setActiveTab] = useState<
    'identity' | 'core' | 'activities' | 'assessment' | 'attachment'
  >('identity');
  const [isExporting, setIsExporting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isMerdeka = plan.curriculum === 'merdeka';

  const handleIdentityChange = (field: string, val: string) => {
    setPlan((prev) => ({
      ...prev,
      schoolIdentity: {
        ...prev.schoolIdentity,
        [field]: val,
      },
    }));
  };

  // Add / Remove Learning Objectives
  const handleAddTujuan = () => {
    setPlan((prev) => ({
      ...prev,
      tujuanPembelajaran: [...(prev.tujuanPembelajaran || []), ''],
    }));
  };

  const handleUpdateTujuan = (idx: number, val: string) => {
    setPlan((prev) => {
      const updated = [...prev.tujuanPembelajaran];
      updated[idx] = val;
      return { ...prev, tujuanPembelajaran: updated };
    });
  };

  const handleRemoveTujuan = (idx: number) => {
    setPlan((prev) => ({
      ...prev,
      tujuanPembelajaran: prev.tujuanPembelajaran.filter((_, i) => i !== idx),
    }));
  };

  // Profil Pelajar Pancasila Toggle
  const P3_OPTIONS = [
    'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia',
    'Berkebhinekaan Global',
    'Bergotong Royong',
    'Mandiri',
    'Bernalar Kritis',
    'Kreatif',
  ];

  const handleToggleP3 = (item: string) => {
    setPlan((prev) => {
      const current = prev.profilPelajarPancasila || [];
      const exists = current.some((c) => c.toLowerCase().includes(item.toLowerCase().split(',')[0]));
      if (exists) {
        return {
          ...prev,
          profilPelajarPancasila: current.filter(
            (c) => !c.toLowerCase().includes(item.toLowerCase().split(',')[0]),
          ),
        };
      } else {
        return {
          ...prev,
          profilPelajarPancasila: [...current, item],
        };
      }
    });
  };

  // Activities Helper
  const handleUpdateStep = (
    type: 'kegiatanPendahuluan' | 'kegiatanInti' | 'kegiatanPenutup',
    index: number,
    field: keyof ActivityStep,
    value: string | number,
  ) => {
    setPlan((prev) => {
      const list = [...prev[type]];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [type]: list };
    });
  };

  const handleAddStep = (type: 'kegiatanPendahuluan' | 'kegiatanInti' | 'kegiatanPenutup') => {
    setPlan((prev) => {
      const list = [...prev[type]];
      list.push({
        id: `step-${Date.now()}`,
        phaseName: type === 'kegiatanInti' ? 'Langkah Baru' : 'Aktivitas Tambahan',
        description: '',
        durationMinutes: 10,
      });
      return { ...prev, [type]: list };
    });
  };

  const handleRemoveStep = (
    type: 'kegiatanPendahuluan' | 'kegiatanInti' | 'kegiatanPenutup',
    index: number,
  ) => {
    setPlan((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  // Rubric Helper
  const handleAddRubricItem = () => {
    setPlan((prev) => ({
      ...prev,
      rubrikPenilaian: [
        ...prev.rubrikPenilaian,
        {
          id: `rub-${Date.now()}`,
          criteria: 'Kriteria Penilaian Baru',
          needsGuidance: 'Belum memenuhi kriteria.',
          developing: 'Mulai menunjukkan pemahaman.',
          proficient: 'Memenuhi kriteria dengan tepat.',
          advanced: 'Melebihi standar dengan sangat baik.',
        },
      ],
    }));
  };

  const handleUpdateRubric = (idx: number, field: keyof AssessmentRubricItem, val: string) => {
    setPlan((prev) => {
      const list = [...prev.rubrikPenilaian];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, rubrikPenilaian: list };
    });
  };

  const handleRemoveRubric = (idx: number) => {
    setPlan((prev) => ({
      ...prev,
      rubrikPenilaian: prev.rubrikPenilaian.filter((_, i) => i !== idx),
    }));
  };

  // LKPD Tasks Helper
  const handleAddLkpdTask = () => {
    setPlan((prev) => ({
      ...prev,
      lkpd: {
        ...prev.lkpd,
        tasks: [...(prev.lkpd.tasks || []), ''],
      },
    }));
  };

  const handleUpdateLkpdTask = (idx: number, val: string) => {
    setPlan((prev) => {
      const tasks = [...(prev.lkpd.tasks || [])];
      tasks[idx] = val;
      return {
        ...prev,
        lkpd: { ...prev.lkpd, tasks },
      };
    });
  };

  const handleRemoveLkpdTask = (idx: number) => {
    setPlan((prev) => ({
      ...prev,
      lkpd: {
        ...prev.lkpd,
        tasks: prev.lkpd.tasks.filter((_, i) => i !== idx),
      },
    }));
  };

  const handleSave = () => {
    const updatedPlan = {
      ...plan,
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedPlan);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDirectDownloadWord = async () => {
    try {
      setIsExporting(true);
      const blob = await exportLessonPlanToDocx(plan);
      const filename = `${plan.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'RPP'}.docx`;
      downloadBlob(blob, filename);
    } catch (e) {
      console.error(e);
      alert('Gagal mengekspor dokumen Word.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Editor Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold truncate max-w-md">
                Kustomisasi: {plan.title}
              </h2>
              <p className="text-[11px] text-slate-400">
                Ubah isi modul sesuai kondisi kelas Anda dan ekspor langsung ke Word
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPreview(plan)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau</span>
            </button>

            <button
              onClick={handleDirectDownloadWord}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Word</span>
            </button>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'identity', label: '1. Identitas & Kop' },
            { id: 'core', label: '2. Komponen Inti & TP' },
            { id: 'activities', label: '3. Langkah Pembelajaran' },
            { id: 'assessment', label: '4. Asesmen & Rubrik' },
            { id: 'attachment', label: '5. LKPD & Lampiran' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 font-bold bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* TAB 1: IDENTITAS & KOP SEKOLAH */}
          {activeTab === 'identity' && (
            <div className="space-y-5 max-w-3xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Judul Perangkat Ajar
                </label>
                <input
                  type="text"
                  value={plan.title}
                  onChange={(e) => setPlan({ ...plan, title: e.target.value })}
                  className="w-full text-sm font-semibold border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kurikulum
                  </label>
                  <select
                    value={plan.curriculum}
                    onChange={(e) =>
                      setPlan({ ...plan, curriculum: e.target.value as CurriculumType })
                    }
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="merdeka">Kurikulum Merdeka (Modul Ajar)</option>
                    <option value="k13">Kurikulum 2013 (K13)</option>
                    <option value="custom">Kurikulum Kustom / Satuan Pendidikan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenjang
                  </label>
                  <select
                    value={plan.level}
                    onChange={(e) =>
                      setPlan({ ...plan, level: e.target.value as EducationLevel })
                    }
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SD">SD/MI</option>
                    <option value="SMP">SMP/MTs</option>
                    <option value="SMA">SMA/MA</option>
                    <option value="SMK">SMK</option>
                    <option value="PAUD">PAUD/TK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fase / Kelas
                  </label>
                  <input
                    type="text"
                    value={plan.grade}
                    onChange={(e) => setPlan({ ...plan, grade: e.target.value })}
                    placeholder="Contoh: Kelas IV (Fase B)"
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={plan.subject}
                    onChange={(e) => setPlan({ ...plan, subject: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Topik / Materi
                  </label>
                  <input
                    type="text"
                    value={plan.topic}
                    onChange={(e) => setPlan({ ...plan, topic: e.target.value })}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alokasi Waktu
                  </label>
                  <input
                    type="text"
                    value={plan.timeAllocation}
                    onChange={(e) => setPlan({ ...plan, timeAllocation: e.target.value })}
                    placeholder="Contoh: 2 x 35 Menit"
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* School Identity Section */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Identitas Kop & Tanda Tangan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Nama Sekolah
                    </label>
                    <input
                      type="text"
                      value={plan.schoolIdentity.schoolName}
                      onChange={(e) => handleIdentityChange('schoolName', e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Alamat Sekolah
                    </label>
                    <input
                      type="text"
                      value={plan.schoolIdentity.schoolAddress}
                      onChange={(e) => handleIdentityChange('schoolAddress', e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Guru Pengampu
                    </label>
                    <input
                      type="text"
                      value={plan.schoolIdentity.teacherName}
                      onChange={(e) => handleIdentityChange('teacherName', e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      NIP Guru
                    </label>
                    <input
                      type="text"
                      value={plan.schoolIdentity.teacherNip}
                      onChange={(e) => handleIdentityChange('teacherNip', e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={plan.schoolIdentity.principalName}
                      onChange={(e) => handleIdentityChange('principalName', e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      NIP Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={plan.schoolIdentity.principalNip}
                      onChange={(e) => handleIdentityChange('principalNip', e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KOMPONEN INTI & TUJUAN */}
          {activeTab === 'core' && (
            <div className="space-y-6 max-w-3xl">
              {/* Capaian Pembelajaran or KI-KD */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  {isMerdeka ? 'Capaian Pembelajaran (CP)' : 'Kompetensi Inti & Dasar (KI-KD)'}
                </label>
                <textarea
                  value={plan.capaianPembelajaran || ''}
                  onChange={(e) => setPlan({ ...plan, capaianPembelajaran: e.target.value })}
                  rows={3}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Rumusan capaian pembelajaran yang ditargetkan..."
                />
              </div>

              {/* Tujuan Pembelajaran List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase">
                    Tujuan Pembelajaran (TP)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTujuan}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Tujuan</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {plan.tujuanPembelajaran?.map((tp, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-xs font-bold text-slate-400 mt-2">{idx + 1}.</span>
                      <textarea
                        value={tp}
                        onChange={(e) => handleUpdateTujuan(idx, e.target.value)}
                        rows={2}
                        className="flex-1 text-xs sm:text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTujuan(idx)}
                        className="p-2 text-slate-400 hover:text-red-600"
                        title="Hapus Tujuan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profil Pelajar Pancasila Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-2">
                  Dimensi Profil Pelajar Pancasila
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {P3_OPTIONS.map((dim) => {
                    const isChecked = (plan.profilPelajarPancasila || []).some((p) =>
                      p.toLowerCase().includes(dim.toLowerCase().split(',')[0]),
                    );
                    return (
                      <label
                        key={dim}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleP3(dim)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{dim}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Pemahaman Bermakna & Pertanyaan Pemantik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Pemahaman Bermakna
                  </label>
                  <textarea
                    value={plan.pemahamanBermakna || ''}
                    onChange={(e) => setPlan({ ...plan, pemahamanBermakna: e.target.value })}
                    rows={3}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-2.5"
                    placeholder="Manfaat yang didapat siswa setelah mempelajari materi..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Sarana & Prasarana
                  </label>
                  <textarea
                    value={plan.saranaPrasarana || ''}
                    onChange={(e) => setPlan({ ...plan, saranaPrasarana: e.target.value })}
                    rows={3}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-2.5"
                    placeholder="Alat, bahan, media pembelajaran, LCD proyektor..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LANGKAH PEMBELAJARAN */}
          {activeTab === 'activities' && (
            <div className="space-y-6 max-w-4xl">
              {/* Pendahuluan */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    1. Kegiatan Pendahuluan
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAddStep('kegiatanPendahuluan')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Langkah</span>
                  </button>
                </div>
                <div className="space-y-2.5">
                  {plan.kegiatanPendahuluan.map((step, idx) => (
                    <div key={step.id || idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="w-1/4">
                        <input
                          type="text"
                          value={step.phaseName}
                          onChange={(e) =>
                            handleUpdateStep('kegiatanPendahuluan', idx, 'phaseName', e.target.value)
                          }
                          placeholder="Fase / Nama Tahap"
                          className="w-full text-xs font-bold border border-slate-200 rounded p-1.5 text-blue-900"
                        />
                        <div className="mt-1 flex items-center gap-1">
                          <input
                            type="number"
                            value={step.durationMinutes}
                            onChange={(e) =>
                              handleUpdateStep(
                                'kegiatanPendahuluan',
                                idx,
                                'durationMinutes',
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-14 text-xs border border-slate-200 rounded p-1 text-center"
                          />
                          <span className="text-[11px] text-slate-500">menit</span>
                        </div>
                      </div>
                      <textarea
                        value={step.description}
                        onChange={(e) =>
                          handleUpdateStep('kegiatanPendahuluan', idx, 'description', e.target.value)
                        }
                        rows={2}
                        placeholder="Deskripsi aktivitas guru dan peserta didik..."
                        className="flex-1 text-xs border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStep('kegiatanPendahuluan', idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kegiatan Inti */}
              <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      2. Kegiatan Inti (Sintaks Model: {plan.modelPembelajaran || 'PBL'})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddStep('kegiatanInti')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Sintaks Inti</span>
                  </button>
                </div>
                <div className="space-y-2.5">
                  {plan.kegiatanInti.map((step, idx) => (
                    <div key={step.id || idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="w-1/3">
                        <input
                          type="text"
                          value={step.phaseName}
                          onChange={(e) =>
                            handleUpdateStep('kegiatanInti', idx, 'phaseName', e.target.value)
                          }
                          placeholder="Sintaks / Langkah"
                          className="w-full text-xs font-bold border border-slate-200 rounded p-1.5 text-slate-800"
                        />
                        <div className="mt-1 flex items-center gap-1">
                          <input
                            type="number"
                            value={step.durationMinutes}
                            onChange={(e) =>
                              handleUpdateStep(
                                'kegiatanInti',
                                idx,
                                'durationMinutes',
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-14 text-xs border border-slate-200 rounded p-1 text-center"
                          />
                          <span className="text-[11px] text-slate-500">menit</span>
                        </div>
                      </div>
                      <textarea
                        value={step.description}
                        onChange={(e) =>
                          handleUpdateStep('kegiatanInti', idx, 'description', e.target.value)
                        }
                        rows={3}
                        placeholder="Deskripsi langkah kegiatan inti..."
                        className="flex-1 text-xs border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStep('kegiatanInti', idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kegiatan Penutup */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    3. Kegiatan Penutup
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAddStep('kegiatanPenutup')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Langkah</span>
                  </button>
                </div>
                <div className="space-y-2.5">
                  {plan.kegiatanPenutup.map((step, idx) => (
                    <div key={step.id || idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="w-1/4">
                        <input
                          type="text"
                          value={step.phaseName}
                          onChange={(e) =>
                            handleUpdateStep('kegiatanPenutup', idx, 'phaseName', e.target.value)
                          }
                          placeholder="Fase Penutup"
                          className="w-full text-xs font-bold border border-slate-200 rounded p-1.5 text-slate-800"
                        />
                        <div className="mt-1 flex items-center gap-1">
                          <input
                            type="number"
                            value={step.durationMinutes}
                            onChange={(e) =>
                              handleUpdateStep(
                                'kegiatanPenutup',
                                idx,
                                'durationMinutes',
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-14 text-xs border border-slate-200 rounded p-1 text-center"
                          />
                          <span className="text-[11px] text-slate-500">menit</span>
                        </div>
                      </div>
                      <textarea
                        value={step.description}
                        onChange={(e) =>
                          handleUpdateStep('kegiatanPenutup', idx, 'description', e.target.value)
                        }
                        rows={2}
                        placeholder="Deskripsi refleksi dan tindak lanjut..."
                        className="flex-1 text-xs border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStep('kegiatanPenutup', idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASESMEN & RUBRIK */}
          {activeTab === 'assessment' && (
            <div className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Asesmen Diagnostik (Awal)
                  </label>
                  <textarea
                    value={plan.asesmenDiagnostik || ''}
                    onChange={(e) => setPlan({ ...plan, asesmenDiagnostik: e.target.value })}
                    rows={2}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Asesmen Formatif (Proses)
                  </label>
                  <textarea
                    value={plan.asesmenFormatif || ''}
                    onChange={(e) => setPlan({ ...plan, asesmenFormatif: e.target.value })}
                    rows={2}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Asesmen Sumatif (Akhir)
                  </label>
                  <textarea
                    value={plan.asesmenSumatif || ''}
                    onChange={(e) => setPlan({ ...plan, asesmenSumatif: e.target.value })}
                    rows={2}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              {/* Rubrik Penilaian */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Rubrik Penilaian Kinerja (Skala 1 - 4)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddRubricItem}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Kriteria</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {plan.rubrikPenilaian.map((rub, idx) => (
                    <div
                      key={rub.id || idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={rub.criteria}
                          onChange={(e) => handleUpdateRubric(idx, 'criteria', e.target.value)}
                          placeholder="Aspek / Kriteria yang Dinilai"
                          className="w-3/4 text-xs font-bold border border-slate-300 rounded p-1.5 bg-white text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveRubric(idx)}
                          className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-600">Perlu Bimbingan (1)</span>
                          <textarea
                            value={rub.needsGuidance}
                            onChange={(e) => handleUpdateRubric(idx, 'needsGuidance', e.target.value)}
                            rows={2}
                            className="w-full text-xs border border-slate-200 rounded p-1.5 bg-white"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold text-slate-600">Cukup (2)</span>
                          <textarea
                            value={rub.developing}
                            onChange={(e) => handleUpdateRubric(idx, 'developing', e.target.value)}
                            rows={2}
                            className="w-full text-xs border border-slate-200 rounded p-1.5 bg-white"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold text-slate-600">Baik (3)</span>
                          <textarea
                            value={rub.proficient}
                            onChange={(e) => handleUpdateRubric(idx, 'proficient', e.target.value)}
                            rows={2}
                            className="w-full text-xs border border-slate-200 rounded p-1.5 bg-white"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold text-slate-600">Sangat Baik (4)</span>
                          <textarea
                            value={rub.advanced}
                            onChange={(e) => handleUpdateRubric(idx, 'advanced', e.target.value)}
                            rows={2}
                            className="w-full text-xs border border-slate-200 rounded p-1.5 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LKPD & LAMPIRAN */}
          {activeTab === 'attachment' && (
            <div className="space-y-6 max-w-3xl">
              {/* LKPD */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Lembar Kerja Peserta Didik (LKPD)
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Judul LKPD</label>
                  <input
                    type="text"
                    value={plan.lkpd.title}
                    onChange={(e) =>
                      setPlan({ ...plan, lkpd: { ...plan.lkpd, title: e.target.value } })
                    }
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Petunjuk Pengerjaan LKPD
                  </label>
                  <textarea
                    value={plan.lkpd.instructions}
                    onChange={(e) =>
                      setPlan({ ...plan, lkpd: { ...plan.lkpd, instructions: e.target.value } })
                    }
                    rows={2}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Daftar Soal / Tugas LKPD</label>
                    <button
                      type="button"
                      onClick={handleAddLkpdTask}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Soal</span>
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {plan.lkpd.tasks?.map((task, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">{idx + 1}.</span>
                        <input
                          type="text"
                          value={task}
                          onChange={(e) => handleUpdateLkpdTask(idx, e.target.value)}
                          className="flex-1 text-xs border border-slate-300 rounded-lg p-2 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveLkpdTask(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ringkasan Materi */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  Bahan Bacaan Guru & Siswa (Ringkasan Materi)
                </label>
                <textarea
                  value={plan.ringkasanMateri || ''}
                  onChange={(e) => setPlan({ ...plan, ringkasanMateri: e.target.value })}
                  rows={4}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-3"
                  placeholder="Rangkuman konsep kunci materi untuk memudahkan pelaksanaan pembelajaran..."
                />
              </div>

              {/* Remedial & Pengayaan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Program Remedial
                  </label>
                  <textarea
                    value={plan.remedialDanPengayaan?.remedial || ''}
                    onChange={(e) =>
                      setPlan({
                        ...plan,
                        remedialDanPengayaan: {
                          remedial: e.target.value,
                          pengayaan: plan.remedialDanPengayaan?.pengayaan || '',
                        },
                      })
                    }
                    rows={2}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Program Pengayaan
                  </label>
                  <textarea
                    value={plan.remedialDanPengayaan?.pengayaan || ''}
                    onChange={(e) =>
                      setPlan({
                        ...plan,
                        remedialDanPengayaan: {
                          remedial: plan.remedialDanPengayaan?.remedial || '',
                          pengayaan: e.target.value,
                        },
                      })
                    }
                    rows={2}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
