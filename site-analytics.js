(function () {
  const GA_ID = "G-MCGS825TDW";

  function canTrack() {
    return typeof window !== "undefined" && GA_ID && /^G-[A-Z0-9]+$/i.test(GA_ID);
  }

  function loadGa() {
    if (!canTrack()) {
      return;
    }
    if (window.__pcGaLoaded) {
      return;
    }
    window.__pcGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(gaScript);
  }

  function sendCalcEvent(eventName, detail) {
    if (!canTrack() || typeof window.gtag !== "function") {
      return;
    }
    const payload = detail && typeof detail === "object" ? detail : {};
    window.gtag("event", eventName, payload);
  }

  loadGa();

  document.addEventListener("click", function (event) {
    const button = event.target && event.target.closest ? event.target.closest("button") : null;
    if (!button) {
      return;
    }
    const label = (button.textContent || "").trim().slice(0, 80);
    sendCalcEvent("calculator_button_click", {
      button_label: label || "unknown",
      page_path: window.location.pathname
    });
  });

  document.addEventListener("pc:calculator_result", function (event) {
    const detail = event && event.detail ? event.detail : {};
    sendCalcEvent("calculator_result_rendered", {
      calculator_type: detail.type || "generic",
      page_path: window.location.pathname
    });
  });
})();
