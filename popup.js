const timeoutHours = document.querySelector("#timeout-hours");
const openTabCount = document.querySelector("#open-tab-count");
const trackedCount = document.querySelector("#tracked-count");
const overdueCount = document.querySelector("#overdue-count");
const cleanNowButton = document.querySelector("#clean-now");
const status = document.querySelector("#status");

async function refreshStatus() {
  const data = await browser.runtime.sendMessage({ type: "get-status" });
  timeoutHours.textContent = `${data.timeoutHours}h`;
  openTabCount.textContent = data.openTabCount;
  trackedCount.textContent = data.trackedCount;
  overdueCount.textContent = data.closableOverdueCount;
}

async function cleanNow() {
  cleanNowButton.disabled = true;
  status.textContent = "Marking tabs overdue and closing...";

  try {
    const result = await browser.runtime.sendMessage({ type: "mark-overdue-and-clean" });
    status.textContent = `Closed ${result.closedCount} tab${result.closedCount === 1 ? "" : "s"}.`;
    await refreshStatus();
  } finally {
    cleanNowButton.disabled = false;
  }
}

cleanNowButton.addEventListener("click", cleanNow);
refreshStatus();
