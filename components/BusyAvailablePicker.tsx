import { useWeekdays } from "@/assets/hooks/timeObjectHooks";
import { ITimePickerProps } from "@/assets/interfaces/ProfileInterface";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCustomTheme } from "./ThemeContext";

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = [0, 15, 30, 45];



const AvailabilityPicker: React.FC<ITimePickerProps> =({submitTimes, title, buttonText, type}) =>{
  const { t } = useTranslation();
  const weekDays = useWeekdays();
  const {theme} = useCustomTheme();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [startHour, setStartHour] = useState(new Date().getHours());
  const [startMinute, setStartMinute] = useState(new Date().getMinutes() - (new Date().getMinutes() % 15)); // Round to nearest 15 minutes
  const [endHour, setEndHour] = useState(new Date().getHours());
  const [endMinute, setEndMinute] = useState(new Date().getMinutes() - (new Date().getMinutes() % 15));

  const closeModalAndSubmitData = ()=>{
    const time ={
      day: selectedDay,
      startHour: startHour,
      startMinute: startMinute,
      endHour: endHour,
      endMinute: endMinute
    };
    submitTimes(time, {type});
  }
  return (
    <View style={theme.containers.rootContainer}>
      <Text style={[theme.typography.heading1,{textAlign:"center", paddingBottom:theme.spacing.large}]}>{title}</Text>
    <View style={{paddingBottom:theme.spacing.medium}}>
      <Text style={theme.typography.heading2}>{t("common.time.day")}</Text>
      <View style={[styles.pickerRow, theme.input]}>
        
        <Picker
          selectedValue={selectedDay}
          onValueChange={(value) => setSelectedDay(value)}
          style={styles.picker}
        >
          {weekDays.map((day,index) => (
            <Picker.Item key={day} label={day} value={index} />
          ))}
        </Picker>
      </View>
    </View>

    <View style={{paddingBottom:theme.spacing.medium}}>
      <Text style={theme.typography.heading2}>{t("common.time.begin")}</Text>
      <View style={[styles.pickerRow, theme.input]}>
        <Picker
          selectedValue={startHour}
          onValueChange={(value) => setStartHour(value)}
          style={styles.picker}
        >
          {hours.map((h) => (
            <Picker.Item key={h} label={`${h}`} value={h} />
          ))}
        </Picker>
        <Picker
          selectedValue={startMinute}
          onValueChange={(value) => setStartMinute(value)}
          style={styles.picker}
        >
          {minutes.map((m) => (
            <Picker.Item key={m} label={`${m < 10 ? "0" : ""}${m}`} value={m} />
          ))}
        </Picker>
      </View>
      </View>

    <View style={{paddingBottom:theme.spacing.medium}}>
      <Text style={theme.typography.heading2}>{t("common.time.end")}</Text>
      <View style={[styles.pickerRow, theme.input]}>
        <Picker
          selectedValue={endHour}
          onValueChange={(value) => setEndHour(value)}
          style={styles.picker}
        >
          {hours.map((h) => (
            <Picker.Item key={h} label={`${h}`} value={h} />
          ))}
        </Picker>
        <Picker
          selectedValue={endMinute}
          onValueChange={(value) => setEndMinute(value)}
          style={styles.picker}
        >
          {minutes.map((m) => (
            <Picker.Item key={m} label={`${m < 10 ? "0" : ""}${m}`} value={m} />
          ))}
        </Picker>
      </View>
      </View>
      <Pressable style={theme.button} onPress={closeModalAndSubmitData}>
        <Text style={theme.buttonText}>{buttonText}</Text>
      </Pressable>
    </View>
  );
}

export default AvailabilityPicker;

const styles = StyleSheet.create({
  pickerRow: { flexDirection: "row"},
  picker: { flex: 1 },

});
