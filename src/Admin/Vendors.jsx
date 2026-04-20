import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import { useFormik } from "formik";
import * as Yup from "yup";

import { getRequest, postRequest, putRequest, deleteRequest } from "../../Services/apiService";
import { showToast, showDeleteConfirm, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";
import VendorBalanceSheet from "./VendorBalanceSheet";

/* ================= ANIMATIONS ================= */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimer = keyframes`
  0% { background-position: -468px 0 }
  100% { background-position: 468px 0 }
`;

/* ================= STYLED COMPONENTS ================= */
const Container = styled.div`
  padding: clamp(15px, 3vw, 30px);
  background: ${props => props.theme.body};
  min-height: 100vh;
  animation: ${slideUp} 0.5s ease-out;
`;

/* --- HEADER & STATS --- */
const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  gap: 20px;
  flex-wrap: wrap;

  .title-area {
    h2 { 
      font-size: 1.8rem; 
      font-weight: 900; 
      color: ${props => props.theme.textMain}; 
      margin: 0;
      letter-spacing: -0.5px;
    }
    p { color: ${props => props.theme.textMuted}; margin: 5px 0 0 0; font-size: 0.9rem; }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

/* --- ADVANCED FILTER BAR --- */
const FilterWrapper = styled.div`
  background: ${props => props.theme.card};
  border: 1px solid ${props => props.theme.border};
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 10px 30px -15px rgba(0,0,0,0.05);
  display: ${props => (props.$isOpen ? "grid" : "none")};
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  align-items: center;
`;

const SearchInputGroup = styled.div`
  position: relative;
  i {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.textMuted};
    font-size: 0.9rem;
  }
`;

const ProfessionalInput = styled.input`
  width: 100%;
  padding: 12px 15px 12px 40px;
  border-radius: 12px;
  border: 1px solid ${props => props.$error ? "#ef4444" : props.theme.border};
  background: ${props => props.theme.body};
  color: ${props => props.theme.textMain};
  font-size: 0.85rem;
  font-weight: 500;
  transition: 0.3s;
  
  &:focus {
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 4px ${props => props.theme.primary}15;
    outline: none;
  }
`;

/* --- TABLE STYLING --- */
const TableContainer = styled.div`
  background: ${props => props.theme.card};
  border-radius: 24px;
  border: 1px solid ${props => props.theme.border};
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  thead {
    background: ${props => props.theme.secondary}50;
    th {
      padding: 18px 20px;
      text-align: left;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: ${props => props.theme.textMuted};
      font-weight: 800;
    }
  }

  tbody tr {
    border-bottom: 1px solid ${props => props.theme.border}80;
    transition: 0.2s;
    &:hover { background: ${props => props.theme.primary}05; }
    &:last-child { border: none; }
  }

  td { padding: 16px 20px; vertical-align: middle; }
`;

const VendorAvatar = styled.div`
  width: 40px; height: 40px;
  border-radius: 12px;
  background: ${props => props.theme.primary}15;
  color: ${props => props.theme.primary};
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1rem;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 800;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  text-transform: uppercase;
`;

/* --- BUTTONS --- */
const IconButton = styled.button`
  width: 38px; height: 38px;
  border-radius: 10px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.$variant === 'danger' ? '#fee2e2' : props.theme.card};
  color: ${props => props.$variant === 'danger' ? '#ef4444' : (props.$variant === 'info' ? '#3b82f6' : props.theme.textMain)};
  cursor: pointer;
  transition: 0.3s;
  display: flex; align-items: center; justify-content: center;

  &:hover {
    background: ${props => props.$variant === 'danger' ? '#ef4444' : props.theme.primary};
    color: #fff;
    transform: translateY(-2px);
    border-color: transparent;
  }
`;

const MainBtn = styled.button`
  background: ${props => props.$outline ? 'transparent' : props.theme.primary};
  color: ${props => props.$outline ? props.theme.textMain : '#fff'};
  border: ${props => props.$outline ? `1px solid ${props.theme.border}` : 'none'};
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  transition: 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => !props.$outline && `0 10px 20px ${props.theme.primary}40`};
    background: ${props => props.$outline && props.theme.secondary};
  }
`;

/* --- MODAL --- */
const ModalBackdrop = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.card};
  width: 100%; max-width: 750px;
  border-radius: 30px;
  border: 1px solid ${props => props.theme.border};
  padding: 40px;
  position: relative;
  max-height: 90vh; overflow-y: auto;
`;

const FormGrid = styled.div`
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

/* ================= COMPONENT LOGIC ================= */
export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  
  const [selectedVendorData, setSelectedVendorData] = useState(null);
  const [viewingBalanceSheet, setViewingBalanceSheet] = useState(false);

  const [search, setSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [gstSearch, setGstSearch] = useState("");

  useEffect(() => { loadVendors(); }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const res = await getRequest("Vendor/GetAllVendors");
      setVendors(res.result || []);
    } catch { showError("Error", "Could not load vendor data"); }
    finally { setLoading(false); }
  };

  const handleViewBalanceSheet = async (id) => {
    setLoading(true);
    try {
      const res = await getRequest(`PaymentMaster/GetBalanceSheet/${id}`);
      if (res.status === "OK") {
        setSelectedVendorData(res);
        setViewingBalanceSheet(true);
      }
    } catch (err) {
      showError("Error", "Failed to fetch balance sheet", err);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      id: 0, name: "", contactPerson: "", address: "", gstin: "", pan: "",
      bankAccountName: "", accountNo: "", ifsc: "", accountHolderName: ""
    },
    validationSchema: Yup.object({
      name: Yup.string().min(3, "Too short").required("Company name is required"),
      contactPerson: Yup.string().required("Contact person required"),
      address: Yup.string().required("Address is required"),
      gstin: Yup.string().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN").required("Required"),
      pan: Yup.string().matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format").required("Required"),
      ifsc: Yup.string().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code")
    }),
    onSubmit: async (values) => {
      setLoading(true);
      const cleanValues = {
        ...values,
        pan: values.pan.toUpperCase(),
        gstin: values.gstin.toUpperCase(),
        ifsc: values.ifsc?.toUpperCase() || ""
      };

      try {
        if (values.id > 0) await putRequest("Vendor/UpdateVendor", cleanValues);
        else await postRequest("Vendor/SaveVendor", { ...cleanValues, id: undefined });
        
        showToast("success", "Vendor profile saved successfully");
        closeModal();
        loadVendors();
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
  });

  const closeModal = () => { setShowModal(false); formik.resetForm(); };

  const filtered = useMemo(() => {
    return vendors.filter(v => 
      (v.name || "").toLowerCase().includes(search.toLowerCase()) &&
      (v.address || "").toLowerCase().includes(citySearch.toLowerCase()) &&
      (v.gstin || "").toLowerCase().includes(gstSearch.toLowerCase())
    );
  }, [vendors, search, citySearch, gstSearch]);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (viewingBalanceSheet && selectedVendorData) {
    return (
      <Container>
        <VendorBalanceSheet 
          data={selectedVendorData} 
          onBack={() => { setViewingBalanceSheet(false); setSelectedVendorData(null); }} 
        />
      </Container>
    );
  }

  return (
    <Container>
      <PleaseWait show={loading} />

      <PageHeader>
        <div className="title-area">
          <h2>Vendor Directory</h2>
          <p>Manage your supplier network and financial liabilities</p>
        </div>
        <HeaderActions>
          <MainBtn $outline onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <i className="fas fa-sliders" /> {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </MainBtn>
          <MainBtn onClick={() => setShowModal(true)}>
            <i className="fas fa-plus-circle" /> Add New Vendor
          </MainBtn>
        </HeaderActions>
      </PageHeader>

      <FilterWrapper $isOpen={isFilterOpen}>
        <SearchInputGroup>
          <i className="fas fa-search" />
          <ProfessionalInput placeholder="Search Company..." value={search} onChange={e => setSearch(e.target.value)} />
        </SearchInputGroup>
        <SearchInputGroup>
          <i className="fas fa-location-dot" />
          <ProfessionalInput placeholder="Filter by City..." value={citySearch} onChange={e => setCitySearch(e.target.value)} />
        </SearchInputGroup>
        <SearchInputGroup>
          <i className="fas fa-fingerprint" />
          <ProfessionalInput placeholder="Search GSTIN..." value={gstSearch} onChange={e => setGstSearch(e.target.value)} />
        </SearchInputGroup>
      </FilterWrapper>

      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              <th>Vendor Identity</th>
              <th>Compliance & Tax</th>
              <th>Accounts Receivable</th>
              <th>Payout Details</th>
              <th style={{textAlign: 'right'}}>Operations</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(v => (
              <tr key={v.id}>
                <td>
                  <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <VendorAvatar>{v.name.charAt(0)}</VendorAvatar>
                    <div>
                      <div style={{fontWeight: '800', color: props => props.theme.textMain}}>{v.name}</div>
                      <div style={{fontSize: '0.75rem', color: '#64748b'}}><i className="fas fa-user-circle" /> {v.contactPerson}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge $bg="#f1f5f9" $color="#475569">{v.gstin}</Badge>
                  <div style={{fontSize: '0.7rem', marginTop:'5px', opacity: 0.6}}>PAN: {v.pan}</div>
                </td>
                <td>
                  <div style={{fontSize: '0.7rem', color: '#94a3b8'}}>Total Billed: {formatINR(v.totalBillAmount)}</div>
                  <div style={{fontSize: '0.95rem', fontWeight: '900', color: v.dues > 0 ? '#ef4444' : '#10b981'}}>
                    {formatINR(v.dues)}
                  </div>
                </td>
                <td>
                  <div style={{fontWeight: '700', fontSize:'0.85rem'}}>{v.accountNo}</div>
                  <div style={{fontSize: '0.7rem', opacity: 0.6}}>{v.bankAccountName}</div>
                </td>
                <td>
                  <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                    <IconButton $variant="info" title="Ledger/Balance Sheet" onClick={() => handleViewBalanceSheet(v.id)}>
                      <i className="fas fa-chart-line" />
                    </IconButton>
                    <IconButton title="Edit Profile" onClick={() => { formik.setValues(v); setShowModal(true); }}>
                      <i className="fas fa-pen-nib" />
                    </IconButton>
                    <IconButton $variant="danger" title="Remove Vendor" onClick={async () => {
                      if((await showDeleteConfirm()).isConfirmed) {
                        setLoading(true);
                        await deleteRequest(`Vendor/DeleteVendor/${v.id}`);
                        loadVendors();
                      }
                    }}>
                      <i className="fas fa-trash-can" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#94a3b8'}}>No vendors found matching your criteria.</td></tr>
            )}
          </tbody>
        </StyledTable>
      </TableContainer>

      {showModal && (
        <ModalBackdrop onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <ModalContent>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px'}}>
              <div>
                <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: 900}}>{formik.values.id > 0 ? "Modify Vendor Profile" : "Register New Vendor"}</h3>
                <p style={{margin: '5px 0 0 0', color: '#64748b', fontSize:'0.9rem'}}>Enter official business and banking details</p>
              </div>
              <IconButton onClick={closeModal}><i className="fas fa-times" /></IconButton>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <FormGrid>
                <div style={{gridColumn: '1 / -1'}}>
                  <label style={{fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', color:'#64748b'}}>Business Name</label>
                  <ProfessionalInput 
                    name="name" {...formik.getFieldProps('name')} 
                    placeholder="e.g. Global Textiles Pvt Ltd" 
                    $error={formik.touched.name && formik.errors.name}
                    style={{paddingLeft: '15px'}}
                  />
                  {formik.touched.name && formik.errors.name && <small style={{color:'#ef4444'}}>{formik.errors.name}</small>}
                </div>
                
                <div>
                  <label style={{fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', color:'#64748b'}}>Contact Person</label>
                  <ProfessionalInput name="contactPerson" {...formik.getFieldProps('contactPerson')} placeholder="Point of Contact" style={{paddingLeft: '15px'}} />
                </div>

                <div>
                  <label style={{fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', color:'#64748b'}}>Location/City</label>
                  <ProfessionalInput name="address" {...formik.getFieldProps('address')} placeholder="City, State" style={{paddingLeft: '15px'}} />
                </div>

                <div>
                  <label style={{fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', color:'#64748b'}}>GST Number</label>
                  <ProfessionalInput name="gstin" {...formik.getFieldProps('gstin')} placeholder="22AAAAA0000A1Z5" style={{paddingLeft: '15px'}} />
                </div>

                <div>
                  <label style={{fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', color:'#64748b'}}>PAN Card</label>
                  <ProfessionalInput name="pan" {...formik.getFieldProps('pan')} placeholder="ABCDE1234F" style={{paddingLeft: '15px'}} />
                </div>

                <div style={{gridColumn: '1 / -1', margin:'10px 0', padding:'15px', background:'#f8fafc', borderRadius:'15px', border:'1px solid #e2e8f0'}}>
                  <div style={{fontWeight:900, fontSize:'0.7rem', color:'#3b82f6', textTransform:'uppercase', marginBottom:'15px', letterSpacing:'1px'}}>
                    <i className="fas fa-bank" /> Disbursement Account Information
                  </div>
                  <FormGrid>
                    <div>
                      <label style={{fontSize:'0.7rem', fontWeight:700, color:'#64748b'}}>Account Number</label>
                      <ProfessionalInput name="accountNo" {...formik.getFieldProps('accountNo')} placeholder="00000000000" style={{paddingLeft: '15px'}} />
                    </div>
                    <div>
                      <label style={{fontSize:'0.7rem', fontWeight:700, color:'#64748b'}}>IFSC Code</label>
                      <ProfessionalInput name="ifsc" {...formik.getFieldProps('ifsc')} placeholder="SBIN0000123" style={{paddingLeft: '15px'}} />
                    </div>
                    <div>
                      <label style={{fontSize:'0.7rem', fontWeight:700, color:'#64748b'}}>Bank Name</label>
                      <ProfessionalInput name="bankAccountName" {...formik.getFieldProps('bankAccountName')} placeholder="HDFC Bank" style={{paddingLeft: '15px'}} />
                    </div>
                    <div>
                      <label style={{fontSize:'0.7rem', fontWeight:700, color:'#64748b'}}>Account Holder</label>
                      <ProfessionalInput name="accountHolderName" {...formik.getFieldProps('accountHolderName')} placeholder="Legal Name" style={{paddingLeft: '15px'}} />
                    </div>
                  </FormGrid>
                </div>
              </FormGrid>

              <div style={{marginTop: '30px', display: 'flex', gap: '15px'}}>
                <MainBtn type="submit" style={{flex: 2, justifyContent: 'center'}}>
                  {formik.values.id > 0 ? "Commit Changes" : "Confirm Registration"}
                </MainBtn>
                <MainBtn type="button" $outline onClick={closeModal} style={{flex: 1, justifyContent: 'center'}}>
                  Discard
                </MainBtn>
              </div>
            </form>
          </ModalContent>
        </ModalBackdrop>
      )}
    </Container>
  );
}