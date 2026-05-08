"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  UserPlus, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  FileText,
  BadgeCheck,
  Users
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { showSuccess } from "../utils/toast";
import { cn } from "@/lib/utils";

const Employees = () => {
  const { employees, setEmployees, isRTL, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    category: "Full-time",
    observation: ""
  });

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = () => {
    if (!newEmployee.firstName || !newEmployee.lastName) return;
    
    const id = (employees.length > 0 ? Math.max(...employees.map(e => parseInt(e.id))) + 1 : 1).toString();
    setEmployees([...employees, { ...newEmployee, id }]);
    setNewEmployee({ firstName: "", lastName: "", category: "Full-time", observation: "" });
    setIsAddDialogOpen(false);
    showSuccess(isRTL ? "تم إضافة الموظف بنجاح" : "Employee added successfully");
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    showSuccess(isRTL ? "تم حذف الموظف" : "Employee deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-emerald-950">{isRTL ? "إدارة الموظفين" : "Employee Management"}</h2>
          <p className="text-emerald-600/70 mt-1">{isRTL ? `لديك ${employees.length} موظف حالياً` : `You have ${employees.length} employees currently`}</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
            <Input 
              placeholder={isRTL ? "بحث..." : "Search..."} 
              className={cn("pl-10 rounded-xl border-emerald-100 bg-white/50 backdrop-blur-sm", isRTL && "pr-10 pl-3")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-100 px-6">
                <UserPlus size={18} className={isRTL ? "ml-2" : "mr-2"} />
                {isRTL ? "إضافة موظف" : "Add Employee"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-none rounded-3xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-emerald-950">
                  {isRTL ? "موظف جديد" : "New Employee"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-emerald-800">{isRTL ? "الاسم" : "First Name"}</label>
                    <Input 
                      value={newEmployee.firstName} 
                      onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-emerald-800">{isRTL ? "اللقب" : "Last Name"}</label>
                    <Input 
                      value={newEmployee.lastName} 
                      onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-800">{isRTL ? "الفئة" : "Category"}</label>
                  <select 
                    className="w-full h-10 px-3 bg-background border rounded-xl"
                    value={newEmployee.category}
                    onChange={e => setNewEmployee({...newEmployee, category: e.target.value})}
                  >
                    <option value="Full-time">{isRTL ? "دوام كامل" : "Full-time"}</option>
                    <option value="Part-time">{isRTL ? "دوام جزئي" : "Part-time"}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-800">{isRTL ? "ملاحظات" : "Observations"}</label>
                  <Input 
                    value={newEmployee.observation} 
                    onChange={e => setNewEmployee({...newEmployee, observation: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">{t.cancel}</Button>
                <Button onClick={handleAddEmployee} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">{isRTL ? "حفظ" : "Save"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => (
          <Card key={emp.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-md overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-lg leading-tight">{emp.firstName} {emp.lastName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <BadgeCheck size={12} className={isRTL ? "ml-1" : "mr-1"} />
                          {emp.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-emerald-400 group-hover:text-emerald-600">
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem className="text-emerald-600">
                        <Edit2 size={14} className={isRTL ? "ml-2" : "mr-2"} />
                        {isRTL ? "تعديل" : "Edit"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500" onClick={() => deleteEmployee(emp.id)}>
                        <Trash2 size={14} className={isRTL ? "ml-2" : "mr-2"} />
                        {isRTL ? "حذف" : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-6 border-t border-emerald-50 pt-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">{isRTL ? "الملاحظات" : "OBSERVATION"}</p>
                    <p className="text-sm font-medium text-emerald-900 truncate">{emp.observation || "---"}</p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50/50 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600/70">
                  <FileText size={14} />
                  <span className="text-xs">{isRTL ? "السجل الكامل" : "Full Record"}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600 hover:bg-emerald-100 rounded-lg">
                  {isRTL ? "عرض التفاصيل" : "View Details"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-20 bg-emerald-50/30 rounded-3xl border-2 border-dashed border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={40} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-emerald-900">{isRTL ? "لا يوجد موظفون" : "No employees found"}</h3>
          <p className="text-emerald-600/70 mt-2">{isRTL ? "حاول تغيير كلمة البحث أو إضافة موظف جديد" : "Try changing your search or add a new employee"}</p>
        </div>
      )}
    </div>
  );
};

export default Employees;