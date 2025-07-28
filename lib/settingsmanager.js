// 🛠️ JFX MD-X Settings Manager by JEPHTER TECH

const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../settings.json');
let settingsCache = {}; // Cache to hold settings in memory

// 🔄 Load settings from file or initialize defaults
const loadSettings = () => {
    if (fs.existsSync(SETTINGS_FILE)) {
        try {
            settingsCache = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
            console.log("[SETTINGS] Loaded from settings.json");

            // Ensure required keys exist
            if (typeof settingsCache.ANTICALL === 'undefined') {
                settingsCache.ANTICALL = true;
                saveSettings();
            }

        } catch (e) {
            console.error("[SETTINGS ERROR] Invalid JSON. Recreating settings.json...", e);
            settingsCache = { "ANTICALL": true };
            saveSettings();
        }
    } else {
        settingsCache = { "ANTICALL": true };
        saveSettings();
        console.log("[SETTINGS] Created settings.json with default values.");
    }
};

// 💾 Save settings to disk
const saveSettings = () => {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settingsCache, null, 2), 'utf8');
        console.log("[SETTINGS] Settings saved.");
    } catch (e) {
        console.error("[SETTINGS ERROR] Failed to save settings.json", e);
    }
};

// 📥 Get a setting by key
const getSetting = (key) => {
    return settingsCache[key];
};

// 📤 Set a setting by key and value
const setSetting = (key, value) => {
    settingsCache[key] = value;
    saveSettings(); // Save immediately
};

// 🔁 Initialize settings at startup
loadSettings();

module.exports = {
    getSetting,
    setSetting,
    loadSettings // Optional manual reload
};
