import { BaseToast, ErrorToast } from "react-native-toast-message";
import { Check, X } from "lucide-react-native";

const baseStyle = {
    position: "absolute",
    minWidth: 220,
    maxWidth: 350,
    zIndex: 9999,
};

const toastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{ ...baseStyle, borderLeftColor: "green" }}
            contentContainerStyle={{ paddingHorizontal: 5 }}
            renderLeadingIcon={() => (
                <Check
                    size={24}
                    color="green"
                    style={{ marginLeft: 10, alignSelf: "center" }}
                />
            )}
            text1Style={{
                fontSize: 13,
            }}
            text2Style={{
                fontSize: 12,
            }}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={{ ...baseStyle, borderLeftColor: "red" }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            renderLeadingIcon={() => (
                <X
                    size={24}
                    color="red"
                    style={{ marginLeft: 10, alignSelf: "center" }}
                />
            )}
            text1Style={{
                fontSize: 13,
            }}
            text2Style={{
                fontSize: 12,
            }}
        />
    ),
};

export default toastConfig;
