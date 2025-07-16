import { ITheme, IThemeColors, IThemeInput, IThemeSpacing, IThemeTypography } from "../interfaces/LightThemeInterface";
// Dark theme properties

const darkThemeColors: IThemeColors = {
    background: '#100C08', // lightest
    text: '#FFFFFF', // darkest
    textLight: "#434546", // 2nd lightest
    primary: '#fffafa', // 2nd darkest
    secondary: '#BFBFBF', // in the middle
    error: "#ff6b6b", // red
    okay: "#4caf50" // green
}

const darkThemeBorderRadius = {
    small: 5,
    medium: 10,
    large: 20,
    xlarge: 25
}

const darkThemeTypography: IThemeTypography = {
    heading1: {
        fontSize: 30,
        fontWeight: 'bold',
        lineHeight: 36,
        color: darkThemeColors.text
    },
    heading2: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
        color: darkThemeColors.text
    },
    heading3: {
        fontSize: 20,
        fontWeight: 'normal',
        lineHeight: 28,
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
    backgroundColor: darkThemeColors.secondary,
    borderRadius: darkThemeBorderRadius.large,
    paddingLeft: darkThemeSpacing.small
}

export const darkTheme: ITheme = {
    colors: darkThemeColors,
    typography: darkThemeTypography,
    button: {
        backgroundColor: darkThemeColors.primary,
        borderRadius: darkThemeBorderRadius.xlarge,
        padding: darkThemeSpacing.medium,
        alignItems: "center"
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
            padding: darkThemeSpacing.small
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
            width: '80%',
            backgroundColor: darkThemeColors.textLight,
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