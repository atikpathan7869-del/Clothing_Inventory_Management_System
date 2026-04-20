import { useEffect, useState, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import { 
  AlertTriangle, Search, Download, ShoppingCart, 
  Filter, RefreshCw, Layers, HardDrive, Eye,
  Printer, CheckCircle, MoreVertical, Settings, X, Package, Tag, Hash
} from "lucide-react";
import { getRequest, postRequest, putRequest } from "../../Services/apiService"; 
import { showToast } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";
import moment from "moment";

/* ================= STYLES ================= */
const PageContainer = styled.div`
  padding: 30px; background: #f8fafd; min-height: 100vh;

  /* PROFESSIONAL PRINT DESIGN */
  @media print {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;

    /* Hide non-essential UI elements */
    button, .no-print, .overlay, svg, input {
      display: none !important;
    }

    /* Reset Container for Print */
    box-shadow: none !important;
    border: none !important;
  }
`;

const PrintOnlyHeader = styled.div`
  display: none;
  
  @media print {
    display: block;
    border-bottom: 3px solid #1B2559;
    margin-bottom: 20px;
    padding-bottom: 10px;

    .brand-row {
      display: flex;
      justify-content: space-between;
      align-items: center; /* Changed to center for cleaner alignment */
    }

    .main-brand h1 { 
      margin: 0; 
      color: #1B2559; 
      font-size: 28px; 
      font-weight: 900; 
      letter-spacing: -0.5px;
    }
    
    .main-brand p { 
      margin: 2px 0; 
      color: #707EAE; 
      font-size: 14px; 
      font-weight: 600;
    }

    .ims-branding {
      text-align: right;
    }

    .ims-branding h2 {
      margin: 0;
      color: #4318FF;
      font-size: 18px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .ims-branding p {
      margin: 0;
      color: #A3AED0;
      font-size: 12px;
      font-weight: 700;
    }

    .report-title { 
      background: #f4f7fe; 
      padding: 12px; 
      margin-top: 15px; 
      text-align: center; 
      font-weight: 800;
      color: #1B2559;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-radius: 8px;
    }
  }
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;
  .text-content h2 { color: #1B2559; font-weight: 800; font-size: 28px; margin: 0; }
  .text-content p { color: #A3AED0; font-weight: 500; }

  @media print { display: none; }
`;

const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 30px;
  @media print { margin-bottom: 10px; grid-template-columns: repeat(3, 1fr); }
`;

const StatCard = styled.div`
  background: white; padding: 20px; border-radius: 20px; border: 1px solid #f0f2f8;
  display: flex; align-items: center; gap: 15px; box-shadow: 0px 10px 20px rgba(0,0,0,0.02);
  .icon { 
    width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
    ${p => p.$variant === 'danger' ? 'background: #ffeeee; color: #ee5d50;' : 'background: #fff8eb; color: #ffb547;'}
  }
  .data h5 { margin: 0; color: #A3AED0; font-size: 13px; }
  .data h3 { margin: 0; color: #1B2559; font-size: 22px; font-weight: 800; }

  @media print {
    border: 1px solid #eee;
    box-shadow: none;
    .icon { display: none; }
  }
`;

const TableCard = styled.div`
  background: white; border-radius: 24px; padding: 25px; border: 1px solid #f0f2f8;
  box-shadow: 0px 15px 35px rgba(112, 144, 176, 0.05);

  @media print {
    border: none;
    padding: 0;
    box-shadow: none;

    table {
      width: 100%;
      border: 1px solid #e0e5f2 !important;
    }
    th {
      background: #f4f7fe !important;
      color: #1B2559 !important;
      border: 1px solid #e0e5f2 !important;
    }
    td {
      border: 1px solid #e0e5f2 !important;
    }
  }
`;

const Toolbar = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px;
  flex-wrap: wrap;
  @media print { display: none; }
`;

const SearchWrapper = styled.div`
  position: relative; flex: 1; min-width: 300px;
  input { 
    width: 100%; padding: 12px 15px 12px 42px; border-radius: 14px; border: 1.5px solid #E0E5F2; outline: none;
    &:focus { border-color: #4318FF; }
  }
  svg { position: absolute; left: 15px; top: 13px; color: #A3AED0; }
`;

const ActionGroup = styled.div`display: flex; gap: 10px;`;

const IconButton = styled.button`
  background: ${p => p.$primary ? '#4318FF' : '#F4F7FE'};
  color: ${p => p.$primary ? 'white' : '#4318FF'};
  border: none; padding: 10px 18px; border-radius: 12px; font-weight: 700;
  display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s;
  &:hover { opacity: 0.8; transform: translateY(-1px); }
`;

const Badge = styled.span`
  padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase;
  ${p => p.$level <= 5 ? 'background: #fee; color: #e53e3e;' : 'background: #fff5e6; color: #d69e2e;'}
  
  @media print {
    border: 1px solid #eee;
    color: #000;
  }
`;

const Overlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
`;

const Modal = styled.div`
  background: white; border-radius: 20px; width: ${p => p.$wide ? '500px' : '400px'}; padding: 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  h3 { color: #1B2559; margin-top: 0; }
`;

const InputGroup = styled.div`
  margin-top: 15px;
  label { display: block; font-size: 12px; font-weight: 700; color: #A3AED0; margin-bottom: 5px; }
  input { width: 100%; padding: 10px; border-radius: 10px; border: 1.5px solid #E0E5F2; }
`;

const DetailRow = styled.div`
  display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #E0E5F2;
  span:first-child { color: #A3AED0; font-weight: 600; font-size: 13px; }
  span:last-child { color: #1B2559; font-weight: 700; font-size: 14px; }
`;

/* ================= COMPONENT LOGIC ================= */

export default function LowStockPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [threshold, setThreshold] = useState(15);
    
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [updateQty, setUpdateQty] = useState(0);

    const [showViewModal, setShowViewModal] = useState(false);
    const [viewItem, setViewItem] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getRequest("StockMaster/GetAllStock");
            if (res.status === "OK") {
                const lowStock = res.result.filter(x => x.qty <= threshold);
                setItems(lowStock);
            }
        } catch (e) { showToast("error", "Failed to fetch stock"); }
        finally { setLoading(false); }
    };

    const handleViewClick = (item) => {
        setViewItem(item);
        setShowViewModal(true);
    };

    const handleReorderClick = (item) => {
        setSelectedItem(item);
        setUpdateQty(item.qty);
        setShowModal(true);
    };

    const handleUpdateStock = async () => {
        if (!selectedItem) return;
        try {
            setLoading(true);
            const payload = { ...selectedItem, qty: parseInt(updateQty) };
            const res = await putRequest("StockMaster/UpdateStock", payload);
            
            if (res.status === "OK") {
                showToast("success", `${selectedItem.productName} updated successfully!`);
                setShowModal(false);
                loadData();
            } else {
                showToast("error", res.message || "Update failed");
            }
        } catch (e) {
            showToast("error", "Failed to update stock");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if(items.length === 0) return showToast("warning", "Nothing to export");
        const originalTitle = document.title;
        document.title = `Low_Stock_Report_${moment().format('DD-MM-YYYY')}`;
        window.print();
        document.title = originalTitle;
    };

    const filtered = useMemo(() => {
        return items.filter(i => 
            i.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.stockCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    const stats = {
        critical: items.filter(x => x.qty <= 5).length,
        warning: items.filter(x => x.qty > 5).length,
        totalValue: items.reduce((acc, curr) => acc + (curr.costPrice * curr.qty), 0)
    };

    return (
        <PageContainer>
            <PleaseWait show={loading} />

            {/* PRINT HEADER - Optimized for Global Collection & River Island IMS */}
            <PrintOnlyHeader>
              <div className="brand-row">
                <div className="main-brand">
                  <h1>GLOBAL COLLECTION</h1>
                  <p>Station Road, Bharuch, Gujarat</p>
                </div>
                <div className="ims-branding">
                  <h2>RIVER ISLAND IMS</h2>
                  <p>Inventory Management Solutions</p>
                  <p style={{marginTop: '4px'}}><b>Date:</b> {moment().format("DD MMMM YYYY")}</p>
                </div>
              </div>
              <div className="report-title">Low Stock Inventory Report</div>
            </PrintOnlyHeader>
            
            <Header>
                <div className="text-content">
                    <h2>Inventory Alerts</h2>
                    <p>Manage items that are below the safety stock level ({threshold} units)</p>
                </div>
                <ActionGroup>
                    <IconButton onClick={loadData}><RefreshCw size={18} /> Refresh</IconButton>
                    <IconButton $primary onClick={handleExport}><Printer size={18} /> Print Report</IconButton>
                </ActionGroup>
            </Header>

            <StatsGrid>
                <StatCard $variant="danger">
                    <div className="icon"><AlertTriangle size={22} /></div>
                    <div className="data">
                        <h5>Critical (0-5)</h5>
                        <h3>{stats.critical} Items</h3>
                    </div>
                </StatCard>
                <StatCard $variant="warning">
                    <div className="icon"><RefreshCw size={22} /></div>
                    <div className="data">
                        <h5>Warning (6-{threshold})</h5>
                        <h3>{stats.warning} Items</h3>
                    </div>
                </StatCard>
                <StatCard $variant="warning">
                    <div className="icon"><Layers size={22} /></div>
                    <div className="data">
                        <h5>Potential Loss Value</h5>
                        <h3>₹{stats.totalValue.toLocaleString()}</h3>
                    </div>
                </StatCard>
            </StatsGrid>

            <TableCard>
                <Toolbar>
                    <SearchWrapper>
                        <Search size={18} />
                        <input 
                            placeholder="Search by Product Name or SKU..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </SearchWrapper>
                    <ActionGroup>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                           <span style={{fontSize: '12px', fontWeight: 700, color: '#A3AED0'}}>THRESHOLD:</span>
                           <input 
                             type="number" 
                             style={{width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid #E0E5F2'}}
                             value={threshold}
                             onChange={(e) => setThreshold(e.target.value)}
                             onBlur={loadData}
                           />
                        </div>
                    </ActionGroup>
                </Toolbar>

                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{borderBottom: '1px solid #F4F7FE'}}>
                                <th style={thStyle}>PRODUCT DETAILS</th>
                                <th style={thStyle}>SKU / BARCODE</th>
                                <th style={thStyle}>CURRENT STOCK</th>
                                <th style={thStyle}>STATUS</th>
                                <th style={thStyle}>LAST UPDATED</th>
                                <th style={{...thStyle, textAlign: 'right'}} className="no-print">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item, idx) => (
                                <tr key={idx} style={{borderBottom: '1px solid #F4F7FE'}}>
                                    <td style={tdStyle}>
                                        <div style={{fontWeight: 800, color: '#1B2559'}}>{item.productName}</div>
                                        <div style={{fontSize: '12px', color: '#A3AED0'}}>{item.size} | {item.color}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{fontSize: '13px', fontWeight: 600}}>SKU: {item.stockCode}</div>
                                        <div style={{fontSize: '11px', color: '#707EAE'}}>{item.barcode}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{fontSize: '16px', fontWeight: 800, color: item.qty <= 5 ? '#ee5d50' : '#1B2559'}}>
                                            {item.qty} <span style={{fontSize: '12px', color: '#A3AED0'}}>pcs</span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <Badge $level={item.qty}>
                                            {item.qty <= 5 ? 'Critical' : 'Low Stock'}
                                        </Badge>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{fontSize: '13px'}}>{moment(item.updatedAt).format("DD MMM, YYYY")}</div>
                                    </td>
                                    <td style={{...tdStyle, textAlign: 'right'}} className="no-print">
                                        <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                                            <IconButton title="View Details" onClick={() => handleViewClick(item)}><Eye size={14} /></IconButton>
                                            <IconButton $primary onClick={() => handleReorderClick(item)}>
                                                <ShoppingCart size={14} /> Update Stock
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div style={{textAlign: 'center', padding: '60px'}} className="no-print">
                            <CheckCircle size={48} color="#05CD99" style={{marginBottom: '15px'}} />
                            <h3 style={{color: '#1B2559', margin: 0}}>Stock Levels Healthy</h3>
                            <p style={{color: '#A3AED0'}}>No items found below the {threshold} unit threshold.</p>
                        </div>
                    )}
                </div>
            </TableCard>

            {/* VIEW DETAILS MODAL */}
            {showViewModal && (
                <Overlay onClick={() => setShowViewModal(false)} className="overlay">
                    <Modal $wide onClick={(e) => e.stopPropagation()}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <Package color="#4318FF" />
                                <h3 style={{margin: 0}}>Product Details</h3>
                            </div>
                            <X size={20} style={{cursor: 'pointer'}} onClick={() => setShowViewModal(false)} />
                        </div>
                        
                        <DetailRow><span>Product Name</span><span>{viewItem?.productName}</span></DetailRow>
                        <DetailRow><span>Stock Code (SKU)</span><span>{viewItem?.stockCode}</span></DetailRow>
                        <DetailRow><span>Barcode</span><span>{viewItem?.barcode}</span></DetailRow>
                        <DetailRow><span>Category</span><span>{viewItem?.categoryName || 'Garments'}</span></DetailRow>
                        <DetailRow><span>Size / Color</span><span>{viewItem?.size} / {viewItem?.color}</span></DetailRow>
                        <DetailRow><span>Cost Price</span><span>₹{viewItem?.costPrice}</span></DetailRow>
                        <DetailRow><span>Sale Price</span><span>₹{viewItem?.salePrice}</span></DetailRow>
                        <DetailRow><span>Current Quantity</span><span style={{color: viewItem?.qty <= 5 ? '#ee5d50' : '#05CD99'}}>{viewItem?.qty} Pcs</span></DetailRow>
                        <DetailRow><span>Last Restocked</span><span>{moment(viewItem?.updatedAt).format("LL")}</span></DetailRow>

                        <IconButton $primary style={{width: '100%', marginTop: '25px', justifyContent: 'center'}} onClick={() => setShowViewModal(false)}>
                            Close Details
                        </IconButton>
                    </Modal>
                </Overlay>
            )}

            {/* QUICK UPDATE MODAL */}
            {showModal && (
                <Overlay onClick={() => setShowModal(false)} className="overlay">
                    <Modal onClick={(e) => e.stopPropagation()}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h3>Update Inventory</h3>
                            <X size={20} style={{cursor: 'pointer'}} onClick={() => setShowModal(false)} />
                        </div>
                        <p style={{fontSize: '13px', color: '#A3AED0'}}>{selectedItem?.productName} ({selectedItem?.stockCode})</p>
                        
                        <InputGroup>
                            <label>NEW QUANTITY</label>
                            <input 
                                type="number" 
                                value={updateQty} 
                                onChange={(e) => setUpdateQty(e.target.value)} 
                                autoFocus
                            />
                        </InputGroup>

                        <div style={{marginTop: '25px', display: 'flex', gap: '10px'}}>
                            <IconButton style={{flex: 1, justifyContent: 'center'}} onClick={() => setShowModal(false)}>Cancel</IconButton>
                            <IconButton $primary style={{flex: 1, justifyContent: 'center'}} onClick={handleUpdateStock}>Save Changes</IconButton>
                        </div>
                    </Modal>
                </Overlay>
            )}
        </PageContainer>
    );
}

const thStyle = { padding: '15px', textAlign: 'left', color: '#A3AED0', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' };
const tdStyle = { padding: '18px 15px', verticalAlign: 'middle' };