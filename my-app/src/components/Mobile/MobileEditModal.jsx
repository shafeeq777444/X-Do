import { useTasks } from "@/context/taskContext";
import React, { useState } from "react";

const MobileEditModal = ({ editTask, setEditTask }) => {
  const [newFiles, setNewFiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const { updateTask } = useTasks();
  const BASE_URL = "http://localhost:4200";

  const handleEditChange = (e) => {
    setEditTask({ ...editTask, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    const formData = new FormData();
    formData.append("title", editTask.title);
    formData.append("description", editTask.description);
    formData.append("dueDate", editTask.dueDate);
    formData.append("status", editTask.status);
    formData.append("order", editTask.order);
    formData.append("userId", editTask.userId);

    if (editTask.attachments && Array.isArray(editTask.attachments)) {
      editTask.attachments.forEach((file) => {
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
      newAttachments.push(files[i].name);
    }
    setEditTask({ ...editTask, attachments: newAttachments });
  };

  const handleRemoveAttachment = (index) => {
    const updatedAttachments = editTask.attachments.filter((_, i) => i !== index);
    setEditTask({ ...editTask, attachments: updatedAttachments });
  };

  if (!editTask) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full sm:w-2/3 md:w-1/3">
        {/* Title (Editable) */}
        <div className="w-full p-2 mb-2 transition hover:bg-gray-200 rounded">
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={editTask.title}
              onChange={handleEditChange}
              className="w-full p-2 rounded border focus:ring-0 focus:outline-none"
              autoFocus
              onBlur={() => setIsEditing(false)}
            />
          ) : (
            <h3 className="text-xl sm:text-2xl font-bold">{editTask.title || "Task title..."}</h3>
          )}
        </div>

        {/* Description */}
        <h2 className="text-sm font-semibold p-2">Description:</h2>
        <textarea
          name="description"
          value={editTask.description}
          onChange={handleEditChange}
          className="w-full px-2 rounded mb-2 border focus:ring-0 focus:outline-gray-200 resize-none"
          placeholder="Task description..."
        />

        {/* Due Date */}
        <div>
          <h2 className="text-sm font-semibold p-2">Date:</h2>
          <input
            type="date"
            name="dueDate"
            value={editTask.dueDate ? editTask.dueDate.split("T")[0] : ""}
            onChange={handleEditChange}
            className="w-full px-2 p-2 rounded border focus:ring-0 focus:outline-none"
          />
        </div>

        {/* File Input */}
        <input type="file" multiple onChange={handleAttachmentChange} className="w-full p-2 mb-2 rounded border" />

        {/* Existing Attachments */}
        {editTask.attachments?.length > 0 && (
          <div className="mb-2 max-h-40 sm:max-h-64 overflow-y-auto">
            {editTask.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded mb-1">
                <a href={`${BASE_URL}/${attachment}`} target="_blank" className="text-blue-500 underline truncate">
                  {attachment.split("-").pop()}
                </a>
                <button
                  onClick={() => handleRemoveAttachment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => setEditTask(null)} className="bg-white border px-4 py-2 rounded text-black hover:bg-gray-100 text-sm">
            Cancel
          </button>
          <button onClick={handleSaveEdit} className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileEditModal;
