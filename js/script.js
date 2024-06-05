// animation
anime({
  targets: '#title',
  translateY: [
    {value: -50, duration: 500},
    {value: 0, duration: 800}
  ],
  opacity: [
    {value: 0, duration: 500},
    {value: 1, duration: 800}
  ],
  easing: 'easeInOutQuad',
  loop: true,
  direction: 'alternate'
});

// class active
const navbar = document.querySelector('.navbar');
// ketika menu di klik
document.querySelector('#menu').onclick = () => {
    navbar.classList.toggle('active');
};

// Menekan diluar sidebar untuk menghilangkan navbar
const menu = document.querySelector('#menu');

document.addEventListener('click',function(e) {
    if(!menu.contains(e.target) && !navbar.contains(e.target)) {
        navbar.classList.remove('active');
    }
});

var swiper = new Swiper(".slide-content", {
    slidesPerView: 3,
    spaceBetween: 25,
    loop: true,
    centerSlide: 'true',
    fade: 'true',
    grabCursor: 'true',
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      dynamicBullets: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    breakpoints:{
      0: {
        slidesPerView: 1,
      },
      520: {
        slidesPerView: 2,
      },
      950: {
        slidesPerView: 3,
      },
    },
  });

  const inputField = document.getElementById("input-field");
  const listTodo = document.getElementById("list-todo")

 function addTodo() {
  const inputValue = inputField.value;

  const li = document.createElement("li");
  const div = document.createElement("div");
  const input = document.createElement("input");
  const label = document.createElement("label");
  const span = document.createElement("span");

  div. classList.add("input-label")
  label.innerHTML = inputValue;

  input.type = "checkbox";
  input.on
 }

 function removeTodo() {

 }

 function checkTodo() {

 }