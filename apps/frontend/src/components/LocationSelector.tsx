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
import { MapPin, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface LocationSelectorProps {
  value: string;
  onChange: (locationId: string, locationObj?: LocationItem) => void;
  disabled?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { t } = useLanguage();

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

  // Load States on mount
  useEffect(() => {
    let mounted = true;
    setIsLoadingStates(true);
    setLocationError(null);

    getStates()
      .then((data) => {
        if (!mounted) return;
        setStates(data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setLocationError(err.message || 'Failed to load states');
      })
      .finally(() => {
        if (mounted) setIsLoadingStates(false);
      });

    return () => {
      mounted = false;
    };
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
      onChange('');
      setSelectedHierarchyText('');
      return;
    }

    const stateObj = states.find((s) => s.id === stateId);
    onChange(stateId, stateObj);
    setSelectedHierarchyText(stateObj?.name || '');

    const currentSeq = ++districtReqSeq.current;
    setIsLoadingDistricts(true);

    try {
      const data = await getDistricts(stateId);
      if (currentSeq !== districtReqSeq.current) return; // Discard stale response
      setDistricts(data || []);
    } catch (err: any) {
      if (currentSeq !== districtReqSeq.current) return;
      setLocationError(err.message || 'Failed to load districts');
    } finally {
      if (currentSeq === districtReqSeq.current) {
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

    if (!districtId) {
      onChange(selectedStateId, stateObj);
      setSelectedHierarchyText(stateObj?.name || '');
      return;
    }

    const distObj = districts.find((d) => d.id === districtId);
    onChange(districtId, distObj);
    setSelectedHierarchyText([distObj?.name, stateObj?.name].filter(Boolean).join(' → '));

    const currentSeq = ++blockReqSeq.current;
    setIsLoadingBlocks(true);

    try {
      const data = await getBlocks(districtId);
      if (currentSeq !== blockReqSeq.current) return; // Discard stale response
      setBlocks(data || []);
    } catch (err: any) {
      if (currentSeq !== blockReqSeq.current) return;
      setLocationError(err.message || 'Failed to load blocks');
    } finally {
      if (currentSeq === blockReqSeq.current) {
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

    const distObj = districts.find((d) => d.id === selectedDistrictId);
    const stateObj = states.find((s) => s.id === selectedStateId);

    if (!blockId) {
      onChange(selectedDistrictId, distObj);
      setSelectedHierarchyText([distObj?.name, stateObj?.name].filter(Boolean).join(' → '));
      return;
    }

    const blockObj = blocks.find((b) => b.id === blockId);
    onChange(blockId, blockObj);
    setSelectedHierarchyText([blockObj?.name, distObj?.name, stateObj?.name].filter(Boolean).join(' → '));

    const currentSeq = ++villageReqSeq.current;
    setIsLoadingVillages(true);

    try {
      const data = await getVillages(blockId);
      if (currentSeq !== villageReqSeq.current) return; // Discard stale response
      if (data && data.length > 0) {
        setVillages(data);
        setHasNoVillages(false);
      } else {
        setVillages([]);
        setHasNoVillages(true);
      }
    } catch (err: any) {
      if (currentSeq !== villageReqSeq.current) return;
      setLocationError(err.message || 'Failed to load villages');
    } finally {
      if (currentSeq === villageReqSeq.current) {
        setIsLoadingVillages(false);
      }
    }
  };

  // Handle Village selection
  const handleVillageChange = async (villageId: string) => {
    setSelectedVillageId(villageId);
    const blockObj = blocks.find((b) => b.id === selectedBlockId);
    const distObj = districts.find((d) => d.id === selectedDistrictId);
    const stateObj = states.find((s) => s.id === selectedStateId);

    if (!villageId) {
      onChange(selectedBlockId, blockObj);
      setSelectedHierarchyText([blockObj?.name, distObj?.name, stateObj?.name].filter(Boolean).join(' → '));
      return;
    }

    const villageObj = villages.find((v) => v.id === villageId);
    onChange(villageId, villageObj);
    setSelectedHierarchyText(
      [villageObj?.name, blockObj?.name, distObj?.name, stateObj?.name].filter(Boolean).join(' → ')
    );
  };

  return (
    <div className="location-selector-box">
      {locationError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fef2f2',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '14px',
            border: '1px solid #fecaca',
          }}
        >
          <AlertCircle size={16} />
          <span>{locationError}</span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (!selectedStateId) {
                getStates().then(setStates);
              } else if (!selectedDistrictId) {
                handleStateChange(selectedStateId);
              } else if (!selectedBlockId) {
                handleDistrictChange(selectedDistrictId);
              } else {
                handleBlockChange(selectedBlockId);
              }
            }}
            style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: '0.75rem' }}
          >
            <RefreshCw size={12} />
            <span>{t.refresh}</span>
          </button>
        </div>
      )}

      {/* Cascading Dropdowns */}
      <div className="grid-2">
        {/* State */}
        <div className="form-group">
          <label className="form-label">
            {t.state} <span className="required">*</span>
          </label>
          <select
            className="select-control"
            value={selectedStateId}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={disabled || isLoadingStates}
          >
            <option value="">{isLoadingStates ? t.loading : t.selectState}</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div className="form-group">
          <label className="form-label">
            {t.district} <span className="required">*</span>
          </label>
          <select
            className="select-control"
            value={selectedDistrictId}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={disabled || !selectedStateId || isLoadingDistricts}
          >
            <option value="">
              {isLoadingDistricts ? `${t.loading}...` : t.selectDistrict}
            </option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Block / Taluka */}
        <div className="form-group">
          <label className="form-label">{t.block}</label>
          <select
            className="select-control"
            value={selectedBlockId}
            onChange={(e) => handleBlockChange(e.target.value)}
            disabled={disabled || !selectedDistrictId || isLoadingBlocks}
          >
            <option value="">
              {isLoadingBlocks ? `${t.loading}...` : t.selectBlock}
            </option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Village / Town */}
        <div className="form-group">
          <label className="form-label">{t.village}</label>
          <select
            className="select-control"
            value={selectedVillageId}
            onChange={(e) => handleVillageChange(e.target.value)}
            disabled={disabled || !selectedBlockId || isLoadingVillages || hasNoVillages}
          >
            <option value="">
              {isLoadingVillages
                ? `${t.loading}...`
                : hasNoVillages
                ? t.noVillagesAvailable
                : t.selectVillage}
            </option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          {hasNoVillages && selectedBlockId && !isLoadingVillages && (
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{t.savedAtBlockLevel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Selected Location Summary Indicator */}
      {selectedHierarchyText && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: 'var(--brand-green-light)',
            border: '1px solid var(--brand-green-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-main)',
          }}
        >
          <MapPin size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
          <span>
            <strong>{t.selectedLocationText}</strong> {selectedHierarchyText}
          </span>
          <CheckCircle2 size={16} color="var(--brand-green)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
        </div>
      )}
    </div>
  );
};


