import { useEffect, useState, useRef, useMemo } from "react";
import styled from "styled-components";
import { useFormik } from "formik";
import moment from "moment";
import { getRequest, postRequest } from "../../Services/apiService";
import { showToast, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= PREMIUM MODERN STYLES ================= */
const POSWrapper = styled.div`
  display: flex;
  height: calc(100vh - 65px);
  background: #f1f5f9;
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
`;

const MainBillingArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 25px;
  gap: 20px;
  overflow-y: auto;
`;

const SideCheckoutPanel = styled.div`
  width: 440px;
  background: #ffffff;
  border-left: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0,0,0,0.04);
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const SearchHeader = styled(Card)`
  display: flex;
  align-items: center;
  gap: 15px;
  background: linear-gradient(to right, #ffffff, #f8faff);
  .scan-icon { 
    font-size: 1.4rem; 
    color: #6366f1;
    background: #eef2ff;
    padding: 10px;
    border-radius: 12px;
  }
`;

const ModernInput = styled.input`
  width: 100%;
  padding: 14px 18px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:focus { 
    border-color: #6366f1; 
    outline: none; 
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    background: #fff;
  }
  &::placeholder { color: #94a3b8; }
`;

const ModernSelect = styled.select`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  &:focus { border-color: #6366f1; }
`;

const TableWrapper = styled(Card)`
  flex: 1;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th { 
    background: #f8fafc; 
    padding: 14px 20px; 
    text-align: left; 
    font-size: 0.75rem; 
    text-transform: uppercase; 
    color: #64748b; 
    font-weight: 800;
    letter-spacing: 0.05em;
  }
  td { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 0.95rem; }
  tr:last-child td { border-bottom: none; }
  tr:hover { background: #fcfdfe; }
`;

const PriceTag = styled.span`
  font-weight: 700;
  color: #0f172a;
`;

const SummaryBox = styled.div`
  padding: 30px;
  flex: 1;
  overflow-y: auto;
  h3 { 
    margin-bottom: 25px; 
    font-size: 1.25rem; 
    color: #1e293b; 
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 10px;
    &::before { content: ''; width: 4px; height: 20px; background: #6366f1; border-radius: 4px; }
  }
`;

const BillRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 500;
  &.total { 
    font-size: 1.6rem; 
    color: #1e293b; 
    font-weight: 900; 
    margin-top: 20px; 
    border-top: 2px dashed #e2e8f0; 
    padding-top: 20px; 
  }
  &.discount-row { color: #059669; background: #ecfdf5; padding: 8px 12px; border-radius: 8px; margin: 10px 0; }
  &.credit-row { color: #dc2626; font-weight: 600; }
  &.due-row { 
    color: #d97706; 
    font-weight: 800; 
    background: #fffbeb; 
    padding: 12px; 
    border-radius: 10px;
    border: 1px solid #fef3c7;
    margin-top: 10px;
  }
`;

const PaymentContainer = styled.div`
  background: #f8fafc;
  padding: 20px;
  border-radius: 16px;
  border: 1.5px solid #e2e8f0;
  margin-bottom: 25px;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
  &:hover { 
    transform: translateY(-2px); 
    box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.4);
    filter: brightness(1.1);
  }
  &:active { transform: translateY(0); }
`;

/* ================= MAIN COMPONENT ================= */
export default function GlobalCollectionIMS() {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [receiptNo, setReceiptNo] = useState(1);
  const [availableCredit, setAvailableCredit] = useState(0); 
  const [discountPercent, setDiscountPercent] = useState(0);
  
  // Split Payment States
  const [receivedCash, setReceivedCash] = useState(""); 
  const [receivedUPI, setReceivedUPI] = useState("");

  const scanRef = useRef(null);

  useEffect(() => {
    fetchLatestReceiptNo();
    const handleKeys = (e) => {
      if (e.key === "F2") { e.preventDefault(); scanRef.current?.focus(); }
      if (e.key === "F10") { e.preventDefault(); formik.handleSubmit(); }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, []);

  const fetchLatestReceiptNo = async () => {
    try {
      const res = await getRequest("ReciptMaster/GetAllRecipts");
      if (res?.status === "OK" && res.result) {
        const ids = res.result.map(r => parseInt(r.reciptNo || r.ReciptNo) || 0);
        setReceiptNo((ids.length > 0 ? Math.max(...ids) : 0) + 1);
      }
    } catch (err) { console.error("Error", err); }
  };

  const checkCreditNote = async (mobile) => {
    try {
      const res = await getRequest(`SalesReturn/GetCreditNoteByMobile?mobile=${mobile}`);
      if (res?.status === "OK" && res.result) {
        const amt = Number(res.result.amount || 0);
        setAvailableCredit(amt);
        if(amt > 0) showToast("info", `Credit balance found: ₹${amt}`);
      } else { setAvailableCredit(0); }
    } catch (err) { setAvailableCredit(0); }
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (item.rate * item.qty), 0);
    const tax = cart.reduce((acc, item) => acc + ((item.rate * item.qty) * (item.rateGST / 100)), 0);
    const gross = subtotal + tax;
    const discountAmt = (gross * discountPercent) / 100;
    const netTotal = Math.max(0, Math.round(gross - discountAmt - availableCredit)); 
    
    const cashVal = Number(receivedCash) || 0;
    const upiVal = Number(receivedUPI) || 0;
    const totalReceived = cashVal + upiVal;
    const dues = Math.max(0, netTotal - totalReceived);

    return { subtotal, tax, gross, discountAmt, total: netTotal, totalReceived, dues };
  }, [cart, availableCredit, discountPercent, receivedCash, receivedUPI]);

  const formik = useFormik({
    initialValues: { CustomerName: "", CustomerMobile: "" },
    onSubmit: async (values) => {
      if (cart.length === 0) return showError("Cart Empty", "Please add items first.");
      
      setLoading(true);
      
      const payments = [];
      if (Number(receivedCash) > 0) payments.push({ Amount: Number(receivedCash), PaymentMode: "Cash", PaymentDate: moment().format("YYYY-MM-DD"), FinancialYearId: parseInt(localStorage.getItem("FyId") || 1) });
      if (Number(receivedUPI) > 0) payments.push({ Amount: Number(receivedUPI), PaymentMode: "UPI", PaymentDate: moment().format("YYYY-MM-DD"), FinancialYearId: parseInt(localStorage.getItem("FyId") || 1) });

      const payload = {
        ReciptNo: receiptNo.toString(),
        BillDate: moment().format("YYYY-MM-DD"),
        CustomerName: values.CustomerName || "Walk-in Customer",
        CustomerMobile: values.CustomerMobile || "0000000000",
        GrossAmount: totals.subtotal,
        GSTAmount: totals.tax,
        DiscountAmount: totals.discountAmt,
        CreditAdjusted: availableCredit, 
        NetTotal: totals.total,
        PaidAmount: totals.totalReceived,
        DueAmount: totals.dues, // Managing the Balance Due
        FinancialYearId: parseInt(localStorage.getItem("FyId") || 1),
        StaffMasterId: JSON.parse(localStorage.getItem("user"))?.id || 2,
        ReciptItems: cart.map(item => ({
          StockMasterId: item.stockId,
          Rate: item.rate,
          Qty: item.qty,
          Amount: item.rate * item.qty,
          Total: (item.rate * item.qty) * (1 + (item.rateGST || 0) / 100)
        })),
        ReciptPayments: payments.length > 0 ? payments : []
      };

      try {
        const res = await postRequest("ReciptMaster/AddRecipt", payload);
        if (res?.status === "OK") {
          showToast("success", totals.dues > 0 ? `Saved! Pending Due: ₹${totals.dues}` : "Invoice Generated!");
          setCart([]);
          setAvailableCredit(0);
          setDiscountPercent(0);
          setReceivedCash("");
          setReceivedUPI("");
          formik.resetForm();
          fetchLatestReceiptNo();
        }
      } catch (err) { showError("Error", "Database Error"); }
      finally { setLoading(false); }
    }
  });

  const addItemToCart = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    setLoading(true);
    try {
      const res = await getRequest(`StockMaster/GetStockByBarcode/${barcode}`);
      if (res?.status === "OK" && res.result) {
        const item = res.result;
        setCart(prev => {
          const sid = item.id || item.Id;
          const exists = prev.findIndex(c => c.stockId === sid);
          if (exists > -1) {
            const updated = [...prev]; updated[exists].qty += 1; return updated;
          }
          return [...prev, { stockId: sid, name: item.productName || item.ProductName, rate: item.salePrice || 0, rateGST: item.rateGST || 0, qty: 1 }];
        });
      } else { showToast("info", "Product Not Found"); }
    } finally { setLoading(false); setBarcode(""); }
  };

  return (
    <POSWrapper>
      <PleaseWait show={loading} />
      
      <MainBillingArea>
        <SearchHeader>
          <div className="scan-icon"><i className="fas fa-barcode" /></div>
          <form onSubmit={addItemToCart} style={{ flex: 1 }}>
            <ModernInput ref={scanRef} placeholder="Scan Barcode or Type Product ID (F2)..." value={barcode} onChange={e => setBarcode(e.target.value)} />
          </form>
          <div style={{ textAlign: 'right', borderLeft: '2px solid #f1f5f9', paddingLeft: '25px' }}>
            <small style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>Current Invoice</small>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#6366f1' }}>#{receiptNo}</div>
          </div>
        </SearchHeader>

        <TableWrapper>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <StyledTable>
              <thead><tr><th>Product Details</th><th>Price</th><th width="120">Quantity</th><th>Total</th><th width="60"></th></tr></thead>
              <tbody>
                {cart.length === 0 && (<tr><td colSpan="5" style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                  <i className="fas fa-shopping-basket" style={{ fontSize: '3rem', marginBottom: '15px', display: 'block', opacity: 0.2 }}></i>
                  No items in cart.
                </td></tr>)}
                {cart.map((item, i) => (
                  <tr key={i}>
                    <td><div style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</div><small style={{ color: '#64748b' }}>Tax: {item.rateGST}% Included</small></td>
                    <td><PriceTag>₹{item.rate}</PriceTag></td>
                    <td><ModernInput type="number" value={item.qty} style={{ padding: '8px 12px', textAlign: 'center', height: '40px' }} onChange={e => { const val = Math.max(1, parseInt(e.target.value) || 1); const nc = [...cart]; nc[i].qty = val; setCart(nc); }} /></td>
                    <td><PriceTag>₹{(item.rate * item.qty).toFixed(2)}</PriceTag></td>
                    <td><button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} style={{ border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', padding: '10px', borderRadius: '10px' }}><i className="fas fa-trash-alt" /></button></td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </div>
        </TableWrapper>
      </MainBillingArea>

      <SideCheckoutPanel>
        <SummaryBox>
          <h3>Checkout</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '5px', display: 'block' }}>CONTACT</label>
              <ModernInput placeholder="Mobile No" value={formik.values.CustomerMobile} onChange={(e) => { const val = e.target.value; formik.setFieldValue('CustomerMobile', val); if (val.length === 10) checkCreditNote(val); else setAvailableCredit(0); }} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '5px', display: 'block' }}>NAME</label>
              <ModernInput placeholder="Customer Name" {...formik.getFieldProps('CustomerName')} />
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '5px', display: 'block' }}>APPLY DISCOUNT</label>
            <ModernSelect value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))}>
              <option value="0">Regular Price (0%)</option><option value="5">Loyalty Discount (5%)</option><option value="10">Special Offer (10%)</option><option value="20">Flash Sale (20%)</option>
            </ModernSelect>
          </div>

          <PaymentContainer>
            <label style={{ fontSize: '0.75rem', fontWeight: 900, color: '#4f46e5', display: 'block', marginBottom: '15px', letterSpacing: '0.05em' }}>PAYMENT COLLECTION</label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <small style={{ fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '5px' }}>Cash Amount</small>
                <ModernInput 
                  type="number" 
                  value={receivedCash} 
                  onChange={(e) => setReceivedCash(e.target.value)} 
                  placeholder="0.00" 
                />
              </div>
              <div style={{ flex: 1 }}>
                <small style={{ fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '5px' }}>UPI / Online</small>
                <ModernInput 
                  type="number" 
                  value={receivedUPI} 
                  onChange={(e) => setReceivedUPI(e.target.value)} 
                  placeholder="0.00" 
                />
              </div>
            </div>
            <button type="button" onClick={() => { setReceivedCash(totals.total); setReceivedUPI(""); }} style={{ marginTop: '12px', width: '100%', background: '#fff', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>Quick Action: Full Cash Payment</button>
          </PaymentContainer>

          <div>
            <BillRow><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></BillRow>
            {totals.discountAmt > 0 && (<BillRow className="discount-row"><span>Discount ({discountPercent}%)</span><span>- ₹{totals.discountAmt.toFixed(2)}</span></BillRow>)}
            {availableCredit > 0 && (<BillRow className="credit-row"><span>Credit Note</span><span>- ₹{availableCredit.toFixed(2)}</span></BillRow>)}
            <BillRow className="total"><span>Net Payable</span><span>₹{totals.total}</span></BillRow>
            
            {/* Visual indicator for Due amount */}
            {totals.dues > 0 && (
              <BillRow className="due-row">
                <span><i className="fas fa-clock" style={{marginRight: '8px'}}/>Remaining Balance (DUE)</span>
                <span>₹{totals.dues}</span>
              </BillRow>
            )}
          </div>
        </SummaryBox>

        <div style={{ padding: '30px', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
          <ActionButton onClick={formik.handleSubmit}>
            <i className="fas fa-check-circle" /> COMPLETE TRANSACTION (F10)
          </ActionButton>
        </div>
      </SideCheckoutPanel>
    </POSWrapper>
  );
}