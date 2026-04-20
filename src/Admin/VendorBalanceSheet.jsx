import React, { useMemo, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { postRequest, getRequest } from "../../Services/apiService";
import { showToast, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= THE PRINT ENGINE & GLOBAL STYLES ================= */
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700&display=swap');

  @media print {
    body * { visibility: hidden; background: white !important; }
    #printable-area, #printable-area * { visibility: visible; }
    
    #printable-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .no-print { display: none !important; }
    
    /* Force 1 Page Layout */
    @page { 
      size: A4 portrait; 
      margin: 8mm; 
    }

    /* Reduce spacing for print to fit more data */
    td, th { padding: 8px 12px !important; font-size: 0.75rem !important; }
    h1 { font-size: 1.5rem !important; }
  }
`;

/* ================= MODERN STYLED COMPONENTS ================= */
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  @media print { display: none; }
`;

const LedgerPaper = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;

  @media print {
    padding: 10px;
    box-shadow: none;
    border: none;
  }
`;

const BrandHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 3px solid #0f172a;
  padding-bottom: 15px;
  margin-bottom: 20px;

  .brand-meta h1 { 
    margin: 0; 
    font-size: 1.8rem; 
    font-weight: 800; 
    color: #0f172a; 
    letter-spacing: -0.02em;
  }
  .brand-meta p { margin: 2px 0 0 0; color: #64748b; font-size: 0.9rem; }
  
  .statement-label {
    text-align: right;
    h2 { margin: 0; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
    p { margin: 0; font-weight: 700; color: #0f172a; font-size: 0.9rem; }
  }
`;

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Equal 50-50 split like image */
  gap: 20px;
  margin-bottom: 20px;

  @media print { 
    gap: 0; 
    border: 1px solid #e2e8f0; 
  }
`;

const LedgerPane = styled.div`
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  overflow: hidden;

  @media print { 
    border-radius: 0; 
    border: none; 
    &:first-child { border-right: 1px solid #e2e8f0; } 
  }
`;

const PaneTitle = styled.div`
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #475569;
  text-align: center; /* Balanced look */
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  th {
    text-align: left;
    padding: 10px 15px;
    background: #fdfdfd;
    color: #94a3b8;
    font-weight: 700;
    font-size: 0.65rem;
    text-transform: uppercase;
    border-bottom: 1px solid #f1f5f9;
  }

  td {
    padding: 10px 15px;
    border-bottom: 1px solid #f8fafc;
    color: #334155;
    vertical-align: top;
  }

  .amt { font-family: 'JetBrains Mono', monospace; font-weight: 700; text-align: right; }
  .dr-val { color: #e11d48; }
  .cr-val { color: #059669; }

  tfoot td {
    padding: 15px;
    background: #f8fafc;
    font-weight: 800;
    font-size: 0.85rem;
    border-top: 1px solid #e2e8f0;
  }
`;

const FinalSummary = styled.div`
  background: #0f172a;
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .amount-box {
    h4 { margin: 0; font-size: 0.7rem; text-transform: uppercase; opacity: 0.6; }
    .val { font-size: 1.8rem; font-weight: 800; margin-top: 2px; }
  }

  .status-badge {
    background: ${props => props.$isDue ? "rgba(244, 63, 94, 0.2)" : "rgba(16, 185, 129, 0.2)"};
    color: ${props => props.$isDue ? "#fb7185" : "#34d399"};
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 800;
    font-size: 0.8rem;
    border: 1px solid currentColor;
  }

  @media print {
    background: white; color: black; border: 2px solid #000; border-radius: 0;
    .val { font-size: 1.5rem; }
    .status-badge { border: 1px solid #000; color: #000; }
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  display: flex; align-items: center; gap: 8px;
  font-size: 0.85rem;

  &.back { background: white; border-color: #e2e8f0; color: #64748b; }
  &.print { background: #0f172a; color: white; }
  &.pay { background: #10b981; color: white; }
`;

/* ================= MODAL STYLES ================= */
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
`;

const ModalCard = styled.div`
  background: white; width: 400px; padding: 30px; border-radius: 20px;
  h2 { margin: 0 0 20px 0; font-size: 1.25rem; font-weight: 800; }
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
  label { display: block; font-size: 0.7rem; font-weight: 800; color: #94a3b8; margin-bottom: 5px; }
  input, select {
    width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.9rem;
    &:focus { outline: none; border-color: #0f172a; }
  }
`;

/* ================= COMPONENT LOGIC ================= */

export default function VendorBalanceSheet({ data: initialData, onBack }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  const info = data?.result?.balanceSheet;
  const openingBalance = data?.result?.openingBalance || 0;

  const refreshLedger = async () => {
    setLoading(true);
    try {
      const vendorId = info?.id || info?.Id;
      const res = await getRequest(`PaymentMaster/GetBalanceSheet/${vendorId}`);
      if (res.status === "OK") setData(res);
    } catch (err) { showError("Error", err); }
    finally { setLoading(false); }
  };

  const totals = useMemo(() => {
    const purchaseTotal = info?.purchases?.reduce((sum, p) => sum + (p.NetAmount || p.netAmount || 0), 0) || 0;
    const paymentTotal = info?.payments?.reduce((sum, p) => sum + (p.Amount || p.amount || 0), 0) || 0;
    const totalDr = openingBalance + purchaseTotal;
    return { totalDr, totalCr: paymentTotal, closing: totalDr - paymentTotal };
  }, [info, openingBalance]);

  const formatINR = (amt) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(amt || 0);

  const payFormik = useFormik({
    initialValues: { 
      VendorId: info?.id || info?.Id, 
      Amount: "", 
      PaymentMode: "Bank Transfer", 
      Reference: "", 
      Remark: "Ledger Payment",
      FinancialYearId: info?.purchases?.[0]?.FinancialYearId || 1,
      PaymentDate: new Date().toISOString()
    },
    validationSchema: Yup.object({
      Amount: Yup.number().required("Required").positive(),
      PaymentMode: Yup.string().required("Required")
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await postRequest("PaymentMaster/AddPayment", values);
        if (res.status === "OK") {
          showToast("success", "Payment successful");
          setShowPayModal(false);
          payFormik.resetForm();
          await refreshLedger();
        } else { showError("Error", res.message); }
      } catch (err) { showError("Error", err); }
      finally { setLoading(false); }
    }
  });

  if (!info) return null;

  return (
    <Container>
      <GlobalStyle />
      <PleaseWait show={loading} />
      
      <Toolbar>
        <Button className="back" onClick={onBack}>
          <i className="fas fa-chevron-left"></i> Directory
        </Button>
        <div style={{display:'flex', gap:'10px'}}>
          <Button className="print" onClick={() => window.print()}>
            <i className="fas fa-print"></i> Print Statement
          </Button>
          <Button className="pay" onClick={() => setShowPayModal(true)}>
            <i className="fas fa-plus"></i> Record Payout
          </Button>
        </div>
      </Toolbar>

      <LedgerPaper id="printable-area">
        <BrandHeader>
          <div className="brand-meta">
            <h1>{info.name || info.Name}</h1>
            <p><i className="fas fa-map-marker-alt"></i> {info.address || info.Address}</p>
          </div>
          <div className="statement-label">
            <h2>Ledger Statement</h2>
            <p>{new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</p>
          </div>
        </BrandHeader>

        <GridWrapper>
          {/* LEFT SIDE: PURCHASES & DEBITS */}
          <LedgerPane>
            <PaneTitle>Purchases & Debits</PaneTitle>
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bill Info</th>
                  <th style={{textAlign:'right'}}>Debit (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{background:'#fffaf0'}}>
                  <td>-</td>
                  <td style={{fontWeight:700}}>Balance B/F</td>
                  <td className="amt dr-val">{formatINR(openingBalance)}</td>
                </tr>
                {info.purchases?.map((p, i) => (
                  <tr key={i}>
                    <td>{new Date(p.billDate || p.BillDate).toLocaleDateString('en-GB')}</td>
                    <td>
                      <div style={{fontWeight:700}}># {p.billNo || p.BillNo}</div>
                      <small style={{color:'#94a3b8'}}>Purchase Invoice</small>
                    </td>
                    <td className="amt dr-val">{formatINR(p.netAmount || p.NetAmount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2">Gross Debit Value</td>
                  <td className="amt">{formatINR(totals.totalDr)}</td>
                </tr>
              </tfoot>
            </Table>
          </LedgerPane>

          {/* RIGHT SIDE: PAYMENTS & CREDITS */}
          <LedgerPane>
            <PaneTitle>Payments & Credits</PaneTitle>
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Ref / Mode</th>
                  <th style={{textAlign:'right'}}>Credit (₹)</th>
                </tr>
              </thead>
              <tbody>
                {info.payments?.length === 0 ? (
                  <tr><td colSpan="3" style={{textAlign:'center', padding:'40px', color:'#94a3b8'}}>No credits recorded</td></tr>
                ) : info.payments?.map((py, i) => (
                  <tr key={i}>
                    <td>{new Date(py.paymentDate || py.PaymentDate).toLocaleDateString('en-GB')}</td>
                    <td>
                      <div style={{fontWeight:700}}>{py.paymentMode || py.PaymentMode}</div>
                      <small style={{color:'#94a3b8'}}>Ref: {py.reference || 'N/A'}</small>
                    </td>
                    <td className="amt cr-val">{formatINR(py.amount || py.Amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2">Gross Credit Value</td>
                  <td className="amt">{formatINR(totals.totalCr)}</td>
                </tr>
              </tfoot>
            </Table>
          </LedgerPane>
        </GridWrapper>

        <FinalSummary $isDue={totals.closing > 0}>
          <div className="amount-box">
            <h4>Outstanding Balance</h4>
            <div className="val">{formatINR(Math.abs(totals.closing))}</div>
          </div>
          <div className="status-badge">
            {totals.closing > 0 ? "PAYMENT PENDING" : "ACCOUNT SETTLED"}
          </div>
        </FinalSummary>
      </LedgerPaper>

      {/* MODAL */}
      {showPayModal && (
        <ModalOverlay onClick={(e) => e.target === e.currentTarget && setShowPayModal(false)}>
          <ModalCard>
            <h2>Record Payment</h2>
            <form onSubmit={payFormik.handleSubmit}>
              <InputGroup>
                <label>Amount (₹)</label>
                <input name="Amount" type="number" {...payFormik.getFieldProps('Amount')} placeholder="Enter amount" autoFocus />
              </InputGroup>

              <InputGroup>
                <label>Mode</label>
                <select name="PaymentMode" {...payFormik.getFieldProps('PaymentMode')}>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI / GPay">UPI / GPay</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </InputGroup>

              <InputGroup>
                <label>Ref Number</label>
                <input name="Reference" {...payFormik.getFieldProps('Reference')} placeholder="Transaction ID" />
              </InputGroup>

              <div style={{display:'flex', gap:'10px', marginTop:'25px'}}>
                <Button type="submit" className="pay" style={{flex:1, justifyContent:'center'}} disabled={loading}>
                  Confirm
                </Button>
                <Button type="button" className="back" style={{flex:1, justifyContent:'center'}} onClick={() => setShowPayModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
}