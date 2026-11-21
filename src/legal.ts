// The owner's personal data never lives in git: it comes from build-time
// environment variables (GitHub Actions secrets, or a local .env file).
const env = (key: string) => (import.meta.env[key] as string | undefined)?.trim() || 'PENDIENTE';

export const OWNER = {
  name: env('OWNER_NAME'),
  id: env('OWNER_ID'),
  address: env('OWNER_ADDRESS'),
} as const;
export type OwnerField = keyof typeof OWNER;

export const HSK_NOTICE = {
  en: 'SuperHSK is independent and is neither affiliated with nor endorsed by Chinese Testing International (CTI) or the Center for Language Education and Cooperation. We use “HSK” only to describe the exam levels. The name belongs to its respective owners.',
  es: 'SuperHSK es independiente y no está afiliada ni respaldada por Chinese Testing International (CTI) ni por el Center for Language Education and Cooperation. Usamos «HSK» solo para describir los niveles del examen. El nombre pertenece a sus titulares.',
} as const;
