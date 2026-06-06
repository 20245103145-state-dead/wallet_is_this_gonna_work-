import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    ArrowRightLeft, 
    LineChart, 
    Target, 
    Bell, 
    User, 
    LogOut, 
    Wallet, 
    TrendingUp, 
    TrendingDown, 
    AlertTriangle 
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { C, CAT_COLORS } from "../constants/colors";
import { EXPENSE_CATS, INCOME_CATS } from "../constants/categories";
import { fmt } from "../utils/format";
import { CURRENCY_SYMBOLS } from "../utils/currency";
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../context/TransactionContext";

import Sidebar from "../components/Sidebar";
import AddTxModal from "../components/AddTransactionModal";
import ProfileModal from "../components/ProfileModal";
import { SkeletonChart, SkeletonTable } from "../components/SkeletonLoaders";

import Transactions from "./Transactions";
import Analytics from "./Analytics";
import Goals from "./Goals";
import BudgetPage from "./BudgetPage";
import AskAI from "./AskAI";

export default function Dashboard({ onNav, toast, page }) {
    const { user, logout } = useAuth();
    const { transactions: allTxs, loading } = useTransactions();
    const navigate = useNavigate();
    
    const [activeSection, setActiveSection] = useState(page || "dashboard");
    const [showAddTx, setShowAddTx] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [profileMenu, setProfileMenu] = useState(false);
    
    // Sub-page states
    const [txFilter, setTxFilter] = useState("all");
    const [analyticsRange, setAnalyticsRange] = useState("6m");

    useEffect(() => { if (page) setActiveSection(page); }, [page]);

    const totalIncome = allTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = allTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const budget = user.budget?.total || 30000;
    const budgetUsedPct = Math.min(100, Math.round((totalExpense / budget) * 100));

    const last20 = [...allTxs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);

    // Pie data
    const expenseByCat = {};
    allTxs.filter(t => t.type === "expense").forEach(t => {
        expenseByCat[t.category] = (expenseByCat[t.category] || 0) + t.amount;
    });
    const pieData = Object.entries(expenseByCat).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value).slice(0, 8);

    // Analytics monthly data
    const monthlyData = useMemo(() => {
        const months = [];
        const now = new Date();
        const n = analyticsRange === "3m" ? 3 : analyticsRange === "6m" ? 6 : 12;
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date(now); d.setMonth(d.getMonth() - i);
            const label = d.toLocaleString("en", { month: "short", year: "2-digit" });
            const mo = d.getMonth(), yr = d.getFullYear();
            const inc = allTxs.filter(t => t.type === "income" && new Date(t.date).getMonth() === mo && new Date(t.date).getFullYear() === yr).reduce((s, t) => s + t.amount, 0);
            const exp = allTxs.filter(t => t.type === "expense" && new Date(t.date).getMonth() === mo && new Date(t.date).getFullYear() === yr).reduce((s, t) => s + t.amount, 0);
            months.push({ label, income: Math.round(inc), expense: Math.round(exp), savings: Math.round(inc - exp) });
        }
        return months;
    }, [allTxs, analyticsRange]);

    // Category trend
    const catTrend = useMemo(() => {
        const topCats = pieData.slice(0, 4).map(p => p.name);
        const now = new Date();
        return [0, 1, 2, 3, 4, 5].map(i => {
            const d = new Date(now); d.setMonth(d.getMonth() - (5 - i));
            const obj = { label: d.toLocaleString("en", { month: "short" }) };
            topCats.forEach(cat => {
                obj[cat] = Math.round(allTxs.filter(t => t.category === cat && new Date(t.date).getMonth() === d.getMonth() && new Date(t.date).getFullYear() === d.getFullYear()).reduce((s, t) => s + t.amount, 0));
            });
            return obj;
        });
    }, [allTxs]);

    const topCatNames = pieData.slice(0, 4).map(p => p.name);
    const catColors = ["#45298d", "#de98c9", "#7b5cbf", "#c96bb5"];

    const sideItems = [
        { icon: <LayoutDashboard size={18} />, label: "Dashboard", id: "dashboard" },
        { icon: <ArrowRightLeft size={18} />, label: "Transactions", id: "transactions" },
        { icon: <LineChart size={18} />, label: "Analytics", id: "analytics" },
        { icon: <Target size={18} />, label: "Savings Goals", id: "goals" },
        { icon: <Bell size={18} />, label: "Budget & Alerts", id: "budget" },
    ];

    const navTo = (id) => { 
        if (id === "profile") {
            setShowProfile(true);
        } else {
            navigate(`/${id}`);
        }
        setProfileMenu(false); 
    };

    const handleLogout = () => {
        toast("Signed out successfully.", "info");
        logout();
        navigate("/");
    };

    return (
        <div className="dash-layout" style={{ paddingTop: 0 }}>
            {/* SIDEBAR */}
            <Sidebar activeSection={activeSection} navTo={navTo} onNav={onNav} onLogout={handleLogout} />

            {/* MAIN */}
            <div className="dash-main">
                <div className="dash-header">
                    <div className="dash-title">
                        {sideItems.find(i => i.id === activeSection)?.icon} {sideItems.find(i => i.id === activeSection)?.label || "Dashboard"}
                    </div>
                    <div className="dash-header-right">
                        <button className="notif-btn" title="Notifications">
                            <Bell size={20} />
                            {budgetUsedPct >= 80 && <span className="notif-dot" />}
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowAddTx(true)}>+ Add Transaction</button>
                        <div style={{ position: "relative" }}>
                            <div className="avatar" onClick={() => setProfileMenu(m => !m)}>{(user?.name || "U")[0]}</div>
                            {profileMenu && (
                                <div className="profile-menu">
                                    <div style={{ padding: ".75rem 1rem 1rem" }}>
                                        <div style={{ fontWeight: 700, fontSize: ".9rem", color: C.dark }}>{user.name}</div>
                                        <div style={{ fontSize: ".78rem", color: C.muted }}>{user.email}</div>
                                    </div>
                                    <div className="profile-divider" />
                                    <div className="profile-menu-item" onClick={() => { setShowProfile(true); setProfileMenu(false); }}><User size={16} /> Edit Profile</div>
                                    <div className="profile-menu-item" onClick={() => navTo("budget")}><Wallet size={16} /> Budget Settings</div>
                                    <div className="profile-menu-item" onClick={() => navTo("analytics")}><LineChart size={16} /> Analytics</div>
                                    <div className="profile-divider" />
                                    <div className="profile-menu-item danger" onClick={handleLogout}><LogOut size={16} /> Sign Out</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dash-body">
                    {activeSection === "dashboard" && <DashHome last20={last20} totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} budget={budget} budgetUsedPct={budgetUsedPct} pieData={pieData} monthlyData={monthlyData} user={user} onAddTx={() => setShowAddTx(true)} toast={toast} loading={loading} />}
                    {activeSection === "transactions" && <Transactions filter={txFilter} setFilter={setTxFilter} toast={toast} user={user} />}
                    {activeSection === "analytics" && <Analytics monthlyData={monthlyData} catTrend={catTrend} topCatNames={topCatNames} catColors={catColors} pieData={pieData} range={analyticsRange} setRange={setAnalyticsRange} totalIncome={totalIncome} totalExpense={totalExpense} user={user} />}
                    {activeSection === "goals" && <Goals toast={toast} user={user} />}
                    {activeSection === "budget" && <BudgetPage totalExpense={totalExpense} budgetUsedPct={budgetUsedPct} toast={toast} />}
                    {activeSection === "ask-ai" && <AskAI />}
                </div>
            </div>

            {showAddTx && <AddTxModal onClose={() => setShowAddTx(false)} toast={toast} />}
            {showProfile && <ProfileModal onClose={() => setShowProfile(false)} toast={toast} />}
        </div>
    );
}

// ── Dashboard Home ─────────────────────────────────────────────
function DashHome({ last20, totalIncome, totalExpense, balance, budget, budgetUsedPct, pieData, monthlyData, user, onAddTx, toast, loading }) {
    const recent5 = last20.slice(0, 5);

    return (
        <>
            <div className="dash-welcome">
                <h2>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {(user?.name || "User").split(" ")[0]}! <span style={{ fontSize: "1.2em", display: "inline-block", animation: "pulse 2s infinite" }}>👋</span></h2>
                <p>Here's your financial snapshot for {new Date().toLocaleString("en-BD", { month: "long", year: "numeric" })}</p>
            </div>

            {budgetUsedPct >= 80 && (
                <div className="alert-banner">
                    <span style={{ fontSize: "1.3rem", display: "flex" }}><AlertTriangle size={24} color="#ef4444" /></span>
                    <p>You've used {budgetUsedPct}% of your monthly budget. Consider reducing discretionary spending.</p>
                </div>
            )}

            <div className="stats-grid">
                {[
                    { label: "Total Balance", value: fmt(balance, user?.currency), change: "Net position", icon: <Wallet size={24} color={balance >= 0 ? C.success : C.danger} />, color: "#efe5fe", tc: balance >= 0 ? C.success : C.danger },
                    { label: "Total Income", value: fmt(totalIncome, user?.currency), change: "This period", icon: <TrendingUp size={24} color={C.success} />, color: "#dcfce7", tc: C.success },
                    { label: "Total Expenses", value: fmt(totalExpense, user?.currency), change: "This period", icon: <TrendingDown size={24} color={C.danger} />, color: "#fee2e2", tc: C.danger },
                    { label: "Budget Used", value: `${budgetUsedPct}%`, change: `of ${fmt(budget, user?.currency)}`, icon: <Target size={24} color={budgetUsedPct >= 80 ? C.danger : C.success} />, color: "#fef3c7", tc: budgetUsedPct >= 80 ? C.danger : C.success },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-change" style={{ color: s.tc }}>{s.change}</div>
                    </div>
                ))}
            </div>

            <div className="dash-grid-3">
                <div className="chart-card">
                    <div className="chart-title">Expense Breakdown</div>
                    {loading ? <SkeletonChart /> : pieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                                        {pieData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={v => fmt(v, user?.currency)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: "flex", flexDirection: "column", gap: ".4rem", marginTop: ".75rem" }}>
                                {pieData.slice(0, 4).map((p, i) => (
                                    <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: ".8rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: CAT_COLORS[i] }} />
                                            <span style={{ color: C.muted }}>{p.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 600, color: C.dark }}>{fmt(p.value, user?.currency)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : <div style={{ textAlign: "center", color: C.muted, padding: "2rem" }}>No expense data yet</div>}
                </div>

                <div className="chart-card">
                    <div className="chart-title">Income vs Expenses</div>
                    {loading ? <SkeletonChart /> : (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={C.success} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={C.success} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={C.danger} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={C.danger} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(69,41,141,.06)" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} />
                            <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={v => (CURRENCY_SYMBOLS[user?.currency] || user?.currency || "BDT") + (v / 1000).toFixed(0) + "k"} />
                            <Tooltip formatter={v => fmt(v, user?.currency)} />
                            <Legend />
                            <Area type="monotone" dataKey="income" stroke={C.success} fill="url(#inc)" strokeWidth={2} name="Income" />
                            <Area type="monotone" dataKey="expense" stroke={C.danger} fill="url(#exp)" strokeWidth={2} name="Expense" />
                        </AreaChart>
                    </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="chart-card" style={{ marginBottom: "2rem" }}>
                <div className="chart-title">
                    Recent Transactions
                    <button className="btn btn-sm btn-outline" onClick={onAddTx}>+ Add</button>
                </div>
                {loading ? <SkeletonTable rows={5} /> : recent5.length > 0 ? (
                    <table className="tx-table">
                        <thead>
                            <tr>
                                <th>Date</th><th>Category</th><th>Note</th><th>Type</th><th style={{ textAlign: "right" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent5.map(t => (
                                <tr key={t.id}>
                                    <td style={{ color: C.muted, whiteSpace: "nowrap" }}>{t.date}</td>
                                    <td>
                                        <span className="tx-cat-dot" style={{ background: CAT_COLORS[([...EXPENSE_CATS, ...INCOME_CATS].indexOf(t.category)) % CAT_COLORS.length] }} />
                                        {t.category}
                                    </td>
                                    <td style={{ color: C.muted }}>{t.note || "—"}</td>
                                    <td><span className={`tx-badge ${t.type}`}>{t.type}</span></td>
                                    <td style={{ textAlign: "right", fontWeight: 600, color: t.type === "income" ? C.success : C.danger }}>
                                        {t.type === "income" ? "+" : "-"}{fmt(t.amount, user?.currency)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <div style={{ textAlign: "center", color: C.muted, padding: "2rem" }}>No transactions yet. Add your first one!</div>}
            </div>
        </>
    );
}
