const shortcutIds = ["shortcut1", "shortcut2", "shortcut3"];
const searchEngines = ["primary", "secondary"];

let primaryInput = document.getElementById("primary");
let secondaryInput = document.getElementById("secondary");
let newTabChk = document.getElementById("openNewTab");
let resetBtn = document.getElementById("reset");

let formElements = [primaryInput, secondaryInput, newTabChk];

initialize();

formElements.forEach((elem) => {
  elem.addEventListener("change", updateConfig);
});

resetBtn.addEventListener("click", () => {
  displayConfig(getDefaultConfig());
  updateConfig();
});

function initialize() {
  browser.commands.getAll((commands) => {
    commands.forEach((command, index) => {
      document.getElementById(shortcutIds[index]).textContent =
        command.shortcut;
    });
  });

  browser.storage.local.get("quickSearchConfig").then((stored) => {
    displayConfig(stored.quickSearchConfig);
  });
}

function displayConfig(config) {
  primaryInput.value = config["primary"];
  secondaryInput.value = config["secondary"];
  newTabChk.checked = config["openNewTab"];
}

function updateConfig() {
  const current = collectConfig();
  browser.storage.local.set({ quickSearchConfig: current });
  browser.storage.session.set({ quickSearchConfig: current });
  console.log(current);
}

function getDefaultConfig() {
  const defaults = {
    primary: "https://www.google.com/search?q=",
    secondary: "https://en.wikipedia.org/wiki/Special:Search/",
    openNewTab: true,
  };
  return defaults;
}

function collectConfig() {
  const config = {
    primary: primaryInput.value,
    secondary: secondaryInput.value,
    openNewTab: newTabChk.checked,
  };
  return config;
}
