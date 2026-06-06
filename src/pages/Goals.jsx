import { useState } from "react";
import { C, CAT_COLORS } from "../constants/colors";
import { useTransactions } from "../context/TransactionContext";
import GoalCard from "../components/GoalCard";
import { CURRENCY_SYMBOLS } from "../utils/currency";

export default function Goals({ toast, user }) {
    const { goals, addGoal } = useTransactions();
    const [showModal, setShowModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: "", target: "", current: "" });

    const saveGoal = () => {
        if (!newGoal.name || !newGoal.target) return;
        const g = { id: "g" + Date.now(), name: newGoal.name, target: +newGoal.target, current: +newGoal.current || 0, color: CAT_COLORS[goals.length % CAT_COLORS.length] };
        addGoal(g);
        setNewGoal({ name: "", target: "", current: "" });
        setShowModal(false);
        toast("Savings goal added!", "success");
    };

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h3 style={{ fontSize: "1.1rem", color: C.dark, fontWeight: 700 }}>Savings Goals</h3>
                    <p style={{ color: C.muted, fontSize: ".85rem" }}>Track your financial milestones</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Goal</button>
            </div>

            {goals.length === 0 && (
                <div style={{ textAlign: "center", padding: "4rem", color: C.muted }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
                    <p>No savings goals yet. Create your first one!</p>
                </div>
            )}

            <div className="goals-grid">
                {goals.map(g => <GoalCard key={g.id} goal={g} toast={toast} />)}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <div className="modal-title">New Savings Goal</div>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Goal Name</label>
                            <input className="form-input" placeholder="e.g. Emergency Fund" value={newGoal.name} onChange={e => setNewGoal(g => ({ ...g, name: e.target.value }))} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Target Amount ({CURRENCY_SYMBOLS[user?.currency] || user?.currency || "BDT"})</label>
                                <input className="form-input" type="number" placeholder="50000" value={newGoal.target} onChange={e => setNewGoal(g => ({ ...g, target: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Current Saved ({CURRENCY_SYMBOLS[user?.currency] || user?.currency || "BDT"})</label>
                                <input className="form-input" type="number" placeholder="0" value={newGoal.current} onChange={e => setNewGoal(g => ({ ...g, current: e.target.value }))} />
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={saveGoal}>Create Goal</button>
                    </div>
                </div>
            )}
        </>
    );
}
