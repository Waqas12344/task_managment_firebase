// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { db } from "../firebase/config";
// import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";

// const Tasks = () => {
//   const { assetId } = useParams();
//   const navigate = useNavigate();
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newTask, setNewTask] = useState({ name: "", description: "", checklist: [] });
//   const [editTask, setEditTask] = useState(null);
//   const [updatedTask, setUpdatedTask] = useState({ name: "", description: "" });
//   const [showCompletePopup, setShowCompletePopup] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [checklist, setChecklist] = useState([]);
//   const [picture, setPicture] = useState(null);
//   const [showHistory, setShowHistory] = useState(false);
//   const [taskHistory, setTaskHistory] = useState([]);
//   const [assignEmail, setAssignEmail] = useState("");

//   useEffect(() => {
//     const fetchTasks = async () => {
//       const taskQuery = query(collection(db, "tasks"), where("assetId", "==", assetId));
//       const taskSnap = await getDocs(taskQuery);
//       setTasks(taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//       setLoading(false);
//     };
//     fetchTasks();
//   }, [assetId]);

//   const handleAddTask = async () => {
//     if (!newTask.name.trim()) return;
//     const taskRef = collection(db, "tasks");
//     await addDoc(taskRef, { ...newTask, assetId, lastCompletedAt: null });
//     setTasks([...tasks, { ...newTask, assetId, id: Math.random().toString() }]);
//     setNewTask({ name: "", description: "", checklist: [] });
//   };

//   const handleUpdateTask = async (taskId) => {
//     const taskRef = doc(db, "tasks", taskId);
//     await updateDoc(taskRef, updatedTask);
//     setTasks(tasks.map(task => (task.id === taskId ? { ...task, ...updatedTask } : task)));
//     setEditTask(null);
//   };

//   const handleDeleteTask = async (taskId) => {
//     if (!window.confirm("Are you sure you want to delete this task?")) return;
//     await deleteDoc(doc(db, "tasks", taskId));
//     setTasks(tasks.filter(task => task.id !== taskId));
//   };

//   const handleCompleteTask = (task) => {
//     setSelectedTask(task);
//     setShowCompletePopup(true);
//   };

//   const handleCompleteTaskSubmit = async () => {
//     const taskRef = doc(db, "tasks", selectedTask.id);
//     const pictureBase64 = picture ? await convertImageToBase64(picture) : null;
//     await updateDoc(taskRef, {
//       lastCompletedAt: new Date().toISOString(),
//       checklist: checklist,
//       pictureBase64: pictureBase64, // Store Base64 string in Firestore
//     });
//     setShowCompletePopup(false);
//     setChecklist([]);
//     setPicture(null);
//   };

//   const convertImageToBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = (error) => reject(error);
//     });
//   };

//   const handleShowHistory = async (taskId) => {
//     const historyQuery = query(collection(db, "taskHistory"), where("taskId", "==", taskId));
//     const historySnap = await getDocs(historyQuery);
//     setTaskHistory(historySnap.docs.map(doc => doc.data()));
//     setShowHistory(true);
//   };

//   const handleAssignTask = async (taskId) => {
//     if (!assignEmail.trim()) return;
//     const taskRef = doc(db, "tasks", taskId);
//     await updateDoc(taskRef, { assignedTo: assignEmail });
//     setAssignEmail("");
//   };

//   if (loading) return <p className="text-center text-2xl">Loading...</p>;

//   return (
//     <div className="flex flex-col items-center justify-center h-[88vh] bg-gray-100 p-6">
//       <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl md:max-w-3xl lg:max-w-5xl">
//         <h2 className="text-3xl font-semibold mb-4">Tasks</h2>
        
//         {tasks.length === 0 ? (
//           <p className="text-center">No tasks found</p>
//         ) : (
//           <ul className="mt-4">
//             {tasks.map((task) => (
//               <li key={task.id} className="bg-gray-200 p-3 rounded mb-2 text-lg flex justify-between items-center">
//                 {editTask === task.id ? (
//                   <>
//                     <input type="text" value={updatedTask.name} onChange={(e) => setUpdatedTask({ ...updatedTask, name: e.target.value })} className="p-2 border rounded" />
//                     <input type="text" value={updatedTask.description} onChange={(e) => setUpdatedTask({ ...updatedTask, description: e.target.value })} className="p-2 border rounded" />
//                     <button onClick={() => handleUpdateTask(task.id)} className="bg-green-500 text-white px-2 py-1 rounded">Save</button>
//                     <button onClick={() => setEditTask(null)} className="bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
//                   </>
//                 ) : (
//                   <>
//                     <span>{task.name} (Last completed: {task.lastCompletedAt || "Never"})</span>
//                     <div>
//                       <button onClick={() => setEditTask(task.id)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
//                       <button onClick={() => handleDeleteTask(task.id)} className="bg-red-500 text-white px-2 py-1 rounded ml-2">Delete</button>
//                       <button onClick={() => handleCompleteTask(task)} className="bg-blue-500 text-white px-2 py-1 rounded ml-2">Complete Task</button>
//                       <button onClick={() => handleShowHistory(task.id)} className="bg-purple-500 text-white px-2 py-1 rounded ml-2">History</button>
//                       <button onClick={() => handleAssignTask(task.id)} className="bg-green-500 text-white px-2 py-1 rounded ml-2">Assign Task</button>
//                     </div>
//                   </>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}

//         <div className="mt-4">
//           <input type="text" placeholder="Task Name" className="p-3 border rounded mr-2" value={newTask.name} onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} />
//           <input type="text" placeholder="Description" className="p-3 border rounded mr-2" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
//           <button onClick={handleAddTask} className="bg-green-500 text-white p-3 rounded">Add Task</button>
//         </div>

//         <button onClick={() => navigate("/")} className="bg-blue-500 text-white p-3 rounded mt-6">Logout</button>
//       </div>

//       {showCompletePopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
//             <h2 className="text-2xl font-semibold mb-4">Complete Task</h2>
//             <div>
//               {selectedTask.checklist.map((item, index) => (
//                 <div key={index} className="flex items-center mb-2">
//                   <input type="checkbox" checked={checklist.includes(item)} onChange={(e) => {
//                     if (e.target.checked) {
//                       setChecklist([...checklist, item]);
//                     } else {
//                       setChecklist(checklist.filter(i => i !== item));
//                     }
//                   }} />
//                   <span className="ml-2">{item}</span>
//                 </div>
//               ))}
//             </div>
//             <input type="file" onChange={(e) => setPicture(e.target.files[0])} className="mt-4" />
//             <button onClick={handleCompleteTaskSubmit} className="bg-green-500 text-white p-3 rounded mt-4">Submit</button>
//             <button onClick={() => setShowCompletePopup(false)} className="bg-gray-500 text-white p-3 rounded mt-4 ml-2">Cancel</button>
//           </div>
//         </div>
//       )}

//       {showHistory && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
//             <h2 className="text-2xl font-semibold mb-4">Task History</h2>
//             <ul>
//               {taskHistory.map((history, index) => (
//                 <li key={index} className="mb-2">
//                   <span>{history.timestamp} - {history.username} - {history.completionStatus}</span>
//                 </li>
//               ))}
//             </ul>
//             <button onClick={() => setShowHistory(false)} className="bg-gray-500 text-white p-3 rounded mt-4">Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Tasks;

import React from 'react'

const Task = () => {
  return (
    <div>Task</div>
  )
}

export default Task