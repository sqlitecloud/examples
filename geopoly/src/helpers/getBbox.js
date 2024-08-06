export function getBbox(sortedEvents, locationLng, locationLat) {
  const lons = [
    // closest event lng
    sortedEvents[0].geometry.coordinates[0],
    // searched location lng
    locationLng,
  ];
  const lats = [
    // closest event lat
    sortedEvents[0].geometry.coordinates[1],
    // searched location lat
    locationLat,
  ];
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
