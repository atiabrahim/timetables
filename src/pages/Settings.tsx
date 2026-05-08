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
  Calendar as CalendarIcon,
  FileJson,
  FileCode,
  UserCog,
  Shield,
  User,
  Mail,
  Info,
  Power,
  PowerOff
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
    employees, assignments,
    periodConfigs, setPeriodConfigs,
    systemUsers, setSystemUsers,
    user: currentUser,
    importAllData,
    isRTL 
  } = useApp();
  
  const [newDept, setNewDept] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newSubject, setNewSubject] = useState("");
  
  // User Management State
  const [newUser, setNewUser] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "Teacher" as "Admin" | "Teacher" | "Student",
    observation: ""
  });

  const xmlInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleAddUser = () => {
    if (!newUser.username.trim() || !newUser.fullName.trim()) {
      showError(isRTL ? "يرجى ملء الحقول الأساسية" : "Please fill required fields");
      return;
    }
    if (systemUsers.find(u => u.username === newUser.username)) {
      showError(isRTL ? "اسم المستخدم موجود مسبقاً" : "Username already exists");
      return;
    }

    const userToAdd = {
      id: Math.random().toString(36).substr(2, 9),
      ...newUser,
      isActive: true
    };

    setSystemUsers([...systemUsers, userToAdd]);
    setNewUser({ username: "", fullName: "", email: "", role: "Teacher", observation: "" });
    showSuccess(isRTL ? "تم إضافة المستخدم بنجاح" : "User added successfully");
  };

  const toggleUserStatus = (id: string) => {
    setSystemUsers(systemUsers.map(u => 
      u.id === id ? { ...u, isActive: !u.isActive } : u
    ));
    showSuccess(isRTL ? "تم تحديث حالة الحساب" : "Account status updated");
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      showError(isRTL ? "لا يمكنك حذف حسابك الحالي" : "You cannot delete your own account");
      return;
    }
    setSystemUsers(systemUsers.filter(u => u.id !== id));
    showSuccess(isRTL ? "تم حذف المستخدم" : "User deleted");
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
          <input type="file" ref={xmlInputRef} onChange={(e) => {/* Import logic */}} accept=".xml" className="hidden" />
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

      {/* Users Management */}
      <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <UserCog size={20} />
            </div>
            <CardTitle className="text-lg font-bold text-emerald-900">{isRTL ? "إدارة مستخدمي النظام" : "System Users Management"}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Add User Form */}
            <div className="space-y-4 bg-emerald-50/30 p-6 rounded-3xl border border-emerald-50">
              <h4 className="font-bold text-emerald-900 flex items-center gap-2">
                <Plus size={18} />
                {isRTL ? "إضافة مستخدم جديد" : "Add New User"}
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "اسم المستخدم" : "Username"}</label>
                    <Input 
                      value={newUser.username} 
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      className="rounded-xl border-emerald-100 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "الصلاحية" : "Role"}</label>
                    <Select value={newUser.role} onValueChange={(v: any) => setNewUser({...newUser, role: v})}>
                      <SelectTrigger className="rounded-xl border-emerald-100 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">{isRTL ? "مدير" : "Admin"}</SelectItem>
                        <SelectItem value="Teacher">{isRTL ? "أستاذ" : "Teacher"}</SelectItem>
                        <SelectItem value="Student">{isRTL ? "طالب" : "Student"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "الاسم الكامل" : "Full Name"}</label>
                  <Input 
                    value={newUser.fullName} 
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    className="rounded-xl border-emerald-100 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "البريد الإلكتروني" : "Email"}</label>
                  <Input 
                    type="email"
                    value={newUser.email} 
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="rounded-xl border-emerald-100 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "ملاحظة" : "Observation"}</label>
                  <Input 
                    value={newUser.observation} 
                    onChange={(e) => setNewUser({...newUser, observation: e.target.value})}
                    className="rounded-xl border-emerald-100 h-10"
                  />
                </div>
                <Button onClick={handleAddUser} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl mt-4 h-11">
                  {isRTL ? "تأكيد الإضافة" : "Confirm Add"}
                </Button>
              </div>
            </div>

            {/* Users List */}
            <div className="xl:col-span-2 space-y-4">
              <h4 className="font-bold text-emerald-900 flex items-center gap-2">
                <Users2 className="text-emerald-500" size={18} />
                {isRTL ? "قائمة المستخدمين النشطين" : "Active Users List"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemUsers.map(u => (
                  <div key={u.id} className={cn(
                    "p-4 border rounded-3xl transition-all group relative",
                    u.isActive ? "bg-white border-emerald-100 shadow-sm" : "bg-gray-50 border-gray-200 opacity-70"
                  )}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                          u.role === "Admin" ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-600"
                        )}>
                          {u.role === "Admin" ? <Shield size={24} /> : <User size={24} />}
                        </div>
                        <div>
                          <p className="font-bold text-emerald-950">{u.fullName}</p>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">@{u.username} • {u.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn("h-8 w-8 rounded-lg", u.isActive ? "text-emerald-500" : "text-amber-500")}
                          onClick={() => toggleUserStatus(u.id)}
                          title={u.isActive ? (isRTL ? "توقيف" : "Deactivate") : (isRTL ? "تنشيط" : "Activate")}
                        >
                          {u.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 border-t border-emerald-50 pt-3">
                      <div className="flex items-center gap-2 text-xs text-emerald-600/70">
                        <Mail size={12} />
                        <span className="truncate">{u.email || "---"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-emerald-600/70">
                        <Info size={12} />
                        <span className="truncate italic">{u.observation || "---"}</span>
                      </div>
                    </div>

                    {!u.isActive && (
                      <div className="absolute inset-0 bg-gray-100/20 backdrop-blur-[1px] rounded-3xl pointer-events-none flex items-center justify-center">
                        <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                          {isRTL ? "موقوف" : "Inactive"}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Other Settings (Schedule, Rooms, etc.) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Schedule Config */}
        <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock size={20} className="text-emerald-600" />
              {isRTL ? "إعدادات الجدول" : "Schedule Config"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    </div>
  );
};

export default Settings;