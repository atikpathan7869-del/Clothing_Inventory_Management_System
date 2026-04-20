import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle, ThemeProvider, keyframes } from "styled-components";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { showError } from "../../../Services/sweetAlert";

/* ================= THEME & ANIMATIONS ================= */
const cashierTheme = {
  body: "#F8FAFC",
  sidebar: "#1E1B4B", // Deep Indigo for Cashier
  sidebarActive: "#7C3AED", // Vibrant Purple
  header: "rgba(255, 255, 255, 0.9)",
  card: "#FFFFFF",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  primary: "#7C3AED",
  success: "#10B981",
  danger: "#EF4444",
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: ${props => props.theme.body};
    color: ${props => props.theme.textMain};
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: #7C3AED; color: white; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
`;

/* ================= STYLED COMPONENTS ================= */
const Sidebar = styled.aside`
  position: fixed;
  top: 0; left: 0; height: 100vh;
  z-index: 1001;
  background: ${props => props.theme.sidebar};
  width: ${p => (p.$open ? "260px" : "80px")};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column;
  box-shadow: 10px 0 30px rgba(0,0,0,0.1);
  @media(max-width: 768px) {
    transform: ${p => (p.$mobileOpen ? "translateX(0)" : "translateX(-100%)")};
    width: 260px;
  }
`;

const SidebarBrand = styled.div`
  height: 80px;
  display: flex; align-items: center; 
  padding: 0 22px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  .logo-icon {
    background: ${props => props.theme.sidebarActive};
    min-width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 1.3rem;
    box-shadow: 0 8px 15px rgba(124, 58, 237, 0.3);
  }
  .brand-text {
    margin-left: 15px; color: white; font-weight: 800; font-size: 1.1rem;
    white-space: nowrap; opacity: ${p => (p.$open ? "1" : "0")};
    transition: 0.3s; letter-spacing: 1px;
  }
`;

const SidebarBody = styled.nav`
  flex: 1; padding: 25px 0;
  overflow-y: auto;
  &::-webkit-scrollbar { display: none; }
`;

const NavLabel = styled.div`
  padding: 15px 25px 8px;
  font-size: 0.65rem; font-weight: 800;
  color: #6366F1; text-transform: uppercase;
  letter-spacing: 1.5px;
  display: ${p => (p.$open ? "block" : "none")};
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: #94A3B8;
  display: flex; align-items: center;
  padding: 12px 20px; margin: 4px 15px;
  border-radius: 14px; font-size: 0.9rem; font-weight: 500;
  transition: 0.3s all ease;
  
  i { min-width: 32px; font-size: 1.1rem; opacity: 0.7; }
  
  &.active { 
    background: linear-gradient(45deg, #7C3AED, #6366F1);
    color: white; font-weight: 600;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
    i { opacity: 1; }
  }
  &:hover:not(.active) { background: rgba(255,255,255,0.08); color: white; }
`;

const Header = styled.header`
  height: 75px;
  position: fixed; top: 0;
  left: ${p => (p.$open ? "260px" : "80px")};
  right: 0;
  background: ${props => props.theme.header};
  backdrop-filter: blur(15px);
  border-bottom: 1px solid ${props => props.theme.border};
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 35px; z-index: 997;
  transition: all 0.4s ease;
  @media(max-width: 768px) { left: 0; padding: 0 15px; }
`;

const QuickActionBtn = styled.button`
  background: #7C3AED;
  color: white; border: none;
  padding: 10px 20px; border-radius: 10px;
  font-weight: 600; font-size: 0.85rem;
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; transition: 0.3s;
  &:hover { background: #6D28D9; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(124, 58, 237, 0.3); }
  @media(max-width: 600px) { span { display: none; } }
`;

const UserProfile = styled.div`
  display: flex; align-items: center; gap: 12px;
  cursor: pointer; padding: 6px 14px;
  border-radius: 14px; transition: 0.3s;
  background: #F1F5F9;
  &:hover { background: #E2E8F0; }
`;

const DropdownMenu = styled.div`
  position: absolute; top: 70px; right: 0; width: 220px;
  background: white; border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.12);
  border: 1px solid ${props => props.theme.border};
  padding: 10px; z-index: 1000;
  animation: ${fadeIn} 0.25s ease-out;
`;

const DropItem = styled.div`
  padding: 12px 15px; border-radius: 10px; cursor: pointer;
  display: flex; align-items: center; gap: 12px;
  font-size: 0.85rem; color: ${props => props.theme.textMain};
  transition: 0.2s;
  &:hover { background: #F5F3FF; color: #7C3AED; }
  &.logout { color: #EF4444; &:hover { background: #FEF2F2; } }
`;

const MainContent = styled.main`
  margin-top: 75px; padding: 30px;
  margin-left: ${p => (p.$open ? "260px" : "80px")};
  transition: all 0.4s ease;
  min-height: calc(100vh - 75px);
  @media(max-width: 768px) { margin-left: 0; padding: 15px; }
`;

/* ================= COMPONENT LOGIC ================= */
export default function CashierMasterPage() {
  const [open, setOpen] = useState(true);
  const [dropdown, setDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState({ name: "Cashier", role: "Sales Terminal" });
  
  const dropRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    // Auth Check Logic (Silent)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const closeDrop = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener("mousedown", closeDrop);

    return () => {
      clearInterval(timer);
      document.removeEventListener("mousedown", closeDrop);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/Staff/Portal");
  };

  return (
    <ThemeProvider theme={cashierTheme}>
      <GlobalStyle />
      
      {/* SIDEBAR */}
      <Sidebar $open={open}>
        <SidebarBrand $open={open}>
          <div className="logo-icon"><i className="fas fa-cash-register" /></div>
          <span className="brand-text">CASHIER POS</span>
        </SidebarBrand>

        <SidebarBody>
          <NavLabel $open={open}>Terminal</NavLabel>
           <StyledNavLink to="Deashboard">
            <i className="fas fas fa-th-large" /> {open && "Dashboard"}
          </StyledNavLink>
            
          <StyledNavLink to="CashierTerminal">
            <i className="fas fa-file-invoice-dollar" /> {open && "Quick Billing"}
          </StyledNavLink>
          
          <StyledNavLink to="SalesHistory">
            <i className="fas fa-history" /> {open && "Sales History"}
          </StyledNavLink>

          <NavLabel $open={open}>Inventory View</NavLabel>
          <StyledNavLink to="PriceStockCheck">
            <i className="fas fa-search-dollar" /> {open && "Price & Stock Check"}
          </StyledNavLink>

          <NavLabel $open={open}>Reports & Day-End</NavLabel>
          <StyledNavLink to="DailyCashReport">
            <i className="fas fa-calendar-check" /> {open && "Daily Cash Report"}
          </StyledNavLink>
          
          <StyledNavLink to="SalesReturns">
            <i className="fas fa-undo-alt" /> {open && "Sales Returns"}
          </StyledNavLink>
          <StyledNavLink to="SalesReturnHistory">
            <i className="fas fa-history" /> {open && "Sales Return History"}
          </StyledNavLink>
        

          <NavLabel $open={open}>Account</NavLabel>
          <StyledNavLink to="CashierProfile">
            <i className="fas fa-user-cog" /> {open && "Terminal Settings"}
          </StyledNavLink>
        </SidebarBody>
      </Sidebar>

      {/* HEADER */}
      <Header $open={open}>
        <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
          <i 
            className="fas fa-align-left" 
            onClick={() => setOpen(!open)} 
            style={{ cursor: "pointer", fontSize: "1.3rem", color: "#64748B" }} 
          />
          <QuickActionBtn onClick={() => navigate("CashierTerminal")}>
             <i className="fas fa-plus-circle" /> <span>New Invoice (F2)</span>
          </QuickActionBtn>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
          {/* Clock Display */}
          <div style={{ textAlign: "right", display: window.innerWidth < 700 ? "none" : "block" }}>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#1E1B4B" }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#7C3AED", fontWeight: "700", textTransform: 'uppercase' }}>
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>

          {/* User Profile */}
          <div ref={dropRef} style={{ position: "relative" }}>
            <UserProfile onClick={() => setDropdown(!dropdown)}>
              <img 
                src={`https://ui-avatars.com/api/?name=${user.name}&background=7C3AED&color=fff&bold=true&rounded=true`} 
                alt="profile" 
                style={{ width: "36px", height: "36px", borderRadius: "10px" }} 
              />
              <div style={{ textAlign: 'left', display: window.innerWidth < 480 ? "none" : "block" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: "750" }}>{user.name}</div>
                <div style={{ fontSize: "0.7rem", color: "#6366F1", fontWeight: "600" }}>Terminal #01</div>
              </div>
              <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', color: '#94A3B8' }} />
            </UserProfile>

            {dropdown && (
              <DropdownMenu>
                <DropItem onClick={() => navigate("/Cashier/CashierProfile")}><i className="far fa-id-badge" /> Profile Details</DropItem>
                <DropItem onClick={() => navigate("/Cashier/History")}><i className="fas fa-receipt" /> My Transactions</DropItem>
                <hr style={{ border: '0', borderTop: '1px solid #F1F5F9', margin: '8px 0' }} />
                <DropItem className="logout" onClick={handleLogout}><i className="fas fa-sign-out-alt" /> Close Session</DropItem>
              </DropdownMenu>
            )}
          </div>
        </div>
      </Header>

      {/* MAIN CONTENT AREA */}
      <MainContent $open={open}>
        <Outlet />
      </MainContent>
    </ThemeProvider>
  );
}