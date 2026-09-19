import React from 'react';
import {
  BookOpen,
  Sparkles,
  Plus,
  Building2,
  Download,
  Upload,
  FileCheck,
} from 'lucide-react';

interface NavbarProps {
  onOpenAIModal: () => void;
  onOpenManualCreate: () => void;
  onOpenSchoolSettings: () => void;
  onExportAllJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalPlans: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAIModal,
  onOpenManualCreate,
  onOpenSchoolSettings,
  onExportAllJson,
  onImportJson,
  totalPlans,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  RPP & Modul Ajar Generator
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  <FileCheck className="w-3 h-3 mr-1" />
                  Format Word (.docx)
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Penyusunan Rencana Pembelajaran Kurikulum Merdeka & K13 Lengkap
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* School Profile Settings */}
            <button
              onClick={onOpenSchoolSettings}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
              title="Atur identitas sekolah, nama guru, kepala sekolah & NIP"
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="hidden lg:inline">Identitas Sekolah</span>
            </button>

            {/* Backup / Export Menu */}
            <div className="hidden sm:flex items-center gap-1">
              <label
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                title="Pulihkan data RPP dari file JSON"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Impor</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportJson}
                  className="hidden"
                />
              </label>

              <button
                onClick={onExportAllJson}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Unduh backup semua RPP dalam format JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Data</span>
              </button>
            </div>

            {/* Create Manual */}
            <button
              onClick={onOpenManualCreate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Buat Manual</span>
            </button>

            {/* AI Generator (Hero action) */}
            <button
              onClick={onOpenAIModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm shadow-blue-600/30 transition-all hover:shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Buat Otomatis (AI)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
