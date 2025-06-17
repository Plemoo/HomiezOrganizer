import { ITheme, IThemeColors, IThemeInput, IThemeSpacing, IThemeTypography } from "../interfaces/LightThemeInterface";


// Create the Theme Context
const lightThemeColors: IThemeColors = {
    background: 'white',
    text: 'black',
    textLight: "#fffafa", // Snow
    primary: '#100c08', // Smoky Black
    secondary: 'lightgray',
    error:"red",
    okay: "green"
}

const lightThemeBorderRadius = {
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
const lightThemeInput: IThemeInput = {
    backgroundColor: lightThemeColors.secondary,
    borderRadius: lightThemeBorderRadius.large,
    paddingLeft: lightThemeSpacing.small
}

// Define your themes
export const lightTheme: ITheme = {
    colors: lightThemeColors,
    typography: lightThemeTypography,
    button: {
        backgroundColor: lightThemeColors.primary,
        borderRadius: lightThemeBorderRadius.xlarge,
        padding: lightThemeSpacing.medium,
        alignItems: "center"
    },
    buttonText: {
        ...lightThemeTypography.body,
        fontWeight: "bold",
        color: lightThemeColors.textLight,
        letterSpacing: 1

    },
    containers: {
        rootContainer: {
            flex: 1,
            backgroundColor: lightThemeColors.background,
            padding: lightThemeSpacing.small
        },
        leftAlignedContainer: {
            flex: 1,
            justifyContent: "flex-start"
        },
        centeredContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
        },
        headingWithIconContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
        }
    },
    spacing: lightThemeSpacing,
    input: lightThemeInput,
    borderRadius: lightThemeBorderRadius,
    leftCornerIcon: {
        position: "absolute",
        top: lightThemeSpacing.small,
        left: lightThemeSpacing.small,
        zIndex: 100
    },
    rightCornerIcon: {
        position: "absolute",
        top: lightThemeSpacing.small,
        right: lightThemeSpacing.small,
        zIndex: 100
    }
};