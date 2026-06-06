import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, PiggyBank, Target } from "lucide-react";
import { C, CAT_COLORS } from "../constants/colors";
import { fmt } from "../utils/format";
import { CURRENCY_SYMBOLS } from "../utils/currency";
import { useCountUp } from "../hooks/useCountUp";

export default function Analytics({ monthlyData, catTrend, topCatNames, catColors, pieData, range, setRange, totalIncome, totalExpense, user }) {
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    const animIncome = useCountUp(totalIncome);
    const animExpense = useCountUp(totalExpense);
    const animSavings = useCountUp(totalIncome - totalExpense);
    const animRate = useCountUp(savingsRate);

    return (
        <>
            <div className="analytics-header">
                <div>
                    <h3 style={{ fontSize: "1.1rem", color: C.dark, fontWeight: 700 }}>Financial Analytics</h3>
                    <p style={{ color: C.muted, fontSize: ".85rem" }}>Deep insights into your financial patterns</p>
                </div>
                <div className="filter-tabs">
                    {["3m", "6m", "1y"].map(r => (
                        <button key={r} className={`filter-tab ${range === r ? "active" : ""}`} onClick={() => setRange(r)}>{r.toUpperCase()}</button>
                    ))}
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: "2rem" }}>
                {[
                    { label: "Total Income", value: fmt(animIncome, user?.currency), icon: <TrendingUp size={24} color={C.success} />, color: "#dcfce7" },
                    { label: "Total Expense", value: fmt(animExpense, user?.currency), icon: <TrendingDown size={24} color={C.danger} />, color: "#fee2e2" },
                    { label: "Net Savings", value: fmt(animSavings, user?.currency), icon: <PiggyBank size={24} color={C.primary} />, color: "#efe5fe" },
                    { label: "Savings Rate", value: `${animRate}%`, icon: <Target size={24} color="#b45309" />, color: "#fef3c7" },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value" style={{ fontSize: "1.3rem" }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="chart-card" style={{ marginBottom: "1.5rem" }}>
                <div className="chart-title">Income vs Expenses vs Savings — Monthly Trend</div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(69,41,141,.06)" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} />
                        <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={v => (CURRENCY_SYMBOLS[user?.currency] || user?.currency || "BDT") + (v / 1000).toFixed(0) + "k"} />
                        <Tooltip formatter={v => fmt(v, user?.currency)} />
                        <Legend />
                        <Bar dataKey="income" fill={C.success} name="Income" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill={C.danger} name="Expense" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="savings" fill={C.primary} name="Savings" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="dash-grid-2">
                <div className="chart-card">
                    <div className="chart-title">Category Spending Trend</div>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={catTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(69,41,141,.06)" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} />
                            <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={v => (CURRENCY_SYMBOLS[user?.currency] || user?.currency || "BDT") + (v / 1000).toFixed(0) + "k"} />
                            <Tooltip formatter={v => fmt(v, user?.currency)} />
                            <Legend />
                            {topCatNames.map((cat, i) => (
                                <Line key={cat} type="monotone" dataKey={cat} stroke={catColors[i]} strokeWidth={2} dot={{ r: 3 }} name={cat} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <div className="chart-title">Expense Distribution</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                                {pieData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={v => fmt(v, user?.currency)} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexDirection: "column", gap: ".35rem", marginTop: ".5rem" }}>
                        {pieData.slice(0, 5).map((p, i) => (
                            <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: ".78rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[i] }} />
                                    <span style={{ color: C.muted }}>{p.name}</span>
                                </div>
                                <span style={{ fontWeight: 600 }}>{fmt(p.value, user?.currency)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
