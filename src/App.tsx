import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Schedule from "./pages/Schedule";
import MasterSchedule from "./pages/MasterSchedule";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import ReportsNew from "./pages/ReportsNew";
import Lessons from "./pages/Lessons";
import Login from "./pages/Login";
import Rooms from "./pages/Rooms";
import Institution from "./pages/Institution";
import WeeklyWorkSchedule from "./pages/WeeklyWorkSchedule";
import MasterClassesSchedule from "./pages/MasterClassesSchedule";
import Assignments from "./pages/Assignments";
import AutoGenerator from "./pages/AutoGenerator";
import Constraints from "./pages/Constraints";
import ClassConstraints from "./pages/ClassConstraints";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// مكون لحماية المسارات
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<ProtectedRoute><Layout><Index /></Layout></ProtectedRoute>} />
    <Route path="/employees" element={<ProtectedRoute><Layout><Employees /></Layout></ProtectedRoute>} />
    <Route path="/classes" element={<ProtectedRoute><Layout><Classes /></Layout></ProtectedRoute>} />
    <Route path="/subjects" element={<ProtectedRoute><Layout><Subjects /></Layout></ProtectedRoute>} />
    <Route path="/rooms" element={<ProtectedRoute><Layout><Rooms /></Layout></ProtectedRoute>} />
    <Route path="/lessons" element={<ProtectedRoute><Layout><Lessons /></Layout></ProtectedRoute>} />
    <Route path="/schedule" element={<ProtectedRoute><Layout><Schedule /></Layout></ProtectedRoute>} />
    <Route path="/master-schedule" element={<ProtectedRoute><Layout><MasterSchedule /></Layout></ProtectedRoute>} />
    <Route path="/work-schedule" element={<ProtectedRoute><Layout><WeeklyWorkSchedule /></Layout></ProtectedRoute>} />
    <Route path="/master-classes-schedule" element={<ProtectedRoute><Layout><MasterClassesSchedule /></Layout></ProtectedRoute>} />
    <Route path="/assignments" element={<ProtectedRoute><Layout><Assignments /></Layout></ProtectedRoute>} />
    <Route path="/auto-generator" element={<ProtectedRoute><Layout><AutoGenerator /></Layout></ProtectedRoute>} />
    <Route path="/constraints" element={<ProtectedRoute><Layout><Constraints /></Layout></ProtectedRoute>} />
    <Route path="/class-constraints" element={<ProtectedRoute><Layout><ClassConstraints /></Layout></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
    <Route path="/reports-new" element={<ProtectedRoute><Layout><ReportsNew /></Layout></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
    <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
    <Route path="/institution" element={<ProtectedRoute><Layout><Institution /></Layout></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;