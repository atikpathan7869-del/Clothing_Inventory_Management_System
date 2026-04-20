import { useState, useMemo, useEffect } from "react";
import styled, { css } from "styled-components";
import moment from "moment";
import { 
  Banknote, RefreshCw, Wallet, Smartphone, 
  ChevronLeft, ChevronRight, Search, Filter, XCircle 
} from "lucide-react";
import { getRequest } from "../../Services/apiService";
import { showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= PRESTIGE UI SYSTEM ================= */
const Container = styled.div`
  padding: 40px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 35px;
  h2 { margin: 0; font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: -1px; }
  p { margin: 5px 0 0; color: #64748b; font-weight: 500; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);
  transition: transform 0.2s;
  &:hover { transform: translateY(-5px); }
  .icon { 
    width: 56px; height: 56px; border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    background: ${p => p.$bg}; color: ${p => p.$color};
  }
  .label { font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
  .value { font-size: 24px; font-weight: 800; color: #1e293b; margin-top: 4px; }
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 30px;
  padding: 30px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 50px rgba(0,0,0,0.03);
`;

const FilterRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;
  input {
    width: 100%;
    padding: 12px 15px 12px 45px;
    border-radius: 14px;
    border: 1.5px solid #e2e8f0;
    font-size: 14px;
    font-weight: 500;
    transition: 0.2s;
    &:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
  }
  .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
`;

const SelectFilter = styled.select`
  padding: 12px 20px;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  &:focus { border-color: #6366f1; outline: none; }
`;

const TableControl = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th { text-align: left; padding: 18px; color: #94a3b8; font-size: 12px; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
  td { padding: 18px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
  tbody tr:hover { background: #f8fafc; }
`;

const ModeBadge = styled.span`
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  ${p => p.$type === 'UPI' ? css`background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe;` :
         p.$type === 'Cash' ? css`background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7;` :
         css`background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;`}
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  button { 
    width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0; 
    background: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    &:disabled { opacity: 0.4; cursor: not-allowed; }
    &:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
  }
  span { font-weight: 700; color: #64748b; font-size: 14px; }
`;

/* ================= COMPONENT LOGIC ================= */
export default function DailyCashReport() {
  const [loading, setLoading] = useState(false);
  const [allInvoices, setAllInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await getRequest("ReciptMaster/GetAllRecipts");
      if (res?.status === "OK") {
        const today = moment().format("YYYY-MM-DD");
        const todayData = (res.result || []).filter(item => 
          moment(item.billDate || item.BillDate).format("YYYY-MM-DD") === today
        ).map(item => ({
          ...item,
          finalMode: item.paymentMode || item.PaymentMode || "Cash" 
        }));
        setAllInvoices(todayData);
        setCurrentPage(1); // Reset page on refresh
      }
    } catch (err) {
      showError("Fetch Failed", "Data update nahi ho saka.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, []);

  // Filtered Logic
  const filteredData = useMemo(() => {
    return allInvoices.filter(item => {
      const matchesSearch = 
        (item.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.reciptNo || "").toString().includes(searchQuery);
      
      const matchesMode = modeFilter === "All" || item.finalMode === modeFilter;

      return matchesSearch && matchesMode;
    });
  }, [allInvoices, searchQuery, modeFilter]);

  // Totals Calculation based on Filtered Data
  const totals = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      const amount = Number(curr.paid || curr.Paid || 0);
      if (curr.finalMode === "Cash") acc.cash += amount;
      if (curr.finalMode === "UPI") acc.upi += amount;
      acc.grandTotal += amount;
      return acc;
    }, { cash: 0, upi: 0, grandTotal: 0 });
  }, [filteredData]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <Container>
      <PleaseWait show={loading} />
      
      <HeaderSection>
        <div>
          <h2>Cash Settlement</h2>
          <p>{moment().format("dddd, Do MMMM YYYY")} • Real-time Monitoring</p>
        </div>
        <button 
          onClick={fetchSales}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 24px', border: 'none', background: '#0f172a', color: 'white', borderRadius: '16px', fontWeight: 700, cursor: 'pointer' }}
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} /> Sync Sales
        </button>
      </HeaderSection>

      <StatsGrid>
        <StatCard $bg="#f0fdf4" $color="#16a34a">
          <div className="icon"><Wallet size={28}/></div>
          <div><div className="label">Total Revenue</div><div className="value">₹{totals.grandTotal.toLocaleString()}</div></div>
        </StatCard>
        <StatCard $bg="#eff6ff" $color="#2563eb">
          <div className="icon"><Smartphone size={28}/></div>
          <div><div className="label">UPI Collection</div><div className="value">₹{totals.upi.toLocaleString()}</div></div>
        </StatCard>
        <StatCard $bg="#fef2f2" $color="#dc2626">
          <div className="icon"><Banknote size={28}/></div>
          <div><div className="label">In-Hand Cash</div><div className="value">₹{totals.cash.toLocaleString()}</div></div>
        </StatCard>
      </StatsGrid>

      <ContentCard>
        <FilterRow>
          <SearchBox>
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by customer name or invoice #..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </SearchBox>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={18} color="#94a3b8" />
            <SelectFilter value={modeFilter} onChange={(e) => { setModeFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">All Payment Modes</option>
              <option value="Cash">Cash Only</option>
              <option value="UPI">UPI Only</option>
            </SelectFilter>
          </div>

          {(searchQuery || modeFilter !== "All") && (
            <button 
              onClick={() => { setSearchQuery(""); setModeFilter("All"); }}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <XCircle size={18} /> Clear
            </button>
          )}
        </FilterRow>

        <TableControl>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>Daily Transactions</h3>
          <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
            Showing {paginatedData.length} of {filteredData.length} filtered results
          </div>
        </TableControl>

        <div style={{ overflowX: 'auto' }}>
          <StyledTable>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer Details</th>
                <th>Payment Mode</th>
                <th style={{ textAlign: 'right' }}>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                    <div style={{ marginBottom: '10px' }}><Search size={40} opacity={0.3} /></div>
                    No records match your filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 800, color: '#6366f1' }}>#{item.reciptNo || item.ReciptNo}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.customerName || "Walk-in Guest"}</div>
                      <small style={{ color: '#94a3b8', fontWeight: 500 }}>{item.customerMobile || "No Mobile Number"}</small>
                    </td>
                    <td>
                      <ModeBadge $type={item.finalMode}>
                        {item.finalMode === 'UPI' ? <Smartphone size={12}/> : <Banknote size={12}/>}
                        {item.finalMode}
                      </ModeBadge>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 900, fontSize: '16px', color: '#0f172a' }}>
                      ₹{(item.paid || item.Paid || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </StyledTable>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft size={20} />
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight size={20} />
            </button>
          </Pagination>
        )}
      </ContentCard>
    </Container>
  );
}