import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function Navbar({ currentPage, onNav, user }) {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <nav className="nav">
            <div className="nav-logo" onClick={() => onNav("home")}>My<span>Wallet</span></div>
            <ul className="nav-links">
                <li><a onClick={() => onNav("home")}>Home</a></li>
                <li><a onClick={() => onNav("services")}>Services</a></li>
                <li><a onClick={() => { 
                    if(currentPage !== "home") { 
                        onNav("home"); 
                        setTimeout(() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }), 150); 
                    } else { 
                        document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }); 
                    } 
                }}>FAQ</a></li>
                <li><a onClick={() => onNav("contact")}>Contact</a></li>
            </ul>
            <div className="nav-cta">
                <button className="btn btn-outline" style={{ padding: ".4rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={toggleTheme} aria-label="Toggle dark mode">
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                {user ? (
                    <button className="btn btn-primary" onClick={() => onNav("dashboard")}>Dashboard →</button>
                ) : (
                    <>
                        <button className="btn btn-outline" onClick={() => onNav("signin")}>Sign In</button>
                        <button className="btn btn-primary" onClick={() => onNav("signup")}>Get Started</button>
                    </>
                )}
            </div>
        </nav>
    );
}
