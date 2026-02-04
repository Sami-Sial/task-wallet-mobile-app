import React, { useRef, useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BACKEND_BASE_URL } from '@env';
import toast from 'react-native-toast-message';
import { AuthContext } from "@/context/AuthContext";


const OTPVerificationScreen = () => {
    const { storeUserDataToAsyncStoarge } = useContext(AuthContext);

    const navigation = useNavigation();
    const route = useRoute();
    const email = route.params?.email || ''; // get email from route params

    const OTP_LENGTH = 6;
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [loadingResend, setLoadingResend] = useState(false);

    const inputRefs = useRef([]);

    /* -------------------- OTP INPUT -------------------- */
    const handleOtpChange = (value, index) => {
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    /* -------------------- VERIFY OTP -------------------- */
    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== OTP_LENGTH) {
            toast.show({ type: 'error', text1: 'Please enter the full OTP' });
            return;
        }

        setLoadingVerify(true);

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.show({ type: 'error', text1: data.message || 'OTP verification failed' });
            } else {
                toast.show({ type: 'success', text1: data.message || 'OTP verified successfully' });
                await storeUserDataToAsyncStoarge("userData", data.data);

            }
        } catch (err) {
            console.error('OTP Verify API Error:', err);
            toast.show({ type: 'error', text1: 'Server error. Please try again.' });
        } finally {
            setLoadingVerify(false);
        }
    };

    /* -------------------- RESEND OTP -------------------- */
    const handleResend = async () => {
        setLoadingResend(true);

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.show({ type: 'error', text1: data.message || 'Failed to resend OTP' });
            } else {
                toast.show({ type: 'success', text1: 'OTP resent successfully' });
                setOtp(Array(OTP_LENGTH).fill(''));
                setTimeout(() => inputRefs.current[0]?.focus(), 200);
            }
        } catch (err) {
            console.error('Resend OTP API Error:', err);
            toast.show({ type: 'error', text1: 'Server error. Please try again.' });
        } finally {
            setLoadingResend(false);
        }
    };

    const activeIndex = otp.findIndex((d) => d === '');

    return (
        <SafeAreaView className="flex-1 bg-[#101922]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View className="flex-row items-center px-4 py-6">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-[#192233] border border-[#324467] items-center justify-center active:bg-[#135bec]/20"
                    >
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Title & Info */}
                <View className="items-center px-6">
                    <Text className="text-[32px] font-bold text-white text-center">
                        Verification Code
                    </Text>
                    <Text className="text-slate-400 text-center mt-3">
                        We sent a 6-digit code to{' '}
                        <Text className="text-white font-semibold">{email}</Text>
                    </Text>
                </View>

                {/* OTP Inputs */}
                <View className="mt-12 px-6">
                    <View className="flex-row justify-center gap-3">
                        {otp.map((digit, index) => (
                            <View
                                key={index}
                                className={`w-14 h-16 rounded-xl bg-slate-800/50 border-2 ${digit || index === activeIndex
                                    ? 'border-[#137fec]'
                                    : 'border-transparent'
                                    }`}
                                style={
                                    digit || index === activeIndex
                                        ? {
                                            shadowOffset: { width: 0, height: 6 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 12,
                                            elevation: 6,
                                        }
                                        : {}
                                }
                            >
                                <TextInput
                                    ref={(ref) => (inputRefs.current[index] = ref)}
                                    value={digit}
                                    onChangeText={(val) => handleOtpChange(val, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    autoFocus={index === 0}
                                    className="w-full h-full text-center text-2xl font-bold text-white"
                                    placeholder="•"
                                    placeholderTextColor="#64748b"
                                    selectTextOnFocus
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Verify Button */}
                <View className="mt-12 px-6">
                    <TouchableOpacity
                        onPress={handleVerify}
                        className="bg-[#137fec] h-14 rounded-xl items-center justify-center active:opacity-90"
                        style={{
                            shadowColor: '#137fec',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 8,
                            elevation: 8,
                        }}
                        disabled={loadingVerify}
                    >
                        {loadingVerify ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text className="text-white font-bold text-base">
                                Verify
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Resend */}
                    <View className="mt-8 items-center">
                        <TouchableOpacity
                            onPress={handleResend}
                            disabled={loadingResend}
                            className="flex-row items-center gap-2"
                        >
                            {loadingResend ? (
                                <ActivityIndicator color="#137fec" size="small" />
                            ) : (
                                <Text className="text-[#137fec] text-sm font-bold">
                                    Resend OTP
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default OTPVerificationScreen;
