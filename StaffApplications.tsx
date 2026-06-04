@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  
  --color-discord: #5865F2;
  --color-discord-hover: #4752C4;
}

/* Mesh Gradient Background */
.mesh-gradient {
  background-color: #08090d;
  background-image: 
    radial-gradient(at 5% 5%, rgba(59, 130, 246, 0.09) 0px, transparent 35%),
    radial-gradient(at 95% 5%, rgba(139, 92, 246, 0.09) 0px, transparent 35%),
    radial-gradient(at 50% 50%, rgba(6, 182, 212, 0.04) 0px, transparent 50%),
    radial-gradient(at 95% 95%, rgba(99, 102, 241, 0.09) 0px, transparent 35%),
    radial-gradient(at 5% 95%, rgba(59, 130, 246, 0.09) 0px, transparent 35%);
  background-attachment: fixed;
}

/* Frosted Glass Class with ultra-soft borders and deeper matte opacity */
.glass {
  background: rgba(14, 16, 22, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.035);
  box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.7);
}

/* Smooth Interactive/Card Overlays */
.glass-hover:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.07);
}

.glass-input {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: #f1f5f9 !important;
}

.glass-input:focus {
  border-color: rgba(6, 182, 212, 0.5) !important;
  box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.15);
  outline: none;
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-left: 4px solid #3b82f6;
}

.status-pending {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.status-accepted {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-denied {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Animations fluidité */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Scrollbars modernes */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #020617;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155;
}

