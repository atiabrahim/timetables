export type Role = "Admin" | "Teacher" | "Student";
export type Language = "ar" | "en";
export type PeriodPart = "Morning" | "Afternoon" | "Evening";

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  observation: string;
  isActive: boolean;
}

export interface Institution {
  name: string;
  subName: string;
  address: string;
  phone: string;
  email: string;
  academicYear?: string;
  logo?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
  observation: string;
  email?: string;
  phone?: string;
}

export interface Assignment {
  id: string;
  employeeId: string;
  day: number;
  period: string;
  subjectId: string;
  classId: string;
  department: string;
  room?: string;
}

export interface TemplateAssignment {
  dayIdx: number;
  period: PeriodPart;
  employeeIds: string[];
}

export interface PeriodConfig {
  day: number;
  period: string;
  isActive: boolean;
}

export interface AcademicClass {
  id: string;
  name: string;
  code?: string;
  qualificationLevel?: string;
}

export interface Subject {
  id: string;
  name: string;
  nameEn?: string;
}

export interface AppState {
  systemUsers: User[];
  institution: Institution;
  employees: Employee[];
  assignments: Assignment[];
  templateAssignments: TemplateAssignment[];
  departments: string[];
  rooms: string[];
  classes: AcademicClass[];
  subjects: Subject[];
  periodConfigs: PeriodConfig[];
}