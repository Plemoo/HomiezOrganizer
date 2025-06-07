
// Import all avatar SVGs
import { ImageSource } from "expo-image";
import Avatar1 from "../images/avatars/avatar1.svg";
import Avatar10 from "../images/avatars/avatar10.svg";
import Avatar11 from "../images/avatars/avatar11.svg";
import Avatar12 from "../images/avatars/avatar12.svg";
import Avatar13 from "../images/avatars/avatar13.svg";
import Avatar14 from "../images/avatars/avatar14.svg";
import Avatar15 from "../images/avatars/avatar15.svg";
import Avatar16 from "../images/avatars/avatar16.svg";
import Avatar17 from "../images/avatars/avatar17.svg";
import Avatar18 from "../images/avatars/avatar18.svg";
import Avatar19 from "../images/avatars/avatar19.svg";
import Avatar2 from "../images/avatars/avatar2.svg";
import Avatar20 from "../images/avatars/avatar20.svg";
import Avatar21 from "../images/avatars/avatar21.svg";
import Avatar22 from "../images/avatars/avatar22.svg";
import Avatar23 from "../images/avatars/avatar23.svg";
import Avatar3 from "../images/avatars/avatar3.svg";
import Avatar4 from "../images/avatars/avatar4.svg";
import Avatar5 from "../images/avatars/avatar5.svg";
import Avatar6 from "../images/avatars/avatar6.svg";
import Avatar7 from "../images/avatars/avatar7.svg";
import Avatar8 from "../images/avatars/avatar8.svg";
import Avatar9 from "../images/avatars/avatar9.svg";



const useAvatarIcons = () => {

  const avatars: Record<string, ImageSource> = {
    avatar1: Avatar1,
    avatar2: Avatar2,
    avatar3: Avatar3,
    avatar4: Avatar4,
    avatar5: Avatar5,
    avatar6: Avatar6,
    avatar7: Avatar7,
    avatar8: Avatar8,
    avatar9: Avatar9,
    avatar10: Avatar10,
    avatar11: Avatar11,
    avatar12: Avatar12,
    avatar13: Avatar13,
    avatar14: Avatar14,
    avatar15: Avatar15,
    avatar16: Avatar16,
    avatar17: Avatar17,
    avatar18: Avatar18,
    avatar19: Avatar19,
    avatar20: Avatar20,
    avatar21: Avatar21,
    avatar22: Avatar22,
    avatar23: Avatar23,
  };

  const getRandomAvatarKey = () => {
    const keys = Object.keys(avatars);
    return keys[Math.floor(Math.random() * keys.length)];
  }
  return { avatars, getRandomAvatarKey };
};




export default useAvatarIcons;

