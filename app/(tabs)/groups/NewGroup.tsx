import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import useUiIcons from '@/assets/hooks/uiIconHook';
import { addDocumentToCollection } from '@/assets/ts/firebaseExchange';
import GoBack from '@/components/GoBack';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Pressable, ScrollView, Text, TextInput, TouchableHighlight, View } from 'react-native';

const { width, height } = Dimensions.get("window");
// TODO:ICON GENERISCH ABBILDEN DAS ICON evlt über hook




const NewGroup = () => {
  const {getRandomAvatarKey, avatars} = useAvatarIcons();
  let { user, makeSureUserIsLoggedIn, setUserIncludingLocalStorageAndFirebase } = useUser();
  const router = useRouter();
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [groupIcon, setGroupIcon] = useState("")
  const uiIcons = useUiIcons();

  useEffect(() => {
    setGroupIcon(getRandomAvatarKey);
    return ()=>{
      console.log("NewGroup unmounted")
    }
  }, [])

  const changeGroupIcon = () => {
  }

  const submitNewGroup = () => {
    makeSureUserIsLoggedIn(user).then((loggedInUser) => {
      return {
        name: groupName,
        description: groupDescription,
        activityUuids: [],
        memberUuids: [loggedInUser.id],
        icon: groupIcon
      }
    }).then((newGroup) => {
      return addDocumentToCollection('Group', newGroup)//
    }).then((groupRef) => {
      let newUserWithGroup = { ...user }
      if (newUserWithGroup.groupUuids !== undefined) {
        newUserWithGroup.groupUuids.push(groupRef.id);
      } else {
        newUserWithGroup.groupUuids = [groupRef.id];
      }
      console.log("new user", newUserWithGroup)
      setUserIncludingLocalStorageAndFirebase(newUserWithGroup)
      return newUserWithGroup.groupUuids
    }).then((allGroupsOfUser)=>router.replace({pathname:"/(tabs)/groups/Groups",params:{userGroupIds:JSON.stringify(allGroupsOfUser)}}))
    .catch((error) => console.error(`Error during creating new group for user. ${error}`))//
  }

  return (
    <View style={theme.containers.rootContainer}>
      <ScrollView>
        <GoBack />
        <View style={{ marginHorizontal: theme.spacing.xlarge }}>
          <Text style={[theme.typography.heading1, { textAlign: "center" }]}>{t("groups.newGroup")}</Text>
        </View>
        {/* Information */}
        <View style={{ flexDirection: "row", gap: theme.spacing.medium }}>
          <uiIcons.InfoIcon size={24} color="black" />
          <Text style={theme.typography.body}>{t("groups.groupInformation")}</Text>
        </View>
        {/* Icon */}
        <View style={{ marginVertical: theme.spacing.large }}>
          <Text style={[theme.typography.heading2, { marginBottom: theme.spacing.small }]}>{t("groups.groupIcon")}</Text>
          <View style={{ alignItems: "center" }}>
            <Pressable onPress={changeGroupIcon}>
              <View style={{ position: "relative", width: height * 0.2, height: height * 0.2, justifyContent: "center", alignItems: "center" }} >
                <Image style={{ width: height * 0.2, height: height * 0.2, borderRadius: theme.borderRadius.medium, borderColor: theme.colors.secondary, borderWidth: 2 }} source={avatars[groupIcon]} />
                <View style={{ position: "absolute", bottom: 5, right: 5 }} >
                  <uiIcons.EditIcon size={40} color={theme.colors.primary} />
                </View>
              </View>
            </Pressable>
          </View>
        </View>
        {/* Gruppenname */}
        <View style={{ marginVertical: theme.spacing.large }}>
          <Text style={[theme.typography.heading2, { marginBottom: theme.spacing.small }]}>{t("groups.groupName")}</Text>
          <View style={theme.input}>
            <TextInput placeholder={t("groups.groupNameInput")} value={groupName} style={[theme.typography.body]} onChangeText={(val) => setGroupName(val)} />
          </View>
        </View>
        {/* Gruppenbeschreibung */}
        <View style={{ marginVertical: theme.spacing.large }}>
          <Text style={[theme.typography.heading2, { marginBottom: theme.spacing.small }]}>{t("groups.groupDescription")}</Text>
          <View style={theme.input}>
            <TextInput multiline numberOfLines={4} placeholder={t("groups.groupDescriptionInput")} value={groupDescription} style={[theme.typography.body, { minHeight: 24 * 4, textAlignVertical: "top" }]} onChangeText={(val) => setGroupDescription(val)} />
          </View>
        </View>
        <TouchableHighlight style={theme.button} underlayColor={theme.colors.secondary} onPress={submitNewGroup}>
          <Text style={theme.buttonText}>{t("common.submit")}</Text>
        </TouchableHighlight>
      </ScrollView>
    </View>
  )
}

export default NewGroup

