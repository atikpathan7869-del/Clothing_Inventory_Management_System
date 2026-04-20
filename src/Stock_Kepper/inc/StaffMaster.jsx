import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle, ThemeProvider, keyframes } from "styled-components";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { showError } from "../../../Services/sweetAlert";

/* ================= THEME & ANIMATIONS ================= */
const staffTheme = {
  body: "#F1F5F9",
  sidebar: "#0F172A",
  sidebarActive: "#10B981",
  header: "rgba(255, 255, 255, 0.8)",
  card: "#FFFFFF",
  textMain: "#1E293B",
  textMuted: "#64748B",
  border: "#E2E8F0",
  primary: "#10B981",
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
  /* Custom Scrollbar */
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
  box-shadow: 4px 0 20px rgba(0,0,0,0.1);
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
    min-width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  .brand-text {
    margin-left: 15px; color: white; font-weight: 800; font-size: 1.1rem;
    white-space: nowrap; opacity: ${p => (p.$open ? "1" : "0")};
    transition: 0.3s;
  }
`;

const SidebarBody = styled.nav`
  flex: 1; padding: 20px 0;
  overflow-y: auto;
  &::-webkit-scrollbar { display: none; }
`;

const NavLabel = styled.div`
  padding: 10px 25px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  display: ${p => (p.$open ? "block" : "none")};
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: #94A3B8;
  display: flex; align-items: center;
  padding: 12px 20px; margin: 4px 12px;
  border-radius: 12px; font-size: 0.9rem; font-weight: 500;
  transition: 0.3s all;
  
  i { min-width: 30px; font-size: 1.1rem; }
  
  &.active { 
    background: rgba(16, 185, 129, 0.1); 
    color: white;
    font-weight: 600;
    i { color: ${props => props.theme.sidebarActive}; }
  }
  &:hover:not(.active) { background: rgba(255,255,255,0.05); color: white; }
`;

const Header = styled.header`
  height: 70px;
  position: fixed; top: 0;
  left: ${p => (p.$open ? "260px" : "80px")};
  right: 0;
  background: ${props => props.theme.header};
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${props => props.theme.border};
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 30px; z-index: 997;
  transition: all 0.4s ease;
  @media(max-width: 768px) { left: 0; padding: 0 15px; }
`;

const SearchBar = styled.div`
  background: #F1F5F9;
  padding: 8px 15px;
  border-radius: 10px;
  display: flex; align-items: center;
  gap: 10px;
  width: 300px;
  border: 1px solid transparent;
  transition: 0.3s;
  &:focus-within { border-color: #10B981; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  input { border: none; background: none; outline: none; width: 100%; font-size: 0.85rem; }
  @media(max-width: 992px) { display: none; }
`;

const UserProfile = styled.div`
  display: flex; align-items: center; gap: 12px;
  cursor: pointer;
  padding: 5px 12px;
  border-radius: 12px;
  transition: 0.3s;
  &:hover { background: #F1F5F9; }
`;

const DropdownMenu = styled.div`
  position: absolute; top: 65px; right: 20px; width: 200px;
  background: white; border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border: 1px solid ${props => props.theme.border};
  padding: 8px; z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const DropItem = styled.div`
  padding: 10px 15px; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  font-size: 0.85rem; color: ${props => props.theme.textMain};
  &:hover { background: #ECFDF5; color: #10B981; }
  &.logout { color: #EF4444; &:hover { background: #FEF2F2; } }
`;

const MainContent = styled.main`
  margin-top: 70px; padding: 25px;
  margin-left: ${p => (p.$open ? "260px" : "80px")};
  transition: all 0.4s ease;
  min-height: calc(100vh - 70px);
  @media(max-width: 768px) { margin-left: 0; padding: 15px; }
`;

/* ================= COMPONENT LOGIC ================= */
export default function StaffMasterPage() {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState({ name: "Staff", role: "Stockkeeper" });
  
  const dropRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Auth Check
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      showError("Unauthorized", "Access denied. Please login.");
      navigate("/Staff/Login");
    } else {
      setUser(JSON.parse(savedUser));
    }

    // Live Clock Logic
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Click outside dropdown
    const closeDrop = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener("mousedown", closeDrop);

    return () => {
      clearInterval(timer);
      document.removeEventListener("mousedown", closeDrop);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/Staff/Login");
  };

  return (
    <ThemeProvider theme={staffTheme}>
      <GlobalStyle />
      
      {/* SIDEBAR */}
      <Sidebar $open={open} $mobileOpen={mobileOpen}>
        <SidebarBrand $open={open}>
          <div className="logo-icon"><i className="fas fa-boxes-stacked" /></div>
          <span className="brand-text">STOCK HUB</span>
        </SidebarBrand>

        <SidebarBody>
          <NavLabel $open={open}>Analytics</NavLabel>
          <StyledNavLink to="Dashboard">
            <i className="fas fa-chart-pie" /> {open && "Dashboard"}
          </StyledNavLink>

          <NavLabel $open={open}>Inventory Control</NavLabel>
          <StyledNavLink to="Product">
            <i className="fas fa-tags" /> {open && "Product Master"}
          </StyledNavLink>
           <StyledNavLink to="purchaseList">
            <i className="fas fa-bag-shopping" /> {open && "Purchase Master"}
          </StyledNavLink>
          <StyledNavLink to="Categories">
            <i className="fas fa-layer-group" /> {open && "Categories"}
          </StyledNavLink>
          <StyledNavLink to="Brand">
            <i className="fas fa-award" /> {open && "Brands"}
          </StyledNavLink>

          <NavLabel $open={open}>Stock Operations</NavLabel>
          <StyledNavLink to="Stock">
            <i className="fas fa-warehouse" /> {open && "Current Stock"}
          </StyledNavLink>
       
        {/* Low Stock Alert - Warning Icon */}
          <StyledNavLink to="LowStock">
            <i className="fas fa-exclamation-triangle"  /> 
            {open && <span style={{ marginLeft: '10px' }}>Low Stock Alert</span>}
          </StyledNavLink>

          {/* Available Stock - Box or Check Icon */}
          <StyledNavLink to="AvailableStock">
            <i className="fas fa-boxes" style={{ color: '#10b981' }} /> 
            {open && <span style={{ marginLeft: '10px' }}>Available Stock</span>}
          </StyledNavLink>
          <StyledNavLink to="Outwards">
            <i className="fas fa-dolly" /> {open && "Outwards"}
          </StyledNavLink>

          <NavLabel $open={open}>System</NavLabel>
          <StyledNavLink to="Reports">
            <i className="fas fa-file-chart-line" /> {open && "Reports"}
          </StyledNavLink>
          <StyledNavLink to="StockkeeperProfile">
            <i className="far fa-user-circle" /> {open && "Profile"}
          </StyledNavLink>
        </SidebarBody>
      </Sidebar>

      {/* HEADER */}
      <Header $open={open}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <i 
            className="fas fa-bars-staggered" 
            onClick={() => setOpen(!open)} 
            style={{ cursor: "pointer", fontSize: "1.2rem", color: "#64748B" }} 
          />
          <SearchBar>
            <i className="fas fa-search" style={{ color: "#94A3B8" }} />
            <input type="text" placeholder="Search Inventory (SKU, Name...)" />
          </SearchBar>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
          {/* Live Clock Display */}
          <div style={{ textAlign: "right", display: window.innerWidth < 600 ? "none" : "block" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#64748B", textTransform: 'uppercase' }}>
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>

          {/* User Profile */}
          <div ref={dropRef} style={{ position: "relative" }}>
            <UserProfile onClick={() => setDropdown(!dropdown)}>
              <div style={{ textAlign: 'right', display: window.innerWidth < 480 ? "none" : "block" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{user.name}</div>
                <div style={{ fontSize: "0.7rem", color: "#10B981", fontWeight: "600" }}>{user.role}</div>
              </div>
              <img 
                src={`https://ui-avatars.com/api/?name=${user.name}&background=10B981&color=fff&bold=true&rounded=true`} 
                alt="profile" 
                style={{ width: "38px", height: "38px", border: "2px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} 
              />
            </UserProfile>

            {dropdown && (
              <DropdownMenu>
                <div style={{ padding: '10px', borderBottom: `1px solid ${staffTheme.border}`, marginBottom: '5px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Signed in as</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.email || "staff@riverisland.com"}</div>
                </div>
                <DropItem onClick={() => navigate("/Staff/StockkeeperProfile")}><i className="far fa-user-circle" /> My Profile</DropItem>
                <DropItem onClick={() => navigate("/Staff/Settings")}><i className="fas fa-cog" /> Settings</DropItem>
                <DropItem className="logout" onClick={handleLogout}><i className="fas fa-power-off" /> Sign Out</DropItem>
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