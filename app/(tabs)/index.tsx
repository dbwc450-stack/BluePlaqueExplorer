import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { supabase } from '../../lib/supabase';

type Plaque = {
  open_plaques_id: number;
  title: string;
  latitude: number;
  longitude: number;
  address: string;
};

const cleanTitle = (title: string) =>
  title
    .replace(/ Blue Plaque/gi, '')
    .replace(/ Red Plaque/gi, '')
    .replace(/ Green Plaque/gi, '')
    .replace(/ Brown Plaque/gi, '')
    .replace(/ Black Plaque/gi, '')
    .replace(/ Grey Plaque/gi, '')
    .replace(/ Gray Plaque/gi, '')
    .replace(/ White Plaque/gi, '')
    .replace(/ Yellow Plaque/gi, '')
    .replace(/ Purple Plaque/gi, '')
    .replace(/ Bronze Plaque/gi, '')
    .replace(/ Plaque/gi, '')
    .trim();

const buildMapHTML = (plaques: Plaque[]) => {
  const markers = plaques.map(p => ({
    id: p.open_plaques_id,
    lat: p.latitude,
    lng: p.longitude,
    title: cleanTitle(p.title),
    address: p.address ?? '',
  }));

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: true }).setView([51.5074, -0.1278], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const blueIcon = L.divIcon({
      className: '',
      html: '<div style="width:14px;height:14px;background:#1a4fa0;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const markers = ${JSON.stringify(markers)};

    markers.forEach(function(p) {
      const marker = L.marker([p.lat, p.lng], { icon: blueIcon }).addTo(map);
      marker.on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ id: p.id }));
      });
    });

    map.on('moveend', function() {
      const b = map.getBounds();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'region',
        minLat: b.getSouth(),
        maxLat: b.getNorth(),
        minLng: b.getWest(),
        maxLng: b.getEast(),
      }));
    });
  </script>
</body>
</html>
  `;
};

export default function MapScreen() {
  const [plaques, setPlaques] = useState<Plaque[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    fetchPlaques(-0.5, 0.5, 51.2, 51.8);
  }, []);

  async function fetchPlaques(minLng: number, maxLng: number, minLat: number, maxLat: number) {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      const { data } = await supabase
        .from('plaques')
        .select('open_plaques_id, title, latitude, longitude, address')
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLng)
        .lte('longitude', maxLng)
        .limit(200);

      if (data) setPlaques(data);
    } catch (e) {
      console.log('Fetch error:', e);
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  }

  const onMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'region') {
        fetchPlaques(msg.minLng, msg.maxLng, msg.minLat, msg.maxLat);
      } else if (msg.id) {
        router.push(`/plaque/${msg.id}`);
      }
    } catch (e) {
      console.log('Message error:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1a4fa0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: buildMapHTML(plaques) }}
        style={styles.map}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#1a4fa0" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
