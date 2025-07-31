import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import useUiIcons from '@/assets/hooks/uiIconHook';
import { IActivity } from '@/assets/interfaces/ActivityInterface';
import { IFirebaseSearchParameter } from '@/assets/interfaces/FirebaseInterface';
import { IGroup } from '@/assets/interfaces/GroupInterface';
import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { setStateForEndedActivitesToClosed, sortActivitiesByDueDate } from '@/assets/ts/componentFunctions/activities';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
import { createInviteLink } from '@/assets/ts/groupInvite';
import { parseFirebaseGroup, parseFirebaseUser } from '@/assets/ts/parsing';
import { ActivitySchema, zodErrorLogging } from '@/assets/ts/schemas';
import ActivityListItem from '@/components/ActivityListItem';
import GoBack from '@/components/GoBack';
import { Hint } from '@/components/Hint';
import LoadingDots from '@/components/Loading';
import ShowUserIconOrName from '@/components/ShowUserIconOrName';
import { useCustomTheme } from '@/components/ThemeContext';
import { useIsFocused } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { UnknownInputParams, useLocalSearchParams, useRouter } from 'expo-router';
import * as jdenticon from 'jdenticon';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const GroupDetail = () => {
  const router = useRouter();
  const { theme } = useCustomTheme();
  const { avatars } = useAvatarIcons()
  const { t } = useTranslation();
  const [group, setGroup] = useState<IGroup | undefined>();
  const [groupMembers, setGroupMembers] = useState<ILocalUser[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const uiIcon = useUiIcons();
  const [upcommingActivities, setUpcommingActivities] = useState<IActivity[]>([])
  const [pastActivities, setPastActivities] = useState<IActivity[]>([])
  const isFocused = useIsFocused();
  const [showNamesOrIcons, setShowNamesOrIcons] = useState<"names" | "icons">("icons");
  const [hintMessage, setHintMessage] = useState<string | null>(null)
  const { groupIdParameter }: IFirebaseSearchParameter = useLocalSearchParams(); // this is set when the user is transferred from Join

  useEffect(() => {
    if (!groupIdParameter) {  // Force go back when groupObjectString is not correct
      router.replace('/(tabs)/groups/Groups')
      return;
    }
    console.log("GroupDetail useEffect", groupIdParameter);
    FirebaseExchange.getFirebaseDocument(groupIdParameter!, "Group")
      .then((groupDoc) => {
        const group = parseFirebaseGroup(groupDoc);
        if (group === null) {
          throw new Error("GroupdocError");
        } else {
          return group;
        }
      })
      .then((group: IGroup | null) => {
        if (group) {
          setGroup(group)
          return Promise.all([fetchtGroupMembers(group), fetchFirebaseGroupActivities(group)])//
        } else {
          throw new Error("No Group found");
        }
      })
      .then(([dbGroupMembers, allActivitiesOfGroup]: [ILocalUser[], IActivity[]]) => {
        setGroupMembers(prevMembers => {
          const existingIds = new Set(prevMembers.map(member => member.id));
          const newMembers = dbGroupMembers.filter(member => !existingIds.has(member.id));
          return [...prevMembers, ...newMembers];
        });
        if (Array.isArray(allActivitiesOfGroup)) {
          setUpcommingActivities(allActivitiesOfGroup.filter(activity => activity.state === "pending" || activity.state === "scheduled")
            .sort((activity1, activity2) => sortActivitiesByDueDate(activity1, activity2)));
          setPastActivities(
            allActivitiesOfGroup.filter(activity => activity.state === "closed" || activity.state === "cancelled")
              .sort((activity1, activity2) => sortActivitiesByDueDate(activity1, activity2))
          );
          // Set ended Activities to closed
          setStateForEndedActivitesToClosed(allActivitiesOfGroup)
        }
      })
      .catch((err) =>{
        router.replace('/(tabs)/groups/Groups')
        console.error("Error during Group Detail firebase loading", err)
      })
      .finally(() => setLoading(false))
  }, [groupIdParameter, isFocused]);



  // TODO: Test schreiben
  const fetchFirebaseGroupActivities = useCallback((selectedGroup: IGroup): Promise<IActivity[]> => {
    return FirebaseExchange.getAllDocumentsOfCollection('Group', selectedGroup.id, "Activity")
      .then((allActivities) => {
        return allActivities.docs.filter((docRef) => docRef.exists())
          .map((doc): IActivity | null => {
            try {
              return ActivitySchema.parse({ id: doc.id, ...doc.data(), owningGroupId: selectedGroup.id });
            } catch (err) {
              zodErrorLogging(err)
              return null;
            }
          })
          .filter((activity): activity is IActivity => activity !== null);
      })
  }, [])

  // TODO: Test schreiben
  const fetchtGroupMembers = useCallback((selectedGroup: IGroup): Promise<ILocalUser[]> => {
    return FirebaseExchange.getFirebaseDocumentArray(selectedGroup.memberUuids, 'User')//
      .then((docRefArray) => {
        return docRefArray
          .map((doc) => parseFirebaseUser(doc))//
          .filter((user) => user !== null);
      })
  }, [])

  const sendGroupInvite = () => {
    if (!group) return;
    createInviteLink(group.id)
      .then((inviteLink) => {
        return Clipboard.setStringAsync(inviteLink)
      }).then(isLinkSet => {
        if (isLinkSet) {
          setHintMessage(t("groups.groupLinkShareSuccess"));
        } else {
          setHintMessage(t("groups.groupLinkShareError"));
        }
      }).catch(() => setHintMessage(t("groups.groupLinkShareError")))
  }

  if (loading) return <LoadingDots visible />;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={theme.containers.rootContainer}>
      {hintMessage && (
        <Hint
          message={hintMessage}
          onHide={() => setHintMessage(null)}
          textStyle={[theme.typography.heading3, { color: theme.colors.secondary }]}
        />
      )}
      <View style={[theme.containers.leftAlignedContainer, { gap: theme.spacing.medium }]}>
        <GoBack />
        <View style={[theme.rightCornerIcon, { alignItems: "flex-end" }]}>
          <uiIcon.LinkIcon size={30} color={theme.colors.primary} onPress={() => sendGroupInvite()} />
          <Text style={[theme.typography.body, { fontSize: 9, lineHeight: 12 }]}>{t("groups.shareGroupLink")}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center", gap: theme.spacing.medium, marginHorizontal: 40 }}>
          <SvgXml xml={jdenticon.toSvg(group!.name, 50)} width={50} height={50} />
          {/* <Image style={{ width: 50, height: 50 }} source={avatars[group!.icon]} /> */}
          <Text style={[theme.typography.heading1, { flexShrink: 1 }]}>{group?.name}</Text>
        </View>
        <View>
          <Text style={theme.typography.heading2}>{t("groups.groupDescription")}</Text>
          <Text style={theme.typography.body}>{group?.description}</Text>
        </View>
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={theme.typography.heading2}>{t("groups.groupMembers")}</Text>
            <Switch
              value={showNamesOrIcons === "names"}
              onValueChange={() => setShowNamesOrIcons(showNamesOrIcons === "names" ? "icons" : "names")}
              trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
              thumbColor={theme.colors.textLight}
            />
          </View>
          <ShowUserIconOrName users={groupMembers} showNamesOrIcons={showNamesOrIcons} />
        </View>
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={theme.typography.heading2}>{t("groups.futureGroupActivities")}</Text>
            <Pressable onPress={() => router.push({ pathname: "/(tabs)/planning/Planning", params: { groupIdParameter: group?.id } as IFirebaseSearchParameter as UnknownInputParams })}>
              <uiIcon.PlusIcon size={30} color={theme.colors.primary} />
            </Pressable>
          </View>
          <FlatList
            data={upcommingActivities}
            scrollEnabled={false}
            renderItem={({ item, index }) =>
              <ActivityListItem
                key={index + "future"}
                activity={item}
                activityIcon={item.state === "pending" ? <uiIcon.CalendarWithClockIcon size={30} color={theme.colors.primary} /> : <uiIcon.CalendarWithOkIcon size={30} color={theme.colors.primary} />}
              />
            }
            ListEmptyComponent={
              <View style={{ flexDirection: "row", gap: theme.spacing.small, width: "90%" }}>
                <uiIcon.InfoIcon size={24} color={theme.colors.primary} />
                <Text style={theme.typography.body}>{t("groups.futureGroupActivitesEmptyText")}</Text>
              </View>
            }
          />
        </View>
        <View>
          <Text style={theme.typography.heading2}>{t("groups.pastGroupActivities")}</Text>
          <FlatList
            data={pastActivities}
            scrollEnabled={false}
            renderItem={({ item, index }) =>
              <ActivityListItem
                key={index + "past"}
                activity={item}
                activityIcon={item.state === "cancelled" ? <uiIcon.CancelIcon size={30} color={theme.colors.primary} /> : <uiIcon.HistoryClockIcon size={30} color={theme.colors.primary} />}
              />

            }
            ListEmptyComponent={
              <View style={{ flexDirection: "row", gap: theme.spacing.small, width: "90%" }}>
                <uiIcon.InfoIcon size={24} color={theme.colors.primary} />
                <Text style={theme.typography.body}>{t("groups.pastGroupActivitesEmptyText")}</Text>
              </View>
            }
          />
        </View>
      </View>
    </ScrollView>
  )
}

export default GroupDetail