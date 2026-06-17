"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SummaryTableProps {
  summaryData: any[];
  totalHours: number;
  isPrint: boolean;
  isRTL: boolean;
}

const SummaryTable = ({ summaryData, totalHours, isPrint, isRTL }: SummaryTableProps) => {
  return (
    <div className={cn("shrink-0", isPrint ? "w-[110px]" : "w-auto min-w-[180px] h-fit")}>
      <div className={cn("bg-white border", isPrint ? "border-emerald-950" : "rounded-xl border-slate-200 shadow-sm")}>
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className={cn(isPrint ? "bg-emerald-50 border-b" : "bg-emerald-950 text-white")}>
              <th className={cn("py-0.5 px-2 font-black uppercase border-b w-[70%] whitespace-nowrap", isPrint ? "text-[7px] text-emerald-950 border-emerald-950" : "text-[10px] border-emerald-900", isRTL ? "text-right" : "text-left")}>
                {isRTL ? "المادة" : "Subject"}
              </th>
              <th className={cn("py-0.5 px-2 font-black uppercase text-center border-s border-b w-[30%] whitespace-nowrap", isPrint ? "text-[7px] text-emerald-950 border-emerald-950" : "text-[10px] border-emerald-900")}>
                Total
              </th>
            </tr>
          </thead>
          <tbody className={cn(isPrint ? "divide-y divide-emerald-950" : "divide-y divide-slate-100")}>
            {summaryData.map((item, idx) => (
              <tr key={idx}>
                <td className={cn("py-0.5 px-2 leading-none", isRTL ? "text-right" : "text-left")}>
                  <span className={cn("font-bold block whitespace-nowrap", isPrint ? "text-[7px] text-black" : "text-[10px] text-slate-800")}>
                    {item.subject}
                  </span>
                </td>
                <td className="py-0.5 px-2 text-center border-s border-emerald-900/10">
                  <span className={cn("font-black", isPrint ? "text-[7.5px] text-black" : "text-[11px] text-emerald-700")}>
                    {item.count}
                  </span>
                </td>
              </tr>
            ))}
            <tr className={cn("font-black", isPrint ? "bg-emerald-50 border-t" : "bg-emerald-50/50")}>
              <td className={cn("py-0.5 px-2", isPrint ? "text-[7.5px] text-emerald-950" : "text-[10px] text-emerald-900", isRTL ? "text-right" : "text-left")}>
                {isRTL ? "الحجم الساعي" : "Weekly Total"}
              </td>
              <td className="py-0.5 px-2 text-center border-s border-emerald-950">
                <span className={cn("font-black", isPrint ? "text-[8px]" : "text-[12px]")}>
                  {totalHours}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryTable;