import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle, LogIn, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const CreateNewPasswordScreen = () => {
    const navigation = useNavigation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Calculate password strength
    useEffect(() => {
        if (!newPassword) {
            setPasswordStrength(0);
            return;
        }

        let strength = 0;

        // Length check
        if (newPassword.length >= 8) strength++;

        // Has lowercase and uppercase
        if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) strength++;

        // Has numbers
        if (/\d/.test(newPassword)) strength++;

        // Has symbols
        if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) strength++;

        setPasswordStrength(strength);
    }, [newPassword]);

    const getStrengthText = () => {
        if (passwordStrength === 0) return 'Enter password';
        if (passwordStrength === 1) return 'Weak: Add more characters';
        if (passwordStrength === 2) return 'Fair: Add numbers or symbols';
        if (passwordStrength === 3) return 'Good: Consider adding symbols';
        return 'Strong: Great password!';
    };

    const handleUpdatePassword = () => {
        if (newPassword !== confirmPassword) {
            console.log('Passwords do not match');
            return;
        }

        console.log('Updating password');
        // Add your password update logic here
    };

    const handleBackToLogin = () => {
        console.log('Navigate back to login');
        // Add your navigation logic here
    };

    return (
        <SafeAreaView className="flex-1 bg-[#101622]">
            {/* Decorative Background Gradients */}
            <View
                className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full"
                style={{
                    backgroundColor: 'rgba(19, 91, 236, 0.1)',
                    opacity: 0.5,
                    transform: [{ translateX: 100 }, { translateY: -100 }],
                }}
            />
            <View
                className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full"
                style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    opacity: 0.5,
                    transform: [{ translateX: -50 }, { translateY: 100 }],
                }}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Top Navigation Bar */}
                <View className="flex-row items-center justify-between p-6">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-[#192233] border border-[#324467] items-center justify-center active:bg-[#135bec]/20">
                        <ArrowLeft size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-sm font-semibold text-[#92a4c9]">
                        Step 2 of 2
                    </Text>
                    <View className="w-10 h-10" />
                </View>

                <View className="flex-1 px-6 max-w-[480px] w-full mx-auto">
                    {/* Header Section */}
                    <View className="items-center mt-4 mb-10">
                        <View className="w-16 h-16 bg-[#135bec]/10 rounded-2xl items-center justify-center mb-6 border border-[#135bec]/20">
                            <ShieldCheck size={36} color="#135bec" />
                        </View>
                        <Text className="text-white text-3xl font-extrabold text-center mb-3">
                            Create New Password
                        </Text>
                        <Text className="text-[#92a4c9] text-base text-center px-4 leading-relaxed">
                            Your new password must be different from previous passwords.
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View className="gap-6">
                        {/* New Password Field */}
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-[#92a4c9] ml-1">
                                New Password
                            </Text>
                            <View
                                className="relative flex-row items-center rounded-xl"
                                style={{
                                    shadowColor: '#135bec',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 20,
                                    elevation: 4,
                                }}
                            >
                                <View className="absolute left-4 z-10">
                                    <Lock size={22} color="#92a4c9" />
                                </View>
                                <TextInput
                                    className="w-full h-14 bg-[#192233] border border-[#324467] rounded-xl pl-12 pr-12 text-white text-base"

                                    secureTextEntry={!showNewPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                                <TouchableOpacity
                                    className="absolute right-4 z-10"
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <EyeOff size={22} color="#92a4c9" />
                                    ) : (
                                        <Eye size={22} color="#92a4c9" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Password Strength Indicator */}
                            <View className="flex-row gap-1 px-1 mt-1">
                                {[1, 2, 3, 4].map((level) => (
                                    <View
                                        key={level}
                                        className={`h-1 flex-1 rounded-full ${level <= passwordStrength
                                            ? 'bg-[#135bec]'
                                            : 'bg-[#192233] border border-[#324467]'
                                            }`}
                                    />
                                ))}
                            </View>
                            <Text className="text-[11px] text-[#92a4c9] mt-1 ml-1">
                                {getStrengthText()}
                            </Text>
                        </View>

                        {/* Confirm Password Field */}
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-[#92a4c9] ml-1">
                                Confirm New Password
                            </Text>
                            <View
                                className="relative flex-row items-center rounded-xl"
                                style={{
                                    shadowColor: '#135bec',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 20,
                                    elevation: 4,
                                }}
                            >
                                <View className="absolute left-4 z-10">
                                    <Lock size={22} color="#92a4c9" />
                                </View>
                                <TextInput
                                    className="w-full h-14 bg-[#192233] border border-[#324467] rounded-xl pl-12 pr-12 text-white text-base"

                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <TouchableOpacity
                                    className="absolute right-4 z-10"
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={22} color="#92a4c9" />
                                    ) : (
                                        <Eye size={22} color="#92a4c9" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Action Button */}
                        <View className="pt-8 pb-4 max-w-md w-full mx-auto">
                            <TouchableOpacity
                                onPress={handleUpdatePassword}
                                activeOpacity={0.9}
                                className="overflow-hidden rounded-full"
                            >
                                <LinearGradient
                                    colors={['#135bec', '#10b981']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="w-full h-14 items-center justify-center"
                                    style={{
                                        borderRadius: 999, // 🔥 important
                                        shadowColor: '#135bec',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 8,
                                        elevation: 8,
                                    }}
                                >
                                    <Text className="text-white font-bold text-lg">
                                        Send Reset Link
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer Navigation */}
                    <View className="mt-auto py-8 items-center">
                        <TouchableOpacity
                            className="flex-row items-center gap-2"
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text className="text-[#92a4c9] text-sm font-semibold">
                                Back to Login
                            </Text>
                            <LogIn size={16} color="#92a4c9" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreateNewPasswordScreen;