import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { FiPrinter, FiArrowLeft } from "react-icons/fi";
import { getRequest } from "../../Services/apiService";
import moment from "moment";

const ViewContainer = styled.div`
  padding: 3rem;
  background: #fff;
  max-width: 900px;
  margin: 2rem auto;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #f4f7fe;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
  .brand h1 { color: #4318FF; margin: 0; font-size: 1.5rem; }
  .info { text-align: right; color: #707EAE; font-size: 0.9rem; }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  h4 { color: #A3AED0; text-transform: uppercase; font-size: 0.75rem; margin-bottom: 10px; }
  p { color: #1B2559; font-weight: 700; margin: 0; }
`;

const StockkeeperPurchaseView = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getRequest(`Purchase/GetPurchaseById/${id}`).then((res) => setData(res.result));
    }, [id]);

    const handlePrint = () => {
        const printContent = document.getElementById("printable-area").innerHTML;
        const printWindow = window.open("", "_blank");

        printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt - ${data.billNo}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #1B2559; }
            .brand h1 { color: #4318FF; margin: 0; font-size: 24px; }
            .info { text-align: right; color: #707EAE; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f4f7fe; padding-bottom: 20px; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            h4 { color: #A3AED0; text-transform: uppercase; font-size: 12px; margin-bottom: 5px; }
            p { margin: 0; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f4f7fe; text-align: left; padding: 12px; color: #A3AED0; font-size: 12px; text-transform: uppercase; }
            td { padding: 15px; border-bottom: 1px solid #f4f7fe; }
            .total-section { margin-top: 40px; text-align: right; border-top: 2px solid #f4f7fe; paddingTop: 20px; }
            .total-label { color: #A3AED0; font-size: 12px; }
            .total-amount { color: #4318FF; font-size: 28px; margin: 0; }
            @page { margin: 10mm; }
            @media print {
              * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <h1>River Island COLLECTION</h1>
              <p>Inventory Receipt</p>
            </div>
            <div class="info">
              <p>Invoice #: ${data.billNo}</p>
              <p>Date: ${moment(data.billDate).format("DD-MM-YYYY")}</p>
            </div>
          </div>
          ${printContent.replace(/<table.*?>/g, '<table>')} 
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();

        // Slight delay to ensure images/fonts load before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    if (!data) return null;

    return (
        <div style={{ background: "#f4f7fe", minHeight: "100vh", padding: "20px" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                <button onClick={() => navigate(-1)} style={{ border: "none", background: "none", fontWeight: 700, color: "#4318FF", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                    <FiArrowLeft /> Back
                </button>
                <button onClick={handlePrint} style={{ background: "#1B2559", color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FiPrinter /> Open & Print
                </button>
            </div>

            <ViewContainer >
                <InvoiceHeader>
                    <div className="brand">
                        <h1>River Island COLLECTION</h1>
                        <p style={{ color: "#707EAE" }}>Inventory Receipt</p>
                    </div>
                    <div className="info">
                        <p>Invoice #: <strong>{data.billNo}</strong></p>
                        <p>Date: {moment(data.billDate).format("DD-MM-YYYY")}</p>
                    </div>
                </InvoiceHeader>

                <div id="printable-area">
                    <DetailGrid>
                        <div>
                            <h4>Supplier / Vendor</h4>
                            <p>{data.vendor?.name}</p>
                            <span style={{ fontSize: "0.8rem", color: "#707EAE" }}>{data.vendor?.city}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <h4>Warehouse Remark</h4>
                            <p>{data.remark || "N/A"}</p>
                        </div>
                    </DetailGrid>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f4f7fe", textAlign: "left" }}>
                                <th style={{ padding: "12px" }}>Product Description</th>
                                <th>Qty</th>
                                <th>Cost</th>
                                <th style={{ textAlign: "right", paddingRight: "12px" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.purchaseDetail?.map((item, i) => (
                                <tr key={i} style={{ borderBottom: "1px solid #f4f7fe" }}>
                                    <td style={{ padding: "15px" }}>
                                        <div style={{ fontWeight: 700 }}>{item.product?.productName}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#A3AED0" }}>Size: {item.size} | Color: {item.color}</div>
                                    </td>
                                    <td>{item.qty}</td>
                                    <td>₹{item.costPrice}</td>
                                    <td style={{ textAlign: "right", paddingRight: "12px", fontWeight: 700 }}>₹{(item.qty * item.costPrice).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: "3rem", textAlign: "right", borderTop: "2px solid #f4f7fe", paddingTop: "1.5rem" }}>
                        <h4 style={{ color: "#A3AED0", fontSize: "0.8rem" }}>GRAND TOTAL</h4>
                        <h2 style={{ color: "#4318FF", margin: 0 }}>₹ {data.netAmount?.toLocaleString()}</h2>
                    </div>
                </div>


            </ViewContainer>
        </div>
    );
};

export default StockkeeperPurchaseView;