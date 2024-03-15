console.log('hello from nabigator!')

export default {
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
  }
}

