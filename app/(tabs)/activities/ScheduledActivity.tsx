import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
// TODO: Im zugesagten Zustand muss hierauf referenziert werden und nicht auf ActivityDetail
const ScheduledActivity = () => {
    const { scheduledActivityStringified } = useLocalSearchParams<{ scheduledActivityStringified: string }>();

    return (
        <View>
            <Text>{scheduledActivityStringified}</Text>
        </View>
    )
}

export default ScheduledActivity