import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { 
    Search, Box, Download, MoreHorizontal, 
    AlertCircle, Package, DollarSign, Printer, X,
    CheckCircle2
} from "lucide-react";
import { getRequest } from "../../Services/apiService";
import { showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= ANIMATIONS ================= */
const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;
const slideUp = keyframes`from { transform: translate(-50%, 100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; }`;

const PageContainer = styled.div`
    padding: 25px;
    background: #F8F9FD;
    min-height: 100vh;
    font-family: 'Plus Jakarta Sans', sans-serif;
    animation: ${fadeIn} 0.4s ease-in;
`;

/* ================= STAT CARDS ================= */
const StatsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
`;

const StatCard = styled.div`
    background: white;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid #E9EDF7;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.03);

    .icon-box {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${p => p.$bg || "#4318FF10"};
        color: ${p => p.$color || "#4318FF"};
    }

    .info {
        span { color: #A3AED0; font-size: 13px; font-weight: 600; display: block; }
        strong { color: #1B2559; font-size: 20px; font-weight: 800; }
    }
`;

/* ================= FLOATING ACTION BAR (ZOMATO STYLE) ================= */
const SelectionBar = styled.div`
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: #1B2559;
    color: white;
    padding: 14px 28px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    gap: 25px;
    box-shadow: 0px 20px 50px rgba(27, 37, 89, 0.4);
    z-index: 1000;
    animation: ${slideUp} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    .count-tag {
        background: #4318FF;
        padding: 5px 14px;
        border-radius: 10px;
        font-weight: 800;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .action-btn {
        background: #05CD99;
        color: white;
        border: none;
        padding: 10px 22px;
        border-radius: 14px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: 0.2s;
        &:hover { background: #04b386; transform: translateY(-2px); }
        &:active { transform: translateY(0); }
    }
`;

/* ================= TABLE SYSTEM ================= */
const TableWrapper = styled.div`
    background: white;
    border-radius: 20px;
    border: 1px solid #E9EDF7;
    overflow: hidden;
    box-shadow: 0px 10px 30px rgba(112, 144, 176, 0.05);
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    
    thead {
        background: #F9FAFB;
        th {
            padding: 18px 20px;
            color: #A3AED0;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 700;
            border-bottom: 1px solid #E9EDF7;
            text-align: left;
        }
    }

    tbody tr {
        transition: 0.2s;
        border-bottom: 1px solid #F4F7FE;
        background: ${p => p.$selected ? "#F4F7FE" : "transparent"};
        
        &:hover { background: #F4F7FE80; }
        
        td {
            padding: 16px 20px;
            color: #1B2559;
            font-size: 14px;
            vertical-align: middle;
        }
    }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #4318FF;
    border-radius: 6px;
`;

const StatusBadge = styled.span`
    padding: 6px 12px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    background: ${p => p.$low ? "#FFF5F5" : "#F0FDF4"};
    color: ${p => p.$low ? "#E31A1A" : "#10B981"};
`;

/* ================= MAIN COMPONENT ================= */

export default function AvailableStock() {
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getRequest("StockMaster/AvaliableStock");
            if (res && Array.isArray(res.result)) {
                setStocks(res.result);
            }
        } catch (error) {
            showError("System Sync Failed", "Unable to reach the inventory server.");
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return stocks.filter(item => 
            (item.productName || "").toLowerCase().includes(search.toLowerCase()) || 
            (item.stockCode || "").toLowerCase().includes(search.toLowerCase())
        );
    }, [stocks, search]);

    const totals = useMemo(() => {
        return filtered.reduce((acc, curr) => {
            acc.qty += curr.qty || 0;
            acc.value += (curr.qty * curr.salePrice) || 0;
            if (curr.qty <= 5) acc.lowItems += 1;
            return acc;
        }, { qty: 0, value: 0, lowItems: 0 });
    }, [filtered]);

    /* --- Selection Logic --- */
    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filtered.map(s => s.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleItem = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBarcodeRedirect = () => {
        const selectedItems = stocks.filter(s => selectedIds.includes(s.id));
        // Redirect to generate-barcode and pass selected items as state
        navigate("/Staff/GenerateBarcode", { state: { items: selectedItems } });
    };

    return (
        <PageContainer>
            <PleaseWait show={loading} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ color: '#1B2559', fontWeight: 800, margin: 0, fontSize: '28px' }}>Inventory Command Center</h2>
                    <p style={{ color: '#A3AED0', margin: '5px 0 0', fontWeight: 500 }}>Live showroom stock for Global Collection</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '15px', top: '12px', color: '#A3AED0' }} />
                    <input 
                        style={{ 
                            background: 'white', border: '1px solid #E9EDF7', 
                            padding: '12px 20px 12px 50px', borderRadius: '16px', 
                            width: '320px', fontWeight: 600, boxShadow: '0px 4px 12px rgba(0,0,0,0.02)'
                        }}
                        placeholder="Search SKU, Product, Color..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <StatsRow>
                <StatCard>
                    <div className="icon-box"><Package size={22} /></div>
                    <div className="info"><span>Active Stock</span><strong>{totals.qty} Pcs</strong></div>
                </StatCard>
                <StatCard $bg="#05CD9915" $color="#05CD99">
                    <div className="icon-box"><DollarSign size={22} /></div>
                    <div className="info"><span>Total Value</span><strong>₹{totals.value.toLocaleString()}</strong></div>
                </StatCard>
                <StatCard $bg="#EE5D5015" $color="#EE5D50">
                    <div className="icon-box"><AlertCircle size={22} /></div>
                    <div className="info"><span>Low Stock SKUs</span><strong>{totals.lowItems} Items</strong></div>
                </StatCard>
            </StatsRow>

            <TableWrapper>
                <StyledTable>
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>
                                <Checkbox 
                                    onChange={toggleSelectAll} 
                                    checked={selectedIds.length === filtered.length && filtered.length > 0} 
                                />
                            </th>
                            <th>SKU Code</th>
                            <th>Product Detail</th>
                            <th>Variant</th>
                            <th>Stock Level</th>
                            <th>Retail Price</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((item) => (
                            <tr key={item.id} $selected={selectedIds.includes(item.id)}>
                                <td>
                                    <Checkbox 
                                        checked={selectedIds.includes(item.id)} 
                                        onChange={() => toggleItem(item.id)} 
                                    />
                                </td>
                                <td style={{ fontWeight: 800, color: '#4318FF' }}>{item.stockCode}</td>
                                <td>
                                    <div style={{ fontWeight: 700 }}>{item.productName}</div>
                                    <div style={{ fontSize: '12px', color: '#A3AED0' }}>River Island Garments</div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600 }}>{item.size}</span>
                                    <span style={{ color: '#A3AED0', margin: '0 8px' }}>|</span>
                                    <span style={{ color: '#707EAE' }}>{item.color}</span>
                                </td>
                                <td style={{ fontWeight: 800 }}>{item.qty} <small style={{ color: '#A3AED0' }}>pcs</small></td>
                                <td style={{ fontWeight: 700 }}>₹{item.salePrice.toLocaleString()}</td>
                                <td>
                                    <StatusBadge $low={item.qty <= 5}>
                                        {item.qty <= 5 ? "Re-Stock" : "Healthy"}
                                    </StatusBadge>
                                </td>
                                <td>
                                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#A3AED0' }}>
                                        <MoreHorizontal size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </StyledTable>

                {filtered.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#A3AED0' }}>
                        <Box size={48} style={{ marginBottom: '15px', opacity: 0.2 }} />
                        <h3 style={{ margin: 0, color: '#1B2559' }}>No Stock Items Found</h3>
                        <p>Adjust your search or filters to see results.</p>
                    </div>
                )}
            </TableWrapper>

            {/* Zomato-Style Floating Action Bar */}
            {selectedIds.length > 0 && (
                <SelectionBar>
                    <div className="count-tag">
                        <CheckCircle2 size={16} />
                        {selectedIds.length} Items Selected
                    </div>
                    
                    <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.15)' }} />
                    
                    <button className="action-btn" onClick={handleBarcodeRedirect}>
                        <Printer size={18} />
                        Generate Labels
                    </button>

                    <X 
                        size={20} 
                        style={{ cursor: 'pointer', opacity: 0.6, marginLeft: '10px' }} 
                        onClick={() => setSelectedIds([])} 
                    />
                </SelectionBar>
            )}
        </PageContainer>
    );
}