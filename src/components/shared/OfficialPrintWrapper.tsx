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
  const defaultRightSignature = t.managerSignature || (isRTL ? "توقيع وإمضاء المدير" : "Director Signature");

  return (
    <div 
      className={cn(
        "bg-white mx-auto page-break-container",
        orientation === "portrait" ? "w-[210mm]" : "w-[297mm]",
        "print:p-6 p-8 shadow-sm border border-slate-100 print:border-none print:shadow-none"
      )}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* Official Algerian Header - More compact and formal */}
      <div className="flex flex-col items-center text-center mb-4 space-y-0.5">
        <p className="font-black text-slate-950 text-sm tracking-tight">{t.republic}</p>
        <p className="font-bold text-slate-900 text-xs">{t.centerName}</p>
        <p className="font-bold text-slate-800 text-xs">{institution.name || t.centerLocation}</p>
      </div>

      {/* Info Bar - Split between Department and Academic Year */}
      <div className="flex justify-between items-center border-y border-black py-1.5 mb-4 text-[11px] font-bold">
        <p className="text-black">
          {isRTL ? "المصلحة:" : "Department:"} <span className="font-black">{departments[0] || (isRTL ? "مصلحة التكوين" : "Training Dept")}</span>
        </p>
        <p className="text-black">
          {isRTL ? "السنة الدراسية:" : "Academic Year:"} <span className="font-black">{institution.academicYear || "2023/2024"}</span>
        </p>
      </div>

      {/* Main Title - Centered and Bold */}
      <div className="text-center mb-4">
        <h1 className="font-black text-black text-xl mb-2">
          {title}
        </h1>
        {subtitle && (
          <div className="inline-block border border-black px-4 py-1 rounded-md text-[11px] font-black bg-slate-50">
            {subtitle}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full overflow-hidden">
        {children}
      </div>

      {/* Official Signatures - Placed at the bottom */}
      {showSignatures && (
        <div className="mt-8 grid grid-cols-2 gap-10 pt-4 border-t border-dashed border-slate-300">
          <div className="text-center">
            <p className="font-black text-black text-xs mb-12 underline underline-offset-4">
              {leftSignatureTitle || defaultLeftSignature}
            </p>
            <div className="border-t border-black w-32 mx-auto"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-xs mb-12 underline underline-offset-4">
              {rightSignatureTitle || defaultRightSignature}
            </p>
            <div className="border-t border-black w-32 mx-auto"></div>
          </div>
        </div>
      )}

      {/* Footer Meta */}
      <div className="mt-4 pt-2 text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-50">
        EduSchedule Pro — Generated on {format(new Date(), "yyyy-MM-dd HH:mm")}
      </div>
    </div>
  );
};

export default OfficialPrintWrapper;