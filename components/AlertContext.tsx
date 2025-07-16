// AlertContext.tsx
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState
} from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useCustomTheme } from './ThemeContext';

type AlertOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type AlertContextType = {
  showAlert: (opts: AlertOptions) => void;
  hideAlert: () => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be inside AlertProvider');
  return ctx;
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<AlertOptions | null>(null);
  const { theme } = useCustomTheme();

  const showAlert = useCallback((o: AlertOptions) => {
    setOpts(o);
  }, []);

  const hideAlert = useCallback(() => {
    setOpts(null);
  }, []);
  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal visible={!!opts} transparent animationType="fade">
        <View style={theme.containers.modalContainer}>
          <View style={theme.containers.modalBoxContainer}>
            {opts?.title && <Text style={theme.typography.heading2}>{opts.title}</Text>}
            <Text style={theme.typography.body}>{opts?.message}</Text>
            <View style={{flexDirection:"row", justifyContent: 'center', alignContent:"stretch", margin: theme.spacing.medium, gap: theme.spacing.medium}}>
              {opts?.cancelText && (
                <TouchableOpacity
                  style={theme.button}
                  onPress={() => {
                    opts.onCancel?.();
                    hideAlert();
                  }}
                >
                  <Text style={theme.buttonText}>{opts.cancelText}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                 style={theme.button}
                onPress={() => {
                  opts?.onConfirm?.();
                  hideAlert();
                }}
              >
                <Text style={[theme.buttonText, { textAlign:"center", minWidth: "30%" }]}>
                  {opts?.confirmText ?? 'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}