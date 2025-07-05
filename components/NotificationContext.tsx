import { IActivity } from '@/assets/interfaces/ActivityInterface';
import { CloudFunctionInterface } from '@/assets/interfaces/CoudFunctionInterface';
import { IFirebaseSearchParameter } from '@/assets/interfaces/FirebaseInterface';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
import { parseFirebaseActivity } from '@/assets/ts/parsing';
import * as Notifications from 'expo-notifications';
import { UnknownInputParams, useRouter } from 'expo-router';
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect
} from 'react';
import { Platform } from 'react-native';



// 2) create it
const NotificationsContext = createContext<undefined>(undefined);


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});


// 3) provider impl
export function NotificationsProvider({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();

    // Ask & get token
    async function registerForPushNotifications() {
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FFFFFFFF'
            });
        }
        try {
            // 1. ask for permission
            const { status: existing } = await Notifications.getPermissionsAsync();
            let finalStatus = existing;
            if (existing !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            const granted = finalStatus === 'granted';
            if (!granted) throw new Error("Push notification permission not granted");
        } catch (error) {
            console.error("Error registering for push notifications:", error);
        }
    }

    // TODO: UserLoading Changes are not registered
    // Listen for notifications
    useEffect(() => {
        let responseListener: Notifications.EventSubscription | null = null;
        // let sub: Notifications.EventSubscription | null = null;
        // Ensure we call register once
        registerForPushNotifications()
            .then(() => {
                //!!!!!!! No need for a listener in the foreground as it's handled by the notification handler!!!!
                // sub = Notifications.addNotificationReceivedListener(
                //     (notification) => {
                //         handleNotification(notification.request.content as any);
                //         setLastNotification(notification);
                //     }
                // );
                // Handles notifications when the user interacts with them (taps on them)
                responseListener = Notifications.addNotificationResponseReceivedListener(
                    (response) => {
                        handleNotification(response.notification.request.content as any);
                    }
                );
            }).catch((err) => console.error("Error registering for push notifications:", err));
        // Handles notifications when the app is in the foreground

        return () => {
            // sub?.remove();
            responseListener?.remove();
        };
    }, []);


    /**
     * Navigates to the appropriate page dependding on the notification
     * @param notificationData The notification data received from the push notification
     */
    function handleNotification(notificationData: CloudFunctionInterface) {
        const searchParams: IFirebaseSearchParameter = {
            activityIdParameter: notificationData.data.params.activityIdParameter,
            groupIdParameter: notificationData.data.params.groupIdParameter
        }
        if (notificationData.data.type === "newComment") {
            FirebaseExchange.getFirebaseDocument(searchParams.activityIdParameter!, "Group", searchParams.groupIdParameter, "Activity")
                .then((activityDoc) => {
                    if (activityDoc.exists()) {
                        const activity: IActivity | null = parseFirebaseActivity(activityDoc);
                        if (activity && activity.state === "pending") {
                            // Handle newComment for pending activities
                            router.replace({ pathname: "/(tabs)/activities/ActivityDetail", params: searchParams as UnknownInputParams });
                        } else if (activity && activity.state === "scheduled") {
                            router.replace({ pathname: "/(tabs)/activities/ScheduledActivity", params: searchParams as UnknownInputParams });
                        }
                    }
                });
        } else if (notificationData.data.type === "activityScheduled") {
            router.replace({ pathname: "/(tabs)/activities/ScheduledActivity", params: searchParams as UnknownInputParams });
        } else if (notificationData.data.type === "newActivity") {
            // Handle newComment, activityScheduled, newActivity
            router.replace({ pathname: "/(tabs)/activities/ActivityDetail", params: searchParams as UnknownInputParams });
        } else if (notificationData.data.type === "activityCancelled") {
            // Handle activityCancelled
            router.replace({ pathname: "/(tabs)/groups/GroupDetail", params: searchParams as UnknownInputParams });

        }

    }

    return (
        <NotificationsContext.Provider value={undefined}>
            {children}
        </NotificationsContext.Provider>
    );
}

// 4) consumer hook
export function useNotifications() {
    return useContext(NotificationsContext);
}