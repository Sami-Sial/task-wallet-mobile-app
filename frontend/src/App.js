import "./globals.css";
import Layout from "@/components/layout/Layout";

import { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import ToastConfig from "@/config/ToastConfig";
import { View, ActivityIndicator, Text } from "react-native";
import { AuthProvider, AuthContext } from "@/context/AuthContext";

// importing auth screens
import HomeScreen from "@/screens/HomeScreen";
import SignupScreen from "@/screens/SignupScreen";
import OtpVerifyScreen from "@/screens/OtpVerifyScreen";
import LoginScreen from "@/screens/LoginScreen";
import ForgotPasswordScreen from "@/screens/ForgotPasswordScreen";
import CreateNewPasswordScreen from "@/screens/CreateNewPasswordScreen";

// importing dashboard screens
import DashboardTabs from "@/navigation/DashboardTabs";
import UnifiedAddScreen from "@/screens/dashboard/UnifiedAddScreen";
import ChangePasswordScreen from "./screens/dashboard/ChangePassword";

const Stack = createNativeStackNavigator();

function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Dashboard" component={DashboardTabs} />
      <Stack.Screen name="UnifiedAdd" component={UnifiedAddScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />
    </Stack.Navigator>
  );
}

function RootNavigation() {
  const { userData, loading } = useContext(AuthContext);
  console.log(userData);


  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10, color: "#333", fontWeight: "600" }}>
          Loading...
        </Text>
      </View>
    );
  }

  return userData ? <AppStack /> : <AuthStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <NavigationContainer>
          <RootNavigation />
          <Toast config={ToastConfig} />
        </NavigationContainer>
      </Layout>
    </AuthProvider>
  );
}
