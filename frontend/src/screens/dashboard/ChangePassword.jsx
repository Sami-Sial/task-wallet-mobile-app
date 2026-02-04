import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Check,
    Lock,
} from 'lucide-react-native';
import { BACKEND_BASE_URL } from '@env';
import Toast from 'react-native-toast-message';
import { AuthContext } from "@/context/AuthContext";
import { useNavigation } from '@react-navigation/native';

const ChangePasswordScreen = () => {
    const { userData } = useContext(AuthContext);
    const navigation = useNavigation();

    const [passwordLoading, setPasswordLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Handle password change
    const handlePasswordChange = async () => {
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Please fill in all password fields',
                position: 'top',
                topOffset: 60,
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'New passwords do not match',
                position: 'top',
                topOffset: 60,
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Password must be at least 6 characters',
                position: 'top',
                topOffset: 60,
            });
            return;
        }

        setPasswordLoading(true);

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`,
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: confirmPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Toast.show({
                    type: 'success',
                    text1: 'Password changed successfully',
                    position: 'top',
                    topOffset: 60,
                });

                // Navigate back after a short delay
                setTimeout(() => {
                    navigation.goBack();
                }, 1500);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: data.message || 'Failed to change password',
                    position: 'top',
                    topOffset: 60,
                });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            Toast.show({
                type: 'error',
                text1: 'Could not change password',
                position: 'top',
                topOffset: 60,
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0f172a]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                    <View className="p-6">
                        {/* Header */}
                        <View className="flex-row items-center mb-8">
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                className="w-10 h-10 items-center justify-center rounded-full bg-slate-800/50 mr-4"
                            >
                                <ArrowLeft size={20} color="#ffffff" />
                            </TouchableOpacity>
                            <Text className="text-2xl font-bold text-white">Change Password</Text>
                        </View>

                        {/* Icon */}
                        <View className="items-center mb-8">
                            <View className="w-20 h-20 rounded-full bg-red-500/20 items-center justify-center">
                                <Lock size={32} color="#ef4444" />
                            </View>
                        </View>

                        {/* Current Password */}
                        <View className="mb-6">
                            <Text className="text-white font-medium mb-2">Current Password</Text>
                            <View className="bg-slate-800/50 rounded-2xl border border-slate-700/50 flex-row items-center px-4">
                                <Lock size={20} color="#64748b" />
                                <TextInput
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry={!showCurrentPassword}
                                    placeholder="Enter current password"
                                    placeholderTextColor="#64748b"
                                    className="flex-1 text-white py-4 px-3"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff size={20} color="#64748b" />
                                    ) : (
                                        <Eye size={20} color="#64748b" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* New Password */}
                        <View className="mb-6">
                            <Text className="text-white font-medium mb-2">New Password</Text>
                            <View className="bg-slate-800/50 rounded-2xl border border-slate-700/50 flex-row items-center px-4">
                                <Lock size={20} color="#64748b" />
                                <TextInput
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNewPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#64748b"
                                    className="flex-1 text-white py-4 px-3"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <EyeOff size={20} color="#64748b" />
                                    ) : (
                                        <Eye size={20} color="#64748b" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View className="mb-6">
                            <Text className="text-white font-medium mb-2">Confirm New Password</Text>
                            <View className="bg-slate-800/50 rounded-2xl border border-slate-700/50 flex-row items-center px-4">
                                <Lock size={20} color="#64748b" />
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#64748b"
                                    className="flex-1 text-white py-4 px-3"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} color="#64748b" />
                                    ) : (
                                        <Eye size={20} color="#64748b" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Password Requirements */}
                        <View className="bg-slate-800/30 rounded-2xl p-4 mb-6 border border-slate-700/30">
                            <Text className="text-white font-medium mb-3">Password Requirements:</Text>

                            <View className="flex-row items-center mb-2">
                                <Check
                                    size={16}
                                    color={newPassword.length >= 6 ? "#4ade80" : "#64748b"}
                                />
                                <Text className={`ml-2 ${newPassword.length >= 6 ? 'text-[#4ade80]' : 'text-slate-500'}`}>
                                    At least 6 characters
                                </Text>
                            </View>

                            <View className="flex-row items-center">
                                <Check
                                    size={16}
                                    color={
                                        newPassword &&
                                            confirmPassword &&
                                            newPassword === confirmPassword
                                            ? "#4ade80"
                                            : "#64748b"
                                    }
                                />
                                <Text
                                    className={`ml-2 ${newPassword &&
                                            confirmPassword &&
                                            newPassword === confirmPassword
                                            ? 'text-[#4ade80]'
                                            : 'text-slate-500'
                                        }`}
                                >
                                    Passwords match
                                </Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                className="flex-1 bg-slate-800/50 rounded-2xl py-4 border border-slate-700/50"
                                activeOpacity={0.7}
                            >
                                <Text className="text-white text-center font-semibold">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handlePasswordChange}
                                disabled={passwordLoading}
                                className="flex-1 bg-blue-500 rounded-2xl py-4"
                                activeOpacity={0.7}
                            >
                                {passwordLoading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text className="text-white text-center font-semibold">
                                        Update Password
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;