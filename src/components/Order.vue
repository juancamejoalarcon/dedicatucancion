<template>
  <div class="order" v-if="dedicatucancionJson.mode !== 'editor'">
    <Plaque />
    <button
      v-if="dedicatucancionJson.mode === 'order'"
      class="order__download-button"
      type="button"
      @click="download"
    >
      Descargar
    </button>
  </div>
  <div v-else>
    <modal
      classes="modal-class"
      :width="'95%'"
      :height="'95%'"
      name="editor-modal"
    >
      <div class="modal-class__container">
        <Form ref="form" />
      </div>
      <div>Descargar Imagen</div>
      <div class="modal-class__buttons">
        <button type="button" @click="$modal.hide('editor-modal')">
          CERRAR
        </button>
        <button type="button" @click="save">ACTUALIZAR</button>
      </div>
    </modal>
    <button class="modal-button" type="button" @click="showEditorModal">
      Editar canción
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Prop } from "vue-property-decorator";

import awsService from "@/services/aws.service";
import utilsService from "@/services/utils.service";
import pdfService from "@/services/pdf.service";
import spotifyService from "@/services/spotify.service";

// import Dedicatucancion from "@/models/Dedicatucancion";
import Plaque from "./Plaque.vue";
import Form from "@/components/Form.vue";

@Component({
  components: { Plaque, Form },
})
export default class Order extends Vue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Prop() readonly dedicatucancionJson!: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private amazonObj: any = {};
  private order = "";

  mounted(): void {
    this.$store.dispatch("setMode", this.dedicatucancionJson.mode);
    switch (this.dedicatucancionJson.mode) {
      case "order":
        this.setOrderState();
        break;
      case "cart":
        this.setCartState();
        break;
      case "editor":
        this.setOrderInStore(this.dedicatucancionJson.order);
        this.$store.dispatch("setEditCustomImageEnabled", true);
        break;
      default:
        break;
    }
  }

  dispatch(array: Array<[string, boolean]>): void {
    array.forEach((array) => {
      this.$store.dispatch(array[0], array[1]);
    });
  }

  download(): void {
    pdfService.drawAndDownloadPdf(false);
  }

  setOrderState(): void {
    this.dispatch([
      ["setShowZoomControls", false],
      ["setShowWatermark", false],
      ["setHideBorder", true],
      ["setEditCustomImageEnabled", false],
    ]);
    this.setOrderInStore(utilsService.getQueryParam("key"));
  }

  setOrderInStore(order: string | null): void {
    if (order) {
      this.order = order;
      awsService.getObj(order).then((data) => {
        this.amazonObj = data;
        const { soundsonner } = data;
        spotifyService.getTrackId(soundsonner.song_id).then((track) => {
          this.dispatch([
            ["setIsCustomImage", soundsonner.type === "personal"],
            ["addSongTitle", track.name],
            ["addSongArtist", spotifyService.getArtists(track)],
            ["addAlbumTitle", track.album.name],
            ["setShape", soundsonner.shape],
            ["setQr", soundsonner.soundwave],
            ["addSongId", soundsonner.song_id],
          ]);
          if (soundsonner.type === "personal") {
            this.$store.dispatch("setCustomImage", soundsonner.custom_image);
            setTimeout(() => {
              this.$store.dispatch("setScale", soundsonner.scale);
              this.$store.dispatch("setDrawPos", soundsonner.drawPos);
              this.$store.dispatch("addCoordsFix", soundsonner.addCoordsFix);
            }, 10);
          } else {
            this.$store.dispatch(
              "addAlbumImage",
              data?.soundsonner?.album_image
            );
          }
          spotifyService.setHTMLParams();
          spotifyService.setSpotifyButton(track);
          this.setDownloadButton();
        });
      });
    }
  }

  setDownloadButton(): void {
    const buttonVisualize = document.getElementById("visualize-button");
    if (buttonVisualize) {
      buttonVisualize.addEventListener("click", () => {
        pdfService.drawAndDownloadPdf(true).then((data) => {
          utilsService.openPdfBase64NewTab(data.substring(51));
        });
      });
    }
    const buttonDownload = document.getElementById("download-button");
    if (buttonDownload) {
      buttonDownload.addEventListener("click", () => {
        pdfService.drawAndDownloadPdf(false);
      });
    }
  }

  setCartState(): void {
    let json = JSON.parse(
      document.querySelector("#json-content-soundsonner")?.textContent as string
    );
    this.dispatch([
      ["setShowZoomControls", false],
      ["setShowWatermark", true],
      ["setHideBorder", false],
      ["setEditCustomImageEnabled", false],
      ["setIsCustomImage", json.type === "personal"],
      ["addSongTitle", json.song_title],
      ["addSongArtist", json.song_artist],
      ["addAlbumTitle", json.album_title],
      ["setShape", json.shape],
      ["setQr", json.soundwave],
      ["addSongId", json.song_id],
    ]);

    if (json.type === "personal") {
      awsService
        .getObj(json.custom_image, "soundsonner-data-tmp")
        .then((data) => {
          this.$store.dispatch("setCustomImage", data.custom_image);
          setTimeout(() => {
            this.$store.dispatch("setScale", json.scale);
            this.$store.dispatch("setDrawPos", json.drawPos);
          }, 10);
        });
    } else {
      this.$store.dispatch("addAlbumImage", json.album_image);
    }
    spotifyService.setHTMLParams();
  }

  showEditorModal(): void {
    this.$modal.show("editor-modal", {});
    this.setOrderInStore(this.dedicatucancionJson.order);
  }

  save(): void {
    var r = confirm("¿Seguro que quieres actulizar?");
    if (r) {
      utilsService.setWindowObj();
      this.amazonObj.soundsonner = window.soundsoner;
      awsService.saveObj(this.order, this.amazonObj).then(() => {
        this.$modal.hide("editor-modal", {});
        spotifyService.setHTMLParams();
      });
    }
  }
}
</script>

<style lang="postcss">
.order {
  text-align: center;
  max-width: 425px;
  margin: auto;

  &__download-button {
    margin-top: 15px;
    cursor: pointer;
    background-color: #01756f;
    color: #fff;
    border: none;
    padding: 4% 2%;
    font-size: 18px;
    width: 70%;
    @media (max-width: 450px) {
      font-size: 5vw;
    }
  }
}
.vm--container {
  z-index: 999999 !important;
}

.modal-button {
  outline: none;
  background: #fff;
  border: 0;
  padding: 10px 18px;
  cursor: pointer;
  color: #fff;
  background: #50c9ba;
  font-weight: 600;
  border-radius: 3px;
  min-width: 90px;
  margin-bottom: 8px;
  margin-top: 8px;
  margin-right: 8px;
  border-top: 1px solid #eee;
  &:hover {
    background-color: #4cbfb1;
  }
}
.modal-class {
  /* overflow: scroll !important; */
  .form {
    padding-top: 3%;
    padding-bottom: 5%;
  }
  &__container {
    overflow: scroll !important;
    height: 100%;
  }

  &__buttons {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 60px;
    display: flex;
    z-index: 9;
    button {
      border: 1px solid rgb(180, 180, 180);
      background: #50c9ba;
      padding: 0;
      margin: 0;
      cursor: pointer;
      box-sizing: border-box;
      height: 100%;
      color: white;
      font: inherit;
      outline: none;
      width: 100%;
      &:hover {
        background: #4cbfb1;
        color: white;
      }
    }
  }
}
</style>
