import { ITheme, IThemeColors, IThemeSpacing, IThemeTypography } from "../interfaces/LightThemeInterface";


// Create the Theme Context
const lightThemeColors: IThemeColors = {
    background: 'white',
    text: 'black',
    textLight: "#fffafa", // Snow
    primary: '#100c08', // Smoky Black
    secondary: 'lightgray'
}

const lightThemeBorderRadius={
    small: 5,
    medium: 10,
    large: 20,
    xlarge: 25
}

const lightThemeTypography: IThemeTypography = {
    heading1: {
        fontSize: 30,
        fontWeight: 'bold',
        lineHeight: 36
    },
    heading2: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32
    },
    heading3: {
        fontSize: 20,
        fontWeight: 'normal',
        lineHeight: 28
    },
    body: {
        fontSize: 16,
        fontWeight: "normal",
        lineHeight: 24
    }
}
const lightThemeSpacing: IThemeSpacing = {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
}

// Define your themes
export const lightTheme: ITheme = {
    colors: lightThemeColors,
    typography: lightThemeTypography,
    button: {
        backgroundColor: lightThemeColors.primary,
        borderRadius: lightThemeBorderRadius.xlarge,
        padding: lightThemeSpacing.medium,
        alignItems:"center"
    },
    buttonText: {
        ...lightThemeTypography.body,
        fontWeight:"bold",
        color: lightThemeColors.textLight
    },
    container: {
        flex: 1,
        backgroundColor: lightThemeColors.background,
        padding: lightThemeSpacing.small
    },
    spacing:lightThemeSpacing,
    input:{
        backgroundColor:lightThemeColors.secondary,
        borderRadius:lightThemeBorderRadius.large,
        ...lightThemeTypography.body
    },
    borderRadius:lightThemeBorderRadius,
    centeredContainer:{
        flex:1,
        justifyContent:"center",
        alignItems:"center"
    }

};