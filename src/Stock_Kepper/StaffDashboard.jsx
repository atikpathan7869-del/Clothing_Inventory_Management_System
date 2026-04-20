import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { 
  FiBox, FiAlertTriangle, FiArrowDownLeft, FiActivity, 
  FiTrendingUp, FiCalendar, FiRefreshCw, FiArrowRight 
} from "react-icons/fi";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';
import { getRequest } from "../../Services/apiService";
import PleaseWait from "../Common/PleaseWait";
import moment from "moment";

/* ================= ANIMATIONS ================= */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ================= STYLED COMPONENTS ================= */
const DashboardWrapper = styled.div`
  padding: 2.5rem;
  background: #f4f7fe; /* River Island light theme */
  min-height: 100vh;
  animation: ${fadeIn} 0.5s ease-out;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  .welcome-text h2 { font-size: 2rem; font-weight: 800; color: #1B2559; margin: 0; }
  .welcome-text p { color: #A3AED0; font-weight: 500; margin-top: 5px; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 24px;
  box-shadow: 0px 15px 35px rgba(112, 144, 176, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover { transform: translateY(-5px); box-shadow: 0px 20px 45px rgba(112, 144, 176, 0.15); }
`;

const IconCircle = styled.div`
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
  background: ${props => props.bg || "#F4F7FE"};
  color: ${props => props.color || "#4318FF"};
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
  @media (max-width: 1200px) { grid-template-columns: 1fr; }
`;

const GlassCard = styled.div`
  background: white;
  padding: 1.8rem;
  border-radius: 30px;
  box-shadow: 0px 15px 35px rgba(112, 144, 176, 0.05);
  height: ${props => props.$height || "auto"};
`;

const ActivityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 15px;
  background: #f8fafd;
  border: 1px solid transparent;
  transition: 0.2s;
  &:hover { border-color: #e0e7ff; background: white; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #4318FF; }
`;

/* ================= COMPONENT ================= */
const StaffDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stock, setStock] = useState([]);
  const [metrics, setMetrics] = useState({
    totalSku: 0,
    lowStock: 0,
    dailyIn: 0,
    valuation: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getRequest("StockMaster/GetAllStock");
      if (res.status === "OK") {
        const data = res.result;
        setStock(data);
        
        // Dynamic Calculation
        setMetrics({
          totalSku: data.length,
          lowStock: data.filter(x => x.qty <= 10).length,
          dailyIn: Math.floor(Math.random() * 100), // Replace with actual API if available
          valuation: data.reduce((acc, curr) => acc + (curr.costPrice * curr.qty), 0)
        });
      }
    } catch (e) {
      console.error("Dashboard error", e);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data from real API results
  const categoryData = useMemo(() => {
    const counts = {};
    stock.forEach(item => {
      const cat = item.categoryName || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + item.qty;
    });
    return Object.keys(counts).map(key => ({ name: key, qty: counts[key] })).slice(0, 5);
  }, [stock]);

  return (
    <DashboardWrapper>
      <PleaseWait show={loading} />
      
      <TopBar>
        <div className="welcome-text">
          <h2>Overview Dashboard</h2>
          <p>{moment().format("dddd, MMMM Do YYYY")}</p>
        </div>
        <button onClick={fetchDashboardData} style={refreshBtn}>
          <FiRefreshCw /> Refresh Data
        </button>
      </TopBar>

      <StatsGrid>
        <StatCard>
          <div>
            <h5 style={labelStyle}>Total SKU</h5>
            <h3 style={valueStyle}>{metrics.totalSku}</h3>
            <span style={trendStyle}><FiTrendingUp /> +4%</span>
          </div>
          <IconCircle bg="#F4F7FE" color="#4318FF"><FiBox /></IconCircle>
        </StatCard>

        <StatCard>
          <div>
            <h5 style={labelStyle}>Inventory Value</h5>
            <h3 style={valueStyle}>₹{metrics.valuation.toLocaleString()}</h3>
            <span style={{...trendStyle, color: '#05CD99'}}>Active Assets</span>
          </div>
          <IconCircle bg="#E6FAF5" color="#05CD99"><FiTrendingUp /></IconCircle>
        </StatCard>

        <StatCard>
          <div>
            <h5 style={labelStyle}>Low Stock</h5>
            <h3 style={{...valueStyle, color: '#EE5D50'}}>{metrics.lowStock}</h3>
            <span style={{...trendStyle, color: '#EE5D50'}}>Requires Restock</span>
          </div>
          <IconCircle bg="#FFF5F5" color="#EE5D50"><FiAlertTriangle /></IconCircle>
        </StatCard>

        <StatCard>
          <div>
            <h5 style={labelStyle}>Daily Inflow</h5>
            <h3 style={valueStyle}>{metrics.dailyIn}</h3>
            <span style={trendStyle}>New Receipts</span>
          </div>
          <IconCircle bg="#FFF8EB" color="#FFB547"><FiArrowDownLeft /></IconCircle>
        </StatCard>
      </StatsGrid>

      <MainGrid>
        <GlassCard $height="450px">
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
            <h3 style={{margin: 0, color: '#1B2559'}}>Stock Distribution</h3>
            <div style={{fontSize: '0.85rem', color: '#A3AED0'}}>Units per Category</div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={categoryData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4318FF" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#4318FF" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E5F2" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#F4F7FE'}} 
                contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
              />
              <Bar dataKey="qty" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
            <h3 style={{margin: 0, color: '#1B2559'}}>Recent Movement</h3>
            <FiActivity color="#4318FF" />
          </div>
          
          {[
            { time: '12:30', text: '50 units of Denim Jeans added', type: 'in' },
            { time: '11:15', text: 'Stock adjustment: -2 damaged Shirts', type: 'adj' },
            { time: '09:00', text: 'Daily inventory audit completed', type: 'check' },
            { time: 'Yesterday', text: 'New vendor: Surat Textiles assigned', type: 'vendor' },
          ].map((item, i) => (
            <ActivityRow key={i}>
              <div className="dot" />
              <div style={{flex: 1}}>
                <div style={{fontSize: '0.9rem', fontWeight: 600, color: '#1B2559'}}>{item.text}</div>
                <div style={{fontSize: '0.75rem', color: '#A3AED0'}}>{item.time}</div>
              </div>
              <FiArrowRight color="#CBD5E0" />
            </ActivityRow>
          ))}
          
          <button style={fullLogBtn}>View Audit Trail</button>
        </GlassCard>
      </MainGrid>
    </DashboardWrapper>
  );
};

/* ================= INLINE STYLES ================= */
const labelStyle = { color: '#A3AED0', fontSize: '14px', fontWeight: 600, margin: 0 };
const valueStyle = { color: '#1B2559', fontSize: '24px', fontWeight: 800, margin: '4px 0' };
const trendStyle = { fontSize: '12px', fontWeight: 700, color: '#4318FF', display: 'flex', alignItems: 'center', gap: '4px' };
const refreshBtn = {
  background: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px',
  color: '#4318FF', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
  boxShadow: '0px 10px 20px rgba(112, 144, 176, 0.06)'
};
const fullLogBtn = {
  width: '100%', border: 'none', background: '#F4F7FE', color: '#4318FF',
  padding: '12px', borderRadius: '14px', fontWeight: 700, marginTop: '1rem', cursor: 'pointer'
};

export default StaffDashboard;