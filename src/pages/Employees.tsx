"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Plus, Edit2, ArrowUpDown, Trash2, UserCheck, 
  ChevronUp, ChevronDown, Mail, Phone, Briefcase, Printer 
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

type SortConfig = {
  key: "firstName" | "lastName" | "email" | "phone" | "category" | null;
  direction: "asc" | "desc";
};

const Employees = () => {
  const { employees, setEmployees, isRTL, user, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  
  const [newEmployee, setNewEmployee] = useState({ 
    firstName: "", lastName: "", category: "Full-time", email: "", phone: "", observation: "" 
  });
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isAdmin = user?.role === "Admin";

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
                    <Button variant="ghost" size="icon" onClick={() => {setEditingEmployee({...emp}); setIsEditDialogOpen(true);}} className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit2 size={14} /></Button>
                    {isAdmin && <Button variant="ghost" size="icon" onClick={() => deleteEmployee(emp.id)} className="h-8 w-8 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Edit Dialog (Kept simple for this refinement) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>{isRTL ? "تعديل البيانات" : "Edit Data"}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <Input value={editingEmployee?.firstName} onChange={e => setEditingEmployee({...editingEmployee, firstName: e.target.value})} className="rounded-xl" />
                <Input value={editingEmployee?.lastName} onChange={e => setEditingEmployee({...editingEmployee, lastName: e.target.value})} className="rounded-xl" />
             </div>
             <Input value={editingEmployee?.email} onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})} className="rounded-xl" placeholder="Email" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">{t.cancel}</Button>
            <Button onClick={() => {
              setEmployees(employees.map(e => e.id === editingEmployee.id ? editingEmployee : e));
              setIsEditDialogOpen(false);
              showSuccess(isRTL ? "تم التحديث" : "Updated");
            }} className="bg-emerald-600 rounded-xl px-8">{isRTL ? "حفظ" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;