import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import moment from "moment";
import { getRequest, postRequest } from "../../Services/apiService";
import { showError, showToast, showConfirm } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";
import * as XLSX from 'xlsx';

/* ================= MODERN PROFESSIONAL UI STYLES ================= */
const Container = styled.div`
  padding: 2rem;
  background: #f1f5f9;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #1e293b;
  @media print { padding: 0; background: white; }
`;

const TopNav = styled.nav`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
  background: white; padding: 1rem 2rem; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  @media print { display: none !important; }
  .brand { h2 { margin: 0; color: #0f172a; font-weight: 800; } p { margin: 0; color: #64748b; font-size: 0.85rem; } }
`;

const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;
  @media print { display: none !important; }
`;

const StatCard = styled.div`
  background: white; padding: 1.5rem; border-radius: 16px; position: relative; overflow: hidden;
  border-left: 5px solid ${props => props.$color}; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  .label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .value { font-size: 1.8rem; font-weight: 800; color: #0f172a; margin-top: 0.5rem; }
  .icon { position: absolute; right: 1.5rem; top: 1.5rem; font-size: 1.5rem; color: #e2e8f0; }
`;

const FilterSection = styled.div`
  background: white; padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem;
  display: flex; flex-wrap: wrap; gap: 1.2rem; align-items: flex-end; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  @media print { display: none !important; }
`;

const InputGroup = styled.div`
  display: flex; flex-direction: column; gap: 6px; flex: ${props => props.$wide ? '1' : '0'}; min-width: 200px;
  label { font-size: 0.8rem; font-weight: 700; color: #475569; }
  input { 
    padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; transition: 0.3s;
    &:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
  }
`;

const StyledTableContainer = styled.div`
  background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  @media print { display: none !important; }
`;

const StyledTable = styled.table`
  width: 100%; border-collapse: collapse;
  th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; }
  td { padding: 1rem; border-top: 1px solid #f1f5f9; font-size: 0.9rem; }
  tr:hover { background: #f8fafc; }
`;

const ActionButton = styled.button`
  background: ${props => props.$variant === 'primary' ? '#6366f1' : props.$variant === 'success' ? '#10b981' : props.$variant === 'danger' ? '#ef4444' : 'white'};
  color: ${props => props.$variant ? 'white' : '#475569'};
  border: 1px solid ${props => props.$variant ? 'transparent' : '#e2e8f0'};
  padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.85rem;
  display: inline-flex; align-items: center; gap: 6px; transition: 0.2s;
  &:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
`;

/* ================= INVOICE PRINT STYLES ================= */
const PrintOnlyArea = styled.div`
  display: none;
  @media print {
    display: block !important; background: white; color: #000; width: 100%;
  }
  .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
  .brand-info h1 { margin: 0; font-size: 28px; font-weight: 900; color: #000; }
  .brand-info p { margin: 2px 0; font-size: 13px; font-weight: 500; }
  .bill-details { text-align: right; h2 { margin: 0; font-size: 24px; color: #000; } }
  .customer-section { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #eee; padding: 15px; }
  .print-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  .print-table th { border-bottom: 2px solid #000; padding: 10px; text-align: left; font-weight: 900; background: #f4f4f4 !important; -webkit-print-color-adjust: exact; }
  .print-table td { border-bottom: 1px solid #eee; padding: 10px; }
  .footer-summary { float: right; width: 300px; padding: 15px; background: #fafafa !important; border-radius: 8px; }
  .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
  .grand-total { font-size: 1.2rem; font-weight: 900; border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center; z-index: 9999; padding: 20px;
  @media print { display: none !important; }
`;

const ModalContent = styled.div`
  background: white; width: 100%; max-width: 900px; border-radius: 24px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const StatusBadge = styled.span`
  padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800;
  background: ${props => props.$due ? '#fee2e2' : '#dcfce7'};
  color: ${props => props.$due ? '#ef4444' : '#16a34a'};
`;

export default function SalesHistory() {
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filters, setFilters] = useState({
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    search: ""
  });

  useEffect(() => { fetchSales(); }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await getRequest("ReciptMaster/GetAllRecipts");
      if (res?.status === "OK") setSales(res.result || []);
    } catch (err) { showError("Error", "Server Connection Failed"); }
    finally { setLoading(false); }
  };

  const handleViewInvoice = async (id) => {
    setLoading(true);
    try {
      const res = await getRequest(`ReciptMaster/GetReciptById?id=${id}`);
      if (res?.status === "OK") setSelectedInvoice(res.result);
    } catch (err) { showError("Error", "Could not load invoice"); }
    finally { setLoading(false); }
  };

  const handleClearDue = async (item) => {
    const dueAmt = (item.netTotal || item.NetTotal || 0) - (item.paid || item.Paid || 0);
    
    const isConfirmed = await showConfirm(
      "Collect Payment",
      `Are you sure you want to collect ₹${dueAmt.toLocaleString()} for Invoice #${item.reciptNo || item.ReciptNo}?`
    );

    if (isConfirmed) {
      try {
        setLoading(true);
        const res = await postRequest("ReciptMaster/AddReciptPayment", {
          ReciptNo: (item.reciptNo || item.ReciptNo).toString(),
          Amount: dueAmt, 
          PaymentMode: "Cash", 
          PaymentDate: moment().format("YYYY-MM-DD")
        });
        if (res?.status === "OK") { 
          showToast("success", "Ledger Updated!"); 
          fetchSales(); 
          if(selectedInvoice) handleViewInvoice(item.reciptNo || item.ReciptNo);
        }
      } catch (err) { showError("Error", "Payment failed"); }
      finally { setLoading(false); }
    }
  };

  const filteredData = useMemo(() => {
    return sales.filter(item => {
      const date = moment(item.billDate || item.BillDate);
      const inRange = date.isBetween(filters.startDate, filters.endDate, 'day', '[]');
      const matches = (item.customerName || item.CustomerName || "").toLowerCase().includes(filters.search.toLowerCase()) || 
                      (item.customerMobile || item.CustomerMobile || "").includes(filters.search) || 
                      (item.reciptNo || item.ReciptNo || "").toString().includes(filters.search);
      return inRange && matches;
    });
  }, [sales, filters]);

  const stats = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      acc.total += (curr.netTotal || curr.NetTotal || 0);
      acc.received += (curr.paid || curr.Paid || 0);
      acc.outstanding += (curr.netTotal || curr.NetTotal || 0) - (curr.paid || curr.Paid || 0);
      return acc;
    }, { total: 0, received: 0, outstanding: 0 });
  }, [filteredData]);

  return (
    <Container>
      <PleaseWait show={loading} />

      {/* --- DASHBOARD HEADER --- */}
      <TopNav className="no-print">
        <div className="brand">
          <h2>RIVER ISLAND</h2>
          <p>Inventory Management System • Men's Wear</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ActionButton onClick={fetchSales}><i className="fas fa-sync" /> Refresh</ActionButton>
          <ActionButton $variant="primary" onClick={() => {
            const ws = XLSX.utils.json_to_sheet(filteredData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "SalesHistory");
            XLSX.writeFile(wb, "RiverIsland_Ledger.xlsx");
          }}><i className="fas fa-file-excel" /> Export Reports</ActionButton>
        </div>
      </TopNav>

      {/* --- STATS CARDS --- */}
      <StatsGrid className="no-print">
        <StatCard $color="#6366f1">
          <div className="label">Gross Sales</div>
          <div className="value">₹{stats.total.toLocaleString()}</div>
          <i className="fas fa-chart-line icon" />
        </StatCard>
        <StatCard $color="#10b981">
          <div className="label">Cash In-Flow</div>
          <div className="value">₹{stats.received.toLocaleString()}</div>
          <i className="fas fa-wallet icon" />
        </StatCard>
        <StatCard $color="#ef4444">
          <div className="label">Pending Dues</div>
          <div className="value">₹{stats.outstanding.toLocaleString()}</div>
          <i className="fas fa-exclamation-circle icon" />
        </StatCard>
      </StatsGrid>

      {/* --- FILTERS --- */}
      <FilterSection className="no-print">
        <InputGroup $wide>
          <label>Search Customer or Bill #</label>
          <input type="text" placeholder="Start typing name or phone..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
        </InputGroup>
        <InputGroup>
          <label>Date From</label>
          <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
        </InputGroup>
        <InputGroup>
          <label>Date To</label>
          <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
        </InputGroup>
      </FilterSection>

      {/* --- TABLE --- */}
      <StyledTableContainer className="no-print">
        <StyledTable>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer Details</th>
              <th>Billing Date</th>
              <th>Total Amount</th>
              <th>Received</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, i) => {
              const due = (item.netTotal || item.NetTotal || 0) - (item.paid || item.Paid || 0);
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 800, color: '#6366f1' }}>#{item.reciptNo || item.ReciptNo}</td>
                  <td>
                    <div style={{fontWeight: 700}}>{item.customerName || item.CustomerName}</div>
                    <div style={{fontSize: '0.75rem', color: '#64748b'}}>{item.customerMobile || item.CustomerMobile}</div>
                  </td>
                  <td>{moment(item.billDate || item.BillDate).format("MMM DD, YYYY")}</td>
                  <td style={{fontWeight: 700}}>₹{(item.netTotal || item.NetTotal || 0).toLocaleString()}</td>
                  <td style={{color: '#10b981', fontWeight: 600}}>₹{(item.paid || item.Paid || 0).toLocaleString()}</td>
                  <td style={{color: due > 0 ? '#ef4444' : '#0f172a', fontWeight: 800}}>₹{due.toLocaleString()}</td>
                  <td><StatusBadge $due={due > 0}>{due > 0 ? 'PENDING' : 'SETTLED'}</StatusBadge></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <ActionButton onClick={() => handleViewInvoice(item.reciptNo || item.ReciptNo)}>View</ActionButton>
                      {due > 0 && <ActionButton $variant="success" onClick={() => handleClearDue(item)}>Collect Pay</ActionButton>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </StyledTable>
      </StyledTableContainer>

      {/* --- INVOICE VIEW MODAL --- */}
      {selectedInvoice && (
        <ModalOverlay onClick={() => setSelectedInvoice(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0 }}>Digital Invoice #{selectedInvoice.reciptNo || selectedInvoice.ReciptNo}</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <ActionButton $variant="primary" onClick={() => window.print()}><i className="fas fa-print" /> Print Invoice</ActionButton>
                <ActionButton onClick={() => setSelectedInvoice(null)}>Close</ActionButton>
              </div>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                   <h2 style={{margin: 0, color: '#6366f1'}}>River Island</h2>
                   <p style={{color: '#64748b'}}>Men's Wear Premium Collection</p>
                </div>
                <div style={{textAlign: 'right'}}>
                   <p><b>Customer:</b> {selectedInvoice.customerName || selectedInvoice.CustomerName}</p>
                   <p><b>Phone:</b> {selectedInvoice.customerMobile || selectedInvoice.CustomerMobile}</p>
                   <p><b>Date:</b> {moment(selectedInvoice.billDate || selectedInvoice.BillDate).format("DD MMM YYYY")}</p>
                </div>
              </div>

              <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                <thead>
                   <tr style={{color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #f1f5f9'}}>
                      <th style={{padding: '10px 0'}}>DESCRIPTION</th>
                      <th>QTY</th>
                      <th>RATE</th>
                      <th style={{textAlign: 'right'}}>TOTAL</th>
                   </tr>
                </thead>
                <tbody>
                   {(selectedInvoice.reciptItems || selectedInvoice.ReciptItems || []).map((p, idx) => (
                      <tr key={idx} style={{borderBottom: '1px solid #f1f5f9'}}>
                         <td style={{padding: '12px 0', fontWeight: 600}}>{p.productName || p.ProductName}</td>
                         <td>{p.qty || p.Qty}</td>
                         <td>₹{p.rate || p.Rate}</td>
                         <td style={{textAlign: 'right', fontWeight: 700}}>₹{p.total || p.Total}</td>
                      </tr>
                   ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{marginBottom: '10px', fontSize: '0.9rem', color: '#64748b'}}>PAYMENT HISTORY</h4>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                            <span>Initial Paid:</span>
                            <b>₹{selectedInvoice.paid || selectedInvoice.Paid}</b>
                        </div>
                        {((selectedInvoice.netTotal || selectedInvoice.NetTotal) - (selectedInvoice.paid || selectedInvoice.Paid)) > 0 && (
                            <div style={{ marginTop: '10px' }}>
                                <ActionButton $variant="success" style={{width: '100%', justifyContent: 'center'}} onClick={() => handleClearDue(selectedInvoice)}>
                                    Clear Remaining ₹{(selectedInvoice.netTotal - selectedInvoice.paid).toLocaleString()}
                                </ActionButton>
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ flex: 1, paddingLeft: '4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span>Gross Total</span>
                        <span>₹{selectedInvoice.grossAmount || selectedInvoice.GrossAmount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#ef4444' }}>
                        <span>Discount</span>
                        <span>- ₹{selectedInvoice.discountAmount || selectedInvoice.DiscountAmount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #f1f5f9', fontWeight: 800, fontSize: '1.1rem' }}>
                        <span>Net Payable</span>
                        <span>₹{selectedInvoice.netTotal || selectedInvoice.NetTotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#10b981', fontWeight: 700 }}>
                        <span>Total Paid</span>
                        <span>₹{selectedInvoice.paid || selectedInvoice.Paid}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#ef4444', fontWeight: 800, borderTop: '1px solid #f1f5f9' }}>
                        <span>Balance Due</span>
                        <span>₹{(selectedInvoice.netTotal - selectedInvoice.paid)}</span>
                    </div>
                </div>
              </div>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* --- PRINT ZONE --- */}
      {selectedInvoice && (
        <PrintOnlyArea id="print-zone">
          <div className="invoice-header">
            <div className="brand-info">
              <h1>RIVER ISLAND</h1>
              <p>MEN'S WEAR PREMIUM COLLECTION</p>
              <p>Station Road, Bharuch, Gujarat • +91 9XXXX XXXXX</p>
            </div>
            <div className="bill-details">
              <h2>INVOICE</h2>
              <p># {selectedInvoice.reciptNo || selectedInvoice.ReciptNo}</p>
              <p>Date: {moment(selectedInvoice.billDate || selectedInvoice.BillDate).format("DD/MM/YYYY")}</p>
            </div>
          </div>

          <div className="customer-section">
             <div><b>BILL TO:</b><br/>{selectedInvoice.customerName || selectedInvoice.CustomerName}</div>
             <div style={{textAlign: 'right'}}><b>CONTACT:</b><br/>{selectedInvoice.customerMobile || selectedInvoice.CustomerMobile}</div>
          </div>

          <table className="print-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th style={{textAlign: 'right'}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(selectedInvoice.reciptItems || selectedInvoice.ReciptItems || []).map((p, idx) => (
                <tr key={idx}>
                  <td>{p.productName || p.ProductName}</td>
                  <td>{p.qty || p.Qty}</td>
                  <td>₹{p.rate || p.Rate}</td>
                  <td style={{textAlign: 'right'}}>₹{p.total || p.Total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="footer-summary">
            <div className="total-row"><span>Gross Total:</span><span>₹{selectedInvoice.grossAmount || selectedInvoice.GrossAmount}</span></div>
            <div className="total-row"><span>Discount:</span><span>- ₹{selectedInvoice.discountAmount || selectedInvoice.DiscountAmount}</span></div>
            <div className="total-row grand-total"><span>NET PAYABLE:</span><span>₹{selectedInvoice.netTotal || selectedInvoice.NetTotal}</span></div>
            <div className="total-row" style={{marginTop: '10px'}}><span>Paid Amount:</span><span>₹{selectedInvoice.paid || selectedInvoice.Paid}</span></div>
            <div className="total-row" style={{fontWeight: 900}}><span>Balance Due:</span><span>₹{(selectedInvoice.netTotal - selectedInvoice.paid)}</span></div>
          </div>

          <div style={{clear: 'both', marginTop: '100px', textAlign: 'center', borderTop: '1px solid #000', paddingTop: '20px'}}>
             <p>Thank you for shopping at <b>River Island Men's Wear</b>!</p>
             <p style={{fontSize: '10px'}}>Computer Generated Invoice • No Signature Required</p>
          </div>
        </PrintOnlyArea>
      )}

      {/* --- GLOBAL PRINT CSS --- */}
      <style>{`
        @media screen {
          #print-zone { display: none !important; }
        }
        @media print {
          body * { visibility: hidden !important; background: white !important; }
          #print-zone, #print-zone * { visibility: visible !important; }
          #print-zone {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </Container>
  );
}