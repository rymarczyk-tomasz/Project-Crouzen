// const nav = document.querySelector('.nav')
// const navBtn = document.querySelector('.burger-btn')
// const allNavItems = document.querySelectorAll('.nav__item')
// const navBtnBars = document.querySelector('.burger-btn__bars')


function isScrollingDown() {
	return window.scrollY > previousScrollY;
  }

  function getVisibleSections() {
	const sections = document.querySelectorAll('section');
	const visibleSections = [];
  
	for (let i = 0; i < sections.length; i++) {
	  const section = sections[i];
	  const rect = section.getBoundingClientRect();
  
	  if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
		visibleSections.push(section);
	  }
	}
  
	return visibleSections;
  }

  let previousScrollY = 0;

window.addEventListener('scroll', function() {
  const visibleSections = getVisibleSections();
  const currentSection = visibleSections[visibleSections.length - 1];

  if (isScrollingDown() && currentSection) {

	currentSection.classList.add('active')

  }

  previousScrollY = window.scrollY;
});

// const handleNav = () => {
// 	nav.classList.toggle('nav--active')

// 	handleNavItemsAnimation()
// }

// const handleNavItemsAnimation = () => {
// 	let delayTime = 0

// 	allNavItems.forEach(item => {
// 		item.classList.toggle('nav-items-animation')
// 		item.style.animationDelay = '.' + delayTime + 's'
// 		delayTime++
// 	})
// }

// navBtn.addEventListener('click', handleNav)
// allNavItems.forEach(btn => btn.addEventListener('click', handleNav))
$(document).ready(function () {
	// Add smooth scrolling to all links
	$("a").on("click", function (event) {
	  // Make sure this.hash has a value before overriding default behavior
	  if (this.hash !== "") {
		// Prevent default anchor click behavior
		event.preventDefault();

		// Store hash
		const hash = this.hash;

		// Using jQuery's animate() method to add smooth page scroll
		// The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
		$("html, body").animate(
		  {
			scrollTop: $(hash).offset().top,
		  },
		  800,
		  function () {
			// Add hash (#) to URL when done scrolling (default click behavior)
			window.location.hash = hash;
		  }
		);
	  } // End if
	});
  });