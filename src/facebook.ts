// @ts-expect-error
chrome ??= browser;

main();

async function main() {
  const config = (await chrome.storage.sync.get("df-config")) as {
    ["df-config"]?: Config;
  };

  init(config?.["df-config"]);
}

const defaultConfig: Config = {
  facebook: {
    removeAllOfSuggestions: false,
    suggestionCaptureText: "Suggested for you",
    videoContainerSelector: "div[data-visualcompletion]",
    showVideoButtonLabel: "Show Video",
    hideVideoButtonLabel: "Hide Video",
    showPhotoButtonLabel: "Show Photo",
    hidePhotoButtonLabel: "Hide Photo",
    imageAltTextSize: "hsl(214, 100%, 59%)",
    imageAltTextColor: "1rem",
    imageBlurAmount: "15px",
  },
};

function init(config: Partial<Config> = defaultConfig) {
  console.log("[DF] config: ", config);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (
            node?.textContent?.includes(
              config.facebook?.suggestionCaptureText || "Suggested for you",
            ) &&
            node instanceof HTMLDivElement
          ) {
            if (config.facebook?.removeAllOfSuggestions === true) {
              node.remove();
              continue;
            }

            //#region Hide suggested videos
            const nodeObserver = new MutationObserver((nodeMutations) => {
              for (const nodeMutation of nodeMutations) {
                for (const maybeVideoContainer of nodeMutation.addedNodes) {
                  if (!(maybeVideoContainer instanceof HTMLDivElement)) {
                    continue;
                  }

                  const videoElement =
                    maybeVideoContainer.querySelector("video");

                  if (!videoElement) {
                    continue;
                  }

                  const videoContainer = videoElement.closest(
                    config.facebook?.videoContainerSelector ||
                      "div[data-visualcompletion]",
                  )?.parentElement;

                  if (!(videoContainer instanceof HTMLDivElement)) {
                    continue;
                  }

                  observeForVideoThumbnail(videoContainer, config);

                  videoContainer.style.display = "none";

                  let hidden = true;
                  const btn = createButton();
                  btn.innerText =
                    config.facebook?.showVideoButtonLabel || "Show video";
                  btn.onclick = () => {
                    if (!(videoContainer instanceof HTMLDivElement)) {
                      return;
                    }

                    if (hidden) {
                      videoContainer.style.display = "block";
                      hidden = false;
                      btn.innerText =
                        config.facebook?.hideVideoButtonLabel || "Hide video";
                    } else {
                      videoContainer.style.display = "none";
                      hidden = true;
                      btn.innerText =
                        config.facebook?.showVideoButtonLabel || "Show video";
                    }
                  };
                  node.children[0].prepend(btn);
                  return;
                }
              }
            });

            nodeObserver.observe(node, {
              attributes: false,
              childList: true,
              subtree: true,
            });

            //#endregion Hide suggested videos

            //#region Hide suggested photos
            const allImages = node.querySelectorAll("img");

            for (const img of allImages) {
              if (img.width > 300) {
                addBlur(img, config);

                const imgContainer =
                  img.closest("a")?.parentElement?.parentElement;

                if (!imgContainer) {
                  continue;
                }

                imgContainer.style.display = "none";

                let hidden = true;
                const btn = createButton();
                btn.innerText =
                  config.facebook?.showPhotoButtonLabel || "Show photo";
                btn.onclick = () => {
                  if (!imgContainer) {
                    return;
                  }

                  if (hidden) {
                    imgContainer.style.display = "block";
                    hidden = false;
                    btn.innerText =
                      config.facebook?.hidePhotoButtonLabel || "Hide photo";
                  } else {
                    imgContainer.style.display = "none";
                    hidden = true;
                    btn.innerText =
                      config.facebook?.showPhotoButtonLabel || "Show photo";
                  }
                };
                node.children[0].prepend(btn);

                const altDiv = document.createElement("div");
                altDiv.style.color =
                  config.facebook?.imageAltTextColor || "hsl(214, 100%, 59%)";
                altDiv.style.fontSize =
                  config.facebook?.imageAltTextSize || "1rem";
                altDiv.innerHTML = img.alt;
                node.children[0].prepend(altDiv);
              }
            }

            //#endregion Hide suggested photos
          }
        }
      }
    }
  });

  observer.observe(document.body.getElementsByTagName("div")[0], {
    attributes: false,
    childList: true,
    subtree: true,
  });
}

function createButton() {
  const btn = document.createElement("button");
  btn.style.cursor = "pointer";
  return btn;
}

function addBlur(img: HTMLImageElement, config: Partial<Config>) {
  img.style.filter = `blur(${config.facebook?.imageBlurAmount || "15px"})`;

  img.onmouseenter = () => {
    img.style.filter = "blur(0px)";
  };

  img.onmouseleave = () => {
    img.style.filter = `blur(${config.facebook?.imageBlurAmount || "15px"})`;
  };

  const container = img.closest(`div[id*=":"]`);

  if (container instanceof HTMLDivElement) {
    container.onmouseenter = () => {
      img.style.filter = "blur(0px)";
    };

    container.onmouseleave = () => {
      img.style.filter = `blur(${config.facebook?.imageBlurAmount || "15px"})`;
    };
  }
}

function observeForVideoThumbnail(
  videoContainer: HTMLDivElement,
  config: Partial<Config>,
) {
  const observer = new MutationObserver((_mutations) => {
    const images = videoContainer.querySelectorAll("img");

    for (const thumbnail of images) {
      if (thumbnail instanceof HTMLImageElement && thumbnail.width > 300) {
        addBlur(thumbnail, config);
      }
    }
  });

  observer.observe(videoContainer, {
    attributes: false,
    childList: true,
    subtree: true,
  });
}

type FacebookConfig = {
  suggestionCaptureText: string;
  removeAllOfSuggestions: boolean;
  videoContainerSelector: string;
  showVideoButtonLabel: string;
  hideVideoButtonLabel: string;
  showPhotoButtonLabel: string;
  hidePhotoButtonLabel: string;
  imageAltTextSize: string;
  imageAltTextColor: string;
  imageBlurAmount: string;
};

type Config = {
  facebook: FacebookConfig;
};
