export type Language = "ar" | "en";

export const translations = {
  ar: {
    dashboard: "لوحة التحكم",
    employees: "الموظفون",
    schedule: "الجدول الزمني",
    settings: "الإعدادات",
    reports: "التقارير",
    users: "المستخدمون",
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
    reports_page: {
      title: "التقارير والإحصائيات",
      teacher_load: "نصاب الأساتذة",
      room_usage: "إشغال القاعات",
      class_summary: "ملخص الفروع",
      print_report: "طباعة التقرير",
      hours: "ساعة",
      lessons_count: "عدد الحصص"
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
    reports: "Reports",
    users: "Users",
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
    reports_page: {
      title: "Reports & Analytics",
      teacher_load: "Teacher Load",
      room_usage: "Room Usage",
      class_summary: "Branches Summary",
      print_report: "Print Report",
      hours: "Hours",
      lessons_count: "Lessons Count"
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