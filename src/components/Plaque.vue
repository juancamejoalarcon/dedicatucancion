<template>
  <div class="plaque" ref="mainContainer">
    <div class="plaque__zoom-controls" v-if="showZoomControls">
      <div class="plaque__zoom-controls__container">
        <button type="button" @click="zoom(false)">-</button>
        <button type="button" @click="zoom(true)">+</button>
      </div>
    </div>
    <div class="plaque__container" :class="{ 'border-none': hideBorder }">
      <div class="plaque__watermark" v-if="showWatermark">
        <div class="plaque__watermark__container">
          <img :src="images.logo" />
        </div>
      </div>
      <span class="mask-image-heart"></span>
      <span class="mask-image-circle"></span>
      <div
        class="plaque__image"
        :class="{
          'mask-image-heart': shape === 'heart',
          'mask-image-circle': shape === 'circle',
        }"
      >
        <img :src="albumImage" v-if="!isCustomImage" />
        <clipper-fixed
          :src="customImage"
          bg-color="black"
          shadow="rgba(0,0,0,0)"
          @load="imgLoad"
          :rotate="0"
          :area="100"
          ref="clipperContainer"
          v-if="isCustomImage"
        />
      </div>
      <div class="plaque__qr">
        <img :src="qr" />
      </div>
      <div class="plaque__info" ref="infoContainer">
        <div class="plaque__info__song">
          <span class="plaque__info__song__name">{{
            infoFilter(songTitle)
          }}</span>
          <span>{{ infoFilter(songArtist) }}</span>
        </div>
        <div class="plaque__info__like">
          <img :src="images.like" />
        </div>
      </div>
      <div class="plaque__controls">
        <img :src="images.controls" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import images from "@/services/images.service";
import Dedicatucancion from "@/models/Dedicatucancion";
@Component({
  props: {},
})
export default class Plaque extends Vue {
  @Watch("isCustomImage", { immediate: true })
  setClipper(newVal: boolean): void {
    if (newVal) {
      this.fixJsClipperBoolean = false;
      setTimeout(() => {
        const { scale, drawPos } = this.$store.state;
        const { clipperContainer } = this.$refs;
        clipperContainer.setWH$.next(scale);
        clipperContainer.setTL$.next(drawPos);
        const clipperEl = clipperContainer.$el as HTMLElement;
        const areaCover: HTMLElement | null = clipperEl.querySelector(
          ".vuejs-clipper-fixed__stem-outer"
        );
        if (areaCover)
          areaCover.style?.setProperty("width", "96%", "important");
        if (this.editCustomImageEnabled) this.setScaleAndDrawPosListenner();
      }, 0);
    }
  }
  private showZoomControls = false;
  private showWatermark = true;
  private songTitle = "";
  private songArtist = "";
  private customImage = "";
  private shape = "classic";
  private albumImage = "";
  private qr = "";
  private isCustomImage = false;
  private editCustomImageEnabled = false;
  private hideBorder = false;
  private scale = 1;
  private fixJsClipperBoolean = false;

  private images: { [k: string]: string } = images;

  $refs!: {
    infoContainer: HTMLElement;
    mainContainer: HTMLElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clipperContainer: any;
  };

  created(): void {
    this.updateState(this.$store.state);
    this.$store.subscribe((mutation, state) => {
      this.updateState(state);
    });
  }

  mounted(): void {
    this.resizeSomeElements();
    window.addEventListener("resize", this.resizeSomeElements);
    if (this.isCustomImage) this.setEditingMode();
    if (this.$store.state.mode === "editor") {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === "addCoordsFix") {
          this.$refs.clipperContainer?.setWH$.next(parseFloat(state.scale));
          this.$refs.clipperContainer?.setTL$.next(state.drawPos);
        }
      });
    }
  }

  updateState(state: typeof Dedicatucancion): void {
    Object.keys(state).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[key] = (state as any)[key];
    });
    if (state.mode === "cart" || state.mode === "order") {
      this.$refs.clipperContainer?.setWH$.next(state.scale);
      this.$refs.clipperContainer?.setTL$.next(state.drawPos);
    }
    this.setEditingMode();
  }

  resizeFontOfInfo(): void {
    const { infoContainer, mainContainer } = this.$refs;
    const parentWidth: number | undefined =
      infoContainer?.parentElement?.offsetWidth;
    const maxWidth: number = mainContainer
      ? parseInt(window?.getComputedStyle(mainContainer).maxWidth.slice(0, -2))
      : 1;
    const scale: number = (parentWidth ? parentWidth : 1) / maxWidth;
    const fontSize = 16;
    if (infoContainer) {
      if (scale < 1) infoContainer.style.fontSize = scale * fontSize + "px";
      else infoContainer.style.fontSize = fontSize + "px";
    }
  }

  resizeSomeElements(): void {
    this.resizeFontOfInfo();
  }

  infoFilter(value: string): string {
    if (value?.length > 76) return value.substring(0, 76) + "...";
    return value;
  }

  setEditingMode(): void {
    if (!this.editCustomImageEnabled) {
      setTimeout(() => {
        const { clipperContainer } = this.$refs;
        if (clipperContainer) {
          const clipperEl = clipperContainer.$el as HTMLElement;
          clipperEl.style.pointerEvents = "none";
          const areaCover: HTMLElement | null = clipperEl.querySelector(
            ".vuejs-clipper-fixed__cover"
          );
          if (areaCover) areaCover.style.display = "none";
        }
      }, 0);
    }
  }

  zoom(zoom: boolean): void {
    const scale = this.$store.state.scale;
    const zoomScale = parseFloat(
      (zoom ? scale + 0.1 : scale - 0.1).toPrecision(5)
    );
    const { clipperContainer } = this.$refs;
    clipperContainer.setWH$.next(zoomScale);
    this.setScale(zoomScale);
  }

  imgLoad(): void {
    if (this.fixJsClipperBoolean) this.fitImageToBorder();
  }

  fitImageToBorder(): void {
    const { clipperContainer } = this.$refs;
    const clipperEl = (clipperContainer.$el as HTMLElement).querySelector(
      ".vuejs-clipper-fixed__img.js-img"
    );
    const clipperElWrapper = document.querySelector(
      ".vuejs-clipper-fixed__wrap.js-wrap"
    );
    const imageHeight = clipperEl?.clientHeight;
    const wrapperHeight = clipperElWrapper?.clientHeight;
    const imageWidth = clipperEl?.clientWidth;
    const wrapperWidth = clipperElWrapper?.clientWidth;
    if (imageHeight && imageWidth) {
      if (imageHeight < imageWidth) {
        if (imageHeight && wrapperHeight) {
          // 0.05 to adjust a litle the black border
          this.scale = wrapperHeight / imageHeight + 0.04;
          this.$refs.clipperContainer.setWH$.next(this.scale);
          this.setScale(this.scale);
        }
      } else if (wrapperWidth && imageHeight > imageWidth) {
        // 0.05 to adjust a litle the black border
        this.scale = wrapperWidth / imageWidth;
        this.$refs.clipperContainer.setWH$.next(this.scale);
        this.setScale(this.scale);
      }
    }
  }

  setScaleAndDrawPosListenner(): void {
    const { clipperContainer } = this.$refs;
    clipperContainer.onChange$.subscribe(
      (e: number | { left: number; top: number }) => {
        if (typeof e === "number") {
          this.setScale(e);
          this.fixJsClipperBoolean = true;
        }
        if (typeof e === "object") {
          if (e.left !== 0 && e.top !== 0) {
            this.setDrawPos(e);
          }
        }
      }
    );
  }

  setScale(scale: number): void {
    this.$store.dispatch("setScale", scale);
  }

  setDrawPos(drawPos: { left: number; top: number }): void {
    this.$store.dispatch("setDrawPos", drawPos);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="postcss">
.plaque {
  max-width: 425px;
  &__container {
    background-color: white;
    border: 1px solid #dcdcdc;
  }
  &__watermark {
    position: relative;
    width: 100%;
    z-index: 9;
    pointer-events: none;
    &__container {
      position: absolute;
      margin-top: 73%;
      width: 100%;
      img {
        transform: rotate(-61deg) scale(1.8);
        opacity: 0.2;
      }
    }
  }
  &__zoom-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    &__container {
      width: 100%;
      display: flex;
      height: 49px;
      button {
        width: 100%;
        color: black;
        border: 1px solid #e3e3e3;
        border-bottom: none;
        background-color: #ebebebdc;
        cursor: pointer;
        font-size: 33px;
        display: flex;
        justify-content: center;
        align-items: center;
        &:hover {
          background-color: #bdbcbc;
        }
      }
    }
  }
  &__image {
    margin-top: 7%;
    margin-left: 7%;
    margin-right: 7%;
  }
  &__qr {
    width: 100%;
    padding: 0% 20%;
    padding-top: 4%;
  }
  &__player {
    padding: 1.5rem;
  }
  &__info {
    display: flex;
    padding: 3.8%;
    line-height: 180%;
    justify-content: space-between;
    align-items: center;
    color: black;
    font-size: 16px;
    &__song {
      display: flex;
      flex-direction: column;
      color: black;
      text-align: left;
      &__name {
        font-weight: 600;
        padding-bottom: 5.5%;
      }
    }
    &__like {
      width: 5.2%;
    }
  }
  &__controls {
    padding-top: 4%;
    padding-left: 4.5%;
    padding-right: 4.5%;
    padding-bottom: 5.5%;
  }
}
</style>
