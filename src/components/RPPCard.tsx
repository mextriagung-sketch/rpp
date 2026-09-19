import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Calendar,
  Clock,
  GraduationCap,
  Sparkles,
  School,
  CheckCircle2,
} from 'lucide-react';
import { LessonPlan } from '../types';
import { exportLessonPlanToDocx, downloadBlob } from '../services/docxExport';

interface RPPCardProps {
  plan: LessonPlan;
  onPreview: (plan: LessonPlan) => void;
  onEdit: (plan: LessonPlan) => void;
  onDuplicate: (plan: LessonPlan) => void;
  onDelete: (id: string) => void;
}

export const RPPCard: React.FC<RPPCardProps> = ({
  plan,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadWord = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      alert('Terjadi kesalahan saat mengekspor dokumen Word. Silakan coba kembali.');
    } finally {
      setIsExporting(false);
    }
  };

  const isDeepLearning = plan.curriculum === 'merdeka_deep_learning';
  const isMerdeka = plan.curriculum === 'merdeka' || isDeepLearning;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Banner & Badges */}
      <div className="p-5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            {isDeepLearning ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80">
                <Sparkles className="w-3 h-3 text-teal-600" />
                Merdeka (Deep Learning)
              </span>
            ) : isMerdeka ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                Kurikulum Merdeka
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/80">
                Kurikulum 2013
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
              {plan.level} • {plan.grade}
            </span>
          </div>

          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            T.A. {plan.academicYear}
          </span>
        </div>

        {/* Title & Subject */}
        <h3
          onClick={() => onPreview(plan)}
          className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2"
        >
          {plan.title}
        </h3>

        <div className="mt-2 text-xs text-slate-600 space-y-1">
          <p className="flex items-center gap-1.5 font-medium text-slate-700">
            <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{plan.subject}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal truncate">Topik: {plan.topic}</span>
          </p>

          <p className="flex items-center gap-1.5 text-slate-500">
            <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {plan.schoolIdentity.schoolName} ({plan.schoolIdentity.teacherName || 'Guru Pengampu'})
            </span>
          </p>

          <p className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Alokasi: {plan.timeAllocation || '2 x 35 Menit'}</span>
            <span className="text-slate-300">•</span>
            <span className="truncate">Model: {plan.modelPembelajaran || 'PBL'}</span>
          </p>
        </div>

        {/* Highlights / Profil Pancasila or Nilai Karakter */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(isMerdeka
            ? plan.profilPelajarPancasila?.slice(0, 3) || []
            : plan.nilaiKarakter?.slice(0, 3) || []
          ).map((item, idx) => (
            <span
              key={idx}
              className="inline-block text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/70 rounded px-2 py-0.5 max-w-[200px] truncate"
            >
              {item.split('(')[0].trim()}
            </span>
          ))}
          {((isMerdeka ? plan.profilPelajarPancasila?.length : plan.nilaiKarakter?.length) || 0) > 3 && (
            <span className="text-[11px] text-slate-400 self-center">
              +{((isMerdeka ? plan.profilPelajarPancasila?.length : plan.nilaiKarakter?.length) || 0) - 3} lainnya
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPreview(plan)}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors border border-transparent hover:border-slate-200"
            title="Pratinjau & Cetak Dokumen"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(plan)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-white rounded-md transition-colors border border-transparent hover:border-slate-200"
            title="Edit & Kustomisasi Modul"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(plan)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-md transition-colors border border-transparent hover:border-slate-200"
            title="Duplikat RPP Ini"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Hapus rencana pembelajaran "${plan.title}"?`)) {
                onDelete(plan.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-md transition-colors border border-transparent hover:border-slate-200"
            title="Hapus RPP"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Word Download Button */}
        <button
          onClick={handleDownloadWord}
          disabled={isExporting}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all ${
            downloadSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          title="Download dokumen langsung dalam format Microsoft Word (.docx)"
        >
          {isExporting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Membuat...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tersimpan!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Word</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
