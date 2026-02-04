import { View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Layout({ children }) {
    return (
        <SafeAreaView
            edges={["top", "bottom"]}
            style={{ flex: 1, backgroundColor: "#ffffff" }}
        >
            {/* Status bar */}
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Main content */}
            <View className="bg-black flex-1">{children}</View>
        </SafeAreaView>
    );
}
