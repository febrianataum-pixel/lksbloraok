import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { LKS, Beneficiary, DinsosSettings } from "../types";
import { calculateAge } from "./exporters";

export interface PdfExportOptions {
  filename?: string;
  reportTitle?: string;
  filterLabel?: string;
}

export interface BeneficiaryPdfExportOptions {
  filename?: string;
  reportTitle?: string;
  filterLabel?: string;
  targetLksName?: string;
  targetLksDistrict?: string;
  targetLksChairman?: string;
}

/**
 * Generates and downloads a clean, publication-ready PDF containing
 * the table of all registered LKS data with official government letterhead and sign-off.
 */
export function exportLksTableToPdf(
  lksList: LKS[],
  settings: DinsosSettings,
  options?: PdfExportOptions
) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4", // 297 x 210 mm
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Official Header (KOP Surat Dinsos PPPA Kab Blora)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("PEMERINTAH KABUPATEN BLORA", pageWidth / 2, 13, { align: "center" });

  doc.setFontSize(13);
  doc.text(
    "DINAS SOSIAL, PEMBERDAYAAN PEREMPUAN DAN PERLINDUNGAN ANAK (DINSOS PPPA)",
    pageWidth / 2,
    18.5,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(
    "Jl. Pemuda No. 14 Blora, Jawa Tengah | Kode Pos: 58211 | Telp/Fax: (0296) 531084",
    pageWidth / 2,
    23,
    { align: "center" }
  );

  // Decorative double line
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.75);
  doc.line(14, 25.5, pageWidth - 14, 25.5);
  doc.setLineWidth(0.25);
  doc.line(14, 26.5, pageWidth - 14, 26.5);

  // 2. Document Title & Metadata
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const title =
    options?.reportTitle ||
    "DAFTAR REKAPITULASI SELURUH LEMBAGA KESEJAHTERAAN SOSIAL (LKS)";
  doc.text(title, pageWidth / 2, 33, { align: "center" });

  // Summary badge text
  const totalCount = lksList.length;
  const activeCount = lksList.filter((l) => l.isActive).length;
  const nonActiveCount = totalCount - activeCount;
  const accreditedCount = lksList.filter(
    (l) => l.accreditation && l.accreditation !== "Belum terakreditasi"
  ).length;

  const today = new Date();
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const metaText = `Total LKS: ${totalCount} Lembaga | Aktif: ${activeCount} | Non-Aktif: ${nonActiveCount} | Terakreditasi: ${accreditedCount} | Tanggal Unduh: ${dateStr}`;
  doc.text(metaText, pageWidth / 2, 38, { align: "center" });

  if (options?.filterLabel) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Filter data: ${options.filterLabel}`, pageWidth / 2, 42, { align: "center" });
  }

  // 3. Prepare Table Headers and Rows
  const tableHeaders = [
    [
      "No",
      "Nama LKS & ID",
      "Kecamatan",
      "Desa / Kel.",
      "Alamat Lengkap",
      "Ketua / Kontak",
      "SK Kemenkumham",
      "No. STD / Masa Berlaku",
      "Status Akreditasi",
      "Keaktifan",
    ],
  ];

  const tableBody = lksList.map((l, index) => {
    const contact = [
      l.chairman || "-",
      l.whatsapp ? `WA: ${l.whatsapp}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const stdInfo = [
      l.stdNo || "-",
      l.stdExpiryDate ? `s/d: ${l.stdExpiryDate}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const accreditationInfo =
      l.accreditation === "Belum terakreditasi"
        ? "Belum"
        : `${l.accreditation}${l.accreditationYear ? ` (${l.accreditationYear})` : ""}`;

    return [
      String(index + 1),
      `${l.name}\n[${l.id}]`,
      l.district || "-",
      l.village || "-",
      l.address || "-",
      contact,
      l.kemenkumhamNo || "-",
      stdInfo,
      accreditationInfo,
      l.isActive ? "AKTIF" : "NON-AKTIF",
    ];
  });

  const startY = options?.filterLabel ? 45 : 42;

  // 4. Render Table with AutoTable
  autoTable(doc, {
    head: tableHeaders,
    body: tableBody,
    startY: startY,
    margin: { left: 14, right: 14, top: 14, bottom: 20 },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.2,
      textColor: [30, 41, 59],
      valign: "middle",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 9 }, // No
      1: { halign: "left", fontStyle: "bold", cellWidth: 42 }, // Nama LKS
      2: { halign: "left", cellWidth: 24 }, // Kecamatan
      3: { halign: "left", cellWidth: 24 }, // Desa
      4: { halign: "left", cellWidth: 40 }, // Alamat
      5: { halign: "left", cellWidth: 32 }, // Ketua / Kontak
      6: { halign: "left", cellWidth: 28 }, // SK Kemenkumham
      7: { halign: "left", cellWidth: 30 }, // No STD
      8: { halign: "center", cellWidth: 24 }, // Akreditasi
      9: { halign: "center", fontStyle: "bold", cellWidth: 16 }, // Status
    },
    didParseCell: (data) => {
      // Colorize the AKTIF / NON-AKTIF cells
      if (data.section === "body" && data.column.index === 9) {
        if (data.cell.raw === "AKTIF") {
          data.cell.styles.textColor = [16, 149, 106]; // emerald-600
        } else {
          data.cell.styles.textColor = [225, 29, 72]; // rose-600
        }
      }
    },
    didDrawPage: (data) => {
      // Running footer on each page
      const currentPg = data.pageNumber;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400

      const footerLeft = `Sistem Informasi Lembaga Kesejahteraan Sosial (SiLKS) - Dinsos PPPA Kab. Blora`;
      const footerRight = `Halaman ${currentPg}`;
      doc.text(footerLeft, 14, pageHeight - 10);
      doc.text(footerRight, pageWidth - 14, pageHeight - 10, { align: "right" });
    },
  });

  // 5. Sign-off Seal on the Last Page
  const finalY = (doc as any).lastAutoTable.finalY || startY + 50;
  const signatureHeight = 38;

  // If not enough room on the current page for signature, add a page
  if (finalY + signatureHeight > pageHeight - 20) {
    doc.addPage();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Sistem Informasi Lembaga Kesejahteraan Sosial (SiLKS) - Dinsos PPPA Kab. Blora`,
      14,
      pageHeight - 10
    );
    doc.text(
      `Halaman ${doc.getNumberOfPages()}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: "right" }
    );
  }

  const signY = finalY + signatureHeight > pageHeight - 20 ? 25 : finalY + 8;
  const signX = pageWidth - 80;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Blora, ${dateStr}`, signX, signY);
  doc.setFont("helvetica", "bold");
  doc.text("Kepala Dinas Sosial PPPA Kab. Blora", signX, signY + 5);

  doc.text(settings.headOfDinsos || "Drs. Luluk Kusuma Agung Ariadi, AP", signX, signY + 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`NIP. ${settings.nipOfDinsos || "19740112 199311 1 001"}`, signX, signY + 30);

  // 6. Save & trigger download
  const cleanFilename = (options?.filename || "Daftar_Seluruh_Data_LKS_Blora.pdf")
    .replace(/\s+/g, "_");
  doc.save(cleanFilename);
}

/**
 * Generates and downloads a publication-ready PDF containing the table of beneficiaries (PM)
 * with official government letterhead (Dinsos PPPA Kab Blora), demographic summary, and official sign-off.
 */
export function exportBeneficiariesTableToPdf(
  beneficiaries: Beneficiary[],
  settings: DinsosSettings,
  options?: BeneficiaryPdfExportOptions
) {
  const isSingleLks = Boolean(options?.targetLksName);
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Official Header (KOP Surat)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("PEMERINTAH KABUPATEN BLORA", pageWidth / 2, 13, { align: "center" });

  doc.setFontSize(13);
  doc.text(
    "DINAS SOSIAL, PEMBERDAYAAN PEREMPUAN DAN PERLINDUNGAN ANAK (DINSOS PPPA)",
    pageWidth / 2,
    18.5,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Jl. Pemuda No. 14 Blora, Jawa Tengah | Kode Pos: 58211 | Telp/Fax: (0296) 531084",
    pageWidth / 2,
    23,
    { align: "center" }
  );

  // Decorative double line
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.75);
  doc.line(14, 25.5, pageWidth - 14, 25.5);
  doc.setLineWidth(0.25);
  doc.line(14, 26.5, pageWidth - 14, 26.5);

  // 2. Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const title =
    options?.reportTitle ||
    (isSingleLks
      ? `LAMPIRAN DAFTAR PENERIMA MANFAAT (PM) — ${options?.targetLksName?.toUpperCase()}`
      : "DAFTAR REKAPITULASI SELURUH PENERIMA MANFAAT (PM) LKS");
  doc.text(title, pageWidth / 2, 33, { align: "center" });

  // Subtitle / Scope
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const subtitle = isSingleLks
    ? `Lembaga: ${options?.targetLksName} | Kecamatan: ${options?.targetLksDistrict || "-"} | Kabupaten Blora`
    : `Kabupaten Blora, Provinsi Jawa Tengah — Tahun ${new Date().getFullYear()}${
        options?.filterLabel ? ` [${options.filterLabel}]` : ""
      }`;
  doc.text(subtitle, pageWidth / 2, 37.5, { align: "center" });

  // 3. Summary indicators bar
  const totalCount = beneficiaries.length;
  const totalDalam = beneficiaries.filter((b) => b.category === "Dalam").length;
  const totalLuar = beneficiaries.filter((b) => b.category === "Luar").length;
  const totalMale = beneficiaries.filter((b) => b.gender === "L").length;
  const totalFemale = beneficiaries.filter((b) => b.gender === "P").length;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 40.5, pageWidth - 28, 7, 1.5, 1.5, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  const statsText = [
    `Total: ${totalCount} Orang`,
    `PM Dalam: ${totalDalam}`,
    `PM Luar: ${totalLuar}`,
    `Laki-laki: ${totalMale}`,
    `Perempuan: ${totalFemale}`,
  ].join("   •   ");

  doc.text(statsText, pageWidth / 2, 45.2, { align: "center" });

  // 4. Table Construction
  const startY = 50;
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const today = new Date();
  const dateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  let headers: string[];
  let body: (string | number)[][];

  if (isSingleLks) {
    headers = [
      "No.",
      "Nama Lengkap",
      "NIK",
      "No. KK",
      "L/P",
      "Usia",
      "Domisili Kecamatan (Desa)",
      "Kategori",
      "Keterangan / Catatan",
    ];

    body = beneficiaries.map((pm, idx) => [
      idx + 1,
      pm.name || "-",
      pm.nik || "-",
      pm.kk || "-",
      pm.gender === "L" ? "L" : "P",
      calculateAge(pm.birthDate) ? `${calculateAge(pm.birthDate)} Th` : "-",
      `${pm.district || "-"}${pm.village ? ` (${pm.village})` : ""}`,
      pm.category === "Dalam" ? "PM DALAM" : "PM LUAR",
      pm.notes || "-",
    ]);
  } else {
    headers = [
      "No.",
      "Nama Lengkap",
      "NIK",
      "L/P",
      "Usia",
      "Asal Lembaga LKS",
      "Domisili Kecamatan (Desa)",
      "Kategori",
      "Keterangan / Catatan",
    ];

    body = beneficiaries.map((pm, idx) => [
      idx + 1,
      pm.name || "-",
      pm.nik || "-",
      pm.gender === "L" ? "L" : "P",
      calculateAge(pm.birthDate) ? `${calculateAge(pm.birthDate)} Th` : "-",
      pm.lksName || "-",
      `${pm.district || "-"}${pm.village ? ` (${pm.village})` : ""}`,
      pm.category === "Dalam" ? "PM DALAM" : "PM LUAR",
      pm.notes || "-",
    ]);
  }

  autoTable(doc, {
    startY,
    head: [headers],
    body,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      valign: "middle",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [15, 23, 42],
      cellPadding: 1.8,
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: isSingleLks
      ? {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 42, fontStyle: "bold" },
          2: { cellWidth: 32, font: "courier", halign: "center" },
          3: { cellWidth: 30, font: "courier", halign: "center" },
          4: { cellWidth: 10, halign: "center" },
          5: { cellWidth: 14, halign: "center" },
          6: { cellWidth: 46 },
          7: { cellWidth: 22, halign: "center", fontStyle: "bold" },
          8: { cellWidth: "auto" },
        }
      : {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 40, fontStyle: "bold" },
          2: { cellWidth: 32, font: "courier", halign: "center" },
          3: { cellWidth: 10, halign: "center" },
          4: { cellWidth: 14, halign: "center" },
          5: { cellWidth: 42, fontStyle: "bold" },
          6: { cellWidth: 42 },
          7: { cellWidth: 22, halign: "center", fontStyle: "bold" },
          8: { cellWidth: "auto" },
        },
    didParseCell: (data) => {
      const catColIdx = 7;
      if (data.section === "body" && data.column.index === catColIdx) {
        if (data.cell.raw === "PM DALAM") {
          data.cell.styles.textColor = [16, 149, 106]; // emerald-600
        } else {
          data.cell.styles.textColor = [126, 34, 206]; // purple-700
        }
      }
    },
    didDrawPage: (data) => {
      const currentPg = data.pageNumber;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);

      const footerLeft = `Sistem Informasi Lembaga Kesejahteraan Sosial (SiLKS) - Dinsos PPPA Kab. Blora`;
      const footerRight = `Halaman ${currentPg}`;
      doc.text(footerLeft, 14, pageHeight - 10);
      doc.text(footerRight, pageWidth - 14, pageHeight - 10, { align: "right" });
    },
  });

  // 5. Sign-off Seal on the Last Page
  const finalY = (doc as any).lastAutoTable.finalY || startY + 50;
  const signatureHeight = 38;

  if (finalY + signatureHeight > pageHeight - 20) {
    doc.addPage();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Sistem Informasi Lembaga Kesejahteraan Sosial (SiLKS) - Dinsos PPPA Kab. Blora`,
      14,
      pageHeight - 10
    );
    doc.text(
      `Halaman ${doc.getNumberOfPages()}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: "right" }
    );
  }

  const signY = finalY + signatureHeight > pageHeight - 20 ? 25 : finalY + 8;

  if (isSingleLks) {
    const leftSignX = 20;
    const rightSignX = pageWidth - 80;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    // Left sign: Ketua LKS
    doc.setFont("helvetica", "bold");
    doc.text(`Ketua LKS ${options?.targetLksName || ""}`, leftSignX, signY + 5);
    doc.text(options?.targetLksChairman || "........................", leftSignX, signY + 26);

    // Right sign: Kadinsos
    doc.setFont("helvetica", "normal");
    doc.text(`Blora, ${dateStr}`, rightSignX, signY);
    doc.setFont("helvetica", "bold");
    doc.text("Kepala Dinas Sosial PPPA Kab. Blora", rightSignX, signY + 5);
    doc.text(settings.headOfDinsos || "Drs. Luluk Kusuma Agung Ariadi, AP", rightSignX, signY + 26);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`NIP. ${settings.nipOfDinsos || "19740112 199311 1 001"}`, rightSignX, signY + 30);
  } else {
    // Kadinsos sign
    const signX = pageWidth - 80;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`Blora, ${dateStr}`, signX, signY);
    doc.setFont("helvetica", "bold");
    doc.text("Kepala Dinas Sosial PPPA Kab. Blora", signX, signY + 5);
    doc.text(settings.headOfDinsos || "Drs. Luluk Kusuma Agung Ariadi, AP", signX, signY + 26);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`NIP. ${settings.nipOfDinsos || "19740112 199311 1 001"}`, signX, signY + 30);
  }

  // 6. Save & download file
  const defaultFilename = isSingleLks
    ? `Daftar_PM_${(options?.targetLksName || "LKS").replace(/\s+/g, "_")}.pdf`
    : "Daftar_Seluruh_Penerima_Manfaat_Blora.pdf";
  const cleanFilename = (options?.filename || defaultFilename).replace(/\s+/g, "_");
  doc.save(cleanFilename);
}
