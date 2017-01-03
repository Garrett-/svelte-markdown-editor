(function ( global, factory ) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.MarkdownEditor = factory());
}(this, (function () { 'use strict';

var template = (function () {
  return {
    onrender() {
      this.valueObserver = this.observe('value', (newValue, oldValue) => {
        if(newValue !== oldValue) { this.set({value: newValue}); }
      });
    },

    data() {
      return {
        value: ''
      };
    },

    methods: {
      changed() {
        const value = this.refs.editor.value;
        this.set({ value });
        this.fire('changed', { value });
      }
    }

  };
}());

let addedCss = false;
function addCss () {
	var style = createElement( 'style' );
	style.textContent = "\n  .markdown-input[svelte-3798181119], [svelte-3798181119] .markdown-input {\n    position: absolute;\n    border: none;\n    height: 100%;\n    resize: none;\n  }\n\n  .markdown-input[svelte-3798181119]:focus, [svelte-3798181119] .markdown-input:focus {\n    outline: none;\n    border: none;\n    box-shadow: none;\n  }\n";
	appendNode( style, document.head );

	addedCss = true;
}

function renderMainFragment ( root, component ) {
	var textarea = createElement( 'textarea' );
	textarea.setAttribute( 'svelte-3798181119', '' );
	component.refs.editor = textarea;
	
	function keyupHandler ( event ) {
		component.changed();
	}
	
	textarea.addEventListener( 'keyup', keyupHandler, false );
	
	textarea.name = "markdown-input";
	textarea.id = "markdown-input";
	textarea.className = "markdown-input form-control";
	
	var text = createText( root.value );
	appendNode( text, textarea );

	return {
		mount: function ( target, anchor ) {
			insertNode( textarea, target, anchor );
		},
		
		update: function ( changed, root ) {
			text.data = root.value;
		},
		
		teardown: function ( detach ) {
			if ( component.refs.editor === textarea ) component.refs.editor = null;
			textarea.removeEventListener( 'keyup', keyupHandler, false );
			
			if ( detach ) {
				detachNode( textarea );
			}
		},
	};
}

function MarkdownEditor ( options ) {
	options = options || {};
	
	this.refs = {}
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
	
	if ( options._root ) {
		options._root._renderHooks.push({ fn: template.onrender, context: this });
	} else {
		template.onrender.call( this );
	}
}

MarkdownEditor.prototype = template.methods;

MarkdownEditor.prototype.get = function get( key ) {
 	return key ? this._state[ key ] : this._state;
 };

MarkdownEditor.prototype.fire = function fire( eventName, data ) {
 	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
 	if ( !handlers ) return;
 
 	for ( var i = 0; i < handlers.length; i += 1 ) {
 		handlers[i].call( this, data );
 	}
 };

MarkdownEditor.prototype.observe = function observe( key, callback, options ) {
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

MarkdownEditor.prototype.on = function on( eventName, handler ) {
 	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
 	handlers.push( handler );
 
 	return {
 		cancel: function () {
 			var index = handlers.indexOf( handler );
 			if ( ~index ) handlers.splice( index, 1 );
 		}
 	};
 };

MarkdownEditor.prototype.set = function set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

MarkdownEditor.prototype.teardown = function teardown ( detach ) {
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

function createText( data ) {
	return document.createTextNode( data );
}

function appendNode( node, target ) {
	target.appendChild( node );
}

return MarkdownEditor;

})));