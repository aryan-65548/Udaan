import React from 'react';
import type { InputType, PutInputPayload } from '../api/assessments';

interface DynamicInputRendererProps {
  inputKey: string;
  questionText?: string | null;
  inputType: InputType;
  value: {
    valueText?: string | null;
    valueNumber?: number | string | null;
    valueBoolean?: boolean | null;
    valueJson?: unknown;
  };
  options?: string[]; // For SELECT or MULTI_SELECT
  onChange: (payload: PutInputPayload) => void;
  disabled?: boolean;
}

export const DynamicInputRenderer: React.FC<DynamicInputRendererProps> = ({
  questionText,
  inputType,
  value,
  options = [],
  onChange,
  disabled = false,
}) => {
  switch (inputType) {
    case 'NUMBER':
      return (
        <div className="dynamic-input-field">
          <input
            type="number"
            className="input-control"
            value={value.valueNumber !== null && value.valueNumber !== undefined ? value.valueNumber : ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              onChange({
                questionText,
                inputType: 'NUMBER',
                valueNumber: val,
                source: 'USER',
              });
            }}
            disabled={disabled}
            placeholder="Enter number..."
          />
        </div>
      );

    case 'BOOLEAN':
      return (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className={`btn btn-sm ${value.valueBoolean === true ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() =>
              onChange({
                questionText,
                inputType: 'BOOLEAN',
                valueBoolean: true,
                source: 'USER',
              })
            }
            disabled={disabled}
          >
            Yes
          </button>
          <button
            type="button"
            className={`btn btn-sm ${value.valueBoolean === false ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() =>
              onChange({
                questionText,
                inputType: 'BOOLEAN',
                valueBoolean: false,
                source: 'USER',
              })
            }
            disabled={disabled}
          >
            No
          </button>
        </div>
      );

    case 'DATE':
      return (
        <div className="dynamic-input-field">
          <input
            type="date"
            className="input-control"
            value={value.valueText || ''}
            onChange={(e) =>
              onChange({
                questionText,
                inputType: 'DATE',
                valueText: e.target.value || null,
                source: 'USER',
              })
            }
            disabled={disabled}
          />
        </div>
      );

    case 'SELECT':
      return (
        <div className="dynamic-input-field">
          <select
            className="select-control"
            value={value.valueText || ''}
            onChange={(e) =>
              onChange({
                questionText,
                inputType: 'SELECT',
                valueText: e.target.value || null,
                source: 'USER',
              })
            }
            disabled={disabled}
          >
            <option value="">-- Select an option --</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case 'MULTI_SELECT': {
      let currentArray: string[] = [];
      if (Array.isArray(value.valueJson)) {
        currentArray = value.valueJson;
      } else if (typeof value.valueText === 'string') {
        currentArray = value.valueText.split(',').map((s) => s.trim()).filter(Boolean);
      }

      const toggleOption = (opt: string) => {
        const next = currentArray.includes(opt)
          ? currentArray.filter((x) => x !== opt)
          : [...currentArray, opt];
        onChange({
          questionText,
          inputType: 'MULTI_SELECT',
          valueJson: next,
          valueText: next.join(', '),
          source: 'USER',
        });
      };

      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {options.map((opt) => {
            const isChecked = currentArray.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                className={`btn btn-sm ${isChecked ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => toggleOption(opt)}
                disabled={disabled}
              >
                {isChecked ? '✓ ' : '+ '}
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    case 'JSON':
      return (
        <div className="dynamic-input-field">
          <textarea
            className="textarea-control"
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            value={
              typeof value.valueJson === 'object' && value.valueJson !== null
                ? JSON.stringify(value.valueJson, null, 2)
                : typeof value.valueJson === 'string'
                ? value.valueJson
                : ''
            }
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange({
                  questionText,
                  inputType: 'JSON',
                  valueJson: parsed,
                  source: 'USER',
                });
              } catch {
                // If invalid JSON during typing, store raw or wait
              }
            }}
            disabled={disabled}
            placeholder='{"key": "value"}'
          />
        </div>
      );

    case 'TEXT':
    default:
      return (
        <div className="dynamic-input-field">
          <input
            type="text"
            className="input-control"
            value={value.valueText || ''}
            onChange={(e) =>
              onChange({
                questionText,
                inputType: 'TEXT',
                valueText: e.target.value || null,
                source: 'USER',
              })
            }
            disabled={disabled}
            placeholder="Type your answer..."
          />
        </div>
      );
  }
};
