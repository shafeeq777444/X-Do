import { useTasks } from "@/context/taskContext";
import React, {  useState } from "react";
const DesktopEditModal = ({editTask,setEditTask}) => {
    const [newFiles, setNewFiles] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const {   updateTask } = useTasks();
      const BASE_URL = "http://localhost:4200";
      const handleEditChange = (e) => {
        setEditTask({ ...editTask, [e.target.name]: e.target.value });
    };

    const handleSaveEdit = async () => {
        console.log(editTask,"editTask")
        const formData = new FormData();
formData.append("title", editTask.title);
formData.append("description", editTask.description);
formData.append("dueDate", editTask.dueDate);
formData.append("status", editTask.status);
formData.append("order", editTask.order);
formData.append("userId", editTask.userId);
if (editTask.attachments && Array.isArray(editTask.attachments)) {
    console.log(editTask.attachments,"attachment")
    editTask.attachments.forEach((file, index) => {
        formData.append("attachments", file);
    });
}
        await updateTask(editTask._id, formData);
        setEditTask(null);
    };
    const handleAttachmentChange = (e) => {
        const files = e.target.files;
        const newAttachments = [...(editTask.attachments || [])];
        for (let i = 0; i < files.length; i++) {
            newAttachments.push(files[i].name);  // Or handle files as needed
        }
        setEditTask({ ...editTask, attachments: newAttachments });
    };
    const handleRemoveNewFile = (index) => {
        setNewFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };
    const handleRemoveAttachment = (index) => {
        const updatedAttachments = editTask.attachments.filter((_, i) => i !== index);
        setEditTask({ ...editTask, attachments: updatedAttachments });
    };
        
    if (!editTask) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
       
    <div
            className={`w-full p-2 mb-2 transition ${
                !isEditing ? " hover:bg-gray-200 rounded " : ""
            }`}
            onClick={() => setIsEditing(true)}
        >
            {isEditing ? (
                <input
                    type="text"
                    name="title"
                    value={editTask.title}
                    onChange={handleEditChange}
                    className="w-full p-1 rounded focus:ring-0 focus:outline-none"
                    autoFocus
                    onBlur={() => setIsEditing(false)} // Exit edit mode on blur
                />
            ) : (
                <h3 className="text-2xl font-bold">{editTask.title || "Task title..."}</h3>
            )}
        </div>
        <h2 className="text-sm font-semibold p-2">Description:</h2>
        <textarea
            name="description"
            value={editTask.description}
            onChange={handleEditChange}
            className="w-full px-2 rounded mb-2  focus:ring-0 focus:outline-gray-200 resize-none"
            placeholder="Task description..."

        />
        <div className="">
            <h2 className="text-sm font-semibold p-2">Date:</h2>
            <input
                type="date"
                name="dueDate"
                value={editTask.dueDate ? editTask.dueDate.split("T")[0] : ""}
                onChange={handleEditChange}
                className="w-1/3 px-2   rounded mb-2 focus:ring-0 focus:outline-none resize-none"
            />
        </div>
            <input type="file" multiple onChange={handleAttachmentChange} className="w-full p-2 mb-2 rounded" />

        {/* Existing Attachments */}
        <div className="mb-2">
                    {editTask.attachments && editTask.attachments.length > 0 && (
                        <div className="space-y-2 max-h-64 overflow-y-auto scroll-smooth hide-scrollbar">
                            {editTask.attachments.map((attachment, index) => (
                                <div key={index} className="flex  items-start relative    rounded-lg ">
                                    {attachment.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                        <a href={`${BASE_URL}/${attachment}`} download target="_blank">
                                            <img
                                                src={`${BASE_URL}/${attachment}`}
                                                alt={`Task Attachment ${index + 1}`}
                                             className=""
                                            />
                                        </a>
                                    ) : (
                                        <a
                                            href={`${BASE_URL}/${attachment}`}
                                            target="_blank"
                                            className="text-black hover:text-gray-500 no-underline h-20 flex justify-center items-center w-full "
                                        >
                                            📄 {attachment.split("-").pop()}
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleRemoveAttachment(index)}
                                        className=" absolute right-0 bottom-4 h-10 bg-gray-500 text-white p-2 w-8 text-xs rounded-tl-xl   rounded-bl-xl  hover:w-12 text-md  duration-300 ease-in-out"
                                    >
                                        🗑
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
        {/* Preview for New Files */}
        <div className="mb-2">
                    {newFiles.length > 0 && (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {newFiles.map((file, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    {file.type.startsWith("image/") ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`New File ${index + 1}`}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <span className="text-gray-700">📄 {file.name}</span>
                                    )}
                                    <button
                                        onClick={() => handleRemoveNewFile(index)}
                                        className="text-red-500 hover:text-red-700 text-lg"
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

        <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setEditTask(null)} className="bg-white border border-gray-300 transition duration-30 text-xs text-black px-4 py-2 hover:bg-gray-100 rounded">
                Cancel
            </button>
            <button onClick={handleSaveEdit} className="bg-black border border-black text-white px-4 rounded text-xs hover:bg-white hover:text-black hover:border-gray-300
               transition duration-30 ">
                Save
            </button>
        </div>
    </div>
</div>
  )
}

export default DesktopEditModal
