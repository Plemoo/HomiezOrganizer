import { ITheme, IThemeColors, IThemeInput, IThemeSpacing, IThemeTypography } from "../interfaces/LightThemeInterface";
// Dark theme properties

const darkThemeColors: IThemeColors = {
    background: '#080808',
    text: '#FFFFFF',
    textLight: '#080808',
    primary: '#FFFFFF',
    secondary: '#303030',
    muted: '#B8B8B8',
    error: "#ff6b6b", // red
    okay: "#4caf50" // green
}

const darkThemeBorderRadius = {
    small: 8,
    medium: 14,
    large: 20,
    xlarge: 28
}

const darkThemeTypography: IThemeTypography = {
    heading1: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 38,
        color: darkThemeColors.text
    },
    heading2: {
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 28,
        color: darkThemeColors.text
    },
    heading3: {
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 24,
        color: darkThemeColors.text
    },
    body: {
        fontSize: 16,
        fontWeight: "normal",
        lineHeight: 24,
        color: darkThemeColors.text
    }
}

const darkThemeSpacing: IThemeSpacing = {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
}

const darkThemeInput: IThemeInput = {
    backgroundColor: darkThemeColors.background,
    borderRadius: darkThemeBorderRadius.medium,
    borderColor: darkThemeColors.secondary,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: darkThemeSpacing.medium,
    paddingVertical: darkThemeSpacing.small
}

export const darkTheme: ITheme = {
    colors: darkThemeColors,
    typography: darkThemeTypography,
    button: {
        backgroundColor: darkThemeColors.primary,
        borderRadius: darkThemeBorderRadius.xlarge,
        padding: darkThemeSpacing.medium,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52
    },
    buttonText: {
        ...darkThemeTypography.body,
        fontWeight: "bold",
        color: darkThemeColors.textLight,
        letterSpacing: 1
    },
    containers: {
        rootContainer: {
            flex: 1,
            backgroundColor: darkThemeColors.background,
            padding: darkThemeSpacing.medium
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
            backgroundColor: 'rgba(0,0,0,0.7)',
        },
        modalBoxContainer: {
            width: '88%',
            backgroundColor: darkThemeColors.background,
            borderRadius: darkThemeBorderRadius.large,
            padding: darkThemeSpacing.medium
        }
    },
    spacing: darkThemeSpacing,
    input: darkThemeInput,
    borderRadius: darkThemeBorderRadius,
    leftCornerIcon: {
        position: "absolute",
        top: darkThemeSpacing.small,
        left: darkThemeSpacing.small,
        zIndex: 100
    },
    rightCornerIcon: {
        position: "absolute",
        top: darkThemeSpacing.small,
        right: darkThemeSpacing.small,
        zIndex: 100
    }
};
