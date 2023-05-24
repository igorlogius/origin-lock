/* global browser */

const tabId2Origin = new Map();

browser.browserAction.onClicked.addListener((tab) => {
  if (tabId2Origin.has(tab.id)) {
    tabId2Origin.delete(tab.id);
    browser.browserAction.setBadgeText({ tabId: tab.id, text: "" });
  } else {
    tabId2Origin.set(tab.id, new URL(tab.url).origin);
    browser.browserAction.setBadgeText({ tabId: tab.id, text: "🔒" });
  }
});

async function onBeforeWebRequest(requestDetails) {
  if (tabId2Origin.has(requestDetails.tabId)) {
    const locked_origin = tabId2Origin.get(requestDetails.tabId);

    if (!requestDetails.url.startsWith(locked_origin)) {
      browser.tabs.create({
        active: true,
        url: requestDetails.url,
      });
      return { cancel: true };
    }
  } /*else {
    const tab = await browser.tabs.get(requestDetails.tabId);

    if (tab.openerTabId && tabId2Origin.has(tab.openerTabId)) {
      const tab_origin = new URL(requestDetails.url).origin;
      const opener_origin = tabId2Origin.get(tab.openerTabId);

      if (tab_origin === opener_origin) {
        browser.tabs.update(tab.openerTabId, {
          active: true,
          url: requestDetails.url,
        });
        browser.tabs.remove(requestDetails.tabId);
      }
    }
  }*/
}

browser.webRequest.onBeforeRequest.addListener(
  onBeforeWebRequest,
  { urls: ["<all_urls>"], types: ["main_frame"] },
  ["blocking"]
);

// default
browser.browserAction.setBadgeText({ text: "" });
browser.browserAction.setBadgeBackgroundColor({ color: "green" });

// update icon status
browser.tabs.onUpdated.addListener(
  (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      if (tabId2Origin.has(tab.id)) {
        browser.browserAction.setBadgeText({ tabId: tab.id, text: "🔒" });
      } else {
        browser.browserAction.setBadgeText({ tabId: tab.id, text: "" });
      }
    }
  },
  { properties: ["status"] }
);
