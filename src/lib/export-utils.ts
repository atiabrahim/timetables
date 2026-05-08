/**
 * دوال معالجة البيانات (استيراد وتصدير) متوافقة مع MyTable.xml وتنسيق aSc Timetables
 */

export const exportToXml = (data: any, fileName: string) => {
  let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<timetable importtype="xml" importversion="3.1.0">\n';

  // تصدير الموظفين (الأساتذة)
  xmlString += `  <teachers count="${data.employees?.length || 0}">\n`;
  (data.employees || []).forEach((emp: any) => {
    xmlString += `    <teacher id="${emp.id}" name="${emp.lastName}, ${emp.firstName}" short="${emp.lastName}" category="${emp.category}" observation="${emp.observation || ''}" />\n`;
  });
  xmlString += '  </teachers>\n';

  // تصدير القاعات
  xmlString += `  <classrooms count="${data.rooms?.length || 0}">\n`;
  (data.rooms || []).forEach((room: string, index: number) => {
    xmlString += `    <classroom id="${index + 1}" name="${room}" short="${room}" />\n`;
  });
  xmlString += '  </classrooms>\n';

  // تصدير الأفواج
  xmlString += `  <classes count="${data.classes?.length || 0}">\n`;
  (data.classes || []).forEach((cls: any) => {
    xmlString += `    <class id="${cls.id}" name="${cls.name}" short="${cls.name}" />\n`;
  });
  xmlString += '  </classes>\n';

  // تصدير المواد
  xmlString += `  <subjects count="${data.subjects?.length || 0}">\n`;
  (data.subjects || []).forEach((sub: any) => {
    xmlString += `    <subject id="${sub.id}" name="${sub.name}" short="${sub.name}" />\n`;
  });
  xmlString += '  </subjects>\n';

  // تصدير الحصص (التوزيعات)
  xmlString += `  <lessons count="${data.assignments?.length || 0}">\n`;
  (data.assignments || []).forEach((asgn: any) => {
    xmlString += `    <lesson id="${asgn.id}" teacherids="${asgn.employeeId}" subjectid="${asgn.subjectId}" classids="${asgn.classId}" classroomids="${asgn.room || ''}" day="${asgn.day}" period="${asgn.period}" />\n`;
  });
  xmlString += '  </lessons>\n';

  xmlString += '</timetable>';

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
  
  // التحقق من وجود خطأ في التحليل
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Invalid XML format");
  }

  const getAttr = (el: Element, attr: string) => el.getAttribute(attr) || "";

  // 1. استخراج الأساتذة (Teachers)
  const teacherElements = Array.from(xmlDoc.getElementsByTagName("teacher"));
  const employees = teacherElements.map(el => {
    const fullName = getAttr(el, "name");
    let firstName = "Unknown";
    let lastName = "";

    if (fullName.includes(",")) {
      const parts = fullName.split(",");
      lastName = parts[0].trim();
      firstName = parts[1].trim();
    } else if (fullName.includes(" ")) {
      const parts = fullName.split(" ");
      firstName = parts[0];
      lastName = parts.slice(1).join(" ");
    } else {
      firstName = fullName;
    }

    return {
      id: getAttr(el, "id"),
      firstName,
      lastName,
      category: getAttr(el, "category") || "Full-time",
      observation: getAttr(el, "observation") || ""
    };
  });

  // 2. استخراج القاعات (Classrooms)
  const rooms = Array.from(xmlDoc.getElementsByTagName("classroom")).map(el => 
    getAttr(el, "name") || getAttr(el, "short")
  );

  // 3. استخراج الأفواج (Classes)
  const classes = Array.from(xmlDoc.getElementsByTagName("class")).map(el => ({
    id: getAttr(el, "id"),
    name: getAttr(el, "name") || getAttr(el, "short")
  }));

  // 4. استخراج المواد (Subjects)
  const subjects = Array.from(xmlDoc.getElementsByTagName("subject")).map(el => ({
    id: getAttr(el, "id"),
    name: getAttr(el, "name") || getAttr(el, "short")
  }));

  // 5. استخراج الحصص (Lessons/Assignments)
  // ملاحظة: في ملفات aSc، الحصص قد تكون في وسم <lesson> أو <card>
  const lessonElements = Array.from(xmlDoc.getElementsByTagName("lesson"));
  const assignments = lessonElements.map(el => ({
    id: getAttr(el, "id") || Math.random().toString(36).substr(2, 9),
    employeeId: getAttr(el, "teacherids") || getAttr(el, "teacherid"),
    day: parseInt(getAttr(el, "day") || "0"),
    period: getAttr(el, "period") || "Morning",
    subjectId: getAttr(el, "subjectid"),
    classId: getAttr(el, "classids") || getAttr(el, "classid"),
    department: "", // aSc لا يحتوي عادة على هذا الحقل مباشرة
    room: getAttr(el, "classroomids") || getAttr(el, "classroomid")
  })).filter(a => a.employeeId && a.subjectId); // تصفية الحصص غير المكتملة

  return { 
    employees, 
    departments: [], 
    rooms, 
    classes, 
    subjects, 
    periodConfigs: [], 
    assignments 
  };
};