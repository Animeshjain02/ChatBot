import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { IoSend, IoMicOutline, IoMicOffOutline, IoTrashOutline, IoMenu } from "react-icons/io5";
import toast from "react-hot-toast";

import styles from "./Chat.module.css";
import SuggestionChips from "../components/chat/SuggestionChips";
import ChatLoading from "../components/chat/ChatLoading";
import SpinnerOverlay from "../components/shared/SpinnerOverlay";
import Sidebar from "../components/chat/Sidebar";

import {
	deleteAllConversations,
	getUserConversations,
	getConversationChats,
	postChatRequest,
	deleteConversation,
} from "../../helpers/api-functions";

import { useAuth, useLanguage } from "../context/context";

// Logos
import noMsgBot from "/logos/no-msg2.png";

type Message = {
	role: "user" | "assistant";
	content: string;
};

type Conversation = {
	_id: string;
	title: string;
	updatedAt: string;
};

const Chat = () => {
	const auth = useAuth();
	const langContext = useLanguage();
	const navigate = useNavigate();

	const [chatMessages, setChatMessages] = useState<Message[]>([]);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isLoadingChats, setIsLoadingChats] = useState<boolean>(true);
	const [isRecording, setIsRecording] = useState(false);
	const [inputText, setInputText] = useState("");

	// Sidebar state
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	const messageContainerRef = useRef<HTMLDivElement | null>(null);

	// Auto-scroll
	useEffect(() => {
		if (messageContainerRef.current) {
			messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
		}
	}, [chatMessages]);

	// Load Conversations
	useLayoutEffect(() => {
		const fetchConversations = async () => {
			try {
				if (auth?.isLoggedIn && auth.user) {
					const data = await getUserConversations();
					setConversations(data.conversations || []);
				}
			} catch (err) {
				console.log(err);
				toast.error("Failed to load conversations");
			} finally {
				setIsLoadingChats(false);
			}
		};
		fetchConversations();
	}, [auth]);

	useEffect(() => {
		if (!auth?.user) {
			return navigate("/login");
		}
	}, [auth, navigate]);

	const handleSelectConversation = async (id: string) => {
		setSelectedConversationId(id);
		setIsLoadingChats(true);
		// On mobile, close sidebar after selection? 
		// For now, keep it open or user can close.
		if (window.innerWidth < 768) {
			setIsSidebarOpen(false);
		}

		try {
			const data = await getConversationChats(id);
			setChatMessages(data.chats || []);
		} catch (err) {
			console.log(err);
			toast.error("Failed to load chat");
		} finally {
			setIsLoadingChats(false);
		}
	};

	const handleNewChat = () => {
		setSelectedConversationId(null);
		setChatMessages([]);
		if (window.innerWidth < 768) setIsSidebarOpen(false);
	};

	const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!confirm("Are you sure you want to delete this chat?")) return;

		try {
			await deleteConversation(id);
			setConversations((prev) => prev.filter((chat) => chat._id !== id));
			if (selectedConversationId === id) {
				handleNewChat();
			}
			toast.success("Chat deleted");
		} catch (err) {
			console.log(err);
			toast.error("Failed to delete chat");
		}
	};

	const sendMsgHandler = async (text: string) => {
		if (!text.trim()) return;

		setInputText("");
		const newMessage: Message = { role: "user", content: text };
		setChatMessages((prev) => [...prev, newMessage]);
		setIsLoading(true);

		try {
			// Pass selectedConversationId (if any) to the backend
			const chatData = await postChatRequest(text, langContext?.lang || "en", selectedConversationId || undefined);

			setChatMessages([...chatData.chats]);

			// If it was a new chat, we get a conversationId back. 
			// We should update the selectedConversationId and the conversations list.
			if (!selectedConversationId && chatData.conversationId) {
				setSelectedConversationId(chatData.conversationId);
				// Refresh conversations list or optimistically add it
				const newConversation: Conversation = {
					_id: chatData.conversationId,
					title: text.substring(0, 30) + (text.length > 30 ? "..." : ""),
					updatedAt: new Date().toISOString(),
				};
				setConversations((prev) => [newConversation, ...prev]);
			}
		} catch (err) {
			console.log(err);
			toast.error("Failed to send message");
			setChatMessages((prev) => [
				...prev,
				{ role: "assistant", content: "Error: Could not connect to the server." },
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleVoiceInput = () => {
		// Check browser support
		if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
			toast.error("Voice input is not supported in this browser. Please use Chrome or Edge.", { duration: 4000 });
			return;
		}

		if (isRecording) {
			toast("Stopped Listening");
			setIsRecording(false);
			return;
		}

		try {
			// @ts-ignore
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			const recognition = new SpeechRecognition();

			// Set language based on context
			const langMap: Record<string, string> = {
				'en': 'en-US',
				'hi': 'hi-IN'
			};
			recognition.lang = langMap[langContext?.lang || 'en'] || 'en-US';

			recognition.continuous = false;
			recognition.interimResults = false;

			recognition.onstart = () => {
				setIsRecording(true);
				toast.success("Listening... Speak now", { icon: "🎙️" });
			};

			recognition.onresult = (event: any) => {
				const transcript = event.results[0][0].transcript;
				if (transcript) {
					setInputText((prev) => (prev ? prev + " " + transcript : transcript));
					toast.success("Got it!");
				}
			};

			recognition.onerror = (event: any) => {
				console.error("Speech Recognition Error:", event.error);
				if (event.error === 'not-allowed') {
					toast.error("Microphone permission denied. Please allow access.");
				} else if (event.error === 'no-speech') {
					toast("No speech detected. Try again.");
				} else {
					toast.error(`Voice Error: ${event.error}`);
				}
				setIsRecording(false);
			};

			recognition.onend = () => {
				setIsRecording(false);
			};

			recognition.start();
		} catch (error) {
			console.error(error);
			toast.error("Failed to start voice input");
			setIsRecording(false);
		}
	};

	const clearChatsHandler = async () => {
		// Now calling deleteAllConversations
		if (!confirm("Delete ALL conversations? This cannot be undone.")) return;

		try {
			toast.loading("Deleting All Chats...", { id: "delete-msgs" });
			await deleteAllConversations();
			setChatMessages([]);
			setConversations([]);
			setSelectedConversationId(null);
			toast.success("Deleted Successfully", { id: "delete-msgs" });
		} catch (error: any) {
			toast.error("Error deleting chats", { id: "delete-msgs" });
		}
	};

	return (
		<div className={styles.parent}>
			{/* Sidebar integration */}
			<Sidebar
				conversations={conversations}
				selectedConversationId={selectedConversationId}
				onSelectConversation={handleSelectConversation}
				onNewChat={handleNewChat}
				onDeleteConversation={handleDeleteConversation}
				isLoading={isLoadingChats && conversations.length === 0} // Only show sidebar loading initially
				isOpen={isSidebarOpen}
			/>

			<div className={styles.chatContainer}>
				{/* Toggle Button */}
				<button
					className={styles.toggleBtn}
					onClick={() => setIsSidebarOpen(prev => !prev)}
					title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
				>
					<IoMenu />
				</button>

				<div className={styles.chat} ref={messageContainerRef}>
					{/* {isLoadingChats && <SpinnerOverlay />} 
                        We don't want global spinner overlay when switching chats, maybe just loading indicator in message area?
                        But for now, keeping spinner overlay for initial load or switching is fine.
                    */}
					{isLoadingChats && selectedConversationId && <SpinnerOverlay />}

					{!isLoadingChats && chatMessages.length === 0 && (
						<div className={styles.no_msgs}>
							<motion.img
								src={noMsgBot}
								alt="bot"
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.5 }}
								style={{ width: "150px", marginBottom: "20px" }}
							/>
							<h3>Medical Assistant</h3>
							<p>Hello! I can help you with hospital information. Select a quick prompt or type your question below.</p>
							<SuggestionChips onSelect={(text) => sendMsgHandler(text)} />
						</div>
					)}

					{(!isLoadingChats || chatMessages.length > 0) && (
						<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
							{chatMessages.map((chat, idx) => (
								<div key={idx} className={chat.role === "user" ? styles.userMessage : styles.botMessage}>
									{chat.role === "assistant" ? (
										<div className={styles.markdownContainer}>
											<ReactMarkdown>{chat.content}</ReactMarkdown>
										</div>
									) : (
										<p>{chat.content}</p>
									)}
								</div>
							))}
							{isLoading && <ChatLoading />}
						</div>
					)}
				</div>

				<div className={styles.inputContainer}>
					<div className={styles.inputArea}>
						{chatMessages.length > 0 && (
							<button onClick={clearChatsHandler} className={styles.deleteBtn} title="Clear All Chats">
								<IoTrashOutline />
							</button>
						)}

						<button
							onClick={handleVoiceInput}
							className={`${styles.micBtn} ${isRecording ? styles.recording : ""}`}
							title="Voice Input"
						>
							{isRecording ? <IoMicOffOutline /> : <IoMicOutline />}
						</button>

						<textarea
							className={styles.textArea}
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									sendMsgHandler(inputText);
								}
							}}
							placeholder={isRecording ? (langContext?.lang === 'hi' ? "सुन रहा हूँ..." : "Listening...") : (langContext?.lang === 'hi' ? "अपना प्रश्न यहाँ लिखें..." : "Type your query here...")}
							rows={1}
							disabled={isLoading}
						/>

						<button className={styles.sendBtn} onClick={() => sendMsgHandler(inputText)} disabled={!inputText.trim() || isLoading}>
							<IoSend />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Chat;
