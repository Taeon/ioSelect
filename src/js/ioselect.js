// TODO: display dropdown fullscreen on mobile
// TODO: keyboard navigation
// TODO: disabled select element
// TODO: disable search
// TODO: destroy
// TODO: events
// TODO: OPTGROUP support
// TODO: break up source code, create minified version
// TODO: separate CSS into base + theme
// TODO: package as module

// Possible features...
// TODO: disable search based on number of items
// TODO: No results text
// TODO: limit number of selections in select multiple
// TODO: focus on label click
// TODO: deselect on single select (i.e. set to first blank option)?


var ioselect = function( element ){
	this.addClass( element, 'ioselect-hidden' );
	this.element = element;
	var container = this.create( '<div class="ioselect-container"><div class="ioselect-select"></div><div class="ioselect-dropdown"><input tabindex="-1" type="text" class="ioselect-search"  autocorrect="off" autocapitalize="off"><ul></ul></div>' );
	this.after( element, container );

	// The outer container for the replacement selector
	this.container = element.parentNode.querySelector( '.ioselect-container' );
	// The dropdown -- we'll build it later
	this.dropdown = element.parentNode.querySelector( '.ioselect-dropdown' );
	this.list = element.parentNode.querySelector( '.ioselect-dropdown ul' );
	this.search = element.parentNode.querySelector( '.ioselect-dropdown input[type=text]' );
	this.dropdown_built = false;

	// The replacement select element
	this.select = element.parentNode.querySelector( '.ioselect-select' );
	// Listen for click
	this.select.addEventListener(
		'click',
		this.ClickSelect.bind(this)
	);
	this.element.addEventListener(
		'change',
		this.Update.bind(this)
	);
	// Update the text showing in the select area
	this.UpdateSelect();

	// We append this to the body because otherwise there are issues with
	// clipping when the select is inside an element with overflow set
	this.append( document.querySelector( 'body' ), this.dropdown );

	if( typeof MutationObserver != 'undefined' ){
		// Listen for changes (e.g. add/remove options) and trigger an update
		new MutationObserver(
			this.SelectMutated.bind( this )
		).observe(
			this.element,
			{
				childList: true,
				attributes: true
			}
		);
	}

	// The mask detects clicks outside the dropdown
	this.mask = this.create( '<div class="ioselect-mask"></div>' ).item(0);
	this.mask.addEventListener(
		'click',
		this.HideDropdown.bind( this )
	);

	// Search filter text
	this.filter = '';
	// Listen for keypress -- tracks if user presses escape or tab
	this.keypress_listener = this.ListenForKeyPress.bind(this);
	// Listen for typing in search input box
	this.search_listener = this.Search.bind(this);
	// Stores a delay when updating dropdown due to search filter change
	this.search_timeout = null;

	this.scroll_listener = function(event){this.HideDropdown();}.bind(this);
}
ioselect.prototype.SelectMutated = function( mutations ){
	for( var i = 0; i < mutations.length; i++ ){
		switch( mutations[i].type ){
			case 'childList':{
				this.HideDropdown();
				this.Update();
				break;
			}
			case 'attributes':{
				this.HideDropdown();
				this.UpdateSelect();
				break;
			}
		}
	}
}
/**
 * An option in the dropdown has been clicked
 */
ioselect.prototype.ClickSelect = function( event ){
	if( this.hasClass( this.container, 'ioselect-disabled' ) ){
		return;
	}
	if( this.hasClass( this.container, 'ioselect-open' ) ){
		this.HideDropdown();
	} else {
		this.ShowDropdown();
	}
}
/**
 * Show the dropdown
 */
ioselect.prototype.ShowDropdown = function( event ){
	// We delay creating the dropdown until it's  first opened
	// But it only happens once (unless you search filter text is changed)
	if( !this.dropdown_built ){
		this.BuildDropdown();
	}
	var position = this.position( this.container );
	var top = position.top + this.select.offsetHeight;

	this.dropdown.style.top = top + 'px';
	this.dropdown.style.left = position.left + 'px';
	this.addClass( this.container, 'ioselect-open' );
	this.addClass( this.dropdown, 'ioselect-open' );

	// See if it's dropping off the bottom of the screen
	var dropdown_top = top - document.documentElement.scrollTop;
	var dropdown_height = this.dropdown.offsetHeight;
	var viewport_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);;
	if ( dropdown_top + dropdown_height > viewport_height ) {
		// Put it above the select
		this.dropdown.style.top = position.top + 'px';
		this.addClass( this.dropdown, 'ioselect-drop-up' );
	}

	// Enable the mask (in case user clicks outside dropdown)
	this.append( document.querySelector( 'body' ), this.mask );

	// Listen for keypresses (escape, tab)
	document.querySelector( 'body' ).addEventListener(
		'keyup',
		this.keypress_listener
	);
	// Listen for search input
	this.search.addEventListener(
		'keyup',
		this.search_listener
	);

	// Hide the dropdown on scroll
	var parent = this.element.parentNode;
	while( parent != null ){
		parent.addEventListener( 'scroll', this.scroll_listener );
		parent = parent.parentNode;
	}
}
/**
 * Hide the dropdown
 */
ioselect.prototype.HideDropdown = function( event ){
	if( !this.hasClass( this.container, 'ioselect-open' ) ){
		return;
	}
	// Remove classes
	this.removeClass( this.container, 'ioselect-open' );
	this.removeClass( this.dropdown, 'ioselect-open' );
	this.removeClass( this.dropdown, 'ioselect-drop-up' );
	// Hide the mask
	if( this.mask.parentNode != null ){
		document.querySelector( 'body' ).removeChild( this.mask );
	}
	// Clear search text
	if(	this.filter.length > 0 ){
		this.search.value = '';
		this.filter = '';
		// Dropdown will need to be rebuilt next time
		this.dropdown_built = false;
	}
	// Remove key event listeners
	document.querySelector( 'body' ).removeEventListener(
		'keyup',
		this.keypress_listener
	);
	this.search.removeEventListener(
		'keyup',
		this.search_listener
	);
	// Don't bother to update the dropdown
	this.ClearSearchTimeout();
	var parent = this.element.parentNode;
	while( parent != null ){
		parent.removeEventListener( 'scroll', this.scroll_listener );
		parent = parent.parentNode;
	}

}
/**
 * Listen for any key pressed (while dropdown is open)
 */
ioselect.prototype.ListenForKeyPress = function( event ){
	if(
		event.keyCode == 27 // Escape
		||
		event.keyCode == 9 // Tab
	){
		this.HideDropdown();
	}
}
/**
 * An option was clicked
 */
ioselect.prototype.ClickOption = function( event ){
	if( this.hasClass( event.target, 'ioselect-selected' ) || this.hasClass( event.target, 'ioselect-disabled' ) ){
		return;
	}
	var option = this.closest( event.target, '.ioselect-option' );
	if( option === null ){
		return;
	}
	var value = option.getAttribute( 'data-value' );
	// Update original select
	if ( typeof this.element.getAttribute( 'multiple' ) != 'undefined' && this.element.getAttribute( 'multiple' ) != null ) {
        // Convert string to array
        if ( Object.prototype.toString.call( value ) !== '[object Array]' ) {
            value = [value];
        }
        for( var i = 0; i < value.length; i++ ){
            var options = this.element.querySelectorAll( 'option[value="' + value[ i ].toString()  + '"]' );
            for( var o = 0; o < options.length; o++ ){
                options[ o ].selected = true;
            }
        }
		this.addClass( event.target, 'ioselect-selected' );
    } else {
        var options = this.element.querySelectorAll( 'option[value="' + value.toString()  + '"]' );
        for( var o = 0; o < options.length; o++ ){
            options[ o ].selected = true;
        }
    }
	this.trigger( this.element, 'change' );
	this.HideDropdown();
}
/**
 * Remove an item from multiple select
 */
ioselect.prototype.RemoveSelectedItem = function( event ){
	event.stopPropagation();
	var index = Array.prototype.indexOf.call(event.target.parentNode.childNodes, event.target);
	var option = this.element.querySelectorAll( 'option:checked' )[ index ]
	option.selected = false;
	this.removeClass( this.list.querySelector( '[data-value="' + option.value + '"]' ), 'ioselect-selected' );
	this.trigger( this.element, 'change' );
}
/**
 * (Re)build the dropdown
 */
ioselect.prototype.BuildDropdown = function(){
	this.ClearSearchTimeout();
	// Get options
	var options = this.element.querySelectorAll( 'option' );
	// Using string and innerHTML is much faster to render
	// ...than creating individual DOM nodes
	var options_html = '';
	for( var i = 0; i < options.length; i++ ){
		var option = options[i];
		// Filter?
		if( this.filter.length > 0 ){
			if( !(option.innerText.indexOf( this.filter ) === 0) ){
				continue;
			}
		}
		var disabled = '';
		if( option.getAttribute( 'disabled' ) !== null ){
			disabled = ' ioselect-disabled'
		}
		var selected = '';
		if( option.selected ){
			selected = ' ioselect-selected';
		}
		options_html += '<li class="ioselect-option' + disabled + selected + '" data-value="' + option.value + '">' + option.text+ '</li>';
	}
	this.list.innerHTML = options_html;
	// Listen for click
	var options = this.dropdown.addEventListener(
		'click',
		this.ClickOption.bind( this )
	);
	this.UpdateSelect();

	this.dropdown_built = true;
}
ioselect.prototype.Update = function(){
	this.dropdown_built = false;
	this.UpdateSelect();
}
/**
 * Update the text shown in the select area
 */
ioselect.prototype.UpdateSelect = function(){
	var selected = this.element.querySelectorAll( 'option:checked' );
	if ( typeof this.element.getAttribute( 'multiple' ) != 'undefined' && this.element.getAttribute( 'multiple' ) != null ) {
		var values = '';
        for( var i = 0; i < selected.length; i++ ){
            if ( selected[ i ].hasAttribute( 'value' ) ) {
                values += '<span class="ioselect-selected-item">' + selected[ i ].innerText + '</span>';
            }
        }
		this.select.innerHTML = values;
		var items = this.select.querySelectorAll( '.ioselect-selected-item' );
		for( var i = 0; i < items.length; i++ ){
			items[ i ].addEventListener( 'click', this.RemoveSelectedItem.bind( this ) );
		}
	} else {
		// None selected, use first
		if( selected.length == 0 ){
			var selected = this.element.querySelectorAll( 'option' );
		}
		this.select.innerText = selected.item(0).innerText;
	}
	if( this.element.disabled ){
		this.addClass( this.container, 'ioselect-disabled' );
	}
}
/**
 * Listen for changes to the search input
 */
ioselect.prototype.Search = function(){
	// Has the filter text changed?
	if( this.filter != this.search.value ){
		// Cancel any pending update
		if( this.search_timeout != null ){
			this.ClearSearchTimeout();
		}
		// Update the filter
		this.filter = this.search.value;
		// Set a timeout to update the dropdown
		this.search_timeout = setTimeout( function(){ this.search_timeout = null; this.BuildDropdown(); }.bind(this), 200 );
	}

}
/**
 * Remove a build redraw timeout
 */
ioselect.prototype.ClearSearchTimeout = function(){
	clearTimeout( this.search_timeout );
	this.search_timeout = null;
}
ioselect.prototype.position = function( elem ){
	var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}


/**
 * DOM manipulation helper methods
 */
ioselect.prototype.addClass = function( element, className ){
	if ( false && element.classList ){
		element.classList.add( className );
	} else {
		element.className += ' ' + className;
	}
}
ioselect.prototype.removeClass = function( element, className ){
	if (false && element.classList)
	  element.classList.remove(className);
	else
	  element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
 }
ioselect.prototype.hasClass = function( element, className ){
	if (element.classList)
	  return element.classList.contains(className);
	else
	  return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
}
ioselect.prototype.create = function( html ){
	var div = document.createElement('div');
	div.innerHTML = html;
	return div.childNodes;
}
ioselect.prototype.after = function( element, html ){
	if( typeof html == 'string' ){
		html = this.create( html );
	}
	for( var i = 0; i < html.length; i++ ){
		element.parentNode.insertBefore( html[ i ], element.nextSibling );
	}
}
ioselect.prototype.append = function( element, html ){
	if( typeof html == 'string' ){
		html = this.create( html );
	}
	if( typeof html.length == 'undefined' ){
		element.appendChild( html );
	} else {
		for( var i = 0; i < html.length; i++ ){
			element.appendChild( html[i] );
		}
	}
}
ioselect.prototype.trigger = function( element, event ){
	if ("createEvent" in document) {
	    var evt = document.createEvent("HTMLEvents");
	    evt.initEvent( event, false, true);
	    element.dispatchEvent(evt);
	}
	else
	    element.fireEvent(event);
}

// Taken from https://gist.github.com/mishschmid/6c5e53b86b624c120268ecc8f626114c
ioselect.prototype.closest = function (el, selector) {
    while (el.matches && !el.matches(selector)) el = el.parentNode;
    return el.matches ? el : null;
};
// Polyfill for Element.matches
Element.prototype.matches = Element.prototype.matches ||
	Element.prototype.matchesSelector ||
	Element.prototype.webkitMatchesSelector ||
	Element.prototype.msMatchesSelector ||
	function (selector) {
	    var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
	    while (nodes[++i] && nodes[i] !== node);
	    return !!nodes[i];
	};
