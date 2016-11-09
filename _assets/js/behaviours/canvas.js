import Base from '../helpers/base'
import raf from 'raf'
import easing from 'easing-js'


export class canvas extends Base {
	constructor(el) {
		super()
		this.$tag = $(el)
		this.width = 1280
		this.height = 720
		this.video = el.querySelector('.source')
		this.canvas = el.querySelector('.video')
		this.mask = el.querySelector('.mask')
		this.player = el.querySelector('.player')
		this.maskCx = this.mask.getContext('2d')
		this.canvasCx = this.canvas.getContext('2d')
		this.playerCx = this.player.getContext('2d')
		// bind this
		this.playVideo = this.playVideo.bind(this)
		this.drawVideoToMask = this.drawVideoToMask.bind(this)
		this.setFont = this.setFont.bind(this)
		this.setSize()
		this.playVideo()

		this.startTime = Date.now()
	}

	setFont(video, position) {
		this.maskCx.save()
		this.maskCx.clearRect(0, 0, this.width, this.height)
		this.maskCx.beginPath()
		this.maskCx.font = '150px fatfrank'
		const copy = 'SNAP'
		const { width } = this.maskCx.measureText(copy)
		this.maskCx.fillText(copy, (this.width / 2 - (width / 2)), (this.height / 2) + 25)
		this.maskCx.fill()
		this.maskCx.beginPath()
		this.maskCx.globalCompositeOperation='source-in'
		this.maskCx.drawImage(video, position, 0)
		this.maskCx.restore()
	}

	setSize() {
		this.canvas.width = this.width
		this.canvas.height = this.height
		this.mask.width = this.width
		this.mask.height = this.height
		this.player.width = this.width
		this.player.height = this.height
	}

	playVideo() {
		const _this = this
		this.video.addEventListener('play', function(){
			_this.drawVideoToMask(this)
		})
	}

	drawVideoToMask(video) {
		const now = Date.now()
		const current = now - this.startTime
		const position = easing.easeOutCubic(current, 0, 250, 10000)

		if(current > 10000) {
			log('complete')
			return 
		}

		this.setFont(video, position)
		raf(this.drawVideoToMask.bind(this, video))
	}
}