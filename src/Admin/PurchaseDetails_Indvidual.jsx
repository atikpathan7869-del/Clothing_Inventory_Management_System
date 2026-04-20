import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getRequest } from "../../Services/apiService";
import { showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= STYLES ================= */

const PageContainer = styled.div`
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
  @media print { background: white; padding: 10px; }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  @media print { display: none; }
`;

const ActionButton = styled.button`
  background: ${props => props.$bg || "#64748b"};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  &:hover { opacity: 0.9; transform: translateY(-1px); }
`;

const StyledCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  margin-bottom: 20px;
  border: 1px solid #f1f5f9;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
`;

const InfoBox = styled.div`
  label {
    display: block;
    font-size: 0.7rem;
    color: #94a3b8;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
  }
  p {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;

  thead th {
    background: #f8fafc;
    padding: 14px 12px;
    text-align: left;
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    border-bottom: 2px solid #e2e8f0;
  }

  tbody td {
    padding: 14px 12px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.9rem;
    color: #334155;
  }

  tfoot td {
    padding: 18px 12px;
    font-weight: 700;
    background: #f8fafc;
    border-top: 2px solid #e2e8f0;
  }
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  background: ${props => props.$color || "#f1f5f9"};
  color: ${props => props.$textColor || "#475569"};
`;

/* ================= COMPONENT ================= */

export default function PurchaseDetails_Indvidual() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPurchaseDetails();
    }, [id]);

    const fetchPurchaseDetails = async () => {
        try {
            setLoading(true);
            const res = await getRequest(`PurchaseDetails/GetPurchaseDetailsByPurchaseId/${id}`);
            if (res.status === "OK") {
                setDetails(res.result || []);
            } else {
                showError("Error", "Could not fetch details");
            }
        } catch (err) {
            showError("Error", "Server connection failed");
        } finally {
            setLoading(false);
        }
    };

    // Calculate Totals
    const firstItem = details[0] || {};
    
    // Fallback logic for Vendor Info if nested in the object
    const vendorName = firstItem.vendorName || firstItem.purchase?.vendorName || "Global Collection Supplier";
    const billNo = firstItem.billNo || firstItem.purchase?.billNo || "---";
    const purchaseDate = firstItem.purchaseDate || firstItem.purchase?.purchaseDate;

    const totalQty = details.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    const totalTaxable = details.reduce((sum, item) => sum + (Number(item.costPrice) * Number(item.qty) || 0), 0);
    const grandTotal = details.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const totalTax = grandTotal - totalTaxable;

    return (
        <PageContainer>
            <PleaseWait show={loading} />

            <HeaderSection>
                <div>
                    <h2 style={{ margin: 0, color: "#0f172a" }}>Purchase Report</h2>
                    <small style={{ color: "#64748b", fontWeight: 500 }}>INV-REF: #{id}</small>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                    <ActionButton $bg="#10b981" onClick={() => window.print()}>
                        Print Invoice
                    </ActionButton>
                    <ActionButton onClick={() => navigate(-1)}>
                        Back to Inventory
                    </ActionButton>
                </div>
            </HeaderSection>

            {/* --- MASTER HEADER DATA --- */}
            <StyledCard>
                <div style={{ borderBottom: "1px solid #f1f5f9", marginBottom: "20px", paddingBottom: "10px" }}>
                    <h4 style={{ margin: 0, color: "#334155" }}>Vendor & Bill Information</h4>
                </div>
                <SummaryGrid>
                    <InfoBox>
                        <label>Supplier / Vendor</label>
                        <p>{vendorName}</p>
                    </InfoBox>
                    <InfoBox>
                        <label>Invoice Number</label>
                        <p>{billNo}</p>
                    </InfoBox>
                    <InfoBox>
                        <label>Date of Purchase</label>
                        <p>{purchaseDate ? new Date(purchaseDate).toLocaleDateString('en-GB') : "N/A"}</p>
                    </InfoBox>
                    <InfoBox>
                        <label>Total Quantity</label>
                        <p>{totalQty} Units</p>
                    </InfoBox>
                    <InfoBox>
                        <label>Grand Total</label>
                        <p style={{ color: "#10b981", fontSize: "1.2rem" }}>₹{grandTotal.toLocaleString('en-IN')}</p>
                    </InfoBox>
                </SummaryGrid>
            </StyledCard>

            {/* --- LINE ITEM TABLE --- */}
            <StyledCard>
                <h4 style={{ marginTop: 0, marginBottom: "20px" }}>Itemized Stock Breakdown</h4>
                <div style={{ overflowX: "auto" }}>
                    <StyledTable>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product Details</th>
                                <th>Barcode/HSN</th>
                                <th>Size</th>
                                <th>Color</th>
                                <th>Qty</th>
                                <th>Price/Unit</th>
                                <th>Taxable</th>
                                <th>GST</th>
                                <th style={{ textAlign: "right" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>{item.productName}</div>
                                        <small style={{ color: "#94a3b8" }}>Garment ID: {item.id}</small>
                                    </td>
                                    <td><code style={{ color: "#6366f1" }}>{item.hsnCode || '---'}</code></td>
                                    <td><Badge $color="#ebf5ff" $textColor="#2563eb">{item.size}</Badge></td>
                                    <td>{item.color}</td>
                                    <td>{item.qty}</td>
                                    <td>₹{item.costPrice?.toFixed(2)}</td>
                                    <td>₹{(item.costPrice * item.qty).toFixed(2)}</td>
                                    <td>{item.gstPer}%</td>
                                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                                        ₹{item.total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="5" style={{ textAlign: "right" }}>CONSOLIDATED TOTALS:</td>
                                <td>{totalQty}</td>
                                <td>-</td>
                                <td>₹{totalTaxable.toLocaleString('en-IN')}</td>
                                <td>Tax: ₹{totalTax.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: "right", color: "#0f172a", fontSize: "1rem" }}>
                                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </StyledTable>
                </div>
            </StyledCard>

            {/* --- BOTTOM SUMMARY --- */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                <StyledCard>
                    <h4 style={{ marginTop: 0 }}>System Notes</h4>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: "1.6" }}>
                        This document serves as an internal stock verification report for <strong>Global Collection</strong>. 
                        Prices include integrated GST calculations. Any discrepancies in "Total Units" should be 
                        reported to the Master Data admin.
                    </p>
                </StyledCard>
                
                <StyledCard>
                    <h4 style={{ marginTop: 0 }}>Final Settlement Analysis</h4>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#64748b" }}>Total Taxable Value (Before GST):</span>
                        <span style={{ fontWeight: 600 }}>₹{totalTaxable.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#64748b" }}>Total Tax Collected (GST):</span>
                        <span style={{ fontWeight: 600, color: "#f59e0b" }}>₹{totalTax.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", paddingTop: "15px", borderTop: "1px dashed #e2e8f0" }}>
                        <span style={{ fontWeight: 700 }}>Final Payable Amount:</span>
                        <span style={{ fontWeight: 800, color: "#10b981", fontSize: "1.1rem" }}>
                            ₹{grandTotal.toLocaleString('en-IN')}
                        </span>
                    </div>
                </StyledCard>
            </div>
        </PageContainer>
    );
}