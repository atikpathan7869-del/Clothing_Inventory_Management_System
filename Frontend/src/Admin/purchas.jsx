import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { getRequest, postRequest } from "../../Services/apiService";
import { showToast, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";
import PurchaseMaster from "./PurchaseMaster";
import PurchaseDetails from "./PurchaseDetails";

// Updated Modern Design
export const FormContainer = styled.div`
  padding: 2rem; 
  background: #f1f5f9; 
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
`;

export const Card = styled.div`
  background: white; 
  padding: 24px; 
  border-radius: 16px; 
  border: 1px solid #e2e8f0; 
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  h3 { 
    margin-top: 0; 
    font-size: 1.1rem; 
    font-weight: 700;
    color: #1e293b;
    border-bottom: 2px solid #f1f5f9; 
    padding-bottom: 15px; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    i { color: #6366f1; } 
  }
`;

export const Table = styled.table`
  width: 100%; 
  border-collapse: separate; 
  border-spacing: 0 8px;
  th { 
    background: #f8fafc; 
    padding: 12px; 
    font-size: 0.75rem; 
    text-align: left; 
    color: #64748b; 
    font-weight: 700;
    text-transform: uppercase;
    border-bottom: 2px solid #e2e8f0; 
  }
  td { padding: 12px; background: white; border-bottom: 1px solid #f1f5f9; }
`;

export const ActionButton = styled.button`
  padding: 10px 20px; 
  border-radius: 10px; 
  border: none; 
  cursor: pointer; 
  font-weight: 600;
  display: flex; 
  align-items: center; 
  gap: 8px; 
  background: ${props => props.$bg || "#6366f1"}; 
  color: white;
  transition: all 0.2s;
  &:hover { transform: translateY(-1px); filter: brightness(1.1); }
  &:disabled { background: #cbd5e1; cursor: not-allowed; }
`;

const SummaryCard = styled.div`
  background: #1e293b; 
  padding: 30px; 
  border-radius: 20px; 
  margin-bottom: 60px;
  color: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  .summary-label { color: #94a3b8; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
  .summary-value { font-size: 1.5rem; font-weight: 700; color: white; margin: 5px 0 0 0; }
  .grand-total-value { font-size: 2.5rem; font-weight: 800; color: #818cf8; margin: 0; }
`;

const Purchase = () => {
    const [loading, setLoading] = useState(false);
    const [masters, setMasters] = useState({ vendors: [], products: [], financialYears: [] });

    // Cloth IMS Options
    const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"];
    const colorOptions = ["Red", "Blue", "Black", "White", "Navy", "Grey", "Green", "Beige", "Multi"];

    useEffect(() => { fetchMasters(); }, []);

    const fetchMasters = async () => {
        setLoading(true);
        try {
            const [v, p, fy] = await Promise.all([
                getRequest("Vendor/GetAllVendors"),
                getRequest("Product/GetAllProducts"),
                getRequest("Financial_Year/GetAllFinancialYears")
            ]);
            const fyList = fy?.result || fy || [];
            setMasters({ vendors: v?.result || v || [], products: p?.result || p || [], financialYears: fyList });

            // Auto-set Active Financial Year
            const activeFy = fyList.find(f => f.isActive) || fyList[0];
            if (activeFy) formik.setFieldValue("financialYearId", activeFy.id);
            
        } catch (err) { showError("Error", "Master data load failed"); }
        finally { setLoading(false); }
    };

    const calculateRow = (qty, price, gstPer, type) => {
        const q = parseFloat(qty) || 0;
        const p = parseFloat(price) || 0;
        const gPer = parseFloat(gstPer) || 0;
        let grossAmt, gstAmt, total;
        if (type === "Exclusive") {
            grossAmt = q * p;
            gstAmt = (grossAmt * gPer) / 100;
            total = grossAmt + gstAmt;
        } else {
            total = q * p;
            grossAmt = total / (1 + (gPer / 100));
            gstAmt = total - grossAmt;
        }
        return { grossAmt: Number(grossAmt.toFixed(2)), gstAmt: Number(gstAmt.toFixed(2)), total: Number(total.toFixed(2)) };
    };

    const formik = useFormik({
        initialValues: {
            vendorId: "", financialYearId: "", billNo: "", 
            billDate: moment().format("YYYY-MM-DD"), dueDate: moment().add(7, 'days').format("YYYY-MM-DD"), 
            remark: "", eWayBillNo: "",
            purchaseDetail: [{ productId: "", size: "", color: "", qty: 1, costPrice: 0, gstPer: 18, gstType: "Exclusive", grossAmt: 0, gstAmt: 0, total: 0 }]
        },
        enableReinitialize: false, // Set to false so user input isn't cleared when masters load
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const payload = {
                    ...values,
                    vendorId: parseInt(values.vendorId),
                    financialYearId: parseInt(values.financialYearId),
                    grossAmount: values.purchaseDetail.reduce((sum, i) => sum + i.grossAmt, 0),
                    gstAmount: values.purchaseDetail.reduce((sum, i) => sum + i.gstAmt, 0),
                    netAmount: values.purchaseDetail.reduce((sum, i) => sum + i.total, 0),
                    purchaseDetail: values.purchaseDetail.map(d => ({ 
                        ...d, productId: parseInt(d.productId), qty: parseFloat(d.qty), costPrice: parseFloat(d.costPrice) 
                    }))
                };
                const res = await postRequest("Purchase/SavePurchase", payload);
                if (res.status === 'OK' || res.isSuccess) { 
                    showToast("success", "Purchase Saved!"); 
                    formik.resetForm(); 
                } else { showError("Save Failed", res.result || res.message); }
            } catch (err) { showError("Error", "Network Error"); }
            finally { setLoading(false); }
        }
    });

    const updateRowValues = (index, qty, price, gstPer, type) => {
        const calc = calculateRow(qty, price, gstPer, type);
        formik.setFieldValue(`purchaseDetail.${index}.grossAmt`, calc.grossAmt);
        formik.setFieldValue(`purchaseDetail.${index}.gstAmt`, calc.gstAmt);
        formik.setFieldValue(`purchaseDetail.${index}.total`, calc.total);
    };

    const totalWithoutGst = formik.values.purchaseDetail.reduce((sum, i) => sum + (Number(i.qty) * Number(i.costPrice)), 0);
    const totalGstAmt = formik.values.purchaseDetail.reduce((sum, i) => sum + Number(i.gstAmt || 0), 0);
    const grandNetTotal = formik.values.purchaseDetail.reduce((sum, i) => sum + Number(i.total || 0), 0);

    return (
        <FormContainer>
            <PleaseWait show={loading} />
            <FormikProvider value={formik}>
                <form onSubmit={formik.handleSubmit}>
                    <div className="mb-4">
                        <h2 className="fw-bold text-dark mb-1">Stock Procurement</h2>
                        <p className="text-muted">Create a new purchase entry for your inventory</p>
                    </div>
                    <PurchaseMaster formik={formik} masters={masters} />
                    <PurchaseDetails 
                        formik={formik} 
                        masters={masters} 
                        updateRowValues={updateRowValues} 
                        sizeOptions={sizeOptions} 
                        colorOptions={colorOptions} 
                    />
                    <SummaryCard>
                        <div className="row align-items-center text-center">
                            <div className="col-md-3">
                                <p className="summary-label">Taxable Amount</p>
                                <p className="summary-value">₹ {totalWithoutGst.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="col-md-3">
                                <p className="summary-label">Total GST (+)</p>
                                <p className="summary-value" style={{color:'#10b981'}}>₹ {totalGstAmt.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="col-md-3">
                                <p className="summary-label">Net Payable</p>
                                <p className="grand-total-value">₹ {grandNetTotal.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="col-md-3">
                                <ActionButton type="submit" disabled={loading} style={{ padding: '20px 0', width: '100%', justifyContent: 'center', fontSize: '1.2rem', background: '#818cf8' }}>
                                    <i className="bi bi-check2-all"></i> {loading ? "PROCESSING..." : "SAVE PURCHASE"}
                                </ActionButton>
                            </div>
                        </div>
                    </SummaryCard>
                </form>
            </FormikProvider>
        </FormContainer>
    );
};
export default Purchase;