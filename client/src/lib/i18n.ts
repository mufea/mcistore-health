// ─── Supported Languages ──────────────────────────────────────────────────────
export type Language = "en" | "ar" | "zh" | "es" | "hi";

export const LANGUAGES: { code: Language; label: string; nativeLabel: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English",  nativeLabel: "English",  dir: "ltr" },
  { code: "ar", label: "Arabic",   nativeLabel: "العربية",  dir: "rtl" },
  { code: "zh", label: "Mandarin", nativeLabel: "中文",      dir: "ltr" },
  { code: "es", label: "Spanish",  nativeLabel: "Español",  dir: "ltr" },
  { code: "hi", label: "Hindi",    nativeLabel: "हिन्दी",    dir: "ltr" },
];

// ─── Translation Dictionary ───────────────────────────────────────────────────
export const translations = {
  // ── Navbar ──
  nav: {
    home:          { en: "Home",         ar: "الرئيسية",    zh: "首页",   es: "Inicio",    hi: "होम" },
    healthSurvey:  { en: "Health Survey",ar: "استبيان الصحة",zh: "健康调查",es: "Encuesta de Salud", hi: "स्वास्थ्य सर्वेक्षण" },
    products:      { en: "Products",     ar: "المنتجات",    zh: "产品",   es: "Productos", hi: "उत्पाद" },
    myOrders:      { en: "My Orders",    ar: "طلباتي",      zh: "我的订单",es: "Mis Pedidos",hi: "मेरे आदेश" },
    signIn:        { en: "Sign In",      ar: "تسجيل الدخول",zh: "登录",   es: "Iniciar Sesión", hi: "साइन इन" },
    signOut:       { en: "Sign Out",     ar: "تسجيل الخروج",zh: "退出",   es: "Cerrar Sesión",  hi: "साइन आउट" },
    adminDashboard:{ en: "Admin Dashboard",ar:"لوحة الإدارة",zh:"管理面板", es:"Panel de Admin",  hi:"एडमिन डैशबोर्ड" },
    profile:       { en: "Profile",      ar: "الملف الشخصي",zh: "个人资料",es: "Perfil",    hi: "प्रोफ़ाइल" },
    settings:      { en: "Settings",     ar: "الإعدادات",   zh: "设置",   es: "Configuración", hi: "सेटिंग्स" },
    orders:        { en: "Orders",       ar: "الطلبات",     zh: "订单",   es: "Pedidos",   hi: "आदेश" },
  },

  // ── Hero Section ──
  hero: {
    badge:       { en: "Premium Health & Wellness", ar: "صحة ورفاهية متميزة", zh: "优质健康与保健", es: "Salud y Bienestar Premium", hi: "प्रीमियम स्वास्थ्य और कल्याण" },
    titleLine1:  { en: "Your Journey to",           ar: "رحلتك نحو",           zh: "您通往",          es: "Tu Camino hacia",           hi: "आपकी यात्रा" },
    titleHighlight:{ en: "Optimal Health",          ar: "الصحة المثلى",        zh: "最佳健康",        es: "Salud Óptima",              hi: "इष्टतम स्वास्थ्य" },
    titleLine2:  { en: "Starts Here",               ar: "يبدأ هنا",             zh: "从这里开始",      es: "Comienza Aquí",             hi: "यहाँ से शुरू होती है" },
    tagline:     { en: "Discover personalized health products tailored to your unique needs through our intelligent health assessment.", ar: "اكتشف منتجات صحية مخصصة تناسب احتياجاتك الفريدة من خلال تقييمنا الصحي الذكي.", zh: "通过我们智能的健康评估，发现专为您独特需求定制的个性化健康产品。", es: "Descubre productos de salud personalizados adaptados a tus necesidades únicas a través de nuestra evaluación de salud inteligente.", hi: "हमारे बुद्धिमान स्वास्थ्य मूल्यांकन के माध्यम से अपनी अनूठी जरूरतों के अनुरूप व्यक्तिगत स्वास्थ्य उत्पाद खोजें।" },
    ctaSurvey:   { en: "Take Health Survey",        ar: "ابدأ الاستبيان الصحي", zh: "参加健康调查",    es: "Realizar Encuesta de Salud", hi: "स्वास्थ्य सर्वेक्षण लें" },
    ctaProducts: { en: "Browse Products",           ar: "تصفح المنتجات",        zh: "浏览产品",        es: "Ver Productos",              hi: "उत्पाद देखें" },
    stat1Label:  { en: "Trusted Customers",         ar: "عملاء موثوقون",        zh: "信赖客户",        es: "Clientes de Confianza",     hi: "विश्वसनीय ग्राहक" },
    stat2Label:  { en: "Premium Products",          ar: "منتجات متميزة",        zh: "优质产品",        es: "Productos Premium",         hi: "प्रीमियम उत्पाद" },
    stat3Label:  { en: "Satisfaction Rate",         ar: "معدل الرضا",           zh: "满意率",          es: "Tasa de Satisfacción",      hi: "संतुष्टि दर" },
    cardTitle:   { en: "Health Assessment",         ar: "التقييم الصحي",        zh: "健康评估",        es: "Evaluación de Salud",       hi: "स्वास्थ्य मूल्यांकन" },
    cardSub:     { en: "Personalized for you",      ar: "مخصص لك",              zh: "为您量身定制",    es: "Personalizado para ti",     hi: "आपके लिए व्यक्तिगत" },
    cardItem1:   { en: "Cardiovascular Health",     ar: "صحة القلب والأوعية",   zh: "心血管健康",      es: "Salud Cardiovascular",      hi: "हृदय स्वास्थ्य" },
    cardItem2:   { en: "Immune Support",            ar: "دعم المناعة",          zh: "免疫支持",        es: "Apoyo Inmunológico",        hi: "प्रतिरक्षा समर्थन" },
    cardItem3:   { en: "Energy & Vitality",         ar: "الطاقة والحيوية",      zh: "能量与活力",      es: "Energía y Vitalidad",       hi: "ऊर्जा और जीवन शक्ति" },
    cardItem4:   { en: "Sleep Quality",             ar: "جودة النوم",           zh: "睡眠质量",        es: "Calidad del Sueño",         hi: "नींद की गुणवत्ता" },
    scoreLabel:  { en: "Your Wellness Score",       ar: "نقاط صحتك",            zh: "您的健康评分",    es: "Tu Puntuación de Bienestar", hi: "आपका वेलनेस स्कोर" },
    scoreDesc:   { en: "Excellent health profile",  ar: "ملف صحي ممتاز",        zh: "优秀的健康状况",  es: "Perfil de salud excelente",  hi: "उत्कृष्ट स्वास्थ्य प्रोफ़ाइल" },
  },

  // ── Features Section ──
  features: {
    sectionTitle: { en: "Why Choose MCI Store",       ar: "لماذا تختار متجر MCI",    zh: "为什么选择MCI商店",    es: "Por Qué Elegir MCI Store",    hi: "MCI Store क्यों चुनें" },
    sectionSub:   { en: "Premium wellness, scientifically backed", ar: "رفاهية متميزة مدعومة علمياً", zh: "科学支持的优质健康", es: "Bienestar premium respaldado científicamente", hi: "वैज्ञानिक रूप से समर्थित प्रीमियम वेलनेस" },
    f1Title:      { en: "Personalized Health",        ar: "صحة مخصصة",               zh: "个性化健康",            es: "Salud Personalizada",         hi: "व्यक्तिगत स्वास्थ्य" },
    f1Desc:       { en: "Our intelligent survey maps your unique health profile to the right products.", ar: "يرسم استبياننا الذكي ملفك الصحي الفريد للمنتجات المناسبة.", zh: "我们的智能调查将您独特的健康状况与合适的产品相匹配。", es: "Nuestra encuesta inteligente mapea tu perfil de salud único a los productos correctos.", hi: "हमारा बुद्धिमान सर्वेक्षण आपकी अनूठी स्वास्थ्य प्रोफ़ाइल को सही उत्पादों से जोड़ता है।" },
    f2Title:      { en: "Natural Ingredients",        ar: "مكونات طبيعية",            zh: "天然成分",              es: "Ingredientes Naturales",      hi: "प्राकृतिक सामग्री" },
    f2Desc:       { en: "Premium supplements and wellness products crafted from nature's finest sources.", ar: "مكملات غذائية ومنتجات صحية متميزة مصنوعة من أجود مصادر الطبيعة.", zh: "由大自然最优质的原料精心制作的优质补充剂和健康产品。", es: "Suplementos premium y productos de bienestar elaborados con las mejores fuentes de la naturaleza.", hi: "प्रकृति के बेहतरीन स्रोतों से तैयार प्रीमियम सप्लीमेंट और वेलनेस उत्पाद।" },
    f3Title:      { en: "Quality Assured",            ar: "جودة مضمونة",              zh: "质量保证",              es: "Calidad Garantizada",         hi: "गुणवत्ता आश्वासन" },
    f3Desc:       { en: "Every product is rigorously tested and certified for safety and efficacy.", ar: "كل منتج يخضع لاختبارات صارمة ومعتمد للسلامة والفعالية.", zh: "每种产品都经过严格测试并获得安全性和有效性认证。", es: "Cada producto es rigurosamente probado y certificado por su seguridad y eficacia.", hi: "प्रत्येक उत्पाद सुरक्षा और प्रभावकारिता के लिए कठोरता से परीक्षण और प्रमाणित है।" },
    f4Title:      { en: "Premium Experience",         ar: "تجربة متميزة",             zh: "优质体验",              es: "Experiencia Premium",         hi: "प्रीमियम अनुभव" },
    f4Desc:       { en: "Curated wellness collections for those who demand the very best.", ar: "مجموعات صحية منتقاة لمن يطلبون الأفضل دائماً.", zh: "为追求卓越的人精心策划的健康系列。", es: "Colecciones de bienestar seleccionadas para quienes exigen lo mejor.", hi: "उन लोगों के लिए क्यूरेटेड वेलनेस कलेक्शन जो सर्वश्रेष्ठ की मांग करते हैं।" },
  },

  // ── Featured Products ──
  products: {
    sectionTitle: { en: "Featured Products",          ar: "المنتجات المميزة",         zh: "精选产品",              es: "Productos Destacados",        hi: "विशेष उत्पाद" },
    sectionSub:   { en: "Handpicked for your wellness journey", ar: "منتقاة بعناية لرحلتك الصحية", zh: "为您的健康之旅精心挑选", es: "Seleccionados a mano para tu viaje de bienestar", hi: "आपकी वेलनेस यात्रा के लिए हाथ से चुने गए" },
    viewAll:      { en: "View All Products",          ar: "عرض جميع المنتجات",        zh: "查看所有产品",          es: "Ver Todos los Productos",     hi: "सभी उत्पाद देखें" },
  },

  // ── How It Works ──
  howItWorks: {
    sectionTitle: { en: "How It Works",               ar: "كيف يعمل",                 zh: "如何运作",              es: "Cómo Funciona",               hi: "यह कैसे काम करता है" },
    sectionSub:   { en: "Three simple steps to your personalized wellness journey", ar: "ثلاث خطوات بسيطة لرحلتك الصحية المخصصة", zh: "三个简单步骤开启您的个性化健康之旅", es: "Tres simples pasos para tu viaje de bienestar personalizado", hi: "आपकी व्यक्तिगत वेलनेस यात्रा के लिए तीन सरल कदम" },
    step1Title:   { en: "Take the Survey",            ar: "أجب على الاستبيان",        zh: "参加调查",              es: "Realiza la Encuesta",         hi: "सर्वेक्षण लें" },
    step1Desc:    { en: "Answer questions about your health goals, lifestyle, and current concerns.", ar: "أجب على أسئلة حول أهدافك الصحية وأسلوب حياتك ومخاوفك الحالية.", zh: "回答有关您的健康目标、生活方式和当前关注点的问题。", es: "Responde preguntas sobre tus objetivos de salud, estilo de vida y preocupaciones actuales.", hi: "अपने स्वास्थ्य लक्ष्यों, जीवनशैली और वर्तमान चिंताओं के बारे में प्रश्नों के उत्तर दें।" },
    step2Title:   { en: "Get Recommendations",       ar: "احصل على توصيات",          zh: "获取推荐",              es: "Obtén Recomendaciones",       hi: "सिफारिशें प्राप्त करें" },
    step2Desc:    { en: "Our system analyzes your answers and curates the perfect product selection.", ar: "يحلل نظامنا إجاباتك ويختار لك المنتجات المثالية.", zh: "我们的系统分析您的答案并精心策划完美的产品选择。", es: "Nuestro sistema analiza tus respuestas y selecciona la combinación perfecta de productos.", hi: "हमारा सिस्टम आपके उत्तरों का विश्लेषण करता है और सही उत्पाद चयन तैयार करता है।" },
    step3Title:   { en: "Order & Transform",         ar: "اطلب وتحول",               zh: "订购并蜕变",            es: "Ordena y Transforma",         hi: "ऑर्डर करें और बदलें" },
    step3Desc:    { en: "Choose your products, complete checkout, and begin your health transformation.", ar: "اختر منتجاتك وأكمل الدفع وابدأ تحولك الصحي.", zh: "选择您的产品，完成结账，开始您的健康蜕变。", es: "Elige tus productos, completa el pago y comienza tu transformación de salud.", hi: "अपने उत्पाद चुनें, चेकआउट पूरा करें, और अपना स्वास्थ्य परिवर्तन शुरू करें।" },
    beginJourney: { en: "Begin Your Journey",        ar: "ابدأ رحلتك",               zh: "开始您的旅程",          es: "Comienza Tu Viaje",           hi: "अपनी यात्रा शुरू करें" },
  },

  // ── Testimonials ──
  testimonials: {
    sectionTitle: { en: "What Our Customers Say",    ar: "ماذا يقول عملاؤنا",        zh: "客户评价",              es: "Lo Que Dicen Nuestros Clientes", hi: "हमारे ग्राहक क्या कहते हैं" },
    t1Text:       { en: "The health survey was incredibly insightful. The recommended products have transformed my daily routine.", ar: "كان الاستبيان الصحي مفيداً للغاية. المنتجات الموصى بها غيّرت روتيني اليومي.", zh: "健康调查非常有见地。推荐的产品改变了我的日常生活。", es: "La encuesta de salud fue increíblemente perspicaz. Los productos recomendados han transformado mi rutina diaria.", hi: "स्वास्थ्य सर्वेक्षण अविश्वसनीय रूप से जानकारीपूर्ण था। अनुशंसित उत्पादों ने मेरी दैनिक दिनचर्या को बदल दिया।" },
    t1Role:       { en: "Wellness Enthusiast",       ar: "متحمس للصحة",              zh: "健康爱好者",            es: "Entusiasta del Bienestar",    hi: "वेलनेस उत्साही" },
    t2Text:       { en: "Finally, a health brand that understands my specific needs. The premium collection is exceptional.", ar: "أخيراً، علامة تجارية صحية تفهم احتياجاتي المحددة. المجموعة المتميزة استثنائية.", zh: "终于找到了一个了解我特定需求的健康品牌。高端系列非常出色。", es: "Por fin, una marca de salud que entiende mis necesidades específicas. La colección premium es excepcional.", hi: "आखिरकार, एक स्वास्थ्य ब्रांड जो मेरी विशिष्ट जरूरतों को समझता है। प्रीमियम कलेक्शन असाधारण है।" },
    t2Role:       { en: "Executive",                 ar: "مدير تنفيذي",              zh: "高管",                  es: "Ejecutivo",                   hi: "कार्यकारी" },
    t3Text:       { en: "I recommend MCI Store to all my clients. The personalized approach makes all the difference.", ar: "أوصي بمتجر MCI لجميع عملائي. النهج الشخصي يصنع كل الفرق.", zh: "我向所有客户推荐MCI商店。个性化方法让一切与众不同。", es: "Recomiendo MCI Store a todos mis clientes. El enfoque personalizado marca toda la diferencia.", hi: "मैं अपने सभी ग्राहकों को MCI Store की सिफारिश करता हूं। व्यक्तिगत दृष्टिकोण सब कुछ बदल देता है।" },
    t3Role:       { en: "Fitness Coach",             ar: "مدرب لياقة بدنية",         zh: "健身教练",              es: "Entrenador de Fitness",       hi: "फिटनेस कोच" },
  },

  // ── Final CTA ──
  cta: {
    title:    { en: "Ready to Transform Your Health?",  ar: "هل أنت مستعد لتحويل صحتك؟",  zh: "准备好改变您的健康了吗？",  es: "¿Listo para Transformar Tu Salud?",  hi: "अपने स्वास्थ्य को बदलने के लिए तैयार हैं?" },
    subtitle: { en: "Join thousands of customers who have discovered their perfect wellness routine with MCI Store.", ar: "انضم إلى آلاف العملاء الذين اكتشفوا روتينهم الصحي المثالي مع متجر MCI.", zh: "加入数千名已通过MCI商店发现完美健康方案的客户。", es: "Únete a miles de clientes que han descubierto su rutina de bienestar perfecta con MCI Store.", hi: "हजारों ग्राहकों से जुड़ें जिन्होंने MCI Store के साथ अपनी परफेक्ट वेलनेस रूटीन खोजी है।" },
    cta:      { en: "Start Your Assessment",            ar: "ابدأ تقييمك",                  zh: "开始您的评估",              es: "Comienza Tu Evaluación",             hi: "अपना मूल्यांकन शुरू करें" },
  },

  // ── Chatbot ──
  chatbot: {
    headerTitle:    { en: "MCI Health Advisor",       ar: "مستشار صحة MCI",           zh: "MCI健康顾问",           es: "Asesor de Salud MCI",         hi: "MCI स्वास्थ्य सलाहकार" },
    headerStatus:   { en: "Online · AI-powered",      ar: "متصل · مدعوم بالذكاء الاصطناعي", zh: "在线 · AI驱动",       es: "En línea · Impulsado por IA", hi: "ऑनलाइन · AI-संचालित" },
    placeholder:    { en: "Type a message...",        ar: "اكتب رسالة...",            zh: "输入消息...",           es: "Escribe un mensaje...",       hi: "संदेश लिखें..." },
    quickTrackOrder:{ en: "Track my order",           ar: "تتبع طلبي",                zh: "追踪我的订单",          es: "Rastrear mi pedido",          hi: "मेरा ऑर्डर ट्रैक करें" },
    quickBookMeeting:{en: "Book a meeting",           ar: "حجز اجتماع",               zh: "预约会议",              es: "Reservar una reunión",        hi: "मीटिंग बुक करें" },
    quickProductInfo:{en: "Product info",             ar: "معلومات المنتج",           zh: "产品信息",              es: "Info de producto",            hi: "उत्पाद जानकारी" },
    welcomeMsg:     {
      en: (name?: string) => `Hello${name ? ` ${name}` : ""}! 👋 I'm your MCI Store health advisor assistant.\n\nI can help you with:\n- 📦 **Tracking your orders**\n- 📅 **Booking a consultation meeting**\n- 💊 **Product recommendations & info**\n\nHow can I assist you today?`,
      ar: (name?: string) => `مرحباً${name ? ` ${name}` : ""}! 👋 أنا مساعدك الصحي في متجر MCI.\n\nيمكنني مساعدتك في:\n- 📦 **تتبع طلباتك**\n- 📅 **حجز اجتماع استشاري**\n- 💊 **توصيات المنتجات ومعلوماتها**\n\nكيف يمكنني مساعدتك اليوم؟`,
      zh: (name?: string) => `您好${name ? ` ${name}` : ""}！👋 我是您的MCI商店健康顾问助手。\n\n我可以帮助您：\n- 📦 **追踪您的订单**\n- 📅 **预约咨询会议**\n- 💊 **产品推荐与信息**\n\n今天我能为您做什么？`,
      es: (name?: string) => `¡Hola${name ? ` ${name}` : ""}! 👋 Soy tu asistente asesor de salud de MCI Store.\n\nPuedo ayudarte con:\n- 📦 **Rastrear tus pedidos**\n- 📅 **Reservar una reunión de consulta**\n- 💊 **Recomendaciones e información de productos**\n\n¿Cómo puedo ayudarte hoy?`,
      hi: (name?: string) => `नमस्ते${name ? ` ${name}` : ""}! 👋 मैं आपका MCI Store स्वास्थ्य सलाहकार सहायक हूं।\n\nमैं आपकी मदद कर सकता हूं:\n- 📦 **आपके ऑर्डर ट्रैक करना**\n- 📅 **परामर्श मीटिंग बुक करना**\n- 💊 **उत्पाद सिफारिशें और जानकारी**\n\nआज मैं आपकी कैसे सहायता कर सकता हूं?`,
    },
    quickTrackMsg:  {
      en: "I want to track my order",
      ar: "أريد تتبع طلبي",
      zh: "我想追踪我的订单",
      es: "Quiero rastrear mi pedido",
      hi: "मैं अपना ऑर्डर ट्रैक करना चाहता हूं",
    },
    quickBookMsg:   {
      en: "I'd like to book a consultation meeting",
      ar: "أود حجز اجتماع استشاري",
      zh: "我想预约一次咨询会议",
      es: "Me gustaría reservar una reunión de consulta",
      hi: "मैं एक परामर्श मीटिंग बुक करना चाहता हूं",
    },
    quickProductMsg:{
      en: "Tell me about your health products",
      ar: "أخبرني عن منتجاتكم الصحية",
      zh: "请告诉我你们的健康产品",
      es: "Cuéntame sobre tus productos de salud",
      hi: "मुझे अपने स्वास्थ्य उत्पादों के बारे में बताएं",
    },
    slotsAvailable: {
      en: (n: number) => `${n} meeting slot${n !== 1 ? "s" : ""} available`,
      ar: (n: number) => `${n} موعد${n !== 1 ? " متاح" : " متاح"}`,
      zh: (n: number) => `${n} 个会议时段可用`,
      es: (n: number) => `${n} horario${n !== 1 ? "s" : ""} disponible${n !== 1 ? "s" : ""}`,
      hi: (n: number) => `${n} मीटिंग स्लॉट उपलब्ध`,
    },
    bookMeeting:    { en: "Book a Meeting",           ar: "احجز اجتماعاً",            zh: "预约会议",              es: "Reservar Reunión",            hi: "मीटिंग बुक करें" },
    selectSlot:     { en: "Select a time slot:",      ar: "اختر موعداً:",             zh: "选择时间段：",          es: "Selecciona un horario:",      hi: "समय स्लॉट चुनें:" },
    yourName:       { en: "Your name",                ar: "اسمك",                     zh: "您的姓名",              es: "Tu nombre",                   hi: "आपका नाम" },
    emailAddress:   { en: "Email address",            ar: "البريد الإلكتروني",        zh: "电子邮件地址",          es: "Dirección de correo",         hi: "ईमेल पता" },
    phoneOptional:  { en: "Phone (optional)",         ar: "الهاتف (اختياري)",         zh: "电话（可选）",          es: "Teléfono (opcional)",         hi: "फ़ोन (वैकल्पिक)" },
    confirmBooking: { en: "Confirm Booking",          ar: "تأكيد الحجز",              zh: "确认预约",              es: "Confirmar Reserva",           hi: "बुकिंग की पुष्टि करें" },
    cancel:         { en: "Cancel",                   ar: "إلغاء",                    zh: "取消",                  es: "Cancelar",                    hi: "रद्द करें" },
    languageLabel:  { en: "Language",                 ar: "اللغة",                    zh: "语言",                  es: "Idioma",                      hi: "भाषा" },
  },

  // ── Products Page ──
  productsPage: {
    title:          { en: "Our Products",                  ar: "منتجاتنا",                  zh: "我们的产品",            es: "Nuestros Productos",          hi: "हमारे उत्पाद" },
    subtitle:       { en: "Discover our curated collection of premium health and wellness products.", ar: "اكتشف مجموعتنا المنتقاة من منتجات الصحة والعافية المتميزة.", zh: "探索我们精心策划的优质健康与保健产品系列。", es: "Descubre nuestra colección seleccionada de productos premium de salud y bienestar.", hi: "हमारे प्रीमियम स्वास्थ्य और वेलनेस उत्पादों के क्यूरेटेड संग्रह की खोज करें।" },
    searchPlaceholder: { en: "Search products...",        ar: "ابحث عن المنتجات...",        zh: "搜索产品...",            es: "Buscar productos...",          hi: "उत्पाद खोजें..." },
    categoryPlaceholder: { en: "Category",               ar: "الفئة",                     zh: "类别",                  es: "Categoría",                   hi: "श्रेणी" },
    allCategories:  { en: "All Categories",              ar: "جميع الفئات",               zh: "所有类别",              es: "Todas las Categorías",        hi: "सभी श्रेणियां" },
    noProducts:     { en: "No products found matching your criteria.", ar: "لم يتم العثور على منتجات تطابق معاييرك.", zh: "未找到符合您条件的产品。", es: "No se encontraron productos que coincidan con sus criterios.", hi: "आपके मानदंड से मेल खाने वाले कोई उत्पाद नहीं मिले।" },
    viewProduct:    { en: "View →",                      ar: "عرض ←",                     zh: "查看 →",                es: "Ver →",                        hi: "देखें →" },
    backToHome:     { en: "Back to Home",                ar: "العودة للرئيسية",           zh: "返回首页",              es: "Volver al Inicio",            hi: "होम पर वापस" },
  },

  // ── Survey Page ──
  surveyPage: {
    loading:           { en: "Loading survey...",          ar: "جارٍ تحميل الاستبيان...",  zh: "正在加载调查...",       es: "Cargando encuesta...",         hi: "सर्वेक्षण लोड हो रहा है..." },
    comingSoonTitle:   { en: "Survey Coming Soon",         ar: "الاستبيان قادم قريباً",    zh: "调查即将推出",          es: "Encuesta Próximamente",        hi: "सर्वेक्षण जल्द आ रहा है" },
    comingSoonDesc:    { en: "Our health assessment is being prepared. Please check back soon.", ar: "يتم إعداد تقييمنا الصحي. يرجى المراجعة قريباً.", zh: "我们的健康评估正在准备中，请稍后再来。", es: "Nuestra evaluación de salud está siendo preparada. Por favor, vuelve pronto.", hi: "हमारा स्वास्थ्य मूल्यांकन तैयार किया जा रहा है। कृपया जल्द वापस देखें।" },
    completeTitle:     { en: "Assessment Complete",        ar: "اكتمل التقييم",             zh: "评估完成",              es: "Evaluación Completa",          hi: "मूल्यांकन पूर्ण" },
    completeDesc:      { en: "Thank you for completing your health assessment. We've identified your wellness profile and curated the perfect products for you.", ar: "شكراً لإكمال تقييمك الصحي. لقد حددنا ملفك الصحي واخترنا المنتجات المثالية لك.", zh: "感谢您完成健康评估。我们已确定您的健康档案并为您精心挑选了完美的产品。", es: "Gracias por completar tu evaluación de salud. Hemos identificado tu perfil de bienestar y seleccionado los productos perfectos para ti.", hi: "अपना स्वास्थ्य मूल्यांकन पूरा करने के लिए धन्यवाद। हमने आपकी वेलनेस प्रोफ़ाइल की पहचान की है और आपके लिए सही उत्पाद चुने हैं।" },
    viewRecommendations: { en: "View My Recommendations", ar: "عرض توصياتي",              zh: "查看我的推荐",          es: "Ver Mis Recomendaciones",      hi: "मेरी सिफारिशें देखें" },
    question:          { en: "Question",                  ar: "سؤال",                     zh: "问题",                  es: "Pregunta",                     hi: "प्रश्न" },
    of:                { en: "of",                        ar: "من",                      zh: "共",                   es: "de",                          hi: "में से" },
    shareThoughts:     { en: "Share your thoughts...",    ar: "شارك أفكارك...",           zh: "分享您的想法...",       es: "Comparte tus pensamientos...", hi: "अपने विचार साझा करें..." },
    scaleMin:          { en: "1 — Not at all",            ar: "1 — ليس على الإطلاق",     zh: "1 — 完全没有",          es: "1 — Para nada",               hi: "1 — बिल्कुल नहीं" },
    scaleMax:          { en: "10 — Extremely",            ar: "10 — بشكل كبير جداً",     zh: "10 — 非常",             es: "10 — Extremadamente",         hi: "10 — अत्यधिक" },
    previous:          { en: "Previous",                  ar: "السابق",                   zh: "上一步",                es: "Anterior",                     hi: "पिछला" },
    continue:          { en: "Continue",                  ar: "متابعة",                   zh: "继续",                  es: "Continuar",                    hi: "जारी रखें" },
    completeAssessment:{ en: "Complete Assessment",       ar: "إكمال التقييم",             zh: "完成评估",              es: "Completar Evaluación",         hi: "मूल्यांकन पूर्ण करें" },
    stepOf:            { en: "Step",                      ar: "خطوة",                     zh: "步骤",                  es: "Paso",                         hi: "चरण" },
  },

  // ── Recommendations Page ──
  recommendationsPage: {
    yourProfile:      { en: "Your Profile",                   ar: "ملفك الشخصي",                zh: "您的档案",              es: "Tu Perfil",                    hi: "आपकी प्रोफ़ाइल" },
    personalizedTitle:{ en: "Your Personalized Recommendations", ar: "توصياتك المخصصة",          zh: "您的个性化推荐",        es: "Tus Recomendaciones Personalizadas", hi: "आपकी व्यक्तिगत सिफारिशें" },
    signInPrompt:     { en: "Sign in to unlock premium products", ar: "سجّل دخولك للوصول إلى المنتجات المتميزة", zh: "登录以解锁高级产品", es: "Inicia sesión para desbloquear productos premium", hi: "प्रीमियम उत्पाद अनलॉक करने के लिए साइन इन करें" },
    signInSub:        { en: "Create an account to access your full personalized catalog and save your cart.", ar: "أنشئ حساباً للوصول إلى كتالوجك الكامل وحفظ سلة التسوق.", zh: "创建账户以访问您的完整个性化目录并保存购物车。", es: "Crea una cuenta para acceder a tu catálogo personalizado completo y guardar tu carrito.", hi: "अपने पूर्ण व्यक्तिगत कैटलॉग तक पहुंचने और कार्ट सहेजने के लिए खाता बनाएं।" },
    signIn:           { en: "Sign In",                         ar: "تسجيل الدخول",               zh: "登录",                  es: "Iniciar Sesión",               hi: "साइन इन" },
    noProducts:       { en: "No products available yet",       ar: "لا توجد منتجات متاحة بعد",  zh: "暂无可用产品",          es: "No hay productos disponibles aún", hi: "अभी कोई उत्पाद उपलब्ध नहीं" },
    noProductsSub:    { en: "Products are being curated for your profile. Check back soon.", ar: "يتم اختيار المنتجات لملفك الشخصي. تحقق قريباً.", zh: "正在为您的档案精选产品，请稍后再来。", es: "Se están seleccionando productos para tu perfil. Vuelve pronto.", hi: "आपकी प्रोफ़ाइल के लिए उत्पाद तैयार किए जा रहे हैं। जल्द वापस देखें।" },
    productsCount:    { en: "products recommended for you",   ar: "منتجات موصى بها لك",        zh: "款推荐产品",            es: "productos recomendados para ti", hi: "उत्पाद आपके लिए अनुशंसित" },
    productCount1:    { en: "product recommended for you",    ar: "منتج موصى به لك",           zh: "款推荐产品",            es: "producto recomendado para ti", hi: "उत्पाद आपके लिए अनुशंसित" },
    checkout:         { en: "Checkout",                        ar: "الدفع",                     zh: "结账",                  es: "Pagar",                        hi: "चेकआउट" },
    addToCart:        { en: "Add to Cart",                     ar: "أضف إلى السلة",             zh: "加入购物车",            es: "Agregar al Carrito",           hi: "कार्ट में जोड़ें" },
    addedToCart:      { en: "Added to Cart",                   ar: "تمت الإضافة إلى السلة",     zh: "已加入购物车",          es: "Agregado al Carrito",          hi: "कार्ट में जोड़ा गया" },
    inStock:          { en: "In Stock",                        ar: "متوفر",                     zh: "有货",                  es: "En Stock",                     hi: "स्टॉक में" },
    outOfStock:       { en: "Out of Stock",                    ar: "نفذ المخزون",               zh: "缺货",                  es: "Agotado",                      hi: "स्टॉक से बाहर" },
    featured:         { en: "Featured",                        ar: "مميز",                      zh: "精选",                  es: "Destacado",                    hi: "विशेष" },
    itemsSelected:    { en: "items selected",                  ar: "عناصر محددة",               zh: "件已选",                es: "artículos seleccionados",      hi: "आइटम चुने गए" },
    itemSelected:     { en: "item selected",                   ar: "عنصر محدد",                 zh: "件已选",                es: "artículo seleccionado",        hi: "आइटम चुना गया" },
    proceedToCheckout:{ en: "Proceed to Checkout",             ar: "المتابعة للدفع",             zh: "前往结账",              es: "Proceder al Pago",             hi: "चेकआउट पर जाएं" },
    segmentStandard:  { en: "Wellness Starter",                ar: "مبتدئ الصحة",               zh: "健康入门",              es: "Inicio de Bienestar",          hi: "वेलनेस स्टार्टर" },
    segmentPremium:   { en: "Premium Wellness",                ar: "صحة متميزة",                zh: "高级健康",              es: "Bienestar Premium",            hi: "प्रीमियम वेलनेस" },
    segmentVip:       { en: "Elite Health",                    ar: "صحة النخبة",                zh: "精英健康",              es: "Salud Elite",                  hi: "एलीट हेल्थ" },
    segmentStandardDesc: { en: "Essential health products to begin your wellness journey.", ar: "منتجات صحية أساسية لبدء رحلتك الصحية.", zh: "开始您健康之旅的基本健康产品。", es: "Productos de salud esenciales para comenzar tu viaje de bienestar.", hi: "आपकी वेलनेस यात्रा शुरू करने के लिए आवश्यक स्वास्थ्य उत्पाद।" },
    segmentPremiumDesc:  { en: "Advanced health solutions for those seeking superior results.", ar: "حلول صحية متقدمة لمن يسعى إلى نتائج متفوقة.", zh: "为追求卓越效果的人提供先进的健康解决方案。", es: "Soluciones de salud avanzadas para quienes buscan resultados superiores.", hi: "बेहतर परिणाम चाहने वालों के लिए उन्नत स्वास्थ्य समाधान।" },
    segmentVipDesc:      { en: "Exclusive, top-tier products for the most discerning health enthusiasts.", ar: "منتجات حصرية من الدرجة الأولى لأكثر المهتمين بالصحة تمييزاً.", zh: "为最挑剔的健康爱好者提供独家顶级产品。", es: "Productos exclusivos de primer nivel para los entusiastas de la salud más exigentes.", hi: "सबसे विवेकशील स्वास्थ्य उत्साही लोगों के लिए विशेष, शीर्ष स्तरीय उत्पाद।" },
  },

  // ── My Orders Page ──
  myOrdersPage: {
    signInRequired:   { en: "Sign In Required",               ar: "تسجيل الدخول مطلوب",        zh: "需要登录",              es: "Inicio de Sesión Requerido",   hi: "साइन इन आवश्यक" },
    signInDesc:       { en: "Please sign in to view your orders.", ar: "يرجى تسجيل الدخول لعرض طلباتك.", zh: "请登录以查看您的订单。", es: "Por favor inicia sesión para ver tus pedidos.", hi: "अपने ऑर्डर देखने के लिए कृपया साइन इन करें।" },
    signIn:           { en: "Sign In",                         ar: "تسجيل الدخول",               zh: "登录",                  es: "Iniciar Sesión",               hi: "साइन इन" },
    title:            { en: "My Orders",                       ar: "طلباتي",                    zh: "我的订单",              es: "Mis Pedidos",                  hi: "मेरे ऑर्डर" },
    noOrders:         { en: "No orders yet",                   ar: "لا توجد طلبات بعد",          zh: "暂无订单",              es: "Sin pedidos aún",              hi: "अभी कोई ऑर्डर नहीं" },
    noOrdersSub:      { en: "Start your wellness journey today.", ar: "ابدأ رحلتك الصحية اليوم.", zh: "今天开始您的健康之旅。", es: "Comienza tu viaje de bienestar hoy.", hi: "आज अपनी वेलनेस यात्रा शुरू करें।" },
    takeHealthSurvey: { en: "Take Health Survey",              ar: "ابدأ الاستبيان الصحي",       zh: "参加健康调查",          es: "Realizar Encuesta de Salud",   hi: "स्वास्थ्य सर्वेक्षण लें" },
  },
} as const;

// ─── Helper to get a translation ─────────────────────────────────────────────
export function t(
  key: Record<Language, string>,
  lang: Language
): string {
  return key[lang] ?? key["en"];
}
