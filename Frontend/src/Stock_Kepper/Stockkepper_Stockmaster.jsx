import { useEffect, useState, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import moment from "moment";
import {
    Plus, Search, Edit3, Trash2, Box, Layers, DollarSign,
    Calendar, X, ChevronLeft, ChevronRight, Filter, ShoppingBag,
    Eye, AlertTriangle, TrendingUp, Tag, Percent
} from "lucide-react";

import { getRequest, postRequest, deleteRequest, putRequest } from "../../Services/apiService";
import { showToast, showDeleteConfirm, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= ANIMATIONS ================= */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/* ================= MODERN STYLES ================= */
const PageContainer = styled.div`
  padding: 30px;
  background: #f8fafd;
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', sans-serif;
  animation: ${slideUp} 0.5s ease-out;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
  
  .title-area {
    h2 { font-size: 28px; color: #1B2559; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    p { color: #A3AED0; margin-top: 4px; font-size: 15px; font-weight: 500; }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 35px;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  border: 1px solid #f0f2f8;
  box-shadow: 0px 20px 40px rgba(112, 144, 176, 0.08);
  transition: transform 0.3s ease;

  &:hover { transform: translateY(-5px); }
  
  .icon-wrapper {
    width: 56px;
    height: 56px;
    background: ${p => p.$bg || "#F4F7FE"};
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${p => p.$color || "#4318FF"};
    margin-right: 18px;
  }
  
  .content {
    span { color: #A3AED0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    h3 { color: #1B2559; font-size: 22px; font-weight: 800; margin: 2px 0 0 0; }
  }
`;

const MainCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #f0f2f8;
  box-shadow: 0px 20px 40px rgba(112, 144, 176, 0.05);
`;

const FilterToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 25px;
  padding: 18px;
  background: #f9fbfd;
  border-radius: 20px;
  align-items: center;

  .search-input {
    flex: 2;
    min-width: 250px;
    position: relative;
    input {
      width: 100%;
      padding: 12px 15px 12px 45px;
      border: 1.5px solid #E0E5F2;
      border-radius: 14px;
      outline: none;
      font-weight: 500;
      transition: 0.3s;
      &:focus { border-color: #4318FF; box-shadow: 0 0 0 3px #4318FF15; }
    }
    svg { position: absolute; left: 15px; top: 13px; color: #A3AED0; }
  }

  select {
    flex: 1;
    min-width: 140px;
    padding: 12px;
    border: 1.5px solid #E0E5F2;
    border-radius: 14px;
    outline: none;
    font-weight: 600;
    color: #1B2559;
    cursor: pointer;
    background: white;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  
  thead th {
    padding: 15px 20px;
    color: #A3AED0;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: left;
  }

  tbody tr {
    background: white;
    transition: 0.2s;
    &:hover { background: #fbfcfe; transform: scale(1.002); }
  }

  tbody td {
    padding: 16px 20px;
    border-top: 1px solid #f0f2f8;
    border-bottom: 1px solid #f0f2f8;
    color: #1B2559;
    font-weight: 600;

    &:first-child { border-left: 1px solid #f0f2f8; border-radius: 16px 0 0 16px; }
    &:last-child { border-right: 1px solid #f0f2f8; border-radius: 0 16px 16px 0; }
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
  ${p => p.$type === 'danger' ? css`background: #FFF5F5; color: #E31A1A;` :
        p.$type === 'warning' ? css`background: #FFF9E6; color: #FFB800;` :
            css`background: #F0FDF4; color: #10B981;`}
`;

const ActionButton = styled.button`
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  ${p => p.$primary ? css`
    background: linear-gradient(135deg, #4318FF 0%, #3311DB 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 14px;
    font-weight: 700;
    box-shadow: 0px 10px 20px rgba(67, 24, 255, 0.2);
    &:hover { transform: translateY(-2px); box-shadow: 0px 12px 25px rgba(67, 24, 255, 0.3); }
  ` : css`
    background: #F4F7FE;
    color: ${p.$danger ? "#E31A1A" : p.$view ? "#05CD99" : "#4318FF"};
    width: 38px;
    height: 38px;
    border-radius: 12px;
    &:hover { background: ${p.$danger ? "#FFF5F5" : p.$view ? "#E7F9ED" : "#E0E5F2"}; transform: scale(1.08); }
  `}

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(11, 15, 41, 0.7); 
  display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.3s ease;
`;

const ModalBox = styled.div`
  background: white; width: ${p => p.$wide ? "800px" : "650px"}; padding: 40px; border-radius: 32px; position: relative;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.3);
`;

const InputGroup = styled.div`
  margin-bottom: 22px;
  label { font-size: 13px; font-weight: 800; color: #1B2559; display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  input, select {
    width: 100%; padding: 14px; border: 2px solid #E0E5F2; border-radius: 16px; outline: none; font-weight: 600; color: #1B2559;
    transition: 0.2s;
    &:focus { border-color: #4318FF; }
  }
`;

const FormGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
`;

const DetailRow = styled.div`
    display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #E0E5F2;
    .label { color: #A3AED0; font-weight: 600; }
    .value { color: #1B2559; font-weight: 800; }
`;

/* ================= COMPONENT ================= */

export default function StockMasterPage_stockkepper() {
    const [stocks, setStocks] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [sizeFilter, setSizeFilter] = useState("");
    const [colorFilter, setColorFilter] = useState("");
    const [alertFilter, setAlertFilter] = useState("all");

    const [editMode, setEditMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [viewData, setViewData] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [form, setForm] = useState({
        id: 0, productId: "", size: "", color: "", qty: "", costPrice: "", salePrice: "", rateGST: 18, inwardDate: moment().format("YYYY-MM-DD")
    });

    useEffect(() => { loadStock(); loadProducts(); }, []);

    const loadStock = async () => {
        try { setLoading(true); const res = await getRequest("StockMaster/GetAllStock"); setStocks(res.result || []); }
        catch { showError("Error", "Stock Load Failed"); }
        finally { setLoading(false); }
    };

    const loadProducts = async () => {
        try { const res = await getRequest("Product/GetAllProducts"); setProducts(res.result || []); }
        catch { showError("Error", "Product Load Failed"); }
    };

    const AddStock = async () => {
        // Corrected validation check
        if (!form.productId || !form.size || !form.qty || !form.salePrice || !form.costPrice) {
            showToast("error", "Missing Required Fields (Include Quantity & Cost Price)");
            return;
        }
        try {
            setLoading(true);
            const payload = {
                id: editMode ? Number(form.id) : 0, // Id must be present for update
                productId: Number(form.productId),
                staffMasterId: 1,
                purchaseId: null,
                size: form.size,
                color: form.color,
                qty: Number(form.qty), // ✅ Numeric conversion
                costPrice: Number(form.costPrice), // ✅ Numeric conversion
                salePrice: Number(form.salePrice),
                rateGST: Number(form.rateGST),
                inwardDate: form.inwardDate
            };

            let res;
            if (editMode) {
                res = await putRequest("StockMaster/UpdateStock", payload);
            } else {
                res = await postRequest("StockMaster/AddStock", payload);
            }

            if (res.status === "OK") {
                showToast("success", editMode ? "Inventory Updated" : "Added to Warehouse");
                closeModal();
                loadStock();
            } else { showError("Error", res.result || "Operation Failed"); }
        } catch { showError("Error", "Connection Error"); }
        finally { setLoading(false); }
    };

    const deleteStock = async (id) => {
        const confirm = await showDeleteConfirm();
        if (confirm.isConfirmed) {
            await deleteRequest(`StockMaster/DeleteStock/${id}`);
            showToast("success", "Stock Item Deleted");
            loadStock();
        }
    };

    const closeModal = () => { setShowModal(false); setViewData(null); resetForm(); };
    const resetForm = () => {
        setForm({ id: 0, productId: "", size: "", color: "", qty: "", costPrice: "", salePrice: "", rateGST: 18, inwardDate: moment().format("YYYY-MM-DD") });
        setEditMode(false);
    };

    const filtered = useMemo(() => {
        return stocks.filter(s => {
            const matchesSearch = (s.productName || "").toLowerCase().includes(search.toLowerCase()) ||
                (s.stockCode || "").toLowerCase().includes(search.toLowerCase());
            const matchesSize = sizeFilter === "" || s.size === sizeFilter;
            const matchesColor = colorFilter === "" || s.color === colorFilter;
            const matchesAlert = alertFilter === "all" ? true : (alertFilter === "low" ? s.qty <= 5 : true);

            return matchesSearch && matchesSize && matchesColor && matchesAlert;
        });
    }, [stocks, search, sizeFilter, colorFilter, alertFilter]);

    const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const uniqueSizes = [...new Set(stocks.map(s => s.size))];
    const uniqueColors = [...new Set(stocks.map(s => s.color))];

    const stats = {
        totalValue: stocks.reduce((acc, s) => acc + (Number(s.salePrice) * Number(s.qty)), 0),
        totalQty: stocks.reduce((acc, s) => acc + Number(s.qty), 0),
        lowStockCount: stocks.filter(s => s.qty <= 5).length
    };

    return (
        <PageContainer>
            <PleaseWait show={loading} />

            <HeaderSection>
                <div className="title-area">
                    <h2>Inventory Command Center</h2>
                    <p>Manage real-time garment stock and commercial valuation</p>
                </div>
                <ActionButton $primary onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={20} /> New Entry
                </ActionButton>
            </HeaderSection>

            <StatsGrid>
                <StatCard $bg="#E7F9ED" $color="#05CD99">
                    <div className="icon-wrapper"><Box size={24} /></div>
                    <div className="content">
                        <span>Physical Units</span>
                        <h3>{stats.totalQty.toLocaleString()}</h3>
                    </div>
                </StatCard>
                <StatCard $bg="#FFF5F5" $color="#EE5D50">
                    <div className="icon-wrapper"><AlertTriangle size={24} /></div>
                    <div className="content">
                        <span>Low Stock Alerts</span>
                        <h3>{stats.lowStockCount} Items</h3>
                    </div>
                </StatCard>
                <StatCard $bg="#F4F7FE" $color="#4318FF">
                    <div className="icon-wrapper"><DollarSign size={24} /></div>
                    <div className="content">
                        <span>Asset Value</span>
                        <h3>₹{stats.totalValue.toLocaleString()}</h3>
                    </div>
                </StatCard>
            </StatsGrid>

            <MainCard>
                <FilterToolbar>
                    <div className="search-input">
                        <Search size={18} />
                        <input placeholder="Quick search SKU or Name..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}>
                        <option value="">All Sizes</option>
                        {uniqueSizes.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                    </select>

                    <select value={colorFilter} onChange={e => setColorFilter(e.target.value)}>
                        <option value="">All Colors</option>
                        {uniqueColors.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                    </select>

                    <select value={alertFilter} onChange={e => setAlertFilter(e.target.value)}>
                        <option value="all">All Inventory</option>
                        <option value="low">⚠️ Low Stock Only</option>
                    </select>

                    <ActionButton onClick={() => { setSearch(""); setSizeFilter(""); setColorFilter(""); setAlertFilter("all"); }}>
                        Reset
                    </ActionButton>
                </FilterToolbar>

                <div style={{ overflowX: 'auto' }}>
                    <StyledTable>
                        <thead>
                            <tr>
                                <th>Garment Info</th>
                                <th>Identity</th>
                                <th>Variant</th>
                                <th>Inventory Status</th>
                                <th>Cost Price</th>
                                <th>Sale Price</th>
                                <th>Entry Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentItems.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div style={{ color: '#1B2559', fontSize: '15px', fontWeight: 800 }}>
                                            {s.productName}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#A3AED0' }}>
                                            SKU_ID_{s.id}
                                        </div>
                                    </td>

                                    <td>
                                        <code style={{
                                            background: '#F4F7FE',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            color: '#4318FF',
                                            fontSize: '12px'
                                        }}>
                                            {s.stockCode}
                                        </code>
                                    </td>

                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 800, color: '#4318FF' }}>
                                                {s.size}
                                            </span>
                                            <span style={{ color: '#A3AED0' }}>|</span>
                                            <span style={{ color: '#707EAE' }}>
                                                {s.color}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <StatusBadge $type={s.qty <= 0 ? 'danger' : (s.qty <= 5 ? 'warning' : 'success')}>
                                            {s.qty <= 5 && <AlertTriangle size={12} />} {s.qty} Units
                                        </StatusBadge>
                                    </td>

                                    <td style={{ fontSize: '15px', fontWeight: 800, color: '#4318FF' }}>
                                        ₹{s.costPrice || 0}
                                    </td>

                                    <td style={{ fontSize: '15px', fontWeight: 800, color: '#05CD99' }}>
                                        ₹{s.salePrice}
                                    </td>

                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#707EAE', fontSize: '13px' }}>
                                            <Calendar size={13} /> {moment(s.inwardDate).format("DD MMM, YY")}
                                        </div>
                                    </td>

                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                            <ActionButton $view onClick={() => setViewData(s)}>
                                                <Eye size={16} />
                                            </ActionButton>
                                            <ActionButton onClick={() => {
                                                setForm({
                                                    ...s,
                                                    productId: s.productId // Ensure ID mapping
                                                }); setEditMode(true); setShowModal(true);
                                            }}>
                                                <Edit3 size={16} />
                                            </ActionButton>
                                            <ActionButton $danger onClick={() => deleteStock(s.id)}>
                                                <Trash2 size={16} />
                                            </ActionButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </StyledTable>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px', alignItems: 'center' }}>
                    <div style={{ color: '#A3AED0', fontSize: '14px', fontWeight: 600 }}>
                        Showing {currentItems.length} of {filtered.length} SKUs
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <ActionButton disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                            <ChevronLeft size={20} />
                        </ActionButton>
                        <ActionButton disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                            <ChevronRight size={20} />
                        </ActionButton>
                    </div>
                </div>
            </MainCard>

            {/* --- ADD/EDIT MODAL --- */}
            {showModal && (
                <ModalOverlay onClick={closeModal}>
                    <ModalBox onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div>
                                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#1B2559' }}>{editMode ? "Update Master Stock" : "New Inventory Inward"}</h3>
                                <p style={{ color: '#A3AED0', marginTop: '5px' }}>Accurate stock data ensures better sales tracking</p>
                            </div>
                            <ActionButton onClick={closeModal} style={{ background: 'none' }}><X size={24} /></ActionButton>
                        </div>

                        <InputGroup>
                            <label>Product From Catalog</label>
                            <select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}>
                                <option value="">Select Product...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                            </select>
                        </InputGroup>

                        <FormGrid>
                            <InputGroup><label>Size</label><input placeholder="e.g. XL, 42" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} /></InputGroup>
                            <InputGroup><label>Color</label><input placeholder="e.g. Navy Blue" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></InputGroup>
                        </FormGrid>

                        <FormGrid>
                            <InputGroup><label>Quantity In Stock</label><input type="number" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} /></InputGroup>
                            <InputGroup><label>GST Rate (%)</label>
                                <select value={form.rateGST} onChange={e => setForm({ ...form, rateGST: e.target.value })}>
                                    {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}% GST</option>)}
                                </select>
                            </InputGroup>
                        </FormGrid>

                        <FormGrid>
                            <InputGroup><label>Landing Cost / Purchase Price (₹)</label><input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} /></InputGroup>
                            <InputGroup><label>Sale Price (₹)</label><input type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} /></InputGroup>
                        </FormGrid>

                        <InputGroup><label>Inward Date</label><input type="date" value={form.inwardDate} onChange={e => setForm({ ...form, inwardDate: e.target.value })} /></InputGroup>

                        <ActionButton $primary style={{ width: '100%', marginTop: '10px', height: '56px' }} onClick={AddStock}>
                            {editMode ? "Confirm & Update Inventory" : "Save Stock to Warehouse"}
                        </ActionButton>
                    </ModalBox>
                </ModalOverlay>
            )}

            {/* --- VIEW DETAIL MODAL --- */}
            {viewData && (
                <ModalOverlay onClick={closeModal}>
                    <ModalBox $wide onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Product Specification Detail</h3>
                            <ActionButton onClick={closeModal} style={{ background: 'none' }}><X size={24} /></ActionButton>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <div>
                                <h4 style={{ color: '#4318FF', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', marginBottom: '15px' }}>General Information</h4>
                                <DetailRow><span className="label">Product Name</span><span className="value">{viewData.productName}</span></DetailRow>
                                <DetailRow><span className="label">Stock Code</span><span className="value">{viewData.stockCode}</span></DetailRow>
                                <DetailRow><span className="label">Variant (Size/Color)</span><span className="value">{viewData.size} / {viewData.color}</span></DetailRow>
                                <DetailRow><span className="label">Entry Date</span><span className="value">{moment(viewData.inwardDate).format("LL")}</span></DetailRow>
                            </div>
                            <div>
                                <h4 style={{ color: '#05CD99', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', marginBottom: '15px' }}>Financials & Inventory</h4>
                                <DetailRow>
                                    <span className="label">Available Stock</span>
                                    <span className="value">{viewData.qty} Pcs</span>
                                </DetailRow>

                                {/* FIX: costprice ko costPrice (Capital P) karein */}
                                <DetailRow>
                                    <span className="label">Cost Price (CP)</span>
                                    <span className="value">₹{viewData.costPrice || 0}</span>
                                </DetailRow>

                                <DetailRow>
                                    <span className="label">Sale Price (SP)</span>
                                    <span className="value">₹{viewData.salePrice || 0}</span>
                                </DetailRow>

                                <DetailRow>
                                    <span className="label">Profit Margin (Est.)</span>
                                    <span className="value" style={{ color: '#05CD99' }}>
                                        ₹{(viewData.salePrice || 0) - (viewData.costPrice || 0)}
                                        ({viewData.costPrice > 0
                                            ? (((viewData.salePrice - viewData.costPrice) / viewData.costPrice) * 100).toFixed(1)
                                            : 0}%)
                                    </span>
                                </DetailRow>
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', padding: '20px', background: '#F4F7FE', borderRadius: '20px', display: 'flex', justifyContent: 'space-around' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: '#A3AED0', fontSize: '12px', fontWeight: 700 }}>TAXABLE VALUE</div>
                                <div style={{ fontSize: '18px', fontWeight: 800 }}>₹{((viewData.salePrice * 100) / (100 + viewData.rateGST)).toFixed(2)}</div>
                            </div>
                            <div style={{ textAlign: 'center', borderLeft: '1px solid #D1D9E8', paddingLeft: '30px' }}>
                                <div style={{ color: '#A3AED0', fontSize: '12px', fontWeight: 700 }}>GST ({viewData.rateGST}%)</div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#4318FF' }}>₹{(viewData.salePrice - ((viewData.salePrice * 100) / (100 + viewData.rateGST))).toFixed(2)}</div>
                            </div>
                            <div style={{ textAlign: 'center', borderLeft: '1px solid #D1D9E8', paddingLeft: '30px' }}>
                                <div style={{ color: '#A3AED0', fontSize: '12px', fontWeight: 700 }}>TOTAL SP</div>
                                <div style={{ fontSize: '18px', fontWeight: 800 }}>₹{viewData.salePrice}</div>
                            </div>
                        </div>
                    </ModalBox>
                </ModalOverlay>
            )}
        </PageContainer>
    );
}