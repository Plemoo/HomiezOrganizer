import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import useUiIcons from '@/assets/hooks/uiIconHook';
import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { darkTheme } from '@/assets/ts/darkThemeProperties';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
import { lightTheme } from '@/assets/ts/lightThemeProperties';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import { Image } from 'expo-image';
import { changeLanguage } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, Modal, Pressable, ScrollView, Text, TextInput, TouchableHighlight, View } from 'react-native';
import LoadingDots from './Loading';

const { height } = Dimensions.get('window'); // Get the screen width

const ProfileEdit = ({ returnToOverview }: { returnToOverview: (para?: ILocalUser) => void }) => {
  const { user, userLoading: loading } = useUser();
  const { theme, setTheme } = useCustomTheme();
  const { t } = useTranslation();
  const [username, setUsername] = useState<string | undefined>();
  const [language, setLanguage] = useState<"de" | "en" | undefined>();
  const [userIcon, setUserIcon] = useState<string | undefined>();
  const [userAppearance, setUserAppearance] = useState<"light" | "dark" | undefined>();
  const uiIcons = useUiIcons();
  const { avatars } = useAvatarIcons();
  const [iconPickerModalOpen, setIconPickerModalOpen] = useState(false)

  const submitUserChanges = () => {
    if (!username || !language || !userIcon || !user) {
      // Handle error or show a message to the user
      console.error("Username, language, or user icon is not set in ProfileEdit");
      return;
    }
    let updatedUser: ILocalUser = { ...user, username: username, language: language, icon: userIcon, appearance: userAppearance || "light" }; // Default to light theme if not set
    FirebaseExchange.updateFirebaseDocument(updatedUser, "User")
    if (userAppearance === "light") {
      setTheme(lightTheme)
    } else {
      setTheme(darkTheme)
    }
    changeLanguage(language); // Change the language in i18next
    returnToOverview(updatedUser)
  }

  useEffect(() => {
    if (user) {
      setUserAppearance(user.appearance)
      setUsername(user.username); // Set the username from the user object or default to empty string
      setLanguage(user.language); // Set the language from the user object or default to "de"
      setUserIcon(user.icon); // Set the user icon from the user object or default to a placeholder icon
    }
  }, [loading, user])


  if (loading) return <LoadingDots visible />; // Show loading indicator while user data is being fetched

  return (
    <ScrollView style={theme.containers.rootContainer}>
      <Pressable style={theme.leftCornerIcon} onPress={() => returnToOverview()}>
        <uiIcons.ArrowLeftIcon size={30} color={theme.colors.primary} />
      </Pressable>
      {/* Image */}
      <View style={theme.containers.centeredContainer}>
        <Pressable onPress={() => setIconPickerModalOpen(true)}>
          <Image style={{ width: height * 0.3, height: height * 0.3, borderRadius: 200, backgroundColor: theme.colors.secondary }} source={avatars[userIcon!]} />
        </Pressable>
        <uiIcons.EditIcon size={100} color={theme.colors.textLight} style={{ position: "absolute" }} onPress={() => setIconPickerModalOpen(true)} />
      </View>
      {/* Username */}
      <View style={theme.containers.centeredContainer}>
        <Text style={theme.typography.heading1}>{username}</Text>
      </View>
      {/* Username only Edit */}
      <View style={{ paddingTop: theme.spacing.large }}>
        <Text style={theme.typography.heading2}>{t("settings.username")}</Text>
        <View style={[theme.input, { marginTop: theme.spacing.small }]}>
          <TextInput
            value={username}
            onChangeText={(text) => setUsername(text)}
            placeholder={t("settings.usernamePlaceholder")}
            style={theme.typography.body}
          />
        </View>
      </View>
      {/* Birthday*/}
      {/* <View style={[theme.containers.leftAlignedContainer, { paddingTop: theme.spacing.xlarge }]}>
        <Text style={theme.typography.heading2}>{t("settings.birthday")}</Text>
          <View style={{ flexDirection: "row" }}>
            <WheelPicker style={{ flex: 1 }} itemTextStyle={[theme.typography.heading3, { lineHeight: 50 }]} onValueChanged={({ item }) => setDayForBirthday(item.value)} value={user.birthday ? user.birthday.getDate() : new Date().getDate()} data={[...Array(31).keys()].map((index) => ({ value: index + 1, label: (index + 1).toString() }))} />
            <WheelPicker style={{ flex: 1 }} itemTextStyle={[theme.typography.heading3, { lineHeight: 50 }]} onValueChanged={({ item }) => setMonthForBirthday(item.value)} value={user.birthday ? user.birthday.getMonth() : new Date().getMonth()} data={months.map((m, index) => ({ value: index, label: m }))} />
            <WheelPicker style={{ flex: 1 }} itemTextStyle={[theme.typography.heading3, { lineHeight: 50 }]} onValueChanged={({ item }) => setYearForBirthday(item.value)} value={user.birthday ? user.birthday.getFullYear() : new Date().getFullYear()} data={[...Array(100).keys()].map((index) => ({ value: (new Date().getFullYear() - index), label: (new Date().getFullYear() - index).toString() }))} />
          </View>
      </View> */}
      {/* Language*/}
      <View style={[theme.containers.leftAlignedContainer, { paddingTop: theme.spacing.xlarge }]}>
        <Text style={theme.typography.heading2}>{t("settings.language")}</Text>
        <View style={{ paddingBottom: theme.spacing.large }}>
          <Picker style={theme.typography.heading3} onValueChange={(val: "de" | "en") => setLanguage(val)} selectedValue={language} dropdownIconColor={theme.colors.text}>
            <Picker.Item style={theme.typography.heading3} label={t("settings.languageGerman")} value={"de"} color="black" />
            <Picker.Item style={theme.typography.heading3} label={t("settings.languageEnglish")} value={"en"} color="black" />
          </Picker>
        </View>
      </View>
      {/* User Appearance*/}
      <View style={[theme.containers.leftAlignedContainer, { paddingTop: theme.spacing.xlarge }]}>
        <Text style={theme.typography.heading2}>{t("settings.appearance")}</Text>
        <View style={{ paddingBottom: theme.spacing.large }}>
          <Picker style={theme.typography.heading3} onValueChange={(val: "light" | "dark") => setUserAppearance(val)} selectedValue={userAppearance} dropdownIconColor={theme.colors.text}>
            <Picker.Item style={theme.typography.heading3} label={t("settings.lightTheme")} value={"light"} color="black" />
            <Picker.Item style={theme.typography.heading3} label={t("settings.darkTheme")} value={"dark"} color="black" />
          </Picker>
        </View>
      </View>
      {/* Edit Submit Button*/}
      <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", paddingBottom: 20 }}>
        <TouchableHighlight style={[theme.button, { flex: 1 }]} underlayColor={theme.colors.secondary} onPress={submitUserChanges} disabled={!username || !language || !userIcon}>
          <Text style={theme.buttonText}>{t("common.submit")}</Text>
        </TouchableHighlight>
      </View>
      <Modal animationType="slide" visible={iconPickerModalOpen} onRequestClose={() => setIconPickerModalOpen(false)}>
        <View style={theme.containers.rootContainer}>
          <uiIcons.RemoveIcon size={24} color={theme.colors.primary} style={{ alignSelf: "flex-end", padding: 5 }} onPress={() => setIconPickerModalOpen(false)} />
          <FlatList
            data={Object.keys(avatars)}
            numColumns={3}
            contentContainerStyle={{ alignItems: "center", justifyContent: "center" }}
            renderItem={({ item }) => (
              <Pressable onPress={() => { setUserIcon(item); setIconPickerModalOpen(false) }} style={{ margin: theme.spacing.medium }}>
                <Image source={avatars[item]} style={{ width: 80, height: 80 }} />
              </Pressable>
            )}
            keyExtractor={(item) => item}
          />
        </View>
      </Modal>
    </ScrollView>
  )
}

export default ProfileEdit