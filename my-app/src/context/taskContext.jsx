"use client";
import { useState, createContext, useContext, useEffect } from "react";
import axios from "axios";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const statuses = ["pending", "inProgress", "completed"];
    const [openStatus, setOpenStatus] = useState("pending");
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetchTasks();

        // Set up WebSocket connection
        const socket = new WebSocket("ws://localhost:4200");
        socket.onopen = () => console.log("WebSocket connected ✅");
        socket.onclose = () => console.warn("WebSocket disconnected ❌, trying to reconnect...");

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("WebSocket message received:", message);
            if (message.type === "TASK_CREATED") {
                setTasks((prev) => [...prev, message.task]);
            } else if (message.type === "TASK_UPDATED") {
                //pending not update in backend
                setTasks((prev) => prev.map((task) => (task._id === message.task._id ? message.task : task)));
            } else if (message.type === "TASK_DELETED") {
                setTasks((prev) => prev.filter((task) => task._id !== message.taskId));
            }else if(message.type=='TASK_DRAGGED'){
                setTasks(message.soacketTask)
            }
        };

        return () => socket.close();
    }, []);

    /**
     * fetching all tasks
     */
    const fetchTasks = async () => {
        try {
            const { data } = await axios.get("http://localhost:4200/api/tasks", { withCredentials: true });
            console.log(data);
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks", error);
        }
    };

    /**
     * AddTask
     */
    const addTask = async (task) => {
        try {
            console.log(task,"addTask")
            const { data } = await axios.post("http://localhost:4200/api/tasks", task, { withCredentials: true });
            setTasks([...tasks, data]);
        } catch (error) {
            console.error("Error adding task", error);
        }
    };

    /**
     *Edit Task
     */
    const updateTask = async (id, update) => {
        console.log("id",id)
        console.log(update,"update task")
        for (let pair of update.entries()) {
            console.log(pair[0], pair[1]);
        }
        try {
            const { data } = await axios.patch(`http://localhost:4200/api/tasks/${id}`, update, {
                withCredentials: true,
            });
            setTasks(tasks.map((task) => (task._id === id ? data : task)));
        } catch (error) {
            console.error("Error updating task", error);
        }
    };

    /**
     * soft Delete
     */
    const deleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:4200/api/tasks/${id}`, { withCredentials: true });
            setTasks(tasks.filter((task) => task._id !== id));
        } catch (error) {
            console.error("Error deleting task", error);
        }
    };

    /**
     * Move Task (mobile view)
     */
    const moveTask = async (taskId, direction) => {
        // Find the current task
        const task = tasks.find((task) => task._id === taskId);
        if (!task) return;

        const currentIndex = statuses.indexOf(task.status);
        const newIndex = currentIndex + direction;

        if (newIndex >= 0 && newIndex < statuses.length) {
            const newStatus = statuses[newIndex];

            const id = taskId;
            try {
                // Send update request to backend
                await axios.patch(
                    `http://localhost:4200/api/tasks/${id}`,
                    { status: newStatus },
                    { withCredentials: true }
                );

                // Update local state only if API call succeeds
                setTasks((prevTasks) => prevTasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
            } catch (error) {
                console.error("Error updating task status:", error);
            }
            setOpenStatus(newStatus);
        }
    };

    /**
     * Drag Task (Desktop view)
     */
    const updateDrag = async (taskss) => {
        try {
            const updatedTasks = taskss.map((task) => ({
                id: task._id,
                status: task.status,
                order: task.order,
            }));

            await axios.patch(
                `http://localhost:4200/api/tasks/drag-update`,
                { tasks: updatedTasks,soacketTask:taskss },
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Error updating tasks:", error);
        }
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                addTask,
                updateTask,
                deleteTask,
                fetchTasks,
                moveTask,
                openStatus,
                setOpenStatus,
                setTasks,
                updateDrag,
                statuses,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => useContext(TaskContext);
