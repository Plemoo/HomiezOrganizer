import { useUser } from '@/components/ProfileInformationContext';
import { useTheme } from '@/components/ThemeContext';
import NetInfo from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// TODO: When the user has no defined name, alsways redirect to the profile page
const Startpage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const {theme} =  useTheme();

  useEffect(() => {
    // Subscribe to connection status updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ? true : false);
      redirectOnStart();
    });

    // Check initial connection status
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ? true : false);
      redirectOnStart();
    });

    return () => {
      unsubscribe();
    };
  }, [router, isConnected]);

    function redirectOnStart() {
      let isUserDefined:boolean = user && user.username?true:false;
      let isRedirect:boolean = false;
      if (!isConnected) { // No internet connection -> No redirect
        isRedirect = false;
      } else if (!isUserDefined) { // No user defined -> Redirect to profile page
        router.replace("/(tabs)/settings/Profile");
        isRedirect = true;
      }else{ // User defined + internet -> redirect to activites
        router.replace("/(tabs)/activities");
        isRedirect = true;
      }
      return isRedirect;
      
    }
  return (
    <View>
      <Text>
        No Internet
        {/* {redirectOnStart() ? "Redirecting" : 'No internet connection.'} */}
      </Text>
    </View>
  );
};

export default Startpage;

const styles = StyleSheet.create({})
