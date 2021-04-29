import images from "@/services/images.service";

const Dedicatucancion = {
  mode: "form",
  type: "spotify",
  songId: "",
  songTitle: "Título de la canción",
  songArtist: "Nombre del artista",
  showZoomControls: false,
  showWatermark: true,
  hideBorder: false,
  customImage: images.default,
  isCustomImage: false,
  editCustomImageEnabled: false,
  shape: "classic",
  albumImage: images.default,
  albumTitle: "",
  qr: images.qr,
  scale: 1,
  drawPos: {
    left: 0,
    top: 0,
  },
  coordsFix: false,
};

export default Dedicatucancion;
