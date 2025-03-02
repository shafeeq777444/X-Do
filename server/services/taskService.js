import Task from "../models/Task.js";
import CustomError from "../middlewares/customError.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

/**
 * Create a new task
 */
export const createTask = async (userId, taskData) => {
    console.log(userId, "check second");

    // Find the last task for the user and determine the next order
    const lastTask = await Task.findOne({ userId }).sort({ order: -1 });

    taskData.userId = userId;
    taskData.order = lastTask ? lastTask.order + 1 : 1; // Assign order value

    const task = await Task.create(taskData);
    return task;
};

/**
 * Get all tasks for a user
 */
export const getUserTasks = async (userId) => {
    return await Task.find({ userId: userId, isDeleted: false }).sort({ order: 1 });
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (taskId, userId) => {
    return await Task.find({ user: userId, isDeleted: false, _id: taskId });
};

/**
 * Update a task
 */
export const updateTask = async (taskId, userId, taskData) => {
    console.log("i am updatecontroller");
    const task = await Task.findOne({_id: taskId, userId: userId, isDeleted: false });

    if (!task) {
        throw new CustomError("Task not found", 404);
    }

    Object.assign(task, taskData);
    await task.save();
    return task;
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId, userId) => {
    const task = await Task.findOne({ _id: taskId, userId: userId });

    // Delete attached files
    task.attachments.forEach(filePath => {
        const fullPath = path.join(process.cwd(), filePath);
        fs.unlink(fullPath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });
    });
    
    if (!task) {
        throw new CustomError("Task not found", 404);
    }
    // Soft delete: Mark isDeleted as true instead of deleting
    task.isDeleted = true;
    await task.save();

    return { message: "Task deleted successfully", task };
};

/**
 * Update Drag Task
 */
export const dragTaskUpdateService = async (tasks) => {
    const dragOperations = tasks.map((task) => ({
        updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(task.id) },
            update: { $set: { status: task.status, order: task.order } },
        },
    }));

    return Task.bulkWrite(dragOperations);
};

/**
 * generate pdf
 */
export const generateTaskPDFService = async (userId) => {
    const tasks = await Task.find({ user: userId, isDeleted: false });

    if (tasks.length === 0) {
        throw new Error("No tasks found");
    }
    // Ensure 'uploads' directory exists
    const uploadDir = path.join("uploads");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true }); // Creates the folder if missing
    }
    // create new blank pdf
    const doc = new PDFDocument();
    // set path
    const filePath = path.join("uploads", `tasks-${userId}.pdf`);
    // litle by little stream data
    const writeStream = fs.createWriteStream(filePath);
    // connect pdf to writestream
    doc.pipe(writeStream);

    // Add Title
    doc.fontSize(20).text("Task List", { align: "center" });
    doc.moveDown();

    // Add Tasks to PDF
    tasks.forEach((task, index) => {
        doc.fontSize(14).text(`Task ${index + 1}: ${task.title}`, { underline: true });
        doc.fontSize(12).text(`Description: ${task.description || "N/A"}`);
        doc.fontSize(12).text(`Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}`);
        doc.fontSize(12).text(`Status: ${task.status}`);
        doc.moveDown();
    });

    doc.end();

    return new Promise((resolve, reject) => {
        writeStream.on("finish", () => resolve(filePath));
        writeStream.on("error", reject);
    });
};
