import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import { getRequest, deleteRequest } from "../../Services/apiService";
import { showToast, showDeleteConfirm, showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= MODERN STYLES ================= */

const PageContainer = styled.div`
  padding: 30px;
  background: #f1f5f9;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 20px;

  h2 {
    margin: 0;
    font-weight: 700;
    color: #1e293b;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  border-left: 5px solid ${props => props.$color || "#3b82f6"};
  
  .label { font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 600; }
  .value { font-size: 22px; font-weight: 700; color: #1e293b; margin-top: 5px; }
`;

const FilterCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  
  label { font-size: 12px; font-weight: 600; color: #475569; }
`;

const SearchBox = styled.input`
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  width: 250px;
  outline: none;
  transition: all 0.2s;
  &:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
`;

const DateInput = styled.input`
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  outline: none;
  &:focus { border-color: #3b82f6; }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  thead {
    background: #f8fafc;
    border-bottom: 2px solid #e2e8f0;
  }

  th {
    padding: 16px;
    text-align: left;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    cursor: pointer;
    &:hover { color: #3b82f6; }
  }

  tbody tr {
    transition: background 0.2s;
    &:hover { background: #f8fafc; }
  }

  td {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
    color: #334155;
    vertical-align: middle;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${p => p.$bg}15;
  color: ${p => p.$bg};
  border: 1px solid ${p => p.$bg}30;
`;

const ActionBtn = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  transition: all 0.2s;
  background: ${p => p.$bg}15; 
  color: ${p => p.$color}; 
  font-size: 1rem;

  &:hover {
    background: ${p => p.$bg};
    color: white;
    transform: translateY(-2px);
  }
`;

const PrimaryBtn = styled.button`
  padding: 12px 20px;
  background: ${p => p.$bg || "#3b82f6"};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    box-shadow: 0 4px 12px ${p => p.$bg}40;
  }
`;

const SecondaryBtn = styled(PrimaryBtn)`
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  &:hover {
    background: #f8fafc;
    color: #1e293b;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
`;

/* ================= COMPONENT ================= */

export default function PurchaseListPage() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'billDate', direction: 'desc' });

    const navigate = useNavigate();

    useEffect(() => {
        loadPurchases();
    }, []);

    const loadPurchases = async () => {
        try {
            setLoading(true);
            const res = await getRequest("Purchase/GetAllPurchases");
            setPurchases(res.result || []);
        } catch {
            showError("Error", "Purchase load failed");
        } finally {
            setLoading(false);
        }
    };

    const deletePurchase = async (id) => {
        const confirm = await showDeleteConfirm();
        if (!confirm.isConfirmed) return;
        await deleteRequest(`Purchase/DeletePurchase/${id}`);
        showToast("success", "Purchase Deleted");
        loadPurchases();
    };

    const getStatus = (due, net) => {
        if (due <= 0) return { label: "Fully Paid", color: "#10b981" };
        if (due >= net) return { label: "Unpaid", color: "#ef4444" };
        return { label: "Partial", color: "#f59e0b" };
    };

    // New Function: Export to CSV
    const exportData = () => {
        const headers = ["Bill No,Vendor,Date,Status,Total,Paid,Due\n"];
        const rows = filtered.map(p => {
            const status = getStatus(p.dues, p.netAmount).label;
            return `${p.billNo},${p.vendor?.name},${moment(p.billDate).format("YYYY-MM-DD")},${status},${p.netAmount},${p.payments},${p.dues}`;
        }).join("\n");
        
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `Purchase_Report_${moment().format('DD_MM_YY')}.csv`);
        a.click();
    };

    // Sorting Logic
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filtered = useMemo(() => {
        let items = purchases.filter(p => {
            const matchesSearch =
                (p.billNo || "").toLowerCase().includes(search.toLowerCase()) ||
                (p.vendor?.name || "").toLowerCase().includes(search.toLowerCase());

            const purchaseDate = moment(p.billDate);
            const matchesStart = startDate ? purchaseDate.isSameOrAfter(startDate, 'day') : true;
            const matchesEnd = endDate ? purchaseDate.isSameOrBefore(endDate, 'day') : true;

            return matchesSearch && matchesStart && matchesEnd;
        });

        if (sortConfig.key) {
            items.sort((a, b) => {
                const valA = sortConfig.key === 'vendor' ? a.vendor?.name : a[sortConfig.key];
                const valB = sortConfig.key === 'vendor' ? b.vendor?.name : b[sortConfig.key];
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [purchases, search, startDate, endDate, sortConfig]);

    const totalAmount = filtered.reduce((acc, curr) => acc + (curr.netAmount || 0), 0);
    const totalPaid = filtered.reduce((acc, curr) => acc + (curr.payments || 0), 0);
    const totalDues = filtered.reduce((acc, curr) => acc + (curr.dues || 0), 0);

    return (
        <PageContainer>
            <PleaseWait show={loading} />

            <HeaderSection>
                <div>
                    <h2>Purchase Management</h2>
                    <p className="text-muted small mb-0">Track and manage your inventory acquisitions</p>
                </div>
                <ButtonGroup>
                    <SecondaryBtn onClick={() => navigate("/admin/Vendors")}>
                        <i className="bi bi-people-fill"></i> Vendors
                    </SecondaryBtn>
                    <SecondaryBtn onClick={exportData} $bg="#f8fafc">
                        <i className="bi bi-download"></i> Export
                    </SecondaryBtn>
                    <PrimaryBtn $bg="#10b981" onClick={() => navigate("/admin/Purchase")}>
                        <i className="bi bi-plus-lg"></i> New Purchase
                    </PrimaryBtn>
                </ButtonGroup>
            </HeaderSection>

            <StatsGrid>
                <StatCard $color="#3b82f6">
                    <div className="label">Total Net Amount</div>
                    <div className="value">₹ {totalAmount.toLocaleString('en-IN')}</div>
                </StatCard>
                <StatCard $color="#10b981">
                    <div className="label">Total Paid</div>
                    <div className="value">₹ {totalPaid.toLocaleString('en-IN')}</div>
                </StatCard>
                <StatCard $color="#ef4444">
                    <div className="label">Total Dues</div>
                    <div className="value">₹ {totalDues.toLocaleString('en-IN')}</div>
                </StatCard>
                <StatCard $color="#6366f1">
                    <div className="label">Orders Count</div>
                    <div className="value">{filtered.length}</div>
                </StatCard>
            </StatsGrid>

            <FilterCard>
                <InputGroup>
                    <label>Quick Search</label>
                    <SearchBox
                        placeholder="Bill No or Vendor Name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </InputGroup>
                <InputGroup>
                    <label>From Date</label>
                    <DateInput
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </InputGroup>
                <InputGroup>
                    <label>To Date</label>
                    <DateInput
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </InputGroup>
                <PrimaryBtn
                    $bg="#64748b"
                    style={{ marginTop: '22px', padding: '10px 15px', fontSize: '13px' }}
                    onClick={() => { setSearch(""); setStartDate(""); setEndDate(""); }}
                >
                    <i className="bi bi-arrow-counterclockwise"></i> Reset
                </PrimaryBtn>
            </FilterCard>

            <TableCard>
                <StyledTable>
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('billNo')}>Bill No <i className="bi bi-arrow-down-up small"></i></th>
                            <th onClick={() => requestSort('vendor')}>Vendor <i className="bi bi-arrow-down-up small"></i></th>
                            <th onClick={() => requestSort('billDate')}>Billing Date <i className="bi bi-arrow-down-up small"></i></th>
                            <th>Status</th>
                            <th onClick={() => requestSort('netAmount')}>Total Amount</th>
                            <th>Paid</th>
                            <th>Balance Due</th>
                            <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(p => {
                            const status = getStatus(p.dues, p.netAmount);
                            return (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: "700", color: "#3b82f6" }}>#{p.billNo}</td>
                                    <td>
                                        <div style={{ fontWeight: "600" }}>{p.vendor?.name}</div>
                                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>ID: {p.vendor?.id || 'N/A'}</div>
                                    </td>
                                    <td>{moment(p.billDate).format("MMM DD, YYYY")}</td>
                                    <td>
                                        <StatusBadge $bg={status.color}>{status.label}</StatusBadge>
                                    </td>
                                    <td style={{ fontWeight: "600" }}>₹ {p.netAmount?.toLocaleString('en-IN')}</td>
                                    <td style={{ color: "#10b981", fontWeight: "600" }}>₹ {p.payments?.toLocaleString('en-IN')}</td>
                                    <td style={{ color: "#ef4444", fontWeight: "600" }}>₹ {p.dues?.toLocaleString('en-IN')}</td>
                                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                                        <ActionBtn
                                            $bg="#6366f1"
                                            $color="#6366f1"
                                            title="View Details"
                                            onClick={() => navigate(`/admin/PurchaseDetails_ind/${p.id}`)}
                                        >
                                            <i className="bi bi-eye-fill"></i>
                                        </ActionBtn>
                                        <ActionBtn
                                            $bg="#f59e0b"
                                            $color="#f59e0b"
                                            title="Edit Purchase"
                                            onClick={() => navigate(`/purchase/edit/${p.id}`)}
                                        >
                                            <i className="bi bi-pencil-fill"></i>
                                        </ActionBtn>
                                        <ActionBtn
                                            $bg="#ef4444"
                                            $color="#ef4444"
                                            title="Delete"
                                            onClick={() => deletePurchase(p.id)}
                                        >
                                            <i className="bi bi-trash3-fill"></i>
                                        </ActionBtn>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
                                    <i className="bi bi-cloud-slash" style={{ fontSize: "3rem", display: "block", marginBottom: "15px" }}></i>
                                    <strong>No purchase records found.</strong><br/>
                                    Try adjusting your search or date filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </StyledTable>
            </TableCard>
        </PageContainer>
    );
}