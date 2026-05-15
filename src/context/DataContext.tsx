"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "../translations";
import { Institution, Employee, Assignment, AcademicClass, Subject, PeriodConfig } from "../types";

interface DataContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  institution: Institution;
  setInstitution: React.Dispatch<React.SetStateAction<Institution>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  rooms: string[];
  setRooms: React.Dispatch<React.SetStateAction<string[]>>;
  classes: AcademicClass[];
  setClasses: React.Dispatch<React.SetStateAction<AcademicClass[]>>;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  periodConfigs: PeriodConfig[];
  setPeriodConfigs: React.Dispatch<React.SetStateAction<PeriodConfig[]>>;
  importAllData: (data: any) => void;
  t: any;
  isRTL: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = "academic_scheduler_v2_data";

const DEFAULT_INSTITUTION: Institution = {
  name: "مركز التكوين المهني والتمهين",
  subName: "المجاهد لمقدم مبروك بالدبيلة",
  address: "الدبيلة، الوادي",
  phone: "",
  email: "",
  academicYear: "2023/2024"
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("ar");
  const [institution, setInstitution] = useState<Institution>(DEFAULT_INSTITUTION);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periodConfigs, setPeriodConfigs] = useState<PeriodConfig[]>([]);

  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.institution) setInstitution(parsed.institution);
        setEmployees(parsed.employees || []);
        setAssignments(parsed.assignments || []);
        setRooms(parsed.rooms || []);
        setClasses(parsed.classes || []);
        setSubjects(parsed.subjects || []);
        setPeriodConfigs(parsed.periodConfigs || []);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const existing = savedData ? JSON.parse(savedData) : {};
    const dataToSave = { 
      ...existing,
      institution, employees, assignments, rooms, classes, subjects, periodConfigs 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [institution, employees, assignments, rooms, classes, subjects, periodConfigs]);

  const importAllData = (data: any) => {
    if (!data) return;
    if (data.institution) setInstitution(data.institution);
    if (data.employees) setEmployees(data.employees);
    if (data.rooms) setRooms(data.rooms);
    if (data.classes) setClasses(data.classes);
    if (data.subjects) setSubjects(data.subjects);
    if (data.assignments) setAssignments(data.assignments);
    if (data.periodConfigs) setPeriodConfigs(data.periodConfigs);
  };

  const t = translations[language];

  return (
    <DataContext.Provider value={{ 
      language, setLanguage, institution, setInstitution,
      employees, setEmployees, assignments, setAssignments,
      rooms, setRooms, classes, setClasses, subjects, setSubjects,
      periodConfigs, setPeriodConfigs, importAllData, t, isRTL 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};