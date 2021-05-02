<template>
  <div class="plaque" ref="mainContainer">
    <div class="plaque__zoom-controls" v-if="showZoomControls">
      <div class="plaque__zoom-controls__container">
        <button
          type="button"
          class="plaque__zoom-controls__minus-button"
          @click="zoom(false)"
        ></button>
        <button
          type="button"
          class="plaque__zoom-controls__plus-button"
          @click="zoom(true)"
        ></button>
      </div>
    </div>
    <div class="plaque__container" :class="{ 'border-none': hideBorder }">
      <div class="plaque__watermark" v-if="showWatermark">
        <div class="plaque__watermark__container">
          <img :src="images.logo" />
        </div>
      </div>
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
          :handle-zoom-event="onZoomEvent"
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
        // if (areaCover) {
        //   areaCover.style?.setProperty("width", "96%", "important");
        // }
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
  private minScale = 1;
  private fixJsClipperBoolean = false;
  private relocatingImg = false;

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
    setTimeout(() => {
      this.resizeSomeElements();
    }, 1000);
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

  onZoomEvent(): number {
    return this.scale;
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
    if (zoomScale > this.minScale) {
      const { clipperContainer } = this.$refs;
      clipperContainer.setWH$.next(zoomScale);
      this.setScale(zoomScale);
    }
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
          this.minScale = this.scale;
          this.setScale(this.scale);
        }
      } else if (wrapperWidth && imageHeight > imageWidth) {
        // 0.05 to adjust a litle the black border
        this.scale = wrapperWidth / imageWidth;
        this.$refs.clipperContainer.setWH$.next(this.scale);
        this.minScale = this.scale;
        this.setScale(this.scale);
      }
    }
  }

  getOuterdivPos(type: string): number {
    let pos = 0;
    const outerdivEl = document.querySelector(".js-clipper-fixed");
    if (outerdivEl) {
      const boundingClient = outerdivEl?.getBoundingClientRect();
      if (type === "x") {
        pos = boundingClient.x + boundingClient.width;
      } else if (type === "y") {
        pos = boundingClient.y + boundingClient.height;
      }
    }
    return pos;
  }

  getInnerDivPos(type: string): number {
    let pos = 0;
    const outerdivEl = document.querySelector(
      ".vuejs-clipper-fixed__img-translate.js-img-translate"
    );
    if (outerdivEl) {
      const boundingClient = outerdivEl?.getBoundingClientRect();
      if (type === "x") {
        pos = boundingClient.x + boundingClient.width;
      } else if (type === "y") {
        pos = boundingClient.y + boundingClient.height;
      }
    }
    return pos;
  }

  dragListener(): void {
    const onDragFinished = () => {
      const { clipperContainer } = this.$refs;
      const drawPos = clipperContainer?.getDrawPos();
      const currentXPos = drawPos?.pos.sx;
      const positionOfOuterDivX = this.getOuterdivPos("x");
      const positionOfInnerDivX = this.getInnerDivPos("x");
      if (currentXPos < 0) {
        const newLeft =
          clipperContainer.toX(positionOfInnerDivX - positionOfOuterDivX) -
          clipperContainer.bgTL$.left;
        this.$refs.clipperContainer?.setTL$.next({
          left: newLeft,
          top: clipperContainer.bgTL$.top,
        });
      } else {
        if (positionOfInnerDivX < positionOfOuterDivX) {
          const newLeft =
            clipperContainer.bgTL$.left +
            clipperContainer.toX(positionOfOuterDivX - positionOfInnerDivX);
          this.$refs.clipperContainer?.setTL$.next({
            left: newLeft,
            top: clipperContainer.bgTL$.top,
          });
        }
      }
      const currentYPos = drawPos.pos.sy;
      const positionOfOuterDivY = this.getOuterdivPos("y");
      const positionOfInnerDivY = this.getInnerDivPos("y");
      if (currentYPos < 0) {
        const newTOP =
          clipperContainer.toY(positionOfInnerDivY - positionOfOuterDivY) -
          clipperContainer.bgTL$.top;
        this.$refs.clipperContainer?.setTL$.next({
          left: clipperContainer.bgTL$.left,
          top: newTOP,
        });
      } else {
        if (positionOfInnerDivY < positionOfOuterDivY) {
          const newTop =
            clipperContainer.bgTL$.top +
            clipperContainer.toY(positionOfOuterDivY - positionOfInnerDivY);
          this.$refs.clipperContainer?.setTL$.next({
            left: clipperContainer.bgTL$.left,
            top: newTop,
          });
        }
      }
    };
    window.addEventListener("mouseup", onDragFinished);
    window.addEventListener("touchend", onDragFinished);
    // vuejs-clipper-fixed__img-translate js-img-translate
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
          // if (e.left !== 0 && e.top !== 0) {
          this.setDrawPos(e);
          // }
        }
      }
    );
    this.dragListener();
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
  .js-clipper-fixed {
    position: relative;
    &:after {
      content: "";
      display: block;
      padding-bottom: 100%;
    }
    > div {
      position: absolute !important;
    }
  }
  .vuejs-clipper-fixed__img-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
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
    &__plus-button {
      background-repeat: no-repeat;
      background-position: center;
      background-size: 25px;
      background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='plus' class='svg-inline--fa fa-plus fa-w-14' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='currentColor' d='M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z'%3E%3C/path%3E%3C/svg%3E");
    }
    &__minus-button {
      background-repeat: no-repeat;
      background-position: center;
      background-size: 25px;
      background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='minus' class='svg-inline--fa fa-minus fa-w-14' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='currentColor' d='M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z'%3E%3C/path%3E%3C/svg%3E");
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
