import { useEffect, useState, useRef, useMemo } from "react";
import styled from "styled-components";
import { useFormik } from "formik";
import moment from "moment";
import { getRequest, postRequest } from "../../Services/apiService";
import { showToast, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";
import Swal from "sweetalert2";

/* ================= MODERN STYLES (NO CUTS) ================= */
const PageWrapper = styled.div`
  padding: 2.5rem;
  background: #f1f5f9;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #1e293b;

  @media print {
    padding: 0;
    background: white;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  
  @media print { display: none; }
`;

const TitleGroup = styled.div`
  h2 { font-size: 2rem; font-weight: 800; letter-spacing: -0.025em; margin: 0; color: #0f172a; }
  p { color: #64748b; margin: 4px 0 0 0; font-size: 0.95rem; }
`;

/* New Professional Stats Bar */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  @media (max-width: 1024px) { grid-template-columns: 1fr 1fr; }
  @media print { display: none; }
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  .label { font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .value { font-size: 1.5rem; font-weight: 800; margin-top: 8px; color: #0f172a; }
  .icon-box { float: right; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
`;

/* Professional Filter Bar */
const FilterSection = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  @media print { display: none; }
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const StatusBadge = styled.span`
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${props => props.$due ? '#fff1f2' : '#ecfdf5'};
  color: ${props => props.$due ? '#e11d48' : '#10b981'};
  border: 1px solid ${props => props.$due ? '#fecdd3' : '#a7f3d0'};
`;

const BillingLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
`;

const ScanSection = styled.div`
  background: #ffffff;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  i { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
`;

const ModernInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 44px;
  background: #f8fafc;
  border: 2px solid #f1f5f9;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  &:focus { outline: none; border-color: #6366f1; background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
`;

const CartTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th { padding: 16px; text-align: left; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
  td { padding: 16px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
`;

const ItemInfo = styled.div`
  .name { font-weight: 600; color: #1e293b; display: block; }
  .meta { font-size: 0.8rem; color: #64748b; margin-top: 2px; }
`;

const SidebarCard = styled(Card)`
  padding: 1.5rem;
  position: sticky;
  top: 2rem;
`;

const SummaryBox = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  .label { color: #64748b; font-size: 0.9rem; }
  .total { font-size: 1.75rem; font-weight: 800; color: #6366f1; }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${props => props.$primary ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#fff'};
  color: ${props => props.$primary ? 'white' : '#64748b'};
  box-shadow: ${props => props.$primary ? '0 4px 12px rgba(99, 102, 241, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)'};
  border: 1px solid ${props => props.$primary ? 'transparent' : '#e2e8f0'};
  &:hover { transform: translateY(-1px); filter: brightness(1.1); }
  &:active { transform: translateY(0); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(Card)`
  max-width: 850px;
  width: 100%;
  max-height: 95vh;
  overflow-y: auto;
  position: relative;
  padding: 2.5rem;
`;

/* ================= HELPERS ================= */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

/* ================= MAIN COMPONENT ================= */
export default function ReceiptMaster() {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [paymentList, setPaymentList] = useState([{ mode: "Cash", amount: "" }]);
  const [nextSeqNo, setNextSeqNo] = useState(1);
  const scanRef = useRef(null);

  /* New Filter States */
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState(moment().startOf('month').format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));

  useEffect(() => { fetchReceipts(); }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await getRequest("ReciptMaster/GetAllRecipts");
      if (res?.status === "OK") setReceipts(res.result || []);
    } catch (err) {
      showError("Fetch Failed", "Could not load history.");
    } finally { setLoading(false); }
  };

  /* ================= SEQUENCE LOGIC ================= */
  const calculateNextReceiptNo = () => {
    if (!receipts || receipts.length === 0) {
      setNextSeqNo(1);
      return;
    }
    const nos = receipts
      .map(r => parseInt(r.reciptNo || r.ReciptNo) || 0)
      .filter(n => n > 0 && n < 50000);

    if (nos.length === 0) setNextSeqNo(1);
    else {
      const maxNo = Math.max(...nos);
      setNextSeqNo(maxNo + 1);
    }
  };

  useEffect(() => {
    if (view === "add") {
      setTimeout(() => scanRef.current?.focus(), 200);
      calculateNextReceiptNo();
    }
  }, [view, receipts]);

  /* ================= FILTERED DATA & ANALYTICS ================= */
  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => {
      const rDate = moment(r.billDate || r.BillDate);
      const isWithinDate = rDate.isBetween(startDate, endDate, 'day', '[]');
      
      const searchData = `${r.reciptNo} ${r.customerName} ${r.customerMobile}`.toLowerCase();
      const isSearchMatch = searchData.includes(searchTerm.toLowerCase());

      const net = r.netTotal || r.NetTotal || 0;
      const paid = r.paid || r.Paid || 0;
      const isDue = (net - paid) > 0.5;

      const isStatusMatch = statusFilter === "All" || 
                           (statusFilter === "Settled" && !isDue) || 
                           (statusFilter === "Due" && isDue);

      return isWithinDate && isSearchMatch && isStatusMatch;
    }).sort((a,b) => (b.id || b.Id) - (a.id || a.Id));
  }, [receipts, searchTerm, statusFilter, startDate, endDate]);

  const dashboardStats = useMemo(() => {
    const totalRevenue = filteredReceipts.reduce((acc, r) => acc + (r.netTotal || r.NetTotal || 0), 0);
    const totalCollected = filteredReceipts.reduce((acc, r) => acc + (r.paid || r.Paid || 0), 0);
    const totalOutstanding = totalRevenue - totalCollected;
    return { revenue: totalRevenue, collected: totalCollected, outstanding: totalOutstanding, count: filteredReceipts.length };
  }, [filteredReceipts]);

  /* ================= ACTION HANDLERS ================= */
  const handleViewReceipt = async (receipt) => {
    setLoading(true);
    try {
      const res = await getRequest(`ReciptMaster/GetReciptById/${receipt.id || receipt.Id}`);
      if (res?.status === "OK") setSelectedReceipt(res.result);
    } catch (err) {
      showError("Error", "Could not load details.");
    } finally { setLoading(false); }
  };

  const handleSettleBalance = async (receipt) => {
    const net = receipt.netTotal || receipt.NetTotal || 0;
    const paid = receipt.paid || receipt.Paid || 0;
    const remaining = net - paid;

    const { value: formValues } = await Swal.fire({
      title: 'Settle Payment',
      html: `
        <div style="text-align: left;">
          <label style="font-size: 0.8rem; font-weight: 700;">PAYMENT AMOUNT</label>
          <input id="swal-amount" class="swal2-input" type="number" value="${remaining.toFixed(2)}">
          <label style="font-size: 0.8rem; font-weight: 700;">MODE</label>
          <select id="swal-mode" class="swal2-input">
            <option value="Cash">Cash</option>
            <option value="UPI">UPI / GPay</option>
            <option value="Card">Card</option>
          </select>
        </div>
      `,
      confirmButtonText: 'Record Payment',
      confirmButtonColor: '#6366f1',
      showCancelButton: true,
      preConfirm: () => ({
        amount: document.getElementById('swal-amount').value,
        mode: document.getElementById('swal-mode').value
      })
    });

    if (formValues) {
      setLoading(true);
      try {
        const payload = {
          financialYearId: localStorage.getItem("FyId") || 1,
          ReciptMasterId: receipt.id || receipt.Id,
          Amount: parseFloat(formValues.amount),
          PaymentMode: formValues.mode,
          PaymentDate: moment().format("YYYY-MM-DD")
        };
        const res = await postRequest("ReciptMaster/AddDuesPayment", payload);
        if (res.status === "OK") {
          showToast("success", "Balance Updated!");
          fetchReceipts();
        }
      } catch (err) {
        showError("Server Error", "Payment failed.");
      } finally { setLoading(false); }
    }
  };

  /* ================= CART CALCULATIONS ================= */
  const totals = useMemo(() => {
    const gross = cart.reduce((acc, curr) => acc + (Number(curr.rate) * Number(curr.qty)), 0);
    const totalGst = cart.reduce((acc, curr) => {
      const lineTotal = (Number(curr.rate) * Number(curr.qty));
      return acc + (lineTotal * (Number(curr.rateGST) || 0) / 100);
    }, 0);
    const net = gross + totalGst;
    const totalPaid = paymentList.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    return {
      GrossAmount: gross,
      GSTAmount: totalGst,
      NetTotal: net,
      TotalPaid: totalPaid,
      DueAmount: Math.max(0, net - totalPaid)
    };
  }, [cart, paymentList]);

  useEffect(() => {
    if (paymentList.length === 1 && totals.NetTotal > 0) {
      setPaymentList([{ ...paymentList[0], amount: totals.NetTotal.toFixed(2) }]);
    }
  }, [totals.NetTotal]);

  /* ================= FORM SUBMISSION ================= */
  const formik = useFormik({
    initialValues: {
      BillDate: moment().format("YYYY-MM-DD"),
      CustomerName: "",
      CustomerMobile: "",
      FinancialYearId: parseInt(localStorage.getItem("FyId") || 1),
      StaffMasterId: JSON.parse(localStorage.getItem("user"))?.id || 1
    },
    onSubmit: async (values) => {
      if (cart.length === 0) return showError("Empty Cart", "Scan items first.");
      setLoading(true);
      
      const payload = {
        ReciptNo: nextSeqNo.toString(),
        BillDate: values.BillDate,
        CustomerName: values.CustomerName || "Walk-in Customer",
        CustomerMobile: values.CustomerMobile || "0000000000",
        FinancialYearId: values.FinancialYearId,
        StaffMasterId: values.StaffMasterId,
        GrossAmount: totals.GrossAmount,
        GSTAmount: totals.GSTAmount,
        NetTotal: totals.NetTotal,
        Paid: totals.TotalPaid,
        ReciptItems: cart.map(item => ({
          Name: item.name,
          StockMasterId: item.stockId,
          Rate: item.rate,
          Qty: item.qty,
          Amount: item.rate * item.qty,
          Total: (item.rate * item.qty) * (1 + (item.rateGST || 0) / 100)
        })),
        ReciptPayments: paymentList.filter(p => Number(p.amount) > 0).map(p => ({
          Amount: Number(p.amount),
          PaymentMode: p.mode,
          PaymentDate: values.BillDate,
          FinancialYearId: values.FinancialYearId
        }))
      };

      try {
        const res = await postRequest("ReciptMaster/AddRecipt", payload);
        if (res.status === "OK") {
          showToast("success", "Invoice Printed!");
          setCart([]);
          setPaymentList([{ mode: "Cash", amount: "" }]);
          formik.resetForm();
          setView("list");
          fetchReceipts();
        } else {
          showError("Error", res.message);
        }
      } catch (err) {
        showError("Error", "Check API Connection.");
      } finally { setLoading(false); }
    }
  });

  /* ================= BARCODE SCANNER ================= */
  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    setLoading(true);
    try {
      const res = await getRequest(`StockMaster/GetStockByBarcode/${barcode}`);
      if (res?.status === "OK" && res.result) {
        const item = res.result;
        setCart(prev => {
          const sid = item.id || item.Id;
          const idx = prev.findIndex(c => c.stockId === sid);
          if (idx > -1) {
            const nc = [...prev];
            nc[idx].qty += 1;
            return nc;
          }
          return [...prev, {
            stockId: sid,
            stockCode: item.stockCode || item.StockCode,
            name: item.productName || item.ProductName,
            size: item.size || "N/A",
            color: item.color || "N/A",
            rate: item.salePrice || 0,
            rateGST: item.rateGST || 0,
            qty: 1
          }];
        });
        showToast("success", "Item Added");
      } else { showToast("info", "Stock not found"); }
    } finally {
      setLoading(false);
      setBarcode("");
    }
  };

  /* ================= RENDER ================= */
  return (
    <PageWrapper>
      <PleaseWait show={loading} />

      <Header className="no-print">
        <TitleGroup>
          <h2>{view === "list" ? "Sales & Analytics" : "POS Terminal"}</h2>
          <p>River Island IMS • Bharuch • Enterprise v6.2</p>
        </TitleGroup>
        <ActionButton
          style={{ width: 'auto', padding: '10px 24px' }}
          $primary={view === "list"}
          onClick={() => setView(view === "list" ? "add" : "list")}
        >
          <i className={`fas fa-${view === "list" ? "plus" : "history"}`} />
          {view === "list" ? "Create New Sale" : "Back to Ledger"}
        </ActionButton>
      </Header>

      {view === "list" ? (
        <>
          {/* Dashboard Stats */}
          <StatsGrid>
            <StatCard style={{borderLeft: '4px solid #6366f1'}}>
               <div className="icon-box" style={{background: '#e0e7ff', color: '#6366f1'}}><i className="fas fa-chart-line"/></div>
               <div className="label">Total Sales</div>
               <div className="value">{formatCurrency(dashboardStats.revenue)}</div>
            </StatCard>
            <StatCard style={{borderLeft: '4px solid #10b981'}}>
               <div className="icon-box" style={{background: '#d1fae5', color: '#10b981'}}><i className="fas fa-wallet"/></div>
               <div className="label">Total Collection</div>
               <div className="value">{formatCurrency(dashboardStats.collected)}</div>
            </StatCard>
            <StatCard style={{borderLeft: '4px solid #e11d48'}}>
               <div className="icon-box" style={{background: '#ffe4e6', color: '#e11d48'}}><i className="fas fa-user-clock"/></div>
               <div className="label">Pending Dues</div>
               <div className="value">{formatCurrency(dashboardStats.outstanding)}</div>
            </StatCard>
            <StatCard style={{borderLeft: '4px solid #0f172a'}}>
               <div className="icon-box" style={{background: '#f1f5f9', color: '#0f172a'}}><i className="fas fa-file-invoice"/></div>
               <div className="label">Invoice Count</div>
               <div className="value">{dashboardStats.count}</div>
            </StatCard>
          </StatsGrid>

          {/* Advanced Filter Bar */}
          <FilterSection>
            <div style={{flex: 2, display: 'flex', gap: '10px'}}>
              <div style={{position: 'relative', width: '100%'}}>
                 <i className="fas fa-search" style={{position: 'absolute', left: '12px', top: '12px', color: '#94a3b8'}}/>
                 <input 
                  type="text" 
                  placeholder="Search Invoice #, Name or Mobile..." 
                  style={{width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1px solid #e2e8f0'}}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
               <input type="date" className="swal2-input" style={{margin:0, height: '40px', fontSize: '0.9rem'}} value={startDate} onChange={(e)=>setStartDate(e.target.value)}/>
               <input type="date" className="swal2-input" style={{margin:0, height: '40px', fontSize: '0.9rem'}} value={endDate} onChange={(e)=>setEndDate(e.target.value)}/>
               <select className="swal2-input" style={{margin:0, height: '42px', fontSize: '0.9rem'}} value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
                  <option value="All">All Status</option>
                  <option value="Settled">Fully Paid</option>
                  <option value="Due">Balance Due</option>
               </select>
               <ActionButton style={{width: 'auto', padding: '0 15px'}} onClick={fetchReceipts}>
                 <i className="fas fa-sync-alt"/>
               </ActionButton>
            </div>
          </FilterSection>

          <Card>
            <CartTable>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer Information</th>
                  <th>Bill Date</th>
                  <th>Total Amount</th>
                  <th>Collection</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((r, i) => {
                  const net = r.netTotal || r.NetTotal || 0;
                  const paid = r.paid || r.Paid || 0;
                  const dues = net - paid;
                  const isPaid = dues < 0.5;
                  return (
                    <tr key={i}>
                      <td><span style={{ fontWeight: 800, color: '#6366f1' }}>#{r.reciptNo || r.ReciptNo}</span></td>
                      <td>
                        <div style={{fontWeight: 600}}>{r.customerName || "Walk-in Customer"}</div>
                        <div style={{fontSize: '0.75rem', color: '#64748b'}}>{r.customerMobile || "No Mobile"}</div>
                      </td>
                      <td style={{color: '#64748b'}}>{moment(r.billDate || r.BillDate).format("DD MMM YYYY")}</td>
                      <td style={{ fontWeight: 800 }}>{formatCurrency(net)}</td>
                      <td>
                        <StatusBadge $due={!isPaid}>
                          {isPaid ? "SETTLED" : `DUE: ${formatCurrency(dues)}`}
                        </StatusBadge>
                      </td>
                    
                    </tr>
                  );
                })}
              </tbody>
            </CartTable>
          </Card>
        </>
      ) : (
        <BillingLayout>
          {/* Billing Form Side */}
          <div>
            <Card style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: '#f8fafc' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>CUSTOMER NAME</label>
                  <ModernInput style={{ paddingLeft: '15px' }} placeholder="Walking Customer..." {...formik.getFieldProps('CustomerName')} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>MOBILE NUMBER</label>
                  <ModernInput style={{ paddingLeft: '15px' }} placeholder="+91" {...formik.getFieldProps('CustomerMobile')} />
                </div>
              </div>

              <ScanSection>
                <SearchInputWrapper>
                  <i className="fas fa-barcode" />
                  <form onSubmit={handleScan}>
                    <ModernInput
                      ref={scanRef}
                      placeholder="Scan Garment Barcode..."
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                    />
                  </form>
                </SearchInputWrapper>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>BILL SERIAL NO</div>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#6366f1' }}>#{nextSeqNo}</div>
                </div>
              </ScanSection>

              <CartTable>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Rate</th>
                    <th width="100">Qty</th>
                    <th>Subtotal</th>
                    <th width="50"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <ItemInfo>
                          <span className="name">{item.name}</span>
                          <span className="meta">{item.stockCode} • Size: {item.size} | Color: {item.color}</span>
                        </ItemInfo>
                      </td>
                      <td>{formatCurrency(item.rate)}</td>
                      <td>
                        <ModernInput
                          type="number"
                          style={{ padding: '6px 10px', textAlign: 'center' }}
                          value={item.qty}
                          onChange={e => {
                            const nc = [...cart];
                            nc[idx].qty = Math.max(1, Number(e.target.value));
                            setCart(nc);
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(item.rate * item.qty)}</td>
                      <td>
                        <i className="fas fa-trash-alt"
                          style={{ color: '#e11d48', cursor: 'pointer', fontSize: '0.9rem' }}
                          onClick={() => setCart(cart.filter((_, i) => i !== idx))} />
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                        <i className="fas fa-shopping-bag" style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block', opacity: 0.3 }} />
                        No items scanned. Ready to scan garment barcodes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </CartTable>
            </Card>
          </div>

          {/* POS Summary Sidebar */}
          <SidebarCard>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <i className="fas fa-shopping-cart" style={{color: '#6366f1'}}/> Checkout Details
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Item Gross Total</span>
              <span>{formatCurrency(totals.GrossAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1.5rem' }}>
              <span style={{ color: '#64748b' }}>GST Surcharge</span>
              <span style={{ color: '#10b981' }}>+ {formatCurrency(totals.GSTAmount)}</span>
            </div>

            <SummaryBox>
              <div className="label">Amount Payable</div>
              <div className="total">{formatCurrency(totals.NetTotal)}</div>
            </SummaryBox>

            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', display: 'block' }}>SPLIT PAYMENT & MODE</label>
            {paymentList.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <select
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', flex: 1 }}
                  value={p.mode}
                  onChange={e => {
                    const nl = [...paymentList];
                    nl[i].mode = e.target.value;
                    setPaymentList(nl);
                  }}
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                </select>
                <ModernInput
                  style={{ padding: '8px 12px', flex: 1.5 }}
                  type="number"
                  placeholder="0.00"
                  value={p.amount}
                  onChange={e => {
                    const nl = [...paymentList];
                    nl[i].amount = e.target.value;
                    setPaymentList(nl);
                  }}
                />
              </div>
            ))}

            <ActionButton 
               onClick={() => setPaymentList([...paymentList, { mode: 'UPI', amount: totals.DueAmount.toFixed(2) }])} 
               style={{ marginBottom: '1.5rem', fontSize: '0.8rem', background: '#f1f5f9' }}
            >
              <i className="fas fa-plus" /> Add Split Payment
            </ActionButton>

            {totals.DueAmount > 0.01 && (
              <div style={{ padding: '12px', background: '#fff1f2', borderRadius: '12px', color: '#e11d48', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem', fontWeight: 600, border: '1px dashed #fecdd3' }}>
                Balance to Pay: {formatCurrency(totals.DueAmount)}
              </div>
            )}

            <ActionButton $primary onClick={formik.handleSubmit}>
              <i className="fas fa-check-circle" /> VALIDATE & SAVE BILL
            </ActionButton>
          </SidebarCard>
        </BillingLayout>
      )}

      {/* ================= VIEW RECEIPT MODAL (NO CUTS) ================= */}
      {selectedReceipt && (
        <ModalOverlay onClick={() => setSelectedReceipt(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <TitleGroup>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                   <img src="/logo192.png" alt="logo" style={{height: '30px'}} />
                   <h2 style={{fontSize: '1.5rem'}}>TAX INVOICE #{selectedReceipt.reciptNo || selectedReceipt.ReciptNo}</h2>
                </div>
                <p>{moment(selectedReceipt.billDate || selectedReceipt.BillDate).format("LLL")}</p>
              </TitleGroup>
              <i className="fas fa-times no-print" style={{ fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSelectedReceipt(null)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Customer Detail</h4>
                <p style={{ fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>{selectedReceipt.customerName || "Walk-in Customer"}</p>
                <p style={{ color: '#64748b', margin: 0 }}>{selectedReceipt.customerMobile || "No Mobile Provided"}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Merchant</h4>
                <p style={{ margin: 0, fontWeight: 800 }}>River Island Fashion</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Bharuch Main Road, Gujarat</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>GSTIN: 24XXXXXXXXXXXX</p>
              </div>
            </div>

            <CartTable style={{ marginBottom: '2rem' }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(selectedReceipt.reciptItems || []).map((item, idx) => (
                  <tr key={idx}>
                    <td>
                        <div style={{fontWeight: 700}}>{item.productName || item.name || `Garment ID: ${item.stockMasterId}`}</div>
                        <div style={{fontSize: '0.75rem', color: '#64748b'}}>Style: {item.stockCode}</div>
                    </td>
                    <td>{item.qty}</td>
                    <td>{formatCurrency(item.rate)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(item.total || (item.rate * item.qty))}</td>
                  </tr>
                ))}
              </tbody>
            </CartTable>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{color: '#64748b'}}>Item Subtotal</span>
                <span>{formatCurrency(selectedReceipt.grossAmount || selectedReceipt.GrossAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{color: '#64748b'}}>GST (Output)</span>
                <span>{formatCurrency(selectedReceipt.gstAmount || selectedReceipt.GSTAmount)}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '15px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.4rem' }}>
                <span>Total Amount</span>
                <span style={{ color: '#6366f1' }}>{formatCurrency(selectedReceipt.netTotal || selectedReceipt.NetTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', marginTop: '10px', fontWeight: 700 }}>
                <span>Paid via Modes</span>
                <span>- {formatCurrency(selectedReceipt.paid || selectedReceipt.Paid)}</span>
              </div>
              
              {((selectedReceipt.netTotal || selectedReceipt.NetTotal) - (selectedReceipt.paid || selectedReceipt.Paid)) > 0.5 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e11d48', marginTop: '12px', fontWeight: 900, paddingTop: '12px', borderTop: '1px solid #fecdd3' }}>
                  <span>REMAINING BALANCE</span>
                  <span>{formatCurrency((selectedReceipt.netTotal || selectedReceipt.NetTotal) - (selectedReceipt.paid || selectedReceipt.Paid))}</span>
                </div>
              )}
            </div>

            <div style={{marginTop: '1.5rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center'}}>
               Thank you for shopping at Global Collection!
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }} className="no-print">
              <ActionButton style={{background: '#0f172a', color: 'white'}} onClick={() => window.print()}>
                <i className="fas fa-print"/> Print Invoice
              </ActionButton>
              <ActionButton $primary onClick={() => setSelectedReceipt(null)}>
                Dismiss
              </ActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}