import { useState } from "react";
import { C } from "../constants/colors";
import { fmt } from "../utils/format";
import { useTransactions } from "../context/TransactionContext";
import { Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";

export default function GoalCard({ goal, toast }) {
    const { user } = useAuth();
    const { updateGoal, editGoal, deleteGoal } = useTransactions();
    const [isCustom, setIsCustom] = useState(false);
    const [customAmount, setCustomAmount] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: goal.name, target: goal.target, color: goal.color });
    const pct = Math.round((goal.current / goal.target) * 100);

    const addToGoal = (amount) => {
        updateGoal(goal.id, amount);
        toast("Progress updated!", "success");
    };

    const handleCustomSubmit = () => {
        const val = parseFloat(customAmount);
        if (isNaN(val) || val <= 0) {
            toast("Please enter a valid positive amount", "error");
            return;
        }
        addToGoal(val);
        setIsCustom(false);
        setCustomAmount("");
    };

    const handleEditSubmit = () => {
        if (!editData.name || editData.target <= 0) {
            toast("Please provide a valid name and target", "error");
            return;
        }
        editGoal(goal.id, editData);
        setIsEditing(false);
        toast("Goal updated!", "success");
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this goal?")) {
            deleteGoal(goal.id);
            toast("Goal deleted", "info");
        }
    };

    if (isEditing) {
        return (
            <div className="goal-card">
               <div style={{ marginBottom: "1rem" }}>
                   <label style={{ fontSize: "0.8rem", color: C.muted, display: "block", marginBottom: ".3rem" }}>Goal Name</label>
                   <input type="text" className="form-input" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
               </div>
               <div style={{ marginBottom: "1rem" }}>
                   <label style={{ fontSize: "0.8rem", color: C.muted, display: "block", marginBottom: ".3rem" }}>Target Amount</label>
                   <input type="number" className="form-input" value={editData.target} onChange={e => setEditData({...editData, target: Number(e.target.value)})} />
               </div>
               <div style={{ marginBottom: "1rem" }}>
                   <label style={{ fontSize: "0.8rem", color: C.muted, display: "block", marginBottom: ".3rem" }}>Color</label>
                   <input type="color" className="form-input" value={editData.color} onChange={e => setEditData({...editData, color: e.target.value})} style={{ padding: "0.2rem", height: "40px" }} />
               </div>
               <div style={{ display: "flex", gap: "0.5rem" }}>
                   <button className="btn btn-primary btn-sm" onClick={handleEditSubmit} style={{ flex: 1 }}>Save</button>
                   <button className="btn btn-outline btn-sm" onClick={() => { setIsEditing(false); setEditData({ name: goal.name, target: goal.target, color: goal.color }); }} style={{ flex: 1 }}>Cancel</button>
               </div>
            </div>
        );
    }

    return (
        <div className="goal-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".5rem" }}>
                <div style={{ fontWeight: 700, color: C.dark, fontSize: ".95rem" }}>{goal.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    <div style={{ fontSize: ".75rem", background: goal.color + "22", color: goal.color, padding: ".2rem .6rem", borderRadius: "50px", fontWeight: 600 }}>{pct}%</div>
                    <button onClick={() => setIsEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }} title="Edit">
                        <Edit2 size={14} />
                    </button>
                    <button onClick={handleDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", padding: 0, display: "flex" }} title="Delete">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            <div style={{ color: C.muted, fontSize: ".82rem", marginBottom: ".5rem" }}>{fmt(goal.current, user?.currency)} of {fmt(goal.target, user?.currency)}</div>
            <div className="goal-progress-bar">
                <div className="goal-progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${goal.color},${C.accent})` }} />
            </div>
            <div className="goal-pct">{fmt(goal.target - goal.current, user?.currency)} remaining</div>
            {pct < 100 && (
                <div style={{ marginTop: ".75rem" }}>
                    {!isCustom ? (
                        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                            {[500, 1000, 5000].map(a => (
                                <button key={a} className="btn btn-outline btn-sm" onClick={() => addToGoal(a)}>+{a}</button>
                            ))}
                            <button className="btn btn-outline btn-sm" style={{ borderColor: goal.color, color: goal.color }} onClick={() => setIsCustom(true)}>+ Custom</button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: ".35rem", alignItems: "center" }}>
                            <div style={{ position: "relative", flex: 1 }}>
                                <span style={{ position: "absolute", left: ".6rem", top: "50%", transform: "translateY(-50%)", fontSize: ".8rem", color: C.muted }}>{CURRENCY_SYMBOLS[user?.currency] || user?.currency || "BDT"}</span>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Amount"
                                    value={customAmount}
                                    onChange={e => setCustomAmount(e.target.value)}
                                    style={{
                                        padding: ".3rem .5rem .3rem 1.3rem",
                                        fontSize: ".82rem",
                                        borderRadius: "8px",
                                        height: "28px"
                                    }}
                                    onKeyDown={e => e.key === "Enter" && handleCustomSubmit()}
                                    autoFocus
                                />
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={handleCustomSubmit} style={{ padding: ".3rem .6rem", height: "28px", borderRadius: "8px", justifyContent: "center" }}>Add</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { setIsCustom(false); setCustomAmount(""); }} style={{ padding: ".3rem .6rem", height: "28px", borderRadius: "8px", justifyContent: "center", background: "#fee2e2", color: "#ef4444" }}>✕</button>
                        </div>
                    )}
                </div>
            )}
            {pct >= 100 && <div style={{ marginTop: ".75rem", color: C.success, fontWeight: 600, fontSize: ".85rem" }}>🎉 Goal achieved!</div>}
        </div>
    );
}
