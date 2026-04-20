    import React from "react";
    import { FieldArray } from "formik";
    import Select from "react-select";
    import CreatableSelect from "react-select/creatable";
    import { Table, ActionButton, Card } from "./purchas";

    const PurchaseDetails = ({ formik, masters, updateRowValues, sizeOptions, colorOptions }) => {
        const { values, setFieldValue } = formik;

        // Formatting options for Searchable Select
        const productOptions = masters.products?.map(p => ({
            value: p.id,
            label: p.productName || p.name
        })) || [];

        const formattedSizes = sizeOptions?.map(s => ({ value: s, label: s })) || [];
        const formattedColors = colorOptions?.map(c => ({ value: c, label: c })) || [];

        // Custom styles for React-Select to match your UI and prevent overlapping
        const customSelectStyles = {
            control: (base) => ({
                ...base,
                border: '1px solid #dee2e6',
                boxShadow: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                minHeight: '34px',
                background: '#fff'
            }),
            menu: (base) => ({ ...base, zIndex: 9999 }),
            container: (base) => ({
                ...base,
                minWidth: '100px'
            })
        };

        const handleRowChange = (index, field, value) => {
            // Update formik state
            setFieldValue(`purchaseDetail.${index}.${field}`, value);
            
            // Get fresh reference of the row for calculation logic
            const row = values.purchaseDetail[index];
            const qty = field === 'qty' ? value : row.qty;
            const price = field === 'costPrice' ? value : row.costPrice;
            const gst = field === 'gstPer' ? value : row.gstPer;
            const type = field === 'gstType' ? value : row.gstType;
            
            // Call the parent calculation function for totals
            updateRowValues(index, qty, price, gst, type);
        };

        return (
            <FieldArray name="purchaseDetail">
                {({ push, remove }) => (
                    <Card className="border-0 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="mb-0 border-0 pb-0" style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                                <i className="bi bi-box-seam me-2"></i> Item Details
                            </h3>
                            <ActionButton 
                                type="button" 
                                $bg="#10b981" 
                                onClick={() => push({ 
                                    productId: "", 
                                    size: "", 
                                    color: "", 
                                    qty: 1, 
                                    costPrice: 0, 
                                    salePrice: 0, 
                                    gstPer: 18, 
                                    gstType: "Exclusive", 
                                    grossAmt: 0, 
                                    gstAmt: 0, 
                                    total: 0 
                                })}
                            >
                                <i className="bi bi-plus-lg me-1"></i> Add New Item
                            </ActionButton>
                        </div>

                        <div className="table-responsive">
                            <Table className="align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th style={{ minWidth: '200px' }}>Product Selection</th>
                                        <th style={{ minWidth: '120px' }}>Size</th>
                                        <th style={{ minWidth: '120px' }}>Color</th>
                                        <th style={{ width: '90px' }}>Qty</th>
                                        <th style={{ width: '120px' }}>Cost Price</th>
                                        <th style={{ width: '120px' }}>Sale Price</th>
                                        <th style={{ width: '100px' }}>GST %</th>
                                        <th style={{ width: '110px' }}>Type</th>
                                        <th className="text-end" style={{ width: '120px' }}>Total</th>
                                        <th className="text-center" style={{ width: '50px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {values.purchaseDetail.map((item, index) => (
                                        <tr key={index}>
                                            {/* Product Search */}
                                            <td>
                                                <Select
                                                    options={productOptions}
                                                    placeholder="Select Product"
                                                    styles={customSelectStyles}
                                                    value={productOptions.find(opt => opt.value === item.productId) || null}
                                                    onChange={(opt) => handleRowChange(index, 'productId', opt ? opt.value : "")}
                                                />
                                            </td>

                                            {/* Size - Creatable (Add New Option) */}
                                            <td>
                                                <CreatableSelect
                                                    isClearable
                                                    options={formattedSizes}
                                                    placeholder="Size"
                                                    formatCreateLabel={(inputValue) => `+ Add "${inputValue}"`}
                                                    styles={customSelectStyles}
                                                    value={item.size ? { label: item.size, value: item.size } : null}
                                                    onChange={(opt) => handleRowChange(index, 'size', opt ? opt.value : "")}
                                                />
                                            </td>

                                            {/* Color - Creatable (Add New Option) */}
                                            <td>
                                                <CreatableSelect
                                                    isClearable
                                                    options={formattedColors}
                                                    placeholder="Color"
                                                    formatCreateLabel={(inputValue) => `+ Add "${inputValue}"`}
                                                    styles={customSelectStyles}
                                                    value={item.color ? { label: item.color, value: item.color } : null}
                                                    onChange={(opt) => handleRowChange(index, 'color', opt ? opt.value : "")}
                                                />
                                            </td>

                                            {/* Qty */}
                                            <td>
                                                <input 
                                                    type="number" 
                                                    className="form-control form-control-sm text-center" 
                                                    value={item.qty} 
                                                    onChange={(e) => handleRowChange(index, 'qty', e.target.value)} 
                                                />
                                            </td>

                                            {/* Cost Price */}
                                            <td>
                                                <div className="input-group input-group-sm">
                                                    <span className="input-group-text bg-white border-end-0">₹</span>
                                                    <input 
                                                        type="number" 
                                                        className="form-control border-start-0 ps-0 fw-bold" 
                                                        value={item.costPrice} 
                                                        onChange={(e) => handleRowChange(index, 'costPrice', e.target.value)} 
                                                    />
                                                </div>
                                            </td>

                                            {/* Sale Price */}
                                            <td>
                                                <div className="input-group input-group-sm">
                                                    <span className="input-group-text bg-white border-end-0 text-success">₹</span>
                                                    <input 
                                                        type="number" 
                                                        className="form-control border-start-0 ps-0 fw-bold text-success" 
                                                        placeholder="Sale"
                                                        value={item.salePrice} 
                                                        onChange={(e) => setFieldValue(`purchaseDetail.${index}.salePrice`, e.target.value)} 
                                                    />
                                                </div>
                                            </td>

                                            {/* GST % */}
                                            <td>
                                                <select 
                                                    className="form-select form-select-sm" 
                                                    value={item.gstPer} 
                                                    onChange={(e) => handleRowChange(index, 'gstPer', e.target.value)}
                                                >
                                                    {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}
                                                </select>
                                            </td>

                                            {/* GST Type */}
                                            <td>
                                                <select 
                                                    className="form-select form-select-sm" 
                                                    value={item.gstType} 
                                                    onChange={(e) => handleRowChange(index, 'gstType', e.target.value)}
                                                >
                                                    <option value="Exclusive">Excl.</option>
                                                    <option value="Inclusive">Incl.</option>
                                                </select>
                                            </td>

                                            {/* Total Row */}
                                            <td className="text-end fw-bold text-primary" style={{ fontSize: '14px' }}>
                                                ₹ {Number(item.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>

                                            {/* Action */}
                                            <td className="text-center">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline-danger btn-sm border-0 rounded-circle" 
                                                    style={{ width: '30px', height: '30px', padding: '0' }}
                                                    onClick={() => values.purchaseDetail.length > 1 && remove(index)}
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                )}
            </FieldArray>
        );
    };

    export default PurchaseDetails;