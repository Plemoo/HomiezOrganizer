import { Stack } from 'expo-router';
import React from 'react';

// export const unstable_settings = {
//   initialRouteName: 'Planning', // or your default screen
// };

const PlanningLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Planning"/>
    </Stack>
  )
}

export default PlanningLayout