import { useState } from "react";
import { Download, Edit2, Trash2 } from "lucide-react";
import { C, CAT_COLORS } from "../constants/colors";
import { EXPENSE_CATS, INCOME_CATS } from "../constants/categories";
import { fmt } from "../utils/format";
import { useTransactions } from "../context/TransactionContext";
import { SkeletonTable } from "../components/SkeletonLoaders";

export default function Transactions({ filter, setFilter, toast, user }) {
    const { transactions: allTxs, deleteTransaction, loading } = useTransactions();
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("date");

    const filtered = allTxs
        .filter(t => filter === "all" || t.type === filter)
        .filter(t => !search || t.category.toLowerCase().includes(search.toLowerCase()) || (t.note || "").toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => sortBy === "date" ? new Date(b.date) - new Date(a.date) : b.amount - a.amount)
        .slice(0, 20);

    const handleDelete = (id) => {
        deleteTransaction(id);
        toast("Transaction deleted", "info");
    };

    const exportCSV = () => {
        const rows = [["Date", "Type", "Category", "Note", "Amount", "Currency"]];
        allTxs.forEach(t => rows.push([t.date, t.type, t.category, t.note || "", t.amount, t.currency]));
        const csv = rows.map(r => r.join(",")).join("\n");
        const a = document.createElement("a");
        a.href = "data:text/csv," + encodeURIComponent(csv);
        a.download = "mywallet_transactions.csv";
        a.click();
        toast("CSV exported successfully!", "success");
    };

    return (
        <>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <div className="filter-tabs">
                    {["all", "income", "expense"].map(f => (
                        <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)} style={{ textTransform: "capitalize" }}>{f}</button>
                    ))}
                </div>
                <input className="form-input" style={{ maxWidth: 220, padding: ".5rem 1rem" }} placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
                <select className="form-input form-select" style={{ maxWidth: 160, padding: ".5rem 1rem" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                </select>
                <button className="btn btn-outline btn-sm" onClick={exportCSV} style={{ marginLeft: "auto" }}><Download size={14} /> Export CSV</button>
            </div>

            <div className="chart-card">
                <div className="chart-title">Last 20 Transactions</div>
                {loading ? <SkeletonTable rows={6} /> : filtered.length > 0 ? (
                    <table className="tx-table">
                        <thead>
                            <tr><th>Date</th><th>Type</th><th>Category</th><th>Note</th><th>Currency</th><th style={{ textAlign: "right" }}>Amount</th><th></th></tr>
                        </thead>
                        <tbody>
                            {filtered.map(t => (
                                <tr key={t.id}>
                                    <td style={{ color: C.muted, whiteSpace: "nowrap" }}>{t.date}</td>
                                    <td><span className={`tx-badge ${t.type}`}>{t.type}</span></td>
                                    <td>
                                        <span className="tx-cat-dot" style={{ background: CAT_COLORS[[...EXPENSE_CATS, ...INCOME_CATS].indexOf(t.category) % CAT_COLORS.length] }} />
                                        {t.category}
                                    </td>
                                    <td style={{ color: C.muted, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.note || "—"}</td>
                                    <td style={{ color: C.muted }}>{t.currency}</td>
                                    <td style={{ textAlign: "right", fontWeight: 600, color: t.type === "income" ? C.success : C.danger }}>
                                        {t.type === "income" ? "+" : "-"}{fmt(t.amount, user?.currency)}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <div className="tx-actions" style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => toast("Edit functionality coming soon!", "info")} style={{ padding: ".3rem", border: "none" }} aria-label="Edit"><Edit2 size={14} /></button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)} style={{ padding: ".3rem" }} aria-label="Delete"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <div style={{ textAlign: "center", color: C.muted, padding: "3rem" }}>No transactions found.</div>}
            </div>
        </>
    );
}
