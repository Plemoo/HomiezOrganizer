import useUiIcons from '@/assets/hooks/uiIconHook';
import { ITimeInterval } from '@/assets/interfaces/ActivityInterface';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, TouchableHighlight, View } from 'react-native';
import DayAndTimeSelection from './DayAndTimeSelection';
import { useCustomTheme } from './ThemeContext';

const AvailableTimesModal = ({modalVisible, actionByParent}: {modalVisible: boolean, actionByParent: (timeSlot: ITimeInterval) => void}) => {
    const [timeSlotModalVisible, setTimeSlotModalVisible] = React.useState(modalVisible);
    const { t } = useTranslation();
    const { theme } = useCustomTheme();
    const uiIcon = useUiIcons();
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<ITimeInterval | undefined>(undefined);
    const [timeSlotInputWarn, setTimeSlotInputWarn] = React.useState<string | undefined>(undefined);

    useEffect(() => {
        setTimeSlotModalVisible(modalVisible);
    },[modalVisible])

    const modalBackButton = () => {
        timeSlotModalReset();
    }

    const timeSlotModalReset = () => {
        setTimeSlotModalVisible(false);
        setSelectedTimeSlot(undefined);
    }
  useEffect(() => {
    timeSlotWarnings(selectedTimeSlot)
  }, [selectedTimeSlot])

    const timeSlotWarnings = (timeslot: ITimeInterval | undefined) => {
      if (timeslot === undefined) {
        setTimeSlotInputWarn(t("planning.warnNoTimeSlotSet"))
      } else if (new Date() > timeslot.start) {
        setTimeSlotInputWarn(t("planning.warnTimeInPast"))
      } else if (timeslot.start != null && timeslot.end != null && timeslot.start >= timeslot.end) {
        setTimeSlotInputWarn(t("planning.warnStartBeforeEnd"))
      } else {
        setTimeSlotInputWarn(undefined)
      }
    }

    const modalSubmitButton = ()=>{
        if(selectedTimeSlot){
            actionByParent(selectedTimeSlot)
            timeSlotModalReset();
        }
    }
    return (
        <Modal
            animationType="slide"
            visible={timeSlotModalVisible}
            onRequestClose={() => setTimeSlotModalVisible(false)}
        >
            <Pressable style={theme.leftCornerIcon} onPress={modalBackButton}>
                <uiIcon.ArrowLeftIcon size={30} color={theme.colors.primary} />
            </Pressable>
            <View style={{ flex: 1, margin: theme.spacing.medium, justifyContent: "space-evenly" }}>
                <View>
                    <DayAndTimeSelection onDateSelect={(val) => setSelectedTimeSlot(val)} />
                </View>
                {timeSlotInputWarn ?
                    <View style={{ flexDirection: "row", gap: theme.spacing.small }}>
                        <uiIcon.WarnIcon size={24} color={theme.colors.primary} />
                        <Text>{timeSlotInputWarn}</Text>
                    </View>
                    : null
                }
                <TouchableHighlight style={theme.button}
                    onPress={modalSubmitButton}
                    disabled={timeSlotInputWarn !== undefined}>
                    <Text style={theme.buttonText}>{t("planning.timeButtonText")}</Text>
                </TouchableHighlight>
            </View>
        </Modal>
    )
}

export default AvailableTimesModal