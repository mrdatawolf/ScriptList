interface Settings {
  githubToken?: string;
  githubUsername?: string;
}

const SETTINGS_KEY = 'github_script_settings';

export function getSettings(): Settings {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings) : {};
  } catch {
    return {};
  }
}

export function updateSettings(newSettings: Partial<Settings>) {
  try {
    const currentSettings = getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}