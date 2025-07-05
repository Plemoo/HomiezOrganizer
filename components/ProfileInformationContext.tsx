import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { SecureStorageHandler } from '@/assets/ts/asyncStorage';
import { FirebaseExchange } from '@/assets/ts/firebaseExchange';
import { FirebaseSnapshotListener } from '@/assets/ts/firebaseSnapshotListener';
import { getDefaultLanguage } from '@/assets/ts/i18next';
import { Unsubscribe } from '@react-native-firebase/firestore';
import * as Notifications from 'expo-notifications';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserContextType {
  user: ILocalUser | undefined;
  // setUser: React.Dispatch<React.SetStateAction<ILocalUser>>;
  // setUserIncludingLocalStorageAndFirebase: (userData: ILocalUser) => Promise<void | [(keyof ILocalUser)[], void]>;
  // makeSureUserIsLoggedIn: (userData: ILocalUser) => Promise<ILocalUser>;
  userLoading: boolean
}

const UserContext = createContext<UserContextType | null>(null);

/**
 * UserProvider component to provide user context. The onSnapshot Listener is set up to listen for changes in the user document in Firebase. When a change is detected there, the user and the secure store will be updated
 * @param param0 
 * @returns 
 */
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getRandomAvatarKey } = useAvatarIcons()
  const [user, setUser] = useState<ILocalUser | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  const initRandomUserIcon = getRandomAvatarKey()
  const userLanguage = getDefaultLanguage()
  const initUserName = "New User"
  // useEffect(() => {
  //   let userUuidKey: keyof ILocalUser = "id";
  //   SecureStore.getItemAsync(userUuidKey)
  //     .then((userUuid) => {
  //       FirebaseExchange.getFirebaseUserUid().then((firebaseUid) => {
  //       }).catch((error) => {
  //         console.error("Error retrieving Firebase UID in ProfileInformationContext:", error);
  //       })
  //       if (!userUuid) { // No User found in local storage, create new one
  //         setUserIncludingLocalStorageAndFirebase({ ...newUser }).finally(() => setLoading(false))
  //         console.log("No user found in secure store, creating new user with new ID");
  //       } else {
  //         // Async Storage has user id stored
  //         console.log("User found in secure store with ID:", userUuid);
  //         setExistingUserInContext().finally(() => setLoading(false));
  //       }
  //     });
  // }, []);
  // TODO: Hier so anpassen, dass wenn es ein neuer User ist, dass dieser dann neu angemeldet wird und onSnapshot die Inhalte befüllt
  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    setLoading(true);
    setupUserOnStartup()
      .then((unsub) => {
        unsubscribe = unsub;
        setLoading(false);
      }).catch((error) => {
        console.error("Error setting up user on startup in ProfileInformationContext:", error);
      });
    return () => {
      console.log("Cleaning up user context in ProfileInformationContext", loading);
      if (unsubscribe) unsubscribe();
    }
  }, []);



  /**
   * Use Case 1: User opens the app for the first time-> no user is stored in secure store and in user context
   * Use Case 2: User opens the app after a logout-> firebase ID new
   * Use Case 3: User interacts with the app after a change in the db
   * Use Case 4: User opens the app after a change in the secure store (lost internet connection, app crash, etc.)
   */
  async function setupUserOnStartup(): Promise<Unsubscribe> {
    try {
      const firebaseUserId = await FirebaseExchange.getFirebaseUserUid(); // Get Authorization ID (has nothing to do with Firebase)
      try {
        const firebaseUser = await FirebaseExchange.getFirebaseDocument(firebaseUserId, "User"); // Get the user document from Firebase
        if (!firebaseUser.exists()) throw new Error("Firebase user document does not exist for UID: " + firebaseUserId);
      } catch (err) {
        let newUser = await createNewUserBasedOnSecureStoreLeftover(firebaseUserId); // Create a new user, with the new id, originating form a new sign in
        const tokenData = await Notifications.getExpoPushTokenAsync();
        newUser.expoPushToken = tokenData.data; // Set the expo push token for the new user
        // NEED TO UPDATE USER HERE, BECAUSE fo the setDoc functionality lets you define my own id
        await FirebaseExchange.updateFirebaseDocument(newUser, "User", firebaseUserId); // Write the new User into the firebase db
      }
      // Existiert ein Firebase User, wird der SecureStore mit den Einträgen des Firebase Users überschrieben
      return FirebaseSnapshotListener.snapshotListenerForUserChange(firebaseUserId, async (userWithChanges) => {
        // Firebase User HAS to exist, because it is created new in lines before + when user doesnt exist, a read is not allowed -> no Permisison exception
        if (!userWithChanges) throw new Error("User with changes is null or undefined in ProfileInformationContext (Should not happen, since not defined users result in no-permission)");
        SecureStorageHandler.updateSecureStore(userWithChanges).catch((error) => console.error("Error updating secure store with user changes in ProfileInformationContext:", error))
        setUser(userWithChanges); // Update the context state for the user
      });
    } catch (error) {
      console.error("Error setting up user on startup in ProfileInformationContext:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  async function createNewUserBasedOnSecureStoreLeftover(newUserId: string): Promise<ILocalUser> {
    const secureStoreUser = await SecureStorageHandler.getUserStoredInSecureStore();
    return {
      id: newUserId,
      username: secureStoreUser?.username || initUserName,
      icon: secureStoreUser?.icon || initRandomUserIcon,
      language: secureStoreUser?.language || userLanguage,
      ...(secureStoreUser?.busy ? { busy: secureStoreUser.busy } : {}),
      ...(secureStoreUser?.available ? { available: secureStoreUser.available } : {}),
      ...(secureStoreUser?.birthday ? { birthday: secureStoreUser.birthday } : {}),
    };
  }

  return (
    <UserContext.Provider value={{ user, userLoading: loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

