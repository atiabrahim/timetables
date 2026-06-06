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
  showSystemFooter = true
}: OfficialPrintWrapperProps) => {
  const { isRTL, institution } = useApp();

  const finalLeftTitle = leftSignatureTitle || (isRTL ? "المدير" : "Director");
  const finalCenterTitle = centerSignatureTitle || institution.pedagogicalManagerTitle || (isRTL ? "المسؤول البيداغوجي" : "Pedagogical Manager");
  const finalRightTitle = rightSignatureTitle || (isRTL ? "أستاذ الفرع" : "Branch Teacher");

  return (
    <div 
      className={cn(
        "bg-white mx-auto page-break-container relative",
        "px-[10mm] py-[10mm]",
        orientation === "portrait" ? "w-[210mm]" : "w-[297mm]",
        "shadow-none border-none print:shadow-none print:border-none print:bg-white"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6 print:mb-4">
        <div className="w-20 h-20 print:w-16 print:h-16 flex items-center justify-center border border-black rounded-xl p-2 bg-white">
          <div className="w-full h-full flex items-center justify-center text-black font-black text-[10px] text-center border border-dashed border-black/20">
            LOGO
          </div>
        </div>

        <div className="flex-1 text-center space-y-1">
          <h2 className="font-black text-black text-lg print:text-base">{institution.name}</h2>
          <h3 className="font-bold text-black text-base print:text-sm underline underline-offset-4 decoration-2">{title}</h3>
          {subtitle && <div className="text-black font-bold text-xs print:text-[10px] opacity-80">{subtitle}</div>}
        </div>

        <div className="w-20 print:w-16"></div> 
      </div>

      {/* Metadata Bar */}
      {metadata && (
        <div className="border-y-2 border-black py-2 mb-4 flex justify-between items-center text-[10px] font-black text-black print:mb-3 print:py-1.5">
          {metadata}
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full overflow-hidden mb-6 print:mb-4 bg-white">
        {children}
      </div>

      {/* Signatures Section */}
      {showSignatures && (
        <div className="grid grid-cols-3 gap-8 pt-4 border-t-2 border-black print:pt-3 print:gap-4">
          <div className="text-center">
            <p className="font-black text-black text-[10px] mb-2">{finalRightTitle}</p>
            <div className="h-16 print:h-14 border border-dashed border-black/30 rounded-2xl bg-white"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[10px] mb-2">{finalCenterTitle}</p>
            <div className="h-16 print:h-14 border border-dashed border-black/30 rounded-2xl bg-white"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[10px] mb-2">{finalLeftTitle}</p>
            <div className="h-16 print:h-14 border border-dashed border-black/30 rounded-2xl bg-white"></div>
          </div>
        </div>
      )}

      {showSystemFooter && (
        <div className="mt-4 text-center text-[7px] font-bold text-black/20 uppercase tracking-[0.3em] print:hidden">
          Educational Scheduling System - Digital Document
        </div>
      )}
    </div>
  );
};

export default OfficialPrintWrapper;