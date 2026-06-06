import { useState, useMemo } from "react";
import { Wallet, Apple, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { C } from "../constants/colors";
import { seedDemoData } from "../utils/seedData";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

export default function AuthPage({ mode, onNav, onLogin, toast }) {
    const { login, signup, loginWithGoogle, loginWithApple } = useAuth();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", remember: false });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(null); // "google" | "apple" | null

    const pwStrength = useMemo(() => {
        const pw = form.password;
        if (!pw) return 0;
        let s = 0;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        return s;
    }, [form.password]);

    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
    const strengthClass = ["", "weak", "fair", "good", "strong"];

    const validate = () => {
        const signinSchema = z.object({
            email: z.string().email("Invalid email address"),
            password: z.string().min(1, "Password is required"),
        });
        
        const signupSchema = z.object({
            name: z.string().min(2, "Name is required"),
            email: z.string().email("Invalid email address"),
            password: z.string().min(8, "Password too weak"),
            confirm: z.string(),
        }).refine((data) => data.password === data.confirm, {
            message: "Passwords do not match",
            path: ["confirm"],
        });

        try {
            if (mode === "signup") signupSchema.parse(form);
            else signinSchema.parse(form);
            return {};
        } catch (err) {
            const e = {};
            if (err.errors) {
                err.errors.forEach(error => {
                    if (!e[error.path[0]]) e[error.path[0]] = error.message;
                });
            }
            // Check pw strength manually for the specific UI feedback if we wanted
            if (mode === "signup" && pwStrength < 2) e.password = "Password too weak";
            return e;
        }
    };

    const handleOAuth = async (provider) => {
        setOauthLoading(provider);
        try {
            const firebaseUser = provider === "google" ? await loginWithGoogle() : await loginWithApple();
            // Seed demo data for brand-new OAuth users
            const { collection, addDoc, getDoc, doc } = await import("firebase/firestore");
            const { db } = await import("../utils/firebase");
            const { seedDemoData } = await import("../utils/seedData");
            const txSnap = await getDoc(doc(db, "users", firebaseUser.uid));
            const txQuery = await import("firebase/firestore").then(m =>
                m.getDocs(m.collection(db, `users/${firebaseUser.uid}/transactions`))
            );
            if (txQuery.empty) {
                const demoTxs = seedDemoData(firebaseUser.uid);
                const demoGoals = [
                    { userId: firebaseUser.uid, name: "Emergency Fund", target: 50000, current: 18000, color: "#45298d" },
                    { userId: firebaseUser.uid, name: "Eid Shopping", target: 15000, current: 8500, color: "#de98c9" },
                    { userId: firebaseUser.uid, name: "Laptop Upgrade", target: 80000, current: 22000, color: "#7b5cbf" },
                ];
                await Promise.all([
                    ...demoTxs.map(tx => addDoc(collection(db, `users/${firebaseUser.uid}/transactions`), tx)),
                    ...demoGoals.map(g => addDoc(collection(db, `users/${firebaseUser.uid}/goals`), g)),
                ]);
            }
            toast(`Welcome to MyWallet! 🎉`, "success");
            onLogin();
        } catch (err) {
            console.error("OAuth Error:", err);
            if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
                // user dismissed popup — no toast needed
            } else {
                toast(err.message || "Authentication failed. Please try again.", "error");
            }
        } finally {
            setOauthLoading(null);
        }
    };

    const handleSubmit = async () => {
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) return;
        setLoading(true);
        
        try {
            if (mode === "signup") {
                const newUser = await signup(form.email, form.password, { name: form.name });
                
                // Seed demo transactions directly to Firestore
                const demoTxs = seedDemoData(newUser.uid);
                const txPromises = demoTxs.map(tx => addDoc(collection(db, `users/${newUser.uid}/transactions`), tx));
                
                // Seed goals
                const demoGoals = [
                    { userId: newUser.uid, name: "Emergency Fund", target: 50000, current: 18000, color: "#45298d" },
                    { userId: newUser.uid, name: "Eid Shopping", target: 15000, current: 8500, color: "#de98c9" },
                    { userId: newUser.uid, name: "Laptop Upgrade", target: 80000, current: 22000, color: "#7b5cbf" },
                ];
                const goalPromises = demoGoals.map(g => addDoc(collection(db, `users/${newUser.uid}/goals`), g));
                
                await Promise.all([...txPromises, ...goalPromises]);
                
                toast("Account created! Welcome to MyWallet 🎉", "success");
                onLogin();
            } else {
                await login(form.email, form.password);
                toast("Welcome back! 👋", "success");
                onLogin();
            }
        } catch (err) {
            console.error("Auth Error:", err);
            if (err.code === "auth/email-already-in-use") setErrors({ email: "Email already registered" });
            else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") setErrors({ email: "Invalid credentials" });
            else toast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="auth-page" style={{ paddingTop: 68 }}>
            <div className="auth-left">
                <div className="auth-left-content">
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}><Wallet size={48} color="#efe5fe" /></div>
                    <h2 style={{ fontFamily: "Inter,sans-serif", fontSize: "2rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.2 }}>
                        {mode === "signup" ? "Start your financial journey today" : "Welcome back to MyWallet"}
                    </h2>
                    <p style={{ color: "rgba(239,229,254,.7)", fontSize: ".95rem", lineHeight: 1.7, marginBottom: "2rem" }}>
                        Track every taka, set meaningful goals, and build the financial future you deserve.
                    </p>
                    {[
                        "✓ No hidden fees, ever",
                        "✓ Bank-level data security",
                        "✓ Works on all devices",
                        "✓ Cancel anytime",
                    ].map(t => <div key={t} style={{ color: "rgba(239,229,254,.8)", fontSize: ".88rem", marginBottom: ".6rem" }}>{t}</div>)}
                </div>
            </div>
            <div className="auth-right">
                <div style={{ maxWidth: 420, width: "100%" }} role="form" aria-labelledby="auth-title">
                    <div style={{ marginBottom: "2rem", cursor: "pointer", color: C.muted, fontSize: ".88rem", display: "flex", alignItems: "center", gap: ".25rem" }} onClick={() => onNav("home")} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onNav("home")} aria-label="Go back to home"><ArrowLeft size={14} /> Back to home</div>
                    <h2 id="auth-title" className="auth-title">{mode === "signup" ? "Create your account" : "Sign in to MyWallet"}</h2>
                    <p className="auth-sub">{mode === "signup" ? "Fill in your details to get started" : "Enter your credentials to continue"}</p>

                    <button className="social-btn" onClick={() => handleOAuth("google")} disabled={!!oauthLoading || loading} aria-label="Sign in with Google">
                        {oauthLoading === "google" ? <span className="spinner animate-spin" style={{ width: 16, height: 16, borderWidth: 2 }} aria-hidden="true" /> : <span style={{ fontWeight: 800, color: "#ea4335" }} aria-hidden="true">G</span>}
                        Continue with Google
                    </button>
                    <button className="social-btn" onClick={() => handleOAuth("apple")} disabled={!!oauthLoading || loading} aria-label="Sign in with Apple">
                        {oauthLoading === "apple" ? <span className="spinner animate-spin" style={{ width: 16, height: 16, borderWidth: 2 }} aria-hidden="true" /> : <Apple size={18} aria-hidden="true" />}
                        Continue with Apple
                    </button>
                    <div className="divider" aria-hidden="true">or continue with email</div>

                    {mode === "signup" && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="name-input">Full Name</label>
                            <input id="name-input" className={`form-input ${errors.name ? "error" : ""}`} placeholder="John Doe" value={form.name} onChange={e => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
                            {errors.name && <div id="name-error" className="form-error" role="alert">{errors.name}</div>}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="email-input">Email Address</label>
                        <input id="email-input" className={`form-input ${errors.email ? "error" : ""}`} type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                        {errors.email && <div id="email-error" className="form-error" role="alert">{errors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password-input">Password</label>
                        <input id="password-input" className={`form-input ${errors.password ? "error" : ""}`} type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined} />
                        {mode === "signup" && form.password && (
                            <div className="strength-bar" role="progressbar" aria-valuenow={pwStrength} aria-valuemin={0} aria-valuemax={4} aria-label={`Password strength: ${strengthClass[pwStrength] || "weak"}`} style={{ marginTop: ".5rem" }}>
                                {[1, 2, 3, 4].map(i => <div key={i} className={`strength-seg ${pwStrength >= i ? "filled " + strengthClass[pwStrength] : ""}`} />)}
                            </div>
                        )}
                        {errors.password && <div id="password-error" className="form-error" role="alert">{errors.password}</div>}
                    </div>

                    {mode === "signup" && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="confirm-input">Confirm Password</label>
                            <input id="confirm-input" className={`form-input ${errors.confirm ? "error" : ""}`} type="password" placeholder="••••••••" value={form.confirm} onChange={e => set("confirm", e.target.value)} aria-invalid={!!errors.confirm} aria-describedby={errors.confirm ? "confirm-error" : undefined} />
                            {errors.confirm && <div id="confirm-error" className="form-error" role="alert">{errors.confirm}</div>}
                        </div>
                    )}

                    <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }} onClick={handleSubmit} disabled={loading}>
                        {loading ? <span className="spinner animate-spin" aria-hidden="true" /> : (mode === "signup" ? "Create Account" : "Sign In")}
                    </button>

                    <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: ".88rem", color: C.muted }}>
                        {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
                        <span style={{ color: C.primary, cursor: "pointer", fontWeight: 600 }} onClick={() => onNav(mode === "signup" ? "signin" : "signup")}>
                            {mode === "signup" ? "Sign in" : "Sign up free"}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
