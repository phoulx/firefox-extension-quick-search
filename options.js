const background = browser.extension.getBackgroundPage();
const shortcutIds = ["shortcut1", "shortcut2", "shortcut3"];
const searchEngines = ["primary", "secondary"];

document.addEventListener("DOMContentLoaded", () => {
  // Show current hotkeys
  browser.commands.getAll((commands) => {
    commands.forEach((command, index) => {
      document.getElementById(shortcutIds[index]).textContent =
        command.shortcut;
    });
  });

  // Populate options page with current values
  searchEngines.forEach((searchId) => {
    document.getElementById(searchId).value = background.config[searchId];
  });
  document.getElementById("openNewTab").checked =
    background.config["openNewTab"];

  // Reset to default values
  document.getElementById("reset").addEventListener(
    "click",
    () => {
      const defaultConfig = background.getDefaultConfig();
      searchEngines.forEach((searchId) => {
        document.getElementById(searchId).value = defaultConfig[searchId];
      });
      document.getElementById("openNewTab").checked =
        defaultConfig["openNewTab"];
    },
    false
  );

  // Save config when closing options page
  addEventListener(
    "unload",
    () => {
      searchEngines.forEach((searchId) => {
        background.config[searchId] = document.getElementById(searchId).value;
      });
      background.config["openNewTab"] =
        document.getElementById("openNewTab").checked;
      background.browser.storage.sync.set({
        quickSearchConfig: background.config,
      });
    },
    true
  );
});
