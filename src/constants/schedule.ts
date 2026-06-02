import { PeriodPart } from "../types";

export const DAYS = [
  { id: 0, name: "الأحد", en: "Sunday" },
  { id: 1, name: "الاثنين", en: "Monday" },
  { id: 2, name: "الثلاثاء", en: "Tuesday" },
  { id: 3, name: "الأربعاء", en: "Wednesday" },
  { id: 4, name: "الخميس", en: "Thursday" },
];

export const PERIOD_MAP: Record<string, PeriodPart> = {
  "1": "Morning",
  "2": "Morning",
  "3": "Morning",
  "4": "Morning",
  "5": "Afternoon",
  "6": "Afternoon",
  "7": "Afternoon",
  "8": "Evening",
  "9": "Evening",
  "10": "Evening",
  "11": "Evening",
  "12": "Evening",
};

export const PERIODS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

export const REPORT_STYLES_DEFAULT = {
  fontFamily: "'Cairo', sans-serif",
  headerSize: 14,
  titleSize: 22,
  tableSize: 13,
  footerSize: 14,
};