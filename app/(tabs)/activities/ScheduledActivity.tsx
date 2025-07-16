import { IActivity, IActivityState, IDuration, ITimeInterval } from '@/assets/interfaces/ActivityInterface';
import { IFirebaseSearchParameter } from '@/assets/interfaces/FirebaseInterface';
import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
import { FirebaseSnapshotListener } from '@/assets/ts/firebaseSnapshotListener';
import { parseFirebaseUser } from '@/assets/ts/parsing';
import ActivityComments from '@/components/ActivityComments';
import ActivityDetailDetails from '@/components/ActivityDetailDetails';
import GoBack from '@/components/GoBack';
import LoadingDots from '@/components/Loading';
import ShowUserIconOrName from '@/components/ShowUserIconOrName';
import { useCustomTheme } from '@/components/ThemeContext';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Switch, Text, View } from 'react-native';

const ScheduledActivity = () => {
    const { activityIdParameter, groupIdParameter }: IFirebaseSearchParameter = useLocalSearchParams();
    const { theme } = useCustomTheme();
    const [acceptedUsers, setAcceptedUsers] = useState<ILocalUser[]>([]);
    const [groupId, setGroupId] = useState<string | undefined>();
    const [activityId, setActivityId] = useState<string | undefined>();
    const [activityName, setActivityName] = useState<string | undefined>();
    const [activityTime, setActivityTime] = useState<ITimeInterval | undefined>();
    const [activityDescription, setActivityDescription] = useState<string | undefined>();
    const [activityDuration, setActivityDuration] = useState<IDuration | undefined>();
    const [activityState, setActivityState] = useState<IActivityState | undefined>();
    const router = useRouter();
    const { t } = useTranslation();
    const [showNamesOrIcons, setShowNamesOrIcons] = useState<"names" | "icons">("icons");

    const fetchUserDocumentsForSelectedTimeSlot = useCallback(async (activityWithChange: IActivity | null): Promise<null | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>[]> => {
        if (activityWithChange) {
            const selectedTimeSlot = activityWithChange.timeSlotsPerUserUuid.filter((slot) => slot.selected);
            if (selectedTimeSlot.length !== 1) throw new Error("Activity not not exactly one scheduled time slot"); // Only one time slot can be selected, the one where it happens
            return await FirebaseExchange.getFirebaseDocumentArray(selectedTimeSlot[0].userUuid, "User");
        }
        return null;
    }, []);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        if (!activityIdParameter || !groupIdParameter) return;
        let loadedActivity: IActivity | null = null;
        FirebaseSnapshotListener.snapshotListenerForActivityDetailChange(groupIdParameter, activityIdParameter, (activityWithChange: IActivity | null) => {
            loadedActivity = activityWithChange;
            fetchUserDocumentsForSelectedTimeSlot(activityWithChange)
                .then((userDocArray) => {
                    if (userDocArray) {
                        const allUsers = userDocArray.map((doc) => parseFirebaseUser(doc)).filter((user): user is ILocalUser => user !== null);
                        return allUsers;
                    }
                    return null;
                })
                .then((firebaseUser: ILocalUser[] | null) => {
                    if (firebaseUser === null ||
                        firebaseUser.length === 0 ||
                        loadedActivity?.name === undefined ||
                        loadedActivity?.id === undefined ||
                        loadedActivity?.owningGroupId === undefined ||
                        loadedActivity?.description === undefined ||
                        loadedActivity?.time === undefined ||
                        loadedActivity?.duration === undefined) {
                        throw new Error("Activity data is incomplete or missing");
                    }
                    setAcceptedUsers(firebaseUser)
                    setActivityName(loadedActivity.name)
                    setActivityId(loadedActivity.id)
                    setGroupId(loadedActivity.owningGroupId);
                    setActivityDescription(loadedActivity.description);
                    setActivityTime(loadedActivity.time);
                    setActivityDuration(loadedActivity.duration)
                    setActivityState(loadedActivity.state)
                }).catch((err) => {
                    FirebaseExchange.firebaseErrorHandling(err);
                    router.back();
                })
        });
        return () => unsubscribe?.();
    }, [activityIdParameter, groupIdParameter, fetchUserDocumentsForSelectedTimeSlot])




    if (!activityId || !groupId || !activityTime?.start || !activityTime?.end || !activityDuration) return <LoadingDots visible />;

    return (
        <ScrollView style={{ padding: theme.spacing.small }}>
            <GoBack />
            {/* Accepted Users */}
            <View style={{ marginBottom: theme.spacing.medium, marginTop: theme.spacing.xlarge }}>
                <View style={theme.containers.centeredContainer}>
                    <Text style={theme.typography.heading1}>{activityName}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={theme.typography.heading2}>{t("activities.acceptedUsers")}</Text>
                    <Switch
                        value={showNamesOrIcons === "names"}
                        onValueChange={() => setShowNamesOrIcons(showNamesOrIcons === "names" ? "icons" : "names")}
                        trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
                        thumbColor={theme.colors.textLight}
                    />
                </View>
                <ShowUserIconOrName users={acceptedUsers} showNamesOrIcons={showNamesOrIcons} />
            </View>
            {/* Activity Duration and Min Participants */}
            <ActivityDetailDetails activityDuration={activityDuration} activityTime={activityTime} />
            {/* Activity Description */}
            <View style={{ marginBottom: theme.spacing.medium }}>
                <Text style={theme.typography.heading2}>{t("planning.activityDescription")}</Text>
                <Text style={theme.typography.body}>{activityDescription}</Text>
            </View>
            <ActivityComments activityId={activityId} groupId={groupId} activityState={activityState} />
        </ScrollView>
    )
}

export default ScheduledActivity