import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import useUiIcons from '@/assets/hooks/uiIconHook';
import { IActivitiesWithGroup, IActivityWithGroupIcon } from '@/assets/interfaces/ActivityInterface';
import { getAllActivitiesByGroupIds, getCombinedArrayWithUniqueActivities, sortActivitiesByDueDate, sortActivitiesByEarliestAvailability } from '@/assets/ts/componentFunctions/activities';
import { firebaseErrorHandling } from '@/assets/ts/firebaseExchange';
import ActivityListItem from '@/components/ActivityListItem';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

const Activities = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { theme } = useCustomTheme();
  const uiIcons = useUiIcons()
  const { avatars } = useAvatarIcons()
  const [loading, setLoading] = useState(true)
  const [scheduledActivities, setScheduledActivities] = useState<IActivityWithGroupIcon[]>([]);
  const [pendingActivities, setPendingActivities] = useState<IActivityWithGroupIcon[]>([]);
  const isFocused = useIsFocused();
  // TODO: Noch ein Due Date einfügen für die Aktivität, damit man danach sortieren kann
  // TODO: Noch kennzeichnen bei welchen Aktivitäten der User schon zugesagt hat und bei welchen nicht
  // TODO: Switch aufbauen um die Reihenfolge der Anzeige zu ändern
  useEffect(() => {
    if (!isFocused) return;
    if (user.groupUuids) {
      getAllActivitiesByGroupIds(user.groupUuids)
        .then((activitiesWithGroup) => {
          setScheduledActivities((prev) => getAndSortScheduledActivities(prev, activitiesWithGroup));
          setPendingActivities((prev) => getAndSortPendingActivities(prev, activitiesWithGroup));
        }).catch((err)=>firebaseErrorHandling(err))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [isFocused])

  const getAndSortScheduledActivities = (previousActivitiesByGroup: IActivityWithGroupIcon[], newActivitiesByGroup: IActivitiesWithGroup[]): IActivityWithGroupIcon[] => {
    return getCombinedArrayWithUniqueActivities(
      previousActivitiesByGroup,
      getActivitiesWithGroupIcon(newActivitiesByGroup, "scheduled")
    )
      .sort((activity1, activity2) => sortActivitiesByDueDate(activity1, activity2)) as IActivityWithGroupIcon[];
  }

  const getAndSortPendingActivities = (previousActivitiesByGroup: IActivityWithGroupIcon[], newActivitiesByGroup: IActivitiesWithGroup[]): IActivityWithGroupIcon[] => {
    return getCombinedArrayWithUniqueActivities(
      previousActivitiesByGroup,
      getActivitiesWithGroupIcon(newActivitiesByGroup, "pending")
    )
      .sort((activity1, activity2) => sortActivitiesByEarliestAvailability(activity1, activity2)) as IActivityWithGroupIcon[];
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


  // TODO: Loading schön machen
  if (loading) {
    return <Text>LOADING</Text>
  }
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={theme.containers.rootContainer}>
      <View>
        <Text style={theme.typography.heading2}>{t("activities.scheduledActivities")}</Text>
        <FlatList
          data={scheduledActivities}
          scrollEnabled={false}
          renderItem={({ item, index }) =>
            <ActivityListItem
              key={index + "scheduled"}
              activity={item}
              activityIcon={<uiIcons.CalendarWithOkIcon size={24} color={theme.colors.primary} />}
              groupIcon={<Image style={{ width: 40, height: 40 }} source={avatars[item.groupIcon]} />}
            />
          }
        />
      </View>
      <View>
        <Text style={theme.typography.heading2}>{t("activities.pendingActivities")}</Text>
        <FlatList
          data={pendingActivities}
          scrollEnabled={false}
          renderItem={({ item, index }) =>
            <ActivityListItem
              key={index + "pending"}
              activity={item}
              activityIcon={<uiIcons.CalendarWithOkIcon size={24} color={theme.colors.primary} />}
              groupIcon={<Image style={{ width: 40, height: 40, borderRadius: 50 }} source={avatars[item.groupIcon]} />}
            />
          }
        />
      </View>
    </ScrollView>
  )
}

export default Activities
// Optionen für diesen Tab

const styles = StyleSheet.create({})