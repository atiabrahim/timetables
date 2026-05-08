export type Language = "ar" | "en";

export const translations = {
  ar: {
    dashboard: "لوحة التحكم",
    employees: "الموظفون",
    schedule: "الجدول الزمني",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    cancel: "إلغاء",
    save: "حفظ",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    search: "بحث",
    stats: {
      employees: "الموظفون",
      classes: "الفروع",
      subjects: "المواد الدراسية",
      lessons: "الحصص",
      departments: "المصالح / الأقسام",
      rooms: "القاعات"
    },
    dangerZone: {
      title: "منطقة الخطر",
      description: "سيؤدي هذا الإجراء إلى حذف كافة المعلومات بشكل نهائي.",
      button: "مسح كافة البيانات",
      confirmTitle: "هل أنت متأكد تماماً؟",
      confirmDescription: "لا يمكن التراجع عن هذا الإجراء. سيتم حذف كل شيء.",
      confirmButton: "نعم، امسح الكل"
    }
  },
  en: {
    dashboard: "Dashboard",
    employees: "Employees",
    schedule: "Schedule",
    settings: "Settings",
    logout: "Logout",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    stats: {
      employees: "Employees",
      classes: "Branches",
      subjects: "Subjects",
      lessons: "Lessons",
      departments: "Departments",
      rooms: "Rooms"
    },
    dangerZone: {
      title: "Danger Zone",
      description: "This action will permanently delete all information.",
      button: "Clear All Data",
      confirmTitle: "Are you absolutely sure?",
      confirmDescription: "This action cannot be undone. Everything will be deleted.",
      confirmButton: "Yes, Clear All"
    }
  }
};