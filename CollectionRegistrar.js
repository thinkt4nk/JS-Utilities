//============================================================================
// CollectionRegistrar
// 
// A module for registering infinitely deep objects
// 
// Only registers objects which implement a given list of interfaces, otherwise
// recurses, appending its name to a dot separated namespace path
//============================================================================
(function($) {

	/**
	 * Registers a collection, recurses on subforms
	 * 
	 * @param {object} o The object to register
	 * @param {string} namespace (optional) The namespace in recursive calls
	 * @return {object} The collection to register
	 */
	function registerCollection(o,interfaces,namespace) {
		// create a register object
		var register = {};
		// for each property in o
		for (var property in o) {
			var registered = false;
			// don't register a collection without a name
			if (namespace != null) {
				// only register collections which implement designated interfaces
				var implements_interfaces = true;
				$.each(interfaces, function() {
					if (!this.call(o[property])) {
						implements_interfaces = false;
						return false;
					}
				});
				if (implements_interfaces) {
					registered = true;
					// register member in namespace
					register[namespace] = register[namespace] || {};
					register[namespace][property] = o[property];
				}
			}
			if (!registered) {
				var property_namespace = (namespace != null)
						? [namespace,property].join('.')
						: property
						;
				// recurse, sending namespace += property name, return value should be added to register
				$.extend(true, register, registerCollection(o[property],interfaces,property_namespace));
			}
		}
		// return register
		return register;
	}

	// private
	var _collection = {};
	// public
	$.extend({

		registerCollection: function(collection, interfaces) {
			interfaces = interfaces || [];
			$.extend(true, _collection, registerCollection(collection, interfaces));
		},

		getMember: function(namespace) {
			return _collection[namespace];
		},

		getCollection: function() {
			return _collection;
		}
	});

})(jQuery);

//=============================================================================
// Example Usage
//=============================================================================
/*
var hasValue = function() { return (this.value != null); };
$.registerCollection(
  {
    TopLevel: {
      SecondTier: {
        ThirdTier: {
           thirdFirst: { value: "moop" }, thirdSecond: { value: "blah" }
        },
        secondFirst: { value: "meh" }, secondSecond: { value: "moo" }
      }
    }
  },
  [hasValue]
);

console.log($.getCollection());                           

Outputs: {
	"TopLevel.SecondTier": { secondFirst: {...}, secondSecond: {...} },
	"TopLevel.SecondTier.ThirdTier": { thirdFirst: {...}, thirdSecond: {...} }
}
*/                          
