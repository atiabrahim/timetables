"use client";

import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Trash2, 
  Download, 
  Database, 
  MapPin, 
  AlertTriangle, 
  Users2, 
  BookOpen,
  Clock,
  FileCode,
  Sparkles,
  School,
  ArrowUpDown,
  Edit2
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { parseXml } from "../lib/export-utils";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DAYS = [
  { id: 0, name: "الأحد", en: "Sunday" },
  { id: 1, name: "الاثنين", en: "Monday" },
  { id: 2, name: "الثلاثاء", en: "Tuesday" },
  { id: 3, name: "الأربعاء", en: "Wednesday" },
  { id: 4, name: "الخميس", en: "Thursday" },
];

const PERIODS = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

const Settings = () => {
  const { 
    t, 
    periodConfigs, setPeriodConfigs,
    importAllData,
    isRTL 
  } = useApp();
  
  const xmlInputRef = useRef<HTMLInputElement>(null);

  const handleImportXml = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        let decoder = new TextDecoder("utf-8");
        let xmlText = decoder.decode(buffer);
        
        if (xmlText.toLowerCase().includes("windows-1256") || xmlText.toLowerCase().includes("iso-8859-6")) {
          decoder = new TextDecoder("windows-1256");
          xmlText = decoder.decode(buffer);
        }

        const data = parseXml(xmlText);
        importAllData(data);
        showSuccess(isRTL ? "تم استيراد البيانات بنجاح" : "Data imported successfully");
        if (xmlInputRef.current) xmlInputRef.current.value = "";
      } catch (err) {
        showError(isRTL ? "فشل استيراد الملف" : "Failed to import file");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const togglePeriod = (day: number, period: string) => {
    const existing = periodConfigs.find(p => p.day === day && p.period === period);
    if (existing) {
      setPeriodConfigs(periodConfigs.map(p => 
        (p.day === day && p.period === period) ? { ...p, isActive: !p.isActive } : p
      ));
    } else {
      setPeriodConfigs([...periodConfigs, { day, period, isActive: false }]);
    }
  };

  const isPeriodActive = (day: number, period: string) => {
    const config = periodConfigs.find(p => p.day === day && p.period === period);
    return config ? config.isActive : true;
  };

  const handleClearAll = () => {
    localStorage.removeItem("academic_scheduler_v2_data");
    showSuccess(isRTL ? "تم مسح كافة البيانات" : "All data cleared");
    window.location.reload();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">{t.settings}</h2>
          <p className="text-gray-500 font-bold mt-1">{isRTL ? "تخصيص النظام والبيانات الأساسية" : "System customization and core data"}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input type="file" ref={xmlInputRef} onChange={handleImportXml} accept=".xml" className="hidden" />
          <Button variant="outline" className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700" onClick={() => xmlInputRef.current?.click()}>
            <FileCode size={18} />
            {isRTL ? "استيراد XML" : "Import XML"}
          </Button>
        </div>
      </div>

      {/* Schedule Config */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-[#f9f9f1] border-b border-gray-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Clock size={20} className="text-[#064e3b]" />
            {isRTL ? "تفعيل الحصص الأسبوعية" : "Weekly Periods Config"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {DAYS.map(day => (
              <div key={day.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="font-bold text-gray-900 text-xs mb-3 text-center">{isRTL ? day.name : day.en}</p>
                <div className="grid grid-cols-2 gap-2">
                  {PERIODS.map(p => (
                    <div key={p} className="flex flex-col items-center gap-1 p-1.5 bg-white rounded-lg border border-gray-100">
                      <span className="text-[9px] font-bold text-gray-500">{p}</span>
                      <Switch 
                        scale={0.7}
                        checked={isPeriodActive(day.id, p)} 
                        onCheckedChange={() => togglePeriod(day.id, p)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-100 bg-red-50/30 rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle size={20} />
            {isRTL ? "منطقة الخطر" : "Danger Zone"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-red-600">
              {isRTL ? "سيؤدي هذا الإجراء إلى حذف كافة المعلومات بشكل نهائي." : "This action will permanently delete all information."}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-xl px-8">
                  {isRTL ? "مسح كافة البيانات" : "Clear All Data"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-red-100 rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>{isRTL ? "هل أنت متأكد تماماً؟" : "Are you absolutely sure?"}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRTL ? "لا يمكن التراجع عن هذا الإجراء. سيتم حذف كل شيء." : "This action cannot be undone. Everything will be deleted."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 rounded-xl">
                    {isRTL ? "نعم، امسح الكل" : "Yes, Clear All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;