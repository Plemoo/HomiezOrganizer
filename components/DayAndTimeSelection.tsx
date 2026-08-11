import { ITimeInterval } from '@/assets/interfaces/ActivityInterface';
import { dayjs, formatDateForRnCalendar } from '@/assets/ts/timeManagement';
import WheelPicker from '@quidone/react-native-wheel-picker';
import i18next from 'i18next';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import { MarkedDates } from 'react-native-calendars/src/types';
import LoadingDots from './Loading';
import { useCustomTheme } from './ThemeContext';

// Configure the locale
LocaleConfig.locales['de'] = {
    monthNames: [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ],
    monthNamesShort: [
        'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
        'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
    ],
    dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    today: "Heute"
};
LocaleConfig.locales['en'] = {
    monthNames: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],
    monthNamesShort: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    today: "Today"
};
LocaleConfig.defaultLocale = i18next.language

interface IDayAndTimeSelection {
    onDateSelect: (arg: ITimeInterval) => void
}

const DayAndTimeSelection: React.FC<IDayAndTimeSelection> = ({ onDateSelect }) => {
    const { theme } = useCustomTheme();
    const [selectedDateStart, setSelectedDateStart] = useState<string | null>(null);
    const [hoursStart, setHoursStart] = useState(dayjs().hour())
    const [minutesStart, setMinutesStart] = useState(roundToNext5(dayjs().minute()))
    const [selectedDateEnd, setSelectedDateEnd] = useState<string | null>(null);
    const [hoursEnd, setHoursEnd] = useState(dayjs().hour())
    const [minutesEnd, setMinutesEnd] = useState(roundToNext5(dayjs().minute()))
    const [markedDates, setMarkedDates] = useState<MarkedDates | undefined>();
    const [loading, setLoading] = useState(true)
    const { t } = useTranslation();
    const onDateSelectRef = useRef(onDateSelect);
    useEffect(() => {
        onDateSelectRef.current = onDateSelect;
    }, [onDateSelect]);
    const getMinutesArr = () => {
        const result = [];
        for (let i = 0; i < 60; i += 5) { // nur bis 55
            result.push(i);
        }
        return result;
    };
    const hoursArray = [...Array(24).keys()].map((index) => ({ value: index + 1, label: (index + 1).toString() }));
    const minutesArray = getMinutesArr().map((m) => ({ value: m, label: m.toString() }));
    useEffect(() => {
        if (selectedDateStart) {
            let startDate = dayjs(selectedDateStart);
            startDate = startDate.set('minute', minutesStart);
            startDate = startDate.set('hour', hoursStart);
            let endDate = startDate;
            if (selectedDateEnd) {
                endDate = dayjs(selectedDateEnd);
            }
            endDate = endDate.set('minute', minutesEnd);
            endDate = endDate.set('hour', hoursEnd);
            onDateSelectRef.current({ start: startDate.toDate(), end: endDate.toDate() });
        }
    }, [selectedDateStart, hoursStart, minutesStart, selectedDateEnd, hoursEnd, minutesEnd]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false)
        }, 50)
        return () => {
            clearTimeout(timeout)
        }
    }, [])

    function roundToNext5(minutes: number) {
        const remainder = minutes % 5;
        // If the remainder is 0, return the current date
        if (remainder === 0) {
            return minutes;
        }
        // Calculate the next multiple of 5
        const next5 = minutes + (5 - remainder);
        return next5;
    }

    const handleCalendarDayPress = (day: { dateString: string }) => {
        // Wenn kein Datum ausgewählt ist, setze zuerst Startdatum
        // Wenn bereits ein Startdatum ausgewählt ist, setze Enddatum
        // Wenn beide bereits ausgewählt sind, setze Startdatum auf das neue Datum und lösche Enddatum
        if (!selectedDateStart) {
            resetCalendarDates(day.dateString);
        } else if (!selectedDateEnd) {
            // Wenn bereits ein Startdatum ausgewählt ist, setze Enddatum
            setSelectedDateEnd(day.dateString);
            const startDate = dayjs(selectedDateStart);
            const endDate = dayjs(day.dateString);
            if (endDate < startDate) {
                resetCalendarDates(day.dateString);
            }
            const datesInRange = getDatesInRange(startDate, endDate);
            datesInRange.forEach((date, index) => {
                let markedElement: MarkingProps = { color: theme.colors.primary, textColor: theme.colors.textLight };
                if (index === 0) {
                    markedElement = { ...markedElement, startingDay: true };
                }
                if (index === datesInRange.length - 1) {
                    markedElement = { ...markedElement, endingDay: true };
                }
                setMarkedDates((prev) => ({
                    ...prev,
                    [formatDateForRnCalendar(date.toDate())]: markedElement
                }));
            });
        } else {
            // Wenn beide bereits ausgewählt sind, setze Startdatum auf das neue Datum und lösche Enddatum
            resetCalendarDates(day.dateString);
        }
    }

    const resetCalendarDates = (dateString: string) => {
        setSelectedDateStart(dateString);
        setSelectedDateEnd(null);
        setMarkedDates({ [dateString]: { startingDay: true, endingDay: true, color: theme.colors.primary, textColor: theme.colors.textLight } });
    }

    if (loading) return <LoadingDots visible />;
    return (
        <View>
            <Calendar
                current={new Date().toISOString()}
                markedDates={markedDates}
                markingType='period'
                theme={{
                    textDayFontSize: theme.typography.body.fontSize,
                    textDayHeaderFontSize: theme.typography.body.fontSize,
                    textMonthFontWeight: "bold",
                    textMonthFontSize: theme.typography.heading2.fontSize,
                    arrowColor: theme.colors.primary,
                    backgroundColor: theme.colors.background,
                    calendarBackground: theme.colors.background,
                    todayBackgroundColor: theme.colors.secondary,
                    monthTextColor: theme.colors.primary,
                    todayTextColor: theme.colors.primary,
                    dayTextColor: theme.colors.primary
                }}
                onDayPress={(day) => handleCalendarDayPress(day)}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", flex: 1 }}>
                    <WheelPicker style={{ flex: 1 }}
                        itemTextStyle={[theme.typography.heading3, { lineHeight: 50 }]}
                        onValueChanged={({ item }) => setHoursStart(item.value)}
                        data={hoursArray}
                        value={hoursStart} />
                    <WheelPicker style={{ flex: 1 }}
                        itemTextStyle={[theme.typography.heading3, { lineHeight: 50 }]}
                        onValueChanged={({ item }) => setMinutesStart(item.value)}
                        value={minutesStart ? minutesStart : roundToNext5(new Date().getMinutes())}
                        data={minutesArray} />
                </View>
                <View style={{ justifyContent: "center", paddingHorizontal: theme.spacing.small }}>
                    <Text style={theme.typography.heading2}>{t("planning.until")}</Text>
                </View>
                <View style={{ flexDirection: "row", flex: 1 }}>
                    <WheelPicker style={{ flex: 1 }}
                        itemTextStyle={[theme.typography.heading3, { lineHeight: 50 }]}
                        onValueChanged={({ item }) => setHoursEnd(item.value)}
                        data={hoursArray}
                        value={hoursEnd} />
                    <WheelPicker style={{ flex: 1 }}
                        itemTextStyle={[theme.typography.heading3, { lineHeight: 50 }]}
                        onValueChanged={({ item }) => setMinutesEnd(item.value)}
                        value={minutesEnd ? minutesEnd : roundToNext5(new Date().getMinutes())}
                        data={minutesArray} />
                </View>
            </View>
        </View>
    )
}

export default DayAndTimeSelection;

/** return all Dates from start→end inclusive, to fill the calendar */
function getDatesInRange(start: dayjs.Dayjs, end: dayjs.Dayjs): dayjs.Dayjs[] {
    const dates: dayjs.Dayjs[] = []
    let cur = start.clone()
    end = end.clone()
    while (cur <= end) {
        dates.push(cur.clone())
        cur = cur.add(1, 'day')
    }
    return dates
}
