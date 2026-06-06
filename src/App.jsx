import { Suspense, lazy } from "react";
import { useAuth } from "./context/AuthContext";
import { C } from "./constants/colors";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";

const HomePage = lazy(() => import("./pages/HomePage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="loading-screen">
            <div className="spinner animate-spin" />
            <div style={{ fontFamily: "Inter,sans-serif", color: C.primary, fontWeight: 700 }}>MyWallet</div>
        </div>
    );
    if (!user) return <Navigate to="/signin" replace />;
    return children;
}

export default function App() {
    const { user, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Shim for existing toast calls in components
    const customToast = (msg, type = "info") => {
        if (type === "success") toast.success(msg);
        else if (type === "error") toast.error(msg);
        else toast(msg);
    };

    const onNav = (p) => { 
        if (p === "home") navigate("/");
        else navigate(`/${p}`);
        window.scrollTo(0, 0);
    };
    
    const onLogin = () => { navigate("/dashboard"); };

    if (loading) return (
        <div className="loading-screen">
            <div className="spinner animate-spin" />
            <div style={{ fontFamily: "Inter,sans-serif", color: C.primary, fontWeight: 700 }}>MyWallet</div>
        </div>
    );

    const publicPaths = ["/", "/services", "/contact", "/signin", "/signup"];
    const isPublicPath = publicPaths.includes(location.pathname);
    
    // Map pathname to old "page" prop for Navbar compatibility
    const pageMap = { "/": "home", "/services": "services", "/contact": "contact", "/signin": "signin", "/signup": "signup" };
    const currentPage = pageMap[location.pathname] || "home";

    return (
        <div>
            {isPublicPath && <Navbar currentPage={currentPage} onNav={onNav} user={user} />}
            
            <Suspense fallback={
                <div className="loading-screen">
                    <div className="spinner animate-spin" />
                    <div style={{ fontFamily: "Inter,sans-serif", color: C.primary, fontWeight: 700 }}>Loading...</div>
                </div>
            }>
                <Routes>
                    <Route path="/" element={<HomePage onNav={onNav} />} />
                    <Route path="/services" element={<ServicesPage onNav={onNav} />} />
                    <Route path="/contact" element={<ContactPage toast={customToast} />} />
                    <Route path="/signin" element={<AuthPage mode="signin" onNav={onNav} onLogin={onLogin} toast={customToast} />} />
                    <Route path="/signup" element={<AuthPage mode="signup" onNav={onNav} onLogin={onLogin} toast={customToast} />} />
                    
                    {/* Protected Dashboard Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard onNav={onNav} toast={customToast} page="dashboard" /></ProtectedRoute>} />
                    <Route path="/transactions" element={<ProtectedRoute><Dashboard onNav={onNav} toast={customToast} page="transactions" /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><Dashboard onNav={onNav} toast={customToast} page="analytics" /></ProtectedRoute>} />
                    <Route path="/goals" element={<ProtectedRoute><Dashboard onNav={onNav} toast={customToast} page="goals" /></ProtectedRoute>} />
                    <Route path="/budget" element={<ProtectedRoute><Dashboard onNav={onNav} toast={customToast} page="budget" /></ProtectedRoute>} />
                    <Route path="/ask-ai" element={<ProtectedRoute><Dashboard onNav={onNav} toast={customToast} page="ask-ai" /></ProtectedRoute>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
            <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: '14px', background: '#333', color: '#fff' } }} />
        </div>
    );
}
