import axios from 'axios';

export default class PictureApiService {
  static ENDPOINT = 'https://pixabay.com/api/';
  static API_KEY = '35663749-81f1024cac44a82003cb090b4';
  static OPTIONS = 'image_type=photo&orientation=horizontal&safesearch=true';

  constructor() {
    this.query = '';
    this.pages = 0;
    this.totalHits = 0;
    this.perPages = 40;
    this.totalPages = 0;
  }

  async getPictures() {
    console.log('GET', this.pages);
    this.incrementPage();
    const url = `${PictureApiService.ENDPOINT}?key=${PictureApiService.API_KEY}&q=${this.query}&${PictureApiService.OPTIONS}&per_page=${this.perPages}&page=${this.pages}`;
    const { data } = await axios.get(url);

    this.totalHits = data.totalHits;
    this.getTotalPages();
    return data;
  }

  incrementPage() {
    this.pages += 1;
  }

  resetPage() {
    this.pages = 0;
  }

  getTotalPages() {
    this.totalPages = Math.ceil(this.totalHits / this.perPages);
  }

  isLoadShowMore() {
    if (this.pages < this.totalPages) {
      return true;
    } else if ((this.pages === this.totalPages)) {
       return false;
    }
  }
}
