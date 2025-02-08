import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, updateDoc, deleteDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";

const Tasks = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ name: "", description: "", checklist: [] });
  const [editTask, setEditTask] = useState(null);
  const [updatedTask, setUpdatedTask] = useState({ name: "", description: "" });
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [picture, setPicture] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [taskHistory, setTaskHistory] = useState([]);
  const [assignEmail, setAssignEmail] = useState("");
  const [showAddTaskPopup, setShowAddTaskPopup] = useState(false);
  const [showAssignTaskPopup, setShowAssignTaskPopup] = useState(false); // New state for assign task popup
  const [taskToAssign, setTaskToAssign] = useState(null); // New state to track which task is being assigned

  useEffect(() => {
    const fetchTasks = async () => {
      const taskQuery = query(collection(db, "tasks"), where("assetId", "==", assetId));
      const taskSnap = await getDocs(taskQuery);
      setTasks(taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchTasks();
  }, [assetId]);

  const handleAddTask = async () => {
    if (!newTask.name.trim()) return;
    const taskRef = collection(db, "tasks");
    await addDoc(taskRef, { ...newTask, assetId, lastCompletedAt: null });
    setTasks([...tasks, { ...newTask, assetId, id: Math.random().toString() }]);
    setNewTask({ name: "", description: "", checklist: [] });
    setShowAddTaskPopup(false);
  };

  const handleUpdateTask = async (taskId) => {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, updatedTask);
    setTasks(tasks.map(task => (task.id === taskId ? { ...task, ...updatedTask } : task)));
    setEditTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    await deleteDoc(doc(db, "tasks", taskId));
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleCompleteTask = (task) => {
    setSelectedTask(task);
    setChecklist(task.checklist || []);
    setShowCompletePopup(true);
  };

  const handleCompleteTaskSubmit = async () => {
    const taskRef = doc(db, "tasks", selectedTask.id);
    const pictureBase64 = picture ? await convertImageToBase64(picture) : null;
    await updateDoc(taskRef, {
      lastCompletedAt: new Date().toISOString(),
      checklist: checklist,
      pictureBase64: pictureBase64,
    });
    setShowCompletePopup(false);
    setChecklist([]);
    setPicture(null);
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleShowHistory = async (taskId) => {
    const historyQuery = query(collection(db, "taskHistory"), where("taskId", "==", taskId));
    const historySnap = await getDocs(historyQuery);
    const historyData = historySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: new Date(doc.data().completedAt).toLocaleString(), // Format the timestamp
    }));
    setTaskHistory(historyData);
    setShowHistory(true);
  };
  const handleAssignTask = async () => {
    if (!assignEmail.trim()) return;
    const taskRef = doc(db, "tasks", taskToAssign.id);
    await updateDoc(taskRef, { assignedTo: assignEmail });
    setTasks(tasks.map(task => (task.id === taskToAssign.id ? { ...task, assignedTo: assignEmail } : task)));
    setAssignEmail("");
    setShowAssignTaskPopup(false);
  };

  if (loading) return <p className="text-center text-2xl">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[88vh] bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Tasks</h2>
  
      {tasks.length === 0 ? (
        <p className="text-center text-lg text-gray-600">No tasks found</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
              {editTask === task.id ? (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      type="text"
                      value={updatedTask.name}
                      placeholder="Task Name"
                      onChange={(e) => setUpdatedTask({ ...updatedTask, name: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={updatedTask.description}
                      placeholder="Task Description"
                      onChange={(e) => setUpdatedTask({ ...updatedTask, description: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateTask(task.id)}
                      className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditTask(null)}
                      className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xl font-bold text-gray-800">
                    {task.name} <span className="font-semibold text-gray-600">(Last completed: {task.lastCompletedAt || "Never"})</span>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => setEditTask(task.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleCompleteTask(task)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Complete Task
                    </button>
                    <button
                      onClick={() => handleShowHistory(task.id)}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      History
                    </button>
                    <button
                      onClick={() => { setTaskToAssign(task); setShowAssignTaskPopup(true); }}
                      className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      Assign Task
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
  
      <button
        onClick={() => setShowAddTaskPopup(true)}
        className="w-full bg-blue-600 text-white p-3 rounded-lg mt-6 hover:bg-blue-700 transition-colors"
      >
        Add New Task
      </button>
    </div>
  
    {/* Add Task Popup */}
    {showAddTaskPopup && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Task</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Task Name"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Checklist</h3>
              {newTask.checklist.map((item, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updatedChecklist = [...newTask.checklist];
                      updatedChecklist[index] = e.target.value;
                      setNewTask({ ...newTask, checklist: updatedChecklist });
                    }}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const updatedChecklist = newTask.checklist.filter((_, i) => i !== index);
                      setNewTask({ ...newTask, checklist: updatedChecklist });
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => setNewTask({ ...newTask, checklist: [...newTask.checklist, ""] })}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Checklist Item
              </button>
            </div>
            <input
              type="file"
              onChange={(e) => setPicture(e.target.files[0])}
              className="mt-4"
            />
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddTask}
                className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowAddTaskPopup(false)}
                className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  
    {/* Complete Task Popup */}
    {showCompletePopup && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Task</h2>
          <div className="space-y-4">
            {selectedTask.checklist.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checklist.includes(item)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setChecklist([...checklist, item]);
                    } else {
                      setChecklist(checklist.filter(i => i !== item));
                    }
                  }}
                />
                <span className="text-lg text-gray-700">{item}</span>
              </div>
            ))}
            <input
              type="file"
              onChange={(e) => setPicture(e.target.files[0])}
              className="mt-4"
            />
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCompleteTaskSubmit}
                className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Submit
              </button>
              <button
                onClick={() => setShowCompletePopup(false)}
                className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  
    {/* Task History Popup */}
    {showHistory && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Task History</h2>
      <ul className="space-y-2">
        {taskHistory.map((history, index) => (
          <li key={index} className="text-lg text-gray-700">
            <p><strong>Task:</strong> {history.taskName}</p>
            <p><strong>Completed By:</strong> {history.completedBy}</p>
            <p><strong>Completed At:</strong> {history.timestamp}</p>
            <p><strong>Checklist:</strong> {history.checklist.join(", ")}</p>
            {history.pictureBase64 && (
              <img src={history.pictureBase64} alt="Task completion proof" className="mt-2 max-w-full h-auto" />
            )}
          </li>
        ))}
      </ul>
      <button
        onClick={() => setShowHistory(false)}
        className="w-full bg-gray-500 text-white p-3 rounded-lg mt-6 hover:bg-gray-600 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}
  
    {/* Assign Task Popup */}
    {showAssignTaskPopup && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Assign Task</h2>
          <input
            type="email"
            placeholder="Enter worker's email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={assignEmail}
            onChange={(e) => setAssignEmail(e.target.value)}
          />
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleAssignTask}
              className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Assign
            </button>
            <button
              onClick={() => setShowAssignTaskPopup(false)}
              className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default Tasks;