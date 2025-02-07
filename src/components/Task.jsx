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
    setTaskHistory(historySnap.docs.map(doc => doc.data()));
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
    <div className="flex flex-col items-center justify-center h-[88vh] bg-gradient-to-br from-blue-500 to-indigo-600 p-6">
      <div className="bg-white p-6 rounded shadow-md w-full  md:max-w-3xl lg:max-w-5xl">
        <h2 className="text-3xl font-semibold mb-4">Tasks</h2>
        
        {tasks.length === 0 ? (
          <p className="text-center">No tasks found</p>
        ) : (
          <ul className="mt-4 ">
            {tasks.map((task) => (
              <li key={task.id} className="bg-gray-200 p-3 rounded mb-2 text-lg flex flex-col  justify-between items-center">
                {editTask === task.id ? (
                  <div className="flex flex-col gap-2">
                 <div className="flex gap-2">
                 <input type="text" value={updatedTask.name} placeholder="task name " onChange={(e) => setUpdatedTask({ ...updatedTask, name: e.target.value })} className="p-2 border rounded" />
                 <input type="text" value={updatedTask.description} placeholder="task description" onChange={(e) => setUpdatedTask({ ...updatedTask, description: e.target.value })} className="p-2 border rounded" />
                 </div>
                  <div className="flex items-center gap-2 justify-center">
                  <button onClick={() => handleUpdateTask(task.id)} className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-2 py-1 rounded w-20 md:w-25">Save</button>
                  <button onClick={() => setEditTask(null)} className="bg-gray-500 text-white px-2 py-1 rounded  w-20 md:w-25">Cancel</button>
                  </div>
                  </div>
                ) : (
                  <>
                    <p className="text-lg md:text-2xl font-bold">{task.name} <span className="font-semibold"> (Last completed: {task.lastCompletedAt || "Never"})</span></p>
                    <div className="flex flex-wrap items-center  gap-2 mt-2">
                      <button onClick={() => setEditTask(task.id)} className="bg-blue-500 text-white px-2 py-1 rounded w-27 md:w-35 text-sm md:text-lg">Edit</button>
                      <button onClick={() => handleDeleteTask(task.id)} className="bg-blue-500 text-white px-2 py-1 rounded w-27 md:w-35 text-sm md:text-lg">Delete</button>
                      <button onClick={() => handleCompleteTask(task)} className="bg-blue-500 text-white px-2 py-1 rounded w-27 md:w-35 text-sm md:text-lg">Complete Task</button>
                      <button onClick={() => handleShowHistory(task.id)} className="bg-blue-500 text-white px-2 py-1 rounded w-27 md:w-35 text-sm md:text-lg">History</button>
                      <button onClick={() => { setTaskToAssign(task); setShowAssignTaskPopup(true); }} className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-2 py-1 rounded w-27 md:w-35 text-sm md:text-lg">Assign Task</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <button onClick={() => setShowAddTaskPopup(true)} className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded">Add New Task</button>
        </div>
 
      </div>

      {showAddTaskPopup && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4">Add New Task</h2>
            <input type="text" placeholder="Task Name" className="p-3 border rounded mr-2" value={newTask.name} onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} />
            <input type="text" placeholder="Description" className="p-3 border rounded mr-2" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Checklist</h3>
              {newTask.checklist.map((item, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input type="text" value={item} onChange={(e) => {
                    const updatedChecklist = [...newTask.checklist];
                    updatedChecklist[index] = e.target.value;
                    setNewTask({ ...newTask, checklist: updatedChecklist });
                  }} className="p-2 border rounded" />
                  <button onClick={() => {
                    const updatedChecklist = newTask.checklist.filter((_, i) => i !== index);
                    setNewTask({ ...newTask, checklist: updatedChecklist });
                  }} className="bg-red-500 text-white px-2 py-1 rounded ml-2">Remove</button>
                </div>
              ))}
              <button onClick={() => setNewTask({ ...newTask, checklist: [...newTask.checklist, ""] })} className="bg-blue-500 text-white px-2 py-1 rounded">Add Checklist Item</button>
            </div>
            <input type="file" onChange={(e) => setPicture(e.target.files[0])} className="mt-4" />
            <button onClick={handleAddTask} className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded mt-4">Add Task</button>
            <button onClick={() => setShowAddTaskPopup(false)} className="bg-gray-500 text-white p-3 rounded mt-4 ml-2">Cancel</button>
          </div>
        </div>
      )}

      {showCompletePopup && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4">Complete Task</h2>
            <div>
              {selectedTask.checklist.map((item, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input type="checkbox" checked={checklist.includes(item)} onChange={(e) => {
                    if (e.target.checked) {
                      setChecklist([...checklist, item]);
                    } else {
                      setChecklist(checklist.filter(i => i !== item));
                    }
                  }} />
                  <span className="ml-2">{item}</span>
                </div>
              ))}
            </div>
            <input type="file" onChange={(e) => setPicture(e.target.files[0])} className="mt-4" />
            <button onClick={handleCompleteTaskSubmit} className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded mt-4">Submit</button>
            <button onClick={() => setShowCompletePopup(false)} className="bg-gray-500 text-white p-3 rounded mt-4 ml-2">Cancel</button>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4">Task History</h2>
            <ul>
              {taskHistory.map((history, index) => (
                <li key={index} className="mb-2">
                  <span>{history.timestamp} - {history.username} - {history.completionStatus}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowHistory(false)} className="bg-gray-500 text-white p-3 rounded mt-4">Close</button>
          </div>
        </div>
      )}

      {showAssignTaskPopup && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4">Assign Task</h2>
            <input
              type="email"
              placeholder="Enter worker's email"
              className="p-3 border rounded w-full"
              value={assignEmail}
              onChange={(e) => setAssignEmail(e.target.value)}
            />
            <button onClick={handleAssignTask} className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded mt-4">Assign</button>
            <button onClick={() => setShowAssignTaskPopup(false)} className="bg-gray-500 text-white p-3 rounded mt-4 ml-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;