(function ( global, factory ) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.WindowControls = factory());
}(this, (function () { 'use strict';

var template = (function () {
  return {
    data() {
      return {
        win: null
      }
    },

    methods: {

      close() {
        const win = this.get('win');
        if(win) {
          win.close();
        }
      },

      min() {
        const win = this.get('win');
        if(win) {
          win.minimize();
        }
      },

      max() {
        const win = this.get('win');
        if(win) {
          if(win.isMaximized()) {
            win.unmaximize();
          } else {
            win.maximize();
          }
        }
      }

    }
  };
}());

let addedCss = false;
function addCss () {
	var style = createElement( 'style' );
	style.textContent = "\n  .window-actions[svelte-884004807], [svelte-884004807] .window-actions {\n    list-style: none;\n    margin: 0 0 0 10px;\n    padding: 0;\n    font-size: 105%;\n  }\n\n  .window-actions  span.icon[svelte-884004807], .window-actions  [svelte-884004807] span.icon, .window-actions[svelte-884004807]  span.icon, [svelte-884004807] .window-actions  span.icon {\n    display: inline-block;\n    float: left;\n    padding: 0 2.5px;\n  }\n\n  .window-actions:hover  .close[svelte-884004807], .window-actions:hover  [svelte-884004807] .close, .window-actions[svelte-884004807]:hover  .close, [svelte-884004807] .window-actions:hover  .close {\n    color: red;\n  }\n  .window-actions:hover  .min[svelte-884004807], .window-actions:hover  [svelte-884004807] .min, .window-actions[svelte-884004807]:hover  .min, [svelte-884004807] .window-actions:hover  .min {\n    color: yellow;\n  }\n  .window-actions:hover  .max[svelte-884004807], .window-actions:hover  [svelte-884004807] .max, .window-actions[svelte-884004807]:hover  .max, [svelte-884004807] .window-actions:hover  .max {\n    color: green;\n  }\n";
	appendNode( style, document.head );

	addedCss = true;
}

function renderMainFragment ( root, component ) {
	var ul = createElement( 'ul' );
	ul.setAttribute( 'svelte-884004807', '' );
	ul.className = "window-actions";
	
	var li = createElement( 'li' );
	li.setAttribute( 'svelte-884004807', '' );
	
	appendNode( li, ul );
	
	var span = createElement( 'span' );
	span.setAttribute( 'svelte-884004807', '' );
	
	function clickHandler ( event ) {
		component.close();
	}
	
	span.addEventListener( 'click', clickHandler, false );
	
	span.className = "icon icon-record close";
	
	appendNode( span, li );
	appendNode( createText( "\n  " ), ul );
	
	var li1 = createElement( 'li' );
	li1.setAttribute( 'svelte-884004807', '' );
	
	appendNode( li1, ul );
	
	var span1 = createElement( 'span' );
	span1.setAttribute( 'svelte-884004807', '' );
	
	function clickHandler1 ( event ) {
		component.min();
	}
	
	span1.addEventListener( 'click', clickHandler1, false );
	
	span1.className = "icon icon-record min";
	
	appendNode( span1, li1 );
	appendNode( createText( "\n  " ), ul );
	
	var li2 = createElement( 'li' );
	li2.setAttribute( 'svelte-884004807', '' );
	
	appendNode( li2, ul );
	
	var span2 = createElement( 'span' );
	span2.setAttribute( 'svelte-884004807', '' );
	
	function clickHandler2 ( event ) {
		component.max();
	}
	
	span2.addEventListener( 'click', clickHandler2, false );
	
	span2.className = "icon icon-record max";
	
	appendNode( span2, li2 );

	return {
		mount: function ( target, anchor ) {
			insertNode( ul, target, anchor );
		},
		
		update: noop,
		
		teardown: function ( detach ) {
			span.removeEventListener( 'click', clickHandler, false );
			span1.removeEventListener( 'click', clickHandler1, false );
			span2.removeEventListener( 'click', clickHandler2, false );
			
			if ( detach ) {
				detachNode( ul );
			}
		},
	};
}

function WindowControls ( options ) {
	options = options || {};
	
	this._state = Object.assign( template.data(), options.data );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root;
	this._yield = options._yield;

	if ( !addedCss ) addCss();
	
	this._fragment = renderMainFragment( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
}

WindowControls.prototype = template.methods;

WindowControls.prototype.get = function get( key ) {
 	return key ? this._state[ key ] : this._state;
 };

WindowControls.prototype.fire = function fire( eventName, data ) {
 	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
 	if ( !handlers ) return;
 
 	for ( var i = 0; i < handlers.length; i += 1 ) {
 		handlers[i].call( this, data );
 	}
 };

WindowControls.prototype.observe = function observe( key, callback, options ) {
 	var group = ( options && options.defer ) ? this._observers.pre : this._observers.post;
 
 	( group[ key ] || ( group[ key ] = [] ) ).push( callback );
 
 	if ( !options || options.init !== false ) {
 		callback.__calling = true;
 		callback.call( this, this._state[ key ] );
 		callback.__calling = false;
 	}
 
 	return {
 		cancel: function () {
 			var index = group[ key ].indexOf( callback );
 			if ( ~index ) group[ key ].splice( index, 1 );
 		}
 	};
 };

WindowControls.prototype.on = function on( eventName, handler ) {
 	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
 	handlers.push( handler );
 
 	return {
 		cancel: function () {
 			var index = handlers.indexOf( handler );
 			if ( ~index ) handlers.splice( index, 1 );
 		}
 	};
 };

WindowControls.prototype.set = function set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

WindowControls.prototype.teardown = function teardown ( detach ) {
	this.fire( 'teardown' );

	this._fragment.teardown( detach !== false );
	this._fragment = null;

	this._state = {};
};

function dispatchObservers( component, group, newState, oldState ) {
	for ( var key in group ) {
		if ( !( key in newState ) ) continue;

		var newValue = newState[ key ];
		var oldValue = oldState[ key ];

		if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

		var callbacks = group[ key ];
		if ( !callbacks ) continue;

		for ( var i = 0; i < callbacks.length; i += 1 ) {
			var callback = callbacks[i];
			if ( callback.__calling ) continue;

			callback.__calling = true;
			callback.call( component, newValue, oldValue );
			callback.__calling = false;
		}
	}
}

function createElement( name ) {
	return document.createElement( name );
}

function detachNode( node ) {
	node.parentNode.removeChild( node );
}

function insertNode( node, target, anchor ) {
	target.insertBefore( node, anchor );
}

function appendNode( node, target ) {
	target.appendChild( node );
}

function createText( data ) {
	return document.createTextNode( data );
}

function noop() {}

return WindowControls;

})));