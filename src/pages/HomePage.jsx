import { useState } from "react";
import { BarChart3, Wallet, Target, Globe, BellRing, Download, Rocket, Twitter, Facebook, Linkedin, Youtube } from "lucide-react";
import { C } from "../constants/colors";

export default function HomePage({ onNav }) {
    const [openFaq, setOpenFaq] = useState(null);
    const [pricingTab, setPricingTab] = useState("monthly");

    const handleFooterLink = (e, l) => {
        e.preventDefault();
        const map = {
            "Features": () => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }),
            "Pricing": () => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }),
            "About": () => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" }),
            "FAQ": () => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }),
            "Contact": () => onNav("contact"),
            "Help Center": () => onNav("contact"),
            "Report Bug": () => onNav("contact"),
        };
        
        if (map[l]) {
            map[l]();
        } else {
            // Since we don't have these pages yet, just go to top
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const features = [
        { icon: <BarChart3 size={24} />, title: "Smart Analytics", desc: "Visualize your income vs expenses with beautiful, interactive charts and trend analysis.", bg: "#efe5fe" },
        { icon: <Wallet size={24} />, title: "Budget Control", desc: "Set monthly limits per category and get real-time alerts before you overspend.", bg: "#fce7f3" },
        { icon: <Target size={24} />, title: "Savings Goals", desc: "Define financial goals, track milestones, and celebrate every achievement.", bg: "#e0f2fe" },
        { icon: <Globe size={24} />, title: "Multi-Currency", desc: "Track transactions in BDT, USD, EUR and more with live conversion rates.", bg: "#fef3c7" },
        { icon: <BellRing size={24} />, title: "Smart Alerts", desc: "Never miss a budget breach. Instant notifications for overspending patterns.", bg: "#f0fdf4" },
        { icon: <Download size={24} />, title: "Export Reports", desc: "Download monthly and yearly financial reports in CSV format anytime.", bg: "#fdf4ff" },
    ];

    const faqs = [
        { q: "Is my financial data secure?", a: "Absolutely. We use AES-256 encryption for all stored data, bcrypt password hashing, and enforce HTTPS across all connections. Your data is never sold to third parties." },
        { q: "Can I use My Wallet for free?", a: "Yes! Our Starter plan is completely free with up to 50 transactions per month, basic analytics, and budget tracking for up to 3 categories." },
        { q: "How does multi-currency work?", a: "My Wallet integrates live exchange rate APIs. Simply select your transaction currency and the system auto-converts to your base currency (BDT by default) for unified reporting." },
        { q: "Can I export my transaction history?", a: "Pro and Lifetime plan users can export full transaction history, monthly summaries, and category breakdowns as CSV files at any time." },
        { q: "Is there a mobile app?", a: "Our progressive web app works seamlessly on mobile browsers. A dedicated Android & iOS app is on our Q3 2026 roadmap." },
        { q: "What happens to my data if I cancel?", a: "You own your data. On cancellation you can export everything before your account is deactivated. Data is permanently deleted after 90 days." },
    ];

    const plans = {
        monthly: [
            { name: "Starter", price: "Free", period: "forever", features: ["50 transactions/month", "3 categories", "Basic dashboard", "Budget alerts", "Email support"], popular: false },
            { name: "Pro", price: "৳299", period: "/month", features: ["Unlimited transactions", "All categories", "Advanced analytics", "Savings goals", "CSV export", "Priority support"], popular: true },
            { name: "Business", price: "৳799", period: "/month", features: ["Everything in Pro", "5 user accounts", "Team budgets", "API access", "Custom categories", "24/7 support"], popular: false },
        ],
        yearly: [
            { name: "Starter", price: "Free", period: "forever", features: ["50 transactions/month", "3 categories", "Basic dashboard", "Budget alerts", "Email support"], popular: false },
            { name: "Pro", price: "৳2,499", period: "/year (save 30%)", features: ["Unlimited transactions", "All categories", "Advanced analytics", "Savings goals", "CSV export", "Priority support"], popular: true },
            { name: "Business", price: "৳6,499", period: "/year (save 32%)", features: ["Everything in Pro", "5 user accounts", "Team budgets", "API access", "Custom categories", "24/7 support"], popular: false },
        ],
        lifetime: [
            { name: "Starter", price: "৳999", period: "one-time", features: ["50 transactions/month", "3 categories", "Basic dashboard", "Budget alerts", "Email support"], popular: false },
            { name: "Pro", price: "৳4,999", period: "one-time", features: ["Unlimited transactions", "All categories", "Advanced analytics", "Savings goals", "CSV export", "Priority support"], popular: true },
            { name: "Business", price: "৳11,999", period: "one-time", features: ["Everything in Pro", "5 user accounts", "Team budgets", "API access", "Custom categories", "24/7 support"], popular: false },
        ],
    };

    const testimonials = [
        { stars: "★★★★★", text: "My Wallet transformed how I manage my salary. The budget alerts literally saved me from overspending three months in a row.", name: "Rahim Chowdhury", role: "Software Engineer, Dhaka", color: "#45298d" },
        { stars: "★★★★★", text: "As a freelancer with irregular income, the analytics page showing income trends is absolutely indispensable for my planning.", name: "Sumaiya Akter", role: "Graphic Designer, Chittagong", color: "#de98c9" },
        { stars: "★★★★☆", text: "Clean interface, powerful features. I especially love the savings goals — finally hit my Eid shopping goal last year!", name: "Tanvir Hossain", role: "University Student, BUET", color: "#7b5cbf" },
    ];

    const barHeights = [40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95];

    return (
        <div>
            {/* HERO */}
            <section className="hero" id="home">
                <div className="hero-content">
                    <div>
                        <div className="hero-badge"><Rocket size={16} /> Smart Personal Finance</div>
                        <h1 className="hero-title">Take Control of Your <em>Money</em></h1>
                        <p className="hero-sub">My Wallet gives you a crystal-clear picture of your finances — track income, manage budgets, hit savings goals, and make data-driven decisions.</p>
                        <div className="hero-actions">
                            <button className="btn btn-pink btn-lg" onClick={() => onNav("signup")}>Start Free Today</button>
                            <button className="btn btn-outline btn-lg" style={{ color: "#fff", borderColor: "rgba(255,255,255,.4)" }} onClick={() => onNav("services")}>View Plans</button>
                        </div>
                        <p style={{ color: "rgba(239,229,254,.5)", fontSize: ".8rem", marginTop: "1.25rem" }}>No credit card required · Free forever plan available</p>
                    </div>
                    <div className="hero-card">
                        <div style={{ marginBottom: "1rem" }}>
                            <div style={{ fontSize: ".78rem", color: "rgba(239,229,254,.6)", marginBottom: ".25rem" }}>MONTHLY OVERVIEW</div>
                            <div style={{ fontFamily: "Inter,sans-serif", fontSize: "1.8rem", fontWeight: 800 }}>৳ 42,850</div>
                            <div style={{ fontSize: ".78rem", color: "#4ade80" }}>↑ 12.4% vs last month</div>
                        </div>
                        {[
                            { label: "Total Income", value: "৳68,000", change: "+8%", color: "#4ade80" },
                            { label: "Total Expenses", value: "৳25,150", change: "-3.2%", color: "#fb923c" },
                            { label: "Savings Rate", value: "63%", change: "+5.1%", color: "#a78bfa" },
                        ].map(s => (
                            <div key={s.label} className="hero-stat">
                                <span className="hero-stat-label">{s.label}</span>
                                <span className="hero-stat-value">{s.value}</span>
                                <span className="hero-stat-change" style={{ color: s.color }}>{s.change}</span>
                            </div>
                        ))}
                        <div className="hero-mini-chart">
                            {barHeights.map((h, i) => (
                                <div key={i} className="hero-bar" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="section" id="about">
                <div className="container">
                    <div className="section-center">
                        <div className="section-tag">Why My Wallet?</div>
                        <h2 className="section-title">Everything You Need to <span>Master Your Finances</span></h2>
                        <p className="section-sub">Built for students, professionals, and families across Bangladesh who want real control — not just another spreadsheet.</p>
                    </div>
                    <div className="features-grid">
                        {features.map(f => (
                            <div key={f.title} className="feature-card reveal">
                                <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                                <div className="feature-title">{f.title}</div>
                                <div className="feature-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICES / PRICING */}
            <section className="section" id="services" style={{ background: "linear-gradient(180deg,#faf7ff,var(--light))" }}>
                <div className="container">
                    <div className="section-center">
                        <div className="section-tag">Pricing</div>
                        <h2 className="section-title">Plans That <span>Fit Your Life</span></h2>
                        <p className="section-sub">Start free, upgrade when you're ready. No hidden fees, cancel anytime.</p>
                        <div style={{ display: "inline-flex", gap: ".5rem", background: "#fff", padding: ".4rem", borderRadius: "12px", marginTop: "1.5rem", boxShadow: "0 2px 12px rgba(69,41,141,.08)" }}>
                            {["monthly", "yearly", "lifetime"].map(t => (
                                <button key={t} className={`filter-tab ${pricingTab === t ? "active" : ""}`} onClick={() => setPricingTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="pricing-grid">
                        {plans[pricingTab].map(p => (
                            <div key={p.name} className={`pricing-card reveal ${p.popular ? "popular" : ""}`}>
                                {p.popular && <div className="pricing-badge">⭐ Most Popular</div>}
                                <div className="pricing-plan">{p.name}</div>
                                <div className="pricing-price">{p.price}</div>
                                <div className="pricing-period">{p.period}</div>
                                <ul className="pricing-features">
                                    {p.features.map(f => <li key={f}>{f}</li>)}
                                </ul>
                                <button className={`btn btn-lg ${p.popular ? "btn-pink" : "btn-outline"}`} style={{ width: "100%", justifyContent: "center" }} onClick={() => onNav("signup")}>
                                    {p.price === "Free" ? "Get Started" : "Choose Plan"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="section">
                <div className="container">
                    <div className="section-center">
                        <div className="section-tag">Testimonials</div>
                        <h2 className="section-title">Loved by <span>Thousands</span></h2>
                    </div>
                    <div className="testimonials-grid">
                        {testimonials.map(t => (
                            <div key={t.name} className="testimonial-card reveal">
                                <div className="testimonial-stars">{t.stars}</div>
                                <p className="testimonial-text">"{t.text}"</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar" style={{ background: t.color }}>{t.name[0]}</div>
                                    <div>
                                        <div className="testimonial-name">{t.name}</div>
                                        <div className="testimonial-role">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="section" id="faq" style={{ background: "var(--light)" }}>
                <div className="container">
                    <div className="section-center">
                        <div className="section-tag">FAQ</div>
                        <h2 className="section-title">Common <span>Questions</span></h2>
                    </div>
                    <div className="faq-list">
                        {faqs.map((f, i) => (
                            <div key={i} className="faq-item">
                                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    {f.q}
                                    <span className="faq-chevron" style={{ transform: openFaq === i ? "rotate(180deg)" : "none" }}>▾</span>
                                </div>
                                <div className={`faq-a ${openFaq === i ? "open" : ""}`}>
                                    <div className="faq-a-inner">{f.a}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section" style={{ background: "linear-gradient(135deg,#1a0f3c,#45298d)", textAlign: "center" }}>
                <div className="container">
                    <div style={{ color: "#fff" }}>
                        <h2 style={{ fontSize: "2.5rem", fontFamily: "Inter,sans-serif", fontWeight: 800, marginBottom: "1rem" }}>Ready to Own Your Finances?</h2>
                        <p style={{ color: "rgba(239,229,254,.7)", maxWidth: "520px", margin: "0 auto 2rem", lineHeight: 1.7 }}>Join thousands of users who made smarter financial decisions with My Wallet. Start for free today.</p>
                        <button className="btn btn-pink btn-lg" onClick={() => onNav("signup")}>Create Free Account →</button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-grid">
                    <div>
                        <div className="footer-logo">My<span>Wallet</span></div>
                        <p className="footer-desc">A smart personal finance management system built for the people of Bangladesh. Track, budget, and grow your wealth.</p>
                        <div style={{ display: "flex", gap: ".75rem" }}>
                            {[
                                { Icon: Twitter, url: "https://twitter.com/mywallet" },
                                { Icon: Facebook, url: "https://facebook.com/mywallet" },
                                { Icon: Linkedin, url: "https://linkedin.com/company/mywallet" },
                                { Icon: Youtube, url: "https://youtube.com/mywallet" }
                            ].map(({ Icon, url }, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" aria-label="social link" style={{ width: 34, height: 34, borderRadius: "10px", background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: ".2s", textDecoration: "none" }} onMouseOver={(e) => {e.currentTarget.style.background='rgba(255,255,255,.2)'; e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={(e) => {e.currentTarget.style.background='rgba(255,255,255,.1)'; e.currentTarget.style.transform='translateY(0)'}}>
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="footer-heading">Product</div>
                        <ul className="footer-links">
                            {["Features", "Pricing", "Changelog", "Roadmap"].map(l => <li key={l}><a href="#" onClick={(e) => handleFooterLink(e, l)}>{l}</a></li>)}
                        </ul>
                    </div>
                    <div>
                        <div className="footer-heading">Company</div>
                        <ul className="footer-links">
                            {["About", "Contact", "Privacy Policy", "Terms"].map(l => <li key={l}><a href="#" onClick={(e) => handleFooterLink(e, l)}>{l}</a></li>)}
                        </ul>
                    </div>
                    <div>
                        <div className="footer-heading">Support</div>
                        <ul className="footer-links">
                            {["Help Center", "FAQ", "Status", "Report Bug"].map(l => <li key={l}><a href="#" onClick={(e) => handleFooterLink(e, l)}>{l}</a></li>)}
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">© 2026 MyWallet · All rights reserved.</div>
            </footer>
        </div>
    );
}
