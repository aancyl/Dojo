import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import MembersPage from "@/pages/MembersPage";
import POSPage from "@/pages/POSPage";
import SchedulePage from "@/pages/SchedulePage";
import ProfitLossPage from "@/pages/ProfitLossPage";
import AttendancePage from "@/pages/AttendancePage";
import PettyCashPage from "@/pages/PettyCashPage";
import TrainersPage from "@/pages/TrainersPage";
import InventoryPage from "@/pages/InventoryPage";
import MembershipsPage from "@/pages/MembershipsPage";
import GradingPage from "@/pages/GradingPage";
import FinanceLedgerPage from "@/pages/FinanceLedgerPage";
import IncomePage from "@/pages/IncomePage";
import ExpensePage from "@/pages/ExpensePage";
import BalanceSheetPage from "@/pages/BalanceSheetPage";
import ReportsPage from "@/pages/ReportsPage";
import ClassesPage from "@/pages/ClassesPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

const AppRoutes = () => {
  const { currentUser } = useApp();

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/memberships" element={<ProtectedRoute><MembershipsPage /></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
      <Route path="/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
      <Route path="/trainers" element={<ProtectedRoute><TrainersPage /></ProtectedRoute>} />
      <Route path="/grading" element={<ProtectedRoute><GradingPage /></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute><FinanceLedgerPage /></ProtectedRoute>} />
        <Route path="/income" element={<ProtectedRoute><IncomePage /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><ExpensePage /></ProtectedRoute>} />
        <Route path="/petty-cash" element={<ProtectedRoute><PettyCashPage /></ProtectedRoute>} />

      <Route path="/pnl" element={<ProtectedRoute><ProfitLossPage /></ProtectedRoute>} />

      <Route path="/balance-sheet" element={<ProtectedRoute><BalanceSheetPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/parent-portal" element={<ProtectedRoute><PlaceholderPage title="Parent Portal" /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
