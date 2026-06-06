import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ currentPage, onNav, user }) {
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-logo" onClick={() => onNav("home")}>My<span>Wallet</span></div>
            
            <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <ul className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}>
                <li><a onClick={() => { setMenuOpen(false); onNav("home"); }}>Home</a></li>
                <li><a onClick={() => { setMenuOpen(false); onNav("services"); }}>Services</a></li>
                <li><a onClick={() => { 
                    setMenuOpen(false);
                    if(currentPage !== "home") { 
                        onNav("home"); 
                        setTimeout(() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }), 150); 
                    } else { 
                        document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }); 
                    } 
                }}>FAQ</a></li>
                <li><a onClick={() => { setMenuOpen(false); onNav("contact"); }}>Contact</a></li>
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
