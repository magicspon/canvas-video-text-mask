	import Base from '../helpers/base'
	import raf from 'raf'

	let i = 0

	export class canvas extends Base {
		constructor(el) {
			super()
			this.$tag = $(el)
			this.text = this.$tag.data('text').split('|')
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
		}

		setFont(video) {
			i += 1
			const textHeight = this.text.length * 25
			this.maskCx.save()
			this.maskCx.clearRect(0, 0, this.width, this.height)
			this.maskCx.beginPath()
			this.maskCx.font = '68px fatfrank'
			this.text.forEach((text, index) => {
				const copy = text.toUpperCase()
				const { width } = this.maskCx.measureText(copy)
				this.maskCx.fillText(copy, (this.width / 2 - (width / 2)), (this.height / 2 + (textHeight * index) - textHeight))
			})
			this.maskCx.fill()
			this.maskCx.beginPath()
			this.maskCx.globalCompositeOperation='source-in'
			this.maskCx.drawImage(video, i, 0)
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
			this.setFont(video)
			raf(this.drawVideoToMask.bind(this, video))
		}
	}