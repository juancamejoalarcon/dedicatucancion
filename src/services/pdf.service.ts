import { jsPDF } from "jspdf";
import utilsService from "@/services/utils.service";
import store from "@/store/store";
import images from "./images.service";

class PDFService {
  private pdf_images: { [key: string]: string };

  constructor() {
    this.pdf_images = {
      controls: images.controls_pdf,
      like: images.like_pdf,
    };
  }

  async _getImages(): Promise<void> {
    const { qr } = store.state;
    for (const img in this.pdf_images) {
      this.pdf_images[img] = (await utilsService.getDataUri(
        this.pdf_images[img] as string
      )) as string;
    }
    this.pdf_images["qr"] = (await utilsService.getDataUri(qr)) as string;
  }

  calculateAspectRatioFit(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
  }

  _setBackgroundColorForPersonalImage(doc: jsPDF): void {
    doc.setDrawColor(255, 255, 255);
    doc.setFillColor(0, 0, 0);
    doc.rect(40, 28, 130, 130, "FD");
  }

  _setPersonalImage(doc: jsPDF): void {
    const { scale, drawPos, shape, customImage } = store.state;
    const imageProps = doc.getImageProperties(customImage);
    const aspratio = this.calculateAspectRatioFit(
      imageProps.width,
      imageProps.height,
      132 * scale,
      1000
    );
    const width = aspratio.width;
    const height = aspratio.height;
    const adjustedScale = 1.3 * scale;
    const adjustedScaleY = 1.2 * scale;
    const x =
      doc.internal.pageSize.getWidth() / 2 -
      aspratio.width / 2 +
      drawPos.left * adjustedScale;
    const y = 92 - aspratio.height / 2 + drawPos.top * adjustedScaleY;
    this._setBackgroundColorForPersonalImage(doc);
    doc.addImage(customImage, "PNG", x, y, width, height);
    // Fill borders
    doc.setDrawColor(255, 255, 255);
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, "FD");
    doc.rect(doc.internal.pageSize.getWidth() - 40, 0, 40, 158, "FD");
    doc.rect(0, 0, 40, 158, "FD");
    const bottom_rect = {
      x: 0,
      y: shape === "circle" ? 154 : 158,
      width: doc.internal.pageSize.getWidth(),
      height: 155,
    };
    doc.rect(
      bottom_rect.x,
      bottom_rect.y,
      bottom_rect.width,
      bottom_rect.height,
      "FD"
    );
  }

  _setShape(doc: jsPDF): void {
    const { shape } = store.state;
    if (shape !== "classic") {
      const setShape_loc = {
        x: 40,
        y: shape === "circle" ? 26 : 28,
        with: 130,
        height: 130,
      };
      doc.addImage(
        images[`${shape}_pdf` as keyof typeof images],
        "PNG",
        setShape_loc.x,
        setShape_loc.y,
        setShape_loc.with,
        setShape_loc.height
      );
    }
  }

  _setLikeAndControls(doc: jsPDF): void {
    const imgWidth = (490 * doc.internal.pageSize.getWidth()) / 793;
    const imgHeight = (143 * doc.internal.pageSize.getWidth()) / 793;
    doc.addImage(
      this.pdf_images.controls,
      "JPEG",
      40,
      231,
      imgWidth,
      imgHeight
    );
    doc.addImage(this.pdf_images.like, "JPEG", 163, 204, 7, 7);
  }

  _setMainImage(doc: jsPDF): void {
    const { isCustomImage, albumImage } = store.state;
    if (!isCustomImage) {
      doc.addImage(albumImage, "JPEG", 40, 28, 130, 130);
    } else {
      this._setPersonalImage(doc);
    }
  }

  _setSquare(doc: jsPDF): void {
    doc.setDrawColor(255, 255, 255);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(25, 5, 160, 286, 2, 2, "FD");
  }

  _setQrAndText(doc: jsPDF): void {
    const { songArtist, songTitle } = store.state;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    const long_title = songTitle.length > 40 ? 3 : 0;
    const long_artist = songArtist.length > 40 ? 3 : 0;
    if (long_title) {
      doc.text(songTitle.substring(0, 40), 40, 200 - long_artist);
      if (songTitle.length > 76)
        doc.text(songTitle.substring(40, 76) + "...", 40, 208 - long_artist);
      else doc.text(songTitle.substring(40, 76), 40, 208 - long_artist);
    } else {
      doc.text(songTitle.substring(0, 40), 40, 205 - long_artist);
    }

    doc.addImage(
      this.pdf_images["qr"],
      "JPEG",
      50,
      166 - long_title - long_artist,
      110,
      28
    );

    doc.setFont("helvetica", "normal");
    if (long_artist) {
      doc.text(songArtist.substring(0, 40), 40, 210 + long_title);
      if (songArtist.length > 78) {
        doc.text(songArtist.substring(40, 78) + "...", 40, 217 + long_title);
      } else {
        doc.text(songArtist.substring(40, 78), 40, 217 + long_title);
      }
    } else {
      doc.text(songArtist, 40, 215 + long_title);
    }
  }

  async drawAndDownloadPdf(output: boolean): Promise<any> {
    return new Promise((resolve) => {
      const doc = new jsPDF();
      this._getImages().then(() => {
        this._setSquare(doc);
        this._setMainImage(doc);
        this._setShape(doc);
        this._setLikeAndControls(doc);
        this._setQrAndText(doc);
        if (output) {
          resolve(doc.output("datauristring"));
        } else doc.save("placa-spotify.pdf");
      });
    });
  }
}

export default new PDFService();
