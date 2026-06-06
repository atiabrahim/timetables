"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Plus, Edit2, ArrowUpDown, Trash2, 
  ChevronUp, ChevronDown, Mail, Phone, Briefcase, Printer, Info,
  Users, UserCheck, Clock, Award, Eye, X, User as UserIcon
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isAdmin = user?.role === "Admin";

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
    if (sortConfig.key !== column) return <ArrowUpDown size={12} className="text-slate-300" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={12} className="text-emerald-600" /> : <ChevronDown size={12} className="text-emerald-600" />;
  };

  const handleAddEmployee = () => {
    if (!newEmployee.firstName.trim() || !newEmployee.lastName.trim()) {
      showError(isRTL ? "يرجى إدخال الاسم واللقب" : "Name is required");
      return;
    }
    const id = Math.random().toString(36).substr(2, 9);
    setEmployees([...employees, { id, ...newEmployee }]);
    setNewEmployee({ firstName: "", lastName: "", category: "Full-time", email: "", phone: "", observation: "" });
    setIsAddDialogOpen(false);
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

  const PrintableTable = () => (
    <table className="w-full border-collapse border-2 border-slate-950 text-sm">
      <thead>
        <tr className="bg-slate-100 border-b-2 border-slate-950">
          <th className="p-3 border-e-2 border-slate-950 text-center font-black w-12">#</th>
          <th className={cn("p-3 border-e-2 border-slate-950 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "المعلم" : "Teacher"}</th>
          <th className="p-3 border-e-2 border-slate-950 text-center font-black w-32">{isRTL ? "الفئة" : "Category"}</th>
          <th className={cn("p-3 border-e-2 border-slate-950 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "البريد الإلكتروني" : "Email"}</th>
          <th className={cn("p-3 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "الهاتف" : "Phone"}</th>
        </tr>
      </thead>
      <tbody>
        {sortedAndFilteredEmployees.map((emp, idx) => (
          <tr key={emp.id} className="border-b border-slate-950">
            <td className="p-3 border-e border-slate-950 text-center font-bold">{idx + 1}</td>
            <td className="p-3 border-e border-slate-950 font-bold text-slate-900">{emp.lastName} {emp.firstName}</td>
            <td className="p-3 border-e border-slate-950 text-center font-medium">{emp.category}</td>
            <td className="p-3 border-e border-slate-950 text-slate-700">{emp.email || "---"}</td>
            <td className="p-3 text-slate-700">{emp.phone || "---"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title={isRTL ? "المعلمون" : "Teachers"} 
        subtitle={isRTL ? "إدارة بيانات الأساتذة والمعلمين" : "Manage teacher and instructor data"}
        icon={Briefcase}
        isRTL={isRTL}
      >
        {isAdmin && (
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold"
          >
            <Plus size={18} />
            {isRTL ? "إضافة معلم جديد" : "Add New Teacher"}
          </Button>
        )}
        <Button variant="outline" onClick={() => setIsPreviewOpen(true)} className="rounded-xl border-slate-200 gap-2 font-bold text-slate-700 bg-white">
          <Eye size={18} />
          {isRTL ? "معاينة الطباعة" : "Print Preview"}
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="rounded-xl border-slate-200 gap-2 font-bold text-slate-700 bg-white">
          <Printer size={18} />
          {isRTL ? "طباعة القائمة" : "Print List"}
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

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm print:hidden">
        <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
          <thead>
            <tr className="bg-slate-50">
              <th className={cn("p-2 text-slate-700 font-black text-[10px] uppercase border border-slate-200 cursor-pointer", isRTL ? "text-right" : "text-left")} onClick={() => handleSort("lastName")}>
                <div className="flex items-center gap-2">{isRTL ? "المعلم" : "Teacher"} <SortIcon column="lastName" /></div>
              </th>
              <th className="p-2 text-slate-700 font-black text-[10px] uppercase border border-slate-200 text-center w-32 cursor-pointer" onClick={() => handleSort("category")}>
                <div className="flex items-center justify-center gap-2">{isRTL ? "الفئة" : "Category"} <SortIcon column="category" /></div>
              </th>
              <th className={cn("p-2 text-slate-700 font-black text-[10px] uppercase border border-slate-200", isRTL ? "text-right" : "text-left")}>
                {isRTL ? "التواصل" : "Contact"}
              </th>
              {isAdmin && (
                <th className="p-2 text-slate-700 font-black text-[10px] uppercase border border-slate-200 text-center w-24">
                  {isRTL ? "إجراءات" : "Actions"}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-emerald-50/30 transition-colors group">
                <td className="p-1 border border-slate-100">
                  <div className={cn("flex items-center gap-2 px-2", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <div>
                      <p className="font-bold text-emerald-900 text-xs">{emp.lastName} {emp.firstName}</p>
                    </div>
                    <UserIcon size={12} className="text-emerald-500 shrink-0" />
                  </div>
                </td>
                <td className="p-1 border border-slate-100 text-center">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black",
                    emp.category === "Full-time" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                  )}>
                    {emp.category}
                  </div>
                </td>
                <td className="p-1 border border-slate-100">
                  <div className={cn("flex flex-col gap-0.5 px-2 text-[10px] font-bold text-slate-600", isRTL ? "items-start" : "items-end")}>
                    {emp.email && <div className="flex items-center gap-1"><Mail size={10} className="text-slate-400" /> {emp.email}</div>}
                    {emp.phone && <div className="flex items-center gap-1"><Phone size={10} className="text-slate-400" /> {emp.phone}</div>}
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-1 border border-slate-100 text-center">
                    <div className="flex justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-emerald-600 hover:bg-emerald-50 rounded-md"
                        onClick={() => handleEditClick(emp)}
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-400 hover:bg-red-50 rounded-md"
                        onClick={() => deleteEmployee(emp.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Print Content Master */}
      <div className="print-content-master hidden print:block">
        <OfficialPrintWrapper
          title={isRTL ? "قائمة الأساتذة والمعلمين" : "Teachers & Instructors List"}
          subtitle={
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <span>{isRTL ? `إجمالي الأساتذة: ${employees.length}` : `Total Teachers: ${employees.length}`}</span>
            </div>
          }
        >
          <PrintableTable />
        </OfficialPrintWrapper>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950 flex items-center gap-2">
              <Plus size={20} className="text-emerald-600" />
              {isRTL ? "إضافة معلم جديد" : "Add New Teacher"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-800">{isRTL ? "الاسم" : "First Name"}</label>
                <Input 
                  value={newEmployee.firstName} 
                  onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})} 
                  className="rounded-xl" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-800">{isRTL ? "اللقب" : "Last Name"}</label>
                <Input 
                  value={newEmployee.lastName} 
                  onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})} 
                  className="rounded-xl" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-800">{isRTL ? "الفئة" : "Category"}</label>
                <Select 
                  value={newEmployee.category} 
                  onValueChange={v => setNewEmployee({...newEmployee, category: v})}
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
                  value={newEmployee.phone} 
                  onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} 
                  className="rounded-xl" 
                  placeholder="0555xxxxxx"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-800">{isRTL ? "البريد الإلكتروني" : "Email"}</label>
              <Input 
                type="email"
                value={newEmployee.email} 
                onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} 
                className="rounded-xl" 
                placeholder="teacher@edu.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-800">{isRTL ? "ملاحظات" : "Observation"}</label>
              <Input 
                value={newEmployee.observation} 
                onChange={e => setNewEmployee({...newEmployee, observation: e.target.value})} 
                className="rounded-xl" 
                placeholder="..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">
              {t.cancel}
            </Button>
            <Button onClick={handleAddEmployee} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8 text-white">
              {isRTL ? "إضافة" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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

      {/* Print Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden rounded-[2.5rem] p-0 border-none bg-emerald-50/30 flex flex-col">
          <div className="bg-white p-6 border-b border-emerald-100 flex items-center justify-between sticky top-0 z-10 shrink-0 print:hidden">
            <div className="flex items-center gap-3">
              <Printer className="text-emerald-600" />
              <h3 className="font-black text-emerald-900">{isRTL ? "معاينة طباعة قائمة المعلمين" : "Teachers List Print Preview"}</h3>
            </div>
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-slate-500"><X size={20} /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-950/10 print:bg-white print:p-0">
            <div className="w-[210mm] min-h-[297mm]">
              <OfficialPrintWrapper
                title={isRTL ? "قائمة الأساتذة والمعلمين" : "Teachers & Instructors List"}
                subtitle={
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <span>{isRTL ? `إجمالي الأساتذة: ${employees.length}` : `Total Teachers: ${employees.length}`}</span>
                  </div>
                }
              >
                <PrintableTable />
              </OfficialPrintWrapper>
            </div>
          </div>
          <DialogFooter className="bg-white p-6 border-t border-emerald-100 shrink-0 print:hidden">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="rounded-xl px-8 h-12 font-bold">{t.cancel}</Button>
            <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-12 h-12 font-black shadow-lg shadow-emerald-100 text-white">
              <Printer size={20} className="mr-2" /> {t.print}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;