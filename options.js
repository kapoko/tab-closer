const DEFAULT_SETTINGS = {
  timeoutHours: 12
};

const form = document.querySelector("#options-form");
const timeoutHoursInput = document.querySelector("#timeout-hours");
const status = document.querySelector("#status");

async function loadOptions() {
  const settings = await browser.storage.local.get(DEFAULT_SETTINGS);
  timeoutHoursInput.value = settings.timeoutHours;
}

async function saveOptions(event) {
  event.preventDefault();

  const timeoutHours = Number(timeoutHoursInput.value);
  if (!Number.isFinite(timeoutHours) || timeoutHours <= 0) {
    status.textContent = "Enter a timeout greater than 0 hours.";
    return;
  }

  await browser.storage.local.set({
    timeoutHours
  });

  status.textContent = "Saved.";
  window.setTimeout(() => {
    status.textContent = "";
  }, 2000);
}

form.addEventListener("submit", saveOptions);
loadOptions();
