import { Stack } from 'expo-router'
import React from 'react'

const GroupLayout = () => {
    return (
        <Stack screenOptions={{headerShown:false}}>
            <Stack.Screen name="index"/>
            <Stack.Screen name="NewGroup"/>
            <Stack.Screen name="GroupDetail"/>
        </Stack>
    )
}

export default GroupLayout