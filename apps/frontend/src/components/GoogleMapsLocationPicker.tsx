import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Search, CheckCircle2, AlertCircle, RefreshCw, Compass } from 'lucide-react';
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
};

/* ========================================================================= */
/* DEMO MAP LOCATION PICKER (ACTIVE WHEN NO GOOGLE MAPS API KEY IS CONFIGURED) */
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
    lat: 21.1250,
    lng: 73.1250,
    address: 'Sugar Factory Marg, Bardoli Taluka, Surat, Gujarat 394602',
  },
  {
    name: 'Kamrej Char Rasta / Highway Junction',
    taluka: 'Kamrej',
    lat: 21.2700,
    lng: 72.9600,
    address: 'Kamrej Chowkdi, National Highway 48, Kamrej, Surat, Gujarat 394185',
  },
  {
    name: 'Adajan Main Market (Surat West)',
    taluka: 'Surat City',
    lat: 21.1950,
    lng: 72.7933,
    address: 'Adajan Gam, Surat City, Surat, Gujarat 395009',
  },
  {
    name: 'Varachha Commercial Zone',
    taluka: 'Surat City',
    lat: 21.2150,
    lng: 72.8550,
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
    lat: 21.0800,
    lng: 72.9800,
    address: 'Palsana Crossroads, Palsana Taluka, Surat, Gujarat 394315',
  },
  {
    name: 'Olpad Town Market',
    taluka: 'Olpad',
    lat: 21.3300,
    lng: 72.7500,
    address: 'Main Bazaar, Olpad, Surat, Gujarat 394540',
  },
  {
    name: 'Mandvi Tapi Riverbank',
    taluka: 'Mandvi',
    lat: 21.2500,
    lng: 73.3000,
    address: 'Mandvi Town, Surat District, Gujarat 394160',
  },
];

const DemoMapLocationPicker: React.FC<GoogleMapsLocationPickerProps> = ({
  onLocationConfirmed,
  onSwitchToAdministrative,
  initialLatitude = 21.1197,
  initialLongitude = 73.1126,
  initialAddress = 'Bardoli, Surat, Gujarat',
  disabled = false,
}) => {
  const [markerPos, setMarkerPos] = useState<{ x: number; y: number }>({ x: 55, y: 50 });
  const [latitude, setLatitude] = useState<number>(initialLatitude);
  const [longitude, setLongitude] = useState<number>(initialLongitude);
  const [selectedPreset, setSelectedPreset] = useState<DemoPreset | null>(DEMO_PRESETS[0]);
  const [customLocality, setCustomLocality] = useState<string>(initialAddress || 'Bardoli Town, Surat');
  const [talukaName, setTalukaName] = useState<string>('Bardoli');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Update map coordinates based on click position
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    setMarkerPos({ x, y });

    // Interpolate Surat region coordinates: Lat 21.0000 - 21.4000, Lng 72.7000 - 73.3500
    const calcLat = Number((21.4000 - (y / 100) * 0.4000).toFixed(5));
    const calcLng = Number((72.7000 + (x / 100) * 0.6500).toFixed(5));
    setLatitude(calcLat);
    setLongitude(calcLng);
    setSelectedPreset(null);
  };

  const handleSelectPreset = (p: DemoPreset) => {
    setSelectedPreset(p);
    setLatitude(p.lat);
    setLongitude(p.lng);
    setCustomLocality(p.address);
    setTalukaName(p.taluka);

    // Map percentage approximate positioning
    const normX = Math.max(10, Math.min(90, ((p.lng - 72.7000) / 0.6500) * 100));
    const normY = Math.max(10, Math.min(90, ((21.4000 - p.lat) / 0.4000) * 100));
    setMarkerPos({ x: normX, y: normY });
  };

  const handleConfirm = async () => {
    if (disabled) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const formattedAddress = customLocality.trim() || `${latitude}, ${longitude}`;
      const savedLoc = await createManualLocation({
        stateName: 'Gujarat',
        districtName: 'Surat',
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
        stateName: 'Gujarat',
        districtName: 'Surat',
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
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.taluka.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.address.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Demo Mode Status Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          background: 'var(--bg-subtle)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="var(--brand-green)" />
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
            Interactive Location Map
          </span>
          <span
            style={{
              background: 'rgba(6, 214, 160, 0.15)',
              color: 'var(--brand-green)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            Demo Map Selector
          </span>
        </div>

        {onSwitchToAdministrative && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onSwitchToAdministrative}
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
          >
            <span>Switch to Dropdown Selection</span>
          </button>
        )}
      </div>

      {/* Quick Search and Filter Bar */}
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
          <Search size={16} />
        </div>
        <input
          type="text"
          className="input-control"
          placeholder="Filter quick presets (e.g. Bardoli, Kamrej, Adajan, Varachha, Olpad)..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{ paddingLeft: '36px', fontSize: '0.9rem' }}
        />
      </div>

      {/* Preset Quick-Picks Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {filteredPresets.map((p) => {
          const isSelected = selectedPreset?.name === p.name;
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => handleSelectPreset(p)}
              style={{
                background: isSelected ? 'var(--brand-green)' : 'var(--bg-subtle)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${isSelected ? 'var(--brand-green)' : 'var(--border-light)'}`,
                padding: '5px 10px',
                borderRadius: '16px',
                fontSize: '0.78rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              📍 {p.name}
            </button>
          );
        })}
      </div>

      {/* Interactive Map Canvas / SVG Grid */}
      <div
        onClick={handleMapClick}
        style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '2px solid var(--border-light)',
          background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 30%, #ecfdf5 70%, #fef3c7 100%)',
          cursor: disabled ? 'default' : 'crosshair',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
        }}
        title="Click anywhere on the map to place your business pin"
      >
        {/* SVG Topographical & Road Network Graphics */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Tapi River representation */}
          <path
            d="M 0 140 Q 150 170, 300 130 T 600 160 T 900 130"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="14"
            opacity="0.6"
          />
          <text x="320" y="135" fill="#2563eb" fontSize="10" fontWeight="600" opacity="0.8">
            Tapi River Basin
          </text>

          {/* NH 48 National Highway */}
          <line x1="180" y1="0" x2="220" y2="280" stroke="#f59e0b" strokeWidth="6" opacity="0.7" />
          <text x="140" y="40" fill="#b45309" fontSize="9" fontWeight="700">
            NH 48 (Surat–Mumbai Corridor)
          </text>

          {/* State Highway 6 (Bardoli–Surat Road) */}
          <line x1="0" y1="180" x2="600" y2="120" stroke="#10b981" strokeWidth="4" opacity="0.8" />
          <text x="360" y="105" fill="#047857" fontSize="9" fontWeight="700">
            SH 6 (Surat → Bardoli Highway)
          </text>

          {/* Taluka boundary lines */}
          <circle cx="120" cy="190" r="45" fill="none" stroke="#94a3b8" strokeDasharray="3,3" strokeWidth="1.5" />
          <text x="85" y="195" fill="#64748b" fontSize="10" fontWeight="700">
            Surat City
          </text>

          <circle cx="480" cy="120" r="50" fill="none" stroke="#94a3b8" strokeDasharray="3,3" strokeWidth="1.5" />
          <text x="450" y="125" fill="#047857" fontSize="11" fontWeight="800">
            Bardoli
          </text>

          <circle cx="300" cy="60" r="40" fill="none" stroke="#94a3b8" strokeDasharray="3,3" strokeWidth="1.5" />
          <text x="275" y="65" fill="#64748b" fontSize="10" fontWeight="700">
            Kamrej
          </text>

          <circle cx="340" cy="230" r="40" fill="none" stroke="#94a3b8" strokeDasharray="3,3" strokeWidth="1.5" />
          <text x="315" y="235" fill="#64748b" fontSize="10" fontWeight="700">
            Palsana
          </text>
        </svg>

        {/* Pin Marker */}
        <div
          style={{
            position: 'absolute',
            left: `${markerPos.x}%`,
            top: `${markerPos.y}%`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'all 0.1s ease-out',
          }}
        >
          <div
            style={{
              background: '#dc2626',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              whiteSpace: 'nowrap',
              marginBottom: '2px',
            }}
          >
            {customLocality.split(',')[0] || 'Selected Point'}
          </div>
          <MapPin size={34} color="#dc2626" fill="#ef4444" style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.3))' }} />
        </div>

        {/* Map Help Overlay Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.74rem',
            color: 'var(--text-secondary)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          👆 Click anywhere on the map or select a quick preset above
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
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-green)', marginBottom: '12px' }}>
          📍 Selected Coordinates & Locality Information
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
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
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
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
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Latitude (°N)
            </label>
            <input
              type="number"
              step="0.00001"
              className="input-control"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              disabled={disabled}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Longitude (°E)
            </label>
            <input
              type="number"
              step="0.00001"
              className="input-control"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
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
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
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

