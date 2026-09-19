import { LessonPlan, SchoolIdentity } from '../types';

export interface GenerateOptions {
  curriculum: 'merdeka' | 'k13' | 'custom';
  level: string;
  grade: string;
  subject: string;
  topic: string;
  subTopic?: string;
  timeAllocation?: string;
  modelPembelajaran?: string;
  specialInstructions?: string;
  semester?: 'Ganjil' | 'Genap';
  academicYear?: string;
  schoolIdentity?: Partial<SchoolIdentity>;
  schoolName?: string;
  teacherName?: string;
  teacherNip?: string;
  principalName?: string;
  principalNip?: string;
  schoolAddress?: string;
  city?: string;
  province?: string;
}

export function generatePedagogicalLessonPlan(options: GenerateOptions): LessonPlan {
  const {
    curriculum = 'merdeka',
    level = 'SD',
    grade = 'Kelas IV',
    subject = 'IPAS',
    topic = 'Ekosistem',
    subTopic = '',
    timeAllocation = '2 x 35 Menit',
    modelPembelajaran = 'Problem Based Learning (PBL)',
    specialInstructions = '',
    semester = 'Ganjil',
    academicYear = '2025/2026',
    schoolIdentity = {},
  } = options;

  const resolvedSchoolName = schoolIdentity.schoolName || options.schoolName || 'SD Negeri 1 Indonesia';
  const resolvedTeacherName = schoolIdentity.teacherName || options.teacherName || 'Guru Teladan, S.Pd.';
  const resolvedTeacherNip = schoolIdentity.teacherNip ?? options.teacherNip ?? '-';
  const resolvedPrincipalName = schoolIdentity.principalName || options.principalName || 'Kepala Sekolah, M.Pd.';
  const resolvedPrincipalNip = schoolIdentity.principalNip ?? options.principalNip ?? '-';
  const resolvedSchoolAddress = schoolIdentity.schoolAddress || options.schoolAddress || 'Jl. Pendidikan Merdeka No. 1';
  const resolvedCity = schoolIdentity.city || options.city || 'Jakarta';
  const resolvedProvince = schoolIdentity.province || options.province || '';
  const resolvedSignatureDate = schoolIdentity.signatureDatePlace || `${resolvedCity}, ${new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`;

  // Compute Fase for Kurikulum Merdeka
  let fase = 'Fase B';
  if (level === 'PAUD') fase = 'Fondasi';
  else if (level === 'SD') {
    if (grade.includes('I') && !grade.includes('IV') && !grade.includes('V') && !grade.includes('VI')) fase = 'Fase A';
    else if (grade.includes('1') || grade.includes('2')) fase = 'Fase A';
    else if (grade.includes('3') || grade.includes('4') || grade.includes('III') || grade.includes('IV')) fase = 'Fase B';
    else fase = 'Fase C';
  } else if (level === 'SMP') {
    fase = 'Fase D';
  } else if (level === 'SMA' || level === 'SMK') {
    if (grade.includes('X') && !grade.includes('XI') && !grade.includes('XII')) fase = 'Fase E';
    else if (grade.includes('10')) fase = 'Fase E';
    else fase = 'Fase F';
  }

  const topicFull = subTopic ? `${topic} (${subTopic})` : topic;
  const isK13 = curriculum === 'k13';

  // Syntax based on modelPembelajaran
  const modelLower = (modelPembelajaran || '').toLowerCase();
  let coreSteps: { phaseName: string; description: string; durationMinutes: number }[] = [];

  if (modelLower.includes('discovery')) {
    coreSteps = [
      {
        phaseName: 'Tahap 1: Pemberian Rangsangan (Stimulation)',
        description: `Guru menampilkan media visual/video kontekstual terkait "${topicFull}". Peserta didik diajak mencermati fenomena dan mencatat hal menarik yang ditemukan.`,
        durationMinutes: 10,
      },
      {
        phaseName: 'Tahap 2: Identifikasi Masalah (Problem Statement)',
        description: `Peserta didik dibimbing merumuskan pertanyaan kunci terkait materi "${topicFull}" dan menyusun dugaan sementara (hipotesis) awal.`,
        durationMinutes: 10,
      },
      {
        phaseName: 'Tahap 3: Pengumpulan Data (Data Collection)',
        description: `Peserta didik bekerja dalam kelompok heterogen membaca buku referensi, melakukan eksperimen/pengamatan, dan mengisi lembar kerja peserta didik (LKPD).`,
        durationMinutes: 15,
      },
      {
        phaseName: 'Tahap 4: Pengolahan Data (Data Processing)',
        description: `Kelompok mendiskusikan temuan, mengklasifikasi data, dan mengaitkannya dengan konsep "${topicFull}" yang sedang dipelajari.`,
        durationMinutes: 15,
      },
      {
        phaseName: 'Tahap 5: Pembuktian (Verification)',
        description: `Perwakilan kelompok mempresentasikan temuan di depan kelas. Kelompok lain memverifikasi dan membandingkan hasil temuan dengan panduan guru.`,
        durationMinutes: 15,
      },
      {
        phaseName: 'Tahap 6: Menarik Kesimpulan (Generalization)',
        description: `Bersama guru, peserta didik menarik kesimpulan umum mengenai prinsip utama materi "${topicFull}" yang berlaku secara universal.`,
        durationMinutes: 10,
      },
    ];
  } else if (modelLower.includes('project') || modelLower.includes('pjbl')) {
    coreSteps = [
      {
        phaseName: 'Tahap 1: Penentuan Pertanyaan Mendasar',
        description: `Guru memaparkan permasalahan nyata di lingkungan sekitar tentang "${topicFull}" dan menstimulasi ide proyek solusi dari peserta didik.`,
        durationMinutes: 15,
      },
      {
        phaseName: 'Tahap 2: Mendesain Perencanaan Proyek',
        description: `Peserta didik dalam kelompok menyepakati rancangan produk/karya, pembagian peran, serta alat dan bahan yang dibutuhkan untuk "${topicFull}".`,
        durationMinutes: 15,
      },
      {
        phaseName: 'Tahap 3: Menyusun Jadwal & Alur Pembuatan',
        description: `Kelompok menjadwalkan tahapan pengerjaan proyek dari tahap rancangan, uji coba, hingga penyelesaian akhir secara rinci.`,
        durationMinutes: 10,
      },
      {
        phaseName: 'Tahap 4: Memonitor Keaktifan & Progres Proyek',
        description: `Guru berkeliling memfasilitasi pembuatan proyek, memantau keterlibatan setiap anggota kelompok, serta memberikan umpan balik langsung.`,
        durationMinutes: 20,
      },
      {
        phaseName: 'Tahap 5: Menguji Hasil & Gelar Karya',
        description: `Setiap kelompok memamerkan dan mendemonstrasikan hasil karya mereka di hadapan teman sekelas dengan percaya diri.`,
        durationMinutes: 10,
      },
      {
        phaseName: 'Tahap 6: Evaluasi Pengalaman Belajar',
        description: `Peserta didik dan guru melakukan refleksi terhadap proses perancangan, kendala yang dihadapi, dan pelajaran berharga yang diperoleh.`,
        durationMinutes: 10,
      },
    ];
  } else if (modelLower.includes('inquiry') || modelLower.includes('inkuiri')) {
    coreSteps = [
      {
        phaseName: 'Tahap 1: Orientasi Lapangan / Masalah',
        description: `Guru menyajikan fenomena yang membangkitkan rasa ingin tahu peserta didik seputar "${topicFull}".`,
        durationMinutes: 10,
      },
      {
        phaseName: 'Tahap 2: Merumuskan Masalah',
        description: `Peserta didik secara kritis merumuskan pertanyaan penyelidikan yang dapat diuji melalui observasi materi "${topicFull}".`,
        durationMinutes: 10,
      },
      {
        phaseName: 'Tahap 3: Merumuskan Hipotesis',
        description: `Peserta didik membuat dugaan jawaban sementara berlandaskan pengetahuan awal yang dimiliki.`,
        durationMinutes: 10,
      },
      {
        phaseName: 'Tahap 4: Mengumpulkan Data & Fakta',
        description: `Peserta didik mengeksplorasi sumber belajar, menguji hipotesis, dan mencatat data penyelidikan pada LKPD.`,
        durationMinutes: 25,
      },
      {
        phaseName: 'Tahap 5: Menguji Hipotesis & Kesimpulan',
        description: `Peserta didik mencocokkan hasil data dengan hipotesis awal dan menyimpulkan temuan dengan bimbingan guru.`,
        durationMinutes: 15,
      },
    ];
  } else {
    // Default: Problem Based Learning (PBL)
    coreSteps = [
      {
        phaseName: 'Fase 1: Orientasi Peserta Didik pada Masalah',
        description: `Guru menyajikan video atau studi kasus kontekstual terkait "${topicFull}". Peserta didik diajak mengamati dan merumuskan masalah mendasar yang dihadapi.`,
        durationMinutes: 10,
      },
      {
        phaseName: 'Fase 2: Mengorganisasikan Peserta Didik untuk Belajar',
        description: `Peserta didik dibagi ke dalam kelompok kolaboratif (4-5 siswa). Guru membagikan LKPD dan memastikan setiap anggota memahami peran dan fokus penyelidikan.`,
        durationMinutes: 10,
      },
      {
        phaseName: 'Fase 3: Membimbing Penyelidikan Mandiri & Kelompok',
        description: `Guru mendampingi kelompok mencari informasi dari buku paket, artikel, atau modul pembelajaran. Guru menerapkan diferensiasi proses bagi siswa yang memerlukan bimbingan tambahan.`,
        durationMinutes: 25,
      },
      {
        phaseName: 'Fase 4: Mengembangkan & Menyajikan Hasil Karya',
        description: `Masing-masing kelompok menyusun laporan pemecahan masalah materi "${topicFull}" pada kertas kerja dan mempresentasikannya di depan kelas secara bergantian.`,
        durationMinutes: 15,
      },
      {
        phaseName: 'Fase 5: Menganalisis & Mengevaluasi Proses Pemecahan Masalah',
        description: `Guru dan peserta didik mengevaluasi solusi yang dipaparkan, meluruskan miskonsepsi, dan merangkum konsep inti pembelajaran secara bermakna.`,
        durationMinutes: 10,
      },
    ];
  }

  const generatedId = `rpp-${Date.now()}`;
  const title = isK13
    ? `RPP ${subject} - ${topic} (${grade})`
    : `Modul Ajar ${subject} - ${topic} (${fase})`;

  const lessonPlan: LessonPlan = {
    id: generatedId,
    title,
    curriculum,
    level: level as any,
    grade,
    fase,
    subject,
    topic,
    subTopic,
    semester,
    academicYear,
    meetingCount: 1,
    timeAllocation,
    schoolIdentity: {
      schoolName: resolvedSchoolName,
      schoolAddress: resolvedSchoolAddress,
      city: resolvedCity,
      province: resolvedProvince,
      teacherName: resolvedTeacherName,
      teacherNip: resolvedTeacherNip,
      principalName: resolvedPrincipalName,
      principalNip: resolvedPrincipalNip,
      signatureDatePlace: resolvedSignatureDate,
    },
    capaianPembelajaran: isK13
      ? ''
      : `Peserta didik mampu memahami, menganalisis, dan mengaplikasikan konsep ${subject} khususnya materi ${topicFull} dalam kehidupan sehari-hari serta mampu memecahkan masalah kontekstual secara kritis dan mandiri.`,
    tujuanPembelajaran: [
      `Melalui tayangan media dan pengamatan kontekstual, peserta didik mampu mengidentifikasi konsep dasar ${topicFull} dengan benar dan tepat.`,
      `Melalui diskusi kelompok dan pengerjaan LKPD, peserta didik mampu menganalisis hubungan antar-unsur materi ${topicFull} secara kritis dan terstruktur.`,
      `Peserta didik mampu mempresentasikan hasil karya pemecahan masalah terkait ${topicFull} di depan kelas dengan bahasa yang santun dan percaya diri.`,
    ],
    indikatorKetercapaian: [
      `Menyebutkan konsep dan komponen utama materi ${topicFull} secara tepat.`,
      `Mengaitkan materi ${topicFull} dengan peristiwa nyata di lingkungan sekitar peserta didik.`,
      `Menyelesaikan tugas penyelidikan pada LKPD dengan ketepatan analisis minimal 75%.`,
    ],
    profilPelajarPancasila: isK13
      ? []
      : [
          'Bernalar Kritis (mampu memproses informasi, mengidentifikasi masalah, dan mengambil kesimpulan logis)',
          'Bergotong Royong (aktif berkolaborasi dan saling menghargai pendapat dalam kerja kelompok)',
          'Kreatif (mampu memodifikasi dan menghasilkan karya pemecahan masalah yang orisinal)',
        ],
    saranaPrasarana:
      'Papan tulis, LCD Proyektor/Laptop, Lembar Kerja Peserta Didik (LKPD), Buku Teks Siswa Kemendikbud, Spidol, dan Media Peraga Kontekstual.',
    targetPesertaDidik: 'Peserta Didik Reguler / Tipikal (Umum, tidak ada kesulitan belajar spesifik).',
    modelPembelajaran,
    metodePembelajaran: 'Diskusi Kelompok, Tanya Jawab, Penyelidikan Kontekstual, Presentasi, dan Penugasan Terbimbing.',
    pemahamanBermakna: isK13
      ? ''
      : `Pemahaman tentang ${topicFull} membantu peserta didik menyadari pentingnya keteraturan, sebab-akibat, dan penerapannya dalam menyelesaikan masalah praktis di lingkungan sekitar.`,
    pertanyaanPemantik: isK13
      ? []
      : [
          `Pernahkah kalian mengamati atau mengalami peristiwa terkait ${topicFull} dalam kehidupan sehari-hari?`,
          `Mengapa menurut kalian materi ${topicFull} ini sangat penting untuk kita pahami bersama?`,
          `Apa akibatnya jika kita tidak memahami prinsip dasar ${topicFull} ini dengan benar?`,
        ],
    kompetensiInti: isK13
      ? {
          ki1: 'Menghargai dan menghayati ajaran agama yang dianutnya.',
          ki2: 'Menunjukkan perilaku jujur, disiplin, tanggung jawab, santun, peduli, dan percaya diri dalam berinteraksi dengan lingkungan keluarga, teman, guru, dan tetangga.',
          ki3: `Memahami pengetahuan faktual dan konseptual tentang materi ${topicFull} berdasarkan rasa ingin tahu tentang dirinya, makhluk ciptaan Tuhan dan kegiatannya, dan benda-benda yang dijumpainya.`,
          ki4: `Menyajikan pengetahuan faktual dan konseptual dalam bahasa yang jelas, sistematis, dan logis, dalam karya yang estetis, dalam gerakan yang mencerminkan anak sehat, dan dalam tindakan yang mencerminkan perilaku anak beriman dan berakhlak mulia.`,
        }
      : undefined,
    kompetensiDasar: isK13
      ? [
          `3.1 Memahami prinsip dan konsep dasar terkait ${topicFull}.`,
          `4.1 Menyajikan hasil pengamatan dan penyelesaian masalah terkait ${topicFull}.`,
        ]
      : undefined,
    nilaiKarakter: isK13
      ? ['Religius', 'Nasionalis', 'Mandiri', 'Gotong Royong', 'Integritas']
      : undefined,
    kegiatanPendahuluan: [
      {
        id: 'pen-1',
        phaseName: '1. Orientasi & Doa Bersama',
        description:
          'Guru membuka kelas dengan salam hangat, menanyakan kabar siswa, berdoa bersama dipimpin salah satu peserta didik, dan memeriksa kehadiran.',
        durationMinutes: 3,
      },
      {
        id: 'pen-2',
        phaseName: '2. Apersepsi & Kaitan Pembelajaran',
        description: `Guru mengaitkan materi sebelumnya dengan topik hari ini (${topicFull}) melalui pertanyaan pemantik kontekstual.`,
        durationMinutes: 4,
      },
      {
        id: 'pen-3',
        phaseName: '3. Motivasi & Penyampaian Tujuan',
        description: `Guru menyampaikan tujuan pembelajaran, manfaat mempelajari ${topicFull}, serta langkah kegiatan yang akan dilalui peserta didik hari ini.`,
        durationMinutes: 3,
      },
    ],
    kegiatanInti: coreSteps.map((step, idx) => ({
      id: `inti-${idx + 1}`,
      phaseName: step.phaseName,
      description: step.description,
      durationMinutes: step.durationMinutes,
    })),
    kegiatanPenutup: [
      {
        id: 'tut-1',
        phaseName: '1. Refleksi & Simpulan Bersama',
        description: `Peserta didik bersama guru menyimpulkan butir-butir penting materi "${topicFull}" dan merefleksikan pengalaman belajar yang paling berkesan.`,
        durationMinutes: 4,
      },
      {
        id: 'tut-2',
        phaseName: '2. Umpan Balik & Asesmen Ringkas',
        description:
          'Guru memberikan apresiasi kepada seluruh kelompok atas partisipasi aktif dan memberikan kuis lisan singkat sebagai penguatan materi.',
        durationMinutes: 4,
      },
      {
        id: 'tut-3',
        phaseName: '3. Tindak Lanjut & Doa Penutup',
        description:
          'Guru menyampaikan topik untuk pertemuan berikutnya, memberikan arahan tugas rumah jika diperlukan, dan menutup pembelajaran dengan doa bersama.',
        durationMinutes: 2,
      },
    ],
    asesmenDiagnostik:
      'Pertanyaan apersepsi lisan di awal pembelajaran untuk memetakan kesiapan belajar siswa.',
    asesmenFormatif:
      'Penilaian observasi keaktifan diskusi kelompok, unjuk kerja saat presentasi, dan ketepatan pengerjaan LKPD.',
    asesmenSumatif:
      'Tes tertulis berupa soal uraian pemecahan masalah di akhir bab/lingkup materi.',
    rubrikPenilaian: [
      {
        id: 'rub-1',
        criteria: `Penguasaan Konsep ${topic}`,
        needsGuidance: 'Belum mampu menjelaskan konsep dasar dengan benar (< 60).',
        developing: 'Mampu menjelaskan sebagian konsep namun masih memerlukan bimbingan guru (60-74).',
        proficient: 'Mampu menjelaskan konsep secara runut dan tepat sesuai capaian materi (75-89).',
        advanced: 'Sangat menguasai konsep dan mampu memberikan contoh penerapan baru secara mandiri (90-100).',
      },
      {
        id: 'rub-2',
        criteria: 'Keterampilan Kolaborasi & Kerja Kelompok',
        needsGuidance: 'Pasif dan tidak berkontribusi dalam penyelesaian tugas kelompok.',
        developing: 'Kurang aktif namun mau menerima tugas pembagian kelompok.',
        proficient: 'Aktif berdiskusi, saling menghargai pendapat, dan bekerja sama dengan baik.',
        advanced: 'Menunjukkan jiwa kepemimpinan positif, memotivasi teman, dan menjaga kekompakan kelompok.',
      },
      {
        id: 'rub-3',
        criteria: 'Kemampuan Komunikasi & Presentasi',
        needsGuidance: 'Menyampaikan hasil kerja dengan ragu-ragu dan belum terstruktur.',
        developing: 'Menyampaikan hasil kerja cukup jelas namun masih membaca catatan penuh.',
        proficient: 'Menyampaikan presentasi dengan suara jelas, runtut, dan mampu merespons pertanyaan.',
        advanced: 'Presentasi sangat komunikatif, percaya diri tinggi, dan argumentasi logis serta meyakinkan.',
      },
    ],
    lkpd: {
      title: `Lembar Kerja Peserta Didik (LKPD): Penyelidikan Konsep ${topicFull}`,
      instructions:
        'Petunjuk Pengerjaan:\n1. Tuliskan identitas kelompok dan nama anggota pada kolom yang disediakan.\n2. Baca secara saksama setiap pertanyaan dan studi kasus yang diberikan.\n3. Diskusikan jawaban bersama kelompok Anda dan tuliskan kesimpulan dengan rapi.\n4. Siapkan perwakilan kelompok untuk memaparkan hasil diskusi di depan kelas.',
      tasks: [
        `Amatilah fenomena atau masalah terkait "${topicFull}" yang disajikan oleh guru di depan kelas!`,
        `Identifikasi minimal 3 (tiga) komponen atau faktor penting yang memengaruhi "${topicFull}"!`,
        `Diskusikan bersama kelompok: Apa dampak positif atau negatif jika salah satu faktor tersebut mengalami perubahan?`,
        `Tuliskan usulan solusi kreatif dari kelompok Anda untuk mengatasi permasalahan tersebut!`,
      ],
    },
    ringkasanMateri: `Materi "${topicFull}" membahas keterkaitan fundamental dalam mata pelajaran ${subject} pada jenjang ${level} (${grade}). Pemahaman terhadap materi ini membentuk kemampuan berpikir kritis peserta didik dalam memecahkan masalah kontekstual melalui penalaran ilmiah dan kerja sama tim.`,
    remedialDanPengayaan: {
      remedial:
        'Bagi peserta didik yang belum mencapai kriteria ketuntasan (indikator minimal), guru memberikan pendampingan personal atau belajar kelompok terarah dengan menyederhanakan tugas pengerjaan konsep kunci.',
      pengayaan:
        'Bagi peserta didik yang telah mencapai ketuntasan dengan nilai tinggi, diberikan tantangan studi kasus lanjutan berupa investigasi mendalam atau pembuatan infografis digital tentang materi terkait.',
    },
    glosarium: [
      `${topic}: Lingkup materi pokok yang dipelajari dalam modul ajar ini.`,
      'LKPD: Lembar Kerja Peserta Didik yang dirancang untuk membimbing proses penyelidikan mandiri/kelompok.',
      'Diferensiasi: Pendekatan pembelajaran yang disesuaikan dengan minat, profil belajar, dan kesiapan peserta didik.',
    ],
    daftarPustaka: [
      'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia. (2024). Buku Panduan Guru dan Buku Siswa. Jakarta: Pusat Kurikulum dan Perbukuan.',
      'Keputusan Kepala BSKAP No. 032/H/KR/2024 tentang Capaian Pembelajaran pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah.',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return lessonPlan;
}
