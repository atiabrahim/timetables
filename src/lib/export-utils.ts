import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPdf = (headers: string[], data: any[][], title: string) => {
  const doc = new jsPDF();
  doc.text(title, 14, 15);
  (doc as any).autoTable({
    head: [headers],
    body: data,
    startY: 20,
    styles: { font: "helvetica", halign: "center" },
  });
  doc.save(`${title}.pdf`);
};

export const exportToXml = (data: any, fileName: string) => {
  let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<SchedulerData>\n';

  // Employees
  xmlString += '  <Employees>\n';
  data.employees.forEach((emp: any) => {
    xmlString += `    <Employee id="${emp.id}" firstName="${emp.firstName}" lastName="${emp.lastName}" category="${emp.category}" observation="${emp.observation}" />\n`;
  });
  xmlString += '  </Employees>\n';

  // Departments
  xmlString += '  <Departments>\n';
  data.departments.forEach((dept: string) => {
    xmlString += `    <Department name="${dept}" />\n`;
  });
  xmlString += '  </Departments>\n';

  // PeriodConfigs
  xmlString += '  <PeriodConfigs>\n';
  data.periodConfigs.forEach((config: any) => {
    xmlString += `    <PeriodConfig day="${config.day}" period="${config.period}" isActive="${config.isActive}" />\n`;
  });
  xmlString += '  </PeriodConfigs>\n';

  // Assignments
  xmlString += '  <Assignments>\n';
  data.assignments.forEach((asgn: any) => {
    xmlString += `    <Assignment id="${asgn.id}" employeeId="${asgn.employeeId}" day="${asgn.day}" period="${asgn.period}" subject="${asgn.subject}" department="${asgn.department}" />\n`;
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
    subject: getAttr(el, "subject"),
    department: getAttr(el, "department")
  }));

  return { employees, departments, periodConfigs, assignments };
};