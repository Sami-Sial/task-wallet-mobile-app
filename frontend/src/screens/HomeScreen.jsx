import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ClipboardList } from "lucide-react-native";
import { Link, useNavigation } from '@react-navigation/native';

export default function BalanceFlowApp() {
    const navigation = useNavigation();

    return (
        <View className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#f6f7f8] dark:bg-[#101922]">
            {/* Background Decorative Elements */}
            <View className="absolute inset-0 overflow-hidden pointer-events-none">
                <View className="absolute -top-24 -left-24 w-64 h-64 bg-[#2b8cee]/10 rounded-full" style={{ filter: 'blur(48px)' }} />
                <View className="absolute top-1/2 -right-32 w-80 h-80 bg-[#2b8cee]/5 rounded-full" style={{ filter: 'blur(48px)' }} />
                <View className="absolute bottom-10 left-10 w-24 h-24 bg-[#2b8cee]/10" style={{ borderRadius: 24, transform: [{ rotate: '12deg' }], filter: 'blur(16px)' }} />
            </View>

            <ScrollView className="flex-1">
                {/* Top Header Navigation */}
                <View className="relative flex items-center justify-center p-6 z-10">
                    <View className="flex flex-col items-center gap-2">
                        {/* <View className="bg-[#2b8cee] p-2.5 rounded-xl shadow-lg">
                            <Text className="text-white text-3xl"><ClipboardList size={32} color="white" /></Text>
                        </View> */}
                        <Text className="text-[#0d141b] dark:text-white text-2xl font-extrabold tracking-tight">
                            Task Wallet
                        </Text>
                    </View>
                </View>

                {/* Main Hero Section */}
                <View className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                    {/* Hero Illustration Container */}
                    <View className="w-full max-w-sm aspect-square relative mb-8">
                        <View className="absolute inset-0 bg-gradient-to-br from-[#2b8cee]/20 to-transparent rounded-full opacity-50" />

                        {/* Image */}
                        <View className="w-full h-full flex items-center justify-center">
                            <Image
                                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnJoch8ZftNtH4Sq0Vlr36z0H4uGsQEyvcRgJ6q8S8OaGRAOhCSLdkDjMt4CUosGvrzSzHfJpVYDEK0OKbL_tXM8bapinFm5BQ4jZuqEjiVASHzjAVt97qGfyvmnsWwfc1K3KdhXhZXL7xGBl4RQh9aPucqeJtA2Hngl8KBrLovKmmhJfugid4U9rvA2MMDxFZhd0ljD2e5evdL_NV8KPoFH21v4TbThhm8MeLIBnxx8hOmk-k3pMQg6oyVOjTsVlc_YHlj55fFi8" }}
                                className="w-full h-full rounded-3xl"

                                accessibilityLabel="Person balancing a giant checklist and a digital wallet"
                            />
                        </View>
                    </View>

                    {/* Headline Text */}
                    <View className="text-center max-w-md">
                        <Text className="text-[#0d141b] dark:text-white text-3xl font-extrabold leading-tight px-4 mb-3 text-center">
                            Your life, organized and balanced.
                        </Text>
                        <Text className="text-slate-600 dark:text-slate-400 text-lg font-medium px-8 text-center">
                            Seamlessly manage your daily tasks and track your expenses in one place.
                        </Text>
                    </View>
                </View>

                {/* Bottom Actions Section */}
                <View className="relative z-10 px-6 pb-12 pt-4 flex flex-col gap-4">
                    {/* Primary Action Button */}
                    <View className="flex">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Signup')}
                            className="flex min-w-full items-center justify-center overflow-hidden rounded-2xl h-14 px-6 bg-[#2b8cee] shadow-xl active:scale-[0.98]"
                            activeOpacity={0.8}
                        >
                            <Text className="text-white text-lg font-bold">Get Started</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Secondary Action Link */}
                    <View className="flex justify-center items-center">
                        <View className="flex flex-row items-center justify-center  gap-1 h-10">
                            <Text className="text-slate-700 dark:text-slate-300 text-md font-medium">
                                Already have an account?
                            </Text>

                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text className="text-[#2b8cee] font-bold text-lg">
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>



                </View>
            </ScrollView>
        </View>
    );
}