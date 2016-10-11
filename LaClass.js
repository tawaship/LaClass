
/**
 * LaClass - smart class building system for EcmaScript 5 
 *
 * @author   tawaship
 * @email    makazu.mori@gmail.com
 * @version  1.0.0
 * @license  MIT License
 *
 * Copyright (c) 2016 tawaship
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * this software and associated documentation files (the "Software"), to deal
 * the Software without restriction, including without limitation the rights
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * ies of the Software, and to permit persons to whom the Software is
 * nished to do so, subject to the following conditions:
 * 
 *  above copyright notice and this permission notice shall be included in all
 * ies or substantial portions of the Software.
 * 
 *  SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * LIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * NESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * HORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * BILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * TWARE.
 */
(function() {
	const ACCESSIBILITY_PRIVATE   = 0;
	const ACCESSIBILITY_PROTECTED = 1;
	const ACCESSIBILITY_PUBLIC    = 2;
	const ACCESSIBILITYS = ['private', 'protected', 'public'];
	
	const VARIABLE_TYPE_FUNCTION     = 0;
	const VARIABLE_TYPE_NOT_FUNCTION = 1;
	const VARIABLE_TYPES = ['function', 'not function'];
	
	/**
	 * Create class that appended LaClass
	 *
	 * @param  {function} caller  Caller function
	 * @param  {function} _class  Class constructor of callee function
	 * @return {bool}
	 */
	Object.defineProperty(window, 'Class', {
		value: function(c) {
			
			// if argument is nothing, use a default constructor (is empty function)
			c = c || function LaClassObject() {};
			if (!(c instanceof Function)) {
				throw new TypeError('Arguments is not a function.');
			}
			
			Object.defineProperties(c, {
				extends: {
					value: _extends
				},
				member: {
					value: _member
				},
				_namespace: {
					value: c
				},
				_memberInfo: {
					value: {}
				},
				public: {
					value: Object.defineProperties({}, {
						final: {
							value: Object.defineProperties({}, {
								static: {
									value: {}
								}
							})
						}
					})
				},
				protected: {
					value: Object.defineProperties({}, {
						final: {
							value: Object.defineProperties({}, {
								static: {
									value: {}
								}
							})
						}
					})
				},
				private: {
					value: Object.defineProperties({}, {
						final: {
							value: Object.defineProperties({}, {
								static: {
									value: {}
								}
							})
						}
					})
				}
			});
			
			Object.defineProperties(c.public, {
				static: {
					value: Object.defineProperties({}, {
						final: {
							value: c.public.final.static
						}
					})
				}
			});
			
			Object.defineProperties(c.protected, {
				static: {
					value: Object.defineProperties({}, {
						final: {
							value: c.protected.final.static
						}
					})
				}
			});
			
			Object.defineProperties(c.private, {
				static: {
					value: Object.defineProperties({}, {
						final: {
							value: c.private.final.static
						}
					})
				}
			});
			
			Object.defineProperties(c, {
				final: {
					value: Object.defineProperties({}, {
						public: {
							value: c.public.final
						},
						protected: {
							value: c.protected.final
						},
						private: {
							value: c.private.final
						},
						static: {
							value: Object.defineProperties({}, {
								public: {
									value: c.public.final.static
								},
								protected: {
									value: c.protected.final.static
								},
								private: {
									value: c.private.final.static
								}
							})
						}
					})
				}
			});
			Object.defineProperties(c, {
				static: {
					value: Object.defineProperties({}, {
						final: {
							value: c.final.static
						}
					})
				},
			});
			
			return c;
		}
	});
	
	/**
	 * Append closure with access rights by caller function
	 *
	 * @param  {function} caller  Caller function
	 * @param  {function} _class  Class constructor of callee function
	 * @return {bool}
	 */
	Object.defineProperty(window, 'conform', {
		value: function(closure) {
			closure._namespace = arguments.callee.caller._namespace;
			
			return closure;
		}
	});
	
	const SKIP_MEMBER_NAME = (function() {
		var defaultMembers = Object.getOwnPropertyNames(Class()),
			obj            = {};
			
		defaultMembers.push('constrcutor');
		defaultMembers.push('_parent');
		defaultMembers.push('_isDefineMember');
		defaultMembers.push('_isInheritedOnce');
		
		for (var i = 0; i < defaultMembers.length; i++) {
			obj[defaultMembers[i]] = true;
		}
		
		return obj;
	})();
	
	/**
	 * Inherit prototype
	 *
	 * @context {function}          Class constructor
	 * @param   {function} parent   Constructor of super class
	 * @return  {function}          Constructor of sub class
	 */
	function _extends(parent) {
		var p;
		
		if (this._isInheritedOnce) {
			throw new LaClassError('Function \'extends\' must be run before create sub class.');
		}
		
		if (this._isDefineMember) {
			throw new LaClassError('Function \'extends\' must be run before function \'member\'.');
		}
		
		// If super class defined without LaClass, wrap super class.
		if (!isLaClassObject(parent)) {
			p = createInheritedClass(Class(), parent);
			createProperties.call(this, p.prototype, this.prototype, p, ACCESSIBILITY_PUBLIC, false);
			createProperties.call(this, p,           this,           p, ACCESSIBILITY_PUBLIC, false);
		} else {
			// Register reference of static member of super class
			p = parent;
			baseProto = Object.getOwnPropertyNames(p);
			for (var i = 0; i < baseProto.length; i++) {
				if (baseProto[i] in SKIP_MEMBER_NAME) {
					continue;
				}
				
				info = getMemberInfo.call(p, baseProto[i]);console.log(baseProto[i])
				createPropertyReference.call(this, baseProto[i], p, info.accessibility, info.type);
			}
		}
		
		Object.defineProperty(p, '_isInheritedOnce', {
			value: true
		});
		
		// Register constructor of super class
		Object.defineProperty(this, '_parent', {
			value: p
		});
		
		createInheritedClass(this, p);
		
		return this;
	}
	
	/**
	 * Inherit class
	 *
	 * @param   {function} c   Class constructor (i appended LaClass)
	 * @param   {function} p   Constructor of super class
	 * @return  {function}     Constructor of sub class
	 */
	function createInheritedClass(c, p) {
		var bases = Object.getOwnPropertyNames(p);
		
		c.prototype = Object.create(p.prototype, {
			constructor: {
				value: c
			},
		});
		
		return c;
	}
	
	/**
	 * Register instance member
	 *
	 * @context {function}       Class constructor
	 * @param   {function} func  This process registers members
	 * @return  {function}       Class constructor
	 */
	function _member(func) {
		var compObj, baseProto, info;
		
		if (this._isInheritedOnce) {
			throw new LaClassError('Function \'member\' must be run before create sub class.');
		}
		
		func.call(this, null);
		
		// Constructor of super class
		compObj = Object.getPrototypeOf(this.prototype).constructor;
		
		// Register member
		createProperties.call(this, this.public,                 this.prototype, compObj, ACCESSIBILITY_PUBLIC,    false);    // Register public
		createProperties.call(this, this.public.final,           this.prototype, compObj, ACCESSIBILITY_PUBLIC,    true);     // Register public final
		createProperties.call(this, this.final,                  this.prototype, compObj, ACCESSIBILITY_PUBLIC,    true);     // Register final as public final
		createProperties.call(this, this.public.static,          this,           compObj, ACCESSIBILITY_PUBLIC,    false);    // Register public static
		createProperties.call(this, this.static,                 this,           compObj, ACCESSIBILITY_PUBLIC,    false);    // Register static as public static
		createProperties.call(this, this.public.final.static,    this,           compObj, ACCESSIBILITY_PUBLIC,    true);     // Register public final static
		createProperties.call(this, this.final.static,           this,           compObj, ACCESSIBILITY_PUBLIC,    true);     // Register final static as public final static
		createProperties.call(this, this.protected,              this.prototype, compObj, ACCESSIBILITY_PROTECTED, false);    // Register protected
		createProperties.call(this, this.protected.final,        this.prototype, compObj, ACCESSIBILITY_PROTECTED, true);     // Register protected final
		createProperties.call(this, this.protected.static,       this,           compObj, ACCESSIBILITY_PROTECTED, false);    // Register protected static
		createProperties.call(this, this.protected.final.static, this,           compObj, ACCESSIBILITY_PROTECTED, true);     // Register protected final static
		createProperties.call(this, this.private,                this.prototype, compObj, ACCESSIBILITY_PRIVATE,   false);    // Register private
		createProperties.call(this, this.private.final,          this.prototype, compObj, ACCESSIBILITY_PRIVATE,   true);     // Register private final
		createProperties.call(this, this.private.static,         this,           compObj, ACCESSIBILITY_PRIVATE,   false);    // Register private static
		createProperties.call(this, this.private.final.static,   this,           compObj, ACCESSIBILITY_PRIVATE,   true);     // Register private final static
		
		Object.defineProperty(this, '_isDefineMember', {
			value: true
		});
		
		return this;
	}
	
	/**
	 * Check constructor defined with LaClass.
	 *
	 * @param   {function} con   Target constructor
	 * @return  {bool}
	 */
	function isLaClassObject(con) {
		return con._memberInfo && con._namespace;
	}
	
	/**
	 * Check override rights to member
	 *
	 * @context {function}                Class constructor
	 * @param   {string}   key            Name of member
	 * @param   {object}   compObj        Compared object
	 * @param   {string}   accessibility  Accessibility level
	 * @param   {string}   type           Member type
	 * @return  {bool}
	 */
	function canOverride(key, compObj, accessibility, type) {
		var info = getMemberInfo.call(this, key);
		
		if (info) {
			if (info.type !== type) {
				throw new LaClassError('Member \'' + key + '\' is defined as \'' + VARIABLE_TYPES[info.type] + '\' type by super class.');
			} else if (info.isFinal) {
				throw new LaClassError('Member \'' + key + '\' is defined with \'final\' keyword by super class.');
			} else if (info.accessibility > accessibility) {
				throw new LaClassError('Accessibility level of member \'' + key + '\' must be ' + ACCESSIBILITYS[info.accessibility] + ' or less.');
			}
		}
		
		return true;
	}
	
	/**
	 * Check override rights to member
	 *
	 * @context {function}       Class constructor
	 * @param   {string}   key   Name of member
	 * @return  {bool}
	 */
	function getMemberInfo(key) {
		if (!this._memberInfo) {
			return null;
		}
		
		if (key in this._memberInfo) {
			return this._memberInfo[key];
		}
		
		return getMemberInfo.call(this._parent, key);
	}
	
	/**
	 * Create class members
	 *
	 * @context {function}                Class constructor
	 * @param   {object}   baseObj        Basement objects
	 * @param   {object}   targetObj      Target objects
	 * @param   {object}   compObj        Compared objects
	 * @param   {string}   accessibility  Accessibility level
	 * @param   {string}   isFinal        Is defined with 'final' keyword
	 
	 */
	function createProperties(baseObj, targetObj, compObj, accessibility, isFinal) {
		var baseProto = Object.getOwnPropertyNames(baseObj);
		
		for (var i = 0; i < baseProto.length; i++) {
			if (baseProto[i] in SKIP_MEMBER_NAME) {
				continue;
			}
			
			createProperty.call(this, baseProto[i], baseObj[baseProto[i]], targetObj, compObj, accessibility, isFinal);
		}
	}
	
	/**
	 * Create class member
	 *
	 * @context {function}                Class constructor
	 * @param   {object}   key            Name of member
	 * @param   {object}   baseObj        Basement object
	 * @param   {object}   targetObj      Target object
	 * @param   {object}   compObj        Compared object
	 * @param   {string}   accessibility  Accessibility level
	 * @param   {string}   isFinal        Is defined with 'final' keyword
	 
	 */
	function createProperty(key, baseObj, targetObj, compObj, accessibility, isFinal) {
		var type, self = this;
	
		if (key in this._memberInfo) {
			throw new LaClassError('Member \'' + key + '\' is already defined.');
		}
		
		type = (baseObj instanceof Function) ? VARIABLE_TYPE_FUNCTION : VARIABLE_TYPE_NOT_FUNCTION;
		
		if (canOverride.call(this, key, compObj, accessibility, type)) {
			Object.defineProperty(this._memberInfo, key, createMemberInformation(accessibility, type, isFinal));
			Object.defineProperty(targetObj, key, createPropertyDescriptor.call(this, baseObj, key, accessibility, type));
		}
	}
	
	/**
	 * Create reference of class member
	 *
	 * @context {function}                Class constructor
	 * @param   {object}   key            Name of member
	 * @param   {string}   type           Member type
	 * @param   {string}   accessibility  Accessibility level
	 * @param   {object}   compObj        Compared object
	 */
	function createPropertyReference(key, compObj, accessibility, type) {
		var self = this, checker = ACCESSIBILITY_CHECKER[accessibility];
		
		Object.defineProperty(this, key, (function() {
			if (type === VARIABLE_TYPE_FUNCTION) {
				return {
					enumerable: accessibility === ACCESSIBILITY_PUBLIC,
					configurable: true,
					value: (function() {
						var func = function() {
							if (checker(arguments.callee.caller, self)) {
								return compObj[key].apply(compObj, arguments);
							} else {
								throw new LaClassError('Function \'' + key + '\' is ' + ACCESSIBILITYS[accessibility] + '.');
							}
						};
						
						func._namespace = self;
						return func;
					})()
				};
			} else {
				return {
					enumerable: accessibility === ACCESSIBILITY_PUBLIC,
					configurable: true,
					get: (function() {
						var func = function() {
							if (checker(arguments.callee.caller, self)) {
								return compObj[key];
							} else {
								throw new LaClassError('Variable \'' + key + '\' is ' + ACCESSIBILITYS[accessibility] + '.');
							}
						};
						
						func._namespace = self;
						return func;
					})(),
					set: (function() {
						var func = function(value) {
							if (checker(arguments.callee.caller, self)) {
								compObj[key] = value;
							} else {
								throw new LaClassError('Variable \'' + key + '\' is ' + ACCESSIBILITYS[accessibility] + '.');
							}
						};
						
						func._namespace = self;
						return func;
					})()
				};
			}
		})());
	}
	
	/**
	 * Create member information
	 *
	 * @context {function}                Class constructor
	 * @param   {string}   accessibility  Accessibility level
	 * @param   {string}   type           Member type
	 * @param   {string}   isFinal        Is defined with 'final' keyword
	 */
	function createMemberInformation(accessibility, type, isFinal) {
		return {
			value: Object.defineProperties({}, {
				accessibility: {
					value: accessibility
				},
				type: {
					value: type
				},
				isFinal: {
					value: isFinal
				}
			})
		};
	}
	
	/**
	 * Create member descriptor
	 *
	 * @context {function}                Class constructor
	 * @param   {object}   obj            Target prototype
	 * @param   {string}   key            Name of member
	 * @param   {string}   accessibility  Accessibility level
	 * @param   {string}   type           Member type
	 */
	function createPropertyDescriptor(obj, key, accessibility, type) {
		var self = this, checker = ACCESSIBILITY_CHECKER[accessibility];
		
		if (type === VARIABLE_TYPE_FUNCTION) {
			Object.defineProperty(obj, '_namespace', {
				value: self
			});
			
			return {
				enumerable: accessibility === ACCESSIBILITY_PUBLIC,
				configrable: false,
				writable: false,
				value: function() {
					if (checker(arguments.callee.caller, self)) {
						return obj.apply(this, arguments);
					} else {
						throw new LaClassError('Function \'' + key + '\' is ' + ACCESSIBILITYS[accessibility] + '.');
					}
				}
			};
		} else {
			return {
				enumerable: accessibility === ACCESSIBILITY_PUBLIC,
				configrable: false,
				get: function() {
					if (checker(arguments.callee.caller, self)) {
						return obj;
					} else {
						throw new LaClassError('Variable \'' + key + '\' is ' + ACCESSIBILITYS[accessibility] + '.');
					}
				},
				set: function(value) {
					if (checker(arguments.callee.caller, self)) {
						obj = value;
					} else {
						throw new LaClassError('Variable \'' + key + '\' is ' + ACCESSIBILITYS[accessibility] + '.');
					}
				},
			};
		}
	}
	
	/**
	 * Check access rights to protected member
	 *
	 * @param  {function} caller  Caller function
	 * @param  {function} _class  Class constructor of callee function
	 * @return {bool}
	 */
	function canProtectedAccess(caller, _class) {
		return caller && caller._namespace && (caller._namespace === _class || _class.prototype.isPrototypeOf(caller._namespace.prototype));
	}
	
	/**
	 * Check access rights to private member
	 *
	 * @param  {function} caller  Caller function
	 * @param  {function} _class  Class constructor of callee function
	 * @return {bool}
	 */
	function canPrivateAccess(caller, _class) {
		return caller && caller._namespace && caller._namespace === _class;
	}
	
	const ACCESSIBILITY_CHECKER = [
		canPrivateAccess, canProtectedAccess, function() { return true; }
	];
	
	/**
	 * Error class for LaClass
	 *
	 * @param  {string} message   Error detail
	 */
	var LaClassError = Class(function LaClassError(message) {
		this.message = message;
	}).extends(Error);
	
})();