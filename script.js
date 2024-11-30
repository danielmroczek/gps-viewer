import History from "./history.js";

const app = Vue.createApp({
  data() {
    return {
      position: {},
      points: [],
      loading: true,
      error: false,
      errorMessage: "",
      map: null,
      marker: null,
      accuracyCircle: null,
      options: {
        highAccuracy: true,
      },
    };
  },
  async mounted() {
    this.history = new History(this.points);
    
    try {
      // Initialize map first
      this.map = L.map("map", {
        attributionControl: false,
        maxZoom: 22
      });
      
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxNativeZoom: 19,
        maxZoom: 22
      }).addTo(this.map);
      
      this.map.invalidateSize();
      this.marker = L.marker([0, 0]).addTo(this.map);
      this.accuracyCircle = L.circle([0, 0], {
        radius: 0,
        className: 'accuracy-circle'
      }).addTo(this.map);

      // Check for permissions first
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        throw new Error('Location permission denied');
      }

      // Get initial position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: this.options.highAccuracy,
          timeout: 5000,
          maximumAge: 0
        });
      });

      // Set initial position
      await this.onPositionChange(position);
      
      // Start watching position
      this.refreshPosition();

    } catch (err) {
      console.error('Location error:', err);
      this.error = true;
      this.errorMessage = this.getErrorMessage(err);
      this.loading = false;
    }
  },
  methods: {
    getErrorMessage(error) {
      switch(error.code) {
        case 1: return 'Location permission denied';
        case 2: return 'Location unavailable';
        case 3: return 'Location request timed out';
        default: return 'Error getting location';
      }
    },
    updateMapPosition(latitude, longitude, accuracy) {
      this.marker.setLatLng({ lat: latitude, lng: longitude });
      this.accuracyCircle.setLatLng({ lat: latitude, lng: longitude }).setRadius(accuracy);
      this.map.setView({ lat: latitude, lng: longitude }, 20);
      this.map.fitBounds(this.accuracyCircle.getBounds(), { maxZoom: 20 });
    },
    onPositionChange(position) {
      const { latitude, longitude } = position.coords;
      const latest = this.history.getLatest();
      
      if (latest && latitude === latest.latitude && longitude === latest.longitude) {
        console.log("Same position as latest point. Skipping.");
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
      
      this.updateMapPosition(this.position.latitude, this.position.longitude, this.position.accuracy);

      this.loading = false;
      this.error = false;
    },
    refreshPosition() {
      navigator.geolocation.watchPosition(
        (position) => this.onPositionChange(position),
        (error) => {
          console.error("Error getting location:", error);
          this.error = true;
          this.errorMessage = this.getErrorMessage(error);
        },
        {
          enableHighAccuracy: this.options.highAccuracy,
          maximumAge: 0,
        }
      );
    },
  },
});

app.mount("#app");
