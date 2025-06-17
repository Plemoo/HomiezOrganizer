import React, { useEffect, useRef } from 'react'
import {
    Animated,
    StyleSheet,
    Text,
    TextStyle,
    ViewStyle
} from 'react-native'
import { useCustomTheme } from './ThemeContext'

type HintProps = {
    message: string
    duration?: number        // ms to stay fully visible
    fadeDuration?: number    // ms for fade in/out
    style?: ViewStyle        // container override
    textStyle?: TextStyle[]|TextStyle    // text override
    onHide?: () => void      // called after fade‐out completes
}

export function Hint({
    message,
    duration = 2000,
    fadeDuration = 300,
    style,
    textStyle,
    onHide
}: HintProps) {
    const opacity = useRef(new Animated.Value(0)).current
  const { theme } = useCustomTheme();

    useEffect(() => {
        // sequence: fade in → wait → fade out → callback
        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: fadeDuration,
                useNativeDriver: true
            }),
            Animated.delay(duration),
            Animated.timing(opacity, {
                toValue: 0,
                duration: fadeDuration,
                useNativeDriver: true
            })
        ]).start(() => {
            onHide?.()
        })
    }, [opacity])

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.container,
                style,
                { opacity }
            ]}
        >
            <Text style={textStyle}>{message}</Text>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        elevation:10
    }
})