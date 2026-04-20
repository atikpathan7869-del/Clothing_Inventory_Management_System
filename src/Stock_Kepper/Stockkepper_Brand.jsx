import { useEffect, useState, useMemo, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useFormik } from "formik";
import * as Yup from "yup";

import { getRequest, postRequest, putRequest, deleteRequest } from "../../Services/apiService";
import { showToast, showDeleteConfirm, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= ANIMATIONS ================= */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/* ================= THEME-AWARE MODERN STYLES ================= */

const Container = styled.div`
  padding: 24px 30px;
  min-height: 100vh;
  background: ${props => props.theme.body};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.5s ease;

  header {
    margin-bottom: 24px;
    .breadcrumb { font-size: 0.75rem; color: ${props => props.theme.textMuted}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    h2 { font-size: 1.75rem; font-weight: 800; color: ${props => props.theme.textMain}; letter-spacing: -0.5px; }
  }
`;

const Card = styled.div`
  background: ${props => props.theme.card};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.border};
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: ${slideUp} 0.4s ease-out;
`;

const TableHeader = styled.div`
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.theme.card};
  border-bottom: 1px solid ${props => props.theme.border};
  flex-wrap: wrap;
  gap: 16px;
`;

const SearchWrapper = styled.div`
  position: relative;
  i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${props => props.theme.textMuted}; font-size: 0.9rem; }
`;

const SearchInput = styled.input`
  padding: 10px 16px 10px 40px;
  border-radius: 10px;
  border: 1.5px solid ${props => props.theme.border};
  font-size: 0.9rem;
  background: ${props => props.theme.body};
  color: ${props => props.theme.textMain};
  width: 280px;
  transition: all 0.2s;
  &:focus { border-color: ${props => props.theme.primary}; box-shadow: 0 0 0 3px ${props => props.theme.primary}22; outline: none; }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  
  thead th {
    background: ${props => props.theme.secondary}44;
    padding: 14px 24px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${props => props.theme.textMuted};
    border-bottom: 1px solid ${props => props.theme.border};
    text-align: left;
  }

  tbody tr {
    transition: all 0.2s;
    &:hover { background: ${props => props.theme.secondary}22; }
  }

  tbody td {
    padding: 16px 24px;
    border-bottom: 1px solid ${props => props.theme.border};
    color: ${props => props.theme.textMain};
    font-size: 0.9rem;
  }
`;

const SortableTh = styled.th`
  cursor: pointer;
  user-select: none;
  &:hover { color: ${props => props.theme.primary} !important; }
  .sort-icon { margin-left: 8px; font-size: 0.7rem; opacity: ${props => (props.$active ? 1 : 0.3)}; }
`;

const PrimaryBtn = styled.button`
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px ${props => props.theme.primary}44;
  transition: all 0.2s;
  &:hover { transform: translateY(-1px); box-shadow: 0 6px 15px ${props => props.theme.primary}66; filter: brightness(1.1); }
  &:active { transform: translateY(0); }
`;

const IDBadge = styled.span`
  background: ${props => props.theme.secondary};
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Monaco', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${props => props.theme.textMuted};
  border: 1px solid ${props => props.theme.border};
`;

const ActionWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
`;

const ThreeDotsBtn = styled.button`
  background: transparent;
  border: 1.5px solid ${props => props.theme.border};
  color: ${props => props.theme.textMuted};
  cursor: pointer;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover { background: ${props => props.theme.primary}; color: white; border-color: ${props => props.theme.primary}; }
`;

const ActionDropdown = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  z-index: 100;
  background: ${props => props.theme.card};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  min-width: 160px;
  padding: 6px;
  display: ${props => (props.$show ? 'block' : 'none')};
  animation: ${slideUp} 0.2s ease-out;
`;

const DropItem = styled.div`
  padding: 10px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.$danger ? "#ef4444" : props.theme.textMain};
  transition: all 0.2s;
  &:hover { background: ${props => props.$danger ? "#ef444411" : props.theme.secondary}; }
`;

/* ================= MODAL & FORMS ================= */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.card};
  width: 100%;
  max-width: 420px;
  padding: 32px;
  border-radius: 20px;
  border: 1px solid ${props => props.theme.border};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  h3 { font-size: 1.4rem; font-weight: 800; color: ${props => props.theme.textMain}; margin-bottom: 24px; letter-spacing: -0.5px; }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  label { display: block; font-size: 0.8rem; font-weight: 700; color: ${props => props.theme.textMuted}; margin-bottom: 8px; text-transform: uppercase; }
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.theme.body};
  border: 2px solid ${props => (props.$error ? "#ef4444" : props.theme.border)};
  border-radius: 12px;
  color: ${props => props.theme.textMain};
  font-size: 1rem;
  transition: all 0.2s;
  &:focus { outline: none; border-color: ${props => (props.$error ? "#ef4444" : props.theme.primary)}; }
`;

const PaginationFooter = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.theme.card};
  border-top: 1px solid ${props => props.theme.border};
  font-size: 0.85rem;
  color: ${props => props.theme.textMuted};
`;

const GhostBtn = styled.button`
  background: transparent;
  color: ${props => props.theme.textMain};
  border: 1px solid ${props => props.theme.border};
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:hover:not(:disabled) { background: ${props => props.theme.secondary}; border-color: ${props => props.theme.textMuted}; }
`;

/* ================= MAIN COMPONENT ================= */

export default function Brand_stockkepper() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const pageSize = 7;
  const menuRef = useRef();

  useEffect(() => {
    loadBrands();
    const closeDropdown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const res = await getRequest("Brand/GetAllBrands");
      setBrands(res.result || []);
    } catch {
      showError("Error", "Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let items = [...brands].filter(b => b.name?.toLowerCase().includes(search.toLowerCase()));
    if (sortConfig.key) {
      items.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [brands, search, sortConfig]);

  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formik = useFormik({
    initialValues: { id: null, name: "" },
    validationSchema: Yup.object({
      name: Yup.string().min(2, "Name too short").required("Brand name is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (values.id) await putRequest("Brand/UpdateBrand", values);
        else await postRequest("Brand/SaveBrand", { name: values.name });
        showToast("success", "Brand saved successfully");
        closeModal();
        loadBrands();
      } finally {
        setLoading(false);
      }
    },
  });

  const closeModal = () => { setShowModal(false); formik.resetForm(); };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "fas fa-sort";
    return sortConfig.direction === 'asc' ? "fas fa-sort-up" : "fas fa-sort-down";
  };

  return (
    <Container>
      <PleaseWait show={loading} />
      
      <header>
        <div className="breadcrumb">Inventory Management</div>
        <h2>Garment Brands</h2>
      </header>

      <Card>
        <TableHeader>
          <SearchWrapper>
            <i className="fas fa-search" />
            <SearchInput
              placeholder="Search brands by name..."
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </SearchWrapper>
          <PrimaryBtn onClick={() => setShowModal(true)}>
            <i className="fas fa-plus" /> Add New Brand
          </PrimaryBtn>
        </TableHeader>

        <div style={{ overflowX: 'auto' }}>
          <StyledTable>
            <thead>
              <tr>
                <SortableTh onClick={() => requestSort('id')} $active={sortConfig.key === 'id'} style={{ width: '150px' }}>
                  Reference <i className={`${getSortIcon('id')} sort-icon`} />
                </SortableTh>
                <SortableTh onClick={() => requestSort('name')} $active={sortConfig.key === 'name'}>
                  Brand Identity <i className={`${getSortIcon('name')} sort-icon`} />
                </SortableTh>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map(b => (
                  <tr key={b.id}>
                    <td><IDBadge>#BR-{String(b.id).padStart(3, '0')}</IDBadge></td>
                    <td style={{ fontWeight: '700', color: props => props.theme.textMain }}>{b.name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionWrapper ref={openMenuId === b.id ? menuRef : null}>
                        <ThreeDotsBtn onClick={() => setOpenMenuId(openMenuId === b.id ? null : b.id)}>
                          <i className="fas fa-ellipsis-h" />
                        </ThreeDotsBtn>
                        <ActionDropdown $show={openMenuId === b.id}>
                          <DropItem onClick={() => {
                            formik.setValues({ id: b.id, name: b.name });
                            setShowModal(true);
                            setOpenMenuId(null);
                          }}>
                            <i className="fas fa-pen-nib" style={{ color: '#3b82f6' }} /> Edit Brand
                          </DropItem>
                          <DropItem $danger onClick={async () => {
                            setOpenMenuId(null);
                            const confirm = await showDeleteConfirm();
                            if (confirm.isConfirmed) {
                              setLoading(true);
                              await deleteRequest(`Brand/DeleteBrand/${b.id}`);
                              showToast("success", "Brand Deleted");
                              loadBrands();
                            }
                          }}>
                            <i className="fas fa-trash-alt" /> Delete Brand
                          </DropItem>
                        </ActionDropdown>
                      </ActionWrapper>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '60px', color: props => props.theme.textMuted }}>
                    <i className="fas fa-box-open" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px', opacity: 0.5 }} />
                    No brands found in your inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </StyledTable>
        </div>

        <PaginationFooter>
          <div>Showing <b>{paginatedData.length}</b> out of <b>{processedData.length}</b> records</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <GhostBtn disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <i className="fas fa-arrow-left" /> Previous
            </GhostBtn>
            <GhostBtn disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>
              Next <i className="fas fa-arrow-right" />
            </GhostBtn>
          </div>
        </PaginationFooter>
      </Card>

      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3>{formik.values.id ? "Update Brand" : "Create New Brand"}</h3>
            <form onSubmit={formik.handleSubmit}>
              <FormGroup>
                <label>Brand Name</label>
                <FormInput 
                  name="name" 
                  autoFocus
                  placeholder="e.g. Levi's, Zara..."
                  value={formik.values.name} 
                  onChange={formik.handleChange} 
                  onBlur={formik.handleBlur} 
                  $error={formik.touched.name && formik.errors.name} 
                />
                {formik.touched.name && formik.errors.name && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: '600' }}>
                    <i className="fas fa-exclamation-circle" /> {formik.errors.name}
                  </div>
                )}
              </FormGroup>
              <div style={{ display: 'flex', gap: '12px' }}>
                <GhostBtn type="button" onClick={closeModal} style={{ flex: 1, justifyContent: 'center' }}>Discard</GhostBtn>
                <PrimaryBtn type="submit" style={{ flex: 2, justifyContent: 'center' }}>
                  {formik.values.id ? "Save Changes" : "Create Brand"}
                </PrimaryBtn>
              </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}