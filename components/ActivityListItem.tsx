import { IActivity, ITimeInterval, ITimeSlot } from '@/assets/interfaces/ActivityInterface';
import { IFirebaseSearchParameter } from '@/assets/interfaces/FirebaseInterface';
import { formatDateAndTimeSmall } from '@/assets/ts/timeManagement';
import { UnknownInputParams, useRouter } from 'expo-router';
import i18next from 'i18next';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
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
        } else if (activity.state === "scheduled" || activity.state === "closed") {
            router.push({ pathname: "/(tabs)/activities/ScheduledActivity", params: searchParams as UnknownInputParams });
        }
    }

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={activity.name}
            onPress={activityPressed}
            style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                marginVertical: theme.spacing.small,
                gap: theme.spacing.medium,
                padding: theme.spacing.medium,
                borderWidth: 1,
                borderColor: theme.colors.secondary,
                borderRadius: theme.borderRadius.medium,
                backgroundColor: theme.colors.background,
                opacity: pressed ? 0.65 : 1,
            })}
        >
            <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.secondary }}>
                {activityIcon}
            </View>
            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={theme.typography.heading3}>{activity.name}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {activity.time ? timeCmp(activity.time) : null}
                </View>
            </View>
            <View style={{ alignItems: "center", gap: 2 }}>
                <Ionicons name="people-outline" size={17} color={theme.colors.primary} />
                <Text style={[theme.typography.body, { fontSize: 13 }]}>{activity.memberUuids ? activity.memberUuids.length : getNumberOfUniqueUsersOfTimeSlots(activity.timeSlotsPerUserUuid)}/{activity.minParticipants}</Text>
            </View>
            <View style={{ width: 34, height: 34 }}>
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
