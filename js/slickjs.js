$('.gallery__carousel').slick(
  
  {
    arrows: false,
    autoplay: true,
    mobileFirst: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        }
      },
    ]
  }
  
  );