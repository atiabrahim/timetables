"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Plus, Edit2, ArrowUpDown, Trash2, 
  ChevronUp, ChevronDown, Mail, Phone, Briefcase, Printer, Info,
  Users, UserCheck, Clock, Award
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type SortConfig = {
  key: "firstName" | "lastName" | "email" | "phone" | "category" | null;
  direction: "asc" | "desc";
};

const Employees = () => {
  const { employees, setEmployees, assignments, isRTL, user, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  
  const [newEmployee, setNewEmployee] = useState({ 
    firstName: "", lastName: "", category: "Full-time", email: "", phone: "", observation: "" 
  });
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isAdmin = user?.role === "Admin";

  // حساب الإحصائيات البيداغوجية للأساتذة
  const employeeStats = useMemo(() => {
    const total = employees.length;
    const fullTime = employees.filter(e => e.category === "Full-time").length;
    const partTime = employees.filter(e => e.category === "Part-time").length;
    const active = employees.filter(e => assignments.some(a => a.employeeId === e.id)).length;

    return { total, fullTime, partTime, active };
  }, [employees, assignments]);

  const handleSort = (key: SortConfig["key"]) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredEmployees = useMemo(() => {
    let items = [...employees].filter(emp => 
      `${emp.firstName} ${emp.lastName} ${emp.email || ""} ${emp.phone || ""} ${emp.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        const aValue = (a[sortConfig.key!] || "").toString().toLowerCase();
        const bValue = (b[sortConfig.key!] || "").toString().toLowerCase();
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [employees, searchTerm, sortConfig]);

  const SortIcon = ({ column }: { column: SortConfig["key"] }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} className="text-emerald-600" /> : <ChevronDown size={14} className="text-emerald-600" />;
  };

  const handleAddEmployee = () => {
    if (!newEmployee.firstName.trim() || !newEmployee.lastName.trim()) {
      showError(isRTL ? "يرجى إدخال الاسم واللقب" : "Name is required");
      return;
    }
    const id = Math.random().toString(36).substr(2, 9);
    setEmployees([...employees, { id, ...newEmployee }]);
    setNewEmployee({ firstName: "", lastName: "", category: "Full-time", email: "", phone: "", observation: "" });
    showSuccess(isRTL ? "تمت الإضافة بنجاح" : "Added successfully");
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    showSuccess(isRTL ? "تم الحذف" : "Deleted");
  };

  const handleEditClick = (emp: any) => {
    setEditingEmployee({
      ...emp,
      email: emp.email || "",
      phone: emp.phone || "",
      observation: emp.observation || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = () => {
    if (!editingEmployee.firstName.trim() || !editingEmployee.lastName.trim()) {
      showError(isRTL ? "يرجى إدخال الاسم واللقب" : "Name is required");
      return;
    }
    setEmployees(employees.map(e => e.id === editingEmployee.id ? editingEmployee : e));
    setIsEditDialogOpen(false);
    showSuccess(isRTL ? "تم تحديث البيانات بنجاح" : "Updated successfully");
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={isRTL ? "المعلمون" : "Teachers"} 
        subtitle={isRTL ? "إدارة بيانات الأساتذة والمعلمين" : "Manage teacher and instructor data"}
        icon={Briefcase}
        isRTL={isRTL}
      >
        <Button onClick={() => window.print()} variant="outline" className="rounded-xl border-slate-200 gap-2 font-bold text-slate-700 bg-white">
          <Printer size={18} />
          {isRTL ? "طباعة" : "Print"}
        </Button>
        <div className="relative w-full md:w-64">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-3" : "left-3")} size={16} />
          <Input 
            placeholder={isRTL ? "بحث..." : "Search..."} 
            className={cn("rounded-xl border-slate-200 bg-white h-10", isRTL ? "pr-10" : "pl-10")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PageHeader>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{employeeStats.total}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isRTL ? "إجمالي الأساتذة" : "Total Teachers"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{employeeStats.active}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isRTL ? "الأساتذة النشطون" : "Active Teachers"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{employeeStats.fullTime}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isRTL ? "دوام كامل" : "Full-time"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{employeeStats.partTime}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isRTL ? "دوام جزئي" : "Part-time"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-50 items-end print:hidden">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "الاسم" : "First Name"}</label>
            <Input value={newEmployee.firstName} onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})} className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "اللقب" : "Last Name"}</label>
            <Input value={newEmployee.lastName} onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})} className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "الفئة" : "Category"}</label>
            <Select value={newEmployee.category} onValueChange={v => setNewEmployee({...newEmployee, category: v})}>
              <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">{isRTL ? "دوام كامل" : "Full-time"}</SelectItem>
                <SelectItem value="Part-time">{isRTL ? "دوام جزئي" : "Part-time"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddEmployee} className="w-full bg-emerald-950 hover:bg-black text-white rounded-xl h-12 font-black shadow-lg shadow-emerald-100">
            <Plus size={18} className="me-2" /> {isRTL ? "إضافة" : "Add"}
          </Button>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
          <thead className="bg-slate-50/50">
            <tr>
              <th className="p-5 text-slate-900 font-black text-xs uppercase tracking-widest border-b border-slate-100 cursor-pointer" onClick={() => handleSort("lastName")}>
                <div className="flex items-center gap-2">{isRTL ? "المعلم" : "Teacher"} <SortIcon column="lastName" /></div>
              </th>
              <th className="p-5 text-slate-900 font-black text-xs uppercase tracking-widest border-b border-slate-100 cursor-pointer" onClick={() => handleSort("category")}>
                <div className="flex items-center gap-2">{isRTL ? "الفئة" : "Category"} <SortIcon column="category" /></div>
              </th>
              <th className="p-5 text-slate-900 font-black text-xs uppercase tracking-widest border-b border-slate-100">{isRTL ? "التواصل" : "Contact"}</th>
              <th className="p-5 text-slate-900 font-black text-xs uppercase tracking-widest border-b border-slate-100 text-center print:hidden">{isRTL ? "إجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedAndFilteredEmployees.map((emp) => (
              <tr key={emp.id} className="group hover:bg-emerald-50/30 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                      {emp.lastName[0]}{emp.firstName[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{emp.lastName} {emp.firstName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {emp.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                    emp.category === "Full-time" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                  )}>{emp.category}</span>
                </td>
                <td className="p-5">
                  <div className="space-y-1">
                    {emp.email && <div className="flex items-center gap-2 text-xs text-slate-500"><Mail size={12} /> {emp.email}</div>}
                    {emp.phone && <div className="flex items-center gap-2 text-xs text-slate-500"><Phone size={12} /> {emp.phone}</div>}
                  </div>
                </td>
                <td className="p-5 text-center print:hidden">
                  <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(emp)} className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit2 size={14} /></Button>
                    {isAdmin && <Button variant="ghost" size="icon" onClick={() => deleteEmployee(emp.id)} className="h-8 w-8 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950 flex items-center gap-2">
              <Edit2 size={20} className="text-emerald-600" />
              {isRTL ? "تعديل بيانات المعلم" : "Edit Teacher Details"}
            </DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-800">{isRTL ? "الاسم" : "First Name"}</label>
                  <Input 
                    value={editingEmployee.firstName} 
                    onChange={e => setEditingEmployee({...editingEmployee, firstName: e.target.value})} 
                    className="rounded-xl" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-800">{isRTL ? "اللقب" : "Last Name"}</label>
                  <Input 
                    value={editingEmployee.lastName} 
                    onChange={e => setEditingEmployee({...editingEmployee, lastName: e.target.value})} 
                    className="rounded-xl" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-800">{isRTL ? "الفئة" : "Category"}</label>
                  <Select 
                    value={editingEmployee.category} 
                    onValueChange={v => setEditingEmployee({...editingEmployee, category: v})}
                  >
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">{isRTL ? "دوام كامل" : "Full-time"}</SelectItem>
                      <SelectItem value="Part-time">{isRTL ? "دوام جزئي" : "Part-time"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-800">{isRTL ? "رقم الهاتف" : "Phone Number"}</label>
                  <Input 
                    value={editingEmployee.phone} 
                    onChange={e => setEditingEmployee({...editingEmployee, phone: e.target.value})} 
                    className="rounded-xl" 
                    placeholder="0555xxxxxx"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-800">{isRTL ? "البريد الإلكتروني" : "Email"}</label>
                <Input 
                  type="email"
                  value={editingEmployee.email} 
                  onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})} 
                  className="rounded-xl" 
                  placeholder="teacher@edu.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-800">{isRTL ? "ملاحظات" : "Observation"}</label>
                <Input 
                  value={editingEmployee.observation} 
                  onChange={e => setEditingEmployee({...editingEmployee, observation: e.target.value})} 
                  className="rounded-xl" 
                  placeholder="..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
              {t.cancel}
            </Button>
            <Button onClick={handleUpdateEmployee} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8 text-white">
              {isRTL ? "حفظ التغييرات" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;