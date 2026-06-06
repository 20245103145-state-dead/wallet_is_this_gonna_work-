import { 
    LayoutDashboard, 
    ArrowRightLeft, 
    LineChart, 
    Target, 
    Bell, 
    Sparkles, 
    User, 
    MessageSquare, 
    LogOut,
    PanelLeft
} from "lucide-react";
import { useState } from "react";

export default function Sidebar({ activeSection, navTo, onNav, onLogout }) {
    const [collapsed, setCollapsed] = useState(false);

    const sideItems = [
        { icon: <LayoutDashboard size={18} />, label: "Dashboard", id: "dashboard" },
        { icon: <ArrowRightLeft size={18} />, label: "Transactions", id: "transactions" },
        { icon: <LineChart size={18} />, label: "Analytics", id: "analytics" },
        { icon: <Target size={18} />, label: "Savings Goals", id: "goals" },
        { icon: <Bell size={18} />, label: "Budget & Alerts", id: "budget" },
        { icon: <Sparkles size={18} />, label: "Ask AI", id: "ask-ai" },
    ];

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar">
                <PanelLeft size={18} />
            </button>
            <div className="sidebar-logo" onClick={() => onNav("home")}>My<span>Wallet</span></div>
            <div className="sidebar-section">Main</div>
            {sideItems.map(i => (
                <div key={i.id} className={`sidebar-item ${activeSection === i.id ? "active" : ""}`} onClick={() => navTo(i.id)}>
                    <span className="icon">{i.icon}</span><span className="sidebar-item-label">{i.label}</span>
                </div>
            ))}
            <div className="sidebar-section">Account</div>
            <div className="sidebar-item" onClick={() => navTo("profile")}>
                <span className="icon"><User size={18} /></span><span className="sidebar-item-label">Profile Settings</span>
            </div>
            <div className="sidebar-item" onClick={() => onNav("contact")}>
                <span className="icon"><MessageSquare size={18} /></span><span className="sidebar-item-label">Support</span>
            </div>
            <div className="sidebar-bottom">
                <div className="sidebar-item" onClick={onLogout} style={{ color: "#f87171" }}>
                    <span className="icon"><LogOut size={18} /></span><span className="sidebar-item-label">Sign Out</span>
                </div>
            </div>
        </div>
    );
}
