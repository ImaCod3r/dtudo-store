import React, { createContext, useContext, useState, useCallback } from 'react';
import Alert from '../components/Alert';

interface AlertData {
    id: string;
    message: string;
    type: 'success' | 'error';
}

interface AlertContextType {
    showAlert: (message: string, type: 'success' | 'error') => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [alerts, setAlerts] = useState<AlertData[]>([]);

    const removeAlert = useCallback((id: string) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, []);

    const showAlert = useCallback((message: string, type: 'success' | 'error') => {
        const id = `${Date.now()}-${Math.random()}`;
        setAlerts((prev) => [...prev, { id, message, type }]);
    }, []);

    const showSuccess = useCallback((message: string) => {
        showAlert(message, 'success');
    }, [showAlert]);

    const showError = useCallback((message: string) => {
        showAlert(message, 'error');
    }, [showAlert]);

    return (
        <AlertContext.Provider value={{ showAlert, showSuccess, showError }}>
            {children}

            {/* Alert Container */}
            <div
                className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none"
                aria-live="polite"
                aria-atomic="true"
            >
                {alerts.map((alert) => (
                    <div key={alert.id} className="pointer-events-auto">
                        <Alert
                            id={alert.id}
                            message={alert.message}
                            type={alert.type}
                            onClose={removeAlert}
                        />
                    </div>
                ))}
            </div>
        </AlertContext.Provider>
    );
}

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
};
