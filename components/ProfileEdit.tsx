import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import useUiIcons from '@/assets/hooks/uiIconHook';
import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
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
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const [username, setUsername] = useState<string | undefined>();
  const [language, setLanguage] = useState<"de" | "en" | undefined>();
  const [userIcon, setUserIcon] = useState<string | undefined>();
  const uiIcons = useUiIcons();
  const { avatars } = useAvatarIcons();
  const [iconPickerModalOpen, setIconPickerModalOpen] = useState(false)

  const submitUserChanges = () => {
    if (!username || !language || !userIcon || !user) {
      // Handle error or show a message to the user
      console.error("Username, language, or user icon is not set in ProfileEdit");
      return;
    }
    let updatedUser: ILocalUser = { ...user, username: username, language: language, icon: userIcon };
    FirebaseExchange.updateFirebaseDocument(updatedUser,"User")
    changeLanguage(language); // Change the language in i18next
    returnToOverview(updatedUser)
  }

  useEffect(() => {
    if (user) {
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
          <Picker onValueChange={(val: "de" | "en") => setLanguage(val)} selectedValue={language}>
            <Picker.Item style={theme.typography.heading3} label={t("settings.languageGerman")} value={"de"} />
            <Picker.Item style={theme.typography.heading3} label={t("settings.languageEnglish")} value={"en"} />
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