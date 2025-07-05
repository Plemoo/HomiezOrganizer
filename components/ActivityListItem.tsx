import { IActivity, ITimeInterval, ITimeSlot } from '@/assets/interfaces/ActivityInterface';
import { IFirebaseSearchParameter } from '@/assets/interfaces/FirebaseInterface';
import { formatDateAndTimeSmall } from '@/assets/ts/timeManagement';
import { UnknownInputParams, useRouter } from 'expo-router';
import i18next from 'i18next';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useCustomTheme } from './ThemeContext';

const ActivityListItem = ({ activityIcon, activity, groupIcon }: { activityIcon: React.ReactNode, activity: IActivity, groupIcon?: React.ReactNode }) => {
    const { theme } = useCustomTheme();
    const router = useRouter();

    const timeCmp = (time: ITimeInterval) => {
        return <Text style={[theme.typography.body, { textAlign: "center" }]}>{formatDateAndTimeSmall(time.start, i18next.language)} - {formatDateAndTimeSmall(time.end, i18next.language)}</Text>
    }

    const activityPressed = () => {
        let searchParams: IFirebaseSearchParameter={
            activityIdParameter: activity.id,
            groupIdParameter: activity.owningGroupId,
        }
        if (activity.state === "pending") {
            router.push({ pathname: "/(tabs)/activities/ActivityDetail", params: searchParams as UnknownInputParams});
        } else if (activity.state === "scheduled") {
            router.push({ pathname: "/(tabs)/activities/ScheduledActivity", params: searchParams as UnknownInputParams });
        }
    }

    return (
        <Pressable onPress={activityPressed} style={{ flexDirection: "row", marginVertical: theme.spacing.small, gap: theme.spacing.small }}>
            <View style={{ justifyContent: "center" }}>
                {activityIcon}
            </View>
            <View style={{ flexGrow: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "white" }}>
                    <Text style={[theme.typography.body, { textAlign: "center" }]}>{activity.name}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    {activity.time ? timeCmp(activity.time) : null}
                </View>
            </View>
            <View style={{ justifyContent: "center" }}>
                <Text style={[theme.typography.body, { textAlign: "center" }]}>{activity.memberUuids ? activity.memberUuids.length : getNumberOfUniqueUsersOfTimeSlots(activity.timeSlotsPerUserUuid)}/{activity.minParticipants}</Text>
            </View>
            <View>
                {groupIcon}
            </View>
        </Pressable>
    )
}

export default ActivityListItem

function getNumberOfUniqueUsersOfTimeSlots(timeSlots: ITimeSlot[]): number {
    const uniqueUsers = new Set<string>();
    timeSlots.forEach(slot => {
        slot.userUuid.forEach(userId => uniqueUsers.add(userId));
    });
    return uniqueUsers.size;
}