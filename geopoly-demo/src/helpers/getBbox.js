export function getBbox(sortedEvents, locationLng, locationLat) {
  const lons = [sortedEvents[0].geometry.coordinates[0], locationLng];
  const lats = [sortedEvents[0].geometry.coordinates[1], locationLat];
  const sortedLons = lons.sort((a, b) => {
    if (a > b) {
      return 1;
    }
    if (a.distance < b.distance) {
      return -1;
    }
    return 0;
  });
  const sortedLats = lats.sort((a, b) => {
    if (a > b) {
      return 1;
    }
    if (a.distance < b.distance) {
      return -1;
    }
    return 0;
  });
  return [
    [sortedLons[0], sortedLats[0]],
    [sortedLons[1], sortedLats[1]],
  ];
}
