const nav = document.querySelector('.nav')
const navBtn = document.querySelector('.burger-btn')
const allNavItems = document.querySelectorAll('.nav__item')
const navBtnBars = document.querySelector('.burger-btn__bars')

const handleNav = () => {
	nav.classList.toggle('nav--disable')

	handleNavItemsAnimation()
}

navBtn.addEventListener('click', handleNav)