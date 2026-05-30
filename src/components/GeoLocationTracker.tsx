"use client";

import { useEffect, useRef } from "react";

export function GeoLocationTracker() {
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const sendPosition = async (pos: GeolocationPosition) => {
      try {
        await fetch("/api/tracking/waypoints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            timestamp: new Date(pos.timestamp).toISOString(),
          }),
        });
      } catch {
        // silent
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        lastPositionRef.current = pos;
      },
      () => {
        // permission denied — ignore
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    intervalRef.current = setInterval(() => {
      if (lastPositionRef.current) {
        sendPosition(lastPositionRef.current);
      }
    }, 10000);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null;
}
