import { ITheme, IThemeColors, IThemeInput, IThemeSpacing, IThemeTypography } from "../interfaces/LightThemeInterface";


// Create the Theme Context
const lightThemeColors: IThemeColors = {
    background: '#FFFFFF',
    text: '#0A0A0A',
    textLight: '#FFFFFF',
    primary: '#0A0A0A',
    secondary: '#E8E8E8',
    muted: '#666666',
    error: '#B42318',
    okay: '#137333'
}

const lightThemeBorderRadius = {
    small: 8,
    medium: 14,
    large: 20,
    xlarge: 28
}

const lightThemeTypography: IThemeTypography = {
    heading1: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 38,
        color: lightThemeColors.text
    },
    heading2: {
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 28,
        color: lightThemeColors.text
    },
    heading3: {
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 24,
        color: lightThemeColors.text
    },
    body: {
        fontSize: 16,
        fontWeight: "normal",
        lineHeight: 24,
        color: lightThemeColors.text
    }
}



const lightThemeSpacing: IThemeSpacing = {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
}
const lightThemeInput: IThemeInput = {
    backgroundColor: lightThemeColors.background,
    borderRadius: lightThemeBorderRadius.medium,
    borderColor: lightThemeColors.secondary,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: lightThemeSpacing.medium,
    paddingVertical: lightThemeSpacing.small
}

// Define your themes
export const lightTheme: ITheme = {
    colors: lightThemeColors,
    typography: lightThemeTypography,
    button: {
        backgroundColor: lightThemeColors.primary,
        borderRadius: lightThemeBorderRadius.xlarge,
        padding: lightThemeSpacing.medium,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52
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
            padding: lightThemeSpacing.medium
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
        },
        modalContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: 'rgba(0,0,0,0.4)',
        },
        modalBoxContainer:{
            width: '88%',
            backgroundColor: lightThemeColors.background,
            borderRadius: lightThemeBorderRadius.large,
            padding: lightThemeSpacing.medium
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
