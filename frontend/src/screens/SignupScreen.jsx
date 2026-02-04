import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import toast from 'react-native-toast-message';
import axios from 'axios';
import { BACKEND_BASE_URL } from '@env';

const SignupScreen = () => {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
    });

    // =================== Validation ===================
    const validateForm = () => {
        const { fullName, email, password } = formData;
        if (!fullName.trim()) {
            toast.show({ type: 'error', text1: 'Full Name is required' });
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.show({ type: 'error', text1: 'Please enter a valid email' });
            return false;
        }
        if (!password || password.length < 6) {
            toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
            return false;
        }
        return true;
    };

    // =================== API Call ===================
    const handleCreateAccount = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await axios.post(
                `${BACKEND_BASE_URL}/api/auth/signup`,
                {
                    name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                }
            );

            if (response.data.success) {
                toast.show({ type: 'success', text1: 'Account created successfully! Please verify your email' });
                navigation.navigate('OtpVerify', { email: formData.email });
            } else {
                toast.show({ type: 'error', text1: response.data.message || 'Signup failed' });
            }
        } catch (err) {
            console.log('Signup Error:', err.response?.data || err.message);
            toast.show({ type: 'error', text1: err.response?.data?.message || err?.message || 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        toast.show({ type: 'info', text1: 'Google signup not implemented yet' });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#101622]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 pt-6">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Home')}
                        className="w-10 h-10 rounded-full bg-[#192233] border border-[#324467] items-center justify-center active:bg-[#135bec]/20"
                    >
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="w-12" />
                </View>

                <View className="flex-1 px-6">
                    {/* Headline Section */}
                    <View className="pt-8 pb-4">
                        <Text className="text-white text-4xl font-extrabold leading-tight tracking-tight">
                            Start Your Journey
                        </Text>
                        <Text className="text-slate-400 text-base font-normal leading-relaxed mt-2">
                            Manage tasks and track expenses in one unified space.
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View className="gap-5 mt-4">
                        {/* Full Name Field */}
                        <View className="w-full">
                            <Text className="text-slate-300 text-sm font-semibold leading-normal pb-2 ml-1">
                                Full Name
                            </Text>
                            <View
                                className="relative rounded-lg"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 10,
                                    elevation: 8,
                                }}
                            >
                                <TextInput
                                    className="w-full rounded-lg text-white border border-[#324467] bg-[#192233] h-14 px-4 text-base"
                                    value={formData.fullName}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, fullName: text })
                                    }
                                />
                            </View>
                        </View>

                        {/* Email Field */}
                        <View className="w-full">
                            <Text className="text-slate-300 text-sm font-semibold leading-normal pb-2 ml-1">
                                Email
                            </Text>
                            <View
                                className="relative rounded-lg"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 10,
                                    elevation: 8,
                                }}
                            >
                                <TextInput
                                    className="w-full rounded-lg text-white border border-[#324467] bg-[#192233] h-14 px-4 text-base"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={formData.email}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, email: text })
                                    }
                                />
                            </View>
                        </View>

                        {/* Password Field */}
                        <View className="w-full">
                            <Text className="text-slate-300 text-sm font-semibold leading-normal pb-2 ml-1">
                                Password
                            </Text>
                            <View
                                className="relative rounded-lg"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 10,
                                    elevation: 8,
                                }}
                            >
                                <TextInput
                                    className="w-full rounded-lg text-white border border-[#324467] bg-[#192233] h-14 px-4 pr-12 text-base"
                                    secureTextEntry={!showPassword}
                                    value={formData.password}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, password: text })
                                    }
                                />
                                <TouchableOpacity
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff size={22} color="#92a4c9" />
                                    ) : (
                                        <Eye size={22} color="#92a4c9" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="mt-10 gap-4 pb-12">
                        {/* Primary Button */}
                        <TouchableOpacity
                            onPress={handleCreateAccount}
                            activeOpacity={0.9}
                            className="w-full"
                            disabled={loading}
                        >
                            <View className="w-full h-14 rounded-2xl overflow-hidden">
                                <LinearGradient
                                    colors={['#135bec', '#2563eb']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="flex-1 items-center justify-center"
                                    style={{
                                        shadowColor: '#135bec',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 8,
                                        elevation: 8,
                                    }}
                                >
                                    <Text className="text-white font-bold text-lg" disabled={loading}>
                                        {loading ? 'Creating...' : 'Create Account'}
                                    </Text>
                                </LinearGradient>
                            </View>
                        </TouchableOpacity>

                        {/* Divider */}
                        {/* <View className="flex-row items-center gap-4 my-2">
                            <View className="h-[1px] flex-1 bg-slate-800" />
                            <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase">
                                OR
                            </Text>
                            <View className="h-[1px] flex-1 bg-slate-800" />
                        </View>

                        <TouchableOpacity
                            className="flex-row items-center justify-center gap-3 border border-[#324467] bg-[#192233] rounded-lg h-14 active:opacity-90"
                            onPress={handleGoogleSignup}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.5,
                                shadowRadius: 10,
                                elevation: 8,
                            }}
                        >
                            <Text className="text-white font-semibold text-base">
                                Sign up with Google
                            </Text>
                        </TouchableOpacity> */}
                    </View>

                    {/* Footer */}
                    <View className="mt-auto pb-10 items-center gap-6">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-slate-400 text-base">
                                Already have an account?
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text className="text-[#135bec] font-bold">Log in</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-slate-500 text-[11px] text-center px-4 leading-relaxed">
                            By continuing, you agree to our{' '}
                            <Text className="underline">Terms of Service</Text> and{' '}
                            <Text className="underline">Privacy Policy</Text>.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignupScreen;
