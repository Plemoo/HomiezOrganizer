import useUiIcons from '@/assets/hooks/uiIconHook';
import { IFirebaseSearchParameter } from '@/assets/interfaces/FirebaseInterface';
import { IGroup } from '@/assets/interfaces/GroupInterface';
import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
import { FirebaseSnapshotListener } from '@/assets/ts/firebaseSnapshotListener';
import { GroupSchema, zodErrorLogging } from '@/assets/ts/schemas';
import { useAlert } from '@/components/AlertContext';
import LoadingDots from '@/components/Loading';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import { Unsubscribe } from '@react-native-firebase/firestore';
import { UnknownInputParams, useRouter } from 'expo-router';
import * as jdenticon from 'jdenticon';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';


const Groups = () => {
  const { user, userLoading } = useUser();
  const router = useRouter();
  const { theme } = useCustomTheme();
  const [loading, setLoading] = useState(true);
  const [groupArray, setGroupArray] = useState<IGroup[] | undefined>(undefined);
  const { t } = useTranslation();
  const uiIcons = useUiIcons();
  const { showAlert } = useAlert();


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
  }, [userLoading,user, user?.id]);

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

  const leaveGroup = (groupId: string) => {
    if (!user || !user.id) {
      console.error("No UserID in leaveGroup function");
      return;
    }
    FirebaseExchange.leaveGroup(groupId)
      .then(() => {
        user.groupUuids = user.groupUuids?.filter((id) => id !== groupId);
      })
      .catch((err) => {
        console.error("Error leaving Group: ", err);
      })

  }

  if (loading) return <LoadingDots visible />;

  return (
    <ScrollView style={theme.containers.rootContainer} showsVerticalScrollIndicator={false}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("groups.newGroup")}
        hitSlop={8}
        style={({ pressed }) => [theme.rightCornerIcon, { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 }]}
        onPress={() => router.push("/(tabs)/groups/NewGroup")}
      >
        <uiIcons.PlusIcon size={26} color={theme.colors.background} />
      </Pressable>
      <FlatList
        style={{ marginTop: theme.spacing.large }}
        data={groupArray}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.name}
            style={({ pressed }) => ({
              marginTop: theme.spacing.medium,
              padding: theme.spacing.medium,
              borderRadius: theme.borderRadius.medium,
              borderWidth: 1,
              borderColor: theme.colors.secondary,
              opacity: pressed ? 0.65 : 1,
            })}
            onPress={() => {
              let searchParams: IFirebaseSearchParameter = {
                groupIdParameter: item.id
              }
              router.push({ pathname: "/(tabs)/groups/GroupDetail", params: searchParams as UnknownInputParams })
            }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", gap: theme.spacing.large, width: "80%", flexGrow: 1 }}>
                {/* <Image style={{ width: 40, height: 40 }} source={avatars[item.icon]} /> */}
                <SvgXml xml={jdenticon.toSvg(item.name, 50)} width={50} height={50} />
                <View style={{ flexDirection: "column", justifyContent: "center", flexShrink: 1 }}>
                  <Text style={theme.typography.heading3}>{item.name}</Text>
                  <Text style={[theme.typography.body, { color: theme.colors.muted }]}>{item.memberUuids.length} {t("groups.groupMembers")}</Text>
                </View>
              </View>
              <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                {(item.ownerUuid ?? item.memberUuids[0]) !== user?.id && (
                  <Pressable style={{ justifyContent: "center" }} onPress={(event) => { event.stopPropagation(); showAlert({
                    title: t("groups.leaveGroupDialog.title"),
                    message: t("groups.leaveGroupDialog.leaveGroupText"),
                    cancelText: t("groups.leaveGroupDialog.cancel"),
                    confirmText: t("groups.leaveGroupDialog.yesIamSure"),
                    onConfirm: () => leaveGroup(item.id),
                  }) }}>
                    <uiIcons.RemoveUser size={30} color={theme.colors.primary} />
                  </Pressable>
                )}
              </View>
              <View style={{ justifyContent: "center", flex: 1, alignItems: "center" }}>
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

