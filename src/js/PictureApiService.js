import axios from 'axios';

// const axios = require('axios');

export default class PictureApiService {
  static ENDPOINT = 'https://pixabay.com/api/';
  static API_KEY = '35663749-81f1024cac44a82003cb090b4';
  static OPTIONS = 'image_type=photo&orientation=horizontal&safesearch=true';

  constructor() {
    this.query = '';
    this.pages = 1;
    this.totalHits = 0;
  }

  async getPictures() {
    console.log('GET');
    const url = `${PictureApiService.ENDPOINT}?key=${PictureApiService.API_KEY}&q=${this.query}&${PictureApiService.OPTIONS}&per_page=40&page=${this.pages}`;

    const { data } = await axios.get(url);
    this.incrementPage();
    this.totalHits = data.totalHits;
    return data;
  }

  incrementPage() {
    this.pages += 1;
  }

  resetPage() {
    this.pages = 1;
  }
}
