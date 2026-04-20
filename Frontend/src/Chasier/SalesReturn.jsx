import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { useFormik } from "formik";
import moment from "moment";
import { getRequest, postRequest } from "../../Services/apiService";
import { showToast, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= MODERN STYLES ================= */
const PageWrapper = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const TopNav = styled.div`
  background: #0f172a;
  color: white;
  padding: 1.2rem 2.5rem;
  border-radius: 18px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.3);
`;

const SearchGlass = styled.div`
  max-width: 850px;
  margin: 3rem auto;
  background: white;
  padding: 3rem;
  border-radius: 30px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
`;

const CustomerHub = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 6px;
    background: #6366f1;
  }

  .field {
    label { display: block; font-size: 0.7rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; }
    span { font-size: 1.1rem; color: #1e293b; font-weight: 700; }
  }
`;

const BillTileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const BillTile = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  border: 2px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  &:hover {
    border-color: #6366f1;
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(99, 102, 241, 0.1);
  }
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  @media (max-width: 1200px) { grid-template-columns: 1fr; }
`;

const ItemBox = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid #e2e8f0;
`;

const MainTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th { text-align: left; padding: 15px; color: #64748b; font-size: 0.75rem; border-bottom: 2px solid #f8fafc; text-transform: uppercase; }
  td { padding: 18px 15px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  height: fit-content;
  position: sticky;
  top: 20px;
`;

const AmountCard = styled.div`
  background: #f0f9ff;
  padding: 1.5rem;
  border-radius: 16px;
  text-align: center;
  margin: 1.5rem 0;
  label { color: #0369a1; font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 5px; }
  .total { font-size: 2.2rem; font-weight: 900; color: #0284c7; }
`;

const MethodGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 1.5rem;
`;

const MethodBtn = styled.button`
  padding: 12px;
  border-radius: 12px;
  border: 2px solid ${props => props.active ? '#6366f1' : '#f1f5f9'};
  background: ${props => props.active ? '#f5f3ff' : 'white'};
  color: ${props => props.active ? '#6366f1' : '#64748b'};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: #6366f1; }
`;

/* ================= COMPONENT ================= */
export default function CashierReturnCredit() {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("search"); 
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [searchNo, setSearchNo] = useState("");
  const [searchType, setSearchType] = useState("receipt");
  
  const [foundBills, setFoundBills] = useState([]);
  const [originalInvoice, setOriginalInvoice] = useState(null);
  const [returnItems, setReturnItems] = useState([]);

  useEffect(() => {
    const init = async () => {
      const res = await getRequest("Financial_Year/GetAllFinancialYears");
      if (res?.status === "OK") {
        setYears(res.result);
        const active = res.result.find(y => y.isActive);
        if (active) setSelectedYear(active.id);
      }
    };
    init();
  }, []);

  const findInvoice = async () => {
    if (!searchNo) return showToast("warning", "Please enter ID or Mobile");
    setLoading(true);
    try {
      const endpoint = searchType === "receipt" 
        ? `SalesReturn/GetSalesReturnsByReceiptId/${searchNo}/${selectedYear}`
        : `SalesReturn/GetSalesReturnsByMobile/${searchNo}/${selectedYear}`;

      const res = await getRequest(endpoint);
      if (res?.status === "OK" && res.result) {
        // --- FIXED LOGIC: Ensure we handle multiple bills for a number ---
        let data = Array.isArray(res.result) ? res.result : [res.result];
        
        if (data.length > 0) {
          // Sort descending: latest bill first (based on ID or date)
          data.sort((a, b) => b.id - a.id); 
          setFoundBills(data);
          setView("select-bill"); // Redirect to the selection screen showing all bills
        } else {
          showError("Notice", "No returnable items found.");
        }
      } else {
        showError("Notice", "No bills found.");
      }
    } catch (err) {
      showError("Error", "Backend Connectivity Failed");
    } finally { setLoading(false); }
  };

  const handleSelectBill = (invoice) => {
    setOriginalInvoice(invoice);
    const rawItems = invoice.items || invoice.reciptItems || [];
    setReturnItems(rawItems.map(item => ({
      ...item,
      returnQty: 0,
      isReturning: false,
      maxPossible: item.qty 
    })));
    setView("process");
  };

  const finalReturnVal = useMemo(() => {
    return returnItems.reduce((sum, i) => {
      if (i.isReturning) {
        const lineVal = i.rate * (i.returnQty || 0);
        const taxVal = (lineVal * (i.gstPer || 0)) / 100;
        return sum + (lineVal + taxVal);
      }
      return sum;
    }, 0);
  }, [returnItems]);

  const formik = useFormik({
    initialValues: { 
      reason: "Size Issue", 
      remarks: "", 
      paymentMode: "CreditNote" 
    },
    onSubmit: async (values) => {
      const selected = returnItems.filter(i => i.isReturning && i.returnQty > 0);
      if (selected.length === 0) return showToast("error", "Please select items and quantity");

      setLoading(true);
      try {
        const returnPayload = {
          reciptMasterId: originalInvoice.id,
          staffMasterId: parseInt(localStorage.getItem("userId") || "1"),
          returnDate: moment().format("YYYY-MM-DD"),
          returnType: values.paymentMode,
          netAmount: Math.round(finalReturnVal),
          reason: values.reason,
          remark: values.remarks,
          salesReturn_Items: selected.map(i => ({
            reciptItemId: i.id,
            qty: i.returnQty,
            rate: i.rate,
            gstPer: i.gstPer,
            stockMasterId: i.stockMasterId
          }))
        };

        const res1 = await postRequest("SalesReturn/AddSalesReturnExchange", returnPayload);
        
        if (res1.status === "OK") {
          if (values.paymentMode === "CreditNote") {
            const creditPayload = {
              salesReturnId: res1.result.id,
              customerId: originalInvoice.customerId,
              amount: Math.round(finalReturnVal),
              expiryDate: moment().add(6, 'months').format("YYYY-MM-DD")
            };
            await postRequest("CreditNote/AddCreditNote", creditPayload);
            showToast("success", "Credit Note added to Wallet!");
          } else {
            showToast("success", `Refund processed via ${values.paymentMode}`);
          }
          resetSystem();
        } else {
          showError("Backend Error", res1.message);
        }
      } catch (err) {
        showError("Process Failed", "Transaction incomplete");
      } finally { setLoading(false); }
    }
  });

  const resetSystem = () => {
    setView("search");
    setSearchNo("");
    setFoundBills([]);
    setOriginalInvoice(null);
    formik.resetForm();
  };

  return (
    <PageWrapper>
      <PleaseWait show={loading} />
      
      <TopNav>
        <h2 style={{ margin: 0 }}>River Island IMS</h2>
        {view !== "search" && (
          <button onClick={resetSystem} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
            CANCEL & RE-SEARCH
          </button>
        )}
      </TopNav>

      {view === "search" && (
        <SearchGlass>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '10px' }}>Sales Return Portal</h1>
            <p style={{ color: '#64748b' }}>Search bill to initiate refund or credit note</p>
          </div>

          <div style={{ display: 'flex', gap: '15px', background: '#f8fafc', padding: '8px', borderRadius: '18px', marginBottom: '2rem' }}>
            <button style={{ flex: 1, padding: '15px', borderRadius: '14px', border: 'none', fontWeight: 800, cursor: 'pointer', background: searchType === 'receipt' ? '#0f172a' : 'transparent', color: searchType === 'receipt' ? 'white' : '#64748b' }} onClick={() => setSearchType('receipt')}>RECEIPT ID</button>
            <button style={{ flex: 1, padding: '15px', borderRadius: '14px', border: 'none', fontWeight: 800, cursor: 'pointer', background: searchType === 'mobile' ? '#0f172a' : 'transparent', color: searchType === 'mobile' ? 'white' : '#64748b' }} onClick={() => setSearchType('mobile')}>CUSTOMER MOBILE</button>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <select style={{ padding: '18px', borderRadius: '15px', border: '2px solid #e2e8f0', fontWeight: 700 }} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
            <input style={{ flex: 1, padding: '18px', borderRadius: '15px', border: '2px solid #e2e8f0', fontSize: '1.1rem' }} placeholder={searchType === 'receipt' ? "Enter Invoice No..." : "Enter Mobile Number..."} value={searchNo} onChange={e => setSearchNo(e.target.value)} onKeyPress={e => e.key === 'Enter' && findInvoice()} />
            <button onClick={findInvoice} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0 40px', borderRadius: '15px', fontWeight: 800, cursor: 'pointer' }}>FETCH BILLS</button>
          </div>
        </SearchGlass>
      )}

      {view === "select-bill" && (
        <div style={{ maxWidth: '1100px', margin: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0 }}>Select Bill for Customer: {searchNo}</h2>
            <span style={{ color: '#64748b', fontWeight: 600 }}>{foundBills.length} Invoices Found</span>
          </div>
          <BillTileGrid>
            {foundBills.map((bill, index) => (
              <BillTile key={bill.id} onClick={() => handleSelectBill(bill)}>
                {index === 0 && (
                  <div style={{ position: 'absolute', top: '-10px', right: '10px', background: '#22c55e', color: 'white', fontSize: '10px', padding: '4px 8px', borderRadius: '20px', fontWeight: 800 }}>LATEST</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 800 }}>#{bill.reciptNo}</span>
                  <span style={{ fontWeight: 900, color: '#6366f1' }}>₹{bill.netTotal}</span>
                </div>
                <div style={{ fontWeight: 700 }}>{bill.customerName || "Walk-in Guest"}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{moment(bill.billDate).format("DD MMM YYYY")}</div>
              </BillTile>
            ))}
          </BillTileGrid>
        </div>
      )}

      {view === "process" && originalInvoice && (
        <>
          <CustomerHub>
            <div className="field"><label>Customer</label><span>{originalInvoice.customerName || "Walk-In"}</span></div>
            <div className="field"><label>Mobile</label><span>{originalInvoice.customerMobile || "N/A"}</span></div>
            <div className="field"><label>Bill Date</label><span>{moment(originalInvoice.billDate).format("DD/MM/YYYY")}</span></div>
            <div className="field"><label>Bill Total</label><span>₹{originalInvoice.netTotal}</span></div>
          </CustomerHub>

          <LayoutGrid>
            <ItemBox>
              <h3 style={{ marginBottom: '1.5rem' }}>Items in this Bill</h3>
              <MainTable>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>✓</th>
                    <th>Product</th>
                    <th>Rate</th>
                    <th>Qty</th>
                    <th>Return</th>
                    <th style={{ textAlign: 'right' }}>Total Refund</th>
                  </tr>
                </thead>
                <tbody>
                  {returnItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input type="checkbox" checked={item.isReturning} onChange={() => {
                          const n = [...returnItems];
                          n[idx].isReturning = !n[idx].isReturning;
                          n[idx].returnQty = n[idx].isReturning ? 1 : 0;
                          setReturnItems(n);
                        }} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{item.productName}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>GST: {item.gstPer}%</div>
                      </td>
                      <td>₹{item.rate}</td>
                      <td>{item.qty}</td>
                      <td>
                        <input type="number" disabled={!item.isReturning} value={item.returnQty} min="0" max={item.maxPossible}
                          style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 700 }}
                          onChange={(e) => {
                            const val = Math.min(parseInt(e.target.value) || 0, item.maxPossible);
                            const n = [...returnItems];
                            n[idx].returnQty = val;
                            setReturnItems(n);
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: item.isReturning ? '#0f172a' : '#cbd5e1' }}>
                        ₹{Math.round(item.rate * (item.returnQty || 0) * (1 + (item.gstPer || 0)/100))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </MainTable>
            </ItemBox>

            <Sidebar>
              <AmountCard>
                <label>TOTAL REFUND AMOUNT</label>
                <div className="total">₹{Math.round(finalReturnVal)}</div>
              </AmountCard>

              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '10px' }}>REFUND METHOD</label>
              <MethodGrid>
                <MethodBtn type="button" active={formik.values.paymentMode === 'CreditNote'} onClick={() => formik.setFieldValue('paymentMode', 'CreditNote')}>CREDIT NOTE</MethodBtn>
                <MethodBtn type="button" active={formik.values.paymentMode === 'Cash'} onClick={() => formik.setFieldValue('paymentMode', 'Cash')}>CASH</MethodBtn>
                <MethodBtn type="button" active={formik.values.paymentMode === 'UPI'} onClick={() => formik.setFieldValue('paymentMode', 'UPI')}>UPI</MethodBtn>
                <MethodBtn type="button" active={formik.values.paymentMode === 'Card'} onClick={() => formik.setFieldValue('paymentMode', 'Card')}>CARD</MethodBtn>
              </MethodGrid>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '5px' }}>REASON</label>
                <select {...formik.getFieldProps('reason')} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                  <option value="Size Issue">Size Issue</option>
                  <option value="Fabric Quality">Fabric Quality</option>
                  <option value="Defective">Defective</option>
                  <option value="Customer Mind Change">Mind Change</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '5px' }}>REMARKS</label>
                <textarea {...formik.getFieldProps('remarks')} placeholder="Extra info..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', resize: 'none', height: '80px' }} />
              </div>

              <button type="submit" onClick={formik.handleSubmit} style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '18px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}>
                CONFIRM & PROCESS
              </button>
            </Sidebar>
          </LayoutGrid>
        </>
      )}
    </PageWrapper>
  );
}