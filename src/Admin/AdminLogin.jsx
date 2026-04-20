import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { postRequest } from "../../Services/apiService";
import { showToast, showError } from "../../Services/sweetAlert";
import { 
  Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, 
  CheckCircle2, Loader2, ArrowLeft, Globe, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPEWRITER COMPONENT ---
const Typewriter = ({ text, delay = 0, speed = 0.05 }) => {
  return (
    <motion.span>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + i * speed }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [adminName, setAdminName] = useState("");

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showError("Validation", "Enter Email & Password");
      return;
    }

    try {
      setLoading(true);
      const res = await postRequest(
        `Admin/SignIn?email=${formData.email}&password=${formData.password}`
      );

      if (res && res.result) {
        localStorage.setItem("adminId", res.result.id);
        localStorage.setItem("adminFullName", res.result.full_Name);
        localStorage.setItem("FyId", res.result.financial_year.id);
        
        setAdminName(res.result.full_Name);
        setLoginSuccess(true);

        setTimeout(() => {
          navigate("/Admin/Dashboard");
        }, 3500); // Increased time for typewriter effect to finish
      } else {
        showError("Error", "Invalid Credentials");
      }
    } catch (err) {
      showError("Login Failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap');

        .admin-page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #020617;
          background-image: 
            radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 40%);
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 20px;
          overflow: hidden;
        }

        .main-card {
          background: #fff;
          border-radius: 32px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 50px 100px -20px rgba(0,0,0,0.8);
          width: 100%;
          max-width: 1100px;
          z-index: 10;
        }

        .brand-side {
          background-image: url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1200');
          background-size: cover;
          background-position: center;
          padding: 60px;
          position: relative;
        }

        .brand-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(225deg, rgba(30, 27, 75, 0.4) 0%, rgba(2, 6, 23, 0.95) 100%);
          z-index: 1;
        }

        .brand-content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }

        .form-side { padding: 50px 60px; background: white; position: relative; }

        .back-btn {
          position: absolute;
          top: 30px;
          right: 30px;
          border: none;
          background: #f1f5f9;
          color: #64748b;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .back-btn:hover { background: #e2e8f0; color: #0f172a; transform: translateX(-3px); }

        .custom-input-group { position: relative; margin-bottom: 22px; }

        .custom-input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          background: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .custom-input:focus {
          outline: none;
          background: #fff;
          border-color: #4f46e5;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.1);
        }

        .login-btn {
          background: #0f172a;
          color: #fff;
          border: none;
          border-radius: 16px;
          padding: 18px;
          font-weight: 700;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: 0.3s;
        }

        .login-btn:hover:not(:disabled) { background: #1e293b; transform: translateY(-2px); }

        .welcome-overlay {
          position: fixed;
          inset: 0;
          background: #020617;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .typewriter-text {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 10px;
        }
      `}</style>

      {/* --- TYPING ANIMATION WELCOME SCREEN --- */}
      <AnimatePresence>
        {loginSuccess && (
          <motion.div 
            className="welcome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mb-4 d-flex justify-content-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <CheckCircle2 size={70} className="text-indigo-400" style={{color: '#818cf8'}} />
                </motion.div>
              </div>

              <h1 className="typewriter-text">
                <Typewriter text={`Welcome, ${adminName.split(' ')[0]}`} delay={0.2} />
              </h1>
              
              <div className="fs-4 text-light opacity-50 fw-light">
                <Typewriter text="River Island Garment IMS" delay={1.5} speed={0.03} />
              </div>

              <motion.div 
                className="mt-5 d-flex align-items-center justify-content-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8 }}
              >
                <Loader2 className="spinner-border-sm" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span className="small tracking-widest text-uppercase">Setting up your workspace...</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="main-card">
        <div className="row g-0">
          
          {/* Brand Side */}
          <div className="col-lg-6 brand-side d-none d-lg-flex">
            <div className="brand-overlay"></div>
            <div className="brand-content">
              <div className="d-flex align-items-center gap-2">
                <Zap size={20} className="text-indigo-400" style={{color:'#818cf8'}}/>
                <span className="text-white small fw-bold tracking-widest text-uppercase">Core IMS v4.0</span>
              </div>
              
              <div>
                <motion.h1 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="display-4 fw-bold text-white mb-3"
                >
                  RIVER ISLAND <br />
                  <span style={{ color: '#818cf8', fontWeight: 300 }}>OPERATIONS</span>
                </motion.h1>
                <p className="text-light opacity-75 fs-5">
                  Streamlining garment distribution and inventory with precision.
                </p>
              </div>

              <div className="text-light small opacity-50">
                © 2026 River Island Enterprise • Global Distribution
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="col-lg-6 form-side">
            {/* BACK BUTTON */}
            <button className="back-btn" title="Back to Home" onClick={() => navigate("/")}>
              <ArrowLeft size={20} />
            </button>

            <div className="mb-5">
              <h2 className="fw-bold text-dark mb-2" style={{ fontSize: '2rem' }}>Admin Access</h2>
              <p className="text-muted">Security verification required to proceed.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="custom-input-group">
                <label className="form-label small fw-bold text-uppercase text-secondary mb-2">Email Identity</label>
                <div className="position-relative">
                  <input
                    type="email"
                    className="custom-input"
                    placeholder="admin@riverisland.com"
                    required
                    disabled={loading}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <User className="position-absolute" size={18} style={{left: '18px', top: '20px', color: '#94a3b8'}} />
                </div>
              </div>

              <div className="custom-input-group">
                <label className="form-label small fw-bold text-uppercase text-secondary mb-2">Security Key</label>
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="custom-input"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Lock className="position-absolute" size={18} style={{left: '18px', top: '20px', color: '#94a3b8'}} />
             
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="rem" />
                  <label className="form-check-label small text-muted" htmlFor="rem">Keep me logged in</label>
                </div>
                <span className="small text-indigo-600 fw-bold cursor-pointer" style={{color: '#4f46e5', cursor: 'pointer'}}>Recovery</span>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading || loginSuccess}
              >
                {loading ? (
                  <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={20} />
                ) : (
                  <>
                    AUTHORIZE SYSTEM
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-top">
              <div className="d-flex align-items-center gap-4 justify-content-center">
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheck size={16} className="text-success" />
                  <span className="text-muted fw-bold" style={{ fontSize: '0.65rem' }}>ENCRYPTED</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Globe size={16} className="text-primary" />
                  <span className="text-muted fw-bold" style={{ fontSize: '0.65rem' }}>CENTRAL SERVER</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminLogin;