import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

import type { OnboardingSemester } from "@/app/actions/onboarding-actions";
import { isValidTotalMarks, type TotalMarksType } from "@/lib/quality-points";

type TranscriptCourse = {
  name: string;
  year: number;
  session: string;
  gradeValue: string;
  credits: number;
  index: number;
};

const SESSION_ORDER: Record<string, number> = {
  Spring: 1,
  Summer: 2,
  Fall: 3,
  Autumn: 3,
  Winter: 4,
};

const TRANSCRIPT_HEADER_PATTERN =
  /Course Name\s+Academic Year\s+Academic Session\s+Grade\s+Credits\s+Status/gi;

const COURSE_ROW_PATTERN =
  /([\s\S]*?)\s+(20\d{2})\s+(Spring|Summer|Fall|Autumn|Winter)\s+([0-9][0-9.,]*)\s+(\d+(?:\.\d+)?)\s+Completed\s+with\s+Success/gi;

function normalizeCourseName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseGradeMarks(rawGrade: string, totalMarks: TotalMarksType) {
  const normalized = rawGrade.replace(/\./g, "").replace(",", ".");
  const numeric = Number.parseFloat(normalized);

  if (!Number.isFinite(numeric)) return 0;

  const marks = numeric > totalMarks ? numeric / 10000 : numeric;
  return Math.max(0, Math.min(totalMarks, Math.round(marks * 100) / 100));
}

function creditHoursToTotalMarks(credits: number): TotalMarksType {
  const total = Math.round(credits) * 20;
  return isValidTotalMarks(total) ? total : 100;
}

function getTranscriptTableText(text: string) {
  const normalized = text.replace(/\r/g, "\n");
  const sections = normalized.split(TRANSCRIPT_HEADER_PATTERN).slice(1);
  return sections.join("\n");
}

export function parseTranscriptText(text: string): OnboardingSemester[] {
  const tableText = getTranscriptTableText(text);
  const courses: TranscriptCourse[] = [];
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = COURSE_ROW_PATTERN.exec(tableText)) !== null) {
    const [, rawName, rawYear, rawSession, rawGrade, rawCredits] = match;
    const name = normalizeCourseName(rawName);
    const year = Number.parseInt(rawYear, 10);
    const credits = Number.parseFloat(rawCredits);

    if (!name || !Number.isFinite(year) || !Number.isFinite(credits)) continue;

    courses.push({
      name,
      year,
      session: rawSession,
      gradeValue: rawGrade,
      credits,
      index,
    });
    index += 1;
  }

  if (courses.length === 0) {
    throw new Error("No completed courses were found in this transcript PDF");
  }

  const grouped = new Map<string, TranscriptCourse[]>();

  for (const course of courses) {
    const key = `${course.session} ${course.year}`;
    const current = grouped.get(key) ?? [];
    current.push(course);
    grouped.set(key, current);
  }

  return Array.from(grouped.entries())
    .map(([name, items]) => ({
      name,
      year: items[0].year,
      session: items[0].session,
      courses: items.sort((a, b) => a.index - b.index),
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return (SESSION_ORDER[a.session] ?? 99) - (SESSION_ORDER[b.session] ?? 99);
    })
    .map((semester) => ({
      name: semester.name,
      courses: semester.courses.map((course) => {
        const totalMarks = creditHoursToTotalMarks(course.credits);

        return {
          name: course.name,
          creditHours: course.credits,
          totalMarks,
          obtainedMarks: parseGradeMarks(course.gradeValue, totalMarks),
          isAudit: false,
        };
      }),
    }));
}

export async function parseTranscriptPdfBuffer(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return parseTranscriptText(result.text);
  } finally {
    await parser.destroy();
  }
}
