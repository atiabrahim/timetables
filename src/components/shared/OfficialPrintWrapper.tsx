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
        "bg-white mx-auto relative flex flex-col justify-between overflow-hidden",
        !disablePageBreak && "page-break-container",
        doubleMode ? (
          orientation === "portrait" 
            ? "print:h-[148mm] print:py-[8mm] print:px-[12mm] border-b border-black/10" 
            : "print:h-[105mm] print:py-[5mm] print:px-[12mm] border-b border-black/10"
        ) : (
          "px-[12mm] py-[12mm] print:px-[10mm] print:py-[10mm] print:min-h-screen"
        ),
        orientation === "portrait" ? "w-[210mm] print:w-full" : "w-[297mm] print:w-full",
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4 print:mb-2 shrink-0">
        <div className="w-16 h-16 print:w-12 print:h-12 flex items-center justify-center border border-black rounded-lg p-1 bg-white overflow-hidden shrink-0">
          {institution.logo ? (
            <img src={institution.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-[8px] font-black">LOGO</div>
          )}
        </div>

        <div className="flex-1 text-center space-y-0.5 px-4">
          <h2 className="font-black text-black text-sm print:text-[11px] leading-tight uppercase">{institution.name}</h2>
          <h3 className="font-bold text-black text-xs print:text-[10px] underline underline-offset-2">{title}</h3>
          {subtitle && <div className="text-black font-bold text-[9px] print:text-[8px] opacity-80">{subtitle}</div>}
        </div>

        <div className="w-16 h-16 print:w-12 print:h-12 flex items-center justify-center border border-black rounded-lg p-1 bg-white overflow-hidden shrink-0">
          {institution.logo ? (
            <img src={institution.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-[8px] font-black">LOGO</div>
          )}
        </div>
      </div>

      {metadata && (
        <div className="border-y border-black py-1 mb-4 flex justify-between items-center text-[9px] font-black text-black print:mb-2 print:py-0.5 shrink-0">
          {metadata}
        </div>
      )}

      <div className="flex-1 w-full bg-white mb-4 print:mb-2 overflow-hidden">
        {children}
      </div>

      {showSignatures && (
        <div className="grid grid-cols-3 gap-6 pt-2 border-t border-black print:pt-1 print:gap-4 shrink-0">
          <div className="text-center">
            <p className="font-black text-black text-[9px] mb-1">{finalRightTitle}</p>
            <div className="h-14 print:h-10 border border-dashed border-black/20 rounded-lg"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[9px] mb-1">{finalCenterTitle}</p>
            <div className="h-14 print:h-10 border border-dashed border-black/20 rounded-lg"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[9px] mb-1">{finalLeftTitle}</p>
            <div className="h-14 print:h-10 border border-dashed border-black/20 rounded-lg"></div>
          </div>
        </div>
      )}

      {showSystemFooter && (
        <div className="mt-2 text-center text-[6px] font-bold text-black/10 uppercase tracking-[0.4em] print:hidden">
          Educational Scheduling System - Digital Copy
        </div>
      )}
    </div>
  );
};

export default OfficialPrintWrapper;