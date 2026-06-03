"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, Save, Mail, Phone, MapPin, Info, Calendar, FileCode, PenTool } from "lucide-react";
import { showSuccess } from "../utils/toast";
import { cn } from "@/lib/utils";
import { exportToXml } from "../lib/export-utils";
import PageHeader from "../components/shared/PageHeader";

const Institution = () => {
  const { 
    institution, setInstitution, 
    employees, assignments, rooms, classes, subjects,
    isRTL, t 
  } = useApp();

  const handleSave = () => {
    showSuccess(isRTL ? "تم حفظ بيانات المؤسسة بنجاح" : "Institution details saved successfully");
  };

  const handleExportXml = () => {
    const dataToExport = {
      institution,
      employees,
      assignments,
      rooms,
      classes,
      subjects
    };
    exportToXml(dataToExport, `EduSchedule_Export_${new Date().toISOString().split('T')[0]}`);
    showSuccess(isRTL ? "تم تصدير ملف XML المحدث" : "Updated XML file exported");
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t.institution_page.title}
        subtitle={t.institution_page.subtitle}
        icon={Building2}
        isRTL={isRTL}
      >
        <Button 
          variant="outline" 
          onClick={handleExportXml} 
          className="rounded-xl border-emerald-200 text-emerald-700 gap-2 font-bold px-6 h-11 bg-white"
        >
          <FileCode size={18} />
          {isRTL ? "تصدير XML المحدث" : "Export Updated XML"}
        </Button>
        <Button 
          onClick={handleSave} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold px-8 h-11 shadow-lg shadow-emerald-100"
        >
          <Save size={18} />
          {t.save}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-[#f9f9f1] border-b border-gray-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Building2 size={20} className="text-[#064e3b]" />
                {isRTL ? "المعلومات الأساسية" : "Basic Information"}
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
                    {isRTL ? "السنة الدراسية" : "Academic Year"}
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
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-[#f9f9f1] border-b border-gray-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Info size={20} className="text-[#064e3b]" />
                {isRTL ? "معاينة الترويسة" : "Header Preview"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center space-y-2">
                <h3 className="text-lg font-black text-emerald-900">{institution.name || "---"}</h3>
                <p className="text-sm font-bold text-emerald-700">{institution.subName || "---"}</p>
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-100 text-[10px] font-black uppercase text-gray-400">
                  <span>{institution.pedagogicalManagerTitle}</span>
                  <span>{institution.generalManagerTitle}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Institution;