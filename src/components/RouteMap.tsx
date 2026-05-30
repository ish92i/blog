"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  FileText,
  Film,
  Layers,
  LocateFixed,
  MapPin,
  Navigation,
  Route,
} from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Waypoint {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface LinkedContent {
  type: "post" | "video";
  id: string;
  title: string;
  slug: string;
}

interface Poi {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string | null;
  postId: string | null;
  videoId: string | null;
  label: string | null;
  linked: LinkedContent | null;
}

type ContentFilter = "all" | "post" | "video";

interface PoiGroup {
  id: string;
  latitude: number;
  longitude: number;
  pois: Poi[];
}

type Coordinate = { latitude: number; longitude: number };

type RouteFeature = {
  type: "Feature";
  properties: Record<string, never>;
  geometry: {
    type: "LineString";
    coordinates: number[][];
  };
};

const ROUTE_COLOR = "#e23d3a";
const ROUTE_SHADOW = "#263244";
const ROUTE_RAW_COLOR = "#111827";
const MAP_SURFACE = "#fffaf0";
const POST_COLOR = "#e23d3a";
const VIDEO_COLOR = "#4f66d8";
const START_COLOR = "#16a34a";
const FINISH_COLOR = "#2563eb";
const POI_GROUP_DISTANCE_METERS = 90;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceBetween(a: Coordinate, b: Coordinate) {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(b.latitude - a.latitude);
  const lonDelta = toRadians(b.longitude - a.longitude);
  const latA = toRadians(a.latitude);
  const latB = toRadians(b.latitude);
  const hav =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(lonDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`;
}

function formatDuration(start?: string, end?: string) {
  if (!start || !end) return "0 min";

  const minutes = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 60000));
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

function formatDate(value: string | null) {
  if (!value) return "Date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function contentHref(linked: LinkedContent) {
  return `/${linked.type === "post" ? "post" : "video"}/${linked.slug}`;
}

function routeFeature(coordinates: number[][]): RouteFeature {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates },
  };
}

function routeCollection(feature: RouteFeature) {
  return {
    type: "FeatureCollection" as const,
    features: [feature],
  };
}

function groupPois(pois: Poi[]) {
  const groups: PoiGroup[] = [];

  pois.forEach(poi => {
    const group = groups.find(candidate => {
      return distanceBetween(candidate, poi) * 1000 <= POI_GROUP_DISTANCE_METERS;
    });

    if (group) {
      group.pois.push(poi);
      const size = group.pois.length;
      group.latitude = (group.latitude * (size - 1) + poi.latitude) / size;
      group.longitude = (group.longitude * (size - 1) + poi.longitude) / size;
      group.id = `${group.latitude.toFixed(5)},${group.longitude.toFixed(5)}`;
      return;
    }

    groups.push({
      id: `${poi.latitude.toFixed(5)},${poi.longitude.toFixed(5)}`,
      latitude: poi.latitude,
      longitude: poi.longitude,
      pois: [poi],
    });
  });

  return groups;
}

function groupColor(group: PoiGroup) {
  const hasPosts = group.pois.some(poi => poi.linked?.type === "post");
  const hasVideos = group.pois.some(poi => poi.linked?.type === "video");

  if (hasPosts && hasVideos) return ROUTE_SHADOW;
  return hasVideos ? VIDEO_COLOR : POST_COLOR;
}

function groupLabel(group: PoiGroup) {
  if (group.pois.length > 1) return String(group.pois.length);
  return group.pois[0]?.linked?.type === "video" ? "V" : "A";
}

function makeMarker(label: string, color: string, size = 34) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "route-map-marker maplibregl-marker maplibregl-marker-anchor-center";
  el.style.cssText = [
    "display:flex",
    "align-items:center",
    "justify-content:center",
    `width:${size}px`,
    `height:${size}px`,
    "border-radius:999px",
    `border:2px solid ${MAP_SURFACE}`,
    `background:${color}`,
    `color:${MAP_SURFACE}`,
    "font-size:12px",
    "font-weight:750",
    "letter-spacing:0",
    "box-shadow:0 14px 30px rgb(17 24 39 / 0.24), 0 2px 8px rgb(17 24 39 / 0.18)",
    "cursor:pointer",
    "transition:box-shadow 180ms cubic-bezier(.22,1,.36,1), filter 180ms cubic-bezier(.22,1,.36,1)",
  ].join(";");
  el.textContent = label;
  el.setAttribute("aria-label", label);
  el.addEventListener("mouseenter", () => {
    el.style.filter = "brightness(0.96)";
    el.style.boxShadow = "0 18px 34px rgb(17 24 39 / 0.28), 0 4px 12px rgb(17 24 39 / 0.18)";
  });
  el.addEventListener("mouseleave", () => {
    el.style.filter = "";
    el.style.boxShadow = "0 14px 30px rgb(17 24 39 / 0.24), 0 2px 8px rgb(17 24 39 / 0.18)";
  });

  return el;
}

function openMarker(marker: maplibregl.Marker, map: maplibregl.Map, group: PoiGroup) {
  marker.togglePopup();
  map.easeTo({
    center: [group.longitude, group.latitude],
    duration: 450,
    essential: true,
  });
}

function makePopup(group: PoiGroup) {
  const root = document.createElement("div");
  root.className = "w-[min(78vw,320px)] p-1 font-sans";

  const eyebrow = document.createElement("p");
  eyebrow.className = "mb-2 px-1 text-[11px] font-semibold uppercase tracking-normal text-zinc-500";
  eyebrow.textContent = `${group.pois.length} contenu${group.pois.length > 1 ? "s" : ""} à cette position`;

  const list = document.createElement("div");
  list.className = "flex snap-x gap-2 overflow-x-auto overscroll-x-contain pb-1";

  group.pois.forEach(poi => {
    const linked = poi.linked;
    if (!linked) return;

    const link = document.createElement("a");
    link.href = contentHref(linked);
    link.className = "group flex min-w-[calc(100%-12px)] max-w-[calc(100%-12px)] snap-start items-start gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-2.5 text-zinc-950 shadow-sm hover:bg-zinc-100";

    const badge = document.createElement("span");
    badge.className = "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-950 text-[10px] font-semibold text-zinc-50";
    badge.textContent = linked.type === "video" ? "V" : "A";

    const text = document.createElement("span");
    text.className = "min-w-0 flex-1 overflow-hidden";

    const title = document.createElement("span");
    title.className = "block whitespace-normal break-words text-sm font-semibold leading-snug [overflow-wrap:anywhere]";
    title.textContent = linked.title;

    const meta = document.createElement("span");
    meta.className = "mt-1 block text-xs text-zinc-500";
    meta.textContent = linked.type === "video" ? "Voir la vidéo" : "Lire l'article";

    const arrow = document.createElement("span");
    arrow.textContent = "↗";
    arrow.className = "mt-0.5 shrink-0 text-xs text-zinc-500";
    arrow.setAttribute("aria-hidden", "true");

    text.append(title, meta);
    link.append(badge, text, arrow);
    list.append(link);
  });

  root.append(eyebrow, list);

  return root;
}

function buildBounds(items: Array<{ longitude: number; latitude: number }>) {
  if (!items.length) return null;

  const bounds = new maplibregl.LngLatBounds();
  items.forEach(item => bounds.extend([item.longitude, item.latitude]));
  return bounds;
}

function coordinatesToPath(map: maplibregl.Map | null, coordinates: number[][]) {
  if (!map || coordinates.length < 2) return "";

  return coordinates
    .map((coordinate, index) => {
      const point = map.project([coordinate[0], coordinate[1]]);
      return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ");
}

async function getMatchedRoute(waypoints: Waypoint[]) {
  const coordsStr = waypoints.map(point => `${point.longitude},${point.latitude}`).join(";");
  const matchResponse = await fetch(
    `https://router.project-osrm.org/match/v1/driving/${coordsStr}?geometries=geojson&overview=full`
  );
  const matchData = await matchResponse.json();

  if (matchData.code === "Ok" && Array.isArray(matchData.matchings) && matchData.matchings.length) {
    const merged: number[][] = [];
    matchData.matchings.forEach((matching: { geometry?: { coordinates?: number[][] } }) => {
      matching.geometry?.coordinates?.forEach(coordinate => merged.push(coordinate));
    });

    if (merged.length) return merged;
  }

  const routeResponse = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coordsStr}?geometries=geojson&overview=full&continue_straight=false`
  );
  const routeData = await routeResponse.json();
  const routeCoordinates = routeData.routes?.[0]?.geometry?.coordinates;

  if (routeData.code === "Ok" && Array.isArray(routeCoordinates) && routeCoordinates.length) {
    return routeCoordinates as number[][];
  }

  return null;
}

export function RouteMap({ waypoints, pois }: { waypoints: Waypoint[]; pois: Poi[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [routeStatus, setRouteStatus] = useState<"idle" | "matching" | "matched" | "fallback">("idle");
  const [routeCoordinates, setRouteCoordinates] = useState<number[][]>([]);
  const [routePath, setRoutePath] = useState("");
  const [activeFilter, setActiveFilter] = useState<ContentFilter>("all");
  const [statsOpen, setStatsOpen] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);

  const routeStats = useMemo(() => {
    const distanceKm = waypoints.reduce((total, point, index) => {
      if (index === 0) return total;
      return total + distanceBetween(waypoints[index - 1], point);
    }, 0);

    return {
      distance: formatDistance(distanceKm),
      duration: formatDuration(waypoints[0]?.timestamp, waypoints[waypoints.length - 1]?.timestamp),
      points: waypoints.length,
    };
  }, [waypoints]);

  const linkedPois = useMemo(() => pois.filter(poi => poi.linked), [pois]);

  const filteredPois = useMemo(() => {
    if (activeFilter === "all") return linkedPois;
    return linkedPois.filter(poi => poi.linked?.type === activeFilter);
  }, [activeFilter, linkedPois]);

  const poiGroups = useMemo(() => groupPois(filteredPois), [filteredPois]);

  const fitRoute = () => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = buildBounds([...waypoints, ...poiGroups]);
    if (bounds) {
      map.fitBounds(bounds, { padding: 92, maxZoom: 13, duration: 650 });
      return;
    }

    map.flyTo({ center: [0, 48.8], zoom: 5, duration: 650 });
  };

  const focusGroup = (group: PoiGroup) => {
    mapRef.current?.flyTo({
      center: [group.longitude, group.latitude],
      zoom: 13,
      duration: 650,
      essential: true,
    });
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [0, 48.8],
      zoom: 5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), "bottom-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: "OpenStreetMap" }),
      "bottom-left"
    );

    map.on("load", async () => {
      setMapReady(true);

      if (waypoints.length < 2) {
        setRouteStatus("fallback");
        return;
      }

      const coordinates = waypoints.map(point => [point.longitude, point.latitude]);
      setRouteCoordinates(coordinates);
      setRoutePath(coordinatesToPath(map, coordinates));
      const rawRouteFeature = routeFeature(coordinates);
      const roadRouteFeature = routeFeature(coordinates);
      const rawRouteCollection = routeCollection(rawRouteFeature);
      const roadRouteCollection = routeCollection(roadRouteFeature);

      map.addSource("route-shadow", {
        type: "geojson",
        data: roadRouteCollection,
      });
      map.addLayer({
        id: "route-shadow",
        type: "line",
        source: "route-shadow",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": ROUTE_SHADOW, "line-width": 13, "line-opacity": 0.38 },
      });

      map.addSource("route-raw", {
        type: "geojson",
        data: rawRouteCollection,
      });
      map.addLayer({
        id: "route-raw",
        type: "line",
        source: "route-raw",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": ROUTE_RAW_COLOR,
          "line-width": 4,
          "line-opacity": 0.48,
          "line-dasharray": [1.2, 1.4],
        },
      });

      map.addSource("route", {
        type: "geojson",
        data: roadRouteCollection,
      });
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": ROUTE_COLOR, "line-width": 7, "line-opacity": 0.98 },
      });

      map.addSource("waypoints-dots", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: waypoints.map(point => ({
            type: "Feature",
            properties: {},
            geometry: { type: "Point" as const, coordinates: [point.longitude, point.latitude] },
          })),
        },
      });
      map.addLayer({
        id: "waypoints-dots",
        type: "circle",
        source: "waypoints-dots",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 2, 12, 4],
          "circle-color": ROUTE_COLOR,
          "circle-opacity": 0.62,
          "circle-stroke-width": 1,
          "circle-stroke-color": MAP_SURFACE,
        },
      });

      const bounds = buildBounds(waypoints);
      if (bounds) map.fitBounds(bounds, { padding: 92, maxZoom: 12, duration: 0 });

      setRouteStatus("matching");
      try {
        const matchedCoordinates = await getMatchedRoute(waypoints);

        if (matchedCoordinates) {
          roadRouteFeature.geometry.coordinates = matchedCoordinates;
          const collection = routeCollection(roadRouteFeature);
          (map.getSource("route") as maplibregl.GeoJSONSource | undefined)?.setData(collection);
          (map.getSource("route-shadow") as maplibregl.GeoJSONSource | undefined)?.setData(collection);
          map.setPaintProperty("route-raw", "line-opacity", 0.22);
          setRouteCoordinates(matchedCoordinates);
          setRoutePath(coordinatesToPath(map, matchedCoordinates));
          setRouteStatus("matched");
          return;
        }

        setRouteStatus("fallback");
      } catch {
        setRouteStatus("fallback");
      }
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapReady(false);
      setRouteCoordinates([]);
      setRoutePath("");
    };
  }, [waypoints]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || routeCoordinates.length < 2) return;

    const updatePath = () => setRoutePath(coordinatesToPath(map, routeCoordinates));
    updatePath();

    map.on("move", updatePath);
    map.on("zoom", updatePath);
    map.on("resize", updatePath);

    return () => {
      map.off("move", updatePath);
      map.off("zoom", updatePath);
      map.off("resize", updatePath);
    };
  }, [mapReady, routeCoordinates]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (waypoints.length > 0) {
      const first = waypoints[0];
      const last = waypoints[waypoints.length - 1];

      markersRef.current.push(
        new maplibregl.Marker({ element: makeMarker("D", START_COLOR, 30) })
          .setLngLat([first.longitude, first.latitude])
          .setPopup(new maplibregl.Popup({ offset: 24 }).setText("Départ"))
          .addTo(map)
      );

      if (last.id !== first.id) {
        markersRef.current.push(
          new maplibregl.Marker({ element: makeMarker("A", FINISH_COLOR, 30) })
            .setLngLat([last.longitude, last.latitude])
            .setPopup(new maplibregl.Popup({ offset: 24 }).setText("Arrivée"))
            .addTo(map)
        );
      }
    }

    poiGroups.forEach(group => {
      const element = makeMarker(groupLabel(group), groupColor(group), group.pois.length > 1 ? 40 : 36);
      const marker = new maplibregl.Marker({ element })
        .setLngLat([group.longitude, group.latitude])
        .setPopup(new maplibregl.Popup({ offset: 26, closeButton: true, maxWidth: "340px" }).setDOMContent(makePopup(group)))
        .addTo(map);

      element.addEventListener("click", event => {
        event.stopPropagation();
        openMarker(marker, map, group);
      });

      markersRef.current.push(marker);
    });
  }, [mapReady, poiGroups, waypoints]);

  const filters: Array<{ value: ContentFilter; label: string; count: number }> = [
    { value: "all", label: "Tout", count: linkedPois.length },
    { value: "post", label: "Articles", count: linkedPois.filter(poi => poi.linked?.type === "post").length },
    { value: "video", label: "Vidéos", count: linkedPois.filter(poi => poi.linked?.type === "video").length },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-100">
      <div ref={mapContainer} className="h-full w-full" />

      <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full" aria-hidden="true">
        {routePath && (
          <>
            <path
              d={routePath}
              fill="none"
              stroke="rgb(17 24 39 / 0.55)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="12"
            />
            <path
              d={routePath}
              fill="none"
              stroke={ROUTE_COLOR}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="6"
            />
          </>
        )}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3 sm:p-5">
        <div className="pointer-events-auto flex max-w-[440px] flex-col gap-3 rounded-lg border border-zinc-200/80 bg-zinc-50/95 p-3 shadow-xl shadow-zinc-900/10 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => setStatsOpen(open => !open)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              aria-expanded={statsOpen}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-zinc-50">
                <Route className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium text-zinc-500">Carte du parcours</span>
                <span className="mt-0.5 block truncate text-base font-semibold tracking-normal text-zinc-950">
                  {routeStats.distance} · {poiGroups.length} position{poiGroups.length > 1 ? "s" : ""}
                </span>
              </span>
              <ChevronDown
                className={cn("ml-auto size-4 shrink-0 text-zinc-500 transition-transform", statsOpen && "rotate-180")}
              />
            </button>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button size="icon-sm" variant="outline" onClick={fitRoute} aria-label="Recentrer la carte">
                <LocateFixed className="size-4" />
              </Button>
            </div>
          </div>

          {statsOpen && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md border border-zinc-200 bg-zinc-100/70 px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Route className="size-3.5" />
                    Distance
                  </div>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">{routeStats.distance}</p>
                </div>
                <div className="rounded-md border border-zinc-200 bg-zinc-100/70 px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <CalendarDays className="size-3.5" />
                    Durée
                  </div>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">{routeStats.duration}</p>
                </div>
                <div className="rounded-md border border-zinc-200 bg-zinc-100/70 px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Navigation className="size-3.5" />
                    Points
                  </div>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">{routeStats.points}</p>
                </div>
              </div>

              <div className="flex rounded-md bg-zinc-100 p-1">
                {filters.map(filter => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                      activeFilter === filter.value && "bg-zinc-950 text-zinc-50 shadow-sm"
                    )}
                  >
                    {filter.label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px]",
                        activeFilter === filter.value ? "bg-zinc-50/15 text-zinc-50" : "bg-zinc-200 text-zinc-600"
                      )}
                    >
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span
                  className={cn("size-2 rounded-full", routeStatus === "matched" ? "bg-emerald-500" : "bg-amber-500")}
                />
                {routeStatus === "matching" && "Calage sur les routes en cours"}
                {routeStatus === "matched" && "Parcours calé sur les routes"}
                {routeStatus === "fallback" && "Trace GPS brute affichée"}
                {routeStatus === "idle" && "Chargement de la carte"}
              </div>
            </>
          )}
        </div>
      </div>

      <aside className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3 sm:inset-x-auto sm:right-5 sm:top-5 sm:w-[340px] sm:p-0">
        <div className="pointer-events-auto overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-50/95 shadow-xl shadow-zinc-900/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setContentsOpen(open => !open)}
            className={cn(
              "flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
              contentsOpen && "border-b border-zinc-200"
            )}
            aria-expanded={contentsOpen}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600">
                <Layers className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-zinc-950">Contenus sur la route</span>
                <p className="text-xs text-zinc-500">
                  {poiGroups.length} position{poiGroups.length > 1 ? "s" : ""}, {filteredPois.length} lien
                  {filteredPois.length > 1 ? "s" : ""}
                </p>
              </span>
            </span>
            <ChevronDown className={cn("size-4 shrink-0 text-zinc-500 transition-transform", contentsOpen && "rotate-180")} />
          </button>

          {contentsOpen && (
            poiGroups.length > 0 ? (
              <div className="max-h-[38vh] overflow-y-auto p-2 sm:max-h-[calc(100vh-12rem)]">
                {poiGroups.map(group => (
                  <div key={group.id} className="rounded-md px-2 py-2.5 hover:bg-zinc-100">
                    <button
                      type="button"
                      onClick={() => focusGroup(group)}
                      className="mb-2 flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                        <MapPin className="size-3.5" />
                        {group.pois.length} contenu{group.pois.length > 1 ? "s" : ""}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">
                        {group.latitude.toFixed(4)}, {group.longitude.toFixed(4)}
                      </span>
                    </button>
                    <div className="space-y-1">
                      {group.pois.map(poi => {
                        const linked = poi.linked;
                        if (!linked) return null;

                        const Icon = linked.type === "video" ? Film : FileText;
                        return (
                          <a
                            key={poi.id}
                            href={contentHref(linked)}
                            className="group flex items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-zinc-50",
                                linked.type === "video" ? "bg-blue-600" : "bg-rose-600"
                              )}
                            >
                              <Icon className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-2 text-sm font-medium leading-snug text-zinc-950">
                                {linked.title}
                              </span>
                              <span className="mt-1 block text-xs text-zinc-500">{formatDate(poi.timestamp)}</span>
                            </span>
                            <ArrowUpRight className="mt-1 size-4 shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-700" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-5 text-sm text-zinc-500">
                Aucun contenu pour ce filtre. Change de filtre ou ajoute des articles et vidéos avec position.
              </div>
            )
          )}
        </div>
      </aside>

      {waypoints.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-100/80 p-6">
          <div className="max-w-sm rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-center shadow-xl shadow-zinc-900/10">
            <MapPin className="mx-auto size-8 text-zinc-500" />
            <h2 className="mt-3 text-base font-semibold text-zinc-950">Pas encore de trace GPS</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Les points apparaissent ici quand le suivi admin enregistre une position.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
