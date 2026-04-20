import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { getRequest } from "../../Services/apiService";
import { showToast, showError } from "../../Services/sweetAlert";

/* ================= THEME & ANIMATIONS ================= */
const Colors = {
  primary: "#0ea5e9", // Sky Blue
  secondary: "#6366f1", // Indigo
  success: "#10b981", // Emerald
  darkBg: "#020617",
  cardBg: "rgba(15, 23, 42, 0.6)",
  border: "rgba(255, 255, 255, 0.08)",
  text: "#f8fafc",
  subText: "#94a3b8",
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

/* ================= STYLED COMPONENTS ================= */
const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${Colors.darkBg};
  background-image: radial-gradient(circle at 50% -20%, #0c4a6e 0%, transparent 50%);
  padding: 40px;
  color: ${Colors.text};
  font-family: 'Plus Jakarta Sans', sans-serif;
  animation: ${css`${fadeIn} 0.8s ease-out`};
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
  border-bottom: 1px solid ${Colors.border};
  padding-bottom: 20px;

  h1 { font-size: 1.8rem; font-weight: 900; letter-spacing: -1px; margin: 0; }
  .badge { background: ${Colors.primary}20; color: ${Colors.primary}; padding: 6px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 30px;
  max-width: 1300px;
  margin: 0 auto;

  @media (max-width: 1100px) { grid-template-columns: 1fr; }
`;

const MainCard = styled.div`
  background: ${Colors.cardBg};
  backdrop-filter: blur(20px);
  border-radius: 32px;
  border: 1px solid ${Colors.border};
  padding: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const LogCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 24px;
  border: 1px solid ${Colors.border};
  padding: 30px;
  height: 100%;
  max-height: 500px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${Colors.border}; border-radius: 10px; }
`;

const BackupIcon = styled.div`
  width: 140px; height: 140px;
  background: ${props => props.$active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(14, 165, 233, 0.05)'};
  border: 2px dashed ${props => props.$active ? Colors.success : Colors.primary};
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 3.5rem;
  color: ${props => props.$active ? Colors.success : Colors.primary};
  margin-bottom: 30px;
  transition: all 0.5s ease;
  animation: ${props => props.$active ? css`${spin} 3s linear infinite` : 'none'};
`;

const ActionButton = styled.button`
  width: 100%;
  max-width: 400px;
  padding: 22px;
  background: linear-gradient(135deg, ${Colors.primary}, ${Colors.secondary});
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 40px;

  &:hover:not(:disabled) {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px -10px rgba(14, 165, 233, 0.5);
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const LogEntry = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  font-size: 0.9rem;
  color: ${props => props.$status === 'done' ? Colors.success : props.$status === 'error' ? '#ef4444' : Colors.subText};

  i { font-size: 0.8rem; }
`;

/* ================= COMPONENT LOGIC ================= */
export default function FullSystemBackup() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ receipts: 0, payments: 0, returns: 0 });

  const addLog = (msg, status = 'pending') => {
    setLogs(prev => [{ id: Date.now(), msg, status, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  const handleMasterBackup = async () => {
    setIsSyncing(true);
    setLogs([]);
    addLog("Initializing Master Data Engine...", "pending");

    try {
      // 1. Fetch Receipts
      addLog("Accessing ReciptMaster Controller...", "pending");
      const resReceipts = await getRequest("ReciptMaster/GetAllRecipts");
      addLog(`Success: ${resReceipts.result?.length || 0} Receipts collected`, "done");

      // 2. Fetch Payments
      addLog("Accessing Reciptpayment Controller...", "pending");
      const resPayments = await getRequest("Reciptpayment/GetAllReciptPayments");
      addLog(`Success: ${resPayments.result?.length || 0} Payments collected`, "done");

      // 3. Fetch Sales Returns
      addLog("Accessing SalesReturn Controller...", "pending");
      const resReturns = await getRequest("SalesReturn/GetAllSalesReturns");
      addLog(`Success: ${resReturns.result?.length || 0} Return records collected`, "done");

      // 4. Fetch Return Payments
      addLog("Accessing ReturnPayment Controller...", "pending");
      const resRetPayments = await getRequest("ReturnPayment/GetAllReturnPayments");
      addLog(`Success: Return payments synced`, "done");

      // 5. Structure Final Object
      addLog("Structuring Data Architecture...", "pending");
      const masterData = {
        meta: {
          app: "River Island IMS",
          client: "Global Collection Bharuch",
          version: "4.0.2",
          timestamp: new Date().toISOString()
        },
        database: {
          receipts: resReceipts.result || [],
          payments: resPayments.result || [],
          returns: resReturns.result || [],
          returnPayments: resRetPayments.result || []
        }
      };

      // 6. Download Logic
      const blob = new Blob([JSON.stringify(masterData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `RI_Full_Database_Backup_${new Date().getTime()}.json`;
      link.click();

      addLog("Backup File Generated & Downloaded", "done");
      showToast("success", "Database Backup Successful");
      
      setStats({
        receipts: resReceipts.result?.length || 0,
        payments: resPayments.result?.length || 0,
        returns: resReturns.result?.length || 0
      });

    } catch (err) {
      addLog(`Critical Error: ${err.message}`, "error");
      showError("Backup Failed", "System could not sync all data tables.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <PageWrapper>
      <TopBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className="fas fa-server" style={{ color: Colors.primary }}></i>
          <h1>Database Command Center</h1>
        </div>
        <div className="badge">SECURE TUNNEL ACTIVE</div>
      </TopBar>

      <Grid>
        <MainCard>
          <BackupIcon $active={isSyncing}>
            <i className={isSyncing ? "fas fa-sync" : "fas fa-database"} />
          </BackupIcon>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '15px' }}>
            {isSyncing ? "Archiving..." : "Master Backup"}
          </h2>
          <p style={{ color: Colors.subText, maxWidth: '450px', lineHeight: '1.6' }}>
            This operation will create a complete snapshot of your sales, payments, and return history from the <b>River Island SQL Server</b>.
          </p>

          <div style={{ display: 'flex', gap: '40px', marginTop: '30px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.receipts}</div>
              <small style={{ color: Colors.subText, fontSize: '0.6rem', letterSpacing: '1px' }}>RECEIPTS</small>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.payments}</div>
              <small style={{ color: Colors.subText, fontSize: '0.6rem', letterSpacing: '1px' }}>PAYMENTS</small>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.returns}</div>
              <small style={{ color: Colors.subText, fontSize: '0.6rem', letterSpacing: '1px' }}>RETURNS</small>
            </div>
          </div>

          <ActionButton onClick={handleMasterBackup} disabled={isSyncing}>
            {isSyncing ? (
              <><i className="fas fa-spinner fa-spin" /> SYNCHRONIZING...</>
            ) : (
              <>RUN FULL SYSTEM BACKUP <i className="fas fa-arrow-right" style={{ marginLeft: '10px' }} /></>
            )}
          </ActionButton>
        </MainCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: Colors.primary }}>PROCESS LOGS</h3>
          <LogCard>
            {logs.length === 0 && (
              <div style={{ color: '#475569', textAlign: 'center', marginTop: '50px' }}>
                <i className="fas fa-terminal" style={{ fontSize: '2rem', marginBottom: '15px' }}></i>
                <p>Waiting for process initialization...</p>
              </div>
            )}
            {logs.map(log => (
              <LogEntry key={log.id} $status={log.status}>
                <i className={log.status === 'done' ? "fas fa-check-circle" : log.status === 'error' ? "fas fa-times-circle" : "fas fa-circle-notch fa-spin"} />
                <span style={{ flex: 1 }}>{log.msg}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{log.time}</span>
              </LogEntry>
            ))}
          </LogCard>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', fontSize: '0.8rem', color: '#475569', border: '1px solid rgba(255,255,255,0.05)' }}>
            <i className="fas fa-info-circle" style={{ marginRight: '10px' }} />
            Backups are stored in <b>JSON</b> format. This file can be imported into the restoration module in case of system failure.
          </div>
        </div>
      </Grid>

      <footer style={{ marginTop: '60px', textAlign: 'center', opacity: 0.4 }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '3px' }}>
          &copy; 2026 RIVER ISLAND IMS • DATA INTEGRITY UNIT • BHARUCH
        </p>
      </footer>
    </PageWrapper>
  );
}