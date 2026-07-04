"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  Search, Plus, Briefcase, Printer, Eye, X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "../utils/toast";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import EmployeeStats from "../components/employees/EmployeeStats";
import EmployeeTable from "../components/employees/EmployeeTable";
import AddEmployeeDialog from "../components/employees/AddEmployeeDialog";
import EditEmployeeDialog from "../components/employees/EditEmployeeDialog";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";

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
    <table className="w-full border-collapse border-2 border-slate-950 text-xs">
      <thead>
        <tr className="bg-slate-100 border-b-2 border-slate-950">
          <th className="p-1.5 border-e-2 border-slate-950 text-center font-black w-12">#</th>
          <th className={cn("p-1.5 border-e-2 border-slate-950 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "المعلم" : "Teacher"}</th>
          <th className="p-1.5 border-e-2 border-slate-950 text-center font-black w-32">{isRTL ? "الفئة" : "Category"}</th>
          <th className={cn("p-1.5 border-e-2 border-slate-950 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "البريد الإلكتروني" : "Email"}</th>
          <th className={cn("p-1.5 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "الهاتف" : "Phone"}</th>
        </tr>
      </thead>
      <tbody>
        {sortedAndFilteredEmployees.map((emp, idx) => (
          <tr key={emp.id} className="border-b border-slate-950">
            <td className="p-1.5 border-e border-slate-950 text-center font-bold">{idx + 1}</td>
            <td className="p-1.5 border-e border-slate-950 font-bold text-slate-900">{emp.lastName} {emp.firstName}</td>
            <td className="p-1.5 border-e border-slate-950 text-center font-medium">{emp.category}</td>
            <td className="p-1.5 border-e border-slate-950 text-slate-700">{emp.email || "---"}</td>
            <td className="p-1.5 text-slate-700">{emp.phone || "---"}</td>
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
      <EmployeeStats isRTL={isRTL} stats={employeeStats} />

      {/* Employee Table */}
      <EmployeeTable 
        employees={sortedAndFilteredEmployees}
        isRTL={isRTL}
        isAdmin={isAdmin}
        onEdit={handleEditClick}
        onDelete={deleteEmployee}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

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
      <AddEmployeeDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        isRTL={isRTL}
        newEmployee={newEmployee}
        setNewEmployee={setNewEmployee}
        onAdd={handleAddEmployee}
        cancelText={t.cancel}
      />
      
      {/* Edit Dialog */}
      <EditEmployeeDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        isRTL={isRTL}
        editingEmployee={editingEmployee}
        setEditingEmployee={setEditingEmployee}
        onSave={handleUpdateEmployee}
        cancelText={t.cancel}
      />

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