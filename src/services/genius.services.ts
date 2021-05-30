/* eslint-disable @typescript-eslint/no-explicit-any */
import store from "@/store/store";
import spotifyService from "@/services/spotify.service";

type searchResult = {
  id: number;
  url: string;
  title: string;
  albumArt: string;
};

class GeniusService {
  private apiKey = process.env.VUE_APP_GENIUS_API;
  private songTitle = "";
  private songArtist = "";
  private songId = "";
  private searchUrl = "https://api.genius.com/search?q=";
  private searchSongUrl = "https://api.genius.com/songs/";
  private track: SpotifyApi.SingleTrackResponse | undefined;

  findClosestSong(data: searchResult[]): searchResult | undefined {
    const filteredResults = data.filter((result) => {
      return (
        result.title.includes(this.songTitle) &&
        result.title.includes(this.songArtist)
      );
    });
    for (const result of filteredResults) {
      if (result.title.substr(0, this.songTitle.length) === this.songTitle) {
        return result;
      }
    }
  }

  findExactSong(data: searchResult[]): searchResult | undefined {
    return data.find(
      (result) =>
        result.title.replace(/\s+/g, " ") ==
        `${this.songTitle} by ${this.songArtist}`
    );
  }

  filterResults(data: searchResult[]): searchResult | undefined {
    const exactSong = this.findExactSong(data);
    if (exactSong) return exactSong;
    const closestSong = this.findClosestSong(data);
    if (closestSong) return closestSong;
    return data[0];
  }

  getTitle(title: string, artist: string): string {
    return `${title}${artist}`
      .toLowerCase()
      .replace(/ *\([^)]*\) */g, "")
      .replace(/ *\[[^\]]*]/, "")
      .replace(/feat.|ft./g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  mapedResults(hits: any[]) {
    return hits.map((val: any) => {
      const { full_title, song_art_image_url, id, url } = val.result;
      return { id, title: full_title, albumArt: song_art_image_url, url };
    });
  }

  createiFRAME(filteredResult: any, el: HTMLElement): void {
    if (filteredResult) {
      const iframe = document.createElement("iframe");
      iframe.style.border = "0";
      iframe.style.height = "500px";
      iframe.style.width = "100%";
      el.appendChild(iframe);

      let embed = `<div id='rg_embed_link_${filteredResult.id}' class='rg_embed_link' data-song-id='${filteredResult.id}'></div>`;
      embed += `<script crossorigin src='//genius.com/songs/${filteredResult.id}/embed.js'></script>`;
      iframe.contentDocument?.write(embed);
      if (iframe.contentDocument) {
        iframe.contentDocument.body.style.fontFamily = "Montserrat";
        setTimeout(() => {
          if (iframe.contentDocument) {
            (iframe.contentDocument.querySelector(
              ".rg_embed_header"
            ) as HTMLElement).style.display = "none";
            (iframe.contentDocument.querySelector(
              ".rg_embed.music"
            ) as HTMLElement).style.borderTop = "none";
          }
        }, 1500);
      }
    }
  }

  searchGenius(query: string): Promise<any> {
    return new Promise((resolve) => {
      fetch(
        `${this.searchUrl}${encodeURIComponent(query)}&access_token=${
          this.apiKey
        }`
      )
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        });
    });
  }

  searchSongThatHasArtist(serchSongThatHasArtist: any): Promise<void> {
    const hits = serchSongThatHasArtist.response?.hits;
    return new Promise((resolve, reject) => {
      if (hits.length === 1) {
        resolve(serchSongThatHasArtist);
      } else reject();
    });
  }

  async refineSearch(): Promise<void> {
    this.track = await spotifyService.getTrackId(this.songId);
    const serchSongThatHasArtist = await this.searchGenius(this.track.name);
    const filterSerchSongThatHasArtist = await this.searchSongThatHasArtist(
      serchSongThatHasArtist
    );
    if (filterSerchSongThatHasArtist !== null && filterSerchSongThatHasArtist) {
      return new Promise((resolve) => resolve(filterSerchSongThatHasArtist));
    }
  }
  setSongLyrics(el: HTMLElement): void {
    const { songTitle, songArtist, songId } = store.state;
    this.songTitle = songTitle;
    this.songArtist = songArtist;
    this.songId = songId;
    this.searchGenius(this.getTitle(this.songTitle, songArtist)).then(
      (data) => {
        if (data.response?.hits?.length) {
          const results = this.mapedResults(data.response.hits);
          const filteredResult = this.filterResults(results);
          this.createiFRAME(filteredResult, el);
        } else {
          this.refineSearch().then((data: any) => {
            const results = this.mapedResults(data.response.hits);
            const filteredResult = this.filterResults(results);
            this.createiFRAME(filteredResult, el);
          });
        }
      }
    );
  }
}

export default new GeniusService();
