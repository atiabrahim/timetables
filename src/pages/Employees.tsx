import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Plus, Edit2, Trash2, FileSpreadsheet, UserCircle } from "lucide-react";
import { exportToExcel } from "../lib/export-utils";
import EmployeeModal from "../components/EmployeeModal";
import { cn } from "@/lib/utils";

const Employees = () => {
  const { t, employees, setEmployees, isRTL } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const handleEdit = (emp: any) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-emerald-900">{t.employees}</h2>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-emerald-400", isRTL ? "right-3" : "left-3")} size={18} />
            <Input 
              placeholder={t.search} 
              className={cn("border-emerald-200 focus:ring-emerald-500 rounded-xl", isRTL ? "pr-10" : "pl-10")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-emerald-200 text-emerald-700 rounded-xl" onClick={() => exportToExcel(employees, "Employees")}>
            <FileSpreadsheet size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {t.exportExcel}
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-100" onClick={handleAdd}>
            <Plus size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {t.addEmployee}
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-emerald-600">
              <TableRow className="hover:bg-emerald-600 border-none">
                <TableHead className="text-white font-bold h-14">{t.firstName}</TableHead>
                <TableHead className="text-white font-bold h-14">{t.lastName}</TableHead>
                <TableHead className="text-white font-bold h-14">{t.category}</TableHead>
                <TableHead className="text-white font-bold h-14">{t.observation}</TableHead>
                <TableHead className="text-white font-bold text-center h-14">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-emerald-50/50 border-emerald-50">
                  <TableCell className="font-semibold text-emerald-900">
                    <div className="flex items-center gap-2">
                      <UserCircle className="text-emerald-200" size={20} />
                      {emp.firstName}
                    </div>
                  </TableCell>
                  <TableCell className="text-emerald-800">{emp.lastName}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      emp.category === "Full-time" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {emp.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-emerald-500 italic text-sm">{emp.observation}</TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-emerald-600 hover:bg-emerald-100 rounded-full"
                        onClick={() => handleEdit(emp)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:bg-red-50 rounded-full"
                        onClick={() => handleDelete(emp.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        employee={selectedEmployee} 
      />
    </div>
  );
};

export default Employees;