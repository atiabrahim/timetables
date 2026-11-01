"use client";

import React, { useState, useEffect, useRef } from "react";
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
  fontFamily,
  headerSize,
  titleSize,
  footerSize
}: OfficialPrintWrapperProps) => {
  const { isRTL, institution, reportStyles } = useApp();
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const finalFontFamily = fontFamily || reportStyles?.fontFamily || "'Cairo', sans-serif";
  const finalHeaderSize = headerSize || reportStyles?.headerSize || 10;
  const finalTitleSize = titleSize || reportStyles?.titleSize || 14;
  const finalFooterSize = footerSize || reportStyles?.footerSize || 8;

  const finalLeftTitle = leftSignatureTitle || (isRTL ? "المدير" : "Director");
  const finalRightTitle = rightSignatureTitle || (isRTL ? "أستاذ الفرع" : "Branch Teacher");

  const dimensions = {
    portrait: { w: "210mm", h: "297mm" },
    landscape: { w: "297mm", h: "210mm" },
    halfPortrait: { w: "210mm", h: "148mm" },
    halfLandscape: { w: "148mm", h: "210mm" }
  };

  const currentDim = doubleMode 
    ? (orientation === "portrait" ? dimensions.halfPortrait : dimensions.halfLandscape)
    : (orientation === "portrait" ? dimensions.portrait : dimensions.landscape);

  useEffect(() => {
    const handleScale = () => {
      // Don't apply scaling for print
      if (window.matchMedia('print').matches) {
        setScale(1);
        if (contentRef.current) {
          contentRef.current.style.transform = "none";
          contentRef.current.style.width = "100%";
        }
        return;
      }
      
      if (!containerRef.current || !contentRef.current) return;
      
      const container = containerRef.current;
      const content = contentRef.current;

      content.style.transform = "none";
      content.style.width = "100%";

      const availableHeight = container.clientHeight;
      const contentHeight = content.scrollHeight;

      if (contentHeight > availableHeight && availableHeight > 0) {
        const newScale = Math.max(0.4, availableHeight / contentHeight);
        setScale(newScale);
        content.style.transform = `scale(${newScale})`;
        content.style.transformOrigin = isRTL ? "top right" : "top left";
        content.style.width = `${100 / newScale}%`;
      } else {
        setScale(1);
        content.style.transform = "none";
        content.style.width = "100%";
      }
    };

    const timer = setTimeout(handleScale, 150);
    window.addEventListener("resize", handleScale);
    
    const mediaQueryList = window.matchMedia('print');
    const handlePrintChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setScale(1);
        if (contentRef.current) {
          contentRef.current.style.transform = "none";
          contentRef.current.style.width = "100%";
        }
      } else {
        handleScale();
      }
    };
    
    mediaQueryList.addEventListener('change', handlePrintChange);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleScale);
      mediaQueryList.removeEventListener('change', handlePrintChange);
    };
  }, [children, orientation, doubleMode, isRTL]);

  return (
    <div 
      className={cn(
        "bg-white relative flex flex-col mx-auto",
        !disablePageBreak && "page-break-always",
        "print:shadow-none print:border-none print:m-0",
        "overflow-hidden box-border break-inside-avoid shadow-xl"
      )}
      style={{
        width: currentDim.w,
        height: currentDim.h,
        maxHeight: currentDim.h,
        padding: doubleMode ? "4mm 8mm" : "8mm 8mm",
        fontFamily: finalFontFamily
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
            style={{ fontSize: `${finalHeaderSize + 2}px` }}
          >
            {institution.name}
          </h2>
          <h3 
            className="font-black text-black underline underline-offset-4 decoration-2"
            style={{ fontSize: `${finalTitleSize + 2}px` }}
          >
            {title}
          </h3>
          {subtitle && (
            <div 
              className="text-black font-bold mt-1"
              style={{ fontSize: `${finalHeaderSize}px` }}
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
        <div className="border-y-2 border-black py-1 mb-4 flex justify-between items-center font-black text-black shrink-0 px-2" style={{ fontSize: `${finalHeaderSize}px` }}>
          {metadata}
        </div>
      )}

      <div 
        ref={containerRef}
        className={cn(
          "w-full flex-1 bg-white mb-2 overflow-hidden px-1 relative",
          "print:h-auto print:overflow-visible"
        )}
      >
        <div 
          ref={contentRef} 
          className={cn(
            "w-full transition-transform duration-200",
            "print:transform-none print:scale-100"
          )}
        >
          {children}
        </div>
      </div>

      {showSignatures && (
        <div className="grid grid-cols-2 gap-12 pt-2 border-t-2 border-black shrink-0 px-4 mt-auto mb-2">
          <div className="text-center">
            <p className="font-black text-black mb-1" style={{ fontSize: `${finalFooterSize + 1}px` }}>{finalRightTitle}</p>
            <div className="h-16 border border-dashed border-black/20 rounded-lg bg-slate-50/5"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black mb-1" style={{ fontSize: `${finalFooterSize + 1}px` }}>{finalLeftTitle}</p>
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