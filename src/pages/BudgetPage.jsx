import { useState } from "react";
import { C, CAT_COLORS } from "../constants/colors";
import { fmt } from "../utils/format";
import { CURRENCY_SYMBOLS } from "../utils/currency";

import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../context/TransactionContext";

export default function BudgetPage({ totalExpense, budgetUsedPct, toast }) {
    const { user, updateUser } = useAuth();
    const { transactions: allTxs } = useTransactions();
    const [budget, setBudget] = useState(user.budget?.total || 30000);
    const [alerts, setAlerts] = useState(user.budget?.alerts !== false);

    const save = async () => {
        try {
            await updateUser({ budget: { total: +budget, alerts } });
            toast("Budget settings saved!", "success");
        } catch (err) {
            toast("Failed to save budget settings", "error");
        }
    };

    const catExpenses = {};
    allTxs.filter(t => t.type === "expense").forEach(t => {
        catExpenses[t.category] = (catExpenses[t.category] || 0) + t.amount;
    });

    return (
        <>
            <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.1rem", color: C.dark, fontWeight: 700 }}>Budget & Alert Settings</h3>
                <p style={{ color: C.muted, fontSize: ".85rem" }}>Manage your monthly budget limits</p>
            </div>

            <div className="dash-grid-2">
                <div className="chart-card">
                    <div className="chart-title">Monthly Budget</div>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
                            <span style={{ color: C.muted, fontSize: ".85rem" }}>Spent</span>
                            <span style={{ fontWeight: 700, color: budgetUsedPct >= 80 ? C.danger : C.primary }}>{budgetUsedPct}%</span>
                        </div>
                        <div className="budget-bar">
                            <div className="budget-fill" style={{ width: `${budgetUsedPct}%`, background: budgetUsedPct >= 80 ? `linear-gradient(90deg,${C.warning},${C.danger})` : `linear-gradient(90deg,${C.primary},${C.accent})` }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: ".5rem", fontSize: ".8rem", color: C.muted }}>
                            <span>{fmt(totalExpense, user?.currency)} spent</span>
                            <span>{fmt((user.budget?.total || 30000) - totalExpense, user?.currency)} remaining</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Monthly Budget Limit ({CURRENCY_SYMBOLS[user?.currency] || user?.currency || "BDT"})</label>
                        <input className="form-input" type="number" value={budget} onChange={e => setBudget(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1.25rem" }}>
                        <input type="checkbox" id="alerts" checked={alerts} onChange={e => setAlerts(e.target.checked)} style={{ width: 16, height: 16, accentColor: C.primary }} />
                        <label htmlFor="alerts" style={{ fontSize: ".9rem", color: C.text, cursor: "pointer" }}>Enable budget overspend alerts</label>
                    </div>
                    <button className="btn btn-primary" onClick={save}>Save Budget Settings</button>
                </div>

                <div className="chart-card">
                    <div className="chart-title">Spending by Category</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: ".75rem", maxHeight: 340, overflowY: "auto" }}>
                        {Object.entries(catExpenses).sort((a, b) => b[1] - a[1]).map(([cat, amt], i) => {
                            const pct = Math.round((amt / (user.budget?.total || 30000)) * 100);
                            return (
                                <div key={cat}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", marginBottom: ".3rem" }}>
                                        <span style={{ color: C.text, fontWeight: 500 }}>{cat}</span>
                                        <span style={{ color: C.muted }}>{fmt(amt, user?.currency)} ({pct}%)</span>
                                    </div>
                                    <div className="budget-bar" style={{ height: 8 }}>
                                        <div className="budget-fill" style={{ width: `${Math.min(100, pct)}%`, background: `linear-gradient(90deg,${CAT_COLORS[i % CAT_COLORS.length]},${CAT_COLORS[(i + 1) % CAT_COLORS.length]})` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
