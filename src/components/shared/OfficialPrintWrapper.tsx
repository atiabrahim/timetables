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

  return (
    <div 
      className={cn(
        "bg-white relative flex flex-col justify-between print:shadow-none print:border-none",
        !disablePageBreak && "page-break-container",
        doubleMode ? (
          orientation === "portrait" 
            ? "print:h-[148.5mm] print:py-[3mm] print:px-[8mm]" 
            : "print:h-[105mm] print:py-[2mm] print:px-[8mm]"
        ) : (
          orientation === "portrait"
            ? "px-[12mm] py-[12mm] print:px-[8mm] print:py-[8mm] print:h-[296mm] print:max-h-[296mm] print:overflow-hidden"
            : "px-[12mm] py-[12mm] print:px-[8mm] print:py-[8mm] print:h-[209mm] print:max-h-[209mm] print:overflow-hidden"
        ),
        // العرض للمعاينة فقط (الشاشة)
        orientation === "portrait" ? "w-[210mm] mx-auto print:w-full print:mx-0 print:max-w-none" : "w-[297mm] mx-auto print:w-full print:mx-0 print:max-w-none",
        "print:overflow-hidden overflow-hidden"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4 print:mb-3 shrink-0">
        <div className="w-16 h-16 print:w-14 print:h-14 flex items-center justify-center border-2 border-black rounded-lg p-1 bg-white overflow-hidden shrink-0 shadow-sm">
          {institution.logo ? (
            <img src={institution.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-[10px] font-black">LOGO</div>
          )}
        </div>

        <div className="flex-1 text-center space-y-1 px-6">
          <h2 className="font-black text-black text-sm print:text-[11px] leading-tight uppercase tracking-tight">{institution.name}</h2>
          <h3 className="font-black text-black text-base print:text-[13px] underline underline-offset-4 decoration-2">{title}</h3>
          {subtitle && <div className="text-black font-bold text-[10px] print:text-[9px] mt-1 opacity-90">{subtitle}</div>}
        </div>

        <div className="w-16 h-16 print:w-14 print:h-14 flex items-center justify-center border-2 border-black rounded-lg p-1 bg-white overflow-hidden shrink-0 shadow-sm">
          {institution.logo ? (
            <img src={institution.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-[10px] font-black">LOGO</div>
          )}
        </div>
      </div>

      {metadata && (
        <div className="border-y-2 border-black py-1 mb-4 flex justify-between items-center text-[10px] font-black text-black print:mb-3 print:py-0.5 shrink-0">
          {metadata}
        </div>
      )}

      <div className="flex-1 w-full bg-white mb-4 print:mb-3 overflow-hidden flex flex-col justify-center">
        {children}
      </div>

      {showSignatures && (
        <div className="grid grid-cols-3 gap-8 pt-3 border-t-2 border-black print:pt-1.5 print:gap-6 shrink-0">
          <div className="text-center">
            <p className="font-black text-black text-[10px] mb-1">{finalRightTitle}</p>
            <div className="h-14 print:h-12 border border-dashed border-black/30 rounded-xl bg-slate-50/20"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[10px] mb-1">{finalCenterTitle}</p>
            <div className="h-14 print:h-12 border border-dashed border-black/30 rounded-xl bg-slate-50/20"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[10px] mb-1">{finalLeftTitle}</p>
            <div className="h-14 print:h-12 border border-dashed border-black/30 rounded-xl bg-slate-50/20"></div>
          </div>
        </div>
      )}

      {showSystemFooter && (
        <div className="mt-2 text-center text-[7px] font-black text-black/10 uppercase tracking-[0.5em] print:hidden">
          Official Academic Record - Verified Original
        </div>
      )}
    </div>
  );
};

export default OfficialPrintWrapper;