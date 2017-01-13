(function ( global, factory ) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Footer = factory());
}(this, (function () { 'use strict';

var template = (function () {
  return {
    onrender() {
      this.savingObserver = this.observe('saving', saving => {
        this.set({savingClass: saving?'is-loading':''});
      });
    },

    onteardown() {
      this.savingObserver.cancel();
    },

    data() {
      return {
        savingClass: '',
        saving: false
      };
    }
  }
}());

function renderMainFragment ( root, component ) {
	var div = createElement( 'div' );
	div.className = "columns";
	
	var div1 = createElement( 'div' );
	div1.className = "column";
	
	appendNode( div1, div );
	
	var button = createElement( 'button' );
	
	function clickHandler ( event ) {
		component.fire('save', {type: 'md'});
	}
	
	button.addEventListener( 'click', clickHandler, false );
	
	button.type = "button";
	button.className = "button is-primary " + ( root.savingClass );
	
	appendNode( button, div1 );
	appendNode( createText( "Save Markdown" ), button );
	appendNode( createText( "\n  " ), div );
	
	var div2 = createElement( 'div' );
	div2.className = "column";
	
	appendNode( div2, div );
	
	var button1 = createElement( 'button' );
	
	function clickHandler1 ( event ) {
		component.fire('save', {type: 'html'});
	}
	
	button1.addEventListener( 'click', clickHandler1, false );
	
	button1.type = "button";
	button1.className = "button is-primary is-pulled-right " + ( root.savingClass );
	
	appendNode( button1, div2 );
	appendNode( createText( "Save HTML" ), button1 );

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
		},
		
		update: function ( changed, root ) {
			button.className = "button is-primary " + ( root.savingClass );
			
			button1.className = "button is-primary is-pulled-right " + ( root.savingClass );
		},
		
		teardown: function ( detach ) {
			button.removeEventListener( 'click', clickHandler, false );
			button1.removeEventListener( 'click', clickHandler1, false );
			
			if ( detach ) {
				detachNode( div );
			}
		},
	};
}

function Footer ( options ) {
	options = options || {};
	
	this._state = Object.assign( template.data(), options.data );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root;
	this._yield = options._yield;

	this._fragment = renderMainFragment( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
	
	if ( options._root ) {
		options._root._renderHooks.push({ fn: template.onrender, context: this });
	} else {
		template.onrender.call( this );
	}
}

Footer.prototype.get = function get( key ) {
 	return key ? this._state[ key ] : this._state;
 };

Footer.prototype.fire = function fire( eventName, data ) {
 	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
 	if ( !handlers ) return;
 
 	for ( var i = 0; i < handlers.length; i += 1 ) {
 		handlers[i].call( this, data );
 	}
 };

Footer.prototype.observe = function observe( key, callback, options ) {
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

Footer.prototype.on = function on( eventName, handler ) {
 	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
 	handlers.push( handler );
 
 	return {
 		cancel: function () {
 			var index = handlers.indexOf( handler );
 			if ( ~index ) handlers.splice( index, 1 );
 		}
 	};
 };

Footer.prototype.set = function set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

Footer.prototype.teardown = function teardown ( detach ) {
	this.fire( 'teardown' );
template.onteardown.call( this );

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

return Footer;

})));