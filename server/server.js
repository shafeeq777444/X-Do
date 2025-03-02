import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js'
import { errorHandler } from "./middlewares/errorHandler.js";
import taskRoutes from './routes/taskRoutes.js'
import cookieParser from "cookie-parser";
import http from "http"; 
import { WebSocketServer } from "ws"; 
import passport from "./config/passport.js"; 
import session from "express-session"; // Use express-session instead


// config
dotenv.config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// MongoDB Connection
connectDB()

// Middleware
app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000", "http://172.16.0.104:3000"], credentials: true }));
app.use(cookieParser());
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use("/api/auth",authRoutes)
app.use("/api/tasks",taskRoutes)
app.use('/uploads', express.static('uploads'));

// WebSocket Connection Handling
wss.on("connection", (ws) => {
    console.log("Client connected 🟢");

    ws.on("message", (message) => {
        console.log("Message from client:", message);
    });

    ws.on("close", () => console.log("Client disconnected 🔴"));
});

// Function to broadcast updates
export const broadcastUpdate = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(message));
        }
    });
};


// error Handler
app.use(errorHandler);
// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`WebSocket server running on ws://localhost:${PORT}`));

