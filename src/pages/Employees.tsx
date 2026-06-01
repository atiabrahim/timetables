"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Download, 
  Plus, 
  Edit2, 
  ArrowUpDown,
  Trash2,
  UserCheck,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  Briefcase,
  Printer
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { cn } from "@/lib/utils";
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
  
  // حالات الإضافة والتعديل
  const [newEmployee, setNewEmployee] = useState({ 
    firstName: "", 
    lastName: "", 
    category: "Full-time", 
    email: "", 
    phone: "",
    observation: "" 
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
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="text-gray-300" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} className="text-emerald-600" /> : <ChevronDown size={14} className="text-emerald-600" />;
  };

  const handleAddEmployee = () => {
    if (!newEmployee.firstName.trim() || !newEmployee.lastName.trim()) {
      showError(isRTL ? "يرجى إدخال الاسم واللقب" : "First and last name are required");
      return;
    }
    const id = Math.random().toString(36).substr(2, 9);
    setEmployees([...employees, { id, ...newEmployee }]);
    setNewEmployee({ firstName: "", lastName: "", category: "Full-time", email: "", phone: "", observation: "" });
    showSuccess(isRTL ? "تم إضافة المعلم بنجاح" : "Teacher added successfully");
  };

  const handleEditClick = (emp: any) => {
    setEditingEmployee({ ...emp });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = () => {
    if (!editingEmployee.firstName.trim() || !editingEmployee.lastName.trim()) return;
    setEmployees(employees.map(e => e.id === editingEmployee.id ? editingEmployee : e));
    setIsEditDialogOpen(false);
    showSuccess(isRTL ? "تم تحديث بيانات المعلم" : "Teacher updated successfully");
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    showSuccess(isRTL ? "تم حذف المعلم" : "Teacher deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex items-center gap-4 w-full md:w-auto order-2 md:order-1">
          <Button onClick={() => window.print()} variant="outline" className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700">
            <Printer size={18} />
            {isRTL ? "طباعة القائمة" : "Print List"}
          </Button>
          <div className="relative flex-1 md:w-80">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-3" : "left-3")} size={16} />
            <Input 
              placeholder={isRTL ? "بحث عن معلم..." : "Search teacher..."} 
              className={cn("rounded-xl border-gray-200 bg-white h-11", isRTL ? "pr-10 text-right" : "pl-10 text-left")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={cn("order-1 md:order-2 w-full md:w-auto", isRTL ? "text-right" : "text-left")}>
          <h2 className="text-3xl font-black text-gray-900">
            {isRTL ? "المعلمون" : "Teachers"} 
            <span className="text-gray-400 text-xl mx-2">({sortedAndFilteredEmployees.length})</span>
          </h2>
        </div>
      </div>

      {/* Add Section (Admin Only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm items-end print:hidden">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase px-1">{isRTL ? "الاسم" : "First Name"}</label>
            <Input 
              value={newEmployee.firstName} 
              onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})}
              className={cn("rounded-xl border-gray-200 h-11", isRTL ? "text-right" : "text-left")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase px-1">{isRTL ? "اللقب" : "Last Name"}</label>
            <Input 
              value={newEmployee.lastName} 
              onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})}
              className={cn("rounded-xl border-gray-200 h-11", isRTL ? "text-right" : "text-left")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase px-1">{isRTL ? "الفئة" : "Category"}</label>
            <Select value={newEmployee.category} onValueChange={v => setNewEmployee({...newEmployee, category: v})}>
              <SelectTrigger className="rounded-xl border-gray-200 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">{isRTL ? "دوام كامل" : "Full-time"}</SelectItem>
                <SelectItem value="Part-time">{isRTL ? "دوام جزئي" : "Part-time"}</SelectItem>
                <SelectItem value="Contract">{isRTL ? "متعاقد" : "Contract"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button onClick={handleAddEmployee} className="w-full bg-[#064e3b] hover:bg-[#053a2c] rounded-xl h-11 font-bold">
              <Plus size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {isRTL ? "إضافة معلم جديد" : "Add Teacher"}
            </Button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm print:border-0 print:shadow-none">
        {/* Print Header */}
        <div className="hidden print:block text-center mb-6 border-b-2 border-emerald-950 pb-4">
          <h1 className="text-2xl font-black text-emerald-950">{isRTL ? "قائمة الأساتذة والمعلمين" : "Teachers & Instructors List"}</h1>
          <p className="text-sm text-gray-600 mt-1">{isRTL ? "نظام EduSchedule لإدارة الجداول" : "EduSchedule Management System"}</p>
        </div>

        <div className="overflow-x-auto">
          <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
            <thead>
              <tr className="bg-[#f9f9f1] print:bg-transparent print:border-b-2 print:border-emerald-950">
                <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer print:p-2 print:text-black print:border-b-2 print:border-emerald-950" onClick={() => handleSort("lastName")}>
                  <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                    <SortIcon column="lastName" />
                    {isRTL ? "الاسم الكامل" : "Full Name"}
                  </div>
                </th>
                <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer print:p-2 print:text-black print:border-b-2 print:border-emerald-950" onClick={() => handleSort("category")}>
                  <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                    <SortIcon column="category" />
                    {isRTL ? "الفئة" : "Category"}
                  </div>
                </th>
                <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 print:p-2 print:text-black print:border-b-2 print:border-emerald-950">{isRTL ? "معلومات التواصل" : "Contact Info"}</th>
                <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 text-center print:hidden">{isRTL ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group print:border-b print:border-gray-300">
                  <td className="p-5 print:p-2">
                    <div className={cn("flex items-center gap-3", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-black print:hidden">
                        {emp.lastName[0]}{emp.firstName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-emerald-950 print:text-black">{emp.lastName} {emp.firstName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest print:text-gray-600">{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 print:p-2">
                    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter print:p-0 print:text-black", 
                      emp.category === "Full-time" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                    )}>
                      <Briefcase size={12} className="print:hidden" />
                      {emp.category}
                    </div>
                  </td>
                  <td className="p-5 print:p-2">
                    <div className="space-y-1">
                      {emp.email && <div className={cn("flex items-center gap-2 text-xs text-gray-500 print:text-black", isRTL ? "flex-row" : "flex-row-reverse")}><Mail size={12} className="print:hidden" /> {emp.email}</div>}
                      {emp.phone && <div className={cn("flex items-center gap-2 text-xs text-gray-500 print:text-black", isRTL ? "flex-row" : "flex-row-reverse")}><Phone size={12} className="print:hidden" /> {emp.phone}</div>}
                    </div>
                  </td>
                  <td className="p-5 text-center print:hidden">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-emerald-700 font-bold gap-2 hover:bg-emerald-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleEditClick(emp)}
                      >
                        <Edit2 size={16} />
                        {isRTL ? "تعديل" : "Edit"}
                      </Button>
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteEmployee(emp.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedAndFilteredEmployees.length === 0 && (
          <div className="text-center py-24 bg-gray-50/30">
            <p className="text-gray-400 font-bold">{isRTL ? "لا يوجد معلمون مطابقون" : "No matching teachers found"}</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950 flex items-center gap-2">
              <UserCheck className="text-emerald-600" />
              {isRTL ? "تعديل بيانات المعلم" : "Edit Teacher Details"}
            </DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "الاسم" : "First Name"}</label>
                <Input value={editingEmployee.firstName} onChange={e => setEditingEmployee({...editingEmployee, firstName: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "اللقب" : "Last Name"}</label>
                <Input value={editingEmployee.lastName} onChange={e => setEditingEmployee({...editingEmployee, lastName: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "الفئة" : "Category"}</label>
                <Select value={editingEmployee.category} onValueChange={v => setEditingEmployee({...editingEmployee, category: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">{isRTL ? "دوام كامل" : "Full-time"}</SelectItem>
                    <SelectItem value="Part-time">{isRTL ? "دوام جزئي" : "Part-time"}</SelectItem>
                    <SelectItem value="Contract">{isRTL ? "متعاقد" : "Contract"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "رقم الهاتف" : "Phone"}</label>
                <Input value={editingEmployee.phone || ""} onChange={e => setEditingEmployee({...editingEmployee, phone: e.target.value})} className="rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "البريد الإلكتروني" : "Email"}</label>
                <Input value={editingEmployee.email || ""} onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})} className="rounded-xl" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">{t.cancel}</Button>
            <Button onClick={handleUpdateEmployee} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8">{isRTL ? "حفظ" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>
        {`
          @media print {
            body > div:not([role="dialog"]), 
            header, 
            aside, 
            form,
            .print\\:hidden {
              display: none !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
            }
            .max-w-6xl {
              max-width: 100% !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            th, td {
              border: 1px solid #000 !important;
              padding: 8px !important;
              color: #000 !important;
            }
            @page {
              size: A4 portrait;
              margin: 15mm !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Employees;