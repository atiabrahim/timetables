"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Calendar, PenTool, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Institution } from "../../types";

interface InstitutionInfoCardProps {
  institution: Institution;
  setInstitution: (inst: Institution) => void;
  isRTL: boolean;
  t: any;
}

const InstitutionInfoCard = ({ institution, setInstitution, isRTL, t }: InstitutionInfoCardProps) => {
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-[#f9f9f1] border-b border-gray-100">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Building2 size={20} className="text-[#064e3b]" />
          {isRTL ? "المعلومات الأساسية للمؤسسة" : "Basic Institution Information"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
              {t.institution_page.name}
            </label>
            <div className="relative">
              <Building2 className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
              <Input 
                value={institution.name}
                onChange={(e) => setInstitution({...institution, name: e.target.value})}
                className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all font-bold", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
              {isRTL ? "السنة التكوينية" : "Training Year"}
            </label>
            <div className="relative">
              <Calendar className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
              <Input 
                value={institution.academicYear || ""}
                onChange={(e) => setInstitution({...institution, academicYear: e.target.value})}
                placeholder="2023/2024"
                className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all font-bold", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
              {isRTL ? "مسمى المسؤول البيداغوجي" : "Pedagogical Manager Title"}
            </label>
            <div className="relative">
              <PenTool className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
              <Input 
                value={institution.pedagogicalManagerTitle || ""}
                onChange={(e) => setInstitution({...institution, pedagogicalManagerTitle: e.target.value})}
                className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
              {isRTL ? "مسمى المدير العام" : "General Manager Title"}
            </label>
            <div className="relative">
              <PenTool className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
              <Input 
                value={institution.generalManagerTitle || ""}
                onChange={(e) => setInstitution({...institution, generalManagerTitle: e.target.value})}
                className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
              {t.institution_page.phone}
            </label>
            <div className="relative">
              <Phone className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
              <Input 
                value={institution.phone}
                onChange={(e) => setInstitution({...institution, phone: e.target.value})}
                className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
              {t.institution_page.email}
            </label>
            <div className="relative">
              <Mail className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
              <Input 
                value={institution.email}
                onChange={(e) => setInstitution({...institution, email: e.target.value})}
                className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstitutionInfoCard;