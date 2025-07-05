import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import * as Localization from 'expo-localization';
import i18next, { t } from "i18next";
import { IDuration, ITimeSlot } from "../interfaces/ActivityInterface";


export function formatDate(date: Date, language: string): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date object");
  }
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString(language, options);
}

export function formatDateAndTime(date: Date, language: string): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date object");
  }
  const options: Intl.DateTimeFormatOptions = {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
    weekday: "short",
    minute: "2-digit",
    hour: "2-digit"
  };
  return date.toLocaleDateString(language, options);
}

export function formatDateAndTimeSmall(date: Date, language: string): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date object");
  }
  const options: Intl.DateTimeFormatOptions = {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
    minute: "numeric",
    hour: "numeric"
  };
  return date.toLocaleDateString(language, options);
}

export function showDuration(activityDuration: IDuration): string {
  const { days, hours, minutes } = activityDuration;
  const parts: string[] = []
  if (days && days > 0) {
    parts.push(days + ' ' + t('planning.days'));
  }
  if (hours && hours > 0) {
    parts.push(hours + ' ' + t('planning.hours'));
  }
  if (minutes && minutes > 0) {
    parts.push(minutes + ' ' + t('planning.minutes'));
  }
  // join with space, or use comma: parts.join(', ')
  return parts.join(' ')
}


/** format a Date into “YYYY-MM-DD” */
export function formatDateForRnCalendar(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function isDurationLongerThanAnyTimeSlot(durationDays?: number, durationHours?: number, durationMinutes?: number, timeSlot?: ITimeSlot[]): boolean {
  if (!timeSlot || timeSlot.length === 0) return false;

  const totalDurationInMinutes = (durationDays || 0) * 24 * 60 + (durationHours || 0) * 60 + (durationMinutes || 0);
  return timeSlot.some(slot => {
    const start = dayjs(slot.slots.start);
    const end = dayjs(slot.slots.end);
    return totalDurationInMinutes > end.diff(start, 'minute');// Duration bigger than time slot -> error
  });
}

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// Set phone's locale
const phoneLanguage = Localization.getLocales()[0].languageCode;
dayjs.locale(phoneLanguage ? phoneLanguage : i18next.language.split('-')[0]);

export { dayjs };

