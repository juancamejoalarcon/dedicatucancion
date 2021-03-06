import axios from "axios";
import qs from "qs";
import SpotifyWebApi from "spotify-web-api-js";
import geniusService from "@/services/genius.services";

import store from "@/store/store";

class SpotifyService {
  private clientId = process.env.VUE_APP_SPOTI_CLIENT_ID;
  private clientSecret = process.env.VUE_APP_SPOTI_CLIENT_SECRET;
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

  setSpotifyButton(item: SpotifyApi.TrackObjectFull): void {
    document.querySelectorAll(".spot-param").forEach((el) => {
      const param = el.getAttribute("param");
      if (param === "spotifyButton") {
        const iframeEl = el.querySelector("iframe");
        if (iframeEl) iframeEl.src = item.external_urls.spotify;
        el.innerHTML = `<iframe src="https://open.spotify.com/embed/track/${item.id}" width="300" height="80" frameborder="0" allow="encrypted-media"></iframe>`;
      }
    });
  }

  setHTMLParams(): void {
    document.querySelectorAll(".spot-param").forEach((el) => {
      const param = el.getAttribute("param");
      switch (param) {
        case "songArtist":
        case "songTitle":
        case "albumTitle":
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
}

export default new SpotifyService();
