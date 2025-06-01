import { IBusyAvailableModal, IBusyAvailableModalType, IBusyAvailableTimes } from '@/assets/interfaces/ProfileInterface';
import { overwriteSecureStore, overwriteSecureStoreEntry } from '@/assets/ts/asyncStorage';
import { formatDate } from '@/assets/ts/timeManagement';
import { useMonths, useWeekdays } from '@/assets/ts/timeObjectHooks';
import AvailabilityPicker from '@/components/BusyAvailablePicker';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import { Entypo, Feather, FontAwesome, Fontisto, MaterialIcons } from '@expo/vector-icons';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { Image } from 'expo-image';
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableHighlight, View } from 'react-native';

import userIcon from "../../../assets/images/avatars/avatar3.svg"; // TODO: GENERISCH ABBILDEN DAS ICON

const { width, height } = Dimensions.get('window'); // Get the screen width

const Profile = () => {
  let { user, setUser } = useUser();
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const weekDays = useWeekdays();
  const months = useMonths();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [modalType, setModalType] = useState<IBusyAvailableModal>({ title: "", buttonText: "", type: "busy" });
  const [hasBusyTimes, setHasBusyTimes] = useState(user.busy && user.busy.length > 0);
  const [hasAvailableTimes, setHasAvailableTimes] = useState(user.available && user.available.length > 0);
  const [editMode, setEditMode] = useState(false)
  const [username, setUsername] = useState(user.username|| "Max Mustermann")
  const [birthday, setBirthday] = useState<Date>(user.birthday || new Date());

  useEffect(() => {
    if (user.busy && user.busy.length > 0) {
      overwriteSecureStoreEntry("busy", user.busy);
      // TODO: Update Firebase User here
    } else {
      setHasBusyTimes(false)
    }
  }, [user.busy])

  useEffect(() => {
    if (user.available && user.available.length > 0) {
      overwriteSecureStoreEntry("available", user.available);
      // TODO: Update Firebase User here
    } else {
      setHasAvailableTimes(false);
    }
  }, [user.available])

  const closeModalAndSetTimes = (times: IBusyAvailableTimes, type: IBusyAvailableModalType) => {
    setDatePickerVisibility(false);
    if (type.type === "available") {
      setUser(prevState => ({
        ...prevState,
        available: [...prevState.available || [], times]
      }
      ));
      setHasAvailableTimes(true)
    } else if (type.type === "busy") {
      setUser(prevState => ({
        ...prevState,
        busy: [...prevState.busy || [], times]
      }
      ));
      setHasBusyTimes(true);
    }
  }
  const openBusyTimesModal = () => {
    setModalType({ title: t("common.time.addBusy"), buttonText: t("common.time.addBusy"), type: "busy" });
    setDatePickerVisibility(true);
  }

  const openAvailableTimesModal = () => {
    setModalType({ title: t("common.time.addAvailable"), buttonText: t("common.time.addAvailable"), type: "available" });
    setDatePickerVisibility(true);
  }

  const removeEntry = (entry: IBusyAvailableTimes, type: "busy" | "available") => {
    if (type === "busy") {
      setUser(prevState => ({
        ...prevState,
        busy: prevState.busy?.filter(busy => busy !== entry)
      }));
    } else if (type === "available") {
      setUser(prevState => ({
        ...prevState,
        available: prevState.available?.filter(avail => avail !== entry)
      }));
    }
  }

  const getFixedMinutes = (minutes: number) => {
    return minutes < 10 ? "0" + minutes : minutes.toString();
  }

  const submitUserChanges = () => {
    setEditMode(false);
    setUser(prevState=>({...prevState, birthday:birthday, username: username}));
    overwriteSecureStore("birthday",birthday.toISOString());
    overwriteSecureStore("username",username);
    // TODO: Update Firebase User here
  }

  const abortUserEdit = ()=>{
    setEditMode(false)
    setUsername(user.username || "Max Mustermann")
  }

  const setDayForBirthday = (day:number)=>{
    setBirthday(prevState => {
      const newDate = new Date(prevState);
      newDate.setDate(day);
      return newDate;
    });
  }

  const setMonthForBirthday = (month:number)=>{
    setBirthday(prevState => {
      const newDate = new Date(prevState);
      newDate.setMonth(month);
      return newDate;
    });
  }

  const setYearForBirthday = (year:number)=>{
    setBirthday(prevState => {
      const newDate = new Date(prevState);
      newDate.setFullYear(year);
      return newDate;
    });
  }

  return (
    <ScrollView style={theme.container}>
      {/* Image */}
      <View style={theme.centeredContainer}>
        <Image style={{ width: height * 0.3, height: height * 0.3, borderRadius: 200, backgroundColor: theme.colors.secondary }} source={userIcon} />
      </View>
      {/* Username */}
      <View style={theme.centeredContainer}>
        <Text style={theme.typography.heading1}>{user.username ? user.username : username}</Text>
        <TouchableHighlight onPress={() => setEditMode(true)} underlayColor={theme.colors.secondary} style={{ borderRadius: theme.borderRadius.medium }}>
          <View style={{ flexDirection: "row" }}>
            <MaterialIcons name="edit" size={24} color={theme.colors.secondary} />
            <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>{t("settings.editProfile")}</Text>
          </View>
        </TouchableHighlight>
      </View>
      {/* Username only Edit */}
      {editMode ?
        <View style={{paddingTop:theme.spacing.large}}>
          <Text style={theme.typography.heading2}>{t("settings.username")}</Text>
          <View style={[theme.input, { marginTop: theme.spacing.small }]}>
            <TextInput
              value={user.username || username}
              onChangeText={(text) => setUsername(text)}
              style={[theme.typography.body, { marginLeft: theme.spacing.small }]}
            />
          </View>
        </View>
        :
        <></>
      }
      {/* Birthday*/}
      <View style={[styles.birthdayContainer, { paddingTop: theme.spacing.xlarge }]}>
        <Text style={theme.typography.heading2}>{t("settings.birthday")}</Text>
        {editMode ?
          <View style={{ flexDirection: "row" }}>
            <WheelPicker style={{ flex: 1 }} onValueChanged={({item})=>setDayForBirthday(item.value)} value={user.birthday?user.birthday.getDate():new Date().getDate()} data={[...Array(31).keys()].map((index) => ({ value: index+1, label: (index + 1).toString() }))} />
            <WheelPicker style={{ flex: 1 }} onValueChanged={({item})=>setMonthForBirthday(item.value)} value={user.birthday?user.birthday.getMonth():new Date().getMonth()} data={months.map((m, index) => ({ value: index, label: m }))} />
            <WheelPicker style={{ flex: 1 }} onValueChanged={({item})=>setYearForBirthday(item.value)} value={user.birthday?user.birthday.getFullYear():new Date().getFullYear()} data={[...Array(100).keys()].map((index) => ({ value: (new Date().getFullYear() - index), label: (new Date().getFullYear() - index).toString() }))} />
          </View>
          :
          <Text style={theme.typography.body}>{user.birthday ? formatDate(user.birthday, i18next.language) : "---"}</Text>
        }
      </View>
      {/* Busy/Available Times or Edit Submit Button*/}
      {editMode ?
        <View style={{flex:1, flexDirection: "row", justifyContent:"space-between"}}>
          <View style={{flex:5}}>
            <TouchableHighlight style={theme.button} underlayColor={theme.colors.secondary} onPress={submitUserChanges}>
              <Text style={theme.buttonText}>Submit</Text>
            </TouchableHighlight>
          </View>
          <View style={theme.centeredContainer}>
            <Feather name="x" size={24} color={theme.colors.textLight} style={ theme.button} onPress={abortUserEdit}/>
          </View>
        </View>
        :
        <View>
          <View style={[styles.busyTimesContainer, { paddingTop: theme.spacing.large }]}>
            <View style={styles.headingWithIconContainer}>
              <Text style={theme.typography.heading2}>{t("settings.busyTimes")}</Text>
              <Entypo name="plus" size={30} color="black" onPress={openBusyTimesModal} />
            </View>
            {user.busy && hasBusyTimes ?
              user.busy.map((busyTime, index) => (
                <View key={index} style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", paddingVertical: theme.spacing.small }}>
                  <FontAwesome name="remove" size={24} color={theme.colors.primary} onPress={() => removeEntry(busyTime, "busy")} />
                  <View style={{ padding: theme.spacing.small, marginHorizontal: theme.spacing.large, marginLeft: theme.spacing.small, backgroundColor: theme.colors.secondary, borderRadius: theme.borderRadius.small }}>
                    <MaterialIcons key={index} name="event-busy" size={24} color="black" />
                  </View>
                  <View style={{ flexGrow: 1 }}>
                    <Text style={theme.typography.body}>{weekDays[busyTime.day]}</Text>
                    <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>
                      {t("common.time.duration", { begin: busyTime.startHour + ":" + getFixedMinutes(busyTime.startMinute), end: busyTime.endHour + ":" + getFixedMinutes(busyTime.endMinute) })}
                    </Text>
                  </View>
                </View>
              ))
              :
              <Text style={theme.typography.body}>{t("settings.busyPlaceholder")}</Text>}
          </View>

          <View style={[styles.availableTimesContainer, { paddingTop: theme.spacing.large }]}>
            <View style={styles.headingWithIconContainer}>
              <Text style={theme.typography.heading2}>{t("settings.availableTimes")}</Text>
              <Entypo name="plus" size={30} color="black" onPress={openAvailableTimesModal} />
            </View>
            {user.available && hasAvailableTimes ?
              user.available.map((availableTime, index) => (
                <View key={index} style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", paddingVertical: theme.spacing.small }}>
                  <FontAwesome name="remove" size={24} color="black" onPress={() => removeEntry(availableTime, "available")} />
                  <View style={{ padding: theme.spacing.small, marginRight: theme.spacing.large, marginLeft: theme.spacing.small, backgroundColor: theme.colors.secondary, borderRadius: theme.borderRadius.small }}>
                    <MaterialIcons key={index} name="event-available" size={24} color="black" />
                  </View>
                  <View style={{ flexGrow: 1 }}>
                    <Text style={theme.typography.body}>{weekDays[availableTime.day]}</Text>
                    <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>
                      {t("common.time.duration", { begin: availableTime.startHour + ":" + getFixedMinutes(availableTime.startMinute), end: availableTime.endHour + ":" + getFixedMinutes(availableTime.endMinute) })}
                    </Text>
                  </View>
                </View>
              ))
              :
              <Text style={theme.typography.body}>{t("settings.availablePlaceholder")}</Text>}
          </View>
        </View>
      }
      <Modal animationType="slide" visible={isDatePickerVisible} onRequestClose={() => setDatePickerVisibility(false)}>
        <Fontisto name="close-a" size={24} color="black" style={{ alignSelf: "flex-end", padding: 5 }} onPress={() => setDatePickerVisibility(false)} />
        <AvailabilityPicker submitTimes={closeModalAndSetTimes} title={modalType.title} buttonText={modalType.buttonText} type={modalType.type} />
      </Modal>
    </ScrollView>
  )
}

export default Profile



const styles = StyleSheet.create({
  birthdayContainer: {
    flex: 1,
    justifyContent: "flex-start"
  },
  busyTimesContainer: {
    flex: 1,
    justifyContent: "flex-start"
  },
  availableTimesContainer: {
    flex: 1,
    justifyContent: "flex-start"
  },
  headingWithIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
})