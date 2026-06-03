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
  showSystemFooter?: boolean;
  leftSignatureTitle?: string;
  rightSignatureTitle?: string;
}

const OfficialPrintWrapper = ({
  title,
  subtitle,
  orientation = "portrait",
  children,
  showSignatures = true,
  showSystemFooter = false,
  leftSignatureTitle,
  rightSignatureTitle
}: OfficialPrintWrapperProps) => {
  const { t, isRTL, institution, departments } = useApp();

  const finalLeftTitle = leftSignatureTitle || institution.pedagogicalManagerTitle || (isRTL ? "المسؤول البيداغوجي" : "Pedagogical Manager");
  const finalRightTitle = rightSignatureTitle || institution.generalManagerTitle || (isRTL ? "مدير المؤسسة" : "General Manager");

  return (
    <div 
      className={cn(
        "bg-white mx-auto page-break-container",
        orientation === "portrait" ? "w-[210mm]" : "w-[297mm]",
        "print:p-10 p-8 shadow-sm border border-slate-100 print:border-none print:shadow-none"
      )}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* Official Header */}
      <div className="flex flex-col items-center text-center mb-6 space-y-1">
        <p className="font-black text-black text-sm tracking-tight uppercase">{t.republic}</p>
        <p className="font-bold text-black text-xs">{t.centerName}</p>
        <p className="font-bold text-black text-xs">{institution.name || t.centerLocation}</p>
      </div>

      {/* Info Bar */}
      <div className="flex justify-between items-center border-y-2 border-black py-2 mb-6 text-[12px] font-bold">
        <p className="text-black">
          {isRTL ? "المصلحة:" : "Department:"} <span className="font-black">{departments[0] || (isRTL ? "مصلحة التكوين" : "Training Dept")}</span>
        </p>
        <p className="text-black">
          {isRTL ? "السنة الدراسية:" : "Academic Year:"} <span className="font-black">{institution.academicYear || "2023/2024"}</span>
        </p>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="font-black text-black text-2xl mb-2">
          {title}
        </h1>
        {subtitle && (
          <div className="inline-block border border-black px-6 py-1 rounded-md text-[12px] font-black bg-slate-50">
            {subtitle}
          </div>
        )}
      </div>

      <div className="flex-1 w-full overflow-hidden">
        {children}
      </div>

      {/* Signatures */}
      {showSignatures && (
        <div className="mt-12 grid grid-cols-2 gap-20 pt-6 border-t-2 border-black">
          <div className="text-center">
            <p className="font-black text-black text-sm mb-16 underline underline-offset-8 decoration-2">
              {finalLeftTitle}
            </p>
            <div className="border-t-2 border-black w-40 mx-auto opacity-20"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-sm mb-16 underline underline-offset-8 decoration-2">
              {finalRightTitle}
            </p>
            <div className="border-t-2 border-black w-40 mx-auto opacity-20"></div>
          </div>
        </div>
      )}

      {showSystemFooter && (
        <div className="mt-6 pt-2 text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-50 print:hidden">
          EduSchedule Pro — Generated on {format(new Date(), "yyyy-MM-dd HH:mm")}
        </div>
      )}
    </div>
  );
};

export default OfficialPrintWrapper;