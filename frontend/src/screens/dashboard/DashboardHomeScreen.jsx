import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
    Image,
    TouchableOpacity
} from 'react-native';
import {
    List,
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    TrendingDown,
} from 'lucide-react-native';
import { BACKEND_BASE_URL } from '@env';
import Toast from 'react-native-toast-message';
import { AuthContext } from "@/context/AuthContext";
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = () => {
    const { userData, setUserData } = useContext(AuthContext);

    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const [tasks, setTasks] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch all data
    const fetchAllData = async () => {
        try {
            const [tasksRes, expensesRes, incomesRes] = await Promise.all([
                fetch(`${BACKEND_BASE_URL}/api/task`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userData.token}`,
                    },
                }),
                fetch(`${BACKEND_BASE_URL}/api/expense`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userData.token}`,
                    },
                }),
                fetch(`${BACKEND_BASE_URL}/api/income`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userData.token}`,
                    },
                }),
            ]);

            const tasksData = await tasksRes.json();
            const expensesData = await expensesRes.json();
            const incomesData = await incomesRes.json();

            // Set tasks
            if (tasksRes.ok && Array.isArray(tasksData.data || tasksData)) {
                setTasks(tasksData.data || tasksData);
            } else {
                setTasks([]);
            }

            // Set expenses
            if (expensesRes.ok && Array.isArray(expensesData.data || expensesData)) {
                setExpenses(expensesData.data || expensesData);
            } else {
                setExpenses([]);
            }

            // Set incomes
            if (incomesRes.ok && Array.isArray(incomesData.data || incomesData)) {
                setIncomes(incomesData.data || incomesData);
            } else {
                setIncomes([]);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            Toast.show({
                type: 'error',
                text1: 'Network Error',
                text2: 'Could not fetch dashboard data'
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchAllData();
    };

    // Helper function to check if a task is overdue
    const isOverdue = (dateString, status) => {
        if (!dateString || status === 'completed') return false;
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const date = new Date(dateString);
            date.setHours(0, 0, 0, 0);
            if (isNaN(date.getTime())) return false;
            return date < today;
        } catch (error) {
            return false;
        }
    };

    // Calculate task statistics
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending' && !isOverdue(t.due_date, t.status)).length;
    const overdueTasks = tasks.filter(t => isOverdue(t.due_date, t.status)).length;

    // Calculate completion percentage
    const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Calculate financial data
    const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
    const totalExpense = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

    // Calculate income change (comparing current month to previous month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthIncome = incomes.filter(income => {
        const date = new Date(income.transaction_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);

    const prevMonthIncome = incomes.filter(income => {
        const date = new Date(income.transaction_date);
        return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    }).reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);

    const incomeChange = prevMonthIncome > 0
        ? ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100
        : 0;

    // Get current month expenses
    const monthlyExpenses = expenses.filter(expense => {
        const date = new Date(expense.transaction_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    // Get user's first name
    const firstName = userData?.name?.split(' ')[0] || 'User';

    // Calculate SVG circle properties for progress ring
    const radius = 92;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;


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

    return (
        <SafeAreaView className="flex-1 bg-[#0D1412]">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor="#39FF14"
                        colors={['#39FF14']}
                    />
                }
            >
                {/* Top Navigation */}
                <View className="px-6 pt-6 pb-4">
                    <View className="flex-row items-center justify-between">
                        {/* Left: Greeting */}
                        <View>
                            <Text className="text-white text-xl font-extrabold tracking-tight">
                                Hi, Welcome back 👋
                            </Text>
                            <Text className="text-slate-300 text-base mt-1 font-semibold">
                                {userData.user.name}
                            </Text>
                        </View>

                        {/* Right: Logout Button */}
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="flex-row items-center bg-red-500/20 px-4 py-2 rounded-full"
                            activeOpacity={0.7}
                        >
                            {isLoggingOut ? <ActivityIndicator color="#0a1210" /> : <Text className="text-red-400 font-semibold">
                                Logout
                            </Text>}
                        </TouchableOpacity>
                    </View>
                </View>



                {/* Loading State */}
                {isLoading && (
                    <View className="items-center justify-center py-12">
                        <ActivityIndicator size="large" color="#39FF14" />
                    </View>
                )}

                {!isLoading && (
                    <>
                        {/* Section: Task Status */}
                        <View className="px-6 pt-6">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-white/90 text-lg font-bold tracking-tight">Task Status</Text>
                                <View className="bg-[#39FF14]/10 px-2.5 py-1 rounded-full border border-[#39FF14]/20">
                                    <Text className="text-[10px] font-bold text-[#39FF14] uppercase tracking-widest">
                                        ACTIVE
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row flex-wrap gap-4">
                                {/* Total Tasks */}
                                <View className="flex-1 min-w-[45%] flex-col gap-1 rounded-2xl p-5 bg-[#131E1B] border border-white/5 shadow-lg">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <List size={18} color="#39FF14" opacity={0.6} />
                                        <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                            TOTAL
                                        </Text>
                                    </View>
                                    <Text className="text-[#39FF14] text-3xl font-extrabold leading-none tracking-tight">
                                        {totalTasks}
                                    </Text>
                                </View>

                                {/* Done Tasks */}
                                <View className="flex-1 min-w-[45%] flex-col gap-1 rounded-2xl p-5 bg-[#131E1B] border border-white/5 shadow-lg">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <CheckCircle size={18} color="#39FF14" />
                                        <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                            DONE
                                        </Text>
                                    </View>
                                    <Text className="text-[#39FF14] text-3xl font-extrabold leading-none tracking-tight">
                                        {doneTasks}
                                    </Text>
                                </View>

                                {/* Pending Tasks */}
                                <View className="flex-1 min-w-[45%] flex-col gap-1 rounded-2xl p-5 bg-[#131E1B] border border-white/5 shadow-lg">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <Clock size={18} color="#39FF14" opacity={0.6} />
                                        <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                            PENDING
                                        </Text>
                                    </View>
                                    <Text className="text-[#39FF14] text-3xl font-extrabold leading-none tracking-tight">
                                        {pendingTasks}
                                    </Text>
                                </View>

                                {/* Overdue Tasks */}
                                <View className="flex-1 min-w-[45%] flex-col gap-1 rounded-2xl p-5 bg-[#131E1B] border border-white/5 shadow-lg">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <AlertCircle size={18} color="#FF3131" opacity={0.8} />
                                        <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                            OVERDUE
                                        </Text>
                                    </View>
                                    <Text className="text-[#39FF14] text-3xl font-extrabold leading-none tracking-tight">
                                        {overdueTasks}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Section: Central Progress Ring */}
                        <View className="px-6 py-10 items-center">
                            <View className="relative items-center justify-center w-56 h-56">
                                {/* Progress Ring */}
                                <Svg width={224} height={224} className="transform -rotate-90">
                                    {/* Background Circle */}
                                    <Circle
                                        cx={112}
                                        cy={112}
                                        r={radius}
                                        stroke="rgba(255, 255, 255, 0.05)"
                                        strokeWidth={10}
                                        fill="transparent"
                                    />
                                    {/* Progress Circle */}
                                    <Circle
                                        cx={112}
                                        cy={112}
                                        r={radius}
                                        stroke="#39FF14"
                                        strokeWidth={12}
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                    />
                                </Svg>

                                {/* Inner Text */}
                                <View className="absolute items-center justify-center">
                                    <Text className="text-5xl font-black text-white tracking-tighter">
                                        {completionPercentage}%
                                    </Text>
                                    <Text className="text-xs font-bold text-[#39FF14]/80 uppercase tracking-[0.2em] mt-1">
                                        COMPLETE
                                    </Text>
                                </View>
                            </View>

                            {/* Legend */}
                            <View className="flex-row gap-6 mt-6">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-2 h-2 rounded-full bg-[#39FF14]" style={{ shadowColor: '#39FF14', shadowOpacity: 0.6, shadowRadius: 8 }} />
                                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        Completed
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <View className="w-2 h-2 rounded-full bg-white/10" />
                                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        Remaining
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Section: Financial Summary */}
                        <View className="px-6 pb-6">
                            <Text className="text-white/90 text-lg font-bold tracking-tight mb-4">
                                Financial Summary
                            </Text>

                            <View className="flex-col gap-4">
                                {/* Income Card */}
                                <View className="relative overflow-hidden rounded-2xl p-6 bg-[#131E1B] border border-[#39FF14]/10 shadow-lg">
                                    <View className="absolute top-0 right-0 p-4 opacity-10">
                                        <TrendingUp size={70} color="#39FF14" />
                                    </View>
                                    <View className="relative z-10 flex-col gap-1">
                                        <Text className="text-[#39FF14]/70 text-[10px] font-black uppercase tracking-[0.2em]">
                                            TOTAL INCOME
                                        </Text>
                                        <View className="flex-row items-baseline gap-2">
                                            <Text className="text-white text-3xl font-extrabold">
                                                ${totalIncome.toFixed(2)}
                                            </Text>
                                            {incomeChange !== 0 && (
                                                <View className="bg-[#39FF14]/10 px-1.5 py-0.5 rounded">
                                                    <Text className="text-[#39FF14] text-xs font-bold">
                                                        {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(0)}%
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                {/* Expense Card */}
                                <View className="relative overflow-hidden rounded-2xl p-6 bg-[#131E1B] border border-white/5 shadow-lg">
                                    <View className="absolute top-0 right-0 p-4 opacity-10">
                                        <TrendingDown size={70} color="#FFFFFF" />
                                    </View>
                                    <View className="relative z-10 flex-col gap-1">
                                        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                            TOTAL EXPENSES
                                        </Text>
                                        <View className="flex-row items-baseline gap-2">
                                            <Text className="text-white text-3xl font-extrabold">
                                                ${monthlyExpenses.toFixed(2)}
                                            </Text>
                                            <Text className="text-slate-500 text-xs font-bold">
                                                Monthly
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default DashboardScreen;