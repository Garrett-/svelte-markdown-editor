(function ( global, factory ) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./WindowControls.js'), require('./Toolbar.js')) :
	typeof define === 'function' && define.amd ? define(['./WindowControls', './Toolbar'], factory) :
	(global.TitleBar = factory(WindowControls,Toolbar));
}(this, (function ( WindowControls, Toolbar ) { 'use strict';

WindowControls = ( WindowControls && WindowControls.__esModule ) ? WindowControls['default'] : WindowControls;
Toolbar = ( Toolbar && Toolbar.__esModule ) ? Toolbar['default'] : Toolbar;

var template = (function () {
  return {
    data() {
      return {
        win: null,
        title: "Markdown Editor",
      };
    },

    components: {
      WindowControls,
      Toolbar
    }
  };
}());

function renderMainFragment ( root, component ) {
	var header = createElement( 'header' );
	header.className = "toolbar toolbar-header";
	
	var windowControls_initialData = {
		win: root.win
	};
	var windowControls = new template.components.WindowControls({
		target: header,
		_root: component._root || component,
		data: windowControls_initialData
	});
	
	appendNode( createText( "\n  " ), header );
	
	var h1 = createElement( 'h1' );
	h1.className = "title";
	
	appendNode( h1, header );
	var text1 = createText( root.title );
	appendNode( text1, h1 );
	appendNode( createText( "\n  " ), header );
	
	var toolbar = new template.components.Toolbar({
		target: header,
		_root: component._root || component
	});

	return {
		mount: function ( target, anchor ) {
			insertNode( header, target, anchor );
		},
		
		update: function ( changed, root ) {
			var windowControls_changes = {};
			
			if ( 'win' in changed ) windowControls_changes.win = root.win;
			
			if ( Object.keys( windowControls_changes ).length ) windowControls.set( windowControls_changes );
			
			text1.data = root.title;
		},
		
		teardown: function ( detach ) {
			windowControls.teardown( false );
			toolbar.teardown( false );
			
			if ( detach ) {
				detachNode( header );
			}
		},
	};
}

function TitleBar ( options ) {
	options = options || {};
	
	this._state = Object.assign( template.data(), options.data );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root;
	this._yield = options._yield;

	this._renderHooks = [];
	
	this._fragment = renderMainFragment( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
	
	while ( this._renderHooks.length ) {
		var hook = this._renderHooks.pop();
		hook.fn.call( hook.context );
	}
}

TitleBar.prototype.get = function get( key ) {
 	return key ? this._state[ key ] : this._state;
 };

TitleBar.prototype.fire = function fire( eventName, data ) {
 	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
 	if ( !handlers ) return;
 
 	for ( var i = 0; i < handlers.length; i += 1 ) {
 		handlers[i].call( this, data );
 	}
 };

TitleBar.prototype.observe = function observe( key, callback, options ) {
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

TitleBar.prototype.on = function on( eventName, handler ) {
 	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
 	handlers.push( handler );
 
 	return {
 		cancel: function () {
 			var index = handlers.indexOf( handler );
 			if ( ~index ) handlers.splice( index, 1 );
 		}
 	};
 };

TitleBar.prototype.set = function set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
	
	while ( this._renderHooks.length ) {
		var hook = this._renderHooks.pop();
		hook.fn.call( hook.context );
	}
};

TitleBar.prototype.teardown = function teardown ( detach ) {
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

return TitleBar;

})));