/**
 * Injected as `beforeInteractive` so it runs before hydration.
 * Chrome often warns about Next.js preloaded CSS chunks not being used immediately — harmless but noisy in DevTools.
 */
export const CHROME_PRELOAD_CONSOLE_SCRIPT = `
(function(){
  if (typeof window === "undefined") return;
  var w = window;
  if (w.__ebphtbPreloadNoiseSuppressed) return;
  w.__ebphtbPreloadNoiseSuppressed = true;
  function suppress(args) {
    try {
      var m = Array.prototype.slice.call(args).map(function (a) {
        return String(a == null ? "" : a);
      }).join(" ").toLowerCase();
      if (m.indexOf("preload") === -1) return false;
      if (m.indexOf("not used") !== -1 || m.indexOf("was preloaded") !== -1) return true;
      if (m.indexOf("_next/static") !== -1 && m.indexOf(".css") !== -1) return true;
      return false;
    } catch (e) {
      return false;
    }
  }
  var ow = console.warn;
  var oe = console.error;
  console.warn = function () {
    if (!suppress(arguments)) ow.apply(console, arguments);
  };
  console.error = function () {
    if (!suppress(arguments)) oe.apply(console, arguments);
  };
})();

`.trim();
