import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ITableBordersOptions,
} from 'docx';
import { LessonPlan } from '../types';

export async function exportLessonPlanToDocx(rpp: LessonPlan): Promise<Blob> {
  const isMerdeka = rpp.curriculum === 'merdeka';
  const docTitle = isMerdeka ? 'MODUL AJAR (RPP)' : 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP)';
  const curriculumSubtitle = isMerdeka
    ? `KURIKULUM MERDEKA - ${rpp.fase ? rpp.fase.toUpperCase() : ''}`
    : 'KURIKULUM 2013 (REVISI)';

  // Helper for clean borders
  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: 'CCCCCC',
  };

  const tableBordersAll: ITableBordersOptions = {
    top: thinBorder,
    bottom: thinBorder,
    left: thinBorder,
    right: thinBorder,
    insideHorizontal: thinBorder,
    insideVertical: thinBorder,
  };

  const noBorder = {
    style: BorderStyle.NONE,
    size: 0,
    color: 'FFFFFF',
  };

  const tableBordersNone: ITableBordersOptions = {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
    insideHorizontal: noBorder,
    insideVertical: noBorder,
  };

  // Section Heading Builder
  const createSectionHeading = (numeral: string, title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: `${numeral}. ${title.toUpperCase()}`,
          bold: true,
          size: 24, // 12pt
          color: '1E3A8A', // Deep Navy
        }),
      ],
    });
  };

  const createSubHeading = (label: string) => {
    return new Paragraph({
      spacing: { before: 140, after: 80 },
      children: [
        new TextRun({
          text: label,
          bold: true,
          size: 22, // 11pt
          color: '1E293B',
        }),
      ],
    });
  };

  // Information Rows
  const infoRows = [
    ['Nama Penyusun / Guru', rpp.schoolIdentity.teacherName || '-'],
    ['Satuan Pendidikan', rpp.schoolIdentity.schoolName || '-'],
    ['Mata Pelajaran', rpp.subject],
    ['Fase / Kelas / Semester', `${rpp.fase ? `${rpp.fase} / ` : ''}${rpp.grade} / Semester ${rpp.semester}`],
    ['Tahun Ajaran', rpp.academicYear],
    ['Materi Pokok / Topik', rpp.topic + (rpp.subTopic ? ` (${rpp.subTopic})` : '')],
    ['Alokasi Waktu', rpp.timeAllocation || '2 x 35 Menit'],
    ['Model Pembelajaran', rpp.modelPembelajaran || 'Problem Based Learning (PBL)'],
    ['Metode Pembelajaran', rpp.metodePembelajaran || 'Diskusi, Eksperimen, Presentasi'],
    ['Target Peserta Didik', rpp.targetPesertaDidik || 'Peserta Didik Reguler/Tipikal'],
  ];

  if (rpp.saranaPrasarana) {
    infoRows.push(['Sarana & Prasarana', rpp.saranaPrasarana]);
  }

  // Activities Table Rows
  const activityRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Kegiatan / Tahapan', bold: true, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 60, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Deskripsi Kegiatan Pembelajaran', bold: true, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Waktu', bold: true, size: 20 })],
            }),
          ],
        }),
      ],
    }),
  ];

  // 1. Pendahuluan
  activityRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: '1. Pendahuluan', bold: true, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          children: rpp.kegiatanPendahuluan.map(
            (step) =>
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: `• ${step.phaseName}: `, bold: true, size: 20 }),
                  new TextRun({ text: step.description, size: 20 }),
                ],
              }),
          ),
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${rpp.kegiatanPendahuluan.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)} Menit`,
                  size: 20,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  );

  // 2. Inti
  activityRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: '2. Kegiatan Inti', bold: true, size: 20 }),
                new TextRun({ text: `\n(${rpp.modelPembelajaran || 'Sintaks Model'})`, italics: true, size: 18 }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: rpp.kegiatanInti.map(
            (step) =>
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: `• ${step.phaseName}\n`, bold: true, size: 20 }),
                  new TextRun({ text: step.description, size: 20 }),
                ],
              }),
          ),
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${rpp.kegiatanInti.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)} Menit`,
                  size: 20,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  );

  // 3. Penutup
  activityRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: '3. Penutup', bold: true, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          children: rpp.kegiatanPenutup.map(
            (step) =>
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: `• ${step.phaseName}: `, bold: true, size: 20 }),
                  new TextRun({ text: step.description, size: 20 }),
                ],
              }),
          ),
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${rpp.kegiatanPenutup.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)} Menit`,
                  size: 20,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  );

  // Rubrik Table
  const rubricRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 24, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Aspek / Kriteria', bold: true, size: 19 })] })],
        }),
        new TableCell({
          width: { size: 19, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Perlu Bimbingan (1)', bold: true, size: 19 })] })],
        }),
        new TableCell({
          width: { size: 19, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Cukup / Berkembang (2)', bold: true, size: 19 })] })],
        }),
        new TableCell({
          width: { size: 19, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Baik / Cakap (3)', bold: true, size: 19 })] })],
        }),
        new TableCell({
          width: { size: 19, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Sangat Baik / Mahir (4)', bold: true, size: 19 })] })],
        }),
      ],
    }),
    ...rpp.rubrikPenilaian.map(
      (item) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: item.criteria, bold: true, size: 19 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: item.needsGuidance, size: 18 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: item.developing, size: 18 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: item.proficient, size: 18 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: item.advanced, size: 18 })] })],
            }),
          ],
        }),
    ),
  ];

  // Document Construction
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 22, // 11 pt
            color: '1E293B',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch / 2.54 cm
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // Kop Dokumen / Sekolah
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: (rpp.schoolIdentity.schoolName || 'SATUAN PENDIDIKAN').toUpperCase(),
                bold: true,
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `${rpp.schoolIdentity.schoolAddress || 'Alamat Satuan Pendidikan'} ${
                  rpp.schoolIdentity.city ? `, ${rpp.schoolIdentity.city}` : ''
                }`,
                size: 19,
                color: '475569',
              }),
            ],
          }),
          // Garis pemisah Kop
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            border: {
              bottom: {
                color: '000000',
                size: 12,
                style: BorderStyle.SINGLE,
              },
            },
            children: [],
          }),

          // Judul RPP
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: docTitle,
                bold: true,
                size: 28, // 14pt
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: curriculumSubtitle,
                bold: true,
                size: 22,
                color: '2563EB',
              }),
            ],
          }),

          // I. INFORMASI UMUM / IDENTITAS MODUL
          createSectionHeading('I', isMerdeka ? 'Informasi Umum' : 'Identitas RPP'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBordersNone,
            rows: infoRows.map(
              ([label, val]) =>
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 32, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          spacing: { after: 60 },
                          children: [new TextRun({ text: label, bold: true, size: 20 })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 3, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: ':', size: 20 })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 65, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          spacing: { after: 60 },
                          children: [new TextRun({ text: val, size: 20 })],
                        }),
                      ],
                    }),
                  ],
                }),
            ),
          }),

          // II. KOMPONEN INTI
          createSectionHeading('II', 'Komponen Inti'),

          // Capaian Pembelajaran / Kompetensi Dasar
          createSubHeading(isMerdeka ? 'A. Capaian Pembelajaran (CP)' : 'A. Kompetensi Inti & Kompetensi Dasar (KI & KD)'),
          ...(isMerdeka
            ? [
                new Paragraph({
                  spacing: { after: 100 },
                  children: [new TextRun({ text: rpp.capaianPembelajaran || '-', size: 20 })],
                }),
              ]
            : [
                new Paragraph({
                  spacing: { after: 80 },
                  children: [
                    new TextRun({ text: 'Kompetensi Inti (KI 3 & KI 4):\n', bold: true, size: 20 }),
                    new TextRun({ text: `KI 3 (Pengetahuan): ${rpp.kompetensiInti?.ki3 || '-'}\n`, size: 20 }),
                    new TextRun({ text: `KI 4 (Keterampilan): ${rpp.kompetensiInti?.ki4 || '-'}\n`, size: 20 }),
                  ],
                }),
                new Paragraph({
                  spacing: { after: 80 },
                  children: [
                    new TextRun({ text: 'Kompetensi Dasar (KD):\n', bold: true, size: 20 }),
                    ...(rpp.kompetensiDasar || []).map(
                      (kd) => new TextRun({ text: `• ${kd}\n`, size: 20 }),
                    ),
                  ],
                }),
              ]),

          // Tujuan Pembelajaran
          createSubHeading('B. Tujuan Pembelajaran (TP)'),
          ...(rpp.tujuanPembelajaran && rpp.tujuanPembelajaran.length > 0
            ? rpp.tujuanPembelajaran.map(
                (tp, idx) =>
                  new Paragraph({
                    spacing: { after: 60 },
                    children: [
                      new TextRun({ text: `${idx + 1}. `, bold: true, size: 20 }),
                      new TextRun({ text: tp, size: 20 }),
                    ],
                  }),
              )
            : [new Paragraph({ children: [new TextRun({ text: '-', size: 20 })] })]),

          // Profil Pelajar Pancasila / Karakter
          createSubHeading(isMerdeka ? 'C. Profil Pelajar Pancasila' : 'C. Nilai Karakter (PPK) & 4C'),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: isMerdeka
                  ? (rpp.profilPelajarPancasila && rpp.profilPelajarPancasila.length > 0
                      ? rpp.profilPelajarPancasila.join(', ')
                      : 'Bernalar Kritis, Kreatif, Bergotong Royong')
                  : (rpp.nilaiKarakter && rpp.nilaiKarakter.length > 0
                      ? rpp.nilaiKarakter.join(', ')
                      : 'Religius, Nasionalis, Mandiri, Integritas, Gotong Royong'),
                size: 20,
              }),
            ],
          }),

          // Pemahaman Bermakna & Pertanyaan Pemantik
          ...(isMerdeka
            ? [
                createSubHeading('D. Pemahaman Bermakna'),
                new Paragraph({
                  spacing: { after: 100 },
                  children: [new TextRun({ text: rpp.pemahamanBermakna || '-', size: 20 })],
                }),
                createSubHeading('E. Pertanyaan Pemantik'),
                ...(rpp.pertanyaanPemantik && rpp.pertanyaanPemantik.length > 0
                  ? rpp.pertanyaanPemantik.map(
                      (q, idx) =>
                        new Paragraph({
                          spacing: { after: 60 },
                          children: [
                            new TextRun({ text: `${idx + 1}. `, bold: true, size: 20 }),
                            new TextRun({ text: q, italics: true, size: 20 }),
                          ],
                        }),
                    )
                  : [new Paragraph({ children: [new TextRun({ text: '-', size: 20 })] })]),
              ]
            : []),

          // III. KEGIATAN PEMBELAJARAN
          createSectionHeading('III', 'Kegiatan Pembelajaran'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBordersAll,
            rows: activityRows,
          }),

          // IV. ASESMEN & PENILAIAN
          createSectionHeading('IV', 'Asesmen & Penilaian Pembelajaran'),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: '1. Asesmen Diagnostik (Awal): ', bold: true, size: 20 }),
              new TextRun({ text: rpp.asesmenDiagnostik || 'Pertanyaan pemantik dan kuis prasyarat', size: 20 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: '2. Asesmen Formatif (Proses): ', bold: true, size: 20 }),
              new TextRun({ text: rpp.asesmenFormatif || 'Observasi keaktifan diskusi, pengisian LKPD, dan unjuk kerja', size: 20 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: '3. Asesmen Sumatif (Akhir): ', bold: true, size: 20 }),
              new TextRun({ text: rpp.asesmenSumatif || 'Tes tertulis evaluasi materi / penilaian produk akhir', size: 20 }),
            ],
          }),

          createSubHeading('Rubrik Penilaian Kinerja / Ketercapaian:'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBordersAll,
            rows: rubricRows,
          }),

          // V. LAMPIRAN
          createSectionHeading('V', 'Lampiran'),
          createSubHeading('A. Lembar Kerja Peserta Didik (LKPD)'),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: `Judul: ${rpp.lkpd.title || 'LKPD ' + rpp.topic}\n`, bold: true, size: 20 }),
              new TextRun({ text: `Petunjuk Kerja: ${rpp.lkpd.instructions || 'Kerjakan secara berkelompok/mandiri sesuai arahan guru.'}\n`, size: 20 }),
            ],
          }),
          ...(rpp.lkpd.tasks && rpp.lkpd.tasks.length > 0
            ? rpp.lkpd.tasks.map(
                (task, idx) =>
                  new Paragraph({
                    spacing: { after: 60 },
                    children: [
                      new TextRun({ text: `${idx + 1}. `, bold: true, size: 20 }),
                      new TextRun({ text: task, size: 20 }),
                    ],
                  }),
              )
            : []),

          ...(rpp.ringkasanMateri
            ? [
                createSubHeading('B. Bahan Bacaan Guru & Peserta Didik'),
                new Paragraph({
                  spacing: { after: 100 },
                  children: [new TextRun({ text: rpp.ringkasanMateri, size: 20 })],
                }),
              ]
            : []),

          ...(rpp.remedialDanPengayaan
            ? [
                createSubHeading('C. Pengayaan dan Remedial'),
                new Paragraph({
                  spacing: { after: 60 },
                  children: [
                    new TextRun({ text: '• Remedial: ', bold: true, size: 20 }),
                    new TextRun({ text: rpp.remedialDanPengayaan.remedial || '-', size: 20 }),
                  ],
                }),
                new Paragraph({
                  spacing: { after: 100 },
                  children: [
                    new TextRun({ text: '• Pengayaan: ', bold: true, size: 20 }),
                    new TextRun({ text: rpp.remedialDanPengayaan.pengayaan || '-', size: 20 }),
                  ],
                }),
              ]
            : []),

          ...(rpp.glosarium && rpp.glosarium.length > 0
            ? [
                createSubHeading('D. Glosarium'),
                new Paragraph({
                  spacing: { after: 100 },
                  children: [new TextRun({ text: rpp.glosarium.join('; '), size: 20 })],
                }),
              ]
            : []),

          ...(rpp.daftarPustaka && rpp.daftarPustaka.length > 0
            ? [
                createSubHeading('E. Daftar Pustaka'),
                ...rpp.daftarPustaka.map(
                  (dp) =>
                    new Paragraph({
                      spacing: { after: 40 },
                      children: [new TextRun({ text: `• ${dp}`, size: 19 })],
                    }),
                ),
              ]
            : []),

          // TANDA TANGAN / PENGESAHAN
          new Paragraph({ spacing: { before: 240, after: 100 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBordersNone,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Mengetahui,', size: 20 })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Kepala Sekolah', bold: true, size: 20 })],
                      }),
                      new Paragraph({ spacing: { before: 800 }, children: [] }), // Jarak tanda tangan
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rpp.schoolIdentity.principalName || '..............................................',
                            bold: true,
                            underline: {},
                            size: 20,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `NIP. ${rpp.schoolIdentity.principalNip || '.....................................'}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${rpp.schoolIdentity.city || 'Tempat'}, ${
                              rpp.schoolIdentity.signatureDatePlace ||
                              new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                            }`,
                            size: 20,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Guru Mata Pelajaran / Kelas', bold: true, size: 20 })],
                      }),
                      new Paragraph({ spacing: { before: 800 }, children: [] }), // Jarak tanda tangan
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rpp.schoolIdentity.teacherName || '..............................................',
                            bold: true,
                            underline: {},
                            size: 20,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `NIP. ${rpp.schoolIdentity.teacherNip || '.....................................'}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
