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
        // إلغاء فاصل الصفحات عند وجود نسختين في ورقة واحدة
        !disablePageBreak && "page-break-container",
        doubleMode ? (
          // أنصاف مقاس A4 تماماً
          orientation === "portrait" 
            ? "print:h-[148mm] print:max-h-[148mm] print:py-[4mm] print:px-[6mm] print:border-b print:border-black/10" 
            : "print:h-[105mm] print:max-h-[105mm] print:py-[2mm] print:px-[6mm] print:border-b print:border-black/10"
        ) : (
          "px-[8mm] py-[8mm] print:px-[6mm] print:py-[6mm]"
        ),
        orientation === "portrait" ? "w-[210mm] print:w-full" : "w-[297mm] print:w-full",
        "shadow-none border-none print:shadow-none print:border-none print:bg-white"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-2 print:mb-1">
        <div className="w-14 h-14 print:w-8 print:h-8 flex items-center justify-center border border-black rounded-lg p-1 bg-white">
          <div className="w-full h-full flex items-center justify-center text-black font-black text-[7px] text-center border border-dashed border-black/20">
            LOGO
          </div>
        </div>

        <div className="flex-1 text-center space-y-0.5">
          <h2 className="font-black text-black text-sm print:text-[10px] leading-tight">{institution.name}</h2>
          <h3 className="font-bold text-black text-xs print:text-[9px] underline underline-offset-1 decoration-1">{title}</h3>
          {subtitle && <div className="text-black font-bold text-[9px] print:text-[8px] opacity-80">{subtitle}</div>}
        </div>

        <div className="w-14 print:w-8"></div> 
      </div>

      {/* Metadata Bar */}
      {metadata && (
        <div className="border-y border-black py-0.5 mb-2 flex justify-between items-center text-[8px] font-black text-black print:mb-1 print:py-0.5">
          {metadata}
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn("w-full bg-white", doubleMode ? "flex-1 flex flex-col justify-center overflow-hidden" : "mb-2 print:mb-1")}>
        {children}
      </div>

      {/* Signatures Section */}
      {showSignatures && (
        <div className="grid grid-cols-3 gap-4 pt-1 border-t border-black print:pt-0.5 print:gap-2">
          <div className="text-center">
            <p className="font-black text-black text-[8px] mb-0.5">{finalRightTitle}</p>
            <div className="h-10 print:h-6 border border-dashed border-black/20 rounded-lg bg-white"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[8px] mb-0.5">{finalCenterTitle}</p>
            <div className="h-10 print:h-6 border border-dashed border-black/20 rounded-lg bg-white"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[8px] mb-0.5">{finalLeftTitle}</p>
            <div className="h-10 print:h-6 border border-dashed border-black/20 rounded-lg bg-white"></div>
          </div>
        </div>
      )}

      {showSystemFooter && (
        <div className="mt-1 text-center text-[5px] font-bold text-black/10 uppercase tracking-[0.3em] print:hidden">
          Educational Scheduling System
        </div>
      )}
    </div>
  );
};

export default OfficialPrintWrapper;