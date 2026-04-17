(function () {
  const script = document.querySelector("script[data-currency-page]");
  if (!script) {
    return;
  }

  const fromCode = (script.dataset.from || "").toUpperCase();
  const toCode = (script.dataset.to || "").toUpperCase();
  const amountId = script.dataset.amountId || "amount";
  const rateId = script.dataset.rateId || "";
  const resultId = script.dataset.resultId || "result";

  const amountInput = document.getElementById(amountId);
  const rateInput = rateId ? document.getElementById(rateId) : null;
  const resultNode = document.getElementById(resultId);

  let liveRate = null;
  let fetchFailed = false;

  function formatRate(rate) {
    return Number(rate).toFixed(6).replace(/\.?0+$/, "");
  }

  function getRate() {
    if (rateInput) {
      const manualRate = parseFloat(rateInput.value);
      if (Number.isFinite(manualRate) && manualRate > 0) {
        return manualRate;
      }
    }
    return liveRate;
  }

  function showMessage(message) {
    if (resultNode) {
      resultNode.textContent = message;
    }
  }

  async function fetchLiveRate() {
    try {
      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}`
      );
      if (!response.ok) {
        throw new Error(`Rate request failed with status ${response.status}`);
      }
      const data = await response.json();
      const nextRate = data && data.rates ? Number(data.rates[toCode]) : NaN;
      if (!Number.isFinite(nextRate) || nextRate <= 0) {
        throw new Error("Rate missing from API response");
      }

      liveRate = nextRate;
      if (rateInput) {
        rateInput.value = formatRate(nextRate);
      }
    } catch (error) {
      fetchFailed = true;
      if (rateInput) {
        showMessage("Live rate unavailable. Enter a rate manually and click Convert.");
      } else {
        showMessage("Live rate unavailable right now. Please try again later.");
      }
    }
  }

  function calculate() {
    const amount = amountInput ? parseFloat(amountInput.value) || 0 : 0;
    const rate = getRate();

    if (!Number.isFinite(rate) || rate <= 0) {
      if (fetchFailed && !rateInput) {
        showMessage("Live rate unavailable right now. Please try again later.");
      } else {
        showMessage("Live rate unavailable. Enter a valid rate and click Convert.");
      }
      return;
    }

    const converted = amount * rate;
    showMessage(`${converted.toFixed(2)} ${toCode}`);
    document.dispatchEvent(
      new CustomEvent("pc:calculator_result", {
        detail: { type: "currency" }
      })
    );
  }

  window.convert = calculate;
  window.calc = calculate;

  fetchLiveRate();
})();
