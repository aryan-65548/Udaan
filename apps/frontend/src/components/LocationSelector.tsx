import React, { useState, useEffect } from 'react';
import {
  type LocationItem,
  getStates,
  getDistricts,
  getBlocks,
  getVillages,
  getLocationById,
} from '../api/locations';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, CheckCircle2 } from 'lucide-react';

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

  const [states, setStates] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [blocks, setBlocks] = useState<LocationItem[]>([]);
  const [villages, setVillages] = useState<LocationItem[]>([]);

  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');

  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);

  const [selectedHierarchyText, setSelectedHierarchyText] = useState<string>('');

  // Initial load: Fetch states
  useEffect(() => {
    let mounted = true;
    setIsLoadingStates(true);
    getStates()
      .then((data) => {
        if (mounted) {
          setStates(data);
          // If no value is pre-selected and there is only 1 state or states exist, let user pick
        }
      })
      .catch((err) => console.error('Failed to load states', err))
      .finally(() => {
        if (mounted) setIsLoadingStates(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Pre-populate if existing value is supplied
  useEffect(() => {
    if (!value) return;
    let mounted = true;
    getLocationById(value)
      .then(async (locWithHierarchy) => {
        if (!mounted) return;
        const hierarchy = locWithHierarchy.hierarchy || [];
        const stateItem = hierarchy.find((l) => l.type === 'STATE') || (locWithHierarchy.type === 'STATE' ? locWithHierarchy : null);
        const districtItem = hierarchy.find((l) => l.type === 'DISTRICT') || (locWithHierarchy.type === 'DISTRICT' ? locWithHierarchy : null);
        const blockItem = hierarchy.find((l) => l.type === 'BLOCK') || (locWithHierarchy.type === 'BLOCK' ? locWithHierarchy : null);
        const villageItem = hierarchy.find((l) => l.type === 'VILLAGE') || (locWithHierarchy.type === 'VILLAGE' ? locWithHierarchy : null);

        setSelectedHierarchyText(
          [villageItem?.name, blockItem?.name, districtItem?.name, stateItem?.name]
            .filter(Boolean)
            .join(' → ')
        );

        if (stateItem) {
          setSelectedStateId(stateItem.id);
          const dList = await getDistricts(stateItem.id);
          if (mounted) setDistricts(dList);
        }
        if (districtItem) {
          setSelectedDistrictId(districtItem.id);
          const bList = await getBlocks(districtItem.id);
          if (mounted) setBlocks(bList);
        }
        if (blockItem) {
          setSelectedBlockId(blockItem.id);
          const vList = await getVillages(blockItem.id);
          if (mounted) setVillages(vList);
        }
        if (villageItem) {
          setSelectedVillageId(villageItem.id);
        }
      })
      .catch((err) => console.error('Failed to resolve initial location hierarchy', err));

    return () => {
      mounted = false;
    };
  }, [value]);

  const handleStateChange = async (stateId: string) => {
    setSelectedStateId(stateId);
    setSelectedDistrictId('');
    setSelectedBlockId('');
    setSelectedVillageId('');
    setDistricts([]);
    setBlocks([]);
    setVillages([]);

    if (!stateId) {
      onChange('');
      return;
    }

    const stateObj = states.find((s) => s.id === stateId);
    onChange(stateId, stateObj);

    setIsLoadingDistricts(true);
    try {
      const data = await getDistricts(stateId);
      setDistricts(data);
    } catch (err) {
      console.error('Failed to load districts', err);
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedBlockId('');
    setSelectedVillageId('');
    setBlocks([]);
    setVillages([]);

    if (!districtId) {
      onChange(selectedStateId);
      return;
    }

    const distObj = districts.find((d) => d.id === districtId);
    onChange(districtId, distObj);

    setIsLoadingBlocks(true);
    try {
      const data = await getBlocks(districtId);
      setBlocks(data);
    } catch (err) {
      console.error('Failed to load blocks', err);
    } finally {
      setIsLoadingBlocks(false);
    }
  };

  const handleBlockChange = async (blockId: string) => {
    setSelectedBlockId(blockId);
    setSelectedVillageId('');
    setVillages([]);

    if (!blockId) {
      onChange(selectedDistrictId);
      return;
    }

    const blockObj = blocks.find((b) => b.id === blockId);
    onChange(blockId, blockObj);

    setIsLoadingVillages(true);
    try {
      const data = await getVillages(blockId);
      setVillages(data);
    } catch (err) {
      console.error('Failed to load villages', err);
    } finally {
      setIsLoadingVillages(false);
    }
  };

  const handleVillageChange = (villageId: string) => {
    setSelectedVillageId(villageId);
    if (!villageId) {
      onChange(selectedBlockId);
      return;
    }
    const villageObj = villages.find((v) => v.id === villageId);
    onChange(villageId, villageObj);
  };

  return (
    <div className="location-selector-box">
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
            <option value="">{isLoadingStates ? 'Loading states...' : t.selectState}</option>
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
              {isLoadingDistricts ? 'Loading districts...' : t.selectDistrict}
            </option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Block */}
        <div className="form-group">
          <label className="form-label">{t.block}</label>
          <select
            className="select-control"
            value={selectedBlockId}
            onChange={(e) => handleBlockChange(e.target.value)}
            disabled={disabled || !selectedDistrictId || isLoadingBlocks}
          >
            <option value="">
              {isLoadingBlocks ? 'Loading blocks...' : t.selectBlock}
            </option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Village */}
        <div className="form-group">
          <label className="form-label">{t.village}</label>
          <select
            className="select-control"
            value={selectedVillageId}
            onChange={(e) => handleVillageChange(e.target.value)}
            disabled={disabled || !selectedBlockId || isLoadingVillages}
          >
            <option value="">
              {isLoadingVillages ? 'Loading villages...' : t.selectVillage}
            </option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {value && selectedHierarchyText && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
          }}
        >
          <MapPin size={16} color="var(--brand-green)" />
          <span>
            <strong>Selected:</strong> {selectedHierarchyText}
          </span>
          <CheckCircle2 size={16} color="var(--brand-green)" style={{ marginLeft: 'auto' }} />
        </div>
      )}
    </div>
  );
};
