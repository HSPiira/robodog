import { Theme, Language, PrivacyLevel } from '../enums';

export interface UserSettings {
    theme: Theme;
    language: Language;
    privacy: PrivacyLevel;
    notifications: boolean;
    emailUpdates: boolean;
}

const SETTINGS_STORAGE_KEY = 'user_settings';

export const SettingsService = {
    saveSettings: (settings: UserSettings) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        }
    },

    loadSettings: (): UserSettings => {
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (savedSettings) {
                try {
                    return JSON.parse(savedSettings);
                } catch (error) {
                    console.error('Failed to parse saved settings:', error);
                    // Fall back to default settings
                }
            }
        }
        return {
            theme: Theme.SYSTEM,
            language: Language.ENGLISH,
            privacy: PrivacyLevel.PUBLIC,
            notifications: true,
            emailUpdates: true,
        };
    },

    applyTheme: (theme: Theme) => {
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');

            if (theme === Theme.SYSTEM) {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(theme.toLowerCase());
            }
        }
    }
}; 