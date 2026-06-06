import { useState } from "react";
import { C } from "../constants/colors";

export default function ContactPage({ toast }) {
    const [form, setForm] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
    const [sent, setSent] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const send = () => {
        if (!form.name || !form.email || !form.message) { toast("Please fill all required fields", "error"); return; }
        setSent(true);
        toast("Message sent! We'll reply within 24 hours.", "success");
    };

    return (
        <div style={{ paddingTop: 68 }}>
            <div className="section" style={{ background: "linear-gradient(135deg,var(--light),#fff)", textAlign: "center" }}>
                <div className="container">
                    <div className="section-tag">Contact</div>
                    <h2 className="section-title">We're Here to <span>Help</span></h2>
                    <p className="section-sub">Have a question, complaint, or feature request? Reach out and our team will get back to you promptly.</p>
                </div>
            </div>

            <div className="section">
                <div className="container">
                    <div className="contact-grid">
                        <div>
                            <div className="contact-info-card">
                                <h3 style={{ fontFamily: "Inter,sans-serif", fontWeight: 700, marginBottom: "1.5rem", color: C.dark }}>Contact Information</h3>
                                {[
                                    { icon: "📧", title: "Email Support", val: "support@mywallet.com.bd", sub: "Reply within 24 hours" },
                                    { icon: "📞", title: "Phone Support", val: "+880 1700-000000", sub: "Mon–Fri, 9 AM – 6 PM" },
                                    { icon: "📍", title: "Address", val: "BUBT Campus, Mirpur-2", sub: "Dhaka-1216, Bangladesh" },
                                ].map(i => (
                                    <div key={i.title} className="contact-info-item">
                                        <div className="contact-info-icon">{i.icon}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: C.dark, fontSize: ".9rem" }}>{i.title}</div>
                                            <div style={{ color: C.text, fontSize: ".88rem" }}>{i.val}</div>
                                            <div style={{ color: C.muted, fontSize: ".78rem" }}>{i.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: "1.5rem", padding: "1.5rem", background: C.primary, borderRadius: 20 }}>
                                <div style={{ fontFamily: "Inter,sans-serif", fontWeight: 700, color: "#fff", marginBottom: ".5rem" }}>Response Time Promise</div>
                                <p style={{ color: "rgba(239,229,254,.8)", fontSize: ".88rem", lineHeight: 1.6 }}>Starter users: 48h · Pro users: 12h · Business users: 2h guaranteed response time.</p>
                            </div>
                        </div>

                        <div className="contact-form-card">
                            {sent ? (
                                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
                                    <h3 style={{ fontFamily: "Inter,sans-serif", marginBottom: ".75rem", color: C.dark }}>Message Sent!</h3>
                                    <p style={{ color: C.muted }}>Thank you for reaching out. Our team will respond to {form.email} within 24 hours.</p>
                                    <button className="btn btn-outline" style={{ marginTop: "1.5rem" }} onClick={() => setSent(false)}>Send Another</button>
                                </div>
                            ) : (
                                <>
                                    <h3 style={{ fontFamily: "Inter,sans-serif", fontWeight: 700, marginBottom: "1.5rem", color: C.dark }}>Send us a Message</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Your Name *</label>
                                            <input className="form-input" placeholder="Full name" value={form.name} onChange={e => set("name", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email Address *</label>
                                            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Subject</label>
                                        <select className="form-input form-select" value={form.subject} onChange={e => set("subject", e.target.value)}>
                                            {["General Inquiry", "Technical Support", "Billing Issue", "Feature Request", "Bug Report", "Account Problem", "Other"].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Message *</label>
                                        <textarea className="form-input" rows={5} placeholder="Describe your issue or question in detail..." value={form.message} onChange={e => set("message", e.target.value)} style={{ resize: "vertical", minHeight: 120 }} />
                                    </div>
                                    <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={send}>Send Message →</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
