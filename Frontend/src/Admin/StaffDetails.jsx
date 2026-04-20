import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { FiUserPlus, FiSearch, FiEdit3, FiTrash2, FiMail, FiPhone, FiCalendar, FiX } from "react-icons/fi";
import { getRequest, postRequest, putRequest, deleteRequest } from "../../Services/apiService";
import { showToast, showError, showConfirm } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= ANIMATIONS ================= */
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideRight = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

/* ================= STYLED COMPONENTS ================= */
const PageContainer = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', sans-serif;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  
  .title-group {
    h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
    p { color: #64748b; margin-top: 5px; font-size: 1rem; }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const GlassCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1.2rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.accent || '#6366f1'};
  }

  .icon-box {
    width: 56px; height: 56px;
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    background: ${props => props.bg || '#eef2ff'};
    color: ${props => props.accent || '#6366f1'};
    font-size: 1.5rem;
  }
`;

const MainTableWrapper = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  animation: ${slideIn} 0.5s ease-out;
`;

const ToolBar = styled.div`
  padding: 1.5rem 2rem;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchWrapper = styled.div`
  position: relative;
  svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
  input {
    padding: 12px 12px 12px 45px;
    width: 350px;
    border-radius: 14px;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    transition: 0.3s;
    &:focus { outline: none; border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    padding: 18px 24px;
    background: #f8fafc;
    text-align: left;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #64748b;
    font-weight: 700;
  }

  td {
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  tr:hover { background-color: #fcfdfe; }
`;

const UserAvatar = styled.div`
  width: 42px; height: 42px;
  border-radius: 12px;
  background: ${props => props.color || '#6366f1'};
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
`;

const Badge = styled.span`
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${props => props.type === 'Admin' ? '#eef2ff' : props.type === 'Stockkeeper' ? '#f0fdf4' : '#fff7ed'};
  color: ${props => props.type === 'Admin' ? '#4f46e5' : props.type === 'Stockkeeper' ? '#16a34a' : '#ea580c'};
`;

const ActionBtn = styled.button`
  width: 38px; height: 38px;
  border-radius: 10px;
  border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  background: ${props => props.variant === 'danger' ? '#fff1f2' : '#f1f5f9'};
  color: ${props => props.variant === 'danger' ? '#e11d48' : '#475569'};
  &:hover { 
    background: ${props => props.variant === 'danger' ? '#e11d48' : '#0f172a'};
    color: white;
    transform: scale(1.1);
  }
`;

const SideModal = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
`;

const SideModalContent = styled.div`
  width: 100%;
  max-width: 480px;
  background: white;
  height: 100%;
  padding: 3rem;
  box-shadow: -10px 0 30px rgba(0,0,0,0.1);
  animation: ${slideRight} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
`;

const PrimaryButton = styled.button`
  background: #0f172a;
  color: white;
  padding: 12px 24px;
  border-radius: 14px;
  border: none;
  font-weight: 700;
  display: flex; align-items: center; gap: 10px;
  cursor: pointer;
  transition: 0.3s;
  &:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
`;

/* ================= COMPONENT ================= */
export default function StaffMaster() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setLoading(true);
    const res = await getRequest("StaffMaster/GetAllStaff");
    if (res.status === "OK") setStaffList(res.result);
    setLoading(false);
  };

  const formik = useFormik({
    initialValues: {
      name: "", email: "", contactNo: "", role: "Sales", 
      gender: "Male", doj: moment().format("YYYY-MM-DD"),
      username: "", password: ""
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Full name is required"),
      email: Yup.string().email("Invalid email").required("Required"),
      username: Yup.string().required("Username required"),
      password: Yup.string().min(6, "Min 6 chars").required("Required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      const endpoint = editingId ? "StaffMaster/UpdateStaff" : "StaffMaster/AddStaff";
      const method = editingId ? putRequest : postRequest;
      const res = await method(endpoint, editingId ? { ...values, id: editingId } : values);
      
      if (res.status === "OK") {
        showToast("success", editingId ? "Profile Updated" : "Staff Account Created");
        setShowModal(false);
        fetchStaff();
      } else {
        showError("Operation Failed", res.message);
      }
      setLoading(false);
    }
  });

  const handleEdit = (staff) => {
    setEditingId(staff.id);
    formik.setValues({
      name: staff.name, email: staff.email, contactNo: staff.contactNo,
      role: staff.role, gender: staff.gender,
      doj: moment(staff.doj).format("YYYY-MM-DD"),
      username: staff.username || "", password: staff.password || ""
    });
    setShowModal(true);
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
      <PleaseWait show={loading} />
      
      <HeaderSection>
        <div className="title-group">
          <h1>Staff Management</h1>
          <p>Global Collection Team Directory & Access Control</p>
        </div>
        <PrimaryButton onClick={() => { setEditingId(null); formik.resetForm(); setShowModal(true); }}>
          <FiUserPlus size={20} /> Add Team Member
        </PrimaryButton>
      </HeaderSection>

      <StatsGrid>
        <GlassCard accent="#6366f1" bg="#eef2ff">
          <div className="icon-box"><FiUserPlus /></div>
          <div>
            <h4 style={{margin:0, color:'#64748b', fontSize:'0.8rem'}}>TOTAL MEMBERS</h4>
            <h2 style={{margin:0, fontSize:'1.8rem'}}>{staffList.length}</h2>
          </div>
        </GlassCard>
        
        <GlassCard accent="#10b981" bg="#f0fdf4">
          <div className="icon-box"><FiEdit3 /></div>
          <div>
            <h4 style={{margin:0, color:'#64748b', fontSize:'0.8rem'}}>ADMINISTRATORS</h4>
            <h2 style={{margin:0, fontSize:'1.8rem'}}>{staffList.filter(s => s.role === 'Admin').length}</h2>
          </div>
        </GlassCard>

        <GlassCard accent="#f59e0b" bg="#fff7ed">
          <div className="icon-box"><FiCalendar /></div>
          <div>
            <h4 style={{margin:0, color:'#64748b', fontSize:'0.8rem'}}>NEW THIS MONTH</h4>
            <h2 style={{margin:0, fontSize:'1.8rem'}}>{staffList.filter(s => moment(s.doj).isSame(moment(), 'month')).length}</h2>
          </div>
        </GlassCard>
      </StatsGrid>

      <MainTableWrapper>
        <ToolBar>
          <SearchWrapper>
            <FiSearch />
            <input 
              placeholder="Search by name, role or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          <div style={{color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600}}>
            ACTIVE ACCOUNTS: {filteredStaff.length}
          </div>
        </ToolBar>

        <StyledTable>
          <thead>
            <tr>
              <th>Personal Info</th>
              <th>Contact Details</th>
              <th>Role & Access</th>
              <th>Join Date</th>
              <th style={{textAlign: 'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(staff => (
              <tr key={staff.id}>
                <td>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <UserAvatar color={staff.role === 'Admin' ? '#4f46e5' : '#0ea5e9'}>
                      {staff.name.charAt(0)}
                    </UserAvatar>
                    <div>
                      <div style={{fontWeight: 800, color: '#0f172a'}}>{staff.name}</div>
                      <div style={{fontSize: '0.75rem', color: '#94a3b8'}}>UID: RI-{staff.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                    <div style={{fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'6px'}}>
                      <FiMail size={12} color="#6366f1"/> {staff.email}
                    </div>
                    <div style={{fontSize:'0.85rem', color:'#64748b', display:'flex', alignItems:'center', gap:'6px'}}>
                      <FiPhone size={12}/> {staff.contactNo}
                    </div>
                  </div>
                </td>
                <td><Badge type={staff.role}>{staff.role}</Badge></td>
                <td>
                  <div style={{fontWeight: 600, fontSize:'0.9rem'}}>{moment(staff.doj).format("MMM DD, YYYY")}</div>
                </td>
                <td>
                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    <ActionBtn title="Edit" onClick={() => handleEdit(staff)}><FiEdit3 size={16}/></ActionBtn>
                    <ActionBtn variant="danger" title="Delete" onClick={() => handleDelete(staff.id)}><FiTrash2 size={16}/></ActionBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </MainTableWrapper>

      {showModal && (
        <SideModal onClick={() => setShowModal(false)}>
          <SideModalContent onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'2.5rem'}}>
               <div>
                  <h2 style={{margin:0, fontSize:'1.5rem'}}>{editingId ? 'Update Member' : 'Add New Member'}</h2>
                  <p style={{color:'#64748b', fontSize:'0.9rem', margin:'5px 0 0 0'}}>Configure staff permissions and info</p>
               </div>
               <ActionBtn onClick={() => setShowModal(false)}><FiX size={20}/></ActionBtn>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
                <div className="field">
                  <label style={{display:'block', marginBottom:'8px', fontWeight:700, fontSize:'0.85rem'}}>Full Legal Name</label>
                  <input style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1.5px solid #e2e8f0'}} 
                         name="name" {...formik.getFieldProps('name')} />
                </div>

                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                  <div className="field">
                    <label style={{display:'block', marginBottom:'8px', fontWeight:700, fontSize:'0.85rem'}}>Work Role</label>
                    <select style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1.5px solid #e2e8f0'}} 
                            name="role" {...formik.getFieldProps('role')}>
                      <option value="Admin">System Admin</option>
                      <option value="Stockkeeper">Stockkeeper</option>
                      <option value="Sales">Sales Personnel</option>
                    </select>
                  </div>
                  <div className="field">
                    <label style={{display:'block', marginBottom:'8px', fontWeight:700, fontSize:'0.85rem'}}>Gender</label>
                    <select style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1.5px solid #e2e8f0'}} 
                            name="gender" {...formik.getFieldProps('gender')}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label style={{display:'block', marginBottom:'8px', fontWeight:700, fontSize:'0.85rem'}}>Email Address</label>
                  <input style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1.5px solid #e2e8f0'}} 
                         name="email" {...formik.getFieldProps('email')} />
                </div>

                <div className="field">
                  <label style={{display:'block', marginBottom:'8px', fontWeight:700, fontSize:'0.85rem'}}>Official Username</label>
                  <input style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1.5px solid #e2e8f0', background:'#f8fafc'}} 
                         name="username" {...formik.getFieldProps('username')} />
                </div>

                <div className="field">
                  <label style={{display:'block', marginBottom:'8px', fontWeight:700, fontSize:'0.85rem'}}>Security Password</label>
                  <input style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1.5px solid #e2e8f0'}} 
                         name="password" type="password" {...formik.getFieldProps('password')} />
                </div>

                <div className="field">
                  <label style={{display:'block', marginBottom:'8px', fontWeight:700, fontSize:'0.85rem'}}>Joining Date</label>
                  <input style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1.5px solid #e2e8f0'}} 
                         name="doj" type="date" {...formik.getFieldProps('doj')} />
                </div>

                <PrimaryButton type="submit" style={{width:'100%', padding:'16px', justifyContent:'center', marginTop:'1rem'}}>
                  {editingId ? 'Save Changes' : 'Create Staff Account'}
                </PrimaryButton>
              </div>
            </form>
          </SideModalContent>
        </SideModal>
      )}
    </PageContainer>
  );
}