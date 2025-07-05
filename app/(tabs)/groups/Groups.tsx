import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import useUiIcons from '@/assets/hooks/uiIconHook';
import { IFirebaseSearchParameter } from '@/assets/interfaces/FirebaseInterface';
import { IGroup } from '@/assets/interfaces/GroupInterface';
import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
import { FirebaseSnapshotListener } from '@/assets/ts/firebaseSnapshotListener';
import { GroupSchema, zodErrorLogging } from '@/assets/ts/schemas';
import LoadingDots from '@/components/Loading';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import { Unsubscribe } from '@react-native-firebase/firestore';
import { Image } from 'expo-image';
import { UnknownInputParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

const Groups = () => {
  const { user, userLoading } = useUser();
  const router = useRouter();
  const { theme } = useCustomTheme();
  const { avatars } = useAvatarIcons();
  const [loading, setLoading] = useState(true);
  const [groupArray, setGroupArray] = useState<IGroup[] | undefined>(undefined);
  const { t } = useTranslation();
  const uiIcons = useUiIcons();

  useEffect(() => {
    if (!user || !user.id || userLoading) {
      console.error("No UserID in group page");
      return;
    }
    // Triggered on start and when user gets a new groupId
    let unsubRef: Unsubscribe = FirebaseSnapshotListener.snapshotListenerForUserChange(user.id, (userWithNewGroupId: ILocalUser | null) => {
      if (userWithNewGroupId && userWithNewGroupId.groupUuids) {
        defineUserGroups(userWithNewGroupId.groupUuids);
      } else if (userWithNewGroupId && userWithNewGroupId.groupUuids === undefined) {
        // User has no groups, so we set groupArray to empty
        setGroupArray([]);
      }
    })
    return () => {
      unsubRef();
    }
  }, [userLoading, user?.id]);

  useEffect(() => {
    if (Array.isArray(groupArray)) {
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [groupArray])


  function defineUserGroups(groupIds: string[]) {
    FirebaseExchange.getFirebaseDocumentArray(groupIds, "Group")
      .then((docArr) => {
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
        FirebaseExchange.firebaseErrorHandling(err);
        setGroupArray([]);
      })
  }

  if (loading) return <LoadingDots visible />;

  return (
    <ScrollView style={theme.containers.rootContainer} showsVerticalScrollIndicator={false}>
      <Pressable style={theme.rightCornerIcon} onPress={() => router.push("/(tabs)/groups/NewGroup")}>
        <uiIcons.PlusIcon size={30} color={theme.colors.primary} />
      </Pressable>
      <FlatList
        style={{ marginTop: theme.spacing.large }}
        data={groupArray}
        scrollEnabled={false}
        keyExtractor={(item, index) => item.id + index}
        renderItem={({ item }) =>
          <Pressable
            onPress={() => {
              let searchParams: IFirebaseSearchParameter = {
                groupIdParameter: item.id
              }
              router.push({ pathname: "/(tabs)/groups/GroupDetail", params: searchParams as UnknownInputParams })
            }}>
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

