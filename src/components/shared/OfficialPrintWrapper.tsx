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
        orientation === "portrait" ? "w-[210mm]" : "w-[297mm]",
        "print:p-8 p-10 print:shadow-none"
      )}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* 1. الترويسة العليا: الوزارة والمركز */}
      <div className="flex flex-col items-center text-center mb-4 space-y-1">
        <p className="font-black text-black text-lg tracking-tight uppercase leading-tight">{t.republic}</p>
        <p className="font-bold text-black text-sm">{t.centerName}</p>
        <p className="font-bold text-black text-sm">{institution.name || t.centerLocation}</p>
      </div>

      {/* 2. شريط المعلومات بين خطين عريضين */}
      <div className="w-full space-y-1 mb-8">
        <div className="h-0.5 bg-black w-full"></div>
        <div className="flex justify-between items-center py-1 px-2 text-sm font-black">
          <p className="text-black">
            {isRTL ? "المصلحة:" : "Department:"} <span className="ms-1">{departments[0] || (isRTL ? "مصلحة التكوين" : "Training Dept")}</span>
          </p>
          <p className="text-black">
            {isRTL ? "السنة الدراسية:" : "Academic Year:"} <span className="ms-1">{institution.academicYear || "2023/2024"}</span>
          </p>
        </div>
        <div className="h-0.5 bg-black w-full"></div>
      </div>

      {/* 3. العنوان الرئيسي والبطاقة (Pill) */}
      <div className="text-center mb-8">
        <h1 className="font-black text-black text-3xl mb-4">
          {title}
        </h1>
        {subtitle}
      </div>

      {/* 4. محتوى الجدول */}
      <div className="flex-1 w-full overflow-hidden mb-12">
        {children}
      </div>

      {/* 5. الخط الفاصل قبل التواقيع */}
      <div className="h-0.5 bg-black w-full mb-10"></div>

      {/* 6. التواقيع */}
      {showSignatures && (
        <div className="grid grid-cols-2 gap-20">
          <div className="text-center group">
            <p className="font-black text-black text-xl mb-1">{finalLeftTitle}</p>
            <div className="h-0.5 bg-black/20 w-48 mx-auto mb-20"></div>
          </div>
          <div className="text-center group">
            <p className="font-black text-black text-xl mb-1">{finalRightTitle}</p>
            <div className="h-0.5 bg-black/20 w-48 mx-auto mb-20"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialPrintWrapper;