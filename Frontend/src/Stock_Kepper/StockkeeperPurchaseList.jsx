import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiPlus, FiEye, FiTruck, FiCheckCircle } from "react-icons/fi";

import { getRequest } from "../../Services/apiService";
import { showError } from "../../Services/sweetAlert";
import PleaseWait from "../Common/PleaseWait";

/* ================= STYLES (Modern & Professional) ================= */
const PageContainer = styled.div`
  padding: 2.5rem;
  background: #f4f7fe;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  h2 { color: #1B2559; font-weight: 800; font-size: 1.8rem; margin: 0; }
  p { color: #A3AED0; margin: 5px 0 0; }
`;

const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0px 20px 40px rgba(112, 144, 176, 0.05);
  border: 1px solid #f0f2f8;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 15px;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 350px;
  input {
    width: 100%;
    padding: 12px 15px 12px 45px;
    border-radius: 14px;
    border: 1.5px solid #E0E5F2;
    outline: none;
    background: #f4f7fe;
    &:focus { border-color: #4318FF; background: #fff; }
  }
  svg { position: absolute; left: 15px; top: 14px; color: #A3AED0; font-size: 1.2rem; }
`;

const AddBtn = styled.button`
  background: #4318FF;
  color: white;
  padding: 10px 24px;
  border-radius: 14px;
  border: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: 0.3s;
  &:hover { background: #3311db; transform: translateY(-2px); }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  th { padding: 15px; text-align: left; color: #A3AED0; font-size: 12px; font-weight: 700; text-transform: uppercase; }
  tbody tr { background: #fff; transition: 0.2s; &:hover { background: #f8fafd; } }
  td { padding: 15px; vertical-align: middle; border-top: 1px solid #f4f7fe; border-bottom: 1px solid #f4f7fe; }
  td:first-child { border-left: 1px solid #f4f7fe; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
  td:last-child { border-right: 1px solid #f4f7fe; border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
`;

const Badge = styled.span`
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  background: ${p => p.$isDue ? "#FFF5F5" : "#E6FAF5"};
  color: ${p => p.$isDue ? "#EE5D50" : "#05CD99"};
`;

const ActionIcon = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #E0E5F2;
  background: white;
  color: #4318FF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover { background: #4318FF; color: white; }
`;

/* ================= COMPONENT ================= */

export default function StockkeeperPurchaseList() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

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
            showError("System Error", "Failed to sync with warehouse database");
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return purchases.filter(p =>
            (p.billNo || "").toLowerCase().includes(search.toLowerCase()) ||
            (p.vendor?.name || "").toLowerCase().includes(search.toLowerCase())
        );
    }, [purchases, search]);

    return (
        <PageContainer>
            <PleaseWait show={loading} />

            <Header>
                <div>
                    <h2>Inbound Shipments</h2>
                    <p>Track all incoming stock and purchase invoices for <strong>Global Collection</strong></p>
                </div>
                <AddBtn onClick={() => navigate("/Staff/StockkeeperPurchaseForm")}>
                    <FiPlus /> New Purchase Entry
                </AddBtn>
            </Header>

            <Card>
                <Toolbar>
                    <SearchWrapper>
                        <FiSearch />
                        <input 
                            placeholder="Search by Invoice # or Vendor..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </SearchWrapper>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A3AED0', fontSize: '14px' }}>
                        <FiTruck /> Total Orders: {filtered.length}
                    </div>
                </Toolbar>

                <div style={{ overflowX: "auto" }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Invoice No.</th>
                                <th>Vendor Details</th>
                                <th>Arrival Date</th>
                                <th>Items Total</th>
                                <th>Payment Status</th>
                                <th>Inventory</th>
                                <th style={{ textAlign: "right" }}>Review</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 800, color: "#1B2559" }}>{p.billNo}</td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: "#4318FF" }}>{p.vendor?.name}</div>
                                        <div style={{ fontSize: "11px", color: "#A3AED0" }}>{p.vendor?.city || 'Bharuch'}</div>
                                    </td>
                                    <td style={{ color: "#707EAE", fontWeight: 600 }}>
                                        {moment(p.billDate).format("DD MMM, YYYY")}
                                    </td>
                                    <td style={{ fontWeight: 700 }}>₹ {p.netAmount?.toLocaleString()}</td>
                                    <td>
                                        <Badge $isDue={p.dues > 0}>
                                            {p.dues > 0 ? `DUE: ₹${p.dues}` : "FULLY PAID"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#05CD99', fontSize: '12px', fontWeight: 700 }}>
                                            <FiCheckCircle /> Stock Updated
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <ActionIcon 
                                                title="View Shipment Details"
                                                onClick={() => navigate(`/Staff/StockkeeperPurchaseView/${p.id}`)}
                                            >
                                                <FiEye size={18} />
                                            </ActionIcon>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </PageContainer>
    );
}