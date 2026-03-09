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
  color: string; // tailwind color token for theming
  cards: LearningCard[];
  quizQuestions?: QuizQuestion[];
}

export interface QuizQuestion {
  question: { en: string; ne: string };
  options: { en: string; ne: string }[];
  correctIndex: number;
}

export const learningModules: LearningModule[] = [
  // ── Module 1: Understanding Kidneys (Slides 1–4) ──
  {
    id: 'kidney-failure',
    title: { en: 'Understanding Kidneys', ne: 'मिर्गौला बुझ्नुहोस्' },
    description: { en: 'What kidneys do and what happens when they fail', ne: 'मिर्गौलाले के गर्छ र फेल हुँदा के हुन्छ' },
    emoji: '🫘',
    category: 'basics',
    color: 'primary',
    cards: [
      {
        id: 's1', emoji: '🫘',
        title: { en: 'What Do Kidneys Do?', ne: 'मिर्गौलाले के गर्छ?' },
        meaning: {
          en: 'Your kidneys clean your blood. They remove waste, control water, and keep minerals balanced.\n\nHealthy kidneys work 24 hours every day.',
          ne: 'मिर्गौलाले रगत सफा गर्छ।\nयसले फोहोर पदार्थ हटाउँछ, पानीको सन्तुलन मिलाउँछ र खनिज सन्तुलन राख्छ।\n\nस्वस्थ मिर्गौला दिनरात काम गरिरहन्छ।',
        },
        actions: [
          { en: 'Filter ~200 liters of blood daily', ne: 'दैनिक ~२०० लिटर रगत छान्छ' },
          { en: 'Remove toxins through urine', ne: 'पिसाबमार्फत विषाक्त पदार्थ हटाउँछ' },
          { en: 'Control blood pressure & minerals', ne: 'रक्तचाप र खनिज नियन्त्रण गर्छ' },
        ],
      },
      {
        id: 's2', emoji: '⚠️',
        title: { en: 'What Happens in Kidney Failure?', ne: 'मिर्गौला फेल हुँदा के हुन्छ?' },
        meaning: {
          en: 'When kidneys stop working, waste builds up, fluid accumulates, blood pressure rises, and weakness and swelling appear.\n\nDialysis helps replace kidney function.',
          ne: 'मिर्गौला बिग्रिँदा:\n• फोहोर पदार्थ शरीरमा जम्मा हुन्छ\n• पानी बढ्छ\n• रक्तचाप बढ्छ\n\nडायलाइसिसले मिर्गौलाको काम केही हदसम्म पूरा गर्छ।',
        },
        actions: [
          { en: 'Waste builds up in the body', ne: 'शरीरमा फोहोर जम्मा हुन्छ' },
          { en: 'Swelling in legs and face', ne: 'खुट्टा र अनुहारमा सुन्निने' },
          { en: 'Feeling tired and weak', ne: 'थकित र कमजोर महसुस' },
          { en: 'Difficulty breathing', ne: 'सास फेर्न गाह्रो' },
        ],
        severity: 'warning',
      },
      {
        id: 's3', emoji: '💊',
        title: { en: 'Treatment Options', ne: 'उपचारका विकल्पहरू' },
        meaning: {
          en: 'Kidney failure can be treated by:\n• Hemodialysis\n• Peritoneal Dialysis (PD)\n• Kidney Transplant\n\nYour doctor helps choose the best option.',
          ne: 'मिर्गौला फेल हुँदा उपचारका विकल्प:\n• हेमोडायलाइसिस\n• पेरिटोनियल डायलाइसिस (PD)\n• मिर्गौला प्रत्यारोपण\n\nउपयुक्त उपचार डाक्टरले सुझाव दिन्छन्।',
        },
        actions: [
          { en: 'Hemodialysis: Done at hospital', ne: 'हेमोडायलाइसिस: अस्पतालमा गरिन्छ' },
          { en: 'PD: Done at home', ne: 'PD: घरमा गरिन्छ' },
          { en: 'Transplant: Best long-term option', ne: 'प्रत्यारोपण: सबैभन्दा राम्रो विकल्प' },
        ],
      },
      {
        id: 's4', emoji: '🏠',
        title: { en: 'Why Choose PD?', ne: 'PD किन छनोट गर्ने?' },
        meaning: {
          en: 'Peritoneal dialysis allows treatment at home, flexible lifestyle, and gentle dialysis every day.\n\nMany patients live active lives with PD.',
          ne: 'PD का फाइदा:\n• घरमै डायलाइसिस\n• समयको लचिलोपन\n• दैनिक नरम डायलाइसिस\n\nधेरै बिरामीले PD मा सामान्य जीवन जिउन सक्छन्।',
        },
        actions: [
          { en: 'Treatment at home — no hospital visits', ne: 'घरमै उपचार — अस्पताल जानु पर्दैन' },
          { en: 'Flexible schedule around your life', ne: 'तपाईँको जीवनशैली अनुसार लचिलो समय' },
          { en: 'Gentle, continuous dialysis every day', ne: 'दैनिक नरम, निरन्तर डायलाइसिस' },
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
      {
        question: { en: 'What is a key benefit of PD?', ne: 'PD को मुख्य फाइदा के हो?' },
        options: [
          { en: 'Treatment at home', ne: 'घरमै उपचार' },
          { en: 'Requires hospital every day', ne: 'दैनिक अस्पताल चाहिन्छ' },
          { en: 'No doctor visits needed', ne: 'डाक्टर भेट्नु पर्दैन' },
        ],
        correctIndex: 0,
      },
    ],
  },

  // ── Module 2: Understanding Peritoneal Dialysis (Slides 5–8) ──
  {
    id: 'understanding-pd',
    title: { en: 'Understanding Peritoneal Dialysis', ne: 'पेरिटोनियल डायलाइसिस बुझ्नुहोस्' },
    description: { en: 'How PD works, dialysis fluid, exchanges, and schedule', ne: 'PD कसरी काम गर्छ, डायलाइसिस पानी, एक्सचेन्ज, र तालिका' },
    emoji: '💧',
    category: 'basics',
    color: 'accent',
    cards: [
      {
        id: 's5', emoji: '💧',
        title: { en: 'What Is Peritoneal Dialysis?', ne: 'पेरिटोनियल डायलाइसिस के हो?' },
        meaning: {
          en: 'PD uses the lining of your abdomen (the peritoneal membrane) to filter waste from blood.\n\nDialysis fluid absorbs waste and extra water.',
          ne: 'PD ले पेटभित्रको झिल्ली (पेरिटोनियल मेम्ब्रेन) प्रयोग गरेर रगत सफा गर्छ।\n\nडायलाइसिस पानीले फोहोर र अतिरिक्त पानी सोस्छ।',
        },
        actions: [
          { en: 'Uses your body\'s natural membrane', ne: 'शरीरको प्राकृतिक झिल्ली प्रयोग गर्छ' },
          { en: 'No needles needed', ne: 'सुई चाहिँदैन' },
          { en: 'Done at home by yourself', ne: 'घरमा आफैँले गर्ने' },
        ],
      },
      {
        id: 's6', emoji: '🧪',
        title: { en: 'What Is Dialysis Fluid?', ne: 'डायलाइसिस पानी के हो?' },
        meaning: {
          en: 'Dialysis fluid is a sterile solution placed in your abdomen.\n\nIt helps remove toxins, extra salt, and extra water.',
          ne: 'डायलाइसिस पानी एक सफा विशेष घोल हो।\n\nयसले फोहोर पदार्थ, अतिरिक्त नुन, र अतिरिक्त पानी हटाउँछ।',
        },
        actions: [
          { en: 'Sterile — must stay clean', ne: 'बाँझ — सफा रहनुपर्छ' },
          { en: 'Absorbs toxins from blood', ne: 'रगतबाट विषाक्त पदार्थ सोस्छ' },
          { en: 'Removes extra water', ne: 'अतिरिक्त पानी हटाउँछ' },
        ],
      },
      {
        id: 's7', emoji: '🔄',
        title: { en: 'What Is an Exchange?', ne: 'एक्सचेन्ज के हो?' },
        meaning: {
          en: 'An exchange has three steps:\n① Drain old fluid\n② Fill fresh dialysis fluid\n③ Let fluid stay inside\n\nThis cycle cleans the blood.',
          ne: 'एक्सचेन्जका चरण:\n① पुरानो पानी निकाल्ने\n② नयाँ पानी हाल्ने\n③ केही समय पेटभित्र राख्ने\n\nयसले रगत सफा गर्छ।',
        },
        actions: [
          { en: 'Step 1: Drain — old fluid out', ne: 'चरण १: निकाल्ने — पुरानो पानी बाहिर' },
          { en: 'Step 2: Fill — fresh fluid in', ne: 'चरण २: भर्ने — नयाँ पानी भित्र' },
          { en: 'Step 3: Dwell — let it work', ne: 'चरण ३: बस्ने — काम गर्न दिने' },
        ],
      },
      {
        id: 's8', emoji: '🕐',
        title: { en: 'CAPD Schedule', ne: 'CAPD तालिका' },
        meaning: {
          en: 'Most CAPD patients perform 3–4 exchanges per day.\n\nEach exchange takes about 30–40 minutes.',
          ne: 'CAPD बिरामीले सामान्यतया दिनमा ३–४ पटक एक्सचेन्ज गर्छन्।\n\nएक्सचेन्ज गर्न ३०–४० मिनेट लाग्छ।',
        },
        actions: [
          { en: '3–4 exchanges daily', ne: 'दैनिक ३–४ एक्सचेन्ज' },
          { en: '30–40 minutes each', ne: 'प्रत्येक ३०–४० मिनेट' },
          { en: 'Flexible timing around meals & sleep', ne: 'खाना र निद्राको समय अनुसार' },
        ],
      },
    ],
    quizQuestions: [
      {
        question: { en: 'How many steps are in a PD exchange?', ne: 'PD एक्सचेन्जमा कति चरणहरू छन्?' },
        options: [
          { en: 'Two', ne: 'दुई' },
          { en: 'Three', ne: 'तीन' },
          { en: 'Five', ne: 'पाँच' },
        ],
        correctIndex: 1,
      },
    ],
  },

  // ── Module 3: PD Catheter Care (Slides 9–12) ──
  {
    id: 'catheter-care',
    title: { en: 'PD Catheter Care', ne: 'PD क्याथेटर हेरचाह' },
    description: { en: 'Daily catheter care and recognizing exit site problems', ne: 'दैनिक क्याथेटर हेरचाह र समस्या पहिचान' },
    emoji: '🩹',
    category: 'skills',
    color: 'warning',
    cards: [
      {
        id: 's9', emoji: '🩹',
        title: { en: 'What Is a PD Catheter?', ne: 'PD क्याथेटर के हो?' },
        meaning: {
          en: 'A PD catheter is a soft tube placed in your abdomen.\n\nIt allows dialysis fluid to enter and leave your body.',
          ne: 'PD क्याथेटर पेटमा राखिएको नरम ट्युब हो।\n\nयसबाट डायलाइसिस पानी भित्र र बाहिर जान्छ।',
        },
        actions: [
          { en: 'Soft, flexible silicone tube', ne: 'नरम, लचिलो सिलिकन ट्युब' },
          { en: 'Placed by minor surgery', ne: 'सानो शल्यक्रियाद्वारा राखिन्छ' },
          { en: 'Your lifeline for dialysis', ne: 'डायलाइसिसको मुख्य माध्यम' },
        ],
      },
      {
        id: 's10', emoji: '🛡️',
        title: { en: 'Why Catheter Care Is Important', ne: 'क्याथेटर हेरचाह किन महत्वपूर्ण छ' },
        meaning: {
          en: 'Your catheter is your lifeline.\n\nKeeping it clean prevents infection.',
          ne: 'क्याथेटर डायलाइसिसको मुख्य माध्यम हो।\n\nसफा राख्दा संक्रमणबाट बचिन्छ।',
        },
        actions: [
          { en: 'Clean daily — prevents infection', ne: 'दैनिक सफा — संक्रमण रोक्छ' },
          { en: 'Keep dry when not cleaning', ne: 'सफा नगर्दा सुक्खा राख्नुहोस्' },
          { en: 'Secure catheter to prevent pulling', ne: 'तन्काउनबाट बचाउनुहोस्' },
        ],
        severity: 'info',
      },
      {
        id: 's11', emoji: '🧼',
        title: { en: 'Daily Exit Site Care', ne: 'दैनिक एक्जिट साइट हेरचाह' },
        meaning: {
          en: 'Daily care steps:\n• Wash with soap and water\n• Dry the area well\n• Apply clean dressing',
          ne: 'दैनिक हेरचाह:\n• साबुन पानीले धुनुहोस्\n• राम्रोसँग सुकाउनुहोस्\n• सफा ड्रेसिङ लगाउनुहोस्',
        },
        actions: [
          { en: 'Wash gently with soap & water', ne: 'साबुन पानीले बिस्तारै धुनुहोस्' },
          { en: 'Pat dry — never rub', ne: 'थप्पड्याएर सुकाउनुहोस् — नरगड्नुहोस्' },
          { en: 'Apply fresh sterile dressing', ne: 'नयाँ बाँझ ड्रेसिङ लगाउनुहोस्' },
        ],
      },
      {
        id: 's12', emoji: '🔴',
        title: { en: 'Signs of Exit Site Infection', ne: 'एक्जिट साइट संक्रमणका लक्षण' },
        meaning: {
          en: 'Watch for redness, swelling, pain, and pus.\n\nContact your doctor if these appear.',
          ne: 'यी लक्षण देखिएमा ध्यान दिनुहोस्:\n• रातोपन\n• सुन्निनु\n• दुखाइ\n• पस\n\nतुरुन्त डाक्टरलाई जानकारी दिनुहोस्।',
        },
        actions: [
          { en: 'Redness around exit site', ne: 'एक्जिट साइट वरिपरि रातोपन' },
          { en: 'Swelling or pain', ne: 'सुन्निनु वा दुखाइ' },
          { en: 'Pus or discharge', ne: 'पस वा डिस्चार्ज' },
          { en: 'Contact doctor immediately', ne: 'तुरुन्त डाक्टरलाई सम्पर्क गर्नुहोस्' },
        ],
        severity: 'danger',
      },
    ],
    quizQuestions: [
      {
        question: { en: 'What is the first sign of exit site infection?', ne: 'एक्जिट साइट संक्रमणको पहिलो संकेत के हो?' },
        options: [
          { en: 'Itching all over body', ne: 'जताततै चिलाउने' },
          { en: 'Redness, swelling or pus at exit site', ne: 'एक्जिट साइटमा रातोपन, सुन्निनु वा पस' },
          { en: 'Feeling hungry', ne: 'भोक लाग्ने' },
        ],
        correctIndex: 1,
      },
    ],
  },

  // ── Module 4: Performing CAPD Exchange (Slides 13–18) ──
  {
    id: 'capd-exchange',
    title: { en: 'Performing CAPD Exchange', ne: 'CAPD एक्सचेन्ज गर्ने तरिका' },
    description: { en: 'Step-by-step exchange procedure with sterile technique', ne: 'बाँझ प्रविधिसहित चरणबद्ध एक्सचेन्ज प्रक्रिया' },
    emoji: '🔄',
    category: 'skills',
    color: 'primary',
    cards: [
      {
        id: 's13', emoji: '✅',
        title: { en: 'Prepare for Exchange', ne: 'एक्सचेन्जको तयारी' },
        meaning: {
          en: 'Before exchange:\n• Wash hands\n• Wear mask\n• Clean working area',
          ne: 'एक्सचेन्ज अघि:\n• हात धुनुहोस्\n• मास्क लगाउनुहोस्\n• सफा ठाउँ तयार गर्नुहोस्।',
        },
        actions: [
          { en: 'Wash hands thoroughly', ne: 'हात राम्रोसँग धुनुहोस्' },
          { en: 'Put on a clean mask', ne: 'सफा मास्क लगाउनुहोस्' },
          { en: 'Prepare clean, quiet workspace', ne: 'सफा, शान्त ठाउँ तयार गर्नुहोस्' },
        ],
      },
      {
        id: 's14', emoji: '🤲',
        title: { en: 'Hand Washing', ne: 'हात धुने' },
        meaning: {
          en: 'Proper hand washing is the most important step to prevent infection.\n\nWash for 20 seconds with soap.',
          ne: 'हात धुनु संक्रमण रोक्ने सबैभन्दा महत्वपूर्ण उपाय हो।\n\nसाबुनले २० सेकेन्डसम्म धुनुहोस्।',
        },
        actions: [
          { en: 'Use soap — not just water', ne: 'साबुन प्रयोग गर्नुहोस् — पानी मात्र होइन' },
          { en: 'Wash for at least 20 seconds', ne: 'कम्तिमा २० सेकेन्ड धुनुहोस्' },
          { en: 'Clean between fingers and under nails', ne: 'औँलाका बिचमा र नङ्ग्रा मुनि सफा गर्नुहोस्' },
        ],
        severity: 'info',
      },
      {
        id: 's15', emoji: '🔗',
        title: { en: 'Connecting the Dialysis Bag', ne: 'डायलाइसिस ब्याग जडान' },
        meaning: {
          en: 'Avoid touching sterile parts.\n\nConnect the tubing carefully.',
          ne: 'सफा भाग नछुनुहोस्।\n\nट्युब सावधानीपूर्वक जडान गर्नुहोस्।',
        },
        actions: [
          { en: 'Never touch sterile connection tips', ne: 'बाँझ कनेक्सन टिप नछुनुहोस्' },
          { en: 'Twist firmly until secure', ne: 'सुरक्षित नभएसम्म मजबुत रूपमा घुमाउनुहोस्' },
          { en: 'Check for leaks before starting', ne: 'सुरु गर्नुअघि चुहावट जाँच गर्नुहोस्' },
        ],
        severity: 'warning',
      },
      {
        id: 's16', emoji: '⬇️',
        title: { en: 'Drain Phase', ne: 'ड्रेन चरण' },
        meaning: {
          en: 'Old dialysis fluid drains out of the abdomen.\n\nThis removes waste from the body.',
          ne: 'पुरानो पानी बाहिर निस्कन्छ।\n\nयसले फोहोर पदार्थ बाहिर निकाल्छ।',
        },
        actions: [
          { en: 'Takes about 15–20 minutes', ne: 'करिब १५–२० मिनेट लाग्छ' },
          { en: 'Check drain color — should be clear', ne: 'ड्रेनको रंग जाँच्नुहोस् — स्पष्ट हुनुपर्छ' },
          { en: 'Note the drain volume', ne: 'ड्रेनको मात्रा नोट गर्नुहोस्' },
        ],
      },
      {
        id: 's17', emoji: '⬆️',
        title: { en: 'Fill Phase', ne: 'फिल चरण' },
        meaning: {
          en: 'Fresh dialysis fluid flows into the abdomen.\n\nThis fluid will absorb toxins.',
          ne: 'नयाँ डायलाइसिस पानी पेटमा जान्छ।\n\nयसले फोहोर सोस्ने काम गर्छ।',
        },
        actions: [
          { en: 'Takes about 10–15 minutes', ne: 'करिब १०–१५ मिनेट लाग्छ' },
          { en: 'Fluid should be at body temperature', ne: 'पानी शरीरको तापक्रममा हुनुपर्छ' },
          { en: 'Check fluid is clear before filling', ne: 'भर्नुअघि पानी स्पष्ट छ जाँच्नुहोस्' },
        ],
      },
      {
        id: 's18', emoji: '🔒',
        title: { en: 'Closing the System', ne: 'प्रणाली बन्द गर्ने' },
        meaning: {
          en: 'Close the catheter carefully and keep it clean.\n\nDispose dialysis bags safely.',
          ne: 'क्याथेटर राम्रोसँग बन्द गर्नुहोस्।\n\nब्याग सुरक्षित रूपमा फाल्नुहोस्।',
        },
        actions: [
          { en: 'Cap catheter with sterile cap', ne: 'बाँझ क्यापले क्याथेटर बन्द गर्नुहोस्' },
          { en: 'Dispose bags in designated waste', ne: 'निर्धारित फोहोरमा ब्याग फाल्नुहोस्' },
          { en: 'Record exchange details in app', ne: 'एपमा एक्सचेन्ज विवरण रेकर्ड गर्नुहोस्' },
        ],
      },
    ],
    quizQuestions: [
      {
        question: { en: 'What is the most important step before exchange?', ne: 'एक्सचेन्ज अघि सबैभन्दा महत्वपूर्ण चरण के हो?' },
        options: [
          { en: 'Eating food', ne: 'खाना खाने' },
          { en: 'Washing hands properly', ne: 'हात राम्रोसँग धुने' },
          { en: 'Watching TV', ne: 'टिभी हेर्ने' },
        ],
        correctIndex: 1,
      },
      {
        question: { en: 'What should drain fluid look like?', ne: 'ड्रेन पानी कस्तो देखिनुपर्छ?' },
        options: [
          { en: 'Cloudy and yellow', ne: 'धमिलो र पहेँलो' },
          { en: 'Clear and light yellow', ne: 'स्पष्ट र हल्का पहेँलो' },
          { en: 'Red', ne: 'रातो' },
        ],
        correctIndex: 1,
      },
    ],
  },

  // ── Module 5: Recognizing Problems (Slides 19–23) ──
  {
    id: 'recognizing-problems',
    title: { en: 'Recognizing Problems', ne: 'समस्या पहिचान गर्ने' },
    description: { en: 'Warning signs during PD that need attention', ne: 'PD गर्दा ध्यान दिनुपर्ने चेतावनी संकेतहरू' },
    emoji: '⚠️',
    category: 'safety',
    color: 'destructive',
    cards: [
      {
        id: 's19', emoji: '🌫️',
        title: { en: 'Cloudy Dialysis Fluid', ne: 'धमिलो डायलाइसिस पानी' },
        meaning: {
          en: 'Cloudy fluid may mean infection.\n\nThis is the most important warning sign.',
          ne: 'धमिलो पानी संक्रमणको संकेत हुन सक्छ।\n\nयो सबैभन्दा महत्वपूर्ण चेतावनी हो।',
        },
        actions: [
          { en: 'STOP — do not throw away the bag', ne: 'रोक्नुहोस् — ब्याग नफाल्नुहोस्' },
          { en: 'Save the cloudy bag', ne: 'धमिलो ब्याग सुरक्षित राख्नुहोस्' },
          { en: 'Contact doctor immediately', ne: 'तुरुन्त डाक्टरलाई सम्पर्क गर्नुहोस्' },
        ],
        severity: 'danger',
      },
      {
        id: 's20', emoji: '😣',
        title: { en: 'Abdominal Pain', ne: 'पेट दुखाइ' },
        meaning: {
          en: 'Pain during dialysis may indicate infection or irritation.\n\nReport persistent pain.',
          ne: 'डायलाइसिस गर्दा पेट दुखेमा संक्रमण हुन सक्छ।\n\nलामो समय दुखेमा खबर गर्नुहोस्।',
        },
        actions: [
          { en: 'Note pain location and timing', ne: 'दुखाइको स्थान र समय नोट गर्नुहोस्' },
          { en: 'Check drain fluid color', ne: 'ड्रेन पानीको रंग जाँच्नुहोस्' },
          { en: 'Report if pain persists > 1 hour', ne: '१ घण्टाभन्दा बढी दुखेमा रिपोर्ट गर्नुहोस्' },
        ],
        severity: 'warning',
      },
      {
        id: 's21', emoji: '🌡️',
        title: { en: 'Fever', ne: 'ज्वरो' },
        meaning: {
          en: 'Fever may signal infection.\n\nCheck temperature and inform your dialysis center.',
          ne: 'ज्वरो संक्रमणको संकेत हुन सक्छ।\n\nतापक्रम जाँचेर केन्द्रमा जानकारी दिनुहोस्।',
        },
        actions: [
          { en: 'Check temperature with thermometer', ne: 'थर्मोमिटरले तापक्रम जाँच्नुहोस्' },
          { en: 'Fever > 38°C needs attention', ne: '३८°C भन्दा बढी ज्वरोमा ध्यान दिनुहोस्' },
          { en: 'Report to dialysis center', ne: 'डायलाइसिस केन्द्रमा रिपोर्ट गर्नुहोस्' },
        ],
        severity: 'warning',
      },
      {
        id: 's22', emoji: '🚱',
        title: { en: 'Poor Drainage', ne: 'कमजोर ड्रेनेज' },
        meaning: {
          en: 'If fluid drains slowly or stops:\n• Change position\n• Check tubing\n\nContact doctor if problem continues.',
          ne: 'पानी राम्ररी ननिस्किएमा:\n• शरीरको स्थिति परिवर्तन गर्नुहोस्\n• ट्युब जाँच गर्नुहोस्\n\nसमस्या जारी रहेमा डाक्टरलाई खबर गर्नुहोस्।',
        },
        actions: [
          { en: 'Change body position', ne: 'शरीरको स्थिति बदल्नुहोस्' },
          { en: 'Check for kinks in tubing', ne: 'ट्युबमा मोडिएको जाँच गर्नुहोस्' },
          { en: 'Try gentle walking', ne: 'बिस्तारै हिँड्ने प्रयास गर्नुहोस्' },
        ],
      },
      {
        id: 's23', emoji: '💦',
        title: { en: 'Catheter Leakage', ne: 'क्याथेटर चुहावट' },
        meaning: {
          en: 'Leakage around catheter needs medical attention.\n\nDo not ignore fluid leakage.',
          ne: 'क्याथेटर वरिपरि पानी चुहिएमा ध्यान दिनुहोस्।\n\nडाक्टरसँग तुरुन्त सल्लाह लिनुहोस्।',
        },
        actions: [
          { en: 'Do NOT do another exchange', ne: 'अर्को एक्सचेन्ज नगर्नुहोस्' },
          { en: 'Cover area with sterile dressing', ne: 'क्षेत्र बाँझ ड्रेसिङले ढाक्नुहोस्' },
          { en: 'Contact center immediately', ne: 'तुरुन्तै केन्द्रमा सम्पर्क गर्नुहोस्' },
        ],
        severity: 'danger',
      },
    ],
    quizQuestions: [
      {
        question: { en: 'What should you do with cloudy drain fluid?', ne: 'धमिलो ड्रेन पानीसँग के गर्नुपर्छ?' },
        options: [
          { en: 'Throw it away', ne: 'फाल्ने' },
          { en: 'Save the bag and call doctor', ne: 'ब्याग सुरक्षित राखेर डाक्टरलाई फोन गर्ने' },
          { en: 'Ignore it', ne: 'बेवास्ता गर्ने' },
        ],
        correctIndex: 1,
      },
    ],
  },

  // ── Module 6: Preventing Peritonitis (Slides 24–28) ──
  {
    id: 'peritonitis-education',
    title: { en: 'Preventing Peritonitis', ne: 'पेरिटोनाइटिस रोकथाम' },
    description: { en: 'Understanding, preventing, and responding to peritonitis', ne: 'पेरिटोनाइटिस बुझ्ने, रोक्ने र प्रतिक्रिया गर्ने' },
    emoji: '🛡️',
    category: 'safety',
    color: 'destructive',
    cards: [
      {
        id: 's24', emoji: '⚠️',
        title: { en: 'What Is Peritonitis?', ne: 'पेरिटोनाइटिस के हो?' },
        meaning: {
          en: 'Peritonitis is infection inside the abdomen.\n\nIt is the most serious PD complication.',
          ne: 'पेरिटोनाइटिस पेटभित्रको संक्रमण हो।\n\nयो PD को गम्भीर जटिलता हो।',
        },
        actions: [
          { en: 'Caused by germs entering the abdomen', ne: 'कीटाणुले पेटमा प्रवेश गर्दा हुन्छ' },
          { en: 'Can damage peritoneal membrane', ne: 'पेरिटोनियल झिल्ली बिगार्न सक्छ' },
          { en: 'Treatable if caught early', ne: 'चाँडो थाहा भएमा उपचार गर्न सकिन्छ' },
        ],
        severity: 'danger',
      },
      {
        id: 's25', emoji: '🦠',
        title: { en: 'Causes of Infection', ne: 'संक्रमणका कारण' },
        meaning: {
          en: 'Common causes:\n• Poor hand hygiene\n• Touching sterile parts\n• Contaminated connections',
          ne: 'संक्रमणका कारण:\n• हात राम्रोसँग नधुने\n• सफा भाग छोइने\n• कनेक्सन दूषित हुनु',
        },
        actions: [
          { en: 'Poor hand washing — #1 cause', ne: 'हात राम्ररी नधुने — मुख्य कारण' },
          { en: 'Touching connection tips', ne: 'कनेक्सन टिप छुने' },
          { en: 'Dirty work area', ne: 'फोहोर काम गर्ने ठाउँ' },
        ],
        severity: 'warning',
      },
      {
        id: 's26', emoji: '✋',
        title: { en: 'Prevention Steps', ne: 'रोकथामका उपाय' },
        meaning: {
          en: 'To prevent infection:\n• Clean hands\n• Use mask\n• Follow sterile technique',
          ne: 'संक्रमण रोक्न:\n• हात सफा राख्नुहोस्\n• मास्क लगाउनुहोस्\n• सही तरिका अपनाउनुहोस्।',
        },
        actions: [
          { en: 'Always wash hands before exchange', ne: 'एक्सचेन्ज अघि सधैँ हात धुनुहोस्' },
          { en: 'Wear mask during exchange', ne: 'एक्सचेन्ज गर्दा मास्क लगाउनुहोस्' },
          { en: 'Never touch sterile parts', ne: 'बाँझ भागहरू कहिल्यै नछुनुहोस्' },
        ],
        severity: 'info',
      },
      {
        id: 's27', emoji: '⏰',
        title: { en: 'Early Treatment', ne: 'प्रारम्भिक उपचार' },
        meaning: {
          en: 'Early treatment prevents serious illness.\n\nReport symptoms immediately.',
          ne: 'छिटो उपचारले जटिलता रोक्छ।\n\nलक्षण देखिएमा तुरुन्त जानकारी दिनुहोस्।',
        },
        actions: [
          { en: 'Cloudy fluid = call doctor NOW', ne: 'धमिलो पानी = अहिले डाक्टरलाई फोन गर्नुहोस्' },
          { en: 'Antibiotics start within hours', ne: 'एन्टिबायोटिक घण्टौँमा सुरु हुन्छ' },
          { en: 'Early treatment = better outcomes', ne: 'चाँडो उपचार = राम्रो नतिजा' },
        ],
      },
      {
        id: 's28', emoji: '📦',
        title: { en: 'Save Cloudy Fluid', ne: 'धमिलो पानी सुरक्षित राख्नुहोस्' },
        meaning: {
          en: 'If fluid becomes cloudy:\nDo not discard the bag.\n\nBring it to the hospital for testing.',
          ne: 'पानी धमिलो भएमा:\nब्याग नफाल्नुहोस्।\n\nपरीक्षणका लागि अस्पताल ल्याउनुहोस्।',
        },
        actions: [
          { en: 'SAVE the cloudy bag', ne: 'धमिलो ब्याग सुरक्षित राख्नुहोस्' },
          { en: 'Bring to hospital for culture testing', ne: 'कल्चर परीक्षणका लागि अस्पताल ल्याउनुहोस्' },
          { en: 'This helps identify the germ', ne: 'यसले कीटाणु पहिचान गर्न मद्दत गर्छ' },
        ],
        severity: 'danger',
      },
    ],
    quizQuestions: [
      {
        question: { en: 'What is the #1 cause of peritonitis?', ne: 'पेरिटोनाइटिसको मुख्य कारण के हो?' },
        options: [
          { en: 'Eating spicy food', ne: 'पिरो खाना खाने' },
          { en: 'Poor hand hygiene', ne: 'हात राम्ररी नधुने' },
          { en: 'Sleeping too much', ne: 'धेरै सुत्ने' },
        ],
        correctIndex: 1,
      },
    ],
  },

  // ── Module 7: Diet & Lifestyle (Slides 29–33) ──
  {
    id: 'diet-lifestyle',
    title: { en: 'Diet & Lifestyle', ne: 'आहार र जीवनशैली' },
    description: { en: 'Nutrition, fluid balance, exercise, and traveling with PD', ne: 'पोषण, पानी सन्तुलन, व्यायाम, र PD सँग यात्रा' },
    emoji: '🥗',
    category: 'lifestyle',
    color: 'accent',
    cards: [
      {
        id: 's29', emoji: '🥚',
        title: { en: 'Protein for PD Patients', ne: 'PD बिरामीका लागि प्रोटिन' },
        meaning: {
          en: 'PD patients need extra protein.\n\nGood sources: eggs, fish, chicken.',
          ne: 'PD बिरामीलाई प्रोटिन बढी चाहिन्छ।\n\nस्रोत: अण्डा, माछा, कुखुरा।',
        },
        actions: [
          { en: 'Eat protein at every meal', ne: 'प्रत्येक खानामा प्रोटिन लिनुहोस्' },
          { en: 'Eggs, fish, chicken, lentils', ne: 'अण्डा, माछा, कुखुरा, दाल' },
          { en: 'PD loses protein — must replace it', ne: 'PD ले प्रोटिन गुमाउँछ — भर्नुपर्छ' },
        ],
      },
      {
        id: 's30', emoji: '🧂',
        title: { en: 'Salt Control', ne: 'नुन नियन्त्रण' },
        meaning: {
          en: 'Too much salt causes swelling and high blood pressure.\n\nLimit salty foods.',
          ne: 'धेरै नुनले सुन्निने र रक्तचाप बढ्ने।\n\nनुन कम लिनुहोस्।',
        },
        actions: [
          { en: 'Avoid pickles, papad, processed food', ne: 'अचार, पापड, प्रशोधित खाना नखानुहोस्' },
          { en: 'Cook with less salt', ne: 'कम नुन हालेर खाना पकाउनुहोस्' },
          { en: 'Use herbs and spices instead', ne: 'जडीबुटी र मसला प्रयोग गर्नुहोस्' },
        ],
        severity: 'warning',
      },
      {
        id: 's31', emoji: '💧',
        title: { en: 'Fluid Balance', ne: 'पानी सन्तुलन' },
        meaning: {
          en: 'Follow your doctor\'s advice on fluid intake.\n\nToo much fluid causes swelling and breathing difficulty.',
          ne: 'पानीको मात्रा डाक्टरको सल्लाह अनुसार लिनुहोस्।\n\nधेरै पानीले सुन्निने र सास फेर्न गाह्रो हुन सक्छ।',
        },
        actions: [
          { en: 'Follow doctor\'s fluid limit', ne: 'डाक्टरको पानी सीमा पालना गर्नुहोस्' },
          { en: 'Suck ice chips to reduce thirst', ne: 'तिर्खा कम गर्न बरफको टुक्रा चुसुनुहोस्' },
          { en: 'Track intake in this app', ne: 'यो एपमा पिउने मात्रा रेकर्ड गर्नुहोस्' },
        ],
      },
      {
        id: 's32', emoji: '🏃',
        title: { en: 'Exercise and Activity', ne: 'व्यायाम र गतिविधि' },
        meaning: {
          en: 'Light exercise is healthy.\n\nWalking and stretching improve strength.',
          ne: 'हल्का व्यायाम राम्रो हुन्छ।\n\nहिँडडुल र स्ट्रेचिङ उपयोगी हुन्छ।',
        },
        actions: [
          { en: 'Walk daily — even 15 minutes helps', ne: 'दैनिक हिँड्नुहोस् — १५ मिनेट पनि मद्दत गर्छ' },
          { en: 'Gentle stretching improves flexibility', ne: 'हल्का स्ट्रेचिङले लचिलोपन सुधार्छ' },
          { en: 'Avoid heavy lifting near catheter', ne: 'क्याथेटर नजिक भारी नउठाउनुहोस्' },
        ],
      },
      {
        id: 's33', emoji: '✈️',
        title: { en: 'Traveling with PD', ne: 'PD सँग यात्रा' },
        meaning: {
          en: 'You can travel with PD.\n\nPlan ahead and carry enough dialysis supplies.',
          ne: 'PD भएका बिरामीले यात्रा गर्न सक्छन्।\n\nपहिल्यै योजना बनाएर सामग्री साथमा राख्नुहोस्।',
        },
        actions: [
          { en: 'Order extra supplies in advance', ne: 'अग्रिम अतिरिक्त सामग्री अर्डर गर्नुहोस्' },
          { en: 'Carry supplies in hand luggage', ne: 'सामग्री ह्यान्ड ब्यागमा राख्नुहोस्' },
          { en: 'Inform your dialysis center', ne: 'डायलाइसिस केन्द्रलाई जानकारी दिनुहोस्' },
        ],
      },
    ],
    quizQuestions: [
      {
        question: { en: 'Why do PD patients need extra protein?', ne: 'PD बिरामीलाई अतिरिक्त प्रोटिन किन चाहिन्छ?' },
        options: [
          { en: 'To gain weight', ne: 'तौल बढाउन' },
          { en: 'PD removes protein — must replace it', ne: 'PD ले प्रोटिन हटाउँछ — भर्नुपर्छ' },
          { en: 'It helps kidneys grow back', ne: 'मिर्गौला फिर्ता बढ्न मद्दत गर्छ' },
        ],
        correctIndex: 1,
      },
    ],
  },

  // ── Module 8: Emergency Awareness (Slides 34–36) ──
  {
    id: 'emergency-situations',
    title: { en: 'Emergency Awareness', ne: 'आपतकालीन सचेतना' },
    description: { en: 'When to contact doctor and emergency actions', ne: 'डाक्टरलाई कहिले सम्पर्क गर्ने र आपतकालीन कार्य' },
    emoji: '🚨',
    category: 'safety',
    color: 'destructive',
    cards: [
      {
        id: 's34', emoji: '📞',
        title: { en: 'When to Contact Doctor', ne: 'डाक्टरलाई कहिले सम्पर्क गर्ने' },
        meaning: {
          en: 'Contact doctor if:\n• Cloudy fluid\n• Fever\n• Severe pain',
          ne: 'यी अवस्थामा तुरुन्त सम्पर्क गर्नुहोस्:\n• धमिलो पानी\n• ज्वरो\n• धेरै दुखाइ',
        },
        actions: [
          { en: 'Cloudy drain fluid → call NOW', ne: 'धमिलो ड्रेन पानी → अहिले फोन गर्नुहोस्' },
          { en: 'Fever > 38°C → call same day', ne: 'ज्वरो > ३८°C → उही दिन फोन गर्नुहोस्' },
          { en: 'Severe belly pain → go to hospital', ne: 'गम्भीर पेट दुखाइ → अस्पताल जानुहोस्' },
          { en: 'Blood in fluid → call immediately', ne: 'पानीमा रगत → तुरुन्त फोन गर्नुहोस्' },
        ],
        severity: 'danger',
      },
      {
        id: 's35', emoji: '🏥',
        title: { en: 'Catheter Accident', ne: 'क्याथेटर दुर्घटना' },
        meaning: {
          en: 'If catheter is pulled or damaged:\n\nCover area and go to hospital immediately.',
          ne: 'क्याथेटर तानियो वा बिग्रियो भने:\n\nढाकेर तुरुन्त अस्पताल जानुहोस्।',
        },
        actions: [
          { en: 'Cover exit site with clean cloth', ne: 'एक्जिट साइट सफा कपडाले ढाक्नुहोस्' },
          { en: 'Do NOT push catheter back in', ne: 'क्याथेटर फिर्ता नहाल्नुहोस्' },
          { en: 'Go to hospital immediately', ne: 'तुरुन्त अस्पताल जानुहोस्' },
        ],
        severity: 'danger',
      },
      {
        id: 's36', emoji: '🌟',
        title: { en: 'Your PD Success', ne: 'तपाईँको PD सफलता' },
        meaning: {
          en: 'With proper care, PD can work safely for many years.\n\nFollow training and stay in touch with your dialysis team.',
          ne: 'सही हेरचाह गरेमा PD धेरै वर्ष सुरक्षित रूपमा चल्न सक्छ।\n\nडायलाइसिस टोलीसँग नियमित सम्पर्कमा रहनुहोस्।',
        },
        actions: [
          { en: 'Follow your training carefully', ne: 'तालिम सावधानीपूर्वक पालना गर्नुहोस्' },
          { en: 'Record exchanges daily in this app', ne: 'यो एपमा दैनिक एक्सचेन्ज रेकर्ड गर्नुहोस्' },
          { en: 'Stay in touch with your PD team', ne: 'PD टोलीसँग सम्पर्कमा रहनुहोस्' },
          { en: 'You are doing great! 💪', ne: 'तपाईँ राम्रो गर्दै हुनुहुन्छ! 💪' },
        ],
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
