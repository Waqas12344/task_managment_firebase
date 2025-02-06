import React, { useState } from "react";
import { auth, db } from "../firebase/config"; // Ensure Firebase is configured
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("worker");
  const [isSignup, setIsSignup] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Save role in Firestore
        await setDoc(doc(db, "users", user.uid), {
          email,
          role,
        });
        setEmail("")
        setPassword("")
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error("Authentication Error:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center  h-[88vh] bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-2xl">
        <h2 className="text-2xl text-center uppercase font-semibold my-8">{isSignup ? "Sign Up" : "Login"}</h2>
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded mb-2 text-xl "
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
             className="w-full p-3 border rounded mb-2 text-xl "
            required
          />
          {isSignup && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
               className="w-full p-3 border rounded mb-2 text-xl "
            >
              <option value="admin">Admin</option>
              <option value="worker">Worker</option>
            </select>
          )}
          <button className="w-full text-xl bg-blue-500 text-white p-3 rounded" type="submit">
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>
        <p className="mt-4 text-base font-bold text-center">
          {isSignup ? "Already have an account ? " : "Don't have an account ? "} 
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? " Login" : " Sign Up"}
          </span>
        </p>
        {/* <p className="mt-4 text-sm text-center">
          <Link to="/">Go back to Home</Link>
        </p> */}
      </div>
    </div>
  );
};

export default Auth;
