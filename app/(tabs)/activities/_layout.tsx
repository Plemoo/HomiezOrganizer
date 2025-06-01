import { Stack } from 'expo-router'
import React from 'react'

const ActivityLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index"/>
        <Stack.Screen name="ActivityDetail"/>
        <Stack.Screen name="ActivityResponse"/>
    </Stack>
  )
}

export default ActivityLayout