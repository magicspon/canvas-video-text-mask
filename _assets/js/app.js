import './libs/polyfills'
// attached jQuery to the window for global access
import jQuery from 'jquery'
window.$ = jQuery

import WebFont from 'webfontloader'
import debug from 'debug'
import * as behaviours from './behaviours'
import loader from './loader'

// logs enabled during development
window.log = debug('app:log')	
if(ENV === 'development') {
	debug.enable('app:log')
} else {
	debug.disable('app:log')
}

log('Logging is enabled!, ENV')

WebFont.load({
	typekit: { id: 'cdu5srl' }
})

$(function() {
	loader(behaviours)
})