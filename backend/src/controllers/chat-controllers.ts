import { Request, Response, NextFunction } from "express";
import axios from "axios";
import User from "../models/user-model.js";
import Conversation from "../models/conversation-model.js";

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message, lang, conversationId } = req.body;
    console.log(`[Node] Received message: "${message}", lang: "${lang}", conversationId: "${conversationId}"`);

    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json("User not registered / token malfunctioned");
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId: user._id });
      if (!conversation) {
        // If conversation doesn't exist (maybe deleted), create a new one? 
        // Or return error. For now, let's create a new one to be safe, or just error.
        // Better to error so frontend knows to reset.
        return res.status(404).json("Conversation not found");
      }
    } else {
      // Create new conversation
      conversation = new Conversation({
        userId: user._id,
        title: message.substring(0, 30) + (message.length > 30 ? "..." : ""),
        chats: [],
      });
    }

    // Save user message
    conversation.chats.push({ content: message, role: "user" });

    // 🔥 Send request to Python FastAPI backend
    // Normalize URL: handle cases where PYTHON_API_URL might be just the base domain
    const pythonBaseUrl = (process.env.PYTHON_API_URL || "http://127.0.0.1:5000").replace(/\/ask$/i, "");
    const pythonUrl = `${pythonBaseUrl.replace(/\/$/, "")}/ask`;

    console.log(`[Node] Forwarding request to Python API: "${pythonUrl}"`);

    let botReply = "";
    try {
      const response = await axios.post(pythonUrl, {
        question: message,  // matches FastAPI's Pydantic model
        lang: lang || "en"
      });
      console.log("[Node] Received response from Python:", response.data);
      botReply = response.data.answer;
    } catch (pythonError: any) {
      const status = pythonError.response?.status;
      const errorData = pythonError.response?.data;
      console.error(`[Node] Python Error - Status: ${status}`, errorData || pythonError.message);
      console.error(`[Node] Attempted URL: ${pythonUrl}`);

      if (pythonError.code === 'ECONNREFUSED') {
        botReply = "System Error: The medical knowledge base is currently offline. Please ensure the Python backend is running locally or the PYTHON_API_URL is correct.";
      } else {
        botReply = `Medical Brain Error (${status || 'Unknown'}): The knowledge base failed to process this request. This usually happens if the URL is incorrect (404), there's a model error, or the server is overloaded. Attempted URL: ${pythonUrl}`;
      }
    }

    // Save bot response
    conversation.chats.push({ content: botReply, role: "assistant" });
    await conversation.save();

    return res.status(200).json({ chats: conversation.chats, conversationId: conversation._id });
  } catch (error: any) {
    console.error("[Node] Critical Error in generateChatCompletion:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) return res.status(401).json("User not registered / token malfunctioned");

    // Return list of conversations with basic info (id, title, updatedAt)
    // We only need the last message or just title/id for the sidebar
    const conversations = await Conversation.find({ userId: user._id })
      .sort({ updatedAt: -1 })
      .select("title updatedAt"); // optimize selection

    return res.status(200).json({ conversations });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getConversationChats = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) return res.status(401).json("User not registered / token malfunctioned");

    const conversation = await Conversation.findOne({ _id: conversationId, userId: user._id });
    if (!conversation) return res.status(404).json("Conversation not found");

    return res.status(200).json({ chats: conversation.chats, conversationId: conversation._id });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) return res.status(401).json("User not registered / token malfunctioned");

    const conversation = await Conversation.findOneAndDelete({ _id: conversationId, userId: user._id });
    if (!conversation) return res.status(404).json("Conversation not found");

    return res.status(200).json({ message: "Conversation deleted" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};


export const deleteAllConversations = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) return res.status(401).json("User not registered / token malfunctioned");

    await Conversation.deleteMany({ userId: user._id });

    return res.status(200).json({ message: "All conversations deleted" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// Deprecated or Legacy support if needed, but we typically replace usage.
// Keeping it simpler by removing old functions not used anymore.

