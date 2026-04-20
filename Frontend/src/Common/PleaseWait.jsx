import React from "react";

const PleaseWait = ({ show }) => {
  if (!show) return null;

  return (
    <>
      <style>
        {`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.95); opacity: 0.5; }
            50% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.5; }
          }
          @keyframes float-icon {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          @keyframes slide-progress {
            0% { left: -100%; }
            100% { left: 100%; }
          }
        `}
      </style>

      <div style={overlayStyle}>
        <div style={cardStyle}>
          
          {/* --- MODERN CLOTHING IMS LOGO (SVG) --- */}
          <div style={logoWrapper}>
            {/* Rotating Outer Ring */}
            <div style={outerRingStyle}></div>
            
            {/* Floating Shirt Icon */}
            <div style={iconContainer}>
              <svg 
                width="50" 
                height="50" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ animation: "float-icon 3s ease-in-out infinite" }}
              >
                <path d="M20.38 8.57L18.89 5.59C18.53 4.87 17.81 4.42 17.02 4.42H14.83C14.4 4.42 14.04 4.7 13.93 5.11L13.11 8.21C13.01 8.57 12.68 8.82 12.3 8.82H11.7C11.32 8.82 10.99 8.57 10.89 8.21L10.07 5.11C9.96 4.7 9.6 4.42 9.17 4.42H6.98C6.19 4.42 5.47 4.87 5.11 5.59L3.62 8.57C3.19 9.43 3.42 10.47 4.17 11.08L6.41 12.91C6.79 13.22 7 13.69 7 14.18V18.5C7 19.33 7.67 20 8.5 20H15.5C16.33 20 17 19.33 17 18.5V14.18C17 13.69 17.21 13.22 17.59 12.91L19.83 11.08C20.58 10.47 20.81 9.43 20.38 8.57Z" />
                <path d="M9 20v-5h6v5" />
                <path d="M12 9V4" />
              </svg>
            </div>
          </div>

          {/* --- TEXT CONTENT --- */}
          <div style={textWrapper}>
            <h2 style={titleStyle}>Processing Request</h2>
            <p style={subtitleStyle}>Syncing inventory & sales data...</p>
          </div>

          {/* --- PROFESSIONAL PROGRESS BAR --- */}
          <div style={progressBarTrack}>
            <div style={progressBarFill}></div>
          </div>

          <span style={footerTextStyle}>Please do not close this window</span>
        </div>
      </div>
    </>
  );
};

/* ================= THEMED STYLES ================= */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 100000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(15, 23, 42, 0.6)", // Deep slate overlay
  backdropFilter: "blur(12px)", // Premium blur effect
};

const cardStyle = {
  width: "350px",
  backgroundColor: "#ffffff",
  padding: "40px 30px",
  borderRadius: "32px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
};

const logoWrapper = {
  position: "relative",
  width: "120px",
  height: "120px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "20px",
};

const outerRingStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  border: "3px solid #f1f5f9",
  borderTop: "3px solid #6366f1", // Indigo Accent
  animation: "spin-slow 2s linear infinite",
};

const iconContainer = {
  width: "90px",
  height: "90px",
  backgroundColor: "#f8fafc",
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
  animation: "pulse-ring 3s ease-in-out infinite",
};

const textWrapper = {
  marginBottom: "25px",
};

const titleStyle = {
  margin: 0,
  fontSize: "1.4rem",
  fontWeight: "800",
  color: "#0f172a",
  letterSpacing: "-0.5px",
};

const subtitleStyle = {
  margin: "8px 0 0",
  fontSize: "0.95rem",
  color: "#64748b",
  fontWeight: "500",
};

const progressBarTrack = {
  width: "100%",
  height: "6px",
  backgroundColor: "#f1f5f9",
  borderRadius: "10px",
  overflow: "hidden",
  position: "relative",
  marginBottom: "15px",
};

const progressBarFill = {
  position: "absolute",
  width: "40%",
  height: "100%",
  background: "linear-gradient(90deg, #6366f1, #818cf8)",
  borderRadius: "10px",
  animation: "slide-progress 1.5s ease-in-out infinite",
};

const footerTextStyle = {
  fontSize: "0.75rem",
  color: "#94a3b8",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export default PleaseWait;