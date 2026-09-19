import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { generatePedagogicalLessonPlan } from './src/services/pedagogicalFallback';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to check if an error from Gemini is transient / high demand
const isTransientError = (err: any): boolean => {
  if (!err) return false;
  const status = err.status || err.statusCode || err.code;
  if (status === 503 || status === 429 || status === 500 || status === 'UNAVAILABLE') return true;
  const str = String(err?.message || err?.status || err || '').toLowerCase();
  return (
    str.includes('503') ||
    str.includes('high demand') ||
    str.includes('unavailable') ||
    str.includes('resource exhausted') ||
    str.includes('quota') ||
    str.includes('rate limit') ||
    str.includes('overloaded') ||
    str.includes('temporarily unavailable')
  );
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Initialize Gemini SDK with User-Agent header as required
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Resilient caller with exponential backoff and model fallback
async function generateWithGeminiResilient(
  ai: GoogleGenAI,
  systemPrompt: string,
  userPrompt: string,
  schema: any,
) {
  // Primary model is gemini-3.8-flash, backup is gemini-flash-latest
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[Gemini API] Requesting ${model} (attempt ${attempt}/3)...`);
        const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        });

        if (response && response.text) {
          console.log(`[Gemini API] Success with ${model} on attempt ${attempt}`);
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        console.warn(`[Gemini API] Failed with ${model} (attempt ${attempt}/3): ${msg}`);

        if (isTransientError(err) && attempt < 3) {
          const waitTime = attempt * 1500 + Math.floor(Math.random() * 800);
          console.log(`[Gemini API] Transient error (503/429/UNAVAILABLE). Retrying in ${waitTime}ms...`);
          await sleep(waitTime);
        } else if (!isTransientError(err)) {
          // If non-transient, don't repeat on same model
          break;
        }
      }
    }
  }

  throw lastError;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: Generate RPP / Modul Ajar with Gemini AI + Resilient Fallback
app.post('/api/generate-rpp', async (req, res) => {
  const {
    curriculum = 'merdeka',
    level = 'SD',
    grade = 'Kelas IV',
    subject = 'IPAS',
    topic = 'Ekosistem',
    subTopic = '',
    timeAllocation = '2 x 35 Menit',
    meetingCount = 1,
    modelPembelajaran = 'Problem Based Learning (PBL)',
    specialInstructions = '',
    semester = 'Ganjil',
    academicYear = '2025/2026',
    schoolIdentity = {},
    schoolName = schoolIdentity?.schoolName || 'SD Negeri 1 Indonesia',
    teacherName = schoolIdentity?.teacherName || 'Guru Teladan, S.Pd.',
    city = schoolIdentity?.city || 'Jakarta',
    forceFallback = false,
  } = req.body;

  const resolvedMeetingCount = Math.max(1, Number(meetingCount) || 1);

  // Fully resolve SchoolIdentity with priority on incoming user customized data
  const resolvedSchoolIdentity = {
    schoolName: schoolIdentity.schoolName || schoolName || 'SD Negeri 1 Indonesia',
    schoolAddress: schoolIdentity.schoolAddress || 'Jl. Pendidikan Merdeka No. 1',
    city: schoolIdentity.city || city || 'Jakarta',
    province: schoolIdentity.province || '',
    teacherName: schoolIdentity.teacherName || teacherName || 'Guru Teladan, S.Pd.',
    teacherNip: schoolIdentity.teacherNip !== undefined && schoolIdentity.teacherNip !== null ? String(schoolIdentity.teacherNip) : '-',
    principalName: schoolIdentity.principalName || 'Kepala Sekolah, M.Pd.',
    principalNip: schoolIdentity.principalNip !== undefined && schoolIdentity.principalNip !== null ? String(schoolIdentity.principalNip) : '-',
    signatureDatePlace: schoolIdentity.signatureDatePlace || `${schoolIdentity.city || city || 'Jakarta'}, ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
  };

  // Immediate fast-track pedagogical generator if requested
  if (forceFallback) {
    const fallbackPlan = generatePedagogicalLessonPlan({
      curriculum,
      level,
      grade,
      subject,
      topic,
      subTopic,
      timeAllocation,
      meetingCount: resolvedMeetingCount,
      modelPembelajaran,
      specialInstructions,
      semester,
      academicYear,
      schoolIdentity: resolvedSchoolIdentity,
    });
    return res.json({
      success: true,
      lessonPlan: fallbackPlan,
      isFallback: true,
      message: 'Perangkat ajar berhasil disusun berdasarkan standar kurikulum nasional.',
    });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // If no API key is provided, gracefully provide standard curriculum template rather than crashing
    const fallbackPlan = generatePedagogicalLessonPlan({
      curriculum,
      level,
      grade,
      subject,
      topic,
      subTopic,
      timeAllocation,
      meetingCount: resolvedMeetingCount,
      modelPembelajaran,
      specialInstructions,
      semester,
      academicYear,
      schoolIdentity: resolvedSchoolIdentity,
    });
    return res.json({
      success: true,
      lessonPlan: fallbackPlan,
      isFallback: true,
      message: 'Kunci API belum diatur. Dokumen disusun menggunakan standar resmi kurikulum Indonesia.',
    });
  }

  try {
    const systemPrompt = `Anda adalah pakar kurikulum pendidikan Indonesia, instruktur guru nasional, dan pengembang perangkat ajar Kemendikbudristek.
Tugas Anda adalah merancang dokumen Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar yang lengkap, mendalam, pedagogis, berbasis diferensiasi, dan siap digunakan guru di kelas nyata sesuai standar kurikulum Indonesia.

Aturan Pembuatan:
1. Jika Kurikulum Merdeka (Standar atau Deep Learning):
   - Gunakan istilah Modul Ajar, Fase sesuai kelas (Fase A: Kls 1-2, Fase B: Kls 3-4, Fase C: Kls 5-6, Fase D: Kls 7-9, Fase E: Kls 10, Fase F: Kls 11-12).
   - Tuliskan Capaian Pembelajaran (CP) yang komprehensif.
   - Cantumkan minimal 3 Tujuan Pembelajaran bergradasi taksonomi Bloom (C1-C4/C6) dengan formula ABCD (Audience, Behavior, Condition, Degree).
   - Pilih dimensi Profil Pelajar Pancasila yang relevan beserta deskripsi singkatnya.
   - Sediakan Pemahaman Bermakna (konseptual & kontekstual) serta minimal 3 Pertanyaan Pemantik yang memicu nalar kritis.
   - Langkah Kegiatan Inti WAJIB mengikuti sintaks model pembelajaran terpilih (misal: jika PBL: 1. Orientasi masalah, 2. Organisasi belajar, 3. Penyelidikan, 4. Penyajian karya, 5. Evaluasi proses).
2. Jika Kurikulum Merdeka (Deep Learning):
   - Terapkan 3 Pilar Deep Learning Kemendikdasmen (Mindful Learning, Meaningful Learning, Joyful Learning).
   - Mindful Learning: Mengembangkan kesadaran penuh, mendengarkan aktif, menghargai keunikan siswa, dan latihan pemusatan perhatian/kehadiran utuh.
   - Meaningful Learning: Menghubungkan konsep secara mendalam dengan realitas kehidupan siswa dan pemecahan masalah otentik, bukan sekadar hafalan.
   - Joyful Learning: Pembelajaran yang menggembirakan, membangkitkan rasa ingin tahu (curiosity), penuh antusiasme, aman secara emosional, dan merayakan proses belajar.
   - Wajib isi properti 'deepLearningElements' { mindfulLearning, meaningfulLearning, joyfulLearning } serta cantumkan sentuhan Mindful, Meaningful, dan Joyful dalam langkah-langkah kegiatan.
3. Jika Kurikulum 2013 (K13):
   - Gunakan KI 1 (Spiritual), KI 2 (Sosial), KI 3 (Pengetahuan), KI 4 (Keterampilan).
   - Cantumkan Kompetensi Dasar (KD) dan Indikator Pencapaian Kompetensi (IPK).
   - Pendekatan Saintifik (5M: Mengamati, Menanya, Mengumpulkan informasi, Menalar/Mengasosiasi, Mengomunikasikan).
4. Ketentuan Alokasi Pertemuan (${resolvedMeetingCount} Pertemuan):
   - Jika jumlah pertemuan > 1, sediakan array pertemuanList berisi rincian Pertemuan 1 s.d ${resolvedMeetingCount}.
   - Setiap pertemuan memiliki fokus materi bertahap (progresif), kegiatan pendahuluan, kegiatan inti sesuai tahapan sintaks, dan penutup.
   - Cantumkan estimasi menit di setiap langkah.
5. Selalu sertakan:
   - Asesmen Diagnostik, Formatif, dan Sumatif.
   - Rubrik penilaian dengan 4 skala kriteria yang jelas (Perlu Bimbingan, Cukup/Berkembang, Baik/Cakap, Sangat Baik/Mahir).
   - LKPD (Lembar Kerja Peserta Didik) yang kontekstual, menarik, dan menantang.
   - Ringkasan materi ajar, glosarium, serta referensi buku guru/siswa Kemendikbud.

Pastikan output berupa format JSON yang valid.`;

    const userPrompt = `Buatkan RPP / Modul Ajar lengkap dengan spesifikasi:
- Kurikulum: ${curriculum === 'merdeka_deep_learning' ? 'Kurikulum Merdeka dengan Pendekatan Deep Learning (Mindful, Meaningful, Joyful Learning)' : curriculum === 'merdeka' ? 'Kurikulum Merdeka (Modul Ajar Standar)' : curriculum === 'k13' ? 'Kurikulum 2013 Revisi' : 'Kurikulum Kustom'}
- Jenjang: ${level}
- Kelas: ${grade}
- Mata Pelajaran: ${subject}
- Topik / Materi: ${topic} ${subTopic ? `(Sub-topik: ${subTopic})` : ''}
- Semester: ${semester}
- Tahun Pelajaran: ${academicYear}
- Jumlah Pertemuan: ${resolvedMeetingCount} Pertemuan
- Total Alokasi Waktu: ${timeAllocation}
- Model Pembelajaran: ${modelPembelajaran}
- Satuan Pendidikan: ${resolvedSchoolIdentity.schoolName}
- Nama Guru / Penyusun: ${resolvedSchoolIdentity.teacherName} (NIP: ${resolvedSchoolIdentity.teacherNip})
- Kepala Sekolah: ${resolvedSchoolIdentity.principalName} (NIP: ${resolvedSchoolIdentity.principalNip})
- Kota: ${resolvedSchoolIdentity.city}
${resolvedMeetingCount > 1 ? `- PENTING: Distribusikan aktivitas pembelajaran secara terperinci ke dalam ${resolvedMeetingCount} pertemuan pada properti 'pertemuanList'.` : ''}
${curriculum === 'merdeka_deep_learning' ? '- PENTING DEEP LEARNING: Sediakan analisis mendalam untuk properti deepLearningElements (mindfulLearning, meaningfulLearning, joyfulLearning) serta integrasikan ke kegiatan pembelajaran!' : ''}
${specialInstructions ? `- Catatan Khusus Guru: ${specialInstructions}` : ''}`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        fase: { type: Type.STRING },
        capaianPembelajaran: { type: Type.STRING },
        tujuanPembelajaran: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        indikatorKetercapaian: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        profilPelajarPancasila: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        saranaPrasarana: { type: Type.STRING },
        targetPesertaDidik: { type: Type.STRING },
        modelPembelajaran: { type: Type.STRING },
        metodePembelajaran: { type: Type.STRING },
        pemahamanBermakna: { type: Type.STRING },
        pertanyaanPemantik: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        deepLearningElements: {
          type: Type.OBJECT,
          properties: {
            mindfulLearning: { type: Type.STRING },
            meaningfulLearning: { type: Type.STRING },
            joyfulLearning: { type: Type.STRING },
          },
        },
        kompetensiInti: {
          type: Type.OBJECT,
          properties: {
            ki1: { type: Type.STRING },
            ki2: { type: Type.STRING },
            ki3: { type: Type.STRING },
            ki4: { type: Type.STRING },
          },
        },
        kompetensiDasar: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        nilaiKarakter: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        kegiatanPendahuluan: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phaseName: { type: Type.STRING },
              description: { type: Type.STRING },
              durationMinutes: { type: Type.INTEGER },
            },
            required: ['phaseName', 'description', 'durationMinutes'],
          },
        },
        kegiatanInti: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phaseName: { type: Type.STRING },
              description: { type: Type.STRING },
              durationMinutes: { type: Type.INTEGER },
            },
            required: ['phaseName', 'description', 'durationMinutes'],
          },
        },
        kegiatanPenutup: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phaseName: { type: Type.STRING },
              description: { type: Type.STRING },
              durationMinutes: { type: Type.INTEGER },
            },
            required: ['phaseName', 'description', 'durationMinutes'],
          },
        },
        meetingCount: { type: Type.INTEGER },
        pertemuanList: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pertemuanKe: { type: Type.INTEGER },
              fokusMateri: { type: Type.STRING },
              alokasiWaktu: { type: Type.STRING },
              kegiatanPendahuluan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER },
                  },
                  required: ['phaseName', 'description', 'durationMinutes'],
                },
              },
              kegiatanInti: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER },
                  },
                  required: ['phaseName', 'description', 'durationMinutes'],
                },
              },
              kegiatanPenutup: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER },
                  },
                  required: ['phaseName', 'description', 'durationMinutes'],
                },
              },
            },
            required: ['pertemuanKe', 'kegiatanPendahuluan', 'kegiatanInti', 'kegiatanPenutup'],
          },
        },
        asesmenDiagnostik: { type: Type.STRING },
        asesmenFormatif: { type: Type.STRING },
        asesmenSumatif: { type: Type.STRING },
        rubrikPenilaian: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              criteria: { type: Type.STRING },
              needsGuidance: { type: Type.STRING },
              developing: { type: Type.STRING },
              proficient: { type: Type.STRING },
              advanced: { type: Type.STRING },
            },
            required: ['criteria', 'needsGuidance', 'developing', 'proficient', 'advanced'],
          },
        },
        lkpd: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            instructions: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'instructions', 'tasks'],
        },
        ringkasanMateri: { type: Type.STRING },
        remedialDanPengayaan: {
          type: Type.OBJECT,
          properties: {
            remedial: { type: Type.STRING },
            pengayaan: { type: Type.STRING },
          },
        },
        glosarium: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        daftarPustaka: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: [
        'title',
        'tujuanPembelajaran',
        'kegiatanPendahuluan',
        'kegiatanInti',
        'kegiatanPenutup',
        'rubrikPenilaian',
        'lkpd',
      ],
    };

    let resultText = '';
    try {
      const result = await generateWithGeminiResilient(ai, systemPrompt, userPrompt, schema);
      resultText = result.text;
    } catch (genError: any) {
      console.warn('[Gemini API] Primary generation exhausted or unavailable:', genError?.message || genError);
      
      // If 503 or unavailable, gracefully fall back to pedagogical template so teacher is NEVER blocked!
      const fallbackPlan = generatePedagogicalLessonPlan({
        curriculum,
        level,
        grade,
        subject,
        topic,
        subTopic,
        timeAllocation,
        meetingCount: resolvedMeetingCount,
        modelPembelajaran,
        specialInstructions,
        semester,
        academicYear,
        schoolIdentity: resolvedSchoolIdentity,
      });

      return res.json({
        success: true,
        lessonPlan: fallbackPlan,
        isFallback: true,
        message: 'Layanan AI sedang mengalami antrean tinggi (503). Perangkat ajar berhasil disusun dengan struktur standar Kemendikbudristek dan siap diedit.',
      });
    }

    let cleanJson = (resultText || '{}').trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedData = JSON.parse(cleanJson);
    const parsedMeetingCount = Math.max(1, Number(parsedData.meetingCount) || resolvedMeetingCount);

    // Parse or synthesize multi-meeting list
    let mappedPertemuanList = Array.isArray(parsedData.pertemuanList) && parsedData.pertemuanList.length > 0
      ? parsedData.pertemuanList.map((p: any, idx: number) => ({
          pertemuanKe: Number(p.pertemuanKe) || idx + 1,
          fokusMateri: p.fokusMateri || `Pertemuan ${idx + 1}: Pendalaman Materi ${topic}`,
          alokasiWaktu: p.alokasiWaktu || (parsedMeetingCount > 1 ? `${timeAllocation} (Pertemuan ke-${idx + 1})` : timeAllocation),
          kegiatanPendahuluan: (p.kegiatanPendahuluan || []).map((k: any, kidx: number) => ({
            id: `p${idx + 1}-pen-${kidx}`,
            phaseName: k.phaseName || 'Apersepsi',
            description: k.description || '',
            durationMinutes: Number(k.durationMinutes) || 10,
          })),
          kegiatanInti: (p.kegiatanInti || []).map((k: any, kidx: number) => ({
            id: `p${idx + 1}-inti-${kidx}`,
            phaseName: k.phaseName || `Langkah ${kidx + 1}`,
            description: k.description || '',
            durationMinutes: Number(k.durationMinutes) || 15,
          })),
          kegiatanPenutup: (p.kegiatanPenutup || []).map((k: any, kidx: number) => ({
            id: `p${idx + 1}-tut-${kidx}`,
            phaseName: k.phaseName || 'Refleksi & Penutup',
            description: k.description || '',
            durationMinutes: Number(k.durationMinutes) || 10,
          })),
        }))
      : undefined;

    // If meetingCount > 1 and Gemini didn't supply pertemuanList, auto-generate it
    if (parsedMeetingCount > 1 && (!mappedPertemuanList || mappedPertemuanList.length === 0)) {
      const fallbackWithMeetings = generatePedagogicalLessonPlan({
        curriculum,
        level,
        grade,
        subject,
        topic,
        subTopic,
        timeAllocation,
        meetingCount: parsedMeetingCount,
        modelPembelajaran,
        specialInstructions,
        semester,
        academicYear,
        schoolIdentity: resolvedSchoolIdentity,
      });
      mappedPertemuanList = fallbackWithMeetings.pertemuanList;
    }

    // Build the final complete LessonPlan object
    const finalLessonPlan = {
      id: `rpp-${Date.now()}`,
      title: parsedData.title || `Modul Ajar ${subject} - ${topic}`,
      curriculum,
      level,
      grade,
      fase: parsedData.fase || (level === 'SD' ? 'Fase B' : level === 'SMP' ? 'Fase D' : 'Fase E'),
      subject,
      topic,
      subTopic,
      semester,
      academicYear,
      meetingCount: parsedMeetingCount,
      timeAllocation,
      schoolIdentity: resolvedSchoolIdentity,
      capaianPembelajaran: parsedData.capaianPembelajaran || '',
      tujuanPembelajaran: parsedData.tujuanPembelajaran || [],
      indikatorKetercapaian: parsedData.indikatorKetercapaian || [],
      profilPelajarPancasila: parsedData.profilPelajarPancasila || [
        'Bernalar Kritis',
        'Bergotong Royong',
        'Kreatif',
      ],
      saranaPrasarana: parsedData.saranaPrasarana || 'Buku teks siswa, LCD proyektor, LKPD, spidol.',
      targetPesertaDidik: parsedData.targetPesertaDidik || 'Peserta didik reguler/tipikal',
      modelPembelajaran: parsedData.modelPembelajaran || modelPembelajaran,
      metodePembelajaran: parsedData.metodePembelajaran || 'Diskusi, Tanya Jawab, Penugasan',
      pemahamanBermakna: parsedData.pemahamanBermakna || '',
      pertanyaanPemantik: parsedData.pertanyaanPemantik || [],
      deepLearningElements: parsedData.deepLearningElements,
      kompetensiInti: parsedData.kompetensiInti,
      kompetensiDasar: parsedData.kompetensiDasar,
      nilaiKarakter: parsedData.nilaiKarakter,
      kegiatanPendahuluan: (parsedData.kegiatanPendahuluan || []).map((k: any, idx: number) => ({
        id: `gen-p-${idx}`,
        phaseName: k.phaseName || 'Apersepsi',
        description: k.description || '',
        durationMinutes: k.durationMinutes || 10,
      })),
      kegiatanInti: (parsedData.kegiatanInti || []).map((k: any, idx: number) => ({
        id: `gen-i-${idx}`,
        phaseName: k.phaseName || `Langkah ${idx + 1}`,
        description: k.description || '',
        durationMinutes: k.durationMinutes || 15,
      })),
      kegiatanPenutup: (parsedData.kegiatanPenutup || []).map((k: any, idx: number) => ({
        id: `gen-pen-${idx}`,
        phaseName: k.phaseName || 'Refleksi & Penutup',
        description: k.description || '',
        durationMinutes: k.durationMinutes || 10,
      })),
      pertemuanList: mappedPertemuanList,
      asesmenDiagnostik: parsedData.asesmenDiagnostik || 'Pertanyaan pemantik lisan',
      asesmenFormatif: parsedData.asesmenFormatif || 'Penilaian observasi keaktifan dan lembar kerja',
      asesmenSumatif: parsedData.asesmenSumatif || 'Tes tertulis akhir materi',
      rubrikPenilaian: (parsedData.rubrikPenilaian || []).map((r: any, idx: number) => ({
        id: `gen-rub-${idx}`,
        criteria: r.criteria || 'Penguasaan Materi',
        needsGuidance: r.needsGuidance || 'Belum menguasai',
        developing: r.developing || 'Mulai berkembang',
        proficient: r.proficient || 'Menguasai dengan baik',
        advanced: r.advanced || 'Sangat menguasai secara mandiri',
      })),
      lkpd: {
        title: parsedData.lkpd?.title || `LKPD ${topic}`,
        instructions: parsedData.lkpd?.instructions || 'Kerjakan tugas berikut dengan cermat!',
        tasks: parsedData.lkpd?.tasks || [],
      },
      ringkasanMateri: parsedData.ringkasanMateri || '',
      remedialDanPengayaan: parsedData.remedialDanPengayaan || {
        remedial: 'Bimbingan ulang konsep kunci secara terarah.',
        pengayaan: 'Pemberian studi kasus atau tantangan lanjutan.',
      },
      glosarium: parsedData.glosarium || [],
      daftarPustaka: parsedData.daftarPustaka || [
        'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia.',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res.json({ success: true, lessonPlan: finalLessonPlan });
  } catch (err: any) {
    console.error('Error generating RPP:', err);
    // Even in case of unexpected JSON parsing failure, return standard pedagogical lesson plan
    const fallbackPlan = generatePedagogicalLessonPlan({
      curriculum,
      level,
      grade,
      subject,
      topic,
      subTopic,
      timeAllocation,
      meetingCount: resolvedMeetingCount,
      modelPembelajaran,
      specialInstructions,
      semester,
      academicYear,
      schoolIdentity: resolvedSchoolIdentity,
    });
    return res.json({
      success: true,
      lessonPlan: fallbackPlan,
      isFallback: true,
      message: 'Perangkat ajar berhasil disusun menggunakan standar kurikulum Indonesia.',
    });
  }
});

// Vite middleware for dev or static serving for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
