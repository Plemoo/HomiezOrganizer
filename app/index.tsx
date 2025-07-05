import LoadingDots from '@/components/Loading';
import { useUser } from '@/components/ProfileInformationContext';
import NetInfo from '@react-native-community/netinfo';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import "../assets/ts/firebaseConfig";

const Startpage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { user, userLoading: loading } = useUser();

  useEffect(() => {
    if (!loading) {
      // Check initial connection status
      NetInfo.fetch().then(state => {
        setIsConnected(state.isConnected ? true : false);
        // redirectOnStart(state.isConnected ? true : false);
      });
    }
  }, [loading]);


  // function redirectOnStart(hasInternet: boolean) {
  //   let isUserDefined: boolean = user && user.username ? true : false;
  //   let isRedirect: boolean = false;
  //   setIsConnected(hasInternet);
  //   if (!hasInternet) { // No internet connection -> No redirect
  //     isRedirect = false;
  //   } else if (!isUserDefined) { // No user defined -> Redirect to profile page
  //     router.replace("/(tabs)/settings/Profile");
  //     isRedirect = true;
  //   } else { // User defined + internet -> redirect to activites
  //     router.replace("/(tabs)/activities/Activities");
  //     isRedirect = true;
  //   }
  //   return isRedirect;
  // }

  if (loading || !isConnected || !user) { // Loading screen bei keinem Internet oder wenn es geladen wird
    return <LoadingDots visible />
  } else if (user && !user.username) {
    return <Redirect href={"/(tabs)/settings/Profile"} />;
  } else {
    return <Redirect href={"/(tabs)/activities/Activities"} />;
  }
};

export default Startpage;
