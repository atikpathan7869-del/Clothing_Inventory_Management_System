import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { 
  User, Mail, Phone, ShieldCheck, HardDrive, 
  LogOut, Database, FileSpreadsheet, FileText, 
  Briefcase, Calendar, MapPin, CheckCircle2
} from "lucide-react";

// Services Integration
import { getRequest } from "../../Services/apiService"; 
import { showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

// Exporting Utilities
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // FIX: Required for 'autoTable is not a function' error

/* ================= ANIMATIONS ================= */
const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

/* ================= STYLED COMPONENTS ================= */
const PageWrapper = styled.div`
  padding: 30px; background: #f1f5f9; min-height: 100vh;
  font-family: 'Plus Jakarta Sans', sans-serif; display: flex; justify-content: center;
`;

const Container = styled.div`
  width: 100%; max-width: 1200px; display: grid;
  grid-template-columns: 280px 1fr; gap: 24px;
  @media (max-width: 992px) { grid-template-columns: 1fr; }
`;

const SidebarCard = styled.div`
  background: white; border-radius: 20px; padding: 24px;
  height: fit-content; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0; position: sticky; top: 30px;
`;

const NavLink = styled.button`
  width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 16px;
  border-radius: 12px; border: none; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: 0.3s; margin-bottom: 6px;
  background: ${p => p.$active ? '#4f46e5' : 'transparent'};
  color: ${p => p.$active ? 'white' : '#64748b'};
  &:hover { background: ${p => p.$active ? '#4f46e5' : '#f8fafc'}; color: ${p => p.$active ? 'white' : '#1e293b'}; }
`;

const MainContent = styled.div` display: flex; flex-direction: column; gap: 24px; `;

const HeaderCard = styled.div`
  background: white; border-radius: 20px; padding: 32px;
  display: flex; align-items: center; gap: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;
`;

const Avatar = styled.div`
  width: 85px; height: 85px; border-radius: 22px;
  background: #4f46e5; color: white; display: flex;
  align-items: center; justify-content: center;
  font-size: 32px; font-weight: 800; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
`;

const ContentCard = styled.div`
  background: white; border-radius: 20px; padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;
  animation: ${fadeIn} 0.4s ease-out;
`;

const ExportRow = styled.div`
  border: 1px solid #f1f5f9; background: #f8fafc; border-radius: 16px; padding: 20px;
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; transition: 0.3s;
  &:hover { border-color: #4f46e5; background: white; }
`;

const ActionBtn = styled.button`
  display: flex; align-items: center; gap: 8px; padding: 10px 18px;
  border-radius: 10px; border: none; font-weight: 700; font-size: 13px; cursor: pointer;
  color: white; background: ${p => p.$type === 'excel' ? '#10b981' : '#ef4444'};
  &:hover { opacity: 0.9; transform: translateY(-1px); }
`;

/* ================= MAIN COMPONENT ================= */
export default function CashierSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    setUser(data || { name: "Pathan Atik Khan", role: "Super Admin", email: "atik.khan@riverisland.com", id: "001", contactNo: "+91 9876543210" });
  }, []);

  const handleExport = async (endpoint, fileName, format) => {
    setLoading(true);
    try {
      const res = await getRequest(endpoint);
      
      // STEP 1: Smart Data Extraction
      // Kai baar .NET API data ko 'result' ya 'data' property mein bhejti hai
      let exportData = [];
      if (Array.isArray(res)) {
        exportData = res;
      } else if (res && Array.isArray(res.data)) {
        exportData = res.data;
      } else if (res && Array.isArray(res.result)) {
        exportData = res.result;
      }

      // STEP 2: Validation
      if (!exportData || exportData.length === 0 || exportData[0] === null) {
        showError("Export ke liye koi valid records nahi mile. Response format check karein.");
        setLoading(false);
        return;
      }

      // STEP 3: Format Specific Logic
      if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "IMS_Backup");
        XLSX.writeFile(workbook, `${fileName}_${new Date().toLocaleDateString()}.xlsx`);
      } else {
        const doc = new jsPDF('landscape');
        doc.setFontSize(18);
        doc.text("RIVER ISLAND - DATABASE BACKUP", 14, 15);
        doc.setFontSize(10);
        doc.text(`Category: ${fileName} | Timestamp: ${new Date().toLocaleString()}`, 14, 22);
        
        const headers = [Object.keys(exportData[0])];
        const rows = exportData.map(obj => Object.values(obj).map(v => v === null ? "" : v));

        // FIX: Using the autoTable function directly to avoid "is not a function" error
        autoTable(doc, {
          head: headers,
          body: rows,
          startY: 30,
          theme: 'grid',
          headStyles: { fillStyle: [79, 70, 229] },
          styles: { fontSize: 8 }
        });
        
        doc.save(`${fileName}.pdf`);
      }
    } catch (err) {
      showError("Export Error: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <PleaseWait />;

  return (
    <PageWrapper>
      {loading && <PleaseWait />}
      <Container>
        {/* Sidebar */}
        <SidebarCard>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
             <h3 style={{ margin: 0, color: '#1e293b' }}>IMS Settings</h3>
             <p style={{ fontSize: '12px', color: '#94a3b8' }}>River Island Enterprise</p>
          </div>
          <NavLink $active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}><User size={18}/> My Profile</NavLink>
          <NavLink $active={activeTab === 'backup'} onClick={() => setActiveTab('backup')}><Database size={18}/> Data Backup</NavLink>
          <NavLink $active={activeTab === 'security'} onClick={() => setActiveTab('security')}><ShieldCheck size={18}/> Security</NavLink>
          <div style={{ height: '40px' }}></div>
          <NavLink style={{ color: '#ef4444' }}><LogOut size={18}/> Sign Out</NavLink>
        </SidebarCard>

        {/* Content */}
        <MainContent>
          <HeaderCard>
            <Avatar>{user.name.charAt(0)}</Avatar>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '26px', margin: 0, fontWeight: 800 }}>{user.name}</h1>
                <CheckCircle2 size={20} color="#10b981" />
              </div>
              <p style={{ color: '#64748b', margin: '4px 0 0 0', fontWeight: 600 }}>{user.role} • ID: #RI-{user.id}</p>
            </div>
          </HeaderCard>

          {activeTab === 'profile' && (
            <ContentCard>
              <h3 style={{ margin: '0 0 24px 0' }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <InfoItem label="Full Name" value={user.name} icon={<User size={14}/>} />
                <InfoItem label="Email" value={user.email} icon={<Mail size={14}/>} />
                <InfoItem label="Contact" value={user.contactNo} icon={<Phone size={14}/>} />
                <InfoItem label="Designation" value={user.role} icon={<Briefcase size={14}/>} />
                <InfoItem label="Location" value="Bharuch, Gujarat" icon={<MapPin size={14}/>} />
                <InfoItem label="Joining Date" value="March 2026" icon={<Calendar size={14}/>} />
              </div>
            </ContentCard>
          )}

          {activeTab === 'backup' && (
            <ContentCard>
              <h3 style={{ margin: '0 0 10px 0' }}>Cloud Database Backup</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>Backup files ko monthly audit ke liye download karein.</p>
              
              <BackupItem 
                title="Receipt Master" 
                desc="Sare sales records aur digital invoices." 
                onExcel={() => handleExport("ReciptMaster/GetAllRecipts", "Sales_Receipts", "excel")}
                onPdf={() => handleExport("ReciptMaster/GetAllRecipts", "Sales_Receipts", "pdf")}
              />

              <BackupItem 
                title="Sales Returns" 
                desc="Product exchange aur return transactions." 
                onExcel={() => handleExport("SalesReturn/GetAllSalesReturns", "Sales_Returns", "excel")}
                onPdf={() => handleExport("SalesReturn/GetAllSalesReturns", "Sales_Returns", "pdf")}
              />
            </ContentCard>
          )}

          {activeTab === 'security' && (
            <ContentCard style={{ textAlign: 'center', padding: '60px' }}>
              <ShieldCheck size={48} color="#4f46e5" style={{ marginBottom: '15px' }} />
              <h3>Security Portal</h3>
              <p style={{ color: '#64748b' }}>Password changes aur session management Admin panel se control kiye jate hain.</p>
            </ContentCard>
          )}
        </MainContent>
      </Container>
    </PageWrapper>
  );
}

/* ================= HELPERS ================= */
const InfoItem = ({ label, value, icon }) => (
  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
    <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>{icon} {label}</p>
    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#334155' }}>{value}</p>
  </div>
);

const BackupItem = ({ title, desc, onExcel, onPdf }) => (
  <ExportRow>
    <div>
      <h4 style={{ margin: 0, color: '#1e293b' }}>{title}</h4>
      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{desc}</p>
    </div>
    <div style={{ display: 'flex', gap: '10px' }}>
      <ActionBtn $type="excel" onClick={onExcel}><FileSpreadsheet size={16}/> Excel</ActionBtn>
      <ActionBtn onClick={onPdf}><FileText size={16}/> PDF</ActionBtn>
    </div>
  </ExportRow>
);