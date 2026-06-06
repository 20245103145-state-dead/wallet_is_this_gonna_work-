import { C } from "../constants/colors";

export default function ServicesPage({ onNav }) {
    const services = [
        { icon: "📊", title: "Transaction Management", desc: "Record income and expenses with rich categorization, notes, date-tracking, and multi-currency support.", tag: "Core" },
        { icon: "💰", title: "Budget Planning", desc: "Set monthly budgets, monitor real-time spending, and receive intelligent alerts before you overspend.", tag: "Core" },
        { icon: "🎯", title: "Savings Goals", desc: "Define up to 10 financial goals, track contributions, and celebrate milestones automatically.", tag: "Pro" },
        { icon: "📈", title: "Financial Analytics", desc: "Comprehensive charts showing income trends, expense breakdowns, and category-level insights.", tag: "Pro" },
        { icon: "💱", title: "Multi-Currency", desc: "Support for BDT, USD, EUR, GBP, AED, and INR with automatic base-currency conversion.", tag: "Pro" },
        { icon: "📥", title: "CSV Export", desc: "Download your complete transaction history and financial reports as CSV files for offline analysis.", tag: "Pro" },
        { icon: "🔔", title: "Smart Notifications", desc: "Budget alerts, milestone reminders, and spending insights delivered in real-time to your dashboard.", tag: "Core" },
        { icon: "🔐", title: "Bank-Level Security", desc: "AES-256 encryption, bcrypt password hashing, and secure session management for all accounts.", tag: "Core" },
        { icon: "📱", title: "Responsive Design", desc: "Full access on desktop, tablet, and mobile browsers with an optimized touch-friendly interface.", tag: "Core" },
    ];

    return (
        <div style={{ paddingTop: 68 }}>
            <div className="section" style={{ background: "linear-gradient(135deg,var(--light),#fff)", textAlign: "center" }}>
                <div className="container">
                    <div className="section-tag">Services</div>
                    <h2 className="section-title">All Features, <span>One Platform</span></h2>
                    <p className="section-sub">Everything you need to take complete control of your personal finances.</p>
                </div>
            </div>

            <div className="section">
                <div className="container">
                    <div className="features-grid">
                        {services.map(s => (
                            <div key={s.title} className="feature-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                    <div className="feature-icon" style={{ background: C.light, margin: 0 }}>{s.icon}</div>
                                    <span style={{ fontSize: ".72rem", fontWeight: 700, background: s.tag === "Pro" ? C.primary : C.light, color: s.tag === "Pro" ? "#fff" : C.primary, padding: ".2rem .6rem", borderRadius: "50px" }}>{s.tag}</span>
                                </div>
                                <div className="feature-title">{s.title}</div>
                                <div className="feature-desc">{s.desc}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: "center", marginTop: "3rem" }}>
                        <button className="btn btn-primary btn-lg" onClick={() => onNav("signup")}>Get Started Free →</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
