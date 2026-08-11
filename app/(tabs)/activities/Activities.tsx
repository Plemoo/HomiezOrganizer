import useUiIcons from '@/assets/hooks/uiIconHook';
import { IActivitiesWithGroup, IActivityWithGroupIconAndName } from '@/assets/interfaces/ActivityInterface';
import { getUniqueActivitiesWithGroupIcon, setStateForEndedActivitesToClosed, sortActivitiesByDueDate, sortActivitiesByEarliestAvailability } from '@/assets/ts/componentFunctions/activities';
import { FirebaseSnapshotListener } from '@/assets/ts/firebaseSnapshotListener';
import ActivityListItem from '@/components/ActivityListItem';
import LoadingDots from '@/components/Loading';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import { Unsubscribe } from '@react-native-firebase/firestore';
import { useFocusEffect } from 'expo-router';
import * as jdenticon from 'jdenticon';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const Activities = () => {
  const { user, userLoading } = useUser();
  const { t } = useTranslation();
  const { theme } = useCustomTheme();
  const uiIcons = useUiIcons()
  const [loading, setLoading] = useState(true)
  const [scheduledActivities, setScheduledActivities] = useState<IActivityWithGroupIconAndName[]>([]);
  const [pendingActivities, setPendingActivities] = useState<IActivityWithGroupIconAndName[]>([]);
  const userId = user?.id;
  const groupIds = user?.groupUuids;


  useFocusEffect(useCallback(() => {
    // When the user focuses the Activities tab, we want to update the scheduled activities that are already closed
    if(scheduledActivities.length>0){
      setStateForEndedActivitesToClosed(scheduledActivities)
    }
  }, [scheduledActivities]))

  useEffect(() => {
    let newActivityUnsubscribe: Unsubscribe | null = null;
    let newGroupWithActivitiesUnsubscribe: Unsubscribe | null = null;
    try {
      // if (!isFocused) throw new Error("Activities component is not focused, so no need to load activities.");
      if (!userId) return
      if (!groupIds) throw new Error("User has no groupUuids on Activity init.");
      // Just add the new activity that were newly created in the existing group of the user
      newActivityUnsubscribe = FirebaseSnapshotListener.snapshotListenerForNewActivitiesInGroupsOfUser(groupIds, (newActivityWithGroup: IActivitiesWithGroup | null) => {
        if (!newActivityWithGroup || !newActivityWithGroup.activities || newActivityWithGroup.activities.length !== 1) return;
        const firebaseAct = newActivityWithGroup.activities[0];
        const decoratedActivity: IActivityWithGroupIconAndName = {
          ...firebaseAct,
          groupIcon: newActivityWithGroup.group.icon,
          groupName: newActivityWithGroup.group.name,
        };
        if (firebaseAct.state === "pending") {
          setPendingActivities((prev) => getUniqueActivitiesWithGroupIcon(prev.filter((activity) => activity.id !== firebaseAct.id), [decoratedActivity]).sort((a, b) => sortActivitiesByEarliestAvailability(a, b)));
          setScheduledActivities((prev) => prev.filter((activity) => activity.id !== firebaseAct.id));
        } else if (firebaseAct.state === "scheduled") {
          setScheduledActivities((prev) => getUniqueActivitiesWithGroupIcon(prev.filter((activity) => activity.id !== firebaseAct.id), [decoratedActivity]).sort((a, b) => sortActivitiesByDueDate(a, b)));
          setPendingActivities((prev) => prev.filter((activity) => activity.id !== firebaseAct.id));
        } else {
          setPendingActivities((prev) => prev.filter((activity) => activity.id !== firebaseAct.id));
          setScheduledActivities((prev) => prev.filter((activity) => activity.id !== firebaseAct.id));
        }
        setLoading(false);
      });
      // Overwrite all activities with the new activities per group, once the user joins a new
      newGroupWithActivitiesUnsubscribe = FirebaseSnapshotListener.snapshotListenerForUserJoinsNewGroup(userId, (activitiesWithGroup: IActivitiesWithGroup[] | null) => {
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
    } catch (err) {
      setLoading(false);
      setPendingActivities([]);
      setScheduledActivities([]);
      console.error("Error in Activities component:", err);
    }
    return () => {
      newActivityUnsubscribe?.();
      newGroupWithActivitiesUnsubscribe?.();
    };
  }, [userLoading, userId, groupIds]);


  const getActivitiesWithGroupIcon = (activitiesWithGroup: IActivitiesWithGroup[], filterStatus: "pending" | "scheduled"): IActivityWithGroupIconAndName[] => {
    return activitiesWithGroup.map((ag) => {
      return ag.activities
        .filter((activity) => activity.state === filterStatus)
        .map((activity) => ({
          ...activity,
          groupIcon: ag.group.icon,
          groupName: ag.group.name
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
              // groupIcon={<Image style={{ width: 40, height: 40 }} source={avatars[item.groupIcon]} />}
              groupIcon={<SvgXml xml={jdenticon.toSvg(item.groupName, 40)} width={40} height={40} />}
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
              // groupIcon={<Image style={{ width: 40, height: 40, borderRadius: 50 }} source={avatars[item.groupIcon]} />}
              groupIcon={<SvgXml xml={jdenticon.toSvg(item.groupName, 40)} width={40} height={40} />}

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
