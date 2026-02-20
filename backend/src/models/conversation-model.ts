import mongoose from "mongoose";
import chatSchema from "./chat-model.js";

const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        default: "New Chat",
    },
    chats: [chatSchema],
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);
