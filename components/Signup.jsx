'use client';

import Link from "next/link";
import React, { useState, useContext, useEffect } from "react";
import AuthContext from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';

export default function Signup() {
  const { error, signupUser, clearErrors } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [lineUserId, setLineUserId] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearErrors();
    }
  }, [error, clearErrors]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('lineUserId');
    const liffParams = JSON.parse(localStorage.getItem('liffParams'));

    if (storedUserId) setLineUserId(storedUserId);
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();
    signupUser({ username, password, lineUserId });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-pink-200 to-purple-300">
      <div style={{ maxWidth: "480px" }} className="mt-10 mb-20 p-6 md:p-8 bg-white rounded-3xl shadow-lg relative">
        
        {/* Cute illustration and background elements */}
        <div className="absolute top-0 left-0 w-full h-full rounded-3xl bg-pink-100 opacity-30 z-0 pointer-events-none"></div>
        <img
          src="/images/cute-bunny.png"
          alt="Cute bunny"
          className="w-16 h-16 absolute -top-8 right-8 z-10"
        />
        
        <form onSubmit={submitHandler} className="relative z-20">
          <h2 className="mb-5 text-3xl font-bold text-center text-purple-800">
            🎉 Join Grade Tracker 🎉
          </h2>
          <p className="text-center text-gray-500 mb-8">Start tracking your grades with a smile! 😊</p>

          <div className="mb-6">
            <label className="block mb-1 text-purple-700 font-semibold">Username</label>
            <input
              className="appearance-none border-2 border-purple-200 bg-pink-50 rounded-full py-3 px-4 focus:border-purple-400 focus:outline-none w-full"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 text-purple-700 font-semibold">Password</label>
            <input
              className="appearance-none border-2 border-purple-200 bg-pink-50 rounded-full py-3 px-4 focus:border-purple-400 focus:outline-none w-full"
              type="password"
              placeholder="Create a password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 text-purple-700 font-semibold">LINE User ID</label>
            <input
              className="appearance-none border-2 border-purple-200 bg-pink-50 rounded-full py-3 px-4 focus:border-purple-400 focus:outline-none w-full"
              type="text"
              placeholder="Enter your LINE User ID"
              value={lineUserId}
              onChange={(e) => setLineUserId(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="my-3 px-5 py-3 text-white bg-purple-600 rounded-full w-full font-semibold text-lg hover:bg-purple-700 transition duration-200 shadow-md"
          >
            🐰 Let's Get Started!
          </button>

          <hr className="mt-8 border-gray-300" />

          <p className="text-center mt-6 text-gray-500">
            Already have an account?{" "}
            <Link href="/signin" className="text-purple-600 font-semibold hover:underline">
              Sign in here!
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
