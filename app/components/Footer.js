(function ( global, factory ) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Footer = factory());
}(this, (function () { 'use strict';

var template = (function () {
  return {
    data() {
      return {
        saving: false
      };
    }
  }
}());

function renderMainFragment ( root, component ) {
	var footer = createElement( 'footer' );
	footer.className = "toolbar toolbar-footer";
	
	var div = createElement( 'div' );
	div.className = "toolbar-actions";
	
	appendNode( div, footer );
	var ifBlock_anchor = createComment( "#if saving" );
	appendNode( ifBlock_anchor, div );
	
	function getBlock ( root ) {
		if ( root.saving ) return renderIfBlock_0;
		return renderIfBlock_1;
	}
	
	var currentBlock = getBlock( root );
	var ifBlock = currentBlock && currentBlock( root, component );
	
	if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );
	appendNode( createText( "\n    \n    " ), div );
	var ifBlock1_anchor = createComment( "#if saving" );
	appendNode( ifBlock1_anchor, div );
	
	function getBlock1 ( root ) {
		if ( root.saving ) return renderIfBlock1_0;
		return renderIfBlock1_1;
	}
	
	var currentBlock1 = getBlock1( root );
	var ifBlock1 = currentBlock1 && currentBlock1( root, component );
	
	if ( ifBlock1 ) ifBlock1.mount( ifBlock1_anchor.parentNode, ifBlock1_anchor );

	return {
		mount: function ( target, anchor ) {
			insertNode( footer, target, anchor );
		},
		
		update: function ( changed, root ) {
			var _currentBlock = currentBlock;
			currentBlock = getBlock( root );
			if ( _currentBlock === currentBlock && ifBlock) {
				ifBlock.update( changed, root );
			} else {
				if ( ifBlock ) ifBlock.teardown( true );
				ifBlock = currentBlock && currentBlock( root, component );
				if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );
			}
			
			var _currentBlock1 = currentBlock1;
			currentBlock1 = getBlock1( root );
			if ( _currentBlock1 === currentBlock1 && ifBlock1) {
				ifBlock1.update( changed, root );
			} else {
				if ( ifBlock1 ) ifBlock1.teardown( true );
				ifBlock1 = currentBlock1 && currentBlock1( root, component );
				if ( ifBlock1 ) ifBlock1.mount( ifBlock1_anchor.parentNode, ifBlock1_anchor );
			}
		},
		
		teardown: function ( detach ) {
			if ( ifBlock ) ifBlock.teardown( false );
			if ( ifBlock1 ) ifBlock1.teardown( false );
			
			if ( detach ) {
				detachNode( footer );
			}
		},
	};
}

function renderIfBlock1_1 ( root, component ) {
	var button = createElement( 'button' );
	
	function clickHandler ( event ) {
		component.fire('save', {type: 'html'});
	}
	
	button.addEventListener( 'click', clickHandler, false );
	
	button.type = "button";
	button.className = "btn btn-primary pull-right";
	
	appendNode( createText( "Save HTML" ), button );

	return {
		mount: function ( target, anchor ) {
			insertNode( button, target, anchor );
		},
		
		update: noop,
		
		teardown: function ( detach ) {
			button.removeEventListener( 'click', clickHandler, false );
			
			if ( detach ) {
				detachNode( button );
			}
		},
	};
}

function renderIfBlock1_0 ( root, component ) {
	var button = createElement( 'button' );
	button.type = "button";
	button.className = "btn btn-default pull-right";
	
	appendNode( createText( "Saving" ), button );

	return {
		mount: function ( target, anchor ) {
			insertNode( button, target, anchor );
		},
		
		update: noop,
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( button );
			}
		},
	};
}

function renderIfBlock_1 ( root, component ) {
	var button = createElement( 'button' );
	
	function clickHandler ( event ) {
		component.fire('save', {type: 'md'});
	}
	
	button.addEventListener( 'click', clickHandler, false );
	
	button.type = "button";
	button.className = "btn btn-primary";
	
	appendNode( createText( "Save Markdown" ), button );

	return {
		mount: function ( target, anchor ) {
			insertNode( button, target, anchor );
		},
		
		update: noop,
		
		teardown: function ( detach ) {
			button.removeEventListener( 'click', clickHandler, false );
			
			if ( detach ) {
				detachNode( button );
			}
		},
	};
}

function renderIfBlock_0 ( root, component ) {
	var button = createElement( 'button' );
	button.type = "button";
	button.className = "btn btn-default";
	
	appendNode( createText( "Saving" ), button );

	return {
		mount: function ( target, anchor ) {
			insertNode( button, target, anchor );
		},
		
		update: noop,
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( button );
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

function createComment( data ) {
	return document.createComment( data );
}

return Footer;

})));