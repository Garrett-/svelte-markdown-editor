(function ( global, factory ) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Toolbar = factory());
}(this, (function () { 'use strict';

var template = (function () {
  return {
    data() {
      return {};
    }
  };
}());

let addedCss = false;
function addCss () {
	var style = createElement( 'style' );
	style.textContent = "\n  .toolbar-actions >  div[svelte-179896200], .toolbar-actions >  [svelte-179896200] div, .toolbar-actions[svelte-179896200] > div, [svelte-179896200] .toolbar-actions >  div {\n    display: inline-block;\n    padding: 0 1em;\n  }\n";
	appendNode( style, document.head );

	addedCss = true;
}

function renderMainFragment ( root, component ) {
	var div = createElement( 'div' );
	div.setAttribute( 'svelte-179896200', '' );
	div.className = "toolbar-actions";
	
	var div1 = createElement( 'div' );
	div1.setAttribute( 'svelte-179896200', '' );
	
	appendNode( div1, div );
	appendNode( createText( "Markdown" ), div1 );
	appendNode( createText( "\n  " ), div );
	
	var div2 = createElement( 'div' );
	div2.setAttribute( 'svelte-179896200', '' );
	div2.className = "pull-right";
	
	appendNode( div2, div );
	appendNode( createText( "HTML" ), div2 );

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
		},
		
		update: noop,
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( div );
			}
		},
	};
}

function Toolbar ( options ) {
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

Toolbar.prototype.get = function get( key ) {
 	return key ? this._state[ key ] : this._state;
 };

Toolbar.prototype.fire = function fire( eventName, data ) {
 	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
 	if ( !handlers ) return;
 
 	for ( var i = 0; i < handlers.length; i += 1 ) {
 		handlers[i].call( this, data );
 	}
 };

Toolbar.prototype.observe = function observe( key, callback, options ) {
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

Toolbar.prototype.on = function on( eventName, handler ) {
 	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
 	handlers.push( handler );
 
 	return {
 		cancel: function () {
 			var index = handlers.indexOf( handler );
 			if ( ~index ) handlers.splice( index, 1 );
 		}
 	};
 };

Toolbar.prototype.set = function set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

Toolbar.prototype.teardown = function teardown ( detach ) {
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

return Toolbar;

})));