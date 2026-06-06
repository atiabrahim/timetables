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
        "bg-white mx-auto relative flex flex-col justify-between",
        !disablePageBreak && "page-break-container",
        doubleMode ? (
          orientation === "portrait" 
            ? "print:h-[142mm] print:py-[2mm] print:px-[4mm]" 
            : "print:h-[100mm] print:py-[1mm] print:px-[4mm]"
        ) : (
          "px-[8mm] py-[8mm] print:px-[4mm] print:py-[4mm]"
        ),
        orientation === "portrait" ? "w-[210mm] print:w-full" : "w-[297mm] print:w-full",
        "shadow-none border-none print:shadow-none print:border-none print:bg-white"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4 print:mb-1">
        <div className="w-16 h-16 print:w-10 print:h-10 flex items-center justify-center border border-black rounded-xl p-1 bg-white">
          <div className="w-full h-full flex items-center justify-center text-black font-black text-[8px] text-center border border-dashed border-black/20">
            LOGO
          </div>
        </div>

        <div className="flex-1 text-center space-y-0.5">
          <h2 className="font-black text-black text-base print:text-xs">{institution.name}</h2>
          <h3 className="font-bold text-black text-sm print:text-[11px] underline underline-offset-2 decoration-2">{title}</h3>
          {subtitle && <div className="text-black font-bold text-[10px] print:text-[9px] opacity-80">{subtitle}</div>}
        </div>

        <div className="w-16 print:w-10"></div> 
      </div>

      {/* Metadata Bar */}
      {metadata && (
        <div className="border-y border-black py-1 mb-3 flex justify-between items-center text-[9px] font-black text-black print:mb-1.5 print:py-0.5">
          {metadata}
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn("w-full overflow-hidden bg-white", doubleMode ? "flex-1 flex flex-col justify-center" : "mb-4 print:mb-1.5")}>
        {children}
      </div>

      {/* Signatures Section */}
      {showSignatures && (
        <div className="grid grid-cols-3 gap-6 pt-2 border-t border-black print:pt-1 print:gap-3">
          <div className="text-center">
            <p className="font-black text-black text-[9px] mb-1">{finalRightTitle}</p>
            <div className="h-12 print:h-8 border border-dashed border-black/30 rounded-xl bg-white"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[9px] mb-1">{finalCenterTitle}</p>
            <div className="h-12 print:h-8 border border-dashed border-black/30 rounded-xl bg-white"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[9px] mb-1">{finalLeftTitle}</p>
            <div className="h-12 print:h-8 border border-dashed border-black/30 rounded-xl bg-white"></div>
          </div>
        </div>
      )}

      {showSystemFooter && (
        <div className="mt-2 text-center text-[6px] font-bold text-black/20 uppercase tracking-[0.3em] print:hidden">
          Educational Scheduling System - Digital Document
        </div>
      )}
    </div>
  );
};

export default OfficialPrintWrapper;