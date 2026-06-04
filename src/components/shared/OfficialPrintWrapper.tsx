"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useApp } from "../../context/AppContext";

interface OfficialPrintWrapperProps {
  title: string;
  subtitle?: React.ReactNode;
  orientation?: "portrait" | "landscape";
  children: React.ReactNode;
  showSignatures?: boolean;
  leftSignatureTitle?: string;
  rightSignatureTitle?: string;
}

const OfficialPrintWrapper = ({
  title,
  subtitle,
  orientation = "portrait",
  children,
  showSignatures = true,
  leftSignatureTitle,
  rightSignatureTitle
}: OfficialPrintWrapperProps) => {
  const { t, isRTL, institution, departments } = useApp();

  const finalLeftTitle = leftSignatureTitle || institution.pedagogicalManagerTitle || (isRTL ? "رئيس مصلحة التكوين" : "Head of Training");
  const finalRightTitle = rightSignatureTitle || institution.generalManagerTitle || (isRTL ? "ختم وتوقيع المدير" : "Director Signature");

  return (
    <div 
      className={cn(
        "bg-white mx-auto page-break-container",
        // العرض الثابت للمعاينة فقط، في الطباعة سيتم تجاوزه بواسطة CSS
        orientation === "portrait" ? "md:w-[210mm]" : "md:w-[297mm]",
        "print:w-full print:p-0"
      )}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* الترويسة الرسمية */}
      <div className="flex flex-col items-center text-center mb-8 space-y-1">
        <p className="font-black text-black text-sm tracking-widest uppercase leading-tight">{t.republic}</p>
        <div className="w-24 h-px bg-black/20 my-1"></div>
        <p className="font-bold text-black text-xs">{t.centerName}</p>
        <p className="font-bold text-black text-xs">{institution.name || t.centerLocation}</p>
      </div>

      {/* بيانات المصلحة والسنة الدراسية */}
      <div className="grid grid-cols-2 border-y-2 border-black py-2 mb-8 text-xs font-black">
        <div className="flex items-center gap-2">
          <span className="text-black/60">{isRTL ? "المصلحة:" : "Department:"}</span>
          <span className="text-black">{departments[0] || (isRTL ? "مديرية الدراسات والتربصات" : "Studies Directorate")}</span>
        </div>
        <div className={cn("flex items-center gap-2", isRTL ? "justify-end" : "justify-start")}>
          <span className="text-black/60">{isRTL ? "السنة الدراسية:" : "Academic Year:"}</span>
          <span className="text-black">{institution.academicYear || "2023/2024"}</span>
        </div>
      </div>

      {/* العنوان الرئيسي */}
      <div className="text-center mb-8">
        <h1 className="font-black text-black text-2xl mb-4 uppercase tracking-tight">
          {title}
        </h1>
        {subtitle}
      </div>

      {/* محتوى المستند */}
      <div className="flex-1 w-full overflow-hidden mb-12">
        {children}
      </div>

      {/* التواقيع الختامية */}
      {showSignatures && (
        <div className="mt-10 grid grid-cols-2 gap-20 pt-8 border-t border-black/10">
          <div className="text-center">
            <p className="font-black text-black text-sm uppercase tracking-wider mb-2">{finalLeftTitle}</p>
            <div className="h-28 border border-dashed border-black/5 mt-2 rounded-2xl print:border-none"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-black text-sm uppercase tracking-wider mb-2">{finalRightTitle}</p>
            <div className="h-28 border border-dashed border-black/5 mt-2 rounded-2xl print:border-none"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialPrintWrapper;