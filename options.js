const DEFAULT_SETTINGS = {
  timeoutHours: 12,
  forceClosePromptTabs: true
};

const form = document.querySelector("#options-form");
const timeoutHoursInput = document.querySelector("#timeout-hours");
const forceClosePromptTabsInput = document.querySelector("#force-close-prompt-tabs");
const status = document.querySelector("#status");

async function loadOptions() {
  const settings = await browser.storage.local.get(DEFAULT_SETTINGS);
  timeoutHoursInput.value = settings.timeoutHours;
  forceClosePromptTabsInput.checked = settings.forceClosePromptTabs !== false;
}

async function saveOptions(event) {
  event.preventDefault();

  const timeoutHours = Number(timeoutHoursInput.value);
  if (!Number.isFinite(timeoutHours) || timeoutHours <= 0) {
    status.textContent = "Enter a timeout greater than 0 hours.";
    return;
  }

  await browser.storage.local.set({
    timeoutHours,
    forceClosePromptTabs: forceClosePromptTabsInput.checked
  });

  status.textContent = "Saved.";
  window.setTimeout(() => {
    status.textContent = "";
  }, 2000);
}

form.addEventListener("submit", saveOptions);
loadOptions();
