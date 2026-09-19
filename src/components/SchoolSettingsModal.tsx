import React, { useState } from 'react';
import { X, Building2, Save, Check } from 'lucide-react';
import { SchoolIdentity } from '../types';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: SchoolIdentity;
  onSave: (updated: SchoolIdentity) => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  identity,
  onSave,
}) => {
  const [formData, setFormData] = useState<SchoolIdentity>({ ...identity });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof SchoolIdentity, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Identitas Sekolah & Pengesahan</h2>
              <p className="text-xs text-slate-300">
                Data ini akan otomatis muncul pada Kop Dokumen dan Kolom Tanda Tangan Word
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Satuan Pendidikan / Sekolah
            </label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => handleChange('schoolName', e.target.value)}
              placeholder="Contoh: SD Negeri Nusantara 01 / SMP Negeri 2 / SMA Bintang"
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Sekolah
            </label>
            <input
              type="text"
              value={formData.schoolAddress}
              onChange={(e) => handleChange('schoolAddress', e.target.value)}
              placeholder="Contoh: Jl. Merdeka Belajar No. 45, Kecamatan Sukamaju"
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kabupaten / Kota
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Contoh: Bandung, Surabaya, Jakarta Selatan"
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Provinsi
              </label>
              <input
                type="text"
                value={formData.province || ''}
                onChange={(e) => handleChange('province', e.target.value)}
                placeholder="Contoh: Jawa Barat"
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Identitas Guru Mata Pelajaran / Kelas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nama Guru Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => handleChange('teacherName', e.target.value)}
                  placeholder="Contoh: Siti Rahmawati, S.Pd."
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  NIP / NUPTK Guru
                </label>
                <input
                  type="text"
                  value={formData.teacherNip}
                  onChange={(e) => handleChange('teacherNip', e.target.value)}
                  placeholder="Contoh: 19880512 201101 2 008 (atau strip jika belum ada)"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Identitas Kepala Sekolah (Pengesahan)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nama Kepala Sekolah & Gelar
                </label>
                <input
                  type="text"
                  value={formData.principalName}
                  onChange={(e) => handleChange('principalName', e.target.value)}
                  placeholder="Contoh: Drs. H. Ahmad Dahlan, M.Pd."
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={formData.principalNip}
                  onChange={(e) => handleChange('principalNip', e.target.value)}
                  placeholder="Contoh: 19750315 199903 1 004"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
