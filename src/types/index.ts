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
  pedagogicalManagerTitle?: string;
  generalManagerTitle?: string;
}

export interface Department {
  id: string;
  number: string;
  name: string;
  head: string;
  code: string;
  observation: string;
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

export interface Requirement {
  id: string;
  employeeId: string;
  subjectId: string;
  classId: string;
  room: string;
  count: number;
}

export interface TemplateAssignment {
  dayIdx: number;
  period: PeriodPart;
  employeeIds: string[];
}

export interface DailyAssignment {
  date: string;
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

export interface TeacherConstraint {
  employeeId: string;
  day: number;
  period: string;
  isAvailable: boolean;
}

export interface ClassConstraint {
  classId: string;
  day: number;
  period: string;
  isAvailable: boolean;
}

export interface RoomConstraint {
  roomName: string;
  day: number;
  period: string;
  isAvailable: boolean;
}

export interface AppState {
  systemUsers: User[];
  institution: Institution;
  employees: Employee[];
  assignments: Assignment[];
  requirements: Requirement[];
  templateAssignments: TemplateAssignment[];
  dailyAssignments: DailyAssignment[];
  departments: Department[];
  rooms: string[];
  classes: AcademicClass[];
  subjects: Subject[];
  periodConfigs: PeriodConfig[];
  teacherConstraints?: TeacherConstraint[];
  classConstraints?: ClassConstraint[];
  roomConstraints?: RoomConstraint[];
  periodTimings?: Record<string, string>;
}