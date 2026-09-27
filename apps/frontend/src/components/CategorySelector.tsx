import React, { useState, useEffect } from 'react';
import { type BusinessCategoryItem, getBusinessCategories } from '../api/businessCategories';
import { Briefcase, CheckCircle2 } from 'lucide-react';

interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string, categoryObj?: BusinessCategoryItem) => void;
  disabled?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [categories, setCategories] = useState<BusinessCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getBusinessCategories()
      .then((data) => {
        if (mounted) {
          setCategories(data);
        }
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

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ marginBottom: '8px' }} />
        <div>Loading business categories...</div>
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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '12px',
      }}
    >
      {categories.map((cat) => {
        const isSelected = value === cat.id;

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
                  <Briefcase size={16} />
                </div>
                {isSelected && <CheckCircle2 size={18} color="var(--brand-green)" />}
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                {cat.name}
              </div>

              {cat.description && (
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
            </div>
          </div>
        );
      })}
    </div>
  );
};
