import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createContext, useState } from "react";

// Admin Imports
import AdminMasterPage from "./Admin/inc/AdminMasterPage";
import Dashboard from "./Admin/Deashboard";
import Categories from "./Admin/Categories";
import Product from "./Admin/Product";
import Brand from "./Admin/Brand";
import AdminLogin from "./Admin/AdminLogin";
import AdminSettings from "./Admin/AdminSetting";
import Vendors from "./Admin/Vendors";
import FinancialYear from "./Admin/FinancialYear";
import Purchase from "./Admin/purchas";
import ReceiptInvoice from "./Admin/ReceiptInvoice";
import VendorBalanceSheet from "./Admin/VendorBalanceSheet";

// Common & Misc Imports
import PleaseWait from "./Common/PleaseWait";
import TikzarWelcome from "./TikzarWelcome";
import StaffPortalSelection from "./StaffPortalSelection"; // Naya Selection Page
import NotFound from "./Common/NotFound";
import Stock from "./Admin/StockMaster";
import PurchaseListPage from "./Admin/purchaseList";
import PurchaseDetailsPage from "./Admin/PurchaseDetails";
import PurchaseDetails_Indvidual from "./Admin/PurchaseDetails_Indvidual";
import SalesReturn from "./Admin/SalesReturn";
import StockAdjustmentPage from "./Admin/StockAdjustmentPage";
import LowStockPage from "./Admin/LowStockPage";

// Staff/Stockkeeper & Cashier Imports
import StockkeeperLogin from "./Stock_Kepper/StaffLogin"; // Aapka renamed/updated Stockkeeper Login
import CashierLogin from "./Chasier/CashierLogin"; // Aapka naya Cashier Login
import StaffMaster from "./Stock_Kepper/inc/StaffMaster";
import StaffDashboard from "./Stock_Kepper/StaffDashboard";
import StaffDetails from "./Admin/StaffDetails";
import StaffReports from "./Stock_Kepper/StaffReports";
import StockkeeperPurchaseList from "./Stock_Kepper/StockkeeperPurchaseList";
import StockkeeperPurchaseForm from "./Stock_Kepper/StockkeeperPurchaseForm";
import StockkeeperPurchaseView from "./Stock_Kepper/StockkeeperPurchaseView";
import CashierMasterPage from "./Chasier/inc/CashierMasterPage";
import CashierDashboard from "./Chasier/CashierDashboard";
import ReceiptMaster from "./Admin/ReceiptInvoice";
import SalesHistory from "./Chasier/SalesHistory";
import PriceStockCheck from "./Chasier/PriceStockCheck";
import DailyCashReport from "./Chasier/DailyCashReport";
import CashierProfile from "./Chasier/CashierProfile";
import StockkeeperProfile from "./Stock_Kepper/StockkeeperProfile";
import ChasierSalesReturn from "./Chasier/SalesReturn";
import SalesReturnHistory from "./Chasier/SalesReturnHistory";
import CashierTerminal from "./Chasier/CashierTerminal";
import FullSystemBackup from "./Chasier/C_SystemBackup";
import AvailableStockPage from "./Admin/AvailableStockPage";
import GenerateBarcodePage from "./Admin/GenerateBarcodePage";
import AvailableStock from "./Stock_Kepper/StockkepperAvailableStock";
import GenerateBarcode from "./Stock_Kepper/Genrate_Barcode";
import Outward from "./Admin/Outward";
import Outward_S from "./Stock_Kepper/Outword";
import Categories_stockkepper from "./Stock_Kepper/StockkepperCategory";
import Brand_stockkepper from "./Stock_Kepper/Stockkepper_Brand";
import Product_Stockkepper from "./Stock_Kepper/Stockkepper_product";
import StockMasterPage_stockkepper from "./Stock_Kepper/Stockkepper_Stockmaster";

// eslint-disable-next-line react-refresh/only-export-components
export const rootContext = createContext();

function App() {
  const [loading, setloading] = useState(false);

  return (
    <rootContext.Provider value={{ setloading }}>
      <BrowserRouter>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<TikzarWelcome />} />
          <Route path="/Admin/Login" element={<AdminLogin />} />

          {/* Staff Selection Route */}
          <Route path="/Staff/Portal" element={<StaffPortalSelection />} />

          {/* Specific Login Routes */}
          <Route path="/Staff/Login/Stockkeeper" element={<StockkeeperLogin />} />
          <Route path="/Staff/Login/Cashier" element={<CashierLogin />} />

          {/* ================= ADMIN PANEL (Private) ================= */}
          <Route path="/Admin" element={<AdminMasterPage />}>
            <Route index element={<Navigate to="/Admin/Dashboard" />} />
            <Route path="Dashboard" element={<Dashboard />} />
            <Route path="Categories" element={<Categories />} />
            <Route path="Brand" element={<Brand />} />
            <Route path="Product" element={<Product />} />
            <Route path="Settings" element={<AdminSettings />} />
            <Route path="Vendors" element={<Vendors />} />
            <Route path="FinancialYear" element={<FinancialYear />} />
            <Route path="Purchase" element={<Purchase />} />
            <Route path="PurchaseDetails" element={<PurchaseDetailsPage />} />
            <Route path="PurchaseDetails_ind/:id" element={<PurchaseDetails_Indvidual />} />
            <Route path="ReceiptInvoice" element={<ReceiptInvoice />} />
            <Route path="VendorBalanceSheet" element={<VendorBalanceSheet />} />
            <Route path="purchaseList" element={<PurchaseListPage />} />
            <Route path="Stock" element={<Stock />} />
            <Route path="SalesReturn" element={<SalesReturn />} />
            <Route path="StockAdjustment" element={<StockAdjustmentPage />} />
            <Route path="LowStock" element={<LowStockPage />} />
            <Route path="StaffDetails" element={<StaffDetails />} />
            <Route path="StaffManagement" element={<StaffMaster />} />
            <Route path="AvailableStock" element={<AvailableStockPage />} />
            <Route path="generate-barcode" element={<GenerateBarcodePage />} />
            <Route path="Outward" element={<Outward />} />
          </Route>

          {/* ================= STOCKKEEPER PANEL (Private) ================= */}
          <Route path="/Staff" element={<StaffMaster />}>
            <Route index element={<Navigate to="Dashboard" />} />
            <Route path="Categories" element={<Categories_stockkepper />} />
            <Route path="Brand" element={<Brand_stockkepper />} />
            <Route path="Product" element={<Product_Stockkepper />} />
            <Route path="Dashboard" element={<StaffDashboard />} />
            <Route path="LowStock" element={<LowStockPage />} />
            <Route path="Stock" element={<StockMasterPage_stockkepper />} />
            <Route path="Reports" element={<StaffReports />} />
            <Route path="purchaseList" element={<StockkeeperPurchaseList />} />
            <Route path="StockkeeperPurchaseForm" element={<StockkeeperPurchaseForm />} />
            <Route path="StockkeeperPurchaseView/:id" element={<StockkeeperPurchaseView />} />
            <Route path="StockkeeperProfile" element={<StockkeeperProfile />} />
            <Route path="AvailableStock" element={<AvailableStock />} />
            <Route path="GenerateBarcode" element={<GenerateBarcode />} />
            <Route path="Outwards" element={<Outward_S />} />
           
          </Route>

          {/* ================= CASHIER PANEL (Private) ================= */}
          {/* Aap yahan Cashier ke liye bhi StaffMaster layout use kar sakte hain 
              ya alag Master page bana sakte hain */}
          <Route path="/Cashier" element={<CashierMasterPage />}>
            <Route index element={<Navigate to="Deashboard" />} />
            <Route path="Deashboard" element={<CashierDashboard />} />
            <Route path="ReceiptInvoice" element={<ReceiptInvoice />} />
            <Route path="SalesHistory" element={<SalesHistory />} />
            <Route path="PriceStockCheck" element={<PriceStockCheck />} />
            <Route path="DailyCashReport" element={<DailyCashReport />} />
            <Route path="SalesReturn" element={<SalesReturn />} />
            <Route path="CashierProfile" element={<CashierProfile />} />
            <Route path="SalesReturns" element={<ChasierSalesReturn />} />
            <Route path="SalesReturnHistory" element={<SalesReturnHistory />} />
            <Route path="CashierTerminal" element={<CashierTerminal />} />
            <Route path="Backup" element={<FullSystemBackup />} />
            
           
          
          </Route>

          {/* ================= 404 CATCH-ALL ================= */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
      <PleaseWait show={loading} />
    </rootContext.Provider>
  );
}

export default App;