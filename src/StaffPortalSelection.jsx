import React from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const SelectionPage = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #1e293b, #0f172a);
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: white;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.6s ease-out;

  h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 10px; letter-spacing: -1px; }
  p { color: #94a3b8; font-size: 1.1rem; }
`;

const CardContainer = styled.div`
  display: flex;
  gap: 30px;
  max-width: 900px;
  width: 100%;
  animation: ${fadeIn} 0.8s ease-out;

  @media (max-width: 768px) { flex-direction: column; }
`;

const RoleCard = styled.div`
  flex: 1;
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    transform: translateY(-15px);
    background: rgba(30, 41, 59, 0.6);
    border-color: ${(props) => props.color};
    box-shadow: 0 20px 40px -15px ${(props) => props.shadow};
  }

  .icon-box {
    width: 80px;
    height: 80px;
    background: ${(props) => props.color};
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 25px;
    box-shadow: 0 10px 20px -5px ${(props) => props.shadow};
  }

  h2 { font-size: 1.8rem; margin-bottom: 15px; }
  p { color: #94a3b8; line-height: 1.5; font-size: 0.95rem; }
`;

export default function StaffPortalSelection() {
  const navigate = useNavigate();

  return (
    <SelectionPage>
      <Header>
        <h1>STAFF PORTAL</h1>
        <p>Please select your department to continue</p>
      </Header>

      <CardContainer>
        {/* STOCKKEEPER CARD */}
        <RoleCard 
          color="#0d6efd" 
          shadow="rgba(13, 110, 253, 0.4)"
          onClick={() => navigate("/Staff/Login/Stockkeeper")}
        >
          <div className="icon-box"><i className="fas fa-boxes-stacked" /></div>
          <h2>Stockkeeper</h2>
          <p>Inventory management, purchase entries, and warehouse logistics tracking.</p>
        </RoleCard>

        {/* CASHIER CARD */}
        <RoleCard 
          color="#7c3aed" 
          shadow="rgba(124, 58, 237, 0.4)"
          onClick={() => navigate("/Staff/Login/Cashier")}
        >
          <div className="icon-box"><i className="fas fa-cash-register" /></div>
          <h2>Cashier</h2>
          <p>Billing terminal, point-of-sale operations, and customer invoice generation.</p>
        </RoleCard>
      </CardContainer>

      <div style={{ marginTop: '4rem', opacity: 0.5 }}>
         <button 
           onClick={() => navigate("/")}
           style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}
         >
           <i className="fas fa-arrow-left" /> Back to Home
         </button>
      </div>
    </SelectionPage>
  );
}