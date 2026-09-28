import React, { useState } from 'react';
import {
  type CalculateFinanceResponse,
  type FullFinanceResult,
  type RepaymentScheduleItem,
} from '../api/finance';
import {
  Calculator,
  ShieldCheck,
  AlertCircle,
  Table,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface FinancialReportBreakdownProps {
  financeData: CalculateFinanceResponse | null;
  isLoading?: boolean;
  userEnteredProjectCost?: number | '';
  userEnteredOwnContribution?: number | '';
  availableFunds?: number | '';
}

/**
 * Format currency strictly in Indian Rupee format.
 * Prevents NaN, null, undefined, or Infinity from breaking the UI.
 */
export function formatInr(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '—';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num) || !isFinite(num)) return '—';
  return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export const FinancialReportBreakdown: React.FC<FinancialReportBreakdownProps> = ({
  financeData,
  isLoading = false,
  userEnteredProjectCost,
}) => {
  const [showSchedule, setShowSchedule] = useState(false);

  if (isLoading) {
    return (
      <div
        style={{
          padding: '32px 20px',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
        }}
      >
        <div className="spinner" style={{ width: '28px', height: '28px', margin: '0 auto 12px' }} />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Calculating official scheme financing parameters...
        </div>
      </div>
    );
  }

  const numProjectCost =
    userEnteredProjectCost !== undefined && userEnteredProjectCost !== ''
      ? Number(userEnteredProjectCost)
      : null;

  // If project is explicitly marked not eligible or cost > 50L
  if (financeData?.status === 'NOT_ELIGIBLE' || (numProjectCost !== null && numProjectCost > 5000000)) {
    return (
      <div
        style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '8px' }}>
          <AlertCircle size={22} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            Project Not Eligible for Scheme Financing
          </h3>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
          {financeData?.message ||
            'Total project cost exceeds the maximum eligible ceiling of ₹50,00,000 (50 Lakhs) under available government-assisted schemes.'}
        </p>
        <div
          style={{
            fontSize: '0.85rem',
            background: 'var(--bg-surface)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          <strong>Allowed Ranges:</strong>
          <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
            <li><strong>Micro Finance Scheme:</strong> ₹1 to ₹1,40,000 (Max Loan: ₹1,25,000)</li>
            <li><strong>Term Loan Scheme:</strong> ₹1,40,001 to ₹50,00,000 (Max Loan: ₹45,00,000)</li>
          </ul>
        </div>
      </div>
    );
  }

  const result: FullFinanceResult | undefined = financeData?.financeResult;
  const schemeCode = financeData?.schemeCode;
  const schemeName = financeData?.schemeName || (schemeCode === 'MICRO_FINANCE' ? 'Micro Finance Scheme' : schemeCode === 'TERM_LOAN' ? 'Term Loan Scheme' : 'Government-Assisted Loan');

  if (!result) {
    // If no backend result computed yet, display prompt
    return (
      <div
        style={{
          background: 'var(--bg-subtle)',
          border: '1px dashed var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          marginBottom: '20px',
        }}
      >
        <Calculator size={32} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
          Financial Feasibility Engine
        </div>
        <div style={{ fontSize: '0.85rem' }}>
          Enter project cost and own contribution above to calculate scheme eligibility, loan amount, and quarterly repayment terms.
        </div>
      </div>
    );
  }

  const ls = result.loanStructure;
  const dscr = result.dscrResult;
  const numShortfall = Number(ls.shortfall || 0);
  const isShortfall = numShortfall > 0;
  const schedule: RepaymentScheduleItem[] = result.schedule || [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginBottom: '24px',
      }}
    >
      {/* ========================================================================= */}
      {/* SECTION 1: SCHEME ELIGIBILITY */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '16px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--brand-green-light)',
                color: 'var(--brand-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              1
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Section 1: Scheme Eligibility
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Deterministic regulatory scheme matching
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: 'var(--brand-green-light)',
                color: 'var(--brand-green-dark, var(--brand-green))',
                border: '1px solid var(--brand-green-border, var(--border-light))',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={14} />
              {schemeName} ({schemeCode})
            </span>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#059669',
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Eligible
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Scheme Bracket</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {schemeCode === 'MICRO_FINANCE' ? '₹1 to ₹1,40,000' : '₹1,40,001 to ₹50,00,000'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Standard Financing Ratio</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              90% of Project Cost
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Scheme Loan Cap</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {schemeCode === 'MICRO_FINANCE' ? '₹1,25,000 Maximum' : '₹45,00,000 Maximum'}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: LOAN STRUCTURE & CONTRIBUTIONS */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--brand-green-light)',
              color: 'var(--brand-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            2
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Section 2: Loan Structure & Own Contribution
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Cap-aware loan amount and minimum margin requirement
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              padding: '14px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Total Proposed Project Cost
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              ₹{formatInr(ls.projectCost)}
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              background: 'var(--brand-green-light)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--brand-green-border, var(--border-light))',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--brand-green-dark, var(--text-secondary))', marginBottom: '4px' }}>
              Final Scheme-Eligible Loan Amount
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-green)' }}>
              ₹{formatInr(ls.loanAmount)}
            </div>
            {Number(ls.baseLoanAmount) > Number(ls.loanAmount) && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                (Capped from 90% base: ₹{formatInr(ls.baseLoanAmount)})
              </div>
            )}
          </div>

          <div
            style={{
              padding: '14px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Required Own Contribution
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              ₹{formatInr(ls.requiredOwnContribution)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              (Project Cost minus Eligible Loan)
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              background: isShortfall ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${isShortfall ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-light)'}`,
            }}
          >
            <div style={{ fontSize: '0.8rem', color: isShortfall ? '#dc2626' : 'var(--text-muted)', marginBottom: '4px' }}>
              Contribution Margin Status
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isShortfall ? '#dc2626' : 'var(--brand-green)' }}>
              {isShortfall ? `₹${formatInr(ls.shortfall)} Shortfall` : 'Margin Fully Met'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Stated: ₹{formatInr(ls.availableMarginCapital)}
            </div>
          </div>
        </div>

        {/* Shortfall Alert Notice */}
        {isShortfall ? (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(245, 158, 11, 0.09)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 'var(--radius-sm)',
              color: '#b45309',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: 1.45,
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Margin Shortfall Notice:</strong> You entered an own contribution of ₹{formatInr(ls.availableMarginCapital)}, which is ₹{formatInr(ls.shortfall)} less than the mandatory ₹{formatInr(ls.requiredOwnContribution)} minimum own contribution required for a project cost of ₹{formatInr(ls.projectCost)}.
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--brand-green-light)',
              border: '1px solid var(--brand-green-border, var(--border-light))',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--brand-green)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <ShieldCheck size={18} />
            <span>
              <strong>Minimum Margin Requirement Satisfied:</strong> Your available contribution of ₹{formatInr(ls.availableMarginCapital)} meets or exceeds the required margin.
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: REPAYMENT TERMS */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--brand-green-light)',
              color: 'var(--brand-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            3
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Section 3: Repayment Terms
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Quarterly amortization rate, tenure, and moratorium specifications
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Annual Interest Rate</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              {result.annualInterestRate ? `${result.annualInterestRate}% p.a.` : schemeCode === 'MICRO_FINANCE' ? '6.5% p.a.' : '8.0% p.a.'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Quarterly Periodic: {schemeCode === 'MICRO_FINANCE' ? '1.625%' : '2.000%'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Repayment Frequency</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              QUARTERLY
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              4 installments per year
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Tenure</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              {result.totalTenureMonths || (schemeCode === 'MICRO_FINANCE' ? 36 : 84)} Months
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {schemeCode === 'MICRO_FINANCE' ? '3 Years' : '7 Years'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Moratorium Period</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              {result.moratoriumMonths ?? (schemeCode === 'MICRO_FINANCE' ? 3 : 6)} Months
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {schemeCode === 'MICRO_FINANCE' ? '1 Quarter grace' : '2 Quarters grace'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Repayment Count</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              {result.numberOfRepayments || (schemeCode === 'MICRO_FINANCE' ? 11 : 26)} Installments
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Active Duration: {result.activeRepaymentMonths || (schemeCode === 'MICRO_FINANCE' ? 33 : 78)} Months
            </div>
          </div>

          <div
            style={{
              background: 'var(--brand-green-light)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--brand-green-border, var(--border-light))',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-green-dark, var(--text-secondary))', marginBottom: '4px' }}>
              Quarterly Installment Amount
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--brand-green)' }}>
              ₹{formatInr(result.installmentAmount)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Per active quarter (annuity amortized)
            </div>
          </div>
        </div>

        {/* Moratorium Treatment Note */}
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            background: 'var(--bg-subtle)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '3px solid var(--brand-green)',
            lineHeight: 1.45,
          }}
        >
          <strong>Moratorium Policy Note:</strong> The scheme provides a {result.moratoriumMonths || (schemeCode === 'MICRO_FINANCE' ? 3 : 6)}-month moratorium. Interest treatment during moratorium is applied per policy (moratorium interest capitalized to principal or paid currently).
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: REPAYMENT SUMMARY */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--brand-green-light)',
              color: 'var(--brand-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            4
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Section 4: Repayment Summary
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Total debt commitment and lifetime interest payout
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Principal Borrowed</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              ₹{formatInr(result.totalPrincipal || ls.loanAmount)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Interest Payable</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              ₹{formatInr(result.totalInterest)}
            </div>
          </div>

          <div
            style={{
              background: 'var(--brand-green-light)',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--brand-green-border, var(--border-light))',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--brand-green-dark, var(--text-secondary))', marginBottom: '4px' }}>
              Total Lifetime Repayment
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-green)' }}>
              ₹{formatInr(result.totalRepayment)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Annual Debt Service</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              ₹{formatInr(result.annualDebtService || (Number(result.installmentAmount) * 4))}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              4 × Quarterly Installment
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: BUSINESS REPAYMENT CAPACITY & DSCR */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '16px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--brand-green-light)',
                color: 'var(--brand-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              5
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Section 5: Business Repayment Capacity & DSCR
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Debt Service Coverage Ratio calculated from operating cash surplus
              </div>
            </div>
          </div>

          <div>
            {dscr.dscr !== null && dscr.dscr !== undefined ? (
              <span
                style={{
                  background:
                    Number(dscr.dscr) >= 1.5
                      ? 'rgba(16, 185, 129, 0.12)'
                      : Number(dscr.dscr) >= 1.0
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'rgba(239, 68, 68, 0.12)',
                  color:
                    Number(dscr.dscr) >= 1.5
                      ? '#059669'
                      : Number(dscr.dscr) >= 1.0
                      ? '#b45309'
                      : '#dc2626',
                  border: `1px solid ${
                    Number(dscr.dscr) >= 1.5
                      ? 'rgba(16, 185, 129, 0.3)'
                      : Number(dscr.dscr) >= 1.0
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'rgba(239, 68, 68, 0.3)'
                  }`,
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                DSCR: {Number(dscr.dscr).toFixed(2)}x ({dscr.status || 'Calculated'})
              </span>
            ) : (
              <span
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-light)',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                }}
              >
                DSCR Pending Revenue Inputs
              </span>
            )}
          </div>
        </div>

        {dscr.monthlyOperatingSurplus !== null && dscr.monthlyOperatingSurplus !== undefined ? (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '14px',
              }}
            >
              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Projected Monthly Revenue</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  ₹{formatInr(dscr.monthlyProjectedRevenue)}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Monthly Operating Costs</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  ₹{formatInr(dscr.monthlyOperatingCosts)}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Monthly Operating Surplus</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: Number(dscr.monthlyOperatingSurplus) >= 0 ? 'var(--brand-green)' : '#dc2626' }}>
                  ₹{formatInr(dscr.monthlyOperatingSurplus)}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Annual Operating Surplus</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: Number(dscr.annualOperatingSurplus) >= 0 ? 'var(--brand-green)' : '#dc2626' }}>
                  ₹{formatInr(dscr.annualOperatingSurplus)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  (Monthly Surplus × 12)
                </div>
              </div>
            </div>

            {dscr.explanation && (
              <div
                style={{
                  fontSize: '0.85rem',
                  padding: '10px 14px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45,
                }}
              >
                <strong>Coverage Analysis:</strong> {dscr.explanation}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: '12px 14px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              DSCR Calculation Note
            </div>
            Projected monthly revenue and operating cost figures have not been supplied in this assessment step. The Debt Service Coverage Ratio (DSCR) will be computed dynamically once cash flow projections are completed.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 6: AMORTIZATION REPAYMENT SCHEDULE */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: showSchedule ? '16px' : '0',
            borderBottom: showSchedule ? '1px solid var(--border-light)' : 'none',
            paddingBottom: showSchedule ? '12px' : '0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--brand-green-light)',
                color: 'var(--brand-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              6
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Section 6: Repayment Schedule
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {schedule.length > 0 ? `${schedule.length} quarterly periods amortized to exact ₹0.00 balance` : 'Amortization schedule'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSchedule(!showSchedule)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Table size={14} />
            <span>{showSchedule ? 'Hide Full Schedule' : `View Schedule (${schedule.length} Quarters)`}</span>
            {showSchedule ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showSchedule && (
          <div>
            {schedule.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {result.scheduleUnavailableReason || 'Repayment schedule items are provisional and will be generated upon confirmation.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto', marginTop: '12px' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.82rem',
                    textAlign: 'right',
                  }}
                >
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-light)' }}>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>#</th>
                      <th style={{ padding: '10px 8px', textAlign: 'left' }}>Period Type</th>
                      <th style={{ padding: '10px 8px' }}>Opening (₹)</th>
                      <th style={{ padding: '10px 8px' }}>Principal (₹)</th>
                      <th style={{ padding: '10px 8px' }}>Interest (₹)</th>
                      <th style={{ padding: '10px 8px' }}>Installment (₹)</th>
                      <th style={{ padding: '10px 8px' }}>Closing (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item) => (
                      <tr
                        key={item.sequenceNumber}
                        style={{
                          borderBottom: '1px solid var(--border-light)',
                          background: item.isMoratorium ? 'rgba(245, 158, 11, 0.04)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>
                          {item.sequenceNumber}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'left' }}>
                          {item.isMoratorium ? (
                            <span
                              style={{
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#b45309',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              Moratorium (Q{item.sequenceNumber})
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-main)' }}>
                              Repayment Q{item.sequenceNumber}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                          ₹{formatInr(item.openingPrincipal)}
                        </td>
                        <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-main)' }}>
                          ₹{formatInr(item.principalPayment)}
                        </td>
                        <td style={{ padding: '8px', color: 'var(--text-muted)' }}>
                          ₹{formatInr(item.interestPayment)}
                        </td>
                        <td style={{ padding: '8px', fontWeight: 700, color: 'var(--brand-green)' }}>
                          ₹{formatInr(item.installmentAmount)}
                        </td>
                        <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-main)' }}>
                          ₹{formatInr(item.closingPrincipal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* STATUTORY ADVISORY DISCLAIMER */}
      {/* ========================================================================= */}
      <div
        style={{
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          padding: '12px 16px',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
        }}
      >
        <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--text-muted)' }} />
        <div>
          <strong>Preliminary Feasibility Disclaimer:</strong> These financial calculations are indicative preliminary advisory estimates based on official deterministic scheme rules. They do not constitute formal credit approval, a loan sanction, or an institutional funding guarantee. Actual sanction terms are subject to formal underwriting and document verification by participating financial institutions.
        </div>
      </div>
    </div>
  );
};
