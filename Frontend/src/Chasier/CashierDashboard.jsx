import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  FiTrendingUp, FiBox, FiAlertCircle, FiDollarSign, 
  FiFileText, FiRefreshCw, FiCalendar, FiUser 
} from "react-icons/fi";

import { getRequest } from "../../Services/apiService"; 
import PleaseWait from "../Common/PleaseWait";
import moment from "moment";

/* --- Styles (Modern Professional UI) --- */
const DashboardWrapper = styled.div` 
  max-width: 1300px; 
  margin: 0 auto; 
  padding: 25px; 
  background: #f8fafc; 
  min-height: 100vh; 
  font-family: 'Plus Jakarta Sans', sans-serif; 
`;

const HeaderSection = styled.div` 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-end; 
  margin-bottom: 30px; 
`;

const StatsGrid = styled.div` 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 20px; 
  margin-bottom: 30px; 
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); } 
`;

const GlassCard = styled.div` 
  background: white; 
  border-radius: 24px; 
  padding: 24px; 
  border: 1px solid #f1f5f9; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02); 
`;

const StatCard = styled(GlassCard)` 
  display: flex; 
  align-items: center; 
  gap: 18px; 
  .icon-box { 
    width: 56px; 
    height: 56px; 
    border-radius: 16px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 22px; 
    background: ${props => props.$bg}; 
    color: ${props => props.$color}; 
  } 
  .info { 
    h4 { margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; } 
    p { margin: 4px 0 0; font-size: 22px; font-weight: 800; color: #1e293b; } 
  } 
`;

const ActionButton = styled.button` 
  background: #4f46e5; 
  color: white; 
  border: none; 
  padding: 12px 20px; 
  border-radius: 12px; 
  font-weight: 700; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  transition: all 0.2s;
  &:hover { opacity: 0.9; transform: translateY(-1px); }
`;

export default function CashierDashboard() {
  const [loading, setLoading] = useState(true);
  const [allSales, setAllSales] = useState([]);
  const [stock, setStock] = useState([]);
  const [activeFY, setActiveFY] = useState("");
  
  // Get Logged-in Cashier Info (for display only)
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [salesRes, stockRes, fyRes] = await Promise.all([
        getRequest("ReciptMaster/GetAllRecipts"),
        getRequest("StockMaster/GetAllStock"),
        getRequest("Financial_Year/GetAllFinancialYears")
      ]);

      if (fyRes?.status === "OK") {
        const active = fyRes.result.find(y => y.isActive);
        if (active) setActiveFY(active.financialYear);
      }

      if (salesRes?.status === "OK") {
          // Sabhi sales set kar rahe hain
          setAllSales(salesRes.result || []);
      }
      if (stockRes?.status === "OK") setStock(stockRes.result || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CALCULATIONS (SHOWING ALL DATA) ================= */
  const metrics = useMemo(() => {
    // Ab hum filter nahi kar rahe, direct allSales use kar rahe hain
    const totalRevenue = allSales.reduce((acc, curr) => acc + (Number(curr.netTotal || curr.NetTotal || 0)), 0);
    const lowStockCount = stock.filter(item => (item.qty || item.Qty || 0) <= 10).length;
    
    // Graph Trends (Latest 10 sales)
    const trends = allSales.slice(-10).map(s => ({
      name: moment(s.billDate || s.BillDate).format("DD/MM"),
      sales: Number(s.netTotal || s.NetTotal || 0)
    }));

    return {
      salesList: [...allSales].reverse().slice(0, 10), // Latest transactions top pe
      totalRevenue,
      invoiceCount: allSales.length,
      lowStockCount,
      chartData: trends.length > 0 ? trends : [{name: 'No Data', sales: 0}]
    };
  }, [allSales, stock]);

  return (
    <DashboardWrapper>
      <PleaseWait show={loading} />
      
      <HeaderSection>
        <div className="welcome-msg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4f46e5', fontWeight: 700, marginBottom: '5px' }}>
             <FiUser /> POS Terminal
          </div>
          <h1 style={{fontSize: '28px', margin: 0}}>{currentUser?.name || "User"}'s Dashboard</h1>
          <p style={{color: '#64748b', marginTop: '5px'}}>River Island IMS • Live Store Metrics</p>
        </div>
        <div style={{display:'flex', gap:'12px'}}>
           <ActionButton style={{background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0'}}>
             <FiCalendar /> {activeFY || "FY 25-26"}
           </ActionButton>
           <ActionButton onClick={loadData}>
             <FiRefreshCw /> Sync Data
           </ActionButton>
        </div>
      </HeaderSection>

      <StatsGrid>
        <StatCard $bg="#eef2ff" $color="#4f46e5">
          <div className="icon-box"><FiDollarSign /></div>
          <div className="info">
            <h4>Total Sales (All)</h4>
            <p>₹{metrics.totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </StatCard>

        <StatCard $bg="#ecfdf5" $color="#10b981">
          <div className="icon-box"><FiFileText /></div>
          <div className="info">
            <h4>Total Invoices</h4>
            <p>{metrics.invoiceCount}</p>
          </div>
        </StatCard>

        <StatCard $bg="#fff1f2" $color="#f43f5e">
          <div className="icon-box"><FiAlertCircle /></div>
          <div className="info">
            <h4>Low Stock Alert</h4>
            <p>{metrics.lowStockCount}</p>
          </div>
        </StatCard>

        <StatCard $bg="#fefce8" $color="#ca8a04">
          <div className="icon-box"><FiTrendingUp /></div>
          <div className="info">
            <h4>Shift Status</h4>
            <p style={{ fontSize: '18px' }}>Active</p>
          </div>
        </StatCard>
      </StatsGrid>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '30px'}}>
        <GlassCard>
          <h3 style={{margin:'0 0 20px 0', fontSize: '16px', fontWeight: 800}}>Store Performance Trends</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={metrics.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 style={{margin:'0 0 20px 0', fontSize: '16px', fontWeight: 800}}>System Health</h3>
          <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '20px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>Server Time</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{moment().format("hh:mm A")}</div>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0' }} />
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <span style={{width: '8px', height: '8px', background: '#10b981', borderRadius: '50%'}}></span>
              Online & Connected
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard style={{padding:0, overflow:'hidden'}}>
        <div style={{padding:'20px 24px', fontWeight:800, borderBottom:'1px solid #f1f5f9'}}>Recent Store Transactions</div>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead style={{background:'#f8fafc'}}>
            <tr>
              <th style={{padding:'12px 24px', textAlign:'left', fontSize:'11px', color:'#94a3b8', textTransform: 'uppercase'}}>Invoice #</th>
              <th style={{padding:'12px 24px', textAlign:'left', fontSize:'11px', color:'#94a3b8', textTransform: 'uppercase'}}>Customer</th>
              <th style={{padding:'12px 24px', textAlign:'left', fontSize:'11px', color:'#94a3b8', textTransform: 'uppercase'}}>Amount</th>
              <th style={{padding:'12px 24px', textAlign:'left', fontSize:'11px', color:'#94a3b8', textTransform: 'uppercase'}}>Date</th>
              <th style={{padding:'12px 24px', textAlign:'left', fontSize:'11px', color:'#94a3b8', textTransform: 'uppercase'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {metrics.salesList.length > 0 ? (
              metrics.salesList.map((sale, idx) => (
                <tr key={idx} style={{borderBottom:'1px solid #f1f5f9'}}>
                  <td style={{padding:'14px 24px', fontSize:'13px', fontWeight:700, color: '#4f46e5'}}>
                    #{sale.reciptNo || sale.ReciptNo}
                  </td>
                  <td style={{padding:'14px 24px', fontSize:'13px'}}>
                    {sale.customerName || sale.CustomerName || "Walk-in"}
                  </td>
                  <td style={{padding:'14px 24px', fontSize:'13px', fontWeight:800}}>
                    ₹{Number(sale.netTotal || sale.NetTotal || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{padding:'14px 24px', fontSize:'12px', color: '#64748b'}}>
                    {moment(sale.billDate || sale.BillDate).format("DD MMM YYYY")}
                  </td>
                  <td style={{padding:'14px 24px'}}>
                      <span style={{ background: '#eef2ff', color: '#4f46e5', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800 }}>COMPLETED</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>
                  No transactions found in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>
    </DashboardWrapper>
  );
}