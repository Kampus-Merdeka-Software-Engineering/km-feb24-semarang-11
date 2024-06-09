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


//  Untuk mengirim data inputan ke Spreadsheet team 11  //
 const scriptURL ='https://script.google.com/macros/s/AKfycbweFerr8OmwSAWv7Cbll7n1pLYaxbMbbXhzd5p0j53T-hq5ZChRqZCpSaL5ZndjsUY8/exec'
 const form = document.forms ['contactform']

 form.addEventListener('submit', e => {
  e.preventDefault()
  fetch(scriptURL, { method: 'POST', body: new FormData(form)})
    .then(response => console.log ('Success!', response))
    .catch(error => console.error ('Error!', error.message))
 })