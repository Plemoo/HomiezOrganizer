import { Stack } from 'expo-router';
import React from 'react';

export const unstable_settings = {
  initialRouteName: 'Groups', // or your default screen
};

const GroupLayout = () => {
    return (
        <Stack screenOptions={{headerShown:false}}>
            <Stack.Screen name="Groups"/>
            <Stack.Screen name="NewGroup"/>
            {/* <Stack.Screen name="GroupDetail"/> */}
        </Stack>
    )
}

export default GroupLayout


