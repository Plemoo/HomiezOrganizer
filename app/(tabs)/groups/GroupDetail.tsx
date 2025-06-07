import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import { IActivity } from '@/assets/interfaces/ActivityInterface';
import { IGroup } from '@/assets/interfaces/GroupInterface';
import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { getFirebaseDocumentArray } from '@/assets/ts/firebaseExchange';
import { ActivitySchema, GroupSchema, LocalUserSchema, zodErrorLogging } from '@/assets/ts/schemas';
import GoBack from '@/components/GoBack';
import { useCustomTheme } from '@/components/ThemeContext';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const GroupDetail = () => {
  const { groupObjectString } = useLocalSearchParams<{ groupObjectString: string }>();
  const router = useRouter();
  const { theme } = useCustomTheme();
  const { avatars } = useAvatarIcons()
  const { t } = useTranslation();
  const [group, setGroup] = useState<IGroup | undefined>();
  const [groupMembers, setGroupMembers] = useState<ILocalUser[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Force go back when groupObjectString is not correct
  if (!groupObjectString) {
    router.replace('/(tabs)/groups/Groups')
  }
  let upcommingActivities: IActivity[] = [];
  let pastActivities: IActivity[] = [];

  useEffect(() => {
    let selectedGroup: IGroup | null = null;
    try {
      selectedGroup = GroupSchema.parse(JSON.parse(groupObjectString));
    } catch (err) {
      zodErrorLogging(err)
      router.replace('/(tabs)/groups/Groups');
      return;
    }
    setGroup(selectedGroup);
    Promise.all([fetchAndSetGroupMembers(selectedGroup), fetchFirebaseGroupActivities(selectedGroup)])//
    .finally(() => setLoading(false))
  }, []);

  // TODO: Test schreiben
  const fetchFirebaseGroupActivities = (selectedGroup: IGroup) => {
    getFirebaseDocumentArray(selectedGroup.activityUuids, "Activity").then((docRefArray) => {
      let firebaseActivities = docRefArray.filter((docRef) => docRef.exists())//
        .map((doc) => {
          try {
            return ActivitySchema.parse({ ...doc.data() });
          } catch (err) {
            console.error("Error during Activity Parse:", err)
            return null;
          }
        }).filter((activity) => activity !== null)
        .forEach((activity) => {
          let now = new Date();
          if (activity!.time.start < now && activity!.state) { // Starttime in the past
            pastActivities.push(activity!)
          } else if (activity!.time.start > now) { // Starttime in future
            upcommingActivities.push(activity!);
          }
        });
      return firebaseActivities;
    });
  }

  // TODO: Abbruch bei fehlender Berechtigung auch im Catch und redirect abfangen
  // TODO: Test schreiben
  const fetchAndSetGroupMembers = (selectedGroup: IGroup) => {
    return getFirebaseDocumentArray(selectedGroup.memberUuids, 'User')//
      .then((docRefArray) => {
        let firebaseGroupMembers = docRefArray.filter((docRef) => docRef.exists())//
          .map((doc) => {
            try {
              return LocalUserSchema.parse({ id: doc.id, ...doc.data() });
            } catch (err) {
              zodErrorLogging(err)
              return null;
            }
          }).filter((user) => user !== null);
        setGroupMembers(firebaseGroupMembers)
      });
  }

  return (

    <View style={theme.containers.rootContainer}>
      <GoBack />
      {loading ?
        <Text>IsLoading</Text>
        :
        <View style={theme.containers.leftAlignedContainer}>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Image style={{ width: 50, height: 50 }} source={avatars[group!.icon]} />
            <Text style={theme.typography.heading1}>{group?.name}</Text>
          </View>
          <View style={[theme.containers.leftAlignedContainer, { flexShrink: 1 }]}>
            <Text style={theme.typography.heading2}>{t("groups.groupDescription")}</Text>
            <Text style={theme.typography.body}>{group?.description}</Text>
          </View>
          <View style={theme.containers.leftAlignedContainer}>
            <Text style={theme.typography.heading2}>{t("groups.groupMembers")}</Text>
            <View>
              <FlatList
              data={groupMembers}
              numColumns={3}
              renderItem={ ({item, index})=>
                <View key={index}>
                  <Image
                    style={{ height: 40, width: 40 }}
                    source={avatars[item.icon]}
                  />
                  <Text>{item.username}</Text>
                </View>
              }
              />
            </View>
          </View>
          <View style={[theme.containers.leftAlignedContainer]}>
            <Text style={theme.typography.heading2}>{t("groups.futureGroupActivities")}</Text>
          </View>
          <View style={theme.containers.leftAlignedContainer}>
            <Text style={theme.typography.heading2}>{t("groups.pastGroupActivities")}</Text>
          </View>
        </View>
      }
    </View>
  )
}

export default GroupDetail

const styles = StyleSheet.create({})