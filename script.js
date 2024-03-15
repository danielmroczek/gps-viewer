const app = Vue.createApp({
  data() {
      return {
          loading: true,
          error: false,
          errorMessage: ''
      };
  },
  mounted() {
      if ("geolocation" in navigator) {
          navigator.geolocation.watchPosition((position) => {
              this.latitude = position.coords.latitude;
              this.longitude = position.coords.longitude;
              this.accuracy = position.coords.accuracy;
              this.timestamp = new Date(position.timestamp).toISOString();
              this.loading = false;
          }, (error) => {
              console.error("Error getting location:", error);
              this.loading = false;
              this.error = true;
              this.errorMessage = "Error getting location. Please make sure you have allowed location access.";
          });
      } else {
          console.error("Geolocation is not supported by this browser.");
          this.loading = false;
          this.error = true;
          this.errorMessage = "Geolocation is not supported by this browser.";
      }
  }
});

app.mount('#app');