import useAvatarIcons from '@/assets/hooks/iconGatheringHook';
import { ILocalUser } from '@/assets/interfaces/ProfileInterface';
import { SecureStorageHandler } from '@/assets/ts/asyncStorage';
import { getFirebaseUserUid, overwriteFirebaseUser } from '@/assets/ts/firebaseExchange';
import { getDefaultLanguage } from '@/assets/ts/i18next';
import * as SecureStore from 'expo-secure-store';
import i18next, { changeLanguage } from 'i18next';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserContextType {
  user: ILocalUser;
  // setUser: React.Dispatch<React.SetStateAction<ILocalUser>>;
  setUserIncludingLocalStorageAndFirebase: (userData: ILocalUser) => void;
  makeSureUserIsLoggedIn: (userData: ILocalUser) => Promise<ILocalUser>;
  loading: boolean
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getRandomAvatarKey} = useAvatarIcons()
  const [user, setUser] = useState<ILocalUser>({ id: "", icon: getRandomAvatarKey(), language: getDefaultLanguage() });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let userUuidKey: keyof ILocalUser = "id";
    SecureStore.getItemAsync(userUuidKey)//
      .then(async (userUuid) => {
        if (userUuid == null) { // No User found in local storage, create new one
          setUserIncludingLocalStorageAndFirebase({ ...user }).finally(() => setLoading(false))
        } else {
          // Async Storage has user id stored
          setExistingUserInContext().finally(() => setLoading(false));
        }
      });
  }, []);



  // TODO: Test hierfür schreiben
  const setUserIncludingLocalStorageAndFirebase = (newUser: ILocalUser): Promise<void | [(keyof ILocalUser)[], void]> => {
    return getFirebaseUserUid().then((fUid) => {
      return updateUserInSecureStoreFirebaseAndContext({ ...newUser, id: fUid })
    }).catch((error) => console.error("Firebase UID retrieval error:", error))
  }

  const updateUserInSecureStoreFirebaseAndContext = (newUser: ILocalUser) => {
    setUser(newUser); // Update the context state for the user
    return Promise.all([SecureStorageHandler.updateSecureStore(newUser), overwriteFirebaseUser(newUser)]);
  }

  // TODO: Test schreiben
  const makeSureUserIsLoggedIn = (asyncStoreUser: ILocalUser): Promise<ILocalUser> => {
    return getFirebaseUserUid().then((firestoreUserId) => {
      if (firestoreUserId === asyncStoreUser.id) {
        // all ok, User still logged in
        return asyncStoreUser
      } else {
        // User Session interrupted, create new user in firebase and sync with securestore user
        let newUser = { ...asyncStoreUser }
        newUser.id = firestoreUserId;
        return updateUserInSecureStoreFirebaseAndContext(newUser)//
          .catch((err) => {
            throw new Error("ERROR", err)
          })
          .then(() => newUser)
      }
    })
  }

  // TODO: Test hierfür schreiben
  function setExistingUserInContext() {
    return Promise.all([SecureStorageHandler.getUserStoredInSecureStore(), getFirebaseUserUid()]) //
      .then(([secureStoreUser, firebaseUid]) => {
        if (secureStoreUser != null && secureStoreUser.id === firebaseUid) { // ID in secure store and firebase match -> User Session is valid
          setUser(secureStoreUser);
        } else if (secureStoreUser == null) { // New user session + no user stored in secure store
          updateUserInSecureStoreFirebaseAndContext({ ...user, id: firebaseUid }); // No Userinfo anywhere, setup blank user
        } else if (secureStoreUser != null) { // New user session, secure store uid has to be updated and new firebase User entry has to be created
          // TODO: Testen ob es wirklich funktioniert, wenn der Secure Storage noch eine alte User ID hat (Testbar nach jedem neuen Aufsetzen der Testumgebung)
          let secureStoreUserWithNewFirebaseUid: ILocalUser = { ...secureStoreUser, id: firebaseUid };
          secureStoreUserWithNewFirebaseUid.groupUuids = []; // reset Groups because user no longer has accesss to these groups
          updateUserInSecureStoreFirebaseAndContext(secureStoreUserWithNewFirebaseUid);
        } else {
          throw new Error("ProfileInformationContext.tsx: Error FirebaseID:" + firebaseUid, secureStoreUser)
        }
        if (secureStoreUser != null && secureStoreUser.language !== i18next.language) {
          changeLanguage(secureStoreUser.language);
        }
        return secureStoreUser;
      }).catch((error) => console.error("Error during firebase user retrieval and secure store retrieval", error)) //
  }

  return (
    <UserContext.Provider value={{ user, loading, setUserIncludingLocalStorageAndFirebase, makeSureUserIsLoggedIn }}>
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




