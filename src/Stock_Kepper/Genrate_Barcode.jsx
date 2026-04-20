import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { ArrowLeft, Printer, Trash2, Package, Tag, Palette, Box } from "lucide-react";
import Barcode from "react-barcode"; 
import { useReactToPrint } from "react-to-print"; 

/* ================= PRINT-SPECIFIC GLOBAL CSS ================= */
const PrintGlobalStyle = createGlobalStyle`
@media print {
    @page {
        size: A4;
        margin: 0 !important; /* Browser headers/footers ko hatane ke liye */
    }
    body {
        margin: 0 !important;
        padding: 0 !important;
    }
}
`;

/* ================= UI DASHBOARD STYLES ================= */
const PageContainer = styled.div`
    padding: 40px;
    background: #F4F7FE;
    min-height: 100vh;
    font-family: 'Plus Jakarta Sans', sans-serif;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 35px;
    
    .back-section {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    button.back-btn {
        background: white;
        border: none;
        padding: 12px;
        border-radius: 14px;
        cursor: pointer;
        box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.05);
        color: #1B2559;
        transition: 0.3s;
        &:hover { transform: translateX(-5px); background: #4318FF; color: white; }
    }

    h2 { color: #1B2559; margin: 0; font-weight: 800; font-size: 28px; }
`;

const LayoutGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 30px;
`;

const QueueCard = styled.div`
    background: white;
    border-radius: 24px;
    padding: 25px;
    box-shadow: 0px 20px 40px rgba(112, 144, 176, 0.08);
`;

const ItemRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    margin-bottom: 15px;
    background: #F8F9FD;
    border-radius: 18px;
    border: 1px solid transparent;
    transition: 0.3s;
    
    &:hover { border-color: #4318FF; background: white; }

    .main-info { display: flex; gap: 18px; align-items: center; }
    
    .icon-box {
        background: white;
        padding: 12px;
        border-radius: 12px;
        box-shadow: 0px 4px 12px rgba(0,0,0,0.03);
    }

    .badge-row {
        display: flex;
        gap: 8px;
        margin-top: 5px;
        span {
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 6px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .size { background: #E2E8F0; color: #475569; }
        .color { background: #E0E7FF; color: #4318FF; }
    }

    input {
        width: 65px;
        padding: 10px;
        border: 2px solid #E9EDF7;
        border-radius: 12px;
        text-align: center;
        font-weight: 800;
        color: #1B2559;
        &:focus { outline: none; border-color: #4318FF; }
    }
`;

const PrintSidebar = styled.div`
    background: white;
    border-radius: 24px;
    padding: 25px;
    height: fit-content;
    position: sticky;
    top: 40px;
    box-shadow: 0px 20px 40px rgba(112, 144, 176, 0.08);

    .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        color: #A3AED0;
        font-weight: 600;
        strong { color: #1B2559; }
    }
`;

const ModernPrintBtn = styled.button`
    width: 100%;
    background: linear-gradient(135deg, #868CFF 0%, #4318FF 100%);
    color: white;
    border: none;
    padding: 20px;
    border-radius: 20px;
    font-weight: 800;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 25px;
    cursor: pointer;
    box-shadow: 0px 10px 20px rgba(67, 24, 255, 0.25);
    transition: 0.3s;
    &:hover { transform: translateY(-3px); box-shadow: 0px 15px 30px rgba(67, 24, 255, 0.35); }
`;

/* ================= PDF & PRINT CALIBRATION ================= */
const HiddenPrintSheet = styled.div`
    display: none;
    @media print {
        display: block;
        width: 210mm;
        background: white;
    }
`;

// Naya Page Wrapper: Jo har page par 20px margin dega
const PrintPage = styled.div`
    @media print {
        width: 210mm;
        height: 297mm;
        padding-top: 20px; /* Locked 20px for ALL pages */
        padding-left: 4mm;
        padding-right: 4mm;
        page-break-after: always;
        box-sizing: border-box;
    }
`;

const StickerGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 38.1mm); 
    grid-auto-rows: 21.2mm;                   
    row-gap: 0;
    column-gap: 3mm;                         
`;

const ModernSticker = styled.div`
    width: 38.1mm;
    height: 21.2mm;
    padding: 1.2mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 0.05mm solid #eee; 
    box-sizing: border-box;
    overflow: hidden;

    .top-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 0.15mm solid #000;
        padding-bottom: 0.3mm;
        
        .brand-name { font-size: 6.5px; font-weight: 900; letter-spacing: 0.3px; }
        .cat { font-size: 5px; font-weight: 600; text-transform: uppercase; }
    }

    .prod-details {
        font-size: 5.5px;
        font-weight: 800;
        line-height: 1.1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .meta-data {
        display: flex;
        gap: 3px;
        font-size: 5px;
        font-weight: 700;
        color: #333;
    }

    .barcode-wrapper {
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 1mm; 
    }

    .price-footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-top: 0.1mm dashed #bbb;
        padding-top: 0.3mm;
        
        .sku { font-size: 4.5px; color: #555; font-family: 'Courier New', monospace; }
        .price { font-size: 8px; font-weight: 900; }
    }
`;

export default function GenerateBarcode() {
    const location = useLocation();
    const navigate = useNavigate();
    const printRef = useRef(null);
    
    const [printQueue, setPrintQueue] = useState(
        (location.state?.items || []).map(item => ({ 
            ...item, 
            printQty: 1,
            color: item.color || "N/A",
            size: item.size || "Free",
            category: item.category || "Apparel"
        }))
    );

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `RiverIsland_Labels`,
    });

    const updateQty = (id, val) => {
        setPrintQueue(prev => prev.map(item => 
            item.id === id ? { ...item, printQty: Math.max(1, parseInt(val) || 1) } : item
        ));
    };

    const removeItem = (id) => {
        setPrintQueue(prev => prev.filter(item => item.id !== id));
    };

    const totalLabels = printQueue.reduce((acc, curr) => acc + curr.printQty, 0);

    // Grouping logic for multi-page support
    const allStickersFlat = printQueue.flatMap(item => 
        Array.from({ length: item.printQty }, () => item)
    );

    const stickerPages = [];
    for (let i = 0; i < allStickersFlat.length; i += 65) {
        stickerPages.push(allStickersFlat.slice(i, i + 65));
    }

    return (
        <PageContainer>
            <PrintGlobalStyle />
            <Header>
                <div className="back-section">
                    <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
                    <div>
                        <h2>Print Asset Labels</h2>
                        <span style={{ color: '#A3AED0', fontWeight: 600 }}>RIVER ISLAND • GLOBAL COLLECTION</span>
                    </div>
                </div>
            </Header>

            <LayoutGrid>
                <QueueCard>
                    <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Box size={20} color="#4318FF" />
                        <h4 style={{ margin: 0, color: '#1B2559', fontSize: '18px' }}>Label Configuration</h4>
                    </div>

                    {printQueue.map((item) => (
                        <ItemRow key={item.id}>
                            <div className="main-info">
                                <div className="icon-box"><Package size={24} color="#4318FF" /></div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#1B2559' }}>{item.productName}</div>
                                    <div className="badge-row">
                                        <span className="size">Size: {item.size}</span>
                                        <span className="color">Color: {item.color}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <label style={{ display: 'block', fontSize: '11px', color: '#A3AED0', fontWeight: 800, marginBottom: '5px' }}>COPIES</label>
                                    <input 
                                        type="number" 
                                        value={item.printQty} 
                                        onChange={(e) => updateQty(item.id, e.target.value)} 
                                    />
                                </div>
                                <button 
                                    onClick={() => removeItem(item.id)} 
                                    style={{ border: 'none', background: 'none', color: '#EE5D50', cursor: 'pointer', marginTop: '15px' }}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </ItemRow>
                    ))}
                    {printQueue.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#A3AED0' }}>
                            <Package size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                            <p>No items selected for printing.</p>
                        </div>
                    )}
                </QueueCard>

                <PrintSidebar>
                    <h4 style={{ marginTop: 0, marginBottom: '20px', color: '#1B2559' }}>Print Summary</h4>
                    <div className="summary-item"><span>Total Labels</span><strong>{totalLabels}</strong></div>
                    <div className="summary-item"><span>Total Pages</span><strong>{stickerPages.length}</strong></div>
                    <div className="summary-item"><span>Top Margin</span><strong>20px</strong></div>
                    
                    <div style={{ background: '#F4F7FE', padding: '15px', borderRadius: '15px', marginTop: '20px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#4318FF', marginBottom: '8px' }}>
                            <Palette size={16} />
                            <span style={{ fontSize: '12px', fontWeight: 800 }}>MULTI-PAGE SYNC</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#707EAE', lineHeight: 1.4 }}>
                            Har page par 20px top margin lock kar diya gaya hai. Print settings mein Margins ko "None" rakhein.
                        </p>
                    </div>

                    <ModernPrintBtn onClick={handlePrint} disabled={printQueue.length === 0}>
                        <Printer size={20} />
                        Execute Batch Print
                    </ModernPrintBtn>
                </PrintSidebar>
            </LayoutGrid>

            {/* HIDDEN PRINT TARGET */}
            <div style={{ display: 'none' }}>
                <HiddenPrintSheet ref={printRef}>
                    {stickerPages.map((pageStickers, pageIndex) => (
                        <PrintPage key={pageIndex}>
                            <StickerGrid>
                                {pageStickers.map((item, i) => (
                                    <ModernSticker key={`${pageIndex}-${i}`}>
                                        <div className="top-header">
                                            <span className="brand-name">RIVER ISLAND</span>
                                            <span className="cat">{item.category}</span>
                                        </div>
                                        
                                        <div className="prod-details">{item.productName}</div>
                                        
                                        <div className="meta-data">
                                            <span>SZ: {item.size}</span>
                                            <span>•</span>
                                            <span>COL: {item.color}</span>
                                        </div>

                                        <div className="barcode-wrapper">
                                            <Barcode 
                                                value={item.stockCode} 
                                                width={0.8} 
                                                height={18} 
                                                fontSize={6} 
                                                margin={0}
                                                displayValue={false}
                                            />
                                        </div>

                                        <div className="price-footer">
                                            <span className="sku">{item.stockCode}</span>
                                            <span className="price">₹{item.salePrice}</span>
                                        </div>
                                    </ModernSticker>
                                ))}
                            </StickerGrid>
                        </PrintPage>
                    ))}
                </HiddenPrintSheet>
            </div>
        </PageContainer>
    );
}