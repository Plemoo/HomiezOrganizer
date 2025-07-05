import useUiIcons from '@/assets/hooks/uiIconHook';
import { IActivity, IDuration, ITimeInterval, ITimeSlot } from '@/assets/interfaces/ActivityInterface';
import { IFirebaseSearchParameter } from '@/assets/interfaces/FirebaseInterface';
import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { activityCancelConfirmationDialog } from '@/assets/ts/activityCancelDialog';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
import { FirebaseSnapshotListener } from '@/assets/ts/firebaseSnapshotListener';
import { parseFirebaseActivity, parseFirebaseGroup, parseFirebaseUser } from '@/assets/ts/parsing';
import { dayjs, formatDateAndTimeSmall } from '@/assets/ts/timeManagement';
import ActivityComments from '@/components/ActivityComments';
import ActivityDetailDetails from '@/components/ActivityDetailDetails';
import AvailableTimesModal from '@/components/AvailableTimesModal';
import GoBack from '@/components/GoBack';
import LoadingDots from '@/components/Loading';
import { useUser } from '@/components/ProfileInformationContext';
import ShowUserIconOrName from '@/components/ShowUserIconOrName';
import { useCustomTheme } from '@/components/ThemeContext';
import TimeSlotSelectionModal from '@/components/TimeSlotSelectionModal';
import { UnknownInputParams, useLocalSearchParams, useRouter } from 'expo-router';
import i18next from 'i18next';
import { isEqual } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Pressable, ScrollView, Switch, Text, TouchableHighlight, View } from 'react-native';

const ActivityDetail = () => {
  const { user, userLoading } = useUser();
  const { activityIdParameter, groupIdParameter }: IFirebaseSearchParameter = useLocalSearchParams();
  const { theme } = useCustomTheme();
  const [anyAcceptionUser, setAnyAcceptionUser] = useState<ILocalUser[]>([]);
  const [declinedUser, setDeclinedUser] = useState<ILocalUser[]>([]);
  const [openUser, setOpenUser] = useState<ILocalUser[]>([]);
  const [timeSlotsPerUser, setTimeSlotsPerUser] = useState<ITimeSlot[]>([]);
  const [groupId, setGroupId] = useState<string | undefined>();
  const [activityId, setActivityId] = useState<string | undefined>();
  const [activityName, setActivityName] = useState<string | undefined>();
  const [activityGroupName, setActivityGroupName] = useState<string | undefined>();
  const [activityDuration, setActivityDuration] = useState<IDuration | undefined>();
  const [activityMinParticipants, setActivityMinParticipants] = useState<number | undefined>();
  const [activityDescription, setActivityDescription] = useState<string | undefined>();
  const [userActivityStatus, setUserActivityStatus] = useState<"accepted" | "declined" | "open">("open");
  const router = useRouter();
  const { t } = useTranslation();
  const uiIcon = useUiIcons();
  const [showNamesOrIcons, setShowNamesOrIcons] = useState<"names" | "icons">("icons");
  const [newTimeSlotModalVisible, setNewTimeSlotModalVisible] = useState(false);
  const [timeSlotModalSelectionVisible, setTimeSlotModalSelectionVisible] = useState(false);


  useEffect(() => {
    if(!user || userLoading) return;
    let unsubscribe: (() => void) | undefined;
    if (activityIdParameter && groupIdParameter) {
      unsubscribe = FirebaseSnapshotListener.snapshotListenerForActivityDetailChange(groupIdParameter, activityIdParameter, (activityWithChange: IActivity | null) => {
        if (activityWithChange) {
          if (activityWithChange.state === "cancelled" || activityWithChange.state === "closed") {
            router.replace("/(tabs)/activities/Activities")
            return null;
          }
          if (activityWithChange.state === "scheduled") {
            let searchParams: IFirebaseSearchParameter = {
              activityIdParameter: activityWithChange.id,
              groupIdParameter: activityWithChange.owningGroupId,
            }
            router.replace({ pathname: "/(tabs)/activities/ScheduledActivity", params: searchParams as UnknownInputParams });
            return null;
          }
          setActivityId(activityWithChange.id);
          setGroupId(activityWithChange.owningGroupId);
          setActivityName(activityWithChange.name);
          setActivityDuration(activityWithChange.duration);
          setActivityMinParticipants(activityWithChange.minParticipants);
          setActivityDescription(activityWithChange.description);
          setTimeSlotsPerUser(activityWithChange.timeSlotsPerUserUuid);
          // Fetch all the users of the Group/Activity
          FirebaseExchange.getFirebaseDocument(activityWithChange.owningGroupId, "Group")
            .then((groupDoc) => {
              let group = parseFirebaseGroup(groupDoc);
              setActivityGroupName(group?.name);
              return group ? group.memberUuids : [];
            }).then((groupMembers) => {
              const userIdOfAnySlot = activityWithChange.timeSlotsPerUserUuid.flatMap((slot) => slot.userUuid);
              const userIdDeclined = activityWithChange.declinedUserUuids;
              const userIdOpen = groupMembers.filter((userId) => !userIdOfAnySlot.includes(userId) && !userIdDeclined.includes(userId));
              FirebaseExchange.getFirebaseDocumentArray([...userIdOfAnySlot, ...userIdDeclined, ...userIdOpen], "User")
                .then((docs) => {
                  const allUsers = docs.map((doc) => parseFirebaseUser(doc)).filter((user): user is ILocalUser => user !== null);
                  setAnyAcceptionUser(allUsers.filter(firebaseUser => userIdOfAnySlot.includes(firebaseUser.id)));
                  setDeclinedUser(allUsers.filter(firebaseUser => userIdDeclined.includes(firebaseUser.id)));
                  setOpenUser(allUsers.filter(firebaseUser => userIdOpen.includes(firebaseUser.id)));
                  if (userIdDeclined.includes(user.id)) {
                    setUserActivityStatus("declined");
                  } else if (userIdOfAnySlot.includes(user.id)) {
                    setUserActivityStatus("accepted");
                  } else {
                    setUserActivityStatus("open");
                  }
                })
                .catch((err) => FirebaseExchange.firebaseErrorHandling(err))
            }).catch((err) => FirebaseExchange.firebaseErrorHandling(err));
        }
      })
    }
    return () => unsubscribe?.();
  }, [activityIdParameter, groupIdParameter,userLoading])


  const addOrRemoveUserFromTimeSlot = (item: ITimeSlot) => {
    if (!activityId || !groupId || !user) return;
    FirebaseExchange.getFirebaseDocument(activityId, "Group", groupId, "Activity")
      .then((activityDoc) => parseFirebaseActivity(activityDoc))
      .then((firebaseActivity) => {
        if (!firebaseActivity) return;
        // Ziel: Den User aus dem Timslot UserID Array entfernen oder hinzufügen
        let newTimeSlotsPerUser: ITimeSlot[] = newTimeSlotPerUserBasedOnItem(firebaseActivity, item, user);
        setTimeSlotsPerUser(newTimeSlotsPerUser);
        let updatedActivity: IActivity = {
          ...firebaseActivity,
          declinedUserUuids: firebaseActivity.declinedUserUuids.filter((userId) => userId !== user.id), // User aus den abgelehnten Nutzern entfernen
          timeSlotsPerUserUuid: newTimeSlotsPerUser
        };
        setAcceptedOrOpenUserActivityStatus(newTimeSlotsPerUser);
        FirebaseExchange.updateFirebaseDocument(updatedActivity, "Group", groupId, "Activity", updatedActivity.id)
          .catch((err) => FirebaseExchange.firebaseErrorHandling(err));
        // TODO: Kompletten Zeitslot löschen, wenn kein user mehr drin ist? Überschneidendende Zeitslots behandeln?
      })
  }

  const setAcceptedOrOpenUserActivityStatus = (newTimeSlotsPerUser: ITimeSlot[]) => {
    if (!user) return;
    let userIdContainedInTimeSlot = newTimeSlotsPerUser
      .map((slot) => slot.userUuid)
      .flat()
      .some((userId) => userId === user.id);
    if (userIdContainedInTimeSlot) {
      setUserActivityStatus("accepted");
      // Füge den User zu den akzeptierten Nutzern hinzu, wenn er nicht schon drin ist
      setAnyAcceptionUser((prev) => {
        if (prev.map(u => u.id).includes(user.id)) {
          return prev;
        }
        return [...prev, user];
      });
      // Lösche den user aus den anderen Listen
      setOpenUser((prev) => prev.filter(u => u.id !== user.id));
      setDeclinedUser((prev) => prev.filter(u => u.id !== user.id));
    } else {
      setUserActivityStatus("open");
      // Füge den User zu den offenen Nutzern hinzu, wenn er nicht schon drin ist
      setOpenUser((prev) => {
        if (prev.map(u => u.id).includes(user.id)) {
          return prev;
        }
        return [...prev, user];
      });
      // Lösche den user aus den anderen Listen
      setAnyAcceptionUser((prev) => prev.filter(u => u.id !== user.id));
      setDeclinedUser((prev) => prev.filter(u => u.id !== user.id));
    }
  }

  const acceptAllTimeSlots = () => {
    if (!activityId || !groupId || !user) return;
    FirebaseExchange.getFirebaseDocument(activityId, "Group", groupId, "Activity")
      .then((activityDoc) => parseFirebaseActivity(activityDoc))
      .then((firebaseActivity) => {
        if (!firebaseActivity) return;
        // Zu allen Zeitslots den User hinzufügen
        let newTimeSlotsPerUser: ITimeSlot[] = []
        firebaseActivity.timeSlotsPerUserUuid.forEach((slot) => {
          // ID bereits enthalten -> tue nichts
          if (slot.userUuid.includes(user.id)) {
            newTimeSlotsPerUser.push(slot);
          } else { // ID nicht enthalten -> füge sie hinzu
            newTimeSlotsPerUser.push({
              ...slot,
              userUuid: [...new Set([...slot.userUuid, user.id])] // User hinzufügen, wenn er nicht schon drin ist
            });
          }
        })
        setTimeSlotsPerUser(newTimeSlotsPerUser);
        setAcceptedOrOpenUserActivityStatus(newTimeSlotsPerUser);
        let updatedActivity: IActivity = {
          ...firebaseActivity!,
          declinedUserUuids: firebaseActivity.declinedUserUuids.filter((userId) => userId !== user.id), // User aus den abgelehnten Nutzern entfernen
          timeSlotsPerUserUuid: newTimeSlotsPerUser
        };
        FirebaseExchange.updateFirebaseDocument(updatedActivity, "Group", groupId, "Activity", updatedActivity.id)
      })
  }

  const declineActivity = () => {
    if (!activityId || !groupId || !user) return;
    FirebaseExchange.getFirebaseDocument(activityId, "Group", groupId, "Activity")
      .then((activityDoc) => parseFirebaseActivity(activityDoc))
      .then((firebaseActivity) => {
        if (!firebaseActivity) return;
        if (!firebaseActivity.declinedUserUuids.includes(user.id)) {// User nicht in declined Users
          setUserActivityStatus("declined");
          setDeclinedUser((prev) => prev.some(u => u.id === user.id) ? prev : [...prev, user]);
          setAnyAcceptionUser((prev) => prev.filter(u => u.id !== user.id));
          setOpenUser((prev) => prev.filter(u => u.id !== user.id));
          // User aus alles slots löschen
          let timeSlotsWithoutCurrentUser = firebaseActivity.timeSlotsPerUserUuid.map((slot) => {
            return {
              ...slot,
              userUuid: slot.userUuid.filter((userId) => userId !== user.id)
            };
          })
          setTimeSlotsPerUser(timeSlotsWithoutCurrentUser);
          let declinedUserAcitivity: IActivity = {
            ...firebaseActivity!,
            declinedUserUuids: [...new Set([...firebaseActivity.declinedUserUuids, user.id])],
            timeSlotsPerUserUuid: timeSlotsWithoutCurrentUser
          };
          FirebaseExchange.updateFirebaseDocument(declinedUserAcitivity, "Group", groupId, "Activity", declinedUserAcitivity.id)
        }
      })
  }

  const submittedNewTimeSlot = (timeInterval: ITimeInterval) => {
    if (!activityId || !groupId || !user) return;
    FirebaseExchange.getFirebaseDocument(activityId, "Group", groupId, "Activity")
      .then((activityDoc) => parseFirebaseActivity(activityDoc))
      .then((firebaseActivity) => {
        if (!firebaseActivity) return;
        // Füge den neuen Zeitslot hinzu
        let timeSlot: ITimeSlot = {
          userUuid: [user.id], // Der User, der den Zeitslot erstellt hat, ist automatisch drin
          slots: timeInterval
        };
        let newTimeSlotsPerUser = [...firebaseActivity.timeSlotsPerUserUuid, timeSlot];
        setTimeSlotsPerUser(newTimeSlotsPerUser);
        setNewTimeSlotModalVisible(false);
        let updatedActivity: IActivity = {
          ...firebaseActivity,
          timeSlotsPerUserUuid: newTimeSlotsPerUser
        };
        FirebaseExchange.updateFirebaseDocument(updatedActivity, "Group", groupId, "Activity", updatedActivity.id)
          .catch((err) => FirebaseExchange.firebaseErrorHandling(err));
      });
  }

  const cancelActivityPressed = () => {
    if (!activityId || !groupId) return;
    activityCancelConfirmationDialog(() => {
      FirebaseExchange.getFirebaseDocument(activityId, "Group", groupId, "Activity")
        .then((activityDoc) => parseFirebaseActivity(activityDoc))
        .then((firebaseActivity) => {
          if (!firebaseActivity) return;
          // Lösche die Activity
          FirebaseExchange.updateFirebaseDocument({ ...firebaseActivity, state: "cancelled" }, "Group", groupId, "Activity", firebaseActivity.id)
            .then(() => router.replace("/activities/Activities")) // Gehe zurück
            .catch((err) => FirebaseExchange.firebaseErrorHandling(err));
        });
    })
  }

  const submitActivityPressed = () => {
    if (!activityId || !groupId || !activityMinParticipants) return;
    let possibleTimeSlots = timeSlotsPerUser.filter((slot) => slot.userUuid.length >= activityMinParticipants);
    if (possibleTimeSlots.length === 0) {
      Alert.alert(t("activities.noValidTimeSlotTitle"), t("activities.noValidTimeSlot"));
      return;
    }
    if (possibleTimeSlots.length > 1) {
      // In diesem Fall wird Aktivität hier gestartet: activityTimeSlotSelection
      setTimeSlotModalSelectionVisible(true);
    } else {
      updateActivityWithSelectedTimeSlot();
    }
  }

  /**
   * Methode setzt den Status von planned auf scheduled und setzt alle notwendigen attribute
   */
  const updateActivityWithSelectedTimeSlot = (timeSlotsWithSelection?: ITimeSlot[]) => {
    if (!activityId || !groupId || !activityMinParticipants) return;
    FirebaseExchange.getFirebaseDocument(activityId, "Group", groupId, "Activity")
      .then((activityDoc) => parseFirebaseActivity(activityDoc))
      .then((firebaseActivity) => {
        if (!firebaseActivity) return;
        // Wird kein Zeitslot übergeben, wird angenommen, dass es nur einen Zeitslot gibt, der >=1 min Participants hat
        if (!timeSlotsWithSelection) {
          timeSlotsWithSelection = firebaseActivity.timeSlotsPerUserUuid.map((slot) => slot.userUuid.length >= activityMinParticipants ? { ...slot, selected: true } : slot);
        }
        let selectedSlot = timeSlotsWithSelection.filter((slot) => slot.selected)
        if (selectedSlot.length !== 1) throw new Error("Es muss genau ein Zeitslot ausgewählt sein, um die Aktivität zu planen.");
        // Setze die wirkliche Zeit (Time Slot start + Duration)
        let endDate = dayjs(selectedSlot[0].slots.start)
          .add((firebaseActivity.duration.minutes ? firebaseActivity.duration.minutes : 0), "minute")
          .add((firebaseActivity.duration.hours ? firebaseActivity.duration.hours : 0), "hour")
          .add((firebaseActivity.duration.days ? firebaseActivity.duration.days : 0), "day");
        let activityTime = { start: selectedSlot[0].slots.start, end: endDate.toDate() };
        let scheduledActivity: IActivity = {
          ...firebaseActivity,
          state: "scheduled",
          timeSlotsPerUserUuid: timeSlotsWithSelection, // Füge alle Zeitslots hinzu. Inklusive der der selected ist
          time: activityTime, // Setze die Zeit, worin die Aktivität stattfindet
          memberUuids: selectedSlot[0].userUuid // Setze die Teilnehmer der aktivität
        };
        FirebaseExchange.updateFirebaseDocument(scheduledActivity, "Group", groupId, "Activity", firebaseActivity.id)
          .then(() => {
            const notificationData: IFirebaseSearchParameter = {
              groupIdParameter: scheduledActivity.owningGroupId,
              activityIdParameter: scheduledActivity.id
            }
            router.replace({ pathname: "/activities/ScheduledActivity", params: notificationData as UnknownInputParams }) // Gehe zurück
          })
          .catch((err) => FirebaseExchange.firebaseErrorHandling(err));
      }).catch((err) => FirebaseExchange.firebaseErrorHandling(err));
  }

  const activityTimeSlotSelection = (timeSlots: ITimeSlot[]) => {
    setTimeSlotModalSelectionVisible(false);
    updateActivityWithSelectedTimeSlot(timeSlots);
  }
  if (!activityId || !groupId) return <LoadingDots visible />;

  return (
    <ScrollView style={theme.containers.rootContainer} showsVerticalScrollIndicator={false}>
      <GoBack />
      <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
        <View>
          <Pressable
            style={{ borderWidth: 2, backgroundColor: userActivityStatus === "declined" ? theme.colors.error : "transparent", borderColor: theme.colors.error, borderRadius: theme.borderRadius.medium, padding: theme.spacing.small }}
            onPress={() => declineActivity()}>
            <uiIcon.ThumbDownIcon color={theme.colors.primary} size={40} />
          </Pressable>
        </View>
        <View>
          <Pressable
            style={{ borderWidth: 2, backgroundColor: userActivityStatus === "accepted" ? theme.colors.okay : "transparent", borderColor: theme.colors.okay, borderRadius: theme.borderRadius.medium, padding: theme.spacing.small }}
            onPress={() => acceptAllTimeSlots()}>
            <uiIcon.ThumbUpIcon color={theme.colors.primary} size={40} />
          </Pressable>
        </View>
      </View>
      <View style={theme.containers.centeredContainer}>
        <Text style={theme.typography.heading1}>{activityName}</Text>
      </View>
      {/* Accepted Users */}
      <View style={{ marginBottom: theme.spacing.medium }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={theme.typography.heading2}>{t("activities.acceptedUsers")}</Text>
          <Switch
            value={showNamesOrIcons === "names"}
            onValueChange={() => setShowNamesOrIcons(showNamesOrIcons === "names" ? "icons" : "names")}
            trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
            thumbColor={theme.colors.textLight}
          />
        </View>
        <ShowUserIconOrName users={anyAcceptionUser} showNamesOrIcons={showNamesOrIcons} />
      </View>
      {/* Declined Users */}
      <View style={{ marginBottom: theme.spacing.medium }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={theme.typography.heading2}>{t("activities.declinedUsers")}</Text>
          <Switch
            value={showNamesOrIcons === "names"}
            onValueChange={() => setShowNamesOrIcons(showNamesOrIcons === "names" ? "icons" : "names")}
            trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
            thumbColor={theme.colors.textLight}
          />
        </View>
        <ShowUserIconOrName users={declinedUser} showNamesOrIcons={showNamesOrIcons} />
      </View>
      {/* Open users */}
      <View style={{ marginBottom: theme.spacing.medium }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={theme.typography.heading2}>{t("activities.openUsers")}</Text>
          <Switch
            value={showNamesOrIcons === "names"}
            onValueChange={() => setShowNamesOrIcons(showNamesOrIcons === "names" ? "icons" : "names")}
            trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
            thumbColor={theme.colors.textLight}
          />
        </View>
        <ShowUserIconOrName users={openUser} showNamesOrIcons={showNamesOrIcons} />
      </View>
      {/* Activity Duration and Min Participants ActivityGroup */}
      <ActivityDetailDetails
        activityMinParticipants={activityMinParticipants}
        activityDuration={activityDuration}
        activityGroupName={activityGroupName}
      />
      {/* Activity Description */}
      <View style={{ marginBottom: theme.spacing.medium }}>
        <Text style={theme.typography.heading2}>{t("planning.activityDescription")}</Text>
        <Text style={theme.typography.body}>{activityDescription}</Text>
      </View>
      {/* Available Times */}
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={theme.typography.heading2}>{t("settings.availableTimes")}</Text>
          <Pressable onPress={() => setNewTimeSlotModalVisible(true)}>
            <uiIcon.PlusIcon size={30} color={theme.colors.primary} />
          </Pressable>
        </View>
        <FlatList
          data={timeSlotsPerUser}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View key={index + "timeSlot"} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.medium }} >
              <View style={{ flexDirection: "column" }}>
                <Text style={theme.typography.body}>{item.userUuid.length} / {activityMinParticipants}</Text>
                <Text style={theme.typography.body}>
                  {formatDateAndTimeSmall(item.slots.start, i18next.language)} - {formatDateAndTimeSmall(item.slots.end, i18next.language)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: theme.spacing.medium }}>
                <Pressable
                  style={{ borderWidth: 2, backgroundColor: user &&item.userUuid.includes(user.id) ? theme.colors.okay : "transparent", borderColor: theme.colors.okay, borderRadius: theme.borderRadius.medium, padding: theme.spacing.small }}
                  onPress={() => addOrRemoveUserFromTimeSlot(item)}
                >
                  <uiIcon.ThumbUpIcon size={30} color={theme.colors.primary} />
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>
      <ActivityComments activityId={activityId} groupId={groupId} />
      <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginBottom: theme.spacing.xlarge, gap: theme.spacing.small }}>
        <TouchableHighlight style={[theme.button, { flex: 1 }]} onPress={() => cancelActivityPressed()}>
          <View style={{ gap: theme.spacing.small, marginHorizontal: theme.spacing.medium, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            <uiIcon.CancelIcon size={30} color={theme.colors.textLight} />
            <Text style={[theme.buttonText]}>{t("activities.cancelActivity")}</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={[theme.button, { flex: 1 }]} onPress={() => submitActivityPressed()}>
          <View style={{ gap: theme.spacing.small, marginHorizontal: theme.spacing.medium, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            <uiIcon.CalendarWithOkIcon size={30} color={theme.colors.textLight} />
            <Text style={theme.buttonText}>{t("activities.scheduleActivity")}</Text>
          </View>
        </TouchableHighlight>
      </View>
      <AvailableTimesModal modalVisible={newTimeSlotModalVisible} actionByParent={(timeSlot) => submittedNewTimeSlot(timeSlot)} setModalStateInParent={setNewTimeSlotModalVisible} />
      <TimeSlotSelectionModal
        transitionVisibleState={(isVisible) => setTimeSlotModalSelectionVisible(isVisible)}
        modalVisible={timeSlotModalSelectionVisible}
        actionByParent={(timeSlot) => activityTimeSlotSelection(timeSlot)}
        minParticipants={activityMinParticipants || 0}
        timeSlots={timeSlotsPerUser} />
    </ScrollView>
  )
}


function newTimeSlotPerUserBasedOnItem(firebaseActivity: IActivity, item: ITimeSlot, user: ILocalUser) {
  let newTimeSlotsPerUser: ITimeSlot[] = [];
  firebaseActivity.timeSlotsPerUserUuid.forEach((firebaseTimeSlot) => {
    if (isEqual(firebaseTimeSlot.slots.start, item.slots.start) && isEqual(firebaseTimeSlot.slots.end, item.slots.end)) {
      // Wenn der Zeitslot gleich ist, dann den User hinzufügen oder entfernen
      if (firebaseTimeSlot.userUuid.includes(user.id)) {
        // User ist schon drin, also entfernen
        let filteredUser = { ...firebaseTimeSlot, userUuid: [...new Set(firebaseTimeSlot.userUuid.filter((userId) => userId !== user.id))] };
        newTimeSlotsPerUser.push(filteredUser);
      } else {
        // User ist nicht drin, also hinzufügen
        newTimeSlotsPerUser.push({ ...firebaseTimeSlot, userUuid: [...new Set([...firebaseTimeSlot.userUuid, user.id])] });
      }
    } else { // Nicht betroffener Zeitslot, also unverändert lassen
      newTimeSlotsPerUser.push({ ...firebaseTimeSlot });
    }
  });
  return newTimeSlotsPerUser;
}



export default ActivityDetail

