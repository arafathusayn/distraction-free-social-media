"use strict";
// @ts-expect-error
chrome ??= browser;
const df = {
    facebook: {
        removeAllOfSuggestions: false,
        suggestionCaptureText: "Suggested for you",
        videoContainerSelector: "div[data-visualcompletion]",
        showVideoButtonLabel: "Show Video",
        hideVideoButtonLabel: "Hide Video",
        showPhotoButtonLabel: "Show Photo",
        hidePhotoButtonLabel: "Hide Photo",
        imageAltTextSize: "1rem",
        imageAltTextColor: "hsl(214, 100%, 59%)",
        imageBlurAmount: "15px",
    },
};
const defaultConfigJson = JSON.stringify(df, null, 2);
async function setup() {
    const data = await chrome.storage.sync.get("df-config");
    const configTextArea = document.getElementById("configText");
    const configJson = data["df-config"] && JSON.stringify(data["df-config"], null, 2);
    if (configTextArea instanceof HTMLTextAreaElement) {
        configTextArea.innerHTML = configJson || defaultConfigJson;
        configTextArea.value = configJson || defaultConfigJson;
    }
    chrome.storage.sync.set({ "df-config": null });
}
setup();
document.getElementById("saveButton")?.addEventListener("click", async () => {
    const configTextArea = document.getElementById("configText");
    if (configTextArea instanceof HTMLTextAreaElement) {
        await chrome.storage.sync.set({
            "df-config": JSON.parse(configTextArea.value),
        });
        const btn = document.getElementById("saveButton");
        if (btn instanceof HTMLButtonElement) {
            btn.disabled = true;
        }
    }
});
document.getElementById("resetButton")?.addEventListener("click", () => {
    const configTextArea = document.getElementById("configText");
    if (configTextArea instanceof HTMLTextAreaElement) {
        configTextArea.innerHTML = defaultConfigJson;
        configTextArea.value = defaultConfigJson;
        chrome.storage.sync.set({
            "df-config": JSON.parse(defaultConfigJson),
        });
    }
});
