import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import { useMonths } from '@/assets/hooks/timeObjectHooks';
import useUiIcons from '@/assets/hooks/uiIconHook';
import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { formatDate } from '@/assets/ts/timeManagement';
import GoBack from '@/components/GoBack';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { Picker } from '@react-native-picker/picker';
import { Image } from 'expo-image';
import i18next, { changeLanguage } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, Modal, Pressable, ScrollView, Text, TextInput, TouchableHighlight, View } from 'react-native';

const { height } = Dimensions.get('window'); // Get the screen width

const Profile = () => {
  let { user, setUserIncludingLocalStorageAndFirebase } = useUser();
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const months = useMonths();
  const [editMode, setEditMode] = useState(false)
  const [username, setUsername] = useState(user.username || "Max Mustermann")
  const [birthday, setBirthday] = useState<Date>(user.birthday || new Date());
  const [language, setLanguage] = useState<"de" | "en">(user.language);
  const [userIcon, setUserIcon] = useState<string>(user.icon);
  const uiIcons = useUiIcons();
  const { avatars } = useAvatarIcons();
  const [iconPickerModalOpen, setIconPickerModalOpen] = useState(false)

  const submitUserChanges = () => {
    setEditMode(false);
    let updatedUser: ILocalUser = { ...user, birthday: birthday, username: username, language: language, icon: userIcon };
    setUserIncludingLocalStorageAndFirebase(updatedUser)
    changeLanguage(language); // Change the language in i18next
  }

  const abortUserEdit = () => {
    setEditMode(false)
    setUsername(user.username || "Max Mustermann")
  }

  const setDayForBirthday = (day: number) => {
    setBirthday(prevState => {
      const newDate = new Date(prevState);
      newDate.setDate(day);
      return newDate;
    });
  }

  const setMonthForBirthday = (month: number) => {
    setBirthday(prevState => {
      const newDate = new Date(prevState);
      newDate.setMonth(month);
      return newDate;
    });
  }

  const setYearForBirthday = (year: number) => {
    setBirthday(prevState => {
      const newDate = new Date(prevState);
      newDate.setFullYear(year);
      return newDate;
    });
  }

  const getDisplayedLanguage = () => {
    if (user.language === "de") {
      return t("settings.languageGerman");
    } else if (user.language === "en") {
      return t("settings.languageEnglish");
    } else {
      return t("settings.languageGerman");
    }
  }

  //TODO: Komponente in 2 aufteilen, einmal Komponente darstellen mit Edito Mode true einmal false

  return (
    <ScrollView style={theme.containers.rootContainer}>
      {editMode ?
        <Pressable style={theme.leftCornerIcon} onPress={() => setEditMode(false)}>
          <uiIcons.ArrowLeftIcon size={30} color={theme.colors.primary} />
        </Pressable>
        :
        <GoBack />
      }

      {/* Image */}
      <View style={theme.containers.centeredContainer}>
        <Pressable disabled={!editMode} onPress={() => setIconPickerModalOpen(true)}>
          <Image style={{ width: height * 0.3, height: height * 0.3, borderRadius: 200, backgroundColor: theme.colors.secondary }} source={avatars[userIcon]} />
        </Pressable>
      </View>
      {/* Username */}
      <View style={theme.containers.centeredContainer}>
        <Text style={theme.typography.heading1}>{user.username ? user.username : username}</Text>
        {editMode ?
          null
          :
          <TouchableHighlight onPress={() => setEditMode(true)} underlayColor={theme.colors.secondary} style={{ borderRadius: theme.borderRadius.medium }}>
            <View style={{ flexDirection: "row" }}>
              <uiIcons.EditIcon size={24} color={theme.colors.secondary} />
              <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>{t("settings.editProfile")}</Text>
            </View>
          </TouchableHighlight>
        }

      </View>
      {/* Username only Edit */}
      {editMode ?
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
        :
        null
      }
      {/* Birthday*/}
      <View style={[theme.containers.leftAlignedContainer, { paddingTop: theme.spacing.xlarge }]}>
        <Text style={theme.typography.heading2}>{t("settings.birthday")}</Text>
        {editMode ?
          <View style={{ flexDirection: "row" }}>
            <WheelPicker style={{ flex: 1 }} itemTextStyle={[theme.typography.heading3, { lineHeight: 50 }]} onValueChanged={({ item }) => setDayForBirthday(item.value)} value={user.birthday ? user.birthday.getDate() : new Date().getDate()} data={[...Array(31).keys()].map((index) => ({ value: index + 1, label: (index + 1).toString() }))} />
            <WheelPicker style={{ flex: 1 }} itemTextStyle={[theme.typography.heading3, { lineHeight: 50 }]} onValueChanged={({ item }) => setMonthForBirthday(item.value)} value={user.birthday ? user.birthday.getMonth() : new Date().getMonth()} data={months.map((m, index) => ({ value: index, label: m }))} />
            <WheelPicker style={{ flex: 1 }} itemTextStyle={[theme.typography.heading3, { lineHeight: 50 }]} onValueChanged={({ item }) => setYearForBirthday(item.value)} value={user.birthday ? user.birthday.getFullYear() : new Date().getFullYear()} data={[...Array(100).keys()].map((index) => ({ value: (new Date().getFullYear() - index), label: (new Date().getFullYear() - index).toString() }))} />
          </View>
          :
          <Text style={theme.typography.body}>{user.birthday ? formatDate(user.birthday, i18next.language) : "---"}</Text>
        }
      </View>
      {/* Language*/}
      <View style={[theme.containers.leftAlignedContainer, { paddingTop: theme.spacing.xlarge }]}>
        <Text style={theme.typography.heading2}>{t("settings.language")}</Text>
        {editMode ?
          <View style={{ paddingBottom: theme.spacing.large }}>
            <Picker onValueChange={(val: "de" | "en") => setLanguage(val)} selectedValue={language}>
              <Picker.Item style={theme.typography.heading3} label={t("settings.languageGerman")} value={"de"} />
              <Picker.Item style={theme.typography.heading3} label={t("settings.languageEnglish")} value={"en"} />
            </Picker>
          </View>
          :
          <Text style={theme.typography.body}>{getDisplayedLanguage()}</Text>
        }
      </View>
      {/* Edit Submit Button*/}
      {editMode ?
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", paddingBottom: 20 }}>
          <TouchableHighlight style={[theme.button, { flex: 1 }]} underlayColor={theme.colors.secondary} onPress={submitUserChanges}>
            <Text style={theme.buttonText}>{t("common.submit")}</Text>
          </TouchableHighlight>
        </View>
        :
        null
      }
      <Modal animationType="slide" visible={iconPickerModalOpen} onRequestClose={() => setIconPickerModalOpen(false)}>
        <View style={theme.containers.rootContainer}>
          <uiIcons.RemoveIcon size={24} color={theme.colors.primary} style={{ alignSelf: "flex-end", padding: 5 }} onPress={() => setIconPickerModalOpen(false)} />
          <FlatList
            data={Object.keys(avatars)}
            numColumns={3}
            contentContainerStyle={{ alignItems: "center", justifyContent: "center"}}
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

export default Profile

