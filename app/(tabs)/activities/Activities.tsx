import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import useUiIcons from '@/assets/hooks/uiIconHook';
import { IActivitiesWithGroup, IActivity, IActivityWithGroupIcon } from '@/assets/interfaces/ActivityInterface';
import { getUniqueActivitiesWithGroupIcon, sortActivitiesByDueDate, sortActivitiesByEarliestAvailability } from '@/assets/ts/componentFunctions/activities';
import { FirebaseSnapshotListener } from '@/assets/ts/firebaseSnapshotListener';
import ActivityListItem from '@/components/ActivityListItem';
import LoadingDots from '@/components/Loading';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import { Unsubscribe } from '@react-native-firebase/firestore';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, Text, View } from 'react-native';

const Activities = () => {
  const { user, userLoading } = useUser();
  const { t } = useTranslation();
  const { theme } = useCustomTheme();
  const uiIcons = useUiIcons()
  const { avatars } = useAvatarIcons()
  const [loading, setLoading] = useState(true)
  const [scheduledActivities, setScheduledActivities] = useState<IActivityWithGroupIcon[]>([]);
  const [pendingActivities, setPendingActivities] = useState<IActivityWithGroupIcon[]>([]);
  // const isFocused = useIsFocused();

  useEffect(() => {
    let newActivityUnsubscribe: Unsubscribe | null = null;
    let newGroupWithActivitiesUnsubscribe: Unsubscribe | null = null;
    let activityChangeListeners:Unsubscribe[] = [];
    try {
      // if (!isFocused) throw new Error("Activities component is not focused, so no need to load activities.");
      if (!user) return
      if (!user.groupUuids) throw new Error("User has no groupUuids on Activity init.");
      if (!user.id) throw new Error("User has no id on activity init.");
      // Just add the new activity that were newly created in the existing group of the user
      newActivityUnsubscribe = FirebaseSnapshotListener.snapshotListenerForNewActivitiesInGroupsOfUser(user.groupUuids, (newActivityWithGroup: IActivitiesWithGroup | null) => {
        if (!newActivityWithGroup || !newActivityWithGroup.activities || newActivityWithGroup.activities.length !== 1) throw new Error("New activity with group is null or has no activities.");
        const firebaseAct = newActivityWithGroup.activities[0];
        if (firebaseAct.state === "pending") {
          const activityByGroup: IActivityWithGroupIcon[] = getActivitiesWithGroupIcon([{ activities: [firebaseAct], group: newActivityWithGroup.group }], "pending")
          setPendingActivities((prev) => getUniqueActivitiesWithGroupIcon(prev, activityByGroup).sort((activity1, activity2) => sortActivitiesByEarliestAvailability(activity1, activity2)));
        } else if (firebaseAct.state === "scheduled") {
          const activityByGroup: IActivityWithGroupIcon[] = getActivitiesWithGroupIcon([{ activities: [firebaseAct], group: newActivityWithGroup.group }], "pending")
          setScheduledActivities((prev) => getUniqueActivitiesWithGroupIcon(prev, activityByGroup).sort((activity1, activity2) => sortActivitiesByDueDate(activity1, activity2)));
        }
        setLoading(false);
      });
      // Overwrite all activities with the new activities per group, once the user joins a new
      newGroupWithActivitiesUnsubscribe = FirebaseSnapshotListener.snapshotListenerForUserJoinsNewGroup(user.id, (activitiesWithGroup: IActivitiesWithGroup[] | null) => {
        if (!activitiesWithGroup || activitiesWithGroup.length === 0) {
          setPendingActivities([]);
          setScheduledActivities([]);
          setLoading(false);
          return;
        }
        const pendingActivities = getActivitiesWithGroupIcon(activitiesWithGroup, "pending").sort((activity1, activity2) => sortActivitiesByEarliestAvailability(activity1, activity2));
        const scheduledActivities = getActivitiesWithGroupIcon(activitiesWithGroup, "scheduled").sort((activity1, activity2) => sortActivitiesByDueDate(activity1, activity2));
        setPendingActivities(pendingActivities);
        setScheduledActivities(scheduledActivities);
        setLoading(false);
      });
      // Listen for state/participants changes of the activities
      activityChangeListeners = [...pendingActivities, ...scheduledActivities].map((activity) => {
        return FirebaseSnapshotListener.snapshotListenerForActivityDetailChange(activity.owningGroupId, activity.id, (activityWithChange: IActivity | null) => {
          if (!activityWithChange) return;
          // Update the activity in the pending or scheduled activities
          fillPendingScheduledActivitiesBasedOnActivityChanges(activityWithChange);
        });
      });
    } catch (err) {
      setLoading(false);
      setPendingActivities([]);
      setScheduledActivities([]);
      console.error("Error in Activities component:", err);
    }
    return () => {
      newActivityUnsubscribe?.();
      newGroupWithActivitiesUnsubscribe?.();
      activityChangeListeners.forEach(unsub => unsub());
    };
  }, [userLoading, user?.id, user?.groupUuids]);


  function fillPendingScheduledActivitiesBasedOnActivityChanges(activityWithChange: IActivity) {
    if (activityWithChange.state === "pending") {
      setPendingActivities((prev) => prev.map((act) => {
        if (act.id === activityWithChange.id) {
          return { ...activityWithChange, groupIcon: act.groupIcon };
        }
        return act;
      }));
    } else if (activityWithChange.state === "scheduled") {
      // Activity was pending before and not scheduled yet
      if (pendingActivities.some((act) => act.id === activityWithChange.id) && !scheduledActivities.some((act) => act.id === activityWithChange.id)) {
        // Add new Activity to Scheduled Activities and remove it from Pending Activities
        let oldActivity = pendingActivities.filter((act) => act.id === activityWithChange.id)[0];
        setScheduledActivities((prev) => [...prev, { ...activityWithChange, groupIcon: oldActivity.groupIcon }]);
        setPendingActivities((prev) => prev.filter((act) => act.id !== activityWithChange.id));
      } else {
        // Update Activity in Scheduled Activities
        setScheduledActivities((prev) => prev.map((act) => {
          if (act.id === activityWithChange.id) {
            return { ...activityWithChange, groupIcon: act.groupIcon };
          }
          return act;
        }));
      }
    } else if (activityWithChange.state === "cancelled" || activityWithChange.state === "closed") {
      // Remove Activity from Pending Activities
      if (pendingActivities.some((act) => act.id === activityWithChange.id)) {
        setPendingActivities((prev) => prev.filter((act) => act.id !== activityWithChange.id));
      }
      // Remove Activity from Scheduled Activities
      if (scheduledActivities.some((act) => act.id === activityWithChange.id)) {
        setScheduledActivities((prev) => prev.filter((act) => act.id !== activityWithChange.id));
      }
    }
  }


  const getActivitiesWithGroupIcon = (activitiesWithGroup: IActivitiesWithGroup[], filterStatus: "pending" | "scheduled"): IActivityWithGroupIcon[] => {
    return activitiesWithGroup.map((ag) => {
      return ag.activities
        .filter((activity) => activity.state === filterStatus)
        .map((activity) => ({
          ...activity,
          groupIcon: ag.group.icon
        }))
    }).flat();
  }


  if (loading) return <LoadingDots visible />

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={theme.containers.rootContainer}>
      <View>
        <Text style={theme.typography.heading2}>{t("activities.scheduledActivities")}</Text>
        <FlatList
          data={scheduledActivities}
          scrollEnabled={false}
          keyExtractor={(item, index) => item.id + index + "scheduled"}
          renderItem={({ item }) =>
            <ActivityListItem
              activity={item}
              activityIcon={<uiIcons.CalendarWithOkIcon size={30} color={theme.colors.primary} />}
              groupIcon={<Image style={{ width: 40, height: 40 }} source={avatars[item.groupIcon]} />}
            />
          }
          ListEmptyComponent={() => (
            <View style={{ flexDirection: "row", gap: theme.spacing.small, width: "90%" }}>
              <uiIcons.InfoIcon size={24} color={theme.colors.primary} />
              <Text style={theme.typography.body}>{t("activities.scheduledActivityEmptyText")}</Text>
            </View>
          )}
        />
      </View>
      <View>
        <Text style={theme.typography.heading2}>{t("activities.pendingActivities")}</Text>
        <FlatList
          data={pendingActivities}
          scrollEnabled={false}
          keyExtractor={(item, index) => item.id + index + "pending"}
          renderItem={({ item }) =>
            <ActivityListItem
              activity={item}
              activityIcon={<uiIcons.CalendarWithClockIcon size={30} color={theme.colors.primary} />}
              groupIcon={<Image style={{ width: 40, height: 40, borderRadius: 50 }} source={avatars[item.groupIcon]} />}
            />
          }
          ListEmptyComponent={() => (
            <View style={{ flexDirection: "row", gap: theme.spacing.small, width: "90%" }}>
              <uiIcons.InfoIcon size={24} color={theme.colors.primary} />
              <Text style={theme.typography.body}>{t("activities.pendingActivityEmptyText")}</Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  )
}

export default Activities
// Optionen für diesen Tab
