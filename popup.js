document.addEventListener("DOMContentLoaded", () => {
  try {
    // Load saved settings
    chrome.storage.sync.get(["enabled", "mode", "blockShortcut"], (res) => {
      try {
        const enableProtection = document.getElementById("enableProtection");
        const modeRadios = document.querySelectorAll('input[name="mode"]');
        const blockShortcut = document.getElementById("blockShortcut");
        const iconDiv = document.querySelector('.icon');
        const heading = document.querySelector('h2');

        enableProtection.checked = res.enabled ?? true;
        document.querySelector(
          `input[name="mode"][value="${res.mode || "disable"}"]`,
        ).checked = true;
        blockShortcut.checked = res.blockShortcut ?? true;

        // Set initial enabled/disabled state
        setControlsState(enableProtection.checked);
        setActiveState(enableProtection.checked);

        // Save and refresh tab on change
        function updateSetting(key, value) {
          try {
            chrome.storage.sync.set({ [key]: value });
            chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
              if (tab?.url?.includes("leetcode.com")) {
                chrome.tabs.reload(tab.id);
              }
            });
          } catch (err) {
            console.error("Error updating setting:", err);
          }
        }

        enableProtection.addEventListener("change", (e) => {
          updateSetting("enabled", e.target.checked);
          setControlsState(e.target.checked);
          setActiveState(e.target.checked);
        });

        blockShortcut.addEventListener("change", (e) =>
          updateSetting("blockShortcut", e.target.checked),
        );

        modeRadios.forEach((radio) => {
          radio.addEventListener("change", (e) =>
            updateSetting("mode", e.target.value),
          );
        });

        function setControlsState(enabled) {
          modeRadios.forEach(radio => radio.disabled = !enabled);
          blockShortcut.disabled = !enabled;
        }

        function setActiveState(enabled) {
          if (enabled) {
            iconDiv.classList.add('active');
            iconDiv.classList.remove('inactive');
          } else {
            iconDiv.classList.add('inactive');
            iconDiv.classList.remove('active');
          }
        }
      } catch (err) {
        console.error("Error in popup logic:", err);
      }
    });
  } catch (err) {
    console.error("Error accessing chrome.storage in popup:", err);
  }
});
