import React from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import { exportToPdf } from "../lib/export-utils";

const Timetable = () => {
  const { t, isRTL, data } = useApp();
  const periods = ["Morning", "Afternoon"];
  const days = t.days;

  const handleExport = () => {
    const headers = ["Day", ...periods];
    const body = days.map((day: string, dayIdx: number) => {
      return [
        day,
        ...periods.map(p => {
          const config = data?.periodConfigs?.find((c: any) => c.day === dayIdx && c.period === p);
          return config?.isActive ? "Active" : "-";
        })
      ];
    });
    exportToPdf(headers, body, t.timetable);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-emerald-900">{t.timetable}</h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline" className="border-emerald-200 text-emerald-700" onClick={handleExport}>
            <FileDown size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {t.exportPdf}
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Printer size={18} className={isRTL ? "ml-2" : "mr-2"} />
            Print
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-emerald-600 text-white">
                  <th className="p-4 text-start border-b border-emerald-500">{isRTL ? "اليوم" : "Day"}</th>
                  {periods.map(p => (
                    <th key={p} className="p-4 text-center border-b border-emerald-500">
                      {t[p.toLowerCase() as keyof typeof t]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day: string, dayIdx: number) => (
                  <tr key={day} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="p-4 font-bold text-emerald-900 border-b border-emerald-100 bg-emerald-50/30">
                      {day}
                    </td>
                    {periods.map(p => {
                      const config = data?.periodConfigs?.find((c: any) => c.day === dayIdx && c.period === p);
                      return (
                        <td key={p} className="p-4 border-b border-emerald-100 text-center">
                          {config?.isActive ? (
                            <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl border border-emerald-200 shadow-sm">
                              <p className="text-xs font-bold uppercase tracking-wider mb-1">Session</p>
                              <p className="text-sm">Available</p>
                            </div>
                          ) : (
                            <span className="text-emerald-200">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timetable;