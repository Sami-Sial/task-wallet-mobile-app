import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
    Modal,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {
    X,
    Plus,
    Calendar,
    CreditCard,
    Wallet,
    Tag,
    TrendingUp,
    Banknote,
    Loader,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { BACKEND_BASE_URL } from '@env';
import { AuthContext } from "@/context/AuthContext";
import { useNavigation } from '@react-navigation/native';


const UnifiedAddScreen = () => {
    const navigation = useNavigation();
    const { userData } = useContext(AuthContext);
    const [entryType, setEntryType] = useState('task'); // 'task', 'expense', or 'income'
    const [isLoading, setIsLoading] = useState(false);

    // Task fields (matching database schema)
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskPriority, setTaskPriority] = useState('medium');
    const [taskDueDate, setTaskDueDate] = useState(new Date());
    const [taskCategory, setTaskCategory] = useState('');
    const [showTaskCategoryModal, setShowTaskCategoryModal] = useState(false);
    const [customTaskCategory, setCustomTaskCategory] = useState('');

    // Expense fields (matching database schema)
    const [expenseTitle, setExpenseTitle] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('');
    const [expenseTransactionDate, setExpenseTransactionDate] = useState(new Date());
    const [expenseNotes, setExpenseNotes] = useState('');
    const [expensePaymentMethod, setExpensePaymentMethod] = useState('credit');
    const [showExpenseCategoryModal, setShowExpenseCategoryModal] = useState(false);
    const [customExpenseCategory, setCustomExpenseCategory] = useState('');

    // Income fields (matching database schema)
    const [incomeTitle, setIncomeTitle] = useState('');
    const [incomeAmount, setIncomeAmount] = useState('');
    const [incomeCategory, setIncomeCategory] = useState('');
    const [incomeTransactionDate, setIncomeTransactionDate] = useState(new Date());
    const [incomeNotes, setIncomeNotes] = useState('');
    const [incomePaymentMethod, setIncomePaymentMethod] = useState('bank');
    const [showIncomeCategoryModal, setShowIncomeCategoryModal] = useState(false);
    const [customIncomeCategory, setCustomIncomeCategory] = useState('');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date()); // Temporary date for picker

    // Task categories
    const taskCategories = [
        { id: 'work', name: 'Work' },
        { id: 'personal', name: 'Personal' },
        { id: 'health', name: 'Health' },
        { id: 'finance', name: 'Finance' },
        { id: 'shopping', name: 'Shopping' },
        { id: 'home', name: 'Home' },
    ];

    // Expense categories
    const expenseCategories = [
        { id: 'food', name: 'Food & Drinks' },
        { id: 'transport', name: 'Transportation' },
        { id: 'shopping', name: 'Shopping' },
        { id: 'housing', name: 'Housing' },
        { id: 'entertainment', name: 'Entertainment' },
        { id: 'health', name: 'Health & Fitness' },
    ];

    // Income categories
    const incomeCategories = [
        { id: 'salary', name: 'Salary' },
        { id: 'freelance', name: 'Freelance' },
        { id: 'business', name: 'Business' },
        { id: 'investment', name: 'Investment' },
        { id: 'gift', name: 'Gift' },
        { id: 'other', name: 'Other' },
    ];

    const handleClose = () => {
        console.log('Close pressed');
    };


    // Create Task API Call
    const createTask = async () => {
        try {
            setIsLoading(true);

            // Combine date and time for due_date (DATETIME)
            const dueDateTime = new Date(taskDueDate);

            const taskData = {
                title: taskTitle,
                description: taskDescription,
                category: taskCategory,
                due_date: dueDateTime.toISOString(), // Format: YYYY-MM-DD HH:MM:SS
                priority: taskPriority, // 'high', 'medium', 'low'
            };

            const response = await fetch(`${BACKEND_BASE_URL}/api/task`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`,
                },
                body: JSON.stringify(taskData),
            });

            const result = await response.json();

            if (response.ok) {
                Toast.show({ type: 'success', text1: 'Task created successfully!' });
                // Reset form
                resetTaskForm();
            } else {
                Toast.show({ type: 'error', text1: result.message || 'Failed to create task' });
            }
        } catch (error) {
            console.error('Error creating task:', error);
            Toast.show({ type: 'error', text1: 'An error occurred while creating the task' });
        } finally {
            setIsLoading(false);
        }
    };

    // Create Expense API Call
    const createExpense = async () => {
        try {
            setIsLoading(true);

            const expenseData = {
                title: expenseTitle,
                amount: parseFloat(expenseAmount),
                category: expenseCategory,
                notes: expenseNotes,
                transaction_date: expenseTransactionDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
                payment_method: expensePaymentMethod, // 'credit', 'cash', etc.
            };

            const response = await fetch(`${BACKEND_BASE_URL}/api/expense`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`,
                },
                body: JSON.stringify(expenseData),
            });

            const result = await response.json();

            if (response.ok) {
                Toast.show({ type: 'success', text1: 'Expense created successfully!' });
                // Reset form
                resetExpenseForm();
            } else {
                Toast.show({ type: 'error', text1: result.message || 'Failed to create expense' });
            }
        } catch (error) {
            console.error('Error creating expense:', error);
            Toast.show({ type: 'error', text1: 'An error occurred while creating the expense' });
        } finally {
            setIsLoading(false);
        }
    };

    // Create Income API Call
    const createIncome = async () => {
        try {
            setIsLoading(true);

            const incomeData = {
                title: incomeTitle,
                amount: parseFloat(incomeAmount),
                category: incomeCategory,
                notes: incomeNotes,
                transaction_date: incomeTransactionDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
                payment_method: incomePaymentMethod, // 'bank', 'cash', 'check'
            };

            const response = await fetch(`${BACKEND_BASE_URL}/api/income`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`,
                },
                body: JSON.stringify(incomeData),
            });

            const result = await response.json();

            if (response.ok) {
                Toast.show({ type: 'success', text1: 'Income created successfully!' });
                // Reset form
                resetIncomeForm();
            } else {
                Toast.show({ type: 'error', text1: result.message || 'Failed to create income' });
            }
        } catch (error) {
            console.error('Error creating income:', error);
            Toast.show({ type: 'error', text1: 'An error occurred while creating the income' });
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form functions
    const resetTaskForm = () => {
        setTaskTitle('');
        setTaskDescription('');
        setTaskPriority('medium');
        setTaskDueDate(new Date());
        setTaskCategory('');
    };

    const resetExpenseForm = () => {
        setExpenseTitle('');
        setExpenseAmount('');
        setExpenseCategory('');
        setExpenseTransactionDate(new Date());
        setExpenseNotes('');
        setExpensePaymentMethod('credit');
    };

    const resetIncomeForm = () => {
        setIncomeTitle('');
        setIncomeAmount('');
        setIncomeCategory('');
        setIncomeTransactionDate(new Date());
        setIncomeNotes('');
        setIncomePaymentMethod('bank');
    };

    const handleAdd = () => {
        // Validation
        if (entryType === 'task') {
            if (!taskTitle.trim()) {
                Toast.show({ type: 'error', text1: 'Please enter a task title' });
                return;
            }
            if (!taskCategory) {
                Toast.show({ type: 'error', text1: 'Please select a category' });
                return;
            }
            createTask();
        } else if (entryType === 'expense') {
            if (!expenseTitle.trim()) {
                Toast.show({ type: 'error', text1: 'Please enter an expense title' });
                return;
            }
            if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
                Toast.show({ type: 'error', text1: 'Please enter a valid amount' });
                return;
            }
            if (!expenseCategory) {
                Toast.show({ type: 'error', text1: 'Please select a category' });
                return;
            }
            createExpense();
        } else {
            if (!incomeTitle.trim()) {
                Toast.show({ type: 'error', text1: 'Please enter an income title' });
                return;
            }
            if (!incomeAmount || parseFloat(incomeAmount) <= 0) {
                Toast.show({ type: 'error', text1: 'Please enter a valid amount' });
                return;
            }
            if (!incomeCategory) {
                Toast.show({ type: 'error', text1: 'Please select a category' });
                return;
            }
            createIncome();
        }
    };

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }

        if (selectedDate) {
            if (entryType === 'task') {
                setTaskDueDate(selectedDate);
                if (Platform.OS === 'android') {
                    // On Android, show time picker after date is selected
                    setTimeout(() => setShowTimePicker(true), 100);
                }
            } else if (entryType === 'expense') {
                setExpenseTransactionDate(selectedDate);
            } else {
                setIncomeTransactionDate(selectedDate);
            }

            if (Platform.OS === 'ios') {
                setShowDatePicker(false);
            }
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }

        if (event.type === 'dismissed') {
            setShowTimePicker(false);
            return;
        }

        if (selectedTime) {
            // Combine the date from taskDueDate with the time from selectedTime
            const currentDate = new Date(taskDueDate);
            currentDate.setHours(selectedTime.getHours());
            currentDate.setMinutes(selectedTime.getMinutes());
            currentDate.setSeconds(0);
            setTaskDueDate(currentDate);

            if (Platform.OS === 'ios') {
                setShowTimePicker(false);
            }
        }
    };

    const handleSelectTaskCategory = (categoryId) => {
        setTaskCategory(categoryId);
        setShowTaskCategoryModal(false);
    };

    const handleAddCustomTaskCategory = () => {
        if (customTaskCategory.trim()) {
            setTaskCategory(customTaskCategory);
            setCustomTaskCategory('');
            setShowTaskCategoryModal(false);
        }
    };

    const handleSelectExpenseCategory = (categoryId) => {
        setExpenseCategory(categoryId);
        setShowExpenseCategoryModal(false);
    };

    const handleAddCustomExpenseCategory = () => {
        if (customExpenseCategory.trim()) {
            setExpenseCategory(customExpenseCategory);
            setCustomExpenseCategory('');
            setShowExpenseCategoryModal(false);
        }
    };

    const handleSelectIncomeCategory = (categoryId) => {
        setIncomeCategory(categoryId);
        setShowIncomeCategoryModal(false);
    };

    const handleAddCustomIncomeCategory = () => {
        if (customIncomeCategory.trim()) {
            setIncomeCategory(customIncomeCategory);
            setCustomIncomeCategory('');
            setShowIncomeCategoryModal(false);
        }
    };

    const getTaskCategoryName = () => {
        const found = taskCategories.find(c => c.id === taskCategory);
        return found ? found.name : taskCategory || 'Select Category';
    };

    const getExpenseCategoryName = () => {
        const found = expenseCategories.find(c => c.id === expenseCategory);
        return found ? found.name : expenseCategory || 'Select Category';
    };

    const getIncomeCategoryName = () => {
        const found = incomeCategories.find(c => c.id === incomeCategory);
        return found ? found.name : incomeCategory || 'Select Category';
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDateTime = (date) => {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#102216]">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Top App Bar */}
                <View className="flex-row items-center bg-[#102216] p-4 pb-2 justify-between">
                    <TouchableOpacity
                        className="w-12 h-12 items-center justify-start"
                        onPress={() => navigation.goBack()}
                    >
                        <X size={24} color="rgba(255, 255, 255, 0.7)" />
                    </TouchableOpacity>

                    <Text className="text-white text-lg font-bold flex-1 text-center tracking-tight">
                        Add New
                    </Text>

                </View>

                {/* Segmented Buttons */}
                <View className="px-4 py-2">
                    <View className="h-11 flex-row items-center justify-center rounded-xl bg-[#193322] p-1 border border-white/5">
                        <TouchableOpacity
                            className={`h-full flex-1 items-center justify-center rounded-lg ${entryType === 'task'
                                ? 'bg-[#13ec5b]/20'
                                : 'bg-transparent'
                                }`}
                            onPress={() => setEntryType('task')}
                        >
                            <Text
                                className={`text-sm font-semibold ${entryType === 'task'
                                    ? 'text-[#13ec5b]'
                                    : 'text-[#92c9a4]'
                                    }`}
                            >
                                Task
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`h-full flex-1 items-center justify-center rounded-lg ${entryType === 'expense'
                                ? 'bg-[#13ec5b]/20'
                                : 'bg-transparent'
                                }`}
                            onPress={() => setEntryType('expense')}
                        >
                            <Text
                                className={`text-sm font-semibold ${entryType === 'expense'
                                    ? 'text-[#13ec5b]'
                                    : 'text-[#92c9a4]'
                                    }`}
                            >
                                Expense
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`h-full flex-1 items-center justify-center rounded-lg ${entryType === 'income'
                                ? 'bg-[#13ec5b]/20'
                                : 'bg-transparent'
                                }`}
                            onPress={() => setEntryType('income')}
                        >
                            <Text
                                className={`text-sm font-semibold ${entryType === 'income'
                                    ? 'text-[#13ec5b]'
                                    : 'text-[#92c9a4]'
                                    }`}
                            >
                                Income
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="h-2" />

                {/* Task Form */}
                {entryType === 'task' && (
                    <View>
                        {/* Title */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Title
                            </Text>
                            <TextInput
                                className="w-full rounded-xl text-white border border-[#326744] bg-[#193322] h-14 px-4 text-base"
                                placeholder="What needs to be done?"
                                placeholderTextColor="rgba(146, 201, 164, 0.5)"
                                value={taskTitle}
                                onChangeText={setTaskTitle}
                            />
                        </View>

                        {/* Description */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Description
                            </Text>
                            <TextInput
                                className="w-full rounded-xl text-white border border-[#326744] bg-[#193322] min-h-[144px] px-4 py-4 text-base"
                                placeholder="Add more details..."
                                placeholderTextColor="rgba(146, 201, 164, 0.5)"
                                multiline
                                textAlignVertical="top"
                                value={taskDescription}
                                onChangeText={setTaskDescription}
                            />
                        </View>

                        {/* Category */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Category
                            </Text>
                            <TouchableOpacity
                                className="w-full rounded-xl border border-[#326744] bg-[#193322] h-14 px-4 flex-row items-center justify-between"
                                onPress={() => setShowTaskCategoryModal(true)}
                            >
                                <Text className={`text-base ${taskCategory ? 'text-white' : 'text-[#92c9a4]/50'}`}>
                                    {getTaskCategoryName()}
                                </Text>
                                <Tag size={20} color="#92c9a4" />
                            </TouchableOpacity>
                        </View>

                        {/* Priority */}
                        <Text className="text-white/70 text-sm font-medium px-5 pb-2 pt-4">
                            Priority
                        </Text>
                        <View className="px-4 py-2 flex-row gap-2">
                            {['low', 'medium', 'high'].map((priority) => (
                                <TouchableOpacity
                                    key={priority}
                                    className={`flex-1 py-3 px-2 rounded-xl border ${taskPriority === priority
                                        ? 'border-[#13ec5b] bg-[#13ec5b]/20'
                                        : 'border-[#326744] bg-[#193322]'
                                        }`}
                                    onPress={() => setTaskPriority(priority)}
                                >
                                    <Text
                                        className={`text-sm text-center capitalize ${taskPriority === priority
                                            ? 'font-bold text-[#13ec5b]'
                                            : 'font-medium text-white/80'
                                            }`}
                                    >
                                        {priority}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Due Date and Time */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Due Date & Time
                            </Text>
                            <View className="flex-row gap-2">
                                <TouchableOpacity
                                    className="flex-1 rounded-xl border border-[#326744] bg-[#193322] h-14 px-4 justify-center"
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text className="text-white text-base">
                                        {taskDueDate.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="w-28 rounded-xl border border-[#326744] bg-[#193322] h-14 px-4 justify-center"
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text className="text-white text-base">
                                        {formatTime(taskDueDate)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Expense Form */}
                {entryType === 'expense' && (
                    <View>
                        {/* Title */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Title
                            </Text>
                            <TextInput
                                className="w-full rounded-xl text-white border border-[#326744] bg-[#193322] h-14 px-4 text-base"
                                placeholder="Enter expense title..."
                                placeholderTextColor="rgba(146, 201, 164, 0.5)"
                                value={expenseTitle}
                                onChangeText={setExpenseTitle}
                            />
                        </View>

                        {/* Amount */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Amount
                            </Text>
                            <View className="relative flex-row items-center">
                                <Text className="absolute left-4 text-[#13ec5b] font-bold text-xl z-10">
                                    $
                                </Text>
                                <TextInput
                                    className="w-full rounded-xl text-white border border-[#326744] bg-[#193322] h-14 pl-10 pr-4 text-xl font-bold"
                                    placeholder="0.00"
                                    placeholderTextColor="rgba(146, 201, 164, 0.5)"
                                    keyboardType="decimal-pad"
                                    value={expenseAmount}
                                    onChangeText={setExpenseAmount}
                                />
                            </View>
                        </View>

                        {/* Category */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Category
                            </Text>
                            <TouchableOpacity
                                className="w-full rounded-xl border border-[#326744] bg-[#193322] h-14 px-4 flex-row items-center justify-between"
                                onPress={() => setShowExpenseCategoryModal(true)}
                            >
                                <Text className={`text-base ${expenseCategory ? 'text-white' : 'text-[#92c9a4]/50'}`}>
                                    {getExpenseCategoryName()}
                                </Text>
                                <Tag size={20} color="#92c9a4" />
                            </TouchableOpacity>
                        </View>

                        {/* Date and Time */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Transaction Date
                            </Text>
                            <TouchableOpacity
                                className="w-full rounded-xl border border-[#326744] bg-[#193322] h-14 px-4 justify-center"
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text className="text-white text-base">
                                    {expenseTransactionDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Payment Method */}
                        <Text className="text-white/70 text-sm font-medium px-5 pb-2 pt-4">
                            Payment Method
                        </Text>
                        <View className="px-4 py-2 gap-2">
                            <TouchableOpacity
                                className="flex-row items-center justify-between bg-[#193322] p-4 rounded-xl border border-[#326744]"
                                onPress={() => setExpensePaymentMethod('credit')}
                            >
                                <View className="flex-row items-center gap-3">
                                    <CreditCard size={20} color="#13ec5b" />
                                    <Text className="text-white font-medium">Credit Card</Text>
                                </View>
                                <View
                                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${expensePaymentMethod === 'credit'
                                        ? 'border-[#13ec5b]'
                                        : 'border-[#326744]'
                                        }`}
                                >
                                    {expensePaymentMethod === 'credit' && (
                                        <View className="w-2.5 h-2.5 rounded-full bg-[#13ec5b]" />
                                    )}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`flex-row items-center justify-between bg-[#193322] p-4 rounded-xl border border-[#326744] ${expensePaymentMethod !== 'cash' ? 'opacity-60' : ''
                                    }`}
                                onPress={() => setExpensePaymentMethod('cash')}
                            >
                                <View className="flex-row items-center gap-3">
                                    <Wallet size={20} color={expensePaymentMethod === 'cash' ? '#13ec5b' : 'rgba(255, 255, 255, 0.5)'} />
                                    <Text className="text-white font-medium">Cash</Text>
                                </View>
                                <View
                                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${expensePaymentMethod === 'cash'
                                        ? 'border-[#13ec5b]'
                                        : 'border-[#326744]'
                                        }`}
                                >
                                    {expensePaymentMethod === 'cash' && (
                                        <View className="w-2.5 h-2.5 rounded-full bg-[#13ec5b]" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Notes */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Notes
                            </Text>
                            <TextInput
                                className="w-full rounded-xl text-white border border-[#326744] bg-[#193322] min-h-[96px] px-4 py-4 text-base"
                                placeholder="Add notes..."
                                placeholderTextColor="rgba(146, 201, 164, 0.5)"
                                multiline
                                textAlignVertical="top"
                                value={expenseNotes}
                                onChangeText={setExpenseNotes}
                            />
                        </View>
                    </View>
                )}

                {/* Income Form */}
                {entryType === 'income' && (
                    <View>
                        {/* Title */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Title
                            </Text>
                            <TextInput
                                className="w-full rounded-xl text-white border border-[#326744] bg-[#193322] h-14 px-4 text-base"
                                placeholder="Enter income title..."
                                placeholderTextColor="rgba(146, 201, 164, 0.5)"
                                value={incomeTitle}
                                onChangeText={setIncomeTitle}
                            />
                        </View>

                        {/* Amount */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Amount
                            </Text>
                            <View className="relative flex-row items-center">
                                <Text className="absolute left-4 text-[#13ec5b] font-bold text-xl z-10">
                                    $
                                </Text>
                                <TextInput
                                    className="w-full rounded-xl text-white border border-[#326744] bg-[#193322] h-14 pl-10 pr-4 text-xl font-bold"
                                    placeholder="0.00"
                                    placeholderTextColor="rgba(146, 201, 164, 0.5)"
                                    keyboardType="decimal-pad"
                                    value={incomeAmount}
                                    onChangeText={setIncomeAmount}
                                />
                            </View>
                        </View>

                        {/* Category */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Category
                            </Text>
                            <TouchableOpacity
                                className="w-full rounded-xl border border-[#326744] bg-[#193322] h-14 px-4 flex-row items-center justify-between"
                                onPress={() => setShowIncomeCategoryModal(true)}
                            >
                                <Text className={`text-base ${incomeCategory ? 'text-white' : 'text-[#92c9a4]/50'}`}>
                                    {getIncomeCategoryName()}
                                </Text>
                                <Tag size={20} color="#92c9a4" />
                            </TouchableOpacity>
                        </View>

                        {/* Date and Time */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Transaction Date
                            </Text>
                            <TouchableOpacity
                                className="w-full rounded-xl border border-[#326744] bg-[#193322] h-14 px-4 justify-center"
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text className="text-white text-base">
                                    {incomeTransactionDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Income Source */}
                        <Text className="text-white/70 text-sm font-medium px-5 pb-2 pt-4">
                            Source
                        </Text>
                        <View className="px-4 py-2 gap-2">
                            <TouchableOpacity
                                className="flex-row items-center justify-between bg-[#193322] p-4 rounded-xl border border-[#326744]"
                                onPress={() => setIncomePaymentMethod('bank')}
                            >
                                <View className="flex-row items-center gap-3">
                                    <TrendingUp size={20} color="#13ec5b" />
                                    <Text className="text-white font-medium">Bank Transfer</Text>
                                </View>
                                <View
                                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${incomePaymentMethod === 'bank'
                                        ? 'border-[#13ec5b]'
                                        : 'border-[#326744]'
                                        }`}
                                >
                                    {incomePaymentMethod === 'bank' && (
                                        <View className="w-2.5 h-2.5 rounded-full bg-[#13ec5b]" />
                                    )}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`flex-row items-center justify-between bg-[#193322] p-4 rounded-xl border border-[#326744] ${incomePaymentMethod !== 'cash' ? 'opacity-60' : ''
                                    }`}
                                onPress={() => setIncomePaymentMethod('cash')}
                            >
                                <View className="flex-row items-center gap-3">
                                    <Banknote size={20} color={incomePaymentMethod === 'cash' ? '#13ec5b' : 'rgba(255, 255, 255, 0.5)'} />
                                    <Text className="text-white font-medium">Cash</Text>
                                </View>
                                <View
                                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${incomePaymentMethod === 'cash'
                                        ? 'border-[#13ec5b]'
                                        : 'border-[#326744]'
                                        }`}
                                >
                                    {incomePaymentMethod === 'cash' && (
                                        <View className="w-2.5 h-2.5 rounded-full bg-[#13ec5b]" />
                                    )}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`flex-row items-center justify-between bg-[#193322] p-4 rounded-xl border border-[#326744] ${incomePaymentMethod !== 'check' ? 'opacity-60' : ''
                                    }`}
                                onPress={() => setIncomePaymentMethod('check')}
                            >
                                <View className="flex-row items-center gap-3">
                                    <CreditCard size={20} color={incomePaymentMethod === 'check' ? '#13ec5b' : 'rgba(255, 255, 255, 0.5)'} />
                                    <Text className="text-white font-medium">Check</Text>
                                </View>
                                <View
                                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${incomePaymentMethod === 'check'
                                        ? 'border-[#13ec5b]'
                                        : 'border-[#326744]'
                                        }`}
                                >
                                    {incomePaymentMethod === 'check' && (
                                        <View className="w-2.5 h-2.5 rounded-full bg-[#13ec5b]" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Notes */}
                        <View className="px-4 py-3">
                            <Text className="text-white/70 text-sm font-medium pb-2 px-1">
                                Notes
                            </Text>
                            <TextInput
                                className="w-full rounded-xl text-white border border-[#326744] bg-[#193322] min-h-[96px] px-4 py-4 text-base"
                                placeholder="Add notes..."
                                placeholderTextColor="rgba(146, 201, 164, 0.5)"
                                multiline
                                textAlignVertical="top"
                                value={incomeNotes}
                                onChangeText={setIncomeNotes}
                            />
                        </View>
                    </View>
                )}

                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={
                            entryType === 'task'
                                ? taskDueDate
                                : entryType === 'expense'
                                    ? expenseTransactionDate
                                    : incomeTransactionDate
                        }
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                    />
                )}

                {/* Time Picker - Only for Tasks */}
                {showTimePicker && entryType === 'task' && (
                    <DateTimePicker
                        value={taskDueDate}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleTimeChange}
                    />
                )}
            </ScrollView>

            {/* Category Selection Modal for Tasks */}
            <Modal
                visible={showTaskCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowTaskCategoryModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-[#102216] rounded-t-3xl p-6 pb-10">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-white text-xl font-bold">Select Category</Text>
                            <TouchableOpacity onPress={() => setShowTaskCategoryModal(false)}>
                                <X size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
                            <View className="gap-2">
                                {taskCategories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        className={`p-4 rounded-xl border ${taskCategory === category.id
                                            ? 'border-[#13ec5b] bg-[#13ec5b]/10'
                                            : 'border-[#326744] bg-[#193322]'
                                            }`}
                                        onPress={() => handleSelectTaskCategory(category.id)}
                                    >
                                        <Text className={`text-base font-medium ${taskCategory === category.id ? 'text-[#13ec5b]' : 'text-white'
                                            }`}>
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}

                                {/* Custom Category Input */}
                                <View className="mt-4 border-t border-[#326744] pt-4">
                                    <Text className="text-white/70 text-sm font-medium mb-2">
                                        Or add custom category
                                    </Text>
                                    <View className="flex-row gap-2">
                                        <TextInput
                                            className="flex-1 rounded-xl text-white border border-[#326744] bg-[#193322] h-12 px-4 text-base"
                                            placeholder="Enter category name..."
                                            placeholderTextColor="rgba(146, 201, 164, 0.5)"
                                            value={customTaskCategory}
                                            onChangeText={setCustomTaskCategory}
                                        />
                                        <TouchableOpacity
                                            className="w-12 h-12 items-center justify-center rounded-xl bg-[#13ec5b]"
                                            onPress={handleAddCustomTaskCategory}
                                        >
                                            <Plus size={24} color="#102216" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Category Selection Modal for Expenses */}
            <Modal
                visible={showExpenseCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowExpenseCategoryModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-[#102216] rounded-t-3xl p-6 pb-10">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-white text-xl font-bold">Select Category</Text>
                            <TouchableOpacity onPress={() => setShowExpenseCategoryModal(false)}>
                                <X size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
                            <View className="gap-2">
                                {expenseCategories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        className={`p-4 rounded-xl border ${expenseCategory === category.id
                                            ? 'border-[#13ec5b] bg-[#13ec5b]/10'
                                            : 'border-[#326744] bg-[#193322]'
                                            }`}
                                        onPress={() => handleSelectExpenseCategory(category.id)}
                                    >
                                        <Text className={`text-base font-medium ${expenseCategory === category.id ? 'text-[#13ec5b]' : 'text-white'
                                            }`}>
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}

                                {/* Custom Category Input */}
                                <View className="mt-4 border-t border-[#326744] pt-4">
                                    <Text className="text-white/70 text-sm font-medium mb-2">
                                        Or add custom category
                                    </Text>
                                    <View className="flex-row gap-2">
                                        <TextInput
                                            className="flex-1 rounded-xl text-white border border-[#326744] bg-[#193322] h-12 px-4 text-base"
                                            placeholder="Enter category name..."
                                            placeholderTextColor="rgba(146, 201, 164, 0.5)"
                                            value={customExpenseCategory}
                                            onChangeText={setCustomExpenseCategory}
                                        />
                                        <TouchableOpacity
                                            className="w-12 h-12 items-center justify-center rounded-xl bg-[#13ec5b]"
                                            onPress={handleAddCustomExpenseCategory}
                                        >
                                            <Plus size={24} color="#102216" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Category Selection Modal for Income */}
            <Modal
                visible={showIncomeCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowIncomeCategoryModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-[#102216] rounded-t-3xl p-6 pb-10">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-white text-xl font-bold">Select Category</Text>
                            <TouchableOpacity onPress={() => setShowIncomeCategoryModal(false)}>
                                <X size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
                            <View className="gap-2">
                                {incomeCategories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        className={`p-4 rounded-xl border ${incomeCategory === category.id
                                            ? 'border-[#13ec5b] bg-[#13ec5b]/10'
                                            : 'border-[#326744] bg-[#193322]'
                                            }`}
                                        onPress={() => handleSelectIncomeCategory(category.id)}
                                    >
                                        <Text className={`text-base font-medium ${incomeCategory === category.id ? 'text-[#13ec5b]' : 'text-white'
                                            }`}>
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}

                                {/* Custom Category Input */}
                                <View className="mt-4 border-t border-[#326744] pt-4">
                                    <Text className="text-white/70 text-sm font-medium mb-2">
                                        Or add custom category
                                    </Text>
                                    <View className="flex-row gap-2">
                                        <TextInput
                                            className="flex-1 rounded-xl text-white border border-[#326744] bg-[#193322] h-12 px-4 text-base"
                                            placeholder="Enter category name..."
                                            placeholderTextColor="rgba(146, 201, 164, 0.5)"
                                            value={customIncomeCategory}
                                            onChangeText={setCustomIncomeCategory}
                                        />
                                        <TouchableOpacity
                                            className="w-12 h-12 items-center justify-center rounded-xl bg-[#13ec5b]"
                                            onPress={handleAddCustomIncomeCategory}
                                        >
                                            <Plus size={24} color="#102216" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Floating Bottom Action */}
            <View
                className="absolute bottom-0 left-0 right-0 p-4"
                style={{
                    background: 'linear-gradient(to top, #102216, transparent)',
                }}
            >
                <TouchableOpacity
                    className="w-full bg-[#13ec5b] py-4 rounded-xl shadow-lg active:opacity-90"
                    onPress={handleAdd}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View className="flex-row items-center justify-center gap-2">
                            <ActivityIndicator size="small" color="#102216" />
                            <Text className="text-black font-bold text-center text-base">
                                Creating...
                            </Text>
                        </View>
                    ) : (
                        <Text className="text-black font-bold text-center text-base">
                            Create Entry
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default UnifiedAddScreen;