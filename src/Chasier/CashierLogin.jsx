import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { postRequest } from "../../Services/apiService";
import { showError } from "../../Services/sweetAlert";
import { useNavigate } from "react-router-dom";

/* ================= THEME & ANIMATIONS ================= */
const Colors = {
  primary: "#6366f1",
  secondary: "#a855f7",
  darkBg: "#020617",
  glass: "rgba(15, 23, 42, 0.65)",
  border: "rgba(255, 255, 255, 0.08)",
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
    radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 90% 90%, rgba(168, 85, 247, 0.1) 0%, transparent 40%);
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
  padding: 20px;
`;

const UnifiedContainer = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  width: 100%;
  max-width: 1240px;
  height: 780px;
  background: ${Colors.glass};
  backdrop-filter: blur(50px);
  border-radius: 48px;
  border: 1px solid ${Colors.border};
  box-shadow: 0 40px 120px -20px rgba(0, 0, 0, 0.8);
  overflow: hidden;
  /* FIX: Wrap keyframes in css helper */
  animation: ${css`${fadeIn} 1s cubic-bezier(0.16, 1, 0.3, 1)`};

  @media (max-width: 1050px) {
    grid-template-columns: 1fr;
    max-width: 550px;
    height: auto;
  }
`;

const ArtPanel = styled.div`
  position: relative;
  padding: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(9, 12, 25, 0.9), rgba(15, 23, 42, 0.8)),
              url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070");
  background-blend-mode: overlay;
  background-size: cover;
  @media (max-width: 1050px) { display: none; }
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
  /* FIX: Wrap keyframes in css helper */
  animation: ${css`${fadeIn} 0.5s ease-out`};
`;

const TypewriterText = styled.h2`
  font-size: 1.1rem;
  font-weight: 800;
  color: ${Colors.primary};
  text-transform: uppercase;
  letter-spacing: 5px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;

  &::after {
    content: '';
    width: 3px;
    height: 18px;
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
  background: linear-gradient(to bottom, #ffffff, #64748b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${css`${fadeIn} 0.8s ease-out`};
`;

const FormPanel = styled.div`
  padding: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 2rem;
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
  padding: 20px 24px;
  background: rgba(15, 23, 42, 0.6);
  border: 1.5px solid ${props => props.$error ? "#ef4444" : "rgba(255, 255, 255, 0.05)"};
  border-radius: 24px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: ${Colors.primary};
    background: rgba(15, 23, 42, 0.9);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 22px;
  background: linear-gradient(135deg, ${Colors.primary}, ${Colors.secondary});
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.4);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: ${css`${shimmer} 2s infinite`};
  }
`;

export default function CashierLogin() {
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

  // Typewriter effect logic
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
      identifier: Yup.string().required("Enter ID"),
      password: Yup.string().required("Enter Password"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await postRequest("StaffMaster/Login", values);
        if (res.status === "OK") {
          setLoggedInUser(res.result.name);
          localStorage.setItem("user", JSON.stringify({ ...res.result, isAuthenticated: true }));
          localStorage.setItem("staffId", res.result.id);
          localStorage.setItem("staffName", res.result.name);
          setIsSuccess(true); 
          setTimeout(() => navigate("/Cashier/Deashboard"), 3500);
        } else {
          showError("Access Denied", res.result || "Check credentials");
          setLoading(false);
        }
      } catch (err) {
        showError("Offline", "IMS Server not responding");
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
              <UserReveal>Hello, {loggedInUser}</UserReveal>
            )}
            <div style={{ marginTop: '40px', opacity: 0.4, color: 'white', fontSize: '0.7rem', letterSpacing: '2px' }}>
              SYNCING TERMINAL DATA...
            </div>
          </SuccessOverlay>
        )}

        <ArtPanel>
          <div style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px' }}>
            <span style={{ color: '#10b981' }}>●</span> BHARUCH OPS UNIT
          </div>
          <div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', lineHeight: 1, margin: 0 }}>
              River Island<br/><span style={{ opacity: 0.5 }}>IMS System</span>
            </h2>
          </div>
          <div style={{ fontSize: '0.7rem', color: Colors.subText }}>VER: 4.0.2 • SECURE SESSION</div>
        </ArtPanel>

        <FormPanel>
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', margin: 0 }}>Login</h3>
            <p style={{ color: '#64748b', marginTop: '10px' }}>Global Collection Staff Portal</p>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <InputWrapper>
              <StyledLabel>Staff Identifier</StyledLabel>
              <StyledInput
                name="identifier"
                placeholder="ID or Email"
                {...formik.getFieldProps("identifier")}
                $error={formik.touched.identifier && formik.errors.identifier}
              />
            </InputWrapper>

            <InputWrapper>
              <StyledLabel>Security Key</StyledLabel>
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
              {loading ? "Authenticating..." : "Initialize Session"}
            </SubmitButton>
          </form>
        </FormPanel>
      </UnifiedContainer>
    </LoginPage>
  );
}