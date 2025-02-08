import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userRole = userDoc.data().role;
            setRole(userRole);

            // Redirect to correct home page if on login page
            if (location.pathname === "/login") {
              if (userRole === "admin") {
                navigate("/home");
              } else if (userRole === "worker") {
                navigate("/homeworker");
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setUser(null);
        setRole("");
        if (location.pathname !== "/login") {
          navigate("/login");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setRole("");
    navigate("/login");
  };

  return (
    <div className="flex max-w-[1260px] h-[12vh] items-center justify-between mx-auto px-5 py-10 text-xl">
      <div className="text-xl md:text-3xl font-bold">Task Management</div>
      <ul className="flex items-center space-x-4">
        {user && role === "admin" && <li className="text-sm md:text-xl"><Link to="/home">Home</Link></li>}
        {/* {user && role === "admin" && <li className="text-sm md:text-xl"><Link to="/assets">Assets</Link></li>} */}
        {/* {user && role === "admin" && <li className="text-sm md:text-xl"><Link to="/task">Tasks</Link></li>} */}
        {user && role === "worker" && <li className="text-sm md:text-xl"><Link to="/homeworker">Worker Task</Link></li>}
        {!user && <li className="text-sm md:text-xl"><Link to="/login">Auth</Link></li>}
        {user && <li><button onClick={handleLogout} className="px-4 py-2 text-sm md:text-xl bg-black text-white border rounded-xl">LogOut</button></li>}
      </ul>
    </div>
  );
};

export default Navbar;
