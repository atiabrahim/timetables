"use client";

import React, { useRef } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  Clock,
  FileCode,
  Settings as SettingsIcon,
  CloudUpload,
  CloudDownload,
  Timer,
  Download,
  Upload
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { parseXml } from "../lib/export-utils";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
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
import { cn } from "@/lib/utils";

const Settings = () => {
  const { 
    t, 
    periodConfigs, setPeriodConfigs,
    importAllData, saveDataToCloud, loadDataFromCloud,
    isRTL,
    periodTimings, setPeriodTimings,
    systemUsers, institution, employees, assignments, 
    templateAssignments, dailyAssignments, departments, rooms, classes, subjects,
    teacherConstraints, classConstraints, roomConstraints
  } = useApp();
  
  const xmlInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    const data = {
      systemUsers, institution, employees, assignments, 
      templateAssignments, dailyAssignments, departments, rooms, classes, subjects,
      periodConfigs, teacherConstraints, classConstraints, roomConstraints, periodTimings,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `EduSchedule_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess(isRTL ? "تم تصدير نسخة احتياطية بنجاح" : "Backup exported successfully");
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importAllData(data);
        showSuccess(isRTL ? "تم استعادة النسخة الاحتياطية بنجاح" : "Backup restored successfully");
      } catch (err) {
        showError(isRTL ? "الملف غير صالح" : "Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

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
      } catch (err) { showError(isRTL ? "فشل استيراد الملف" : "Failed to import file"); }
    };
    reader.readAsArrayBuffer(file);
  };

  const togglePeriod = (day: number, period: string) => {
    const existing = periodConfigs.find(p => p.day === day && p.period === period);
    if (existing) {
      setPeriodConfigs(periodConfigs.map(p => (p.day === day && p.period === period) ? { ...p, isActive: !p.isActive } : p));
    } else { setPeriodConfigs([...periodConfigs, { day, period, isActive: false }]); }
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
      <PageHeader title={t.settings} subtitle={isRTL ? "تخصيص النظام والبيانات الأساسية" : "System customization"} icon={SettingsIcon} isRTL={isRTL}>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 bg-white h-11" onClick={saveDataToCloud}><CloudUpload size={18} /> {isRTL ? "حفظ سحابي" : "Cloud Save"}</Button>
          <Button variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 bg-white h-11" onClick={loadDataFromCloud}><CloudDownload size={18} /> {isRTL ? "استرداد" : "Load"}</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-[#f9f9f1] border-b border-gray-100"><CardTitle className="text-lg font-bold flex items-center gap-2"><Clock size={20} className="text-[#064e3b]" /> {isRTL ? "تفعيل الحصص الأسبوعية" : "Weekly Periods"}</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {DAYS.map(day => (
                  <div key={day.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="font-bold text-gray-900 text-xs mb-3 text-center">{isRTL ? day.name : day.en}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {PERIODS.map(p => (
                        <div key={p} className="flex flex-col items-center gap-1 p-1.5 bg-white rounded-lg border border-gray-100">
                          <span className="text-[9px] font-bold text-gray-500">{p}</span>
                          <Switch scale={0.7} checked={isPeriodActive(day.id, p)} onCheckedChange={() => togglePeriod(day.id, p)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100"><CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-900"><Download size={20} className="text-blue-600" /> {isRTL ? "النسخ الاحتياطي والأرشفة" : "Backup & Archive"}</CardTitle></CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-dashed border-blue-100 rounded-2xl space-y-4">
                <div className="space-y-1"><h4 className="font-bold text-blue-900 text-sm">{isRTL ? "تصدير النظام كاملاً" : "Export Full System"}</h4><p className="text-[10px] text-slate-500">{isRTL ? "تنزيل ملف JSON يحتوي على كافة المستخدمين والجداول والقيود والمواد." : "Download a JSON file containing all users, schedules, constraints, and data."}</p></div>
                <Button onClick={handleExportJson} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold"><Download size={16} /> {isRTL ? "تصدير نسخة احتياطية" : "Export Backup"}</Button>
              </div>
              <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl space-y-4">
                <div className="space-y-1"><h4 className="font-bold text-slate-900 text-sm">{isRTL ? "استعادة من ملف" : "Restore from File"}</h4><p className="text-[10px] text-slate-500">{isRTL ? "استبدال البيانات الحالية ببيانات ملف النسخة الاحتياطية." : "Replace current data with backup file content."}</p></div>
                <input type="file" ref={jsonInputRef} onChange={handleImportJson} accept=".json" className="hidden" />
                <Button variant="outline" onClick={() => jsonInputRef.current?.click()} className="w-full border-slate-200 rounded-xl gap-2 font-bold"><Upload size={16} /> {isRTL ? "استعادة نسخة JSON" : "Restore Backup"}</Button>
              </div>
              <div className="md:col-span-2 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div className="space-y-1"><h4 className="font-bold text-emerald-900 text-sm">{isRTL ? "استيراد من aSc Timetables" : "Import from aSc Timetables"}</h4><p className="text-[10px] text-emerald-700/60">{isRTL ? "استيراد المعلمين والمواد والجدول من ملف MyTable.xml" : "Import teachers, subjects, and schedules from XML."}</p></div>
                <input type="file" ref={xmlInputRef} onChange={handleImportXml} accept=".xml" className="hidden" />
                <Button onClick={() => xmlInputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold px-8"><FileCode size={16} /> {isRTL ? "اختر XML" : "Choose XML"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100"><CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-900"><Timer size={20} className="text-blue-600" /> {isRTL ? "توقيت الحصص" : "Period Timings"}</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {PERIODS.map(p => (
                  <div key={p} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100"><div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-black text-slate-500 text-xs shadow-sm">{p}</div><Input value={periodTimings[p] || ""} onChange={(e) => setPeriodTimings({...periodTimings, [p]: e.target.value})} placeholder="08:00 - 09:00" className="h-9 rounded-lg bg-white border-slate-200 font-bold text-xs" /></div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-100 bg-red-50/30 rounded-3xl overflow-hidden"><CardHeader><CardTitle className="text-red-800 flex items-center gap-2"><AlertTriangle size={20} /> {isRTL ? "منطقة الخطر" : "Danger Zone"}</CardTitle></CardHeader>
            <CardContent><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" className="w-full rounded-xl h-11 font-bold shadow-lg shadow-red-100">{isRTL ? "مسح كافة البيانات" : "Clear All Data"}</Button></AlertDialogTrigger><AlertDialogContent className="rounded-3xl"><AlertDialogHeader><AlertDialogTitle>{isRTL ? "تأكيد المسح؟" : "Confirm Clear?"}</AlertDialogTitle><AlertDialogDescription>{isRTL ? "سيتم حذف كافة البيانات بشكل نهائي." : "All data will be permanently deleted."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel><AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 rounded-xl text-white">{isRTL ? "نعم، امسح" : "Yes, Clear"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;