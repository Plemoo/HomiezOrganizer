import { useUser } from '@/components/ProfileInformationContext';
import NetInfo from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// TODO: When the user has no defined name, alsways redirect to the profile page
const Startpage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Subscribe to connection status updates
    // const unsubscribe = NetInfo.addEventListener(state => {
    //   setIsConnected(state.isConnected ? true : false);
    //   redirectOnStart();
    // });
    if (!loading) {
      // Check initial connection status
      NetInfo.fetch().then(state => {
        redirectOnStart(state.isConnected ? true : false);
      });
    }

    // return () => {
    //   unsubscribe();
    // };
  }, [loading]);

  function redirectOnStart(hasInternet: boolean) {
    let isUserDefined: boolean = user && user.username ? true : false;
    let isRedirect: boolean = false;
    setIsConnected(hasInternet);
    if (!hasInternet) { // No internet connection -> No redirect
      isRedirect = false;
    } else if (!isUserDefined) { // No user defined -> Redirect to profile page
      router.replace("/(tabs)/settings/Profile");
      isRedirect = true;
    } else { // User defined + internet -> redirect to activites
      router.replace("/(tabs)/activities/Activities");
      isRedirect = true;
    }
    return isRedirect;
  }
  // TODO: Hier noch ladebalken solange loading true ist einbauen
  return (
    <View>
      <Text>
        No Internet123
        {/* {redirectOnStart() ? "Redirecting" : 'No internet connection.'} */}
      </Text>
    </View>
  );
};

export default Startpage;

const styles = StyleSheet.create({})
