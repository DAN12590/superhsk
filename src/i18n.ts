export type Lang = 'en' | 'es';
export type Page = 'home' | 'method' | 'levels' | 'faq' | 'privacy' | 'terms' | 'legal';

export const EMAIL = 'danapps.dev@gmail.com';

/** A path inside the site, with the GitHub Pages base. */
export const url = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path}`;

export const routes: Record<Lang, Record<Page, string>> = {
  en: {
    home: '',
    method: 'method/',
    levels: 'levels/',
    faq: 'faq/',
    privacy: 'privacy/',
    terms: 'terms/',
    legal: 'legal/',
  },
  es: {
    home: 'es/',
    method: 'es/metodo/',
    levels: 'es/niveles/',
    faq: 'es/preguntas/',
    privacy: 'es/privacidad/',
    terms: 'es/terminos/',
    legal: 'es/aviso-legal/',
  },
};

export const nav: Record<Lang, { page: Page; label: string }[]> = {
  en: [
    { page: 'home', label: 'Home' },
    { page: 'method', label: 'Method' },
    { page: 'levels', label: 'Levels' },
    { page: 'faq', label: 'Questions' },
    { page: 'privacy', label: 'Privacy' },
  ],
  es: [
    { page: 'home', label: 'Inicio' },
    { page: 'method', label: 'Método' },
    { page: 'levels', label: 'Niveles' },
    { page: 'faq', label: 'Preguntas' },
    { page: 'privacy', label: 'Privacidad' },
  ],
};

export const common = {
  en: { other: 'Español', contact: 'Contact', status: 'Free, with no account.' },
  es: { other: 'English', contact: 'Contacto', status: 'Gratis y sin cuenta.' },
};

export const footerNav: typeof nav = {
  en: [...nav.en, { page: 'terms', label: 'Terms' }, { page: 'legal', label: 'Legal notice' }],
  es: [...nav.es, { page: 'terms', label: 'Términos' }, { page: 'legal', label: 'Aviso legal' }],
};

export const copy = {
  en: {
    title: 'SuperHSK — Learn Chinese from zero to HSK 5',
    description:
      'An Android course that takes you from your first character to HSK 5: lessons in order, tones, writing stroke by stroke, reading and speaking. Free, with no account.',
    hero: {
      title: 'Learn Chinese one stroke at a time.',
      lead: 'SuperHSK is a course for Android that starts from zero and takes you to HSK 5. Every word comes with its sound, its tones and its characters, written in the right order.',
      caption: 'xué Zhōngwén · to study Chinese',
      yourTurn: 'Your turn: write 学 in the empty square, stroke by stroke.',
      done: 'Well done. That is how every character is practised in the app.',
      again: 'Write it again',
    },
    stats: { label: 'The course in numbers', items: [['114', 'units'], ['1250', 'lessons'], ['3497', 'HSK 1–5 words'], ['5', 'HSK levels']] },
    try: { title: 'Try it now', lead: 'Watch 学中文 being written stroke by stroke, then write 学 yourself in the empty square.' },
    final: { title: 'Start with 你好.', lead: 'SuperHSK is coming to Google Play soon. Free, with no account.' },
    tones: {
      title: 'Four tones change the word',
      lead: 'The same syllable means four different things depending on the tone. Tap each one to hear it.',
      items: [
        { py: 'mā', hz: '妈', meaning: 'mother' },
        { py: 'má', hz: '麻', meaning: 'hemp' },
        { py: 'mǎ', hz: '马', meaning: 'horse' },
        { py: 'mà', hz: '骂', meaning: 'to scold' },
      ],
      noVoice: 'Your browser has no Chinese voice, but you can still see the shape of each tone.',
    },
    app: {
      title: 'What you do in the app',
      lead: 'Each unit mixes these exercises around one topic, and ends with a short exam before the next one opens.',
      items: [
        { hz: '课', title: 'Lessons in order', text: 'From greetings to talking about your plans. Each lesson uses only what you have already learned.' },
        { hz: '音', title: 'Tones', text: 'Hear the four tones at the speed you choose and train your ear until mā and mà stop sounding the same.' },
        { hz: '写', title: 'Writing', text: 'Trace each character with your finger, stroke by stroke. The ones you have written turn green.' },
        { hz: '读', title: 'Reading', text: 'Short texts with only the words you know. Show the pinyin when you need it, tap a word to see its meaning.' },
        { hz: '说', title: 'Speaking', text: 'Repeat after native audio, and role-play everyday situations where you have to order, ask or explain in Chinese.' },
        { hz: '记', title: 'Reviews', text: 'Words come back the day you are about to forget them, so a few minutes a day is enough.' },
      ],
      more: 'See how a unit works',
    },
    privacy: {
      title: 'Your progress stays with you',
      items: [
        'There is no account. Everything you learn is saved on your phone, and you can export a copy whenever you want.',
        'There are no analytics. The course is free; if you want more AI uses without paying, you can watch a short video.',
        'Only the exercises that need it go online: the AI conversations, the speech recognition and the messages you send us.',
      ],
      link: 'Read the privacy policy',
    },
  },
  es: {
    title: 'SuperHSK — Aprende chino desde cero hasta el HSK 5',
    description:
      'Un curso para Android que te lleva de tu primer carácter al HSK 5: lecciones en orden, tonos, escritura trazo a trazo, lectura y conversación. Gratis y sin cuenta.',
    hero: {
      title: 'Aprende chino trazo a trazo.',
      lead: 'SuperHSK es un curso para Android que empieza desde cero y te lleva hasta el HSK 5. Cada palabra viene con su sonido, sus tonos y sus caracteres, escritos en el orden correcto.',
      caption: 'xué Zhōngwén · estudiar chino',
      yourTurn: 'Te toca: escribe 学 en el cuadro vacío, trazo a trazo.',
      done: 'Muy bien. Así se practica cada carácter en la app.',
      again: 'Escribirlo otra vez',
    },
    stats: { label: 'El curso en cifras', items: [['114', 'unidades'], ['1250', 'lecciones'], ['3497', 'palabras de HSK 1–5'], ['5', 'niveles HSK']] },
    try: { title: 'Pruébalo ahora', lead: 'Mira cómo se escribe 学中文 trazo a trazo y luego escribe tú 学 en el cuadro vacío.' },
    final: { title: 'Empieza por 你好.', lead: 'SuperHSK llega muy pronto a Google Play. Gratis y sin cuenta.' },
    tones: {
      title: 'Cuatro tonos cambian la palabra',
      lead: 'La misma sílaba significa cuatro cosas distintas según el tono. Toca cada una para oírla.',
      items: [
        { py: 'mā', hz: '妈', meaning: 'madre' },
        { py: 'má', hz: '麻', meaning: 'cáñamo' },
        { py: 'mǎ', hz: '马', meaning: 'caballo' },
        { py: 'mà', hz: '骂', meaning: 'regañar' },
      ],
      noVoice: 'Tu navegador no tiene voz en chino, pero puedes ver la forma de cada tono.',
    },
    app: {
      title: 'Qué haces en la app',
      lead: 'Cada unidad mezcla estos ejercicios alrededor de un tema y acaba con un examen corto antes de abrir la siguiente.',
      items: [
        { hz: '课', title: 'Lecciones en orden', text: 'De los saludos a hablar de tus planes. Cada lección usa solo lo que ya has aprendido.' },
        { hz: '音', title: 'Tonos', text: 'Oye los cuatro tonos a la velocidad que elijas y entrena el oído hasta que mā y mà dejen de sonarte igual.' },
        { hz: '写', title: 'Escritura', text: 'Traza cada carácter con el dedo, trazo a trazo. Los que ya has escrito se ponen en verde.' },
        { hz: '读', title: 'Lectura', text: 'Textos cortos solo con palabras que conoces. Muestra el pinyin cuando lo necesites y toca una palabra para ver qué significa.' },
        { hz: '说', title: 'Conversación', text: 'Repite tras audios nativos y practica situaciones del día a día en las que tienes que pedir, preguntar o explicar en chino.' },
        { hz: '记', title: 'Repasos', text: 'Las palabras vuelven el día que estabas a punto de olvidarlas, así que te bastan unos minutos al día.' },
      ],
      more: 'Ver cómo funciona una unidad',
    },
    privacy: {
      title: 'Tu progreso se queda contigo',
      items: [
        'No hay cuenta. Todo lo que aprendes se guarda en tu móvil, y puedes exportar una copia cuando quieras.',
        'No hay analítica. El curso es gratis; si quieres más usos de la IA sin pagar, puedes ver un vídeo corto.',
        'Solo se conectan los ejercicios que lo necesitan: las conversaciones con IA, el reconocimiento de voz y los mensajes que nos envías.',
      ],
      link: 'Leer la política de privacidad',
    },
  },
} as const;
