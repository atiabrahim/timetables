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
  Upload, 
  Database, 
  MapPin, 
  AlertTriangle, 
  Users2, 
  BookOpen,
  Clock,
  Calendar as CalendarIcon,
  FileJson,
  FileCode
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { exportToXml, exportToJson, parseXml } from "../lib/export-utils";
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
  { id: 5, name: "الجمعة", en: "Friday" },
  { id: 6, name: "السبت", en: "Saturday" },
];

const PERIODS = ["Morning", "Afternoon"];

const Settings = () => {
  const { 
    t, 
    departments, setDepartments, 
    rooms, setRooms,
    classes, setClasses,
    subjects, setSubjects,
    employees, assignments,
    periodConfigs, setPeriodConfigs,
    importAllData,
    isRTL 
  } = useApp();
  
  const [newDept, setNewDept] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const xmlInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = (type: 'xml' | 'json') => {
    const data = { employees, departments, rooms, classes, subjects, assignments, periodConfigs };
    const fileName = `scheduler_backup_${new Date().toISOString().split('T')[0]}`;
    
    if (type === 'xml') {
      exportToXml(data, fileName);
    } else {
      exportToJson(data, fileName);
    }
    showSuccess(isRTL ? "تم تصدير البيانات بنجاح" : "Data exported successfully");
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>, type: 'xml' | 'json') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        
        // محاولة فك التشفير كـ UTF-8 أولاً
        let decoder = new TextDecoder('utf-8');
        let text = decoder.decode(buffer);
        
        // إذا كان الملف XML، نتحقق من وجود ترميز محدد مثل windows-1256
        if (type === 'xml') {
          const encodingMatch = text.match(/encoding="([^"]+)"/i);
          if (encodingMatch && encodingMatch[1].toLowerCase() !== 'utf-8') {
            // إعادة فك التشفير بالترميز المذكور في الملف (مثل windows-1256)
            decoder = new TextDecoder(encodingMatch[1]);
            text = decoder.decode(buffer);
          } else if (text.includes('') || text.includes('Ø')) {
            // محاولة تلقائية لترميز العربية الشائع إذا ظهرت رموز غريبة
            decoder = new TextDecoder('windows-1256');
            text = decoder.decode(buffer);
          }
        }

        let data;
        if (type === 'xml') {
          data = parseXml(text);
        } else {
          data = JSON.parse(text);
        }
        
        if (data) {
          importAllData(data);
          showSuccess(isRTL ? "تم استيراد كافة المعلومات بنجاح" : "All information imported successfully");
          setTimeout(() => window.location.reload(), 800);
        }
      } catch (err) {
        console.error(err);
        showError(isRTL ? "فشل استيراد الملف. تأكد من الصيغة الصحيحة" : "Failed to import file. Check format");
      }
    };
    
    // قراءة كـ ArrayBuffer للتحكم في فك التشفير لاحقاً
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-emerald-950">{t.settings}</h2>
          <p className="text-emerald-600/70 mt-1">{isRTL ? "تخصيص النظام والبيانات الأساسية" : "System customization and core data"}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input type="file" ref={xmlInputRef} onChange={(e) => handleImportFile(e, 'xml')} accept=".xml" className="hidden" />
          <input type="file" ref={jsonInputRef} onChange={(e) => handleImportFile(e, 'json')} accept=".json" className="hidden" />
          
          <Button variant="outline" className="border-emerald-200 text-emerald-700 rounded-xl bg-white" onClick={() => xmlInputRef.current?.click()}>
            <FileCode size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "استيراد MyTable.xml" : "Import MyTable.xml"}
          </Button>

          <Button variant="outline" className="border-emerald-200 text-emerald-700 rounded-xl bg-white" onClick={() => jsonInputRef.current?.click()}>
            <FileJson size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "استيراد JSON" : "Import JSON"}
          </Button>
          
          <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-100" onClick={() => handleExport('json')}>
            <Download size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "تصدير JSON" : "Export JSON"}
          </Button>
        </div>
      </div>

      {/* Schedule Configuration */}
      <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Clock size={20} />
            </div>
            <CardTitle className="text-lg font-bold text-emerald-900">{isRTL ? "إعدادات الجدول الزمني" : "Schedule Configuration"}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DAYS.slice(0, 5).map(day => (
              <div key={day.id} className="space-y-4 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">{isRTL ? day.name : day.en}</span>
                  <CalendarIcon size={16} className="text-emerald-400" />
                </div>
                <div className="space-y-3">
                  {PERIODS.map(period => (
                    <div key={period} className="flex items-center justify-between text-sm">
                      <span className="text-emerald-700">{period === "Morning" ? (isRTL ? "صباحاً" : "Morning") : (isRTL ? "مساءً" : "Afternoon")}</span>
                      <Switch 
                        checked={isPeriodActive(day.id, period)} 
                        onCheckedChange={() => togglePeriod(day.id, period)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
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
            <CardTitle className="text-sm font-bold">{isRTL ? "الأفواج التربوية" : "Classes"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="..." className="h-9 text-xs rounded-xl" />
              <Button size="sm" className="rounded-xl bg-emerald-600" onClick={() => addItem(newClass, setNewClass, classes, setClasses, "Class added")}><Plus size={16} /></Button>
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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