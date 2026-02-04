import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import {
    User,
    Mail,
    Calendar,
    Lock,
    ChevronRight,
    LogOut,
} from 'lucide-react-native';
import { BACKEND_BASE_URL } from '@env';
import Toast from 'react-native-toast-message';
import { AuthContext } from "@/context/AuthContext";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = () => {
    const { userData, setUserData } = useContext(AuthContext);
    const navigation = useNavigation();

    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Fetch user data
    const fetchUserData = async () => {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setUserInfo(data.data || data);
            } else {
                Toast.show({
                    type: 'error',
                    text1: data.message || 'Failed to fetch user data'
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            Toast.show({
                type: 'error',
                text1: 'Could not fetch user data'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    // Logout
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await AsyncStorage.removeItem("userData");
            setUserData(null);
            Toast.show({
                type: "success",
                text1: "Logged out successfully",
            });
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Failed to Logout",
            });
            console.log("Error logging out:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-[#0f172a] items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#0f172a]">
            <ScrollView className="flex-1">
                <View className="p-6">
                    {/* Header */}
                    <Text className="text-3xl font-bold text-white mb-8">Settings</Text>

                    {/* Profile Section */}
                    <View className="mb-8">
                        <Text className="text-lg font-semibold text-white mb-4">
                            Profile Information
                        </Text>

                        {/* Name */}
                        <View className="bg-slate-800/50 rounded-2xl p-4 mb-3 border border-slate-700/50">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                                    <User size={20} color="#3b82f6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-400 text-sm mb-1">Full Name</Text>
                                    <Text className="text-white font-medium">
                                        {userInfo?.name || 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Email */}
                        <View className="bg-slate-800/50 rounded-2xl p-4 mb-3 border border-slate-700/50">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-purple-500/20 items-center justify-center mr-3">
                                    <Mail size={20} color="#a855f7" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-400 text-sm mb-1">Email Address</Text>
                                    <Text className="text-white font-medium">
                                        {userInfo?.email || 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Created At */}
                        <View className="bg-slate-800/50 rounded-2xl p-4 mb-3 border border-slate-700/50">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-green-500/20 items-center justify-center mr-3">
                                    <Calendar size={20} color="#22c55e" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-400 text-sm mb-1">Account Created</Text>
                                    <Text className="text-white font-medium">
                                        {formatDate(userInfo?.created_at)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Updated At */}
                        <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center mr-3">
                                    <Calendar size={20} color="#f97316" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-400 text-sm mb-1">Last Updated</Text>
                                    <Text className="text-white font-medium">
                                        {formatDate(userInfo?.updated_at)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Security Section */}
                    <View className="mb-8">
                        <Text className="text-lg font-semibold text-white mb-4">Security</Text>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('ChangePassword')}
                            activeOpacity={0.7}
                            className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50"
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center mr-3">
                                    <Lock size={20} color="#ef4444" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-medium mb-1">Change Password</Text>
                                    <Text className="text-slate-400 text-sm">
                                        Update your account password
                                    </Text>
                                </View>
                                <ChevronRight size={20} color="#64748b" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                        activeOpacity={0.7}
                        className="bg-red-500/20 rounded-2xl p-4 border border-red-500/30 mb-4"
                    >
                        <View className="flex-row items-center justify-center">
                            {isLoggingOut ? (
                                <ActivityIndicator size="small" color="#ef4444" />
                            ) : (
                                <>
                                    <LogOut size={20} color="#ef4444" />
                                    <Text className="text-red-500 font-semibold ml-2">Logout</Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* App Version */}
                    <Text className="text-center text-slate-500 text-sm mt-4">
                        Version 1.0.0
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen;