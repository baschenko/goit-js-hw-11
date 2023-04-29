import { Notify } from 'notiflix/build/notiflix-notify-aio';
import PictureApiService from './js/PictureApiService.js';
import LoadMoreBtn from './js/LoadMoreBtn.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const pictureApiService = new PictureApiService();
const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  isHidden: true,
});

const refs = {
  form: document.getElementById('search-form'),
  gallery: document.querySelector('.gallery'),
  autoScrollEl: document.getElementById('forAutoScroll'),
};

refs.form.addEventListener('submit', onSubmit);
loadMoreBtn.button.addEventListener('click', createGallery);

const gallery = new SimpleLightbox('.gallery a', {
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: '250',
});

//бесконечный скролл
const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (pictureApiService.totalPages === 1 && pictureApiService.pages === 0) {
        return;
      }
      if (pictureApiService.pages === pictureApiService.totalPages) {
         observer.unobserve(entry.target);
      }
      if (entry.isIntersecting && pictureApiService.query !== '') {
        createGallery();
      }
    });
  },
  {
    rootMargin: '300px 0px 0px 0px',
  }
);
//onSubmit - нажатие на кнопку submit
function onSubmit(evt) {
  evt.preventDefault(); //отмена перезагрузки страницы

  const formData = evt.currentTarget;
  pictureApiService.query = formData.elements.searchQuery.value.trim(); //сохранение значения поиска в классе
  if (pictureApiService.query === '') {
    return;
  }
  loadMoreBtn.checkBox = evt.target.elements.autoscroll.checked;
  if (!loadMoreBtn.checkBox) {
    loadMoreBtn.show();
  }

  pictureApiService.resetPage(); //обновление счетчика станиц
  clearGallery(); //очистка галереи

  createGallery() //создание галереи
    .then(() => {
      Notify.info(
        `Hooray! We found ${pictureApiService.totalHits} images - ${pictureApiService.totalPages} pages.`
      );
      if (evt.target.elements.autoscroll.checked) {
        observer.observe(refs.autoScrollEl);
      }
    })
    .finally(() => {
      refs.form.reset(); //обнуление поля ввода
      refs.form.elements.autoscroll.checked = loadMoreBtn.checkBox;
    });
}

// вывод на страницу
async function createGallery() {
  if (loadMoreBtn.checkBox) {
    loadMoreBtn.hide();
  }
  loadMoreBtn.disable(); //переводит кнопку в режим disable

  try {
    const markup = await getGalleryMarkUp();
    if (markup !== undefined) {
      updateGalleryMarkup(markup); //вывод галереи на страницу
      loadMoreBtn.enable(); //переводит кнопку в режим enable
      gallery.refresh();
      autoScroll(); //автоскролл
      checkEndGallery(); //проверка есть ли фото в галереи
    }
  } catch (error) {
    onError(error);
  }
}

// формирование галереи
async function getGalleryMarkUp() {
  try {
    const { hits } = await pictureApiService.getPictures(); //запрос данных на сервере

    if (hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      throw new Error('No data');
    }

    return hits.reduce((markup, picture) => markup + createMarkup(picture), ''); //рендер страницы галереи
  } catch (error) {
    onError(error);
  }
}

//шаблон одной карточки картинки
function createMarkup({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
  <div class="photo-card">
    <a href="${largeImageURL}">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
        <p class="info-item">
        <b>Likes</b> ${likes}
        </p>
        <p class="info-item">
        <b>Views</b> ${views}
        </p>
        <p class="info-item">
        <b>Comments</b> ${comments}
        </p>
        <p class="info-item">
        <b>Downloads</b> ${downloads}
      </p>
    </div>
  </div>
`;
}

// вывод галереи на страницу
function updateGalleryMarkup(markup) {
  if (markup !== undefined) {
    refs.gallery.insertAdjacentHTML('beforeend', markup);
  }
}

// очистка галереи
function clearGallery() {
  refs.gallery.innerHTML = '';
}

//автоскролл
function autoScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

//проверяет есть ли еще фото
function checkEndGallery() {
  if (!pictureApiService.isLoadShowMore()) {
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
    loadMoreBtn.hide();
  }
}

// обработка ошибок
function onError(error) {
  console.error(error);
  loadMoreBtn.hide();
  clearGallery();
  updateGalleryMarkup('<p>Not found!</p>');
}
