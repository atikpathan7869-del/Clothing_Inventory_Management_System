import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { useFormik } from "formik";
import moment from "moment";
import { getRequest, postRequest } from "../../Services/apiService";
import { showToast, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= MODERN UI COMPONENTS ================= */
const PageWrapper = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TitleSection = styled.div`
  h2 { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin: 0; }
  p { color: #64748b; margin-top: 4px; font-size: 0.95rem; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  span { color: #64748b; font-size: 0.85rem; font-weight: 600; }
  b { font-size: 1.5rem; color: #0f172a; margin-top: 4px; }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 1.5rem;
  @media (max-width: 1200px) { grid-template-columns: 1fr; }
`;

const GlassCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const SearchBar = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 16px;
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
`;

const StyledInput = styled.input`
  flex: 2;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  &:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
  &:disabled { background: #f1f5f9; cursor: not-allowed; }
`;

const StyledSelect = styled.select`
  flex: 1;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  font-size: 0.95rem;
`;

const PrimaryButton = styled.button`
  background: #0f172a;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover { background: #1e293b; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th { background: #f8fafc; padding: 16px; text-align: left; font-size: 0.8rem; color: #64748b; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; vertical-align: middle; }
`;

const SummaryBox = styled.div`
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
  margin-top: 12px;
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${props => props.type === 'Refund' ? '#fee2e2' : '#e0e7ff'};
  color: ${props => props.type === 'Refund' ? '#b91c1c' : '#4338ca'};
`;

/* ================= MAIN COMPONENT ================= */
export default function SalesReturn() {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [returns, setReturns] = useState([]);
  const [years, setYears] = useState([]);
  
  const [searchNo, setSearchNo] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [originalInvoice, setOriginalInvoice] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [retRes, yearRes] = await Promise.all([
        getRequest("SalesReturn/GetAllSalesReturns"),
        getRequest("Financial_Year/GetAllFinancialYears")
      ]);
      
      if (retRes?.status === "OK") setReturns(retRes.result || []);
      if (yearRes?.status === "OK") {
        setYears(yearRes.result || []);
        const active = yearRes.result.find(y => y.isActive);
        if (active) setSelectedYear(active.id);
      }
    } catch (err) {
      showError("Error", "Initialization failed");
    } finally {
      setLoading(false);
    }
  };

  const findInvoice = async () => {
    if (!searchNo || !selectedYear) return showToast("warning", "Enter Bill No & Select Year");

    setLoading(true);
    try {
      const res = await getRequest(`SalesReturn/GetSalesReturnsByReceiptId/${searchNo}/${selectedYear}`);
      
      if (res?.status === "OK" && res.result?.length > 0) {
        const invoice = res.result[0];
        setOriginalInvoice(invoice);

        setCart((invoice.items || []).map(item => ({
          id: item.id, 
          productName: (typeof item.productName === 'object' ? item.productName.productName : item.productName) || "Unknown Product",
          rate: item.rate || 0,
          soldQty: item.originalQty || 0, 
          availableQty: item.qty || 0,    
          alreadyReturned: item.alreadyReturnedQty || 0,
          gstPer: item.gstPer || 0,
          returnQty: 0,
          isReturning: false
        })));
      } else {
        showToast("error", res.message || "Invoice not found or fully returned");
        setOriginalInvoice(null);
      }
    } catch (err) {
      showError("Search Error", "Could not find receipt");
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const gross = cart.reduce((acc, i) => acc + (i.isReturning ? (i.rate * i.returnQty) : 0), 0);
    const gst = cart.reduce((acc, i) => i.isReturning ? acc + ((i.rate * i.returnQty) * i.gstPer / 100) : acc, 0);
    return { gross, gst, net: gross + gst };
  }, [cart]);

  const ledgerSummary = useMemo(() => {
    const totalAmount = returns.reduce((acc, r) => acc + r.netAmount, 0);
    const totalCount = returns.length;
    return { totalAmount, totalCount };
  }, [returns]);

  const formik = useFormik({
    initialValues: { 
      returnType: "Refund", 
      reason: "", 
      remark: "",
      paymentMode: "Cash" 
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      const selectedItems = cart.filter(i => i.isReturning && i.returnQty > 0);
      if (selectedItems.length === 0) return showError("Validation", "No items selected for return");

      setLoading(true);

      const payload = {
        reciptMasterId: originalInvoice.id,
        staffMasterId: 1, 
        returnDate: new Date(),
        returnType: values.returnType,
        grossAmount: totals.gross,
        gstAmount: totals.gst,
        netAmount: totals.net,
        reason: values.reason,
        remark: values.remark,
        salesReturn_Items: selectedItems.map(i => ({
          reciptItemId: i.id, 
          qty: i.returnQty
        })),
        returnPayments: values.returnType === "Refund" ? [{
          amount: totals.net,
          paymentType: values.paymentMode, 
          paidDate: new Date(),            
          reference: `Refund for Bill #${originalInvoice.reciptNo}`
        }] : []
      };

      try {
        const res = await postRequest("SalesReturn/AddSalesReturn", payload);
        if (res.status === "OK") {
          showToast("success", "Return Processed Successfully");
          setView("list");
          fetchInitialData();
        } else {
            showError("Processing Error", res.result || res.message);
        }
      } catch (err) {
        showError("Fail", "Could not save return record");
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <PageWrapper>
      <PleaseWait show={loading} />

      <Header>
        <TitleSection>
          <h2>{view === "list" ? "Returns Ledger" : "Process New Return"}</h2>
          <p>Global Collection | Bharuch Management System</p>
        </TitleSection>
        <PrimaryButton onClick={() => {
            setView(view === "list" ? "add" : "list");
            setOriginalInvoice(null);
            setCart([]);
            formik.resetForm();
        }}>
          <i className={`fas fa-${view === "list" ? "plus" : "list"}`} />
          {view === "list" ? "New Return Entry" : "Back to History"}
        </PrimaryButton>
      </Header>

      {view === "list" ? (
        <>
          <StatsGrid>
            <StatCard>
              <span>Total Return Records</span>
              <b>{ledgerSummary.totalCount}</b>
            </StatCard>
            <StatCard>
              <span>Total Payout Amount</span>
              <b style={{color: '#ef4444'}}>₹{ledgerSummary.totalAmount.toLocaleString('en-IN')}</b>
            </StatCard>
            <StatCard>
              <span>Financial Year</span>
              <b>{years.find(y => y.id == selectedYear)?.name || "N/A"}</b>
            </StatCard>
          </StatsGrid>

          <GlassCard>
            <Table>
              <thead>
                <tr>
                  <th>Ref No.</th>
                  <th>Customer Details</th>
                  <th>Processed By</th>
                  <th>Return Info</th>
                  <th>Net Payout</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r, idx) => (
                  <tr key={idx}>
                    <td>
                        <div style={{fontWeight: 800, color: '#6366f1'}}>#SR-{r.id}</div>
                        <small style={{color: '#94a3b8'}}>Bill: #{r.receiptNo || r.reciptNo}</small>
                    </td>
                    <td>
                        <div style={{fontWeight: 600}}>{r.customerName || "Walk-in"}</div>
                        <div style={{fontSize: '0.75rem', color: '#64748b'}}>{r.reason || "No reason specified"}</div>
                    </td>
                    <td>{r.staffName}</td>
                    <td>
                        <Badge type={r.returnType}>{r.returnType}</Badge>
                        <div style={{fontSize: '0.75rem', marginTop: '4px', color: '#64748b'}}>Items: {r.items?.length || 0}</div>
                    </td>
                    <td>
                        <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '1rem' }}>₹{r.netAmount.toLocaleString('en-IN')}</div>
                    </td>
                    <td>
                        <div>{moment(r.returnDate).format("DD-MM-YYYY")}</div>
                        <small style={{color: '#94a3b8'}}>{moment(r.returnDate).format("hh:mm A")}</small>
                    </td>
                  </tr>
                ))}
                {returns.length === 0 && (
                    <tr><td colSpan="6" style={{textAlign:'center', padding: '3rem', color:'#94a3b8'}}>No return records found for this period.</td></tr>
                )}
              </tbody>
            </Table>
          </GlassCard>
        </>
      ) : (
        <>
          <SearchBar>
            <StyledInput 
              placeholder="Enter Bill Number (e.g. 101)" 
              value={searchNo} 
              onChange={e => setSearchNo(e.target.value)} 
            />
            <StyledSelect value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              <option value="">Select Financial Year</option>
              {years.map(y => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </StyledSelect>
            <PrimaryButton onClick={findInvoice}><i className="fas fa-search" /> Fetch Invoice</PrimaryButton>
          </SearchBar>

          {originalInvoice && (
            <MainGrid>
              <GlassCard>
                <div style={{ padding: '1.25rem', background: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b>Items in Bill #{originalInvoice.reciptNo}</b>
                  <Badge type="Exchange">Customer: {originalInvoice.customerName}</Badge>
                </div>
                <Table>
                  <thead>
                    <tr>
                      <th width="40"></th>
                      <th>Product</th>
                      <th>Sold / Ret.</th>
                      <th>Available</th>
                      <th width="120">Return Qty</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx} style={{ 
                        background: item.isReturning ? '#fffef0' : 'transparent',
                        opacity: item.availableQty <= 0 ? 0.5 : 1
                      }}>
                        <td>
                          <input 
                            type="checkbox" 
                            disabled={item.availableQty <= 0}
                            checked={item.isReturning}
                            onChange={() => {
                              const nc = [...cart];
                              nc[idx].isReturning = !nc[idx].isReturning;
                              nc[idx].returnQty = nc[idx].isReturning ? 1 : 0;
                              setCart(nc);
                            }}
                          />
                        </td>
                        <td>
                            <div style={{fontWeight: 600}}>{item.productName}</div>
                            <small>Rate: ₹{item.rate}</small>
                        </td>
                        <td>{item.soldQty} / <span style={{color:'#ef4444'}}>{item.alreadyReturned}</span></td>
                        <td style={{fontWeight: 700, color: '#10b981'}}>{item.availableQty}</td>
                        <td>
                          <StyledInput 
                            type="number" 
                            min="0"
                            max={item.availableQty}
                            disabled={!item.isReturning || item.availableQty <= 0}
                            value={item.returnQty}
                            onChange={e => {
                                let val = parseInt(e.target.value);
                                const nc = [...cart];
                                if (isNaN(val) || val < 0) val = 0;
                                if (val > item.availableQty) val = item.availableQty;
                                nc[idx].returnQty = val;
                                setCart(nc);
                            }}
                            style={{padding: '8px', textAlign: 'center'}}
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(item.rate * item.returnQty).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </GlassCard>

              <aside>
                <GlassCard style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginTop: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>Return Details</h3>
                  
                  <Label>Return Type</Label>
                  <StyledSelect {...formik.getFieldProps('returnType')} style={{ width: '100%' }}>
                    <option value="Refund">Refund (Cash/UPI)</option>
                    <option value="Exchange">Exchange (Item Swap)</option>
                    <option value="Credit Note">Credit Note (Wallet)</option>
                  </StyledSelect>

                  {formik.values.returnType === "Refund" && (
                      <>
                        <Label>Refund via Mode</Label>
                        <StyledSelect {...formik.getFieldProps('paymentMode')} style={{ width: '100%' }}>
                            <option value="Cash">Cash Payment</option>
                            <option value="G-Pay / UPI">G-Pay / UPI</option>
                            <option value="PhonePe">PhonePe</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </StyledSelect>
                      </>
                  )}

                  <Label>Reason for Return</Label>
                  <StyledInput 
                    {...formik.getFieldProps('reason')} 
                    placeholder="e.g. Size M too small / Minor defect"
                    style={{ width: '100%' }} 
                  />

                  <Label>Internal Remark</Label>
                  <StyledInput 
                    {...formik.getFieldProps('remark')} 
                    placeholder="Additional notes..."
                    style={{ width: '100%' }} 
                  />

                  <SummaryBox>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Subtotal</span>
                      <span>₹{totals.gross.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
                      <span>Tax Amount</span>
                      <span>₹{totals.gst.toLocaleString('en-IN')}</span>
                    </div>
                    <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '12px 0' }}/>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#ef4444', fontSize: '1.25rem' }}>
                      <span>Net Payout</span>
                      <span>₹{totals.net.toLocaleString('en-IN')}</span>
                    </div>
                  </SummaryBox>

                  <PrimaryButton style={{ width: '100%', padding: '15px', justifyContent: 'center', fontSize: '1rem' }} onClick={formik.handleSubmit}>
                    Confirm & Save Return
                  </PrimaryButton>
                </GlassCard>
              </aside>
            </MainGrid>
          )}
        </>
      )}
    </PageWrapper>
  );
}