var config = {};

function getDefaultConfig() {
  const defaults = {
    primary: "https://www.google.com/search?q=",
    secondary: "https://en.wikipedia.org/wiki/Special:Search/",
    openNewTab: true,
  };
  return defaults;
}

function validURL(str) {
  const pattern =
    /^(?:(?:(?:https?|ftp):)\/\/)?(?:www\.)?([\w.-]+)\.([a-zA-Z]{2,})(:\d{2,5})?(\/\S*)?$/;
  return pattern.test(str);
}

function isNonEmptyObject(value) {
  return (
    typeof value === "object" && value !== null && Object.keys(value).length > 0
  );
}

browser.runtime.onInstalled.addListener(function (details) {
  browser.storage.sync.get("quickSearchConfig").then((storageConfig) => {
    if (isNonEmptyObject(storageConfig)) {
      config = storageConfig;
    } else {
      config = getDefaultConfig();
    }
  });
});

browser.runtime.onStartup.addListener(function () {
  browser.storage.sync.get("quickSearchConfig").then((storageConfig) => {
    config = storageConfig || getDefaultConfig();
  });
});

browser.storage.onChanged.addListener(function (changes, area) {
  const changedItems = Object.keys(changes);

  for (const item of changedItems) {
    config[item] = changes[item].newValue;
  }
});

browser.commands.onCommand.addListener(function (command) {
  let searchURLPrefix = config["primary"];
  let inBackground = false;
  switch (command) {
    case "openSearch":
      break;
    case "openSearch2nd":
      searchURLPrefix = config["secondary"];
      break;
    case "openSearchBG":
      inBackground = true;
      break;
    default:
      return;
  }

  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const currentTabId = tabs[0].id;
    browser.scripting
      .executeScript({
        target: { tabId: currentTabId },
        func: function () {
          const selectedText = window.getSelection().toString().trim();
          return selectedText;
        },
      })
      .then((result) => {
        const selectedText = result[0].result;
        handleSelectedText(selectedText, searchURLPrefix, inBackground);
      });
  });
});

function getTargetURL(text, URLPrefix) {
  if (validURL(text)) {
    if (!text.startsWith("http")) {
      text = "http://" + text;
    }
    return text;
  } else {
    return URLPrefix + text;
  }
}

function openInNewTab(targetURL, inBackground) {
  browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
    const targetIndex = tabs[0].index + 1;
    return browser.tabs.create({
      index: targetIndex,
      url: targetURL,
      active: !inBackground,
    });
  });
}

function handleSelectedText(selectedText, searchURLPrefix, inBackground) {
  if (Array.isArray(selectedText) && selectedText.length > 0) {
    selectedText = selectedText[0];
  }
  if (selectedText == null || selectedText == "") {
    return;
  }

  let targetURL = getTargetURL(selectedText, searchURLPrefix);

  if (config["openNewTab"]) {
    openInNewTab(targetURL, inBackground);
  } else {
    browser.tabs.update({ url: targetURL });
  }
}
