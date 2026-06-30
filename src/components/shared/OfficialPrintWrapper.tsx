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

  // تعريف أبعاد الصفحة الرسمية A4 بالملم
  const dimensions = {
    portrait: { w: "210mm", h: "297mm" },
    landscape: { w: "297mm", h: "210mm" },
    halfPortrait: { w: "210mm", h: "148.5mm" },
    halfLandscape: { w: "148.5mm", h: "210mm" }
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
        "overflow-hidden box-border"
      )}
      style={{
        width: currentDim.w,
        height: currentDim.h,
        minHeight: currentDim.h,
        padding: doubleMode ? "8mm" : "15mm",
        fontFamily: "'Cairo', sans-serif"
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="w-16 h-16 flex items-center justify-center border-2 border-black rounded-lg p-1 bg-white overflow-hidden shrink-0">
          {institution.logo ? (
            <img src={institution.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-[10px] font-black">LOGO</div>
          )}
        </div>

        <div className="flex-1 text-center space-y-1 px-4">
          <h2 className="font-black text-black text-xs md:text-sm leading-tight uppercase">{institution.name}</h2>
          <h3 className="font-black text-black text-sm md:text-lg underline underline-offset-4 decoration-2">{title}</h3>
          {subtitle && <div className="text-black font-bold text-[10px] md:text-xs mt-1">{subtitle}</div>}
        </div>

        <div className="w-16 h-16 flex items-center justify-center border-2 border-black rounded-lg p-1 bg-white overflow-hidden shrink-0">
          {institution.logo ? (
            <img src={institution.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-[10px] font-black">LOGO</div>
          )}
        </div>
      </div>

      {metadata && (
        <div className="border-y-2 border-black py-1.5 mb-6 flex justify-between items-center text-[10px] font-black text-black shrink-0">
          {metadata}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full bg-white mb-6 overflow-hidden">
        {children}
      </div>

      {/* Signatures Section */}
      {showSignatures && (
        <div className="grid grid-cols-3 gap-8 pt-4 border-t-2 border-black shrink-0">
          <div className="text-center">
            <p className="font-black text-black text-[10px] mb-2">{finalRightTitle}</p>
            <div className="h-16 border border-dashed border-black/20 rounded-xl bg-slate-50/20"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[10px] mb-2">{finalCenterTitle}</p>
            <div className="h-16 border border-dashed border-black/20 rounded-xl bg-slate-50/20"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-[10px] mb-2">{finalLeftTitle}</p>
            <div className="h-16 border border-dashed border-black/20 rounded-xl bg-slate-50/20"></div>
          </div>
        </div>
      )}

      {showSystemFooter && (
        <div className="mt-4 text-center text-[7px] font-black text-black/10 uppercase tracking-[0.5em] print:hidden">
          Official Academic Record - EduSchedule System
        </div>
      )}
    </div>
  );
};

export default OfficialPrintWrapper;