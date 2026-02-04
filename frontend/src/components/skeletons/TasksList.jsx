import React, { useEffect, useRef } from "react";
import { View, Animated, SafeAreaView, ScrollView } from "react-native";

const Skeleton = ({ width, height, radius = 8, style }) => (
    <View
        style={[
            {
                width,
                height,
                borderRadius: radius,
                backgroundColor: "#244730",
            },
            style,
        ]}
    />
);

const TaskListSkeleton = () => {
    const opacity = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.5,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-[#112116]">
            <Animated.View style={{ flex: 1, opacity }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>

                    {/* Header */}
                    <View className="p-4 flex-row items-center justify-between">
                        <Skeleton width={40} height={40} radius={20} />
                        <Skeleton width={120} height={18} />
                        <Skeleton width={40} height={40} radius={20} />
                    </View>

                    {/* Progress Card */}
                    <View className="px-4 py-2">
                        <View className="p-5 rounded-xl bg-[#1a2e20] gap-3">
                            <Skeleton width={140} height={18} />
                            <Skeleton width={200} height={12} />
                            <Skeleton width="100%" height={10} radius={999} />
                            <Skeleton width={180} height={12} />
                        </View>
                    </View>

                    {/* Categories */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="px-4 py-2"
                        contentContainerStyle={{ gap: 12 }}
                    >
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} width={90} height={40} radius={12} />
                        ))}
                    </ScrollView>

                    {/* Today Section */}
                    <View className="px-4 pt-6 pb-2">
                        <Skeleton width={80} height={18} />
                    </View>

                    {[1, 2, 3].map(i => (
                        <TaskItemSkeleton key={i} />
                    ))}

                    {/* Upcoming */}
                    <View className="px-4 pt-6 pb-2">
                        <Skeleton width={110} height={18} />
                    </View>

                    {[1, 2].map(i => (
                        <TaskItemSkeleton key={i} />
                    ))}
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
};

const TaskItemSkeleton = () => (
    <View className="px-4 py-2">
        <View className="flex-row gap-4 p-4 rounded-xl bg-[#1a2e20]">
            <Skeleton width={20} height={20} radius={4} />
            <View className="flex-1 gap-2">
                <Skeleton width="80%" height={14} />
                <Skeleton width="60%" height={12} />
            </View>
            <Skeleton width={50} height={14} />
        </View>
    </View>
);

export default TaskListSkeleton;
