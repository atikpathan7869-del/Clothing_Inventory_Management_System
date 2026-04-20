import { useEffect, useState, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom"; // Redirect ke liye
import { getRequest, postRequest, deleteRequest } from "../../Services/apiService";
import { showToast, showDeleteConfirm, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";
import Swal from "sweetalert2";

/* ================= ANIMATIONS ================= */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalScale = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

/* ================= MODERN STYLES ================= */
const PageWrapper = styled.div`
  padding: 2.5rem;
  background: ${props => props.theme.body};
  min-height: 100vh;
  animation: ${fadeIn} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  @media (max-width: 768px) { flex-direction: column; align-items: flex-start; gap: 1rem; }
`;

const TitleGroup = styled.div`
  h2 { font-size: 2.2rem; font-weight: 850; color: ${props => props.theme.textMain}; margin: 0; letter-spacing: -1px; }
  p { color: ${props => props.theme.textMuted}; margin: 6px 0 0 0; font-size: 1rem; font-weight: 500; }
`;

const Card = styled.div`
  background: ${props => props.theme.card};
  border-radius: 24px;
  border: 1px solid ${props => props.theme.border};
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const SearchSection = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid ${props => props.theme.border};
  display: flex;
  gap: 1rem;
  background: ${props => props.theme.secondary}33;
  flex-wrap: wrap;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 2;
  min-width: 250px;
  i { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: ${props => props.theme.textMuted}; }
`;

const ModernInput = styled.input`
  width: 100%;
  padding: 14px 14px 14px 50px;
  background: ${props => props.theme.body};
  border: 2px solid ${props => props.theme.border};
  border-radius: 16px;
  color: ${props => props.theme.textMain};
  font-size: 0.95rem;
  transition: all 0.25s ease;
  &:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 4px #6366f122; }
`;

const FilterSelect = styled.select`
  flex: 1;
  min-width: 150px;
  padding: 14px;
  background: ${props => props.theme.body};
  border: 2px solid ${props => props.theme.border};
  border-radius: 16px;
  color: ${props => props.theme.textMain};
  cursor: pointer;
  &:focus { outline: none; border-color: #6366f1; }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th { padding: 20px 24px; text-align: left; font-size: 0.8rem; color: ${props => props.theme.textMuted}; text-transform: uppercase; background: ${props => props.theme.secondary}55; font-weight: 800; }
  td { padding: 20px 24px; border-bottom: 1px solid ${props => props.theme.border}; color: ${props => props.theme.textMain}; }
  tr:hover { background-color: ${props => props.theme.secondary}22; }
`;

const Badge = styled.span`
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  ${props => props.$type === 'brand' ? css`background: #6366f122; color: #818cf8; border: 1px solid #6366f144;` 
    : css`background: #f59e0b22; color: #fbbf24; border: 1px solid #f59e0b44;`}
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border-radius: 16px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  background: ${p => p.$primary ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : props => props.theme.card};
  color: ${p => p.$primary ? 'white' : props => props.theme.textMain};
  border: 1px solid ${p => p.$primary ? 'transparent' : props => props.theme.border};
  &:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ================= MODAL COMPONENTS ================= */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000; /* Main Modal */
  padding: 20px;
`;

const QuickModalOverlay = styled(ModalOverlay)`
  z-index: 4000; /* Quick Add sits on top of Main Modal */
  background: rgba(0, 0, 0, 0.4);
`;

const ModalContent = styled.div`
  background: ${props => props.theme.card};
  width: 100%;
  max-width: ${props => props.$small ? '420px' : '600px'};
  padding: 2.5rem;
  border-radius: 28px;
  border: 1px solid ${props => props.theme.border};
  animation: ${modalScale} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  label { display: block; font-size: 0.75rem; font-weight: 800; color: ${props => props.theme.textMuted}; margin-bottom: 8px; text-transform: uppercase; }
`;

const SelectGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const ModernSelect = styled.select`
  flex: 1;
  padding: 14px;
  background: ${props => props.theme.body};
  border: 2px solid ${props => props.theme.border};
  border-radius: 16px;
  color: ${props => props.theme.textMain};
  font-weight: 500;
  &:focus { outline: none; border-color: #6366f1; }
`;

const QuickAddBtn = styled.button`
  width: 50px;
  height: 50px;
  background: #6366f115;
  color: #6366f1;
  border: 2px dashed #6366f155;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
  &:hover { background: #6366f1; color: white; border-style: solid; transform: rotate(90deg); }
`;

/* ================= MAIN COMPONENT ================= */
export default function Product_Stockkepper() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // State for Quick Add
  const [quickAdd, setQuickAdd] = useState({ show: false, type: "", name: "" });

  // Filters State
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [form, setForm] = useState({ productName: "", brandId: "", categoryId: "", imageUrl: "" });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [p, b, c] = await Promise.all([
        getRequest("Product/GetAllProducts"),
        getRequest("Brand/GetAllBrands"),
        getRequest("Category/GetAllCategories")
      ]);
      setProducts(p.result || []);
      setBrands(b.result || []);
      setCategories(c.result || []);
    } catch {
      showError("Error", "Load Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll() }, []);

  const handleQuickSave = async () => {
    if (!quickAdd.name) return;
    setLoading(true);
    try {
      const endpoint = quickAdd.type === 'Brand' ? "Brand/SaveBrand" : "Category/SaveCategory";
      await postRequest(endpoint, { name: quickAdd.name });
      showToast("success", `${quickAdd.type} Added!`);
      setQuickAdd({ show: false, type: "", name: "" });
      await loadAll();
    } catch {
      showError("Error", "Quick add failed");
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async () => {
    if (!form.productName || !form.brandId || !form.categoryId)
      return showError("Validation", "Please fill all required fields");

    setLoading(true);
    try {
      await postRequest("Product/SaveProduct", form);
      setShowModal(false);
      setForm({ productName: "", brandId: "", categoryId: "", imageUrl: "" });
      await loadAll();

      // Redirect Option Popup
      const result = await Swal.fire({
        title: 'Product Created!',
        text: "Do you want to proceed to Purchase Entry now?",
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, go to Purchase',
        cancelButtonText: 'Stay here',
        background: '#1e293b',
        color: '#fff'
      });

      if (result.isConfirmed) {
        navigate("/purchaseList"); // Aapka purchase route
      }
    } catch {
      showError("Error", "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    const confirm = await showDeleteConfirm();
    if (!confirm.isConfirmed) return;
    try {
      await deleteRequest(`Product/DeleteProduct/${id}`);
      showToast("success", "Deleted");
      loadAll();
    } catch {
      showError("Error", "Delete failed");
    }
  };

  // Advanced Filtering Logic
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.productName?.toLowerCase().includes(search.toLowerCase());
      const matchesBrand = brandFilter === "" || p.brandId === parseInt(brandFilter);
      const matchesCat = catFilter === "" || p.categoryId === parseInt(catFilter);
      return matchesSearch && matchesBrand && matchesCat;
    });
  }, [products, search, brandFilter, catFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <PageWrapper>
      <PleaseWait show={loading} />

      <Header>
        <TitleGroup>
          <h2>Inventory Catalog</h2>
          <p>Manage your garment collection and stock sync</p>
        </TitleGroup>
        <ActionButton $primary onClick={() => setShowModal(true)}>
          <i className="fas fa-plus" /> Create Product
        </ActionButton>
      </Header>

      <Card>
        {/* Full Filter Bar */}
        <SearchSection>
          <SearchInputWrapper>
            <i className="fas fa-search" />
            <ModernInput 
              placeholder="Search products..." 
              onChange={e => { setSearch(e.target.value); setPage(1); }} 
            />
          </SearchInputWrapper>
          
          <FilterSelect onChange={e => {setBrandFilter(e.target.value); setPage(1);}}>
            <option value="">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </FilterSelect>

          <FilterSelect onChange={e => {setCatFilter(e.target.value); setPage(1);}}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </FilterSelect>
        </SearchSection>

        <div style={{ overflowX: 'auto' }}>
          <StyledTable>
            <thead>
              <tr>
                <th>Product Details</th>
                <th>Brand</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id}>
                  <td><div style={{ fontWeight: 800 }}>{p.productName}</div></td>
                  <td><Badge $type="brand"><i className="fas fa-tag" /> {p.brandName}</Badge></td>
                  <td><Badge $type="category"><i className="fas fa-tshirt" /> {p.categoryName}</Badge></td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => deleteProduct(p.id)} 
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                    >
                      <i className="fas fa-trash-alt" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    No products found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </StyledTable>
        </div>

        {/* Pagination */}
        <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Showing {paginated.length} of {filtered.length} products</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <ActionButton disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</ActionButton>
            <ActionButton disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</ActionButton>
          </div>
        </div>
      </Card>

      {/* --- MAIN CREATE MODAL --- */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 900 }}>New Garment Entry</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Fill details to add to inventory</p>

            <FormGroup>
              <label>Full Product Name</label>
              <ModernInput 
                style={{ paddingLeft: '15px' }}
                placeholder="e.g. Cotton Blue Shirt"
                value={form.productName}
                onChange={e => setForm({...form, productName: e.target.value})}
              />
            </FormGroup>

            <FormGroup>
              <label>Select Brand</label>
              <SelectGroup>
                <ModernSelect value={form.brandId} onChange={e => setForm({...form, brandId: e.target.value})}>
                  <option value="">Choose Brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </ModernSelect>
                <QuickAddBtn onClick={() => setQuickAdd({ show: true, type: "Brand", name: "" })}>+</QuickAddBtn>
              </SelectGroup>
            </FormGroup>

            <FormGroup>
              <label>Select Category</label>
              <SelectGroup>
                <ModernSelect value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                  <option value="">Choose Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </ModernSelect>
                <QuickAddBtn onClick={() => setQuickAdd({ show: true, type: "Category", name: "" })}>+</QuickAddBtn>
              </SelectGroup>
            </FormGroup>

            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '12px' }}>
              <ActionButton $primary style={{ flex: 2 }} onClick={saveProduct}>Create & Finish</ActionButton>
              <ActionButton style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</ActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* --- QUICK ADD OVERLAY (Top Layer) --- */}
      {quickAdd.show && (
        <QuickModalOverlay onClick={() => setQuickAdd({...quickAdd, show: false})}>
          <ModalContent $small onClick={e => e.stopPropagation()}>
            <h4 style={{ fontWeight: 800, marginBottom: '1rem' }}>Quick Add {quickAdd.type}</h4>
            <FormGroup>
              <ModernInput 
                autoFocus
                style={{ paddingLeft: '15px' }}
                placeholder={`Enter new ${quickAdd.type.toLowerCase()} name`}
                value={quickAdd.name}
                onChange={e => setQuickAdd({...quickAdd, name: e.target.value})}
              />
            </FormGroup>
            <div style={{ display: 'flex', gap: '10px' }}>
              <ActionButton $primary style={{ flex: 1 }} onClick={handleQuickSave}>Add</ActionButton>
              <ActionButton style={{ flex: 1 }} onClick={() => setQuickAdd({...quickAdd, show: false})}>Discard</ActionButton>
            </div>
          </ModalContent>
        </QuickModalOverlay>
      )}
    </PageWrapper>
  );
}