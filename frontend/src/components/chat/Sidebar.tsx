import { IoAdd, IoChatbubbleOutline, IoTrashOutline } from "react-icons/io5";
import styles from "./Sidebar.module.css";

type Conversation = {
    _id: string;
    title: string;
    updatedAt: string;
};

type Props = {
    conversations: Conversation[];
    selectedConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    onDeleteConversation: (id: string, e: React.MouseEvent) => void;
    isLoading: boolean;
};

const Sidebar = ({
    conversations,
    selectedConversationId,
    onSelectConversation,
    onNewChat,
    onDeleteConversation,
    isLoading,
    isOpen,
}: Props & { isOpen: boolean }) => {
    return (
        <div
            className={`${styles.sidebar} ${!isOpen ? styles.closed : ""}`}
        >
            <button onClick={onNewChat} className={styles.newChatBtn}>
                <IoAdd size={20} /> New Chat
            </button>

            <div className={styles.historyList}>
                {isLoading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : (conversations?.length || 0) === 0 ? (
                    <div className={styles.loading}>No chats yet</div>
                ) : (
                    conversations.map((chat) => (
                        <div
                            key={chat._id}
                            className={`${styles.historyItem} ${selectedConversationId === chat._id ? styles.active : ""
                                }`}
                            onClick={() => onSelectConversation(chat._id)}
                        >
                            <IoChatbubbleOutline className={styles.chatIcon} />
                            <span className={styles.chatTitle}>{chat.title || "New Chat"}</span>
                            <button
                                className={styles.deleteBtn}
                                onClick={(e) => onDeleteConversation(chat._id, e)}
                                title="Delete Chat"
                            >
                                <IoTrashOutline />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sidebar;
