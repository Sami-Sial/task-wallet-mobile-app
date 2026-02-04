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
    Calendar,
    User,
    List,
    Clock,
    CalendarDays,
    CheckCircle,
    AlertCircle,
} from 'lucide-react-native';
import TaskSkeleton from '@/components/skeletons/TasksList';
import { BACKEND_BASE_URL } from '@env';
import Toast from 'react-native-toast-message';
import { AuthContext } from "@/context/AuthContext";
import { useNavigation } from '@react-navigation/native';

const TaskListScreen = () => {
    const { userData } = useContext(AuthContext);
    const navigation = useNavigation();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');

    // Fetch tasks from API
    const fetchTasks = async () => {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/task`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`,
                },
            });

            const result = await response.json();
            console.log(result);

            if (response.ok) {
                const fetchedTasks = result.data || result;

                // Ensure it's an array
                if (Array.isArray(fetchedTasks)) {
                    setTasks(fetchedTasks);
                    console.log(`Loaded ${fetchedTasks.length} tasks`);
                } else {
                    console.error('Tasks is not an array:', fetchedTasks);
                    setTasks([]);
                }
            } else {
                console.error('Failed to fetch tasks:', result.message);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to load tasks',
                    text2: result.message
                });
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            Toast.show({
                type: 'error',
                text1: 'Network Error',
                text2: 'Could not fetch tasks'
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Fetch tasks on component mount
    useEffect(() => {
        fetchTasks();
    }, []);

    // Handle pull-to-refresh
    const onRefresh = () => {
        setIsRefreshing(true);
        fetchTasks();
    };

    // Toggle task completion
    const toggleTask = async (taskId) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';

            // Optimistically update UI
            setTasks(tasks.map(t =>
                t.id === taskId ? { ...t, status: newStatus } : t
            ));

            // Update on server
            const response = await fetch(`${BACKEND_BASE_URL}/api/task/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                // Revert on failure
                setTasks(tasks.map(t =>
                    t.id === taskId ? { ...t, status: task.status } : t
                ));
                console.error('Failed to update task status');
                Toast.show({
                    type: 'error',
                    text1: 'Failed to update task'
                });
            }
        } catch (error) {
            console.error('Error toggling task:', error);
            // Revert on error
            fetchTasks();
        }
    };

    const handleAddTask = () => {
        console.log('Add new task');
        // Navigate to add task screen
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

    // Helper function to check if a date is upcoming (future)
    const isUpcoming = (dateString) => {
        if (!dateString) return false;

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const date = new Date(dateString);
            date.setHours(0, 0, 0, 0);

            if (isNaN(date.getTime())) return false;

            return date > today;
        } catch (error) {
            return false;
        }
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

    // Filter tasks based on selected filter
    const getFilteredTasks = () => {
        switch (selectedFilter) {
            case 'Today':
                return tasks.filter(task => isToday(task.due_date));
            case 'Upcoming':
                return tasks.filter(task => isUpcoming(task.due_date) && !isToday(task.due_date));
            case 'Overdue':
                return tasks.filter(task => isOverdue(task.due_date, task.status));
            case 'Completed':
                return tasks.filter(task => task.status === 'completed');
            case 'All':
            default:
                return tasks;
        }
    };

    const filteredTasks = getFilteredTasks();

    // Calculate progress (for all tasks, not filtered)
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate counts for each filter
    const todayCount = tasks.filter(task => isToday(task.due_date)).length;
    const upcomingCount = tasks.filter(task => isUpcoming(task.due_date) && !isToday(task.due_date)).length;
    const overdueCount = tasks.filter(task => isOverdue(task.due_date, task.status)).length;
    const completedCount = completedTasks;

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ff5c5c';
            case 'medium': return '#fb923c';
            case 'low': return '#94a3b8';
            default: return '#94a3b8';
        }
    };

    const filters = [
        { id: 'all', name: 'All', icon: List, count: totalTasks },
        { id: 'today', name: 'Today', icon: Calendar, count: todayCount },
        { id: 'upcoming', name: 'Upcoming', icon: CalendarDays, count: upcomingCount },
        { id: 'overdue', name: 'Overdue', icon: AlertCircle, count: overdueCount },
        { id: 'completed', name: 'Completed', icon: CheckCircle, count: completedCount },
    ];

    // Format time from datetime string
    const formatTime = (dateString) => {
        if (!dateString) return '';
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

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            if (date.toDateString() === today.toDateString()) {
                return 'Today';
            }
            if (date.toDateString() === tomorrow.toDateString()) {
                return 'Tomorrow';
            }

            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return '';
        }
    };

    // Get current date formatted
    const getCurrentDate = () => {
        const date = new Date();
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#112116]">
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
                {/* Top Navigation Bar */}
                <View
                    className="p-4 pb-2"
                >
                    <View className="flex-row items-center justify-between rounded-lg">
                        <View className="w-12 h-12 items-center justify-center bg-green-500 rounded-full">
                            <Calendar size={24} color="white" />
                        </View>

                        <Text className="text-white text-lg font-bold flex-1 ml-4">
                            Task Manager
                        </Text>

                        <TouchableOpacity
                            className="bg-green-500 px-4 py-2 rounded-lg items-center justify-center"
                            onPress={() => navigation.navigate("UnifiedAdd")}
                        >
                            <Text className="text-white font-semibold">Add Task</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                {/* Progress Indicator */}
                {!isLoading && (
                    <View className="px-4 py-2">
                        <View className="p-5 rounded-xl bg-[#1a2e20] shadow-sm gap-3">
                            <View className="flex-row justify-between items-end gap-6">
                                <View className="flex-1">
                                    <Text className="text-white text-lg font-bold">Productivity</Text>
                                    <Text className="text-[#93c8a5] text-xs font-medium uppercase tracking-wider">
                                        On track
                                    </Text>
                                </View>
                                <Text className="text-white text-sm font-semibold">
                                    {completedTasks} of {totalTasks} tasks
                                </Text>
                            </View>

                            {/* Progress Bar */}
                            <View className="rounded-full bg-[#346544] h-2.5 overflow-hidden">
                                <View
                                    className="h-full rounded-full bg-[#19e65e]"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </View>

                            <Text className="text-[#93c8a5] text-sm font-medium">
                                {progressPercentage >= 50
                                    ? "Keep going! You're almost there."
                                    : "Keep going! You're making progress."}
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
                    <View className="px-4 py-6 gap-4">
                        <TaskSkeleton />
                    </View>
                )}

                {/* Empty State */}
                {!isLoading && tasks.length === 0 && (
                    <View className="px-4 py-12 items-center">
                        <CheckCircle size={48} color="#346544" />
                        <Text className="text-white text-lg font-bold mt-4">No tasks yet</Text>
                        <Text className="text-[#93c8a5] text-sm mt-2 text-center">
                            Start by adding your first task
                        </Text>
                    </View>
                )}

                {/* Filtered Tasks Empty State */}
                {!isLoading && tasks.length > 0 && filteredTasks.length === 0 && (
                    <View className="px-4 py-12 items-center">
                        <CheckCircle size={48} color="#346544" />
                        <Text className="text-white text-lg font-bold mt-4">
                            No {selectedFilter.toLowerCase()} tasks
                        </Text>
                        <Text className="text-[#93c8a5] text-sm mt-2 text-center">
                            {selectedFilter === 'Completed'
                                ? 'Complete some tasks to see them here'
                                : `You don't have any ${selectedFilter.toLowerCase()} tasks`
                            }
                        </Text>
                    </View>
                )}

                {/* Task List */}
                {!isLoading && filteredTasks.length > 0 && (
                    <View className="gap-2 pt-2">
                        {filteredTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={toggleTask}
                                getPriorityColor={getPriorityColor}
                                formatTime={formatTime}
                                formatDate={formatDate}
                                showDate={selectedFilter === 'All' || selectedFilter === 'Upcoming'}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// Task Item Component
const TaskItem = ({ task, onToggle, getPriorityColor, formatTime, formatDate, showDate = false }) => {
    const isCompleted = task.status === 'completed';

    // Check if task is overdue
    const checkOverdue = (dateString, status) => {
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

    const taskIsOverdue = checkOverdue(task.due_date, task.status);

    return (
        <View className={`px-4 py-1 ${isCompleted ? 'opacity-60' : 'opacity-100'}`}>
            <View
                className={`flex-row gap-4 p-4 rounded-xl items-center justify-between ${isCompleted
                    ? 'bg-[#1a2e20]/50 border-transparent shadow-none'
                    : taskIsOverdue
                        ? 'bg-[#2e1a1a] border-[#ff5c5c]/20 shadow-sm'
                        : 'bg-[#1a2e20] border-white/5 shadow-sm'
                    } border`}
            >
                <View className="flex-row items-start gap-4 flex-1">
                    {/* Checkbox */}
                    <TouchableOpacity
                        className="w-6 h-6 items-center justify-center mt-1"
                        onPress={() => onToggle(task.id)}
                    >
                        <View
                            className={`w-5 h-5 rounded border-2 items-center justify-center ${isCompleted
                                ? 'bg-[#19e65e] border-[#19e65e]'
                                : taskIsOverdue
                                    ? 'bg-transparent border-[#ff5c5c]'
                                    : 'bg-transparent border-[#346544]'
                                }`}
                        >
                            {isCompleted && (
                                <CheckCircle size={16} color="#112116" fill="#112116" />
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Task Details */}
                    <View className="flex-1">
                        <Text
                            className={`text-base font-bold leading-snug ${isCompleted
                                ? 'text-white/50 line-through'
                                : 'text-white'
                                }`}
                        >
                            {task.title}
                        </Text>

                        <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            {/* Overdue Badge */}
                            {taskIsOverdue && (
                                <View className="flex-row items-center gap-1">
                                    <AlertCircle size={12} color="#ff5c5c" />
                                    <Text className="text-xs font-bold uppercase text-[#ff5c5c]">
                                        Overdue
                                    </Text>
                                </View>
                            )}

                            {/* Priority */}
                            {!taskIsOverdue && (
                                <Text
                                    className="text-xs font-bold uppercase"
                                    style={{ color: getPriorityColor(task.priority) }}
                                >
                                    {task.priority === 'high' ? 'High Priority' : task.priority}
                                </Text>
                            )}

                            {/* Category */}
                            {task.category && (
                                <Text className="text-[#93c8a5] text-xs font-medium">
                                    • {task.category}
                                </Text>
                            )}

                            {/* Date/Time */}
                            {task.due_date && (
                                <Text className={`text-xs font-medium ${taskIsOverdue ? 'text-[#ff5c5c]' : 'text-[#93c8a5]'}`}>
                                    • {showDate ? formatDate(task.due_date) : formatTime(task.due_date)}
                                </Text>
                            )}
                        </View>

                        {/* Description */}
                        {task.description && (
                            <Text className="text-[#93c8a5]/60 text-xs mt-1" numberOfLines={1}>
                                {task.description}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

export default TaskListScreen;