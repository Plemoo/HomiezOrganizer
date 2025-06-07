import useUiIcons from '@/assets/hooks/uiIconHook';
import { Href, useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { useCustomTheme } from './ThemeContext';

const GoBack:React.FC<{backTarget?:Href}> = ({backTarget}) => {
    const { theme } = useCustomTheme();
    const router = useRouter();
    const uiIcons = useUiIcons();
    const executeNavigation = ()=>{
        if(backTarget){
            router.push(backTarget);
        }else{
            router.back()
        }
    }
    return (
        <Pressable style={theme.leftCornerIcon} onPress={executeNavigation}>
            <uiIcons.ArrowLeftIcon size={30} color={theme.colors.primary} />
        </Pressable>
    )
}

export default GoBack