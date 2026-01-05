const toggle = document.querySelector(".header__switch-toggle");
const switchWrap = document.querySelector(".header__switch");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("header__switch-toggle-on");
  switchWrap.classList.toggle("is-f");
});
