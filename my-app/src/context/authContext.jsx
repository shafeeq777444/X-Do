"use client"; // Required for Next.js App Router

import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    /**
     * Register User
     */
    const registerUser = async (userData) => {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:4200/api/auth/register", userData, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });
            console.log("Registration successful:", response.data);
            router.push("/login");
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error.message);
        }

        setLoading(false);
    };


    const updatePass = async (userData) => {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:4200/api/auth/updateProfileAndLogin", userData, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });
            console.log("Registration successful:", response.data);
            router.push("/dashboard");
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error.message);
        }

        setLoading(false);
    };
    /**
     * Login User
     */
    const loginUser = async (credentials) => {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:4200/api/auth/login", credentials, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });
            const { accessToken } = response.data;
            console.log("Login successful:", response.data);
            if (accessToken) {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
        }
        setLoading(false);
    };

    return <AuthContext.Provider value={{ register: registerUser, loading, loginUser,updatePass }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
