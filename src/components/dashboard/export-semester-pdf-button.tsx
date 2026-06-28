"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { CellHookData, Color, UserOptions } from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import type { Grade, TotalMarksType } from "@/lib/quality-points";

type SemesterCourse = {
  id: string;
  name?: string;
  creditHours: number;
  totalMarks: TotalMarksType;
  obtainedMarks: number;
  percentage: number;
  grade: Grade;
  qualityPoint: number;
  isAudit: boolean;
};

type SemesterReport = {
  name: string;
  gpa: number;
  totalCreditHours: number;
  totalQualityPoints: number;
  courses: SemesterCourse[];
};

type StudentInfo = {
  name: string | null;
  email: string | null;
};

type PdfDocument = InstanceType<typeof import("jspdf").jsPDF>;

interface ExportSemesterPdfButtonProps {
  semester: SemesterReport;
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

export function ExportSemesterPdfButton({
  semester,
  student,
}: ExportSemesterPdfButtonProps) {
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
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const generatedAt = new Date();

      drawReportIntro(doc, semester, student, generatedAt);

      const tableOptions: UserOptions = {
        startY: 262,
        margin: { top: 86, right: 36, bottom: 58, left: 36 },
        theme: "grid",
        showHead: "everyPage",
        showFoot: "lastPage",
        head: [[
          "#",
          "Course Name",
          "Credit Hours",
          "Marks",
          "Percentage",
          "Grade",
          "Quality Points",
        ]],
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
        bodyStyles: {
          fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 251, 255],
        },
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
          drawHeader(doc, pageWidth, logoDataUrl);
        },
      };

      autoTable(doc, tableOptions);

      const totalPages = doc.getNumberOfPages();
      for (let page = 1; page <= totalPages; page += 1) {
        doc.setPage(page);
        drawFooter(doc, pageWidth, pageHeight, page, totalPages, generatedAt);
      }

      doc.save(`uam-${slugify(semester.name)}-semester-report.pdf`);
    } catch (err) {
      console.error("Failed to export semester PDF:", err);
      setError("Could not export PDF. Please try again.");
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
        disabled={isExporting}
        className="border-primary/40 bg-primary/5 text-primary font-semibold shadow-[0_10px_24px_-14px_hsl(var(--primary))] hover:bg-primary/10 hover:border-primary/60 hover:shadow-[0_14px_30px_-16px_hsl(var(--primary))]"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isExporting ? "Exporting..." : "Export PDF"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function drawHeader(doc: PdfDocument, pageWidth: number, logoDataUrl: string | null) {
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
  doc.text("UAM-University", 80, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("GPA Tracker", 80, 51);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Semester Performance Report", pageWidth - 36, 39, { align: "right" });

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.8);
  doc.line(36, 70, pageWidth - 36, 70);
}

function drawReportIntro(
  doc: PdfDocument,
  semester: SemesterReport,
  student: StudentInfo,
  generatedAt: Date
) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(...TEXT_DARK);
  doc.text(semester.name, 36, 104);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Student", 36, 124);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text(student.name || "Student", 84, 124);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Email", 36, 140);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text(student.email || "Not available", 84, 140);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Generated", pageWidth - 252, 124);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text(formatDateTime(generatedAt), pageWidth - 182, 124);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Report Type", pageWidth - 252, 140);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text("Semester GPA Summary", pageWidth - 182, 140);

  const gap = 14;
  const boxY = 164;
  const boxHeight = 44;
  const boxWidth = (pageWidth - 72 - gap * 3) / 4;
  const stats = [
    { label: "Semester GPA", value: `${semester.gpa.toFixed(2)} / 4.00` },
    { label: "Credit Hours", value: formatNumber(semester.totalCreditHours) },
    { label: "Quality Points", value: semester.totalQualityPoints.toFixed(2) },
    { label: "Courses", value: String(semester.courses.length) },
  ];

  stats.forEach((stat, index) => {
    const x = 36 + index * (boxWidth + gap);
    doc.setFillColor(...SOFT_BLUE);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.7);
    doc.roundedRect(x, boxY, boxWidth, boxHeight, 8, 8, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(stat.label, x + 12, boxY + 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(index === 0 ? BRAND_BLUE[0] : TEXT_DARK[0], index === 0 ? BRAND_BLUE[1] : TEXT_DARK[1], index === 0 ? BRAND_BLUE[2] : TEXT_DARK[2]);
    doc.text(stat.value, x + 12, boxY + 34);
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...TEXT_DARK);
  doc.text("Course Result Table", 36, 238);
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
  doc.text("UAM-University GPA Tracker", 36, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Generated ${formatDateTime(generatedAt)}`, pageWidth / 2, y, {
    align: "center",
  });
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
  return slug || "semester";
}
