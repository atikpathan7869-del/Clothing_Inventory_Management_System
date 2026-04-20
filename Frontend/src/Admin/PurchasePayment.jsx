const Purchase = () => {
    const [loading, setLoading] = useState(false);
    const [masters, setMasters] = useState({ 
        vendors: [], products: [], financialYears: []
    });

    useEffect(() => { fetchMasters(); }, []);

    const fetchMasters = async () => {
        setLoading(true);
        try {
            const [v, p, fy] = await Promise.all([
                getRequest("Vendor/GetAllVendors"),
                getRequest("Product/GetAllProducts"),
                getRequest("Financial_Year/GetAllFinancialYears")
            ]);
            setMasters(prev => ({ ...prev, vendors: v?.result || [], products: p?.result || [], financialYears: fy?.result || [] }));
        } catch (err) { showError("Error", "Could not load master data"); } finally { setLoading(false); }
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
            vendorId: "", 
            financialYearId: "", 
            billNo: "", 
            billDate: moment().format("YYYY-MM-DD"),
            dueDate: moment().add(7, 'days').format("YYYY-MM-DD"), 
            remark: "", 
            eWayBillNo: "",
            purchaseDetail: [{ productId: "", qty: 1, costPrice: 0, gstPer: 18, gstType: "Exclusive", grossAmt: 0, gstAmt: 0, total: 0 }]
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!values.financialYearId) return showError("Required", "Please select Financial Year");
            setLoading(true);
            try {
                // PAYLOAD WITHOUT PAYMENTS
                const payload = {
                    vendorId: parseInt(values.vendorId),
                    financialYearId: parseInt(values.financialYearId),
                    billNo: values.billNo,
                    billDate: values.billDate,
                    dueDate: values.dueDate,
                    remark: values.remark,
                    eWayBillNo: values.eWayBillNo,
                    grossAmount: values.purchaseDetail.reduce((sum, i) => sum + i.grossAmt, 0),
                    gstAmount: values.purchaseDetail.reduce((sum, i) => sum + i.gstAmt, 0),
                    netAmount: values.purchaseDetail.reduce((sum, i) => sum + i.total, 0),
                    purchaseDetail: values.purchaseDetail.map(d => ({ 
                        productId: parseInt(d.productId), 
                        qty: parseFloat(d.qty), 
                        costPrice: parseFloat(d.costPrice),
                        gstPer: parseFloat(d.gstPer),
                        gstType: d.gstType,
                        grossAmt: d.grossAmt,
                        gstAmt: d.gstAmt,
                        total: d.total
                    }))
                };

                const res = await postRequest("Purchase/SavePurchase", payload);
                if (res.isSuccess) { 
                    showToast("success", "Saved!"); 
                    formik.resetForm(); 
                }
            } catch (err) { 
                showError("Error", "Save failed"); 
            } finally { 
                setLoading(false); 
            }
        }
    });

    const updateRowValues = (index, qty, price, gstPer, type) => {
        const calc = calculateRow(qty, price, gstPer, type);
        formik.setFieldValue(`purchaseDetail.${index}.grossAmt`, calc.grossAmt);
        formik.setFieldValue(`purchaseDetail.${index}.gstAmt`, calc.gstAmt);
        formik.setFieldValue(`purchaseDetail.${index}.total`, calc.total);
    };

    const totalPayable = formik.values.purchaseDetail.reduce((sum, i) => sum + Number(i.total), 0);

    return (
        <FormContainer>
            <PleaseWait show={loading} />
            <FormikProvider value={formik}>
                <form onSubmit={formik.handleSubmit}>
                    <PurchaseMaster formik={formik} masters={masters} />
                    <PurchaseDetails formik={formik} masters={masters} updateRowValues={updateRowValues} />
                    
                    <SummaryCard>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, color: '#64748b' }}>TOTAL AMOUNT</p>
                            <h2 className="value">₹ {totalPayable.toFixed(2)}</h2>
                        </div>
                        <ActionButton type="submit" style={{ padding: '16px 40px' }}>SAVE PURCHASE</ActionButton>
                    </SummaryCard>
                </form>
            </FormikProvider>
        </FormContainer>
    );
};