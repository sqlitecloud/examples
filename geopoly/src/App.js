import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { point, distance } from '@turf/turf';
import { Database } from '@sqlitecloud/drivers';
import { getBbox } from './helpers/getBbox.js';

mapboxgl.accessToken =
  'pk.eyJ1IjoidW5hdGFyYWphbiIsImEiOiJjbDFpcW82MGYxeDE1M2RwNjU4MmZ1YndsIn0.HyxwEtZz-pQ_7R6e48l0-g';

function App() {
  const mapContainerRef = useRef();
  const mapRef = useRef();

  // centers on Central Park, NYC
  const [lng, setLng] = useState(-73.9654897);
  const [lat, setLat] = useState(40.7824635);
  const [zoom, setZoom] = useState(12);

  const [places, setPlaces] = useState([]);
  const [geometry, setGeometry] = useState([]);

  const units = 'miles'; // default is 'kilometers'; can also be miles, degrees, or radians

  async function queryGeopoly(searchedLng, searchedLat) {
    const db = new Database(process.env.REACT_APP_CONNECTION_STRING);

    const db_name = 'geopoly-app';

    const radius = 0.05; // must be non-negative
    const sides = 50; // caps at 1000
    // use coords to create a polygon to store in geopoly
    const polygonCoords =
      await db.sql`USE DATABASE ${db_name}; INSERT INTO polygons(_shape) VALUES(geopoly_regular(${searchedLng}, ${searchedLat}, ${radius}, ${sides})) RETURNING geopoly_json(_shape);`;

    const attractionsInPolygon =
      await db.sql`USE DATABASE ${db_name}; SELECT name, coordinates FROM attractions WHERE geopoly_contains_point(${polygonCoords[0]['geopoly_json(_shape)']}, lng, lat);`; // here, lng and lat are the cols in the attractions table

    db.close();

    const namedAttractions = attractionsInPolygon.filter(
      (attraction) => attraction.name !== null
    );

    const attractionFeatures = namedAttractions.map((attraction, index) => {
      const attractionCoordinates = JSON.parse(attraction['coordinates']);

      const attractionFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: attractionCoordinates,
        },
        properties: {
          id: index,
          title: attraction['name'],
          distance: distance(
            point([searchedLng, searchedLat]),
            point(attractionCoordinates),
            {
              units,
            }
          ),
        },
      };

      // (re-)apply markers for newly searched location
      const marker = document.createElement('div');
      marker.key = `marker-${attractionFeature.properties.id}`;
      marker.id = `marker-${attractionFeature.properties.id}`;
      marker.className = 'marker'; // no css for this class; adding to enable removal later

      marker.addEventListener('click', (e) => {
        handleClick(attractionFeature);
      });

      new mapboxgl.Marker(marker)
        .setLngLat(attractionCoordinates)
        .addTo(mapRef.current);

      return attractionFeature;
    });

    attractionFeatures.sort((a, b) => {
      if (a.properties.distance > b.properties.distance) {
        return 1;
      }
      if (a.properties.distance < b.properties.distance) {
        return -1;
      }
      return 0; // a must be equal to b
    });

    setPlaces(attractionFeatures);

    // if there is at least one attraction in the polygon
    if (attractionFeatures[0]) {
      // create bounding box around searched location and closest attraction
      const bbox = getBbox(attractionFeatures, searchedLng, searchedLat);
      mapRef.current.fitBounds(bbox, {
        padding: 100,
      });

      new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(attractionFeatures[0].geometry.coordinates)
        .setHTML(
          `<h3>${
            attractionFeatures[0].properties.title
          }</h3><h4>${attractionFeatures[0].properties.distance.toFixed(
            2
          )} ${units} away</h4>`
        )
        .addTo(mapRef.current);
    }

    setGeometry([
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [JSON.parse(polygonCoords[0]['geopoly_json(_shape)'])],
        },
      },
      ...attractionFeatures,
    ]);
  }

  function drawFeatureCollection() {
    const sourceId = 'newyork';

    if (!mapRef.current.getSource(sourceId)) {
      mapRef.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: geometry, // array of feature objects (polygon + attraction points)
        },
      });

      mapRef.current.addLayer({
        id: 'polygon',
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#888888',
          'fill-opacity': 0.4,
        },
        filter: ['==', '$type', 'Polygon'],
      });

      mapRef.current.addLayer({
        id: 'outline',
        type: 'line',
        source: sourceId,
        layout: {},
        paint: {
          'line-color': '#000',
          'line-width': 1,
        },
      });
    } else {
      mapRef.current.getSource(sourceId).setData({
        type: 'FeatureCollection',
        features: geometry, // array of feature objects (polygon + attraction points)
      });
    }
  }

  function handleClick(feature) {
    const center = feature.geometry.coordinates;
    const { id, title, distance } = feature.properties;

    mapRef.current.flyTo({
      center,
      zoom: 15,
    });

    const popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) {
      popUps[0].remove();
    }

    new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(center)
      .setHTML(`<h3>${title}</h3><h4>${distance.toFixed(2)} ${units} away</h4>`)
      .addTo(mapRef.current);

    const activeItem = document.getElementsByClassName('active');
    if (activeItem[0]) {
      activeItem[0].classList.remove('active');
    }

    const listing = document.getElementById(`listing-${id}`);
    listing.classList.add('active');
  }

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      zoom: 12,
    });

    const fullscreenCtrl = new mapboxgl.FullscreenControl({
      container: mapContainerRef.current,
    });

    const geolocateCtrl = new mapboxgl.GeolocateControl({
      fitBoundsOptions: {
        maxZoom: 12,
      },
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });

    mapRef.current.addControl(geocoder);
    mapRef.current.addControl(fullscreenCtrl);
    mapRef.current.addControl(geolocateCtrl);

    function updateCoordinates() {
      const { lng, lat } = mapRef.current.getCenter();
      setLng(lng.toFixed(4));
      setLat(lat.toFixed(4));
      setZoom(mapRef.current.getZoom().toFixed(2));
    }

    mapRef.current.on('move', updateCoordinates);

    geocoder.on('result', (e) => {
      // remove existing map markers
      const existingMarkers = document.getElementsByClassName('marker');
      while (existingMarkers[0]) {
        existingMarkers[0].remove();
      }

      // remove existing popups
      const popUps = document.getElementsByClassName('mapboxgl-popup');
      while (popUps[0]) {
        popUps[0].remove();
      }

      const [lng, lat] = e.result.geometry.coordinates;
      queryGeopoly(lng, lat);
    });

    // return effect cleanup function
    return () => {
      mapRef.current.removeControl(geocoder);
      mapRef.current.removeControl(fullscreenCtrl);
      mapRef.current.removeControl(geolocateCtrl);
      mapRef.current.off('move', updateCoordinates);
      mapRef.current.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (geometry.length !== 0) {
      drawFeatureCollection();
    }
  }, [geometry]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="sidebar">
        <div className="legend">
          <p>Center Lat: {lat}</p>
          <p>Center Long: {lng}</p>
          <p>Current Zoom: {zoom}</p>
        </div>
        <div className="heading">
          <h2>Attractions Nearby:</h2>
        </div>

        <div className="listings">
          {places.map((place, index) => (
            <div
              key={index}
              id={`listing-${place.properties.id}`}
              // first item in the list is the closest, active by default
              className={`item ${index === 0 && 'active'}`}
            >
              <a href="#" className="title" onClick={() => handleClick(place)}>
                {place.properties.title}
              </a>
              <div>
                {place.properties.distance.toFixed(2)} {units} away
              </div>
            </div>
          ))}
        </div>
      </div>
      <div ref={mapContainerRef} className="map-container" />
    </>
  );
}

export default App;
