"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useApp } from "../../context/AppContext";
import { format } from "date-fns";

interface OfficialPrintWrapperProps {
  title: string;
  subtitle?: React.ReactNode;
  orientation?: "portrait" | "landscape";
  children: React.ReactNode;
  showSignatures?: boolean;
  leftSignatureTitle?: string;
  rightSignatureTitle?: string;
}

const OfficialPrintWrapper = ({
  title,
  subtitle,
  orientation = "portrait",
  children,
  showSignatures = true,
  leftSignatureTitle,
  rightSignatureTitle
}: OfficialPrintWrapperProps) => {
  const { t, isRTL, institution, departments } = useApp();

  const defaultLeftSignature = isRTL ? "رئيس مصلحة التكوين" : "Head of Training";
  const defaultRightSignature = t.managerSignature || (isRTL ? "توقيع وإمضاء المدير" : "Director's Signature");

  return (
    <div 
      className={cn(
        "bg-white p-10 mx-auto shadow-2xl border border-slate-100 rounded-[2rem] page-break-container",
        orientation === "portrait" ? "max-w-[210mm]" : "max-w-[297mm]",
        "print:shadow-none print:border print:border-slate-300 print:rounded-[2rem] print:p-10 print:mx-auto print:my-4"
      )}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* Official Algerian Header */}
      <div className="flex flex-col items-center text-center mb-6 space-y-1 text-sm md:text-base">
        <p className="font-black text-slate-900 tracking-tight">{t.republic}</p>
        <p className="font-bold text-slate-800">{t.centerName}</p>
        <p className="font-bold text-slate-700">{institution.name || t.centerLocation}</p>
      </div>

      {/* Department & Academic Year Row */}
      <div className="mb-6 flex justify-between items-center border-b-2 border-slate-900 pb-3 text-sm md:text-base">
        <p className="font-black text-slate-950">
          {isRTL ? "المصلحة:" : "Department:"} <span className="font-bold text-emerald-800">{departments[0] || (isRTL ? "مصلحة التكوين" : "Training Dept")}</span>
        </p>
        <p className="font-black text-slate-950">
          {isRTL ? "السنة الدراسية:" : "Academic Year:"} <span className="font-bold text-emerald-800">{institution.academicYear || "2023/2024"}</span>
        </p>
      </div>

      {/* Title Section */}
      <div className="text-center mb-8">
        <h1 className="font-black text-slate-900 mb-4 underline underline-offset-8 decoration-2 text-xl md:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <div className="flex justify-center items-center gap-6 bg-emerald-50/50 py-2.5 px-8 rounded-2xl inline-flex mx-auto border border-emerald-100 shadow-sm">
            {subtitle}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-visible w-full">
        {children}
      </div>

      {/* Signatures Footer */}
      {showSignatures && (
        <div className="mt-10 grid grid-cols-2 gap-16 pt-6 border-t border-dashed border-slate-300 text-sm md:text-base">
          <div className="text-center">
            <p className="font-black text-slate-950 mb-16 underline underline-offset-4">
              {leftSignatureTitle || defaultLeftSignature}
            </p>
            <div className="border-t-2 border-slate-900 w-40 mx-auto"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-slate-950 mb-16 underline underline-offset-4">
              {rightSignatureTitle || defaultRightSignature}
            </p>
            <div className="border-t-2 border-slate-900 w-40 mx-auto"></div>
          </div>
        </div>
      )}

      {/* System Timestamp */}
      <div className="mt-8 pt-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-50">
        Generated via EduSchedule Pro v2.5 — {format(new Date(), "yyyy-MM-dd HH:mm")}
      </div>
    </div>
  );
};

export default OfficialPrintWrapper;