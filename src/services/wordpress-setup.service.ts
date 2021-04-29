// This function is setting a series of methods in the global scope
// so that it can be accesible in woocommerce methods such ass addToCart

import store from "@/store/store";
import awsService from "@/services/aws.service";
import utilsService from "@/services/utils.service";
import Dedicatucancion from "@/models/Dedicatucancion";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getImageFronDiv: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    soundsoner: any;
  }
}

const toggleSpinner = () => {
  const el: HTMLElement | null = document.querySelector(".loader-spinner");
  if (el?.classList.contains("hidden")) el.classList.remove("hidden");
  else el?.classList.add("hidden");
};

const validateInputs = () => {
  let valid = true;
  ["songId", "songTitle", "songArtist"].forEach((k) => {
    const key = k as keyof typeof Dedicatucancion;
    const el = document.getElementById(key);
    const storeValue = store.state[key];
    if (!storeValue || storeValue === Dedicatucancion[key]) {
      el?.classList.add("-error");
      valid = false;
    } else {
      el?.classList.remove("-error");
    }
  });
  return valid;
};

export default function (): void {
  window.getImageFronDiv = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (validateInputs()) {
        if (store.state.isCustomImage) {
          toggleSpinner();
          const identifier = "_" + Math.random().toString(36).substr(2, 9);
          awsService
            .saveObj(
              identifier,
              { custom_image: store.state.customImage },
              "soundsonner-data-tmp"
            )
            .then(() => {
              utilsService.setWindowObj(identifier);
              toggleSpinner();
              resolve();
            });
        } else {
          utilsService.setWindowObj();
          resolve();
        }
      } else {
        reject();
      }
    });
  };
}
