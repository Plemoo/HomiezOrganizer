import { Stack } from 'expo-router';
import React from 'react';

export const unstable_settings = {
  initialRouteName: 'Settings', // or your default screen
};

const SettingLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false}}>
        <Stack.Screen name="Settings"/>
        <Stack.Screen name="Profile"/>
    </Stack>
  )
}

export default SettingLayout