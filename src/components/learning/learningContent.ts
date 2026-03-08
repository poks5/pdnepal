export interface LearningCard {
  id: string;
  title: { en: string; ne: string };
  meaning: { en: string; ne: string };
  actions: { en: string; ne: string }[];
  emoji: string;
  severity?: 'info' | 'warning' | 'danger';
}

export interface LearningModule {
  id: string;
  title: { en: string; ne: string };
  description: { en: string; ne: string };
  emoji: string;
  category: string;
  cards: LearningCard[];
  quizQuestions?: QuizQuestion[];
}

export interface QuizQuestion {
  question: { en: string; ne: string };
  options: { en: string; ne: string }[];
  correctIndex: number;
}

export const learningModules: LearningModule[] = [
  // ── 1. Understanding Kidney Failure ──
  {
    id: 'kidney-failure',
    title: { en: 'Understanding Kidney Failure', ne: 'मिर्गौला फेल बुझ्नुहोस्' },
    description: { en: 'Learn what kidneys do and why dialysis is needed', ne: 'मिर्गौलाले के गर्छ र डायलिसिस किन चाहिन्छ जान्नुहोस्' },
    emoji: '🫘',
    category: 'basics',
    cards: [
      {
        id: 'kf-1', emoji: '🫘',
        title: { en: 'What Kidneys Do', ne: 'मिर्गौलाले के गर्छ' },
        meaning: { en: 'Kidneys filter waste and extra water from your blood. They also balance salts, minerals, and make hormones.', ne: 'मिर्गौलाले रगतबाट फोहोर र अतिरिक्त पानी छान्छ। तिनीहरूले नुन, खनिज र हर्मोनहरू पनि सन्तुलन गर्छन्।' },
        actions: [
          { en: 'Filter ~200 liters of blood daily', ne: 'दैनिक ~२०० लिटर रगत छान्छ' },
          { en: 'Remove toxins through urine', ne: 'पिसाबमार्फत विषाक्त पदार्थ हटाउँछ' },
          { en: 'Control blood pressure', ne: 'रक्तचाप नियन्त्रण गर्छ' },
          { en: 'Make red blood cells (EPO)', ne: 'रातो रक्त कोशिका बनाउँछ (EPO)' },
        ],
      },
      {
        id: 'kf-2', emoji: '⚠️',
        title: { en: 'What Happens in Kidney Failure', ne: 'मिर्गौला फेल हुँदा के हुन्छ' },
        meaning: { en: 'When kidneys fail, waste builds up in the body causing swelling, tiredness, nausea, and high blood pressure.', ne: 'मिर्गौला फेल हुँदा शरीरमा फोहोर जम्छ जसले सुन्निने, थकान, वाकवाकी र उच्च रक्तचाप गर्छ।' },
        actions: [
          { en: 'Swelling in legs and face', ne: 'खुट्टा र अनुहारमा सुन्निने' },
          { en: 'Feeling tired and weak', ne: 'थकित र कमजोर महसुस' },
          { en: 'Loss of appetite', ne: 'भोक नलाग्ने' },
          { en: 'Difficulty breathing', ne: 'सास फेर्न गाह्रो' },
        ],
        severity: 'warning',
      },
      {
        id: 'kf-3', emoji: '💊',
        title: { en: 'Why Dialysis Is Needed', ne: 'डायलिसिस किन चाहिन्छ' },
        meaning: { en: 'Dialysis does the work of your kidneys — cleaning blood and removing extra fluid to keep you alive and healthy.', ne: 'डायलिसिसले तपाईंको मिर्गौलाको काम गर्छ — रगत सफा गर्छ र अतिरिक्त तरल पदार्थ हटाउँछ।' },
        actions: [
          { en: 'Removes waste products', ne: 'फोहोर पदार्थ हटाउँछ' },
          { en: 'Removes extra fluid', ne: 'अतिरिक्त तरल पदार्थ हटाउँछ' },
          { en: 'Balances blood chemistry', ne: 'रगतको रसायन सन्तुलन गर्छ' },
        ],
      },
      {
        id: 'kf-4', emoji: '🔄',
        title: { en: 'Dialysis vs Transplant', ne: 'डायलिसिस बनाम प्रत्यारोपण' },
        meaning: { en: 'Transplant replaces a kidney permanently. Dialysis is a life-sustaining treatment until a transplant is possible.', ne: 'प्रत्यारोपणले मिर्गौला स्थायी रूपमा बदल्छ। डायलिसिस प्रत्यारोपण सम्भव नभएसम्म जीवन-रक्षक उपचार हो।' },
        actions: [
          { en: 'Transplant: Best long-term option', ne: 'प्रत्यारोपण: सबैभन्दा राम्रो दीर्घकालीन विकल्प' },
          { en: 'Dialysis: Effective bridge treatment', ne: 'डायलिसिस: प्रभावकारी पुल उपचार' },
          { en: 'Both options save lives', ne: 'दुवै विकल्पले जीवन बचाउँछ' },
        ],
      },
    ],
    quizQuestions: [
      {
        question: { en: 'What is the main job of kidneys?', ne: 'मिर्गौलाको मुख्य काम के हो?' },
        options: [
          { en: 'Digest food', ne: 'खाना पचाउने' },
          { en: 'Filter waste from blood', ne: 'रगतबाट फोहोर छान्ने' },
          { en: 'Pump blood', ne: 'रगत पम्प गर्ने' },
        ],
        correctIndex: 1,
      },
    ],
  },

  // ── 2. Understanding PD ──
  {
    id: 'understanding-pd',
    title: { en: 'Understanding Peritoneal Dialysis', ne: 'पेरिटोनियल डायलिसिस बुझ्नुहोस्' },
    description: { en: 'How PD works, CAPD vs APD, and benefits', ne: 'PD कसरी काम गर्छ, CAPD बनाम APD, र फाइदाहरू' },
    emoji: '💧',
    category: 'basics',
    cards: [
      {
        id: 'pd-1', emoji: '💧',
        title: { en: 'What is Peritoneal Dialysis', ne: 'पेरिटोनियल डायलिसिस के हो' },
        meaning: { en: 'PD uses the lining of your belly (peritoneum) as a natural filter. Clean fluid goes in, absorbs waste, then drains out.', ne: 'PD ले तपाईंको पेटको भित्री तह (पेरिटोनियम) लाई प्राकृतिक फिल्टरको रूपमा प्रयोग गर्छ।' },
        actions: [
          { en: 'Done at home by yourself', ne: 'घरमा आफैँले गर्ने' },
          { en: 'Uses a soft catheter in belly', ne: 'पेटमा नरम क्याथेटर प्रयोग गर्ने' },
          { en: 'No needles needed', ne: 'सुई चाहिँदैन' },
        ],
      },
      {
        id: 'pd-2', emoji: '🔄',
        title: { en: 'CAPD vs APD', ne: 'CAPD बनाम APD' },
        meaning: { en: 'CAPD: Manual exchanges 3-4 times daily. APD: Machine does exchanges overnight while you sleep.', ne: 'CAPD: दिनमा ३-४ पटक म्यानुअल एक्सचेन्ज। APD: मेसिनले रातभर सुत्दा एक्सचेन्ज गर्छ।' },
        actions: [
          { en: 'CAPD: Flexible daytime schedule', ne: 'CAPD: लचिलो दिनको तालिका' },
          { en: 'APD: Freedom during the day', ne: 'APD: दिनमा स्वतन्त्रता' },
          { en: 'Doctor helps choose best option', ne: 'डाक्टरले सबैभन्दा राम्रो विकल्प छनोट गर्न मद्दत गर्छ' },
        ],
      },
      {
        id: 'pd-3', emoji: '✅',
        title: { en: 'Benefits of PD', ne: 'PD का फाइदाहरू' },
        meaning: { en: 'PD allows you to dialyze at home, travel more freely, and maintain a more normal lifestyle.', ne: 'PD ले तपाईंलाई घरमा डायलिसिस गर्न, अझ स्वतन्त्र रूपमा यात्रा गर्न, र सामान्य जीवनशैली कायम राख्न दिन्छ।' },
        actions: [
          { en: 'Home-based treatment', ne: 'घरमा आधारित उपचार' },
          { en: 'Gentler on the body', ne: 'शरीरमा कोमल' },
          { en: 'Better preserved kidney function', ne: 'बाँकी मिर्गौला कार्य राम्रो संरक्षित' },
          { en: 'More dietary freedom', ne: 'खानामा बढी स्वतन्त्रता' },
        ],
      },
    ],
    quizQuestions: [
      {
        question: { en: 'What does PD use as a natural filter?', ne: 'PD ले कुन कुरालाई प्राकृतिक फिल्टरको रूपमा प्रयोग गर्छ?' },
        options: [
          { en: 'Lungs', ne: 'फोक्सो' },
          { en: 'Peritoneum (belly lining)', ne: 'पेरिटोनियम (पेटको तह)' },
          { en: 'Skin', ne: 'छाला' },
        ],
        correctIndex: 1,
      },
    ],
  },

  // ── 3. PD Catheter Care ──
  {
    id: 'catheter-care',
    title: { en: 'PD Catheter Care', ne: 'PD क्याथेटर हेरचाह' },
    description: { en: 'Exit site care, hygiene, and infection signs', ne: 'निकास स्थान हेरचाह, सरसफाइ, र संक्रमणका संकेतहरू' },
    emoji: '🏥',
    category: 'skills',
    cards: [
      {
        id: 'cc-1', emoji: '🔌',
        title: { en: 'What is a PD Catheter', ne: 'PD क्याथेटर के हो' },
        meaning: { en: 'A soft, flexible tube placed in your belly. It stays permanently and is your lifeline for dialysis fluid exchange.', ne: 'तपाईंको पेटमा राखिएको नरम, लचिलो ट्युब। यो स्थायी रूपमा रहन्छ र डायलिसिस तरल पदार्थ आदानप्रदानको लागि तपाईंको जीवनरेखा हो।' },
        actions: [
          { en: 'Keep it clean and dry', ne: 'सफा र सुक्खा राख्नुहोस्' },
          { en: 'Never pull or tug it', ne: 'कहिल्यै तान्नु वा झिक्नु हुँदैन' },
          { en: 'Secure it to your body', ne: 'शरीरमा सुरक्षित गर्नुहोस्' },
        ],
      },
      {
        id: 'cc-2', emoji: '🧼',
        title: { en: 'Daily Exit Site Care', ne: 'दैनिक निकास स्थान हेरचाह' },
        meaning: { en: 'Clean the exit site daily with antiseptic solution. This is the most important step to prevent infection.', ne: 'एन्टिसेप्टिक सोल्युसनले निकास स्थान दैनिक सफा गर्नुहोस्। संक्रमण रोक्न यो सबैभन्दा महत्त्वपूर्ण कदम हो।' },
        actions: [
          { en: 'Wash hands before touching', ne: 'छुनु अघि हात धुनुहोस्' },
          { en: 'Clean with antiseptic daily', ne: 'दैनिक एन्टिसेप्टिकले सफा गर्नुहोस्' },
          { en: 'Apply fresh dressing', ne: 'ताजा ड्रेसिङ लगाउनुहोस्' },
          { en: 'Check for redness or discharge', ne: 'रातोपन वा डिस्चार्ज जाँच गर्नुहोस्' },
        ],
      },
      {
        id: 'cc-3', emoji: '🚨',
        title: { en: 'Signs of Exit Site Infection', ne: 'निकास स्थान संक्रमणका संकेतहरू' },
        meaning: { en: 'Watch for these warning signs. Early detection prevents peritonitis!', ne: 'यी चेतावनी संकेतहरू हेर्नुहोस्। पहिलो पहिचानले पेरिटोनाइटिस रोक्छ!' },
        actions: [
          { en: 'Redness around catheter', ne: 'क्याथेटर वरिपरि रातोपन' },
          { en: 'Pus or discharge', ne: 'पिप वा डिस्चार्ज' },
          { en: 'Pain or tenderness', ne: 'दुखाइ वा कोमलता' },
          { en: 'Crusting or swelling', ne: 'पपडी वा सुन्निने' },
        ],
        severity: 'danger',
      },
    ],
    quizQuestions: [
      {
        question: { en: 'How often should you clean the exit site?', ne: 'निकास स्थान कति पटक सफा गर्नुपर्छ?' },
        options: [
          { en: 'Once a week', ne: 'हप्ताको एक पटक' },
          { en: 'Every day', ne: 'हरेक दिन' },
          { en: 'Only when it looks dirty', ne: 'फोहोर देखिँदा मात्र' },
        ],
        correctIndex: 1,
      },
    ],
  },

  // ── 4. How to Perform CAPD Exchange ──
  {
    id: 'capd-exchange',
    title: { en: 'How to Perform CAPD Exchange', ne: 'CAPD एक्सचेन्ज कसरी गर्ने' },
    description: { en: 'Step-by-step guide with hygiene and procedure', ne: 'सरसफाइ र प्रक्रियासहित चरणबद्ध गाइड' },
    emoji: '🔄',
    category: 'skills',
    cards: [
      {
        id: 'ex-1', emoji: '🧴',
        title: { en: 'Step 1: Prepare & Wash Hands', ne: 'चरण १: तयारी र हात धुने' },
        meaning: { en: 'Clean workspace, gather supplies, and wash hands thoroughly with soap for at least 20 seconds.', ne: 'सफा कार्यक्षेत्र, सामग्री जम्मा गर्ने, र साबुनले कम्तिमा २० सेकेन्ड हात राम्ररी धुने।' },
        actions: [
          { en: 'Close windows and doors', ne: 'झ्याल र ढोका बन्द गर्नुहोस्' },
          { en: 'Clean table surface', ne: 'टेबलको सतह सफा गर्नुहोस्' },
          { en: 'Wash hands 20+ seconds', ne: '२०+ सेकेन्ड हात धुनुहोस्' },
          { en: 'Put on mask', ne: 'मास्क लगाउनुहोस्' },
        ],
      },
      {
        id: 'ex-2', emoji: '🔗',
        title: { en: 'Step 2: Connect & Drain', ne: 'चरण २: जोड्ने र निकाल्ने' },
        meaning: { en: 'Connect the bag to your catheter. Open the drain clamp first to let old fluid flow out.', ne: 'ब्यागलाई क्याथेटरमा जोड्नुहोस्। पुरानो तरल पदार्थ बाहिर निस्कन पहिले ड्रेन क्ल्याम्प खोल्नुहोस्।' },
        actions: [
          { en: 'Check bag for clarity and expiry', ne: 'ब्यागको स्पष्टता र म्याद जाँच गर्नुहोस्' },
          { en: 'Break the seal', ne: 'सिल तोड्नुहोस्' },
          { en: 'Drain takes 15-20 minutes', ne: 'निकाल्न १५-२० मिनेट लाग्छ' },
          { en: 'Check drain color', ne: 'निकासको रङ जाँच गर्नुहोस्' },
        ],
      },
      {
        id: 'ex-3', emoji: '💉',
        title: { en: 'Step 3: Fill', ne: 'चरण ३: भर्ने' },
        meaning: { en: 'After draining, open the fill clamp to let fresh solution flow in. This takes about 10 minutes.', ne: 'निकालेपछि, ताजा सोल्युसन भित्र बग्न भर्ने क्ल्याम्प खोल्नुहोस्। यसमा करिब १० मिनेट लाग्छ।' },
        actions: [
          { en: 'Fill takes ~10 minutes', ne: 'भर्न ~१० मिनेट लाग्छ' },
          { en: 'Clamp when done', ne: 'सकिएपछि क्ल्याम्प गर्नुहोस्' },
          { en: 'Disconnect carefully', ne: 'सावधानीपूर्वक विच्छेद गर्नुहोस्' },
          { en: 'Cap your catheter', ne: 'क्याथेटरमा क्याप लगाउनुहोस्' },
        ],
      },
      {
        id: 'ex-4', emoji: '🗑️',
        title: { en: 'Step 4: Dispose & Record', ne: 'चरण ४: फ्याँक्ने र रेकर्ड गर्ने' },
        meaning: { en: 'Dispose of used bags properly. Record the exchange in PDsathi app.', ne: 'प्रयोग गरिएका ब्यागहरू ठीकसँग फ्याँक्नुहोस्। PDsathi एपमा एक्सचेन्ज रेकर्ड गर्नुहोस्।' },
        actions: [
          { en: 'Dispose bag in designated bin', ne: 'तोकिएको बिनमा ब्याग फ्याँक्नुहोस्' },
          { en: 'Record drain volume', ne: 'निकासको मात्रा रेकर्ड गर्नुहोस्' },
          { en: 'Note drain color', ne: 'निकासको रङ लेख्नुहोस्' },
          { en: 'Record in PDsathi', ne: 'PDsathi मा रेकर्ड गर्नुहोस्' },
        ],
      },
    ],
  },

  // ── 5. Recognizing Problems ──
  {
    id: 'recognizing-problems',
    title: { en: 'Recognizing Problems', ne: 'समस्याहरू पहिचान गर्ने' },
    description: { en: 'Warning signs and what to do immediately', ne: 'चेतावनी संकेतहरू र तुरुन्तै के गर्ने' },
    emoji: '⚠️',
    category: 'safety',
    cards: [
      {
        id: 'rp-1', emoji: '🥛',
        title: { en: 'Cloudy Dialysis Fluid', ne: 'धमिलो डायलिसिस तरल' },
        meaning: { en: 'Cloudy fluid is the most common sign of peritonitis (infection). This is an emergency!', ne: 'धमिलो तरल पदार्थ पेरिटोनाइटिस (संक्रमण) को सबैभन्दा सामान्य संकेत हो। यो आपतकालीन हो!' },
        actions: [
          { en: 'SAVE the fluid bag — do NOT discard', ne: 'तरल ब्याग बचाउनुहोस् — नफ्याँक्नुहोस्' },
          { en: 'Contact dialysis center IMMEDIATELY', ne: 'तुरुन्तै डायलिसिस केन्द्रमा सम्पर्क गर्नुहोस्' },
          { en: 'Note the time and appearance', ne: 'समय र देखावट लेख्नुहोस्' },
          { en: 'Report in PDsathi app', ne: 'PDsathi एपमा रिपोर्ट गर्नुहोस्' },
        ],
        severity: 'danger',
      },
      {
        id: 'rp-2', emoji: '😣',
        title: { en: 'Abdominal Pain', ne: 'पेट दुखाइ' },
        meaning: { en: 'Pain during or after exchange can indicate infection, constipation, or catheter problems.', ne: 'एक्सचेन्जको बेला वा पछि दुखाइले संक्रमण, कब्जियत, वा क्याथेटर समस्या जनाउन सक्छ।' },
        actions: [
          { en: 'Rate your pain (1-10)', ne: 'तपाईंको दुखाइ मूल्याङ्कन गर्नुहोस् (१-१०)' },
          { en: 'Check for cloudy fluid', ne: 'धमिलो तरल जाँच गर्नुहोस्' },
          { en: 'Contact doctor if pain > 5', ne: 'दुखाइ > ५ भएमा डाक्टरलाई सम्पर्क गर्नुहोस्' },
        ],
        severity: 'warning',
      },
      {
        id: 'rp-3', emoji: '🌡️',
        title: { en: 'Fever', ne: 'ज्वरो' },
        meaning: { en: 'Fever above 38°C / 100.4°F with PD can mean infection. Always check drain fluid color too.', ne: 'PD सँगै ३८°C / १००.४°F भन्दा माथिको ज्वरोले संक्रमण हुन सक्छ। सधैं निकास तरल रङ पनि जाँच गर्नुहोस्।' },
        actions: [
          { en: 'Measure temperature', ne: 'तापक्रम मापन गर्नुहोस्' },
          { en: 'Check drain fluid clarity', ne: 'निकास तरल स्पष्टता जाँच गर्नुहोस्' },
          { en: 'Contact doctor immediately', ne: 'तुरुन्तै डाक्टरलाई सम्पर्क गर्नुहोस्' },
        ],
        severity: 'danger',
      },
      {
        id: 'rp-4', emoji: '🚫',
        title: { en: 'Poor Drainage', ne: 'कमजोर निकासी' },
        meaning: { en: 'If fluid does not drain well, it could be catheter position, constipation, or blockage.', ne: 'यदि तरल पदार्थ राम्रोसँग निस्किँदैन भने, यो क्याथेटर स्थिति, कब्जियत, वा अवरोध हुन सक्छ।' },
        actions: [
          { en: 'Change position (sit up, walk)', ne: 'स्थिति परिवर्तन गर्नुहोस् (उठ्नुहोस्, हिँड्नुहोस्)' },
          { en: 'Check for kinks in tubing', ne: 'ट्युबिङमा मोडिएको जाँच गर्नुहोस्' },
          { en: 'Ensure regular bowel movements', ne: 'नियमित दिसा सुनिश्चित गर्नुहोस्' },
          { en: 'Contact nurse if persists', ne: 'जारी रहेमा नर्सलाई सम्पर्क गर्नुहोस्' },
        ],
        severity: 'warning',
      },
    ],
  },

  // ── 6. Peritonitis Education ──
  {
    id: 'peritonitis-education',
    title: { en: 'Peritonitis Education', ne: 'पेरिटोनाइटिस शिक्षा' },
    description: { en: 'Causes, prevention, and early symptoms', ne: 'कारणहरू, रोकथाम, र प्रारम्भिक लक्षणहरू' },
    emoji: '🦠',
    category: 'safety',
    cards: [
      {
        id: 'pe-1', emoji: '🦠',
        title: { en: 'What is Peritonitis', ne: 'पेरिटोनाइटिस के हो' },
        meaning: { en: 'Infection of the peritoneal membrane caused by bacteria entering through the catheter. Most common PD complication.', ne: 'क्याथेटरबाट ब्याक्टेरिया प्रवेश गरेर पेरिटोनियल झिल्लीको संक्रमण। सबैभन्दा सामान्य PD जटिलता।' },
        actions: [
          { en: 'Most serious PD complication', ne: 'सबैभन्दा गम्भीर PD जटिलता' },
          { en: 'Treatable if caught early', ne: 'चाँडो थाहा पाएमा उपचार योग्य' },
          { en: 'Prevention is key', ne: 'रोकथाम महत्त्वपूर्ण छ' },
        ],
        severity: 'danger',
      },
      {
        id: 'pe-2', emoji: '🛡️',
        title: { en: 'Prevention Steps', ne: 'रोकथामका कदमहरू' },
        meaning: { en: 'Good hygiene is the #1 way to prevent peritonitis. Always follow proper exchange technique.', ne: 'राम्रो सरसफाइ पेरिटोनाइटिस रोक्ने #१ तरिका हो। सधैं उचित एक्सचेन्ज प्रविधि पालना गर्नुहोस्।' },
        actions: [
          { en: 'Wash hands before every exchange', ne: 'हरेक एक्सचेन्ज अघि हात धुनुहोस्' },
          { en: 'Wear a mask during exchanges', ne: 'एक्सचेन्जको बेला मास्क लगाउनुहोस्' },
          { en: 'Keep pets away from supplies', ne: 'सामग्रीबाट पालतु जनावर टाढा राख्नुहोस्' },
          { en: 'Clean exit site daily', ne: 'दैनिक निकास स्थान सफा गर्नुहोस्' },
        ],
      },
      {
        id: 'pe-3', emoji: '⏰',
        title: { en: 'Early Reporting Saves Lives', ne: 'चाँडो रिपोर्टिङले जीवन बचाउँछ' },
        meaning: { en: 'Report any cloudy fluid, pain, or fever within hours — not days. Early antibiotics cure most episodes.', ne: 'कुनै पनि धमिलो तरल, दुखाइ, वा ज्वरो घण्टामा रिपोर्ट गर्नुहोस् — दिनमा होइन। प्रारम्भिक एन्टिबायोटिक्सले धेरै एपिसोडहरू निको पार्छ।' },
        actions: [
          { en: 'Do NOT wait and see', ne: 'पर्खनुहोस् र हेर्नुहोस् नगर्नुहोस्' },
          { en: 'Call dialysis center same day', ne: 'उही दिन डायलिसिस केन्द्रमा फोन गर्नुहोस्' },
          { en: 'Save cloudy fluid sample', ne: 'धमिलो तरल नमूना बचाउनुहोस्' },
        ],
        severity: 'warning',
      },
    ],
  },

  // ── 7. Diet & Fluid Management ──
  {
    id: 'diet-fluid',
    title: { en: 'Diet & Fluid Management', ne: 'आहार र तरल व्यवस्थापन' },
    description: { en: 'Nutrition guidelines for PD patients', ne: 'PD बिरामीहरूको लागि पोषण निर्देशिकाहरू' },
    emoji: '🥗',
    category: 'lifestyle',
    cards: [
      {
        id: 'df-1', emoji: '🥩',
        title: { en: 'Protein Intake', ne: 'प्रोटिन सेवन' },
        meaning: { en: 'PD patients lose protein through dialysis fluid. You need MORE protein than hemodialysis patients.', ne: 'PD बिरामीहरूले डायलिसिस तरलमार्फत प्रोटिन गुमाउँछन्। तपाईंलाई हेमोडायलिसिस बिरामीहरू भन्दा बढी प्रोटिन चाहिन्छ।' },
        actions: [
          { en: 'Eat eggs, chicken, fish, dal', ne: 'अण्डा, कुखुरा, माछा, दाल खानुहोस्' },
          { en: '1.2-1.3 g protein per kg body weight', ne: 'शरीरको तौल प्रति केजी १.२-१.३ ग्राम प्रोटिन' },
          { en: 'Include protein in every meal', ne: 'हरेक खानामा प्रोटिन समावेश गर्नुहोस्' },
        ],
      },
      {
        id: 'df-2', emoji: '🍌',
        title: { en: 'Potassium Foods', ne: 'पोटासियम खानाहरू' },
        meaning: { en: 'PD removes potassium well, but still monitor intake. Some patients may need MORE potassium.', ne: 'PD ले पोटासियम राम्रोसँग हटाउँछ, तर अझै सेवन निगरानी गर्नुहोस्।' },
        actions: [
          { en: 'Check potassium levels regularly', ne: 'नियमित रूपमा पोटासियम स्तर जाँच गर्नुहोस्' },
          { en: 'High-K: banana, orange, potato', ne: 'उच्च-K: केरा, सुन्तला, आलु' },
          { en: 'Follow doctor advice', ne: 'डाक्टरको सल्लाह पालना गर्नुहोस्' },
        ],
      },
      {
        id: 'df-3', emoji: '🧂',
        title: { en: 'Salt & Fluid Restriction', ne: 'नुन र तरल प्रतिबन्ध' },
        meaning: { en: 'Less salt means less thirst and less fluid retention. This helps your dialysis work better.', ne: 'कम नुनको मतलब कम तिर्खा र कम तरल जम्ने। यसले तपाईंको डायलिसिस राम्रोसँग काम गर्न मद्दत गर्छ।' },
        actions: [
          { en: 'Avoid added salt and pickles', ne: 'थपिएको नुन र अचार बन्द गर्नुहोस्' },
          { en: 'Track daily fluid intake', ne: 'दैनिक तरल सेवन ट्र्याक गर्नुहोस्' },
          { en: 'Limit to prescribed amount', ne: 'निर्धारित मात्रामा सीमित गर्नुहोस्' },
        ],
      },
      {
        id: 'df-4', emoji: '💊',
        title: { en: 'Phosphorus Control', ne: 'फस्फोरस नियन्त्रण' },
        meaning: { en: 'High phosphorus weakens bones and hardens blood vessels. Take phosphate binders with meals.', ne: 'उच्च फस्फोरसले हड्डी कमजोर र रक्तनलीहरू कडा बनाउँछ। खानासँगै फस्फेट बाइन्डर लिनुहोस्।' },
        actions: [
          { en: 'Take binders WITH every meal', ne: 'हरेक खानासँगै बाइन्डर लिनुहोस्' },
          { en: 'Limit dairy, cola, processed food', ne: 'दुग्ध, कोला, प्रशोधित खाना सीमित गर्नुहोस्' },
          { en: 'Check phosphorus in lab reports', ne: 'ल्याब रिपोर्टमा फस्फोरस जाँच गर्नुहोस्' },
        ],
      },
    ],
  },

  // ── 8. Medication Guidance ──
  {
    id: 'medication-guidance',
    title: { en: 'Medication Guidance', ne: 'औषधि मार्गदर्शन' },
    description: { en: 'Common PD medications and their purpose', ne: 'सामान्य PD औषधिहरू र तिनीहरूको उद्देश्य' },
    emoji: '💊',
    category: 'lifestyle',
    cards: [
      {
        id: 'mg-1', emoji: '💊',
        title: { en: 'Phosphate Binders', ne: 'फस्फेट बाइन्डर' },
        meaning: { en: 'These medicines bind phosphorus in food so it passes through without being absorbed.', ne: 'यी औषधिहरूले खानामा फस्फोरस बाँध्छन् ताकि यो अवशोषित नभइकन पास हुन्छ।' },
        actions: [
          { en: 'Take WITH meals, not after', ne: 'खानासँगै लिनुहोस्, पछि होइन' },
          { en: 'Chew tablets thoroughly', ne: 'ट्याब्लेट राम्ररी चपाउनुहोस्' },
          { en: 'Never skip doses', ne: 'कहिल्यै डोज नछुटाउनुहोस्' },
        ],
      },
      {
        id: 'mg-2', emoji: '💉',
        title: { en: 'Erythropoietin (EPO)', ne: 'इरिथ्रोपोइटिन (EPO)' },
        meaning: { en: 'EPO injection helps make red blood cells. Without it, you may feel tired and weak.', ne: 'EPO इन्जेक्सनले रातो रक्त कोशिका बनाउन मद्दत गर्छ। यो बिना तपाईं थकित र कमजोर महसुस गर्न सक्नुहुन्छ।' },
        actions: [
          { en: 'Given as injection (SC or IV)', ne: 'इन्जेक्सनको रूपमा दिइन्छ (SC वा IV)' },
          { en: 'Store in refrigerator', ne: 'रेफ्रिजरेटरमा भण्डारण गर्नुहोस्' },
          { en: 'Check hemoglobin regularly', ne: 'नियमित रूपमा हेमोग्लोबिन जाँच गर्नुहोस्' },
        ],
      },
      {
        id: 'mg-3', emoji: '☀️',
        title: { en: 'Vitamin D & Calcium', ne: 'भिटामिन D र क्याल्सियम' },
        meaning: { en: 'Kidney failure affects Vitamin D activation. Supplements keep bones strong.', ne: 'मिर्गौला फेलले भिटामिन D सक्रियतालाई असर गर्छ। पूरकहरूले हड्डी बलियो राख्छन्।' },
        actions: [
          { en: 'Take as prescribed by doctor', ne: 'डाक्टरले तोकेअनुसार लिनुहोस्' },
          { en: 'Monitor calcium levels', ne: 'क्याल्सियम स्तर निगरानी गर्नुहोस्' },
          { en: 'Active Vitamin D may be needed', ne: 'सक्रिय भिटामिन D आवश्यक हुन सक्छ' },
        ],
      },
    ],
  },

  // ── 9. Daily Lifestyle with PD ──
  {
    id: 'daily-lifestyle',
    title: { en: 'Daily Lifestyle with PD', ne: 'PD सँग दैनिक जीवनशैली' },
    description: { en: 'Bathing, exercise, travel, and work', ne: 'नुहाउने, व्यायाम, यात्रा, र काम' },
    emoji: '🏃',
    category: 'lifestyle',
    cards: [
      {
        id: 'dl-1', emoji: '🚿',
        title: { en: 'Bathing with PD Catheter', ne: 'PD क्याथेटरसहित नुहाउने' },
        meaning: { en: 'Showers are preferred. Cover exit site with waterproof dressing. Avoid swimming pools and bathtubs.', ne: 'शावर उत्तम हो। निकास स्थानलाई जलरोधक ड्रेसिङले ढाक्नुहोस्। पौडी पोखरी र बाथटब नप्रयोग गर्नुहोस्।' },
        actions: [
          { en: 'Shower > bath', ne: 'शावर > नुहाउने' },
          { en: 'Cover exit site with waterproof tape', ne: 'निकास स्थान जलरोधक टेपले ढाक्नुहोस्' },
          { en: 'No swimming pools', ne: 'पौडी पोखरी नजानुहोस्' },
          { en: 'Dry exit site after showering', ne: 'शावर पछि निकास स्थान सुकाउनुहोस्' },
        ],
      },
      {
        id: 'dl-2', emoji: '🏋️',
        title: { en: 'Exercise & Activity', ne: 'व्यायाम र गतिविधि' },
        meaning: { en: 'Regular exercise is encouraged! Walking, yoga, and light exercise are excellent. Avoid heavy lifting.', ne: 'नियमित व्यायाम प्रोत्साहित छ! हिँड्ने, योग, र हल्का व्यायाम उत्कृष्ट छन्। भारी बोक्ने नगर्नुहोस्।' },
        actions: [
          { en: 'Walk 30 minutes daily', ne: 'दैनिक ३० मिनेट हिँड्नुहोस्' },
          { en: 'Yoga and stretching are safe', ne: 'योग र स्ट्रेचिङ सुरक्षित छ' },
          { en: 'Drain fluid before exercise', ne: 'व्यायाम अघि तरल निकाल्नुहोस्' },
          { en: 'Avoid heavy lifting > 10kg', ne: '१० केजी भन्दा बढी भारी नबोक्नुहोस्' },
        ],
      },
      {
        id: 'dl-3', emoji: '✈️',
        title: { en: 'Travel with PD', ne: 'PD सँग यात्रा' },
        meaning: { en: 'Yes, you can travel! Plan ahead by arranging supplies at your destination.', ne: 'हो, तपाईं यात्रा गर्न सक्नुहुन्छ! गन्तव्यमा सामग्री व्यवस्था गरेर अगाडि योजना बनाउनुहोस्।' },
        actions: [
          { en: 'Inform supplier 2 weeks ahead', ne: 'आपूर्तिकर्तालाई २ हप्ता अगाडि सूचित गर्नुहोस्' },
          { en: 'Carry extra supplies', ne: 'अतिरिक्त सामग्री लैजानुहोस्' },
          { en: 'Keep a travel letter from doctor', ne: 'डाक्टरबाट यात्रा पत्र राख्नुहोस्' },
          { en: 'Find clean room for exchanges', ne: 'एक्सचेन्जको लागि सफा कोठा खोज्नुहोस्' },
        ],
      },
    ],
  },

  // ── 10. Emergency Situations ──
  {
    id: 'emergency-situations',
    title: { en: 'Emergency Situations', ne: 'आपतकालीन परिस्थितिहरू' },
    description: { en: 'What to do in urgent PD situations', ne: 'तत्काल PD परिस्थितिहरूमा के गर्ने' },
    emoji: '🚨',
    category: 'safety',
    cards: [
      {
        id: 'es-1', emoji: '💧',
        title: { en: 'Catheter Leak', ne: 'क्याथेटर चुहावट' },
        meaning: { en: 'If fluid leaks around catheter site, this needs immediate medical attention.', ne: 'यदि क्याथेटर साइट वरिपरि तरल चुहावट हुन्छ भने, यसलाई तत्काल चिकित्सा ध्यान चाहिन्छ।' },
        actions: [
          { en: 'Do NOT do another exchange', ne: 'अर्को एक्सचेन्ज नगर्नुहोस्' },
          { en: 'Cover area with sterile dressing', ne: 'क्षेत्र बाँझ ड्रेसिङले ढाक्नुहोस्' },
          { en: 'Contact center immediately', ne: 'तुरुन्तै केन्द्रमा सम्पर्क गर्नुहोस्' },
        ],
        severity: 'danger',
      },
      {
        id: 'es-2', emoji: '🚫',
        title: { en: 'Bag Contamination', ne: 'ब्याग प्रदूषण' },
        meaning: { en: 'If you touch the connection tip or drop the bag end on the floor, the bag is contaminated.', ne: 'यदि तपाईंले कनेक्सन टिप छुनुभयो वा ब्यागको छेउ भुइँमा खसायो भने, ब्याग प्रदूषित छ।' },
        actions: [
          { en: 'Do NOT use the contaminated bag', ne: 'प्रदूषित ब्याग प्रयोग नगर्नुहोस्' },
          { en: 'Use a new bag', ne: 'नयाँ ब्याग प्रयोग गर्नुहोस्' },
          { en: 'Inform your nurse', ne: 'तपाईंको नर्सलाई सूचित गर्नुहोस्' },
          { en: 'Record the incident', ne: 'घटना रेकर्ड गर्नुहोस्' },
        ],
        severity: 'warning',
      },
      {
        id: 'es-3', emoji: '🏥',
        title: { en: 'When to Go to Hospital', ne: 'अस्पताल कहिले जाने' },
        meaning: { en: 'Some situations require emergency hospital visit. Do not delay!', ne: 'केही परिस्थितिहरूमा आपतकालीन अस्पताल भ्रमण आवश्यक हुन्छ। ढिला नगर्नुहोस्!' },
        actions: [
          { en: 'High fever (>38.5°C) with cloudy fluid', ne: 'उच्च ज्वरो (>३८.५°C) धमिलो तरलसहित' },
          { en: 'Severe abdominal pain', ne: 'गम्भीर पेट दुखाइ' },
          { en: 'Blood in drain fluid', ne: 'निकास तरलमा रगत' },
          { en: 'Catheter falls out', ne: 'क्याथेटर बाहिर निस्कन्छ' },
        ],
        severity: 'danger',
      },
    ],
  },
];

export const categories = [
  { id: 'all', label: { en: 'All Topics', ne: 'सबै विषयहरू' }, emoji: '📚' },
  { id: 'basics', label: { en: 'Basics', ne: 'आधारभूत' }, emoji: '📖' },
  { id: 'skills', label: { en: 'Skills', ne: 'सीपहरू' }, emoji: '🔧' },
  { id: 'safety', label: { en: 'Safety', ne: 'सुरक्षा' }, emoji: '⚠️' },
  { id: 'lifestyle', label: { en: 'Lifestyle', ne: 'जीवनशैली' }, emoji: '🏃' },
];
