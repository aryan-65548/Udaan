import { supportOrganizations, curatedVideos, reportTemplates } from '../schema/reports';

export const initialSupportOrganizations = [
  {
    id: 'org_surat_nycs',
    name: 'National Yuva Cooperative Society (NYCS) — Surat',
    category: 'Youth entrepreneurship, self-employment, skill development, and community development.',
    address: 'G-26, Magnus Shopping Centre, Althan Bhimrad Canal Road, Althan, Surat, Gujarat 395017.',
    phone: '+91 88491 49900',
    email: 'jananidhi.29surat@gmail.com',
    website: 'https://nycsyuvasurat.com/',
    explanation:
      'NYCS Surat may be approached for information about entrepreneurship initiatives, skill development, and self-employment support. The applicant should confirm whether business mentoring or retail-specific assistance is currently available.',
    locationState: 'Gujarat',
    locationDistrict: 'Surat',
    locationCity: 'Surat',
    businessCategoryCode: 'RETAIL_GROCERY',
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'org_surat_wicci',
    name: 'WICCI — Surat Chapter',
    category: 'Women entrepreneurship, networking, skill development, referrals, and collaboration.',
    address: '401, SNS Sparkle, Opposite Starbucks, City Light Town, Surat, Gujarat 395007.',
    phone: null,
    email: 'wiccisurat@gmail.com',
    website: 'https://wiccisurat.org/contact/',
    explanation:
      'WICCI Surat provides a platform for women entrepreneurs, networking, referrals, and collaboration. This recommendation is particularly relevant to women-led businesses. Do not claim that WICCI provides loans or grocery-retail-specific funding.',
    locationState: 'Gujarat',
    locationDistrict: 'Surat',
    locationCity: 'Surat',
    businessCategoryCode: 'RETAIL_GROCERY',
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'org_surat_sena',
    name: 'Swrajya Entrepreneurs Nurture Alliance (SENA), Vijay Kamal Foundation',
    category: 'Entrepreneurship ecosystem, business growth, mentoring, and entrepreneurial support.',
    address: 'G-7, Pragna Ashish Apartment, Ghod Dod Road, Surat, Gujarat 395007.',
    phone: '+91 63569 15196',
    email: 'contact@swrajya.org',
    website: 'https://www.sena.org.in/contact',
    explanation:
      'SENA may be approached for information about entrepreneurship support, business development, and mentoring. Confirm the availability of relevant services before making a referral.',
    locationState: 'Gujarat',
    locationDistrict: 'Surat',
    locationCity: 'Surat',
    businessCategoryCode: 'RETAIL_GROCERY',
    isActive: true,
    displayOrder: 3,
  },
];

export const initialCuratedVideos = [
  {
    id: 'vid_grocery_01',
    title: 'How to Start a Grocery Retail & Kirana Store: Practical Basics',
    url: 'https://www.youtube.com/watch?v=UlB6VAD78kM',
    youtubeId: 'UlB6VAD78kM',
    language: 'English',
    category: 'Retail Management & Store Planning',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'vid_grocery_02',
    title: 'Kirana Business Strategy & Margin Optimization in India',
    url: 'https://www.youtube.com/watch?v=3soVHA-f1zQ',
    youtubeId: '3soVHA-f1zQ',
    language: 'Hindi',
    category: 'Inventory Management & Supplier Negotiations',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'vid_grocery_03',
    title: 'Small Retail Business Working Capital & Cash Flow Management',
    url: 'https://www.youtube.com/watch?v=JABjvOCl4Mg',
    youtubeId: 'JABjvOCl4Mg',
    language: 'Hindi',
    category: 'Cash Flow & Credit Control',
    displayOrder: 3,
    isActive: true,
  },
];

export const initialReportTemplate = {
  id: 'tmpl_grocery_surat_v1',
  templateKey: 'template_grocery_retail_surat_v1',
  title: 'Feasibility Advisory Report: Neighbourhood Grocery Retail (Kirana Store) — Surat',
  version: 1,
  businessCategoryCode: 'RETAIL_GROCERY',
  locationContext: {
    state: 'Gujarat',
    district: 'Surat',
    city: 'Surat',
    taluka: 'Surat City',
    locality: 'Adajan / City Light area, Surat',
  },
  sectionsJson: {
    marketAnalysis: {
      businessDescription:
        'A neighbourhood grocery store (kirana) provides essential daily staples, packaged consumer food, dairy, hygiene items, and household necessities directly to residents within a 1–2 km immediate catchment area.',
      targetCustomerSegments: [
        'Nearby residential households needing daily and weekly grocery items',
        'Local apartment dwellers valuing doorstep convenience and emergency purchases',
        'Local commercial establishments and workers requiring instant snacks, beverages, and daily items',
      ],
      demandDrivers: [
        'Consistent daily household consumption insulated from economic slowdowns',
        'Preference for proximate shopping, immediate physical inspection, and personalised credit trust',
        'Growth in local residential housing density in suburban semi-urban pockets',
      ],
      seasonalConsiderations: [
        'Monsoon season requires damp-proof dry storage for pulses, flours, and salt',
        'Festival seasons (Diwali, Uttarayan, Navratri) drive surges in specialty cooking items, dry fruits, and sweets',
        'Summer months increase demand for cold beverages, dairy, and packaged refreshments',
      ],
    },
    competitionAnalysis: {
      methodologyNote:
        'Competitor evaluation focuses on a 5–10 km radius around Adajan / City Light area, Surat. Competitor entries represent illustrative profiles and general local retail dynamics rather than verified proprietary merchant data.',
      competitorProfiles: [
        {
          name: 'Traditional Neighbourhood Kirana Stores',
          type: 'Local Informal Retail',
          distance: '0.1 – 0.5 km',
          competitiveOffering: 'High customer proximity, informal short-term credit, immediate product availability',
          competitivePressure: 'High on daily emergency items and staple commodities',
          differentiationStrategy: 'Clean store layout, transparent pricing, digital payments (UPI), wider brand selection',
        },
        {
          name: 'Organised Value Supermarkets (e.g., DMart / Reliance Retail)',
          type: 'Modern Format Supermarket',
          distance: '2.5 – 5.0 km',
          competitiveOffering: 'Deep bulk discounts, expansive variety, FMCG loyalty offers',
          competitivePressure: 'Moderate-High on monthly bulk shopping cycles',
          differentiationStrategy: 'Quick in-and-out shopping, home delivery for urgent orders, personal relationship',
        },
        {
          name: 'Quick-Commerce & Online Grocery Platforms',
          type: 'App-Based Delivery (10-30 min delivery)',
          distance: 'Dark-store radius: 3.0 km',
          competitiveOffering: 'App convenience, doorstep delivery, instant gratification',
          competitivePressure: 'Moderate in tech-savvy urban enclaves',
          differentiationStrategy: 'Zero delivery fees, fresh inventory inspection, credit ledger for known families',
        },
      ],
    },
    pricingProductStrategy: {
      pricingApproach:
        'Adopt a competitive Everyday Fair Pricing approach. Keep essential staples (flour, oil, rice, sugar) competitively priced with 5–8% gross margin to build store traffic, while earning 15–25% on packaged snacks, spices, toiletries, and impulse items.',
      inventoryMix: [
        { category: 'Staples & Grains (Atta, Rice, Dal, Oil, Sugar)', turnover: 'High', margin: '5% – 9%' },
        { category: 'Packaged Foods, Biscuits & Snacks', turnover: 'High', margin: '12% – 18%' },
        { category: 'Personal Care, Soaps, Shampoos & Detergents', turnover: 'Medium', margin: '15% – 22%' },
        { category: 'Dairy & Perishable Essentials (Milk, Curd, Bread)', turnover: 'Very High', margin: '6% – 10%' },
        { category: 'Cleaning & Household Supplies', turnover: 'Medium', margin: '18% – 25%' },
      ],
      workingCapitalDiscipline:
        'Limit credit sales to no more than 10–15% of monthly revenue. Rotate stock on a strict First-In, First-Out (FIFO) basis to avoid expiry and rodent loss.',
    },
    swotAnalysis: {
      strengths: [
        'Essential, non-discretionary daily product demand',
        'High repeat customer frequency with personal neighbourhood rapport',
        'Agile ability to adjust stock based on immediate customer feedback',
      ],
      weaknesses: [
        'Working capital constraint during initial 3–6 months',
        'Limited storage area requiring frequent supplier replenishment',
        'Thin margins on bulk commodity items requiring tight volume control',
      ],
      opportunities: [
        'WhatsApp/Phone order taking and free neighbourhood doorstep delivery',
        'UPI QR-code integration and digital credit ledger management (Khata apps)',
        'Introduction of regional specialty snacks and festival seasonal packs',
      ],
      threats: [
        'Wholesale price volatility in edible oils and pulses',
        'Aggressive promotions by large supermarkets and quick-commerce delivery apps',
        'Stock loss due to product expiry or humid weather damage without proper ventilation',
      ],
    },
    riskAnalysis: [
      {
        risk: 'Working Capital Shortage & Cash Flow Crunch',
        likelihood: 'Moderate',
        impact: 'High',
        mitigationStrategy: 'Maintain a minimum 1-month cash buffer; enforce disciplined supplier payment terms; restrict customer credit.',
        monitoringIndicator: 'Weekly cash-in-hand and accounts receivable balance',
      },
      {
        risk: 'Inventory Spoilage & Expiry Losses',
        likelihood: 'Moderate',
        impact: 'Medium',
        mitigationStrategy: 'Implement FIFO stock rotation; order slow-moving items in small pack sizes; weekly expiry audits.',
        monitoringIndicator: 'Monthly unsellable / expired goods value (< 1% of stock)',
      },
      {
        risk: 'Price Undercutting by Large Supermarkets',
        likelihood: 'High',
        impact: 'Medium',
        mitigationStrategy: 'Do not attempt to beat bulk pricing; win on proximity, convenience, speed, and loose custom pack sizing.',
        monitoringIndicator: 'Daily customer footfall and average basket value',
      },
      {
        risk: 'Customer Credit Defaults',
        likelihood: 'Moderate',
        impact: 'High',
        mitigationStrategy: 'Set strict credit limits per household (max ₹1,500); require clearance every 15 days.',
        monitoringIndicator: 'Outstanding credit ledger age (> 30 days balance)',
      },
      {
        risk: 'FSSAI & Local Municipal Licensing Non-Compliance',
        likelihood: 'Low',
        impact: 'High',
        mitigationStrategy: 'Obtain FSSAI Basic Registration (Form A) and Surat Municipal Corporation Gumastadhara / Shop & Establishment Certificate prior to launch.',
        monitoringIndicator: 'Valid registration certificates displayed prominently',
      },
    ],
    actionPlan: [
      { step: 1, title: 'Finalise Premises & Shop Lease Agreement', duration: 'Weeks 1–2', details: 'Ensure high pedestrian footfall, dry storage, and clear municipal commercial permissions.' },
      { step: 2, title: 'Secure Statutory Registrations (FSSAI & SMC Gumastadhara)', duration: 'Weeks 2–3', details: 'Register under Food Safety and Standards Authority of India and local municipal shop act.' },
      { step: 3, title: 'Finalise Bank Loan / Scheme Financing Documentation', duration: 'Weeks 3–5', details: 'Review loan sanction terms, interest rate, EMI, and moratorium schedule with the lending branch.' },
      { step: 4, title: 'Vendor Tie-ups & Initial Inventory Procurement', duration: 'Weeks 5–6', details: 'Establish relations with Surat APMC wholesale distributors and FMCG super-stockists.' },
      { step: 5, title: 'Shop Interior, Racking & Digital POS Setup', duration: 'Weeks 6–7', details: 'Install moisture-resistant display racks, digital weighing scale, billing system, and UPI QR standees.' },
      { step: 6, title: 'Store Launch & Local Neighbourhood Outreach', duration: 'Week 8', details: 'Distribute opening flyers, announce inaugural bundle offers, and initiate WhatsApp grocery delivery.' },
      { step: 7, title: 'Post-Launch Review & Working Capital Assessment', duration: 'Month 3', details: 'Review DSCR, actual daily sales against projections, and fine-tune slow-moving stock lines.' },
    ],
  },
  isActive: true,
};

export async function seedReportResources(db: any) {
  // 1. Seed Support Organizations
  for (const org of initialSupportOrganizations) {
    await db
      .insert(supportOrganizations)
      .values(org)
      .onConflictDoUpdate({
        target: supportOrganizations.id,
        set: {
          name: org.name,
          category: org.category,
          address: org.address,
          phone: org.phone,
          email: org.email,
          website: org.website,
          explanation: org.explanation,
          locationState: org.locationState,
          locationDistrict: org.locationDistrict,
          locationCity: org.locationCity,
          businessCategoryCode: org.businessCategoryCode,
          isActive: org.isActive,
          displayOrder: org.displayOrder,
          updatedAt: new Date(),
        },
      });
  }

  // 2. Seed Curated Videos
  for (const vid of initialCuratedVideos) {
    await db
      .insert(curatedVideos)
      .values(vid)
      .onConflictDoUpdate({
        target: curatedVideos.id,
        set: {
          title: vid.title,
          url: vid.url,
          youtubeId: vid.youtubeId,
          language: vid.language,
          category: vid.category,
          displayOrder: vid.displayOrder,
          isActive: vid.isActive,
          updatedAt: new Date(),
        },
      });
  }

  // 3. Seed Report Template
  await db
    .insert(reportTemplates)
    .values(initialReportTemplate)
    .onConflictDoUpdate({
      target: reportTemplates.templateKey,
      set: {
        title: initialReportTemplate.title,
        version: initialReportTemplate.version,
        businessCategoryCode: initialReportTemplate.businessCategoryCode,
        locationContext: initialReportTemplate.locationContext,
        sectionsJson: initialReportTemplate.sectionsJson,
        isActive: initialReportTemplate.isActive,
        updatedAt: new Date(),
      },
    });
}
