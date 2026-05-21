import { Routes, Route, Navigate } from "react-router-dom";
import Invoices from "./Invoices";
import Bills from "./Bills";
import ExpenseLog from "./ExpenseLog";

export default function AccountingLayout() {
  return (
    <Routes>
      <Route path="invoices" element={<Invoices />} />
      <Route path="bills" element={<Bills />} />
      <Route path="expenses" element={<ExpenseLog />} />
      <Route path="*" element={<Navigate to="invoices" replace />} />
    </Routes>
  );
}
