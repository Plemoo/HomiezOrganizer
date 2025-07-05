import ProfileEdit from '@/components/ProfileEdit';
import ProfileOverview from '@/components/ProfileOverview';
import React, { useState } from 'react';


const Profile = () => {
  const [editMode, setEditMode] = useState(false)

  return (
    <>
      {editMode?
      <ProfileEdit returnToOverview={()=>setEditMode(false)}/>
      :
      <ProfileOverview goToEdit={()=>setEditMode(true)}/>
      }
    </>
  )
}

export default Profile

