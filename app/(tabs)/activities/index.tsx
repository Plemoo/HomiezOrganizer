import { useUser } from '@/components/ProfileInformationContext';
import { useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const options = {
  title:"asdf"
}
const Activities = () => {
    const { user } = useUser();
    const navigation = useNavigation();
    useLayoutEffect(() => {
      navigation.setOptions({title:"Test"})
    })
  return (
    <View>
      <Text>Activitie123s {user?.name} TEST</Text>
    </View>
  )
}

export default Activities
// Optionen für diesen Tab

const styles = StyleSheet.create({})