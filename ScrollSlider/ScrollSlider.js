export default class ScrollSlider extends HTMLElement {
  connectedCallback() {
    this.prevButton?.addEventListener("click", () => {
      this.track.scrollToPrev();
    });

    this.nextButton?.addEventListener("click", () => {
      this.track.scrollToNext();
    });

    this.track?.addEventListener("scroll", () => {
      this.handleScroll();
    });

    requestAnimationFrame(() => {
      this.handleScroll();
    });
  }

  get track() {
    return this.querySelector("scroll-slider-track");
  }

  get prevButton() {
    return this.querySelector(".scroll-slider-button._prev");
  }

  get nextButton() {
    return this.querySelector(".scroll-slider-button._next");
  }

  handleScroll() {
    if (this.prevButton) {
      this.prevButton.hidden = this.track?.isTrackStart();
    }

    if (this.nextButton) {
      this.nextButton.hidden = this.track?.isTrackFinish();
    }
  }
}

customElements.define("scroll-slider", ScrollSlider);
