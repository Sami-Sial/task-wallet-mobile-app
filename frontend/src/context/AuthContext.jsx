import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user data when app starts
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await getUserDataFromAsyncStorage("userData");
                if (storedUser) setUserData(storedUser);
            } catch (error) {
                console.error("Error loading user:", error);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const storeUserDataToAsyncStoarge = async (key, value) => {
        console.log(value);
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
            setUserData(value);
            console.log("User Data stored successfully stored to async storage!");
        } catch (error) {
            console.error("Error storing user data in Aysnc storage:", error);
        }
    };

    const getUserDataFromAsyncStorage = async (key) => {
        try {
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error("Error retrieving data:", error);
        }
    };

    const clearUserDataFromAsyncStorage = async (key) => {
        try {
            const value = await AsyncStorage.removeItem(key);
            setUserData(null);
        } catch (error) {
            console.error("Error retrieving data:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                userData,
                loading,
                setUserData,
                setLoading,
                storeUserDataToAsyncStoarge,
                getUserDataFromAsyncStorage,
                clearUserDataFromAsyncStorage,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
