import * as SecureStore from 'expo-secure-store';
import { IBusyAvailableTimes, ILocalUser } from "../interfaces/ProfileInterface";

  export const overwriteSecureStoreEntry = (entry:(keyof ILocalUser),newAvailableTimes:IBusyAvailableTimes[])=>{
    return SecureStore.setItemAsync(entry, JSON.stringify(newAvailableTimes));
  }
    export const overwriteSecureStore = (entry:(keyof ILocalUser),secureStoreValue:string)=>{
    return SecureStore.setItemAsync(entry, secureStoreValue);
  }