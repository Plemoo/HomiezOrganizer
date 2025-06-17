import { TextStyle, ViewStyle } from "react-native";

export interface ITheme {
    colors: IThemeColors,
    typography: IThemeTypography,
    button: IThemeButton,
    buttonText: IThemeButtonText;
    containers: IThemeContainer;
    spacing: IThemeSpacing;
    input: IThemeInput;
    borderRadius: IThemeBorderRadius;
    leftCornerIcon: IThemeLeftCornerIcon;
    rightCornerIcon: IThemeRightCornerIcon;
}


interface IThemeLeftCornerIcon extends IThemeTopCornerIcon{
    left: number;
}

interface IThemeRightCornerIcon extends IThemeTopCornerIcon{
    right: number;
}

interface IThemeTopCornerIcon{
    position: ViewStyle["position"];
    top: number;
    zIndex: number;
}

interface IThemeContainer {
    rootContainer: IThemeRootContainer;
    leftAlignedContainer: IThemeAlignedContainer;
    centeredContainer: IThemeAlignedContainer;
    headingWithIconContainer:IThemeHeadingWithIconContainer;
}


export interface IThemeBorderRadius {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
}

export interface IThemeInput {
    backgroundColor: string;
    borderRadius: number;
    paddingLeft:number;
}

export interface IThemeSpacing {
    small: number,
    medium: number,
    large: number,
    xlarge: number,
}

interface IThemeRootContainer {
    flex: number;
    backgroundColor: string;
    padding: number;
}

interface IThemeAlignedContainer {
    flex: number;
    justifyContent: ViewStyle["justifyContent"];
    alignItems?: ViewStyle["alignItems"];
}

interface IThemeHeadingWithIconContainer{
    flexDirection: ViewStyle["flexDirection"],
    justifyContent: ViewStyle["justifyContent"];
    alignItems?: ViewStyle["alignItems"];
}

interface IThemeButton {
    backgroundColor: string;
    borderRadius: number;
    padding: number;
    alignItems: ViewStyle["alignItems"];
}

interface IThemeButtonText extends IText {
    color: string;
    letterSpacing: number;
}

export interface IThemeTypography {
    heading1: IText;
    heading2: IText;
    heading3: IText;
    body: IText;
}

export interface IThemeColors {
    background: string;
    text: string;
    textLight: string;
    primary: string;
    secondary: string;
    okay:string;
    error:string
}

interface IText {
    fontSize: number;
    fontWeight: TextStyle["fontWeight"];
    lineHeight: number
}

// Define the shape of the context
export interface IThemeContextType {
    theme: ITheme;
}