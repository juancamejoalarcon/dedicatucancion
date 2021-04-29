import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import Dedicatucancion from "@/models/Dedicatucancion";

export default new Vuex.Store({
  // FIXME: change for a class object
  state: Object.assign({}, Dedicatucancion),

  mutations: {
    setMode(state, mode: string) {
      state.mode = mode;
    },
    addSongId(state, songId: string) {
      state.songId = songId;
    },
    addSongTitle(state, songTitle: string) {
      state.songTitle = songTitle;
    },
    addSongArtist(state, songArtist: string) {
      state.songArtist = songArtist;
    },
    addAlbumImage(state, albumImage: string) {
      state.albumImage = albumImage;
    },
    addAlbumTitle(state, albumTitle: string) {
      state.albumTitle = albumTitle;
    },
    setQr(state, qr: string) {
      state.qr = qr;
    },
    setShowZoomControls(state, showZoomControls: boolean) {
      state.showZoomControls = showZoomControls;
    },
    setShowWatermark(state, showWatermark: boolean) {
      state.showWatermark = showWatermark;
    },
    setHideBorder(state, hideBorder: boolean) {
      state.hideBorder = hideBorder;
    },
    setCustomImage(state, customImage: string) {
      state.customImage = customImage;
    },
    setIsCustomImage(state, isCustomImage: boolean) {
      state.isCustomImage = isCustomImage;
    },
    setEditCustomImageEnabled(state, editCustomImageEnabled: boolean) {
      state.editCustomImageEnabled = editCustomImageEnabled;
    },
    setShape(state, shape: string) {
      state.shape = shape;
    },
    setScale(state, scale: number) {
      state.scale = scale;
    },
    setDrawPos(state, drawPos: { left: number; top: number }) {
      state.drawPos = drawPos;
    },
    addCoordsFix(state, coordsFix) {
      state.coordsFix = coordsFix;
    },
  },
  actions: {
    setMode(context, mode: string) {
      context.commit("setMode", mode);
    },
    addSongId(context, songId: string) {
      context.commit("addSongId", songId);
    },
    addSongTitle(context, songTitle: string) {
      context.commit("addSongTitle", songTitle);
    },
    addSongArtist(context, songArtist: string) {
      context.commit("addSongArtist", songArtist);
    },
    addAlbumImage(context, albumImage: string) {
      context.commit("addAlbumImage", albumImage);
    },
    addAlbumTitle(context, albumTitle: string) {
      context.commit("addAlbumTitle", albumTitle);
    },
    setShowZoomControls(context, showZoomControls: boolean) {
      context.commit("setShowZoomControls", showZoomControls);
    },
    setShowWatermark(context, showWatermark: boolean) {
      context.commit("setShowWatermark", showWatermark);
    },
    setHideBorder(context, hideBorder: boolean) {
      context.commit("setHideBorder", hideBorder);
    },
    setCustomImage(context, customImage: string) {
      context.commit("setCustomImage", customImage);
    },
    setIsCustomImage(context, isCustomImage: boolean) {
      context.commit("setIsCustomImage", isCustomImage);
    },
    setEditCustomImageEnabled(context, editCustomImageEnabled: boolean) {
      context.commit("setEditCustomImageEnabled", editCustomImageEnabled);
    },
    setShape(context, shape: string) {
      context.commit("setShape", shape);
    },
    setQr(context, qr: string) {
      context.commit("setQr", qr);
    },
    setScale(context, scale: number) {
      context.commit("setScale", scale);
    },
    setDrawPos(context, drawPos: { left: number; top: number }) {
      context.commit("setDrawPos", drawPos);
    },
    addCoordsFix(context, coordsFix) {
      context.commit("addCoordsFix", coordsFix);
    },
  },
});
