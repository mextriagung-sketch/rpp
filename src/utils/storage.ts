import { LessonPlan, SchoolIdentity } from '../types';
import { INITIAL_SAMPLE_RPPS } from '../data/sampleRPP';

const STORAGE_KEY = 'rpp_generator_lesson_plans_v1';
const DEFAULT_IDENTITY_KEY = 'rpp_generator_default_school_identity';

export function loadSavedRPPs(): LessonPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_RPPS));
      return INITIAL_SAMPLE_RPPS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_RPPS;
  } catch (e) {
    console.error('Error loading RPPs from localStorage:', e);
    return INITIAL_SAMPLE_RPPS;
  }
}

export function saveRPPs(plans: LessonPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error('Error saving RPPs to localStorage:', e);
  }
}

export function loadDefaultSchoolIdentity(): SchoolIdentity {
  try {
    const raw = localStorage.getItem(DEFAULT_IDENTITY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }
  return {
    schoolName: 'SD Negeri Nusantara 01',
    schoolAddress: 'Jl. Pendidikan Merdeka No. 45',
    city: 'Bandung',
    province: 'Jawa Barat',
    teacherName: 'Siti Rahmawati, S.Pd.',
    teacherNip: '19880512 201101 2 008',
    principalName: 'Drs. H. Ahmad Dahlan, M.Pd.',
    principalNip: '19750315 199903 1 004',
    signatureDatePlace: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
}

export function saveDefaultSchoolIdentity(identity: SchoolIdentity): void {
  try {
    localStorage.setItem(DEFAULT_IDENTITY_KEY, JSON.stringify(identity));
  } catch (e) {
    console.error('Error saving default school identity:', e);
  }
}
