const DEFAULT_SETTINGS = {
  timeoutHours: 12
};

const ALARM_NAME = "tab-closer-check";
const CHECK_INTERVAL_MINUTES = 5;
const LAST_ACTIVATED_KEY = "lastActivatedAt";

async function getSettings() {
  const stored = await browser.storage.local.get(DEFAULT_SETTINGS);
  return {
    timeoutHours: normalizeTimeoutHours(stored.timeoutHours)
  };
}

function normalizeTimeoutHours(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return DEFAULT_SETTINGS.timeoutHours;
  }
  return number;
}

async function setTabTouched(tabId, now = Date.now()) {
  try {
    await browser.sessions.setTabValue(tabId, LAST_ACTIVATED_KEY, now);
  } catch (error) {
  }
}

async function ensureTabTracked(tab, now = Date.now()) {
  if (typeof tab.id !== "number") {
    return;
  }

  const lastActivatedAt = await getLastActivatedAt(tab.id);
  if (!Number.isFinite(lastActivatedAt)) {
    await setTabTouched(tab.id, now);
  }
}

async function getLastActivatedAt(tabId) {
  try {
    return Number(await browser.sessions.getTabValue(tabId, LAST_ACTIVATED_KEY));
  } catch (error) {
    return NaN;
  }
}

async function syncTrackedTabs() {
  const tabs = await browser.tabs.query({});
  const now = Date.now();
  await Promise.all(tabs.map((tab) => ensureTabTracked(tab, now)));
}

async function closeExpiredTabs() {
  const settings = await getSettings();
  const now = Date.now();
  const maxAgeMs = settings.timeoutHours * 60 * 60 * 1000;
  const tabs = await browser.tabs.query({});
  const expiredTabIds = [];

  await Promise.all(tabs.map((tab) => ensureTabTracked(tab, now)));

  for (const tab of tabs) {
    if (typeof tab.id !== "number" || tab.pinned) {
      continue;
    }

    const lastActivatedAt = await getLastActivatedAt(tab.id);
    const ageMs = now - (Number.isFinite(lastActivatedAt) ? lastActivatedAt : now);

    if (ageMs >= maxAgeMs) {
      expiredTabIds.push(tab.id);
    }
  }

  if (expiredTabIds.length === 0) {
    return 0;
  }

  let closed = 0;
  for (const tabId of expiredTabIds) {
    try {
      await browser.tabs.remove(tabId);
      closed += 1;
    } catch (error) {
      continue;
    }
  }

  return closed;
}

async function markClosableTabsOverdue() {
  const settings = await getSettings();
  const tabs = await browser.tabs.query({});
  const overdueAt = Date.now() - settings.timeoutHours * 60 * 60 * 1000;

  await Promise.all(tabs.map((tab) => {
    if (typeof tab.id !== "number" || tab.pinned) {
      return undefined;
    }
    return browser.sessions.setTabValue(tab.id, LAST_ACTIVATED_KEY, overdueAt);
  }));
}

async function markOverdueAndClean() {
  await markClosableTabsOverdue();
  return closeExpiredTabs();
}

async function getStatus() {
  const settings = await getSettings();
  const tabs = await browser.tabs.query({});
  const now = Date.now();
  const maxAgeMs = settings.timeoutHours * 60 * 60 * 1000;
  let trackedCount = 0;
  let closableOverdueCount = 0;

  for (const tab of tabs) {
    if (typeof tab.id !== "number") {
      continue;
    }

    const lastActivatedAt = await getLastActivatedAt(tab.id);
    if (Number.isFinite(lastActivatedAt)) {
      trackedCount += 1;
    }

    if (!tab.pinned && Number.isFinite(lastActivatedAt) && now - lastActivatedAt >= maxAgeMs) {
      closableOverdueCount += 1;
    }
  }

  return {
    timeoutHours: settings.timeoutHours,
    openTabCount: tabs.length,
    trackedCount,
    closableOverdueCount
  };
}

browser.tabs.onActivated.addListener(({ tabId }) => {
  setTabTouched(tabId);
});

browser.tabs.onCreated.addListener((tab) => {
  ensureTabTracked(tab);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.pinned !== undefined || changeInfo.url !== undefined || changeInfo.title !== undefined) {
    ensureTabTracked(tab);
  }
});

browser.runtime.onMessage.addListener((message) => {
  if (!message || typeof message !== "object") {
    return undefined;
  }

  if (message.type === "get-status") {
    return getStatus();
  }

  if (message.type === "mark-overdue-and-clean") {
    return markOverdueAndClean().then((closedCount) => ({ closedCount }));
  }

  return undefined;
});

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    closeExpiredTabs();
  }
});

async function start() {
  await syncTrackedTabs();
  await closeExpiredTabs();
  await browser.alarms.create(ALARM_NAME, { periodInMinutes: CHECK_INTERVAL_MINUTES });
}

start();
