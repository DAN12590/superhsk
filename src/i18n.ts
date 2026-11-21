export type Lang = 'en' | 'es';

export const EMAIL = 'danapps.dev@gmail.com';

/** A path inside the site, with the GitHub Pages base. */
export const url = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path}`;

export const routes = {
  en: { home: '', privacy: 'privacy/' },
  es: { home: 'es/', privacy: 'es/privacidad/' },
} as const;

export const copy = {
  en: {
    other: 'Español',
    title: 'SuperHSK — Learn Chinese from zero to HSK 3',
    description:
      'An Android course that takes you from your first character to HSK 3: lessons in order, tones, writing stroke by stroke, reading and speaking. Free, no account, no ads.',
    nav: { app: 'The app', levels: 'Levels', privacy: 'Privacy' },
    hero: {
      title: 'Learn Chinese one stroke at a time.',
      lead: 'SuperHSK is a course for Android that starts from zero and takes you to HSK 3. Every word comes with its sound, its tones and its characters, written in the right order.',
      status: 'Coming soon to Google Play. Free, with no account and no ads.',
      caption: 'xué zhōng wén · to study Chinese',
    },
    app: {
      title: 'What you do in the app',
      lead: 'Each unit mixes these exercises around one topic, and ends with a short exam before the next one opens.',
      items: [
        { hz: '课', title: 'Lessons in order', text: 'From greetings to talking about your plans. Each lesson uses only what you have already learned.' },
        { hz: '音', title: 'Tones', text: 'Hear the four tones at the speed you choose and train your ear until mā and mà stop sounding the same.' },
        { hz: '写', title: 'Writing', text: 'Trace each character with your finger, stroke by stroke. The ones you have written turn green.' },
        { hz: '读', title: 'Reading', text: 'Short texts with only the words you know. Show the pinyin when you need it, tap a word to see its meaning.' },
        { hz: '说', title: 'Speaking', text: 'Repeat after native audio, and play everyday situations where you have to order, ask or explain in Chinese.' },
        { hz: '记', title: 'Reviews', text: 'Words come back the day you are about to forget them, so a few minutes a day is enough.' },
      ],
    },
    levels: {
      title: 'Four levels, one path',
      lead: 'The course follows HSK, the official Chinese exam. You can start at the beginning or take a test to skip what you know.',
      items: [
        { name: 'HSK 1', text: 'Greetings, numbers, family, time.', state: 'Ready' },
        { name: 'HSK 2', text: 'Shopping, food, directions, the weather.', state: 'Ready' },
        { name: 'HSK 3', text: 'Your life, plans, feelings and opinions.', state: 'Ready' },
        { name: 'HSK 4', text: 'Longer texts and nuance.', state: 'In updates' },
      ],
    },
    privacy: {
      title: 'Your progress stays with you',
      items: [
        'There is no account. Everything you learn is saved on your phone, and you can export a copy whenever you want.',
        'There are no ads and no analytics.',
        'Only the exercises that need it go online: the AI conversations, the speech recognition and the messages you send us.',
      ],
      link: 'Read the privacy policy',
    },
    footer: { contact: 'Contact', privacy: 'Privacy policy' },
  },
  es: {
    other: 'English',
    title: 'SuperHSK — Aprende chino desde cero hasta el HSK 3',
    description:
      'Un curso para Android que te lleva de tu primer carácter al HSK 3: lecciones en orden, tonos, escritura trazo a trazo, lectura y conversación. Gratis, sin cuenta y sin anuncios.',
    nav: { app: 'La app', levels: 'Niveles', privacy: 'Privacidad' },
    hero: {
      title: 'Aprende chino trazo a trazo.',
      lead: 'SuperHSK es un curso para Android que empieza desde cero y te lleva hasta el HSK 3. Cada palabra viene con su sonido, sus tonos y sus caracteres, escritos en el orden correcto.',
      status: 'Muy pronto en Google Play. Gratis, sin cuenta y sin anuncios.',
      caption: 'xué zhōng wén · estudiar chino',
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
    },
    levels: {
      title: 'Cuatro niveles, un camino',
      lead: 'El curso sigue el HSK, el examen oficial de chino. Puedes empezar desde el principio o hacer una prueba para saltarte lo que ya sabes.',
      items: [
        { name: 'HSK 1', text: 'Saludos, números, familia, la hora.', state: 'Disponible' },
        { name: 'HSK 2', text: 'Compras, comida, direcciones, el tiempo.', state: 'Disponible' },
        { name: 'HSK 3', text: 'Tu vida, tus planes, lo que sientes y opinas.', state: 'Disponible' },
        { name: 'HSK 4', text: 'Textos más largos y matices.', state: 'En actualizaciones' },
      ],
    },
    privacy: {
      title: 'Tu progreso se queda contigo',
      items: [
        'No hay cuenta. Todo lo que aprendes se guarda en tu móvil, y puedes exportar una copia cuando quieras.',
        'No hay anuncios ni analítica.',
        'Solo se conectan los ejercicios que lo necesitan: las conversaciones con IA, el reconocimiento de voz y los mensajes que nos envías.',
      ],
      link: 'Leer la política de privacidad',
    },
    footer: { contact: 'Contacto', privacy: 'Política de privacidad' },
  },
} as const;
