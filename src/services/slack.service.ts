import axios from "axios";
import store from "@/store/store";

const webHook = process.env.VUE_APP_SLACK_WEBHOOK;
const headers = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

class SlackService {
  listenners(): void {
    const addToCartButton = document.querySelector(".add_to_cart_button");
    addToCartButton?.addEventListener("click", () => {
      this.initedCheckout();
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendWebhook(message: any): void {
    console.log(webHook);
    axios
      .post(webHook, message, headers)
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  initedCheckout(): void {
    const { songTitle, songArtist, songId, shape, isCustomImage } = store.state;
    const message = {
      channel: "#general",
      text: "Alguien le ha dado al botón de add to cart",
      attachments: [
        {
          color: "#556270",
          title: "Parámetros de la placa",
          text: `Título canción: ${songTitle}\n Artista: ${songArtist}\n Id de canción: ${songId}\n Shape: ${shape}\n Imagen personalizada: ${isCustomImage}`,
        },
      ],
    };
    this.sendWebhook(message);
  }
}

export default new SlackService();
