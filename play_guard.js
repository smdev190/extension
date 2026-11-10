/* Gemini Injector By ishowfacts — checkout price guard
 * Reads the actual terms inside the Play checkout iframe. Green means the free trial is safe to select; red means a charge may apply.
 */
(() => {
  if (window.__GAPT_GUARD || window.top === window) return; // Run only inside child frames.
  window.__GAPT_GUARD = true;

  // Unicode escapes preserve detection of Chinese checkout terms without exposing Chinese text in the extension source or UI.
  const FREE_WORDS = ["free trial", "start your free trial", "\u514d\u8d39\u8bd5\u7528", "US$0.00", "$0.00", "0,00", "€0.00", "won't be charged", "\u4e0d\u4f1a\u5411\u60a8\u6536\u8d39", "\u4e0d\u4f1a\u6536\u8d39"];
  const PAID_WORDS = ["/mo after", "/month after", "per month after", "\u7acb\u5373\u4ed8\u6b3e", "pay now", "\u4eca\u65e5\u6263\u6b3e", "charged today"];

  let bar = null;
  function paint(kind, text) {
    if (!document.body) return;
    if (!bar) {
      bar = document.createElement("div");
      bar.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;padding:10px 14px;" +
        "font:13px/1.5 -apple-system,Segoe UI,Roboto,'Microsoft YaHei',sans-serif;text-align:center;font-weight:600;";
      document.body.appendChild(bar);
    }
    bar.style.background = kind === "ok" ? "#1a7f37" : (kind === "bad" ? "#c62828" : "#616161");
    bar.style.color = "#fff";
    bar.textContent = text;
  }

  function judge() {
    let t = "";
    try {
      t = (document.body && document.body.innerText || "").toLowerCase();
    } catch (e) {
      return;
    }
    if (!t || t.length < 5) return;
    const free = FREE_WORDS.some((w) => t.includes(w.toLowerCase()));
    const paid = PAID_WORDS.some((w) => t.includes(w.toLowerCase()));

    if (free && !paid) {
      paint("ok", "✅ Free trial detected — It is safe to subscribe in this window (verify that the total is $0.00) · ishowfacts");
    } else if (paid && !free) {
      paint("bad", "❌ No free trial detected; an actual charge may apply — Do not subscribe. Go back, switch layers, and try again · ishowfacts");
    } else if (free && paid) {
      paint("warn", "⚠️ Both free and paid terms were detected — Verify the amount carefully before continuing · ishowfacts");
    } else {
      paint("warn", "… Price terms not detected (the checkout may still be loading) · ishowfacts");
    }
  }

  setTimeout(judge, 1200);
  setTimeout(judge, 3000);
  setTimeout(judge, 6000);
  try {
    const mo = new MutationObserver(() => judge());
    document.addEventListener("DOMContentLoaded", () => mo.observe(document.body, { childList: true, subtree: true, characterData: true }));
  } catch (e) {}
})();
