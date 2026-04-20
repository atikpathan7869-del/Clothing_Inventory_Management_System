import { useEffect, useState, useMemo } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment";

import { getRequest, postRequest, putRequest } from "../../Services/apiService";
import { showToast, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= THEME-AWARE GLOBAL STYLES ================= */
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  body { 
    font-family: 'Plus Jakarta Sans', sans-serif; 
    background-color: ${props => props.theme.body}; 
    color: ${props => props.theme.textMain};
    transition: all 0.3s ease;
  }
`;

const fadeIn = keyframes` from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } `;
const scaleUp = keyframes` from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } `;

/* ================= MODERN THEME-AWARE COMPONENTS ================= */

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  animation: ${fadeIn} 0.5s ease-out;
  @media (min-width: 768px) { padding: 40px 20px; }
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
  @media (min-width: 768px) { 
    flex-direction: row; 
    justify-content: space-between; 
    align-items: center; 
  }

  .title-group {
    h2 { font-size: 1.8rem; font-weight: 800; color: ${props => props.theme.textMain}; margin: 0; letter-spacing: -0.02em; }
    p { color: ${props => props.theme.textMuted}; margin: 4px 0 0 0; font-size: 0.95rem; }
  }
`;

const CreateButton = styled.button`
  background: ${props => props.theme.primary};
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  &:hover { filter: brightness(1.2); transform: translateY(-2px); }
`;

const ControlBar = styled.div`
  background: ${props => props.theme.card};
  padding: 10px;
  border-radius: 16px;
  border: 1px solid ${props => props.theme.border};
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  .search-wrapper {
    position: relative;
    flex: 1;
    i { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: ${props => props.theme.textMuted}; }
    input {
      width: 100%;
      padding: 12px 12px 12px 48px;
      border: none;
      font-size: 0.95rem;
      background: transparent;
      color: ${props => props.theme.textMain};
      &:focus { outline: none; }
      &::placeholder { color: ${props => props.theme.textMuted}; }
    }
  }
`;

const TableWrapper = styled.div`
  background: ${props => props.theme.card};
  border-radius: 20px;
  border: 1px solid ${props => props.theme.border};
  overflow: hidden;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  display: none;
  @media (min-width: 768px) { display: table; }

  thead {
    background: ${props => props.theme.secondary}44;
    th {
      padding: 16px 24px;
      text-align: left;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      color: ${props => props.theme.textMuted};
      border-bottom: 1px solid ${props => props.theme.border};
    }
  }

  tbody tr {
    transition: background 0.2s;
    &:hover { background: ${props => props.theme.secondary}22; }
    td { padding: 20px 24px; border-bottom: 1px solid ${props => props.theme.border}; vertical-align: middle; color: ${props => props.theme.textMain}; }
  }
`;

const SortHeader = styled.th`
  cursor: pointer;
  user-select: none;
  &:hover { color: ${props => props.theme.textMain}; }
  .sort-icon { 
    margin-left: 6px; 
    font-size: 0.7rem; 
    color: ${props => props.$active ? props.theme.primary : props.theme.textMuted}; 
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${props => props.$active ? "#10b98122" : props.theme.secondary};
  color: ${props => props.$active ? "#10b981" : props.theme.textMuted};
  border: 1px solid ${props => props.$active ? "#10b98144" : props.theme.border};
`;

const ActionButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.card};
  color: ${props => props.theme.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { 
    background: ${props => props.theme.primary}; 
    color: white; 
    border-color: ${props => props.theme.primary};
  }
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  input { opacity: 0; width: 0; height: 0; }
  span {
    position: absolute; cursor: pointer; inset: 0;
    background-color: ${props => props.theme.border};
    transition: .3s; border-radius: 34px;
    &:before {
      position: absolute; content: ""; height: 16px; width: 16px;
      left: 3px; bottom: 3px; background-color: white;
      transition: .3s; border-radius: 50%;
    }
  }
  input:checked + span { background-color: ${props => props.theme.primary}; }
  input:checked + span:before { transform: translateX(18px); }
`;

/* ================= MODAL THEME-AWARE ================= */
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px);
  display: flex; align-items: flex-end; justify-content: center; z-index: 9999;
  @media (min-width: 768px) { align-items: center; padding: 20px; }
`;

const ModalCard = styled.div`
  background: ${props => props.theme.card}; width: 100%; max-width: 480px;
  border-radius: 24px 24px 0 0; padding: 32px;
  border: 1px solid ${props => props.theme.border};
  animation: ${scaleUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  @media (min-width: 768px) { border-radius: 24px; }
  h3 { font-size: 1.4rem; font-weight: 800; color: ${props => props.theme.textMain}; margin: 0 0 24px 0; }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  label { display: block; font-size: 0.8rem; font-weight: 700; color: ${props => props.theme.textMuted}; margin-bottom: 8px; text-transform: uppercase; }
  input {
    width: 100%; padding: 12px 16px; border-radius: 12px;
    background: ${props => props.theme.body};
    color: ${props => props.theme.textMain};
    border: 1.5px solid ${props => props.$error ? "#ef4444" : props.theme.border};
    &:focus { outline: none; border-color: ${props => props.theme.primary}; }
  }
`;

const MobileCard = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${props => props.theme.border};
  @media (min-width: 768px) { display: none; }
  .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .card-title { font-weight: 800; font-size: 1.1rem; color: ${props => props.theme.textMain}; }
  .card-dates { color: ${props => props.theme.textMuted}; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; }
`;

/* ================= COMPONENT LOGIC ================= */

export default function FinancialYear() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getRequest("Financial_Year/GetAllFinancialYears");
      setData(res?.result || []);
    } catch { showError("Error", "Network error occurred"); }
    finally { setLoading(false); }
  };

  const handleToggleActive = async (item) => {
    if (item.isActive) {
       showToast("info", "At least one period must be active.");
       return;
    }
    try {
      setLoading(true);
      const updatedItem = { ...item, isActive: true };
      await putRequest(`Financial_Year/UpdateFinancialYear/${item.id}`, updatedItem);
      setData(prev => prev.map(f => ({ ...f, isActive: f.id === item.id ? true : false })));
      showToast("success", `${item.name} activated successfully`);
    } catch { 
      showError("Error", "Failed to switch active period"); 
    } finally { setLoading(false); }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let filtered = data.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchTerm, sortConfig]);

  const formik = useFormik({
    initialValues: { id: 0, name: "", startDate: "", endDate: "", isActive: false },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      startDate: Yup.date().required("Required"),
      endDate: Yup.date().required("Required")
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (values.id > 0) {
          await putRequest(`Financial_Year/UpdateFinancialYear/${values.id}`, values);
        } else {
          await postRequest("Financial_Year/AddFinancialYear", values);
        }
        setShowModal(false);
        loadData();
        showToast("success", "Changes saved successfully");
      } catch { showError("Error", "Save failed"); }
      finally { setLoading(false); }
    }
  });

  return (
    <Container>
      <GlobalStyle />
      <PleaseWait show={loading} />

      <HeaderSection>
        <div className="title-group">
          <h2>Financial Years</h2>
          <p>Manage and set accounting periods</p>
        </div>
        <CreateButton onClick={() => { formik.resetForm(); setShowModal(true); }}>
          <i className="fas fa-plus"></i> New Period
        </CreateButton>
      </HeaderSection>

      <ControlBar>
        <div className="search-wrapper">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search years..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </ControlBar>

      <TableWrapper>
        <StyledTable>
          <thead>
            <tr>
              <SortHeader onClick={() => requestSort('name')} $active={sortConfig.key === 'name'}>
                Year Label <i className="fas fa-sort sort-icon"></i>
              </SortHeader>
              <th>Period</th>
              <th>Status</th>
              <th style={{textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map(item => (
              <tr key={item.id}>
                <td><div style={{fontWeight: '800'}}>{item.name}</div></td>
                <td>
                  <div style={{fontSize: '0.85rem', fontWeight: 500}}>
                    {moment(item.startDate).format("MMM DD, YY")} — {moment(item.endDate).format("MMM DD, YY")}
                  </div>
                </td>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <Switch>
                      <input type="checkbox" checked={item.isActive} onChange={() => handleToggleActive(item)} />
                      <span />
                    </Switch>
                    <StatusBadge $active={item.isActive}>
                      {item.isActive ? "ACTIVE" : "INACTIVE"}
                    </StatusBadge>
                  </div>
                </td>
                <td style={{textAlign: 'right'}}>
                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    <ActionButton onClick={() => { 
                      formik.setValues({...item, startDate: moment(item.startDate).format("YYYY-MM-DD"), endDate: moment(item.endDate).format("YYYY-MM-DD")}); 
                      setShowModal(true); 
                    }}><i className="fas fa-pen" /></ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>

        {/* MOBILE VIEW */}
        <div style={{display: 'flex', flexDirection: 'column'}}>
          {processedData.map(item => (
            <MobileCard key={item.id}>
              <div className="card-top">
                <div className="card-title">{item.name}</div>
                <ActionButton onClick={() => { 
                  formik.setValues({...item, startDate: moment(item.startDate).format("YYYY-MM-DD"), endDate: moment(item.endDate).format("YYYY-MM-DD")}); 
                  setShowModal(true); 
                }}><i className="fas fa-pen" /></ActionButton>
              </div>
              <div className="card-dates">
                <i className="far fa-calendar"></i>
                {moment(item.startDate).format("DD MMM YY")} - {moment(item.endDate).format("DD MMM YY")}
              </div>
              <div style={{marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <StatusBadge $active={item.isActive}>{item.isActive ? "ACTIVE" : "INACTIVE"}</StatusBadge>
                <Switch>
                  <input type="checkbox" checked={item.isActive} onChange={() => handleToggleActive(item)} />
                  <span />
                </Switch>
              </div>
            </MobileCard>
          ))}
        </div>
      </TableWrapper>

      {showModal && (
        <Overlay onClick={() => setShowModal(false)}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <h3>{formik.values.id > 0 ? "Edit Year" : "Create Year"}</h3>
            <form onSubmit={formik.handleSubmit}>
              <FormGroup $error={formik.touched.name && formik.errors.name}>
                <label>Year Label</label>
                <input name="name" {...formik.getFieldProps('name')} placeholder="e.g. 2024-25" />
              </FormGroup>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <FormGroup><label>Start</label><input type="date" name="startDate" {...formik.getFieldProps('startDate')} /></FormGroup>
                <FormGroup><label>End</label><input type="date" name="endDate" {...formik.getFieldProps('endDate')} /></FormGroup>
              </div>

              <div style={{ background: props => props.theme.secondary + "44", padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{fontWeight: '700', fontSize: '0.85rem'}}>System Active?</span>
                <Switch>
                  <input type="checkbox" name="isActive" checked={formik.values.isActive} onChange={e => formik.setFieldValue('isActive', e.target.checked)} />
                  <span />
                </Switch>
              </div>

              <div style={{display: 'flex', gap: '12px'}}>
                <CreateButton type="submit" style={{ flex: 1, justifyContent: 'center' }}>Save</CreateButton>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'transparent', border: `1px solid ${props => props.theme.border}`, color: props => props.theme.textMuted, borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </ModalCard>
        </Overlay>
      )}
    </Container>
  );
}