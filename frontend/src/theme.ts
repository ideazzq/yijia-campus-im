import {createTheme} from "@mui/material/styles";

const primaryBlue = "#1170ee";
const primaryBlueDark = "#0a4fae";
const accentGreen = "#16a56a";
const accentGreenLight = "#e6f8f0";
const borderTone = "#b9d9ff";

export const appTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: primaryBlue,
            dark: primaryBlueDark,
            light: "#5aa0ff",
            contrastText: "#ffffff",
        },
        secondary: {
            main: accentGreen,
            dark: "#0f7a4e",
            light: accentGreenLight,
            contrastText: "#ffffff",
        },
        success: {
            main: accentGreen,
            dark: "#0f7a4e",
            light: accentGreenLight,
            contrastText: "#ffffff",
        },
        info: {
            main: "#22a2f2",
            dark: "#0f6cc9",
            light: "#dff4ff",
            contrastText: "#ffffff",
        },
        warning: {
            main: "#1c8f75",
            dark: "#0f6a56",
            light: "#ddf7ef",
            contrastText: "#ffffff",
        },
        background: {
            default: "#f2fbff",
            paper: "#ffffff",
        },
        text: {
            primary: "#12314d",
            secondary: "#51708a",
        },
        divider: "#d2e8fb",
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "#f2fbff",
                    color: "#12314d",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                },
                containedPrimary: {
                    background: `linear-gradient(135deg, ${primaryBlue} 0%, ${accentGreen} 100%)`,
                    boxShadow: "0 16px 32px rgba(17, 112, 238, 0.22)",
                },
                outlinedPrimary: {
                    borderColor: borderTone,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                outlinedPrimary: {
                    borderColor: borderTone,
                },
                colorSuccess: {
                    backgroundColor: accentGreen,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                color: "primary",
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: "#fbfeff",
                    borderRadius: 18,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#84c0ff",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: primaryBlue,
                        boxShadow: "0 0 0 4px rgba(17, 112, 238, 0.10)",
                    },
                },
                notchedOutline: {
                    borderColor: "#d2e8fb",
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "#5d7992",
                    "&.Mui-focused": {
                        color: primaryBlue,
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                standardSuccess: {
                    backgroundColor: accentGreenLight,
                    color: "#0f6f48",
                },
                filledSuccess: {
                    backgroundColor: accentGreen,
                },
            },
        },
    },
});
