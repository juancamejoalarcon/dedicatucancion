<template>
  <span>
    <div class="form" ref="form">
      <div class="form__container">
        <div class="form__row" v-if="!isMobile">
          <Plaque />
        </div>
        <div class="form__row">
          <div class="form__tabs">
            <div class="form__tabs__radio">
              <label>
                <input
                  type="radio"
                  name="radio"
                  :checked="!isCustomImage"
                  @click="setFormMode(false)"
                />
                <div>
                  <img :src="images.spotify_icon" />
                  CANCIÓN
                </div>
              </label>
            </div>
            <div class="form__tabs__radio">
              <label>
                <input
                  type="radio"
                  name="radio"
                  :checked="isCustomImage"
                  @click="setFormMode(true)"
                />
                <div>
                  <img :src="images.yourimage_icon" />
                  TU PROPIA IMAGEN
                </div>
              </label>
            </div>
          </div>
          <div class="form__inputs">
            <div class="form__inputs__container">
              <div class="form__inputs__text" id="songId" ref="songId">
                <input
                  type="text"
                  placeholder="Canción, artista álbum"
                  @focus="onSongIdFocus"
                  @blur="onBlur"
                  @input="search"
                  @change="search"
                  v-model="searchInput"
                  ref="search"
                />
                <div class="-error__message">Debes elegir una canción</div>
                <svg class="spinner" viewBox="0 0 50 50" v-if="loadingSpoti">
                  <circle
                    class="path"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke-width="5"
                  />
                </svg>
              </div>
              <div class="form__inputs__text__songs" v-if="displayList">
                <div class="form__inputs__text__songs__container">
                  <div
                    class="form__inputs__text__songs__song"
                    v-for="item in items"
                    :key="item.id"
                    @click="selectSong(item)"
                  >
                    <img :src="item.album.images[0].url" />
                    <div class="form__inputs__text__songs__song__info">
                      <div class="form__inputs__text__songs__song__info__title">
                        {{ item.name }}
                      </div>
                      <div
                        class="form__inputs__text__songs__song__info__artist"
                      >
                        {{ getArtists(item) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form__inputs__text" id="songTitle" ref="songTitle">
                <input
                  type="text"
                  placeholder="Título de la canción"
                  @input="setSongTitle"
                  @focus="removeErrorClass"
                  :value="this.songTitle"
                />
                <div class="-error__message">
                  Escribe el título de la canción
                </div>
              </div>
              <div class="form__inputs__text" id="songArtist" ref="songArtist">
                <input
                  type="text"
                  placeholder="Nombre del artista"
                  @input="setSongArtist"
                  @focus="removeErrorClass"
                  :value="this.songArtist"
                />
                <div class="-error__message">Escribe el nombre del artista</div>
              </div>
              <div
                class="form__inputs__text"
                v-if="isCustomImage"
                ref="inputImage"
              >
                <label class="form__inputs__text__upload-image">
                  <div class="form__inputs__text__upload-image__button">
                    Cargar imagen
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    @change="uploadImage"
                  />
                </label>
              </div>
            </div>
          </div>
          <div class="form__player__container" v-if="isMobile">
            <Plaque />
          </div>
          <div class="form__shapes">
            <div class="form__shapes__container">
              <h2>Seleccionar versión</h2>
              <div class="form__shapes__row">
                <div class="form__shapes__shape">
                  <label>
                    <input
                      type="radio"
                      name="shape"
                      value="classic"
                      :checked="shape === 'classic'"
                      @change="setShape"
                    />
                    <img
                      :src="images.square"
                      :class="{ 'checked-icon': shape === 'classic' }"
                    />
                  </label>
                </div>
                <div class="form__shapes__shape">
                  <label>
                    <input
                      type="radio"
                      name="shape"
                      value="heart"
                      :checked="shape === 'heart'"
                      @change="setShape"
                    />
                    <img
                      :src="images.heart"
                      :class="{ 'checked-icon': shape === 'heart' }"
                    />
                  </label>
                </div>
                <div class="form__shapes__shape">
                  <label>
                    <input
                      type="radio"
                      name="shape"
                      value="circle"
                      :checked="shape === 'circle'"
                      @change="setShape"
                    />
                    <img
                      :src="images.circle"
                      :class="{ 'checked-icon': shape === 'circle' }"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="loader-spinner hidden" ref="spinner">
      <pulse-loader
        :loading="true"
        :color="'#5dc596'"
        :size="'35px'"
      ></pulse-loader>
    </div>
  </span>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { debounce } from "debounce";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
import Plaque from "./Plaque.vue";

import spotifyService from "@/services/spotify.service";
import utilsService from "@/services/utils.service";
import images from "@/services/images.service";

interface Event<T = EventTarget> {
  target: T;
}

@Component({
  components: { Plaque, PulseLoader },
})
export default class Form extends Vue {
  private images: { [k: string]: string } = images;
  private isCustomImage = false;
  private shape = "classic";
  private displayList = false;
  private loadingSpoti = false;
  private items: SpotifyApi.TrackObjectFull[] = [];
  private isMobile = window.innerWidth < 1000;
  private searchInput = "";
  private songTitle = "";
  private songArtist = "";

  mounted(): void {
    this.intialData();
    window.addEventListener("resize", this.onResize);
  }

  intialData(): void {
    this.$store.dispatch("setEditCustomImageEnabled", true);
    if (this.$store.state.mode !== "editor") {
      this.$store.dispatch("setShowWatermark", true);
    } else {
      this.$store.dispatch("setShowWatermark", false);
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === "addSongTitle") {
          this.songTitle = state.songTitle;
          this.searchInput = state.songTitle;
        }
        if (mutation.type === "addSongArtist") {
          this.songArtist = state.songArtist;
        }
        if (mutation.type === "setShape") {
          this.shape = state.shape;
        }
        if (mutation.type === "setIsCustomImage") {
          this.isCustomImage = state.isCustomImage;
          this.$store.dispatch("setShowZoomControls", state.isCustomImage);
        }
      });
    }
  }

  setFormMode(isCustomImage: boolean): void {
    this.isCustomImage = isCustomImage;
    this.$store.dispatch("setShowZoomControls", isCustomImage);
    this.$store.dispatch("setIsCustomImage", isCustomImage);
  }

  onResize(): void {
    this.isMobile = window.innerWidth < 1000;
  }

  private search = debounce(this.searchFunction, 200);

  searchFunction(): void {
    if (this.searchInput) {
      this.loadingSpoti = true;
      spotifyService
        .getSpotifyItems(this.searchInput)
        .then((data) => {
          this.items = data;
        })
        .finally(() => {
          this.loadingSpoti = false;
        });
    }
  }

  getArtists(item: SpotifyApi.TrackObjectFull): string {
    return spotifyService.getArtists(item);
  }

  selectSong(item: SpotifyApi.TrackObjectFull): void {
    this.$store.dispatch("addSongId", item.id);
    this.$store.dispatch(
      "setQr",
      `https://scannables.scdn.co/uri/plain/png/FFFFFF/black/820/spotify:track:${item.id}`
    );
    this.songTitle = item.name;
    this.songArtist = this.getArtists(item);
    this.$store.dispatch("addAlbumImage", item.album.images[0].url);
    this.$store.dispatch("addAlbumTitle", item.album.name);
    this.$store.dispatch("addSongArtist", this.getArtists(item));
    this.$store.dispatch("addSongTitle", this.songTitle);
    this.searchInput = item.name;
    document.getElementById("songTitle")?.classList.remove("-error");
    document.getElementById("songArtist")?.classList.remove("-error");
  }

  onBlur(): void {
    setTimeout(() => {
      this.displayList = false;
    }, 200);
  }

  uploadImage(e: Event<HTMLInputElement>): void {
    if (e.target.files?.length) {
      utilsService.getBase64FromInputFile(e.target.files[0]).then((result) => {
        this.$store.dispatch("setCustomImage", result);
      });
    }
  }

  setShape(e: Event<HTMLInputElement>): void {
    this.shape = e.target.value;
    this.$store.dispatch("setShape", this.shape);
  }

  removeInvalidChars(str: string): string {
    const ranges = [
      "\ud83c[\udf00-\udfff]", // U+1F300 to U+1F3FF
      "\ud83d[\udc00-\ude4f]", // U+1F400 to U+1F64F
      "\ud83d[\ude80-\udeff]", // U+1F680 to U+1F6FF
    ];
    return str.replace(new RegExp(ranges.join("|"), "g"), "");
  }

  setSongTitle(e: Event<HTMLInputElement>): void {
    this.songTitle = this.removeInvalidChars(e.target.value);
    this.$store.dispatch("addSongTitle", this.songTitle);
  }

  setSongArtist(e: Event<HTMLInputElement>): void {
    this.songArtist = this.removeInvalidChars(e.target.value);
    this.$store.dispatch("addSongArtist", this.songArtist);
  }

  onSongIdFocus(e: { target: HTMLInputElement }): void {
    this.displayList = true;
    this.removeErrorClass(e);
  }

  removeErrorClass(e: { target: HTMLInputElement }): void {
    const el = e.target.parentElement;
    if (el) el.classList.remove("-error");
  }
}
</script>

<style lang="postcss">
$grey: #e8e8e8;
$medium-grey: #cfcbc8;
$dark-grey: grey;
$orange: orange;
$green: #37a745;
$dark-green: #0A333;

.loader-spinner {
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  right: 0;
}

.form {
  max-width: 1000px;
  margin: auto;

  &__container {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    @media (max-width: 500px) {
      padding: 0.5rem;
    }
  }

  &__row {
    width: 100%;
    .plaque {
      @media (max-width: 1000px) {
        margin: auto;
        padding: 16px 0px;
      }
      @media (max-width: 490px) {
        padding-right: 4%;
        padding-left: 4%;
      }
    }
  }

  &__tabs {
    display: flex;
    width: 100%;
    margin-bottom: -2px;
    &__radio {
      width: 100%;
      font-weight: 500;
      line-height: 1.3rem;
      label {
        cursor: pointer;
        display: flex;
        justify-content: center;
        input {
          display: none;
          &:checked + div {
            background-color: white;
            border-right: 1px solid #e3e3e3;
            border-left: 1px solid #e3e3e3;
            border-top: 1px solid #e3e3e3;
          }
          &:not(:checked):hover + div {
          }
        }
        div {
          font-size: 16px;
          width: 100%;
          height: 100%;
          text-align: center;
          font-size: 16px;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: black;
          border: 1px solid #e3e3e3;
          border-bottom: none;
          background-color: #ebebebdc;
          @media (max-width: 500px) {
            font-size: 14px;
            padding: 5px;
          }
          img {
            max-width: 20px;
            margin-right: 8px;
          }
          &:hover {
            background-color: #bdbcbc;
          }
        }
      }
    }
  }

  &__inputs {
    background: white;
    padding: 1rem;
    padding-bottom: 0rem;
    border-left: 1px solid #dcdcdc;
    border-right: 1px solid #dcdcdc;
    &__container {
      padding-top: 10px;
      position: relative;
    }

    .-error {
      div {
        display: block;
      }
      input {
        border: 1px solid red;
      }
      &__message {
        color: red;
        padding-top: 0.5rem;
        display: none;
      }
    }

    &__text {
      padding: 5px 0px;
      .spinner {
        animation: rotate 2s linear infinite;
        z-index: 2;
        position: absolute;
        width: 35px;
        height: 35px;
        margin-left: -44px;
        margin-top: 8px;
        > .path {
          stroke: #01756f;
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }
      }
      @keyframes rotate {
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes dash {
        0% {
          stroke-dasharray: 1, 150;
          stroke-dashoffset: 0;
        }
        50% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -35;
        }
        100% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -124;
        }
      }
      input {
        width: 100%;
        height: 50px;
        border: 1px solid $grey;
        padding: 5px 20px;
        font-size: 16px;
      }
      &__upload-image {
        input {
          display: none;
        }
        &__button {
          cursor: pointer;
          width: 220px;
          border-radius: 25px;
          border: 2px solid #e8e8e8;
          background-color: #0a3333;
          height: 54px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          padding-bottom: 2px;
          font-size: 16px;
          margin: auto;
          margin-top: 16px;
        }
      }
      &__songs {
        position: absolute;
        width: 100%;
        background-color: white;
        max-height: 300px;
        overflow: scroll;
        box-shadow: 0px 12px 14px -6px rgba(0, 0, 0, 0.31);
        z-index: 9999;
        &__song {
          border-bottom: 1px solid $medium-grey;
          display: flex;
          padding: 1rem;
          width: 100%;
          cursor: pointer;
          &:hover {
            background-color: $grey;
          }
          img {
            max-width: 60px !important;
            max-height: 60px !important;
          }
          &__info {
            width: 100%;
            margin-left: 10px;
            &__title {
              font-weight: 600;
              font-size: 18px;
              padding-bottom: 10px;
              @media (max-width: 450px) {
                font-size: 15px;
              }
            }
            &__artist {
              font-size: 13px;
            }
          }
        }
      }
    }
  }

  &__player {
    &__container {
      border-left: 1px solid #dcdcdc;
      border-right: 1px solid #dcdcdc;
      background-color: white;
    }
  }

  &__shapes {
    background: white;
    padding: 1rem;
    padding-top: 0px;
    border-left: 1px solid #dcdcdc;
    border-right: 1px solid #dcdcdc;
    border-bottom: 1px solid #dcdcdc;
    &__container {
      h2 {
        padding-top: 17px;
        margin-bottom: 3px;
        padding-left: 15px;
        font-size: 24px;
        text-transform: none;
        font-weight: 700;
        @media (max-width: 420px) {
          padding-top: 0px;
          margin-bottom: 6px;
          padding-left: 6px;
          font-size: 20px;
        }
      }
    }
    &__row {
      display: flex;
    }

    &__shape {
      padding: 1rem;
      @media (max-width: 420px) {
        padding: 0.5rem;
      }
      label {
        cursor: pointer;
        input {
          display: none;
          &:checked + div {
            background-color: red;
          }
        }
        div {
          padding-bottom: 1px;
          font-size: 16px;
          width: 100px;
          margin: auto;
          text-align: center;
          border-radius: 25px;
          border: 2px solid $grey;
          background-color: $dark-green;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 10px;
          color: white;
        }
      }
    }
  }

  &__checkbox {
    label {
      cursor: pointer;
      display: flex;
      align-items: center;
      h3 {
        padding: 1rem;
      }
    }
  }

  &__quantity__price {
    display: flex;
    align-items: center;
  }

  &__quantity {
    &__container {
      text-align: center;
      width: 100px;
      h5 {
        padding: 0.5rem;
      }
    }

    &__buttons {
      height: 30px;
      display: flex;
      button {
        width: 100%;
        cursor: pointer;
      }
      span {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white;
        border: 1px solid $grey;
      }
    }
  }

  &__price {
    h1 {
      color: $green;
      font-size: 40px;
      padding: 0rem 1rem;
    }
  }

  &__submit {
    &__container {
      display: flex;
    }
    &__button {
      padding: 1rem;
      button {
        border-radius: 25px;
        height: 50px;
        width: 250px;
        cursor: pointer;
        background-color: $grey;
        border: 2px solid $green;
        color: $green;
        font-weight: 600;
      }
    }
  }
}
</style>
