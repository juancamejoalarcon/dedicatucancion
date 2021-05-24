import imageCompression from "browser-image-compression";
import EXIF from "exif-js";
import store from "@/store/store";

class UtilsService {
  _resizeInputFile(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 2400,
        useWebWorker: true,
      };
      imageCompression(file, options)
        .then((compressedFile) => resolve(compressedFile))
        .catch((error) => reject(error.message));
    });
  }

  getBase64FromInputFile(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // larger than 1mb reduce
        if (parseFloat(sizeInMB) > 1) {
          this._resizeInputFile(file).then((compressedImageBlob) => {
            const blobReader = new FileReader();
            blobReader.readAsDataURL(compressedImageBlob);
            blobReader.onloadend = () => resolve(blobReader.result);
          });
          resolve(reader.result);
        } else {
          resolve(reader.result);
        }
      };
      reader.onerror = (error) => {
        console.log("Error: ", error);
        reject();
      };
    });
  }

  getQueryParam(key: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
  }

  getDataUri(url: string) {
    return new Promise((resolve) => {
      const image = new Image();
      image.setAttribute("crossOrigin", "anonymous"); //getting images from external domain

      image.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        //next three lines for white background in case png has a transparent background
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.fillStyle = "#fff"; /// set white fill style
        if (ctx) ctx.fillRect(0, 0, canvas.width, canvas.height);

        canvas.getContext("2d")?.drawImage(this as CanvasImageSource, 0, 0);

        resolve(
          canvas.toDataURL(url.includes("png") ? "image/png" : "image/jpeg")
        );
      };

      image.src = url;
    });
  }

  base64ToArrayBuffer(base64: string) {
    base64 = base64.replace(/^data:([^;]+);base64,/gim, "");
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  getOrientation(b64: string): number {
    return EXIF.readFromBinaryFile(this.base64ToArrayBuffer(b64));
  }

  resetOrientation(srcBase64: string, srcOrientation: number) {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = function () {
        const width = img.width,
          height = img.height,
          canvas = document.createElement("canvas"),
          ctx = canvas.getContext("2d");

        // set proper canvas dimensions before transform & export
        if (4 < srcOrientation && srcOrientation < 9) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        // transform context before drawing image
        switch (srcOrientation) {
          case 2:
            ctx?.transform(-1, 0, 0, 1, width, 0);
            break;
          case 3:
            ctx?.transform(-1, 0, 0, -1, width, height);
            break;
          case 4:
            ctx?.transform(1, 0, 0, -1, 0, height);
            break;
          case 5:
            ctx?.transform(0, 1, 1, 0, 0, 0);
            break;
          case 6:
            ctx?.transform(0, 1, -1, 0, height, 0);
            break;
          case 7:
            ctx?.transform(0, -1, -1, 0, height, width);
            break;
          case 8:
            ctx?.transform(0, -1, 1, 0, 0, width);
            break;
          default:
            break;
        }

        // draw image
        ctx?.drawImage(img, 0, 0);

        // export base64
        resolve(canvas.toDataURL());
      };

      img.src = srcBase64;
    });
  }

  setWindowObj(identifier = ""): void {
    const {
      songId,
      qr,
      albumImage,
      albumTitle,
      songArtist,
      songTitle,
      isCustomImage,
      shape,
      drawPos,
      scale,
      customImage,
    } = store.state;
    window.soundsoner = {
      song_id: songId,
      soundwave: qr,
      album_image: albumImage,
      album_title: albumTitle,
      song_artist: songArtist,
      song_title: songTitle,
      type: isCustomImage ? "personal" : "spotify",
      shape: shape,
      custom_image: identifier ? identifier : customImage,
      drawPos: drawPos,
      scale: scale,
    };
  }
}

export default new UtilsService();
