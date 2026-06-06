import { useState } from "react";
import { C } from "../constants/colors";
import { useAuth } from "../context/AuthContext";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "../utils/firebase";

export default function ProfileModal({ onClose, toast }) {
    const { user, updateUser } = useAuth();
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
                    <div className="avatar" style={{ width: 72, height: 72, fontSize: "2rem", border: "3px solid " + C.light }}>{form.name[0]}</div>
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
                <div style={{ borderTop: "1px solid rgba(69,41,141,.1)", paddingTop: "1rem", marginTop: ".5rem" }}>
                    <div style={{ fontSize: ".85rem", fontWeight: 600, color: C.text, marginBottom: ".75rem" }}>Change Password (optional)</div>
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
