import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

/* ================= ANIMATIONS ================= */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(13, 110, 253, 0); }
  100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
`;

/* ================= STYLED COMPONENTS ================= */
const FullPageWrapper = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: 9999;
  background-color: #000;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow: hidden;
`;

const BackgroundVideo = styled.video`
  position: absolute;
  top: 50%; left: 50%;
  min-width: 100%; min-height: 100%;
  width: auto; height: auto;
  z-index: 0;
  transform: translate(-50%, -50%);
  object-fit: cover;
  filter: brightness(0.35) contrast(1.1);
`;

const ContentOverlay = styled.div`
  position: relative;
  z-index: 10;
  height: 100%;
  display: flex;
  align-items: center;
  background: radial-gradient(circle at center, transparent 10%, rgba(0,0,0,0.7) 100%);
`;

const BadgeWrapper = styled.div`
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.6s ease-out forwards;
`;

const MainTitle = styled.h1`
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 900;
  letter-spacing: -2px;
  text-transform: uppercase;
  background: linear-gradient(to bottom, #ffffff 0%, #a5a5a5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
  animation: ${fadeIn} 0.8s ease-out forwards;
`;

const DecorativeLine = styled.div`
  width: 80px;
  height: 5px;
  background: #0d6efd;
  margin: 1.5rem auto;
  border-radius: 10px;
  animation: ${fadeIn} 1s ease-out forwards;
`;

const Subtitle = styled.p`
  animation: ${fadeIn} 1.1s ease-out forwards;
`;

const ButtonGroup = styled.div`
  animation: ${fadeIn} 1.3s ease-out forwards;
`;

const StyledButton = styled.button`
  padding: 1.2rem 3rem;
  font-weight: 700;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.95rem;
  border: none;
  background: #0d6efd;
  color: white;
  box-shadow: 0 10px 30px rgba(13, 110, 253, 0.3);
  animation: ${pulse} 2s infinite;
  
  &:hover {
    background: #0b5ed7;
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(13, 110, 253, 0.5);
  }
`;

const GlassButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 1.2rem 3rem;
  font-weight: 700;
  border-radius: 12px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.95rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-3px);
  }
`;

/* ================= MAIN COMPONENT ================= */
const TikzarWelcome = () => {
  const videoSource = "/vecteezy.mp4";
  const navigate = useNavigate(); // Navigation function

  return (
    <FullPageWrapper>
      <BackgroundVideo autoPlay loop muted playsInline>
        <source src={videoSource} type="video/mp4" />
      </BackgroundVideo>

      <ContentOverlay>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 text-center text-white">
              
              <BadgeWrapper>
                <span 
                  className="badge rounded-pill px-4 py-2 text-uppercase tracking-wider"
                  style={{ background: 'rgba(13, 110, 253, 0.2)', border: '1px solid #0d6efd', color: '#82b1ff' }}
                >
                  <i className="fas fa-shield-alt me-2"></i> Enterprise Security Edition
                </span>
              </BadgeWrapper>

              <MainTitle>RIVER-ISLAND</MainTitle>
              
              <DecorativeLine />

              <Subtitle className="lead fs-3 fw-light mb-5 opacity-75">
                The gold standard in <span className="fw-bold text-white">Garment Management</span>. <br className="d-none d-md-block" />
                Empowering the future of global textile manufacturing.
              </Subtitle>

              <ButtonGroup className="d-grid gap-4 d-sm-flex justify-content-sm-center mt-4">
                {/* Admin ko Admin/Login pe hi bhejna hai */}
                <StyledButton onClick={() => navigate("/Admin/Login")}>
                  <i className="fas fa-user-shield me-2"></i> Administrator Login
                </StyledButton>

                {/* Staff Portal ko ab Selection Page (/Staff/Portal) par bhejna hai */}
                <GlassButton onClick={() => navigate("/Staff/Portal")}>
                  <i className="fas fa-users me-2"></i> Staff Portal
                </GlassButton>
              </ButtonGroup>

            </div>
          </div>
        </div>
      </ContentOverlay>

      <div 
        className="position-absolute bottom-0 w-100 p-4 d-flex justify-content-between text-white-50" 
        style={{ letterSpacing: '2px', fontSize: '0.75rem', fontWeight: 600 }}
      >
        <span>© 2026 TIKZAR TECH SYSTEMS</span>
        <span className="d-none d-sm-block">
          INVENTORY • PRODUCTION • LOGISTICS
        </span>
      </div>
    </FullPageWrapper>
  );
};

export default TikzarWelcome;