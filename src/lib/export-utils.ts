/**
 * دوال معالجة البيانات (استيراد وتصدير) بنمط مرن
 */

export const exportToXml = (data: any, fileName: string) => {
  let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<SchedulerData>\n';

  // تصدير الموظفين
  xmlString += '  <Employees>\n';
  (data.employees || []).forEach((emp: any) => {
    xmlString += `    <Employee id="${emp.id}" firstName="${emp.firstName}" lastName="${emp.lastName}" category="${emp.category}" observation="${emp.observation || ''}" />\n`;
  });
  xmlString += '  </Employees>\n';

  // تصدير المصالح
  xmlString += '  <Departments>\n';
  (data.departments || []).forEach((dept: string) => {
    xmlString += `    <Department name="${dept}" />\n`;
  });
  xmlString += '  </Departments>\n';

  // تصدير القاعات
  xmlString += '  <Rooms>\n';
  (data.rooms || []).forEach((room: string) => {
    xmlString += `    <Room name="${room}" />\n`;
  });
  xmlString += '  </Rooms>\n';

  // تصدير الأفواج
  xmlString += '  <Classes>\n';
  (data.classes || []).forEach((cls: any) => {
    xmlString += `    <Class id="${cls.id}" name="${cls.name}" />\n`;
  });
  xmlString += '  </Classes>\n';

  // تصدير المواد
  xmlString += '  <Subjects>\n';
  (data.subjects || []).forEach((sub: any) => {
    xmlString += `    <Subject id="${sub.id}" name="${sub.name}" />\n`;
  });
  xmlString += '  </Subjects>\n';

  // تصدير إعدادات الفترات
  xmlString += '  <PeriodConfigs>\n';
  (data.periodConfigs || []).forEach((config: any) => {
    xmlString += `    <PeriodConfig day="${config.day}" period="${config.period}" isActive="${config.isActive}" />\n`;
  });
  xmlString += '  </PeriodConfigs>\n';

  // تصدير التوزيعات
  xmlString += '  <Assignments>\n';
  (data.assignments || []).forEach((asgn: any) => {
    xmlString += `    <Assignment id="${asgn.id}" employeeId="${asgn.employeeId}" day="${asgn.day}" period="${asgn.period}" subjectId="${asgn.subjectId}" classId="${asgn.classId}" department="${asgn.department}" room="${asgn.room || ''}" />\n`;
  });
  xmlString += '  </Assignments>\n';

  xmlString += '</SchedulerData>';

  const blob = new Blob([xmlString], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJson = (data: any, fileName: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseXml = (xmlText: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");
  
  const getAttr = (el: Element, attr: string) => el.getAttribute(attr) || "";

  // دالة مساعدة للبحث عن العناصر بمسميات متعددة
  const findElements = (tags: string[]) => {
    for (const tag of tags) {
      const found = Array.from(xmlDoc.getElementsByTagName(tag));
      if (found.length > 0) return found;
    }
    return [];
  };

  // استخراج الموظفين
  const employees = findElements(["Employee", "teacher", "staff", "person", "الأستاذ", "المعلم"]).map(el => ({
    id: getAttr(el, "id") || Math.random().toString(36).substr(2, 5),
    firstName: getAttr(el, "firstName") || getAttr(el, "name").split(' ')[0] || getAttr(el, "الاسم") || "Unknown",
    lastName: getAttr(el, "lastName") || getAttr(el, "name").split(' ').slice(1).join(' ') || getAttr(el, "اللقب") || "",
    category: getAttr(el, "category") || getAttr(el, "الفئة") || "Full-time",
    observation: getAttr(el, "observation") || getAttr(el, "note") || getAttr(el, "ملاحظة") || ""
  }));

  // استخراج المصالح
  const departments = findElements(["Department", "dept", "office", "المصلحة", "القسم"]).map(el => 
    getAttr(el, "name") || getAttr(el, "title") || getAttr(el, "label")
  );

  // استخراج القاعات
  const rooms = findElements(["Room", "classroom", "lab", "القاعة", "الحجرة"]).map(el => 
    getAttr(el, "name") || getAttr(el, "number") || getAttr(el, "label")
  );

  // استخراج الأفواج
  const classes = findElements(["Class", "grade", "group", "الفوج", "القسم_التربوي"]).map(el => ({
    id: getAttr(el, "id") || Math.random().toString(36).substr(2, 5),
    name: getAttr(el, "name") || getAttr(el, "title") || getAttr(el, "label")
  }));

  // استخراج المواد
  const subjects = findElements(["Subject", "course", "lesson_type", "المادة"]).map(el => ({
    id: getAttr(el, "id") || Math.random().toString(36).substr(2, 5),
    name: getAttr(el, "name") || getAttr(el, "title") || getAttr(el, "label")
  }));

  // استخراج إعدادات الفترات
  const periodConfigs = findElements(["PeriodConfig", "schedule_config"]).map(el => ({
    day: parseInt(getAttr(el, "day") || "0"),
    period: getAttr(el, "period"),
    isActive: getAttr(el, "isActive").toLowerCase() === "true"
  }));

  // استخراج التوزيعات
  const assignments = findElements(["Assignment", "lesson", "session", "الحصة"]).map(el => ({
    id: getAttr(el, "id") || Math.random().toString(36).substr(2, 9),
    employeeId: getAttr(el, "employeeId") || getAttr(el, "teacherid") || getAttr(el, "أستاذ_id"),
    day: parseInt(getAttr(el, "day") || "0"),
    period: getAttr(el, "period"),
    subjectId: getAttr(el, "subjectId") || getAttr(el, "subjectid") || getAttr(el, "مادة_id"),
    classId: getAttr(el, "classId") || getAttr(el, "classid") || getAttr(el, "فوج_id"),
    department: getAttr(el, "department") || getAttr(el, "مصلحة"),
    room: getAttr(el, "room") || getAttr(el, "قاعة")
  }));

  return { employees, departments, rooms, classes, subjects, periodConfigs, assignments };
};