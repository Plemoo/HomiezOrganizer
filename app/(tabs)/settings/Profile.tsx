import LoadingDots from '@/components/Loading';
import ProfileEdit from '@/components/ProfileEdit';
import ProfileOverview from '@/components/ProfileOverview';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [editMode, setEditMode] = useState(false)
  const { isEditMode } = useLocalSearchParams();
  useEffect(() => {
    if (isEditMode === "true") {
      setEditMode(true);
    }
  }, [isEditMode]);

  if (editMode === true) {
    return (<ProfileEdit returnToOverview={() => { setEditMode(false) }} />)
  } else if (editMode === false) {
    return (<ProfileOverview goToEdit={() => setEditMode(true)} />)
  } else {
    return <LoadingDots visible={true} />
  }
}

export default Profile

