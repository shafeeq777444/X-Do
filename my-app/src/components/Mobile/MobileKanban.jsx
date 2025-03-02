import React, { useEffect, useState } from "react";
import { MobileTaskForm } from "@/components/Mobile/MobileTaskForm";
import { useTasks } from "@/context/taskContext";
import MobileTaskButtons from "../TaskButtons";
import MobileEditModal from "./MobileEditModal";

const MobileKanban = () => {
    const BASE_URL = "http://localhost:4200";
    const {  setOpenStatus, openStatus,  fetchTasks, tasks,statuses } = useTasks();
     const [addingTask, setAddingTask] = useState(false);
    const [editTask, setEditTask] = useState(null);


    useEffect(() => {
        fetchTasks();
    }, []);

    

    return (
        <div className="md:hidden space-y-2 h-screen">
            {statuses.map((status) => (
                <div key={status} className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <button
                        onClick={() => setOpenStatus(openStatus === status ? null : status)}
                        className="w-full text-left font-semibold text-lg flex justify-between items-center"
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        <span>{openStatus === status ? "▲" : "▼"}</span>
                    </button>
                    <div
                        className={`overflow-y-auto  scroll-smooth hide-scrollbar transition-all duration-300 ${
                            openStatus === status ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                        {tasks
                            .filter((task) => task.status === status)
                            .map((task) => (
                                <div
                                    key={task._id}
                                    className="bg-white relative   m-2 p-3 rounded-lg shadow cursor-pointer"
                                    onClick={() => setEditTask(task)} // Open edit modal on click
                                >
                                    <p className="font-bold">{task.title}</p>
                                    <p className="text-sm text-gray-600">{task.description}</p>
                                    <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                                    
                                    {task.attachments && task.attachments.length > 0 && (
                                        <div className="mt-2 flex items-center">
                                            {task.attachments
                    .filter((attachment) => attachment.match(/\.(jpeg|jpg|png|gif)$/i)) // Get only images
                    
                    .map((attachment, index) => (
                        <a key={index} href={`${BASE_URL}/${attachment}`} download target="_blank">
                            <img
                                src={`${BASE_URL}/${attachment}`}
                                alt={`Task Attachment ${index + 1}`}
                                className={`relative z-${index} -ml-4 first:ml-0 pr-3`}
                            />
                        </a>
                    ))}
                                        </div>
                                    )}
                                   <MobileTaskButtons task={task} status={status} />
                                </div>
                            ))}
                        {status === "pending" && (
                            <div className={`mt-2 ${openStatus === status ? "opacity-100" : "opacity-0"}`}>
                                {addingTask ? (
                                    <MobileTaskForm  setAddingTask={setAddingTask}/>
                                ) : (
                                    <button
                                        onClick={() => setAddingTask(true)}
                                        className="w-full bg-blue-500 text-white p-2 rounded mt-2"
                                    >
                                        + Add Task
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Edit Modal */}
            {editTask && (
               <MobileEditModal editTask={editTask} setEditTask={setEditTask}/>
            )}
        </div>
    );
};

export default MobileKanban;
