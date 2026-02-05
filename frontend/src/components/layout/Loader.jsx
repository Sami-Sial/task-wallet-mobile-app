import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, ActivityIndicator } from 'react-native';

const SpinnerLoader = ({
    message = 'Preparing things for you…',
}) => {
    const scale = useRef(new Animated.Value(0.9)).current;
    const opacity = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scale, {
                        toValue: 1.05,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 0.9,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0.6,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.loaderWrapper,
                    {
                        transform: [{ scale }],
                        opacity,
                    },
                ]}
            >
                <ActivityIndicator size="large" color="#3AFF5E" />
            </Animated.View>

            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

export default SpinnerLoader;

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',

        // glow / depth
        shadowColor: '#39FF14',
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 0 },

        elevation: 12, // Android glow
    },
    message: {
        marginTop: 28,
        color: '#E8F5EF',
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: 0.4,
        opacity: 0.85,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
};
