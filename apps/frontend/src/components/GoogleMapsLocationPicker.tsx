import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Search, CheckCircle2, AlertCircle, RefreshCw, Compass } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type LocationItem, createManualLocation } from '../api/locations';

interface GoogleMapsLocationPickerProps {
  onLocationConfirmed: (locationId: string, locationObj: LocationItem, extraDetails?: {
    formattedAddress?: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
    stateName?: string;
    districtName?: string;
    blockName?: string;
    villageName?: string;
  }) => void;
  onSwitchToAdministrative?: () => void;
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
  disabled?: boolean;
}

export const GoogleMapsLocationPicker: React.FC<GoogleMapsLocationPickerProps> = ({
  onLocationConfirmed,
  onSwitchToAdministrative,
  initialLatitude,
  initialLongitude,
  initialAddress,
  disabled = false,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const autocompleteInstanceRef = useRef<any>(null);
  const geocoderInstanceRef = useRef<any>(null);

  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Selected place details
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    formattedAddress: string;
    placeId?: string;
    stateName?: string;
    districtName?: string;
    blockName?: string;
    villageName?: string;
    stateCode?: string;
  } | null>(null);

  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  // Reverse geocode a latitude & longitude
  const reverseGeocode = useCallback((lat: number, lng: number, placeId?: string) => {
    const google = (window as any).google;
    if (!google?.maps?.Geocoder) return;

    if (!geocoderInstanceRef.current) {
      geocoderInstanceRef.current = new google.maps.Geocoder();
    }

    setIsGeocoding(true);
    setLoadError(null);

    geocoderInstanceRef.current.geocode(
      { location: { lat, lng } },
      (results: any[], status: string) => {
        setIsGeocoding(false);
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          let stateName = '';
          let districtName = '';
          let blockName = '';
          let villageName = '';
          let stateCode = '';

          const components = result.address_components || [];
          for (const comp of components) {
            const types = comp.types || [];
            if (types.includes('administrative_area_level_1')) {
              stateName = comp.long_name;
              stateCode = comp.short_name;
            } else if (types.includes('administrative_area_level_2')) {
              districtName = comp.long_name;
            } else if (types.includes('sublocality_level_1') || types.includes('administrative_area_level_3')) {
              blockName = comp.long_name;
            } else if (types.includes('sublocality_level_2') || types.includes('locality') || types.includes('neighborhood')) {
              villageName = comp.long_name;
            }
          }

          // Fallbacks for district if level 2 is absent
          if (!districtName && blockName) {
            districtName = blockName;
          }
          if (!districtName && villageName) {
            districtName = villageName;
          }

          setSelectedLocation({
            lat,
            lng,
            formattedAddress: result.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            placeId: placeId || result.place_id,
            stateName: stateName || 'India',
            districtName: districtName || 'Local Region',
            blockName: blockName || undefined,
            villageName: villageName || undefined,
            stateCode: stateCode || undefined,
          });
        } else {
          // Fallback location
          setSelectedLocation({
            lat,
            lng,
            formattedAddress: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            stateName: 'India',
            districtName: 'Custom Location',
          });
        }
      }
    );
  }, []);

  // Update marker position and center map
  const updateMapMarker = useCallback((lat: number, lng: number, recenter: boolean = true) => {
    const google = (window as any).google;
    if (!mapInstanceRef.current || !markerInstanceRef.current || !google?.maps) return;

    const latLng = new google.maps.LatLng(lat, lng);
    markerInstanceRef.current.setPosition(latLng);

    if (recenter) {
      mapInstanceRef.current.panTo(latLng);
      mapInstanceRef.current.setZoom(15);
    }
  }, []);

  // Load Google Maps API script
  useEffect(() => {
    if (!apiKey) {
      setLoadError('Google Maps API key is not configured.');
      return;
    }

    const google = (window as any).google;
    if (google?.maps) {
      setIsApiLoaded(true);
      return;
    }

    const scriptId = 'udaan-google-maps-script';
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsApiLoaded(true);
      };
      script.onerror = () => {
        setLoadError('Failed to load Google Maps script. Please check your network connection or API key restrictions.');
      };
      document.head.appendChild(script);
    } else {
      setIsApiLoaded(true);
    }
  }, [apiKey]);

  // Initialize Map and Autocomplete once script is ready
  useEffect(() => {
    const google = (window as any).google;
    if (!isApiLoaded || !mapContainerRef.current || !google?.maps) return;

    const defaultLat = initialLatitude || 22.2587;
    const defaultLng = initialLongitude || 71.1924;
    const defaultCenter = { lat: defaultLat, lng: defaultLng };

    // Initialize Map
    const map = new google.maps.Map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: initialLatitude ? 15 : 6,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    // Initialize Marker
    const marker = new google.maps.Marker({
      position: defaultCenter,
      map,
      draggable: !disabled,
      title: 'Business Location',
      animation: google.maps.Animation?.DROP,
    });
    markerInstanceRef.current = marker;

    // Marker drag end listener
    marker.addListener('dragend', (event: any) => {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();
      reverseGeocode(newLat, newLng);
    });

    // Map click listener to move marker
    map.addListener('click', (event: any) => {
      if (disabled) return;
      const clickedLat = event.latLng.lat();
      const clickedLng = event.latLng.lng();
      marker.setPosition(event.latLng);
      reverseGeocode(clickedLat, clickedLng);
    });

    // Initialize Places Autocomplete
    if (searchInputRef.current && google.maps.places) {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_components'],
      });
      autocompleteInstanceRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          setLoadError('No details available for input: ' + (place.name || 'selected place'));
          return;
        }

        const pLat = place.geometry.location.lat();
        const pLng = place.geometry.location.lng();

        updateMapMarker(pLat, pLng, true);
        reverseGeocode(pLat, pLng, place.place_id);
      });
    }

    // Initial reverse geocode if preloaded
    if (initialLatitude && initialLongitude) {
      reverseGeocode(initialLatitude, initialLongitude);
    }
  }, [isApiLoaded, initialLatitude, initialLongitude, disabled, reverseGeocode, updateMapMarker]);

  // Handle Confirm Location action
  const handleConfirmLocation = async () => {
    if (!selectedLocation) {
      setLoadError('Please select or search for a location on the map first.');
      return;
    }

    setIsSaving(true);
    setLoadError(null);
    try {
      // Find or create hierarchical location in backend database
      const savedLoc = await createManualLocation({
        stateName: selectedLocation.stateName || 'Gujarat',
        districtName: selectedLocation.districtName || 'General District',
        blockName: selectedLocation.blockName,
        villageName: selectedLocation.villageName || selectedLocation.formattedAddress,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        stateCode: selectedLocation.stateCode,
      });

      setConfirmationMessage('Location confirmed successfully!');
      onLocationConfirmed(savedLoc.id, savedLoc, {
        formattedAddress: selectedLocation.formattedAddress,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        googlePlaceId: selectedLocation.placeId,
        stateName: selectedLocation.stateName,
        districtName: selectedLocation.districtName,
        blockName: selectedLocation.blockName,
        villageName: selectedLocation.villageName,
      });
    } catch (err: any) {
      setLoadError(err.message || 'Failed to save location details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Missing API Key: Render polished Demo Map Location Picker
  if (!apiKey) {
    return (
      <DemoMapLocationPicker
        onLocationConfirmed={onLocationConfirmed}
        onSwitchToAdministrative={onSwitchToAdministrative}
        initialLatitude={initialLatitude}
        initialLongitude={initialLongitude}
        initialAddress={initialAddress}
        disabled={disabled}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search Input Bar */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search size={18} />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          className="input-control"
          placeholder="Search village, city, taluka, landmark or business address in India..."
          defaultValue={initialAddress || ''}
          disabled={disabled || !isApiLoaded}
          style={{
            paddingLeft: '38px',
            fontSize: '0.95rem',
            background: 'var(--bg-surface)',
          }}
        />
      </div>

      {/* Interactive Map Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '340px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-light)',
          background: '#e2e8f0',
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {!isApiLoaded && !loadError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Loading interactive Google Maps...
            </div>
          </div>
        )}

        {isGeocoding && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-main)',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} className="spin" />
            <span>Resolving address...</span>
          </div>
        )}
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        💡 <em>Tip: You can search an address above, click anywhere on the map, or drag the red pin to set your exact location.</em>
      </div>

      {/* Load / Validation Errors */}
      {loadError && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#dc2626',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} />
          <span>{loadError}</span>
        </div>
      )}

      {/* Selected Location Summary Card */}
      {selectedLocation && (
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--brand-green)' }}>
            <MapPin size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Selected Location</span>
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '6px' }}>
            {selectedLocation.formattedAddress}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px dashed var(--border-light)',
            }}
          >
            {selectedLocation.stateName && (
              <div><strong>State:</strong> {selectedLocation.stateName}</div>
            )}
            {selectedLocation.districtName && (
              <div><strong>District:</strong> {selectedLocation.districtName}</div>
            )}
            {selectedLocation.blockName && (
              <div><strong>Taluka/Block:</strong> {selectedLocation.blockName}</div>
            )}
            <div><strong>Coordinates:</strong> {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}</div>
          </div>

          {/* Confirmation button */}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmLocation}
              disabled={isSaving || disabled}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isSaving ? (
                <>
                  <div className="spinner" />
                  <span>Saving location...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Confirm Location</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {confirmationMessage && (
        <div
          style={{
            padding: '8px 14px',
            background: 'var(--brand-green-light)',
            border: '1px solid var(--brand-green-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--brand-green)',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{confirmationMessage}</span>
        </div>
      )}
    </div>
  );
}/* ========================================================================= */
/* OPENSTREETMAP LEAFLET LOCATION PICKER (ACTIVE WHEN NO GOOGLE MAPS API KEY) */
/* ========================================================================= */

interface DemoPreset {
  name: string;
  taluka: string;
  lat: number;
  lng: number;
  address: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    name: 'Bardoli Town (Main Station Road)',
    taluka: 'Bardoli',
    lat: 21.1197,
    lng: 73.1126,
    address: 'Station Road, Bardoli Town, Surat, Gujarat 394601',
  },
  {
    name: 'Bardoli Sugar Factory Road (Sardar Patel Marg)',
    taluka: 'Bardoli',
    lat: 21.125,
    lng: 73.125,
    address: 'Sugar Factory Marg, Bardoli Taluka, Surat, Gujarat 394602',
  },
  {
    name: 'Kamrej Char Rasta / Highway Junction',
    taluka: 'Kamrej',
    lat: 21.27,
    lng: 72.96,
    address: 'Kamrej Chowkdi, National Highway 48, Kamrej, Surat, Gujarat 394185',
  },
  {
    name: 'Adajan Main Market (Surat West)',
    taluka: 'Surat City',
    lat: 21.195,
    lng: 72.7933,
    address: 'Adajan Gam, Surat City, Surat, Gujarat 395009',
  },
  {
    name: 'Varachha Commercial Zone',
    taluka: 'Surat City',
    lat: 21.215,
    lng: 72.855,
    address: 'Varachha Main Road, Surat, Gujarat 395006',
  },
  {
    name: 'Katargam GIDC Area',
    taluka: 'Surat City',
    lat: 21.2266,
    lng: 72.8258,
    address: 'Katargam Industrial Area, Surat, Gujarat 395004',
  },
  {
    name: 'Palsana Textile Hub',
    taluka: 'Palsana',
    lat: 21.08,
    lng: 72.98,
    address: 'Palsana Crossroads, Palsana Taluka, Surat, Gujarat 394315',
  },
  {
    name: 'Olpad Town Market',
    taluka: 'Olpad',
    lat: 21.33,
    lng: 72.75,
    address: 'Main Bazaar, Olpad, Surat, Gujarat 394540',
  },
  {
    name: 'Mandvi Tapi Riverbank',
    taluka: 'Mandvi',
    lat: 21.25,
    lng: 73.3,
    address: 'Mandvi Town, Surat District, Gujarat 394160',
  },
];

const createCustomPinIcon = (label: string) => {
  const shortLabel = (label.split(',')[0] || 'Selected Location').trim();
  const escapedLabel = shortLabel.replace(/"/g, '&quot;').slice(0, 28);

  return L.divIcon({
    className: 'udaan-leaflet-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: grab; pointer-events: auto;">
        <div style="background: #0b132b; color: #06d6a0; border: 1.5px solid #06d6a0; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; white-space: nowrap; box-shadow: 0 3px 8px rgba(0,0,0,0.35); margin-bottom: 2px;">
          ${escapedLabel}
        </div>
        <svg width="34" height="42" viewBox="0 0 24 24" fill="#dc2626" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.45));">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3.5" fill="#ffffff" stroke="#991b1b" stroke-width="1"></circle>
        </svg>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [0, 0],
    popupAnchor: [0, -36],
  });
};

const DemoMapLocationPicker: React.FC<GoogleMapsLocationPickerProps> = ({
  onLocationConfirmed,
  onSwitchToAdministrative,
  initialLatitude = 21.1197,
  initialLongitude = 73.1126,
  initialAddress = 'Bardoli, Surat, Gujarat',
  disabled = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkerRef = useRef<L.Marker | null>(null);

  const [latitude, setLatitude] = useState<number>(initialLatitude);
  const [longitude, setLongitude] = useState<number>(initialLongitude);
  const [selectedPreset, setSelectedPreset] = useState<DemoPreset | null>(DEMO_PRESETS[0]);
  const [customLocality, setCustomLocality] = useState<string>(initialAddress || 'Bardoli Town, Surat');
  const [talukaName, setTalukaName] = useState<string>('Bardoli');
  const [districtName, setDistrictName] = useState<string>('Surat');
  const [stateName, setStateName] = useState<string>('Gujarat');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Reverse geocode with OpenStreetMap Nominatim API
  const reverseGeocodeOSM = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    setErrorMessage(null);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};
        const village = addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.city_district || addr.hamlet || '';
        const taluka = addr.county || addr.state_district || addr.subdistrict || '';
        const district = addr.state_district || addr.city || 'Surat';
        const state = addr.state || 'Gujarat';

        const fullAddr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setCustomLocality(village ? `${village}, ${taluka || district}` : fullAddr);
        if (taluka) setTalukaName(taluka.replace(/taluk|taluka|block/gi, '').trim());
        if (district) setDistrictName(district.replace(/district/gi, '').trim());
        if (state) setStateName(state);

        if (leafletMarkerRef.current) {
          leafletMarkerRef.current.setIcon(createCustomPinIcon(village || fullAddr));
        }
      }
    } catch {
      // Fallback silently if offline or rate limited
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [initialLatitude, initialLongitude],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    const marker = L.marker([initialLatitude, initialLongitude], {
      icon: createCustomPinIcon(customLocality),
      draggable: !disabled,
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const newLat = Number(pos.lat.toFixed(5));
      const newLng = Number(pos.lng.toFixed(5));
      setLatitude(newLat);
      setLongitude(newLng);
      setSelectedPreset(null);
      reverseGeocodeOSM(newLat, newLng);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (disabled) return;
      const newLat = Number(e.latlng.lat.toFixed(5));
      const newLng = Number(e.latlng.lng.toFixed(5));
      marker.setLatLng([newLat, newLng]);
      setLatitude(newLat);
      setLongitude(newLng);
      setSelectedPreset(null);
      reverseGeocodeOSM(newLat, newLng);
    });

    leafletMapRef.current = map;
    leafletMarkerRef.current = marker;

    // Invalidate size after layout renders
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      leafletMapRef.current = null;
    };
  }, [disabled, initialLatitude, initialLongitude, reverseGeocodeOSM]);

  // Update marker position when preset is selected
  const handleSelectPreset = (p: DemoPreset) => {
    setSelectedPreset(p);
    setLatitude(p.lat);
    setLongitude(p.lng);
    setCustomLocality(p.address);
    setTalukaName(p.taluka);
    setDistrictName('Surat');
    setStateName('Gujarat');

    if (leafletMapRef.current && leafletMarkerRef.current) {
      leafletMapRef.current.flyTo([p.lat, p.lng], 14, { duration: 0.8 });
      leafletMarkerRef.current.setLatLng([p.lat, p.lng]);
      leafletMarkerRef.current.setIcon(createCustomPinIcon(p.name));
    }
  };

  // Perform OpenStreetMap forward search
  const handleSearchOSM = async (queryText: string) => {
    if (!queryText || queryText.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          queryText + ', Gujarat, India'
        )}&countrycodes=in&limit=5`
      );
      if (resp.ok) {
        const data = await resp.json();
        setSearchResults(data || []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = Number(parseFloat(result.lat).toFixed(5));
    const lng = Number(parseFloat(result.lon).toFixed(5));
    setLatitude(lat);
    setLongitude(lng);
    setCustomLocality(result.display_name);
    setSearchResults([]);
    setSearchQuery('');
    setSelectedPreset(null);

    if (leafletMapRef.current && leafletMarkerRef.current) {
      leafletMapRef.current.flyTo([lat, lng], 15, { duration: 0.8 });
      leafletMarkerRef.current.setLatLng([lat, lng]);
      leafletMarkerRef.current.setIcon(createCustomPinIcon(result.display_name));
    }
    reverseGeocodeOSM(lat, lng);
  };

  const handleConfirm = async () => {
    if (disabled) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const formattedAddress = customLocality.trim() || `${latitude}, ${longitude}`;
      const savedLoc = await createManualLocation({
        stateName: stateName || 'Gujarat',
        districtName: districtName || 'Surat',
        blockName: talukaName || 'Bardoli',
        villageName: formattedAddress,
        latitude,
        longitude,
        stateCode: 'GJ',
      });

      setConfirmationMessage('Location confirmed and saved successfully!');
      onLocationConfirmed(savedLoc.id, savedLoc, {
        formattedAddress,
        latitude,
        longitude,
        stateName: stateName || 'Gujarat',
        districtName: districtName || 'Surat',
        blockName: talukaName || 'Bardoli',
        villageName: formattedAddress,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to persist map location.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPresets = DEMO_PRESETS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.taluka.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Map Mode Status & Attribution Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          background: 'var(--bg-subtle)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#0b132b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06d6a0',
            }}
          >
            <Compass size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0b132b' }}>
              Interactive OpenStreetMap Geographic Map
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real geographic tiles, roads, and village boundaries • Click or drag the marker
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: 'rgba(6, 214, 160, 0.15)',
              color: '#047857',
              border: '1px solid rgba(6, 214, 160, 0.35)',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            OpenStreetMap Tiles
          </span>

          {onSwitchToAdministrative && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onSwitchToAdministrative}
              style={{ fontSize: '0.8rem', padding: '5px 12px' }}
            >
              <span>Switch to Administrative Dropdowns</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Search and Geocoding Bar */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <Search size={16} />
        </div>
        <input
          type="text"
          className="input-control"
          placeholder="Search village, city, taluka or landmark in Gujarat (or filter presets below)..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearchOSM(e.target.value);
          }}
          style={{ paddingLeft: '36px', fontSize: '0.9rem' }}
        />
        {isSearching && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            Searching...
          </div>
        )}

        {/* Dynamic Search Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              marginTop: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {searchResults.map((res, i) => (
              <div
                key={i}
                onClick={() => handleSelectSearchResult(res)}
                style={{
                  padding: '10px 14px',
                  fontSize: '0.84rem',
                  borderBottom: i < searchResults.length - 1 ? '1px solid #f1f5f9' : 'none',
                  cursor: 'pointer',
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                <MapPin size={14} color="#059669" />
                <span>{res.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preset Quick-Picks Chips */}
      <div>
        <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
          Quick Taluka & Market Presets (Surat Catchment):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {filteredPresets.map((p) => {
            const isSelected = selectedPreset?.name === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                style={{
                  background: isSelected ? '#0b132b' : '#f8fafc',
                  color: isSelected ? '#06d6a0' : '#334155',
                  border: `1px solid ${isSelected ? '#0b132b' : '#cbd5e1'}`,
                  padding: '5px 11px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>📍</span>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real Interactive Leaflet + OpenStreetMap Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '340px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '2px solid #cbd5e1',
          background: '#f1f5f9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

        {isGeocoding && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(11, 19, 43, 0.85)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={12} className="spin" />
            <span>Resolving address...</span>
          </div>
        )}

        {/* Map Help Overlay Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: '#1e293b',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            zIndex: 1000,
            border: '1px solid #e2e8f0',
            fontWeight: 500,
          }}
        >
          🗺️ Click anywhere on the map or drag the pin to set your enterprise location
        </div>
      </div>

      {/* Coordinate & Locality Form Controls */}
      <div
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
        }}
      >
        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0b132b', marginBottom: '12px' }}>
          📍 Selected Coordinates & Locality Information
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              Locality / Village / Business Address
            </label>
            <input
              type="text"
              className="input-control"
              value={customLocality}
              onChange={(e) => setCustomLocality(e.target.value)}
              placeholder="e.g. Bardoli Town Market, Station Road"
              disabled={disabled}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              Taluka / Block
            </label>
            <input
              type="text"
              className="input-control"
              value={talukaName}
              onChange={(e) => setTalukaName(e.target.value)}
              placeholder="e.g. Bardoli, Kamrej, Surat City"
              disabled={disabled}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              District
            </label>
            <input
              type="text"
              className="input-control"
              value={districtName}
              onChange={(e) => setDistrictName(e.target.value)}
              placeholder="e.g. Surat"
              disabled={disabled}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              Latitude (°N)
            </label>
            <input
              type="number"
              step="0.00001"
              className="input-control"
              value={latitude}
              onChange={(e) => {
                const val = Number(e.target.value);
                setLatitude(val);
                if (leafletMarkerRef.current && leafletMapRef.current) {
                  leafletMarkerRef.current.setLatLng([val, longitude]);
                  leafletMapRef.current.panTo([val, longitude]);
                }
              }}
              disabled={disabled}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              Longitude (°E)
            </label>
            <input
              type="number"
              step="0.00001"
              className="input-control"
              value={longitude}
              onChange={(e) => {
                const val = Number(e.target.value);
                setLongitude(val);
                if (leafletMarkerRef.current && leafletMapRef.current) {
                  leafletMarkerRef.current.setLatLng([latitude, val]);
                  leafletMapRef.current.panTo([latitude, val]);
                }
              }}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isSaving || disabled}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px' }}
          >
            {isSaving ? (
              <>
                <div className="spinner" />
                <span>Saving Location...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Confirm & Use This Location</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#dc2626',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {confirmationMessage && (
        <div
          style={{
            padding: '10px 14px',
            background: 'var(--brand-green-light)',
            border: '1px solid var(--brand-green-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--brand-green)',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{confirmationMessage}</span>
        </div>
      )}
    </div>
  );
};


