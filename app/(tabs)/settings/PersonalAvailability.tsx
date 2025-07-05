import { useWeekdays } from '@/assets/hooks/timeObjectHooks';
import useUiIcons from '@/assets/hooks/uiIconHook';
import { IBusyAvailableModal, IBusyAvailableModalType, IBusyAvailableTimes } from '@/assets/interfaces/ProfileInterface';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
import AvailabilityPicker from '@/components/BusyAvailablePicker';
import GoBack from '@/components/GoBack';
import { useUser } from '@/components/ProfileInformationContext';
import { useCustomTheme } from '@/components/ThemeContext';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, StyleSheet, Text, View } from 'react-native';

const PersonalAvailability = () => {
    let { user } = useUser();
    const { theme } = useCustomTheme();
    const { t } = useTranslation();
    const weekDays = useWeekdays();
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [modalType, setModalType] = useState<IBusyAvailableModal>({ title: "", buttonText: "", type: "busy" });
    // const [hasBusyTimes, setHasBusyTimes] = useState(false);
    // const [hasAvailableTimes, setHasAvailableTimes] = useState(false);
    const uiIcons = useUiIcons()

    const closeModalAndSetTimes = (times: IBusyAvailableTimes, type: IBusyAvailableModalType) => {
        if (!user) return;
        setDatePickerVisibility(false);
        if (type.type === "available") {
            FirebaseExchange.updateFirestoreAvailableBusyTimes(user.id, "User", "available", times)
            // setHasAvailableTimes(true)
        } else if (type.type === "busy") {
            FirebaseExchange.updateFirestoreAvailableBusyTimes(user.id, "User", "busy", times)
            // setHasBusyTimes(true);
        }
    }

    // useEffect(() => {
    //     if(user && user.available && user.available.length > 0) {
    //         setHasAvailableTimes(true);
    //     }else{
    //         setHasAvailableTimes(false);
    //     }
    // }, [user, user?.available])

    // useEffect(() => {
    //     if(user && user.busy && user.busy.length > 0) {
    //         setHasBusyTimes(true);
    //     }else{
    //         setHasBusyTimes(false);
    //     }
    // }, [user, user?.busy])

    const openBusyTimesModal = () => {
        setModalType({ title: t("common.time.addBusy"), buttonText: t("common.time.addBusy"), type: "busy" });
        setDatePickerVisibility(true);
    }

    const openAvailableTimesModal = () => {
        setModalType({ title: t("common.time.addAvailable"), buttonText: t("common.time.addAvailable"), type: "available" });
        setDatePickerVisibility(true);
    }

    const removeEntry = (entry: IBusyAvailableTimes, type: "busy" | "available") => {
        if (!user) return;
        if (type === "busy") {
            FirebaseExchange.removeFirestoreAvailableBusyTimes(user.id, "User", "busy", entry)
        } else if (type === "available") {
            FirebaseExchange.removeFirestoreAvailableBusyTimes(user.id, "User", "available", entry)
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
                <FlatList
                    data={user ? user.busy : []}
                    renderItem={({ item }) => (
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: theme.spacing.small }}>
                            <uiIcons.RemoveIcon size={24} color={theme.colors.primary} onPress={() => removeEntry(item, "busy")} />
                            <View style={{ padding: theme.spacing.small, marginHorizontal: theme.spacing.large, marginLeft: theme.spacing.small, backgroundColor: theme.colors.secondary, borderRadius: theme.borderRadius.small }}>
                                <uiIcons.CalendarWithXIcon key={item.day + item.startHour + item.startMinute} size={24} color={theme.colors.primary} />
                            </View>
                            <View style={{ flexGrow: 1 }}>
                                <Text style={theme.typography.body}>{weekDays[item.day]}</Text>
                                <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>
                                    {t("common.time.duration", { begin: item.startHour + ":" + getFixedMinutes(item.startMinute), end: item.endHour + ":" + getFixedMinutes(item.endMinute) })}
                                </Text>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString() + "busy"}
                    ListEmptyComponent={() => (
                        <Text style={theme.typography.body}>{t("settings.busyPlaceholder")}</Text>
                    )}
                />
            </View>

            <View style={[theme.containers.leftAlignedContainer, { paddingTop: theme.spacing.large }]}>
                <View style={styles.headingWithIconContainer}>
                    <Text style={theme.typography.heading2}>{t("settings.availableTimes")}</Text>
                    <uiIcons.PlusIcon size={30} color={theme.colors.primary} onPress={openAvailableTimesModal} />
                </View>
                <FlatList
                    data={user ? user.available : []}
                    renderItem={({ item }) => (
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: theme.spacing.small }}>
                            <uiIcons.RemoveIcon size={24} color={theme.colors.primary} onPress={() => removeEntry(item, "available")} />
                            <View style={{ padding: theme.spacing.small, marginRight: theme.spacing.large, marginLeft: theme.spacing.small, backgroundColor: theme.colors.secondary, borderRadius: theme.borderRadius.small }}>
                                <uiIcons.CalendarWithOkIcon size={24} color={theme.colors.primary} />
                            </View>
                            <View style={{ flexGrow: 1 }}>
                                <Text style={theme.typography.body}>{weekDays[item.day]}</Text>
                                <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>
                                    {t("common.time.duration", { begin: item.startHour + ":" + getFixedMinutes(item.startMinute), end: item.endHour + ":" + getFixedMinutes(item.endMinute) })}
                                </Text>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString() + "available"}
                    ListEmptyComponent={() => (
                        <Text style={theme.typography.body}>{t("settings.availablePlaceholder")}</Text>
                    )}
                />
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

const styles = StyleSheet.create({
    headingWithIconContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    }
})