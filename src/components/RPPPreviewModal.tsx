import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Edit3,
  FileCheck,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { LessonPlan } from '../types';
import { exportLessonPlanToDocx, downloadBlob } from '../services/docxExport';

interface RPPPreviewModalProps {
  plan: LessonPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (plan: LessonPlan) => void;
}

export const RPPPreviewModal: React.FC<RPPPreviewModalProps> = ({
  plan,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !plan) return null;

  const handleDownloadWord = async () => {
    try {
      setIsExporting(true);
      const blob = await exportLessonPlanToDocx(plan);
      const sanitizedName = plan.title
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 45);
      const filename = `${sanitizedName || 'RPP_Modul_Ajar'}.docx`;
      downloadBlob(blob, filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to export docx:', err);
      alert('Gagal mengekspor dokumen Word. Silakan coba kembali.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isDeepLearning = plan.curriculum === 'merdeka_deep_learning';
  const isMerdeka = plan.curriculum === 'merdeka' || isDeepLearning;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
        {/* Modal Action Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold truncate max-w-md">
                Pratinjau Dokumen: {plan.title}
              </h2>
              <p className="text-[11px] text-slate-300">
                {isDeepLearning
                  ? 'Kurikulum Merdeka (Deep Learning) • Siap Cetak & Ekspor Word'
                  : isMerdeka
                  ? 'Kurikulum Merdeka (Modul Ajar) • Siap Cetak & Ekspor Word'
                  : 'Kurikulum 2013 • Siap Cetak & Ekspor Word'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(plan)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Kustomisasi & Edit Modul"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Modul</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Cetak langsung atau simpan PDF melalui browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak / PDF</span>
            </button>

            {/* Primary Word Download */}
            <button
              onClick={handleDownloadWord}
              disabled={isExporting}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Membuat File...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Berhasil Diunduh!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File Word (.docx)</span>
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

        {/* Paper Sheet Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/80">
          <div className="max-w-[780px] mx-auto bg-white rounded-lg shadow-md border border-slate-300/80 p-6 sm:p-10 text-slate-900 font-sans text-xs sm:text-sm leading-relaxed">
            {/* Kop Sekolah */}
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-6">
              <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                {plan.schoolIdentity.schoolName || 'SATUAN PENDIDIKAN'}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                {plan.schoolIdentity.schoolAddress || 'Alamat Satuan Pendidikan'}
                {plan.schoolIdentity.city ? `, ${plan.schoolIdentity.city}` : ''}
                {plan.schoolIdentity.province ? `, ${plan.schoolIdentity.province}` : ''}
              </p>
            </div>

            {/* Document Title */}
            <div className="text-center mb-6">
              <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-slate-900">
                {isDeepLearning
                  ? 'MODUL AJAR (DEEP LEARNING)'
                  : isMerdeka
                  ? 'MODUL AJAR (RPP)'
                  : 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP)'}
              </h2>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mt-0.5">
                {isDeepLearning
                  ? `KURIKULUM MERDEKA - PENDEKATAN DEEP LEARNING (MINDFUL, MEANINGFUL, JOYFUL) ${plan.fase ? `- ${plan.fase}` : ''}`
                  : isMerdeka
                  ? `KURIKULUM MERDEKA ${plan.fase ? `- ${plan.fase}` : ''}`
                  : 'KURIKULUM 2013 (REVISI)'}
              </p>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                MATA PELAJARAN: {plan.subject.toUpperCase()}
              </p>
            </div>

            {/* I. INFORMASI UMUM / IDENTITAS */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2.5">
                I. {isMerdeka ? 'Informasi Umum' : 'Identitas Modul'}
              </h3>
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 font-semibold text-slate-700 w-1/3">Nama Penyusun / Guru</td>
                    <td className="py-1 text-slate-500 w-4">:</td>
                    <td className="py-1 font-medium text-slate-900">{plan.schoolIdentity.teacherName || '-'}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 font-semibold text-slate-700">Satuan Pendidikan</td>
                    <td className="py-1 text-slate-500">:</td>
                    <td className="py-1 text-slate-900">{plan.schoolIdentity.schoolName || '-'}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 font-semibold text-slate-700">Fase / Kelas / Semester</td>
                    <td className="py-1 text-slate-500">:</td>
                    <td className="py-1 text-slate-900">
                      {plan.fase ? `${plan.fase} / ` : ''}{plan.grade} / Semester {plan.semester}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 font-semibold text-slate-700">Tahun Ajaran</td>
                    <td className="py-1 text-slate-500">:</td>
                    <td className="py-1 text-slate-900">{plan.academicYear}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 font-semibold text-slate-700">Materi Pokok / Topik</td>
                    <td className="py-1 text-slate-500">:</td>
                    <td className="py-1 font-medium text-slate-900">
                      {plan.topic} {plan.subTopic ? `(${plan.subTopic})` : ''}
                    </td>
                  </tr>
                  {(plan.meetingCount || (plan.pertemuanList && plan.pertemuanList.length > 0)) && (
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-semibold text-slate-700">Jumlah Pertemuan</td>
                      <td className="py-1 text-slate-500">:</td>
                      <td className="py-1 font-medium text-slate-900">
                        {plan.meetingCount || plan.pertemuanList?.length} Pertemuan
                      </td>
                    </tr>
                  )}
                  <tr className="border-b border-slate-100">
                    <td className="py-1 font-semibold text-slate-700">Alokasi Waktu</td>
                    <td className="py-1 text-slate-500">:</td>
                    <td className="py-1 text-slate-900">{plan.timeAllocation}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 font-semibold text-slate-700">Model & Metode</td>
                    <td className="py-1 text-slate-500">:</td>
                    <td className="py-1 text-slate-900">
                      {plan.modelPembelajaran || 'PBL'} ({plan.metodePembelajaran || 'Diskusi, Tanya Jawab'})
                    </td>
                  </tr>
                  {plan.saranaPrasarana && (
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-semibold text-slate-700">Sarana & Prasarana</td>
                      <td className="py-1 text-slate-500">:</td>
                      <td className="py-1 text-slate-900">{plan.saranaPrasarana}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* II. KOMPONEN INTI */}
            <div className="mb-6 space-y-3">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                II. Komponen Inti
              </h3>

              {/* Capaian Pembelajaran or KI/KD */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  A. {isMerdeka ? 'Capaian Pembelajaran (CP)' : 'Kompetensi Inti & Dasar (KI-KD)'}
                </h4>
                {isMerdeka ? (
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200/80">
                    {plan.capaianPembelajaran || '-'}
                  </p>
                ) : (
                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200/80 space-y-1.5">
                    <p><strong>KI 3 (Pengetahuan):</strong> {plan.kompetensiInti?.ki3 || '-'}</p>
                    <p><strong>KI 4 (Keterampilan):</strong> {plan.kompetensiInti?.ki4 || '-'}</p>
                    <div>
                      <strong>Kompetensi Dasar:</strong>
                      <ul className="list-disc list-inside mt-0.5">
                        {plan.kompetensiDasar?.map((kd, idx) => (
                          <li key={idx}>{kd}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Tujuan Pembelajaran */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">B. Tujuan Pembelajaran (TP)</h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-800">
                  {plan.tujuanPembelajaran?.map((tp, idx) => (
                    <li key={idx} className="pl-1">
                      {tp}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Profil Pancasila / Karakter */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  C. {isMerdeka ? 'Dimensi Profil Pelajar Pancasila' : 'Nilai Karakter (PPK)'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(isMerdeka
                    ? plan.profilPelajarPancasila || []
                    : plan.nilaiKarakter || []
                  ).map((dim, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200"
                    >
                      {dim}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pemahaman Bermakna & Pertanyaan Pemantik */}
              {isMerdeka && (
                <>
                  {plan.pemahamanBermakna && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 mb-1">D. Pemahaman Bermakna</h4>
                      <p className="text-xs text-slate-700 italic bg-amber-50/60 p-2 rounded border border-amber-200/60">
                        "{plan.pemahamanBermakna}"
                      </p>
                    </div>
                  )}

                  {plan.pertanyaanPemantik && plan.pertanyaanPemantik.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 mb-1">E. Pertanyaan Pemantik</h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                        {plan.pertanyaanPemantik.map((q, idx) => (
                          <li key={idx} className="italic">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Deep Learning 3 Pillars */}
                  {(isDeepLearning || plan.deepLearningElements) && (
                    <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-br from-teal-50/90 to-emerald-50/70 border border-teal-200 shadow-2xs">
                      <h4 className="text-xs font-bold text-teal-900 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        F. Tiga Pilar Pendekatan Deep Learning (Mindful, Meaningful, & Joyful Learning)
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="bg-white/80 p-2.5 rounded-lg border border-teal-100">
                          <p className="font-bold text-teal-950 flex items-center gap-1.5 text-xs">
                            <span className="text-sm">🧘</span> Mindful Learning (Pembelajaran Berkesadaran)
                          </p>
                          <p className="text-slate-700 mt-1 text-[11px] leading-relaxed">
                            {plan.deepLearningElements?.mindfulLearning ||
                              'Menghadirkan kesadaran penuh, memusatkan perhatian, menghargai keunikan cara belajar siswa, dan menyimak secara aktif dan empatik.'}
                          </p>
                        </div>
                        <div className="bg-white/80 p-2.5 rounded-lg border border-teal-100">
                          <p className="font-bold text-teal-950 flex items-center gap-1.5 text-xs">
                            <span className="text-sm">💡</span> Meaningful Learning (Pembelajaran Bermakna)
                          </p>
                          <p className="text-slate-700 mt-1 text-[11px] leading-relaxed">
                            {plan.deepLearningElements?.meaningfulLearning ||
                              'Menghubungkan esensi materi secara kontekstual dengan pengalaman nyata siswa untuk pemecahan masalah otentik dan pemahaman mendalam jangka panjang.'}
                          </p>
                        </div>
                        <div className="bg-white/80 p-2.5 rounded-lg border border-teal-100">
                          <p className="font-bold text-teal-950 flex items-center gap-1.5 text-xs">
                            <span className="text-sm">🎉</span> Joyful Learning (Pembelajaran Menggembirakan)
                          </p>
                          <p className="text-slate-700 mt-1 text-[11px] leading-relaxed">
                            {plan.deepLearningElements?.joyfulLearning ||
                              'Membangkitkan rasa ingin tahu yang menyenangkan (curiosity), menciptakan iklim kelas aman dan apresiatif tanpa rasa takut salah, serta merayakan setiap proses belajar.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* III. KEGIATAN PEMBELAJARAN */}
            <div className="mb-6 space-y-4">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2.5">
                III. Langkah-Langkah Pembelajaran
              </h3>

              {plan.pertemuanList && plan.pertemuanList.length > 0 ? (
                /* MULTI-MEETING RENDERING */
                plan.pertemuanList.map((meeting, mIdx) => (
                  <div
                    key={meeting.pertemuanKe || mIdx}
                    className="border border-slate-300 rounded-lg overflow-hidden text-xs shadow-2xs"
                  >
                    <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-extrabold text-blue-900">
                        PERTEMUAN KE-{meeting.pertemuanKe || mIdx + 1}: {meeting.fokusMateri}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-300 shrink-0">
                        {meeting.alokasiWaktu || '2 x 35 Menit'}
                      </span>
                    </div>

                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 text-[11px]">
                          <th className="p-2 text-left font-bold w-1/4 border-r border-slate-300">
                            Kegiatan / Tahap
                          </th>
                          <th className="p-2 text-left font-bold w-2/3 border-r border-slate-300">
                            Deskripsi Aktivitas Pembelajaran
                          </th>
                          <th className="p-2 text-center font-bold w-1/12">Waktu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Pendahuluan */}
                        <tr className="border-b border-slate-200 bg-slate-50/40">
                          <td className="p-2 font-bold text-slate-800 align-top border-r border-slate-300">
                            1. Pendahuluan
                          </td>
                          <td className="p-2 border-r border-slate-300 space-y-1">
                            {meeting.kegiatanPendahuluan?.map((step, idx) => (
                              <div key={idx}>
                                <span className="font-semibold text-slate-800">
                                  • {step.phaseName}:{' '}
                                </span>
                                <span className="text-slate-700">{step.description}</span>
                              </div>
                            ))}
                          </td>
                          <td className="p-2 text-center font-semibold text-slate-700 align-top">
                            {meeting.kegiatanPendahuluan?.reduce(
                              (a, b) => a + (b.durationMinutes || 0),
                              0,
                            )}{' '}
                            mnt
                          </td>
                        </tr>

                        {/* Kegiatan Inti */}
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-bold text-slate-800 align-top border-r border-slate-300">
                            2. Kegiatan Inti
                            <p className="text-[11px] font-normal text-slate-500 italic mt-0.5">
                              ({plan.modelPembelajaran || 'Sintaks Model'})
                            </p>
                          </td>
                          <td className="p-2 border-r border-slate-300 space-y-2">
                            {meeting.kegiatanInti?.map((step, idx) => (
                              <div key={idx}>
                                <p className="font-bold text-blue-900">• {step.phaseName}</p>
                                <p className="text-slate-700 mt-0.5">{step.description}</p>
                              </div>
                            ))}
                          </td>
                          <td className="p-2 text-center font-semibold text-slate-700 align-top">
                            {meeting.kegiatanInti?.reduce(
                              (a, b) => a + (b.durationMinutes || 0),
                              0,
                            )}{' '}
                            mnt
                          </td>
                        </tr>

                        {/* Penutup */}
                        <tr className="bg-slate-50/40">
                          <td className="p-2 font-bold text-slate-800 align-top border-r border-slate-300">
                            3. Penutup
                          </td>
                          <td className="p-2 border-r border-slate-300 space-y-1">
                            {meeting.kegiatanPenutup?.map((step, idx) => (
                              <div key={idx}>
                                <span className="font-semibold text-slate-800">
                                  • {step.phaseName}:{' '}
                                </span>
                                <span className="text-slate-700">{step.description}</span>
                              </div>
                            ))}
                          </td>
                          <td className="p-2 text-center font-semibold text-slate-700 align-top">
                            {meeting.kegiatanPenutup?.reduce(
                              (a, b) => a + (b.durationMinutes || 0),
                              0,
                            )}{' '}
                            mnt
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                /* SINGLE-MEETING RENDERING */
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                        <th className="p-2 text-left font-bold w-1/4 border-r border-slate-300">
                          Kegiatan / Tahap
                        </th>
                        <th className="p-2 text-left font-bold w-2/3 border-r border-slate-300">
                          Deskripsi Aktivitas Pembelajaran
                        </th>
                        <th className="p-2 text-center font-bold w-1/12">Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Pendahuluan */}
                      <tr className="border-b border-slate-200 bg-slate-50/50">
                        <td className="p-2 font-bold text-slate-800 align-top border-r border-slate-300">
                          1. Pendahuluan
                        </td>
                        <td className="p-2 border-r border-slate-300 space-y-1">
                          {plan.kegiatanPendahuluan?.map((step, idx) => (
                            <div key={idx}>
                              <span className="font-semibold text-slate-800">
                                • {step.phaseName}:{' '}
                              </span>
                              <span className="text-slate-700">{step.description}</span>
                            </div>
                          ))}
                        </td>
                        <td className="p-2 text-center font-semibold text-slate-700 align-top">
                          {plan.kegiatanPendahuluan?.reduce(
                            (a, b) => a + (b.durationMinutes || 0),
                            0,
                          )}{' '}
                          mnt
                        </td>
                      </tr>

                      {/* Kegiatan Inti */}
                      <tr className="border-b border-slate-200">
                        <td className="p-2 font-bold text-slate-800 align-top border-r border-slate-300">
                          2. Kegiatan Inti
                          <p className="text-[11px] font-normal text-slate-500 italic mt-0.5">
                            ({plan.modelPembelajaran || 'Sintaks Model'})
                          </p>
                        </td>
                        <td className="p-2 border-r border-slate-300 space-y-2">
                          {plan.kegiatanInti?.map((step, idx) => (
                            <div key={idx}>
                              <p className="font-bold text-blue-900">• {step.phaseName}</p>
                              <p className="text-slate-700 mt-0.5">{step.description}</p>
                            </div>
                          ))}
                        </td>
                        <td className="p-2 text-center font-semibold text-slate-700 align-top">
                          {plan.kegiatanInti?.reduce(
                            (a, b) => a + (b.durationMinutes || 0),
                            0,
                          )}{' '}
                          mnt
                        </td>
                      </tr>

                      {/* Penutup */}
                      <tr className="bg-slate-50/50">
                        <td className="p-2 font-bold text-slate-800 align-top border-r border-slate-300">
                          3. Penutup
                        </td>
                        <td className="p-2 border-r border-slate-300 space-y-1">
                          {plan.kegiatanPenutup?.map((step, idx) => (
                            <div key={idx}>
                              <span className="font-semibold text-slate-800">
                                • {step.phaseName}:{' '}
                              </span>
                              <span className="text-slate-700">{step.description}</span>
                            </div>
                          ))}
                        </td>
                        <td className="p-2 text-center font-semibold text-slate-700 align-top">
                          {plan.kegiatanPenutup?.reduce(
                            (a, b) => a + (b.durationMinutes || 0),
                            0,
                          )}{' '}
                          mnt
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* IV. ASESMEN & PENILAIAN */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2.5">
                IV. Asesmen & Rubrik Penilaian
              </h3>
              <div className="space-y-1.5 text-xs mb-3">
                <p>
                  <strong>1. Asesmen Diagnostik:</strong> {plan.asesmenDiagnostik || '-'}
                </p>
                <p>
                  <strong>2. Asesmen Formatif:</strong> {plan.asesmenFormatif || '-'}
                </p>
                <p>
                  <strong>3. Asesmen Sumatif:</strong> {plan.asesmenSumatif || '-'}
                </p>
              </div>

              {/* Rubrik Table */}
              <h4 className="text-xs font-bold text-slate-800 mb-1.5">Rubrik Penilaian Kinerja:</h4>
              <div className="border border-slate-300 rounded-lg overflow-x-auto text-[11px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <th className="p-2 text-left border-r border-slate-300 w-1/4">Aspek / Kriteria</th>
                      <th className="p-2 text-left border-r border-slate-300 w-1/5">Perlu Bimbingan (1)</th>
                      <th className="p-2 text-left border-r border-slate-300 w-1/5">Cukup (2)</th>
                      <th className="p-2 text-left border-r border-slate-300 w-1/5">Baik (3)</th>
                      <th className="p-2 text-left w-1/5">Sangat Baik (4)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.rubrikPenilaian?.map((rub, idx) => (
                      <tr key={idx} className="border-b border-slate-200 last:border-b-0">
                        <td className="p-2 font-semibold text-slate-800 border-r border-slate-300 align-top">
                          {rub.criteria}
                        </td>
                        <td className="p-2 text-slate-600 border-r border-slate-300 align-top">{rub.needsGuidance}</td>
                        <td className="p-2 text-slate-600 border-r border-slate-300 align-top">{rub.developing}</td>
                        <td className="p-2 text-slate-600 border-r border-slate-300 align-top">{rub.proficient}</td>
                        <td className="p-2 text-slate-600 align-top">{rub.advanced}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* V. LAMPIRAN */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2.5">
                V. Lampiran
              </h3>

              {/* LKPD */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3 text-xs">
                <h4 className="font-bold text-slate-900 text-xs mb-1">
                  A. {plan.lkpd.title || 'Lembar Kerja Peserta Didik (LKPD)'}
                </h4>
                <p className="text-slate-600 italic mb-2">
                  Petunjuk: {plan.lkpd.instructions}
                </p>
                <div className="space-y-1">
                  {plan.lkpd.tasks?.map((task, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-blue-600">{idx + 1}.</span>
                      <span className="text-slate-800">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ringkasan Materi */}
              {plan.ringkasanMateri && (
                <div className="mb-3 text-xs">
                  <h4 className="font-bold text-slate-800 mb-1">B. Ringkasan Materi Pembelajaran</h4>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                    {plan.ringkasanMateri}
                  </p>
                </div>
              )}

              {/* Pengayaan & Remedial */}
              {plan.remedialDanPengayaan && (
                <div className="mb-3 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 bg-amber-50/50 rounded border border-amber-200/70">
                    <p className="font-bold text-amber-900">Program Remedial:</p>
                    <p className="text-slate-700 mt-0.5">{plan.remedialDanPengayaan.remedial}</p>
                  </div>
                  <div className="p-2 bg-emerald-50/50 rounded border border-emerald-200/70">
                    <p className="font-bold text-emerald-900">Program Pengayaan:</p>
                    <p className="text-slate-700 mt-0.5">{plan.remedialDanPengayaan.pengayaan}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Kolom Tanda Tangan Pengesahan */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-300 text-xs">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold text-slate-900">Kepala Sekolah</p>
                <div className="h-16" />
                <p className="font-bold underline text-slate-900">
                  {plan.schoolIdentity.principalName || '..............................................'}
                </p>
                <p className="text-slate-600">
                  NIP. {plan.schoolIdentity.principalNip || '.....................................'}
                </p>
              </div>

              <div>
                <p>
                  {plan.schoolIdentity.city || 'Tempat'},{' '}
                  {plan.schoolIdentity.signatureDatePlace ||
                    new Date().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                </p>
                <p className="font-bold text-slate-900">Guru Mata Pelajaran</p>
                <div className="h-16" />
                <p className="font-bold underline text-slate-900">
                  {plan.schoolIdentity.teacherName || '..............................................'}
                </p>
                <p className="text-slate-600">
                  NIP. {plan.schoolIdentity.teacherNip || '.....................................'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
