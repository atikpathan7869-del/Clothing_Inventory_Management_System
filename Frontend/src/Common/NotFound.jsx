import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

/* ================= STYLED COMPONENTS ================= */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  background-color: #f8fafc;
  padding: 20px;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  margin: 0;
  color: #10B981; 
  font-weight: 800;
  letter-spacing: -5px;
  @media(max-width: 480px) { font-size: 5rem; }
`;

const Message = styled.h2`
  font-size: 1.8rem;
  color: #0f172a;
  margin: 10px 0;
`;

const SubMessage = styled.p`
  color: #64748b;
  margin-bottom: 30px;
  max-width: 450px;
  line-height: 1.6;
`;

const HomeButton = styled.button`
  padding: 14px 35px;
  background-color: #0f172a;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #10B981;
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
  }
`;

const NotFound = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    // 1. Check for Admin Login (Aapke AdminMasterPage se)
    const adminId = localStorage.getItem("adminId");
    
    // 2. Check for Staff Login (Aapke StaffMasterPage se)
    const staffUserStr = localStorage.getItem("user");

    if (adminId) {
      // Agar Admin logged in hai
      navigate("/Admin/Dashboard");
    } 
    else if (staffUserStr) {
      // Agar Staff logged in hai (Parsing the JSON object)
      const staffUser = JSON.parse(staffUserStr);
      
      if (staffUser.role === "Stockkeeper") {
        navigate("/Staff/Dashboard");
      } else if (staffUser.role === "Cashier") {
        navigate("/Staff/Billing");
      } else {
        navigate("/Staff/Login");
      }
    } 
    else {
      // Agar koi bhi login nahi hai
      navigate("/Staff/Login");
    }
  };

  return (
    <Container>
      <ErrorCode>404</ErrorCode>
      <Message>Page Not Found</Message>
      <SubMessage>
        The resource you are looking for might have been removed, had its name changed, 
        or is temporarily unavailable in the IMS system.
      </SubMessage>
      
      <HomeButton onClick={handleBackHome}>
        <i className="fas fa-house-user" />
        Return to Dashboard
      </HomeButton>
    </Container>
  );
};

export default NotFound;