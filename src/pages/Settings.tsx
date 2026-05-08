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
  FileCode
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

const PERIODS = ["Morning", "Afternoon"];

const Settings = () => {
  const { 
    t, 
    departments, setDepartments, 
    rooms, setRooms,
    classes, setClasses,
    subjects, setSubjects,
    periodConfigs, setPeriodConfigs,
    importAllData,
    isRTL 
  } = useApp();
  
  const [newDept, setNewDept] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newSubject, setNewSubject] = useState("");
  
  const xmlInputRef = useRef<HTMLInputElement>(null);

  const handleImportXml = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        
        // محاولة القراءة بترميز UTF-8 أولاً
        let decoder = new TextDecoder("utf-8");
        let xmlText = decoder.decode(buffer);
        
        // إذا وجدنا إشارة لترميز windows-1256 في رأس الملف، نعيد القراءة بالترميز الصحيح
        if (xmlText.toLowerCase().includes("windows-1256") || xmlText.toLowerCase().includes("iso-8859-6")) {
          decoder = new TextDecoder("windows-1256");
          xmlText = decoder.decode(buffer);
        }

        const data = parseXml(xmlText);
        importAllData(data);
        showSuccess(isRTL ? "تم استيراد البيانات بنجاح" : "Data imported successfully");
        
        // إعادة ضبط المدخل للسماح برفع نفس الملف مرة أخرى
        if (xmlInputRef.current) xmlInputRef.current.value = "";
      } catch (err) {
        showError(isRTL ? "فشل استيراد الملف، تأكد من التنسيق" : "Failed to import file, check format");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const addItem = (val: string, setVal: any, list: any[], setList: any[], msg: string) => {
    if (val && !list.find(i => (typeof i === 'string' ? i === val : i.name === val))) {
      const newItem = typeof list[0] === 'object' ? { id: Math.random().toString(36).substr(2, 9), name: val } : val;
      setList([...list, newItem]);
      setVal("");
      showSuccess(msg);
    }
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
    showSuccess(isRTL ? "تم مسح كافة البيانات بنجاح" : "All data cleared successfully");
    window.location.reload();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-emerald-950">{t.settings}</h2>
          <p className="text-emerald-600/70 mt-1">{isRTL ? "تخصيص النظام والبيانات الأساسية" : "System customization and core data"}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input 
            type="file" 
            ref={xmlInputRef} 
            onChange={handleImportXml} 
            accept=".xml" 
            className="hidden" 
          />
          <Button variant="outline" className="border-emerald-200 text-emerald-700 rounded-xl bg-white" onClick={() => xmlInputRef.current?.click()}>
            <FileCode size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "استيراد MyTable.xml" : "Import MyTable.xml"}
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-100">
            <Download size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "تصدير البيانات" : "Export Data"}
          </Button>
        </div>
      </div>

      {/* Schedule Config */}
      <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Clock size={20} className="text-emerald-600" />
            {isRTL ? "إعدادات الجدول" : "Schedule Config"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DAYS.map(day => (
              <div key={day.id} className="p-3 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                <p className="font-bold text-emerald-900 text-sm mb-2">{isRTL ? day.name : day.en}</p>
                <div className="flex gap-4">
                  {PERIODS.map(p => (
                    <div key={p} className="flex items-center gap-2">
                      <Switch 
                        checked={isPeriodActive(day.id, p)} 
                        onCheckedChange={() => togglePeriod(day.id, p)}
                      />
                      <span className="text-[10px] font-bold text-emerald-700">{p === "Morning" ? (isRTL ? "ص" : "M") : (isRTL ? "م" : "A")}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Classes */}
        <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users2 className="text-emerald-600" size={20} />
            <CardTitle className="text-sm font-bold">{isRTL ? "الفروع" : "Branches"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="..." className="h-9 text-xs rounded-xl" />
              <Button size="sm" className="rounded-xl bg-emerald-600" onClick={() => addItem(newClass, setNewClass, classes, setClasses, "Branch added")}><Plus size={16} /></Button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {classes.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 bg-emerald-50/50 rounded-xl text-xs group">
                  <span className="font-medium text-emerald-900">{c.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setClasses(classes.filter(i => i.id !== c.id))}><Trash2 size={14} /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <BookOpen className="text-emerald-600" size={20} />
            <CardTitle className="text-sm font-bold">{isRTL ? "المواد الدراسية" : "Subjects"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="..." className="h-9 text-xs rounded-xl" />
              <Button size="sm" className="rounded-xl bg-emerald-600" onClick={() => addItem(newSubject, setNewSubject, subjects, setSubjects, "Subject added")}><Plus size={16} /></Button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {subjects.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 bg-emerald-50/50 rounded-xl text-xs group">
                  <span className="font-medium text-emerald-900">{s.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setSubjects(subjects.filter(i => i.id !== s.id))}><Trash2 size={14} /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rooms */}
        <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <MapPin className="text-emerald-600" size={20} />
            <CardTitle className="text-sm font-bold">{isRTL ? "القاعات" : "Rooms"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="..." className="h-9 text-xs rounded-xl" />
              <Button size="sm" className="rounded-xl bg-emerald-600" onClick={() => addItem(newRoom, setNewRoom, rooms, setRooms, "Room added")}><Plus size={16} /></Button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {rooms.map(r => (
                <div key={r} className="flex items-center justify-between p-2 bg-emerald-50/50 rounded-xl text-xs group">
                  <span className="font-medium text-emerald-900">{r}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setRooms(rooms.filter(i => i !== r))}><Trash2 size={14} /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Departments */}
        <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Database className="text-emerald-600" size={20} />
            <CardTitle className="text-sm font-bold">{t.stats.departments}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newDept} onChange={(e) => setNewDept(e.target.value)} placeholder="..." className="h-9 text-xs rounded-xl" />
              <Button size="sm" className="rounded-xl bg-emerald-600" onClick={() => addItem(newDept, setNewDept, departments, setDepartments, "Dept added")}><Plus size={16} /></Button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {departments.map(d => (
                <div key={d} className="flex items-center justify-between p-2 bg-emerald-50/50 rounded-xl text-xs group">
                  <span className="font-medium text-emerald-900">{d}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDepartments(departments.filter(i => i !== d))}><Trash2 size={14} /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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