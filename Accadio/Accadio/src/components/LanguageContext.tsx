"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "es" | "fil" | "si" | "ta" | "hi";

export const languageOptions: Array<{ code: Language; label: string; shortLabel: string }> = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "es", label: "Español", shortLabel: "ES" },
  { code: "fil", label: "Filipino", shortLabel: "FIL" },
  { code: "si", label: "සිංහල", shortLabel: "SI" },
  { code: "ta", label: "தமிழ்", shortLabel: "TA" },
  { code: "hi", label: "हिन्दी", shortLabel: "HI" },
];

const STORAGE_KEY = "meru-lang";

function isValidLanguage(value: string | null): value is Language {
  return value !== null && languageOptions.some((option) => option.code === value);
}

interface TranslationDictionary {
  [key: string]: {
    en: string;
    es: string;
  };
}

const translations: TranslationDictionary = {
  // Navigation
  "nav.home": { en: "Home", es: "Inicio" },
  "nav.about": { en: "About Us", es: "Nosotros" },
  "nav.programs": { en: "Programs", es: "Programas" },
  "nav.history": { en: "Our History", es: "Nuestra Historia" },
  "nav.testimonials": { en: "Testimonials", es: "Testimonios" },
  "nav.news": { en: "News & Events", es: "Noticias y Eventos" },
  "nav.contact": { en: "Contact Us", es: "Contacto" },
  "nav.search": { en: "Search...", es: "Buscar..." },
  "nav.searchPlaceholder": { en: "Search programs, news, milestones...", es: "Buscar programas, noticias, hitos..." },

  // Hero Section
  "hero.tagline": {
    en: "Connecting Global Opportunities Through Excellence",
    es: "Conectando Oportunidades Globales a Través de la Excelencia",
  },
  "hero.intro": {
    en: "Meru Global Team is dedicated to reaching the unreached. Through cross-border initiatives, corporate excellence development, and global leadership programs, we bridge gaps and foster sustainable progress across communities worldwide.",
    es: "Meru Global Team se dedica a llegar a quienes no han sido alcanzados. A través de iniciativas transfronterizas, desarrollo de excelencia corporativa y programas de liderazgo global, cerramos brechas y fomentamos el progreso sostenible.",
  },
  "hero.ctaPrimary": { en: "Explore Our Programs", es: "Explorar Programas" },
  "hero.ctaSecondary": { en: "Contact Us", es: "Contáctanos" },

  // News Ticker
  "ticker.title": { en: "LATEST UPDATES", es: "ÚLTIMAS NOTICIAS" },
  "ticker.item1": {
    en: "Meru expands footprint to South America with new regional offices in Bogota.",
    es: "Meru expande su presencia en Sudamérica con nuevas oficinas regionales en Bogotá.",
  },
  "ticker.item2": {
    en: "Global Youth Leadership Summit 2026 registration is now officially open.",
    es: "Ya está abierta oficialmente la inscripción para la Cumbre Global de Liderazgo Juvenil 2026.",
  },
  "ticker.item3": {
    en: "Corporate Excellence Program achieves milestone of training 50,000+ professionals.",
    es: "El Programa de Excelencia Corporativa logra el hito de capacitar a más de 50,000 profesionales.",
  },
  "ticker.item4": {
    en: "Partnered with 12 new European academic organizations for global exchanges.",
    es: "Asociados con 12 nuevas organizaciones académicas europeas para intercambios globales.",
  },

  // About Section
  "about.title": { en: "Who We Are", es: "Quiénes Somos" },
  "about.overview": {
    en: "The MERU Global Team is committed to carrying Christ's name into places where He is yet unknown. Our focus is on building strong foundations in the Word of God, equipping believers to live out their faith and share the Gospel across nations. By connecting people worldwide to the Great Commission, MERU empowers Christians of every generation in their faith and to become witnesses of Christ's love in communities that remain unreached.",
    es: "El Equipo Global MERU está comprometido a llevar el nombre de Cristo a los lugares donde aún es desconocido. Nos enfocamos en edificar fundamentos sólidos en la Palabra de Dios, equipando a los creyentes para vivir su fe y compartir el Evangelio entre las naciones. Al conectar a personas de todo el mundo con la Gran Comisión, MERU fortalece a los cristianos de cada generación para ser testigos del amor de Cristo en comunidades que aún no han sido alcanzadas.",
  },
  "about.mission": { en: "Our Mission", es: "Nuestra Misión" },
  "about.missionText": {
    en: "Strengthening Christians on the foundation of biblical truth and empowering them to reach the unreached.",
    es: "Fortalecer a los cristianos sobre el fundamento de la verdad bíblica y empoderarlos para alcanzar a quienes aún no han sido alcanzados.",
  },
  "about.vision": { en: "Our Vision", es: "Nuestra Visión" },
  "about.visionText": {
    en: "To see that every Christian becomes solidly based on the truth of the Bible and be a testimony to all nations.",
    es: "Ver que cada cristiano esté sólidamente fundamentado en la verdad de la Biblia y sea un testimonio para todas las naciones.",
  },
  "about.values": { en: "Core Values", es: "Valores Fundamentales" },
  "about.val1Title": { en: "Faith", es: "Fe" },
  "about.val1Desc": { en: "We walk in trust and obedience to God's voice, relying on His Word as the foundation for every aspect of our lives.", es: "Caminamos en confianza y obediencia a la voz de Dios, dependiendo de Su Palabra como fundamento de cada aspecto de nuestras vidas." },
  "about.val2Title": { en: "Service", es: "Servicio" },
  "about.val2Desc": { en: "We serve with humility and compassion, meeting both spiritual and practical needs in communities.", es: "Servimos con humildad y compasión, atendiendo tanto las necesidades espirituales como las prácticas en las comunidades." },
  "about.val3Title": { en: "Unity", es: "Unidad" },
  "about.val3Desc": { en: "We connect generations and cultures, working together as one body to fulfill the Great Commission.", es: "Conectamos generaciones y culturas, trabajando juntos como un solo cuerpo para cumplir la Gran Comisión." },
  "about.val4Title": { en: "Impact", es: "Impacto" },
  "about.val4Desc": { en: "We aim for lasting transformation, ensuring that lives and communities are strengthened by the Word of God.", es: "Buscamos una transformación duradera, asegurando que las vidas y las comunidades sean fortalecidas por la Palabra de Dios." },

  // Stats Counters
  "stats.countries": { en: "Countries Served", es: "Países Atendidos" },
  "stats.programs": { en: "Programs Conducted", es: "Programas Realizados" },
  "stats.partners": { en: "Global Partners", es: "Socios Globales" },
  "stats.team": { en: "Team Members", es: "Miembros del Equipo" },

  // Featured Programs
  "programs.featuredTitle": { en: "Featured Programs", es: "Programas Destacados" },
  "programs.featuredSubtitle": {
    en: "Transformative global initiatives designed to elevate capabilities and open international horizons.",
    es: "Iniciativas globales transformadoras diseñadas para elevar capacidades y abrir horizontes internacionales.",
  },
  "programs.learnMore": { en: "Learn More", es: "Saber Más" },
  "programs.category": { en: "Category", es: "Categoría" },
  "programs.eligibility": { en: "Eligibility", es: "Elegibilidad" },
  "programs.benefits": { en: "Benefits & Outcomes", es: "Beneficios y Resultados" },
  "programs.register": { en: "Register Now", es: "Registrarse Ahora" },
  "programs.downloadBrochure": { en: "Download Brochure", es: "Descargar Folleto" },

  // Testimonials
  "testimonials.title": { en: "What Our Community Says", es: "Lo Que Dice Nuestra Comunidad" },
  "testimonials.subtitle": {
    en: "Real feedback from participants, partners, and institutions we have served worldwide.",
    es: "Comentarios reales de participantes, socios e instituciones que hemos servido en todo el mundo.",
  },

  // Contact US Quick/Advanced
  "contact.title": { en: "Get In Touch", es: "Ponte en Contacto" },
  "contact.subtitle": { en: "Have questions? Fill out the form or reach out via WhatsApp.", es: "¿Tienes preguntas? Llena el formulario o contáctanos por WhatsApp." },
  "contact.name": { en: "Full Name", es: "Nombre Completo" },
  "contact.email": { en: "Email Address", es: "Correo Electrónico" },
  "contact.phone": { en: "Phone Number", es: "Número de Teléfono" },
  "contact.department": { en: "Department Inquiry", es: "Departamento de Consulta" },
  "contact.dept1": { en: "General Inquiries", es: "Consultas Generales" },
  "contact.dept2": { en: "Program Admissions", es: "Admisiones de Programas" },
  "contact.dept3": { en: "Partnerships & Press", es: "Alianzas y Prensa" },
  "contact.dept4": { en: "Technical Support", es: "Soporte Técnico" },
  "contact.message": { en: "Your Message", es: "Tu Mensaje" },
  "contact.submit": { en: "Send Message", es: "Enviar Mensaje" },
  "contact.success": { en: "Thank you! Your message has been sent successfully.", es: "¡Gracias! Tu mensaje ha sido enviado con éxito." },
  "contact.whatsapp": { en: "Chat on WhatsApp", es: "Chatear por WhatsApp" },
  "contact.offices": { en: "Global Office Locations", es: "Oficinas Globales" },
};

const supplementalTranslations: Record<string, Partial<Record<Language, string>>> = {
  "nav.home": { fil: "Home", si: "මුල් පිටුව", ta: "முகப்பு", hi: "होम" },
  "nav.about": { fil: "Tungkol Sa Amin", si: "අප ගැන", ta: "எங்களைப் பற்றி", hi: "हमारे बारे में" },
  "nav.programs": { fil: "Mga Programa", si: "වැඩසටහන්", ta: "நிகழ்ச்சிகள்", hi: "कार्यक्रम" },
  "nav.history": { fil: "Aming Kasaysayan", si: "අපගේ ඉතිහාසය", ta: "எங்கள் வரலாறு", hi: "हमारा इतिहास" },
  "nav.testimonials": { fil: "Mga Patotoo", si: "අදහස්", ta: "சான்றுகள்", hi: "प्रशंसापत्र" },
  "nav.news": { fil: "Balita at Kaganapan", si: "පුවත් සහ උත්සව", ta: "செய்திகள் & நிகழ்வுகள்", hi: "समाचार और कार्यक्रम" },
  "nav.contact": { fil: "Makipag-ugnayan", si: "අමතන්න", ta: "தொடர்பு கொள்ளுங்கள்", hi: "संपर्क करें" },
  "nav.search": { fil: "Maghanap...", si: "සොයන්න...", ta: "தேடு...", hi: "खोजें..." },
  "nav.searchPlaceholder": {
    fil: "Maghanap ng mga programa, balita, milestone...",
    si: "වැඩසටහන්, පුවත්, සන්ධිස්ථාන සොයන්න...",
    ta: "நிகழ்ச்சிகள், செய்திகள், மைல்கற்கள் தேடுங்கள்...",
    hi: "कार्यक्रम, समाचार और उपलब्धियां खोजें...",
  },
  "hero.tagline": {
    fil: "Iniuugnay ang Pandaigdigang Oportunidad sa Pamamagitan ng Kahusayan",
    si: "විශිෂ්ටත්වය හරහා ගෝලීය අවස්ථා සම්බන්ධ කිරීම",
    ta: "சிறப்பின் மூலம் உலகளாவிய வாய்ப்புகளை இணைத்தல்",
    hi: "उत्कृष्टता के माध्यम से वैश्विक अवसरों को जोड़ना",
  },
  "hero.intro": {
    fil: "Ang Meru Global Team ay nakatuon sa pag-abot sa mga hindi pa naaabot. Sa pamamagitan ng pandaigdigang inisyatiba, corporate excellence development, at leadership programs, pinagtutulay namin ang mga puwang at itinataguyod ang sustenableng pag-unlad.",
    si: "Meru Global Team නොපැමිණි අයට ළඟා වීමට කැපවී සිටී. දේශසීමා ඉක්මවන වැඩසටහන්, ආයතනික විශිෂ්ටතා සංවර්ධනය සහ ගෝලීය නායකත්ව වැඩසටහන් හරහා අපි හිඩැස් පුරවා තිරසාර ප්‍රගතිය ගොඩනඟමු.",
    ta: "Meru Global Team எட்டப்படாதவர்களை அடைவதில் அர்ப்பணிப்புடன் உள்ளது. எல்லை கடந்த முயற்சிகள், கார்ப்பரேட் சிறப்பு மேம்பாடு மற்றும் உலகளாவிய தலைமைத் திட்டங்கள் மூலம் இடைவெளிகளை நிரப்பி, உலகெங்கிலும் உள்ள சமூகங்களில் நிலையான முன்னேற்றத்தை ஊக்குவிக்கிறோம்.",
    hi: "Meru Global Team उन लोगों तक पहुंचने के लिए समर्पित है जिन तक अवसर अभी नहीं पहुंचे हैं। सीमापार पहलों, कॉर्पोरेट उत्कृष्टता विकास और वैश्विक नेतृत्व कार्यक्रमों के माध्यम से हम अंतर कम करते हैं और सतत प्रगति को बढ़ावा देते हैं।",
  },
  "hero.ctaPrimary": { fil: "Tingnan ang Aming Mga Programa", si: "අපගේ වැඩසටහන් බලන්න", ta: "எங்கள் நிகழ்ச்சிகளைப் பாருங்கள்", hi: "हमारे कार्यक्रम देखें" },
  "hero.ctaSecondary": { fil: "Makipag-ugnayan", si: "අමතන්න", ta: "தொடர்பு கொள்ளுங்கள்", hi: "संपर्क करें" },
  "ticker.title": { fil: "PINAKABAGONG BALITA", si: "නවතම යාවත්කාලීන", ta: "சமீபத்திய புதுப்பிப்புகள்", hi: "नवीनतम अपडेट" },
  "ticker.item1": {
    fil: "Pinalalawak ng Meru ang presensya sa Timog Amerika sa pamamagitan ng bagong regional office sa Bogota.",
    si: "Bogota හි නව ප්‍රාදේශීය කාර්යාල සමඟ Meru දකුණු ඇමරිකාවට ව්‍යාප්ත වේ.",
    ta: "போகோட்டாவில் புதிய பிராந்திய அலுவலகங்களுடன் Meru தென் அமெரிக்காவில் தனது இருப்பை விரிவுபடுத்துகிறது.",
    hi: "Meru बोगोटा में नए क्षेत्रीय कार्यालयों के साथ दक्षिण अमेरिका में अपनी उपस्थिति बढ़ा रहा है।",
  },
  "ticker.item2": {
    fil: "Bukas na opisyal ang rehistrasyon para sa Global Youth Leadership Summit 2026.",
    si: "Global Youth Leadership Summit 2026 සඳහා ලියාපදිංචිය දැන් විවෘතයි.",
    ta: "Global Youth Leadership Summit 2026-க்கான பதிவு இப்போது அதிகாரப்பூர்வமாக திறக்கப்பட்டுள்ளது.",
    hi: "Global Youth Leadership Summit 2026 के लिए पंजीकरण अब आधिकारिक रूप से खुला है।",
  },
  "ticker.item3": {
    fil: "Naabot ng Corporate Excellence Program ang milestone na 50,000+ propesyonal na nasanay.",
    si: "Corporate Excellence Program වෘත්තිකයන් 50,000කට වැඩි පිරිසක් පුහුණු කිරීමේ සන්ධිස්ථානයට ළඟා වේ.",
    ta: "Corporate Excellence Program 50,000+ நிபுணர்களுக்கு பயிற்சி அளித்த மைல்கல்லை எட்டியுள்ளது.",
    hi: "Corporate Excellence Program ने 50,000 से अधिक पेशेवरों को प्रशिक्षित करने की उपलब्धि हासिल की।",
  },
  "ticker.item4": {
    fil: "Nakipagpartner sa 12 bagong European academic organizations para sa global exchanges.",
    si: "ගෝලීය හුවමාරු සඳහා නව යුරෝපීය අධ්‍යයන සංවිධාන 12ක් සමඟ හවුල් විය.",
    ta: "உலகளாவிய பரிமாற்றங்களுக்காக 12 புதிய ஐரோப்பிய கல்வி நிறுவனங்களுடன் கூட்டு சேர்ந்துள்ளது.",
    hi: "वैश्विक आदान-प्रदान के लिए 12 नए यूरोपीय शैक्षणिक संगठनों के साथ साझेदारी की।",
  },
  "about.title": { fil: "Sino Kami", si: "අපි කවුද", ta: "நாங்கள் யார்", hi: "हम कौन हैं" },
  "about.overview": {
    fil: "Ang Meru Global Team ay isang internasyonal na organisasyong nagtutulak ng pagbabago. Nagbibigay kami ng professional skill architectures, collaborative global pathways, at socio-educational frameworks para palakasin ang iba-ibang team at bagong lider.",
    si: "Meru Global Team යනු පරිවර්තනය මෙහෙයවන ජාත්‍යන්තර සංවිධානයකි. විවිධ කණ්ඩායම් සහ නැගී එන නායකයන් බලගැන්වීමට අපි වෘත්තීය කුසලතා පද්ධති, ගෝලීය මාර්ග සහ සමාජ-අධ්‍යාපනික රාමු සපයමු.",
    ta: "Meru Global Team என்பது மாற்றத்தை முன்னெடுக்கும் ஒரு முன்னணி சர்வதேச அமைப்பாகும். பல்வேறு குழுக்களையும் வளர்ந்து வரும் தலைவர்களையும் வலுப்படுத்த தொழில்முறை திறன் கட்டமைப்புகள், உலகளாவிய பாதைகள் மற்றும் சமூக-கல்வி கட்டமைப்புகளை வழங்குகிறோம்.",
    hi: "Meru Global Team परिवर्तन को आगे बढ़ाने वाला एक अंतरराष्ट्रीय संगठन है। हम विविध टीमों और उभरते नेताओं को सशक्त बनाने के लिए पेशेवर कौशल ढांचे, वैश्विक सहयोगी मार्ग और सामाजिक-शैक्षिक प्रणालियां प्रदान करते हैं।",
  },
  "about.mission": { fil: "Aming Misyon", si: "අපගේ මෙහෙවර", ta: "எங்கள் நோக்கம்", hi: "हमारा मिशन" },
  "about.missionText": {
    fil: "Maabot ang hindi pa naaabot sa pamamagitan ng world-class capability building, international standard resources, at mga landas ng pag-unlad na nagbabago ng buhay.",
    si: "ලෝක මට්ටමේ හැකියා ගොඩනැගීම, ජාත්‍යන්තර ප්‍රමිතියේ සම්පත් සහ ජීවිත වෙනස් කරන වර්ධන මාර්ග ලබා දීමෙන් නොපැමිණි අයට ළඟා වීම.",
    ta: "உலகத் தர சக்திவாய்ந்த திறன் மேம்பாடு, சர்வதேச தர வளங்கள் மற்றும் வாழ்க்கையை மாற்றும் வளர்ச்சி பாதைகளை வழங்குவதன் மூலம் எட்டப்படாதவர்களை அடைதல்.",
    hi: "विश्वस्तरीय क्षमता निर्माण, अंतरराष्ट्रीय मानक संसाधन और जीवन बदलने वाले विकास मार्ग प्रदान करके उन लोगों तक पहुंचना जिन तक अवसर नहीं पहुंचे हैं।",
  },
  "about.vision": { fil: "Aming Bisyon", si: "අපගේ දැක්ම", ta: "எங்கள் பார்வை", hi: "हमारी दृष्टि" },
  "about.visionText": {
    fil: "Maging pinaka-pinagkakatiwalaang pandaigdigang katalista para sa inklusibong empowerment at sa pagbuo ng matatag at mahusay na komunidad.",
    si: "සීමා සම්බන්ධ කරමින් දක්ෂ, ශක්තිමත් ගෝලීය ප්‍රජාවන් නිර්මාණය කරන ඇතුළත් බලගැන්වීමේ විශ්වාසදායක ගෝලීය උත්ප්‍රේරකයා වීම.",
    ta: "எல்லைகளை இணைத்து உள்ளடக்கிய சக்திவாய்ந்த உலகளாவிய ஊக்குவிப்புக்கான மிக நம்பகமான உலகளாவிய தூண்டுதலாக இருத்தல், திறமையான மற்றும் வலுவான உலகளாவிய சமூகங்களை உருவாக்குதல்.",
    hi: "सीमाओं को जोड़ते हुए समावेशी सशक्तिकरण के लिए सबसे विश्वसनीय वैश्विक प्रेरक बनना और सक्षम, मजबूत वैश्विक समुदाय बनाना।",
  },
  "about.values": { fil: "Pangunahing Halaga", si: "මූලික වටිනාකම්", ta: "முக்கிய மதிப்புகள்", hi: "मुख्य मूल्य" },
  "about.val1Title": { fil: "Pagiging Bukas sa Lahat", si: "ඇතුළත්භාවය", ta: "உள்ளடக்கிய தன்மை", hi: "समावेशिता" },
  "about.val1Desc": {
    fil: "Inaabot ang hindi pa naaabot at tinatanggap ang pagkakaiba-iba ng kultura sa lahat ng programa.",
    si: "සියලු වැඩසටහන් තුළ නොපැමිණි අයට ළඟා වී සංස්කෘතික විවිධත්වය අගය කිරීම.",
    ta: "எட்டப்படாதவர்களை அடைதல் மற்றும் அனைத்து நிகழ்ச்சிகளிலும் கலாச்சார பன்முகத்தன்மையை வரவேற்றல்.",
    hi: "हर कार्यक्रम में वंचित लोगों तक पहुंचना और सांस्कृतिक विविधता को अपनाना।",
  },
  "about.val2Title": { fil: "Kahusayan", si: "විශිෂ්ටත්වය", ta: "சிறப்பு", hi: "उत्कृष्टता" },
  "about.val2Desc": {
    fil: "Pinananatili ang mataas na pandaigdigang pamantayan sa serbisyo, edukasyon, at paghahatid.",
    si: "සේවා, අධ්‍යාපනය සහ ක්‍රියාත්මක කිරීමේ දැඩි ගෝලීය ප්‍රමිතීන් පවත්වා ගැනීම.",
    ta: "சேவை, கல்வி மற்றும் செயல்படுத்தலில் கடுமையான உலகளாவிய தரநிலைகளை பராமரித்தல்.",
    hi: "सेवा, शिक्षा और कार्यान्वयन में उच्च वैश्विक मानकों को बनाए रखना।",
  },
  "about.val3Title": { fil: "Pakikipagtulungan", si: "සහයෝගිතාව", ta: "ஒத்துழைப்பு", hi: "सहयोग" },
  "about.val3Desc": {
    fil: "Nakikipagbuo ng pangmatagalang solusyon kasama ang lokal at internasyonal na mga partner.",
    si: "දේශීය සහ ජාත්‍යන්තර හවුල්කරුවන් සමඟ තිරසාර විසඳුම් එක්ව නිර්මාණය කිරීම.",
    ta: "உள்ளூர் மற்றும் சர்வதேச கூட்டாளர்களுடன் நிலையான தீர்வுகளை இணைந்து உருவாக்குதல்.",
    hi: "स्थानीय और अंतरराष्ट्रीय साझेदारों के साथ टिकाऊ समाधान बनाना।",
  },
  "about.val4Title": { fil: "Integridad", si: "අඛණ්ඩතාව", ta: "நேர்மை", hi: "ईमानदारी" },
  "about.val4Desc": {
    fil: "Kumikilos nang may buong transparency at tunay na pangako sa pag-angat ng lipunan.",
    si: "පූර්ණ විනිවිදභාවය සහ සමාජ උසස් කිරීමේ කැපවීමෙන් ක්‍රියා කිරීම.",
    ta: "முழு வெளிப்படைத்தன்மையுடனும் சமூக முன்னேற்றத்திற்கான உண்மையான அர்ப்பணிப்புடனும் செயல்படுதல்.",
    hi: "पूर्ण पारदर्शिता और सामाजिक उत्थान की प्रतिबद्धता के साथ काम करना।",
  },
  "stats.countries": { fil: "Mga Bansang Naserbisyuhan", si: "සේවය කළ රටවල්", ta: "சேவை செய்த நாடுகள்", hi: "सेवा प्राप्त देश" },
  "stats.programs": { fil: "Mga Programang Naisagawa", si: "පවත්වන ලද වැඩසටහන්", ta: "நடத்தப்பட்ட நிகழ்ச்சிகள்", hi: "आयोजित कार्यक्रम" },
  "stats.partners": { fil: "Global Partners", si: "ගෝලීය හවුල්කරුවන්", ta: "உலகளாவிய கூட்டாளர்கள்", hi: "वैश्विक साझेदार" },
  "stats.team": { fil: "Mga Miyembro ng Team", si: "කණ්ඩායම් සාමාජිකයන්", ta: "குழு உறுப்பினர்கள்", hi: "टीम सदस्य" },
  "programs.featuredTitle": { fil: "Tampok na Mga Programa", si: "විශේෂ වැඩසටහන්", ta: "சிறப்பு நிகழ்ச்சிகள்", hi: "प्रमुख कार्यक्रम" },
  "programs.featuredSubtitle": {
    fil: "Mga pandaigdigang inisyatibang idinisenyo upang pataasin ang kakayahan at buksan ang internasyonal na oportunidad.",
    si: "හැකියා ඉහළ නැංවීමට සහ ජාත්‍යන්තර අවස්ථා විවෘත කිරීමට නිර්මාණය කළ ගෝලීය වැඩසටහන්.",
    ta: "திறன்களை உயர்த்தவும் சர்வதேச வாய்ப்புகளைத் திறக்கவும் வடிவமைக்கப்பட்ட மாற்றத்தை ஏற்படுத்தும் உலகளாவிய முயற்சிகள்.",
    hi: "क्षमताओं को बढ़ाने और अंतरराष्ट्रीय अवसर खोलने के लिए बनाए गए परिवर्तनकारी वैश्विक कार्यक्रम।",
  },
  "programs.learnMore": { fil: "Matuto Pa", si: "තවත් දැනගන්න", ta: "மேலும் அறியுங்கள்", hi: "और जानें" },
  "programs.category": { fil: "Kategorya", si: "ප්‍රවර්ගය", ta: "வகை", hi: "श्रेणी" },
  "programs.eligibility": { fil: "Kwalipikasyon", si: "සුදුසුකම්", ta: "தகுதி", hi: "पात्रता" },
  "programs.benefits": { fil: "Benepisyo at Resulta", si: "ප්‍රතිලාභ සහ ප්‍රතිඵල", ta: "நன்மைகள் & விளைவுகள்", hi: "लाभ और परिणाम" },
  "programs.register": { fil: "Magrehistro Ngayon", si: "දැන් ලියාපදිංචි වන්න", ta: "இப்போது பதிவு செய்யுங்கள்", hi: "अभी पंजीकरण करें" },
  "programs.downloadBrochure": { fil: "I-download ang Brochure", si: "බ්‍රෝෂරය බාගන්න", ta: "சிற்றேடு பதிவிறக்கம்", hi: "ब्रोशर डाउनलोड करें" },
  "testimonials.title": { fil: "Sabi ng Aming Komunidad", si: "අපගේ ප්‍රජාව කියන දේ", ta: "எங்கள் சமூகம் என்ன சொல்கிறது", hi: "हमारे समुदाय की राय" },
  "testimonials.subtitle": {
    fil: "Tunay na puna mula sa mga kalahok, partner, at institusyong aming naserbisyuhan sa buong mundo.",
    si: "ලොව පුරා අප සේවය කළ සහභාගීවන්නන්, හවුල්කරුවන් සහ ආයතනවල සැබෑ අදහස්.",
    ta: "உலகெங்கிலும் நாங்கள் சேவை செய்த பங்கேற்பாளர்கள், கூட்டாளர்கள் மற்றும் நிறுவனங்களிடமிருந்து உண்மையான கருத்துகள்.",
    hi: "दुनिया भर में सेवा प्राप्त प्रतिभागियों, साझेदारों और संस्थानों से वास्तविक प्रतिक्रिया।",
  },
  "contact.title": { fil: "Makipag-ugnayan", si: "සම්බන්ධ වන්න", ta: "தொடர்பில் இருங்கள்", hi: "संपर्क में रहें" },
  "contact.subtitle": {
    fil: "May tanong? Punan ang form o makipag-ugnayan sa WhatsApp.",
    si: "ප්‍රශ්න තිබේද? පෝරමය පුරවන්න හෝ WhatsApp හරහා සම්බන්ධ වන්න.",
    ta: "கேள்விகள் உள்ளதா? படிவத்தை நிரப்புங்கள் அல்லது WhatsApp மூலம் தொடர்பு கொள்ளுங்கள்.",
    hi: "क्या आपके प्रश्न हैं? फॉर्म भरें या WhatsApp के माध्यम से संपर्क करें।",
  },
  "contact.name": { fil: "Buong Pangalan", si: "සම්පූර්ණ නම", ta: "முழு பெயர்", hi: "पूरा नाम" },
  "contact.email": { fil: "Email Address", si: "ඊමේල් ලිපිනය", ta: "மின்னஞ்சல் முகவரி", hi: "ईमेल पता" },
  "contact.phone": { fil: "Numero ng Telepono", si: "දුරකථන අංකය", ta: "தொலைபேசி எண்", hi: "फोन नंबर" },
  "contact.department": { fil: "Department Inquiry", si: "දෙපාර්තමේන්තු විමසුම", ta: "துறை விசாரணை", hi: "विभागीय पूछताछ" },
  "contact.dept1": { fil: "Pangkalahatang Tanong", si: "සාමාන්‍ය විමසුම්", ta: "பொது விசாரணைகள்", hi: "सामान्य पूछताछ" },
  "contact.dept2": { fil: "Program Admissions", si: "වැඩසටහන් ඇතුළත් කිරීම්", ta: "நிகழ்ச்சி சேர்க்கை", hi: "कार्यक्रम प्रवेश" },
  "contact.dept3": { fil: "Partnerships at Press", si: "හවුල්කාරිත්ව සහ මාධ්‍ය", ta: "கூட்டாண்மை & பத்திரிகை", hi: "साझेदारी और प्रेस" },
  "contact.dept4": { fil: "Technical Support", si: "තාක්ෂණික සහාය", ta: "தொழில்நுட்ப ஆதரவு", hi: "तकनीकी सहायता" },
  "contact.message": { fil: "Iyong Mensahe", si: "ඔබේ පණිවිඩය", ta: "உங்கள் செய்தி", hi: "आपका संदेश" },
  "contact.submit": { fil: "Ipadala ang Mensahe", si: "පණිවිඩය යවන්න", ta: "செய்தி அனுப்பு", hi: "संदेश भेजें" },
  "contact.success": {
    fil: "Salamat! Matagumpay na naipadala ang iyong mensahe.",
    si: "ස්තුතියි! ඔබේ පණිවිඩය සාර්ථකව යවා ඇත.",
    ta: "நன்றி! உங்கள் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது.",
    hi: "धन्यवाद! आपका संदेश सफलतापूर्वक भेज दिया गया है।",
  },
  "contact.whatsapp": { fil: "Makipag-chat sa WhatsApp", si: "WhatsApp හි කතා කරන්න", ta: "WhatsApp-ல் அரட்டையடிக்கவும்", hi: "WhatsApp पर चैट करें" },
  "contact.offices": { fil: "Mga Global Office Location", si: "ගෝලීය කාර්යාල ස්ථාන", ta: "உலகளாவிய அலுவலக இடங்கள்", hi: "वैश्विक कार्यालय स्थान" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isValidLanguage(saved)) {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return supplementalTranslations[key]?.[language] ?? translations[key][language as "en" | "es"] ?? translations[key].en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
