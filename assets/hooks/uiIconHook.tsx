import { FontAwesome, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

type MaterialIconProps = ComponentProps<typeof MaterialIcons>;
type IoniconsProps = ComponentProps<typeof Ionicons>;
type OcticonsIconProps = ComponentProps<typeof Octicons>;
type MaterialCommunityIconProps = ComponentProps<typeof MaterialCommunityIcons>;
type FontAwesomeIconProps = ComponentProps<typeof FontAwesome>;
type FontAwesome6IconProps = ComponentProps<typeof FontAwesome6>;

const useUiIcons = () => {
  return {
    ArrowLeftIcon:(props:Partial<FontAwesome6IconProps>)=><FontAwesome6 name="arrow-left" {...props} />,
    CalendarWithOkIcon:(props:Partial<MaterialIconProps>)=><MaterialIcons name="event-available" {...props} />,
    CalendarWithXIcon:(props:Partial<MaterialIconProps>)=><MaterialIcons name="event-busy" {...props} />,
    RemoveIcon:(props:Partial<FontAwesomeIconProps>)=><FontAwesome name="remove" {...props} />,
    CalendarIcon: (props:Partial<MaterialCommunityIconProps>)=><MaterialCommunityIcons name="calendar-account-outline" {...props} />,
    NotificationIcon: (props:Partial<IoniconsProps>)=> <Ionicons name="notifications-outline" {...props} />,
    HumanIcon: (props:Partial<OcticonsIconProps>)=> <Octicons name="person" {...props} />,
    InfoIcon: (props:Partial<OcticonsIconProps>)=> <Octicons name="info" {...props} />,
    EditIcon: (props:Partial<MaterialIconProps>)=> <MaterialIcons name="edit" {...props} />,
    PlusIcon: (props:Partial<IoniconsProps>)=> <Ionicons name="add-sharp" {...props} />,//<MaterialIcons name="add" {...props} />,
    RightPointerIcon: (props:Partial<MaterialIconProps>)=> <MaterialIcons name="keyboard-arrow-right" {...props} />,
  };

};

export default useUiIcons;