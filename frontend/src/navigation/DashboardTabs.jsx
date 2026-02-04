import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BarChart3, Wallet, Settings } from 'lucide-react-native';

// Screens
import DashboardHome from '@/screens/dashboard/DashboardHomeScreen';
import TasksScreen from '@/screens/dashboard/DashboardTasksScreen';
import ExpensesScreen from '@/screens/dashboard/DashboardExpensesScreen';
import SettingsScreen from '@/screens/dashboard/DashboardSettingsScreen';
import InsightsScreen from '@/screens/dashboard/DashboardInsightsScreen';

const Tab = createBottomTabNavigator();

export default function DashboardTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,

                // ✅ ICON + LABEL COLORS
                tabBarActiveTintColor: '#19e65e',
                tabBarInactiveTintColor: '#93c8a5',

                // ✅ TAB BAR STYLE
                tabBarStyle: {
                    backgroundColor: 'rgba(17, 33, 22, 0.9)',
                    height: 70,
                    borderTopWidth: 0,
                },

                // ✅ LABEL STYLE
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '700',
                    marginBottom: 6,
                },
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={DashboardHome}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Home size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="TasksTab"
                component={TasksScreen}
                options={{
                    tabBarLabel: 'Tasks',
                    tabBarIcon: ({ color }) => (
                        <BarChart3 size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="InsightsTab"
                component={InsightsScreen}
                options={{
                    tabBarLabel: 'Insights',
                    tabBarIcon: ({ color }) => (
                        <Wallet size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="ExpensesTab"
                component={ExpensesScreen}
                options={{
                    tabBarLabel: 'Expenses',
                    tabBarIcon: ({ color }) => (
                        <Wallet size={24} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="SettingsTab"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ color }) => (
                        <Settings size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
