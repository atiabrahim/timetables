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
  rightSignatureTitle?: string;
  showSystemFooter?: boolean;
  disablePageBreak?: boolean;
  doubleMode?: boolean;
  // إعدادات الخطوط
  fontFamily?: string;
  headerSize?: number;
  titleSize?: number;
  footerSize?: number;
}

const OfficialPrintWrapper = ({
  title,
  subtitle,
  metadata,
  orientation = "portrait",
  children,
  showSignatures = true,
  leftSignatureTitle,
  rightSignatureTitle,
  showSystemFooter = true,
  disablePageBreak = false,
  doubleMode = false,
  fontFamily = "'Cairo', sans-serif",
  headerSize = 10,
  titleSize = 14,
  footerSize = 8
}: OfficialPrintWrapperProps) => {
  const { isRTL, institution } = useApp();

  const finalLeftTitle = leftSignatureTitle || (isRTL ? "المدير" : "Director");
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
        "bg-white relative flex flex-col mx-auto",
        !disablePageBreak && "page-break-always",
        "print:shadow-none print:border-none print:m-0",
        "overflow-hidden box-border break-inside-avoid"
      )}
      style={{
        width: currentDim.w,
        height: currentDim.h,
        maxHeight: currentDim.h,
        // تقليل الهوامش الجانبية لزيادة مساحة الجدول وتوسيطه
        padding: doubleMode ? "4mm 8mm" : "8mm 8mm",
        fontFamily: fontFamily
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4 shrink-0 px-2">
        <div className="w-14 h-14 flex items-center justify-center border-2 border-black rounded-lg p-1 bg-white overflow-hidden shrink-0">
          {institution.logo ? (
            <img src={institution.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-[10px] font-black text-center leading-none">LOGO</div>
          )}
        </div>

        <div className="flex-1 text-center space-y-1 px-4">
          <h2 
            className="font-black text-black leading-tight uppercase"
            style={{ fontSize: `${headerSize + 2}px` }}
          >
            {institution.name}
          </h2>
          <h3 
            className="font-black text-black underline underline-offset-4 decoration-2"
            style={{ fontSize: `${titleSize + 2}px` }}
          >
            {title}
          </h3>
          {subtitle && (
            <div 
              className="text-black font-bold mt-1"
              style={{ fontSize: `${headerSize}px` }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div className="w-14 h-14 flex items-center justify-center shrink-0 opacity-0 print:opacity-100">
           {institution.logo && <img src={institution.logo} alt="Logo" className="max-h-full max-w-full object-contain" />}
        </div>
      </div>

      {metadata && (
        <div className="border-y-2 border-black py-1 mb-4 flex justify-between items-center font-black text-black shrink-0 px-2" style={{ fontSize: `${headerSize}px` }}>
          {metadata}
        </div>
      )}

      {/* Main Content Area - Ensuring full width usage */}
      <div className="w-full flex-1 bg-white mb-2 overflow-hidden px-1">
        {children}
      </div>

      {/* Signatures Section */}
      {showSignatures && (
        <div className="grid grid-cols-2 gap-12 pt-2 border-t-2 border-black shrink-0 px-4 mt-auto mb-2">
          <div className="text-center">
            <p className="font-black text-black mb-1" style={{ fontSize: `${footerSize + 1}px` }}>{finalRightTitle}</p>
            <div className="h-16 border border-dashed border-black/20 rounded-lg bg-slate-50/5"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black mb-1" style={{ fontSize: `${footerSize + 1}px` }}>{finalLeftTitle}</p>
            <div className="h-16 border border-dashed border-black/20 rounded-lg bg-slate-50/5"></div>
          </div>
        </div>
      )}

      {showSystemFooter && (
        <div className="mt-1 text-center text-[6px] font-black text-black/10 uppercase tracking-[0.3em] print:hidden">
          Official Academic Record - EduSchedule System
        </div>
      )}
    </div>
  );
};

export default OfficialPrintWrapper;