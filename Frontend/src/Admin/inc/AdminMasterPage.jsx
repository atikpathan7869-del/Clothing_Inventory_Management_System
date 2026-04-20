import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { showError } from "../../../Services/sweetAlert";

/* ================= PROFESSIONAL IMS THEME ================= */
const lightTheme = {
  body: "#F4F7FE",
  sidebar: "#1B254B", 
  sidebarActive: "#FCE491", 
  sidebarHover: "rgba(252, 228, 145, 0.1)",
  header: "rgba(255, 255, 255, 0.9)",
  card: "#FFFFFF",
  textMain: "#1B254B",
  textMuted: "#A3AED0",
  border: "#E0E5F2",
  primary: "#4318FF",
  shadow: "14px 17px 40px 4px rgba(112, 144, 176, 0.08)",
};

const darkTheme = {
  body: "#0B1437",
  sidebar: "#111C44",
  sidebarActive: "#FCE491",
  sidebarHover: "rgba(255, 255, 255, 0.05)",
  header: "rgba(17, 28, 68, 0.8)",
  card: "#1B254B",
  textMain: "#FFFFFF",
  textMuted: "#707EAE",
  border: "#2B3674",
  primary: "#7551FF",
  shadow: "none",
};

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSE = 85;

/* ================= GLOBAL STYLES ================= */
const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: ${props => props.theme.body};
    color: ${props => props.theme.textMain};
    transition: all 0.25s ease;
    overflow: hidden;
    height: 100vh;
  }
`;

/* ================= STYLED COMPONENTS ================= */
const LayoutWrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
`;

const Sidebar = styled.aside`
  background: ${props => props.theme.sidebar};
  width: ${p => (p.$open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSE)}px;
  height: 100vh;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 1001;
  @media(max-width: 768px) {
    position: fixed;
    transform: ${p => (p.$mobileOpen ? "translateX(0)" : "translateX(-100%)")};
  }
`;

const SidebarBrand = styled.div`
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: ${p => p.$open ? 'flex-start' : 'center'};
  color: white;
  .title { font-size: 1.4rem; font-weight: 800; letter-spacing: 1px; color: #FFFFFF; text-transform: uppercase; }
  .subtitle { font-size: 0.7rem; color: #FCE491; letter-spacing: 2px; margin-top: 5px; opacity: 0.8; }
`;

const SidebarBody = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 0 15px;
  &::-webkit-scrollbar { width: 0; }
`;

const NavSectionLabel = styled.div`
  padding: 20px 20px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #707EAE;
  text-transform: uppercase;
  display: ${p => (p.$open ? "block" : "none")};
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: #A3AED0;
  display: flex;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 5px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  transition: 0.3s;

  i { min-width: 35px; font-size: 1.2rem; }
  
  &.active { 
    background: ${props => props.theme.sidebarActive}; 
    color: #1B254B; 
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
    i { color: #1B254B; }
  }
  &:hover:not(.active) { color: #FFFFFF; }
`;

const NavItemButton = styled.div`
  color: #A3AED0;
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  i { min-width: 35px; font-size: 1.2rem; }
  &:hover { color: #FFFFFF; }
`;

const SubMenu = styled.div`
  margin-left: 50px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 15px;
  border-left: 1px solid rgba(255,255,255,0.1);
  padding-left: 10px;
`;

const SubNavLink = styled(NavLink)`
  text-decoration: none;
  color: #707EAE;
  font-size: 0.85rem;
  font-weight: 500;
  transition: 0.2s;
  &:hover { color: #FCE491; }
  &.active { color: #FCE491; font-weight: 700; }
`;

const Header = styled.header`
  height: 80px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 30px;
  background: ${props => props.theme.header};
  border-bottom: 1px solid ${props => props.theme.border};
`;

const MainContent = styled.main`
  flex: 1; overflow-y: auto; padding: 25px;
`;

/* ================= MAIN COMPONENT ================= */
export default function AdminMasterPage() {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Logical Groupings for Dropdowns
  const [masterOpen, setMasterOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);

  const [dropdown, setDropdown] = useState(false);
  const dropRef = useRef();
  const Redirect = useNavigate();

  const handleToggle = () => {
    if (window.innerWidth <= 768) setMobileOpen(!mobileOpen);
    else setOpen(!open);
  };

  useEffect(() => {
    if (localStorage.getItem("adminId") == null) {
      showError("Unauthorized", "Please login to access");
      Redirect("/Admin/Login");
    }
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [Redirect]);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <LayoutWrapper>
        {mobileOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }} onClick={() => setMobileOpen(false)} />}

        <Sidebar $open={open} $mobileOpen={mobileOpen}>
          <SidebarBrand $open={open}>
            <div className="title">{open ? "RIVER ISLAND" : "RI"}</div>
            {open && <div className="subtitle">INVENTORY SYSTEM</div>}
          </SidebarBrand>

          <SidebarBody>
            <NavSectionLabel $open={open}>General</NavSectionLabel>
            <StyledNavLink to="Dashboard" onClick={() => setMobileOpen(false)}>
              <i className="fas fa-chart-line" />
              {open && "Dashboard"}
            </StyledNavLink>

            <NavSectionLabel $open={open}>Resources</NavSectionLabel>
            
            {/* MASTER DATA DROPDOWN */}
            <NavItemButton onClick={() => setMasterOpen(!masterOpen)}>
              <i className="fas fa-database" />
              {open && "Master Data"}
              {open && <i className={`fas fa-chevron-${masterOpen ? "down" : "right"}`} style={{ marginLeft: "auto", fontSize: "0.7rem" }} />}
            </NavItemButton>
            {masterOpen && open && (
              <SubMenu>
                <SubNavLink to="Vendors" onClick={() => setMobileOpen(false)}>Vendors</SubNavLink>
                <SubNavLink to="Categories" onClick={() => setMobileOpen(false)}>Categories</SubNavLink>
                <SubNavLink to="Brand" onClick={() => setMobileOpen(false)}>Brands</SubNavLink>
                <SubNavLink to="FinancialYear" onClick={() => setMobileOpen(false)}>Financial Year</SubNavLink>
              </SubMenu>
            )}

            {/* STOCK MANAGEMENT DROPDOWN */}
            <NavItemButton onClick={() => setStockOpen(!stockOpen)}>
              <i className="fas fa-boxes-stacked" />
              {open && "Stock Management"}
              {open && <i className={`fas fa-chevron-${stockOpen ? "down" : "right"}`} style={{ marginLeft: "auto", fontSize: "0.7rem" }} />}
            </NavItemButton>
            {stockOpen && open && (
              <SubMenu>
                <SubNavLink to="Product" onClick={() => setMobileOpen(false)}>Product List</SubNavLink>
                <SubNavLink to="Stock" onClick={() => setMobileOpen(false)}>Current Stock</SubNavLink>
                <SubNavLink to="AvailableStock" onClick={() => setMobileOpen(false)}>Availability</SubNavLink>
                <SubNavLink to="LowStock" onClick={() => setMobileOpen(false)}>Low Stock Alerts</SubNavLink>
              </SubMenu>
            )}

            <NavSectionLabel $open={open}>Operations</NavSectionLabel>
            
            <StyledNavLink to="purchaseList" onClick={() => setMobileOpen(false)}>
              <i className="fas fa-cart-shopping" />
              {open && "Purchase Orders"}
            </StyledNavLink>

            {/* FINANCIALS DROPDOWN */}
            <NavItemButton onClick={() => setFinanceOpen(!financeOpen)}>
              <i className="fas fa-file-invoice-dollar" />
              {open && "Financials"}
              {open && <i className={`fas fa-chevron-${financeOpen ? "down" : "right"}`} style={{ marginLeft: "auto", fontSize: "0.7rem" }} />}
            </NavItemButton>
            {financeOpen && open && (
              <SubMenu>
                <SubNavLink to="ReceiptInvoice" onClick={() => setMobileOpen(false)}>Invoices</SubNavLink>
                <SubNavLink to="SalesReturn" onClick={() => setMobileOpen(false)}>Sales Return</SubNavLink>
              </SubMenu>
            )}

            <NavSectionLabel $open={open}>Administration</NavSectionLabel>
            <StyledNavLink to="StaffDetails" onClick={() => setMobileOpen(false)}>
              <i className="fas fa-users-gear" />
              {open && "Staff Control"}
            </StyledNavLink>
            <StyledNavLink to="Outward" onClick={() => setMobileOpen(false)}>
              <i className="fas fa-dolly" />
              {open && "Outward"}
            </StyledNavLink>

            <StyledNavLink to="Settings" onClick={() => setMobileOpen(false)}>
              <i className="fas fa-sliders" />
              {open && "System Settings"}
            </StyledNavLink>
          </SidebarBody>
        </Sidebar>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button onClick={handleToggle} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: isDarkMode ? 'white' : '#1B254B' }}>
                <i className="fas fa-bars-staggered" />
              </button>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Admin Panel</h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <i className={isDarkMode ? "fas fa-sun" : "fas fa-moon"} onClick={() => setIsDarkMode(!isDarkMode)} style={{ cursor: 'pointer', fontSize: '1.2rem' }} />
              
              <div ref={dropRef} style={{ position: "relative", display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setDropdown(!dropdown)}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>{localStorage.getItem("adminFullName")}</div>
                    <div style={{ fontSize: '0.65rem', color: '#707EAE' }}>Super Admin</div>
                </div>
                <img src={`https://ui-avatars.com/api/?name=${localStorage.getItem("adminFullName")}&background=1B254B&color=fff&bold=true`} style={{ width: "42px", borderRadius: "12px", border: '2px solid #E0E5F2' }} alt="profile" />
                {dropdown && (
                  <div style={{ position: "absolute", top: "55px", right: 0, width: "160px", background: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", borderRadius: "12px", overflow: "hidden", zIndex: 10, border: '1px solid #E0E5F2' }}>
                    <div onClick={() => { localStorage.clear(); Redirect("/Admin/Login"); }} style={{ padding: "15px", color: "#FF4444", fontSize: "0.9rem", fontWeight: '600' }}>
                        <i className="fas fa-power-off" style={{ marginRight: '10px' }} /> Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Header>

          <MainContent>
            <Outlet />
          </MainContent>
        </div>
      </LayoutWrapper>
    </ThemeProvider>
  );
}