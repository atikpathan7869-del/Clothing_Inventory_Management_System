import { useEffect, useState, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import moment from "moment";
import { 
  RefreshCw, Search, Edit3, Trash2, Box, ArrowUpRight, ArrowDownLeft,
  Calendar, X, ChevronLeft, ChevronRight, Filter, ClipboardList,
  Eye, AlertCircle, TrendingUp, Hash, Layers
} from "lucide-react";

import { getRequest, postRequest, deleteRequest } from "../../Services/apiService";
import { showToast, showDeleteConfirm, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= ANIMATIONS ================= */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
    text-align: left;
  }

  tbody tr {
    background: white;
    transition: 0.2s;
    &:hover { background: #fbfcfe; transform: scale(1.001); }
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

const AdjustmentBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  ${p => p.$type === 'Addition' ? 
    css`background: #E7F9ED; color: #10B981;` : 
    css`background: #FFF5F5; color: #E31A1A;`}
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
    color: white; padding: 12px 24px; border-radius: 14px; font-weight: 700;
    box-shadow: 0px 10px 20px rgba(67, 24, 255, 0.2);
    &:hover { transform: translateY(-2px); }
  ` : css`
    background: #F4F7FE; color: #4318FF; width: 38px; height: 38px; border-radius: 12px;
    &:hover { background: #E0E5F2; transform: scale(1.08); }
  `}
`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(11, 15, 41, 0.7); 
  display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px);
`;

const ModalBox = styled.div`
  background: white; width: 600px; padding: 40px; border-radius: 32px;
  max-height: 90vh; overflow-y: auto;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  label { font-size: 13px; font-weight: 800; color: #1B2559; display: block; margin-bottom: 8px; }
  input, select, textarea {
    width: 100%; padding: 14px; border: 2px solid #E0E5F2; border-radius: 16px; outline: none; font-weight: 600;
    &:focus { border-color: #4318FF; }
  }
`;

/* ================= COMPONENT ================= */

export default function StockAdjustmentPage() {
    const [adjustments, setAdjustments] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        stockMasterId: "",
        adjustmentType: "Addition",
        quantity: "",
        reason: "",
        adjustmentDate: moment().format("YYYY-MM-DD")
    });

    useEffect(() => { loadAdjustments(); loadStocks(); }, []);

    const loadAdjustments = async () => {
        try { setLoading(true); const res = await getRequest("StockAdjustment/GetAll"); setAdjustments(res.result || []); }
        catch { showError("Error", "Failed to load adjustments"); }
        finally { setLoading(false); }
    };

    const loadStocks = async () => {
        const res = await getRequest("StockMaster/GetAllStock");
        setStocks(res.result || []);
    };

    const handleSave = async () => {
        if (!form.stockMasterId || !form.quantity || !form.reason) {
            showToast("error", "Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            const payload = { ...form, quantity: Number(form.quantity), stockMasterId: Number(form.stockMasterId) };
            const res = await postRequest("StockAdjustment/Save", payload);

            if (res.status === "OK") {
                showToast("success", "Stock Adjusted Successfully");
                setShowModal(false);
                setForm({ stockMasterId: "", adjustmentType: "Addition", quantity: "", reason: "", adjustmentDate: moment().format("YYYY-MM-DD") });
                loadAdjustments();
            } else { showError("Error", res.result); }
        } catch { showError("Error", "Connection Error"); }
        finally { setLoading(false); }
    };

    const filtered = adjustments.filter(a => 
        (a.productName || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.reason || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PageContainer>
            <PleaseWait show={loading} />

            <HeaderSection>
                <div className="title-area">
                    <h2>Stock Adjustments</h2>
                    <p>Correct inventory levels for damage, returns, or manual audits</p>
                </div>
                <ActionButton $primary onClick={() => setShowModal(true)}>
                    <RefreshCw size={20} /> New Adjustment
                </ActionButton>
            </HeaderSection>

            <MainCard>
                <FilterToolbar>
                    <div className="search-input">
                        <Search size={18} />
                        <input placeholder="Search by product or reason..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </FilterToolbar>

                <div style={{ overflowX: 'auto' }}>
                    <StyledTable>
                        <thead>
                            <tr>
                                <th>Product Details</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Reason / Note</th>
                                <th>Date</th>
                                <th style={{textAlign: 'right'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(adj => (
                                <tr key={adj.id}>
                                    <td>
                                        <div style={{fontWeight: 800}}>{adj.productName}</div>
                                        <div style={{fontSize: '12px', color: '#A3AED0'}}>{adj.stockCode} | {adj.size}</div>
                                    </td>
                                    <td>
                                        <AdjustmentBadge $type={adj.adjustmentType}>
                                            {adj.adjustmentType === 'Addition' ? <ArrowUpRight size={14}/> : <ArrowDownLeft size={14}/>}
                                            {adj.adjustmentType}
                                        </AdjustmentBadge>
                                    </td>
                                    <td style={{fontWeight: 800, fontSize: '15px'}}>
                                        {adj.adjustmentType === 'Addition' ? '+' : '-'}{adj.quantity}
                                    </td>
                                    <td style={{color: '#707EAE', maxWidth: '250px'}}>{adj.reason}</td>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px'}}>
                                            <Calendar size={14} /> {moment(adj.adjustmentDate).format("DD MMM YYYY")}
                                        </div>
                                    </td>
                                    <td style={{textAlign: 'right'}}>
                                        <ActionButton $danger onClick={async () => {
                                            const conf = await showDeleteConfirm();
                                            if(conf.isConfirmed) {
                                                await deleteRequest(`StockAdjustment/Delete/${adj.id}`);
                                                loadAdjustments();
                                            }
                                        }}>
                                            <Trash2 size={16} />
                                        </ActionButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </StyledTable>
                </div>
            </MainCard>

            {showModal && (
                <ModalOverlay onClick={() => setShowModal(false)}>
                    <ModalBox onClick={e => e.stopPropagation()}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '25px'}}>
                            <h3 style={{fontWeight: 800, color: '#1B2559'}}>Create Stock Adjustment</h3>
                            <X size={24} style={{cursor: 'pointer'}} onClick={() => setShowModal(false)} />
                        </div>

                        <InputGroup>
                            <label>Select Item from Stock</label>
                            <select value={form.stockMasterId} onChange={e => setForm({...form, stockMasterId: e.target.value})}>
                                <option value="">-- Select SKU --</option>
                                {stocks.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.productName} ({s.size} - {s.color}) | Current: {s.qty}
                                    </option>
                                ))}
                            </select>
                        </InputGroup>

                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                            <InputGroup>
                                <label>Adjustment Type</label>
                                <select value={form.adjustmentType} onChange={e => setForm({...form, adjustmentType: e.target.value})}>
                                    <option value="Addition">Addition (+)</option>
                                    <option value="Subtraction">Subtraction (-)</option>
                                </select>
                            </InputGroup>
                            <InputGroup>
                                <label>Quantity</label>
                                <input type="number" placeholder="0" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                            </InputGroup>
                        </div>

                        <InputGroup>
                            <label>Adjustment Date</label>
                            <input type="date" value={form.adjustmentDate} onChange={e => setForm({...form, adjustmentDate: e.target.value})} />
                        </InputGroup>

                        <InputGroup>
                            <label>Reason / Remarks</label>
                            <textarea rows="3" placeholder="e.g. Damage during transport, Customer return, Data entry correction" 
                                value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
                        </InputGroup>

                        <ActionButton $primary style={{width: '100%', height: '54px', marginTop: '10px'}} onClick={handleSave}>
                            Confirm Adjustment
                        </ActionButton>
                    </ModalBox>
                </ModalOverlay>
            )}
        </PageContainer>
    );
}