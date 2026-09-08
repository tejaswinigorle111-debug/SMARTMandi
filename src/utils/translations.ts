import { Language } from '../types';

export interface TranslationSchema {
  appName: string;
  tagline: string;
  sihBadge: string;
  nav: {
    home: string;
    marketPrices: string;
    howItWorks: string;
    about: string;
    findMarket: string;
    registerBuyer: string;
  };
  hero: {
    subLabel: string;
    headingPart1: string;
    headingHighlight: string;
    headingPart2: string;
    subText: string;
    ctaPrimary: string;
    ctaSecondary: string;
    floatingTitle: string;
    floatingDesc: string;
    features: {
      transport: { title: string; desc: string };
      multiMandi: { title: string; desc: string };
      netReturn: { title: string; desc: string };
    };
  };
  categories: {
    all: string;
    vegetables: string;
    fruits: string;
    cereals: string;
    pulses: string;
    oilseeds: string;
    commercial: string;
  };
  input: {
    sectionBadge: string;
    heading: string;
    subText: string;
    formTitle: string;
    formSub: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    cropLabel: string;
    cropPlaceholder: string;
    cropSearchPlaceholder: string;
    noCropsFound: string;
    cropsCount: string;
    quantityLabel: string;
    quantityPlaceholder: string;
    quintalsLabel: string;
    kgLabel: string;
    qtlLabel: string;
    directQuantityLabel: string;
    directQuantityPlaceholder: string;
    conversionFormula: string;
    totalKg: string;
    locationLabel: string;
    locationPlaceholder: string;
    useLocationBtn: string;
    locationDetecting: string;
    locationSuccess: string;
    locationError: string;
    locationDenied: string;
    speakBtn: string;
    listening: string;
    voiceInstruction: string;
    speechNotSupported: string;
    voiceError: string;
    voiceRecognizedQtl: string;
    voiceRecognizedKg: string;
    voiceHeardAmbiguous: string;
    voiceSetQtl: string;
    voiceSetKg: string;
    submitBtn: string;
    analyzing: string;
    disclaimerText: string;
    invalidQuantity: string;
    invalidCrop: string;
    invalidLocation: string;
    noMarketData: string;
  };
  results: {
    heading: string;
    bestOptionBadge: string;
    estimatedNetReturn: string;
    takeHome: string;
    smartScoreLabel: string;
    scoreBreakdown: string;
    netReturn: string;
    price: string;
    distance: string;
    transport: string;
    estMandiFee: string;
    grossIncomeLabel: string;
    transportLabel: string;
    netReturnLabel: string;
    mandiPriceLabel: string;
    perQuintal: string;
    whyThisMarket: string;
    viewFullDetails: string;
    distanceLabel: string;
    minUnit: string;
    signal: {
      sellNow: { label: string; sub: string };
      monitor: { label: string; sub: string };
      insufficient: { label: string; sub: string };
    };
    comparisonTitle: string;
    comparisonSub: string;
    tableHeaders: {
      rank: string;
      market: string;
      net: string;
      distance: string;
      time: string;
      score: string;
      diff: string;
    };
    sampleNotice: string;
    recommendationBasis: string;
    intelligenceTitle: string;
    marketPriceLabel: string;
    modalPriceLabel: string;
    marketArrivalLabel: string;
    tonnesUnit: string;
    perKg: string;
    arrivalUnavailable: string;
    historicalUnavailable: string;
    sampleDataLabel: string;
    originLocation: string;
    marketDataLabel: string;
  };
  whatIf: {
    title: string;
    subtitle: string;
    selectMarketLabel: string;
    expectedRevenue: string;
    transportCost: string;
    expectedNetReturn: string;
    diffFromBest: string;
    bestOptionNote: string;
    comparedToBest: string;
  };
  charts: {
    priceComparisonTitle: string;
    priceComparisonSub: string;
    priceTrendTitle: string;
    priceTrendSub: string;
    bestOptionLegend: string;
    otherMandisLegend: string;
    sevenDayHistory: string;
    sevenDayAverage: string;
    historicalTrend: string;
    ratePerKgAxis: string;
    priceAxis: string;
    tooltipPrice: string;
    tooltipEstNet: string;
    tooltipAvgRate: string;
    sampleDataLabel: string;
  };
  map: {
    title: string;
    subtitle: string;
    farmerLocation: string;
    recommendedMandi: string;
    routeDistance: string;
    dataUnavailable: string;
    gpsPrompt: string;
    distanceDisclaimer: string;
  };
  bestSellingWindow: {
    title: string;
    condition: string;
    awaiting: string;
    trend: string;
    unavailable: string;
    comingSoon: string;
    comingSoonDesc: string;
  };
  howItWorks: {
    badge: string;
    heading: string;
    subText: string;
    stepPrefix: string;
    ofSteps: string;
    steps: {
      num: string;
      title: string;
      description: string;
    }[];
  };
  whySmartMandi: {
    badge: string;
    heading: string;
    subText: string;
    verifiedMetric: string;
    cards: {
      tag: string;
      title: string;
      description: string;
    }[];
  };
  footer: {
    aboutText: string;
    navTitle: string;
    actionsTitle: string;
    copyright: string;
    missionStatement: string;
  };
  marketPricesModal: {
    title: string;
    subtitle: string;
    noticeTitle: string;
    noticeText: string;
    mandiCol: string;
    locationCol: string;
    closeBtn: string;
  };
  aboutModal: {
    title: string;
    subtitle: string;
    problemStatementTitle: string;
    problemStatement: string;
    description: string;
    architectureTitle: string;
    archFrontend: string;
    archApi: string;
    archDb: string;
    archFeed: string;
    archEngine: string;
    closeBtn: string;
  };
  buyerRegistration: BuyerRegistrationTranslations;
}

export interface BuyerRegistrationTranslations {
  badge: string;
  title: string;
  subtitle: string;
  backToHome: string;
  heroBannerTitle: string;
  heroBannerSub: string;
  heroBannerCta: string;
  sectionBasic: string;
  sectionBasicDesc: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  businessNameLabel: string;
  businessNamePlaceholder: string;
  buyerTypeLabel: string;
  buyerTypePlaceholder: string;
  buyerTypes: {
    wholesaler: string;
    retailer: string;
    processor: string;
    exporter: string;
    other: string;
  };
  sectionContact: string;
  sectionContactDesc: string;
  mobileLabel: string;
  mobilePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  optionalBadge: string;
  sectionLocation: string;
  sectionLocationDesc: string;
  stateLabel: string;
  statePlaceholder: string;
  districtLabel: string;
  districtPlaceholder: string;
  marketAreaLabel: string;
  marketAreaPlaceholder: string;
  businessAddressLabel: string;
  businessAddressPlaceholder: string;
  sectionCrops: string;
  sectionCropsDesc: string;
  preferredCropsLabel: string;
  preferredCropsSub: string;
  searchCropsPlaceholder: string;
  selectedCount: string;
  selectAll: string;
  clearAll: string;
  noCropsMatch: string;
  sectionQuantity: string;
  sectionQuantityDesc: string;
  minQuantityLabel: string;
  minQuantityPlaceholder: string;
  maxQuantityLabel: string;
  maxQuantityPlaceholder: string;
  quantityUnitLabel: string;
  units: {
    kg: string;
    quintal: string;
    tonne: string;
  };
  sectionPricing: string;
  sectionPricingDesc: string;
  minPriceLabel: string;
  minPricePlaceholder: string;
  maxPriceLabel: string;
  maxPricePlaceholder: string;
  buyingFrequencyLabel: string;
  buyingFrequencyPlaceholder: string;
  frequencies: {
    daily: string;
    weekly: string;
    monthly: string;
    asNeeded: string;
  };
  submitBtn: string;
  submittingBtn: string;
  requiredFieldsNote: string;
  validation: {
    fullNameRequired: string;
    businessNameRequired: string;
    buyerTypeRequired: string;
    mobileRequired: string;
    mobileInvalid: string;
    emailInvalid: string;
    stateRequired: string;
    districtRequired: string;
    marketAreaRequired: string;
    addressRequired: string;
    cropsRequired: string;
    minQtyPositive: string;
    maxQtyMinConstraint: string;
    minPriceNonNegative: string;
    maxPriceMinConstraint: string;
    frequencyRequired: string;
    fixErrorsAlert: string;
  };
  confirmation: {
    readyTitle: string;
    backendNotice: string;
    backendNoticeTe?: string;
    summaryTitle: string;
    buyerInfoLabel: string;
    contactLabel: string;
    locationLabel: string;
    commoditiesLabel: string;
    volumePriceLabel: string;
    frequencyLabel: string;
    frontendStateOnlyNotice: string;
    registerAnotherBtn: string;
    backToHomeBtn: string;
  };
}

const enBuyerRegistration: BuyerRegistrationTranslations = {
  badge: 'BUYER REGISTRATION',
  title: 'Buyer Registration',
  subtitle: 'Directly connect with local farmers and FPOs to procure quality agricultural produce at transparent prices.',
  backToHome: 'Back to Home',
  heroBannerTitle: 'Are You a Wholesale Buyer, Trader, or Food Processor?',
  heroBannerSub: 'Directly source farm-fresh crops from registered farmers and FPOs with zero middlemen markups.',
  heroBannerCta: 'Register as Buyer',
  sectionBasic: 'Business & Basic Details',
  sectionBasicDesc: 'Specify your trading firm name and legal buyer category',
  fullNameLabel: 'Full Name',
  fullNamePlaceholder: 'e.g. Rajesh Kumar',
  businessNameLabel: 'Business / Firm Name',
  businessNamePlaceholder: 'e.g. Sri Balaji Agro Traders',
  buyerTypeLabel: 'Buyer Type',
  buyerTypePlaceholder: 'Select your business type',
  buyerTypes: {
    wholesaler: 'Wholesaler',
    retailer: 'Retailer',
    processor: 'Processor',
    exporter: 'Exporter',
    other: 'Other',
  },
  sectionContact: 'Contact Information',
  sectionContactDesc: 'Used for trade confirmations and dispatch coordination',
  mobileLabel: 'Mobile Number',
  mobilePlaceholder: '10-digit mobile number',
  emailLabel: 'Email Address',
  emailPlaceholder: 'e.g. buyer@example.com',
  optionalBadge: 'Optional',
  sectionLocation: 'Operational Location & Mandi',
  sectionLocationDesc: 'Your primary procurement hub, target market yard, and facility address',
  stateLabel: 'State',
  statePlaceholder: 'Select State',
  districtLabel: 'District',
  districtPlaceholder: 'e.g. Guntur',
  marketAreaLabel: 'Market / Area',
  marketAreaPlaceholder: 'e.g. Guntur Mirchi Yard / Bowenpally',
  businessAddressLabel: 'Business Address',
  businessAddressPlaceholder: 'Shop / Warehouse No., Street, Landmark, Pincode',
  sectionCrops: 'Commodity Requirements',
  sectionCropsDesc: 'Select the agricultural commodities you procure (multiple selections allowed)',
  preferredCropsLabel: 'Preferred Crops',
  preferredCropsSub: 'Select one or more crops required for your trade',
  searchCropsPlaceholder: 'Search crops by name...',
  selectedCount: '{count} crops selected',
  selectAll: 'Select All',
  clearAll: 'Clear Selection',
  noCropsMatch: 'No matching crops found',
  sectionQuantity: 'Procurement Volume & Unit',
  sectionQuantityDesc: 'Set your regular minimum and maximum volume capacity',
  minQuantityLabel: 'Minimum Quantity Required',
  minQuantityPlaceholder: 'e.g. 50',
  maxQuantityLabel: 'Maximum Quantity Required',
  maxQuantityPlaceholder: 'e.g. 500',
  quantityUnitLabel: 'Quantity Unit',
  units: {
    kg: 'kg',
    quintal: 'quintal',
    tonne: 'tonne',
  },
  sectionPricing: 'Target Buying Price & Frequency',
  sectionPricingDesc: 'Your procurement budget bounds and order repetition schedule',
  minPriceLabel: 'Minimum Buying Price (₹)',
  minPricePlaceholder: 'e.g. 25',
  maxPriceLabel: 'Maximum Buying Price (₹)',
  maxPricePlaceholder: 'e.g. 45',
  buyingFrequencyLabel: 'Buying Frequency',
  buyingFrequencyPlaceholder: 'Select procurement cycle',
  frequencies: {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    asNeeded: 'As Needed',
  },
  submitBtn: 'Register Buyer',
  submittingBtn: 'Validating & Submitting...',
  requiredFieldsNote: '* Marked fields are mandatory',
  validation: {
    fullNameRequired: 'Full Name is required.',
    businessNameRequired: 'Business Name is required.',
    buyerTypeRequired: 'Please select a buyer type.',
    mobileRequired: 'Mobile number is required.',
    mobileInvalid: 'Please enter a valid 10-digit mobile number.',
    emailInvalid: 'Please enter a valid email address.',
    stateRequired: 'State is required.',
    districtRequired: 'District is required.',
    marketAreaRequired: 'Market / Area is required.',
    addressRequired: 'Business address is required.',
    cropsRequired: 'Please select at least one preferred crop.',
    minQtyPositive: 'Minimum quantity must be greater than zero.',
    maxQtyMinConstraint: 'Maximum quantity cannot be less than minimum quantity.',
    minPriceNonNegative: 'Minimum price cannot be negative.',
    maxPriceMinConstraint: 'Maximum price cannot be less than minimum price.',
    frequencyRequired: 'Please select a buying frequency.',
    fixErrorsAlert: 'Please resolve the highlighted validation errors before submitting.',
  },
  confirmation: {
    readyTitle: 'Buyer Registration Form is Ready',
    backendNotice: 'Your registration request was received and queued for verification.',
    summaryTitle: 'Submitted Registration Details',
    buyerInfoLabel: 'Buyer & Business',
    contactLabel: 'Contact Information',
    locationLabel: 'Operational Location',
    commoditiesLabel: 'Preferred Crops',
    volumePriceLabel: 'Volume & Price Target',
    frequencyLabel: 'Buying Frequency',
    frontendStateOnlyNotice: 'Our team will review your buyer details and contact you before marketplace access is enabled.',
    registerAnotherBtn: 'Register Another Buyer',
    backToHomeBtn: 'Return to SMARTMandi Home',
  },
};

const teBuyerRegistration: BuyerRegistrationTranslations = {
  badge: 'కొనుగోలుదారు నమోదు',
  title: 'కొనుగోలుదారుల నమోదు',
  subtitle: 'రైతులు మరియు FPOల నుండి నేరుగా తాజా నాణ్యమైన వ్యవసాయ ఉత్పత్తులను పారదర్శక ధరలకు కొనుగోలు చేయడానికి నమోదు చేసుకోండి.',
  backToHome: 'హోమ్‌కు తిరిగి వెళ్లండి',
  heroBannerTitle: 'మీరు హోల్‌సేలర్, వ్యాపారి లేదా ప్రాసెసరా?',
  heroBannerSub: 'మధ్యవర్తుల ప్రమేయం లేకుండా నేరుగా రైతుల నుండి నాణ్యమైన వ్యవసాయ ఉత్పత్తులను సేకరించండి.',
  heroBannerCta: 'కొనుగోలుదారుగా నమోదు',
  sectionBasic: 'వ్యాపార & ప్రాథమిక వివరాలు',
  sectionBasicDesc: 'మీ సంస్థ పేరు మరియు కొనుగోలుదారు వర్గాన్ని నమోదు చేయండి',
  fullNameLabel: 'పూర్తి పేరు',
  fullNamePlaceholder: 'ఉదా. రమేష్ కుమార్',
  businessNameLabel: 'వ్యాపార / సంస్థ పేరు',
  businessNamePlaceholder: 'ఉదా. శ్రీ బాలాజీ ఆగ్రో ట్రేడర్స్',
  buyerTypeLabel: 'కొనుగోలుదారు రకం',
  buyerTypePlaceholder: 'కొనుగోలుదారు రకాన్ని ఎంచుకోండి',
  buyerTypes: {
    wholesaler: 'హోల్‌సేలర్ (మొత్తం కొనుగోలుదారు)',
    retailer: 'రిటైలర్ (చిల్లర వ్యాపారి)',
    processor: 'ప్రాసెసర్ (తయారీదారు / ప్రాసెసింగ్ యూనిట్)',
    exporter: 'ఎగుమతిదారు (ఎక్స్‌పోర్టర్)',
    other: 'ఇతర',
  },
  sectionContact: 'సంప్రదింపు సమాచారం',
  sectionContactDesc: 'ఆర్డర్ ధృవీకరణ మరియు సమాచారం కోసం మొబైల్ వివరాలు',
  mobileLabel: 'మొబైల్ నంబర్',
  mobilePlaceholder: '10 అంకెల మొబైల్ నంబర్',
  emailLabel: 'ఈమెయిల్ చిరునామా',
  emailPlaceholder: 'ఉదా. buyer@example.com',
  optionalBadge: 'ఐచ్ఛికం',
  sectionLocation: 'కార్యాచరణ స్థానం & చిరునామా',
  sectionLocationDesc: 'మీ వ్యాపార కేంద్రం, టార్గెట్ మార్కెట్ యార్డ్ మరియు చిరునామా',
  stateLabel: 'రాష్ట్రం',
  statePlaceholder: 'రాష్ట్రాన్ని ఎంచుకోండి',
  districtLabel: 'జిల్లా',
  districtPlaceholder: 'ఉదా. గుంటూరు',
  marketAreaLabel: 'మార్కెట్ యార్డ్ / ప్రాంతం',
  marketAreaPlaceholder: 'ఉదా. గుంటూరు మిర్చి యార్డ్ / బోయిన్‌పల్లి',
  businessAddressLabel: 'పూర్తి వ్యాపార చిరునామా',
  businessAddressPlaceholder: 'షాపు / గోడౌన్ నంబర్, వీధి, ల్యాండ్‌మార్క్, పిన్‌కోడ్',
  sectionCrops: 'కావలసిన పంటలు / ఉత్పత్తులు',
  sectionCropsDesc: 'మీరు కొనుగోలు చేయాలనుకుంటున్న పంటలను ఎంచుకోండి (బహుళ ఎంపిక సాధ్యం)',
  preferredCropsLabel: 'ప్రాధాన్య పంటలు',
  preferredCropsSub: 'మీ వ్యాపారానికి అవసరమైన ఒకటి లేదా అంతకంటే ఎక్కువ పంటలను ఎంచుకోండి',
  searchCropsPlaceholder: 'పంట పేరుతో వెతకండి...',
  selectedCount: '{count} పంటలు ఎంపిక చేయబడ్డాయి',
  selectAll: 'అన్నీ ఎంచుకోండి',
  clearAll: 'ఎంపిక తీసివేయి',
  noCropsMatch: 'ఎలాంటి పంటలు కనుగొనబడలేదు',
  sectionQuantity: 'కొనుగోలు పరిమాణం & కొలమానం',
  sectionQuantityDesc: 'కనీస మరియు గరిష్ట అవసరమైన పరిమాణం పరిమితులు',
  minQuantityLabel: 'కనీస పరిమాణం',
  minQuantityPlaceholder: 'ఉదా. 50',
  maxQuantityLabel: 'గరిష్ట పరిమాణం',
  maxQuantityPlaceholder: 'ఉదా. 500',
  quantityUnitLabel: 'కొలమానం (యూనిట్)',
  units: {
    kg: 'కిలోగ్రామ్ (కేజీ)',
    quintal: 'క్వింటాల్',
    tonne: 'టన్ను',
  },
  sectionPricing: 'ధర పరిమితి & కొనుగోలు తరచుదనం',
  sectionPricingDesc: 'మీరు ఆమోదించగల ధర పరిధి మరియు కొనుగోలు కాలవ్యవధి',
  minPriceLabel: 'కనీస కొనుగోలు ధర (₹)',
  minPricePlaceholder: 'ఉదా. 25',
  maxPriceLabel: 'గరిష్ట కొనుగోలు ధర (₹)',
  maxPricePlaceholder: 'ఉదా. 45',
  buyingFrequencyLabel: 'కొనుగోలు తరచుదనం',
  buyingFrequencyPlaceholder: 'కొనుగోలు కాలవ్యవధిని ఎంచుకోండి',
  frequencies: {
    daily: 'రోజువారీ (డైలీ)',
    weekly: 'వారానికి ఒకసారి (వీక్లీ)',
    monthly: 'నెలకు ఒకసారి (మంత్లీ)',
    asNeeded: 'అవసరాన్ని బట్టి (యాజ్ నీడెడ్)',
  },
  submitBtn: 'కొనుగోలుదారుగా నమోదు చేయండి',
  submittingBtn: 'పరిశీలిస్తోంది...',
  requiredFieldsNote: '* గుర్తించబడిన ఫీల్డ్‌లు తప్పనిసరి',
  validation: {
    fullNameRequired: 'పూర్తి పేరు నమోదు చేయడం తప్పనిసరి.',
    businessNameRequired: 'వ్యాపార పేరు నమోదు చేయడం తప్పనిసరి.',
    buyerTypeRequired: 'దయచేసి కొనుగోలుదారు రకాన్ని ఎంచుకోండి.',
    mobileRequired: 'మొబైల్ నంబర్ నమోదు చేయడం తప్పనిసరి.',
    mobileInvalid: 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.',
    emailInvalid: 'దయచేసి సరైన ఈమెయిల్ చిరునామాను నమోదు చేయండి.',
    stateRequired: 'రాష్ట్రాన్ని ఎంచుకోవడం తప్పనిసరి.',
    districtRequired: 'జిల్లా పేరు నమోదు చేయడం తప్పనిసరి.',
    marketAreaRequired: 'మార్కెట్ / ప్రాంతం నమోదు చేయడం తప్పనిసరి.',
    addressRequired: 'వ్యాపార చిరునామా నమోదు చేయడం తప్పనిసరి.',
    cropsRequired: 'కనీసం ఒక పంటను ఎంచుకోవాలి.',
    minQtyPositive: 'కనీస పరిమాణం సున్నా కంటే ఎక్కువగా ఉండాలి.',
    maxQtyMinConstraint: 'గరిష్ట పరిమాణం కనీస పరిమాణం కంటే తక్కువగా ఉండకూడదు.',
    minPriceNonNegative: 'కనీస ధర ప్రతికూలంగా ఉండకూడదు.',
    maxPriceMinConstraint: 'గరిష్ట ధర కనీస ధర కంటే తక్కువగా ఉండకూడదు.',
    frequencyRequired: 'దయచేసి కొనుగోలు తరచుదనాన్ని ఎంచుకోండి.',
    fixErrorsAlert: 'దయచేసి ఫారమ్‌లోని ఎర్రర్‌లను సరిదిద్ది మళ్లీ సమర్పించండి.',
  },
  confirmation: {
    readyTitle: 'కొనుగోలుదారు నమోదు ఫారమ్ సిద్ధంగా ఉంది',
    backendNotice: 'Buyer registration form is ready. Backend registration will be connected next.',
    backendNoticeTe: 'కొనుగోలుదారు నమోదు ఫారమ్ సిద్ధంగా ఉంది. తదుపరి దశలో బ్యాకెండ్ నమోదు అనుసంధానం చేయబడుతుంది.',
    summaryTitle: 'నమోదు చేయబడిన వివరాల సారాంశం',
    buyerInfoLabel: 'కొనుగోలుదారు వివరాలు',
    contactLabel: 'సంప్రదింపు సమాచారం',
    locationLabel: 'స్థానం & చిరునామా',
    commoditiesLabel: 'ఎంచుకున్న పంటలు',
    volumePriceLabel: 'పరిమాణం & ధర పరిమితి',
    frequencyLabel: 'కొనుగోలు తరచుదనం',
    frontendStateOnlyNotice: 'గమనిక: ఈ డేటా కేవలం లోకల్ రియాక్ట్ స్టేట్‌లో మాత్రమే ఉంది. డేటాబేస్ లేదా సర్వర్‌కు పంపబడలేదు.',
    registerAnotherBtn: 'మరొక కొనుగోలుదారుని నమోదు చేయండి',
    backToHomeBtn: 'SMARTMandi హోమ్‌కు తిరిగి వెళ్లండి',
  },
};
const hiBuyerRegistration: BuyerRegistrationTranslations = {
  badge: 'खरीदार पंजीकरण',
  title: 'खरीदार पंजीकरण',
  subtitle: 'स्थानीय किसानों और FPO से सीधे जुड़कर पारदर्शी कीमतों पर गुणवत्तापूर्ण कृषि उत्पाद खरीदें।',
  backToHome: 'होम पर वापस जाएँ',
  heroBannerTitle: 'क्या आप थोक खरीदार, व्यापारी या खाद्य प्रसंस्करणकर्ता हैं?',
  heroBannerSub: 'बिचौलियों के बिना पंजीकृत किसानों और FPO से सीधे ताज़ी कृषि उपज प्राप्त करें।',
  heroBannerCta: 'खरीदार के रूप में पंजीकरण करें',

  sectionBasic: 'व्यवसाय और मूल विवरण',
  sectionBasicDesc: 'अपनी व्यापारिक संस्था का नाम और खरीदार श्रेणी दर्ज करें',

  fullNameLabel: 'पूरा नाम',
  fullNamePlaceholder: 'उदा. राजेश कुमार',

  businessNameLabel: 'व्यवसाय / फर्म का नाम',
  businessNamePlaceholder: 'उदा. श्री बालाजी एग्रो ट्रेडर्स',

  buyerTypeLabel: 'खरीदार का प्रकार',
  buyerTypePlaceholder: 'अपने व्यवसाय का प्रकार चुनें',

  buyerTypes: {
    wholesaler: 'थोक विक्रेता',
    retailer: 'खुदरा विक्रेता',
    processor: 'प्रसंस्करणकर्ता',
    exporter: 'निर्यातक',
    other: 'अन्य',
  },

  sectionContact: 'संपर्क जानकारी',
  sectionContactDesc: 'व्यापार पुष्टि और आपूर्ति समन्वय के लिए उपयोग किया जाएगा',

  mobileLabel: 'मोबाइल नंबर',
  mobilePlaceholder: '10 अंकों का मोबाइल नंबर',

  emailLabel: 'ईमेल पता',
  emailPlaceholder: 'उदा. buyer@example.com',

  optionalBadge: 'वैकल्पिक',

  sectionLocation: 'व्यावसायिक स्थान और मंडी',
  sectionLocationDesc: 'आपका मुख्य खरीद केंद्र, लक्ष्य बाजार और व्यवसाय का पता',

  stateLabel: 'राज्य',
  statePlaceholder: 'राज्य चुनें',

  districtLabel: 'जिला',
  districtPlaceholder: 'उदा. गुंटूर',

  marketAreaLabel: 'बाजार / क्षेत्र',
  marketAreaPlaceholder: 'उदा. गुंटूर मिर्ची यार्ड',

  businessAddressLabel: 'व्यवसाय का पता',
  businessAddressPlaceholder: 'दुकान / गोदाम नंबर, सड़क, लैंडमार्क, पिनकोड',

  sectionCrops: 'उत्पाद आवश्यकताएँ',
  sectionCropsDesc: 'वे कृषि उत्पाद चुनें जिन्हें आप खरीदते हैं',

  preferredCropsLabel: 'पसंदीदा फसलें',
  preferredCropsSub: 'अपने व्यापार के लिए आवश्यक एक या अधिक फसलें चुनें',

  searchCropsPlaceholder: 'नाम से फसल खोजें...',

  selectedCount: '{count} फसलें चुनी गईं',

  selectAll: 'सभी चुनें',
  clearAll: 'चयन हटाएँ',

  noCropsMatch: 'कोई मेल खाने वाली फसल नहीं मिली',

  sectionQuantity: 'खरीद मात्रा और इकाई',
  sectionQuantityDesc: 'अपनी न्यूनतम और अधिकतम खरीद क्षमता निर्धारित करें',

  minQuantityLabel: 'न्यूनतम आवश्यक मात्रा',
  minQuantityPlaceholder: 'उदा. 50',

  maxQuantityLabel: 'अधिकतम आवश्यक मात्रा',
  maxQuantityPlaceholder: 'उदा. 500',

  quantityUnitLabel: 'मात्रा की इकाई',

  units: {
    kg: 'किलोग्राम',
    quintal: 'क्विंटल',
    tonne: 'टन',
  },

  sectionPricing: 'लक्षित खरीद मूल्य और आवृत्ति',
  sectionPricingDesc: 'अपनी खरीद मूल्य सीमा और खरीद कार्यक्रम निर्धारित करें',

  minPriceLabel: 'न्यूनतम खरीद मूल्य (₹)',
  minPricePlaceholder: 'उदा. 25',

  maxPriceLabel: 'अधिकतम खरीद मूल्य (₹)',
  maxPricePlaceholder: 'उदा. 45',

  buyingFrequencyLabel: 'खरीद की आवृत्ति',
  buyingFrequencyPlaceholder: 'खरीद चक्र चुनें',

  frequencies: {
    daily: 'प्रतिदिन',
    weekly: 'साप्ताहिक',
    monthly: 'मासिक',
    asNeeded: 'आवश्यकतानुसार',
  },

  submitBtn: 'खरीदार पंजीकृत करें',
  submittingBtn: 'जाँच और सबमिट किया जा रहा है...',

  requiredFieldsNote: '* चिह्नित फ़ील्ड अनिवार्य हैं',

  validation: {
    fullNameRequired: 'पूरा नाम आवश्यक है।',
    businessNameRequired: 'व्यवसाय का नाम आवश्यक है।',
    buyerTypeRequired: 'कृपया खरीदार का प्रकार चुनें।',
    mobileRequired: 'मोबाइल नंबर आवश्यक है।',
    mobileInvalid: 'कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।',
    emailInvalid: 'कृपया सही ईमेल पता दर्ज करें।',
    stateRequired: 'राज्य आवश्यक है।',
    districtRequired: 'जिला आवश्यक है।',
    marketAreaRequired: 'बाजार / क्षेत्र आवश्यक है।',
    addressRequired: 'व्यवसाय का पता आवश्यक है।',
    cropsRequired: 'कृपया कम से कम एक पसंदीदा फसल चुनें।',
    minQtyPositive: 'न्यूनतम मात्रा शून्य से अधिक होनी चाहिए।',
    maxQtyMinConstraint: 'अधिकतम मात्रा न्यूनतम मात्रा से कम नहीं हो सकती।',
    minPriceNonNegative: 'न्यूनतम मूल्य नकारात्मक नहीं हो सकता।',
    maxPriceMinConstraint: 'अधिकतम मूल्य न्यूनतम मूल्य से कम नहीं हो सकता।',
    frequencyRequired: 'कृपया खरीद की आवृत्ति चुनें।',
    fixErrorsAlert: 'सबमिट करने से पहले कृपया सभी त्रुटियाँ ठीक करें।',
  },

  confirmation: {
    readyTitle: 'खरीदार पंजीकरण फ़ॉर्म तैयार है',
    backendNotice: 'खरीदार पंजीकरण फ़ॉर्म तैयार है। बैकएंड पंजीकरण जल्द जोड़ा जाएगा।',
    summaryTitle: 'जमा किए गए पंजीकरण विवरण',
    buyerInfoLabel: 'खरीदार और व्यवसाय',
    contactLabel: 'संपर्क जानकारी',
    locationLabel: 'व्यावसायिक स्थान',
    commoditiesLabel: 'पसंदीदा फसलें',
    volumePriceLabel: 'मात्रा और मूल्य लक्ष्य',
    frequencyLabel: 'खरीद की आवृत्ति',
    frontendStateOnlyNotice: 'फ़ॉर्म डेटा केवल स्थानीय React state में रखा गया है। बैकएंड पंजीकरण अभी जोड़ा जाना बाकी है।',
    registerAnotherBtn: 'एक और खरीदार पंजीकृत करें',
    backToHomeBtn: 'SMARTMandi होम पर वापस जाएँ',
  },
};


const mrBuyerRegistration: BuyerRegistrationTranslations = {
  badge: 'खरेदीदार नोंदणी',
  title: 'खरेदीदार नोंदणी',
  subtitle: 'स्थानिक शेतकरी आणि FPO यांच्याशी थेट संपर्क साधून पारदर्शक दरांमध्ये दर्जेदार कृषी उत्पादने खरेदी करा।',
  backToHome: 'मुख्यपृष्ठावर परत जा',
  heroBannerTitle: 'तुम्ही घाऊक खरेदीदार, व्यापारी किंवा अन्न प्रक्रिया करणारे आहात का?',
  heroBannerSub: 'मध्यस्थांशिवाय नोंदणीकृत शेतकरी आणि FPO कडून थेट ताजी कृषी उत्पादने मिळवा.',
  heroBannerCta: 'खरेदीदार म्हणून नोंदणी करा',

  sectionBasic: 'व्यवसाय आणि मूलभूत माहिती',
  sectionBasicDesc: 'तुमच्या व्यापार संस्थेचे नाव आणि खरेदीदार श्रेणी नमूद करा',

  fullNameLabel: 'पूर्ण नाव',
  fullNamePlaceholder: 'उदा. राजेश कुमार',

  businessNameLabel: 'व्यवसाय / फर्मचे नाव',
  businessNamePlaceholder: 'उदा. श्री बालाजी अॅग्रो ट्रेडर्स',

  buyerTypeLabel: 'खरेदीदाराचा प्रकार',
  buyerTypePlaceholder: 'तुमच्या व्यवसायाचा प्रकार निवडा',

  buyerTypes: {
    wholesaler: 'घाऊक विक्रेता',
    retailer: 'किरकोळ विक्रेता',
    processor: 'प्रक्रिया करणारा',
    exporter: 'निर्यातदार',
    other: 'इतर',
  },

  sectionContact: 'संपर्क माहिती',
  sectionContactDesc: 'व्यापार पुष्टीकरण आणि पुरवठा समन्वयासाठी वापरले जाईल',

  mobileLabel: 'मोबाइल नंबर',
  mobilePlaceholder: '10 अंकी मोबाइल नंबर',

  emailLabel: 'ईमेल पत्ता',
  emailPlaceholder: 'उदा. buyer@example.com',

  optionalBadge: 'ऐच्छिक',

  sectionLocation: 'व्यवसायाचे ठिकाण आणि बाजार',
  sectionLocationDesc: 'तुमचे मुख्य खरेदी केंद्र, लक्ष्य बाजार आणि व्यवसायाचा पत्ता',

  stateLabel: 'राज्य',
  statePlaceholder: 'राज्य निवडा',

  districtLabel: 'जिल्हा',
  districtPlaceholder: 'उदा. गुंटूर',

  marketAreaLabel: 'बाजार / क्षेत्र',
  marketAreaPlaceholder: 'उदा. गुंटूर मिरची यार्ड',

  businessAddressLabel: 'व्यवसायाचा पत्ता',
  businessAddressPlaceholder: 'दुकान / गोदाम क्रमांक, रस्ता, खूण, पिनकोड',

  sectionCrops: 'उत्पादन आवश्यकता',
  sectionCropsDesc: 'तुम्ही खरेदी करत असलेली कृषी उत्पादने निवडा',

  preferredCropsLabel: 'पसंतीची पिके',
  preferredCropsSub: 'तुमच्या व्यवसायासाठी आवश्यक असलेली एक किंवा अधिक पिके निवडा',

  searchCropsPlaceholder: 'नावाने पिके शोधा...',

  selectedCount: '{count} पिके निवडली आहेत',

  selectAll: 'सर्व निवडा',
  clearAll: 'निवड साफ करा',

  noCropsMatch: 'जुळणारी पिके आढळली नाहीत',

  sectionQuantity: 'खरेदीचे प्रमाण आणि एकक',
  sectionQuantityDesc: 'तुमची किमान आणि कमाल खरेदी क्षमता निश्चित करा',

  minQuantityLabel: 'किमान आवश्यक प्रमाण',
  minQuantityPlaceholder: 'उदा. 50',

  maxQuantityLabel: 'कमाल आवश्यक प्रमाण',
  maxQuantityPlaceholder: 'उदा. 500',

  quantityUnitLabel: 'प्रमाणाचे एकक',

  units: {
    kg: 'किलोग्राम',
    quintal: 'क्विंटल',
    tonne: 'टन',
  },

  sectionPricing: 'लक्ष्य खरेदी किंमत आणि वारंवारिता',
  sectionPricingDesc: 'तुमची खरेदी किंमत मर्यादा आणि खरेदीचे वेळापत्रक निश्चित करा',

  minPriceLabel: 'किमान खरेदी किंमत (₹)',
  minPricePlaceholder: 'उदा. 25',

  maxPriceLabel: 'कमाल खरेदी किंमत (₹)',
  maxPricePlaceholder: 'उदा. 45',

  buyingFrequencyLabel: 'खरेदीची वारंवारिता',
  buyingFrequencyPlaceholder: 'खरेदी चक्र निवडा',

  frequencies: {
    daily: 'दररोज',
    weekly: 'साप्ताहिक',
    monthly: 'मासिक',
    asNeeded: 'गरजेनुसार',
  },

  submitBtn: 'खरेदीदार नोंदणी करा',
  submittingBtn: 'तपासणी आणि सबमिट केले जात आहे...',

  requiredFieldsNote: '* चिन्हांकित फील्ड अनिवार्य आहेत',

  validation: {
    fullNameRequired: 'पूर्ण नाव आवश्यक आहे.',
    businessNameRequired: 'व्यवसायाचे नाव आवश्यक आहे.',
    buyerTypeRequired: 'कृपया खरेदीदाराचा प्रकार निवडा.',
    mobileRequired: 'मोबाइल नंबर आवश्यक आहे.',
    mobileInvalid: 'कृपया वैध 10 अंकी मोबाइल नंबर प्रविष्ट करा.',
    emailInvalid: 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.',
    stateRequired: 'राज्य आवश्यक आहे.',
    districtRequired: 'जिल्हा आवश्यक आहे.',
    marketAreaRequired: 'बाजार / क्षेत्र आवश्यक आहे.',
    addressRequired: 'व्यवसायाचा पत्ता आवश्यक आहे.',
    cropsRequired: 'कृपया किमान एक पसंतीचे पीक निवडा.',
    minQtyPositive: 'किमान प्रमाण शून्यापेक्षा जास्त असावे.',
    maxQtyMinConstraint: 'कमाल प्रमाण किमान प्रमाणापेक्षा कमी असू शकत नाही.',
    minPriceNonNegative: 'किमान किंमत नकारात्मक असू शकत नाही.',
    maxPriceMinConstraint: 'कमाल किंमत किमान किंमतीपेक्षा कमी असू शकत नाही.',
    frequencyRequired: 'कृपया खरेदीची वारंवारिता निवडा.',
    fixErrorsAlert: 'सबमिट करण्यापूर्वी कृपया सर्व त्रुटी दुरुस्त करा.',
  },

  confirmation: {
    readyTitle: 'खरेदीदार नोंदणी फॉर्म तयार आहे',
    backendNotice: 'खरेदीदार नोंदणी फॉर्म तयार आहे. बॅकएंड नोंदणी लवकरच जोडली जाईल.',
    summaryTitle: 'सबमिट केलेले नोंदणी तपशील',
    buyerInfoLabel: 'खरेदीदार आणि व्यवसाय',
    contactLabel: 'संपर्क माहिती',
    locationLabel: 'व्यवसायाचे ठिकाण',
    commoditiesLabel: 'पसंतीची पिके',
    volumePriceLabel: 'प्रमाण आणि किंमत लक्ष्य',
    frequencyLabel: 'खरेदीची वारंवारिता',
    frontendStateOnlyNotice: 'फॉर्म डेटा फक्त स्थानिक React state मध्ये ठेवला आहे. बॅकएंड नोंदणी अजून जोडायची आहे.',
    registerAnotherBtn: 'आणखी एक खरेदीदार नोंदणी करा',
    backToHomeBtn: 'SMARTMandi मुख्यपृष्ठावर परत जा',
  },
};

export const translations: Record<Language, TranslationSchema> = {
  en: {
    appName: 'SMARTMandi',
    tagline: 'Farmer-Focused Market Decision Support',
    sihBadge: 'Smart India Hackathon 2026 Prototype',
    nav: {
      home: 'Home',
      marketPrices: 'Market Prices',
      howItWorks: 'How It Works',
      about: 'About',
      findMarket: 'Find Best Market',
      registerBuyer: 'Register as Buyer',
    },
    hero: {
      subLabel: 'SMART AGRICULTURE • MARKET DECISION SUPPORT',
      headingPart1: 'Find the',
      headingHighlight: 'Best Market',
      headingPart2: 'for Your Crop',
      subText: 'Compare market prices, estimated transport costs and expected returns before you sell.',
      ctaPrimary: 'Find Best Market',
      ctaSecondary: 'How It Works',
      floatingTitle: 'Better decisions',
      floatingDesc: 'Compare price and transport before selling.',
      features: {
        transport: {
          title: 'Transport Cost Factored',
          desc: 'Estimated transport cost calculated from distance & volume.',
        },
        multiMandi: {
          title: 'Multi-Mandi Benchmarking',
          desc: 'Compares local and regional APMC yards simultaneously.',
        },
        netReturn: {
          title: 'Maximized Net Return',
          desc: 'Ranked strictly by highest take-home net profit.',
        },
      },
    },
    categories: {
      all: 'All Crops',
      vegetables: 'Vegetables',
      fruits: 'Fruits',
      cereals: 'Cereals',
      pulses: 'Pulses',
      oilseeds: 'Oilseeds',
      commercial: 'Commercial Crops',
    },
    input: {
      sectionBadge: 'Farmer Market Calculator',
      heading: 'Where should you sell your crop?',
      subText: 'Enter a few details and SMARTMandi will compare suitable market options.',
      formTitle: 'Enter Your Details',
      formSub: 'Complete all steps to find the best market',
      step1: 'Select Crop',
      step2: 'Quantity (Quintals)',
      step3: 'Your Location',
      step4: 'Analyze Markets',
      cropLabel: 'Select Crop',
      cropPlaceholder: 'Search or select a crop...',
      cropSearchPlaceholder: 'Search crop by name (e.g. Tomato, Rice, Turmeric)...',
      noCropsFound: 'No crops found matching',
      cropsCount: 'crops',
      quantityLabel: 'Quantity (Quintals)',
      quantityPlaceholder: 'Enter quantity in quintals (e.g. 25)',
      quintalsLabel: 'quintals',
      kgLabel: 'kg',
      qtlLabel: 'qtl',
      directQuantityLabel: 'Or enter quantity directly:',
      directQuantityPlaceholder: 'e.g. 25',
      conversionFormula: '1 Quintal = 100 kg',
      totalKg: 'total',
      locationLabel: 'Your Location',
      locationPlaceholder: 'Enter village, town or district (e.g. Warangal, Kurnool, Nashik)',
      useLocationBtn: 'Use GPS',
      locationDetecting: 'Locating...',
      locationSuccess: 'Location detected: ',
      locationError: 'Could not access location. Please type your town or district.',
      locationDenied: 'Location permission denied. Please enter it manually.',
      speakBtn: 'Voice Search',
      listening: 'Listening...',
      voiceInstruction: '🎙️ Say: "25 quintals tomato near Warangal"',
      speechNotSupported: 'Speech recognition is not supported in this browser. Please type directly.',
      voiceError: 'Could not capture voice clearly. Please try again or type directly.',
      voiceRecognizedQtl: 'Recognized: {qty} quintal(s)',
      voiceRecognizedKg: 'Recognized: {kg} kg → {qtl} quintal(s)',
      voiceHeardAmbiguous: 'Heard "{num}". Did you mean {num} quintals or {num} kg (= {converted} qtl)?',
      voiceSetQtl: 'Set to {num} quintal(s)',
      voiceSetKg: '{num} kg → {converted} quintal(s) set',
      submitBtn: 'Find Best Market',
      analyzing: 'Analyzing Mandis & Transport Rates...',
      disclaimerText: 'We compare market prices, distance and estimated transport costs to calculate your estimated net return.',
      invalidQuantity: 'Please enter a valid harvest quantity in quintals.',
      invalidCrop: 'Please select a crop.',
      invalidLocation: 'Please enter your location.',
      noMarketData: 'Market data for this crop is not available yet.',
    },
    results: {
      heading: 'Your Calculated Query',
      bestOptionBadge: '⭐ BEST OPTION',
      estimatedNetReturn: 'Estimated Net Return',
      takeHome: '(Take-home)',
      smartScoreLabel: 'Smart Market Score',
      scoreBreakdown: 'Score Breakdown',
      netReturn: 'Net Return',
      price: 'Price',
      distance: 'Distance',
      transport: 'Transport',
      estMandiFee: 'Est. Mandi Fees & Cess (~2%)',
      grossIncomeLabel: 'Estimated Gross Revenue',
      transportLabel: 'Estimated Transport Cost',
      netReturnLabel: 'Estimated Net Return (Take-home)',
      mandiPriceLabel: 'Mandi Price',
      perQuintal: '/ quintal',
      whyThisMarket: 'Why this market?',
      viewFullDetails: 'View Full Details',
      distanceLabel: 'Distance',
      minUnit: 'min',
      signal: {
        sellNow: {
          label: '✅ SELL NOW',
          sub: 'High score — this mandi is a strong selling opportunity',
        },
        monitor: {
          label: '⚠️ MONITOR PRICE',
          sub: 'Moderate score — monitor prices before transporting produce',
        },
        insufficient: {
          label: 'ℹ️ DATA INSUFFICIENT',
          sub: 'More mandi transactions needed for a strong decision signal',
        },
      },
      comparisonTitle: 'Market Comparison Table',
      comparisonSub: 'Mandis compared using estimated net return, price, distance and transport cost.',
      tableHeaders: {
        rank: '#',
        market: 'Market Name',
        net: 'Net Return',
        distance: 'Distance',
        time: 'Est. Time',
        score: 'Score',
        diff: 'Diff vs Best',
      },
      sampleNotice: 'Official market data • Transport estimates are calculated separately',
      recommendationBasis: 'Recommendation based on Smart Market Score',
      intelligenceTitle: 'Price & Arrival Intelligence',
      marketPriceLabel: 'Current Price',
      modalPriceLabel: 'Modal Price',
      marketArrivalLabel: 'Today\'s Arrivals',
      tonnesUnit: 'Tonnes',
      perKg: '/ kg',
      arrivalUnavailable: 'Arrival data unavailable',
      historicalUnavailable: 'Historical Data Unavailable',
      sampleDataLabel: 'Verified Mandi Data',
      originLocation: 'Origin Location',
      marketDataLabel: 'Market Data',
    },
    whatIf: {
      title: 'What-If Comparison',
      subtitle: 'Select any candidate market to compare live revenue and transport trade-offs against the recommended option.',
      selectMarketLabel: 'Select Market:',
      expectedRevenue: 'Expected Revenue',
      transportCost: 'Transport Cost',
      expectedNetReturn: 'Expected Net Return',
      diffFromBest: 'Difference from Recommended Market',
      bestOptionNote: 'This is already the recommended best market for maximum take-home profit.',
      comparedToBest: 'Compared to best market:',
    },
    charts: {
      priceComparisonTitle: 'Market Price Comparison',
      priceComparisonSub: 'Price per kg (₹) across candidate mandis',
      priceTrendTitle: 'Price Trend',
      priceTrendSub: 'Official historical price series will appear when available',
      bestOptionLegend: 'Best Option',
      otherMandisLegend: 'Other Mandis',
      sevenDayHistory: '7-Day History',
      sevenDayAverage: '7-Day Average:',
      historicalTrend: 'Historical Price Trend',
      ratePerKgAxis: 'Rate per kg (₹)',
      priceAxis: 'Price (₹/kg)',
      tooltipPrice: 'Price:',
      tooltipEstNet: 'Est. Net Return:',
      tooltipAvgRate: 'Avg Market Rate:',
      sampleDataLabel: 'Market Intelligence',
    },
    map: {
      title: 'Farmer Location & Route View',
      subtitle: 'Geographic proximity and distance visualization from your farm origin to candidate mandis.',
      farmerLocation: 'Farmer Location',
      recommendedMandi: 'Recommended APMC Mandi',
      routeDistance: 'Distance',
      dataUnavailable: 'Map GPS coordinates unavailable. Enter a valid GPS location or district to view visual routing.',
      gpsPrompt: 'Use the "Use GPS" button in the form to enable map view.',
      distanceDisclaimer: '* Distances are approximate estimates. Use Google Maps for navigation.',
    },
    bestSellingWindow: {
      title: 'Best Selling Window',
      condition: 'Current Market Condition',
      awaiting: 'Awaiting Sufficient Data',
      trend: 'Historical Price Trend',
      unavailable: 'Historical Data Unavailable',
      comingSoon: 'Coming Soon',
      comingSoonDesc: 'We are working on integrating reliable historical market data to power this feature.',
    },
    howItWorks: {
      badge: 'Simple Four-Step Flow',
      heading: 'How It Works',
      subText: 'A simple four-step process to help you make a better market decision.',
      stepPrefix: 'Step',
      ofSteps: 'of 04',
      steps: [
        {
          num: '01',
          title: 'Enter Crop & Quantity',
          description: 'Select the harvested produce and total weight in quintals.',
        },
        {
          num: '02',
          title: 'Compare Market Prices',
          description: 'Evaluate prevailing rates across nearby and regional agricultural market yards.',
        },
        {
          num: '03',
          title: 'Check Distance & Transport',
          description: 'Estimate transport costs based on distance and quantity.',
        },
        {
          num: '04',
          title: 'Choose the Best Market',
          description: 'Identify where your estimated net return is maximized, not just the highest nominal rate.',
        },
      ],
    },
    whySmartMandi: {
      badge: 'Core Differentiators',
      heading: 'Why SMARTMandi?',
      subText: 'Designed to solve real farmer dilemmas during post-harvest marketing.',
      verifiedMetric: 'Verified Decision Metric',
      cards: [
        {
          tag: 'PERSONALIZED',
          title: 'Tailored to Your Produce',
          description: 'Recommendations consider your specific crop type, volume in quintals, and provided location.',
        },
        {
          tag: 'BEYOND PRICE',
          title: 'Estimated Net Return Discovery',
          description: 'The system factors in estimated transportation and logistics costs instead of looking only at market price.',
        },
        {
          tag: 'FARMER FRIENDLY',
          title: 'Built for Simplicity',
          description: 'Simple interface, voice input assistance, and multi-language support in English, Telugu, Hindi, and Marathi.',
        },
        {
          tag: 'EXPLAINABLE',
          title: 'Transparent Calculations',
          description: 'The application clearly shows why a particular market was recommended with transparent arithmetic.',
        },
      ],
    },
    footer: {
      aboutText: 'Helping farmers make informed market decisions.',
      navTitle: 'Navigation',
      actionsTitle: 'Actions',
      copyright: 'SMARTMandi. Market Linkage & Price Discovery Decision Support.',
      missionStatement: 'Strengthening market linkages & price discovery for Indian farmers.',
    },
    marketPricesModal: {
      title: 'Available Baseline Mandi Prices',
      subtitle: 'Indicative rates across major agricultural APMC yards',
      noticeTitle: 'Official market data:',
      noticeText: 'Rates are displayed only when retrieved from the configured official government resource or clearly marked as cached data. If retrieval fails, no prices are shown.',
      mandiCol: 'Mandi Yard',
      locationCol: 'Location',
      closeBtn: 'Close',
    },
    aboutModal: {
      title: 'About SMARTMandi',
      subtitle: 'Market Linkage & Price Discovery Decision Platform',
      problemStatementTitle: 'Problem Statement',
      problemStatement: 'Strengthening market linkages and price discovery for farmers',
      description: 'Many farmers travel to distant mandis lured by high quoted prices, only to realize that diesel, vehicle hire, and loading costs wiped out their extra margin. SMARTMandi models logistics cost alongside market price to calculate the estimated net return before the farmer loads the tractor.',
      architectureTitle: 'Planned Production Architecture',
      archFrontend: 'React Frontend (Interactive Decision Interface)',
      archApi: 'FastAPI REST Microservice',
      archDb: 'PostgreSQL Database',
      archFeed: 'National Agricultural Market (e-NAM / APMC) Feed',
      archEngine: 'Net Return Recommendation Engine',
      closeBtn: 'Close',
    },
    buyerRegistration: enBuyerRegistration,
  },

  te: {
    appName: 'SMARTMandi',
    tagline: 'రైతు మార్కెట్ నిర్ణయ మద్దతు వ్యవస్థ',
    sihBadge: 'స్మార్ట్ ఇండియా హ్యాకథాన్ 2026 ప్రోటోటైప్',
    nav: {
      home: 'హోమ్',
      marketPrices: 'మార్కెట్ ధరలు',
      howItWorks: 'ఇది ఎలా పనిచేస్తుంది',
      about: 'మా గురించి',
      findMarket: 'ఉత్తమ మార్కెట్ కనుగొనండి',
      registerBuyer: 'కొనుగోలుదారుగా నమోదు',
    },
    hero: {
      subLabel: 'స్మార్ట్ వ్యవసాయం • మార్కెట్ నిర్ణయ మద్దతు',
      headingPart1: 'మీ పంటకు',
      headingHighlight: 'సరైన మార్కెట్‌ను',
      headingPart2: 'ఎంచుకోండి',
      subText: 'పంట అమ్మే ముందు మార్కెట్ ధరలు, రవాణా ఖర్చులు మరియు చేతికి వచ్చే నికర లాభాన్ని సరిపోల్చుకోండి.',
      ctaPrimary: 'ఉత్తమ మార్కెట్ కనుగొనండి',
      ctaSecondary: 'ఇది ఎలా పనిచేస్తుంది',
      floatingTitle: 'సరైన నిర్ణయాలు',
      floatingDesc: 'అమ్మే ముందే ధర మరియు రవాణా ఖర్చులను సరిపోల్చండి.',
      features: {
        transport: {
          title: 'రవాణా ఖర్చుతో కూడిన లెక్క',
          desc: 'దూరం మరియు పరిమాణం ఆధారంగా అంచనా రవాణా ఖర్చు.',
        },
        multiMandi: {
          title: 'వివిధ మార్కెట్ల పోలిక',
          desc: 'సమీప మరియు ప్రాంతీయ వ్యవసాయ మార్కెట్లను ఒకేసారి సరిపోల్చండి.',
        },
        netReturn: {
          title: 'గరిష్ట నికర లాభం',
          desc: 'చేతికి వచ్చే నికర లాభం ఆధారంగా ప్రాధాన్యత.',
        },
      },
    },
    categories: {
      all: 'అన్ని పంటలు',
      vegetables: 'కూరగాయలు',
      fruits: 'పండ్లు',
      cereals: 'ధాన్యాలు',
      pulses: 'పప్పుధాన్యాలు',
      oilseeds: 'నూనెగింజలు',
      commercial: 'వాణిజ్య పంటలు',
    },
    input: {
      sectionBadge: 'రైతు మార్కెట్ క్యాలిక్యులేటర్',
      heading: 'మీ పంటను ఎక్కడ విక్రయించాలి?',
      subText: 'కొన్ని వివరాలను నమోదు చేయండి, SMARTMandi అనువైన మార్కెట్లను సరిపోల్చి చూపిస్తుంది.',
      formTitle: 'మీ వివరాలను నమోదు చేయండి',
      formSub: 'ఉత్తమ మార్కెట్‌ను కనుగొనడానికి క్రింది దశలను పూర్తి చేయండి',
      step1: 'పంటను ఎంచుకోండి',
      step2: 'పరిమాణం (క్వింటాళ్లలో)',
      step3: 'మీ ప్రాంతం / గ్రామం',
      step4: 'మార్కెట్లను విశ్లేషించండి',
      cropLabel: 'పంటను ఎంచుకోండి',
      cropPlaceholder: 'పంటను ఎంచుకోండి లేదా వెతకండి...',
      cropSearchPlaceholder: 'పంట పేరుతో వెతకండి (ఉదా. టమాటా, వరి, పసుపు)...',
      noCropsFound: 'ఎటువంటి పంటలు కనుగొనబడలేదు',
      cropsCount: 'పంటలు',
      quantityLabel: 'పరిమాణం (క్వింటాళ్లలో)',
      quantityPlaceholder: 'పరిమాణం క్వింటాళ్లలో నమోదు చేయండి (ఉదా. 25)',
      quintalsLabel: 'క్వింటాళ్లు',
      kgLabel: 'కిలోలు',
      qtlLabel: 'క్వింటాళ్లు',
      directQuantityLabel: 'లేదా నేరుగా సంఖ్యను నమోదు చేయండి:',
      directQuantityPlaceholder: 'ఉదా. 25',
      conversionFormula: '1 క్వింటా = 100 కిలోలు',
      totalKg: 'మొత్తం',
      locationLabel: 'మీ ప్రాంతం / గ్రామం',
      locationPlaceholder: 'గ్రామం, పట్టణం లేదా జిల్లా (ఉదా. వరంగల్, కర్నూలు, ఖమ్మం)',
      useLocationBtn: 'GPS వాడండి',
      locationDetecting: 'లొకేషన్ గుర్తిస్తోంది...',
      locationSuccess: 'లొకేషన్ గుర్తించబడింది: ',
      locationError: 'లొకేషన్ పొందలేకపోయాము. దయచేసి గ్రామం లేదా జిల్లా పేరు టైప్ చేయండి.',
      locationDenied: 'లొకేషన్ అనుమతి నిరాకరించబడింది. దయచేసి స్వయంగా నమోదు చేయండి.',
      speakBtn: 'వాయిస్ సెర్చ్',
      listening: 'వింటోంది...',
      voiceInstruction: '🎙️ చెప్పండి: "వరంగల్ దగ్గర 25 క్వింటాళ్ల టమాటా"',
      speechNotSupported: 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు. దయచేసి టైప్ చేయండి.',
      voiceError: 'వాయిస్ స్పష్టంగా అర్థం కాలేదు. మళ్ళీ ప్రయత్నించండి లేదా టైప్ చేయండి.',
      voiceRecognizedQtl: 'గుర్తించబడింది: {qty} క్వింటాళ్లు',
      voiceRecognizedKg: 'గుర్తించబడింది: {kg} కిలోలు → {qtl} క్వింటాళ్లు',
      voiceHeardAmbiguous: '"{num}" వినబడింది. {num} క్వింటాళ్లా లేదా {num} కిలోలా (= {converted} క్వింటాళ్లు)?',
      voiceSetQtl: '{num} క్వింటాళ్లుగా సెట్ చేయబడింది',
      voiceSetKg: '{num} కిలోలు → {converted} క్వింటాళ్లుగా సెట్ చేయబడింది',
      submitBtn: 'ఉత్తమ మార్కెట్ కనుగొనండి',
      analyzing: 'మార్కెట్లు మరియు రవాణా రేట్లను విశ్లేషిస్తోంది...',
      disclaimerText: 'మీ నికర లాభాన్ని అంచనా వేయడానికి మేము మార్కెట్ ధరలు, దూరం మరియు రవాణా ఖర్చులను లెక్కిస్తాము.',
      invalidQuantity: 'దయచేసి సరైన పరిమాణాన్ని క్వింటాళ్లలో నమోదు చేయండి.',
      invalidCrop: 'దయచేసి ఒక పంటను ఎంచుకోండి.',
      invalidLocation: 'దయచేసి మీ ప్రాంతాన్ని నమోదు చేయండి.',
      noMarketData: 'ఈ పంటకు మార్కెట్ సమాచారం ఇంకా అందుబాటులో లేదు.',
    },
    results: {
      heading: 'లెక్కింపు సారాంశం',
      bestOptionBadge: '⭐ ఉత్తమ ఎంపిక (BEST OPTION)',
      estimatedNetReturn: 'అంచనా నికర లాభం',
      takeHome: '(చేతికి వచ్చే లాభం)',
      smartScoreLabel: 'స్మార్ట్ మార్కెట్ స్కోర్',
      scoreBreakdown: 'స్కోర్ వివరాలు',
      netReturn: 'నికర లాభం',
      price: 'ధర',
      distance: 'దూరం',
      transport: 'రవాణా',
      estMandiFee: 'మండి చార్జీలు (~2%)',
      grossIncomeLabel: 'అంచనా మొత్తం ఆదాయం',
      transportLabel: 'అంచనా రవాణా ఖర్చు',
      netReturnLabel: 'చేతికి వచ్చే నికర లాభం (Take-home)',
      mandiPriceLabel: 'మండి ధర',
      perQuintal: '/ క్వింటాల్',
      whyThisMarket: 'ఈ మార్కెట్ ఎందుకు?',
      viewFullDetails: 'వివరంగా చూడండి',
      distanceLabel: 'దూరం',
      minUnit: 'నిమి',
      signal: {
        sellNow: {
          label: '✅ ఇప్పుడే అమ్మండి (SELL NOW)',
          sub: 'అత్యధిక స్కోర్ — ఈ మార్కెట్ మంచి అవకాశం',
        },
        monitor: {
          label: '⚠️ ధర పర్యవేక్షించండి (MONITOR)',
          sub: 'సాధారణ స్కోర్ — అమ్మే ముందు ధరలను గమనించండి',
        },
        insufficient: {
          label: 'ℹ️ డేటా సరిపోదు',
          sub: 'ఖచ్చితమైన సంకేతం కొరకు మరింత మార్కెట్ సమాచారం అవసరం',
        },
      },
      comparisonTitle: 'మార్కెట్ పోలిక పట్టిక',
      comparisonSub: 'రవాణా ఖర్చుల తర్వాత చేతికి వచ్చే నికర లాభం, దూరం మరియు ధరల ఆధారంగా మార్కెట్ల పోలిక.',
      tableHeaders: {
        rank: '#',
        market: 'మండి మార్కెట్',
        net: 'నికర లాభం',
        distance: 'దూరం',
        time: 'అంచనా సమయం',
        score: 'స్కోర్',
        diff: 'తేడా',
      },
      sampleNotice: 'అధికారిక మార్కెట్ డేటా • రవాణా అంచనాలు విడిగా లెక్కించబడతాయి',
      recommendationBasis: 'స్మార్ట్ మార్కెట్ స్కోర్ ఆధారంగా సిఫార్సు',
      intelligenceTitle: 'ధర మరియు రాక సమాచారం',
      marketPriceLabel: 'ప్రస్తుత ధర',
      modalPriceLabel: 'సగటు ధర (Modal Price)',
      marketArrivalLabel: 'నేటి మార్కెట్ రాక',
      tonnesUnit: 'టన్నులు',
      perKg: '/ కిలో',
      arrivalUnavailable: 'రాక సమాచారం అందుబాటులో లేదు',
      historicalUnavailable: 'చారిత్రక సమాచారం అందుబాటులో లేదు',
      sampleDataLabel: 'ధృవీకరించిన మండి డేటా',
      originLocation: 'ప్రారంభ ప్రాంతం',
      marketDataLabel: 'మార్కెట్ డేటా',
    },
    whatIf: {
      title: 'మరొక మార్కెట్‌లో అమ్మితే లాభం ఎంత?',
      subtitle: 'సిఫార్సు చేసిన మార్కెట్‌తో ఇతర మండీల ఆదాయం మరియు రవాణా ఖర్చులను పోల్చి చూడండి.',
      selectMarketLabel: 'పోల్చాల్సిన మార్కెట్ ఎంచుకోండి:',
      expectedRevenue: 'అంచనా మొత్తం ఆదాయం',
      transportCost: 'అంచనా రవాణా ఖర్చు',
      expectedNetReturn: 'అంచనా నికర లాభం',
      diffFromBest: 'ఉత్తమ మార్కెట్‌తో పోలిస్తే తేడా',
      bestOptionNote: 'గరిష్ట నికర లాభం కోసం ఇది ఇప్పటికే సిఫార్సు చేసిన ఉత్తమ మార్కెట్.',
      comparedToBest: 'ఉత్తమ మార్కెట్‌తో పోలిక:',
    },
    charts: {
      priceComparisonTitle: 'మార్కెట్ ధరల పోలిక',
      priceComparisonSub: 'వివిధ మార్కెట్లలో కిలో ధర (₹)',
      priceTrendTitle: 'ధరల సరళి',
      priceTrendSub: 'ప్రాంతీయ మార్కెట్లలో గత 7 రోజుల సగటు ధరల కదలిక',
      bestOptionLegend: 'ఉత్తమ ఎంపిక',
      otherMandisLegend: 'ఇతర మార్కెట్లు',
      sevenDayHistory: '7 రోజుల చరిత్ర',
      sevenDayAverage: '7 రోజుల సగటు:',
      historicalTrend: 'చారిత్రక ధరల సరళి',
      ratePerKgAxis: 'ధర / కిలో (₹)',
      priceAxis: 'ధర (₹/కిలో)',
      tooltipPrice: 'ధర:',
      tooltipEstNet: 'అంచనా నికర లాభం:',
      tooltipAvgRate: 'సగటు మార్కెట్ ధర:',
      sampleDataLabel: 'మార్కెట్ సమాచారం',
    },
    map: {
      title: 'రైతు - మార్కెట్ దూరం మరియు మార్గం',
      subtitle: 'మీ ప్రాంతం నుండి వివిధ మార్కెట్లకు గల దూరం మరియు మార్గ సమాచారం.',
      farmerLocation: 'రైతు ప్రాంతం',
      recommendedMandi: 'సిఫార్సు చేసిన మార్కెట్',
      routeDistance: 'రవాణా దూరం',
      dataUnavailable: 'మ్యాప్ GPS లొకేషన్ అందుబాటులో లేదు. ఖచ్చితమైన వివరాలకు GPS ఆన్ చేయండి.',
      gpsPrompt: 'మ్యాప్ వీక్షణను ప్రారంభించడానికి ఫారమ్‌లోని "GPS వాడండి" బటన్‌ను ఉపయోగించండి.',
      distanceDisclaimer: '* దూరాలు అంచనా మాత్రమే. నావిగేషన్ కోసం Google Maps ఉపయోగించండి.',
    },
    bestSellingWindow: {
      title: 'అమ్మడానికి సరైన సమయం',
      condition: 'ప్రస్తుత మార్కెట్ పరిస్థితి',
      awaiting: 'తగినంత డేటా కోసం వేచి ఉంది',
      trend: 'చారిత్రక ధరల సరళి',
      unavailable: 'చారిత్రక సమాచారం అందుబాటులో లేదు',
      comingSoon: 'త్వరలో వస్తోంది',
      comingSoonDesc: 'ఈ ఫీచర్‌కు నమ్మకమైన చారిత్రక మార్కెట్ డేటాను అనుసంధానించడానికి మేము పని చేస్తున్నాము.',
    },
    howItWorks: {
      badge: 'నాలుగు సులభమైన దశలు',
      heading: 'ఇది ఎలా పనిచేస్తుంది',
      subText: 'సరైన మార్కెట్ నిర్ణయం తీసుకోవడంలో సహాయపడే నాలుగు సులభమైన దశలు.',
      stepPrefix: 'దశ',
      ofSteps: '(మొత్తం 4 లో)',
      steps: [
        {
          num: '01',
          title: 'పంట మరియు పరిమాణాన్ని నమోదు చేయండి',
          description: 'మీ పంట మరియు మొత్తం దిగుబడి పరిమాణాన్ని క్వింటాళ్లలో ఎంచుకోండి.',
        },
        {
          num: '02',
          title: 'మార్కెట్ ధరలను సరిపోల్చండి',
          description: 'సమీప మరియు ప్రాంతీయ వ్యవసాయ మార్కెట్ యార్డులలో ఉన్న ప్రస్తుత ధరలను అంచనా వేయండి.',
        },
        {
          num: '03',
          title: 'దూరం మరియు రవాణా ఖర్చులను తనిఖీ చేయండి',
          description: 'దూరం మరియు పరిమాణం ఆధారంగా రవాణా ఖర్చులను లెక్కించండి.',
        },
        {
          num: '04',
          title: 'ఉత్తమ మార్కెట్‌ను ఎంచుకోండి',
          description: 'కేవలం ఎక్కువ ధర మాత్రమే కాకుండా, రవాణా ఖర్చులు పోను ఎక్కువ నికర లాభం ఎక్కడ వస్తుందో గుర్తించండి.',
        },
      ],
    },
    whySmartMandi: {
      badge: 'ప్రత్యేక ప్రయోజనాలు',
      heading: 'SMARTMandi ఎందుకు?',
      subText: 'పంట కోత తర్వాత విక్రయించేటప్పుడు రైతులకు ఎదురయ్యే సమస్యలను పరిష్కరించడానికి రూపొందించబడింది.',
      verifiedMetric: 'ధృవీకరించబడిన నిర్ణయ ప్రమాణం',
      cards: [
        {
          tag: 'వ్యక్తిగతీకరించినది',
          title: 'మీ పంటకు అనుకూలమైనది',
          description: 'మీ నిర్దిష్ట పంట రకం, పరిమాణం మరియు లొకేషన్ ఆధారంగా సిఫార్సులు ఉంటాయి.',
        },
        {
          tag: 'ధరకు మించి',
          title: 'నికర లాభం గుర్తింపు',
          description: 'కేవలం మార్కెట్ ధరను మాత్రమే కాకుండా రవాణా మరియు లాజిస్టిక్స్ ఖర్చులను కూడా పరిగణిస్తుంది.',
        },
        {
          tag: 'రైతులకు సులభం',
          title: 'సరళమైన రూపకల్పన',
          description: 'సులభమైన ఇంటర్‌ఫేస్, వాయిస్ ఇన్‌పుట్ సదుపాయం మరియు బహుళ భాషా మద్దతు.',
        },
        {
          tag: 'పారదర్శకత',
          title: 'స్పష్టమైన లెక్కలు',
          description: 'విశిష్ట మార్కెట్ ఎందుకు సిఫార్సు చేయబడిందో స్పష్టమైన గణాంకాలతో రైతుకు సులభంగా అర్థమవుతుంది.',
        },
      ],
    },
    footer: {
      aboutText: 'రైతులు సరైన మార్కెట్ నిర్ణయాలు తీసుకోవడంలో సహాయపడుతుంది.',
      navTitle: 'నావిగేషన్',
      actionsTitle: 'చర్యలు',
      copyright: 'SMARTMandi. మార్కెట్ అనుసంధానం & ధరల ఆవిష్కరణ నిర్ణయ మద్దతు.',
      missionStatement: 'భారతీయ రైతులకు మార్కెట్ అనుసంధానం మరియు సరైన ధరను అందించడం.',
    },
    marketPricesModal: {
      title: 'అందుబాటులో ఉన్న ప్రాథమిక మార్కెట్ ధరలు',
      subtitle: 'ప్రధాన వ్యవసాయ మార్కెట్ యార్డులలోని ప్రస్తుత సూచిక ధరలు',
      noticeTitle: 'అధికారిక మార్కెట్ డేటా:',
      noticeText: 'ధరలు అధికారిక ప్రభుత్వ వనరు నుండి పొందినప్పుడు మాత్రమే చూపబడతాయి. పొందడం విఫలమైతే ధరలు చూపించబడవు.',
      mandiCol: 'మండి మార్కెట్',
      locationCol: 'ప్రాంతం',
      closeBtn: 'మూసివేయి',
    },
    aboutModal: {
      title: 'SMARTMandi గురించి',
      subtitle: 'మార్కెట్ అనుసంధానం & ధరల ఆవిష్కరణ నిర్ణయ వేదిక',
      problemStatementTitle: 'సమస్య వివరణ',
      problemStatement: 'రైతులకు మార్కెట్ అనుసంధానం మరియు సరైన ధరను బలోపేతం చేయడం',
      description: 'చాలామంది రైతులు దూరపు మార్కెట్లలో అధిక ధరలు చూసి వెళ్తారు, కానీ డీజిల్, వాహన అద్దె మరియు లోడింగ్ ఖర్చుల వల్ల చేతికి వచ్చే లాభం తగ్గిపోతుంది. SMARTMandi ట్రాక్టర్ ఎక్కించే ముందే రవాణా ఖర్చులను పరిగణనలోకి తీసుకొని నిజమైన నికర లాభాన్ని లెక్కిస్తుంది.',
      architectureTitle: 'సాంకేతిక నిర్మాణం',
      archFrontend: 'React ఫ్రంటెండ్ (నిర్ణయ ఇంటర్‌ఫేస్)',
      archApi: 'FastAPI REST మైక్రోసర్వీస్',
      archDb: 'PostgreSQL డేటాబేస్',
      archFeed: 'జాతీయ వ్యవసాయ మార్కెట్ (e-NAM / APMC) ఫీడ్',
      archEngine: 'నికర లాభం సిఫార్సు ఇంజిన్',
      closeBtn: 'మూసివేయి',
    },
    buyerRegistration: teBuyerRegistration,
  },

  hi: {
    appName: 'SMARTMandi',
    tagline: 'किसान-केंद्रित मंडी निर्णय सहायता प्रणाली',
    sihBadge: 'स्मार्ट इंडिया हैकथॉन 2026 प्रोटोटाइप',
    nav: {
      home: 'होम',
      marketPrices: 'मंडी भाव',
      howItWorks: 'यह कैसे काम करता है',
      about: 'हमारे बारे में',
      findMarket: 'सर्वोत्तम मंडी खोजें',
      registerBuyer: 'Register as Buyer',
    },
    hero: {
      subLabel: 'स्मार्ट कृषि • मंडी निर्णय सहायता प्रणाली',
      headingPart1: 'अपनी फसल के लिए',
      headingHighlight: 'सर्वोत्तम मंडी',
      headingPart2: 'चुनें',
      subText: 'फसल बेचने से पहले मंडी भाव, अनुमानित परिवहन खर्च और हाथ में आने वाले शुद्ध मुनाफे की तुलना करें।',
      ctaPrimary: 'सर्वोत्तम मंडी खोजें',
      ctaSecondary: 'यह कैसे काम करता है',
      floatingTitle: 'सटीक निर्णय',
      floatingDesc: 'माल बेचने से पहले भाव और ढुलाई खर्च की तुलना करें।',
      features: {
        transport: {
          title: 'परिवहन खर्च सम्मिलित',
          desc: 'दूरी और मात्रा के आधार पर अनुमानित ढुलाई खर्च का सटीक हिसाब।',
        },
        multiMandi: {
          title: 'मंडियों की एकसाथ तुलना',
          desc: 'स्थानीय और क्षेत्रीय कृषि उपज मंडियों की एक साथ तुलना।',
        },
        netReturn: {
          title: 'अधिकतम शुद्ध मुनाफा',
          desc: 'केवल भाव नहीं, हाथ में आने वाली शुद्ध आय के आधार पर वरीयता।',
        },
      },
    },
    categories: {
      all: 'सभी फसलें',
      vegetables: 'सब्ज़ियाँ',
      fruits: 'फल',
      cereals: 'अनाज',
      pulses: 'दलहन',
      oilseeds: 'तिलहन',
      commercial: 'नकदी फसलें',
    },
    input: {
      sectionBadge: 'किसान मंडी कैलकुलेटर',
      heading: 'अपनी फसल कहाँ बेचनी चाहिए?',
      subText: 'कुछ बुनियादी जानकारी भरें, SMARTMandi सबसे उपयुक्त मंडियों की तुलना करके दिखाएगा।',
      formTitle: 'अपनी जानकारी दर्ज करें',
      formSub: 'सर्वोत्तम मंडी खोजने के लिए नीचे दिए गए चरण पूरे करें',
      step1: 'फसल चुनें',
      step2: 'मात्रा (क्विंटल में)',
      step3: 'आपका स्थान / गाँव',
      step4: 'मंडियों का विश्लेषण करें',
      cropLabel: 'फसल चुनें',
      cropPlaceholder: 'फसल चुनें या नाम खोजें...',
      cropSearchPlaceholder: 'फसल का नाम खोजें (उदा. टमाटर, धान, हल्दी)...',
      noCropsFound: 'कोई फसल नहीं मिली',
      cropsCount: 'फसलें',
      quantityLabel: 'मात्रा (क्विंटल में)',
      quantityPlaceholder: 'मात्रा क्विंटल में दर्ज करें (उदा. 25)',
      quintalsLabel: 'क्विंटल',
      kgLabel: 'किलो',
      qtlLabel: 'क्विंटल',
      directQuantityLabel: 'या सीधे संख्या दर्ज करें:',
      directQuantityPlaceholder: 'उदा. 25',
      conversionFormula: '1 क्विंटल = 100 किलो',
      totalKg: 'कुल',
      locationLabel: 'आपका स्थान / गाँव',
      locationPlaceholder: 'गाँव, कस्बा या जिले का नाम (उदा. इंदौर, वारंगल, नासिक)',
      useLocationBtn: 'GPS का उपयोग करें',
      locationDetecting: 'स्थान खोजा जा रहा है...',
      locationSuccess: 'स्थान प्राप्त हुआ: ',
      locationError: 'स्थान का पता नहीं चल सका। कृपया गाँव या शहर का नाम टाइप करें।',
      locationDenied: 'स्थान की अनुमति अस्वीकृत। कृपया मैन्युअल रूप से दर्ज करें।',
      speakBtn: 'बोलकर खोजें',
      listening: 'सुन रहा है...',
      voiceInstruction: '🎙️ बोलें: "वारंगल के पास 25 क्विंटल टमाटर"',
      speechNotSupported: 'इस ब्राउज़र में वॉयस पहचान उपलब्ध नहीं है। कृपया टाइप करें।',
      voiceError: 'आवाज़ स्पष्ट नहीं सुनी। कृपया दोबारा बोलें या टाइप करें।',
      voiceRecognizedQtl: 'पहचाना गया: {qty} क्विंटल',
      voiceRecognizedKg: 'पहचाना गया: {kg} किलो → {qtl} क्विंटल',
      voiceHeardAmbiguous: '"{num}" सुना। क्या आपका मतलब {num} क्विंटल है या {num} किलो (= {converted} क्विंटल)?',
      voiceSetQtl: '{num} क्विंटल सेट किया',
      voiceSetKg: '{num} किलो → {converted} क्विंटल सेट किया',
      submitBtn: 'सर्वोत्तम मंडी खोजें',
      analyzing: 'मंडियों और ढुलाई दरों का विश्लेषण हो रहा है...',
      disclaimerText: 'आपके शुद्ध मुनाफे का अनुमान लगाने के लिए हम मंडी भाव, दूरी और परिवहन लागत की तुलना करते हैं।',
      invalidQuantity: 'कृपया क्विंटल में सही मात्रा दर्ज करें।',
      invalidCrop: 'कृपया फसल चुनें।',
      invalidLocation: 'कृपया अपना स्थान दर्ज करें।',
      noMarketData: 'इस फसल के लिए मंडी का डेटा अभी उपलब्ध नहीं है।',
    },
    results: {
      heading: 'आपकी गणना का सारांश',
      bestOptionBadge: '⭐ सबसे अच्छा विकल्प (BEST OPTION)',
      estimatedNetReturn: 'अनुमानित शुद्ध आय',
      takeHome: '(हाथ में आने वाला मुनाफा)',
      smartScoreLabel: 'स्मार्ट मार्केट स्कोर',
      scoreBreakdown: 'स्कोर विवरण',
      netReturn: 'शुद्ध मुनाफा',
      price: 'कीमत',
      distance: 'दूरी',
      transport: 'परिवहन',
      estMandiFee: 'अनुमानित मंडी शुल्क (~2%)',
      grossIncomeLabel: 'कुल अनुमानित आय (Gross Income)',
      transportLabel: 'अनुमानित परिवहन खर्च',
      netReturnLabel: 'हाथ में आने वाला शुद्ध मुनाफा (Take-home)',
      mandiPriceLabel: 'मंडी भाव',
      perQuintal: '/ क्विंटल',
      whyThisMarket: 'यह बाज़ार क्यों?',
      viewFullDetails: 'पूरा विवरण देखें',
      distanceLabel: 'दूरी',
      minUnit: 'मिनट',
      signal: {
        sellNow: {
          label: '✅ अभी बेचें (SELL NOW)',
          sub: 'उच्च स्कोर — यह मंडी आपकी फसल के लिए बहुत अच्छा अवसर है',
        },
        monitor: {
          label: '⚠️ भाव पर नजर रखें (MONITOR)',
          sub: 'मध्यम स्कोर — माल भेजने से पहले भाव पर नज़र रखें',
        },
        insufficient: {
          label: 'ℹ️ डेटा अपर्याप्त',
          sub: 'स्पष्ट निर्णय संकेत के लिए अधिक बाज़ार डेटा की आवश्यकता है',
        },
      },
      comparisonTitle: 'मंडी तुलना तालिका',
      comparisonSub: 'ढुलाई खर्च काटने के बाद हाथ में आने वाले वास्तविक शुद्ध मुनाफे, दूरी और भाव की तुलना।',
      tableHeaders: {
        rank: '#',
        market: 'मंडी का नाम',
        net: 'शुद्ध मुनाफा',
        distance: 'दूरी',
        time: 'अनुमानित समय',
        score: 'स्कोर',
        diff: 'अंतर',
      },
      sampleNotice: 'आधिकारिक मंडी डेटा • परिवहन अनुमान अलग से गणना किए जाते हैं',
      recommendationBasis: 'स्मार्ट मार्केट स्कोर के आधार पर सिफारिश',
      intelligenceTitle: 'मंडी भाव और आवक जानकारी',
      marketPriceLabel: 'मौजूदा भाव',
      modalPriceLabel: 'मॉडल भाव (Modal Price)',
      marketArrivalLabel: 'आज की आवक',
      tonnesUnit: 'टन',
      perKg: '/ किलो',
      arrivalUnavailable: 'आवक डेटा अनुपलब्ध',
      historicalUnavailable: 'ऐतिहासिक डेटा अनुपलब्ध',
      sampleDataLabel: 'प्रमाणित मंडी डेटा',
      originLocation: 'आपका स्थान',
      marketDataLabel: 'मंडी डेटा',
    },
    whatIf: {
      title: 'यदि मैं किसी अन्य मंडी में बेचूँ तो?',
      subtitle: 'अनुशंसित मंडी के मुकाबले किसी अन्य मंडी में होने वाले मुनाफे और खर्च की तुरंत तुलना करें।',
      selectMarketLabel: 'तुलना के लिए मंडी चुनें:',
      expectedRevenue: 'अनुमानित कुल आय',
      transportCost: 'अनुमानित परिवहन खर्च',
      expectedNetReturn: 'अनुमानित शुद्ध मुनाफा',
      diffFromBest: 'अनुशंसित मंडी से अंतर',
      bestOptionNote: 'अधिकतम शुद्ध मुनाफे के लिए यह पहले से ही अनुशंसित सर्वोत्तम मंडी है।',
      comparedToBest: 'सर्वोत्तम मंडी से तुलना:',
    },
    charts: {
      priceComparisonTitle: 'मंडी भाव तुलना',
      priceComparisonSub: 'विभिन्न मंडियों में प्रति किलो भाव (₹)',
      priceTrendTitle: 'भाव का रुझान',
      priceTrendSub: 'क्षेत्रीय मंडियों में पिछले 7 दिनों का मॉडल भाव रुझान',
      bestOptionLegend: 'सर्वोत्तम विकल्प',
      otherMandisLegend: 'अन्य मंडियां',
      sevenDayHistory: '7-दिवसीय इतिहास',
      sevenDayAverage: '7-दिवसीय औसत:',
      historicalTrend: 'ऐतिहासिक मूल्य रुझान',
      ratePerKgAxis: 'भाव प्रति किलो (₹)',
      priceAxis: 'भाव (₹/किलो)',
      tooltipPrice: 'भाव:',
      tooltipEstNet: 'अनुमानित शुद्ध मुनाफा:',
      tooltipAvgRate: 'औसत मंडी भाव:',
      sampleDataLabel: 'मंडी जानकारी',
    },
    map: {
      title: 'खेत से मंडी दूरी एवं मार्ग',
      subtitle: 'आपके गाँव/स्थान से विभिन्न मंडियों की दूरी और मार्ग का दृश्य।',
      farmerLocation: 'किसान का स्थान',
      recommendedMandi: 'अनुशंसित कृषि उपज मंडी',
      routeDistance: 'दूरी',
      dataUnavailable: 'मानचित्र GPS डेटा अनुपलब्ध। सटीक मार्ग देखने के लिए GPS स्थान दर्ज करें।',
      gpsPrompt: 'मानचित्र देखने के लिए फ़ॉर्म में "GPS का उपयोग करें" बटन दबाएं।',
      distanceDisclaimer: '* दूरियां अनुमानित हैं। नेविगेशन के लिए Google Maps का उपयोग करें।',
    },
    bestSellingWindow: {
      title: 'बेचने का सबसे सही समय',
      condition: 'वर्तमान बाजार स्थिति',
      awaiting: 'पर्याप्त डेटा की प्रतीक्षा',
      trend: 'ऐतिहासिक मूल्य रुझान',
      unavailable: 'ऐतिहासिक डेटा अनुपलब्ध',
      comingSoon: 'जल्द आ रहा है',
      comingSoonDesc: 'हम इस सुविधा के लिए विश्वसनीय ऐतिहासिक बाजार डेटा को एकीकृत करने पर काम कर रहे हैं।',
    },
    howItWorks: {
      badge: 'चार आसान चरण',
      heading: 'यह कैसे काम करता है',
      subText: 'मंडी का सही निर्णय लेने में मदद करने वाले चार आसान चरण।',
      stepPrefix: 'चरण',
      ofSteps: '(कुल 4 में से)',
      steps: [
        {
          num: '01',
          title: 'फसल और मात्रा दर्ज करें',
          description: 'अपनी फसल और कुल वजन क्विंटल में चुनें।',
        },
        {
          num: '02',
          title: 'मंडी भावों की तुलना करें',
          description: 'आस-पास और क्षेत्रीय कृषि उपज मंडियों (APMC) के मौजूदा दरों का आकलन करें।',
        },
        {
          num: '03',
          title: 'दूरी और परिवहन खर्च जांचें',
          description: 'दूरी और मात्रा के अनुसार वाहन ढुलाई खर्च का हिसाब लगाएं।',
        },
        {
          num: '04',
          title: 'सर्वोत्तम मंडी चुनें',
          description: 'केवल ऊँचा भाव न देखकर, परिवहन खर्च काटने के बाद सबसे अधिक शुद्ध मुनाफा देने वाली मंडी चुनें।',
        },
      ],
    },
    whySmartMandi: {
      badge: 'मुख्य विशेषताएं',
      heading: 'SMARTMandi क्यों चुनें?',
      subText: 'फसल कटाई के बाद बिक्री करते समय किसानों की वास्तविक समस्याओं को हल करने के लिए बनाया गया मंच।',
      verifiedMetric: 'प्रमाणित निर्णय पैमाना',
      cards: [
        {
          tag: 'व्यक्तिगत',
          title: 'आपकी फसल के अनुकूल',
          description: 'सिफारिशें आपकी फसल के प्रकार, क्विंटल में मात्रा और दिए गए स्थान को ध्यान में रखकर की जाती हैं।',
        },
        {
          tag: 'भाव से आगे',
          title: 'शुद्ध मुनाफे की खोज',
          description: 'केवल मंडी भाव ही नहीं, बल्कि प्रत्यक्ष परिवहन और ढुलाई खर्च को सीधे घटाकर हिसाब किया जाता है।',
        },
        {
          tag: 'किसान हितैषी',
          title: 'बेहद सरल और सुलभ',
          description: 'सरल इंटरफ़ेस, बोलकर खोजने की सुविधा और बहुभाषी सहायता (अंग्रेजी, तेलुगु, हिंदी, मराठी)।',
        },
        {
          tag: 'पारदर्शी',
          title: 'स्पष्ट गणना',
          description: 'विशिष्ट मंडी की सिफारिश क्यों की गई, यह पारदर्शी आंकड़ों के साथ किसान को स्पष्ट दिखता है।',
        },
      ],
    },
    footer: {
      aboutText: 'किसानों को मंडी के सटीक और समझदारी भरे निर्णय लेने में सहायक मंच।',
      navTitle: 'नेविगेशन',
      actionsTitle: 'कार्रवाई',
      copyright: 'SMARTMandi. किसान बाजार निर्णय सहायता प्रणाली।',
      missionStatement: 'भारतीय किसानों के लिए पारदर्शी बाजार जुड़ाव और बेहतर मूल्य खोज।',
    },
    marketPricesModal: {
      title: 'उपलब्ध मानक मंडी भाव',
      subtitle: 'प्रमुख कृषि उपज मंडियों के सांकेतिक भाव',
      noticeTitle: 'आधिकारिक मंडी डेटा:',
      noticeText: 'भाव केवल कॉन्फ़िगर किए गए आधिकारिक सरकारी स्रोत से प्राप्त होने पर दिखाए जाते हैं। प्राप्ति विफल होने पर भाव नहीं दिखाए जाते।',
      mandiCol: 'मंडी',
      locationCol: 'स्थान',
      closeBtn: 'बंद करें',
    },
    aboutModal: {
      title: 'SMARTMandi के बारे में',
      subtitle: 'किसान बाजार जुड़ाव और मूल्य खोज निर्णय मंच',
      problemStatementTitle: 'समस्या का विवरण',
      problemStatement: 'किसानों के लिए पारदर्शी मूल्य खोज और बेहतर बाजार पहुंच सुनिश्चित करना',
      description: 'कई किसान दूर की मंडी में ऊँचा भाव सुनकर माल ले जाते हैं, लेकिन डीजल, गाड़ी भाड़ा और पल्लेदारी के कारण अंततः मुनाफा कम हो जाता है। SMARTMandi ट्रैक्टर लोड करने से पहले ही ढुलाई खर्च घटाकर किसान को मिलने वाला वास्तविक शुद्ध मुनाफा दिखाती है।',
      architectureTitle: 'तकनीकी संरचना',
      archFrontend: 'React फ्रंटएंड (इंटरएक्टिव निर्णय इंटरफ़ेस)',
      archApi: 'FastAPI REST माइक्रोसर्विस',
      archDb: 'PostgreSQL डेटाबेस',
      archFeed: 'राष्ट्रीय कृषि बाजार (e-NAM / APMC) फ़ीड',
      archEngine: 'शुद्ध आय सिफारिश इंजन',
      closeBtn: 'बंद करें',
    },
    buyerRegistration: hiBuyerRegistration,
  },

  mr: {
    appName: 'SMARTMandi',
    tagline: 'शेतकऱ्यांसाठी बाजारपेठ निर्णय सहाय्य प्रणाली',
    sihBadge: 'स्मार्ट इंडिया हॅकाथॉन २०२६ प्रोटोटाइप',
    nav: {
      home: 'मुख्यपृष्ठ',
      marketPrices: 'बाजार भाव',
      howItWorks: 'हे कसे कार्य करते',
      about: 'आमच्याबद्दल',
      findMarket: 'सर्वोत्तम बाजार शोधा',
      registerBuyer: 'Register as Buyer',
    },
    hero: {
      subLabel: 'स्मार्ट कृषी • बाजारपेठ निर्णय सहाय्य',
      headingPart1: 'तुमच्या पिकासाठी',
      headingHighlight: 'सर्वोत्तम बाजार',
      headingPart2: 'शोधा',
      subText: 'पीक विकण्यापूर्वी बाजारभाव, अंदाजे वाहतूक खर्च आणि अपेक्षित निव्वळ नफ्याची तुलना करा.',
      ctaPrimary: 'सर्वोत्तम बाजार शोधा',
      ctaSecondary: 'हे कसे कार्य करते',
      floatingTitle: 'योग्य निर्णय घ्या',
      floatingDesc: 'माल विकण्यापूर्वी दर आणि वाहतूक खर्चाची तुलना करा.',
      features: {
        transport: {
          title: 'वाहतूक खर्च समाविष्ट',
          desc: 'अंतर आणि प्रमाणानुसार प्रत्यक्ष वाहतूक खर्चाचा अंदाज.',
        },
        multiMandi: {
          title: 'बाजार समित्यांची तुलना',
          desc: 'स्थानिक आणि प्रादेशिक कृषी उत्पन्न बाजार समित्यांची एकाच वेळी तुलना.',
        },
        netReturn: {
          title: 'जास्तीत जास्त निव्वळ नफा',
          desc: 'केवळ दरापेक्षा प्रत्यक्ष हातात येणाऱ्या निव्वळ नफ्याला प्राधान्य.',
        },
      },
    },
    categories: {
      all: 'सर्व पिके',
      vegetables: 'भाज्या',
      fruits: 'फळे',
      cereals: 'धान्ये',
      pulses: 'कडधान्ये',
      oilseeds: 'गळित धान्ये',
      commercial: 'रोख पिके',
    },
    input: {
      sectionBadge: 'शेतकरी बाजार कॅल्क्युलेटर',
      heading: 'तुमचे पीक कुठे विकावे?',
      subText: 'काही आवश्यक माहिती भरा, SMARTMandi योग्य बाजारपेठांची तुलना करून दाखवेल.',
      formTitle: 'तुमची माहिती भरा',
      formSub: 'सर्वोत्तम बाजार शोधण्यासाठी खालील पायऱ्या पूर्ण करा',
      step1: 'पीक निवडा',
      step2: 'प्रमाण (क्विंटलमध्ये)',
      step3: 'तुमचे ठिकाण / गाव',
      step4: 'बाजारांचे विश्लेषण करा',
      cropLabel: 'पीक निवडा',
      cropPlaceholder: 'पीक निवडा किंवा शोधा...',
      cropSearchPlaceholder: 'पिकाचे नाव शोधा (उदा. टोमॅटो, तांदूळ, हळद)...',
      noCropsFound: 'कोणतेही पीक आढळले नाही',
      cropsCount: 'पिके',
      quantityLabel: 'प्रमाण (क्विंटलमध्ये)',
      quantityPlaceholder: 'प्रमाण क्विंटलमध्ये भरा (उदा. २५)',
      quintalsLabel: 'क्विंटल',
      kgLabel: 'किलो',
      qtlLabel: 'क्विंटल',
      directQuantityLabel: 'किंवा थेट संख्या प्रविष्ट करा:',
      directQuantityPlaceholder: 'उदा. २५',
      conversionFormula: '१ क्विंटल = १०० किलो',
      totalKg: 'एकूण',
      locationLabel: 'तुमचे ठिकाण / गाव',
      locationPlaceholder: 'गाव, शहर किंवा जिल्ह्याचे नाव (उदा. नांदेड, लातूर, नाशिक)',
      useLocationBtn: 'GPS वापरा',
      locationDetecting: 'स्थान शोधत आहे...',
      locationSuccess: 'स्थान निश्चित झाले: ',
      locationError: 'स्थान शोधता आले नाही. कृपया गाव किंवा जिल्ह्याचे नाव टाइप करा.',
      locationDenied: 'स्थान परवानगी नाकारली. कृपया स्वतः टाइप करा.',
      speakBtn: 'बोलून शोधा',
      listening: 'ऐकत आहे...',
      voiceInstruction: '🎙️ सांगा: "वारंगलजवळ 25 क्विंटल टोमॅटो"',
      speechNotSupported: 'या ब्राउझरमध्ये व्हॉइस ओळख उपलब्ध नाही. कृपया थेट टाइप करा.',
      voiceError: 'आवाज स्पष्ट ऐकू आला नाही. कृपया पुन्हा बोला किंवा टाइप करा.',
      voiceRecognizedQtl: 'ओळखले: {qty} क्विंटल',
      voiceRecognizedKg: 'ओळखले: {kg} किलो → {qtl} क्विंटल',
      voiceHeardAmbiguous: '"{num}" ऐकले. {num} क्विंटल की {num} किलो (= {converted} क्विंटल)?',
      voiceSetQtl: '{num} क्विंटल सेट केले',
      voiceSetKg: '{num} किलो → {converted} क्विंटल सेट केले',
      submitBtn: 'सर्वोत्तम बाजार शोधा',
      analyzing: 'बाजार व वाहतूक दरांचे विश्लेषण करत आहे...',
      disclaimerText: 'तुमचा अंदाजित निव्वळ नफा मोजण्यासाठी आम्ही बाजारभाव, अंतर आणि अंदाजित वाहतूक खर्चाची तुलना करतो.',
      invalidQuantity: 'कृपया क्विंटलमध्ये योग्य प्रमाण प्रविष्ट करा.',
      invalidCrop: 'कृपया पीक निवडा.',
      invalidLocation: 'कृपया तुमचे स्थान प्रविष्ट करा.',
      noMarketData: 'या पिकासाठी बाजाराची माहिती अद्याप उपलब्ध नाही.',
    },
    results: {
      heading: 'तुमच्या गणनेचा सारांश',
      bestOptionBadge: '⭐ सर्वोत्तम पर्याय (BEST OPTION)',
      estimatedNetReturn: 'अंदाजे निव्वळ नफा',
      takeHome: '(हातात येणारा नफा)',
      smartScoreLabel: 'स्मार्ट मार्केट स्कोअर',
      scoreBreakdown: 'स्कोअर तपशील',
      netReturn: 'निव्वळ नफा',
      price: 'दर',
      distance: 'अंतर',
      transport: 'वाहतूक',
      estMandiFee: 'अंदाजे मंडी शुल्क (~2%)',
      grossIncomeLabel: 'एकूण अंदाजे उत्पन्न (Gross Income)',
      transportLabel: 'अंदाजे वाहतूक खर्च',
      netReturnLabel: 'अंदाजे निव्वळ नफा (Take-home)',
      mandiPriceLabel: 'मंडी भाव',
      perQuintal: '/ क्विंटल',
      whyThisMarket: 'हीच बाजारपेठ का?',
      viewFullDetails: 'संपूर्ण तपशील पहा',
      distanceLabel: 'अंतर',
      minUnit: 'मिनिटे',
      signal: {
        sellNow: {
          label: '✅ आत्ताच विका (SELL NOW)',
          sub: 'उच्च स्कोअर — ही बाजार समिती तुमच्या पिकासाठी उत्तम संधी आहे',
        },
        monitor: {
          label: '⚠️ भावावर लक्ष ठेवा (MONITOR)',
          sub: 'मध्यम स्कोअर — माल पाठवण्यापूर्वी भावावर लक्ष ठेवा',
        },
        insufficient: {
          label: 'ℹ️ माहिती अपुरी',
          sub: 'स्पष्ट संकेतासाठी अधिक बाजार माहिती आवश्यक आहे',
        },
      },
      comparisonTitle: 'बाजारपेठ तुलना तक्ता',
      comparisonSub: 'वाहतूक खर्च वजा केल्यानंतर अंदाजे हातात येणाऱ्या निव्वळ नफ्याची तुलना.',
      tableHeaders: {
        rank: '#',
        market: 'बाजार समिती',
        net: 'निव्वळ नफा',
        distance: 'अंतर',
        time: 'अंदाजे वेळ',
        score: 'स्कोअर',
        diff: 'फरक',
      },
      sampleNotice: 'अधिकृत बाजार डेटा • वाहतूक अंदाज स्वतंत्रपणे मोजले जातात',
      recommendationBasis: 'स्मार्ट मार्केट स्कोअरवर आधारित शिफारस',
      intelligenceTitle: 'बाजारभाव आणि आवक माहिती',
      marketPriceLabel: 'चालू दर',
      modalPriceLabel: 'सर्वसाधारण दर (Modal Price)',
      marketArrivalLabel: 'आजची आवक',
      tonnesUnit: 'टन',
      perKg: '/ किलो',
      arrivalUnavailable: 'आवक माहिती उपलब्ध नाही',
      historicalUnavailable: 'ऐतिहासिक माहिती उपलब्ध नाही',
      sampleDataLabel: 'प्रमाणित बाजार माहिती',
      originLocation: 'आपले स्थान',
      marketDataLabel: 'बाजार डेटा',
    },
    whatIf: {
      title: 'दुसऱ्या बाजारात विकले तर काय होईल?',
      subtitle: 'शिफारस केलेल्या बाजाराशी इतर पर्यायांची तुलना करून नफा आणि वाहतूक खर्चाचा थेट फरक पहा.',
      selectMarketLabel: 'तुलनेसाठी बाजार निवडा:',
      expectedRevenue: 'अपेक्षित एकूण उत्पन्न',
      transportCost: 'अंदाजे वाहतूक खर्च',
      expectedNetReturn: 'अपेक्षित निव्वळ नफा',
      diffFromBest: 'शिफारस केलेल्या बाजारापेक्षा फरक',
      bestOptionNote: 'जास्तीत जास्त निव्वळ नफ्यासाठी हा आधीच शिफारस केलेला सर्वोत्तम बाजार आहे.',
      comparedToBest: 'सर्वोत्तम बाजाराशी तुलना:',
    },
    charts: {
      priceComparisonTitle: 'बाजार भाव तुलना',
      priceComparisonSub: 'विविध बाजार समित्यांमधील प्रति किलो दर (₹)',
      priceTrendTitle: 'बाजार भाव कल',
      priceTrendSub: 'प्रादेशिक बाजारांमधील मागील ७ दिवसांचा दर कल',
      bestOptionLegend: 'सर्वोत्तम पर्याय',
      otherMandisLegend: 'इतर बाजार समित्या',
      sevenDayHistory: '७-दिवसीय इतिहास',
      sevenDayAverage: '७-दिवसीय सरासरी:',
      historicalTrend: 'ऐतिहासिक दर कल',
      ratePerKgAxis: 'दर प्रति किलो (₹)',
      priceAxis: 'दर (₹/किलो)',
      tooltipPrice: 'दर:',
      tooltipEstNet: 'अंदाजे निव्वळ नफा:',
      tooltipAvgRate: 'सरासरी बाजार दर:',
      sampleDataLabel: 'बाजार माहिती',
    },
    map: {
      title: 'शेत ते बाजार अंतर व मार्ग',
      subtitle: 'तुमच्या स्थानापासून वेगवेगळ्या बाजार समित्यांचे अंतर आणि मार्ग दर्शन.',
      farmerLocation: 'शेतकऱ्याचे ठिकाण',
      recommendedMandi: 'शिफारस केलेली बाजार समिती',
      routeDistance: 'अंतर',
      dataUnavailable: 'नकाशा GPS डेटा उपलब्ध नाही. अचूक मार्गासाठी GPS चालू करा.',
      gpsPrompt: 'नकाशा दृश्य सक्षम करण्यासाठी फॉर्ममधील "GPS वापरा" बटण दाबा.',
      distanceDisclaimer: '* अंतरे अंदाजित आहेत. नेव्हिगेशनसाठी Google Maps वापरा.',
    },
    bestSellingWindow: {
      title: 'विक्रीसाठी सर्वोत्तम वेळ',
      condition: 'सध्याची बाजार स्थिती',
      awaiting: 'पुरेशा डेटाची प्रतीक्षा',
      trend: 'ऐतिहासिक दर कल',
      unavailable: 'ऐतिहासिक माहिती उपलब्ध नाही',
      comingSoon: 'लवकरच येत आहे',
      comingSoonDesc: 'या वैशिष्ट्यासाठी विश्वसनीय ऐतिहासिक बाजार डेटा एकत्रित करण्यासाठी आम्ही काम करत आहोत.',
    },
    howItWorks: {
      badge: 'चार सोप्या पायऱ्या',
      heading: 'हे कसे कार्य करते',
      subText: 'तुम्हाला बाजारपेठेचा योग्य निर्णय घेण्यास मदत करण्यासाठी चार सोप्या पायऱ्या.',
      stepPrefix: 'पायरी',
      ofSteps: '(एकूण ४ पैकी)',
      steps: [
        {
          num: '01',
          title: 'पीक आणि प्रमाण नोंदवा',
          description: 'तुमचे काढणी केलेले पीक आणि एकूण वजन क्विंटलमध्ये निवडा.',
        },
        {
          num: '02',
          title: 'बाजार भावांची तुलना करा',
          description: 'जवळपासच्या आणि प्रादेशिक कृषी उत्पन्न बाजार समित्यांमधील (APMC) सध्याचे दर तपासा.',
        },
        {
          num: '03',
          title: 'अंतर आणि वाहतूक खर्च तपासा',
          description: 'अंतर आणि प्रमाणानुसार वाहतूक खर्चाचा अंदाज घ्या.',
        },
        {
          num: '04',
          title: 'सर्वोत्तम बाजारपेठ निवडा',
          description: 'केवळ जास्त दर न पाहता, वाहतूक खर्च वजा करून जास्तीत जास्त निव्वळ नफा देणारी बाजारपेठ निवडा.',
        },
      ],
    },
    whySmartMandi: {
      badge: 'प्रमुख वैशिष्ट्ये',
      heading: 'SMARTMandi का वापरावे?',
      subText: 'पीक काढणीनंतर विक्री करताना शेतकऱ्यांना भेडसावणाऱ्या समस्या सोडवण्यासाठी तयार केलेले व्यासपीठ.',
      verifiedMetric: 'प्रमाणित निर्णय निकष',
      cards: [
        {
          tag: 'वैयक्तिकृत',
          title: 'तुमच्या पिकाला अनुकूल',
          description: 'शिफारसी तुमच्या पिकाचा प्रकार, प्रमाण आणि दिलेल्या स्थानाचा विचार करून केल्या जातात.',
        },
        {
          tag: 'केवळ भावापेक्षा अधिक',
          title: 'अंदाजित निव्वळ नफ्याचा शोध',
          description: 'केवळ बाजारभाव न पाहता प्रत्यक्ष वाहतूक आणि वाहतूक खर्चाचा थेट विचार केला जातो.',
        },
        {
          tag: 'शेतकरी स्नेही',
          title: 'अतिशय सोपे आणि सुलभ',
          description: 'सोपा इंटरफेस, बोलून शोधण्याची सोय आणि बहुभाषिक पर्याय (इंग्रजी, तेलुगु, हिंदी, मराठी).',
        },
        {
          tag: 'पारदर्शक',
          title: 'स्पष्ट हिशोब',
          description: 'विशिष्ट बाजारपेठ का शिफारस केली हे पारदर्शक आकडेमोडीसह स्पष्ट दिसते.',
        },
      ],
    },
    footer: {
      aboutText: 'शेतकऱ्यांना बाजारपेठेचे माहितीपूर्ण निर्णय घेण्यास मदत करणारे व्यासपीठ.',
      navTitle: 'नेव्हिगेशन',
      actionsTitle: 'कृती',
      copyright: 'SMARTMandi. शेतकरी बाजारपेठ निर्णय सहाय्य प्रणाली.',
      missionStatement: 'भारतीय शेतकऱ्यांसाठी बाजारपेठ जोडणी आणि पारदर्शक भाव शोध अधिक बळकट करणे.',
    },
    marketPricesModal: {
      title: 'उपलब्ध प्रातिनिधिक बाजार भाव',
      subtitle: 'प्रमुख कृषी उत्पन्न बाजार समित्यांमधील (APMC) मार्गदर्शक दर',
      noticeTitle: 'अधिकृत बाजार डेटा:',
      noticeText: 'दर केवळ कॉन्फिगर केलेल्या अधिकृत सरकारी स्रोताकडून मिळाल्यावर दाखवले जातात. डेटा मिळाला नाही तर दर दाखवले जात नाहीत.',
      mandiCol: 'बाजार समिती',
      locationCol: 'स्थान',
      closeBtn: 'बंद करा',
    },
    aboutModal: {
      title: 'SMARTMandi बद्दल',
      subtitle: 'शेतकरी बाजार जोडणी आणि किंमत शोध निर्णय व्यासपीठ',
      problemStatementTitle: 'समस्या विधान',
      problemStatement: 'शेतकऱ्यांसाठी बाजारपेठ जोडणी आणि पारदर्शक भाव शोध अधिक बळकट करणे',
      description: 'अनेक शेतकरी लांबच्या बाजारात जास्त दर ऐकून जातात, पण डिझेल, गाडी भाडे आणि हमाली खर्चामुळे शेवटी नफा कमी होतो. SMARTMandi ट्रॅक्टर भरण्यापूर्वीच वाहतूक खर्च वजा करून शेतकऱ्याला मिळणारा खरा निव्वळ नफा मोजते.',
      architectureTitle: 'तांत्रिक रचना',
      archFrontend: 'React फ्रंटएंड (संवादी निर्णय इंटरफेस)',
      archApi: 'FastAPI REST मायक्रोसर्व्हिस',
      archDb: 'PostgreSQL डेटाबेस',
      archFeed: 'राष्ट्रीय कृषी बाजार (e-NAM / APMC) फीड',
      archEngine: 'निव्वळ नफा शिफारस इंजिन',
      closeBtn: 'बंद करा',
    },
    buyerRegistration: mrBuyerRegistration,
  },
};

export function getTranslation(lang: Language): TranslationSchema {
  return translations[lang] || translations.en;
}
