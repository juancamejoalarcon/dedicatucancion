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

  _getYpositionForPersonalImage(
    aspratioHeight: number,
    top: number,
    scale: number
  ): number {
    // const orderKey = utilsService.getQueryParam("key");
    // top of square + height
    const initialTop = 28 + 130 / 2;
    const centerImage = initialTop - aspratioHeight / 2;
    const adjustedScale = scale * 2.1;
    const scaledTop = top * adjustedScale;
    return centerImage + scaledTop;
  }

  _getXpositionForPersonalImage(
    aspratioWidth: number,
    left: number,
    scale: number,
    doc: jsPDF
  ): number {
    const adjustedScale = scale * 1.35;
    const pdfLeftPos = doc.internal.pageSize.getWidth() / 2 - aspratioWidth / 2;
    const scaledLeft = left * adjustedScale;
    return pdfLeftPos + scaledLeft;
  }

  async _setPersonalImage(doc: jsPDF) {
    const { scale, drawPos, shape, customImage } = store.state;
    const orientation = utilsService.getOrientation(customImage);
    let customImageFixed;
    if (orientation !== 1) {
      customImageFixed = await utilsService.resetOrientation(
        customImage,
        orientation
      );
    } else {
      customImageFixed = customImage;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageProps = doc.getImageProperties(customImageFixed as any);

    const aspratio = this.calculateAspectRatioFit(
      imageProps.width,
      imageProps.height,
      132 * scale,
      1000
    );
    const width = aspratio.width;
    const height = aspratio.height;
    const x = this._getXpositionForPersonalImage(
      aspratio.width,
      drawPos.left,
      scale,
      doc
    );
    const y = this._getYpositionForPersonalImage(
      aspratio.height,
      drawPos.top,
      scale
    );
    this._setBackgroundColorForPersonalImage(doc);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.addImage(customImageFixed as any, "PNG", x, y, width, height);
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
    const { shape, isCustomImage } = store.state;
    if (shape !== "classic") {
      const setShape_loc = {
        x: 40,
        y: shape === "circle" && isCustomImage ? 26 : 28,
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

  async _setMainImage(doc: jsPDF) {
    const { isCustomImage, albumImage } = store.state;
    if (!isCustomImage) {
      doc.addImage(albumImage, "JPEG", 40, 28, 130, 130);
    } else {
      await this._setPersonalImage(doc);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async drawAndDownloadPdf(output: boolean): Promise<any> {
    return new Promise((resolve) => {
      const doc = new jsPDF();
      this._getImages().then(async () => {
        this._setSquare(doc);
        await this._setMainImage(doc);
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
