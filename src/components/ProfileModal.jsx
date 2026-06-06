import { useState } from "react";
import { C } from "../constants/colors";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "../utils/firebase";

export default function ProfileModal({ onClose, toast }) {
    const { user, updateUser } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const [form, setForm] = useState({ name: user.name, email: user.email, currency: user.currency || "BDT", currentPw: "", newPw: "" });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const save = async () => {
        try {
            if (form.newPw) {
                if (!form.currentPw) {
                    toast("Please enter current password to change it", "error");
                    return;
                }
                const cred = EmailAuthProvider.credential(user.email, form.currentPw);
                await reauthenticateWithCredential(auth.currentUser, cred);
                await updatePassword(auth.currentUser, form.newPw);
            }
            await updateUser({ name: form.name, email: form.email, currency: form.currency });
            toast("Profile updated successfully!", "success");
            onClose();
        } catch (err) {
            console.error(err);
            toast(err.message, "error");
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <div className="modal-title">Edit Profile</div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                    <div className="avatar" style={{ width: 72, height: 72, fontSize: "2rem", border: "3px solid var(--light)" }}>{form.name[0]}</div>
                </div>
                <div className="profile-modal-grid">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Preferred Currency</label>
                    <select className="form-input form-select" value={form.currency} onChange={e => set("currency", e.target.value)}>
                        {["BDT", "USD", "EUR", "GBP", "AED", "INR"].map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>

                {/* THEME TOGGLE */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: ".9rem 1rem",
                    borderRadius: "14px",
                    background: "var(--light)",
                    marginBottom: "1rem",
                    border: "1px solid var(--border, rgba(79,53,168,0.12))",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".65rem" }}>
                        <span style={{ fontSize: "1.2rem" }}>{isDark ? "🌙" : "☀️"}</span>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: ".88rem", color: "var(--text)" }}>
                                {isDark ? "Dark Mode" : "Light Mode"}
                            </div>
                            <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>
                                {isDark ? "Easy on the eyes at night" : "Clean and bright interface"}
                            </div>
                        </div>
                    </div>
                    {/* Pill switch */}
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        style={{
                            width: 52, height: 28, borderRadius: 999, border: "none",
                            cursor: "pointer", position: "relative", flexShrink: 0,
                            background: isDark ? "var(--primary)" : "rgba(0,0,0,0.15)",
                            transition: "background .3s",
                            boxShadow: isDark ? "0 0 0 3px rgba(155,126,248,0.25)" : "none",
                        }}
                    >
                        <span style={{
                            position: "absolute", top: 3,
                            left: isDark ? 26 : 3,
                            width: 22, height: 22, borderRadius: "50%",
                            background: "#fff",
                            transition: "left .25s cubic-bezier(.4,0,.2,1)",
                            boxShadow: "0 1px 4px rgba(0,0,0,.25)",
                            display: "block",
                        }} />
                    </button>
                </div>

                <div style={{ borderTop: "1px solid var(--border, rgba(79,53,168,0.12))", paddingTop: "1rem", marginTop: ".5rem" }}>
                    <div style={{ fontSize: ".85rem", fontWeight: 600, color: "var(--text)", marginBottom: ".75rem" }}>Change Password (optional)</div>
                    <div className="profile-modal-grid">
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input className="form-input" type="password" placeholder="Current password" value={form.currentPw} onChange={e => set("currentPw", e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input className="form-input" type="password" placeholder="New password" value={form.newPw} onChange={e => set("newPw", e.target.value)} />
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={save}>Save Changes</button>
            </div>
        </div>
    );
}
