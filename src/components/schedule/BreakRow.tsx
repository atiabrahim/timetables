"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BreakRowProps {
  title: string;
  daysCount: number;
  isPrint: boolean;
  isRTL: boolean;
}

const BreakRow = ({ title, daysCount, isPrint, isRTL }: BreakRowProps) => {
  return (
    <tr className={cn(isPrint ? "h-1.5" : "h-2.5", "bg-emerald-50/30")}>
      <td className={cn("border border-emerald-950 text-center font-black", isPrint ? "text-[6px]" : "text-[8px]")}>---</td>
      <td colSpan={daysCount} className={cn("border border-emerald-950 text-center font-black uppercase tracking-wider", isPrint ? "text-[7px] p-0" : "text-[9px] text-emerald-800")}>
        {title}
      </td>
    </tr>
  );
};

export default BreakRow;