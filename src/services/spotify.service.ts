import axios from "axios";
import qs from "qs";
import SpotifyWebApi from "spotify-web-api-js";
import geniusService from "@/services/genius.services";

import store from "@/store/store";

class SpotifyService {
  private clientId = "fb34f7a3c9234f31a63cd764a2250e9c";
  private clientSecret = "382d23b2673740ccb03d89af45b6c4f4";
  private spotifyApi = new SpotifyWebApi();

  _getAuth(): Promise<string> {
    return new Promise((resolve, reject) => {
      const headers = {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: { username: this.clientId, password: this.clientSecret },
      };

      axios
        .post(
          "https://accounts.spotify.com/api/token",
          qs.stringify({ grant_type: "client_credentials" }),
          headers
        )
        .then((response) => {
          resolve(response.data.access_token);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }

  getSpotifyItems(search: string): Promise<SpotifyApi.TrackObjectFull[]> {
    return new Promise((resolve, reject) => {
      this._getAuth().then((access_token) => {
        this.spotifyApi.setAccessToken(access_token);
        this.spotifyApi.searchTracks(search).then(
          (data) => {
            if (data?.tracks?.items) resolve(data.tracks.items);
            else reject();
          },
          (err) => {
            reject(err);
          }
        );
      });
    });
  }

  getTrackId(trackId: string): Promise<SpotifyApi.SingleTrackResponse> {
    return new Promise((resolve, reject) => {
      this._getAuth().then((access_token) => {
        this.spotifyApi.setAccessToken(access_token);
        this.spotifyApi.getTrack(trackId).then(
          (data) => {
            resolve(data);
          },
          (err) => {
            reject(err);
          }
        );
      });
    });
  }

  getArtists(item: SpotifyApi.TrackObjectFull): string {
    return item.artists.reduce((accumulator, currentValue, index) => {
      const artist = index ? ", " + currentValue.name : currentValue.name;
      return accumulator + artist;
    }, "");
  }

  setHTMLParams(): void {
    document.querySelectorAll(".spot-param").forEach((el) => {
      const param = el.getAttribute("param");
      switch (param) {
        case "songArtist":
        case "songTitle":
        case "albumTitle":
          console.log("llega");
          el.textContent = store.state[param];
          break;
        case "lyrics":
          geniusService.setSongLyrics(el as HTMLElement);
          break;
        default:
          break;
      }
    });
  }
  // Use genius: https://genius.com/api-clients
  // 5RX-QU_clF2n9XDMcOO4oconvHPo0hkx_M7Xhqt46ANNI3Qf-stvUZqerxMPAk67
  // xNmMsYRxNR7m7LU_nGefXgDVOellY2q3bjDLH0kefhGwEAoSsBJO46QL1-HnCZ4sV5A4Uszd3MBzi7LTQz3NZA
  // LRNRA3JM28SA60Nxah4Oz5QcWIkQmulMyTIdiUbn2SHHgVVW_q2oF5ptYK49TzU-
}

export default new SpotifyService();
