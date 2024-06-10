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

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactform');
  const namaInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const genderInput = document.getElementById('gender');
  const pesanInput = document.getElementById('message');
  const submitBtn = document.getElementById('submit-btn');

  const namaError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const genderError = document.getElementById('gender-error');
  const pesanError = document.getElementById('message-error');

  // Fungsi untuk menampilkan pesan error
  const tampilkanError = (input, errorElement, pesan) => {
      errorElement.innerText = pesan;
      errorElement.style.display = 'block';
      input.classList.add('input-error');
  };

  // Fungsi untuk menyembunyikan pesan error
  const sembunyikanError = (input, errorElement) => {
      errorElement.style.display = 'none';
      input.classList.remove('input-error');
  };

  // Fungsi validasi
  const validasiForm = () => {
      let valid = true;

      // Validasi Nama
      if (namaInput.value.trim() === '') {
          tampilkanError(namaInput, namaError, 'Nama harus diisi');
          valid = false;
      } else {
          sembunyikanError(namaInput, namaError);
      }

      // Validasi Email
      const polaEmail = /^[^ ]+@[^ ]+\.[a-z]{2,6}$/;
      if (emailInput.value.trim() === '') {
          tampilkanError(emailInput, emailError, 'Email harus diisi');
          valid = false;
      } else if (!polaEmail.test(emailInput.value.trim())) {
          tampilkanError(emailInput, emailError, 'Format email tidak valid');
          valid = false;
      } else {
          sembunyikanError(emailInput, emailError);
      }

      // Validasi Gender
      if (genderInput.value === '') {
          tampilkanError(genderInput, genderError, 'Jenis kelamin harus dipilih');
          valid = false;
      } else {
          sembunyikanError(genderInput, genderError);
      }

      // Validasi Pesan
      if (pesanInput.value.trim() === '') {
          tampilkanError(pesanInput, pesanError, 'Pesan harus diisi');
          valid = false;
      } else {
          sembunyikanError(pesanInput, pesanError);
      }

      return valid;
  };

  // Validasi real-time
  namaInput.addEventListener('input', () => validasiForm());
  emailInput.addEventListener('input', () => validasiForm());
  genderInput.addEventListener('change', () => validasiForm());
  pesanInput.addEventListener('input', () => validasiForm());

  // Pengiriman form
  form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (validasiForm()) {
          const scriptURL = 'https://script.google.com/macros/s/AKfycbweFerr8OmwSAWv7Cbll7n1pLYaxbMbbXhzd5p0j53T-hq5ZChRqZCpSaL5ZndjsUY8/exec';
          fetch(scriptURL, { method: 'POST', body: new FormData(form) })
              .then(response => console.log('Berhasil!', response))
              .catch(error => console.error('Error!', error.message));
      }
  });
});