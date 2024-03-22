export default class History {
  constructor(points, limit = 30) {
    this.points = points;
    this.limit = limit;
  }

  add(point) {
    // Add the item to the beginning array
    this.points.unshift(point);

    // Check if the length of the array exceeds 100
    if (this.points.length > this.limit) {
      // Remove the oldest items
      this.points = this.points.slice(this.points.length - this.limit);
    }
  }
  
  get(index) {
    return this.points[index];
  }

  getLatest() {
    return this.get(0);
  }

  reversedWeightedMean() {
    const sum = this.points.reduce(
      (acc, point) => {
        const weight = 1 / point.accuracy;

        let { sum, sumLat, sumLng, sumAcc } = acc;

        sum += weight;
        sumLat += point.latitude * weight;
        sumLng += point.longitude * weight;
        sumAcc += point.accuracy * weight;
        return { sum, sumLat, sumLng, sumAcc };
      },
      { sum: 0, sumLat: 0, sumLng: 0, sumAcc: 0 }
    );

    const mean = {
      latitude: sum.sumLat / sum.sum,
      longitude: sum.sumLng / sum.sum,
      accuracy: sum.sumAcc / sum.sum,
      timestamp: this.points[0].timestamp
    }

    return mean;
  }
}
