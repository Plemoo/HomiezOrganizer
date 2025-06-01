import { TextStyle, ViewStyle } from "react-native";

export interface ITheme {
    colors: IThemeColors,
    typography: IThemeTypography,
    button: IThemeButton,
    buttonText: IThemeButtonText;
    container: IThemeContainer;
    spacing: IThemeSpacing;
    input: IThemeInput;
    borderRadius: IThemeBorderRadius;
    centeredContainer:IThemeCenteredContainer;
}

interface IThemeCenteredContainer{
    flex:number;
    justifyContent: ViewStyle["justifyContent"];
    alignItems: ViewStyle["alignItems"];
}

export interface IThemeBorderRadius {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
}

interface IThemeInput extends IText {
    backgroundColor: string;
    borderRadius: number;
}

export interface IThemeSpacing {
    small: number,
    medium: number,
    large: number,
    xlarge: number,
}

interface IThemeContainer {
    flex: number;
    backgroundColor: string;
    padding: number;
}

interface IThemeButton {
    backgroundColor: string;
    borderRadius: number;
    padding: number;
    alignItems: ViewStyle["alignItems"];
}

interface IThemeButtonText extends IText {
    color: string;
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