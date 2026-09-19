export type CurriculumType = 'merdeka' | 'merdeka_deep_learning' | 'k13' | 'custom';

export type EducationLevel = 'SD' | 'SMP' | 'SMA' | 'SMK' | 'PAUD';

export interface SchoolIdentity {
  schoolName: string;
  schoolAddress: string;
  city: string;
  province?: string;
  teacherName: string;
  teacherNip: string;
  principalName: string;
  principalNip: string;
  signatureDatePlace: string;
}

export interface ActivityStep {
  id: string;
  phaseName: string; // e.g. "Orientasi & Apersepsi", "Sintaks 1: Orientasi Siswa pada Masalah", dll
  description: string;
  durationMinutes: number;
}

export interface AssessmentRubricItem {
  id: string;
  criteria: string;
  needsGuidance: string; // Skor 1 / Perlu Bimbingan
  developing: string;    // Skor 2 / Cukup (Berkembang)
  proficient: string;    // Skor 3 / Baik (Layak/Cakap)
  advanced: string;      // Skor 4 / Sangat Baik (Mahir)
}

export interface PertemuanDetail {
  pertemuanKe: number;
  fokusMateri?: string;
  alokasiWaktu?: string;
  kegiatanPendahuluan?: ActivityStep[];
  kegiatanInti?: ActivityStep[];
  kegiatanPenutup?: ActivityStep[];
}

export interface LessonPlan {
  id: string;
  title: string;
  curriculum: CurriculumType;
  level: EducationLevel;
  grade: string;          // e.g. "Kelas IV (Fase B)", "Kelas VII (Fase D)", "Kelas X"
  subject: string;        // e.g. "Matematika", "IPAS", "Bahasa Indonesia", "Informatika"
  topic: string;          // e.g. "Pecahan Senilai dan Operasi Hitung", "Ekosistem dan Rantai Makanan"
  subTopic?: string;
  semester: 'Ganjil' | 'Genap';
  academicYear: string;   // e.g. "2025/2026"
  meetingCount: number;   // e.g. 1 pertemuan atau 2 pertemuan
  timeAllocation: string; // e.g. "2 x 35 Menit (1 Pertemuan)", "3 x 45 Menit"
  
  // Identitas & Kop Sekolah
  schoolIdentity: SchoolIdentity;

  // Komponen Kurikulum Merdeka
  fase?: string;          // Fase A, B, C, D, E, F
  capaianPembelajaran?: string;
  tujuanPembelajaran: string[];
  indikatorKetercapaian?: string[];
  profilPelajarPancasila?: string[]; // Beriman, Mandiri, Bernalar Kritis, Kreatif, Bergotong Royong, Berkebhinekaan Global
  saranaPrasarana?: string;
  targetPesertaDidik?: string; // Reguler, Cerdas Istimewa, Hambatan Belajar
  modelPembelajaran?: string;  // Problem Based Learning (PBL), Project Based Learning (PjBL), Discovery Learning, Inkuiri, dll
  metodePembelajaran?: string; // Diskusi, Penugasan, Demonstrasi, Eksperimen
  pemahamanBermakna?: string;
  pertanyaanPemantik?: string[];

  // Komponen Deep Learning (Mindful, Meaningful, Joyful Learning)
  deepLearningElements?: {
    mindfulLearning?: string;   // Pembelajaran Berkesadaran (kesadaran penuh, mendengarkan aktif, menghargai keunikan siswa)
    meaningfulLearning?: string; // Pembelajaran Bermakna (kontekstual, terhubung dunia nyata, pemecahan masalah otentik)
    joyfulLearning?: string;    // Pembelajaran Menggembirakan (antusiasme, kepuasan belajar, apresiasi proses)
  };

  // Komponen K13 (Jika memilih K13)
  kompetensiInti?: {
    ki1?: string; // Sikap Spiritual
    ki2?: string; // Sikap Sosial
    ki3?: string; // Pengetahuan
    ki4?: string; // Keterampilan
  };
  kompetensiDasar?: string[];
  indikatorK13?: string[];
  nilaiKarakter?: string[]; // Religius, Nasionalis, Mandiri, Gotong Royong, Integritas

  // Kegiatan Pembelajaran
  kegiatanPendahuluan: ActivityStep[];
  kegiatanInti: ActivityStep[];
  kegiatanPenutup: ActivityStep[];
  pertemuanList?: PertemuanDetail[];

  // Asesmen & Penilaian
  asesmenDiagnostik?: string;
  asesmenFormatif?: string;
  asesmenSumatif?: string;
  rubrikPenilaian: AssessmentRubricItem[];

  // Lampiran
  lkpd: {
    title: string;
    instructions: string;
    tasks: string[];
  };
  ringkasanMateri?: string;
  remedialDanPengayaan?: {
    remedial: string;
    pengayaan: string;
  };
  glosarium?: string[];
  daftarPustaka?: string[];

  // Kustomisasi tambahan jika kurikulum custom
  customNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateRPPRequest {
  curriculum: CurriculumType;
  level: EducationLevel;
  grade: string;
  subject: string;
  topic: string;
  subTopic?: string;
  timeAllocation: string;
  meetingCount?: number;
  modelPembelajaran?: string;
  specialInstructions?: string;
  schoolName?: string;
  teacherName?: string;
}
