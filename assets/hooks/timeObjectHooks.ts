import { useTranslation } from 'react-i18next';

export const useWeekdays = () => {
  const { t } = useTranslation();
  const days = [ t("common.weekDays.sunday"), t("common.weekDays.monday"), t("common.weekDays.tuesday"), t("common.weekDays.wednesday"), t("common.weekDays.thursday"), t("common.weekDays.friday"), t("common.weekDays.saturday")];
  return days
};

export const useMonths = () => {
  const { t } = useTranslation();
  const months = [t("common.months.january"), t("common.months.february"), t("common.months.march"), t("common.months.april"), t("common.months.may"), t("common.months.june"), t("common.months.july"), t("common.months.august"), t("common.months.september"), t("common.months.october"), t("common.months.november"), t("common.months.december")];
  return months;
};