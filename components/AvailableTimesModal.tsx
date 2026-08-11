import useUiIcons from '@/assets/hooks/uiIconHook';
import { ITimeInterval } from '@/assets/interfaces/ActivityInterface';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, TouchableHighlight, View } from 'react-native';
import DayAndTimeSelection from './DayAndTimeSelection';
import { useCustomTheme } from './ThemeContext';

const AvailableTimesModal = ({modalVisible, actionByParent,setModalStateInParent}: {modalVisible: boolean, actionByParent: (timeSlot: ITimeInterval) => void, setModalStateInParent: (state: boolean) => void}) => {
    const [timeSlotModalVisible, setTimeSlotModalVisible] = React.useState(modalVisible);
    const { t } = useTranslation();
    const { theme } = useCustomTheme();
    const uiIcon = useUiIcons();
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<ITimeInterval | undefined>(undefined);
    const timeSlotInputWarn = useMemo(() => {
      if (!selectedTimeSlot) return t("planning.warnNoTimeSlotSet");
      if (new Date() > selectedTimeSlot.start) return t("planning.warnTimeInPast");
      if (selectedTimeSlot.start >= selectedTimeSlot.end) return t("planning.warnStartBeforeEnd");
      return undefined;
    }, [selectedTimeSlot, t]);

    useEffect(() => {
        setTimeSlotModalVisible(modalVisible);
    },[modalVisible])

    const modalBackButton = () => {
        timeSlotModalReset();
    }

    const timeSlotModalReset = () => {
        setTimeSlotModalVisible(false);
        setSelectedTimeSlot(undefined);
        setModalStateInParent(false)
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
            style={{backgroundColor:"blue"}}
        >
            <View style={{flex:1, backgroundColor: theme.colors.background}}>
            <Pressable style={theme.leftCornerIcon} onPress={modalBackButton}>
                <uiIcon.ArrowLeftIcon size={30} color={theme.colors.primary} />
            </Pressable>
            <View style={{ flex: 1, margin: theme.spacing.medium, justifyContent: "space-evenly" }}>
                <View>
                    <DayAndTimeSelection onDateSelect={(val) => setSelectedTimeSlot(val)} />
                </View>
                {timeSlotInputWarn ?
                    <View style={{ flexDirection: "row", gap: theme.spacing.small, width:"90%" }}>
                        <uiIcon.WarnIcon size={24} color={theme.colors.primary} />
                        <Text style={theme.typography.body}>{timeSlotInputWarn}</Text>
                    </View>
                    : null
                }
                <TouchableHighlight style={theme.button}
                    onPress={modalSubmitButton}
                    disabled={timeSlotInputWarn !== undefined}>
                    <Text style={theme.buttonText}>{t("planning.timeButtonText")}</Text>
                </TouchableHighlight>
            </View>
            </View>
        </Modal>
    )
}

export default AvailableTimesModal
