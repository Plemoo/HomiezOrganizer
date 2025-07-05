import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useCustomTheme } from './ThemeContext';

interface LoadingDotsProps {
    visible?: boolean;
    size?: number;
    style?: ViewStyle;
    fullScreen?: boolean; // New prop to control full screen centering
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
    size = 12,
    style,
    fullScreen = true // Default to full screen centering
}) => {
    const { theme } = useCustomTheme();

    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
            const animateDot = (dot: Animated.Value, delay: number): Animated.CompositeAnimation => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(dot, {
                            toValue: 1,
                            duration: 600,
                            delay,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot, {
                            toValue: 0.3,
                            duration: 600,
                            useNativeDriver: true,
                        }),
                    ])
                );
            };

            const animations: Animated.CompositeAnimation[] = [
                animateDot(dot1, 0),
                animateDot(dot2, 200),
                animateDot(dot3, 400),
            ];

            animations.forEach(anim => anim.start());

            return () => animations.forEach(anim => anim.stop());
        
    }, [ dot1, dot2, dot3]);

    const dotSize = size;
    const dotRadius = size / 2;

    return (
        <View style={[
            fullScreen ? styles.fullScreenContainer : styles.inlineContainer,
            style
        ]}>
            <View style={styles.dotsContainer}>
                {[dot1, dot2, dot3].map((dot: Animated.Value, index: number) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                width: dotSize,
                                height: dotSize,
                                borderRadius: dotRadius,
                                backgroundColor: theme.colors.primary,
                                opacity: dot,
                                transform: [
                                    {
                                        scale: dot.interpolate({
                                            inputRange: [0.3, 1],
                                            outputRange: [0.8, 1.2],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    inlineContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    } as ViewStyle,
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
    dot: {
        marginHorizontal: 4,
    } as ViewStyle,
});

export default LoadingDots;