import { COLORS } from '@/assets/ts/constants';
import { useUser } from '@/components/ProfileInformationContext';
import { Entypo } from '@expo/vector-icons';
import { Image } from 'expo-image';
import i18next from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import userIcon from "../../../assets/images/avatars/avatar1.svg"; // TODO: GENERISCH ABBILDEN DAS ICON

const { width, height } = Dimensions.get('window'); // Get the screen width

const Profile = () => {
  let { user, setUser } = useUser();
  const { t } = useTranslation();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date:Date) => {
    console.warn("A date has been picked: ", date);
    hideDatePicker();
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image style={[styles.profileImage, { width: height * 0.3, height: height * 0.3 }]} source={userIcon} />
      </View>
      <View style={styles.usernameContainer}>
        <Text style={styles.usernameStyle}>{user.username ? user.username : "Max Mustermann"}</Text>
        <Text style={styles.editProfileStyle}>{t("settings.editProfile")}</Text>
      </View>
      <View style={styles.birthdayContainer}>
        <Text>{t("settings.birthday")}</Text>
        <Text>{user.birthday ? formatDate(user.birthday) : "---"}</Text>
      </View>
      <View style={styles.busyTimesContainer}>
        <View style={styles.headingWithIconContainer}>
          <Text>{t("settings.busyTimes")}</Text>
          <Entypo name="plus" size={24} color="black" />
        </View>
        {user.busy ? <Text>Hi</Text> : <Text>{t("settings.busyPlaceholder")}</Text>}
      </View>
      <View style={styles.availableTimesContainer}>
        <View style={styles.headingWithIconContainer}>
        <Text>{t("settings.availableTimes")}</Text>
        <Entypo name="plus" size={24} color="black" onPress={()=>setDatePickerVisibility(true)}/>
        </View>
        {user.busy ? <Text>Hi</Text> : <Text>{t("settings.availablePlaceholder")}</Text>}
      </View>

    </ScrollView>

  )
}

export default Profile


function formatDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date object");
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return date.toLocaleDateString(i18next.language, options);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
  },
  usernameContainer: {
    flex: 1,
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
  },
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
  headingWithIconContainer:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  },
  input: {
    height: 50, // Height of the input
    width: '100%', // Full width of the container
    backgroundColor: '#f0f0f0', // Grey background
    borderRadius: 10, // Rounded corners
    paddingHorizontal: 10, // Horizontal padding
    borderWidth: 1, // Optional: Border width
    borderColor: '#ccc', // Optional: Border color
  },
  profileImage: {
    borderRadius: 200, // Half of the width/height to make it round
    backgroundColor: COLORS.secondary
  },
  usernameStyle: {

  },
  editProfileStyle: {
    color: COLORS.secondary,
  }
})