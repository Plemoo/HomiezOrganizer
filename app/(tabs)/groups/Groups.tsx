import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import useUiIcons from '@/assets/hooks/uiIconHook';
import { IGroup } from '@/assets/interfaces/GroupInterface';
import { firebaseErrorHandling as firebaseErrorLogging, getFirebaseDocumentArray } from '@/assets/ts/firebaseExchange';
import { GroupSchema, zodErrorLogging } from '@/assets/ts/schemas';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const Groups = () => {
  let { user, makeSureUserIsLoggedIn } = useUser();
  const router = useRouter();
  const { theme } = useCustomTheme();
  const {avatars} = useAvatarIcons()
  const [loading, setLoading] = useState(true)
  const [groupArray, setGroupArray] = useState<IGroup[] | null>(null);
  const { t } = useTranslation();
  const uiIcons = useUiIcons()
  const { userGroupIds } = useLocalSearchParams();

  useEffect(() => {
    // TODO: Hier ist noch ein Fehler, manchmal werden die Gruppen des Users nicht gefunden
    console.log("UER",user)
    if (userGroupIds) {
      defineUserGroups(JSON.parse(userGroupIds as string))
    } else if (user.groupUuids !== undefined && user.groupUuids.length > 0) {
      defineUserGroups(user.groupUuids);
    } else {
      setGroupArray([])
    }
    return () => {
      console.log("Groups unmounted")
    }
  }, [])

  useEffect(() => {
    if (Array.isArray(groupArray)) {
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [groupArray])


  function defineUserGroups(groupIds: string[]) {
    makeSureUserIsLoggedIn(user) //
      .then(() => {
        return getFirebaseDocumentArray(groupIds, "Group");
      }).then((docArr) => {
        return docArr //
          .filter((doc) => doc.exists()) //
          .map((doc) => {
            try {
              return GroupSchema.parse({ id: doc.id, ...doc.data() });
            } catch (err) {
              zodErrorLogging(err)
              return null;
            }
          }).filter((group) => group != null);
      }).then((parsedGroups) => {
        setGroupArray(parsedGroups);
      }).catch((err) => {
        firebaseErrorLogging(err);
        setGroupArray([]);
      });
  }

  return (
    <View style={theme.containers.rootContainer}>
      <Pressable style={theme.rightCornerIcon} onPress={() => router.push("/(tabs)/groups/NewGroup")}>
        <uiIcons.PlusIcon size={30} color={theme.colors.primary} />
      </Pressable>
      {loading ?
        <Text>Is loading</Text>
        :
        Array.isArray(groupArray) && groupArray.length > 0 ? (
          <ScrollView style={{ marginTop: theme.spacing.large }}>
            {groupArray?.map((groupElement, index) => (
              <View key={index} style={{ flexDirection: "row", marginTop: theme.spacing.medium, justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", gap: 30 }}>
                  <Image style={{ width: 40, height: 40 }} source={avatars[groupElement.icon]} />
                  <View style={{ flexDirection: "column", justifyContent: "center" }}>
                    <Text style={theme.typography.heading3}>{groupElement.name}</Text>
                    <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>{groupElement.memberUuids.length} {t("groups.groupMembers")}</Text>
                  </View>
                </View>
                <Pressable onPress={() => router.push({ pathname: "/(tabs)/groups/GroupDetail", params: { groupObjectString: JSON.stringify(groupElement) } })}>
                  <View style={{ justifyContent: "center" }}>
                    <uiIcons.RightPointerIcon size={40} color={theme.colors.primary} />
                  </View>
                </Pressable>
              </View>
            ))}
          </ScrollView>)
          :
          <View style={{ margin: theme.spacing.medium }}>
            <Text style={theme.typography.heading3}>{t("groups.noGroupText")}</Text>
          </View>
      }
    </View>
  )
}

export default Groups

const styles = StyleSheet.create({})