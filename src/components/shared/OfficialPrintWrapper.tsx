"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useApp } from "../../context/AppContext";

interface OfficialPrintWrapperProps {
  title: string;
  subtitle?: React.ReactNode;
  metadata?: React.ReactNode;
  orientation?: "portrait" | "landscape";
  children: React.ReactNode;
  showSignatures?: boolean;
  leftSignatureTitle?: string;
  centerSignatureTitle?: string;
  rightSignatureTitle?: string;
  showSystemFooter?: boolean;
  disablePageBreak?: boolean;
  doubleMode?: boolean;
}

const OfficialPrintWrapper = ({
  title,
  subtitle,
  metadata,
  orientation = "portrait",
  children,
  showSignatures = true,
  leftSignatureTitle,
  centerSignatureTitle,
  rightSignatureTitle,
  showSystemFooter = true,
  disablePageBreak = false,
  doubleMode = false
}: OfficialPrintWrapperProps) => {
  const { isRTL, institution } = useApp();

  const finalLeftTitle = leftSignatureTitle || (isRTL ? "المدير" : "Director");
  const finalCenterTitle = centerSignatureTitle || institution.pedagogicalManagerTitle || (isRTL ? "المسؤول البيداغوجي" : "Pedagogical Manager");
  const finalRightTitle = rightSignatureTitle || (isRTL ? "أستاذ الفرع" : "Branch Teacher");

  const dimensions = {
    portrait: { w: "210mm", h: "296mm" },
    landscape: { w: "297mm", h: "209mm" },
    halfPortrait: { w: "210mm", h: "148mm" },
    halfLandscape: { w: "148mm", h: "210mm" }
  };

  const currentDim = doubleMode 
    ? (orientation === "portrait" ? dimensions.halfPortrait : dimensions.halfLandscape)
    : (orientation === "portrait" ? dimensions.portrait : dimensions.landscape);

  return (
    <div 
      className={cn(
        "bg-white relative flex flex-col shadow-sm border border-slate-100 mx-auto",
        !disablePageBreak && "page-break-always",
        "print:shadow-none print:border-none print:m-0",
        "overflow-hidden box-border break-inside-avoid"
      )}
      style={{
        width: currentDim.w,
        height: currentDim.h,
        maxHeight: currentDim.h,
        // ضبط الهوامش الجانبية لتكون 10 ملم (1 سم) بشكل صريح
        padding: doubleMode ? "4mm 10mm" : "10mm 10mm",
        fontFamily: "'Cairo', sans-serif"
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-3 shrink-0">
        <div className="w-12 h-12 flex items-center justify-center border-2 border-black rounded-lg p-1 bg-white overflow-hidden shrink-0">
          {institution.logo ? (
            <img src={institution.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-[10px] font-black text-center leading-none">LOGO</div>
          )}
        </div>

        <div className="flex-1 text-center space-y-0 px-4">
          <h2 className="font-black text-black text-[10px] md:text-xs leading-tight uppercase">{institution.name}</h2>
          <h3 className="font-black text-black text-xs md:text-sm underline underline-offset-4 decoration-2">{title}</h3>
          {subtitle && <div className="text-black font-bold text-[8px] md:text-[9px] mt-0.5">{subtitle}</div>}
        </div>

        <div className="w-12 h-12 flex items-center justify-center shrink-0 opacity-0 print:opacity-100">
           {institution.logo && <img src={institution.logo} alt="Logo" className="max-h-full max-w-full object-contain" />}
        </div>
      </div>

      {metadata && (
        <div className="border-y-2 border-black py-0.5 mb-2 flex justify-between items-center text-[8.5px] font-black text-black shrink-0">
          {metadata}
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full bg-white mb-1 overflow-hidden">
        {children}
      </div>

      {/* Signatures Section */}
      {showSignatures && (
        <div className="grid grid-cols-3 gap-4 pt-1 border-t-2 border-black shrink-0">
          <div className="text-center">
            <p className="font-black text-black text-[8px] mb-0.5">{finalRightTitle}</p>
            <div className="h-12 border border-dashed border-black/20 rounded-lg bg-slate-50/10"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[8px] mb-0.5">{finalCenterTitle}</p>
            <div className="h-12 border border-dashed border-black/20 rounded-lg bg-slate-50/10"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[8px] mb-0.5">{finalLeftTitle}</p>
            <div className="h-12 border border-dashed border-black/20 rounded-lg bg-slate-50/10"></div>
          </div>
        </div>
      )}

      {showSystemFooter && (
        <div className="mt-1 text-center text-[5px] font-black text-black/5 uppercase tracking-[0.3em] print:hidden">
          Official Academic Record - EduSchedule System
        </div>
      )}
    </div>
  );
};

export default OfficialPrintWrapper;