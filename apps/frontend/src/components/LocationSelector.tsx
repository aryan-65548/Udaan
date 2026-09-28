import React, { useState, useEffect, useRef } from 'react';
import {
  type LocationItem,
  getStates,
  getDistricts,
  getBlocks,
  getVillages,
  getLocationById,
} from '../api/locations';
import { useLanguage } from '../context/LanguageContext';
import { GoogleMapsLocationPicker } from './GoogleMapsLocationPicker';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Compass,
  Layers,
} from 'lucide-react';

interface LocationSelectorProps {
  value: string;
  onChange: (
    locationId: string,
    locationObj?: LocationItem,
    extraDetails?: {
      locationSelectionMethod?: 'ADMINISTRATIVE' | 'GOOGLE_MAPS';
      formattedAddress?: string;
      latitude?: number;
      longitude?: number;
      googlePlaceId?: string;
      stateName?: string;
      districtName?: string;
      blockName?: string;
      villageName?: string;
    }
  ) => void;
  disabled?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { t } = useLanguage();

  // Mode Selection: 'ADMINISTRATIVE' or 'GOOGLE_MAPS'
  const [selectionMode, setSelectionMode] = useState<'ADMINISTRATIVE' | 'GOOGLE_MAPS'>('ADMINISTRATIVE');

  // Dropdown options
  const [states, setStates] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [blocks, setBlocks] = useState<LocationItem[]>([]);
  const [villages, setVillages] = useState<LocationItem[]>([]);

  // Selected IDs
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');

  // Loading states
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);

  // Error states
  const [locationError, setLocationError] = useState<string | null>(null);

  // Village availability state
  const [hasNoVillages, setHasNoVillages] = useState(false);

  // Selected hierarchy display text
  const [selectedHierarchyText, setSelectedHierarchyText] = useState<string>('');

  // Request sequence tracking to prevent stale/out-of-order race conditions
  const districtReqSeq = useRef(0);
  const blockReqSeq = useRef(0);
  const villageReqSeq = useRef(0);

  // Load States on mount or retry
  const loadStatesList = () => {
    setIsLoadingStates(true);
    setLocationError(null);

    getStates()
      .then((data) => {
        setStates(data || []);
      })
      .catch((err) => {
        setLocationError(err.message || 'Failed to load states');
      })
      .finally(() => {
        setIsLoadingStates(false);
      });
  };

  useEffect(() => {
    loadStatesList();
  }, []);

  // Pre-populate dropdowns if an existing location ID is supplied
  useEffect(() => {
    if (!value) return;
    let mounted = true;

    getLocationById(value)
      .then(async (locWithHierarchy) => {
        if (!mounted) return;
        const hierarchy = locWithHierarchy.hierarchy || [];
        const stateItem =
          hierarchy.find((l) => l.type === 'STATE') ||
          (locWithHierarchy.type === 'STATE' ? locWithHierarchy : null);
        const districtItem =
          hierarchy.find((l) => l.type === 'DISTRICT') ||
          (locWithHierarchy.type === 'DISTRICT' ? locWithHierarchy : null);
        const blockItem =
          hierarchy.find((l) => l.type === 'BLOCK') ||
          (locWithHierarchy.type === 'BLOCK' ? locWithHierarchy : null);
        const villageItem =
          hierarchy.find((l) => l.type === 'VILLAGE') ||
          (locWithHierarchy.type === 'VILLAGE' ? locWithHierarchy : null);

        const names = [villageItem?.name, blockItem?.name, districtItem?.name, stateItem?.name]
          .filter(Boolean)
          .join(' → ');
        setSelectedHierarchyText(names || locWithHierarchy.name);

        if (stateItem) {
          setSelectedStateId(stateItem.id);
          try {
            const dList = await getDistricts(stateItem.id);
            if (mounted) setDistricts(dList || []);
          } catch {
            // Non-fatal
          }
        }
        if (districtItem) {
          setSelectedDistrictId(districtItem.id);
          try {
            const bList = await getBlocks(districtItem.id);
            if (mounted) setBlocks(bList || []);
          } catch {
            // Non-fatal
          }
        }
        if (blockItem) {
          setSelectedBlockId(blockItem.id);
          try {
            const vList = await getVillages(blockItem.id);
            if (mounted) {
              setVillages(vList || []);
              setHasNoVillages(!vList || vList.length === 0);
            }
          } catch {
            // Non-fatal
          }
        }
        if (villageItem) {
          setSelectedVillageId(villageItem.id);
        }
      })
      .catch((err) => {
        console.warn('Could not load hierarchy for location:', value, err);
      });

    return () => {
      mounted = false;
    };
  }, [value]);

  // Handle State selection
  const handleStateChange = async (stateId: string) => {
    setSelectedStateId(stateId);
    setSelectedDistrictId('');
    setSelectedBlockId('');
    setSelectedVillageId('');
    setDistricts([]);
    setBlocks([]);
    setVillages([]);
    setHasNoVillages(false);
    setLocationError(null);

    if (!stateId) {
      setSelectedHierarchyText('');
      onChange('');
      return;
    }

    const stateObj = states.find((s) => s.id === stateId);
    if (stateObj) {
      setSelectedHierarchyText(stateObj.name);
      onChange(stateObj.id, stateObj, {
        locationSelectionMethod: 'ADMINISTRATIVE',
        stateName: stateObj.name,
      });
    }

    const seq = ++districtReqSeq.current;
    setIsLoadingDistricts(true);
    try {
      const data = await getDistricts(stateId);
      if (seq === districtReqSeq.current) {
        setDistricts(data || []);
      }
    } catch (err: any) {
      if (seq === districtReqSeq.current) {
        setLocationError(err.message || 'Failed to load districts');
      }
    } finally {
      if (seq === districtReqSeq.current) {
        setIsLoadingDistricts(false);
      }
    }
  };

  // Handle District selection
  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedBlockId('');
    setSelectedVillageId('');
    setBlocks([]);
    setVillages([]);
    setHasNoVillages(false);
    setLocationError(null);

    const stateObj = states.find((s) => s.id === selectedStateId);
    const districtObj = districts.find((d) => d.id === districtId);

    if (!districtId) {
      if (stateObj) {
        setSelectedHierarchyText(stateObj.name);
        onChange(stateObj.id, stateObj, {
          locationSelectionMethod: 'ADMINISTRATIVE',
          stateName: stateObj.name,
        });
      }
      return;
    }

    if (districtObj && stateObj) {
      setSelectedHierarchyText(`${districtObj.name}, ${stateObj.name}`);
      onChange(districtObj.id, districtObj, {
        locationSelectionMethod: 'ADMINISTRATIVE',
        stateName: stateObj.name,
        districtName: districtObj.name,
      });
    }

    const seq = ++blockReqSeq.current;
    setIsLoadingBlocks(true);
    try {
      const data = await getBlocks(districtId);
      if (seq === blockReqSeq.current) {
        setBlocks(data || []);
      }
    } catch (err: any) {
      if (seq === blockReqSeq.current) {
        setLocationError(err.message || 'Failed to load talukas/blocks');
      }
    } finally {
      if (seq === blockReqSeq.current) {
        setIsLoadingBlocks(false);
      }
    }
  };

  // Handle Block selection
  const handleBlockChange = async (blockId: string) => {
    setSelectedBlockId(blockId);
    setSelectedVillageId('');
    setVillages([]);
    setHasNoVillages(false);
    setLocationError(null);

    const stateObj = states.find((s) => s.id === selectedStateId);
    const districtObj = districts.find((d) => d.id === selectedDistrictId);
    const blockObj = blocks.find((b) => b.id === blockId);

    if (!blockId) {
      if (districtObj && stateObj) {
        setSelectedHierarchyText(`${districtObj.name}, ${stateObj.name}`);
        onChange(districtObj.id, districtObj, {
          locationSelectionMethod: 'ADMINISTRATIVE',
          stateName: stateObj.name,
          districtName: districtObj.name,
        });
      }
      return;
    }

    if (blockObj && districtObj && stateObj) {
      setSelectedHierarchyText(`${blockObj.name} → ${districtObj.name}, ${stateObj.name}`);
      onChange(blockObj.id, blockObj, {
        locationSelectionMethod: 'ADMINISTRATIVE',
        stateName: stateObj.name,
        districtName: districtObj.name,
        blockName: blockObj.name,
      });
    }

    const seq = ++villageReqSeq.current;
    setIsLoadingVillages(true);
    try {
      const data = await getVillages(blockId);
      if (seq === villageReqSeq.current) {
        setVillages(data || []);
        setHasNoVillages(!data || data.length === 0);
      }
    } catch (err: any) {
      if (seq === villageReqSeq.current) {
        setLocationError(err.message || 'Failed to load villages');
      }
    } finally {
      if (seq === villageReqSeq.current) {
        setIsLoadingVillages(false);
      }
    }
  };

  // Handle Village selection
  const handleVillageChange = (villageId: string) => {
    setSelectedVillageId(villageId);

    const stateObj = states.find((s) => s.id === selectedStateId);
    const districtObj = districts.find((d) => d.id === selectedDistrictId);
    const blockObj = blocks.find((b) => b.id === selectedBlockId);
    const villageObj = villages.find((v) => v.id === villageId);

    if (!villageId) {
      if (blockObj && districtObj && stateObj) {
        setSelectedHierarchyText(`${blockObj.name} → ${districtObj.name}, ${stateObj.name}`);
        onChange(blockObj.id, blockObj, {
          locationSelectionMethod: 'ADMINISTRATIVE',
          stateName: stateObj.name,
          districtName: districtObj.name,
          blockName: blockObj.name,
        });
      }
      return;
    }

    if (villageObj && blockObj && districtObj && stateObj) {
      setSelectedHierarchyText(
        `${villageObj.name} → ${blockObj.name} → ${districtObj.name}, ${stateObj.name}`
      );
      onChange(villageObj.id, villageObj, {
        locationSelectionMethod: 'ADMINISTRATIVE',
        stateName: stateObj.name,
        districtName: districtObj.name,
        blockName: blockObj.name,
        villageName: villageObj.name,
        latitude: villageObj.latitude ? Number(villageObj.latitude) : undefined,
        longitude: villageObj.longitude ? Number(villageObj.longitude) : undefined,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Method Switcher: Administrative vs Google Maps */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: 'var(--bg-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          onClick={() => setSelectionMode('ADMINISTRATIVE')}
          disabled={disabled}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: selectionMode === 'ADMINISTRATIVE' ? 'var(--brand-green)' : 'transparent',
            color: selectionMode === 'ADMINISTRATIVE' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: selectionMode === 'ADMINISTRATIVE' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={15} />
          <span>Administrative Hierarchy</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectionMode('GOOGLE_MAPS')}
          disabled={disabled}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: selectionMode === 'GOOGLE_MAPS' ? 'var(--brand-green)' : 'transparent',
            color: selectionMode === 'GOOGLE_MAPS' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: selectionMode === 'GOOGLE_MAPS' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <Compass size={15} />
          <span>Select on Google Maps</span>
        </button>
      </div>

      {/* OPTION 1: ADMINISTRATIVE DROPDOWNS */}
      {selectionMode === 'ADMINISTRATIVE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {locationError && (
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
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{locationError}</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={loadStatesList}
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
              >
                <RefreshCw size={12} />
                <span>Retry</span>
              </button>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            {/* 1. State Selector */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{t.state || 'State / UT'} <span style={{ color: 'var(--brand-red)' }}>*</span></span>
                {isLoadingStates && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loading...</span>}
              </label>
              <select
                className="select-control"
                value={selectedStateId}
                onChange={(e) => handleStateChange(e.target.value)}
                disabled={disabled || isLoadingStates}
              >
                <option value="">-- Select State / UT --</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.stateCode ? `(${s.stateCode})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. District Selector */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{t.district || 'District / City'} <span style={{ color: 'var(--brand-red)' }}>*</span></span>
                {isLoadingDistricts && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loading...</span>}
              </label>
              <select
                className="select-control"
                value={selectedDistrictId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={disabled || !selectedStateId || isLoadingDistricts}
              >
                <option value="">
                  {!selectedStateId ? 'First select State' : '-- Select District / City --'}
                </option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Block / Taluka Selector */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{t.block || 'Taluka / Block / Sub-District'}</span>
                {isLoadingBlocks && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loading...</span>}
              </label>
              <select
                className="select-control"
                value={selectedBlockId}
                onChange={(e) => handleBlockChange(e.target.value)}
                disabled={disabled || !selectedDistrictId || isLoadingBlocks}
              >
                <option value="">
                  {!selectedDistrictId ? 'First select District' : '-- Select Taluka / Block --'}
                </option>
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Village / Town Selector */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{t.village || 'Village / Town / Locality'}</span>
                {isLoadingVillages && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loading...</span>}
              </label>
              <select
                className="select-control"
                value={selectedVillageId}
                onChange={(e) => handleVillageChange(e.target.value)}
                disabled={disabled || !selectedBlockId || isLoadingVillages || hasNoVillages}
              >
                <option value="">
                  {!selectedBlockId
                    ? 'First select Taluka/Block'
                    : hasNoVillages
                    ? 'No specific village listed (taluka selected)'
                    : '-- Select Village / Town --'}
                </option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Administrative Summary Pill */}
          {selectedHierarchyText && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem',
                color: 'var(--text-main)',
              }}
            >
              <CheckCircle2 size={16} color="var(--brand-green)" />
              <span><strong>Selected Location:</strong> {selectedHierarchyText}</span>
            </div>
          )}
        </div>
      )}

      {/* OPTION 2: GOOGLE MAPS LOCATION PICKER */}
      {selectionMode === 'GOOGLE_MAPS' && (
        <GoogleMapsLocationPicker
          onLocationConfirmed={(locId, locObj, extraDetails) => {
            setSelectedHierarchyText(extraDetails?.formattedAddress || locObj.name);
            onChange(locId, locObj, {
              ...extraDetails,
              locationSelectionMethod: 'GOOGLE_MAPS',
            });
          }}
          onSwitchToAdministrative={() => setSelectionMode('ADMINISTRATIVE')}
          disabled={disabled}
        />
      )}
    </div>
  );
};
