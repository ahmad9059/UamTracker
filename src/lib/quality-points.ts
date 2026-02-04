// MNS-University Quality Point Table (per-mark, weighted by credit hours)
// Source: data/MNSUAM-CGPA.md

export type TotalMarksType = 20 | 40 | 60 | 80 | 100;
export type Grade = "A" | "B" | "C" | "D" | "F";

type MarkQuality = { qualityPoint: number; grade: Grade };

const VALID_TOTAL_MARKS_LIST: TotalMarksType[] = [20, 40, 60, 80, 100];

type TableInput =
  | { marks: number; grade: Grade; qp: number }
  | { range: [number, number]; grade: Grade; qp: number };

const buildTable = (total: TotalMarksType, inputs: TableInput[]): MarkQuality[] => {
  const table: MarkQuality[] = Array.from({ length: total + 1 }, () => ({
    qualityPoint: 0,
    grade: "F",
  }));

  inputs.forEach((entry) => {
    if ("marks" in entry) {
      table[entry.marks] = { qualityPoint: entry.qp, grade: entry.grade };
    } else {
      const [start, end] = entry.range;
      for (let m = start; m <= end; m++) {
        table[m] = { qualityPoint: entry.qp, grade: entry.grade };
      }
    }
  });

  return table;
};

// Per-mark QP tables (values already multiplied by credit hours)
const TABLE_20 = buildTable(20, [
  { marks: 8, grade: "D", qp: 1.0 },
  { marks: 9, grade: "D", qp: 1.5 },
  { marks: 10, grade: "C", qp: 2.0 },
  { marks: 11, grade: "C", qp: 2.33 },
  { marks: 12, grade: "C", qp: 2.67 },
  { marks: 13, grade: "C", qp: 3.0 },
  { marks: 14, grade: "B", qp: 3.33 },
  { marks: 15, grade: "B", qp: 3.67 },
  { range: [16, 20], grade: "A", qp: 4.0 },
]);

const TABLE_40 = buildTable(40, [
  { marks: 16, grade: "D", qp: 2.0 },
  { marks: 17, grade: "D", qp: 2.5 },
  { marks: 18, grade: "D", qp: 3.0 },
  { marks: 19, grade: "C", qp: 3.5 },
  { marks: 20, grade: "C", qp: 4.0 },
  { marks: 21, grade: "C", qp: 4.33 },
  { marks: 22, grade: "B", qp: 4.67 },
  { marks: 23, grade: "B", qp: 5.0 },
  { marks: 24, grade: "B", qp: 5.33 },
  { marks: 25, grade: "B", qp: 5.67 },
  { marks: 26, grade: "C", qp: 6.0 },
  { marks: 27, grade: "C", qp: 6.33 },
  { marks: 28, grade: "B", qp: 6.67 },
  { marks: 29, grade: "B", qp: 7.0 },
  { marks: 30, grade: "B", qp: 7.33 },
  { marks: 31, grade: "B", qp: 7.67 },
  { range: [32, 40], grade: "A", qp: 8.0 },
]);

const TABLE_60 = buildTable(60, [
  { marks: 24, grade: "D", qp: 3.0 },
  { marks: 25, grade: "D", qp: 3.5 },
  { marks: 26, grade: "D", qp: 4.0 },
  { marks: 27, grade: "C", qp: 4.5 },
  { marks: 28, grade: "C", qp: 5.0 },
  { marks: 29, grade: "C", qp: 5.5 },
  { marks: 30, grade: "B", qp: 6.0 },
  { marks: 31, grade: "B", qp: 6.33 },
  { marks: 32, grade: "B", qp: 6.67 },
  { marks: 33, grade: "B", qp: 7.0 },
  { marks: 34, grade: "C", qp: 7.33 },
  { marks: 35, grade: "C", qp: 7.67 },
  { marks: 36, grade: "B", qp: 8.0 },
  { marks: 37, grade: "B", qp: 8.33 },
  { marks: 38, grade: "C", qp: 8.67 },
  { marks: 39, grade: "B", qp: 9.0 },
  { marks: 40, grade: "A", qp: 9.33 },
  { marks: 41, grade: "A", qp: 9.67 },
  { marks: 42, grade: "A", qp: 10.0 },
  { marks: 43, grade: "B", qp: 10.33 },
  { marks: 44, grade: "B", qp: 10.67 },
  { marks: 45, grade: "A", qp: 11.0 },
  { marks: 46, grade: "A", qp: 11.33 },
  { marks: 47, grade: "A", qp: 11.67 },
  { range: [48, 60], grade: "A", qp: 12.0 },
]);

const TABLE_80 = buildTable(80, [
  { marks: 32, grade: "D", qp: 4.0 },
  { marks: 33, grade: "D", qp: 4.5 },
  { marks: 34, grade: "D", qp: 5.0 },
  { marks: 35, grade: "C", qp: 5.5 },
  { marks: 36, grade: "C", qp: 6.0 },
  { marks: 37, grade: "C", qp: 6.5 },
  { marks: 38, grade: "B", qp: 7.0 },
  { marks: 39, grade: "B", qp: 7.5 },
  { marks: 40, grade: "B", qp: 8.0 },
  { marks: 41, grade: "A", qp: 8.33 },
  { marks: 42, grade: "A", qp: 8.67 },
  { marks: 43, grade: "A", qp: 9.0 },
  { marks: 44, grade: "C", qp: 9.33 },
  { marks: 45, grade: "C", qp: 9.67 },
  { marks: 46, grade: "B", qp: 10.0 },
  { marks: 47, grade: "B", qp: 10.33 },
  { marks: 48, grade: "A", qp: 10.67 },
  { marks: 49, grade: "A", qp: 11.0 },
  { marks: 50, grade: "A", qp: 11.33 },
  { marks: 51, grade: "C", qp: 11.67 },
  { marks: 52, grade: "C", qp: 12.0 },
  { marks: 53, grade: "B", qp: 12.33 },
  { marks: 54, grade: "B", qp: 12.67 },
  { marks: 55, grade: "B", qp: 13.0 },
  { marks: 56, grade: "A", qp: 13.33 },
  { marks: 57, grade: "A", qp: 13.67 },
  { marks: 58, grade: "B", qp: 14.0 },
  { marks: 59, grade: "B", qp: 14.33 },
  { marks: 60, grade: "A", qp: 14.67 },
  { marks: 61, grade: "A", qp: 15.0 },
  { marks: 62, grade: "A", qp: 15.33 },
  { marks: 63, grade: "A", qp: 15.67 },
  { range: [64, 80], grade: "A", qp: 16.0 },
]);

const TABLE_100 = buildTable(100, [
  { marks: 40, grade: "D", qp: 5.0 },
  { marks: 41, grade: "D", qp: 5.5 },
  { marks: 42, grade: "D", qp: 6.0 },
  { marks: 43, grade: "C", qp: 6.5 },
  { marks: 44, grade: "C", qp: 7.0 },
  { marks: 45, grade: "C", qp: 7.5 },
  { marks: 46, grade: "B", qp: 8.0 },
  { marks: 47, grade: "B", qp: 8.5 },
  { marks: 48, grade: "B", qp: 9.0 },
  { marks: 49, grade: "A", qp: 9.5 },
  { marks: 50, grade: "A", qp: 10.0 },
  { marks: 51, grade: "A", qp: 10.33 },
  { marks: 52, grade: "C", qp: 10.67 },
  { marks: 53, grade: "C", qp: 11.0 },
  { marks: 54, grade: "B", qp: 11.33 },
  { marks: 55, grade: "B", qp: 11.67 },
  { marks: 56, grade: "A", qp: 12.0 },
  { marks: 57, grade: "A", qp: 12.33 },
  { marks: 58, grade: "B", qp: 12.67 },
  { marks: 59, grade: "B", qp: 13.0 },
  { marks: 60, grade: "A", qp: 13.33 },
  { marks: 61, grade: "A", qp: 13.67 },
  { marks: 62, grade: "A", qp: 14.0 },
  { marks: 63, grade: "A", qp: 14.33 },
  { marks: 64, grade: "A", qp: 14.67 },
  { marks: 65, grade: "A", qp: 15.0 },
  { marks: 66, grade: "B", qp: 15.33 },
  { marks: 67, grade: "B", qp: 15.67 },
  { marks: 68, grade: "B", qp: 16.0 },
  { marks: 69, grade: "B", qp: 16.33 },
  { marks: 70, grade: "B", qp: 16.67 },
  { marks: 71, grade: "A", qp: 17.0 },
  { marks: 72, grade: "A", qp: 17.33 },
  { marks: 73, grade: "A", qp: 17.67 },
  { marks: 74, grade: "A", qp: 18.0 },
  { marks: 75, grade: "A", qp: 18.33 },
  { marks: 76, grade: "A", qp: 18.67 },
  { marks: 77, grade: "A", qp: 19.0 },
  { marks: 78, grade: "A", qp: 19.33 },
  { marks: 79, grade: "A", qp: 19.67 },
  { range: [80, 100], grade: "A", qp: 20.0 },
]);

export const QUALITY_POINT_TABLES: Record<TotalMarksType, MarkQuality[]> = {
  20: TABLE_20,
  40: TABLE_40,
  60: TABLE_60,
  80: TABLE_80,
  100: TABLE_100,
};

export const VALID_TOTAL_MARKS = VALID_TOTAL_MARKS_LIST;

/**
 * Get quality point, grade, and percentage for given marks and total.
 * Marks are rounded to the nearest integer to match the official per-mark table.
 */
export function getQualityPoint(
  obtainedMarks: number,
  totalMarks: TotalMarksType
): { qualityPoint: number; grade: Grade; percentage: number } {
  const mark = Math.max(0, Math.min(totalMarks, Math.round(obtainedMarks)));
  const percentage = (mark / totalMarks) * 100;

  const table = QUALITY_POINT_TABLES[totalMarks];
  const entry = table[mark] ?? { qualityPoint: 0, grade: "F" };

  return {
    qualityPoint: entry.qualityPoint,
    grade: entry.grade,
    percentage: Math.round(percentage * 100) / 100,
  };
}

export function isValidTotalMarks(marks: number): marks is TotalMarksType {
  return VALID_TOTAL_MARKS_LIST.includes(marks as TotalMarksType);
}
