import React from "react";
import { Card } from "./purchas"; // Ensure filename case matches

const PurchaseMaster = ({ formik, masters }) => {
    const { values, handleChange, handleBlur, touched, errors } = formik;
    
    // Find matching FY from masters
    const currentFy = masters.financialYears?.find(f => f.id == values.financialYearId);

    return (
        <Card>
            <h3><i className="bi bi-receipt"></i> Basic Details</h3>
            <div className="row g-4">
                <div className="col-md-5">
                    <label className="small fw-bold mb-2">Vendor Name *</label>
                    <select name="vendorId" className={`form-select ${touched.vendorId && errors.vendorId ? "is-invalid" : ""}`}
                        value={values.vendorId} onChange={handleChange} onBlur={handleBlur} style={{borderRadius:'8px', padding:'10px'}}>
                        <option value="">-- Select Vendor --</option>
                        {masters.vendors?.map(v => <option key={v.id} value={v.id}>{v.vendorName || v.name}</option>)}
                    </select>
                </div>
                <div className="col-md-3">
                    <label className="small fw-bold mb-2">Bill Number *</label>
                    <input name="billNo" placeholder="Enter Bill No" className={`form-control ${touched.billNo && errors.billNo ? "is-invalid" : ""}`}
                        value={values.billNo} onChange={handleChange} style={{borderRadius:'8px', padding:'10px'}} />
                </div>
                <div className="col-md-4">
                    <label className="small fw-bold mb-2">E-Way Bill Number</label>
                    <input name="eWayBillNo" maxLength="12" placeholder="12 Digit No" className="form-control"
                        value={values.eWayBillNo} onChange={handleChange} style={{borderRadius:'8px', padding:'10px'}} />
                </div>
                <div className="col-md-3">
                    <label className="small fw-bold mb-2">Bill Date</label>
                    <input type="date" name="billDate" className="form-control" value={values.billDate} onChange={handleChange} style={{borderRadius:'8px', padding:'10px'}}/>
                </div>
                <div className="col-md-3">
                    <label className="small fw-bold mb-2">Due Date</label>
                    <input type="date" name="dueDate" className="form-control" value={values.dueDate} onChange={handleChange} style={{borderRadius:'8px', padding:'10px'}}/>
                </div>
                <div className="col-md-2">
                    <label className="small fw-bold mb-2 text-muted">Financial Year</label>
                    <input type="text" className="form-control bg-light fw-bold" 
                        value={currentFy ? (currentFy.financialYear || currentFy.name) : "Loading..."} disabled style={{borderRadius:'8px', padding:'10px', border:'none'}} />
                </div>
                <div className="col-md-4">
                    <label className="small fw-bold mb-2">Remark / Note</label>
                    <input name="remark" placeholder="Optional remark" className="form-control" value={values.remark} onChange={handleChange} style={{borderRadius:'8px', padding:'10px'}} />
                </div>
            </div>
        </Card>
    );
};
export default PurchaseMaster;