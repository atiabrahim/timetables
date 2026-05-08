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

  const employees = Array.from(xmlDoc.getElementsByTagName("Employee")).map(el => ({
    id: getAttr(el, "id"),
    firstName: getAttr(el, "firstName"),
    lastName: getAttr(el, "lastName"),
    category: getAttr(el, "category"),
    observation: getAttr(el, "observation")
  }));

  const departments = Array.from(xmlDoc.getElementsByTagName("Department")).map(el => 
    getAttr(el, "name")
  );

  const rooms = Array.from(xmlDoc.getElementsByTagName("Room")).map(el => 
    getAttr(el, "name")
  );

  const classes = Array.from(xmlDoc.getElementsByTagName("Class")).map(el => ({
    id: getAttr(el, "id"),
    name: getAttr(el, "name")
  }));

  const subjects = Array.from(xmlDoc.getElementsByTagName("Subject")).map(el => ({
    id: getAttr(el, "id"),
    name: getAttr(el, "name")
  }));

  const periodConfigs = Array.from(xmlDoc.getElementsByTagName("PeriodConfig")).map(el => ({
    day: parseInt(getAttr(el, "day") || "0"),
    period: getAttr(el, "period"),
    isActive: getAttr(el, "isActive").toLowerCase() === "true"
  }));

  const assignments = Array.from(xmlDoc.getElementsByTagName("Assignment")).map(el => ({
    id: getAttr(el, "id"),
    employeeId: getAttr(el, "employeeId"),
    day: parseInt(getAttr(el, "day") || "0"),
    period: getAttr(el, "period"),
    subjectId: getAttr(el, "subjectId"),
    classId: getAttr(el, "classId"),
    department: getAttr(el, "department"),
    room: getAttr(el, "room")
  }));

  return { employees, departments, rooms, classes, subjects, periodConfigs, assignments };
};