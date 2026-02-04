import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import {
    Settings,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
} from 'lucide-react-native';
import { BACKEND_BASE_URL } from '@env';
import Toast from 'react-native-toast-message';
import { AuthContext } from "@/context/AuthContext";
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';

const InsightsScreen = () => {
    const { userData } = useContext(AuthContext);

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

            if (tasksRes.ok && Array.isArray(tasksData.data || tasksData)) {
                setTasks(tasksData.data || tasksData);
            } else {
                setTasks([]);
            }

            if (expensesRes.ok && Array.isArray(expensesData.data || expensesData)) {
                setExpenses(expensesData.data || expensesData);
            } else {
                setExpenses([]);
            }

            if (incomesRes.ok && Array.isArray(incomesData.data || incomesData)) {
                setIncomes(incomesData.data || incomesData);
            } else {
                setIncomes([]);
            }

        } catch (error) {
            console.error('Error fetching insights data:', error);
            Toast.show({
                type: 'error',
                text1: 'Network Error',
                text2: 'Could not fetch insights data'
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
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending' && !isOverdue(t.due_date, t.status)).length;
    const overdueTasks = tasks.filter(t => isOverdue(t.due_date, t.status)).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate financial data
    const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
    const totalExpense = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    const netBalance = totalIncome - totalExpense;

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
        const category = expense.category || 'Others';
        if (!acc[category]) {
            acc[category] = {
                total: 0,
                count: 0,
                items: []
            };
        }
        acc[category].total += parseFloat(expense.amount || 0);
        acc[category].count += 1;
        acc[category].items.push(expense);
        return acc;
    }, {});

    // Sort categories by total amount
    const sortedCategories = Object.entries(expensesByCategory)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 6);

    // Group incomes by category
    const incomesByCategory = incomes.reduce((acc, income) => {
        const category = income.category || 'Others';
        if (!acc[category]) {
            acc[category] = {
                total: 0,
                count: 0,
                items: []
            };
        }
        acc[category].total += parseFloat(income.amount || 0);
        acc[category].count += 1;
        acc[category].items.push(income);
        return acc;
    }, {});

    const sortedIncomeCategories = Object.entries(incomesByCategory)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 6);

    // Get last 7 days for trend charts
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date);
        }
        return days;
    };

    const last7Days = getLast7Days();

    // Calculate daily task completions for the last 7 days
    const dailyTaskCompletions = last7Days.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const completed = tasks.filter(task => {
            if (task.status !== 'completed' || !task.updated_at) return false;
            const taskDate = new Date(task.updated_at).toISOString().split('T')[0];
            return taskDate === dateStr;
        }).length;
        return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
            completed,
        };
    });

    // Calculate daily expenses for the last 7 days
    const dailyExpenses = last7Days.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const total = expenses.filter(expense => {
            if (!expense.transaction_date) return false;
            const expenseDate = new Date(expense.transaction_date).toISOString().split('T')[0];
            return expenseDate === dateStr;
        }).reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
        return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
            amount: total,
        };
    });

    // Calculate daily incomes for the last 7 days
    const dailyIncomes = last7Days.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const total = incomes.filter(income => {
            if (!income.transaction_date) return false;
            const incomeDate = new Date(income.transaction_date).toISOString().split('T')[0];
            return incomeDate === dateStr;
        }).reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
        return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
            amount: total,
        };
    });

    // Calculate max values for scaling
    const maxTaskCompletions = Math.max(...dailyTaskCompletions.map(d => d.completed), 1);
    const maxExpense = Math.max(...dailyExpenses.map(d => d.amount), 1);
    const maxIncome = Math.max(...dailyIncomes.map(d => d.amount), 1);

    // Category colors
    const categoryColors = [
        '#4ade80', // neon green
        '#2dd4bf', // teal
        '#fbbf24', // yellow
        '#f472b6', // pink
        '#818cf8', // indigo
        '#fb923c', // orange
        '#a78bfa', // purple
        '#34d399', // emerald
    ];

    // Calculate donut chart for expense categories
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let currentOffset = 0;

    const expenseDonutSegments = sortedCategories.map(([category, data], index) => {
        const percentage = totalExpense > 0 ? (data.total / totalExpense) * 100 : 0;
        const dashArray = (percentage / 100) * circumference;
        const segment = {
            category,
            amount: data.total,
            count: data.count,
            percentage: percentage.toFixed(1),
            color: categoryColors[index % categoryColors.length],
            dashArray: `${dashArray} ${circumference}`,
            dashOffset: -currentOffset,
        };
        currentOffset += dashArray;
        return segment;
    });

    return (
        <SafeAreaView className="flex-1 bg-[#0a1210]">
            {/* Header */}
            <View className="bg-[#0a1210]/90 border-b border-white/5 px-4 py-3">
                <View className="flex-row items-center justify-between p-2">

                    <Text className="text-lg font-bold text-white tracking-tight flex-1 text-center">
                        Analytics & Insights
                    </Text>

                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor="#4ade80"
                        colors={['#4ade80']}
                    />
                }
            >
                {isLoading ? (
                    <View className="items-center justify-center py-12">
                        <ActivityIndicator size="large" color="#4ade80" />
                    </View>
                ) : (
                    <View className="px-4">
                        {/* Overview Cards */}
                        <View className="mt-6">
                            <Text className="text-xl font-bold text-white tracking-tight mb-4">
                                Quick Overview
                            </Text>
                            <View className="flex-row gap-3 mb-3">
                                {/* Net Balance Card */}
                                <View className="flex-1 bg-gradient-to-br from-[#1a3a32] to-[#141f1c] border border-[#4ade80]/20 rounded-2xl p-4">
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <View className="bg-[#4ade80]/10 p-1.5 rounded-lg">
                                            <DollarSign size={16} color="#4ade80" />
                                        </View>
                                        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            Net Balance
                                        </Text>
                                    </View>
                                    <Text className={`text-2xl font-extrabold ${netBalance >= 0 ? 'text-[#4ade80]' : 'text-[#ff4d4d]'}`}>
                                        ${Math.abs(netBalance).toFixed(0)}
                                    </Text>
                                    <Text className="text-[10px] text-slate-500 mt-1">
                                        {netBalance >= 0 ? 'Surplus' : 'Deficit'}
                                    </Text>
                                </View>

                                {/* Completion Rate Card */}
                                <View className="flex-1 bg-[#141f1c] border border-white/5 rounded-2xl p-4">
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <View className="bg-[#2dd4bf]/10 p-1.5 rounded-lg">
                                            <CheckCircle size={16} color="#2dd4bf" />
                                        </View>
                                        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            Completion
                                        </Text>
                                    </View>
                                    <Text className="text-2xl font-extrabold text-[#2dd4bf]">
                                        {completionRate}%
                                    </Text>
                                    <Text className="text-[10px] text-slate-500 mt-1">
                                        {completedTasks}/{totalTasks} tasks
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Task Analytics Section */}
                        <View className="mt-6">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-xl font-bold text-white tracking-tight">
                                    Task Analytics
                                </Text>
                                <View className="bg-[#4ade80]/10 px-2.5 py-1 rounded-full border border-[#4ade80]/20">
                                    <Text className="text-[10px] font-bold text-[#4ade80] uppercase tracking-widest">
                                        7 Days
                                    </Text>
                                </View>
                            </View>

                            {/* Task Stats Cards */}
                            <View className="flex-row gap-3 mb-4">
                                <View className="flex-1 bg-[#141f1c] border border-white/5 rounded-xl p-3">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <CheckCircle size={14} color="#4ade80" />
                                        <Text className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                            Completed
                                        </Text>
                                    </View>
                                    <Text className="text-xl font-bold text-[#4ade80]">{completedTasks}</Text>
                                </View>

                                <View className="flex-1 bg-[#141f1c] border border-white/5 rounded-xl p-3">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <Clock size={14} color="#fbbf24" />
                                        <Text className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                            Pending
                                        </Text>
                                    </View>
                                    <Text className="text-xl font-bold text-[#fbbf24]">{pendingTasks}</Text>
                                </View>

                                <View className="flex-1 bg-[#141f1c] border border-white/5 rounded-xl p-3">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <AlertCircle size={14} color="#ff4d4d" />
                                        <Text className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                            Overdue
                                        </Text>
                                    </View>
                                    <Text className="text-xl font-bold text-[#ff4d4d]">{overdueTasks}</Text>
                                </View>
                            </View>

                            {/* Task Completion Chart */}
                            <View className="bg-[#141f1c] border border-white/5 rounded-2xl p-6">
                                <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-6">
                                    Daily Task Completions
                                </Text>

                                <View className="flex-row justify-between items-end" style={{ height: 140 }}>
                                    {dailyTaskCompletions.map((data, index) => {
                                        const heightPercent = maxTaskCompletions > 0 ? (data.completed / maxTaskCompletions) * 100 : 0;
                                        return (
                                            <View key={index} className="flex-1 items-center justify-end" style={{ height: 140 }}>
                                                <View className="w-full items-center justify-end flex-1">
                                                    {data.completed > 0 && (
                                                        <View
                                                            className="w-8 bg-[#4ade80] rounded-t-lg"
                                                            style={{
                                                                height: `${Math.max(heightPercent, 10)}%`,
                                                                shadowColor: '#4ade80',
                                                                shadowOpacity: 0.5,
                                                                shadowRadius: 10,
                                                                elevation: 5,
                                                            }}
                                                        />
                                                    )}
                                                </View>
                                                <Text className="text-[10px] font-bold text-slate-600 mt-3">
                                                    {data.day}
                                                </Text>
                                                {data.completed > 0 && (
                                                    <Text className="text-[9px] font-medium text-[#4ade80] mt-0.5">
                                                        {data.completed}
                                                    </Text>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>

                        {/* Expense Analytics Section */}
                        <View className="mt-10">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-xl font-bold text-white tracking-tight">
                                    Expense Analytics
                                </Text>
                                <View className="bg-[#ff4d4d]/10 px-2.5 py-1 rounded-full border border-[#ff4d4d]/20">
                                    <Text className="text-[10px] font-bold text-[#ff4d4d] uppercase tracking-widest">
                                        BY CATEGORY
                                    </Text>
                                </View>
                            </View>

                            {/* Expense Summary */}
                            <View className="bg-gradient-to-br from-[#2e1a1a] to-[#141f1c] border border-[#ff4d4d]/20 rounded-2xl p-5 mb-4">
                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                            Total Expenses
                                        </Text>
                                        <Text className="text-3xl font-extrabold text-white">
                                            ${totalExpense.toFixed(0)}
                                        </Text>
                                        <Text className="text-[10px] text-slate-500 mt-1">
                                            {expenses.length} transactions
                                        </Text>
                                    </View>
                                    <View className="bg-[#ff4d4d]/10 p-3 rounded-xl">
                                        <TrendingDown size={28} color="#ff4d4d" />
                                    </View>
                                </View>
                            </View>

                            {/* Expense Donut Chart */}
                            {sortedCategories.length > 0 && (
                                <View className="bg-[#141f1c] border border-white/5 rounded-2xl p-6 items-center mb-4">
                                    <View className="w-48 h-48 items-center justify-center mb-6">
                                        <Svg width={192} height={192} viewBox="0 0 100 100">
                                            <G rotation="-90" origin="50, 50">
                                                <Circle
                                                    cx="50"
                                                    cy="50"
                                                    r={radius}
                                                    stroke="#1e293b"
                                                    strokeWidth="10"
                                                    fill="transparent"
                                                />
                                                {expenseDonutSegments.map((segment, index) => (
                                                    <Circle
                                                        key={index}
                                                        cx="50"
                                                        cy="50"
                                                        r={radius}
                                                        stroke={segment.color}
                                                        strokeWidth="10"
                                                        fill="transparent"
                                                        strokeDasharray={segment.dashArray}
                                                        strokeDashoffset={segment.dashOffset}
                                                    />
                                                ))}
                                            </G>
                                        </Svg>

                                        <View className="absolute items-center justify-center">
                                            <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                                                Categories
                                            </Text>
                                            <Text className="text-2xl font-bold text-white mt-0.5">
                                                {sortedCategories.length}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Category List */}
                                    <View className="w-full">
                                        {expenseDonutSegments.map((segment, index) => (
                                            <View key={index} className="flex-row items-center justify-between py-3 border-b border-white/5">
                                                <View className="flex-row items-center gap-3 flex-1">
                                                    <View
                                                        className="w-3 h-3 rounded-sm"
                                                        style={{
                                                            backgroundColor: segment.color,
                                                            shadowColor: segment.color,
                                                            shadowOpacity: 0.4,
                                                            shadowRadius: 8,
                                                            elevation: 3,
                                                        }}
                                                    />
                                                    <View className="flex-1">
                                                        <Text className="text-sm font-bold text-white">
                                                            {segment.category}
                                                        </Text>
                                                        <Text className="text-[10px] text-slate-500">
                                                            {segment.count} {segment.count === 1 ? 'transaction' : 'transactions'}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View className="items-end">
                                                    <Text className="text-sm font-bold text-white">
                                                        ${segment.amount.toFixed(0)}
                                                    </Text>
                                                    <Text className="text-[10px] text-[#ff4d4d] font-medium">
                                                        {segment.percentage}%
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Daily Expense Trend */}
                            <View className="bg-[#141f1c] border border-white/5 rounded-2xl p-6">
                                <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-6">
                                    7-Day Expense Trend
                                </Text>

                                <View className="flex-row justify-between items-end" style={{ height: 120 }}>
                                    {dailyExpenses.map((data, index) => {
                                        const heightPercent = maxExpense > 0 ? (data.amount / maxExpense) * 100 : 0;
                                        return (
                                            <View key={index} className="flex-1 items-center justify-end" style={{ height: 120 }}>
                                                <View className="w-full items-center justify-end flex-1">
                                                    {data.amount > 0 && (
                                                        <View
                                                            className="w-8 bg-[#ff4d4d] rounded-t-lg"
                                                            style={{
                                                                height: `${Math.max(heightPercent, 10)}%`,
                                                                shadowColor: '#ff4d4d',
                                                                shadowOpacity: 0.4,
                                                                shadowRadius: 10,
                                                                elevation: 5,
                                                            }}
                                                        />
                                                    )}
                                                </View>
                                                <Text className="text-[10px] font-bold text-slate-600 mt-3">
                                                    {data.day}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>

                        {/* Income Analytics Section */}
                        <View className="mt-10 mb-6">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-xl font-bold text-white tracking-tight">
                                    Income Analytics
                                </Text>
                                <View className="bg-[#4ade80]/10 px-2.5 py-1 rounded-full border border-[#4ade80]/20">
                                    <Text className="text-[10px] font-bold text-[#4ade80] uppercase tracking-widest">
                                        BY SOURCE
                                    </Text>
                                </View>
                            </View>

                            {/* Income Summary */}
                            <View className="bg-gradient-to-br from-[#1a3a32] to-[#141f1c] border border-[#4ade80]/20 rounded-2xl p-5 mb-4">
                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                            Total Income
                                        </Text>
                                        <Text className="text-3xl font-extrabold text-white">
                                            ${totalIncome.toFixed(0)}
                                        </Text>
                                        <Text className="text-[10px] text-slate-500 mt-1">
                                            {incomes.length} transactions
                                        </Text>
                                    </View>
                                    <View className="bg-[#4ade80]/10 p-3 rounded-xl">
                                        <TrendingUp size={28} color="#4ade80" />
                                    </View>
                                </View>
                            </View>

                            {/* Income by Category */}
                            {sortedIncomeCategories.length > 0 && (
                                <View className="bg-[#141f1c] border border-white/5 rounded-2xl p-5">
                                    <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-4">
                                        Income Sources
                                    </Text>
                                    {sortedIncomeCategories.map(([category, data], index) => {
                                        const percentage = totalIncome > 0 ? ((data.total / totalIncome) * 100).toFixed(1) : 0;
                                        return (
                                            <View key={index} className="mb-4">
                                                <View className="flex-row items-center justify-between mb-2">
                                                    <View className="flex-row items-center gap-2 flex-1">
                                                        <View
                                                            className="w-2.5 h-2.5 rounded-full"
                                                            style={{
                                                                backgroundColor: categoryColors[index % categoryColors.length],
                                                                shadowColor: categoryColors[index % categoryColors.length],
                                                                shadowOpacity: 0.5,
                                                                shadowRadius: 6,
                                                                elevation: 3,
                                                            }}
                                                        />
                                                        <Text className="text-sm font-bold text-white flex-1">
                                                            {category}
                                                        </Text>
                                                    </View>
                                                    <View className="items-end">
                                                        <Text className="text-sm font-bold text-[#4ade80]">
                                                            ${data.total.toFixed(0)}
                                                        </Text>
                                                        <Text className="text-[10px] text-slate-500">
                                                            {data.count} {data.count === 1 ? 'entry' : 'entries'}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View className="bg-slate-800 h-2 rounded-full overflow-hidden">
                                                    <View
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            backgroundColor: categoryColors[index % categoryColors.length],
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Daily Income Trend */}
                            <View className="bg-[#141f1c] border border-white/5 rounded-2xl p-6 mt-4">
                                <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-6">
                                    7-Day Income Trend
                                </Text>

                                <View className="flex-row justify-between items-end" style={{ height: 120 }}>
                                    {dailyIncomes.map((data, index) => {
                                        const heightPercent = maxIncome > 0 ? (data.amount / maxIncome) * 100 : 0;
                                        return (
                                            <View key={index} className="flex-1 items-center justify-end" style={{ height: 120 }}>
                                                <View className="w-full items-center justify-end flex-1">
                                                    {data.amount > 0 && (
                                                        <View
                                                            className="w-8 bg-[#4ade80] rounded-t-lg"
                                                            style={{
                                                                height: `${Math.max(heightPercent, 10)}%`,
                                                                shadowColor: '#4ade80',
                                                                shadowOpacity: 0.5,
                                                                shadowRadius: 10,
                                                                elevation: 5,
                                                            }}
                                                        />
                                                    )}
                                                </View>
                                                <Text className="text-[10px] font-bold text-slate-600 mt-3">
                                                    {data.day}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default InsightsScreen;