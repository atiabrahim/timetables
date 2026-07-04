"use client";

import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { 
  Building2, Save, FileCode
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { exportToXml } from "../lib/export-utils";
import PageHeader from "../components/shared/PageHeader";
import InstitutionInfoCard from "../components/institution/InstitutionInfoCard";
import DepartmentsTable from "../components/institution/DepartmentsTable";
import LogoCard from "../components/institution/LogoCard";
import HeaderPreviewCard from "../components/institution/HeaderPreviewCard";
import AddDeptDialog from "../components/institution/AddDeptDialog";
import EditDeptDialog from "../components/institution/EditDeptDialog";

const Institution = () => {
  const { 
    institution, setInstitution, 
    departments, setDepartments,
    employees, assignments, rooms, classes, subjects,
    isRTL, t, user 
  } = useApp();

  const isAdmin = user?.role === "Admin";
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // معالجة رفع الشعار وتحويله إلى Base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // حد أقصى 1 ميجابايت للحفاظ على أداء التخزين المحلي
      showError(isRTL ? "حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 1 ميجابايت" : "Image size is too large, please select an image under 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setInstitution({ ...institution, logo: base64String });
      showSuccess(isRTL ? "تم رفع الشعار بنجاح" : "Logo uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setInstitution({ ...institution, logo: "" });
    showSuccess(isRTL ? "تم حذف الشعار" : "Logo removed");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
          <InstitutionInfoCard 
            institution={institution}
            setInstitution={setInstitution}
            isRTL={isRTL}
            t={t}
          />

          {/* إدارة المصالح */}
          <DepartmentsTable 
            departments={departments}
            isRTL={isRTL}
            isAdmin={isAdmin}
            onAddClick={() => setIsAddDeptOpen(true)}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteDept}
          />
        </div>

        <div className="space-y-6">
          {/* قسم رفع وتعديل الشعار */}
          <LogoCard 
            logo={institution.logo}
            isAdmin={isAdmin}
            isRTL={isRTL}
            fileInputRef={fileInputRef}
            onLogoUpload={handleLogoUpload}
            onRemoveLogo={handleRemoveLogo}
          />

          {/* معاينة الترويسة */}
          <HeaderPreviewCard 
            institution={institution}
            isRTL={isRTL}
          />
        </div>
      </div>

      {/* حوار إضافة مصلحة */}
      <AddDeptDialog 
        isOpen={isAddDeptOpen}
        onOpenChange={setIsAddDeptOpen}
        isRTL={isRTL}
        newDept={newDept}
        setNewDept={setNewDept}
        onAdd={handleAddDept}
        cancelText={t.cancel}
      />

      {/* حوار تعديل مصلحة */}
      <EditDeptDialog 
        isOpen={isEditDeptOpen}
        onOpenChange={setIsEditDeptOpen}
        isRTL={isRTL}
        editingDept={editingDept}
        setEditingDept={setEditingDept}
        onSave={handleUpdateDept}
        cancelText={t.cancel}
      />
    </div>
  );
};

export default Institution;