import { Entypo, FontAwesome, FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

type MaterialIconProps = ComponentProps<typeof MaterialIcons>;
type IoniconsProps = ComponentProps<typeof Ionicons>;
type OcticonsIconProps = ComponentProps<typeof Octicons>;
type MaterialCommunityIconProps = ComponentProps<typeof MaterialCommunityIcons>;
type FontAwesomeIconProps = ComponentProps<typeof FontAwesome>;
type FontAwesome6IconProps = ComponentProps<typeof FontAwesome6>;
type EntypoIconProps = ComponentProps<typeof Entypo>;
type FontAwesome5IconProps = ComponentProps<typeof FontAwesome5>;

const useUiIcons = () => {
  return {
    FinishFlagIcon: (props: Partial<FontAwesome5IconProps>) => <FontAwesome5 name="flag-checkered" {...props} />,
    CancelIcon:(props:Partial<MaterialCommunityIconProps>)=><MaterialCommunityIcons name="cancel" {...props} />,
    LinkIcon:(props:Partial<FontAwesome5IconProps>)=><FontAwesome5 name="link" {...props} />,
    ThumbDownIcon:(props:Partial<EntypoIconProps>)=><Entypo name="thumbs-down" {...props}/>,
    ThumbUpIcon:(props:Partial<EntypoIconProps>)=><Entypo name="thumbs-up" {...props}/>,
    HistoryClockIcon: (props:Partial<OcticonsIconProps>)=><Octicons name="history" {...props}/>,
    WarnIcon:(props:Partial<IoniconsProps>)=><Ionicons name="warning-outline" {...props} />,
    ArrowLeftIcon:(props:Partial<FontAwesome6IconProps>)=><FontAwesome6 name="arrow-left" {...props} />,
    CalendarWithOkIcon:(props:Partial<MaterialIconProps>)=><MaterialIcons name="event-available" {...props} />,
    CalendarWithXIcon:(props:Partial<MaterialIconProps>)=><MaterialIcons name="event-busy" {...props} />,
    CalendarWithClockIcon: (props:Partial<MaterialCommunityIconProps>)=><MaterialCommunityIcons name="calendar-clock-outline" {...props} />,
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