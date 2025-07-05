import useUiIcons from '@/assets/hooks/uiIconHook';
import { ITimeSlot } from '@/assets/interfaces/ActivityInterface';
import { formatDateAndTimeSmall } from '@/assets/ts/timeManagement';
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { useCustomTheme } from './ThemeContext';

const TimeSlotSelectionModal = ({ modalVisible, timeSlots, minParticipants, actionByParent, transitionVisibleState }: { modalVisible: boolean, timeSlots: ITimeSlot[], minParticipants: number, actionByParent: (timeSlot: ITimeSlot[]) => void, transitionVisibleState: (isVisible: boolean) => void }) => {
    const [timeSlotModalVisible, setTimeSlotModalVisible] = useState(modalVisible);
    const { t } = useTranslation();
    const { theme } = useCustomTheme();
    const uiIcon = useUiIcons();

    useEffect(() => {
        setTimeSlotModalVisible(modalVisible);
    }, [modalVisible]);

    const modalBackButton = () => {
        setTimeSlotModalVisible(false);
        transitionVisibleState(false);
    }

    const defineSelectedTimeSlot = (index: number) => {
        actionByParent(timeSlots.map((item, i) => i === index ? { ...item, selected: true } : { ...item }));
        setTimeSlotModalVisible(false);
        transitionVisibleState(false);
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
            <View style={{ flex: 1, margin: theme.spacing.medium, justifyContent: "space-evenly", marginTop: theme.spacing.xlarge }}>
                <View>
                    <Text style={theme.typography.heading3}>{t("activities.chooseTimeSlot")}</Text>
                </View>
                <FlatList
                    data={timeSlots}
                    scrollEnabled={false}
                    renderItem={({ item, index }) =>
                        item.userUuid.length >= minParticipants ? (
                            <Pressable key={index + "timeSlot"} onPress={() => defineSelectedTimeSlot(index)} style={{ borderWidth: 2, borderColor: theme.colors.secondary, borderRadius: theme.borderRadius.medium, padding: theme.spacing.small, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.medium }} >
                                <View style={{ flexDirection: "column" }}>
                                    <Text style={theme.typography.body}>{item.userUuid.length} / {minParticipants}</Text>
                                    <Text style={theme.typography.body}>
                                        {formatDateAndTimeSmall(item.slots.start, i18next.language)} - {formatDateAndTimeSmall(item.slots.end, i18next.language)}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: "row", gap: theme.spacing.medium }}>
                                    <uiIcon.CalendarWithOkIcon size={30} color={theme.colors.primary} />
                                </View>
                            </Pressable>

                        ) : null
                    }
                />

            </View>
        </Modal >
    )
}

export default TimeSlotSelectionModal