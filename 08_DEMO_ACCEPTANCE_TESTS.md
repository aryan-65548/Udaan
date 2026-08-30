End-to-End Acceptance Tests

These scenarios define what must work for the hackathon demo.

Test 1 — Registration/Login

Register user.

Consent is captured.

Login succeeds.

Refresh token keeps session alive.

Logout revokes refresh token.

Test 2 — Create Assessment

Login.

Open dashboard.

Click Start New Assessment.

Select business category.

Select state/district/block/village.

Save assessment.

Refresh browser.

Assessment remains available.

Test 3 — Finance Calculation

Input example:

own contribution = 100000
project cost = 1000000
interest = 8%
tenure = 84 months
moratorium = 6 months
frequency = quarterly
monthly revenue = 75000
monthly operating cost = 50000

Verify:

loan amount is deterministic

scheme is selected from scheme_configs

repayment is generated

financial run is persisted

DSCR is persisted

schedule lines are persisted

Test 4 — AI Question Flow

Start AI advisor.

AI receives location/business/finance context.

AI asks a question.

User answers.

Answer is saved in assessment_inputs.

AI receives updated context.

AI asks a relevant follow-up.

AI eventually returns READY_FOR_ANALYSIS.

Test 5 — AI Analysis

Verify report contains:

market reach

opportunity

competition

pricing

SWOT

local threats

distribution/customer analysis

recommendation

confidence

assumptions

limitations

validation checklist

Test 6 — Financial + AI Separation

Verify AI does not change backend-calculated:

loan amount

EMI/installment

DSCR

total repayment

If AI text contradicts backend numeric values, backend numeric values are authoritative.

Test 7 — Resume

Start assessment.

Close browser halfway through AI questioning.

Login again.

Resume assessment.

Previous answers remain.

AI session resumes or safely restarts using saved answers.

Test 8 — Scenario

Change revenue/cost assumptions.

Verify:

a new financial run is created

previous run remains unchanged

repayment schedule is regenerated

DSCR changes appropriately

Test 9 — Authorization

User A must not be able to access User B's assessment by ID.

Test:

GET assessment

PATCH assessment

GET finance

GET result

GET report

validation updates

Test 10 — Missing Data

Select a location/business with insufficient AI knowledge.

AI must:

state evidence limitations

avoid invented exact numbers

recommend field validation

Test 11 — Language

Run same assessment in:

English

Hindi

Gujarati

Meaning and numeric values should remain consistent.

Test 12 — Final Completion

A complete assessment must end with:

REPORT_READY
→ validation checklist
→ report
→ COMPLETE
→ dashboard