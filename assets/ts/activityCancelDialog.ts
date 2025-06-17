import { t } from "i18next";
import { Alert } from "react-native";

export const activityCancelConfirmationDialog = (callbackOnPress:()=>void) => {
  Alert.alert(
    t("activities.cancelActivity"),
    t("activities.cancelDialog.cancelActivityText"),
    [
      {
        text: t("activities.cancelDialog.cancel"),
        style: "cancel"
      },
      {
        text: t("activities.cancelDialog.yesIamSure"),
        style: "destructive",
        onPress: () => {
          // Handle confirmation
          callbackOnPress();
        }
      }
    ]
  );
};