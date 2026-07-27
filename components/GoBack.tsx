import useUiIcons from '@/assets/hooks/uiIconHook';
import { Href, useRouter, useSegments } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { useCustomTheme } from './ThemeContext';

const GoBack: React.FC<{ backTarget?: Href }> = ({ backTarget }) => {
    const { theme } = useCustomTheme();
    const router = useRouter();
    const uiIcons = useUiIcons();
    const segments: readonly string[] = useSegments();
    const firstSegment = segments[0];
    const secondSegment = segments[1];
    const executeNavigation = () => {
        if (backTarget) {
            router.push(backTarget);
        } else {
            if (router.canGoBack()) {
                router.back();
            } else if (firstSegment === '(tabs)' && secondSegment === 'activities') {
                router.replace("/(tabs)/activities/Activities");
            } else if (firstSegment === '(tabs)' && secondSegment === 'groups') {
                router.replace("/(tabs)/groups/Groups");
            } else if (firstSegment === '(tabs)' && secondSegment === 'settings') {
                router.replace("/(tabs)/activities/Activities");
            } else {
                router.replace("/(tabs)/activities/Activities");
            }
        }
    }
    return (
        <Pressable style={theme.leftCornerIcon} onPress={executeNavigation}>
            <uiIcons.ArrowLeftIcon size={30} color={theme.colors.primary} />
        </Pressable>
    )
}

export default GoBack
