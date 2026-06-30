"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { CellHookData, Color, UserOptions } from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import type { Grade, TotalMarksType } from "@/lib/quality-points";

type DmcCourse = {
  name?: string;
  creditHours: number;
  totalMarks: TotalMarksType;
  obtainedMarks: number;
  percentage: number;
  grade: Grade;
  qualityPoint: number;
  isAudit: boolean;
};

type DmcSemester = {
  id: string;
  name: string;
  gpa: number;
  totalCreditHours: number;
  totalQualityPoints: number;
  courses: DmcCourse[];
  courseCount?: number;
};

type DmcReport = {
  semesters: DmcSemester[];
  cgpa: number;
  totalCreditHours: number;
  totalQualityPoints: number;
};

type StudentInfo = {
  name: string | null;
  email: string | null;
};

type PdfDocument = InstanceType<typeof import("jspdf").jsPDF>;
type AutoTable = typeof import("jspdf-autotable").autoTable;

interface ExportDmcPdfButtonProps {
  report: DmcReport;
  student: StudentInfo;
}

const BRAND_BLUE: [number, number, number] = [21, 93, 251];
const BRAND_BLUE_DARK: [number, number, number] = [15, 42, 96];
const TEXT_DARK: [number, number, number] = [15, 23, 42];
const TEXT_MUTED: [number, number, number] = [71, 85, 105];
const BORDER: [number, number, number] = [214, 226, 245];
const SOFT_BLUE: [number, number, number] = [236, 244, 255];

const gradeColors: Record<Grade, { fill: Color; text: Color }> = {
  A: { fill: [220, 252, 231], text: [22, 101, 52] },
  B: { fill: [219, 234, 254], text: [29, 78, 216] },
  C: { fill: [254, 243, 199], text: [146, 64, 14] },
  D: { fill: [255, 237, 213], text: [194, 65, 12] },
  F: { fill: [254, 226, 226], text: [185, 28, 28] },
  P: { fill: [209, 250, 229], text: [4, 120, 87] },
};

export function ExportDmcPdfButton({ report, student }: ExportDmcPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setIsExporting(true);
    setError(null);

    try {
      const [{ jsPDF }, { autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const logoDataUrl = await loadLogoDataUrl();
      const generatedAt = new Date();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      drawHeader(doc, pageWidth, logoDataUrl, "Detailed Marks Certificate");
      drawOverallMetricsPage(doc, report, student, generatedAt, autoTable, logoDataUrl);

      report.semesters.forEach((semester) => {
        doc.addPage();
        drawHeader(doc, pageWidth, logoDataUrl, "Semester Result Sheet");
        drawSemesterIntro(doc, semester);
        autoTable(doc, getSemesterTableOptions(semester, doc, pageWidth, logoDataUrl));
      });

      const totalPages = doc.getNumberOfPages();
      for (let page = 1; page <= totalPages; page += 1) {
        doc.setPage(page);
        drawFooter(doc, pageWidth, pageHeight, page, totalPages, generatedAt);
      }

      doc.save(`uam-${slugify(student.name || "student")}-dmc.pdf`);
    } catch (err) {
      console.error("Failed to export DMC PDF:", err);
      setError("Could not export DMC. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        onClick={handleExport}
        disabled={isExporting || report.semesters.length === 0}
        className="border-primary/40 bg-primary/5 text-primary font-semibold shadow-[0_10px_24px_-14px_hsl(var(--primary))] hover:bg-primary/10 hover:border-primary/60 hover:shadow-[0_14px_30px_-16px_hsl(var(--primary))]"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isExporting ? "Exporting..." : "Export your DMC"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function getSemesterTableOptions(
  semester: DmcSemester,
  doc: PdfDocument,
  pageWidth: number,
  logoDataUrl: string | null
): UserOptions {
  return {
    startY: 218,
    margin: { top: 86, right: 36, bottom: 58, left: 36 },
    theme: "grid",
    showHead: "everyPage",
    showFoot: "lastPage",
    head: [["#", "Course Name", "Credit Hours", "Marks", "Percentage", "Grade", "Quality Points"]],
    body: semester.courses.length
      ? semester.courses.map((course, index) => [
          String(index + 1),
          course.name || "Untitled Course",
          formatNumber(course.creditHours),
          `${formatNumber(course.obtainedMarks)} / ${course.totalMarks}`,
          `${course.percentage.toFixed(1)}%`,
          course.grade,
          course.qualityPoint.toFixed(2),
        ])
      : [["-", "No courses available", "-", "-", "-", "-", "-"]],
    foot: [[
      "",
      "Semester Total",
      formatNumber(semester.totalCreditHours),
      "",
      "",
      "",
      semester.totalQualityPoints.toFixed(2),
    ]],
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      textColor: TEXT_DARK,
      lineColor: BORDER,
      lineWidth: 0.7,
      cellPadding: { top: 8, right: 7, bottom: 8, left: 7 },
      valign: "middle",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: BRAND_BLUE,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 9.5,
    },
    alternateRowStyles: { fillColor: [248, 251, 255] },
    footStyles: {
      fillColor: SOFT_BLUE,
      textColor: BRAND_BLUE_DARK,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 28 },
      1: { cellWidth: 300, fontStyle: "bold" },
      2: { halign: "center", cellWidth: 80 },
      3: { halign: "center", cellWidth: 78 },
      4: { halign: "center", cellWidth: 82 },
      5: { halign: "center", cellWidth: 58, fontStyle: "bold" },
      6: { halign: "center", cellWidth: 96, fontStyle: "bold" },
    },
    didParseCell: (data: CellHookData) => {
      if (data.section === "body" && data.column.index === 5) {
        const grade = data.cell.text[0] as Grade | undefined;
        const colors = grade ? gradeColors[grade] : null;
        if (colors) {
          data.cell.styles.fillColor = colors.fill;
          data.cell.styles.textColor = colors.text;
        }
      }
    },
    didDrawPage: () => {
      drawHeader(doc, pageWidth, logoDataUrl, "Semester Result Sheet");
    },
  };
}

function drawHeader(
  doc: PdfDocument,
  pageWidth: number,
  logoDataUrl: string | null,
  reportTitle: string
) {
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 76, "F");

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", 36, 22, 34, 34);
  } else {
    doc.setFillColor(...BRAND_BLUE);
    doc.roundedRect(36, 22, 34, 34, 8, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("U", 53, 44, { align: "center" });
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...TEXT_DARK);
  doc.text("UamTracker", 80, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("GPA Records", 80, 51);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_BLUE);
  doc.text(reportTitle, pageWidth - 36, 39, { align: "right" });

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.8);
  doc.line(36, 70, pageWidth - 36, 70);
}

function drawOverallMetricsPage(
  doc: PdfDocument,
  report: DmcReport,
  student: StudentInfo,
  generatedAt: Date,
  autoTable: AutoTable,
  logoDataUrl: string | null
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const totalCourses = report.semesters.reduce((sum, sem) => sum + sem.courses.length, 0);
  const bestSemester = report.semesters.reduce<DmcSemester | null>((best, sem) => {
    if (!best || sem.gpa > best.gpa) return sem;
    return best;
  }, null);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(...TEXT_DARK);
  doc.text("Detailed Marks Certificate", 36, 106);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Student", 36, 128);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text(student.name || "Student", 86, 128);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Email", 36, 144);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text(student.email || "Not available", 86, 144);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Generated", pageWidth - 252, 128);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text(formatDateTime(generatedAt), pageWidth - 182, 128);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Document", pageWidth - 252, 144);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text("Full Academic DMC", pageWidth - 182, 144);

  drawMetricCards(doc, [
    { label: "Overall CGPA", value: `${report.cgpa.toFixed(2)} / 4.00` },
    { label: "Credit Hours", value: formatNumber(report.totalCreditHours) },
    { label: "Quality Points", value: report.totalQualityPoints.toFixed(2) },
    { label: "Semesters", value: String(report.semesters.length) },
    { label: "Courses", value: String(totalCourses) },
    { label: "Best Semester", value: bestSemester ? `${bestSemester.name} (${bestSemester.gpa.toFixed(2)})` : "N/A" },
  ], 168);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...TEXT_DARK);
  doc.text("Semester Summary", 36, 306);

  const summaryOptions: UserOptions = {
    startY: 320,
    margin: { top: 86, right: 36, bottom: 58, left: 36 },
    theme: "grid",
    showHead: "everyPage",
    head: [["#", "Semester", "Courses", "Credit Hours", "Quality Points", "GPA"]],
    body: report.semesters.map((semester, index) => [
      String(index + 1),
      semester.name,
      String(semester.courses.length),
      formatNumber(semester.totalCreditHours),
      semester.totalQualityPoints.toFixed(2),
      semester.gpa.toFixed(2),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      textColor: TEXT_DARK,
      lineColor: BORDER,
      lineWidth: 0.7,
      cellPadding: { top: 8, right: 7, bottom: 8, left: 7 },
      valign: "middle",
    },
    headStyles: {
      fillColor: BRAND_BLUE,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: { fillColor: [248, 251, 255] },
    columnStyles: {
      0: { halign: "center", cellWidth: 32 },
      1: { fontStyle: "bold", cellWidth: 250 },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center", fontStyle: "bold" },
    },
    didDrawPage: () => {
      drawHeader(doc, pageWidth, logoDataUrl, "Detailed Marks Certificate");
    },
  };

  autoTable(doc, summaryOptions);
}

function drawMetricCards(
  doc: PdfDocument,
  stats: { label: string; value: string }[],
  y: number
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const gap = 14;
  const boxHeight = 46;
  const boxWidth = (pageWidth - 72 - gap * 2) / 3;

  stats.forEach((stat, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = 36 + col * (boxWidth + gap);
    const boxY = y + row * (boxHeight + 14);
    doc.setFillColor(...SOFT_BLUE);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.7);
    doc.roundedRect(x, boxY, boxWidth, boxHeight, 8, 8, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(stat.label, x + 12, boxY + 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(index === 0 ? BRAND_BLUE[0] : TEXT_DARK[0], index === 0 ? BRAND_BLUE[1] : TEXT_DARK[1], index === 0 ? BRAND_BLUE[2] : TEXT_DARK[2]);
    doc.text(truncateText(stat.value, 33), x + 12, boxY + 34);
  });
}

function drawSemesterIntro(doc: PdfDocument, semester: DmcSemester) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...TEXT_DARK);
  doc.text(semester.name, 36, 106);

  drawMetricCards(doc, [
    { label: "Semester GPA", value: `${semester.gpa.toFixed(2)} / 4.00` },
    { label: "Credit Hours", value: formatNumber(semester.totalCreditHours) },
    { label: "Quality Points", value: semester.totalQualityPoints.toFixed(2) },
  ], 124);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...TEXT_DARK);
  doc.text("Course Result Table", 36, 198);
}

function drawFooter(
  doc: PdfDocument,
  pageWidth: number,
  pageHeight: number,
  page: number,
  totalPages: number,
  generatedAt: Date
) {
  const y = pageHeight - 34;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.8);
  doc.line(36, y - 16, pageWidth - 36, y - 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("UamTracker GPA Records", 36, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Generated ${formatDateTime(generatedAt)}`, pageWidth / 2, y, { align: "center" });
  doc.text(`Page ${page} of ${totalPages}`, pageWidth - 36, y, { align: "right" });
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = "/favicon.ico";
    });

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(img, 0, 0, 256, 256);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "student";
}

function truncateText(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
