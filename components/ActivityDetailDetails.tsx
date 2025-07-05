import { IDuration, ITimeInterval } from '@/assets/interfaces/ActivityInterface';
import { formatDateAndTimeSmall, showDuration } from '@/assets/ts/timeManagement';
import i18next from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useCustomTheme } from './ThemeContext';

const ActivityDetailDetails = ({ activityMinParticipants, activityDuration, activityGroupName, activityTime }: {
  activityMinParticipants?: number;
  activityDuration?: IDuration;
  activityGroupName?: string;
  activityTime?: ITimeInterval;
}) => {
  const { t } = useTranslation();
  const { theme } = useCustomTheme();
  // TODO: So machen, dass auch Schedule Activity Unterstützt wird
  return (
    <View style={{ marginBottom: theme.spacing.medium }}>
      <Text style={theme.typography.heading2}>{t("activities.activityDetails")}</Text>
      <View>
        {activityMinParticipants ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={theme.typography.body}>{t("planning.minParticipants")}:</Text>
            <Text style={theme.typography.body}>{activityMinParticipants}</Text>
          </View>
        ) : null}
        {activityDuration ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={theme.typography.body}>{t("planning.activityDuration")}:</Text>
            <Text style={theme.typography.body}>{showDuration(activityDuration)}</Text>
          </View>
        ) : null}
        {activityGroupName ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={theme.typography.body}>{t("planning.activityGroup")}:</Text>
            <Text style={theme.typography.body}>{activityGroupName}</Text>
          </View>
        ) : null}
        {activityTime ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {activityTime ? (<Text style={theme.typography.body}>{t("common.time.begin")}:</Text>) : null}
            {activityTime ? (<Text style={theme.typography.body}>{formatDateAndTimeSmall(activityTime?.start, i18next.language)} {t("planning.until")} {formatDateAndTimeSmall(activityTime?.end, i18next.language)}</Text>) : null}
          </View>
        ) : null}
        <View>
        </View>
      </View>
    </View>
  )
}

export default ActivityDetailDetails