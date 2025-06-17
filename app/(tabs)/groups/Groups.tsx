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
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

const Groups = () => {
  const { user, makeSureUserIsLoggedIn } = useUser();
  const router = useRouter();
  const { theme } = useCustomTheme();
  const { avatars } = useAvatarIcons()
  const [loading, setLoading] = useState(true)
  const [groupArray, setGroupArray] = useState<IGroup[] | undefined>(undefined);
  const { t } = useTranslation();
  const uiIcons = useUiIcons()
  const { userGroupIds } = useLocalSearchParams();

  useEffect(() => {
    // TODO: Hier ist noch ein Fehler, manchmal werden die Gruppen des Users nicht gefunden
    if (userGroupIds) {
      defineUserGroups(JSON.parse(userGroupIds as string))
    } else if (user.groupUuids !== undefined && user.groupUuids.length > 0) {
      defineUserGroups(user.groupUuids);
    } else {
      setGroupArray([])
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

  // TODO: LOading schön machen
  if (loading) return <Text>Loading</Text>

  return (
    <ScrollView style={theme.containers.rootContainer} showsVerticalScrollIndicator={false}>
      <Pressable style={theme.rightCornerIcon} onPress={() => router.push("/(tabs)/groups/NewGroup")}>
        <uiIcons.PlusIcon size={30} color={theme.colors.primary} />
      </Pressable>
      <FlatList
        style={{ marginTop: theme.spacing.large }}
        data={groupArray}
        scrollEnabled={false}
        renderItem={({ item, index }) =>
          <Pressable key={index} onPress={() => router.push({ pathname: "/(tabs)/groups/GroupDetail", params: { groupIdString: item.id } })}>
            <View style={{ flexDirection: "row", marginTop: theme.spacing.medium, justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", gap: theme.spacing.large, width: "80%" }}>
                <Image style={{ width: 40, height: 40 }} source={avatars[item.icon]} />
                <View style={{ flexDirection: "column", justifyContent: "center" }}>
                  <Text style={theme.typography.heading3}>{item.name}</Text>
                  <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>{item.memberUuids.length} {t("groups.groupMembers")}</Text>
                </View>
              </View>
              <View style={{ justifyContent: "center" }}>
                <uiIcons.RightPointerIcon size={40} color={theme.colors.primary} />
              </View>
            </View>
          </Pressable>
        }
        ListEmptyComponent={
          <View style={{ margin: theme.spacing.medium }}>
            <Text style={theme.typography.heading3}>{t("groups.noGroupText")}</Text>
          </View>
        }
        refreshing={loading}

      />
    </ScrollView>
  )
}

export default Groups

