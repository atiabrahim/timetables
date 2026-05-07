import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";

const Login = () => {
  const { t, login, isRTL } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"Admin" | "Teacher" | "Student">("Admin");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      login(username, role);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-4">
      <Card className="w-full max-w-md border-emerald-100 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="text-emerald-600" size={32} />
          </div>
          <CardTitle className="text-3xl font-bold text-emerald-900">{t.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-700">{t.username}</label>
              <Input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.username}
                className="border-emerald-200 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-700">{t.role}</label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger className="border-emerald-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">{t.admin}</SelectItem>
                  <SelectItem value="Teacher">{t.teacher}</SelectItem>
                  <SelectItem value="Student">{t.student}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg rounded-xl">
              {t.login}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;