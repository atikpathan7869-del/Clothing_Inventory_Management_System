import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

const slideLeft = keyframes`from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); }`;

const MainWrapper = styled.div`
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  animation: ${slideLeft} 0.5s ease-out;
`;

const SidebarCard = styled.div`
  background: #0f172a;
  border-radius: 24px;
  padding: 40px 30px;
  color: white;
  text-align: center;
  height: fit-content;

  img {
    width: 120px; height: 120px;
    border-radius: 50%;
    border: 4px solid #38bdf8;
    margin-bottom: 20px;
  }
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: #0f172a;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f1f5f9;
  display: flex; align-items: center; gap: 10px;
`;

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px dashed #e2e8f0;
  
  .key { color: #64748b; font-weight: 500; }
  .value { color: #0f172a; font-weight: 700; }
`;

export default function StockkeeperProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    setUser(data);
  }, []);

  if (!user) return null;

  return (
    <MainWrapper>
      <ProfileGrid>
        <SidebarCard>
          <div style={{ fontSize: '4rem', marginBottom: '15px' }}>👤</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{user.name}</h2>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>{user.role}</span>
          <div style={{ marginTop: '30px', textAlign: 'left', fontSize: '0.9rem' }}>
            <p style={{ opacity: 0.7 }}>Warehouse ID:</p>
            <p style={{ fontWeight: 600 }}>WH-2026-00{user.id}</p>
          </div>
        </SidebarCard>

        <ContentCard>
          <SectionTitle>📦 Personal Information</SectionTitle>
          <DataRow>
            <span className="key">Full Name</span>
            <span className="value">{user.name}</span>
          </DataRow>
          <DataRow>
            <span className="key">Username</span>
            <span className="value">{user.username}</span>
          </DataRow>
          <DataRow>
            <span className="key">Email</span>
            <span className="value">{user.email}</span>
          </DataRow>
          <DataRow>
            <span className="key">Contact</span>
            <span className="value">{user.contactNo || 'N/A'}</span>
          </DataRow>
          <DataRow>
            <span className="key">Gender</span>
            <span className="value">{user.gender || 'Not Specified'}</span>
          </DataRow>

          <SectionTitle style={{ marginTop: '40px' }}>🛡️ Security & Access</SectionTitle>
          <DataRow>
            <span className="key">Account Status</span>
            <span className="value" style={{ color: '#22c55e' }}>● ACTIVE</span>
          </DataRow>
          <DataRow>
            <span className="key">Permissions</span>
            <span className="value">Stock Management, Inventory Audit</span>
          </DataRow>
        </ContentCard>
      </ProfileGrid>
    </MainWrapper>
  );
}