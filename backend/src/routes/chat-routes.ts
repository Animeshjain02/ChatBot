// import express from "express";
// import { verifyToken } from "../utils/token-manager.js";
// import { chatCompletionValidator, validate } from "../utils/validators.js";
// import { deleteAllChats, generateChatCompletion, getAllChats } from "../controllers/chat-controllers.js";

// const chatRoutes = express.Router();

// // test
// chatRoutes.get("/", (req, res, next) => {
// 	console.log("hi");
// 	res.send("hello from chatRoutes");
// });

// // protected API

// chatRoutes.post(
// 	"/new",
// 	validate(chatCompletionValidator),
// 	verifyToken,
// 	generateChatCompletion
// );

// chatRoutes.get(
// 	"/all-chats",
// 	verifyToken,
// 	getAllChats
// );

// chatRoutes.delete(
//     "/delete-all-chats",
//     verifyToken,
//     deleteAllChats
// )

// export default chatRoutes;


// routes/chat-routes.js
import express from "express";
import { verifyToken } from "../utils/token-manager.js";
import {
  deleteConversation,
  deleteAllConversations,
  generateChatCompletion,
  getUserConversations,
  getConversationChats,
} from "../controllers/chat-controllers.js";
import { chatCompletionValidator, validate } from "../utils/validators.js";

const chatRoutes = express.Router();

// test route
chatRoutes.get("/", (req, res, next) => {
  console.log("Chat route working ✅");
  res.send("Hello from chatRoutes!");
});

// protected routes
chatRoutes.post(
  "/new",
  validate(chatCompletionValidator),
  verifyToken,
  generateChatCompletion
);

chatRoutes.get("/all-chats", verifyToken, getUserConversations);

chatRoutes.get("/:conversationId", verifyToken, getConversationChats);

chatRoutes.delete("/delete-all-chats", verifyToken, deleteAllConversations);

chatRoutes.delete("/:conversationId", verifyToken, deleteConversation);

export default chatRoutes;
