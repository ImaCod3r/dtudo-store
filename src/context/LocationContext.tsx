import { useState, createContext, useEffect, useContext, useCallback, useRef, type ReactNode } from "react";

interface LocationContextType {
  location: GeolocationPosition | null;
  error: string | null;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    // Clear existing watch if any
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const successHandler = (position: GeolocationPosition) => {
      setLocation(position);
      setError(null);
    };

    const errorHandler = (err: GeolocationPositionError) => {
      console.warn("High accuracy error, falling back to low accuracy:", err.message);

      // Se falhar com alta precisão, tenta com baixa precisão (wi-fi/torres)
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        successHandler,
        (finalErr) => setError(finalErr.message),
        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 0
        }
      );
    };

    // Tenta primeiro com alta precisão (GPS)
    watchIdRef.current = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      {
        enableHighAccuracy: true,
        timeout: 30000, // Increased timeout for high accuracy
        maximumAge: 0
      }
    );
  }, []);

  useEffect(() => {
    // Only auto-start if permission is already granted
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          startWatching();
        }
      });
    } else {
      alert("Geolocation is not supported by your browser");
      // Fallback for browsers without permissions API (e.g. old Safari)
      // We choose NOT to auto-start to avoid unwanted prompting, adhering to user request
      // startWatching();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startWatching]);

  return (
    <LocationContext.Provider value={{ location, error, refreshLocation: startWatching }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}