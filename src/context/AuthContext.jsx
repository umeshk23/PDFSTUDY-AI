/* eslint-disable react-refresh/only-export-components */
import { useContext, createContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService.js";

const AuthContext = createContext();
const STORAGE_KEYS = {
    token: "token",
    user: "user",
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem(STORAGE_KEYS.user);
        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch {
            localStorage.removeItem(STORAGE_KEYS.user);
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem(STORAGE_KEYS.token)));

    const logout = useCallback((redirectPath = "/login") => {
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
        setUser(null);
        setIsAuthenticated(false);

        if (typeof window !== "undefined" && window.location.pathname !== redirectPath) {
            window.location.href = redirectPath;
        }
    }, []);

    const login = useCallback((userData, token) => {
        localStorage.setItem(STORAGE_KEYS.token, token);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    }, []);

    const updateUser = useCallback((updatedUser) => {
        setUser((previousUser) => {
            const nextUser = { ...(previousUser || {}), ...(updatedUser || {}) };
            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
            return nextUser;
        });
    }, []);

    const checkAuthStatus = useCallback(async () => {
        const token = localStorage.getItem(STORAGE_KEYS.token);

        if (!token) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            const profileResponse = await authService.getProfile();
            const profile = profileResponse?.data || null;

            if (!profile) {
                logout();
                return;
            }

            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile));
            setUser(profile);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Error checking auth status:", error);
            logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    useEffect(() => {
        const handleUnauthorized = () => logout();

        window.addEventListener("auth:unauthorized", handleUnauthorized);
        return () => {
            window.removeEventListener("auth:unauthorized", handleUnauthorized);
        };
    }, [logout]);

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        checkAuthStatus,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
