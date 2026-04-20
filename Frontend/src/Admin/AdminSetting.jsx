import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { 
  User, Shield, Database, Save, Key, 
  FileSpreadsheet, DownloadCloud, Activity, Lock, Globe, LogOut, ChevronRight, CheckCircle, ShoppingBag, CreditCard, Truck, FileText
} from "lucide-react";

// Services
import { getRequest, putRequest } from "../../Services/apiService";
import { showToast, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

// Export Utils
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= STYLED COMPONENTS (Optimized for IMS) ================= */
const Layout = styled.div`
  display: flex;
  height: 100vh; 
  overflow: hidden; 
  background: #f4f7fe;
  font-family: 'Inter', sans-serif;
`;

const Sidebar = styled.aside`
  width: 260px; 
  background: #ffffff;
  padding: 25px 18px;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid #e0e5f2;
  flex-shrink: 0;
`;

const BrandSection = styled.div`
  margin-bottom: 35px;
  padding-left: 10px;
  h2 { font-size: 22px; font-weight: 900; color: #1b2559; margin: 0; }
  p { font-size: 11px; color: #a3aed0; font-weight: 600; }
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px; 
  border-radius: 15px;
  cursor: pointer;
  transition: 0.2s ease;
  font-weight: 700;
  font-size: 14px;
  color: ${p => p.$active ? '#ffffff' : '#a3aed0'};
  background: ${p => p.$active ? 'linear-gradient(135deg, #4318ff 0%, #5e3aff 100%)' : 'transparent'};

  .label-group { display: flex; align-items: center; gap: 10px; }
  &:hover {
    background: ${p => p.$active ? '' : '#f7f9ff'};
    color: ${p => p.$active ? '#ffffff' : '#4318ff'};
  }
`;

const MainContainer = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; 
  padding: 25px 30px;
`;

const HeaderCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 15px 25px; 
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0px 10px 30px rgba(112, 144, 176, 0.05);
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  .avatar {
    width: 45px; height: 45px; 
    background: #f4f7fe;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: #4318ff; font-size: 18px; font-weight: 800;
  }
  .info {
    h3 { margin: 0; color: #1b2559; font-size: 18px; display: flex; align-items: center; gap: 6px; }
    p { margin: 0; color: #a3aed0; font-size: 12px; font-weight: 600; }
  }
`;

const ContentCard = styled.div`
  background: #ffffff;
  border-radius: 25px;
  padding: 30px;
  box-shadow: 0px 10px 30px rgba(112, 144, 176, 0.05);
  flex: 1; 
`;

const SectionTitle = styled.div`
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 12px;
  .icon-wrapper { padding: 10px; background: #f4f7fe; border-radius: 12px; color: #4318ff; }
  h4 { margin: 0; font-size: 18px; color: #1b2559; }
  p { margin: 0; font-size: 13px; color: #a3aed0; }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex; flex-direction: column; gap: 6px;
  label { font-size: 12px; font-weight: 800; color: #1b2559; text-transform: uppercase; }
  input {
    padding: 12px 16px; border-radius: 12px; border: 1.5px solid #e0e5f2;
    font-size: 14px; font-weight: 600; color: #1b2559;
    &:focus { border-color: #4318ff; outline: none; }
    &:disabled { background: #f8fafc; color: #a3aed0; }
  }
`;

const PrimaryBtn = styled.button`
  background: #4318ff; color: white; border: none;
  padding: 12px 30px; border-radius: 12px; font-weight: 700;
  cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px;
  margin-top: 25px;
  &:hover { box-shadow: 0px 10px 20px rgba(67, 24, 255, 0.2); transform: translateY(-1px); }
`;

const SignOutBtn = styled.button`
  padding: 10px 20px; border-radius: 12px; border: none;
  background: #fff5f5; color: #ee5d50; font-weight: 700; font-size: 13px;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  &:hover { background: #ee5d50; color: white; }
`;

const BackupItem = styled.div`
  background: #f4f7fe; padding: 20px; border-radius: 20px; border: 1px solid #e0e5f2;
  .header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; font-weight: 800; color: #1b2559; }
  .btn-row { display: flex; gap: 10px; }
`;

const MiniActionBtn = styled.button`
  flex: 1; padding: 10px; border-radius: 10px; border: none; font-size: 12px; font-weight: 700; cursor: pointer;
  background: ${p => p.$pdf ? '#fee2e2' : '#ffffff'};
  color: ${p => p.$pdf ? '#ee5d50' : '#1b2559'};
  box-shadow: ${p => p.$pdf ? 'none' : '0 4px 6px rgba(0,0,0,0.02)'};
`;

/* ================= MAIN COMPONENT ================= */
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const adminId = localStorage.getItem("adminId");
  const [profile, setProfile] = useState({ id: adminId, full_Name: "", contact_No: "", email: "" });

  useEffect(() => {
    const init = async () => {
      if (!adminId) return;
      try {
        setLoading(true);
        const res = await getRequest(`Admin/GetAdminById/${adminId}`);
        if (res.status === "OK") setProfile(res.result);
      } catch (err) { showError("Sync Error", "Server connection failed"); }
      finally { setLoading(false); }
    };
    init();
  }, [adminId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await putRequest("Admin/ChangeProfile", profile);
      showToast("success", "Profile Updated");
    } catch (ex) { showError("Error", ex.message); }
    finally { setLoading(false); }
  };

  const handleExport = async (endpoint, fileName, type) => {
    setLoading(true);
    try {
      const res = await getRequest(endpoint);
      const data = res.result || res.data || res;
      if (type === 'excel') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, `RI_${fileName}.xlsx`);
      } else {
        const doc = new jsPDF('l', 'mm', 'a4');
        autoTable(doc, { head: [Object.keys(data[0])], body: data.map(obj => Object.values(obj)) });
        doc.save(`RI_${fileName}.pdf`);
      }
      showToast("success", "File Downloaded");
    } catch (err) { showError("Export Error", err.message); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <PleaseWait show={loading} />
      
      <Sidebar>
        <BrandSection>
          <h2>IMS Master</h2>
          <p>River Island Enterprise</p>
        </BrandSection>

        <NavList>
          <NavItem $active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
            <div className="label-group"><User size={18}/> Profile Hub</div>
            <ChevronRight size={14} opacity={activeTab === 'profile' ? 1 : 0}/>
          </NavItem>
          <NavItem $active={activeTab === 'backup'} onClick={() => setActiveTab('backup')}>
            <div className="label-group"><Database size={18}/> Cloud Backup</div>
            <ChevronRight size={14} opacity={activeTab === 'backup' ? 1 : 0}/>
          </NavItem>
          <NavItem $active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
            <div className="label-group"><Shield size={18}/> Security & Auth</div>
            <ChevronRight size={14} opacity={activeTab === 'security' ? 1 : 0}/>
          </NavItem>
        </NavList>

        <div style={{ marginTop: 'auto', padding: '15px', background: '#f4f7fe', borderRadius: '15px', textAlign: 'center' }}>
            <Globe size={20} color="#4318ff" style={{ marginBottom: '5px' }} />
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#1b2559' }}>SYSTEM V2.4</p>
        </div>
      </Sidebar>

      <MainContainer>
        <HeaderCard>
          <UserProfile>
            <div className="avatar">{profile.full_Name ? profile.full_Name.charAt(0) : 'A'}</div>
            <div className="info">
              <h3>{profile.full_Name || "Atik Pathan"} <CheckCircle size={16} color="#01b574" fill="#e6fff1"/></h3>
              <p>Primary Administrator • ID: #RI-{adminId || '1'}</p>
            </div>
          </UserProfile>
          <SignOutBtn onClick={() => { localStorage.clear(); window.location.href="/"; }}>
            <LogOut size={16}/> Sign Out
          </SignOutBtn>
        </HeaderCard>

        <ContentCard>
          {activeTab === 'profile' && (
            <div>
              <SectionTitle>
                <div className="icon-wrapper"><Activity size={20}/></div>
                <div><h4>Identity Management</h4><p>Maintain your official administrative credentials.</p></div>
              </SectionTitle>
              <form onSubmit={handleUpdate}>
                <FormGrid>
                  <InputGroup><label>Full Legal Name</label><input value={profile.full_Name} onChange={e => setProfile({...profile, full_Name: e.target.value})} /></InputGroup>
                  <InputGroup><label>Official Contact</label><input value={profile.contact_No} onChange={e => setProfile({...profile, contact_No: e.target.value})} /></InputGroup>
                  <InputGroup style={{ gridColumn: '1 / -1' }}><label>System Registered Email</label><input value={profile.email} disabled /></InputGroup>
                </FormGrid>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <PrimaryBtn type="submit"><Save size={18}/> Save Changes</PrimaryBtn>
                </div>
              </form>
            </div>
          )}

         // Pehle wale code mein activeTab === 'backup' wale section ko isse replace karein

{activeTab === 'backup' && (
  <div style={{ animation: 'fadeIn 0.5s ease' }}>
    <SectionTitle>
      <div className="icon-wrapper"><DownloadCloud size={20}/></div>
      <div>
        <h4>Data Sovereignty & Archive</h4>
        <p>Generate real-time encrypted backups for all system modules.</p>
      </div>
    </SectionTitle>

    {/* Responsive Grid for All Backups */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
      gap: '20px', 
      marginTop: '20px' 
    }}>
      
      {/* 1. Product Catalog Backup */}
      <BackupItem>
        <div className="header">
          <ShoppingBag size={18} color="#4318ff"/> 
          <span>Product Catalog</span>
        </div>
        <div className="btn-row">
          <MiniActionBtn onClick={() => handleExport("Product/GetAllProducts", "Products", "excel")}>
            <FileSpreadsheet size={14}/> Excel
          </MiniActionBtn>
          <MiniActionBtn $pdf onClick={() => handleExport("Product/GetAllProducts", "Products", "pdf")}>
            <FileText size={14}/> PDF
          </MiniActionBtn>
        </div>
      </BackupItem>

      {/* 2. Live Stock Inventory */}
      <BackupItem>
        <div className="header">
          <Database size={18} color="#01b574"/> 
          <span>Stock Inventory</span>
        </div>
        <div className="btn-row">
          <MiniActionBtn onClick={() => handleExport("StockMaster/GetAllStock", "Stock_Ledger", "excel")}>
            <FileSpreadsheet size={14}/> Excel
          </MiniActionBtn>
          <MiniActionBtn $pdf onClick={() => handleExport("StockMaster/GetAllStock", "Stock_Ledger", "pdf")}>
            <FileText size={14}/> PDF
          </MiniActionBtn>
        </div>
      </BackupItem>

      {/* 3. Sales & Revenue Backup */}
      <BackupItem>
        <div className="header">
          <CreditCard size={18} color="#ffb547"/> 
          <span>Sales & Receipts</span>
        </div>
        <div className="btn-row">
          <MiniActionBtn onClick={() => handleExport("ReciptMaster/GetAllRecipts", "Sales_History", "excel")}>
            <FileSpreadsheet size={14}/> Excel
          </MiniActionBtn>
          <MiniActionBtn $pdf onClick={() => handleExport("ReciptMaster/GetAllRecipts", "Sales_History", "pdf")}>
            <FileText size={14}/> PDF
          </MiniActionBtn>
        </div>
      </BackupItem>

      {/* 4. Vendor & Supplier Directory */}
      <BackupItem>
        <div className="header">
          <Truck size={18} color="#ee5d50"/> 
          <span>Vendor Directory</span>
        </div>
        <div className="btn-row">
          <MiniActionBtn onClick={() => handleExport("Vendor/GetAllVendors", "Suppliers", "excel")}>
            <FileSpreadsheet size={14}/> Excel
          </MiniActionBtn>
          <MiniActionBtn $pdf onClick={() => handleExport("Vendor/GetAllVendors", "Suppliers", "pdf")}>
            <FileText size={14}/> PDF
          </MiniActionBtn>
        </div>
      </BackupItem>

    </div>

    {/* System Notice */}
    <div style={{ 
      marginTop: '30px', 
      padding: '15px', 
      background: '#fff9db', 
      borderRadius: '12px', 
      border: '1px solid #fab005',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <Shield size={20} color="#f08c00"/>
      <p style={{ margin: 0, fontSize: '13px', color: '#862e00', fontWeight: 600 }}>
        Security Note: All backups include local system timestamps. Ensure data is handled according to River Island privacy policies.
      </p>
    </div>
  </div>
)}

          {activeTab === 'security' && (
            <div style={{ maxWidth: '400px', margin: '20px auto', textAlign: 'center' }}>
                <div style={{ width: '70px', height: '70px', background: '#f4f7fe', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#4318ff' }}>
                  <Lock size={30}/>
                </div>
                <h4 style={{ color: '#1b2559', marginBottom: '10px' }}>Security Portal</h4>
                <p style={{ color: '#a3aed0', fontSize: '13px', marginBottom: '30px' }}>Password changes aur session management Admin panel se control kiye jate hain.</p>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <InputGroup><label>New Password</label><input type="password" placeholder="••••••••" /></InputGroup>
                  <InputGroup><label>Confirm Password</label><input type="password" placeholder="••••••••" /></InputGroup>
                  <PrimaryBtn style={{ width: '100%', justifyContent: 'center' }}><Key size={18}/> Update Key</PrimaryBtn>
                </div>
            </div>
          )}
        </ContentCard>
      </MainContainer>
    </Layout>
  );
}