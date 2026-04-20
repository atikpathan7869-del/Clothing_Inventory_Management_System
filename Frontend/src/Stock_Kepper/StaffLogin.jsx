import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { postRequest } from "../../Services/apiService";
import { showError } from "../../Services/sweetAlert";
import { useNavigate } from "react-router-dom";

/* ================= THEME & ANIMATIONS ================= */
const Colors = {
  primary: "#0d6efd",
  secondary: "#00d2ff",
  darkBg: "#020617",
  glass: "rgba(15, 23, 42, 0.7)",
  border: "rgba(255, 255, 255, 0.08)",
  text: "#f8fafc",
  subText: "#94a3b8",
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const blink = keyframes`
  50% { opacity: 0; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

/* ================= STYLED COMPONENTS ================= */
const LoginPage = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${Colors.darkBg};
  background-image: 
    radial-gradient(circle at 0% 0%, rgba(13, 110, 253, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(0, 210, 255, 0.08) 0%, transparent 50%);
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
  padding: 20px;
`;

const UnifiedContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  width: 100%;
  max-width: 1200px;
  height: 750px;
  background: ${Colors.glass};
  backdrop-filter: blur(40px);
  border-radius: 48px;
  border: 1px solid ${Colors.border};
  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  animation: ${css`${fadeIn} 0.8s cubic-bezier(0.16, 1, 0.3, 1)`};

  @media (max-width: 950px) {
    grid-template-columns: 1fr;
    height: auto;
    max-width: 550px;
  }
`;

const ArtPanel = styled.div`
  position: relative;
  padding: 4.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(rgba(15, 23, 42, 0.85), rgba(2, 6, 23, 0.95)),
              url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070");
  background-size: cover;
  background-position: center;
  @media (max-width: 950px) { display: none; }
`;

const SuccessOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: #020617;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  animation: ${css`${fadeIn} 0.5s ease-out`};
`;

const TypewriterText = styled.h2`
  font-size: 1.1rem;
  font-weight: 800;
  color: ${Colors.primary};
  text-transform: uppercase;
  letter-spacing: 5px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;

  &::after {
    content: '';
    width: 3px;
    height: 20px;
    background: ${Colors.primary};
    margin-left: 10px;
    animation: ${css`${blink} 0.8s infinite`};
  }
`;

const UserReveal = styled.h1`
  font-size: 4.5rem;
  font-weight: 900;
  color: white;
  letter-spacing: -2px;
  margin: 0;
  background: linear-gradient(to bottom, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${css`${fadeIn} 0.8s ease-out`};
`;

const FormPanel = styled.div`
  padding: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(15, 23, 42, 0.2);
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 1.8rem;
`;

const StyledLabel = styled.label`
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: ${Colors.subText};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 18px 24px;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid ${props => props.$error ? "#ef4444" : "rgba(255,255,255,0.05)"};
  border-radius: 20px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${Colors.primary};
    background: rgba(15, 23, 42, 0.9);
    box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.15);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, ${Colors.primary}, ${Colors.secondary});
  color: white;
  border: none;
  border-radius: 22px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -10px rgba(13, 110, 253, 0.4);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: ${css`${shimmer} 2s infinite`};
  }
`;

export default function StockkeeperLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const fullText = "WELCOME RIVER ISLAND IMS SYSTEM";

  useEffect(() => { 
    localStorage.clear(); 
  }, []);

  useEffect(() => {
    if (isSuccess) {
      let i = 0;
      const timer = setInterval(() => {
        setDisplayText(fullText.substring(0, i + 1));
        i++;
        if (i >= fullText.length) clearInterval(timer);
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isSuccess]);

  const formik = useFormik({
    initialValues: { identifier: "", password: "" },
    validationSchema: Yup.object({
      identifier: Yup.string().required("Stock ID Required"),
      password: Yup.string().required("Security Key Required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await postRequest("StaffMaster/Login", values);
        if (res.status === "OK") {
          setLoggedInUser(res.result.name);
          localStorage.setItem("user", JSON.stringify({ ...res.result, isAuthenticated: true }));
          localStorage.setItem("staffId", res.result.id);
          localStorage.setItem("staffRole", res.result.role);

          setIsSuccess(true); 
          setTimeout(() => navigate("/Staff/Dashboard"), 3500);
        } else {
          showError("Access Denied", res.result || "Check Stockkeeper credentials");
          setLoading(false);
        }
      } catch (err) {
        showError("System Error", "Warehouse server unreachable");
        setLoading(false);
      }
    },
  });

  return (
    <LoginPage>
      <UnifiedContainer>
        {isSuccess && (
          <SuccessOverlay>
            <TypewriterText>{displayText}</TypewriterText>
            {displayText === fullText && (
              <UserReveal>Hi, {loggedInUser}</UserReveal>
            )}
            <div style={{ marginTop: '40px', opacity: 0.5, color: 'white', fontSize: '0.7rem', letterSpacing: '3px' }}>
              LOADING INVENTORY MODULE...
            </div>
          </SuccessOverlay>
        )}

        <ArtPanel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: Colors.primary }}></div>
             <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px' }}>LOGISTICS HUB</span>
          </div>
          
          <div>
            <h2 style={{ fontSize: '3.8rem', fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: 0 }}>
              Stock<br/><span style={{ opacity: 0.4 }}>Management</span>
            </h2>
            <p style={{ color: Colors.subText, fontSize: '1rem', marginTop: '20px', maxWidth: '350px' }}>
              Real-time warehouse tracking for Global Collection Bharuch operations.
            </p>
          </div>

          <div style={{ fontSize: '0.7rem', color: Colors.subText, fontWeight: 700 }}>
            IMS SECURE NODE • V4.0.2
          </div>
        </ArtPanel>

        <FormPanel>
          <div style={{ marginBottom: '3.5rem' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', margin: 0 }}>Portal Access</h3>
            <p style={{ color: '#64748b', marginTop: '10px' }}>Stockkeeper Authentication Required</p>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <InputWrapper>
              <StyledLabel>Stockkeeper Identifier</StyledLabel>
              <StyledInput
                name="identifier"
                placeholder="Staff ID or Email"
                {...formik.getFieldProps("identifier")}
                $error={formik.touched.identifier && formik.errors.identifier}
              />
            </InputWrapper>

            <InputWrapper>
              <StyledLabel>Security Password</StyledLabel>
              <div style={{ position: 'relative' }}>
                <StyledInput
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  {...formik.getFieldProps("password")}
                  $error={formik.touched.password && formik.errors.password}
                />
                <div 
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#475569' }}
                >
                  <i className={showPass ? "fas fa-eye-slash" : "fas fa-eye"} />
                </div>
              </div>
            </InputWrapper>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Access Warehouse Dashboard"}
            </SubmitButton>
          </form>

          <footer style={{ marginTop: 'auto', paddingTop: '4rem', textAlign: 'center' }}>
             <p style={{ color: '#334155', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px' }}>
                &copy; 2026 RIVER ISLAND • BHARUCH, INDIA
             </p>
          </footer>
        </FormPanel>
      </UnifiedContainer>
    </LoginPage>
  );
}