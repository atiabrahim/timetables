"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  children?: React.ReactNode;
  isRTL: boolean;
}

const PageHeader = ({ title, subtitle, icon: Icon, children, isRTL }: PageHeaderProps) => {
  return (
    <div className={cn(
      "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print:hidden",
      isRTL ? "text-right" : "text-left"
    )}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
            <Icon size={24} />
          </div>
        )}
        <div>
          <h2 className="text-3xl font-black text-slate-950 tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-slate-500 font-bold mt-1 text-sm">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;