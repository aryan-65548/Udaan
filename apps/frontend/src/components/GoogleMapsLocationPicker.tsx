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

  // Missing API Key fallback state
  if (!apiKey) {
    return (
      <div
        className="card"
        style={{
          padding: '24px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--brand-gold)', marginBottom: '10px' }}>
          <Compass size={24} />
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Google Maps Key Configuration</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '16px' }}>
          Google Maps integration requires a browser API key configured in your <code>.env</code> file via <code>VITE_GOOGLE_MAPS_API_KEY</code>.
          You can use the comprehensive Administrative selection method below without needing any API key.
        </p>

        {onSwitchToAdministrative && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSwitchToAdministrative}
          >
            <MapPin size={16} />
            <span>Use Administrative Dropdown Selection</span>
          </button>
        )}
      </div>
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
