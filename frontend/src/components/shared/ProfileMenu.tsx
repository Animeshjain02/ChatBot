import { useState, useRef, useEffect } from "react";
import { useAuth, useLanguage, useTheme } from "../../context/context";
import { IoPersonCircleOutline, IoLogOutOutline, IoChevronDown, IoChevronUp, IoLanguageOutline, IoMoon, IoSunny } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";

const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "hi", label: "Hindi", flag: "🇮🇳" },
];

const ProfileMenu = () => {
    const auth = useAuth();
    const langContext = useLanguage();
    const { theme, toggleTheme } = useTheme() || { theme: "light", toggleTheme: () => { } };
    const [isOpen, setIsOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // @ts-ignore
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsLangOpen(false); // Reset lang menu too
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        if (auth?.logout) {
            await auth.logout();
        }
    };

    const setLanguage = (code: string) => {
        langContext?.setLang(code);
        setIsOpen(false);
        setIsLangOpen(false);
    }

    const currentLang = languages.find(l => l.code === (langContext?.lang || 'en')) || languages[0];

    return (
        <div style={{ position: "relative" }} ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "var(--card-bg)",
                    border: isOpen ? "1px solid var(--primary-color)" : "1px solid var(--border-color)",
                    borderRadius: "99px",
                    padding: "6px 16px 6px 8px",
                    cursor: "pointer",
                    boxShadow: isOpen ? "0 0 0 3px rgba(2, 132, 199, 0.15)" : "var(--shadow-sm)",
                    color: "var(--text-color)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    outline: "none",
                    transition: "all 0.2s"
                }}
            >
                <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--primary-color), var(--primary-hover))",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                    {auth?.user?.name ? auth.user.name[0].toUpperCase() : <IoPersonCircleOutline />}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Hello,</span>
                    <span style={{ maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {auth?.user?.name || "User"}
                    </span>
                </div>
                <IoChevronDown style={{ marginLeft: "4px", color: "var(--text-secondary)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            top: "125%",
                            right: 0,
                            width: "280px",
                            background: "var(--card-bg)",
                            borderRadius: "16px",
                            boxShadow: "var(--shadow-lg)",
                            border: "1px solid var(--border-color)",
                            padding: "8px",
                            zIndex: 1000,
                            overflow: "hidden"
                        }}
                    >
                        <div style={{ padding: "16px", borderBottom: "1px solid var(--border-color)", background: "linear-gradient(to right, var(--bg-color), var(--card-bg))", margin: "-8px -8px 8px -8px" }}>
                            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--primary-color)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Authenticated</p>
                            <p style={{ margin: "4px 0 0 0", fontWeight: 700, color: "var(--text-color)", fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={auth?.user?.email}>{auth?.user?.email}</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 12px",
                                    borderRadius: "8px",
                                    border: "1px solid transparent",
                                    background: "transparent",
                                    color: "var(--text-color)",
                                    fontSize: "0.95rem",
                                    fontWeight: 500,
                                    cursor: "pointer"
                                }}
                                onMouseOver={e => e.currentTarget.style.background = "var(--bg-color)"}
                                onMouseOut={e => e.currentTarget.style.background = "transparent"}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    {theme === 'dark' ? <IoMoon size={18} color="var(--primary-color)" /> : <IoSunny size={18} color="#eab308" />}
                                    <span>Appearance: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                                </div>
                                <div style={{
                                    width: "36px", height: "20px", background: theme === 'dark' ? "var(--primary-color)" : "#cbd5e1",
                                    borderRadius: "99px", position: "relative", transition: "0.3s"
                                }}>
                                    <div style={{
                                        width: "16px", height: "16px", background: "white", borderRadius: "50%",
                                        position: "absolute", top: "2px", left: theme === 'dark' ? "18px" : "2px", transition: "0.3s",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
                                    }} />
                                </div>
                            </button>

                            {/* Language Accordion */}
                            <div>
                                <button
                                    onClick={() => setIsLangOpen(!isLangOpen)}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "10px 12px",
                                        borderRadius: "8px",
                                        border: isLangOpen ? "1px solid var(--border-color)" : "1px solid transparent",
                                        background: isLangOpen ? "var(--bg-color)" : "transparent",
                                        color: "var(--text-color)",
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                    }}
                                    onMouseOver={e => !isLangOpen && (e.currentTarget.style.background = "var(--bg-color)")}
                                    onMouseOut={e => !isLangOpen && (e.currentTarget.style.background = "transparent")}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <IoLanguageOutline size={18} color="var(--primary-color)" />
                                        <span>Language: <span style={{ fontWeight: 600, color: "var(--text-color)" }}>{currentLang.label}</span></span>
                                    </div>
                                    {isLangOpen ? <IoChevronUp size={16} color="var(--text-secondary)" /> : <IoChevronDown size={16} color="var(--text-secondary)" />}
                                </button>

                                <AnimatePresence>
                                    {isLangOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            style={{ overflow: "hidden" }}
                                        >
                                            <div style={{ padding: "4px 0 4px 34px", display: "flex", flexDirection: "column", gap: "2px" }}>
                                                {languages.map(lang => (
                                                    <button
                                                        key={lang.code}
                                                        onClick={() => setLanguage(lang.code)}
                                                        style={{
                                                            width: "100%",
                                                            textAlign: "left",
                                                            padding: "8px 10px",
                                                            borderRadius: "6px",
                                                            border: "none",
                                                            background: lang.code === currentLang.code ? "var(--secondary-color)" : "transparent",
                                                            color: lang.code === currentLang.code ? "var(--primary-color)" : "var(--text-secondary)",
                                                            fontSize: "0.9rem",
                                                            fontWeight: lang.code === currentLang.code ? 600 : 400,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "8px"
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.background = lang.code === currentLang.code ? "var(--secondary-color)" : "var(--bg-color)"}
                                                        onMouseOut={e => e.currentTarget.style.background = lang.code === currentLang.code ? "var(--secondary-color)" : "transparent"}
                                                    >
                                                        <span>{lang.flag}</span> {lang.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>


                            <button
                                onClick={handleLogout}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "10px 12px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: "transparent",
                                    color: "#ef4444",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    fontSize: "0.95rem",
                                    fontWeight: 500,
                                    marginTop: "4px"
                                }}
                                onMouseOver={e => e.currentTarget.style.background = "var(--bg-color)"}
                                onMouseOut={e => e.currentTarget.style.background = "transparent"}
                            >
                                <IoLogOutOutline size={20} />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileMenu;
