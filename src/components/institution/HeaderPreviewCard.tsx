"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Institution } from "../../types";

interface HeaderPreviewCardProps {
  institution: Institution;
  isRTL: boolean;
}

const HeaderPreviewCard = ({ institution, isRTL }: HeaderPreviewCardProps) => {
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-[#f9f9f1] border-b border-gray-100">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Info size={20} className="text-[#064e3b]" />
          {isRTL ? "معاينة الترويسة" : "Header Preview"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center space-y-2">
          <div className="w-12 h-12 mx-auto mb-2 border border-black rounded-lg p-1 bg-white overflow-hidden flex items-center justify-center">
            {institution.logo ? (
              <img src={institution.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-[6px] font-black">LOGO</span>
            )}
          </div>
          <h3 className="text-lg font-black text-emerald-900">{institution.name || "---"}</h3>
          <p className="text-sm font-bold text-emerald-700">{institution.subName || "---"}</p>
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-100 text-[10px] font-black uppercase text-gray-400">
            <span>{institution.pedagogicalManagerTitle}</span>
            <span>{institution.generalManagerTitle}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderPreviewCard;