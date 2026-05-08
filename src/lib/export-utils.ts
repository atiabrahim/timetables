export const exportToXml = (data: any, fileName: string) => {
  let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<SchedulerData>\n';

  xmlString += '  <Employees>\n';
  (data.employees || []).forEach((emp: any) => {
    xmlString += `    <Employee id="${emp.id}" firstName="${emp.firstName}" lastName="${emp.lastName}" category="${emp.category}" observation="${emp.observation}" />\n`;
  });
  xmlString += '  </Employees>\n';

  xmlString += '  <Departments>\n';
  (data.departments || []).forEach((dept: string) => {
    xmlString += `    <Department name="${dept}" />\n`;
  });
  xmlString += '  </Departments>\n';

  xmlString += '  <Rooms>\n';
  (data.rooms || []).forEach((room: string) => {
    xmlString += `    <Room name="${room}" />\n`;
  });
  xmlString += '  </Rooms>\n';

  xmlString += '  <Classes>\n';
  (data.classes || []).forEach((cls: any) => {
    xmlString += `    <Class id="${cls.id}" name="${cls.name}" />\n`;
  });
  xmlString += '  </Classes>\n';

  xmlString += '  <Subjects>\n';
  (data.subjects || []).forEach((sub: any) => {
    xmlString += `    <Subject id="${sub.id}" name="${sub.name}" />\n`;
  });
  xmlString += '  </Subjects>\n';

  xmlString += '  <PeriodConfigs>\n';
  (data.periodConfigs || []).forEach((config: any) => {
    xmlString += `    <PeriodConfig day="${config.day}" period="${config.period}" isActive="${config.isActive}" />\n`;
  });
  xmlString += '  </PeriodConfigs>\n';

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

  // محاولة البحث عن الموظفين بمسميات مختلفة (Employee, teacher, staff)
  const employeeTags = ["Employee", "teacher", "staff", "person"];
  let employees: any[] = [];
  for (const tag of employeeTags) {
    const found = Array.from(xmlDoc.getElementsByTagName(tag));
    if (found.length > 0) {
      employees = found.map(el => ({
        id: getAttr(el, "id") || Math.random().toString(36).substr(2, 5),
        firstName: getAttr(el, "firstName") || getAttr(el, "name").split(' ')[0] || "Unknown",
        lastName: getAttr(el, "lastName") || getAttr(el, "name").split(' ').slice(1).join(' ') || "",
        category: getAttr(el, "category") || "Full-time",
        observation: getAttr(el, "observation") || getAttr(el, "note") || ""
      }));
      break;
    }
  }

  // البحث عن المصالح/الأقسام
  const deptTags = ["Department", "dept", "office"];
  let departments: string[] = [];
  for (const tag of deptTags) {
    const found = Array.from(xmlDoc.getElementsByTagName(tag));
    if (found.length > 0) {
      departments = found.map(el => getAttr(el, "name") || getAttr(el, "title"));
      break;
    }
  }

  // البحث عن القاعات
  const roomTags = ["Room", "classroom", "lab"];
  let rooms: string[] = [];
  for (const tag of roomTags) {
    const found = Array.from(xmlDoc.getElementsByTagName(tag));
    if (found.length > 0) {
      rooms = found.map(el => getAttr(el, "name") || getAttr(el, "number"));
      break;
    }
  }

  // البحث عن الأفواج
  const classTags = ["Class", "grade", "group", "class"];
  let classes: any[] = [];
  for (const tag of classTags) {
    const found = Array.from(xmlDoc.getElementsByTagName(tag));
    if (found.length > 0) {
      classes = found.map(el => ({
        id: getAttr(el, "id") || Math.random().toString(36).substr(2, 5),
        name: getAttr(el, "name") || getAttr(el, "title")
      }));
      break;
    }
  }

  // البحث عن المواد
  const subjectTags = ["Subject", "course", "lesson_type"];
  let subjects: any[] = [];
  for (const tag of subjectTags) {
    const found = Array.from(xmlDoc.getElementsByTagName(tag));
    if (found.length > 0) {
      subjects = found.map(el => ({
        id: getAttr(el, "id") || Math.random().toString(36).substr(2, 5),
        name: getAttr(el, "name") || getAttr(el, "title")
      }));
      break;
    }
  }

  // البحث عن الإعدادات الزمنية
  const periodConfigs = Array.from(xmlDoc.getElementsByTagName("PeriodConfig")).map(el => ({
    day: parseInt(getAttr(el, "day") || "0"),
    period: getAttr(el, "period"),
    isActive: getAttr(el, "isActive").toLowerCase() === "true"
  }));

  // البحث عن التوزيعات (الحصص)
  const assignments = Array.from(xmlDoc.getElementsByTagName("Assignment")).map(el => ({
    id: getAttr(el, "id") || Math.random().toString(36).substr(2, 9),
    employeeId: getAttr(el, "employeeId") || getAttr(el, "teacherid"),
    day: parseInt(getAttr(el, "day") || "0"),
    period: getAttr(el, "period"),
    subjectId: getAttr(el, "subjectId") || getAttr(el, "subjectid"),
    classId: getAttr(el, "classId") || getAttr(el, "classid"),
    department: getAttr(el, "department"),
    room: getAttr(el, "room")
  }));

  return { employees, departments, rooms, classes, subjects, periodConfigs, assignments };
};