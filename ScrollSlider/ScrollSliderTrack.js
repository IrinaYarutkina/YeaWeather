export default class ScrollSliderTrack extends HTMLElement {
  connectedCallback() {
    this.style.scrollBehavior = "smooth";
  }

  // Получаем все карточки
  get slides() {
    return [...this.children];
  }

  // Проверка: начало трека
  isTrackStart() {
    return this.scrollLeft <= 0;
  }

  // Проверка: конец трека
  isTrackFinish() {
    return this.scrollLeft + this.clientWidth >= this.scrollWidth - 2;
  }

  // Прокрутка на одну карточку вперёд
  scrollToNext() {
    const nextSlide = this.slides.find(
      (slide) => slide.offsetLeft > this.scrollLeft
    );
    if (nextSlide) {
      this.scrollBy({
        left: nextSlide.offsetLeft - this.scrollLeft,
        behavior: "smooth",
      });
    }
  }

  // Прокрутка на одну карточку назад
  scrollToPrev() {
    const prevSlide = [...this.slides]
      .reverse()
      .find((slide) => slide.offsetLeft < this.scrollLeft);
    if (prevSlide) {
      this.scrollBy({
        left: prevSlide.offsetLeft - this.scrollLeft,
        behavior: "smooth",
      });
    }
  }
}

customElements.define("scroll-slider-track", ScrollSliderTrack);
