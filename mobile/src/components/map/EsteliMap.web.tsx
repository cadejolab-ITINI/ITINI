import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './esteli-map.css';
import type { EsteliMapProps } from './map-types';

export function EsteliMap(props: EsteliMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const library = useRef<typeof Leaflet | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let resize: ResizeObserver | undefined;
    import('leaflet').then((L) => {
      if (cancelled || !container.current) return;
      library.current = L;
      const instance = L.map(container.current, { zoomControl: false, attributionControl: true }).setView([13.045, -86.365], 12);
      map.current = instance;
      instance.attributionControl.setPrefix(false);
      L.control.zoom({ position: 'bottomright' }).addTo(instance);
      instance.on('click dragstart', () => latest.current.onMapPress());
      resize = new ResizeObserver(() => instance.invalidateSize());
      resize.observe(container.current);
      setReady(true);
    }).catch(() => { if (!cancelled) setError('No se pudo cargar el mapa. Recargá la aplicación para reintentar.'); });
    return () => { cancelled = true; resize?.disconnect(); map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    if (!ready || !map.current || !library.current || props.offline) return;
    setTileError(false);
    const layer = library.current.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      maxZoom: 19, className: 'itini-map-tiles', keepBuffer: 1,
    }).addTo(map.current);
    layer.on('tileerror', () => setTileError(true));
    layer.on('load', () => {
      const tiles = container.current?.querySelectorAll<HTMLImageElement>('.leaflet-tile');
      if (tiles?.length && Array.from(tiles).every((tile) => tile.naturalWidth > 0)) setTileError(false);
    });
    return () => { layer.remove(); };
  }, [ready, props.offline]);

  useEffect(() => {
    const L = library.current;
    if (!ready || !map.current || !L) return;
    const layer = L.layerGroup().addTo(map.current);
    props.destinations.forEach((destination, index) => {
      const color = ['#FF711F', '#12C98D', '#17AEE7'][index % 3];
      const label = document.createElement('span');
      label.textContent = destination.name;
      const marker = L.marker([destination.latitude, destination.longitude], {
        icon: L.divIcon({ className: 'itini-destination-marker', html: `<span style="background:${color}" class="itini-pin ${props.selected?.id === destination.id ? 'is-selected' : ''}"></span>`, iconSize: [32, 32], iconAnchor: [16, 16] }),
        title: destination.name, alt: `Ver ${destination.name}`, keyboard: true, bubblingMouseEvents: false,
      }).addTo(layer).bindTooltip(label, { direction: 'top', offset: [0, -12], className: 'itini-map-tooltip' });
      marker.on('click', () => latest.current.onDestinationPress(destination));
      marker.getElement()?.setAttribute('role', 'button');
      marker.getElement()?.setAttribute('aria-label', `Ver ${destination.name}`);
    });
    return () => { layer.remove(); };
  }, [ready, props.destinations, props.selected?.id]);

  useEffect(() => {
    const L = library.current;
    const point = props.userLocation;
    if (!ready || !map.current || !L || !point) return;
    const layer = L.layerGroup().addTo(map.current);
    if (point.accuracy != null && point.accuracy > 0) L.circle([point.latitude, point.longitude], {
      radius: point.accuracy, color: '#4285F4', weight: 1, opacity: 0.22, fillOpacity: 0.09, interactive: false,
    }).addTo(layer);
    L.marker([point.latitude, point.longitude], {
      icon: L.divIcon({ className: 'itini-location-marker', html: '<span class="itini-location-pulse"></span><span class="itini-location-dot"></span>', iconSize: [40, 40], iconAnchor: [20, 20] }),
      title: 'Tu ubicación GPS', alt: 'Tu ubicación GPS', interactive: false, zIndexOffset: 1000,
    }).addTo(layer);
    return () => { layer.remove(); };
  }, [ready, props.userLocation]);

  useEffect(() => {
    const L = library.current;
    const route = props.route;
    if (!ready || !map.current || !L || !route) return;
    const layer = L.layerGroup().addTo(map.current);
    const line = L.polyline(route.coordinates.map((point) => [point.latitude, point.longitude] as [number, number]), { color: '#38BDF8', weight: 5 }).addTo(layer);
    const first = route.coordinates[0];
    const last = route.coordinates[route.coordinates.length - 1];
    [[route.origin, first], [last, route.destination]].forEach((pair) => L.polyline(pair.map((p) => [p.latitude, p.longitude] as [number, number]), { color: '#F5A64A', weight: 3, dashArray: '4 7' }).bindTooltip('Acceso por confirmar; no es un sendero validado').addTo(layer));
    map.current.fitBounds(line.getBounds().extend([route.origin.latitude, route.origin.longitude]).extend([route.destination.latitude, route.destination.longitude]), { paddingTopLeft: [42, 150], paddingBottomRight: [88, 150], maxZoom: 15 });
    return () => { layer.remove(); };
  }, [ready, props.route]);

  useEffect(() => {
    if (ready && props.selected && !props.route) map.current?.panTo([props.selected.latitude, props.selected.longitude], { animate: true });
  }, [ready, props.selected, props.route]);

  useEffect(() => {
    const point = latest.current.userLocation;
    if (ready && point && props.recenterToken > 0) map.current?.setView([point.latitude, point.longitude], 15, { animate: true });
  }, [ready, props.recenterToken]);

  const message = error || (props.offline ? 'Modo desconectado · fichas disponibles. El mapa base necesita internet.' : tileError ? 'Sin conexión al mapa base. Podés consultar los destinos.' : !ready ? 'Cargando mapa de Estelí…' : '');
  return <div className="itini-real-map" onPointerDown={props.onMapPress}><div ref={container} className="itini-leaflet" aria-label="Mapa interactivo de Estelí" />{message && <div className="itini-map-message" role="status">{message}</div>}</div>;
}
