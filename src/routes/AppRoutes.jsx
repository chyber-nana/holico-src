import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import VotingPage from "../pages/VotingPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/admin/DashboardPage";
import NomineesPage from "../pages/admin/NomineesPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../components/layout/AdminLayout";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import PendingPaymentsPage from "../pages/admin/PendingPaymentsPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/vote" element={<VotingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="nominees" element={<NomineesPage />} />
      <Route path="categories" element={<AdminCategoriesPage />} />
      <Route path="pending-payments" element={<PendingPaymentsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;