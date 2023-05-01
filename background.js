/* global browser */

const locked_tabs = new Set();

browser.browserAction.onClicked.addListener((tab) => {
  if (locked_tabs.has(tab.id)) {
    locked_tabs.delete(tab.id);
    browser.browserAction.setBadgeText({ tabId: tab.id, text: "" });
  } else {
    locked_tabs.add(tab.id);
    browser.browserAction.setBadgeText({ tabId: tab.id, text: "🔒" });
  }
});

async function onBeforeWebRequest(requestDetails) {
  if (locked_tabs.has(requestDetails.tabId)) {
    const tmp_tab = await browser.tabs.get(requestDetails.tabId);
    const tmp_tab_origin = new URL(tmp_tab.url).origin;

    if (!requestDetails.url.startsWith(tmp_tab_origin)) {
      browser.tabs.create({
        active: true,
        url: requestDetails.url,
      });
      return { cancel: true };
    }
  }
}

browser.webRequest.onBeforeRequest.addListener(
  onBeforeWebRequest,
  { urls: ["<all_urls>"], types: ["main_frame"] },
  ["blocking"]
);

// default
browser.browserAction.setBadgeText({ text: "" });
browser.browserAction.setBadgeBackgroundColor({ color: "green" });
