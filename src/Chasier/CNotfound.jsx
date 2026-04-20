import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPinOff, Home, ArrowLeft, RotateCcw } from 'lucide-react';
import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #020617;
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
  position: relative;

  /* Premium Background Glows */
  &::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%);
    top: -10%; right: -10%;
  }
`;

const MainContent = styled(motion.div)`
  text-align: center;
  z-index: 10;
  padding: 20px;
`;

const GlitchText = styled(motion.h1)`
  font-size: clamp(8rem, 20vw, 15rem);
  font-weight: 900;
  margin: 0;
  line-height: 0.8;
  background: linear-gradient(to bottom, #fff 20%, rgba(79, 70, 229, 0.4) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -15px;
  filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5));
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: white;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: 800;
  margin-bottom: 15px;
`;

const InfoText = styled.p`
  color: #94a3b8;
  max-width: 500px;
  margin: 0 auto 40px;
  line-height: 1.8;
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(motion.button)`
  background: #fff;
  color: #020617;
  border: none;
  padding: 16px 32px;
  border-radius: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 20px 40px -10px rgba(255, 255, 255, 0.2);
`;

const SecondaryButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 32px;
  border-radius: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SecurityFooter = styled.div`
  position: absolute;
  bottom: 40px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: rgba(148, 163, 184, 0.3);
  font-size: 0.7rem;
  letter-spacing: 4px;
  font-weight: 700;
`;

const CNotfound = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      {/* Animated Decorative Element */}
      <motion.div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          border: '1px solid rgba(79, 70, 229, 0.1)',
          borderRadius: '50%',
          zIndex: 1
        }}
        animate={{ scale: [1, 1.2, 1], rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <MainContent
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <StatusBadge>Error Protocol 404</StatusBadge>
        
        <GlitchText
          animate={{ x: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          404
        </GlitchText>

        <Title>Inventory Item Not Found</Title>
        
        <InfoText>
          The resource you are trying to access has been de-listed or moved to a 
          different warehouse. Please verify the URL or return to main terminal.
        </InfoText>

        <ButtonGroup>
          <PrimaryButton
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/Cashier/Dashboard')}
          >
            <Home size={18} />
            BACK TO DASHBOARD
          </PrimaryButton>

          <SecondaryButton
            whileHover={{ y: -5, background: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            REVERSE ACTION
          </SecondaryButton>
        </ButtonGroup>

        <motion.div 
          style={{ marginTop: '40px', color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600'}}
          onClick={() => window.location.reload()}
        >
          <RotateCcw size={16} />
          Try System Reboot
        </motion.div>
      </MainContent>

      <SecurityFooter>
        <MapPinOff size={14} />
        RIVER ISLAND IMS • V4.2.1 • SECURE_NODE
      </SecurityFooter>
    </PageWrapper>
  );
};

export default CNotfound;