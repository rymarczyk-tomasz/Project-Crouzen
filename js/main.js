const nav = document.querySelector('.nav')
const navBtn = document.querySelector('.burger-btn')
const allNavItems = document.querySelectorAll('.nav__item')
const navBtnBars = document.querySelector('.burger-btn__bars')


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
    // Użytkownik przewija w dół i istnieje następna sekcja
	currentSection.classList.add('active')
    // const nextSection = currentSection.nextElementSibling;
    // Wykonaj akcję dla następnej sekcji
  }
//    else if (!isScrollingDown() && currentSection.previousElementSibling) {
//     // Użytkownik przewija w górę i istnieje poprzednia sekcja
//     const previousSection = currentSection.previousElementSibling;
//     // Wykonaj akcję dla poprzedniej sekcji
//   }

  previousScrollY = window.scrollY;
});

const handleNav = () => {
	nav.classList.toggle('nav--active')

	handleNavItemsAnimation()
}

const handleNavItemsAnimation = () => {
	let delayTime = 0

	allNavItems.forEach(item => {
		item.classList.toggle('nav-items-animation')
		item.style.animationDelay = '.' + delayTime + 's'
		delayTime++
	})
}

navBtn.addEventListener('click', handleNav)
allNavItems.forEach(btn => btn.addEventListener('click', handleNav))