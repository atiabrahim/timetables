"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, Save, Mail, Phone, MapPin, Info } from "lucide-react";
import { showSuccess } from "../utils/toast";
import { cn } from "@/lib/utils";

const Institution = () => {
  const { institution, setInstitution, isRTL, t } = useApp();

  const handleSave = () => {
    showSuccess(isRTL ? "تم حفظ بيانات المؤسسة بنجاح" : "Institution details saved successfully");
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">{t.institution_page.title}</h2>
          <p className="text-gray-500 font-bold mt-1">{t.institution_page.subtitle}</p>
        </div>
        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2 font-bold px-8 h-12 shadow-lg shadow-emerald-100">
          <Save size={20} />
          {t.save}
        </Button>
      </div>

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
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
                  {t.institution_page.name}
                </label>
                <div className="relative">
                  <Building2 className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
                  <Input 
                    value={institution.name}
                    onChange={(e) => setInstitution({...institution, name: e.target.value})}
                    className={cn("h-14 rounded-2xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all text-lg font-bold", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
                  {t.institution_page.subName}
                </label>
                <div className="relative">
                  <Info className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
                  <Input 
                    value={institution.subName}
                    onChange={(e) => setInstitution({...institution, subName: e.target.value})}
                    className={cn("h-14 rounded-2xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all text-lg font-bold", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
                  />
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

              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
                  {t.institution_page.address}
                </label>
                <div className="relative">
                  <MapPin className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
                  <Input 
                    value={institution.address}
                    onChange={(e) => setInstitution({...institution, address: e.target.value})}
                    className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
                  />
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
                <div className="pt-4 border-t border-gray-100 mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {isRTL ? "ستظهر هذه البيانات في أعلى كل جدول مطبوع" : "This data will appear at the top of every printed schedule"}
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