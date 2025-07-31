import LoadingDots from '@/components/Loading';
import { useUser } from '@/components/ProfileInformationContext';
import { Redirect } from 'expo-router';
import React from 'react';
import "../assets/ts/firebaseConfig";

const Startpage = () => {
  const { user, userLoading } = useUser();

  if (userLoading || !user) { // Loading screen bei keinem Internet oder wenn es geladen wird
    return <LoadingDots visible />
  } else if (user && (!user.username || user.username === "")) { // User is not defined -> Redirect to profile page
    return <Redirect href={{ pathname: "/(tabs)/settings/Profile", params: { isEditMode: "true" } }} />;
  } else {
    return <Redirect href={"/(tabs)/activities/Activities"} />;
  }
};

export default Startpage;
