// Detect macOS safely
function detectIsMac() {
  return (
    navigator.userAgentData?.platform === "macOS" ||
    navigator.userAgent.includes("Macintosh")
  );
}

// Show toast when shortcut is blocked
function showToast(message) {
  const id = "lc-toast-message";
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = id;
  toast.textContent = message;

  Object.assign(toast.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#333",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    zIndex: "2147483647", // maximum value
    fontSize: "15px",
    fontFamily: "system-ui, sans-serif",
    boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
    transition: "opacity 0.4s ease-in-out",
    opacity: "1",
    pointerEvents: "none", // avoid blocking clicks
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 2500);
}

function applyProtection(enabled, mode, blockShortcut) {
  const observer = new MutationObserver(() => {
    const btn = document.querySelector(
      '[data-e2e-locator="console-submit-button"]',
    );
    if (btn) {
      // Reset to default
      btn.disabled = false;
      btn.style.opacity = 1;
      btn.style.position = "";
      btn.style.top = "";
      btn.style.left = "";
      btn.title = "";
      const span = btn.querySelector("span");
      if (span) span.textContent = "Submit";

      // Apply protection
      if (enabled) {
        if (mode === "disable") {
          btn.disabled = true;
          btn.style.opacity = 0.4;
          btn.style.fontSize = "10px";
          btn.title = "Submit disabled by extension";
          if (span) span.textContent = "SUBMIT DISABLED BY EXTENSION";
        } else if (mode === "move" || mode === "hide") {
          btn.style.display = "none";
          btn.title = "Hidden by extension";
        }
      }

      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Keyboard shortcut blocking
  function blockShortcutHandler(e) {
    const isMac = detectIsMac();
    const isSubmitKey =
      (e.ctrlKey || (isMac && e.metaKey)) && e.key === "Enter";

    if (blockShortcut && isSubmitKey) {
      e.preventDefault();
      e.stopPropagation();

      const keyLabel = isMac ? "⌘+Enter" : "Ctrl+Enter";
      showToast(`${keyLabel} submission disabled by extension`);
    }
  }

  window.removeEventListener("keydown", blockShortcutHandler);
  window.addEventListener("keydown", blockShortcutHandler, true);
}

// Load from chrome.storage and apply logic
try {
  chrome.storage.sync.get(
    ["enabled", "mode", "blockShortcut"],
    ({ enabled = true, mode = "disable", blockShortcut = true }) => {
      try {
        applyProtection(enabled, mode, blockShortcut);
      } catch (err) {
        console.error("Error in applyProtection:", err);
      }
    },
  );
} catch (err) {
  console.error("Error accessing chrome.storage:", err);
}
