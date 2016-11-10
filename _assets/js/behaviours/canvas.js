import raf from 'raf'
import Wallop from 'Wallop'
import Hammer from 'hammerjs'
import { animationEnd } from '../helpers/utils'
import Base from '../helpers/base'

function _easeOutCubic(currentIteration, startValue, changeInValue, totalIterations) {
	return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 3) + 1) + startValue
}
export class canvas extends Base {
	constructor(el) {
		super()
		this.tag = el
		this.$tag = $(this.tag)
		this.$pagerContainer = this.$tag.find('.js-pager-container')
		this.width = 1110
		this.height = 630
		this.slides = Array.from(el.querySelectorAll('.js-slide-item'))
		// bind this
		this.drawMaskOut = this.drawMaskOut.bind(this)
		this.drawMaskIn = this.drawMaskIn.bind(this)
		this.setFont = this.setFont.bind(this)
		this.clickHandle = this.clickHandle.bind(this)
		this.onSlideChange = this.onSlideChange.bind(this)
		this.updateSlides = this.updateSlides.bind(this)
		this.getActiveSlide = this.getActiveSlide.bind(this)
		this.pagerHandle = this.pagerHandle.bind(this)
		this.slide = new Wallop(el, {
			itemClass: 'js-slide-item',
			currentItemClass: 'slide__item--current',
			showPreviousClass: 'slide__item--showPrevious',
			showNextClass: 'slide__item--showNext',
			hidePreviousClass: 'slide__item--hidePrevious',
			hideNextClass: 'slide__item--hideNext',
			carousel: true
		})
		this.addGestures()
		this.index = 0
		this.slide.on('change', this.onSlideChange)
		this.init(this.index)
		this.started = false
		this.$tag.on('click', '.js-slide-controls', this.clickHandle)
		this.$tag.on('click', '.js-pager-btn', this.pagerHandle)
		this.$pagerContainer.append(this.slides.map((e, i) => `<li data-index="${i}" class="pager__item js-pager-btn ${i === 0 && 'is-active'}"></li>`).join(''))
	}

	init(index) {
		const el = this.slides[index]
		this.source = el.querySelector('.js-source')
		this.mask = el.querySelector('.js-mask')
		this.maskCx = this.mask.getContext('2d')
		this.setSize()
		return this
	}

	setSize() {
		this.mask.width = this.width
		this.mask.height = this.height
		return this
	}

	clickHandle(e) {
		const el = e.currentTarget
		const direction = $(el).data('direction')
		this.updateSlides(direction)
	}

	pagerHandle(e) {
		const el = e.currentTarget
		const index = $(el).data('index')
		const direction = index > this.index ? 'next' : 'previous'
		this.updateSlides(direction)
	}

	getActiveSlide() {
		return this.slides.filter((e) => $(e).hasClass('slide__item--current'))[0]
	}

	updateSlides(direction) {
		this.activeSlide = this.getActiveSlide()
		this.index = $(this.activeSlide).index('.slide__item')
		$(this.activeSlide).addClass('is-out-of-view')
		setTimeout(() => {
			this.startTime = Date.now()
			this.drawMaskOut(direction)
		}, 75)
		return this
	}

	onSlideChange(e) {
		const index = e.detail.currentItemIndex
		const $slideItem = this.$tag.find('.slide__item')
		const $pager = this.$pagerContainer.find('.js-pager-btn')
		if(!this.started) {
			$slideItem.eq(index).removeClass('is-out-of-view')
		} else {
			this.startTime = Date.now()
			setTimeout(() => {
				this.maskCx.clearRect(0, 0, this.width, this.height)
				this.init(index)
				this.drawMaskIn()
			}, 250)
			// once the animation has finished
			$slideItem.one(animationEnd, () => {
				// get all of the elements that are not the current one 
				// and add a class
				this.slides
					.filter((e, i) => i !== index)
					.forEach(e => $(e).addClass('is-out-of-view'))
				// update the current slide
				$slideItem.eq(index).removeClass('is-out-of-view')
				// update pager classes
				$pager.removeClass('is-active')
				$pager.eq(index).addClass('is-active')
			})
		}
		// set to true after first load (this event is fired on load)
		this.started = true
	}

	setFont(position) {
		this.maskCx.save()
		this.maskCx.clearRect(0, 0, this.width, this.height)
		this.maskCx.beginPath()
		this.maskCx.font = '250px fatfrank'
		const copy = 'SNAP'
		const { width } = this.maskCx.measureText(copy)
		this.maskCx.fillText(copy, (this.width / 2 - (width / 2)), (this.height / 2) + 75)
		this.maskCx.fill()
		this.maskCx.beginPath()
		this.maskCx.globalCompositeOperation='source-in'
		this.maskCx.drawImage(this.source, position, 0, this.width, this.height)
		this.maskCx.restore()
	}

	_drawHelper(a, b) {
		const now = Date.now()
		const current = now - this.startTime
		const position = _easeOutCubic(current, a, b, 1500)
		return {
			current,
			position
		}
	}

	drawMaskIn() {
		const { current, position } = this._drawHelper(300, -300)
		this.setFont(position)
		if(current > 1500) {
			raf.cancel(handle)
			this.maskCx.clearRect(0, 0, this.width, this.height)
			return
		}
		const handle = raf(this.drawMaskIn.bind(this))
	}

	drawMaskOut(direction) {
		const { current, position } = this._drawHelper(-300, 300)
		this.setFont(position)
		if(current > 300) {
			this.slide[direction]()
			raf.cancel(handle)
			return
		}
		const handle = raf(this.drawMaskOut.bind(this, direction))
	}

	addGestures() {
		const mc = new Hammer.Manager(this.tag, {
			touchAction: 'auto',
			recognizers: [
				[Hammer.Pan,{ direction: Hammer.DIRECTION_HORIZONTAL }],
			]
		})
		const Pan = new Hammer.Pan()
		mc.add(Pan)
		mc.on('panend', (e) => {
			if(e.additionalEvent === 'panleft') {
				this.updateSlides('previous')
			} else if(e.additionalEvent === 'panright') {
				this.updateSlides('next')
			}
		})
	}
}