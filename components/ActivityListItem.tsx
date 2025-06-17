import { IActivity, ITimeInterval } from '@/assets/interfaces/ActivityInterface';
import { formatDateAndTime } from '@/assets/ts/timeManagement';
import { useRouter } from 'expo-router';
import i18next from 'i18next';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useCustomTheme } from './ThemeContext';

const ActivityListItem = ({ activityIcon, activity, groupIcon }: { activityIcon: React.ReactNode, activity: IActivity, groupIcon?: React.ReactNode }) => {
    const { theme } = useCustomTheme();
    const router = useRouter();

    const timeCmp = (time: ITimeInterval) => {
        return <Text style={[theme.typography.body, { textAlign: "center" }]}>{formatDateAndTime(time.start, i18next.language)} - {formatDateAndTime(time.end, i18next.language)}</Text>
    }
    return (
        <Pressable onPress={() => router.push({ pathname: "/(tabs)/activities/ActivityDetail", params: { activityStringified: JSON.stringify(activity) } })} style={{ flexDirection: "row", marginVertical: theme.spacing.small, gap: theme.spacing.small }}>
            <View style={{ justifyContent: "center" }}>
                {activityIcon}
            </View>
            <View style={{ flexGrow: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "white" }}>
                    <Text style={[theme.typography.body, { textAlign: "center" }]}>{activity.name}</Text>
                    <Text style={[theme.typography.body, { textAlign: "center" }]}>{activity.memberUuids.length}/{activity.minParticipants}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    {activity.time ? timeCmp(activity.time) : null}
                </View>
            </View>
            <View>
                {groupIcon}
            </View>
        </Pressable>
    )
}

export default ActivityListItem