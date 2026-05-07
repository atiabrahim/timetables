import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Plus, Edit2, Trash2, FileSpreadsheet } from "lucide-react";
import { exportToExcel } from "../lib/export-utils";

const Employees = () => {
  const { t, employees, setEmployees, isRTL } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  const handleExport = () => {
    exportToExcel(employees, "Employees_List");
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
              className={cn("border-emerald-200", isRTL ? "pr-10" : "pl-10")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-emerald-200 text-emerald-700" onClick={handleExport}>
            <FileSpreadsheet size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {t.exportExcel}
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {t.addEmployee}
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-emerald-50">
              <TableRow>
                <TableHead className="text-emerald-900 font-bold">{t.firstName}</TableHead>
                <TableHead className="text-emerald-900 font-bold">{t.lastName}</TableHead>
                <TableHead className="text-emerald-900 font-bold">{t.category}</TableHead>
                <TableHead className="text-emerald-900 font-bold">{t.observation}</TableHead>
                <TableHead className="text-emerald-900 font-bold text-center">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-emerald-50/30">
                  <TableCell className="font-medium">{emp.firstName}</TableCell>
                  <TableCell>{emp.lastName}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {emp.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-emerald-600 italic">{emp.observation}</TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                      <Button variant="ghost" size="icon" className="text-emerald-600 hover:bg-emerald-100">
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600 hover:bg-red-100"
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
    </div>
  );
};

import { cn } from "@/lib/utils";
export default Employees;