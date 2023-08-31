let footerYear = document.querySelector('.footer__year')

document.addEventListener('DOMContentLoaded', function () {
	const allNavItems = document.querySelectorAll('.nav-link')
	const navList = document.querySelector('.navbar-collapse')

	allNavItems.forEach(item =>
		item.addEventListener('click', () => {
			navList.classList.remove('show')
		})
	)
})

const handleCurrentYear = () => {
	const year = new Date().getFullYear()
	footerYear.textContent = year
}

handleCurrentYear()
