import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useFormik, FormikProvider, FieldArray } from "formik";
import moment from "moment";
import { FiPackage, FiTruck, FiSave, FiArrowLeft, FiPlus, FiTrash2, FiInfo, FiTag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { getRequest, postRequest } from "../../Services/apiService";
import { showToast, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= MODERN STYLES ================= */
const FormWrapper = styled.div`padding: 2rem; background: #f8fafc; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif;`;

const Header = styled.div`
  display: flex; align-items: center; gap: 20px; margin-bottom: 2rem;
  .back-btn { background: white; border: 1px solid #e2e8f0; padding: 10px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; transition: 0.2s; &:hover { background: #f1f5f9; } }
  .title-area h2 { color: #0f172a; font-weight: 800; margin: 0; font-size: 1.6rem; }
`;

const GlassCard = styled.div`
  background: white; padding: 1.5rem; border-radius: 20px; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  margin-bottom: 1.5rem; border: 1px solid #f1f5f9;
  h3 { font-size: 1rem; color: #1e293b; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 8px; font-weight: 700; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
`;

const InputGroup = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem;
  label { display: block; color: #64748b; font-size: 0.75rem; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  input, select { 
    width: 100%; padding: 11px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; background: #fff; font-size: 0.9rem;
    &:focus { border-color: #4f46e5; ring: 2px solid #e0e7ff; }
  }
`;

const ItemsTable = styled.table`
  width: 100%; border-collapse: collapse;
  th { text-align: left; padding: 12px; color: #64748b; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; background: #f8fafc; }
  td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
  input, select { border: 1px solid #e2e8f0 !important; border-radius: 6px; padding: 6px; font-size: 0.85rem; width: 100%; }
  .sales-price-cell { background: #f0fdf4; border: 1px solid #bbf7d0 !important; color: #15803d; font-weight: 700; }
`;

const ActionStrip = styled.div`
  background: white; padding: 1.5rem; border-radius: 20px; display: flex; 
  justify-content: space-between; align-items: center; border: 1px solid #e2e8f0; position: sticky; bottom: 20px; box-shadow: 0 -10px 15px -3px rgba(0,0,0,0.05);
  .totals { text-align: right; .net { font-size: 1.5rem; font-weight: 800; color: #4f46e5; } .tax { font-size: 0.85rem; color: #64748b; } }
`;

const SaveBtn = styled.button`
  background: #4f46e5; color: white; padding: 14px 35px; border-radius: 12px; border: none;
  font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 10px; cursor: pointer;
  transition: all 0.2s; &:hover { background: #4338ca; transform: translateY(-2px); }
  &:disabled { background: #94a3b8; }
`;

const StockkeeperPurchaseForm = () => {
    const [loading, setLoading] = useState(false);
    const [masters, setMasters] = useState({ vendors: [], products: [] });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMasters = async () => {
            setLoading(true);
            try {
                const [v, p] = await Promise.all([
                    getRequest("Vendor/GetAllVendors"),
                    getRequest("Product/GetAllProducts")
                ]);
                setMasters({ vendors: v?.result || [], products: p?.result || [] });
            } catch (err) { showError("Sync Error", "Could not load master data"); }
            finally { setLoading(false); }
        };
        fetchMasters();
    }, []);

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
        return { 
            grossAmt: Number(grossAmt.toFixed(2)), 
            gstAmt: Number(gstAmt.toFixed(2)), 
            total: Number(total.toFixed(2)) 
        };
    };

    const formik = useFormik({
        initialValues: {
            vendorId: "", billNo: "", 
            billDate: moment().format("YYYY-MM-DD"),
            dueDate: moment().add(7, 'days').format("YYYY-MM-DD"),
            remark: "",
            purchaseDetail: [{ 
                productId: "", size: "", color: "", qty: 1, 
                costPrice: 0, salePrice: 0, 
                gstPer: 5, gstType: "Exclusive", 
                grossAmt: 0, gstAmt: 0, total: 0 
            }]
        },
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const payload = {
                    ...values,
                    vendorId: parseInt(values.vendorId),
                    financialYearId: parseInt(localStorage.getItem("FyId") || 1),
                    grossAmount: values.purchaseDetail.reduce((sum, i) => sum + i.grossAmt, 0),
                    gstAmount: values.purchaseDetail.reduce((sum, i) => sum + i.gstAmt, 0),
                    netAmount: values.purchaseDetail.reduce((sum, i) => sum + i.total, 0),
                    purchaseDetail: values.purchaseDetail.map(d => ({ 
                        ...d, 
                        productId: parseInt(d.productId), 
                        qty: parseFloat(d.qty), 
                        costPrice: parseFloat(d.costPrice),
                        salePrice: parseFloat(d.salePrice) // Backend property 'SalePrice' mapping
                    }))
                };
                const res = await postRequest("Purchase/SavePurchase", payload);
                if (res.status === 'OK') {
                    showToast("success", "Stock Added Successfully!");
                    navigate("/Staff/purchaseList");
                }
            } catch (err) { showError("Error", "Failed to save entry"); }
            finally { setLoading(false); }
        }
    });

    const handleRowChange = (index, field, value) => {
        formik.setFieldValue(`purchaseDetail.${index}.${field}`, value);
        const row = formik.values.purchaseDetail[index];
        
        // Calculation Logic
        const qty = field === 'qty' ? value : row.qty;
        const price = field === 'costPrice' ? value : row.costPrice;
        const gst = field === 'gstPer' ? value : row.gstPer;
        const type = field === 'gstType' ? value : row.gstType;

        const calc = calculateRow(qty, price, gst, type);
        formik.setFieldValue(`purchaseDetail.${index}.grossAmt`, calc.grossAmt);
        formik.setFieldValue(`purchaseDetail.${index}.gstAmt`, calc.gstAmt);
        formik.setFieldValue(`purchaseDetail.${index}.total`, calc.total);
    };

    return (
        <FormWrapper>
            <PleaseWait show={loading} />
            <Header>
                <button className="back-btn" onClick={() => navigate(-1)}><FiArrowLeft size={20}/></button>
                <div className="title-area"><h2>Stock Inward Entry</h2></div>
            </Header>

            <FormikProvider value={formik}>
                <GlassCard>
                    <h3><FiTruck /> Vendor & Invoice Information</h3>
                    <InputGroup>
                        <div>
                            <label>Supplier Name</label>
                            <select name="vendorId" onChange={formik.handleChange} value={formik.values.vendorId}>
                                <option value="">Select Vendor</option>
                                {masters.vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.city})</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Bill Number</label>
                            <input name="billNo" placeholder="Enter Invoice #" onChange={formik.handleChange} value={formik.values.billNo} />
                        </div>
                        <div>
                            <label>Invoice Date</label>
                            <input type="date" name="billDate" onChange={formik.handleChange} value={formik.values.billDate} />
                        </div>
                    </InputGroup>
                </GlassCard>

                <GlassCard>
                    <h3><FiPackage /> Inventory Items</h3>
                    <FieldArray name="purchaseDetail" render={arrayHelpers => (
                        <>
                            <ItemsTable>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th width="100">Size</th>
                                        <th width="80">Qty</th>
                                        <th width="120">Cost (Buy)</th>
                                        <th width="120">Sale (Sell)</th>
                                        <th width="100">GST %</th>
                                        <th width="130">Total (₹)</th>
                                        <th width="40"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formik.values.purchaseDetail.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <select onChange={(e) => handleRowChange(index, 'productId', e.target.value)}>
                                                    <option value="">Select Product</option>
                                                    {masters.products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                                                </select>
                                            </td>
                                            <td><input name={`purchaseDetail.${index}.size`} placeholder="e.g. M" onChange={formik.handleChange} /></td>
                                            <td><input type="number" value={item.qty} onChange={(e) => handleRowChange(index, 'qty', e.target.value)} /></td>
                                            <td><input type="number" value={item.costPrice} onChange={(e) => handleRowChange(index, 'costPrice', e.target.value)} /></td>
                                            <td><input type="number" className="sales-price-cell" name={`purchaseDetail.${index}.salePrice`} onChange={formik.handleChange} placeholder="MRP" /></td>
                                            <td>
                                                <select value={item.gstPer} onChange={(e) => handleRowChange(index, 'gstPer', e.target.value)}>
                                                    <option value="5">5%</option><option value="12">12%</option><option value="18">18%</option>
                                                </select>
                                            </td>
                                            <td style={{ fontWeight: 700 }}>{item.total.toFixed(2)}</td>
                                            <td><FiTrash2 color="#ef4444" cursor="pointer" onClick={() => arrayHelpers.remove(index)} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </ItemsTable>
                            <button type="button" onClick={() => arrayHelpers.push({ productId: "", size: "", qty: 1, costPrice: 0, salePrice: 0, gstPer: 5, gstType: "Exclusive", grossAmt: 0, gstAmt: 0, total: 0 })}
                                style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', width: '100%', padding: '12px', marginTop: '15px', borderRadius: '10px', color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }}>
                                + Add Another Item
                            </button>
                        </>
                    )} />
                </GlassCard>

                <ActionStrip>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                         <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            <FiInfo /> <b>Note:</b> Entry will affect live stock.
                         </div>
                    </div>
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                        <div className="totals">
                            <div className="tax">Tax: ₹{formik.values.purchaseDetail.reduce((s, i) => s + i.gstAmt, 0).toFixed(2)}</div>
                            <div className="net">₹ {formik.values.purchaseDetail.reduce((s, i) => s + i.total, 0).toLocaleString()}</div>
                        </div>
                        <SaveBtn onClick={formik.handleSubmit} disabled={loading}>
                            <FiSave size={18}/> Finalize & Save Purchase
                        </SaveBtn>
                    </div>
                </ActionStrip>
            </FormikProvider>
        </FormWrapper>
    );
};

export default StockkeeperPurchaseForm;