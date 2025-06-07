import { Stack } from 'expo-router';
import React from 'react';

export const unstable_settings = {
  initialRouteName: 'Activities', // or your default screen
};
const ActivityLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Activities"/>
        <Stack.Screen name="ActivityDetail"/>
        <Stack.Screen name="ActivityResponse"/>
    </Stack>
  )
}

export default ActivityLayout