import { useEffect, useState, useMemo, useRef } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

import { getRequest, postRequest, putRequest, deleteRequest } from "../../Services/apiService";
import { showToast, showDeleteConfirm, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= GLOBAL & ANIMATIONS ================= */
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  body { font-family: 'Plus Jakarta Sans', sans-serif; }
`;

/* ================= MODERN STYLED COMPONENTS ================= */

const Container = styled.div`
  padding: 24px;
  min-height: 100vh;
  background-color: ${props => props.theme.body};
  transition: background-color 0.3s ease;
  @media (max-width: 768px) { padding: 15px; }
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
`;

const TitleGroup = styled.div`
  h2 { font-size: 1.5rem; font-weight: 800; color: ${props => props.theme.textMain}; margin: 0; letter-spacing: -0.5px; }
  p { font-size: 0.85rem; color: ${props => props.theme.textMuted}; margin: 4px 0 0 0; }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SearchBox = styled.div`
  position: relative;
  i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.9rem; }
  input {
    padding: 10px 14px 10px 40px;
    border-radius: 10px;
    border: 1px solid ${props => props.theme.border};
    background: ${props => props.theme.card};
    color: ${props => props.theme.textMain};
    width: 240px;
    font-size: 0.85rem;
    transition: all 0.2s;
    &:focus { outline: none; border-color: ${props => props.theme.primary}; box-shadow: 0 0 0 3px ${props => props.theme.primary}22; width: 280px; }
    @media (max-width: 500px) { width: 100%; &:focus { width: 100%; } }
  }
`;

const MainCard = styled(motion.div)`
  background: ${props => props.theme.card};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.border};
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th {
    padding: 16px 20px;
    background: ${props => props.theme.secondary}44;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: ${props => props.theme.textMuted};
    letter-spacing: 0.5px;
    cursor: pointer;
    &:hover { color: ${props => props.theme.primary}; }
  }
  td {
    padding: 14px 20px;
    border-bottom: 1px solid ${props => props.theme.border};
    font-size: 0.9rem;
    color: ${props => props.theme.textMain};
  }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr { transition: background 0.2s; &:hover { background: ${props => props.theme.secondary}22; } }
`;

const ActionButton = styled.button`
  background: ${props => props.$primary ? props.theme.primary : "transparent"};
  color: ${props => props.$primary ? "white" : props.theme.textMain};
  border: ${props => props.$primary ? "none" : `1px solid ${props.theme.border}`};
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  &:hover { transform: translateY(-1px); filter: brightness(1.1); box-shadow: 0 4px 12px ${props => props.$primary ? props.theme.primary + "44" : "rgba(0,0,0,0.05)"}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 100;
  background: ${props => props.theme.card};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  padding: 6px;
  overflow: hidden;
`;

const DropItem = styled.div`
  padding: 10px 12px;
  font-size: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${p => (p.$danger ? "#ef4444" : props => props.theme.textMain)};
  transition: background 0.2s;
  &:hover { background: ${p => p.$danger ? "#fef2f2" : props => props.theme.secondary}; }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px); display: flex;
  align-items: center; justify-content: center; z-index: 2000;
`;

const ModalBox = styled(motion.div)`
  background: ${props => props.theme.card};
  width: 95%; max-width: 420px; padding: 28px;
  border-radius: 20px; border: 1px solid ${props => props.theme.border};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const PaginationWrapper = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.theme.secondary}11;
  border-top: 1px solid ${props => props.theme.border};
`;

/* ================= COMPONENT LOGIC ================= */

export default function Categories_stockkepper() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const menuRef = useRef();
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  useEffect(() => { loadCategories(); }, []);

  useEffect(() => {
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await getRequest("Category/GetAllCategories");
      setCategories(res.result || []);
    } catch { showError("Error", "Load Failed"); }
    finally { setLoading(false); }
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setName(cat.name);
      setEditId(cat.id);
    } else {
      setName("");
      setEditId(null);
    }
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleSave = async () => {
    if (!name.trim()) return showError("Validation", "Enter Category Name");
    try {
      setLoading(true);
      if (editId) {
        await putRequest("Category/UpdateCategory", { id: editId, name });
        showToast("success", "Category Updated");
      } else {
        await postRequest("Category/SaveCategory", { name });
        showToast("success", "Category Added");
      }
      setShowModal(false);
      setName(""); setEditId(null);
      await loadCategories();
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    setOpenMenuId(null);
    const confirm = await showDeleteConfirm();
    if (!confirm.isConfirmed) return;
    try {
      setLoading(true);
      await deleteRequest(`Category/DeleteCategory/${id}`);
      showToast("success", "Category Removed");
      loadCategories();
    } catch { showError("Error", "Delete Failed"); }
    finally { setLoading(false); }
  };

  const processedData = useMemo(() => {
    let items = [...categories].filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
    if (sortConfig.key) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [categories, search, sortConfig]);

  const currentRecords = processedData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
  const totalPages = Math.ceil(processedData.length / recordsPerPage);

  return (
    <Container>
      <GlobalStyle />
      <PleaseWait show={loading} />
      
      <TopSection>
        <TitleGroup>
          <h2>Categories</h2>
          <p>Organize your products into clean classifications</p>
        </TitleGroup>
        
        <ActionGroup>
          <SearchBox>
            <i className="fas fa-search" />
            <input 
              placeholder="Quick search..." 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
            />
          </SearchBox>
          <ActionButton $primary onClick={() => handleOpenModal()}>
            <i className="fas fa-plus" /> Create New
          </ActionButton>
        </ActionGroup>
      </TopSection>

      <MainCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ overflowX: 'auto' }}>
          <StyledTable>
            <thead>
              <tr>
                <th onClick={() => setSortConfig({ key: 'id', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                  Reference <i className={`fas fa-sort${sortConfig.key === 'id' ? `-${sortConfig.direction === 'asc' ? 'up' : 'down'}` : ''}`} style={{ marginLeft: '8px', opacity: sortConfig.key === 'id' ? 1 : 0.3 }} />
                </th>
                <th onClick={() => setSortConfig({ key: 'name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                  Category Name <i className={`fas fa-sort${sortConfig.key === 'name' ? `-${sortConfig.direction === 'asc' ? 'up' : 'down'}` : ''}`} style={{ marginLeft: '8px', opacity: sortConfig.key === 'name' ? 1 : 0.3 }} />
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {currentRecords.map((cat, idx) => (
                  <motion.tr 
                    key={cat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td>
                      <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem' }}>#CAT-{cat.id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: props => props.theme.primary }} />
                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }} ref={openMenuId === cat.id ? menuRef : null}>
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}
                        >
                          <i className="fas fa-ellipsis-h" />
                        </button>
                        
                        <AnimatePresence>
                          {openMenuId === cat.id && (
                            <DropdownMenu
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            >
                              <DropItem onClick={() => handleOpenModal(cat)}>
                                <i className="fas fa-edit" style={{ color: '#3b82f6' }} /> Edit Details
                              </DropItem>
                              <DropItem $danger onClick={() => handleDelete(cat.id)}>
                                <i className="fas fa-trash-alt" /> Delete Category
                              </DropItem>
                            </DropdownMenu>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {currentRecords.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <i className="fas fa-box-open" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }} />
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </StyledTable>
        </div>
        
        <PaginationWrapper>
          <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
            Showing <b>{currentRecords.length}</b> of <b>{processedData.length}</b> results
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ActionButton disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <i className="fas fa-chevron-left" />
            </ActionButton>
            <ActionButton disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>
              <i className="fas fa-chevron-right" />
            </ActionButton>
          </div>
        </PaginationWrapper>
      </MainCard>

      <AnimatePresence>
        {showModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <ModalBox
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontWeight: 800 }}>{editId ? "Update Category" : "New Category"}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}>Classification Name</label>
                <input 
                  autoFocus
                  style={{ 
                    width: '100%', padding: '12px 16px', borderRadius: '12px', 
                    border: `1.5px solid ${props => props.theme.border}`,
                    background: props => props.theme.body, color: props => props.theme.textMain,
                    fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                  }}
                  placeholder="e.g. Menswear, Gadgets..." 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <ActionButton style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</ActionButton>
                <ActionButton $primary style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave}>
                  {editId ? "Save Changes" : "Create Category"}
                </ActionButton>
              </div>
            </ModalBox>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
}