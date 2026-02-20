import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, LanguageProvider, ThemeProvider } from "./context/context.tsx";
import { Toaster } from "react-hot-toast";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<AuthProvider>
			<LanguageProvider>
				<ThemeProvider>
					<BrowserRouter>
						<Toaster position="bottom-right" />
						<App />
					</BrowserRouter>
				</ThemeProvider>
			</LanguageProvider>
		</AuthProvider>
	</React.StrictMode>
);
