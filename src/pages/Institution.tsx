"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Building2, Save, Mail, Phone, Calendar, FileCode, PenTool, 
  Plus, Edit2, Trash2, Info, Hash, User, ShieldAlert
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { cn } from "@/lib/utils";
import { exportToXml } from "../lib/export-utils";
import PageHeader from "../components/shared/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Institution = () => {
  const { 
    institution, setInstitution, 
    departments, setDepartments,
    employees, assignments, rooms, classes, subjects,
    isRTL, t, user 
  } = useApp();

  const isAdmin = user?.role === "Admin";

  // إدارة المصالح
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [newDept, setNewDept] = useState({ number: "", name: "", head: "", code: "", observation: "" });
  const [editingDept, setEditingDept] = useState<any>(null);

  const handleSave = () => {
    showSuccess(isRTL ? "تم حفظ بيانات المؤسسة بنجاح" : "Institution details saved successfully");
  };

  const handleExportXml = () => {
    const dataToExport = {
      institution,
      employees,
      assignments,
      rooms,
      classes,
      subjects,
      departments
    };
    exportToXml(dataToExport, `EduSchedule_Export_${new Date().toISOString().split('T')[0]}`);
    showSuccess(isRTL ? "تم تصدير ملف XML المحدث" : "Updated XML file exported");
  };

  // إضافة مصلحة جديدة
  const handleAddDept = () => {
    if (!newDept.name.trim()) {
      showError(isRTL ? "يرجى إدخال اسم المصلحة" : "Please enter department name");
      return;
    }
    const id = `dept-${Math.random().toString(36).substr(2, 9)}`;
    setDepartments([...departments, { id, ...newDept }]);
    setNewDept({ number: "", name: "", head: "", code: "", observation: "" });
    setIsAddDeptOpen(false);
    showSuccess(isRTL ? "تم إضافة المصلحة بنجاح" : "Department added successfully");
  };

  // تعديل مصلحة
  const handleEditClick = (dept: any) => {
    setEditingDept({ ...dept });
    setIsEditDeptOpen(true);
  };

  const handleUpdateDept = () => {
    if (!editingDept || !editingDept.name.trim()) return;
    setDepartments(departments.map(d => d.id === editingDept.id ? editingDept : d));
    setIsEditDeptOpen(false);
    showSuccess(isRTL ? "تم تحديث بيانات المصلحة بنجاح" : "Department updated successfully");
  };

  // حذف مصلحة
  const handleDeleteDept = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
    showSuccess(isRTL ? "تم حذف المصلحة" : "Department deleted");
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t.institution_page.title}
        subtitle={t.institution_page.subtitle}
        icon={Building2}
        isRTL={isRTL}
      >
        <Button 
          variant="outline" 
          onClick={handleExportXml} 
          className="rounded-xl border-emerald-200 text-emerald-700 gap-2 font-bold px-6 h-11 bg-white"
        >
          <FileCode size={18} />
          {isRTL ? "تصدير XML المحدث" : "Export Updated XML"}
        </Button>
        <Button 
          onClick={handleSave} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold px-8 h-11 shadow-lg shadow-emerald-100"
        >
          <Save size={18} />
          {t.save}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* معلومات المؤسسة */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-[#f9f9f1] border-b border-gray-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Building2 size={20} className="text-[#064e3b]" />
                {isRTL ? "المعلومات الأساسية للمؤسسة" : "Basic Institution Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
                    {t.institution_page.name}
                  </label>
                  <div className="relative">
                    <Building2 className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
                    <Input 
                      value={institution.name}
                      onChange={(e) => setInstitution({...institution, name: e.target.value})}
                      className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all font-bold", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
                    {isRTL ? "السنة التكوينية" : "Training Year"}
                  </label>
                  <div className="relative">
                    <Calendar className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
                    <Input 
                      value={institution.academicYear || ""}
                      onChange={(e) => setInstitution({...institution, academicYear: e.target.value})}
                      placeholder="2023/2024"
                      className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all font-bold", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
                    {isRTL ? "مسمى المسؤول البيداغوجي" : "Pedagogical Manager Title"}
                  </label>
                  <div className="relative">
                    <PenTool className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
                    <Input 
                      value={institution.pedagogicalManagerTitle || ""}
                      onChange={(e) => setInstitution({...institution, pedagogicalManagerTitle: e.target.value})}
                      className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
                    {isRTL ? "مسمى المدير العام" : "General Manager Title"}
                  </label>
                  <div className="relative">
                    <PenTool className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
                    <Input 
                      value={institution.generalManagerTitle || ""}
                      onChange={(e) => setInstitution({...institution, generalManagerTitle: e.target.value})}
                      className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
                    {t.institution_page.phone}
                  </label>
                  <div className="relative">
                    <Phone className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
                    <Input 
                      value={institution.phone}
                      onChange={(e) => setInstitution({...institution, phone: e.target.value})}
                      className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-700 uppercase tracking-widest px-1">
                    {t.institution_page.email}
                  </label>
                  <div className="relative">
                    <Mail className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
                    <Input 
                      value={institution.email}
                      onChange={(e) => setInstitution({...institution, email: e.target.value})}
                      className={cn("h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all", isRTL ? "pr-12 text-right" : "pl-12 text-left")}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إدارة المصالح */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-[#f9f9f1] border-b border-gray-100 flex flex-row justify-between items-center">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Building2 size={20} className="text-[#064e3b]" />
                {isRTL ? "إدارة المصالح" : "Departments Management"}
              </CardTitle>
              {isAdmin && (
                <Button 
                  onClick={() => setIsAddDeptOpen(true)} 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 font-bold"
                >
                  <Plus size={16} />
                  {isRTL ? "إضافة مصلحة" : "Add Department"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-3 text-slate-700 font-black text-[10px] uppercase w-16 text-center">{isRTL ? "الرقم" : "No."}</th>
                      <th className="p-3 text-slate-700 font-black text-[10px] uppercase">{isRTL ? "التسمية" : "Name"}</th>
                      <th className="p-3 text-slate-700 font-black text-[10px] uppercase">{isRTL ? "الرئيس" : "Head"}</th>
                      <th className="p-3 text-slate-700 font-black text-[10px] uppercase text-center w-24">{isRTL ? "الرمز" : "Code"}</th>
                      <th className="p-3 text-slate-700 font-black text-[10px] uppercase">{isRTL ? "ملاحظة" : "Note"}</th>
                      {isAdmin && <th className="p-3 text-slate-700 font-black text-[10px] uppercase text-center w-24">{isRTL ? "إجراءات" : "Actions"}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="p-3 text-center font-bold text-xs text-slate-500">{dept.number || "---"}</td>
                        <td className="p-3 font-bold text-emerald-900 text-xs">{dept.name}</td>
                        <td className="p-3 text-slate-700 text-xs">{dept.head || "---"}</td>
                        <td className="p-3 text-center text-xs font-black"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{dept.code || "---"}</span></td>
                        <td className="p-3 text-slate-500 text-xs truncate max-w-[150px]">{dept.observation || "---"}</td>
                        {isAdmin && (
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 rounded-md"
                                onClick={() => handleEditClick(dept)}
                              >
                                <Edit2 size={12} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-red-400 hover:bg-red-50 rounded-md"
                                onClick={() => handleDeleteDept(dept.id)}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {departments.length === 0 && (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="p-8 text-center text-slate-400 font-bold text-xs">
                          {isRTL ? "لا توجد مصالح مسجلة حالياً" : "No departments registered yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-[#f9f9f1] border-b border-gray-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Info size={20} className="text-[#064e3b]" />
                {isRTL ? "معاينة الترويسة" : "Header Preview"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center space-y-2">
                <h3 className="text-lg font-black text-emerald-900">{institution.name || "---"}</h3>
                <p className="text-sm font-bold text-emerald-700">{institution.subName || "---"}</p>
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-100 text-[10px] font-black uppercase text-gray-400">
                  <span>{institution.pedagogicalManagerTitle}</span>
                  <span>{institution.generalManagerTitle}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* حوار إضافة مصلحة */}
      <Dialog open={isAddDeptOpen} onOpenChange={setIsAddDeptOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950 flex items-center gap-2">
              <Plus size={20} className="text-emerald-600" />
              {isRTL ? "إضافة مصلحة جديدة" : "Add New Department"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><Hash size={12}/> {isRTL ? "الرقم" : "No."}</label>
                <Input 
                  value={newDept.number} 
                  onChange={e => setNewDept({...newDept, number: e.target.value})}
                  placeholder="1"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><PenTool size={12}/> {isRTL ? "التسمية" : "Name"}</label>
                <Input 
                  value={newDept.name} 
                  onChange={e => setNewDept({...newDept, name: e.target.value})}
                  placeholder={isRTL ? "مصلحة التكوين" : "Training Dept"}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><User size={12}/> {isRTL ? "الرئيس" : "Head"}</label>
                <Input 
                  value={newDept.head} 
                  onChange={e => setNewDept({...newDept, head: e.target.value})}
                  placeholder={isRTL ? "اسم رئيس المصلحة" : "Head Name"}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><ShieldAlert size={12}/> {isRTL ? "الرمز" : "Code"}</label>
                <Input 
                  value={newDept.code} 
                  onChange={e => setNewDept({...newDept, code: e.target.value})}
                  placeholder="DEP"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-800">{isRTL ? "ملاحظة" : "Observation"}</label>
              <Input 
                value={newDept.observation} 
                onChange={e => setNewDept({...newDept, observation: e.target.value})}
                placeholder="..."
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddDeptOpen(false)} className="rounded-xl">{t.cancel}</Button>
            <Button onClick={handleAddDept} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white">{isRTL ? "إضافة" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* حوار تعديل مصلحة */}
      <Dialog open={isEditDeptOpen} onOpenChange={setIsEditDeptOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950">
              {isRTL ? "تعديل بيانات المصلحة" : "Edit Department Details"}
            </DialogTitle>
          </DialogHeader>
          {editingDept && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><Hash size={12}/> {isRTL ? "الرقم" : "No."}</label>
                  <Input 
                    value={editingDept.number} 
                    onChange={e => setEditingDept({...editingDept, number: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><PenTool size={12}/> {isRTL ? "التسمية" : "Name"}</label>
                  <Input 
                    value={editingDept.name} 
                    onChange={e => setEditingDept({...editingDept, name: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><User size={12}/> {isRTL ? "الرئيس" : "Head"}</label>
                  <Input 
                    value={editingDept.head} 
                    onChange={e => setEditingDept({...editingDept, head: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-bold text-emerald-800 flex items-center gap-1"><ShieldAlert size={12}/> {isRTL ? "الرمز" : "Code"}</label>
                  <Input 
                    value={editingDept.code} 
                    onChange={e => setEditingDept({...editingDept, code: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-800">{isRTL ? "ملاحظة" : "Observation"}</label>
                <Input 
                  value={editingDept.observation} 
                  onChange={e => setEditingDept({...editingDept, observation: e.target.value})}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDeptOpen(false)} className="rounded-xl">
              {t.cancel}
            </Button>
            <Button onClick={handleUpdateDept} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white">
              {isRTL ? "حفظ التغييرات" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Institution;