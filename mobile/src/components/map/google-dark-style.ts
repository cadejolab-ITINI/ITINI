/** Tema oscuro de Google Maps para mantener la identidad navy de ITINI. */
export const googleDarkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#07111F' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A8BDD0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#07111F' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1E3A52' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1B3851' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0D2235' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#082B45' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0C3D2B' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#102A40' }] },
];
