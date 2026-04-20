import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useFormik, FormikProvider } from "formik";
import { 
  FiPlus, FiTrash2, FiSearch, FiFileText, 
  FiBox, FiUser, FiPhone, FiCalendar, 
  FiExternalLink, FiX, FiEye, FiLayers, FiInfo, FiPrinter
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { getRequest, postRequest } from "../../Services/apiService";
import { showToast, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= MODERN STYLES ================= */
const Container = styled.div`
  padding: 2rem; background: #f8fafc; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif;
`;

const HeaderSection = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; gap: 15px;
  .icon { background: #eff6ff; color: #3b82f6; padding: 12px; border-radius: 12px; font-size: 1.2rem; }
  .data { h4 { margin: 0; font-size: 1.25rem; color: #1e293b; } p { margin: 0; color: #64748b; font-size: 0.8rem; } }
`;

const FilterBar = styled.div`
  background: white; padding: 15px 20px; border-radius: 12px; border: 1px solid #e2e8f0;
  display: flex; gap: 15px; align-items: center; margin-bottom: 1.5rem;
`;

const TableCard = styled.div`
  background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden;
`;

const StyledTable = styled.table`
  width: 100%; border-collapse: collapse;
  th { background: #f8fafc; padding: 15px; text-align: left; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
  td { padding: 15px; border-top: 1px solid #f1f5f9; color: #1e293b; font-size: 0.875rem; }
  tr:hover { background: #f8fbff; }
`;

const Badge = styled.span`
  padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600;
  background: ${props => props.variant === 'blue' ? '#e0e7ff' : '#f1f5f9'};
  color: ${props => props.variant === 'blue' ? '#4338ca' : '#475569'};
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000;
`;

const ModalContent = styled.div`
  background: white; width: ${props => props.width || '950px'}; max-height: 90vh; border-radius: 20px;
  display: flex; flex-direction: column; overflow: hidden;
`;

const CardBox = styled.div`
  background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0;
`;

const ModernInput = styled.input`
  width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.875rem;
  &:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
`;

/* ================= COMPONENT ================= */
const Outward = () => {
  const [loading, setLoading] = useState(false);
  const [outwardList, setOutwardList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewDetail, setViewDetail] = useState(null);
  
  const [scannedItems, setScannedItems] = useState([]);
  const [barcode, setBarcode] = useState("");
  const scanRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || { id: 1 };

  useEffect(() => { fetchOutwards(); }, []);

  useEffect(() => {
    let data = outwardList;
    if (searchTerm) {
      data = data.filter(o => 
        o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.id.toString().includes(searchTerm) ||
        o.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterDate) {
      data = data.filter(o => moment(o.createdAt).format("YYYY-MM-DD") === filterDate);
    }
    setFilteredList(data);
  }, [searchTerm, filterDate, outwardList]);

  const fetchOutwards = async () => {
    setLoading(true);
    try {
      const res = await getRequest("Outward/GetAllOutwards");
      if (res?.status === "OK") {
        setOutwardList(res.result || []);
        setFilteredList(res.result || []);
      }
    } catch (err) { showError("Error", "Data loading failed"); }
    finally { setLoading(false); }
  };

  const handleViewDetail = async (id) => {
    setLoading(true);
    try {
      const res = await getRequest(`Outward/GetOutwardById/${id}`);
      if (res?.status === "OK") setViewDetail(res.result);
    } catch (err) { showError("Error", "Could not fetch details"); }
    finally { setLoading(false); }
  };

  const handleScanTrigger = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!barcode.trim()) return;
      setLoading(true);
      try {
        const res = await getRequest(`StockMaster/GetStockByBarcode/${barcode}`);
        if (res?.status === "OK" && res.result) {
          const item = res.result;
          setScannedItems(prev => {
            const sid = item.id || item.Id;
            const exists = prev.findIndex(c => c.stockMasterId === sid);
            if (exists > -1) {
              const updated = [...prev];
              updated[exists].qty += 1;
              return updated;
            }
            return [...prev, { 
              stockMasterId: sid, 
              name: item.productName || item.ProductName, 
              barcode: item.barcode || item.Barcode, 
              qty: 1 
            }];
          });
          setBarcode("");
          showToast("success", "Item Scanned");
        } else { showToast("info", "Stock Not Found"); }
      } catch (err) { console.error(err); }
      finally { setLoading(false); setTimeout(() => scanRef.current?.focus(), 100); }
    }
  };

  // --- PRINT FUNCTIONALITY ---
  const handlePrintReceipt = (item) => {
    const printWindow = window.open("", "_blank");
    const totalQty = item.outWardItems?.reduce((acc, curr) => acc + curr.qty, 0) || 0;

    printWindow.document.write(`
      <html>
        <head>
          <title>Outward Voucher - #OUT-${item.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .brand h1 { color: #6366f1; margin: 0; font-size: 28px; letter-spacing: -1px; }
            .brand p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
            .meta { text-align: right; }
            .meta h2 { margin: 0; font-size: 20px; color: #1e293b; }
            .meta p { margin: 5px 0 0; color: #64748b; font-size: 13px; }
            
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .info-box h4 { margin: 0 0 8px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
            .info-box p { margin: 0; font-weight: 700; font-size: 15px; color: #334155; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
            
            .total-row { text-align: right; margin-top: 20px; font-size: 16px; font-weight: 700; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
            .signature-box { border-top: 1px solid #334155; width: 200px; text-align: center; padding-top: 8px; font-size: 12px; font-weight: 600; }
            
            @media print {
              @page { margin: 15mm; }
              body { padding: 0; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <h1>RIVER ISLAND</h1>
              <p>Inventory Outward Voucher</p>
            </div>
            <div class="meta">
              <h2>#OUT-${item.id}</h2>
              <p>Issued: ${moment(item.createdAt).format("DD/MM/YYYY hh:mm A")}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <h4>Receiver Details</h4>
              <p>${item.name}</p>
              <p style="font-weight: 400; font-size: 13px; color: #64748b; margin-top:4px;">${item.contactDetails}</p>
            </div>
            <div class="info-box">
              <h4>Voucher Information</h4>
              <p>Reason: ${item.reason}</p>
              <p style="font-weight: 400; font-size: 13px; color: #64748b; margin-top:4px;">Authorized By: ${item.staff || 'System Admin'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th>Barcode</th>
                <th style="text-align: center;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${item.outWardItems?.map(it => `
                <tr>
                  <td>${it.stockMaster?.productName}</td>
                  <td><code>${it.stockMaster?.barcode}</code></td>
                  <td style="text-align: center; font-weight: 700;">${it.qty}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-row">
            Total Quantity Released: ${totalQty} Units
          </div>

          <div class="footer">
            <div style="font-size: 11px; color: #94a3b8;">
              This is a computer generated document.<br/>
              Printed on: ${moment().format("LLL")}
            </div>
            <div class="signature-box">
              Receiver's Signature
            </div>
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

  const formik = useFormik({
    initialValues: { name: "", contactDetails: "", reason: "" },
    onSubmit: async (values, { resetForm }) => {
      if (scannedItems.length === 0) return showError("No Items", "Please scan at least one product.");
      setLoading(true);
      try {
        const payload = {
          ...values,
          StaffMasterId: user.id,
          OutWardItems: scannedItems.map(item => ({
            StockMasterId: item.stockMasterId,
            Qty: item.qty,
            StaffMasterId: user.id
          }))
        };
        const res = await postRequest("Outward/SaveOutward", payload);
        if (res?.status === "OK") {
          showToast("success", "Outward Entry Saved");
          resetForm(); setScannedItems([]); setShowAddForm(false);
          fetchOutwards();
        }
      } catch (err) { showError("Error", "Stock update failed"); }
      finally { setLoading(false); }
    }
  });

  return (
    <Container>
      <PleaseWait show={loading} />
      
      <HeaderSection>
        <div>
          <h2 style={{fontWeight:800, color:'#1e293b'}}>River Island Outward</h2>
          <p style={{color:'#64748b'}}>Manage garment transfers and inventory release</p>
        </div>
        <button onClick={() => setShowAddForm(true)} style={{background:'#6366f1', color:'white', border:'none', padding:'12px 24px', borderRadius:'12px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 4px 12px rgba(99, 102, 241, 0.3)'}}>
          <FiPlus /> New Outward Entry
        </button>
      </HeaderSection>

      <StatsGrid>
        <StatCard>
          <div className="icon"><FiLayers /></div>
          <div className="data"><h4>{outwardList.length}</h4><p>Total Entries</p></div>
        </StatCard>
        <StatCard>
          <div className="icon" style={{color:'#10b981', background:'#ecfdf5'}}><FiBox /></div>
          <div className="data"><h4>{outwardList.reduce((acc, curr) => acc + (curr.outWardItems?.length || 0), 0)}</h4><p>Items Released</p></div>
        </StatCard>
        <StatCard>
          <div className="icon" style={{color:'#f59e0b', background:'#fffbeb'}}><FiUser /></div>
          <div className="data"><h4>{new Set(outwardList.map(o => o.name)).size}</h4><p>Unique Receivers</p></div>
        </StatCard>
      </StatsGrid>

      <FilterBar>
        <div style={{position:'relative', flex:1}}>
          <FiSearch style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8'}}/>
          <ModernInput placeholder="Search by name, ID or purpose..." style={{paddingLeft:'35px'}} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
           <FiCalendar color="#64748b" />
           <ModernInput type="date" style={{width:'180px'}} value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </div>
      </FilterBar>

      <TableCard>
        <StyledTable>
          <thead>
            <tr>
              <th>Outward ID</th>
              <th>Date</th>
              <th>Receiver Details</th>
              <th>Purpose / Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((ow, i) => (
              <tr key={i}>
                <td style={{fontWeight:700, color:'#6366f1'}}>#OUT-{ow.id}</td>
                <td>{moment(ow.createdAt).format("DD/MM/YYYY")}</td>
                <td>
                  <div style={{fontWeight:600}}>{ow.name}</div>
                  <div style={{fontSize:'0.75rem', color:'#94a3b8'}}>{ow.contactDetails}</div>
                </td>
                <td><Badge variant="blue">{ow.reason}</Badge></td>
                <td>
                  <button onClick={() => handleViewDetail(ow.id)} style={{background:'none', border:'none', color:'#6366f1', cursor:'pointer'}}>
                    <FiEye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableCard>

      {/* ================= MODAL: ADD NEW ================= */}
      {showAddForm && (
        <ModalOverlay>
          <ModalContent width="1000px">
            <div style={{padding:'20px 25px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc'}}>
              <h3 style={{margin:0, display:'flex', alignItems:'center', gap:'10px'}}><FiPlus /> Release Inventory</h3>
              <FiX cursor="pointer" size={24} onClick={() => setShowAddForm(false)} />
            </div>
            <FormikProvider value={formik}>
              <div style={{display:'grid', gridTemplateColumns:'360px 1fr', gap:'20px', padding:'25px', overflowY:'auto'}}>
                <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                  <CardBox>
                    <label style={{fontSize:'0.7rem', fontWeight:800, color:'#64748b', display:'block', marginBottom:'5px'}}>RECEIVER NAME</label>
                    <ModernInput name="name" onChange={formik.handleChange} value={formik.values.name} placeholder="Who is receiving?" />
                    
                    <label style={{fontSize:'0.7rem', fontWeight:800, color:'#64748b', display:'block', margin:'15px 0 5px'}}>CONTACT / ADDR</label>
                    <ModernInput name="contactDetails" onChange={formik.handleChange} value={formik.values.contactDetails} placeholder="Phone or Location" />
                    
                    <label style={{fontSize:'0.7rem', fontWeight:800, color:'#64748b', display:'block', margin:'15px 0 5px'}}>OUTWARD REASON</label>
                    <ModernInput name="reason" onChange={formik.handleChange} value={formik.values.reason} placeholder="e.g. Sampling, Sale, Damage" />
                  </CardBox>
                  
                  <div style={{background:'#6366f1', padding:'20px', borderRadius:'16px', color:'white'}}>
                    <label style={{fontSize:'0.7rem', fontWeight:900, opacity:0.8}}>BARCODE SCANNER</label>
                    <ModernInput ref={scanRef} value={barcode} onChange={e => setBarcode(e.target.value)} onKeyDown={handleScanTrigger} placeholder="Scan Item Now..." style={{marginTop:'10px', background:'rgba(255,255,255,0.1)', color:'white'}} />
                  </div>

                  <button onClick={formik.handleSubmit} style={{width:'100%', background:'#1e293b', color:'white', border:'none', padding:'15px', borderRadius:'12px', fontWeight:700, cursor:'pointer'}}>
                    Confirm & Update Stock
                  </button>
                </div>

                <div style={{border:'1px solid #e2e8f0', borderRadius:'16px', overflow:'hidden', background:'white'}}>
                    <StyledTable>
                      <thead><tr><th>Product Info</th><th style={{textAlign:'center'}}>Qty</th><th>Remove</th></tr></thead>
                      <tbody>
                        {scannedItems.map((item, i) => (
                          <tr key={i}>
                            <td><div style={{fontWeight:700}}>{item.name}</div><small style={{color:'#94a3b8'}}>{item.barcode}</small></td>
                            <td style={{textAlign:'center'}}><span style={{background:'#f1f5f9', padding:'6px 15px', borderRadius:'8px', fontWeight:800}}>{item.qty}</span></td>
                            <td><FiTrash2 color="#ef4444" cursor="pointer" onClick={() => setScannedItems(scannedItems.filter((_, idx) => idx !== i))} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </StyledTable>
                </div>
              </div>
            </FormikProvider>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ================= MODAL: INDIVIDUAL VIEW ================= */}
      {viewDetail && (
        <ModalOverlay>
          <ModalContent width="750px">
            <div style={{padding:'20px 25px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc'}}>
              <h3 style={{margin:0, color:'#1e293b'}}>Outward Transaction Receipt</h3>
              <FiX cursor="pointer" size={24} onClick={() => setViewDetail(null)} />
            </div>
            <div style={{padding:'25px'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'25px'}}>
                 <CardBox>
                    <p style={{fontSize:'0.75rem', color:'#64748b', margin:'0 0 5px 0'}}>RECEIVER DETAILS</p>
                    <h4 style={{margin:0}}>{viewDetail.name}</h4>
                    <p style={{margin:'5px 0 0 0', fontSize:'0.85rem', color:'#475569'}}><FiPhone size={12}/> {viewDetail.contactDetails}</p>
                 </CardBox>
                 <CardBox>
                    <p style={{fontSize:'0.75rem', color:'#64748b', margin:'0 0 5px 0'}}>TRANSACTION INFO</p>
                    <h4 style={{margin:0}}>{viewDetail.reason}</h4>
                    <p style={{margin:'5px 0 0 0', fontSize:'0.85rem', color:'#475569'}}><FiCalendar size={12}/> {moment(viewDetail.createdAt).format("LLL")}</p>
                 </CardBox>
              </div>
              
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                <FiInfo color="#6366f1" /> <h4 style={{margin:0}}>Product Breakdown</h4>
              </div>
              
              <div style={{border:'1px solid #e2e8f0', borderRadius:'16px', overflow:'hidden'}}>
                <StyledTable>
                  <thead style={{background:'#f8fafc'}}>
                    <tr>
                      <th style={{width:'80px'}}>ID</th>
                      <th>Garment / Product Name</th>
                      <th>Barcode</th>
                      <th style={{textAlign:'center'}}>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewDetail.outWardItems?.map((it, idx) => (
                      <tr key={idx}>
                        <td><small style={{color:'#64748b'}}>#SK-{it.stockMasterId}</small></td>
                        <td style={{fontWeight:600}}>{it.stockMaster?.productName}</td>
                        <td><code style={{fontSize:'0.75rem', color:'#4338ca'}}>{it.stockMaster?.barcode}</code></td>
                        <td style={{textAlign:'center'}}>
                          <span style={{background:'#e0e7ff', color:'#4338ca', padding:'4px 12px', borderRadius:'6px', fontWeight:800}}>
                            {it.qty}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </div>
              
              <div style={{marginTop:'25px', padding:'15px', borderTop:'2px dashed #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                 <span style={{color:'#64748b'}}>Authorized by: <b>{viewDetail.staff}</b></span>
                 <button 
                  onClick={() => handlePrintReceipt(viewDetail)} 
                  style={{background:'#6366f1', color:'white', border:'none', padding:'10px 25px', borderRadius:'10px', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:'8px'}}
                 >
                   <FiPrinter /> Print Voucher
                 </button>
              </div>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Outward;