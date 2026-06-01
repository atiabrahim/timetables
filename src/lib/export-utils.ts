/**
 * دوال معالجة البيانات (استيراد وتصدير) متوافقة مع MyTable.xml وتنسيق aSc Timetables
 */

export const exportToXml = (data: any, fileName: string) => {
  let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<timetable importtype="xml" importversion="3.1.0">\n';

  // تصدير بيانات المؤسسة
  if (data.institution) {
    xmlString += `  <institution name="${data.institution.name}" subname="${data.institution.subName}" address="${data.institution.address}" phone="${data.institution.phone}" email="${data.institution.email}" academicyear="${data.institution.academicYear || ''}" />\n`;
  }

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
    xmlString += `    <subject id="${sub.id}" name="${sub.name}" name_en="${sub.nameEn || ''}" short="${sub.name}" />\n`;
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

export const parseXml = (xmlText: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");
  
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Invalid XML format");
  }

  const getAttr = (el: Element, attr: string) => el.getAttribute(attr) || "";

  // 0. استخراج بيانات المؤسسة
  let institution = null;
  const instEl = xmlDoc.getElementsByTagName("institution")[0];
  if (instEl) {
    institution = {
      name: getAttr(instEl, "name"),
      subName: getAttr(instEl, "subname"),
      address: getAttr(instEl, "address"),
      phone: getAttr(instEl, "phone"),
      email: getAttr(instEl, "email"),
      academicYear: getAttr(instEl, "academicyear")
    };
  }

  // 1. استخراج الأساتذة
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

  // 2. استخراج القاعات وإنشاء خريطة للمعرفات
  const classroomsMap = new Map();
  const classroomElements = Array.from(xmlDoc.getElementsByTagName("classroom"));
  const rooms = classroomElements.map(el => {
    const name = getAttr(el, "name") || getAttr(el, "short");
    classroomsMap.set(getAttr(el, "id"), name);
    return name;
  });

  // 3. استخراج الأفواج
  const classes = Array.from(xmlDoc.getElementsByTagName("class")).map(el => ({
    id: getAttr(el, "id"),
    name: getAttr(el, "name") || getAttr(el, "short")
  }));

  // 4. استخراج المواد
  const subjects = Array.from(xmlDoc.getElementsByTagName("subject")).map(el => ({
    id: getAttr(el, "id"),
    name: getAttr(el, "name") || getAttr(el, "short"),
    nameEn: getAttr(el, "name_en")
  }));

  // 5. استخراج الحصص والبطاقات (الربط بينهما) مع دعم التسميات المفردة والجمع
  const lessonsMap = new Map();
  Array.from(xmlDoc.getElementsByTagName("lesson")).forEach(el => {
    lessonsMap.set(getAttr(el, "id"), {
      teacherId: getAttr(el, "teacherids") || getAttr(el, "teacherid"),
      subjectId: getAttr(el, "subjectid"),
      classId: getAttr(el, "classids") || getAttr(el, "classid"),
      classroomIds: getAttr(el, "classroomids") || getAttr(el, "classroomid")
    });
  });

  const cardElements = Array.from(xmlDoc.getElementsByTagName("card"));
  const assignments = cardElements.map(el => {
    const lessonId = getAttr(el, "lessonid");
    const lesson = lessonsMap.get(lessonId);
    
    if (!lesson) return null;

    let dayStr = getAttr(el, "days") || getAttr(el, "day");
    let day = 0;
    if (dayStr.length > 1 && dayStr.includes("1")) {
      day = dayStr.indexOf("1");
    } else {
      day = parseInt(dayStr) || 0;
    }

    const roomName = classroomsMap.get(lesson.classroomIds) || "";

    return {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: lesson.teacherId,
      day: day,
      period: getAttr(el, "period"),
      subjectId: lesson.subjectId,
      classId: lesson.classId,
      department: "",
      room: roomName
    };
  }).filter(a => a !== null);

  return { 
    institution,
    employees, 
    departments: [], 
    rooms, 
    classes, 
    subjects, 
    periodConfigs: [], 
    assignments 
  };
};