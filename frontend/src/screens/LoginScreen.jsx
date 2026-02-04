import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_BASE_URL } from '@env';
import Toast from 'react-native-toast-message';
import { AuthContext } from "@/context/AuthContext";

const LoginScreen = () => {
    const { storeUserDataToAsyncStoarge } = useContext(AuthContext);

    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleLogin = async () => {
        const { email, password } = formData;

        if (!email || !password) {
            Toast.show({ type: 'error', text1: 'Please enter both email and password' });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    Toast.show({ type: 'info', text1: `Account not verified. OTP sent to ${email}` });
                    navigation.navigate('OtpVerify', { email });
                } else {
                    Toast.show({ type: 'error', text1: data.message || 'Login failed' });
                }
            } else {
                Toast.show({ type: 'success', text1: data.message || 'Login successful' });
                await storeUserDataToAsyncStoarge("userData", data.data);

            }
        } catch (err) {
            console.error('Login API Error:', err);
            Toast.show({ type: 'error', text1: 'Server error. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        console.log('Login with Google');
    };

    return (
        <SafeAreaView className="flex-1 bg-[#101622]">
            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between py-4 pt-6">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Home')}
                        className="w-10 h-10 rounded-full bg-[#192233] border border-[#324467] items-center justify-center active:bg-[#135bec]/20"
                    >
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="w-12" />
                </View>

                {/* Headline */}
                <View className="pt-8 pb-6">
                    <Text className="text-white text-[32px] font-extrabold text-center tracking-tight mb-2">
                        Welcome Back
                    </Text>
                    <Text className="text-slate-400 text-base text-center px-4">
                        Manage your tasks and expenses in one place.
                    </Text>
                </View>

                {/* Form */}
                <View className="py-4 gap-4">
                    {/* Email */}
                    <View className="w-full">
                        <Text className="text-slate-300 text-sm font-semibold pb-2 ml-1">
                            Email Address
                        </Text>
                        <View
                            className="rounded-lg"
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
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View className="w-full mt-2">
                        <View className="flex-row justify-between items-center pb-2 ml-1">
                            <Text className="text-slate-300 text-sm font-semibold">Password</Text>
                            {/* <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text className="text-[#135bec] text-sm font-bold">Forgot Password?</Text>
                            </TouchableOpacity> */}
                        </View>
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
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
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

                {/* Login Button */}
                <View className="mt-10 gap-4 pb-12">
                    <TouchableOpacity
                        onPress={handleLogin}
                        activeOpacity={0.9}
                        className="w-full"
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
                                {loading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text className="text-white font-bold text-lg">Login</Text>
                                )}
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
                        onPress={handleGoogleLogin}
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.5,
                            shadowRadius: 10,
                            elevation: 8,
                        }}
                    >
                        <Text className="text-white font-semibold text-base">
                            Sign in with Google
                        </Text>
                    </TouchableOpacity> */}
                </View>

                {/* Footer */}
                <View className="p-8 items-center">
                    <View className="flex-row">
                        <Text className="text-slate-400 text-sm">
                            Don't have an account?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text className="text-[#135bec] font-bold ml-1">Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="h-8" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default LoginScreen;
