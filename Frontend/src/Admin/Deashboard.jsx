import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import moment from "moment";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts'; 
import { getRequest } from "../../Services/apiService";
import PleaseWait from "../Common/PleaseWait";

/* ================= ANIMATIONS ================= */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ================= STYLED COMPONENTS ================= */
const Container = styled.div`
  padding: 2rem;
  background: #f4f7fe;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  animation: ${slideUp} 0.5s ease-out;
`;

const TopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  .welcome-text h1 { margin: 0; font-size: 1.8rem; color: #1e293b; font-weight: 800; }
  .welcome-text p { margin: 5px 0 0; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .fy-badge { background: #6366f1; color: white; padding: 6px 16px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04);
  .label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
  .value { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin: 10px 0; }
  .trend { font-size: 0.75rem; font-weight: 700; color: ${props => props.$up ? '#10b981' : '#ef4444'}; display: flex; align-items: center; gap: 4px; }
`;

const IconCircle = styled.div`
  position: absolute;
  right: -10px;
  top: -10px;
  width: 80px;
  height: 80px;
  background: ${props => props.$bg};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.1;
  i { font-size: 2rem; color: ${props => props.$color}; transform: translate(-10px, 10px); }
`;

const MainContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
`;

const ChartPanel = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  h3 { margin: 0 0 1.5rem 0; font-size: 1.1rem; font-weight: 800; color: #1e293b; }
`;

const RightStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ActionPanel = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  h3 { font-size: 1rem; font-weight: 800; margin-bottom: 1.2rem; }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const QuickBtn = styled(Link)`
  text-decoration: none;
  background: #f8fafc;
  padding: 15px 5px;
  border-radius: 16px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  transition: 0.3s;
  i { font-size: 1.2rem; color: #6366f1; }
  span { font-size: 0.7rem; font-weight: 700; color: #475569; }
  &:hover { background: #6366f1; i, span { color: white; } transform: translateY(-3px); }
`;

/* ================= COMPONENT START ================= */
export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [fyInfo, setFyInfo] = useState({ label: "Loading...", id: null });

  // 1. Initial Load (FY and Main Data)
  const initDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [fyRes, salesRes, stockRes] = await Promise.all([
        getRequest("Financial_Year/GetAllFinancialYears"),
        getRequest("ReciptMaster/GetAllRecipts"),
        getRequest("StockMaster/GetAllStock")
      ]);

      // Set Financial Year
      if (fyRes?.status === "OK") {
        const active = fyRes.result.find(y => y.isActive);
        if (active) setFyInfo({ label: active.financialYear, id: active.id });
      }

      // Set Sales & Stock
      if (salesRes?.status === "OK") setSalesData(salesRes.result || []);
      if (stockRes?.status === "OK") setStockData(stockRes.result || []);

    } catch (err) {
      console.error("Dashboard Load Error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initDashboard();
  }, [initDashboard]);

  // 2. Calculations using useMemo (Dynamic)
  const metrics = useMemo(() => {
    const totalSales = salesData.reduce((acc, curr) => acc + (curr.netTotal || curr.NetTotal || 0), 0);
    const totalPaid = salesData.reduce((acc, curr) => acc + (curr.paidAmount || curr.paid || curr.Paid || 0), 0);
    const totalDues = totalSales - totalPaid;
    const lowStockCount = stockData.filter(item => (item.qty || 0) < 10).length;

    // Chart Data Preparation (Last 7 Days)
    const chartPoints = salesData.slice(-7).map(item => ({
      day: moment(item.billDate || item.BillDate).format("DD MMM"),
      amount: item.netTotal || item.NetTotal || 0
    }));

    return { totalSales, totalPaid, totalDues, lowStockCount, chartPoints };
  }, [salesData, stockData]);

  return (
    <Container>
      <PleaseWait show={loading} />

      <TopHeader>
        <div className="welcome-text">
          <h1>Control Center</h1>
          <p><i className="fas fa-calendar-alt" /> Session: <span className="fy-badge">{fyInfo.label}</span></p>
        </div>
        <button onClick={initDashboard} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-sync-alt" /> Refresh Data
        </button>
      </TopHeader>

      <StatsGrid>
        <StatCard $up={true}>
          <div className="label">Total Revenue</div>
          <div className="value">₹{metrics.totalSales.toLocaleString()}</div>
          <div className="trend"><i className="fas fa-arrow-up" /> Live Sales</div>
          <IconCircle $bg="#6366f1" $color="#6366f1"><i className="fas fa-chart-line" /></IconCircle>
        </StatCard>

        <StatCard $up={true}>
          <div className="label">Cash in Hand</div>
          <div className="value">₹{metrics.totalPaid.toLocaleString()}</div>
          <div className="trend"><i className="fas fa-check-circle" /> Collected</div>
          <IconCircle $bg="#10b981" $color="#10b981"><i className="fas fa-wallet" /></IconCircle>
        </StatCard>

        <StatCard $up={false}>
          <div className="label">Outstanding Dues</div>
          <div className="value">₹{metrics.totalDues.toLocaleString()}</div>
          <div className="trend"><i className="fas fa-exclamation-circle" /> Pending Bills</div>
          <IconCircle $bg="#ef4444" $color="#ef4444"><i className="fas fa-hand-holding-dollar" /></IconCircle>
        </StatCard>

        <StatCard $up={metrics.lowStockCount === 0}>
          <div className="label">Inventory Alerts</div>
          <div className="value">{metrics.lowStockCount} Items</div>
          <div className="trend">{metrics.lowStockCount > 0 ? "Needs Restock" : "Stock Stable"}</div>
          <IconCircle $bg="#f59e0b" $color="#f59e0b"><i className="fas fa-boxes-stacked" /></IconCircle>
        </StatCard>
      </StatsGrid>

      <MainContentGrid>
        <ChartPanel>
          <h3>Revenue Analytics (Last 7 Sales)</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart data={metrics.chartPoints}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <RightStack>
          <ActionPanel>
            <h3>Quick Launch Pad</h3>
            <ActionGrid>
              <QuickBtn to="../ReceiptInvoice"><i className="fas fa-file-invoice" /><span>New Bill</span></QuickBtn>
              <QuickBtn to="../Product"><i className="fas fa-plus-circle" /><span>Items</span></QuickBtn>
              <QuickBtn to="../Stock"><i className="fas fa-warehouse" /><span>Stock</span></QuickBtn>
              <QuickBtn to="../SalesHistory"><i className="fas fa-history" /><span>History</span></QuickBtn>
              <QuickBtn to="../Vendors"><i className="fas fa-users" /><span>Vendors</span></QuickBtn>
              <QuickBtn to="../Settings"><i className="fas fa-cog" /><span>Setup</span></QuickBtn>
            </ActionGrid>
          </ActionPanel>

          <ActionPanel style={{ flex: 1 }}>
            <h3>System Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                <span style={{fontSize: '0.85rem', fontWeight: 600, color: '#64748b'}}>API Status</span>
                <span style={{fontSize: '0.85rem', fontWeight: 800, color: '#10b981'}}>Online</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                <span style={{fontSize: '0.85rem', fontWeight: 600, color: '#64748b'}}>Last Sync</span>
                <span style={{fontSize: '0.85rem', fontWeight: 800, color: '#6366f1'}}>{moment().format("hh:mm A")}</span>
              </div>
            </div>
          </ActionPanel>
        </RightStack>
      </MainContentGrid>
    </Container>
  );
}