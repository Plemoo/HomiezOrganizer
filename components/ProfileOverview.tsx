import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import useUiIcons from '@/assets/hooks/uiIconHook';
import GoBack from '@/components/GoBack';
import { useCustomTheme } from '@/components/ThemeContext';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, Text, TouchableHighlight, View } from 'react-native';
import LoadingDots from './Loading';
import { useUser } from './ProfileInformationContext';

const { height } = Dimensions.get('window'); // Get the screen width


const ProfileOverview = ({ goToEdit }: { goToEdit: () => void }) => {
  const { user, userLoading } = useUser();
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const [username, setUserName] = useState("")
  const [userIcon, setUserIcon] = useState<string>("");
  const uiIcons = useUiIcons();
  const { avatars } = useAvatarIcons();

  const getDisplayedLanguage = () => {
    if (!user || !user.language) return;
    if (user.language === "de") {
      return t("settings.languageGerman");
    } else if (user.language === "en") {
      return t("settings.languageEnglish");
    } else {
      return t("settings.languageGerman");
    }
  }

  useEffect(() => {
    if(user){
      setUserIcon(user.icon)
      if(user.username) {
        setUserName(user.username);
      }
    }

  }, [user, userLoading]);

  if(userLoading) return <LoadingDots visible />

  return (
    <ScrollView style={theme.containers.rootContainer}>
      <GoBack />
      {/* Image */}
      <View style={theme.containers.centeredContainer}>
        <Image style={{ width: height * 0.3, height: height * 0.3, borderRadius: 200, backgroundColor: theme.colors.secondary }} source={avatars[userIcon]} />
      </View>
      {/* Username */}
      <View style={theme.containers.centeredContainer}>
        <Text style={theme.typography.heading1}>{user && user.username ? user.username : username}</Text>
        <TouchableHighlight onPress={goToEdit} underlayColor={theme.colors.secondary} style={{ borderRadius: theme.borderRadius.medium }}>
          <View style={{ flexDirection: "row" }}>
            <uiIcons.EditIcon size={24} color={theme.colors.secondary} />
            <Text style={[theme.typography.body, { color: theme.colors.muted }]}>{t("settings.editProfile")}</Text>
          </View>
        </TouchableHighlight>
      </View>
      {/* Birthday
            <View style={[theme.containers.leftAlignedContainer, { paddingTop: theme.spacing.xlarge }]}>
                <Text style={theme.typography.heading2}>{t("settings.birthday")}</Text>
                    <Text style={theme.typography.body}>{user.birthday ? formatDate(user.birthday, i18next.language) : "---"}</Text>
            </View> */}
      {/* Language*/}
      <View style={[theme.containers.leftAlignedContainer, { paddingTop: theme.spacing.xlarge }]}>
        <Text style={theme.typography.heading2}>{t("settings.language")}</Text>
        <Text style={theme.typography.body}>{getDisplayedLanguage()}</Text>
      </View>
    </ScrollView>
  )
}

export default ProfileOverview
