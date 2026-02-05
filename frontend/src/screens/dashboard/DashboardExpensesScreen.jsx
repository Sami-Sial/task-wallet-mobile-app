import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import {
    Menu,
    User,
    ShoppingBag,
    Coffee,
    Tv,
    Car,
    Wallet,
    TrendingUp,
    TrendingDown,
    Plus,
    CheckSquare,
    DollarSign,
    BarChart3,
    Settings,
    List,
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
} from 'lucide-react-native';
import { BACKEND_BASE_URL } from '@env';
import Toast from 'react-native-toast-message';
import { AuthContext } from "@/context/AuthContext";
import { useNavigation } from '@react-navigation/native';

const ExpensesScreen = () => {
    const { userData } = useContext(AuthContext);
    const navigation = useNavigation();

    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');

    // Fetch expenses from API
    const fetchExpenses = async () => {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/expense`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`,
                },
            });

            const result = await response.json();
            console.log('Expenses:', result);

            if (response.ok) {
                const fetchedExpenses = result.data || result;
                if (Array.isArray(fetchedExpenses)) {
                    setExpenses(fetchedExpenses);
                } else {
                    console.error('Expenses is not an array:', fetchedExpenses);
                    setExpenses([]);
                }
            } else {
                console.error('Failed to fetch expenses:', result.message);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to load expenses',
                    text2: result.message
                });
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            Toast.show({
                type: 'error',
                text1: 'Network Error',
                text2: 'Could not fetch expenses'
            });
        }
    };

    // Fetch incomes from API
    const fetchIncomes = async () => {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/income`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`,
                },
            });

            const result = await response.json();
            console.log('Incomes:', result);

            if (response.ok) {
                const fetchedIncomes = result.data || result;
                if (Array.isArray(fetchedIncomes)) {
                    setIncomes(fetchedIncomes);
                } else {
                    console.error('Incomes is not an array:', fetchedIncomes);
                    setIncomes([]);
                }
            } else {
                console.error('Failed to fetch incomes:', result.message);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to load incomes',
                    text2: result.message
                });
            }
        } catch (error) {
            console.error('Error fetching incomes:', error);
            Toast.show({
                type: 'error',
                text1: 'Network Error',
                text2: 'Could not fetch incomes'
            });
        }
    };

    // Fetch all data
    const fetchAllData = async () => {
        setIsLoading(true);
        await Promise.all([fetchExpenses(), fetchIncomes()]);
        setIsLoading(false);
        setIsRefreshing(false);
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchAllData();
    }, []);

    // Handle pull-to-refresh
    const onRefresh = () => {
        setIsRefreshing(true);
        fetchAllData();
    };

    // Helper function to check if a date is today
    const isToday = (dateString) => {
        if (!dateString) return false;
        try {
            const today = new Date();
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return false;
            return date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
        } catch (error) {
            return false;
        }
    };

    // Calculate statistics
    const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
    const totalExpense = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    const totalBalance = totalIncome - totalExpense;

    // Combine and sort transactions by date (most recent first)
    const allTransactions = [
        ...expenses.map(e => ({ ...e, type: 'expense' })),
        ...incomes.map(i => ({ ...i, type: 'income' }))
    ].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

    // Filter transactions based on selected filter
    const getFilteredTransactions = () => {
        let filtered = [];

        switch (selectedFilter) {
            case 'Expenses':
                filtered = allTransactions.filter(t => t.type === 'expense');
                break;
            case 'Income':
                filtered = allTransactions.filter(t => t.type === 'income');
                break;
            case 'Today':
                filtered = allTransactions.filter(t => isToday(t.transaction_date));
                break;
            case 'All':
            default:
                filtered = allTransactions;
                break;
        }

        return filtered;
    };

    const filteredTransactions = getFilteredTransactions();

    // Group transactions by date with Today at top
    const groupTransactionsByDate = (transactions) => {
        const todayTransactions = [];
        const yesterdayTransactions = [];
        const olderTransactions = {};

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        transactions.forEach(transaction => {
            const date = new Date(transaction.transaction_date);

            if (date.toDateString() === today.toDateString()) {
                todayTransactions.push(transaction);
            } else if (date.toDateString() === yesterday.toDateString()) {
                yesterdayTransactions.push(transaction);
            } else {
                const label = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                if (!olderTransactions[label]) {
                    olderTransactions[label] = [];
                }
                olderTransactions[label].push(transaction);
            }
        });

        // Build the final grouped object with Today first
        const grouped = {};

        if (todayTransactions.length > 0) {
            grouped['Today'] = todayTransactions;
        }

        if (yesterdayTransactions.length > 0) {
            grouped['Yesterday'] = yesterdayTransactions;
        }

        // Add older transactions in chronological order
        Object.keys(olderTransactions)
            .sort((a, b) => new Date(b) - new Date(a))
            .forEach(key => {
                grouped[key] = olderTransactions[key];
            });

        return grouped;
    };

    const groupedTransactions = groupTransactionsByDate(filteredTransactions);

    // Calculate filter counts
    const expenseCount = expenses.length;
    const incomeCount = incomes.length;
    const todayCount = allTransactions.filter(t => isToday(t.transaction_date)).length;
    const allCount = allTransactions.length;

    // Define filters
    const filters = [
        { id: 'all', name: 'All', icon: List, count: allCount },
        { id: 'expenses', name: 'Expenses', icon: ArrowDownCircle, count: expenseCount },
        { id: 'income', name: 'Income', icon: ArrowUpCircle, count: incomeCount },
        { id: 'today', name: 'Today', icon: Calendar, count: todayCount },
    ];

    // Get category icon
    const getCategoryIcon = (category) => {
        const categoryLower = category?.toLowerCase() || '';

        if (categoryLower.includes('food') || categoryLower.includes('groceries')) return ShoppingBag;
        if (categoryLower.includes('dining') || categoryLower.includes('restaurant')) return Coffee;
        if (categoryLower.includes('entertainment') || categoryLower.includes('subscription')) return Tv;
        if (categoryLower.includes('transport') || categoryLower.includes('fuel') || categoryLower.includes('gas')) return Car;
        if (categoryLower.includes('income') || categoryLower.includes('salary')) return Wallet;

        return DollarSign;
    };

    // Format time from transaction date
    const formatTime = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return '';
        }
    };

    const handleAddExpense = () => {
        console.log('Add new expense');
        // Navigate to add expense screen
    };

    return (
        <SafeAreaView className="flex-1 bg-[#112116]">
            {/* Top App Bar */}
            <View className="p-4 pb-2">
                <View className="flex-row items-center justify-between rounded-lg">
                    <View className="w-10 h-10 items-center justify-center bg-green-500 rounded-full">
                        <DollarSign size={24} color="white" />
                    </View>

                    <Text className="text-white text-lg font-bold flex-1 ml-4">
                        Expense Manager
                    </Text>

                    <TouchableOpacity
                        className="bg-green-500 px-4 py-2 rounded-lg items-center justify-center"
                        onPress={() => navigation.navigate("UnifiedAdd")}
                    >
                        <Text className="text-white font-semibold">Add +</Text>
                    </TouchableOpacity>
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
                        tintColor="#19e65e"
                        colors={['#19e65e']}
                    />
                }
            >
                {/* Stats Summary Section */}
                {!isLoading && (
                    <View className="flex-row gap-4 p-4">
                        {/* Total Balance Card */}
                        <View className="flex-1 rounded-xl p-6 bg-[#1a3321] shadow-lg border border-white/5">
                            <Text className="text-white/70 text-sm font-medium">Total Balance</Text>
                            <Text className="text-[#19e65e] text-2xl font-bold mt-2">
                                ${totalBalance.toFixed(2)}
                            </Text>
                        </View>

                        {/* Total Spending Card */}
                        <View className="flex-1 rounded-xl p-6 bg-[#1a3321] shadow-lg border border-white/5">
                            <Text className="text-white/70 text-sm font-medium">Total Spending</Text>
                            <Text className="text-white text-2xl font-bold mt-2">
                                ${totalExpense.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Filter Chips */}
                {!isLoading && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="px-4 py-2"
                        contentContainerStyle={{ gap: 12 }}
                    >
                        {filters.map((filter) => {
                            const IconComponent = filter.icon;
                            const isActive = selectedFilter === filter.name;

                            return (
                                <TouchableOpacity
                                    key={filter.id}
                                    className={`h-10 flex-row items-center justify-center gap-2 rounded-xl px-4 shadow-sm ${isActive
                                        ? 'bg-[#19e65e]'
                                        : 'bg-[#244730]'
                                        }`}
                                    onPress={() => setSelectedFilter(filter.name)}
                                >
                                    <IconComponent
                                        size={20}
                                        color={isActive ? '#112116' : 'white'}
                                    />
                                    <Text
                                        className={`text-sm font-bold ${isActive ? 'text-[#112116]' : 'text-white'
                                            }`}
                                    >
                                        {filter.name}
                                    </Text>
                                    {filter.count > 0 && (
                                        <View
                                            className={`ml-1 px-2 py-0.5 rounded-full ${isActive ? 'bg-[#112116]/20' : 'bg-[#19e65e]/20'
                                                }`}
                                        >
                                            <Text
                                                className={`text-xs font-bold ${isActive ? 'text-[#112116]' : 'text-[#19e65e]'
                                                    }`}
                                            >
                                                {filter.count}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                {/* Loading State */}
                {isLoading && (
                    <View className="items-center justify-center py-12">
                        <ActivityIndicator size="large" color="#19e65e" />
                    </View>
                )}

                {/* Section Header */}
                {!isLoading && filteredTransactions.length > 0 && (
                    <View className="flex-row justify-between items-end px-4 pt-4 pb-2">
                        <Text className="text-white text-lg font-bold">
                            {selectedFilter === 'All' ? 'Recent Transactions' : `${selectedFilter}`}
                        </Text>
                    </View>
                )}

                {/* Empty State */}
                {!isLoading && allTransactions.length === 0 && (
                    <View className="px-4 py-12 items-center">
                        <DollarSign size={48} color="#346544" />
                        <Text className="text-white text-lg font-bold mt-4">No transactions yet</Text>
                        <Text className="text-[#93c8a5] text-sm mt-2 text-center">
                            Start by adding your first expense or income
                        </Text>
                    </View>
                )}

                {/* Filtered Empty State */}
                {!isLoading && allTransactions.length > 0 && filteredTransactions.length === 0 && (
                    <View className="px-4 py-12 items-center">
                        <DollarSign size={48} color="#346544" />
                        <Text className="text-white text-lg font-bold mt-4">
                            No {selectedFilter.toLowerCase()} transactions
                        </Text>
                        <Text className="text-[#93c8a5] text-sm mt-2 text-center">
                            {selectedFilter === 'Today'
                                ? 'No transactions recorded today'
                                : `You don't have any ${selectedFilter.toLowerCase()} transactions`
                            }
                        </Text>
                    </View>
                )}

                {/* Transaction List */}
                {!isLoading && filteredTransactions.length > 0 && (
                    <View className="flex-col gap-1 px-2 pb-8">
                        {Object.entries(groupedTransactions).map(([dateLabel, transactions]) => (
                            <View key={dateLabel}>
                                {/* Date Group Header */}
                                <Text className="text-white/40 text-xs font-bold uppercase tracking-widest px-4 py-3">
                                    {dateLabel}
                                </Text>

                                {/* Transactions in this date group */}
                                {transactions.map((transaction) => (
                                    <TransactionItem
                                        key={`${transaction.type}-${transaction.id}`}
                                        transaction={transaction}
                                        getCategoryIcon={getCategoryIcon}
                                        formatTime={formatTime}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// Transaction Item Component
const TransactionItem = ({ transaction, getCategoryIcon, formatTime }) => {
    const isIncome = transaction.type === 'income';
    const IconComponent = getCategoryIcon(transaction.category);

    return (
        <TouchableOpacity
            className="flex-row items-center gap-4 bg-transparent active:bg-white/5 px-4 min-h-[72px] py-2 justify-between rounded-xl"
        >
            <View className="flex-row items-center gap-4 flex-1">
                {/* Icon */}
                <View
                    className={`w-12 h-12 items-center justify-center rounded-xl shadow-sm ${isIncome ? 'bg-[#19e65e]/20' : 'bg-[#23482f]'
                        }`}
                >
                    <IconComponent
                        size={24}
                        color={isIncome ? '#19e65e' : 'white'}
                    />
                </View>

                {/* Transaction Details */}
                <View className="flex-1">
                    <Text className="text-white text-base font-semibold" numberOfLines={1}>
                        {transaction.title}
                    </Text>
                    <Text className="text-white/50 text-xs" numberOfLines={1}>
                        {transaction.category} • {formatTime(transaction.transaction_date)}
                    </Text>
                </View>
            </View>

            {/* Amount */}
            <View className="items-end">
                <Text
                    className={`text-base font-bold ${isIncome ? 'text-[#19e65e]' : 'text-white'
                        }`}
                >
                    {isIncome ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                </Text>
                {transaction.payment_method && (
                    <Text className="text-white/40 text-xs mt-0.5">
                        {transaction.payment_method}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ExpensesScreen;