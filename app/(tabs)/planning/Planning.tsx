import useUiIcons from '@/assets/hooks/uiIconHook';
import { IDbActivity, ITimeInterval, ITimeSlot } from '@/assets/interfaces/ActivityInterface';
import { IGroup } from '@/assets/interfaces/GroupInterface';
import { addDocumentToCollection, firebaseErrorHandling, getFirebaseDocumentArray } from '@/assets/ts/firebaseExchange';
import { parseFirebaseGroup } from '@/assets/ts/parsing';
import { formatDateAndTime } from '@/assets/ts/timeManagement';
import AvailableTimesModal from '@/components/AvailableTimesModal';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import i18next from 'i18next';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, Text, TextInput, TouchableHighlight, View } from 'react-native';


const Planning = () => {
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const [activitiyName, setActivityName] = useState("");
  const [activitiyDestination, setActivityDestination] = useState("");
  const [activitiyDescription, setActivityDescription] = useState("");
  const [minParticipants, setMinParticipants] = useState<number | undefined>();
  const [userGroups, setUserGroups] = useState<IGroup[]>([])
  const [timeSlotModalVisible, setTimeSlotModalVisible] = useState(false)
  const [timeSlot, setTimeSlot] = useState<ITimeSlot[]>([]);
  const [durationDays, setDurationDays] = useState<number | undefined>();
  const [durationHours, setDurationHours] = useState<number | undefined>();
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>();
  const uiIcon = useUiIcons();
  const router = useRouter();
  const { user } = useUser();
  const [selectedGroupId, setSelectedGroupId] = useState(user.groupUuids && user.groupUuids.length > 0 ? user.groupUuids[0] : "")


  // Reset all state variables when navigating away
  const resetAllStates = () => {
    setActivityName("");
    setActivityDestination("");
    setActivityDescription("");
    setMinParticipants(undefined);
    setDurationDays(undefined);
    setDurationHours(undefined);
    setDurationMinutes(undefined);
    setTimeSlot([]);
    setTimeSlotModalVisible(false);
    setSelectedGroupId(user.groupUuids && user.groupUuids.length > 0 ? user.groupUuids[0] : "");
  };

  const removeTimeSlot = (timeSlot: ITimeInterval) => {
    setTimeSlot((prev) => prev.filter((slot) => slot.slots !== timeSlot));
  }
  const fetchUserGroups = useCallback((): Promise<IGroup[]> | null => {
    if (user.groupUuids && user.groupUuids.length > 0) {
      return getFirebaseDocumentArray(user.groupUuids, "Group")
        .then((docArr) => {
          return docArr //
            .filter((doc) => doc.exists()) //
            .map((doc) => parseFirebaseGroup(doc))
            .filter((group: IGroup | null) => group != null);
        })
        .then((parsedGroups: IGroup[]) => {
          setUserGroups(parsedGroups);
          return parsedGroups;
        })
        .catch((err) => {
          console.error("Planning Group Fetching Error:", err)
          return []
        })
    } else {
      setUserGroups([]);
      return null;
    }
  }, [JSON.stringify(user.groupUuids)])

  useEffect(() => {
    fetchUserGroups()
  }, [user.groupUuids, fetchUserGroups, JSON.stringify(user.groupUuids)])


  const submitActivity = () => {
    // TODO: Roter Rahmen um das Feld, das noch nicht ausgefüllt ist
    if (!activitiyName ||
      !activitiyDescription ||
      !activitiyDestination ||
      !selectedGroupId ||
      !minParticipants ||
      !timeSlot ||
      timeSlot.length === 0 ||
      (!durationDays && !durationHours && !durationMinutes)) {
      return;
    }
    let newActivity: IDbActivity = {
      declinedUserUuids: [],
      description: activitiyDescription,
      destination: activitiyDestination,
      memberUuids: [user.id],
      owningGroupId: selectedGroupId,
      duration: {
        ...(durationDays && { days: durationDays }),
        ...(durationHours && { hours: durationHours }),
        ...(durationMinutes && { minutes: durationMinutes }),
      },
      name: activitiyName,
      state: "pending",
      timeSlotsPerUserUuid: timeSlot,
      minParticipants: minParticipants
    }
    addDocumentToCollection("Group", newActivity, selectedGroupId, 'Activity')
      // .then((newActivityRef) => {
      //   const groupRef = getFirebaseDocRef(selectedGroupId, "Group");
      //   return updateDoc(groupRef, { activityUuids: arrayUnion(newActivityRef.id) })
      // })
      .catch((err) => firebaseErrorHandling(err))
    resetAllStates();
    router.replace("/(tabs)/activities/Activities");
  }

  const submittedNewTimeSlot = (timeSlot: ITimeInterval) => {
    setTimeSlot((prev) => [...prev, { userUuid: [user.id], slots: timeSlot }]);
    setTimeSlotModalVisible(false);
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ margin: theme.spacing.small }}>
      <View>
        {/** Name */}
        <View style={{ marginBottom: theme.spacing.large }}>
          <Text style={theme.typography.heading2}>{t("planning.activityName")}</Text>
          <View style={theme.input}>
            <TextInput value={activitiyName} placeholder={t("planning.activityNamePlaceholder")} onChangeText={(text) => setActivityName(text)} style={theme.typography.body} />
          </View>
        </View>
        {/** Gruppe */}
        <View style={{ marginBottom: theme.spacing.large }}>
          <Text style={theme.typography.heading2}>{t("planning.activityGroup")}</Text>
          {userGroups.length > 0 ? // TODO: Hier noch ein Fehler, wenn die Gruppe direkt neu erstellt wurde ist selectedGroupId noch 
            <Picker style={theme.typography.body} selectedValue={selectedGroupId} onValueChange={(groupId: string) => setSelectedGroupId(groupId)}>
              <Picker.Item style={theme.typography.body} key={"default"} label={t("planning.noGroupSelected")} value={""} />
              {userGroups.map((group, index) => (
                <Picker.Item style={theme.typography.body} key={index} label={group.name} value={group.id} />
              ))}
            </Picker>
            :
            <View style={{ flexDirection: "row", gap: theme.spacing.small }}>
              <uiIcon.InfoIcon size={24} color={theme.colors.primary} />
              <Text style={theme.typography.body}>{t("planning.emptyUserGroupText")}</Text>
            </View>
          }
        </View>
        {/** Ziel */}
        <View style={{ marginBottom: theme.spacing.large }}>
          <Text style={theme.typography.heading2}>{t("planning.activityDestination")}</Text>
          <View style={theme.input}>
            <TextInput value={activitiyDestination} placeholder={t("planning.activityDestinationPlaceholder")} onChangeText={(text) => setActivityDestination(text)} style={theme.typography.body} />
          </View>
        </View>
        {/** Dauer */}
        <View style={{ marginBottom: theme.spacing.large }}>
          <Text style={theme.typography.heading2}>{t("planning.activityDuration")}</Text>
          <View style={{ flexDirection: "row" }}>
            <TextInput
              keyboardType='numeric'
              value={durationDays ? durationDays.toString() : undefined}
              onChangeText={(day) => isNaN(parseInt(day)) ? setDurationDays(undefined) : setDurationDays(parseInt(day))}
              style={[theme.typography.body, { flex: 1, backgroundColor: theme.colors.secondary, borderTopLeftRadius: theme.borderRadius.large, borderBottomLeftRadius: theme.borderRadius.large, paddingLeft: theme.spacing.small }]}
              placeholder={t("planning.days")} />
            <TextInput
              keyboardType='numeric'
              value={durationHours ? durationHours.toString() : undefined}
              onChangeText={(hour) => isNaN(parseInt(hour)) ? setDurationHours(undefined) : setDurationHours(parseInt(hour))}
              style={[theme.typography.body, { flex: 1, backgroundColor: theme.colors.secondary }]}
              placeholder={t("planning.hours")} />
            <TextInput
              keyboardType='numeric'
              value={durationMinutes ? durationMinutes.toString() : undefined}
              onChangeText={(minute) => isNaN(parseInt(minute)) ? setDurationMinutes(undefined) : setDurationMinutes(parseInt(minute))}
              style={[theme.typography.body, { flex: 1, backgroundColor: theme.colors.secondary, borderTopRightRadius: theme.borderRadius.large, borderBottomRightRadius: theme.borderRadius.large }]}
              placeholder={t("planning.minutes")} />
          </View>
        </View>
        {/** Mindestteilnehmer */}
        <View style={{ marginBottom: theme.spacing.large }}>
          <Text style={theme.typography.heading2}>{t("planning.minParticipants")}</Text>
          <View style={theme.input}>
            <TextInput
              keyboardType='numeric'
              value={minParticipants ? minParticipants.toString() : undefined}
              placeholder={t("planning.minParticipantsInput")}
              onChangeText={(val) => isNaN(parseInt(val)) ? setMinParticipants(undefined) : setMinParticipants(parseInt(val))}
              style={theme.typography.body} />
          </View>
        </View>
        {/** Mögliche Zeitslots */}
        <View style={{ marginBottom: theme.spacing.large }}>
          <View style={theme.containers.headingWithIconContainer}>
            <Text style={theme.typography.heading2}>{t("settings.availableTimes")}</Text>
            <uiIcon.PlusIcon size={30} color={theme.colors.primary} onPress={() => setTimeSlotModalVisible(true)} />
          </View>
          <FlatList
            scrollEnabled={false}
            data={timeSlot}
            renderItem={({ item, index }) => (
              <View key={index} style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: theme.spacing.small, marginBottom: theme.spacing.small }}>
                <uiIcon.RemoveIcon size={24} color={theme.colors.primary} onPress={() => removeTimeSlot(item.slots)} />
                <View style={{ padding: theme.spacing.small, marginRight: theme.spacing.large, marginLeft: theme.spacing.small, backgroundColor: theme.colors.secondary, borderRadius: theme.borderRadius.small }}>
                  <uiIcon.CalendarWithOkIcon key={index} size={24} color={theme.colors.primary} />
                </View>
                <View style={{ flexGrow: 1 }}>
                  <Text style={theme.typography.body}>{formatDateAndTime(item.slots.start, i18next.language)}</Text>
                  <Text style={theme.typography.body}>{formatDateAndTime(item.slots.end, i18next.language)}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View>
                <View style={{ flexDirection: "row", gap: theme.spacing.small, width: "90%" }}>
                  <uiIcon.InfoIcon size={24} color={theme.colors.primary} />
                  <Text style={theme.typography.body}>{t("planning.emptyTimeSlotText")}</Text>
                </View>
              </View>
            }
          />
        </View>
        {/** Beschreibung */}
        <View style={{ marginVertical: theme.spacing.large }}>
          <Text style={[theme.typography.heading2, { marginBottom: theme.spacing.small }]}>{t("planning.activityDescription")}</Text>
          <View style={theme.input}>
            <TextInput
              multiline
              numberOfLines={4}
              placeholder={t("planning.activityDescriptionInput")}
              value={activitiyDescription}
              style={[theme.typography.body, { minHeight: 24 * 4, textAlignVertical: "top" }]}
              onChangeText={(val) => setActivityDescription(val)} />
          </View>
        </View>
        <TouchableHighlight style={theme.button} underlayColor={theme.colors.secondary} onPress={submitActivity}>
          <Text style={theme.buttonText}>{t("common.submit")}</Text>
        </TouchableHighlight>
      </View>
      <AvailableTimesModal modalVisible={timeSlotModalVisible} actionByParent={(timeSlot) => submittedNewTimeSlot(timeSlot)} />
    </ScrollView >
  )
}
export default Planning