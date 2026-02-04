import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');

    const handleSendResetLink = () => {
        console.log('Sending reset link to:', email);
        // Add your password reset logic here
    };

    const handleBackToLogin = () => {
        console.log('Navigate back to login');
        // Add your navigation logic here
    };

    return (
        <SafeAreaView className="flex-1 bg-[#101622]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Top Navigation */}
                <View className="flex-row items-center p-4 pb-2 justify-between">
                    <TouchableOpacity onPress={() => navigation.navigate('Login')} className="w-10 h-10 rounded-full bg-[#192233] border border-[#324467] items-center justify-center active:bg-[#135bec]/20">
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Hero Section: Icon */}
                <View className="items-center justify-center pt-10 pb-6 px-4">
                    <View className="w-32 h-32 rounded-full items-center justify-center mb-6">
                        {/* Radial gradient effect container */}
                        <View
                            className="w-full h-full rounded-full items-center justify-center"
                            style={{
                                backgroundColor: 'rgba(19, 91, 236, 0.08)',
                            }}
                        >
                            <View
                                className="bg-[#135bec]/20 p-6 rounded-full border border-[#135bec]/30"
                                style={{
                                    shadowColor: '#135bec',
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 20,
                                    elevation: 10,
                                }}
                            >
                                <Lock size={60} color="#135bec" strokeWidth={1.5} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Headline & Description */}
                <View className="items-center px-4">
                    <Text className="text-white text-[28px] font-bold text-center pb-3">
                        Forgot Password?
                    </Text>
                    <Text className="text-gray-400 text-base text-center pb-8 pt-1 px-8 leading-normal">
                        Enter your email address below to receive a secure link to reset your password.
                    </Text>
                </View>

                {/* Input Field */}
                <View className="px-6 py-3 max-w-md w-full mx-auto">
                    <View className="w-full">
                        <Text className="text-white text-sm font-medium pb-2 ml-1">
                            Email Address
                        </Text>
                        <View
                            className="relative rounded-xl"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 4,
                            }}
                        >
                            <TextInput
                                className="w-full rounded-xl text-white border border-[#324467] bg-[#192233] h-14 pl-12 pr-4 text-base"

                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                            <View className="absolute left-4 top-4">
                                <Mail size={20} color="#5c6e91" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Button */}
                <View className="px-6 pt-8 pb-4 max-w-md w-full mx-auto">
                    <TouchableOpacity
                        onPress={handleSendResetLink}
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


                {/* Back to Login */}
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

                {/* Bottom Safe Area Spacer */}
                <View className="h-5" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;