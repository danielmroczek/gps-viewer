// import L from "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/+esm";
// import { createApp } from 'https://cdn.jsdelivr.net/npm/petite-vue@0.4.1/+esm'
import History from "./history.js";

const app = Vue.createApp({
  data() {
    return {
      position: {},
      points: [],
      loading: true,
      error: false,
      errorMessage: "",
      options: {
        highAccuracy: true,
      },
    };
  },
  mounted() {
    this.history = new History(this.points);
    // Refresh position every second

    const map = L.map("map", {
      attributionControl: false,
      // maxNativeZoom: 19,
      // maxZoom: 20
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxNativeZoom: 19,
      maxZoom: 22
    }).addTo(map);
    map.invalidateSize();
    // Initialize marker
    
    this.marker = L.marker([0, 0]).addTo(map);

    navigator.geolocation.getCurrentPosition(
      ({ coords: { longitude, latitude } }) => {
        map.setView([latitude, longitude], 20);
      }
    );

    this.refreshPosition();
  },
  methods: {
    onPositionChange(position) {
      const { latitude, longitude } = position.coords;
      const latest = this.history.getLatest();
      if (latitude == latest?.latitude && longitude == latest?.longitude) {
        return;
      }

      const point = {
        latitude,
        longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toLocaleString(),
      };
      this.history.add(point);
      this.position = this.history.reversedWeightedMean();
      this.marker.setLatLng({
        lat: this.position.latitude,
        lng: this.position.longitude,
      });
      // this.position = point;

      this.loading = false;
      this.error = false;
    },

    refreshPosition() {
      navigator.geolocation.watchPosition(
        (position) => this.onPositionChange(position),
        (error) => {
          console.error("Error getting location:", error);
          this.loading = false;
          this.error = true;
          this.errorMessage =
            "Error getting location. Please make sure you have allowed location access.";
        },
        {
          enableHighAccuracy: this.options.highAccuracy,
          timeout: 10000,
          maximumAge: 0, // 0 = no cache, Infinity = cache forever
        }
      );
    },
  },
});

app.mount("#app");
