import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { 
  Package, Box, AlertOctagon, TrendingUp, 
  Search, Printer, Filter, MoreVertical, 
  Tag, Barcode, Layers, ArrowDown, Download, RefreshCw
} from "lucide-react";
import { getRequest } from "../../Services/apiService"; 
import { showToast } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";
import moment from "moment";

/* ================= THEME & STYLES ================= */
const PageContainer = styled.div`
  padding: 30px; background: #f8fafd; min-height: 100vh;
  @media print { background: white !important; padding: 0 !important; }
`;

const ReportHeader = styled.div`
  display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px;
  .title-area h2 { color: #1B2559; font-weight: 800; font-size: 28px; margin: 0; }
  .title-area p { color: #A3AED0; font-weight: 500; margin-top: 5px; }
  @media print { display: none; }
`;

const AnalyticsGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;
  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
  @media print { grid-template-columns: repeat(4, 1fr); gap: 10px; }
`;

const StatCard = styled.div`
  background: white; padding: 22px; border-radius: 20px; border: 1px solid #f0f2f8;
  display: flex; align-items: center; gap: 15px;
  box-shadow: 0px 10px 20px rgba(112, 144, 176, 0.03);
  .icon-box { 
    width: 52px; height: 52px; border-radius: 16px; display: flex; 
    align-items: center; justify-content: center;
    background: ${p => p.$bg || '#f4f7fe'}; color: ${p => p.$color || '#4318FF'};
  }
  .info h5 { margin: 0; color: #A3AED0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .info h3 { margin: 2px 0 0; color: #1B2559; font-size: 22px; font-weight: 800; }
`;

const MainCard = styled.div`
  background: white; border-radius: 24px; padding: 25px; 
  border: 1px solid #f0f2f8; box-shadow: 0px 20px 40px rgba(112, 144, 176, 0.05);
  @media print { border: none; box-shadow: none; padding: 0; }
`;

const Toolbar = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;
  @media print { display: none; }
`;

const SearchBox = styled.div`
  position: relative; width: 400px;
  input { 
    width: 100%; padding: 13px 15px 13px 45px; border-radius: 14px; 
    border: 1.5px solid #E0E5F2; outline: none; background: #f4f7fe; transition: 0.3s;
    &:focus { border-color: #4318FF; background: #fff; box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.05); }
  }
  svg { position: absolute; left: 16px; top: 14px; color: #A3AED0; }
`;

const StockTable = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0 10px;
  th { padding: 12px 15px; text-align: left; color: #A3AED0; font-size: 12px; font-weight: 700; text-transform: uppercase; }
  tbody tr { background: #fff; transition: 0.2s; &:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(112, 144, 176, 0.08); } }
  td { padding: 16px 15px; vertical-align: middle; border-top: 1px solid #f4f7fe; border-bottom: 1px solid #f4f7fe; }
  td:first-child { border-left: 1px solid #f4f7fe; border-top-left-radius: 14px; border-bottom-left-radius: 14px; }
  td:last-child { border-right: 1px solid #f4f7fe; border-top-right-radius: 14px; border-bottom-right-radius: 14px; }
`;

const StockBadge = styled.span`
  padding: 6px 12px; border-radius: 10px; font-size: 11px; font-weight: 800; text-transform: uppercase;
  ${p => {
    if (p.$qty <= 0) return 'background: #FFF5F5; color: #EE5D50;';
    if (p.$qty <= 10) return 'background: #FFF8EB; color: #FFB547;';
    return 'background: #E6FAF5; color: #05CD99;';
  }}
`;

/* ================= PRINT BRANDING ================= */
const PrintHeader = styled.div`
  display: none;
  @media print {
    display: block; border-bottom: 3px solid #1B2559; margin-bottom: 30px; padding-bottom: 20px;
    .flex-row { display: flex; justify-content: space-between; align-items: center; }
    h1 { margin: 0; color: #1B2559; font-size: 32px; font-weight: 900; }
    .report-info { text-align: right; font-size: 14px; color: #707EAE; font-weight: 600; }
    .report-title { background: #f4f7fe; padding: 10px; text-align: center; margin-top: 20px; font-weight: 800; color: #1B2559; border-radius: 8px; }
  }
`;

export default function StockReportPage() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getRequest("StockMaster/GetAllStock"); 
      if (res.status === "OK") setStock(res.result);
    } catch (e) { showToast("error", "System sync failed"); }
    finally { setLoading(false); }
  };

  const filteredStock = useMemo(() => {
    return stock.filter(item => 
      item.productName.toLowerCase().includes(search.toLowerCase()) || 
      item.stockCode.toLowerCase().includes(search.toLowerCase())
    );
  }, [stock, search]);

  const stats = useMemo(() => ({
    totalItems: stock.length,
    lowStock: stock.filter(x => x.qty > 0 && x.qty <= 10).length,
    outOfStock: stock.filter(x => x.qty <= 0).length,
    valuation: stock.reduce((acc, curr) => acc + (curr.costPrice * curr.qty), 0)
  }), [stock]);

  return (
    <PageContainer>
      <PleaseWait show={loading} />

      <PrintHeader>
        <div className="flex-row">
          <div>
            <h1>GLOBAL COLLECTION</h1>
            <p>Premium Garment Inventory Audit</p>
          </div>
          <div className="report-info">
            <p><b>RIVER ISLAND IMS</b></p>
            <p>Audit Date: {moment().format("DD MMMM YYYY")}</p>
          </div>
        </div>
        <div className="report-title">MASTER STOCK VALUATION REPORT</div>
      </PrintHeader>

      <ReportHeader>
        <div className="title-area">
          <h2>Inventory Master</h2>
          <p>Complete stock valuation and warehouse tracking</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}} className="no-print">
          <button onClick={loadData} style={btnStyle}><RefreshCw size={18} /> Sync</button>
          <button onClick={() => window.print()} style={{...btnStyle, background: '#4318FF', color: '#fff'}}>
            <Printer size={18} /> Generate PDF
          </button>
        </div>
      </ReportHeader>

      <AnalyticsGrid>
        <StatCard $bg="#E7E7FF" $color="#4318FF">
          <div className="icon-box"><Layers size={24}/></div>
          <div className="info"><h5>SKUs Tracked</h5><h3>{stats.totalItems}</h3></div>
        </StatCard>
        <StatCard $bg="#FFF8EB" $color="#FFB547">
          <div className="icon-box"><AlertOctagon size={24}/></div>
          <div className="info"><h5>Low Stock</h5><h3>{stats.lowStock} Items</h3></div>
        </StatCard>
        <StatCard $bg="#FFF5F5" $color="#EE5D50">
          <div className="icon-box"><Box size={24}/></div>
          <div className="info"><h5>Out of Stock</h5><h3>{stats.outOfStock}</h3></div>
        </StatCard>
        <StatCard $bg="#E6FAF5" $color="#05CD99">
          <div className="icon-box"><TrendingUp size={24}/></div>
          <div className="info"><h5>Stock Value</h5><h3>₹{stats.valuation.toLocaleString()}</h3></div>
        </StatCard>
      </AnalyticsGrid>

      <MainCard>
        <Toolbar>
          <SearchBox>
            <Search size={20} />
            <input 
              placeholder="Search by Product Name, SKU or Barcode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchBox>
          <div style={{display: 'flex', gap: '12px'}}>
             <select style={selectStyle}><option>All Categories</option></select>
             <button style={iconBtnStyle}><Filter size={18}/></button>
          </div>
        </Toolbar>

        <div style={{overflowX: 'auto'}}>
          <StockTable>
            <thead>
              <tr>
                <th>Product Description</th>
                <th>Category / SKU</th>
                <th>Pricing (Cost/Sale)</th>
                <th>Current Qty</th>
                <th>Valuation</th>
                <th>Status</th>
                <th style={{textAlign: 'right'}} className="no-print">Manage</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <div style={skuIconStyle}><Barcode size={20} /></div>
                      <div>
                        <div style={{fontWeight: 800, color: '#1B2559', fontSize: '15px'}}>{item.productName}</div>
                        <div style={{fontSize: '12px', color: '#A3AED0'}}>{item.size} | {item.color}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{fontWeight: 700, color: '#4318FF', fontSize: '13px'}}>{item.stockCode}</div>
                    <div style={{fontSize: '11px', color: '#707EAE', fontWeight: 600}}>{item.categoryName || 'General Garment'}</div>
                  </td>
                  <td>
                    <div style={{fontSize: '13px', color: '#1B2559', fontWeight: 700}}>C: ₹{item.costPrice}</div>
                    <div style={{fontSize: '12px', color: '#05CD99', fontWeight: 700}}>S: ₹{item.salePrice}</div>
                  </td>
                  <td>
                    <div style={{fontSize: '16px', fontWeight: 900, color: '#1B2559'}}>
                      {item.qty} <span style={{fontSize: '12px', color: '#A3AED0', fontWeight: 500}}>pcs</span>
                    </div>
                  </td>
                  <td>
                    <div style={{fontWeight: 800, color: '#1B2559'}}>
                      ₹{(item.costPrice * item.qty).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <StockBadge $qty={item.qty}>
                      {item.qty <= 0 ? 'Out of Stock' : item.qty <= 10 ? 'Low Stock' : 'In Stock'}
                    </StockBadge>
                  </td>
                  <td style={{textAlign: 'right'}} className="no-print">
                    <button style={iconBtnStyle}><MoreVertical size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </StockTable>
        </div>
      </MainCard>
    </PageContainer>
  );
}

/* ================= INLINE UI COMPONENTS ================= */
const btnStyle = {
  padding: '12px 24px', borderRadius: '14px', border: 'none', background: '#fff',
  color: '#1B2559', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px',
  cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: '0.2s'
};

const iconBtnStyle = {
  width: '44px', height: '44px', borderRadius: '12px', border: '1.5px solid #E0E5F2',
  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#A3AED0', transition: '0.2s'
};

const selectStyle = {
  padding: '0 15px', borderRadius: '14px', border: '1.5px solid #E0E5F2',
  color: '#1B2559', fontWeight: 600, outline: 'none', background: '#fff'
};

const skuIconStyle = {
  background: '#F4F7FE', color: '#4318FF', padding: '10px', borderRadius: '12px'
};