import { useEffect, useState, useMemo } from "react";
import styled, { css } from "styled-components";
import { Search, Filter, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Info, ChevronRight } from "lucide-react";
import { getRequest } from "../../Services/apiService";
import { showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= MODERN STYLES ================= */
const PageContainer = styled.div`
  padding: 30px;
  background: #f8fafd;
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  .title-area h2 { font-size: 26px; color: #1B2559; font-weight: 800; margin: 0; }
  .title-area p { color: #A3AED0; margin-top: 5px; font-weight: 500; }
`;

const FilterCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0px 20px 40px rgba(112, 144, 176, 0.05);
  margin-bottom: 25px;
  border: 1px solid #f0f2f8;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;

  .search-input {
    flex: 2;
    min-width: 300px;
    position: relative;
    input {
      width: 100%;
      padding: 12px 15px 12px 45px;
      border: 1.5px solid #E0E5F2;
      border-radius: 14px;
      outline: none;
      font-weight: 500;
      transition: 0.3s;
      &:focus { border-color: #4318FF; box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.1); }
    }
    svg { position: absolute; left: 15px; top: 13px; color: #A3AED0; }
  }

  select {
    flex: 1;
    min-width: 150px;
    padding: 12px;
    border: 1.5px solid #E0E5F2;
    border-radius: 14px;
    background: white;
    font-weight: 600;
    color: #1B2559;
    cursor: pointer;
    outline: none;
    &:focus { border-color: #4318FF; }
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  
  thead th {
    padding: 15px 20px;
    color: #A3AED0;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: left;
  }

  tbody tr {
    background: white;
    transition: 0.2s;
    &:hover { transform: translateY(-2px); box-shadow: 0px 5px 15px rgba(112, 144, 176, 0.1); }
  }

  tbody td {
    padding: 16px 20px;
    color: #1B2559;
    font-weight: 600;
    border-top: 1px solid #f0f2f8;
    border-bottom: 1px solid #f0f2f8;
    &:first-child { border-left: 1px solid #f0f2f8; border-radius: 16px 0 0 16px; }
    &:last-child { border-right: 1px solid #f0f2f8; border-radius: 0 16px 16px 0; }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  ${p => p.$type === 'danger' ? css`background: #FFF5F5; color: #E31A1A;` :
         p.$type === 'warning' ? css`background: #FFF9E6; color: #FFB800;` :
         css`background: #F0FDF4; color: #10B981;`}
`;

const RefreshBtn = styled.button`
  background: white;
  border: 1.5px solid #E0E5F2;
  padding: 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: 0.2s;
  color: #4318FF;
  &:hover { background: #F4F7FE; transform: rotate(45deg); }
`;

/* ================= COMPONENT ================= */
export default function PriceStockInquiry() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await getRequest("StockMaster/GetAllStock");
      if (res?.status === "OK") setStocks(res.result || []);
    } catch {
      showError("Connection Error", "Could not refresh inventory");
    } finally { setLoading(false); }
  };

  const uniqueSizes = useMemo(() => [...new Set(stocks.map(s => s.size))], [stocks]);
  const uniqueColors = useMemo(() => [...new Set(stocks.map(s => s.color))], [stocks]);

  const filteredItems = useMemo(() => {
    return stocks.filter(s => {
      const matchesSearch = (s.productName || "").toLowerCase().includes(search.toLowerCase()) || 
                            (s.stockCode || "").toLowerCase().includes(search.toLowerCase());
      const matchesSize = sizeFilter === "" || s.size === sizeFilter;
      const matchesColor = colorFilter === "" || s.color === colorFilter;
      const matchesStatus = statusFilter === "all" ? true :
                            statusFilter === "low" ? (s.qty > 0 && s.qty <= 5) :
                            statusFilter === "out" ? s.qty <= 0 : true;
      
      return matchesSearch && matchesSize && matchesColor && matchesStatus;
    });
  }, [stocks, search, sizeFilter, colorFilter, statusFilter]);

  return (
    <PageContainer>
      <PleaseWait show={loading} />

      <HeaderSection>
        <div className="title-area">
          <h2>Stock & Price Lookup</h2>
          <p>Global Collection Real-time Inventory Status</p>
        </div>
        <RefreshBtn onClick={fetchInventory} title="Refresh Data">
          <RefreshCw size={20} />
        </RefreshBtn>
      </HeaderSection>

      <FilterCard>
        <Toolbar>
          <div className="search-input">
            <Search size={18} />
            <input 
              placeholder="Search product name, SKU or barcode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}>
            <option value="">All Sizes</option>
            {uniqueSizes.map(sz => <option key={sz} value={sz}>{sz}</option>)}
          </select>

          <select value={colorFilter} onChange={e => setColorFilter(e.target.value)}>
            <option value="">All Colors</option>
            {uniqueColors.map(cl => <option key={cl} value={cl}>{cl}</option>)}
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Overall Stock</option>
            <option value="low">⚠️ Low Stock</option>
            <option value="out">❌ Out of Stock</option>
          </select>
        </Toolbar>
      </FilterCard>

      <div style={{ overflowX: 'auto' }}>
        <StyledTable>
          <thead>
            <tr>
              <th>Product Information</th>
              <th>Variant</th>
              <th>Status</th>
              <th>Base Price</th>
              <th>GST</th>
              <th>Retail Price (MRP)</th>
              <th style={{ textAlign: 'center' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: 800, color: '#1B2559' }}>{item.productName}</div>
                  <div style={{ fontSize: '11px', color: '#A3AED0', fontFamily: 'monospace' }}>{item.stockCode}</div>
                </td>
                
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#4318FF', fontWeight: 700 }}>{item.size}</span>
                    <span style={{ color: '#E0E5F2' }}>|</span>
                    <span style={{ color: '#707EAE' }}>{item.color}</span>
                  </div>
                </td>

                <td>
                  <StatusBadge $type={item.qty <= 0 ? 'danger' : (item.qty <= 5 ? 'warning' : 'success')}>
                    {item.qty <= 0 ? <XCircle size={14} /> : (item.qty <= 5 ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />)}
                    {item.qty} Pcs
                  </StatusBadge>
                </td>

                <td style={{ color: '#707EAE' }}>
                  ₹{((item.salePrice * 100) / (100 + (item.rateGST || 18))).toFixed(2)}
                </td>

                <td style={{ color: '#707EAE', fontSize: '13px' }}>
                  ₹{(item.salePrice - ((item.salePrice * 100) / (100 + (item.rateGST || 18)))).toFixed(2)}
                  <div style={{ fontSize: '10px', fontWeight: 700 }}>({item.rateGST}%)</div>
                </td>

                <td>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#05CD99' }}>
                    ₹{item.salePrice?.toLocaleString()}
                  </div>
                </td>

                <td style={{ textAlign: 'center' }}>
                  <div title={`Last Inward: ${new Date(item.inwardDate).toLocaleDateString()}`}>
                    <Info size={18} color="#A3AED0" style={{ cursor: 'help' }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>

        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '24px' }}>
            <XCircle size={40} color="#A3AED0" style={{ marginBottom: '15px' }} />
            <h3 style={{ color: '#1B2559' }}>No results match your filters</h3>
            <p style={{ color: '#A3AED0' }}>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', color: '#A3AED0', fontSize: '14px', fontWeight: 600 }}>
        Showing {filteredItems.length} items in current view
      </div>
    </PageContainer>
  );
}