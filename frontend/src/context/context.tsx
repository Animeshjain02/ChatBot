import {
	userLogin,
	getAuthStatus,
	logoutUser,
	userSignup,
} from "../../helpers/api-functions";
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

type User = {
	name: string;
	email: string;
};

type UserAuth = {
	user: User | null;
	isLoggedIn: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	signup: (name: string, email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
};

const AuthContext = createContext<UserAuth | null>(null);

// Language Context
type LanguageContextType = {
	lang: string;
	setLang: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
	const [lang, setLang] = useState("en");

	return (
		<LanguageContext.Provider value={{ lang, setLang }}>
			{children}
		</LanguageContext.Provider>
	);
};

export const useLanguage = () => useContext(LanguageContext);

// Theme Context
type Theme = "light" | "dark";
type ThemeContextType = {
	theme: Theme;
	toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [theme, setTheme] = useState<Theme>("light");

	useEffect(() => {
		// Check system preference or local storage
		const savedTheme = localStorage.getItem("chat-theme") as Theme;
		if (savedTheme) {
			setTheme(savedTheme);
			document.documentElement.setAttribute("data-theme", savedTheme);
		} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			setTheme("dark");
			document.documentElement.setAttribute("data-theme", "dark");
		}
	}, []);

	const toggleTheme = () => {
		const newTheme = theme === "light" ? "dark" : "light";
		setTheme(newTheme);
		localStorage.setItem("chat-theme", newTheme);
		document.documentElement.setAttribute("data-theme", newTheme);
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => useContext(ThemeContext);

// react component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoggedIn, setisLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// check if user cookies are valid and then skip login
	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				const data = await getAuthStatus();
				if (data) {
					setUser({ email: data.email, name: data.name });
					setisLoggedIn(true);
				}
			} catch (error) {
				console.log("Not logged in");
			} finally {
				setIsLoading(false);
			}
		};
		checkAuthStatus();
	}, []);

	const login = async (email: string, password: string) => {
		const data = await userLogin(email, password);
		if (data) {
			setUser({ email: data.email, name: data.name });
			setisLoggedIn(true);
		}
	};

	const signup = async (name: string, email: string, password: string) => {
		await userSignup(name, email, password);
	};

	const logout = async () => {
		await logoutUser();
		setisLoggedIn(false);
		setUser(null);
		window.location.reload();
	};

	const value = {
		user,
		isLoggedIn,
		isLoading,
		login,
		logout,
		signup,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// create variable context that should be used by the childrens

export const useAuth = () => useContext(AuthContext);
