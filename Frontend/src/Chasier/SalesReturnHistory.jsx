import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import moment from "moment";
import { getRequest } from "../../Services/apiService";
import { showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= PROFESSIONAL STYLES ================= */
const Container = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
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
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border-bottom: 4px solid ${props => props.color || '#6366f1'};
  
  span { color: #64748b; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
  h2 { margin: 0.5rem 0 0; color: #1e293b; font-size: 1.8rem; }
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    label { font-size: 0.75rem; font-weight: 700; color: #475569; }
    input, select {
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #fcfcfc;
      font-weight: 500;
      outline: none;
      &:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    }
  }
`;

const ModernTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  
  th { padding: 15px; text-align: left; color: #64748b; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
  td { 
    background: white; 
    padding: 18px 15px; 
    border-top: 1px solid #f1f5f9; 
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    font-weight: 500;
  }
  
  tr td:first-child { border-left: 1px solid #f1f5f9; border-radius: 12px 0 0 12px; }
  tr td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 12px 12px 0; }
  
  tr:hover td { background: #fdfdfd; transform: translateY(-2px); transition: all 0.2s; }
`;

const Badge = styled.span`
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${props => props.type === 'Cash' ? '#dcfce7' : '#e0e7ff'};
  color: ${props => props.type === 'Cash' ? '#15803d' : '#4338ca'};
`;

/* ================= COMPONENT ================= */
export default function SalesReturnHistory() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ 
    start: moment().startOf('month').format('YYYY-MM-DD'), 
    end: moment().format('YYYY-MM-DD') 
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getRequest("SalesReturn/GetAllSalesReturns");
      if (res?.status === "OK") {
        setHistory(res.result);
      }
    } catch (err) {
      showError("Error", "Could not load history data.");
    } finally {
      setLoading(false);
    }
  };

  // --- NEW PRINT LOGIC ---
  const handlePrint = (item) => {
    const printWindow = window.open("", "_blank");
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Return Receipt - ${item.reciptNo}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
            .brand h1 { color: #6366f1; margin: 0; font-size: 24px; text-transform: uppercase; }
            .brand p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
            .meta { text-align: right; }
            .meta h2 { margin: 0; font-size: 18px; }
            
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .info-box h4 { margin: 0 0 8px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
            .info-box p { margin: 0; font-weight: bold; font-size: 15px; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            
            .total-section { text-align: right; margin-top: 40px; border-top: 2px solid #f1f5f9; padding-top: 20px; }
            .total-amount { font-size: 24px; font-weight: 800; color: #e11d48; }
            
            @media print {
              @page { margin: 10mm; }
              body { padding: 0; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <h1>RIVER ISLAND</h1>
              <p>Sales Return Credit Note</p>
            </div>
            <div class="meta">
              <h2>#SR-${item.reciptNo}</h2>
              <p>Date: ${moment(item.returnDate).format("DD MMM YYYY hh:mm A")}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <h4>Customer Details</h4>
              <p>${item.customerName || "Walk-in Customer"}</p>
            </div>
            <div class="info-box">
              <h4>Return Reference</h4>
              <p>Reason: ${item.reason || "Standard Return"}</p>
              <p>Refund via: ${item.remark || "Cash"}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${item.salesReturn_Items?.map(it => `
                <tr>
                  <td>${it.productName || 'Garment Item'}</td>
                  <td>${it.qty}</td>
                  <td>₹${it.salePrice}</td>
                  <td style="text-align: right;">₹${(it.qty * it.salePrice).toLocaleString()}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">No item details available</td></tr>'}
            </tbody>
          </table>

          <div class="total-section">
            <p style="margin:0; font-size: 14px; color: #64748b;">NET REFUND AMOUNT</p>
            <div class="total-amount">₹${item.netAmount.toLocaleString()}</div>
          </div>

          <div style="margin-top: 50px; border-top: 1px dashed #cbd5e1; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
            This is a computer generated sales return receipt.
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Filtered Data Logic
  const filteredData = useMemo(() => {
    return history.filter(item => {
      const matchSearch = item.reciptNo?.toString().includes(searchTerm) || 
                          item.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDate = moment(item.returnDate).isBetween(dateFilter.start, dateFilter.end, 'day', '[]');
      return matchSearch && matchDate;
    });
  }, [history, searchTerm, dateFilter]);

  const totalRefunded = filteredData.reduce((sum, item) => sum + item.netAmount, 0);

  return (
    <Container>
      <PleaseWait show={loading} />

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#0f172a' }}>Sales Return History</h1>
        <p style={{ color: '#64748b' }}>Monitor and manage all processed refunds and stock returns.</p>
      </header>

      {/* Overview Stats */}
      <StatsGrid>
        <StatCard color="#6366f1">
          <span>Total Return Entries</span>
          <h2>{filteredData.length}</h2>
        </StatCard>
        <StatCard color="#ef4444">
          <span>Total Refunded Amount</span>
          <h2>₹{totalRefunded.toLocaleString()}</h2>
        </StatCard>
        <StatCard color="#10b981">
          <span>Items Returned</span>
          <h2>{filteredData.reduce((sum, item) => sum + (item.salesReturn_Items?.length || 0), 0)}</h2>
        </StatCard>
      </StatsGrid>

      {/* Advanced Filters */}
      <FilterSection>
        <div className="filter-group" style={{ flex: 1, minWidth: '250px' }}>
          <label>Search Receipt / Customer</label>
          <input 
            placeholder="Search by name or bill number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>From Date</label>
          <input 
            type="date" 
            value={dateFilter.start}
            onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
          />
        </div>

        <div className="filter-group">
          <label>To Date</label>
          <input 
            type="date" 
            value={dateFilter.end}
            onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
          />
        </div>

        <button 
          onClick={fetchHistory}
          style={{ background: '#0f172a', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          <i className="fas fa-sync-alt" style={{marginRight: '8px'}}></i>
          Refresh
        </button>
      </FilterSection>

      {/* Data Table */}
      <div style={{ overflowX: 'auto' }}>
        <ModernTable>
          <thead>
            <tr>
              <th>Return Date</th>
              <th>Original Bill</th>
              <th>Customer</th>
              <th>Payment Mode</th>
              <th>Reason</th>
              <th style={{ textAlign: 'right' }}>Refund Amount</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ fontWeight: 700 }}>{moment(item.returnDate).format("DD MMM YYYY")}</div>
                  <small style={{ color: '#94a3b8' }}>{moment(item.returnDate).format("hh:mm A")}</small>
                </td>
                <td>
                  <span style={{ color: '#6366f1', fontWeight: 700 }}>#{item.reciptNo}</span>
                </td>
                <td>{item.customerName || "Walk-in Customer"}</td>
                <td>
                  <Badge type={item.remark?.includes('Cash') ? 'Cash' : 'UPI'}>
                    {item.remark?.split('via ')[1] || 'Cash'}
                  </Badge>
                </td>
                <td style={{ maxWidth: '200px', fontSize: '0.85rem', color: '#64748b' }}>
                   {item.reason || "No reason specified"}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: '#e11d48', fontSize: '1.1rem' }}>
                  ₹{item.netAmount}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => handlePrint(item)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    <i className="fas fa-print"></i>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                  No return history found for selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </ModernTable>
      </div>
    </Container>
  );
}