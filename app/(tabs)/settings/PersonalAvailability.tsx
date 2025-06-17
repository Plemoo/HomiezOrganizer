import { useWeekdays } from '@/assets/hooks/timeObjectHooks';
import useUiIcons from '@/assets/hooks/uiIconHook';
import { IBusyAvailableModal, IBusyAvailableModalType, IBusyAvailableTimes, ILocalUser } from '@/assets/interfaces/ProfileInterface';
import AvailabilityPicker from '@/components/BusyAvailablePicker';
import GoBack from '@/components/GoBack';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

const PersonalAvailability = () => {
    let { user, setUserIncludingLocalStorageAndFirebase } = useUser();
    const { theme } = useCustomTheme();
    const { t } = useTranslation();
    const weekDays = useWeekdays();
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [modalType, setModalType] = useState<IBusyAvailableModal>({ title: "", buttonText: "", type: "busy" });
    const [hasBusyTimes, setHasBusyTimes] = useState(user.busy && user.busy.length > 0);
    const [hasAvailableTimes, setHasAvailableTimes] = useState(user.available && user.available.length > 0);
    const uiIcons = useUiIcons()

    const closeModalAndSetTimes = (times: IBusyAvailableTimes, type: IBusyAvailableModalType) => {
        setDatePickerVisibility(false);
        if (type.type === "available") {
            let updatedUser: ILocalUser = { ...user, available: [...(user.available || []), times] };
            setUserIncludingLocalStorageAndFirebase(updatedUser);
            setHasAvailableTimes(true)
        } else if (type.type === "busy") {
            let updatedUser: ILocalUser = { ...user, busy: [...(user.busy || []), times] };
            setUserIncludingLocalStorageAndFirebase(updatedUser);
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
            let updatedUser: ILocalUser = { ...user, busy: user.busy?.filter(busy => busy !== entry) };
            setUserIncludingLocalStorageAndFirebase(updatedUser)
            if (!updatedUser.busy || !Array.isArray(updatedUser.busy) || updatedUser.busy.length === 0) {
                setHasBusyTimes(false);
            } else {
                setHasBusyTimes(true)
            }
        } else if (type === "available") {
            let updatedUser: ILocalUser = { ...user, available: user.available?.filter(avail => avail !== entry) };
            setUserIncludingLocalStorageAndFirebase(updatedUser)
            if (!updatedUser.available || !Array.isArray(updatedUser.available) || updatedUser.available.length === 0) {
                setHasAvailableTimes(false);
            } else {
                setHasAvailableTimes(true)
            }
        }
    }

    const getFixedMinutes = (minutes: number) => {
        return minutes < 10 ? "0" + minutes : minutes.toString();
    }

    return (
        <View style={theme.containers.rootContainer}>
            <GoBack />
            <View style={[theme.containers.leftAlignedContainer, { paddingTop: theme.spacing.xlarge }]}>
                <View style={styles.headingWithIconContainer}>
                    <Text style={theme.typography.heading2}>{t("settings.busyTimes")}</Text>
                    <uiIcons.PlusIcon size={30} color={theme.colors.primary} onPress={openBusyTimesModal} />
                </View>
                {user.busy && hasBusyTimes ?
                    <ScrollView>
                        {user.busy.map((busyTime, index) => (
                            <View key={index} style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: theme.spacing.small }}>
                                <uiIcons.RemoveIcon size={24} color={theme.colors.primary} onPress={() => removeEntry(busyTime, "busy")} />
                                <View style={{ padding: theme.spacing.small, marginHorizontal: theme.spacing.large, marginLeft: theme.spacing.small, backgroundColor: theme.colors.secondary, borderRadius: theme.borderRadius.small }}>
                                    <uiIcons.CalendarWithXIcon key={index} size={24} color={theme.colors.primary} />
                                </View>
                                <View style={{ flexGrow: 1 }}>
                                    <Text style={theme.typography.body}>{weekDays[busyTime.day]}</Text>
                                    <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>
                                        {t("common.time.duration", { begin: busyTime.startHour + ":" + getFixedMinutes(busyTime.startMinute), end: busyTime.endHour + ":" + getFixedMinutes(busyTime.endMinute) })}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                    :
                    <Text style={theme.typography.body}>{t("settings.busyPlaceholder")}</Text>}
            </View>

            <View style={[theme.containers.leftAlignedContainer, { paddingTop: theme.spacing.large }]}>
                <View style={styles.headingWithIconContainer}>
                    <Text style={theme.typography.heading2}>{t("settings.availableTimes")}</Text>
                    <uiIcons.PlusIcon size={30} color={theme.colors.primary} onPress={openAvailableTimesModal} />
                </View>
                {user.available && hasAvailableTimes ? // TODO: Umstellen auf FlatList
                    <ScrollView>
                        {user.available.map((availableTime, index) => (
                            <View key={index} style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: theme.spacing.small }}>
                                <uiIcons.RemoveIcon size={24} color={theme.colors.primary} onPress={() => removeEntry(availableTime, "available")} />
                                <View style={{ padding: theme.spacing.small, marginRight: theme.spacing.large, marginLeft: theme.spacing.small, backgroundColor: theme.colors.secondary, borderRadius: theme.borderRadius.small }}>
                                    <uiIcons.CalendarWithOkIcon size={24} color={theme.colors.primary} />
                                </View>
                                <View style={{ flexGrow: 1 }}>
                                    <Text style={theme.typography.body}>{weekDays[availableTime.day]}</Text>
                                    <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>
                                        {t("common.time.duration", { begin: availableTime.startHour + ":" + getFixedMinutes(availableTime.startMinute), end: availableTime.endHour + ":" + getFixedMinutes(availableTime.endMinute) })}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                    :
                    <Text style={theme.typography.body}>{t("settings.availablePlaceholder")}</Text>}
            </View>
            <Modal animationType="slide" visible={isDatePickerVisible} onRequestClose={() => setDatePickerVisibility(false)}>
                <View style={theme.containers.rootContainer}>
                    <uiIcons.RemoveIcon size={24} color={theme.colors.primary} style={{ alignSelf: "flex-end", padding: 5 }} onPress={() => setDatePickerVisibility(false)} />
                    <AvailabilityPicker submitTimes={closeModalAndSetTimes} title={modalType.title} buttonText={modalType.buttonText} type={modalType.type} />
                </View>
            </Modal>
        </View>
    )
}

export default PersonalAvailability

const styles = StyleSheet.create({ // TODO: mit bestehendem theme container austauschen
    headingWithIconContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    }
})