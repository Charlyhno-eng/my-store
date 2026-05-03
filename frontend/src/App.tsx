import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CheckoutPage from "./pages/CheckoutPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import ProductsPage from "./pages/ProductsPage";
import StoragePage from "./pages/StoragePage";

export default function App() {
  return (
    <Routes>
      <Route path="/"              element={<HomePage />} />
      <Route path="/checkout"      element={<CheckoutPage />} />
      <Route path="/sales-history" element={<SalesHistoryPage />} />
      <Route path="/products"      element={<ProductsPage />} />
      <Route path="/storage"       element={<StoragePage />} />
    </Routes>
  );
}
