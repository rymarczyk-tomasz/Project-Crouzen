const nav = document.querySelector('.nav')
const navBtn = document.querySelector('.burger-btn')
const allNavItems = document.querySelectorAll('.nav__item')
const navBtnBars = document.querySelector('.burger-btn__bars')
const bio = document.getElementById('bio')

const handleNav = () => {
	nav.classList.toggle('nav--disable')

	handleNavItemsAnimation()
}

window.addEventListener('scroll', function(e) {
	const position = window.pageYOffset;
	if (position >= 300) {
		bio.classList.add('active')
	}
	
	console.log(position);
});

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