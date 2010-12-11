/*
---
description: Provides a fallback for the placeholder property on input elements for older browsers.

license:
  - MIT-style license

authors:
  - Matthias Schmidt (http://www.m-schmidt.eu)

version:
  - 1.2

requires:
  core/1.2.5: '*'

provides:
  - Form.Placeholder

...
*/
(function(){

if (!this.Form) this.Form = {};

var supportsPlaceholder = ('placeholder' in document.createElement('input'));
if (!('supportsPlaceholder' in this) && this.supportsPlaceholder !== false && supportsPlaceholder) {
	this.Form.Placeholder = new Class({});
	return;
}

this.Form.Placeholder = new Class({
	Implements: Options,
	options: {
		color: '#A9A9A9',
		clearOnSubmit: true
	},
	initialize: function(element, options) {
		this.setOptions(options);
		this.element = $(element);

		this.placeholder = this.element.get('placeholder');
		this.original_color = this.element.getStyle('color');
		this.is_password = this.element.get('type') == 'password' ? true : false;

		this.activatePlaceholder();

		this.element.addEvents({
			'focus': function() {
				this.deactivatePlaceholder();
			}.bind(this),
		 	'blur': function() {
				this.activatePlaceholder();
		 	}.bind(this)
		});

		if (this.element.getParent('form') && this.options.clearOnSubmit) {
			this.element.getParent('form').addEvent('submit', function(e){
				if (this.element.get('value') == this.placeholder) {
					this.element.set('value', '');
				}
			}.bind(this));
		}
	},
	activatePlaceholder: function() {
		if (this.element.get('value') == '' || this.element.get('value') == this.placeholder) {
			if (this.is_password) {
				this.element.set('type', 'text');
			}
			this.element.setStyle('color', this.options.color);
			this.element.set('value', this.placeholder);
		}
	},
	deactivatePlaceholder: function() {
		if (this.element.get('value') == this.placeholder) {
			if (this.is_password) {
				this.element.set('type', 'password');
			}
			this.element.set('value', '');
			this.element.setStyle('color', this.original_color);
		}
	}
});

})();

/*
---
script: purr.js

description: Class to create growl-style popup notifications.

license: MIT-style

authors: [atom smith]

requires:
- core/1.3: [Core, Browser, Array, Function, Number, String, Hash, Event, Class.Extras, Element.Event, Element.Style, Element.Dimensions, Fx.CSS, FX.Tween, Fx.Morph]

provides: [Purr, Element.alert]
...
*/


var Purr = new Class({

	'options': {
		'mode': 'top',
		'position': 'left',
		'elementAlertClass': 'purr-element-alert',
		'elements': {
			'wrapper': 'div',
			'alert': 'div',
			'buttonWrapper': 'div',
			'button': 'button'
		},
		'elementOptions': {
			'wrapper': {
				'styles': {
					'position': 'fixed',
					'z-index': '9999'
				},
				'class': 'purr-wrapper'
			},
			'alert': {
				'class': 'purr-alert',
				'styles': {
					'opacity': '.85'
				}
			},
			'buttonWrapper': {
				'class': 'purr-button-wrapper'
			},
			'button': {
				'class': 'purr-button'
			}
		},
		'alert': {
			'buttons': [],
			'clickDismiss': true,
			'hoverWait': true,
			'hideAfter': 5000,
			'fx': {
				'duration': 500
			},
			'highlight': false,
			'highlightRepeat': false,
			'highlight': {
				'start': '#FF0',
				'end': false
			}
		}
	},

	'Implements': [Options, Events, Chain],

	'initialize': function(options){
		this.setOptions(options);
		this.createWrapper();
		return this;
	},

	'bindAlert': function(){
		return this.alert.bind(this);
	},

	'createWrapper': function(){
		this.wrapper = new Element(this.options.elements.wrapper, this.options.elementOptions.wrapper);
		if(this.options.mode == 'top')
		{
			this.wrapper.setStyle('top', 0);
		}
		else
		{
			this.wrapper.setStyle('bottom', 0);
		}
		document.id(document.body).grab(this.wrapper);
		this.positionWrapper(this.options.position);
	},

	'positionWrapper': function(position){
		if(typeOf(position) == 'object')
		{

			var wrapperCoords = this.getWrapperCoords();

			this.wrapper.setStyles({
				'bottom': '',
				'left': position.x,
				'top': position.y - wrapperCoords.height,
				'position': 'absolute'
			});
		}
		else if(position == 'left')
		{
			this.wrapper.setStyle('left', 0);
		}
		else if(position == 'right')
		{
			this.wrapper.setStyle('right', 0);
		}
		else
		{
			this.wrapper.setStyle('left', (window.innerWidth / 2) - (this.getWrapperCoords().width / 2));
		}
		return this;
	},

	'getWrapperCoords': function(){
		this.wrapper.setStyle('visibility', 'hidden');
		var measurer = this.alert('need something in here to measure');
		var coords = this.wrapper.getCoordinates();
		measurer.destroy();
		this.wrapper.setStyle('visibility','');
		return coords;
	},

	'alert': function(msg, options){

		options = Object.merge({}, this.options.alert, options || {});

		var alert = new Element(this.options.elements.alert, this.options.elementOptions.alert);

		if(typeOf(msg) == 'string')
		{
			alert.set('html', msg);
		}
		else if(typeOf(msg) == 'element')
		{
			alert.grab(msg);
		}
		else if(typeOf(msg) == 'array')
		{
			var alerts = [];
			msg.each(function(m){
				alerts.push(this.alert(m, options));
			}, this);
			return alerts;
		}

		alert.store('options', options);

		if(options.buttons.length > 0)
		{
			options.clickDismiss = false;
			options.hideAfter = false;
			options.hoverWait = false;
			var buttonWrapper = new Element(this.options.elements.buttonWrapper, this.options.elementOptions.buttonWrapper);
			alert.grab(buttonWrapper);
			options.buttons.each(function(button){
				if(button.text != undefined)
				{
					var callbackButton = new Element(this.options.elements.button, this.options.elementOptions.button);
					callbackButton.set('html', button.text);
					if(button.callback != undefined)
					{
						callbackButton.addEvent('click', button.callback.pass(alert));
					}
					if(button.dismiss != undefined && button.dismiss)
					{
						callbackButton.addEvent('click', this.dismiss.pass(alert, this));
					}
					buttonWrapper.grab(callbackButton);
				}
			}, this);
		}
		if(options.className != undefined)
		{
			alert.addClass(options.className);
		}

		this.wrapper.grab(alert, (this.options.mode == 'top') ? 'bottom' : 'top');

		var fx = Object.merge(this.options.alert.fx, options.fx);
		var alertFx = new Fx.Morph(alert, fx);
		alert.store('fx', alertFx);
		this.fadeIn(alert);

		if(options.highlight)
		{
			alertFx.addEvent('complete', function(){
				alert.highlight(options.highlight.start, options.highlight.end);
				if(options.highlightRepeat)
				{
					alert.highlight.periodical(options.highlightRepeat, alert, [options.highlight.start, options.highlight.end]);
				}
			});
		}
		if(options.hideAfter)
		{
			this.dismiss(alert);
		}

		if(options.clickDismiss)
		{
			alert.addEvent('click', function(){
				this.holdUp = false;
				this.dismiss(alert, true);
			}.bind(this));
		}

		if(options.hoverWait)
		{
			alert.addEvents({
				'mouseenter': function(){
					this.holdUp = true;
				}.bind(this),
				'mouseleave': function(){
					this.holdUp = false;
				}.bind(this)
			});
		}

		return alert;
	},

	'fadeIn': function(alert){
		var alertFx = alert.retrieve('fx');
		alertFx.set({
			'opacity': 0
		});
		alertFx.start({
			'opacity': [this.options.elementOptions.alert.styles.opacity, .9].pick(),
		});
	},

	'dismiss': function(alert, now){
		now = now || false;
		var options = alert.retrieve('options');
		if(now)
		{
			this.fadeOut(alert);
		}
		else
		{
			this.fadeOut.delay(options.hideAfter, this, alert);
		}
	},

	'fadeOut': function(alert){
		if(this.holdUp)
		{
			this.dismiss.delay(100, this, [alert, true])
			return null;
		}
		var alertFx = alert.retrieve('fx');
		if(!alertFx)
		{
			return null;
		}
		var to = {
			'opacity': 0
		}
		if(this.options.mode == 'top')
		{
			to['margin-top'] = '-'+alert.offsetHeight+'px';
		}
		else
		{
			to['margin-bottom'] = '-'+alert.offsetHeight+'px';
		}
		alertFx.start(to);
		alertFx.addEvent('complete', function(){
			alert.destroy();
		});
	}
});

Element.implement({

	'alert': function(msg, options){
		var alert = this.retrieve('alert');
		if(!alert)
		{
			options = options || {
				'mode':'top'
			};
			alert = new Purr(options)
			this.store('alert', alert);
		}

		var coords = this.getCoordinates();

		alert.alert(msg, options);

		alert.wrapper.setStyles({
			'bottom': '',
			'left': (coords.left - (alert.wrapper.getWidth() / 2)) + (this.getWidth() / 2),
			'top': coords.top - (alert.wrapper.getHeight()),
			'position': 'absolute'
		});

	}

});

Fx.Shake = new Class({

	Extends: Fx.Tween,

	options: {
		times: 5
	},

	initialize: function(){
		this.parent.apply(this, arguments);
		if (this.options.property) {
			this.property = this.options.property;
			delete this.options.property;
		}
		this._start = this.start;
		this.start = this.shake;
		this.duration = this.options.duration;
		this.shakeChain = new Chain();
	},

	complete: function(){
		if (!this.shakeChain.$chain.length && this.stopTimer()) this.onComplete();
		else if (this.shakeChain.$chain.length) this.shakeChain.callChain();
		return this;
	},

	shake: function(property, distance, times){
		if (!this.check(arguments.callee, property, distance)) return this;
		var args = Array.link(arguments, {property: String.type, distance: $defined, times: $defined});
		property = this.property || args.property;
		times = args.times || this.options.times;
		this.stepDur = this.duration / (times + 1);
		this._getTransition = this.getTransition;
		this.origin = this.element.getStyle(property).toInt()||0;
		this.shakeChain.chain(
			function(){
				this.shakeChain.chain(
					function() {
							this.stopTimer();
							this.getTransition = this._getTransition;
							this.options.duration = this.stepDur / 2;
							//stage three, return to origin
							this._start(property, this.origin);
					}.bind(this)
				);
				this.getTransition = function(){
					return function(p){
						return (1 + Math.sin( times*p*Math.PI - Math.PI/2 )) / 2;
					}.bind(this);
				}.bind(this);
				this.stopTimer();
				this.options.duration = this.stepDur * times;
				//stage 2: offset to the other side using the shake transition
				this._start(property, this.origin - args.distance);
			}.bind(this)
		);
		this.options.duration = this.stepDur / 2;
		//stage 1: offset to one side
		return this._start(property, this.origin + args.distance);
	},

	onCancel: function(){
		this.parent();
		this.shakeChain.clearChain();
		return this;
	}

});

Element.Properties.shake = {

	set: function(options){
		var shake = this.retrieve('shake');
		if (shake) shake.cancel();
		return this.eliminate('shake').store('shake:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('shake')){
			if (options || !this.retrieve('shake:options')) this.set('shake', options);
			this.store('shake', new Fx.Shake(this, this.retrieve('shake:options')));
		}
		return this.retrieve('shake');
	}

};

Element.implement({

	shake: function(property, distance, times, options){
		var args = Array.link(arguments, {property: String.type, distance: Number.type, times: Number.type, options: Object.type});
		if (args.options) this.set('shake', args.options);
		this.get('shake').start(args.property, args.distance, args.times);
		return this;
	}

})