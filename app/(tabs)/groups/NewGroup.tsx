import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import useUiIcons from '@/assets/hooks/uiIconHook';
import { IDbGroup } from '@/assets/interfaces/GroupInterface';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
import GoBack from '@/components/GoBack';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import { useRouter } from 'expo-router';
import * as jdenticon from 'jdenticon';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableHighlight, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
const { height } = Dimensions.get("window");

const NewGroup = () => {
  const { getRandomAvatarKey } = useAvatarIcons();
  const { user } = useUser();
  const router = useRouter();
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [groupIcon] = useState(getRandomAvatarKey);
  const [submitting, setSubmitting] = useState(false);
  const uiIcons = useUiIcons();


  const submitNewGroup = async () => {
    const normalizedName = groupName.trim();
    if (!user || !normalizedName || submitting) {
      console.error("User is not set in NewGroup");
      return;
    }
    setSubmitting(true);
    let newGroup: IDbGroup = {
      name: normalizedName,
      description: groupDescription.trim(),
      memberUuids: [user.id],
      ownerUuid: user.id,
      icon: groupIcon
    }
    try {
      await FirebaseExchange.createGroup(newGroup);
      router.replace("/(tabs)/groups/Groups");
    } catch (err) {
      console.error("Error creating new group:", err);
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      <View style={theme.containers.rootContainer}>
        <ScrollView>
          <GoBack />
          <View style={{ marginHorizontal: theme.spacing.xlarge }}>
            <Text style={[theme.typography.heading1, { textAlign: "center" }]}>{t("groups.newGroup")}</Text>
          </View>
          {/* Information */}
          <View style={{ flexDirection: "row"}}>
            <uiIcons.InfoIcon size={24} color="black" />
            <Text style={[theme.typography.body,{marginLeft:theme.spacing.small, flexShrink:1}]}>{t("groups.groupInformation")}</Text>
          </View>
          {/* Icon */}
          <View style={{ marginVertical: theme.spacing.large }}>
            <Text style={[theme.typography.heading2, { marginBottom: theme.spacing.small }]}>{t("groups.groupIcon")}</Text>
            <View style={{ alignItems: "center" }}>
                <View style={{ position: "relative", width: height * 0.2, height: height * 0.2, justifyContent: "center", alignItems: "center" }} >
                    <SvgXml xml={jdenticon.toSvg(groupName, height * 0.2)} width={height * 0.2} height={height * 0.2}/>

                  {/* <Image style={{ width: height * 0.2, height: height * 0.2, borderRadius: theme.borderRadius.medium, borderColor: theme.colors.secondary, borderWidth: 2 }} source={avatars[groupIcon]} /> */}
                  {/* <View style={{ position: "absolute", bottom: 5, right: 5 }} >
                    <uiIcons.EditIcon size={40} color={theme.colors.primary} />
                  </View> */}
                </View>
            </View>
          </View>
          {/* Gruppenname */}
          <View style={{ marginVertical: theme.spacing.large }}>
            <Text style={[theme.typography.heading2, { marginBottom: theme.spacing.small }]}>{t("groups.groupName")}</Text>
            <View style={theme.input}>
              <TextInput autoCapitalize="sentences" maxLength={80} placeholder={t("groups.groupNameInput")} placeholderTextColor={theme.colors.muted} value={groupName} style={[theme.typography.body]} onChangeText={setGroupName} />
            </View>
          </View>
          {/* Gruppenbeschreibung */}
          <View style={{ marginVertical: theme.spacing.large }}>
            <Text style={[theme.typography.heading2, { marginBottom: theme.spacing.small }]}>{t("groups.groupDescription")}</Text>
            <View style={theme.input}>
              <TextInput multiline maxLength={500} numberOfLines={4} placeholder={t("groups.groupDescriptionInput")} placeholderTextColor={theme.colors.muted} value={groupDescription} style={[theme.typography.body, { minHeight: 24 * 4, textAlignVertical: "top" }]} onChangeText={setGroupDescription} />
            </View>
          </View>
          <TouchableHighlight style={[theme.button, { opacity: !groupName.trim() || submitting ? 0.45 : 1 }]} underlayColor={theme.colors.secondary} onPress={submitNewGroup} disabled={!groupName.trim() || submitting}>
            <Text style={theme.buttonText}>{t("common.submit")}</Text>
          </TouchableHighlight>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

export default NewGroup

