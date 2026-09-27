import React, { useState, useEffect } from 'react';
import { type BusinessCategoryItem, getBusinessCategories } from '../api/businessCategories';
import { useLanguage } from '../context/LanguageContext';
import { Briefcase, CheckCircle2, PlusCircle, AlertCircle } from 'lucide-react';

interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string, categoryObj?: BusinessCategoryItem) => void;
  customCategory?: string;
  onCustomCategoryChange?: (custom: string) => void;
  disabled?: boolean;
}

// Category translations mapping for display
const CATEGORY_NAMES: Record<string, { hi: string; gu: string }> = {
  DAIRY_FARMING: { hi: 'डेयरी फार्मिंग (दुग्ध उत्पादन)', gu: 'ડેરી ફાર્મિંગ (દૂધ ઉત્પાદન)' },
  GROCERY_RETAIL: { hi: 'किराना दुकान / खुदरा व्यापार', gu: 'કરીયાણાની દુકાન / રીટેલ સ્ટોર' },
  TAILORING: { hi: 'सिलाई एवं वस्त्र निर्माण', gu: 'દરજીકામ અને કપડાં નિર્માણ' },
  FOOD_PROCESSING: { hi: 'लघु खाद्य प्रसंस्करण (पापड़, आटा, मसाले)', gu: 'નાના પાયે ફૂડ પ્રોસેસિંગ (પાપડ, લોટ, મસાલા)' },
  MOBILE_REPAIR: { hi: 'मोबाइल एवं इलेक्ट्रॉनिक्स मरम्मत', gu: 'મોબાઇલ અને ઇલેક્ટ્રોનિક્સ રીપેરીંગ' },
  TRANSPORT: { hi: 'ग्रामीण परिवहन एवं लॉजिस्टिक्स (ऑटो/रिक्शा)', gu: 'ગ્રામીણ પરિવહન અને લોજિસ્ટિક્સ (ઓટો/રીક્ષા)' },
  SMALL_MANUFACTURING: { hi: 'लघु विनिर्माण एवं कार्यशाला (वेल्डिंग/शिल्प)', gu: 'નાના ઉત્પાદન અને વર્કશોપ (વેલ્ડીંગ/શિલ્પ)' },
  AGRICULTURE_SERVICE: { hi: 'कृषि उपकरण एवं खाद-बीज सेवाएं', gu: 'કૃષિ સાધનો અને ખાતર-બિયારણ સેવાઓ' },
  OTHER: { hi: 'अन्य / नया व्यवसाय विचार', gu: 'અન્ય / નવો બિઝનેસ વિચાર' },
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  customCategory = '',
  onCustomCategoryChange,
  disabled = false,
}) => {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<BusinessCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getBusinessCategories()
      .then((data) => {
        if (!mounted) return;
        // Ensure OTHER exists in the list
        const hasOther = data.some((c) => c.code === 'OTHER');
        if (!hasOther) {
          data.push({
            id: 'b1000000-0000-0000-0000-000000000009',
            code: 'OTHER',
            name: 'Other',
            description: 'Other business idea or custom micro-enterprise',
            isActive: true,
            sortOrder: 9,
            createdAt: new Date().toISOString(),
          });
        }
        setCategories(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to load business categories');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedCategory = categories.find((c) => c.id === value);
  const isOtherSelected = selectedCategory?.code === 'OTHER' || selectedCategory?.name?.toLowerCase() === 'other';

  const getLocalizedName = (cat: BusinessCategoryItem) => {
    const code = cat.code || '';
    if (language === 'hi' && code && CATEGORY_NAMES[code]?.hi) {
      return CATEGORY_NAMES[code].hi;
    }
    if (language === 'gu' && code && CATEGORY_NAMES[code]?.gu) {
      return CATEGORY_NAMES[code].gu;
    }
    return cat.name;
  };

  if (isLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ marginBottom: '8px' }} />
        <div>{t.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '12px',
          marginBottom: isOtherSelected ? '16px' : '0',
        }}
      >
        {categories.map((cat) => {
          const isSelected = value === cat.id;
          const isOther = cat.code === 'OTHER';

          return (
            <div
              key={cat.id}
              onClick={() => !disabled && onChange(cat.id, cat)}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${isSelected ? 'var(--brand-green)' : 'var(--border-light)'}`,
                background: isSelected ? 'var(--brand-green-light)' : 'var(--bg-surface)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: isSelected ? '0 4px 12px rgba(5, 150, 105, 0.15)' : 'none',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isSelected ? 'var(--brand-green)' : 'var(--bg-subtle)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isOther ? <PlusCircle size={16} /> : <Briefcase size={16} />}
                  </div>
                  {isSelected && <CheckCircle2 size={18} color="var(--brand-green)" />}
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {getLocalizedName(cat)}
                </div>

                {cat.description && !isOther && (
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.4,
                    }}
                  >
                    {cat.description}
                  </div>
                )}
                {isOther && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {t.otherCategory}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* When Other is selected, show Custom Category text input */}
      {isOtherSelected && (
        <div
          style={{
            marginTop: '16px',
            background: 'var(--bg-subtle)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
          }}
        >
          <label className="form-label" style={{ marginBottom: '6px' }}>
            {t.customCategoryLabel} <span className="required">*</span>
          </label>
          <input
            type="text"
            className="input-control"
            value={customCategory}
            onChange={(e) => onCustomCategoryChange && onCustomCategoryChange(e.target.value)}
            placeholder={t.customCategoryPlaceholder}
            disabled={disabled}
            required
            autoFocus
          />
          {!customCategory.trim() && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
                fontSize: '0.8rem',
                color: '#d97706',
              }}
            >
              <AlertCircle size={14} />
              <span>{t.customCategoryRequired}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
