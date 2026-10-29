var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.production.js
var require_react_production = __commonJS({
  "node_modules/react/cjs/react.production.js"(exports) {
    "use strict";
    var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element");
    var REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal");
    var REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment");
    var REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode");
    var REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler");
    var REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer");
    var REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context");
    var REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref");
    var REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense");
    var REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo");
    var REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
    var REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity");
    var REACT_VIEW_TRANSITION_TYPE = /* @__PURE__ */ Symbol.for("react.view_transition");
    var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    function getIteratorFn(maybeIterable) {
      if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
      maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
      return "function" === typeof maybeIterable ? maybeIterable : null;
    }
    var ReactNoopUpdateQueue = {
      isMounted: function() {
        return false;
      },
      enqueueForceUpdate: function() {
      },
      enqueueReplaceState: function() {
      },
      enqueueSetState: function() {
      }
    };
    var assign = Object.assign;
    var emptyObject = {};
    function Component(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    Component.prototype.isReactComponent = {};
    Component.prototype.setState = function(partialState, callback) {
      if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables."
        );
      this.updater.enqueueSetState(this, partialState, callback, "setState");
    };
    Component.prototype.forceUpdate = function(callback) {
      this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
    };
    function ComponentDummy() {
    }
    ComponentDummy.prototype = Component.prototype;
    function PureComponent(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
    pureComponentPrototype.constructor = PureComponent;
    assign(pureComponentPrototype, Component.prototype);
    pureComponentPrototype.isPureReactComponent = true;
    var isArrayImpl = Array.isArray;
    function noop() {
    }
    var ReactSharedInternals = { H: null, A: null, T: null, S: null };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function ReactElement(type, key2, props) {
      var refProp = props.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key: key2,
        ref: void 0 !== refProp ? refProp : null,
        props
      };
    }
    function cloneAndReplaceKey(oldElement, newKey) {
      return ReactElement(oldElement.type, newKey, oldElement.props);
    }
    function isValidElement(object) {
      return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function escape(key2) {
      var escaperLookup = { "=": "=0", ":": "=2" };
      return "$" + key2.replace(/[=:]/g, function(match) {
        return escaperLookup[match];
      });
    }
    var userProvidedKeyEscapeRegex = /\/+/g;
    function getElementKey(element, index) {
      return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
    }
    function resolveThenable(thenable) {
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
        default:
          switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
            function(fulfilledValue) {
              "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
            },
            function(error) {
              "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
            }
          )), thenable.status) {
            case "fulfilled":
              return thenable.value;
            case "rejected":
              throw thenable.reason;
          }
      }
      throw thenable;
    }
    function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
      var type = typeof children;
      if ("undefined" === type || "boolean" === type) children = null;
      var invokeCallback = false;
      if (null === children) invokeCallback = true;
      else
        switch (type) {
          case "bigint":
          case "string":
          case "number":
            invokeCallback = true;
            break;
          case "object":
            switch (children.$$typeof) {
              case REACT_ELEMENT_TYPE:
              case REACT_PORTAL_TYPE:
                invokeCallback = true;
                break;
              case REACT_LAZY_TYPE:
                return invokeCallback = children._init, mapIntoArray(
                  invokeCallback(children._payload),
                  array,
                  escapedPrefix,
                  nameSoFar,
                  callback
                );
            }
        }
      if (invokeCallback)
        return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
          return c;
        })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
          callback,
          escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
            userProvidedKeyEscapeRegex,
            "$&/"
          ) + "/") + invokeCallback
        )), array.push(callback)), 1;
      invokeCallback = 0;
      var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
      if (isArrayImpl(children))
        for (var i = 0; i < children.length; i++)
          nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if (i = getIteratorFn(children), "function" === typeof i)
        for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
          nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if ("object" === type) {
        if ("function" === typeof children.then)
          return mapIntoArray(
            resolveThenable(children),
            array,
            escapedPrefix,
            nameSoFar,
            callback
          );
        array = String(children);
        throw Error(
          "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
        );
      }
      return invokeCallback;
    }
    function mapChildren(children, func, context) {
      if (null == children) return children;
      var result = [], count = 0;
      mapIntoArray(children, result, "", "", function(child) {
        return func.call(context, child, count++);
      });
      return result;
    }
    function lazyInitializer(payload) {
      if (-1 === payload._status) {
        var ctor = payload._result, thenable = ctor();
        thenable.then(
          function(moduleObject) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 1, payload._result = moduleObject, void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
          },
          function(error) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 2, payload._result = error, void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
          }
        );
        -1 === payload._status && (payload._status = 0, payload._result = thenable);
      }
      if (1 === payload._status) return payload._result.default;
      throw payload._result;
    }
    var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
      if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
        var event = new window.ErrorEvent("error", {
          bubbles: true,
          cancelable: true,
          message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
          error
        });
        if (!window.dispatchEvent(event)) return;
      } else if ("object" === typeof process && "function" === typeof process.emit) {
        process.emit("uncaughtException", error);
        return;
      }
      console.error(error);
    };
    function startTransition(scope) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      currentTransition.types = null !== prevTransition ? prevTransition.types : null;
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
      } catch (error) {
        reportGlobalError(error);
      } finally {
        null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
      }
    }
    function addTransitionType(type) {
      var transition = ReactSharedInternals.T;
      if (null !== transition) {
        var transitionTypes = transition.types;
        null === transitionTypes ? transition.types = [type] : -1 === transitionTypes.indexOf(type) && transitionTypes.push(type);
      } else startTransition(addTransitionType.bind(null, type));
    }
    var Children = {
      map: mapChildren,
      forEach: function(children, forEachFunc, forEachContext) {
        mapChildren(
          children,
          function() {
            forEachFunc.apply(this, arguments);
          },
          forEachContext
        );
      },
      count: function(children) {
        var n = 0;
        mapChildren(children, function() {
          n++;
        });
        return n;
      },
      toArray: function(children) {
        return mapChildren(children, function(child) {
          return child;
        }) || [];
      },
      only: function(children) {
        if (!isValidElement(children))
          throw Error(
            "React.Children.only expected to receive a single React element child."
          );
        return children;
      }
    };
    exports.Activity = REACT_ACTIVITY_TYPE;
    exports.Children = Children;
    exports.Component = Component;
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.Profiler = REACT_PROFILER_TYPE;
    exports.PureComponent = PureComponent;
    exports.StrictMode = REACT_STRICT_MODE_TYPE;
    exports.Suspense = REACT_SUSPENSE_TYPE;
    exports.ViewTransition = REACT_VIEW_TRANSITION_TYPE;
    exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
    exports.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function(size) {
        return ReactSharedInternals.H.useMemoCache(size);
      }
    };
    exports.addTransitionType = addTransitionType;
    exports.cache = function(fn) {
      return function() {
        return fn.apply(null, arguments);
      };
    };
    exports.cacheSignal = function() {
      return null;
    };
    exports.cloneElement = function(element, config, children) {
      if (null === element || void 0 === element)
        throw Error(
          "The argument must be a React element, but you passed " + element + "."
        );
      var props = assign({}, element.props), key2 = element.key;
      if (null != config)
        for (propName in void 0 !== config.key && (key2 = "" + config.key), config)
          !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
      var propName = arguments.length - 2;
      if (1 === propName) props.children = children;
      else if (1 < propName) {
        for (var childArray = Array(propName), i = 0; i < propName; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      return ReactElement(element.type, key2, props);
    };
    exports.createContext = function(defaultValue) {
      defaultValue = {
        $$typeof: REACT_CONTEXT_TYPE,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        Provider: null,
        Consumer: null
      };
      defaultValue.Provider = defaultValue;
      defaultValue.Consumer = {
        $$typeof: REACT_CONSUMER_TYPE,
        _context: defaultValue
      };
      return defaultValue;
    };
    exports.createElement = function(type, config, children) {
      var propName, props = {}, key2 = null;
      if (null != config)
        for (propName in void 0 !== config.key && (key2 = "" + config.key), config)
          hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
      var childrenLength = arguments.length - 2;
      if (1 === childrenLength) props.children = children;
      else if (1 < childrenLength) {
        for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      if (type && type.defaultProps)
        for (propName in childrenLength = type.defaultProps, childrenLength)
          void 0 === props[propName] && (props[propName] = childrenLength[propName]);
      return ReactElement(type, key2, props);
    };
    exports.createRef = function() {
      return { current: null };
    };
    exports.forwardRef = function(render) {
      return { $$typeof: REACT_FORWARD_REF_TYPE, render };
    };
    exports.isValidElement = isValidElement;
    exports.lazy = function(ctor) {
      return {
        $$typeof: REACT_LAZY_TYPE,
        _payload: { _status: -1, _result: ctor },
        _init: lazyInitializer
      };
    };
    exports.memo = function(type, compare) {
      return {
        $$typeof: REACT_MEMO_TYPE,
        type,
        compare: void 0 === compare ? null : compare
      };
    };
    exports.startTransition = startTransition;
    exports.unstable_useCacheRefresh = function() {
      return ReactSharedInternals.H.useCacheRefresh();
    };
    exports.use = function(usable) {
      return ReactSharedInternals.H.use(usable);
    };
    exports.useActionState = function(action, initialState, permalink) {
      return ReactSharedInternals.H.useActionState(action, initialState, permalink);
    };
    exports.useCallback = function(callback, deps) {
      return ReactSharedInternals.H.useCallback(callback, deps);
    };
    exports.useContext = function(Context) {
      return ReactSharedInternals.H.useContext(Context);
    };
    exports.useDebugValue = function() {
    };
    exports.useDeferredValue = function(value, initialValue) {
      return ReactSharedInternals.H.useDeferredValue(value, initialValue);
    };
    exports.useEffect = function(create, deps) {
      return ReactSharedInternals.H.useEffect(create, deps);
    };
    exports.useEffectEvent = function(callback) {
      return ReactSharedInternals.H.useEffectEvent(callback);
    };
    exports.useId = function() {
      return ReactSharedInternals.H.useId();
    };
    exports.useImperativeHandle = function(ref, create, deps) {
      return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
    };
    exports.useInsertionEffect = function(create, deps) {
      return ReactSharedInternals.H.useInsertionEffect(create, deps);
    };
    exports.useLayoutEffect = function(create, deps) {
      return ReactSharedInternals.H.useLayoutEffect(create, deps);
    };
    exports.useMemo = function(create, deps) {
      return ReactSharedInternals.H.useMemo(create, deps);
    };
    exports.useOptimistic = function(passthrough, reducer) {
      return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
    };
    exports.useReducer = function(reducer, initialArg, init) {
      return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
    };
    exports.useRef = function(initialValue) {
      return ReactSharedInternals.H.useRef(initialValue);
    };
    exports.useState = function(initialState) {
      return ReactSharedInternals.H.useState(initialState);
    };
    exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
      return ReactSharedInternals.H.useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
      );
    };
    exports.useTransition = function() {
      return ReactSharedInternals.H.useTransition();
    };
    exports.version = "19.3.0";
  }
});

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    "production" !== process.env.NODE_ENV && (function() {
      function defineDeprecationWarning(methodName, info) {
        Object.defineProperty(Component.prototype, methodName, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              info[0],
              info[1]
            );
          }
        });
      }
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable)
          return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      function warnNoop(publicInstance, callerName) {
        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
        var warningKey = publicInstance + "." + callerName;
        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          callerName,
          publicInstance
        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
      }
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function ComponentDummy() {
      }
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function noop() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
          case REACT_VIEW_TRANSITION_TYPE:
            return "ViewTransition";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key2, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key: key2,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        newKey = ReactElement(
          oldElement.type,
          newKey,
          oldElement.props,
          oldElement._owner,
          oldElement._debugStack,
          oldElement._debugTask
        );
        oldElement._store && (newKey._store.validated = oldElement._store.validated);
        return newKey;
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key2) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key2.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback) {
          invokeCallback = children;
          callback = callback(invokeCallback);
          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + childKey
          ), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
          return 1;
        }
        invokeCallback = 0;
        childKey = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (i === children.entries && (didWarnAboutMaps || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var resolveDebugValue = null, rejectDebugValue = null, ioInfo = payload._ioInfo;
          null != ioInfo && (ioInfo.start = ioInfo.end = performance.now(), ioInfo.value = new Promise(function(resolve, reject) {
            resolveDebugValue = resolve;
            rejectDebugValue = reject;
          }));
          ioInfo = payload._result;
          var thenable = ioInfo();
          thenable.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 1;
                payload._result = moduleObject;
                var _ioInfo = payload._ioInfo;
                if (null != _ioInfo) {
                  _ioInfo.end = performance.now();
                  var debugValue = null == moduleObject ? void 0 : moduleObject.default;
                  resolveDebugValue(debugValue);
                  _ioInfo.value.status = "fulfilled";
                  _ioInfo.value.value = debugValue;
                }
                void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
              }
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 2;
                payload._result = error;
                var _ioInfo2 = payload._ioInfo;
                null != _ioInfo2 && (_ioInfo2.end = performance.now(), _ioInfo2.value.then(noop, noop), rejectDebugValue(error), _ioInfo2.value.status = "rejected", _ioInfo2.value.reason = error);
                void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            }
          );
          ioInfo = payload._ioInfo;
          if (null != ioInfo) {
            var displayName = thenable.displayName;
            "string" === typeof displayName && (ioInfo.name = displayName);
          }
          -1 === payload._status && (payload._status = 0, payload._result = thenable);
        }
        if (1 === payload._status)
          return ioInfo = payload._result, void 0 === ioInfo && console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
            ioInfo
          ), "default" in ioInfo || console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
            ioInfo
          ), ioInfo.default;
        throw payload._result;
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      function releaseAsyncTransition() {
        ReactSharedInternals.asyncTransitions--;
      }
      function startTransition(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition.types = null !== prevTransition ? prevTransition.types : null;
        currentTransition._updatedFibers = /* @__PURE__ */ new Set();
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop, reportGlobalError));
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      }
      function addTransitionType(type) {
        var transition = ReactSharedInternals.T;
        if (null !== transition) {
          var transitionTypes = transition.types;
          null === transitionTypes ? transition.types = [type] : -1 === transitionTypes.indexOf(type) && transitionTypes.push(type);
        } else
          0 === ReactSharedInternals.asyncTransitions && console.error(
            "addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."
          ), startTransition(addTransitionType.bind(null, type));
      }
      function enqueueTask(task) {
        if (null === enqueueTaskImpl)
          try {
            var requireString = ("require" + Math.random()).slice(0, 7);
            enqueueTaskImpl = (module && module[requireString]).call(
              module,
              "timers"
            ).setImmediate;
          } catch (_err) {
            enqueueTaskImpl = function(callback) {
              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var channel = new MessageChannel();
              channel.port1.onmessage = callback;
              channel.port2.postMessage(void 0);
            };
          }
        return enqueueTaskImpl(task);
      }
      function aggregateErrors(errors) {
        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
      }
      function popActScope(prevActQueue, prevActScopeDepth) {
        prevActScopeDepth !== actScopeDepth - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        );
        actScopeDepth = prevActScopeDepth;
      }
      function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
        var queue = ReactSharedInternals.actQueue;
        if (null !== queue)
          if (0 !== queue.length)
            try {
              flushActQueue(queue);
              enqueueTask(function() {
                return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              });
              return;
            } catch (error) {
              ReactSharedInternals.thrownErrors.push(error);
            }
          else ReactSharedInternals.actQueue = null;
        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
      }
      function flushActQueue(queue) {
        if (!isFlushing) {
          isFlushing = true;
          var i = 0;
          try {
            for (; i < queue.length; i++) {
              var callback = queue[i];
              do {
                ReactSharedInternals.didUsePromise = false;
                var continuation = callback(false);
                if (null !== continuation) {
                  if (ReactSharedInternals.didUsePromise) {
                    queue[i] = callback;
                    queue.splice(0, i);
                    return;
                  }
                  callback = continuation;
                } else break;
              } while (1);
            }
            queue.length = 0;
          } catch (error) {
            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
          } finally {
            isFlushing = false;
          }
        }
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = /* @__PURE__ */ Symbol.for("react.view_transition"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },
        enqueueReplaceState: function(publicInstance) {
          warnNoop(publicInstance, "replaceState");
        },
        enqueueSetState: function(publicInstance) {
          warnNoop(publicInstance, "setState");
        }
      }, assign = Object.assign, emptyObject = {};
      Object.freeze(emptyObject);
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      var deprecatedAPIs = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      };
      for (fnName in deprecatedAPIs)
        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      ComponentDummy.prototype = Component.prototype;
      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
      deprecatedAPIs.constructor = PureComponent;
      assign(deprecatedAPIs, Component.prototype);
      deprecatedAPIs.isPureReactComponent = true;
      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = {
        H: null,
        A: null,
        T: null,
        S: null,
        actQueue: null,
        asyncTransitions: 0,
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false,
        didUsePromise: false,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      deprecatedAPIs = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(
        deprecatedAPIs,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
        queueMicrotask(function() {
          return queueMicrotask(callback);
        });
      } : enqueueTask;
      deprecatedAPIs = Object.freeze({
        __proto__: null,
        c: function(size) {
          return resolveDispatcher().useMemoCache(size);
        }
      });
      var fnName = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports.Activity = REACT_ACTIVITY_TYPE;
      exports.Children = fnName;
      exports.Component = Component;
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.Profiler = REACT_PROFILER_TYPE;
      exports.PureComponent = PureComponent;
      exports.StrictMode = REACT_STRICT_MODE_TYPE;
      exports.Suspense = REACT_SUSPENSE_TYPE;
      exports.ViewTransition = REACT_VIEW_TRANSITION_TYPE;
      exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports.__COMPILER_RUNTIME = deprecatedAPIs;
      exports.act = function(callback) {
        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
        actScopeDepth++;
        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
        try {
          var result = callback();
        } catch (error) {
          ReactSharedInternals.thrownErrors.push(error);
        }
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        if (null !== result && "object" === typeof result && "function" === typeof result.then) {
          var thenable = result;
          queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          });
          return {
            then: function(resolve, reject) {
              didAwaitActCall = true;
              thenable.then(
                function(returnValue) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  if (0 === prevActScopeDepth) {
                    try {
                      flushActQueue(queue), enqueueTask(function() {
                        return recursivelyFlushAsyncActWork(
                          returnValue,
                          resolve,
                          reject
                        );
                      });
                    } catch (error$0) {
                      ReactSharedInternals.thrownErrors.push(error$0);
                    }
                    if (0 < ReactSharedInternals.thrownErrors.length) {
                      var _thrownError = aggregateErrors(
                        ReactSharedInternals.thrownErrors
                      );
                      ReactSharedInternals.thrownErrors.length = 0;
                      reject(_thrownError);
                    }
                  } else resolve(returnValue);
                },
                function(error) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                    ReactSharedInternals.thrownErrors
                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                }
              );
            }
          };
        }
        var returnValue$jscomp$0 = result;
        popActScope(prevActQueue, prevActScopeDepth);
        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), ReactSharedInternals.actQueue = null);
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        return {
          then: function(resolve, reject) {
            didAwaitActCall = true;
            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
              return recursivelyFlushAsyncActWork(
                returnValue$jscomp$0,
                resolve,
                reject
              );
            })) : resolve(returnValue$jscomp$0);
          }
        };
      };
      exports.addTransitionType = addTransitionType;
      exports.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports.cacheSignal = function() {
        return null;
      };
      exports.captureOwnerStack = function() {
        var getCurrentStack = ReactSharedInternals.getCurrentStack;
        return null === getCurrentStack ? null : getCurrentStack();
      };
      exports.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key2 = element.key, owner = element._owner;
        if (null != config) {
          var JSCompiler_inline_result;
          a: {
            if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
              config,
              "ref"
            ).get) && JSCompiler_inline_result.isReactWarning) {
              JSCompiler_inline_result = false;
              break a;
            }
            JSCompiler_inline_result = void 0 !== config.ref;
          }
          JSCompiler_inline_result && (owner = getOwner());
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key2 = "" + config.key);
          for (propName in config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        }
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          JSCompiler_inline_result = Array(propName);
          for (var i = 0; i < propName; i++)
            JSCompiler_inline_result[i] = arguments[i + 2];
          props.children = JSCompiler_inline_result;
        }
        props = ReactElement(
          element.type,
          key2,
          props,
          owner,
          element._debugStack,
          element._debugTask
        );
        for (key2 = 2; key2 < arguments.length; key2++)
          validateChildKeys(arguments[key2]);
        return props;
      };
      exports.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        defaultValue._currentRenderer = null;
        defaultValue._currentRenderer2 = null;
        return defaultValue;
      };
      exports.createElement = function(type, config, children) {
        for (var i = 2; i < arguments.length; i++)
          validateChildKeys(arguments[i]);
        var propName;
        i = {};
        var key2 = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key2 = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) i.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
            childArray[_i] = arguments[_i + 2];
          Object.freeze && Object.freeze(childArray);
          i.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === i[propName] && (i[propName] = childrenLength[propName]);
        key2 && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        (propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++) ? (childArray = Error.stackTraceLimit, Error.stackTraceLimit = 10, childrenLength = Error("react-stack-top-frame"), Error.stackTraceLimit = childArray) : childrenLength = unknownOwnerDebugStack;
        return ReactElement(
          type,
          key2,
          i,
          getOwner(),
          childrenLength,
          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.createRef = function() {
        var refObject = { current: null };
        Object.seal(refObject);
        return refObject;
      };
      exports.forwardRef = function(render) {
        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : "function" !== typeof render ? console.error(
          "forwardRef requires a render function but was given %s.",
          null === render ? "null" : typeof render
        ) : 0 !== render.length && 2 !== render.length && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        );
        null != render && null != render.defaultProps && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
        Object.defineProperty(elementType, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
          }
        });
        return elementType;
      };
      exports.isValidElement = isValidElement;
      exports.lazy = function(ctor) {
        ctor = { _status: -1, _result: ctor };
        var lazyType = {
          $$typeof: REACT_LAZY_TYPE,
          _payload: ctor,
          _init: lazyInitializer
        }, ioInfo = {
          name: "lazy",
          start: -1,
          end: -1,
          value: null,
          owner: null,
          debugStack: Error("react-stack-top-frame"),
          debugTask: console.createTask ? console.createTask("lazy()") : null
        };
        ctor._ioInfo = ioInfo;
        lazyType._debugInfo = [{ awaited: ioInfo }];
        return lazyType;
      };
      exports.memo = function(type, compare) {
        null == type && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          null === type ? "null" : typeof type
        );
        compare = {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
        var ownName;
        Object.defineProperty(compare, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
          }
        });
        return compare;
      };
      exports.startTransition = startTransition;
      exports.unstable_useCacheRefresh = function() {
        return resolveDispatcher().useCacheRefresh();
      };
      exports.use = function(usable) {
        return resolveDispatcher().use(usable);
      };
      exports.useActionState = function(action, initialState, permalink) {
        return resolveDispatcher().useActionState(
          action,
          initialState,
          permalink
        );
      };
      exports.useCallback = function(callback, deps) {
        return resolveDispatcher().useCallback(callback, deps);
      };
      exports.useContext = function(Context) {
        var dispatcher = resolveDispatcher();
        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        );
        return dispatcher.useContext(Context);
      };
      exports.useDebugValue = function(value, formatterFn) {
        return resolveDispatcher().useDebugValue(value, formatterFn);
      };
      exports.useDeferredValue = function(value, initialValue) {
        return resolveDispatcher().useDeferredValue(value, initialValue);
      };
      exports.useEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useEffect(create, deps);
      };
      exports.useEffectEvent = function(callback) {
        return resolveDispatcher().useEffectEvent(callback);
      };
      exports.useId = function() {
        return resolveDispatcher().useId();
      };
      exports.useImperativeHandle = function(ref, create, deps) {
        return resolveDispatcher().useImperativeHandle(ref, create, deps);
      };
      exports.useInsertionEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useInsertionEffect(create, deps);
      };
      exports.useLayoutEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useLayoutEffect(create, deps);
      };
      exports.useMemo = function(create, deps) {
        return resolveDispatcher().useMemo(create, deps);
      };
      exports.useOptimistic = function(passthrough, reducer) {
        return resolveDispatcher().useOptimistic(passthrough, reducer);
      };
      exports.useReducer = function(reducer, initialArg, init) {
        return resolveDispatcher().useReducer(reducer, initialArg, init);
      };
      exports.useRef = function(initialValue) {
        return resolveDispatcher().useRef(initialValue);
      };
      exports.useState = function(initialState) {
        return resolveDispatcher().useState(initialState);
      };
      exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return resolveDispatcher().useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports.useTransition = function() {
        return resolveDispatcher().useTransition();
      };
      exports.version = "19.3.0";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module.exports = require_react_production();
    } else {
      module.exports = require_react_development();
    }
  }
});

// src/data/cadePerfecto.json
var cadePerfecto_default = {
  name: "PERFECTO",
  source: "PERFECTO.cad",
  sha256: "c4dcaa7aebe40e500fb94529fc4dd9d47a279ef32689d73a2bb604a5c8b0a138",
  objects: [
    {
      id: 0,
      type: 1001,
      reference: "-M",
      labels: [
        "U1",
        "V1",
        "W1",
        "PE",
        "W2",
        "U2",
        "V2",
        ""
      ],
      x: 63,
      y: 129,
      x2: 0,
      y2: 0,
      bounds: [
        -12,
        -6,
        24,
        27
      ],
      rawNumbers: [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        63,
        129,
        0,
        0,
        -12,
        -6,
        24,
        27,
        0,
        0,
        0,
        1,
        0,
        112,
        113
      ]
    },
    {
      id: 3,
      type: 6009,
      reference: "-Q",
      labels: [
        "1",
        "3",
        "5",
        "2",
        "4",
        "6",
        "",
        ""
      ],
      x: 63,
      y: 51,
      x2: 0,
      y2: 0,
      bounds: [
        -21,
        -3,
        18,
        24
      ],
      rawNumbers: [
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        0,
        63,
        51,
        0,
        0,
        -21,
        -3,
        18,
        24,
        0,
        0,
        0,
        1,
        0,
        16,
        17
      ]
    },
    {
      id: 7,
      type: 2001,
      reference: "-KM1",
      labels: [
        "1",
        "3",
        "5",
        "2",
        "4",
        "6",
        "",
        ""
      ],
      x: 63,
      y: 84,
      x2: 0,
      y2: 0,
      bounds: [
        -12,
        -3,
        18,
        15
      ],
      rawNumbers: [
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        0,
        63,
        84,
        0,
        0,
        -12,
        -3,
        18,
        15,
        0,
        0,
        0,
        1,
        0,
        19,
        20
      ]
    },
    {
      id: 17,
      type: 4010,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 81,
      y: 21,
      x2: 81,
      y2: 129,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        81,
        21,
        81,
        129,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ]
    },
    {
      id: 18,
      type: 3e3,
      reference: "-X",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 144,
      y: 24,
      x2: 0,
      y2: 0,
      bounds: [
        -12,
        -9,
        6,
        3
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        144,
        24,
        0,
        0,
        -12,
        -9,
        6,
        3,
        0,
        0,
        0,
        1,
        0,
        0,
        0
      ]
    },
    {
      id: 20,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 144,
      y: 30,
      x2: 150,
      y2: 30,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        144,
        30,
        150,
        30,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        0
      ]
    },
    {
      id: 21,
      type: 4001,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 144,
      y: 30,
      x2: 144,
      y2: 30,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        144,
        30,
        144,
        30,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        0
      ]
    },
    {
      id: 22,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 150,
      y: 30,
      x2: 159,
      y2: 30,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        150,
        30,
        159,
        30,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        0
      ]
    },
    {
      id: 23,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 72,
      x2: 141,
      y2: 78,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        72,
        141,
        78,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        14,
        0
      ]
    },
    {
      id: 25,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 90,
      x2: 141,
      y2: 102,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        90,
        141,
        102,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        4,
        0
      ]
    },
    {
      id: 26,
      type: 6010,
      reference: "-Q",
      labels: [
        "1",
        "2",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 144,
      y: 36,
      x2: 141,
      y2: 90,
      bounds: [
        -21,
        -3,
        6,
        24
      ],
      rawNumbers: [
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        144,
        36,
        141,
        90,
        -21,
        -3,
        6,
        24,
        0,
        0,
        0,
        1,
        0,
        2,
        13
      ]
    },
    {
      id: 27,
      type: 8018,
      reference: "-F",
      labels: [
        "95",
        "97",
        "96",
        "98",
        "",
        "",
        "",
        ""
      ],
      x: 144,
      y: 60,
      x2: 0,
      y2: 0,
      bounds: [
        -18,
        -3,
        15,
        15
      ],
      rawNumbers: [
        1,
        1,
        1,
        1,
        0,
        0,
        0,
        0,
        144,
        60,
        0,
        0,
        -18,
        -3,
        15,
        15,
        0,
        0,
        0,
        1,
        0,
        13,
        2
      ]
    },
    {
      id: 28,
      type: 3001,
      reference: "-X",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 111,
      y: 150,
      x2: 0,
      y2: 0,
      bounds: [
        -12,
        -9,
        6,
        3
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        111,
        150,
        0,
        0,
        -12,
        -9,
        6,
        3,
        0,
        0,
        0,
        1,
        0,
        0,
        0
      ]
    },
    {
      id: 30,
      type: 8001,
      reference: "-SB1",
      labels: [
        "11",
        "12",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 78,
      x2: 0,
      y2: 0,
      bounds: [
        -18,
        -3,
        6,
        15
      ],
      rawNumbers: [
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        78,
        0,
        0,
        -18,
        -3,
        6,
        15,
        0,
        0,
        0,
        1,
        0,
        14,
        4
      ]
    },
    {
      id: 31,
      type: 8e3,
      reference: "-SB2",
      labels: [
        "13",
        "14",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 102,
      x2: 0,
      y2: 0,
      bounds: [
        -18,
        -3,
        6,
        15
      ],
      rawNumbers: [
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        102,
        0,
        0,
        -18,
        -3,
        6,
        15,
        0,
        0,
        0,
        1,
        0,
        4,
        7
      ]
    },
    {
      id: 32,
      type: 7e3,
      reference: "-KM1",
      labels: [
        "13",
        "14",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 165,
      y: 102,
      x2: 0,
      y2: 0,
      bounds: [
        -12,
        -3,
        6,
        15
      ],
      rawNumbers: [
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        165,
        102,
        0,
        0,
        -12,
        -3,
        6,
        15,
        0,
        0,
        0,
        1,
        0,
        4,
        7
      ]
    },
    {
      id: 33,
      type: 9e3,
      reference: "-KM1",
      labels: [
        "A1",
        "A2",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 129,
      x2: 0,
      y2: 0,
      bounds: [
        -15,
        -3,
        9,
        15
      ],
      rawNumbers: [
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        129,
        0,
        0,
        -15,
        -3,
        9,
        15,
        0,
        0,
        0,
        1,
        0,
        0,
        0
      ]
    },
    {
      id: 35,
      type: 9008,
      reference: "-H3",
      labels: [
        "X1",
        "X2",
        "0",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 117,
      y: 102,
      x2: 0,
      y2: 0,
      bounds: [
        -15,
        -3,
        9,
        15
      ],
      rawNumbers: [
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        117,
        102,
        0,
        0,
        -15,
        -3,
        9,
        15,
        0,
        0,
        0,
        1,
        0,
        90,
        92
      ]
    },
    {
      id: 36,
      type: 9008,
      reference: "-H2",
      labels: [
        "X1",
        "X2",
        "0",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 198,
      y: 93,
      x2: 0,
      y2: 0,
      bounds: [
        -15,
        -3,
        9,
        15
      ],
      rawNumbers: [
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        198,
        93,
        0,
        0,
        -15,
        -3,
        9,
        15,
        0,
        0,
        0,
        1,
        0,
        52,
        54
      ]
    },
    {
      id: 37,
      type: 9008,
      reference: "-H1",
      labels: [
        "X1",
        "X2",
        "0",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 165,
      y: 132,
      x2: 0,
      y2: 0,
      bounds: [
        -15,
        -3,
        9,
        15
      ],
      rawNumbers: [
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        165,
        132,
        0,
        0,
        -15,
        -3,
        9,
        15,
        0,
        0,
        0,
        1,
        0,
        48,
        96
      ]
    },
    {
      id: 38,
      type: 7001,
      reference: "-KM1",
      labels: [
        "11",
        "12",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 117,
      y: 78,
      x2: 0,
      y2: 0,
      bounds: [
        -12,
        -3,
        6,
        15
      ],
      rawNumbers: [
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        117,
        78,
        0,
        0,
        -12,
        -3,
        6,
        15,
        0,
        0,
        0,
        1,
        0,
        14,
        15
      ]
    },
    {
      id: 39,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 96,
      x2: 165,
      y2: 96,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        96,
        165,
        96,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        4,
        0
      ]
    },
    {
      id: 40,
      type: 4001,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 96,
      x2: 141,
      y2: 96,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        96,
        141,
        96,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        4,
        0
      ]
    },
    {
      id: 41,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 165,
      y: 96,
      x2: 165,
      y2: 102,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        165,
        96,
        165,
        102,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        4,
        0
      ]
    },
    {
      id: 42,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 114,
      x2: 141,
      y2: 123,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        114,
        141,
        123,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        7,
        0
      ]
    },
    {
      id: 43,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 165,
      y: 114,
      x2: 165,
      y2: 117,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        165,
        114,
        165,
        117,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        7,
        0
      ]
    },
    {
      id: 44,
      type: 4001,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 117,
      x2: 141,
      y2: 117,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        117,
        141,
        117,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        7,
        0
      ]
    },
    {
      id: 45,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 165,
      y: 117,
      x2: 165,
      y2: 123,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        165,
        117,
        165,
        123,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        7,
        0
      ]
    },
    {
      id: 46,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 123,
      x2: 165,
      y2: 123,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        123,
        165,
        123,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        7,
        0
      ]
    },
    {
      id: 47,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 123,
      x2: 141,
      y2: 129,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        123,
        141,
        129,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        7,
        0
      ]
    },
    {
      id: 48,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 165,
      y: 126,
      x2: 165,
      y2: 132,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        165,
        126,
        165,
        132,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        7,
        0
      ]
    },
    {
      id: 49,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 126,
      x2: 165,
      y2: 126,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        126,
        165,
        126,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        7,
        0
      ]
    },
    {
      id: 50,
      type: 4001,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 126,
      x2: 141,
      y2: 126,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        126,
        141,
        126,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        7,
        0
      ]
    },
    {
      id: 51,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 153,
      y: 72,
      x2: 153,
      y2: 84,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        153,
        72,
        153,
        84,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        9,
        0
      ]
    },
    {
      id: 52,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 198,
      y: 84,
      x2: 198,
      y2: 93,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        198,
        84,
        198,
        93,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        9,
        0
      ]
    },
    {
      id: 53,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 153,
      y: 84,
      x2: 198,
      y2: 84,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        153,
        84,
        198,
        84,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        9,
        0
      ]
    },
    {
      id: 54,
      type: 4009,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 198,
      y: 105,
      x2: 198,
      y2: 153,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        198,
        105,
        198,
        153,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        11,
        0
      ]
    },
    {
      id: 56,
      type: 4009,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 117,
      y: 153,
      x2: 198,
      y2: 153,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        117,
        153,
        198,
        153,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        11,
        0
      ]
    },
    {
      id: 58,
      type: 4001,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 153,
      x2: 141,
      y2: 153,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        153,
        141,
        153,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        11,
        0
      ]
    },
    {
      id: 60,
      type: 4001,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 165,
      y: 153,
      x2: 165,
      y2: 153,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        165,
        153,
        165,
        153,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        11,
        0
      ]
    },
    {
      id: 61,
      type: 4009,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 111,
      y: 150,
      x2: 111,
      y2: 153,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        111,
        150,
        111,
        153,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        11,
        0
      ]
    },
    {
      id: 62,
      type: 4009,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 111,
      y: 153,
      x2: 117,
      y2: 153,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        111,
        153,
        117,
        153,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        11,
        0
      ]
    },
    {
      id: 66,
      type: 2e4,
      reference: "XXX",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 42,
      y: 486,
      x2: 0,
      y2: 0,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        42,
        486,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]
    },
    {
      id: 67,
      type: 3002,
      reference: "-X",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 81,
      y: 21,
      x2: 0,
      y2: 0,
      bounds: [
        -12,
        -9,
        6,
        3
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        81,
        21,
        0,
        0,
        -12,
        -9,
        6,
        3,
        0,
        0,
        0,
        1,
        0,
        0,
        0
      ]
    },
    {
      id: 77,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 63,
      y: 153,
      x2: 63,
      y2: 162,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        63,
        153,
        63,
        162,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        12,
        0
      ]
    },
    {
      id: 78,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 63,
      y: 162,
      x2: 75,
      y2: 162,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        63,
        162,
        75,
        162,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        12,
        0
      ]
    },
    {
      id: 79,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 75,
      y: 153,
      x2: 75,
      y2: 162,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        75,
        153,
        75,
        162,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        12,
        0
      ]
    },
    {
      id: 80,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 69,
      y: 153,
      x2: 69,
      y2: 162,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        69,
        153,
        69,
        162,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        12,
        0
      ]
    },
    {
      id: 81,
      type: 4001,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 69,
      y: 162,
      x2: 69,
      y2: 162,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        69,
        162,
        69,
        162,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        12,
        0
      ]
    },
    {
      id: 82,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 72,
      x2: 144,
      y2: 72,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        72,
        144,
        72,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        14,
        0
      ]
    },
    {
      id: 83,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 144,
      y: 57,
      x2: 144,
      y2: 60,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        144,
        57,
        144,
        60,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        13,
        0
      ]
    },
    {
      id: 84,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 144,
      y: 24,
      x2: 144,
      y2: 36,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        144,
        24,
        144,
        36,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        0
      ]
    },
    {
      id: 85,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 153,
      y: 30,
      x2: 153,
      y2: 60,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        153,
        30,
        153,
        60,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        0
      ]
    },
    {
      id: 86,
      type: 4001,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 153,
      y: 30,
      x2: 153,
      y2: 30,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        153,
        30,
        153,
        30,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        0
      ]
    },
    {
      id: 87,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 117,
      y: 75,
      x2: 117,
      y2: 78,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        117,
        75,
        117,
        78,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        14,
        0
      ]
    },
    {
      id: 88,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 117,
      y: 75,
      x2: 141,
      y2: 75,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        117,
        75,
        141,
        75,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        14,
        0
      ]
    },
    {
      id: 89,
      type: 4001,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 75,
      x2: 141,
      y2: 75,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        75,
        141,
        75,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        14,
        0
      ]
    },
    {
      id: 90,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 117,
      y: 90,
      x2: 117,
      y2: 102,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        117,
        90,
        117,
        102,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        15,
        0
      ]
    },
    {
      id: 92,
      type: 4009,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 117,
      y: 114,
      x2: 117,
      y2: 153,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        117,
        114,
        117,
        153,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        11,
        0
      ]
    },
    {
      id: 93,
      type: 4001,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 117,
      y: 153,
      x2: 117,
      y2: 153,
      bounds: [
        -6,
        -3,
        3,
        3
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        117,
        153,
        117,
        153,
        -6,
        -3,
        3,
        3,
        0,
        0,
        0,
        0,
        0,
        11,
        0
      ]
    },
    {
      id: 94,
      type: 4009,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 141,
      x2: 141,
      y2: 153,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        141,
        141,
        153,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        11,
        0
      ]
    },
    {
      id: 95,
      type: 4001,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 141,
      y: 153,
      x2: 141,
      y2: 153,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        141,
        153,
        141,
        153,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        11,
        0
      ]
    },
    {
      id: 96,
      type: 4009,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 165,
      y: 144,
      x2: 165,
      y2: 153,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        165,
        144,
        165,
        153,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        11,
        0
      ]
    },
    {
      id: 97,
      type: 4001,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 165,
      y: 153,
      x2: 165,
      y2: 153,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        165,
        153,
        165,
        153,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        11,
        0
      ]
    },
    {
      id: 100,
      type: 6007,
      reference: "-F",
      labels: [
        "1",
        "3",
        "5",
        "2",
        "4",
        "6",
        "",
        ""
      ],
      x: 63,
      y: 108,
      x2: 0,
      y2: 0,
      bounds: [
        -15,
        -3,
        21,
        15
      ],
      rawNumbers: [
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        0,
        63,
        108,
        0,
        0,
        -15,
        -3,
        21,
        15,
        0,
        0,
        0,
        1,
        0,
        22,
        23
      ]
    },
    {
      id: 101,
      type: 6007,
      reference: "-F",
      labels: [
        "1",
        "3",
        "5",
        "2",
        "4",
        "6",
        "",
        ""
      ],
      x: 63,
      y: 108,
      x2: 0,
      y2: 0,
      bounds: [
        -15,
        -3,
        21,
        15
      ],
      rawNumbers: [
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        0,
        63,
        108,
        0,
        0,
        -15,
        -3,
        21,
        15,
        0,
        0,
        0,
        1,
        0,
        22,
        23
      ]
    },
    {
      id: 102,
      type: 3004,
      reference: "-X",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 63,
      y: 27,
      x2: 0,
      y2: 0,
      bounds: [
        -12,
        -9,
        18,
        3
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        63,
        27,
        0,
        0,
        -12,
        -9,
        18,
        3,
        0,
        0,
        0,
        1,
        0,
        0,
        0
      ]
    },
    {
      id: 103,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 63,
      y: 27,
      x2: 63,
      y2: 51,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        63,
        27,
        63,
        51,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        16,
        0
      ]
    },
    {
      id: 104,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 69,
      y: 27,
      x2: 69,
      y2: 51,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        69,
        27,
        69,
        51,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        17,
        0
      ]
    },
    {
      id: 105,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 75,
      y: 27,
      x2: 75,
      y2: 51,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        75,
        27,
        75,
        51,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        18,
        0
      ]
    },
    {
      id: 106,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 63,
      y: 72,
      x2: 63,
      y2: 84,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        63,
        72,
        63,
        84,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        19,
        0
      ]
    },
    {
      id: 107,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 69,
      y: 72,
      x2: 69,
      y2: 84,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        69,
        72,
        69,
        84,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        20,
        0
      ]
    },
    {
      id: 108,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 75,
      y: 72,
      x2: 75,
      y2: 84,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        75,
        72,
        75,
        84,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        21,
        0
      ]
    },
    {
      id: 109,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 63,
      y: 96,
      x2: 63,
      y2: 108,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        63,
        96,
        63,
        108,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        22,
        0
      ]
    },
    {
      id: 110,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 69,
      y: 96,
      x2: 69,
      y2: 108,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        69,
        96,
        69,
        108,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        23,
        0
      ]
    },
    {
      id: 111,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 75,
      y: 96,
      x2: 75,
      y2: 108,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        75,
        96,
        75,
        108,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        24,
        0
      ]
    },
    {
      id: 112,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 63,
      y: 120,
      x2: 63,
      y2: 129,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        63,
        120,
        63,
        129,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        25,
        0
      ]
    },
    {
      id: 113,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 69,
      y: 120,
      x2: 69,
      y2: 129,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        69,
        120,
        69,
        129,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        26,
        0
      ]
    },
    {
      id: 114,
      type: 4e3,
      reference: "",
      labels: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      x: 75,
      y: 120,
      x2: 75,
      y2: 129,
      bounds: [
        0,
        0,
        0,
        0
      ],
      rawNumbers: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        75,
        120,
        75,
        129,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        27,
        0
      ]
    }
  ]
};

// src/data/cadeEstrellaTriangulo.json
var cadeEstrellaTriangulo_default = {
  name: "CAMBIO DELTA, ESTRELLA",
  source: "Transcripci\xF3n de una fotograf\xEDa de CADe_SIMU \xB7 \xABCAMBIO DELTA, ESTRELLA.cad\xBB",
  origin: "photo",
  frame: {
    left: 30,
    top: 12,
    right: 539,
    bottom: 270,
    header: 5,
    band: 4,
    columns: {
      first: 31,
      width: 63.5,
      letters: "ABCDEFGH"
    },
    rows: {
      first: 18,
      height: 60,
      count: 4
    }
  },
  views: {
    all: {
      x: 20,
      y: 6,
      w: 535,
      h: 272
    },
    power: {
      x: 26,
      y: 8,
      w: 190,
      h: 222
    },
    control: {
      x: 252,
      y: 8,
      w: 216,
      h: 250
    }
  },
  splitX: 225,
  objects: [
    {
      id: 1,
      type: 9100,
      shape: "terminal-round",
      reference: "-X",
      labels: [
        "L1",
        "L2",
        "L3",
        "PE"
      ],
      x: 63,
      y: 24,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "L1",
          x: 63,
          y: 26
        },
        {
          terminal: "L2",
          x: 72,
          y: 26
        },
        {
          terminal: "L3",
          x: 81,
          y: 26
        },
        {
          terminal: "PE",
          x: 90,
          y: 26
        }
      ],
      box: [
        54,
        18,
        94,
        27
      ],
      pins: [
        "L1",
        "L2",
        "L3",
        "PE"
      ]
    },
    {
      id: 2,
      type: 9100,
      shape: "breaker3",
      reference: "Q1",
      labels: [
        "1",
        "3",
        "5",
        "2",
        "4",
        "6"
      ],
      x: 63,
      y: 45,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "1",
          x: 63,
          y: 45
        },
        {
          terminal: "3",
          x: 72,
          y: 45
        },
        {
          terminal: "5",
          x: 81,
          y: 45
        },
        {
          terminal: "2",
          x: 63,
          y: 69
        },
        {
          terminal: "4",
          x: 72,
          y: 69
        },
        {
          terminal: "6",
          x: 81,
          y: 69
        }
      ],
      box: [
        44,
        43,
        88,
        71
      ]
    },
    {
      id: 3,
      type: 9100,
      shape: "contactor3",
      reference: "KM1",
      labels: [
        "1",
        "3",
        "5",
        "2",
        "4",
        "6"
      ],
      x: 63,
      y: 96,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "1",
          x: 63,
          y: 96
        },
        {
          terminal: "3",
          x: 72,
          y: 96
        },
        {
          terminal: "5",
          x: 81,
          y: 96
        },
        {
          terminal: "2",
          x: 63,
          y: 114
        },
        {
          terminal: "4",
          x: 72,
          y: 114
        },
        {
          terminal: "6",
          x: 81,
          y: 114
        }
      ],
      box: [
        52,
        95,
        86,
        115
      ]
    },
    {
      id: 4,
      type: 9100,
      shape: "thermal3",
      reference: "F1",
      labels: [
        "1",
        "3",
        "5",
        "2",
        "4",
        "6"
      ],
      x: 63,
      y: 137,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "1",
          x: 63,
          y: 137
        },
        {
          terminal: "3",
          x: 72,
          y: 137
        },
        {
          terminal: "5",
          x: 81,
          y: 137
        },
        {
          terminal: "2",
          x: 63,
          y: 146
        },
        {
          terminal: "4",
          x: 72,
          y: 146
        },
        {
          terminal: "6",
          x: 81,
          y: 146
        }
      ],
      box: [
        50,
        134,
        88,
        149
      ]
    },
    {
      id: 5,
      type: 9100,
      shape: "motor",
      reference: "M1",
      labels: [
        "U1",
        "V1",
        "W1",
        "W2",
        "U2",
        "V2",
        "PE"
      ],
      x: 72,
      y: 184,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "U1",
          x: 63,
          y: 176
        },
        {
          terminal: "V1",
          x: 72,
          y: 172
        },
        {
          terminal: "W1",
          x: 81,
          y: 176
        },
        {
          terminal: "W2",
          x: 63,
          y: 192
        },
        {
          terminal: "U2",
          x: 72,
          y: 196
        },
        {
          terminal: "V2",
          x: 81,
          y: 192
        },
        {
          terminal: "PE",
          x: 84,
          y: 184
        }
      ],
      box: [
        56,
        168,
        92,
        200
      ]
    },
    {
      id: 6,
      type: 9100,
      shape: "contactor3",
      reference: "KM2",
      labels: [
        "1",
        "3",
        "5",
        "2",
        "4",
        "6"
      ],
      x: 117,
      y: 111,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "1",
          x: 117,
          y: 111
        },
        {
          terminal: "3",
          x: 126,
          y: 111
        },
        {
          terminal: "5",
          x: 135,
          y: 111
        },
        {
          terminal: "2",
          x: 117,
          y: 129
        },
        {
          terminal: "4",
          x: 126,
          y: 129
        },
        {
          terminal: "6",
          x: 135,
          y: 129
        }
      ],
      box: [
        105,
        110,
        140,
        130
      ],
      pitch: 9
    },
    {
      id: 7,
      type: 9100,
      shape: "contactor3",
      reference: "KM3",
      labels: [
        "1",
        "3",
        "5",
        "2",
        "4",
        "6"
      ],
      x: 165,
      y: 111,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "1",
          x: 165,
          y: 111
        },
        {
          terminal: "3",
          x: 174,
          y: 111
        },
        {
          terminal: "5",
          x: 183,
          y: 111
        },
        {
          terminal: "2",
          x: 165,
          y: 129
        },
        {
          terminal: "4",
          x: 174,
          y: 129
        },
        {
          terminal: "6",
          x: 183,
          y: 129
        }
      ],
      box: [
        153,
        110,
        188,
        130
      ],
      pitch: 9
    },
    {
      id: 8,
      type: 4e3,
      reference: "",
      labels: [],
      x: 63,
      y: 26,
      x2: 63,
      y2: 45,
      color: "#2f343a"
    },
    {
      id: 9,
      type: 4e3,
      reference: "",
      labels: [],
      x: 72,
      y: 26,
      x2: 72,
      y2: 45,
      color: "#2f343a"
    },
    {
      id: 10,
      type: 4e3,
      reference: "",
      labels: [],
      x: 81,
      y: 26,
      x2: 81,
      y2: 45,
      color: "#2f343a"
    },
    {
      id: 11,
      type: 4e3,
      reference: "",
      labels: [],
      x: 90,
      y: 26,
      x2: 90,
      y2: 184,
      color: "#2f343a",
      dashed: true
    },
    {
      id: 12,
      type: 4e3,
      reference: "",
      labels: [],
      x: 90,
      y: 184,
      x2: 84,
      y2: 184,
      color: "#2f343a"
    },
    {
      id: 13,
      type: 4e3,
      reference: "",
      labels: [],
      x: 63,
      y: 69,
      x2: 63,
      y2: 96,
      color: "#2f343a"
    },
    {
      id: 14,
      type: 4e3,
      reference: "",
      labels: [],
      x: 63,
      y: 114,
      x2: 63,
      y2: 137,
      color: "#2f343a"
    },
    {
      id: 15,
      type: 4e3,
      reference: "",
      labels: [],
      x: 72,
      y: 69,
      x2: 72,
      y2: 96,
      color: "#2f343a"
    },
    {
      id: 16,
      type: 4e3,
      reference: "",
      labels: [],
      x: 72,
      y: 114,
      x2: 72,
      y2: 137,
      color: "#2f343a"
    },
    {
      id: 17,
      type: 4e3,
      reference: "",
      labels: [],
      x: 81,
      y: 69,
      x2: 81,
      y2: 96,
      color: "#2f343a"
    },
    {
      id: 18,
      type: 4e3,
      reference: "",
      labels: [],
      x: 81,
      y: 114,
      x2: 81,
      y2: 137,
      color: "#2f343a"
    },
    {
      id: 19,
      type: 4e3,
      reference: "",
      labels: [],
      x: 63,
      y: 146,
      x2: 63,
      y2: 176,
      color: "#2f343a"
    },
    {
      id: 20,
      type: 4e3,
      reference: "",
      labels: [],
      x: 72,
      y: 146,
      x2: 72,
      y2: 172,
      color: "#2f343a"
    },
    {
      id: 21,
      type: 4e3,
      reference: "",
      labels: [],
      x: 81,
      y: 146,
      x2: 81,
      y2: 176,
      color: "#2f343a"
    },
    {
      id: 22,
      type: 4001,
      reference: "",
      labels: [],
      x: 63,
      y: 78,
      x2: 63,
      y2: 78
    },
    {
      id: 23,
      type: 4001,
      reference: "",
      labels: [],
      x: 72,
      y: 87,
      x2: 72,
      y2: 87
    },
    {
      id: 24,
      type: 4001,
      reference: "",
      labels: [],
      x: 81,
      y: 90,
      x2: 81,
      y2: 90
    },
    {
      id: 25,
      type: 4e3,
      reference: "",
      labels: [],
      x: 63,
      y: 78,
      x2: 117,
      y2: 78,
      color: "#2f343a"
    },
    {
      id: 26,
      type: 4e3,
      reference: "",
      labels: [],
      x: 117,
      y: 78,
      x2: 117,
      y2: 111,
      color: "#2f343a"
    },
    {
      id: 27,
      type: 4e3,
      reference: "",
      labels: [],
      x: 72,
      y: 87,
      x2: 126,
      y2: 87,
      color: "#2f343a"
    },
    {
      id: 28,
      type: 4e3,
      reference: "",
      labels: [],
      x: 126,
      y: 87,
      x2: 126,
      y2: 111,
      color: "#2f343a"
    },
    {
      id: 29,
      type: 4e3,
      reference: "",
      labels: [],
      x: 81,
      y: 90,
      x2: 135,
      y2: 90,
      color: "#2f343a"
    },
    {
      id: 30,
      type: 4e3,
      reference: "",
      labels: [],
      x: 135,
      y: 90,
      x2: 135,
      y2: 111,
      color: "#2f343a"
    },
    {
      id: 31,
      type: 4e3,
      reference: "",
      labels: [],
      x: 165,
      y: 111,
      x2: 165,
      y2: 104,
      color: "#2f343a"
    },
    {
      id: 32,
      type: 4e3,
      reference: "",
      labels: [],
      x: 174,
      y: 111,
      x2: 174,
      y2: 104,
      color: "#2f343a"
    },
    {
      id: 33,
      type: 4e3,
      reference: "",
      labels: [],
      x: 183,
      y: 111,
      x2: 183,
      y2: 104,
      color: "#2f343a"
    },
    {
      id: 34,
      type: 4e3,
      reference: "",
      labels: [],
      x: 165,
      y: 104,
      x2: 183,
      y2: 104,
      color: "#2f343a"
    },
    {
      id: 35,
      type: 4001,
      reference: "",
      labels: [],
      x: 174,
      y: 104,
      x2: 174,
      y2: 104
    },
    {
      id: 36,
      type: 4e3,
      reference: "",
      labels: [],
      x: 81,
      y: 192,
      x2: 81,
      y2: 201,
      color: "#2f343a"
    },
    {
      id: 37,
      type: 4e3,
      reference: "",
      labels: [],
      x: 81,
      y: 201,
      x2: 165,
      y2: 201,
      color: "#2f343a"
    },
    {
      id: 38,
      type: 4e3,
      reference: "",
      labels: [],
      x: 72,
      y: 196,
      x2: 72,
      y2: 207,
      color: "#2f343a"
    },
    {
      id: 39,
      type: 4e3,
      reference: "",
      labels: [],
      x: 72,
      y: 207,
      x2: 174,
      y2: 207,
      color: "#2f343a"
    },
    {
      id: 40,
      type: 4e3,
      reference: "",
      labels: [],
      x: 63,
      y: 192,
      x2: 63,
      y2: 213,
      color: "#2f343a"
    },
    {
      id: 41,
      type: 4e3,
      reference: "",
      labels: [],
      x: 63,
      y: 213,
      x2: 183,
      y2: 213,
      color: "#2f343a"
    },
    {
      id: 42,
      type: 4e3,
      reference: "",
      labels: [],
      x: 117,
      y: 129,
      x2: 117,
      y2: 201,
      color: "#2f343a"
    },
    {
      id: 43,
      type: 4e3,
      reference: "",
      labels: [],
      x: 126,
      y: 129,
      x2: 126,
      y2: 207,
      color: "#2f343a"
    },
    {
      id: 44,
      type: 4e3,
      reference: "",
      labels: [],
      x: 135,
      y: 129,
      x2: 135,
      y2: 213,
      color: "#2f343a"
    },
    {
      id: 45,
      type: 4e3,
      reference: "",
      labels: [],
      x: 165,
      y: 129,
      x2: 165,
      y2: 201,
      color: "#2f343a"
    },
    {
      id: 46,
      type: 4e3,
      reference: "",
      labels: [],
      x: 174,
      y: 129,
      x2: 174,
      y2: 207,
      color: "#2f343a"
    },
    {
      id: 47,
      type: 4e3,
      reference: "",
      labels: [],
      x: 183,
      y: 129,
      x2: 183,
      y2: 213,
      color: "#2f343a"
    },
    {
      id: 48,
      type: 4001,
      reference: "",
      labels: [],
      x: 117,
      y: 201,
      x2: 117,
      y2: 201
    },
    {
      id: 49,
      type: 4001,
      reference: "",
      labels: [],
      x: 126,
      y: 207,
      x2: 126,
      y2: 207
    },
    {
      id: 50,
      type: 4001,
      reference: "",
      labels: [],
      x: 135,
      y: 213,
      x2: 135,
      y2: 213
    },
    {
      id: 51,
      type: 9100,
      shape: "terminal-diamond",
      reference: "-X",
      labels: [
        "L"
      ],
      x: 339,
      y: 24,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "L",
          x: 339,
          y: 26
        }
      ],
      box: [
        330,
        18,
        342,
        28
      ],
      pins: [
        "L"
      ],
      ref: true
    },
    {
      id: 52,
      type: 9100,
      shape: "terminal-diamond",
      reference: "",
      labels: [
        "N"
      ],
      x: 351,
      y: 24,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "N",
          x: 351,
          y: 26
        }
      ],
      box: [
        348,
        18,
        354,
        28
      ],
      pins: [
        "N"
      ]
    },
    {
      id: 53,
      type: 9100,
      shape: "breaker1",
      reference: "-Q",
      labels: [
        "1",
        "2"
      ],
      x: 339,
      y: 42,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "1",
          x: 339,
          y: 42
        },
        {
          terminal: "2",
          x: 339,
          y: 67.5
        }
      ],
      box: [
        315,
        41,
        347,
        69
      ]
    },
    {
      id: 54,
      type: 9100,
      shape: "f1aux",
      reference: "F1",
      labels: [
        "95",
        "96",
        "97",
        "98"
      ],
      x: 339,
      y: 81,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "95",
          x: 339,
          y: 81
        },
        {
          terminal: "96",
          x: 339,
          y: 99
        },
        {
          terminal: "97",
          x: 352.5,
          y: 81
        },
        {
          terminal: "98",
          x: 352.5,
          y: 99
        }
      ],
      box: [
        321,
        80,
        360.5,
        100
      ]
    },
    {
      id: 55,
      type: 9100,
      shape: "push-nc",
      reference: "SB1",
      labels: [
        "11",
        "12"
      ],
      x: 305,
      y: 105,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "11",
          x: 305,
          y: 105
        },
        {
          terminal: "12",
          x: 305,
          y: 123
        }
      ],
      box: [
        281,
        104,
        313,
        124
      ]
    },
    {
      id: 56,
      type: 9100,
      shape: "push-no",
      reference: "SB2",
      labels: [
        "13",
        "14"
      ],
      x: 305,
      y: 135,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "13",
          x: 305,
          y: 135
        },
        {
          terminal: "14",
          x: 305,
          y: 153
        }
      ],
      box: [
        281,
        134,
        313,
        154
      ]
    },
    {
      id: 57,
      type: 9100,
      shape: "contact-no",
      reference: "KM1",
      labels: [
        "13",
        "14"
      ],
      x: 331,
      y: 135,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "13",
          x: 331,
          y: 135
        },
        {
          terminal: "14",
          x: 331,
          y: 153
        }
      ],
      box: [
        317,
        134,
        339,
        154
      ]
    },
    {
      id: 58,
      type: 9100,
      shape: "double-push",
      reference: "-S",
      labels: [
        "11",
        "12",
        "13",
        "14"
      ],
      x: 331,
      y: 174,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "11",
          x: 331,
          y: 174
        },
        {
          terminal: "12",
          x: 331,
          y: 192
        },
        {
          terminal: "13",
          x: 344,
          y: 174
        },
        {
          terminal: "14",
          x: 344,
          y: 192
        }
      ],
      box: [
        307,
        173,
        352,
        193
      ]
    },
    {
      id: 59,
      type: 9100,
      shape: "contact-nc",
      reference: "KM2",
      labels: [
        "11",
        "12"
      ],
      x: 331,
      y: 201,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "11",
          x: 331,
          y: 201
        },
        {
          terminal: "12",
          x: 331,
          y: 219
        }
      ],
      box: [
        317,
        200,
        339,
        220
      ]
    },
    {
      id: 60,
      type: 9100,
      shape: "contact-no",
      reference: "KM2",
      labels: [
        "13",
        "12"
      ],
      x: 391,
      y: 171,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "13",
          x: 391,
          y: 171
        },
        {
          terminal: "12",
          x: 391,
          y: 189
        }
      ],
      box: [
        377,
        170,
        399,
        190
      ]
    },
    {
      id: 61,
      type: 9100,
      shape: "contact-nc",
      reference: "KM3",
      labels: [
        "11",
        "12"
      ],
      x: 391,
      y: 201,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "11",
          x: 391,
          y: 201
        },
        {
          terminal: "12",
          x: 391,
          y: 219
        }
      ],
      box: [
        377,
        200,
        399,
        220
      ]
    },
    {
      id: 62,
      type: 9100,
      shape: "contact-nc",
      reference: "KM1",
      labels: [
        "11",
        "12"
      ],
      x: 265,
      y: 129,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "11",
          x: 265,
          y: 129
        },
        {
          terminal: "12",
          x: 265,
          y: 147
        }
      ],
      box: [
        251,
        128,
        273,
        148
      ]
    },
    {
      id: 63,
      type: 9100,
      shape: "coil",
      reference: "KM1",
      labels: [
        "A1",
        "A2"
      ],
      x: 305,
      y: 198,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "A1",
          x: 305,
          y: 198
        },
        {
          terminal: "A2",
          x: 305,
          y: 216
        }
      ],
      box: [
        289,
        197,
        313,
        217
      ]
    },
    {
      id: 64,
      type: 9100,
      shape: "coil",
      reference: "KM3",
      labels: [
        "A1",
        "A2"
      ],
      x: 331,
      y: 222,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "A1",
          x: 331,
          y: 222
        },
        {
          terminal: "A2",
          x: 331,
          y: 240
        }
      ],
      box: [
        315,
        221,
        339,
        241
      ]
    },
    {
      id: 65,
      type: 9100,
      shape: "coil",
      reference: "KM2",
      labels: [
        "A1",
        "A2"
      ],
      x: 391,
      y: 222,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "A1",
          x: 391,
          y: 222
        },
        {
          terminal: "A2",
          x: 391,
          y: 240
        }
      ],
      box: [
        375,
        221,
        399,
        241
      ]
    },
    {
      id: 66,
      type: 9100,
      shape: "lamp",
      reference: "H1",
      labels: [
        "X1",
        "X2"
      ],
      x: 265,
      y: 162,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "X1",
          x: 265,
          y: 162
        },
        {
          terminal: "X2",
          x: 265,
          y: 180
        }
      ],
      box: [
        249,
        161,
        274,
        181
      ]
    },
    {
      id: 67,
      type: 9100,
      shape: "lamp",
      reference: "H2",
      labels: [
        "X1",
        "X2"
      ],
      x: 352,
      y: 224,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "X1",
          x: 352,
          y: 224
        },
        {
          terminal: "X2",
          x: 352,
          y: 242
        }
      ],
      box: [
        336,
        223,
        361,
        243
      ]
    },
    {
      id: 68,
      type: 9100,
      shape: "lamp",
      reference: "H3",
      labels: [
        "X1",
        "X2"
      ],
      x: 417,
      y: 224,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "X1",
          x: 417,
          y: 224
        },
        {
          terminal: "X2",
          x: 417,
          y: 242
        }
      ],
      box: [
        401,
        223,
        426,
        243
      ]
    },
    {
      id: 69,
      type: 9100,
      shape: "lamp",
      reference: "H4",
      labels: [
        "X1",
        "X2"
      ],
      x: 440,
      y: 166,
      x2: 0,
      y2: 0,
      ports: [
        {
          terminal: "X1",
          x: 440,
          y: 166
        },
        {
          terminal: "X2",
          x: 440,
          y: 184
        }
      ],
      box: [
        424,
        165,
        449,
        185
      ]
    },
    {
      id: 70,
      type: 4e3,
      reference: "",
      labels: [],
      x: 339,
      y: 26,
      x2: 339,
      y2: 42,
      color: "#a64a4a"
    },
    {
      id: 71,
      type: 4e3,
      reference: "",
      labels: [],
      x: 339,
      y: 67.5,
      x2: 339,
      y2: 75,
      color: "#a64a4a"
    },
    {
      id: 72,
      type: 4001,
      reference: "",
      labels: [],
      x: 339,
      y: 75,
      x2: 339,
      y2: 75
    },
    {
      id: 73,
      type: 4e3,
      reference: "",
      labels: [],
      x: 339,
      y: 75,
      x2: 265,
      y2: 75,
      color: "#a64a4a"
    },
    {
      id: 74,
      type: 4e3,
      reference: "",
      labels: [],
      x: 265,
      y: 75,
      x2: 265,
      y2: 129,
      color: "#a64a4a"
    },
    {
      id: 75,
      type: 4e3,
      reference: "",
      labels: [],
      x: 265,
      y: 147,
      x2: 265,
      y2: 162,
      color: "#a64a4a"
    },
    {
      id: 76,
      type: 4e3,
      reference: "",
      labels: [],
      x: 265,
      y: 180,
      x2: 265,
      y2: 249,
      color: "#3d6fae"
    },
    {
      id: 77,
      type: 4e3,
      reference: "",
      labels: [],
      x: 339,
      y: 75,
      x2: 339,
      y2: 81,
      color: "#a64a4a"
    },
    {
      id: 78,
      type: 4e3,
      reference: "",
      labels: [],
      x: 339,
      y: 75,
      x2: 352.5,
      y2: 75,
      color: "#a64a4a"
    },
    {
      id: 79,
      type: 4e3,
      reference: "",
      labels: [],
      x: 352.5,
      y: 75,
      x2: 352.5,
      y2: 81,
      color: "#a64a4a"
    },
    {
      id: 80,
      type: 4e3,
      reference: "",
      labels: [],
      x: 339,
      y: 99,
      x2: 305,
      y2: 99,
      color: "#a64a4a"
    },
    {
      id: 81,
      type: 4e3,
      reference: "",
      labels: [],
      x: 305,
      y: 99,
      x2: 305,
      y2: 105,
      color: "#a64a4a"
    },
    {
      id: 82,
      type: 4e3,
      reference: "",
      labels: [],
      x: 352.5,
      y: 99,
      x2: 440,
      y2: 99,
      color: "#a64a4a"
    },
    {
      id: 83,
      type: 4e3,
      reference: "",
      labels: [],
      x: 440,
      y: 99,
      x2: 440,
      y2: 166,
      color: "#a64a4a"
    },
    {
      id: 84,
      type: 4e3,
      reference: "",
      labels: [],
      x: 440,
      y: 184,
      x2: 440,
      y2: 249,
      color: "#3d6fae"
    },
    {
      id: 85,
      type: 4e3,
      reference: "",
      labels: [],
      x: 305,
      y: 123,
      x2: 305,
      y2: 129,
      color: "#a64a4a"
    },
    {
      id: 86,
      type: 4001,
      reference: "",
      labels: [],
      x: 305,
      y: 129,
      x2: 305,
      y2: 129
    },
    {
      id: 87,
      type: 4e3,
      reference: "",
      labels: [],
      x: 305,
      y: 129,
      x2: 305,
      y2: 135,
      color: "#a64a4a"
    },
    {
      id: 88,
      type: 4e3,
      reference: "",
      labels: [],
      x: 305,
      y: 153,
      x2: 305,
      y2: 156,
      color: "#a64a4a"
    },
    {
      id: 89,
      type: 4001,
      reference: "",
      labels: [],
      x: 305,
      y: 156,
      x2: 305,
      y2: 156
    },
    {
      id: 90,
      type: 4e3,
      reference: "",
      labels: [],
      x: 305,
      y: 129,
      x2: 331,
      y2: 129,
      color: "#a64a4a"
    },
    {
      id: 91,
      type: 4e3,
      reference: "",
      labels: [],
      x: 331,
      y: 129,
      x2: 331,
      y2: 135,
      color: "#a64a4a"
    },
    {
      id: 92,
      type: 4e3,
      reference: "",
      labels: [],
      x: 331,
      y: 153,
      x2: 331,
      y2: 156,
      color: "#a64a4a"
    },
    {
      id: 93,
      type: 4e3,
      reference: "",
      labels: [],
      x: 331,
      y: 156,
      x2: 305,
      y2: 156,
      color: "#a64a4a"
    },
    {
      id: 94,
      type: 4e3,
      reference: "",
      labels: [],
      x: 305,
      y: 156,
      x2: 305,
      y2: 165,
      color: "#a64a4a"
    },
    {
      id: 95,
      type: 4001,
      reference: "",
      labels: [],
      x: 305,
      y: 165,
      x2: 305,
      y2: 165
    },
    {
      id: 96,
      type: 4e3,
      reference: "",
      labels: [],
      x: 305,
      y: 165,
      x2: 305,
      y2: 198,
      color: "#a64a4a"
    },
    {
      id: 97,
      type: 4e3,
      reference: "",
      labels: [],
      x: 305,
      y: 216,
      x2: 305,
      y2: 249,
      color: "#3d6fae"
    },
    {
      id: 98,
      type: 4e3,
      reference: "",
      labels: [],
      x: 305,
      y: 165,
      x2: 391,
      y2: 165,
      color: "#a64a4a"
    },
    {
      id: 99,
      type: 4e3,
      reference: "",
      labels: [],
      x: 331,
      y: 165,
      x2: 331,
      y2: 174,
      color: "#a64a4a"
    },
    {
      id: 100,
      type: 4e3,
      reference: "",
      labels: [],
      x: 344,
      y: 165,
      x2: 344,
      y2: 174,
      color: "#a64a4a"
    },
    {
      id: 101,
      type: 4e3,
      reference: "",
      labels: [],
      x: 391,
      y: 165,
      x2: 391,
      y2: 171,
      color: "#a64a4a"
    },
    {
      id: 102,
      type: 4e3,
      reference: "",
      labels: [],
      x: 331,
      y: 192,
      x2: 331,
      y2: 201,
      color: "#a64a4a"
    },
    {
      id: 103,
      type: 4e3,
      reference: "",
      labels: [],
      x: 331,
      y: 219,
      x2: 331,
      y2: 222,
      color: "#a64a4a"
    },
    {
      id: 104,
      type: 4e3,
      reference: "",
      labels: [],
      x: 331,
      y: 240,
      x2: 331,
      y2: 249,
      color: "#3d6fae"
    },
    {
      id: 105,
      type: 4e3,
      reference: "",
      labels: [],
      x: 331,
      y: 222,
      x2: 352,
      y2: 222,
      color: "#a64a4a"
    },
    {
      id: 106,
      type: 4e3,
      reference: "",
      labels: [],
      x: 352,
      y: 222,
      x2: 352,
      y2: 224,
      color: "#a64a4a"
    },
    {
      id: 107,
      type: 4e3,
      reference: "",
      labels: [],
      x: 352,
      y: 242,
      x2: 352,
      y2: 249,
      color: "#3d6fae"
    },
    {
      id: 108,
      type: 4e3,
      reference: "",
      labels: [],
      x: 344,
      y: 192,
      x2: 391,
      y2: 192,
      color: "#a64a4a"
    },
    {
      id: 109,
      type: 4001,
      reference: "",
      labels: [],
      x: 391,
      y: 192,
      x2: 391,
      y2: 192
    },
    {
      id: 110,
      type: 4e3,
      reference: "",
      labels: [],
      x: 391,
      y: 189,
      x2: 391,
      y2: 192,
      color: "#a64a4a"
    },
    {
      id: 111,
      type: 4e3,
      reference: "",
      labels: [],
      x: 391,
      y: 192,
      x2: 391,
      y2: 201,
      color: "#a64a4a"
    },
    {
      id: 112,
      type: 4e3,
      reference: "",
      labels: [],
      x: 391,
      y: 219,
      x2: 391,
      y2: 222,
      color: "#a64a4a"
    },
    {
      id: 113,
      type: 4e3,
      reference: "",
      labels: [],
      x: 391,
      y: 240,
      x2: 391,
      y2: 249,
      color: "#3d6fae"
    },
    {
      id: 114,
      type: 4e3,
      reference: "",
      labels: [],
      x: 391,
      y: 222,
      x2: 417,
      y2: 222,
      color: "#a64a4a"
    },
    {
      id: 115,
      type: 4e3,
      reference: "",
      labels: [],
      x: 417,
      y: 222,
      x2: 417,
      y2: 224,
      color: "#a64a4a"
    },
    {
      id: 116,
      type: 4e3,
      reference: "",
      labels: [],
      x: 417,
      y: 242,
      x2: 417,
      y2: 249,
      color: "#3d6fae"
    },
    {
      id: 117,
      type: 4e3,
      reference: "",
      labels: [],
      x: 351,
      y: 26,
      x2: 351,
      y2: 36,
      color: "#3d6fae"
    },
    {
      id: 118,
      type: 4e3,
      reference: "",
      labels: [],
      x: 351,
      y: 36,
      x2: 456,
      y2: 36,
      color: "#3d6fae"
    },
    {
      id: 119,
      type: 4e3,
      reference: "",
      labels: [],
      x: 456,
      y: 36,
      x2: 456,
      y2: 249,
      color: "#3d6fae"
    },
    {
      id: 120,
      type: 4e3,
      reference: "",
      labels: [],
      x: 265,
      y: 249,
      x2: 456,
      y2: 249,
      color: "#3d6fae"
    },
    {
      id: 121,
      type: 4001,
      reference: "",
      labels: [],
      x: 305,
      y: 249,
      x2: 305,
      y2: 249
    },
    {
      id: 122,
      type: 4001,
      reference: "",
      labels: [],
      x: 331,
      y: 249,
      x2: 331,
      y2: 249
    },
    {
      id: 123,
      type: 4001,
      reference: "",
      labels: [],
      x: 352,
      y: 249,
      x2: 352,
      y2: 249
    },
    {
      id: 124,
      type: 4001,
      reference: "",
      labels: [],
      x: 391,
      y: 249,
      x2: 391,
      y2: 249
    },
    {
      id: 125,
      type: 4001,
      reference: "",
      labels: [],
      x: 417,
      y: 249,
      x2: 417,
      y2: 249
    },
    {
      id: 126,
      type: 4001,
      reference: "",
      labels: [],
      x: 440,
      y: 249,
      x2: 440,
      y2: 249
    }
  ]
};

// src/data/cadeLecciones.json
var cadeLecciones_default = {
  simple: {
    name: "Marcha y paro con retenci\xF3n",
    source: "Esquema de la lecci\xF3n guiada, redibujado a partir del circuito armado en el banco.",
    origin: "lesson",
    splitX: 140,
    objects: [
      {
        id: 1,
        type: 9100,
        shape: "terminal-round",
        reference: "-X",
        labels: [
          "R",
          "S",
          "T",
          "PE"
        ],
        x: 63,
        y: 24,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "R",
            x: 63,
            y: 26,
            panel: "FUENTE:R"
          },
          {
            terminal: "S",
            x: 72,
            y: 26,
            panel: "FUENTE:S"
          },
          {
            terminal: "T",
            x: 81,
            y: 26,
            panel: "FUENTE:T"
          },
          {
            terminal: "PE",
            x: 90,
            y: 26,
            panel: "FUENTE:TP"
          }
        ],
        box: [
          54,
          18,
          94,
          27
        ],
        pins: [
          "R",
          "S",
          "T",
          "PE"
        ]
      },
      {
        id: 2,
        type: 9100,
        shape: "contactor3",
        reference: "KM1",
        labels: [
          "1",
          "3",
          "5",
          "2",
          "4",
          "6"
        ],
        x: 63,
        y: 60,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "1",
            x: 63,
            y: 60,
            panel: "CONTACTOR_TERMICO:L1"
          },
          {
            terminal: "3",
            x: 72,
            y: 60,
            panel: "CONTACTOR_TERMICO:L2"
          },
          {
            terminal: "5",
            x: 81,
            y: 60,
            panel: "CONTACTOR_TERMICO:L3"
          },
          {
            terminal: "2",
            x: 63,
            y: 78
          },
          {
            terminal: "4",
            x: 72,
            y: 78
          },
          {
            terminal: "6",
            x: 81,
            y: 78
          }
        ],
        box: [
          52,
          59,
          86,
          79
        ]
      },
      {
        id: 3,
        type: 9100,
        shape: "thermal3",
        reference: "F1",
        labels: [
          "1",
          "3",
          "5",
          "2",
          "4",
          "6"
        ],
        x: 63,
        y: 100,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "1",
            x: 63,
            y: 100
          },
          {
            terminal: "3",
            x: 72,
            y: 100
          },
          {
            terminal: "5",
            x: 81,
            y: 100
          },
          {
            terminal: "2",
            x: 63,
            y: 109,
            panel: "CONTACTOR_TERMICO:T1"
          },
          {
            terminal: "4",
            x: 72,
            y: 109,
            panel: "CONTACTOR_TERMICO:T2"
          },
          {
            terminal: "6",
            x: 81,
            y: 109,
            panel: "CONTACTOR_TERMICO:T3"
          }
        ],
        box: [
          50,
          97,
          88,
          112
        ]
      },
      {
        id: 4,
        type: 9100,
        shape: "motor",
        reference: "M1",
        labels: [
          "U1",
          "V1",
          "W1",
          "W2",
          "U2",
          "V2",
          "PE"
        ],
        x: 72,
        y: 150,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "U1",
            x: 63,
            y: 142,
            panel: "BORNERA_MOTOR:U1"
          },
          {
            terminal: "V1",
            x: 72,
            y: 138,
            panel: "BORNERA_MOTOR:V1"
          },
          {
            terminal: "W1",
            x: 81,
            y: 142,
            panel: "BORNERA_MOTOR:W1"
          },
          {
            terminal: "W2",
            x: 63,
            y: 158,
            panel: "BORNERA_MOTOR:W2"
          },
          {
            terminal: "U2",
            x: 72,
            y: 162,
            panel: "BORNERA_MOTOR:U2"
          },
          {
            terminal: "V2",
            x: 81,
            y: 158,
            panel: "BORNERA_MOTOR:V2"
          },
          {
            terminal: "PE",
            x: 84,
            y: 150,
            panel: "BORNERA_MOTOR:TP"
          }
        ],
        box: [
          56,
          134,
          92,
          166
        ]
      },
      {
        id: 5,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 26,
        x2: 63,
        y2: 60,
        color: "#2f343a"
      },
      {
        id: 6,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 78,
        x2: 63,
        y2: 100,
        color: "#2f343a",
        internal: true
      },
      {
        id: 7,
        type: 4e3,
        reference: "",
        labels: [],
        x: 72,
        y: 26,
        x2: 72,
        y2: 60,
        color: "#2f343a"
      },
      {
        id: 8,
        type: 4e3,
        reference: "",
        labels: [],
        x: 72,
        y: 78,
        x2: 72,
        y2: 100,
        color: "#2f343a",
        internal: true
      },
      {
        id: 9,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 26,
        x2: 81,
        y2: 60,
        color: "#2f343a"
      },
      {
        id: 10,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 78,
        x2: 81,
        y2: 100,
        color: "#2f343a",
        internal: true
      },
      {
        id: 11,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 109,
        x2: 63,
        y2: 142,
        color: "#2f343a"
      },
      {
        id: 12,
        type: 4e3,
        reference: "",
        labels: [],
        x: 72,
        y: 109,
        x2: 72,
        y2: 138,
        color: "#2f343a"
      },
      {
        id: 13,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 109,
        x2: 81,
        y2: 142,
        color: "#2f343a"
      },
      {
        id: 14,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 158,
        x2: 63,
        y2: 172,
        color: "#2f343a"
      },
      {
        id: 15,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 172,
        x2: 72,
        y2: 172,
        color: "#2f343a"
      },
      {
        id: 16,
        type: 4e3,
        reference: "",
        labels: [],
        x: 72,
        y: 162,
        x2: 72,
        y2: 172,
        color: "#2f343a"
      },
      {
        id: 17,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 158,
        x2: 81,
        y2: 172,
        color: "#2f343a"
      },
      {
        id: 18,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 172,
        x2: 72,
        y2: 172,
        color: "#2f343a"
      },
      {
        id: 19,
        type: 4001,
        reference: "",
        labels: [],
        x: 72,
        y: 172,
        x2: 72,
        y2: 172
      },
      {
        id: 20,
        type: 4e3,
        reference: "",
        labels: [],
        x: 90,
        y: 26,
        x2: 90,
        y2: 70,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 21,
        type: 4e3,
        reference: "",
        labels: [],
        x: 90,
        y: 70,
        x2: 90,
        y2: 110,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 22,
        type: 4e3,
        reference: "",
        labels: [],
        x: 90,
        y: 110,
        x2: 90,
        y2: 150,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 23,
        type: 4e3,
        reference: "",
        labels: [],
        x: 90,
        y: 150,
        x2: 84,
        y2: 150,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 24,
        type: 4001,
        reference: "",
        labels: [],
        x: 90,
        y: 70,
        x2: 90,
        y2: 70
      },
      {
        id: 25,
        type: 4e3,
        reference: "",
        labels: [],
        x: 90,
        y: 70,
        x2: 100,
        y2: 70,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 26,
        type: 9100,
        shape: "terminal-diamond",
        reference: "KM1",
        labels: [
          "TP"
        ],
        x: 100,
        y: 70,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "TP",
            x: 100,
            y: 70,
            panel: "CONTACTOR_TERMICO:TP_DER"
          }
        ],
        box: [
          97,
          67,
          103,
          73
        ],
        pins: [
          "TP KM1"
        ]
      },
      {
        id: 27,
        type: 4001,
        reference: "",
        labels: [],
        x: 90,
        y: 110,
        x2: 90,
        y2: 110
      },
      {
        id: 28,
        type: 4e3,
        reference: "",
        labels: [],
        x: 90,
        y: 110,
        x2: 100,
        y2: 110,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 29,
        type: 9100,
        shape: "terminal-diamond",
        reference: "BOT",
        labels: [
          "TP"
        ],
        x: 100,
        y: 110,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "TP",
            x: 100,
            y: 110,
            panel: "BOTONERAS:TP_DER"
          }
        ],
        box: [
          97,
          107,
          103,
          113
        ],
        pins: [
          "TP BOT"
        ]
      },
      {
        id: 30,
        type: 9100,
        shape: "terminal-diamond",
        reference: "-X",
        labels: [
          "F"
        ],
        x: 150,
        y: 24,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "F",
            x: 150,
            y: 26,
            panel: "FUENTE:F"
          }
        ],
        box: [
          147,
          21,
          153,
          29
        ],
        pins: [
          "F"
        ]
      },
      {
        id: 31,
        type: 9100,
        shape: "terminal-diamond",
        reference: "",
        labels: [
          "N"
        ],
        x: 320,
        y: 24,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "N",
            x: 320,
            y: 26,
            panel: "FUENTE:N"
          }
        ],
        box: [
          317,
          21,
          323,
          29
        ],
        pins: [
          "N"
        ]
      },
      {
        id: 32,
        type: 9100,
        shape: "f1aux",
        reference: "F1",
        labels: [
          "95",
          "96",
          "97",
          "98"
        ],
        x: 150,
        y: 40,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "95",
            x: 150,
            y: 40,
            panel: "CONTACTOR_TERMICO:95"
          },
          {
            terminal: "96",
            x: 150,
            y: 58,
            panel: "CONTACTOR_TERMICO:96"
          },
          {
            terminal: "97",
            x: 163.5,
            y: 40,
            panel: "CONTACTOR_TERMICO:97"
          },
          {
            terminal: "98",
            x: 163.5,
            y: 58,
            panel: "CONTACTOR_TERMICO:98"
          }
        ],
        box: [
          132,
          39,
          172,
          59
        ]
      },
      {
        id: 33,
        type: 4e3,
        reference: "",
        labels: [],
        x: 150,
        y: 26,
        x2: 150,
        y2: 32,
        color: "#a64a4a"
      },
      {
        id: 34,
        type: 4e3,
        reference: "",
        labels: [],
        x: 150,
        y: 32,
        x2: 150,
        y2: 40,
        color: "#a64a4a"
      },
      {
        id: 35,
        type: 4e3,
        reference: "",
        labels: [],
        x: 150,
        y: 32,
        x2: 163.5,
        y2: 32,
        color: "#a64a4a"
      },
      {
        id: 36,
        type: 4e3,
        reference: "",
        labels: [],
        x: 163.5,
        y: 32,
        x2: 163.5,
        y2: 40,
        color: "#a64a4a"
      },
      {
        id: 37,
        type: 4001,
        reference: "",
        labels: [],
        x: 150,
        y: 32,
        x2: 150,
        y2: 32
      },
      {
        id: 38,
        type: 4e3,
        reference: "",
        labels: [],
        x: 150,
        y: 58,
        x2: 150,
        y2: 70,
        color: "#a64a4a"
      },
      {
        id: 39,
        type: 4001,
        reference: "",
        labels: [],
        x: 150,
        y: 70,
        x2: 150,
        y2: 70
      },
      {
        id: 40,
        type: 4e3,
        reference: "",
        labels: [],
        x: 150,
        y: 70,
        x2: 150,
        y2: 80,
        color: "#a64a4a"
      },
      {
        id: 41,
        type: 9100,
        shape: "push-nc",
        reference: "S2",
        labels: [
          "1",
          "2"
        ],
        x: 150,
        y: 80,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "1",
            x: 150,
            y: 80,
            panel: "BOTONERAS:S2:1"
          },
          {
            terminal: "2",
            x: 150,
            y: 98,
            panel: "BOTONERAS:S2:2"
          }
        ],
        box: [
          126,
          79,
          158,
          99
        ]
      },
      {
        id: 42,
        type: 4e3,
        reference: "",
        labels: [],
        x: 150,
        y: 70,
        x2: 190,
        y2: 70,
        color: "#a64a4a"
      },
      {
        id: 43,
        type: 4e3,
        reference: "",
        labels: [],
        x: 190,
        y: 70,
        x2: 190,
        y2: 80,
        color: "#a64a4a"
      },
      {
        id: 44,
        type: 9100,
        shape: "contact-nc",
        reference: "KM1",
        labels: [
          "71",
          "72"
        ],
        x: 190,
        y: 80,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "71",
            x: 190,
            y: 80,
            panel: "CONTACTOR_TERMICO:71"
          },
          {
            terminal: "72",
            x: 190,
            y: 98,
            panel: "CONTACTOR_TERMICO:72"
          }
        ],
        box: [
          176,
          79,
          198,
          99
        ]
      },
      {
        id: 45,
        type: 4e3,
        reference: "",
        labels: [],
        x: 190,
        y: 98,
        x2: 190,
        y2: 112,
        color: "#a64a4a"
      },
      {
        id: 46,
        type: 9100,
        shape: "lamp",
        reference: "P2",
        labels: [
          "X1",
          "X2"
        ],
        x: 190,
        y: 112,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "X1",
            x: 190,
            y: 112,
            panel: "BOTONERAS:PILOTO_2"
          },
          {
            terminal: "X2",
            x: 190,
            y: 130
          }
        ],
        box: [
          174,
          111,
          199,
          131
        ]
      },
      {
        id: 47,
        type: 4e3,
        reference: "",
        labels: [],
        x: 190,
        y: 130,
        x2: 190,
        y2: 200,
        color: "#3d6fae",
        internal: true
      },
      {
        id: 48,
        type: 4e3,
        reference: "",
        labels: [],
        x: 150,
        y: 98,
        x2: 150,
        y2: 108,
        color: "#a64a4a"
      },
      {
        id: 49,
        type: 4001,
        reference: "",
        labels: [],
        x: 150,
        y: 108,
        x2: 150,
        y2: 108
      },
      {
        id: 50,
        type: 4e3,
        reference: "",
        labels: [],
        x: 150,
        y: 108,
        x2: 210,
        y2: 108,
        color: "#a64a4a"
      },
      {
        id: 51,
        type: 4001,
        reference: "",
        labels: [],
        x: 210,
        y: 108,
        x2: 210,
        y2: 108
      },
      {
        id: 52,
        type: 4e3,
        reference: "",
        labels: [],
        x: 210,
        y: 108,
        x2: 210,
        y2: 118,
        color: "#a64a4a"
      },
      {
        id: 53,
        type: 4e3,
        reference: "",
        labels: [],
        x: 210,
        y: 108,
        x2: 250,
        y2: 108,
        color: "#a64a4a"
      },
      {
        id: 54,
        type: 4e3,
        reference: "",
        labels: [],
        x: 250,
        y: 108,
        x2: 250,
        y2: 118,
        color: "#a64a4a"
      },
      {
        id: 55,
        type: 9100,
        shape: "push-no",
        reference: "S1",
        labels: [
          "3",
          "4"
        ],
        x: 210,
        y: 118,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "3",
            x: 210,
            y: 118,
            panel: "BOTONERAS:S1:3"
          },
          {
            terminal: "4",
            x: 210,
            y: 136,
            panel: "BOTONERAS:S1:4"
          }
        ],
        box: [
          186,
          117,
          218,
          137
        ]
      },
      {
        id: 56,
        type: 9100,
        shape: "contact-no",
        reference: "KM1",
        labels: [
          "13",
          "14"
        ],
        x: 250,
        y: 118,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "13",
            x: 250,
            y: 118,
            panel: "CONTACTOR_TERMICO:13"
          },
          {
            terminal: "14",
            x: 250,
            y: 136,
            panel: "CONTACTOR_TERMICO:14"
          }
        ],
        box: [
          236,
          117,
          258,
          137
        ]
      },
      {
        id: 57,
        type: 4e3,
        reference: "",
        labels: [],
        x: 210,
        y: 136,
        x2: 210,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 58,
        type: 4e3,
        reference: "",
        labels: [],
        x: 210,
        y: 146,
        x2: 230,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 59,
        type: 4e3,
        reference: "",
        labels: [],
        x: 250,
        y: 136,
        x2: 250,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 60,
        type: 4e3,
        reference: "",
        labels: [],
        x: 250,
        y: 146,
        x2: 230,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 61,
        type: 4001,
        reference: "",
        labels: [],
        x: 230,
        y: 146,
        x2: 230,
        y2: 146
      },
      {
        id: 62,
        type: 4e3,
        reference: "",
        labels: [],
        x: 250,
        y: 146,
        x2: 290,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 63,
        type: 4001,
        reference: "",
        labels: [],
        x: 250,
        y: 146,
        x2: 250,
        y2: 146
      },
      {
        id: 64,
        type: 4e3,
        reference: "",
        labels: [],
        x: 230,
        y: 146,
        x2: 230,
        y2: 158,
        color: "#a64a4a"
      },
      {
        id: 65,
        type: 9100,
        shape: "coil",
        reference: "KM1",
        labels: [
          "A1",
          "A2"
        ],
        x: 230,
        y: 158,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "A1",
            x: 230,
            y: 158,
            panel: "CONTACTOR_TERMICO:A1"
          },
          {
            terminal: "A2",
            x: 230,
            y: 176,
            panel: "CONTACTOR_TERMICO:A2"
          }
        ],
        box: [
          214,
          157,
          238,
          177
        ]
      },
      {
        id: 66,
        type: 4e3,
        reference: "",
        labels: [],
        x: 290,
        y: 146,
        x2: 290,
        y2: 158,
        color: "#a64a4a"
      },
      {
        id: 67,
        type: 9100,
        shape: "lamp",
        reference: "P1",
        labels: [
          "X1",
          "X2"
        ],
        x: 290,
        y: 158,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "X1",
            x: 290,
            y: 158,
            panel: "BOTONERAS:PILOTO_1"
          },
          {
            terminal: "X2",
            x: 290,
            y: 176
          }
        ],
        box: [
          274,
          157,
          299,
          177
        ]
      },
      {
        id: 68,
        type: 4e3,
        reference: "",
        labels: [],
        x: 230,
        y: 176,
        x2: 230,
        y2: 200,
        color: "#3d6fae"
      },
      {
        id: 69,
        type: 4e3,
        reference: "",
        labels: [],
        x: 290,
        y: 176,
        x2: 290,
        y2: 200,
        color: "#3d6fae",
        internal: true
      },
      {
        id: 70,
        type: 4e3,
        reference: "",
        labels: [],
        x: 163.5,
        y: 58,
        x2: 163.5,
        y2: 64,
        color: "#a64a4a"
      },
      {
        id: 71,
        type: 4e3,
        reference: "",
        labels: [],
        x: 163.5,
        y: 64,
        x2: 350,
        y2: 64,
        color: "#a64a4a"
      },
      {
        id: 72,
        type: 4e3,
        reference: "",
        labels: [],
        x: 350,
        y: 64,
        x2: 350,
        y2: 70,
        color: "#a64a4a"
      },
      {
        id: 73,
        type: 9100,
        shape: "lamp",
        reference: "P3",
        labels: [
          "X1",
          "X2"
        ],
        x: 350,
        y: 70,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "X1",
            x: 350,
            y: 70,
            panel: "BOTONERAS:PILOTO_3"
          },
          {
            terminal: "X2",
            x: 350,
            y: 88
          }
        ],
        box: [
          334,
          69,
          359,
          89
        ]
      },
      {
        id: 74,
        type: 4e3,
        reference: "",
        labels: [],
        x: 350,
        y: 88,
        x2: 350,
        y2: 200,
        color: "#3d6fae",
        internal: true
      },
      {
        id: 75,
        type: 4e3,
        reference: "",
        labels: [],
        x: 320,
        y: 26,
        x2: 320,
        y2: 200,
        color: "#3d6fae"
      },
      {
        id: 76,
        type: 4001,
        reference: "",
        labels: [],
        x: 320,
        y: 200,
        x2: 320,
        y2: 200
      },
      {
        id: 77,
        type: 9100,
        shape: "terminal-diamond",
        reference: "BOT",
        labels: [
          "N"
        ],
        x: 172,
        y: 200,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "N",
            x: 172,
            y: 200,
            panel: "BOTONERAS:N"
          }
        ],
        box: [
          169,
          197,
          175,
          203
        ],
        pins: [
          "N"
        ],
        ref: true
      },
      {
        id: 78,
        type: 4e3,
        reference: "",
        labels: [],
        x: 172,
        y: 200,
        x2: 190,
        y2: 200,
        color: "#3d6fae"
      },
      {
        id: 79,
        type: 4e3,
        reference: "",
        labels: [],
        x: 190,
        y: 200,
        x2: 230,
        y2: 200,
        color: "#3d6fae"
      },
      {
        id: 80,
        type: 4e3,
        reference: "",
        labels: [],
        x: 230,
        y: 200,
        x2: 290,
        y2: 200,
        color: "#3d6fae"
      },
      {
        id: 81,
        type: 4e3,
        reference: "",
        labels: [],
        x: 290,
        y: 200,
        x2: 320,
        y2: 200,
        color: "#3d6fae"
      },
      {
        id: 82,
        type: 4e3,
        reference: "",
        labels: [],
        x: 320,
        y: 200,
        x2: 350,
        y2: 200,
        color: "#3d6fae",
        internal: true
      },
      {
        id: 83,
        type: 4001,
        reference: "",
        labels: [],
        x: 190,
        y: 200,
        x2: 190,
        y2: 200
      },
      {
        id: 84,
        type: 4001,
        reference: "",
        labels: [],
        x: 230,
        y: 200,
        x2: 230,
        y2: 200
      },
      {
        id: 85,
        type: 4001,
        reference: "",
        labels: [],
        x: 290,
        y: 200,
        x2: 290,
        y2: 200
      },
      {
        id: 86,
        type: 4001,
        reference: "",
        labels: [],
        x: 350,
        y: 200,
        x2: 350,
        y2: 200
      }
    ],
    views: {
      all: {
        x: 34,
        y: 10,
        w: 340,
        h: 214
      },
      power: {
        x: 34,
        y: 14,
        w: 112,
        h: 176
      },
      control: {
        x: 142,
        y: 14,
        w: 238,
        h: 204
      }
    }
  },
  inversion: {
    name: "Inversi\xF3n de giro con enclavamiento",
    source: "Esquema de la lecci\xF3n guiada, redibujado a partir del circuito armado en el banco.",
    origin: "lesson",
    splitX: 195,
    objects: [
      {
        id: 1,
        type: 9100,
        shape: "terminal-round",
        reference: "-X",
        labels: [
          "R",
          "S",
          "T",
          "PE"
        ],
        x: 63,
        y: 24,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "R",
            x: 63,
            y: 26,
            panel: "FUENTE:R"
          },
          {
            terminal: "S",
            x: 72,
            y: 26,
            panel: "FUENTE:S"
          },
          {
            terminal: "T",
            x: 81,
            y: 26,
            panel: "FUENTE:T"
          },
          {
            terminal: "PE",
            x: 90,
            y: 26,
            panel: "FUENTE:TP"
          }
        ],
        box: [
          54,
          18,
          94,
          27
        ],
        pins: [
          "R",
          "S",
          "T",
          "PE"
        ]
      },
      {
        id: 2,
        type: 9100,
        shape: "contactor3",
        reference: "KM1",
        labels: [
          "1",
          "3",
          "5",
          "2",
          "4",
          "6"
        ],
        x: 63,
        y: 60,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "1",
            x: 63,
            y: 60,
            panel: "CONTACTOR_TERMICO:L1"
          },
          {
            terminal: "3",
            x: 72,
            y: 60,
            panel: "CONTACTOR_TERMICO:L2"
          },
          {
            terminal: "5",
            x: 81,
            y: 60,
            panel: "CONTACTOR_TERMICO:L3"
          },
          {
            terminal: "2",
            x: 63,
            y: 78
          },
          {
            terminal: "4",
            x: 72,
            y: 78
          },
          {
            terminal: "6",
            x: 81,
            y: 78
          }
        ],
        box: [
          52,
          59,
          86,
          79
        ]
      },
      {
        id: 3,
        type: 9100,
        shape: "contactor3",
        reference: "KM2",
        labels: [
          "1",
          "3",
          "5",
          "2",
          "4",
          "6"
        ],
        x: 120,
        y: 60,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "1",
            x: 120,
            y: 60,
            panel: "CONTACTOR_TRIFASICO:L1"
          },
          {
            terminal: "3",
            x: 129,
            y: 60,
            panel: "CONTACTOR_TRIFASICO:L2"
          },
          {
            terminal: "5",
            x: 138,
            y: 60,
            panel: "CONTACTOR_TRIFASICO:L3"
          },
          {
            terminal: "2",
            x: 120,
            y: 78,
            panel: "CONTACTOR_TRIFASICO:T1"
          },
          {
            terminal: "4",
            x: 129,
            y: 78,
            panel: "CONTACTOR_TRIFASICO:T2"
          },
          {
            terminal: "6",
            x: 138,
            y: 78,
            panel: "CONTACTOR_TRIFASICO:T3"
          }
        ],
        box: [
          109,
          59,
          143,
          79
        ]
      },
      {
        id: 4,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 26,
        x2: 63,
        y2: 40,
        color: "#2f343a"
      },
      {
        id: 5,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 40,
        x2: 63,
        y2: 60,
        color: "#2f343a"
      },
      {
        id: 6,
        type: 4001,
        reference: "",
        labels: [],
        x: 63,
        y: 40,
        x2: 63,
        y2: 40
      },
      {
        id: 7,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 40,
        x2: 120,
        y2: 40,
        color: "#2f343a"
      },
      {
        id: 8,
        type: 4e3,
        reference: "",
        labels: [],
        x: 120,
        y: 40,
        x2: 120,
        y2: 60,
        color: "#2f343a"
      },
      {
        id: 9,
        type: 4e3,
        reference: "",
        labels: [],
        x: 72,
        y: 26,
        x2: 72,
        y2: 46,
        color: "#2f343a"
      },
      {
        id: 10,
        type: 4e3,
        reference: "",
        labels: [],
        x: 72,
        y: 46,
        x2: 72,
        y2: 60,
        color: "#2f343a"
      },
      {
        id: 11,
        type: 4001,
        reference: "",
        labels: [],
        x: 72,
        y: 46,
        x2: 72,
        y2: 46
      },
      {
        id: 12,
        type: 4e3,
        reference: "",
        labels: [],
        x: 72,
        y: 46,
        x2: 129,
        y2: 46,
        color: "#2f343a"
      },
      {
        id: 13,
        type: 4e3,
        reference: "",
        labels: [],
        x: 129,
        y: 46,
        x2: 129,
        y2: 60,
        color: "#2f343a"
      },
      {
        id: 14,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 26,
        x2: 81,
        y2: 52,
        color: "#2f343a"
      },
      {
        id: 15,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 52,
        x2: 81,
        y2: 60,
        color: "#2f343a"
      },
      {
        id: 16,
        type: 4001,
        reference: "",
        labels: [],
        x: 81,
        y: 52,
        x2: 81,
        y2: 52
      },
      {
        id: 17,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 52,
        x2: 138,
        y2: 52,
        color: "#2f343a"
      },
      {
        id: 18,
        type: 4e3,
        reference: "",
        labels: [],
        x: 138,
        y: 52,
        x2: 138,
        y2: 60,
        color: "#2f343a"
      },
      {
        id: 19,
        type: 9100,
        shape: "thermal3",
        reference: "F1",
        labels: [
          "1",
          "3",
          "5",
          "2",
          "4",
          "6"
        ],
        x: 63,
        y: 100,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "1",
            x: 63,
            y: 100
          },
          {
            terminal: "3",
            x: 72,
            y: 100
          },
          {
            terminal: "5",
            x: 81,
            y: 100
          },
          {
            terminal: "2",
            x: 63,
            y: 109,
            panel: "CONTACTOR_TERMICO:T1"
          },
          {
            terminal: "4",
            x: 72,
            y: 109,
            panel: "CONTACTOR_TERMICO:T2"
          },
          {
            terminal: "6",
            x: 81,
            y: 109,
            panel: "CONTACTOR_TERMICO:T3"
          }
        ],
        box: [
          50,
          97,
          88,
          112
        ]
      },
      {
        id: 20,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 78,
        x2: 63,
        y2: 100,
        color: "#2f343a",
        internal: true
      },
      {
        id: 21,
        type: 4e3,
        reference: "",
        labels: [],
        x: 72,
        y: 78,
        x2: 72,
        y2: 100,
        color: "#2f343a",
        internal: true
      },
      {
        id: 22,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 78,
        x2: 81,
        y2: 100,
        color: "#2f343a",
        internal: true
      },
      {
        id: 23,
        type: 9100,
        shape: "motor",
        reference: "M1",
        labels: [
          "U1",
          "V1",
          "W1",
          "W2",
          "U2",
          "V2",
          "PE"
        ],
        x: 72,
        y: 160,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "U1",
            x: 63,
            y: 152,
            panel: "BORNERA_MOTOR:U1"
          },
          {
            terminal: "V1",
            x: 72,
            y: 148,
            panel: "BORNERA_MOTOR:V1"
          },
          {
            terminal: "W1",
            x: 81,
            y: 152,
            panel: "BORNERA_MOTOR:W1"
          },
          {
            terminal: "W2",
            x: 63,
            y: 168,
            panel: "BORNERA_MOTOR:W2"
          },
          {
            terminal: "U2",
            x: 72,
            y: 172,
            panel: "BORNERA_MOTOR:U2"
          },
          {
            terminal: "V2",
            x: 81,
            y: 168,
            panel: "BORNERA_MOTOR:V2"
          },
          {
            terminal: "PE",
            x: 84,
            y: 160,
            panel: "BORNERA_MOTOR:TP"
          }
        ],
        box: [
          56,
          144,
          92,
          176
        ]
      },
      {
        id: 24,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 109,
        x2: 63,
        y2: 126,
        color: "#2f343a"
      },
      {
        id: 25,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 126,
        x2: 63,
        y2: 152,
        color: "#2f343a"
      },
      {
        id: 26,
        type: 4001,
        reference: "",
        labels: [],
        x: 63,
        y: 126,
        x2: 63,
        y2: 126
      },
      {
        id: 27,
        type: 4e3,
        reference: "",
        labels: [],
        x: 72,
        y: 109,
        x2: 72,
        y2: 132,
        color: "#2f343a"
      },
      {
        id: 28,
        type: 4e3,
        reference: "",
        labels: [],
        x: 72,
        y: 132,
        x2: 72,
        y2: 148,
        color: "#2f343a"
      },
      {
        id: 29,
        type: 4001,
        reference: "",
        labels: [],
        x: 72,
        y: 132,
        x2: 72,
        y2: 132
      },
      {
        id: 30,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 109,
        x2: 81,
        y2: 120,
        color: "#2f343a"
      },
      {
        id: 31,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 120,
        x2: 81,
        y2: 152,
        color: "#2f343a"
      },
      {
        id: 32,
        type: 4001,
        reference: "",
        labels: [],
        x: 81,
        y: 120,
        x2: 81,
        y2: 120
      },
      {
        id: 33,
        type: 4e3,
        reference: "",
        labels: [],
        x: 120,
        y: 78,
        x2: 120,
        y2: 120,
        color: "#2f343a"
      },
      {
        id: 34,
        type: 4e3,
        reference: "",
        labels: [],
        x: 120,
        y: 120,
        x2: 81,
        y2: 120,
        color: "#2f343a"
      },
      {
        id: 35,
        type: 4e3,
        reference: "",
        labels: [],
        x: 129,
        y: 78,
        x2: 129,
        y2: 132,
        color: "#2f343a"
      },
      {
        id: 36,
        type: 4e3,
        reference: "",
        labels: [],
        x: 129,
        y: 132,
        x2: 72,
        y2: 132,
        color: "#2f343a"
      },
      {
        id: 37,
        type: 4e3,
        reference: "",
        labels: [],
        x: 138,
        y: 78,
        x2: 138,
        y2: 126,
        color: "#2f343a"
      },
      {
        id: 38,
        type: 4e3,
        reference: "",
        labels: [],
        x: 138,
        y: 126,
        x2: 63,
        y2: 126,
        color: "#2f343a"
      },
      {
        id: 39,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 168,
        x2: 63,
        y2: 182,
        color: "#2f343a"
      },
      {
        id: 40,
        type: 4e3,
        reference: "",
        labels: [],
        x: 63,
        y: 182,
        x2: 72,
        y2: 182,
        color: "#2f343a"
      },
      {
        id: 41,
        type: 4e3,
        reference: "",
        labels: [],
        x: 72,
        y: 172,
        x2: 72,
        y2: 182,
        color: "#2f343a"
      },
      {
        id: 42,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 168,
        x2: 81,
        y2: 182,
        color: "#2f343a"
      },
      {
        id: 43,
        type: 4e3,
        reference: "",
        labels: [],
        x: 81,
        y: 182,
        x2: 72,
        y2: 182,
        color: "#2f343a"
      },
      {
        id: 44,
        type: 4001,
        reference: "",
        labels: [],
        x: 72,
        y: 182,
        x2: 72,
        y2: 182
      },
      {
        id: 45,
        type: 4e3,
        reference: "",
        labels: [],
        x: 90,
        y: 26,
        x2: 160,
        y2: 26,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 46,
        type: 4e3,
        reference: "",
        labels: [],
        x: 160,
        y: 26,
        x2: 160,
        y2: 50,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 47,
        type: 4e3,
        reference: "",
        labels: [],
        x: 160,
        y: 50,
        x2: 160,
        y2: 70,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 48,
        type: 4e3,
        reference: "",
        labels: [],
        x: 160,
        y: 70,
        x2: 160,
        y2: 90,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 49,
        type: 4e3,
        reference: "",
        labels: [],
        x: 160,
        y: 90,
        x2: 160,
        y2: 110,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 50,
        type: 4e3,
        reference: "",
        labels: [],
        x: 160,
        y: 110,
        x2: 160,
        y2: 160,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 51,
        type: 4e3,
        reference: "",
        labels: [],
        x: 160,
        y: 160,
        x2: 84,
        y2: 160,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 52,
        type: 4001,
        reference: "",
        labels: [],
        x: 160,
        y: 50,
        x2: 160,
        y2: 50
      },
      {
        id: 53,
        type: 4e3,
        reference: "",
        labels: [],
        x: 160,
        y: 50,
        x2: 170,
        y2: 50,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 54,
        type: 9100,
        shape: "terminal-diamond",
        reference: "BOT",
        labels: [
          "TP"
        ],
        x: 170,
        y: 50,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "TP",
            x: 170,
            y: 50,
            panel: "BOTONERAS:TP_DER"
          }
        ],
        box: [
          167,
          47,
          173,
          53
        ],
        pins: [
          "TP BOT"
        ]
      },
      {
        id: 55,
        type: 4001,
        reference: "",
        labels: [],
        x: 160,
        y: 70,
        x2: 160,
        y2: 70
      },
      {
        id: 56,
        type: 4e3,
        reference: "",
        labels: [],
        x: 160,
        y: 70,
        x2: 170,
        y2: 70,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 57,
        type: 9100,
        shape: "terminal-diamond",
        reference: "KM1",
        labels: [
          "TP"
        ],
        x: 170,
        y: 70,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "TP",
            x: 170,
            y: 70,
            panel: "CONTACTOR_TERMICO:TP_DER"
          }
        ],
        box: [
          167,
          67,
          173,
          73
        ],
        pins: [
          "TP KM1"
        ]
      },
      {
        id: 58,
        type: 4001,
        reference: "",
        labels: [],
        x: 160,
        y: 90,
        x2: 160,
        y2: 90
      },
      {
        id: 59,
        type: 4e3,
        reference: "",
        labels: [],
        x: 160,
        y: 90,
        x2: 170,
        y2: 90,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 60,
        type: 9100,
        shape: "terminal-diamond",
        reference: "KM2 izq",
        labels: [
          "TP"
        ],
        x: 170,
        y: 90,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "TP",
            x: 170,
            y: 90,
            panel: "CONTACTOR_TRIFASICO:TP_IZQ"
          }
        ],
        box: [
          167,
          87,
          173,
          93
        ],
        pins: [
          "TP KM2 izq"
        ]
      },
      {
        id: 61,
        type: 4001,
        reference: "",
        labels: [],
        x: 160,
        y: 110,
        x2: 160,
        y2: 110
      },
      {
        id: 62,
        type: 4e3,
        reference: "",
        labels: [],
        x: 160,
        y: 110,
        x2: 170,
        y2: 110,
        color: "#2a8a62",
        dashed: true
      },
      {
        id: 63,
        type: 9100,
        shape: "terminal-diamond",
        reference: "KM2 der",
        labels: [
          "TP"
        ],
        x: 170,
        y: 110,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "TP",
            x: 170,
            y: 110,
            panel: "CONTACTOR_TRIFASICO:TP_DER"
          }
        ],
        box: [
          167,
          107,
          173,
          113
        ],
        pins: [
          "TP KM2 der"
        ]
      },
      {
        id: 64,
        type: 9100,
        shape: "terminal-diamond",
        reference: "-X",
        labels: [
          "F"
        ],
        x: 230,
        y: 24,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "F",
            x: 230,
            y: 26,
            panel: "FUENTE:F"
          }
        ],
        box: [
          227,
          21,
          233,
          29
        ],
        pins: [
          "F"
        ]
      },
      {
        id: 65,
        type: 9100,
        shape: "terminal-diamond",
        reference: "",
        labels: [
          "N"
        ],
        x: 555,
        y: 24,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "N",
            x: 555,
            y: 26,
            panel: "FUENTE:N"
          }
        ],
        box: [
          552,
          21,
          558,
          29
        ],
        pins: [
          "N"
        ]
      },
      {
        id: 66,
        type: 9100,
        shape: "f1aux",
        reference: "F1",
        labels: [
          "95",
          "96",
          "97",
          "98"
        ],
        x: 230,
        y: 40,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "95",
            x: 230,
            y: 40,
            panel: "CONTACTOR_TERMICO:95"
          },
          {
            terminal: "96",
            x: 230,
            y: 58,
            panel: "CONTACTOR_TERMICO:96"
          },
          {
            terminal: "97",
            x: 243.5,
            y: 40,
            panel: "CONTACTOR_TERMICO:97"
          },
          {
            terminal: "98",
            x: 243.5,
            y: 58,
            panel: "CONTACTOR_TERMICO:98"
          }
        ],
        box: [
          212,
          39,
          252,
          59
        ]
      },
      {
        id: 67,
        type: 4e3,
        reference: "",
        labels: [],
        x: 230,
        y: 26,
        x2: 230,
        y2: 32,
        color: "#a64a4a"
      },
      {
        id: 68,
        type: 4e3,
        reference: "",
        labels: [],
        x: 230,
        y: 32,
        x2: 230,
        y2: 40,
        color: "#a64a4a"
      },
      {
        id: 69,
        type: 4e3,
        reference: "",
        labels: [],
        x: 230,
        y: 32,
        x2: 243.5,
        y2: 32,
        color: "#a64a4a"
      },
      {
        id: 70,
        type: 4e3,
        reference: "",
        labels: [],
        x: 243.5,
        y: 32,
        x2: 243.5,
        y2: 40,
        color: "#a64a4a"
      },
      {
        id: 71,
        type: 4001,
        reference: "",
        labels: [],
        x: 230,
        y: 32,
        x2: 230,
        y2: 32
      },
      {
        id: 72,
        type: 4e3,
        reference: "",
        labels: [],
        x: 230,
        y: 58,
        x2: 230,
        y2: 70,
        color: "#a64a4a"
      },
      {
        id: 73,
        type: 4001,
        reference: "",
        labels: [],
        x: 230,
        y: 70,
        x2: 230,
        y2: 70
      },
      {
        id: 74,
        type: 4e3,
        reference: "",
        labels: [],
        x: 230,
        y: 70,
        x2: 230,
        y2: 80,
        color: "#a64a4a"
      },
      {
        id: 75,
        type: 9100,
        shape: "push-nc",
        reference: "S2",
        labels: [
          "1",
          "2"
        ],
        x: 230,
        y: 80,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "1",
            x: 230,
            y: 80,
            panel: "BOTONERAS:S2:1"
          },
          {
            terminal: "2",
            x: 230,
            y: 98,
            panel: "BOTONERAS:S2:2"
          }
        ],
        box: [
          206,
          79,
          238,
          99
        ]
      },
      {
        id: 76,
        type: 4e3,
        reference: "",
        labels: [],
        x: 230,
        y: 70,
        x2: 470,
        y2: 70,
        color: "#a64a4a"
      },
      {
        id: 77,
        type: 4e3,
        reference: "",
        labels: [],
        x: 470,
        y: 70,
        x2: 470,
        y2: 80,
        color: "#a64a4a"
      },
      {
        id: 78,
        type: 9100,
        shape: "contact-nc",
        reference: "KM1",
        labels: [
          "81",
          "82"
        ],
        x: 470,
        y: 80,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "81",
            x: 470,
            y: 80,
            panel: "CONTACTOR_TERMICO:81"
          },
          {
            terminal: "82",
            x: 470,
            y: 98,
            panel: "CONTACTOR_TERMICO:82"
          }
        ],
        box: [
          456,
          79,
          478,
          99
        ]
      },
      {
        id: 79,
        type: 4e3,
        reference: "",
        labels: [],
        x: 470,
        y: 98,
        x2: 470,
        y2: 108,
        color: "#a64a4a"
      },
      {
        id: 80,
        type: 9100,
        shape: "contact-nc",
        reference: "KM2",
        labels: [
          "81",
          "82"
        ],
        x: 470,
        y: 108,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "81",
            x: 470,
            y: 108,
            panel: "CONTACTOR_TRIFASICO:81"
          },
          {
            terminal: "82",
            x: 470,
            y: 126,
            panel: "CONTACTOR_TRIFASICO:82"
          }
        ],
        box: [
          456,
          107,
          478,
          127
        ]
      },
      {
        id: 81,
        type: 4e3,
        reference: "",
        labels: [],
        x: 470,
        y: 126,
        x2: 470,
        y2: 136,
        color: "#a64a4a"
      },
      {
        id: 82,
        type: 9100,
        shape: "lamp",
        reference: "P2",
        labels: [
          "X1",
          "X2"
        ],
        x: 470,
        y: 136,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "X1",
            x: 470,
            y: 136,
            panel: "BOTONERAS:PILOTO_2"
          },
          {
            terminal: "X2",
            x: 470,
            y: 154
          }
        ],
        box: [
          454,
          135,
          479,
          155
        ]
      },
      {
        id: 83,
        type: 4e3,
        reference: "",
        labels: [],
        x: 470,
        y: 154,
        x2: 470,
        y2: 235,
        color: "#3d6fae",
        internal: true
      },
      {
        id: 84,
        type: 4e3,
        reference: "",
        labels: [],
        x: 243.5,
        y: 58,
        x2: 243.5,
        y2: 64,
        color: "#a64a4a"
      },
      {
        id: 85,
        type: 4e3,
        reference: "",
        labels: [],
        x: 243.5,
        y: 64,
        x2: 520,
        y2: 64,
        color: "#a64a4a"
      },
      {
        id: 86,
        type: 4e3,
        reference: "",
        labels: [],
        x: 520,
        y: 64,
        x2: 520,
        y2: 70,
        color: "#a64a4a"
      },
      {
        id: 87,
        type: 9100,
        shape: "lamp",
        reference: "P3",
        labels: [
          "X1",
          "X2"
        ],
        x: 520,
        y: 70,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "X1",
            x: 520,
            y: 70,
            panel: "BOTONERAS:PILOTO_3"
          },
          {
            terminal: "X2",
            x: 520,
            y: 88
          }
        ],
        box: [
          504,
          69,
          529,
          89
        ]
      },
      {
        id: 88,
        type: 4e3,
        reference: "",
        labels: [],
        x: 520,
        y: 88,
        x2: 520,
        y2: 235,
        color: "#3d6fae",
        internal: true
      },
      {
        id: 89,
        type: 4e3,
        reference: "",
        labels: [],
        x: 230,
        y: 98,
        x2: 230,
        y2: 108,
        color: "#a64a4a"
      },
      {
        id: 90,
        type: 4001,
        reference: "",
        labels: [],
        x: 230,
        y: 108,
        x2: 230,
        y2: 108
      },
      {
        id: 91,
        type: 4e3,
        reference: "",
        labels: [],
        x: 230,
        y: 108,
        x2: 265,
        y2: 108,
        color: "#a64a4a"
      },
      {
        id: 92,
        type: 4e3,
        reference: "",
        labels: [],
        x: 265,
        y: 108,
        x2: 295,
        y2: 108,
        color: "#a64a4a"
      },
      {
        id: 93,
        type: 4e3,
        reference: "",
        labels: [],
        x: 295,
        y: 108,
        x2: 375,
        y2: 108,
        color: "#a64a4a"
      },
      {
        id: 94,
        type: 4e3,
        reference: "",
        labels: [],
        x: 375,
        y: 108,
        x2: 405,
        y2: 108,
        color: "#a64a4a"
      },
      {
        id: 95,
        type: 4001,
        reference: "",
        labels: [],
        x: 265,
        y: 108,
        x2: 265,
        y2: 108
      },
      {
        id: 96,
        type: 4e3,
        reference: "",
        labels: [],
        x: 265,
        y: 108,
        x2: 265,
        y2: 118,
        color: "#a64a4a"
      },
      {
        id: 97,
        type: 4001,
        reference: "",
        labels: [],
        x: 295,
        y: 108,
        x2: 295,
        y2: 108
      },
      {
        id: 98,
        type: 4e3,
        reference: "",
        labels: [],
        x: 295,
        y: 108,
        x2: 295,
        y2: 118,
        color: "#a64a4a"
      },
      {
        id: 99,
        type: 4001,
        reference: "",
        labels: [],
        x: 375,
        y: 108,
        x2: 375,
        y2: 108
      },
      {
        id: 100,
        type: 4e3,
        reference: "",
        labels: [],
        x: 375,
        y: 108,
        x2: 375,
        y2: 118,
        color: "#a64a4a"
      },
      {
        id: 101,
        type: 4001,
        reference: "",
        labels: [],
        x: 405,
        y: 108,
        x2: 405,
        y2: 108
      },
      {
        id: 102,
        type: 4e3,
        reference: "",
        labels: [],
        x: 405,
        y: 108,
        x2: 405,
        y2: 118,
        color: "#a64a4a"
      },
      {
        id: 103,
        type: 9100,
        shape: "push-no",
        reference: "S1",
        labels: [
          "3",
          "4"
        ],
        x: 265,
        y: 118,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "3",
            x: 265,
            y: 118,
            panel: "BOTONERAS:S1:3"
          },
          {
            terminal: "4",
            x: 265,
            y: 136,
            panel: "BOTONERAS:S1:4"
          }
        ],
        box: [
          241,
          117,
          273,
          137
        ]
      },
      {
        id: 104,
        type: 9100,
        shape: "contact-no",
        reference: "KM1",
        labels: [
          "13",
          "14"
        ],
        x: 295,
        y: 118,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "13",
            x: 295,
            y: 118,
            panel: "CONTACTOR_TERMICO:13"
          },
          {
            terminal: "14",
            x: 295,
            y: 136,
            panel: "CONTACTOR_TERMICO:14"
          }
        ],
        box: [
          281,
          117,
          303,
          137
        ]
      },
      {
        id: 105,
        type: 4e3,
        reference: "",
        labels: [],
        x: 265,
        y: 136,
        x2: 265,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 106,
        type: 4e3,
        reference: "",
        labels: [],
        x: 265,
        y: 146,
        x2: 280,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 107,
        type: 4e3,
        reference: "",
        labels: [],
        x: 295,
        y: 136,
        x2: 295,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 108,
        type: 4e3,
        reference: "",
        labels: [],
        x: 295,
        y: 146,
        x2: 280,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 109,
        type: 4001,
        reference: "",
        labels: [],
        x: 280,
        y: 146,
        x2: 280,
        y2: 146
      },
      {
        id: 110,
        type: 4e3,
        reference: "",
        labels: [],
        x: 280,
        y: 146,
        x2: 280,
        y2: 156,
        color: "#a64a4a"
      },
      {
        id: 111,
        type: 9100,
        shape: "contact-nc",
        reference: "KM2",
        labels: [
          "71",
          "72"
        ],
        x: 280,
        y: 156,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "71",
            x: 280,
            y: 156,
            panel: "CONTACTOR_TRIFASICO:71"
          },
          {
            terminal: "72",
            x: 280,
            y: 174,
            panel: "CONTACTOR_TRIFASICO:72"
          }
        ],
        box: [
          266,
          155,
          288,
          175
        ]
      },
      {
        id: 112,
        type: 4e3,
        reference: "",
        labels: [],
        x: 280,
        y: 174,
        x2: 280,
        y2: 184,
        color: "#a64a4a"
      },
      {
        id: 113,
        type: 4001,
        reference: "",
        labels: [],
        x: 280,
        y: 184,
        x2: 280,
        y2: 184
      },
      {
        id: 114,
        type: 4e3,
        reference: "",
        labels: [],
        x: 280,
        y: 184,
        x2: 280,
        y2: 194,
        color: "#a64a4a"
      },
      {
        id: 115,
        type: 4e3,
        reference: "",
        labels: [],
        x: 280,
        y: 184,
        x2: 310,
        y2: 184,
        color: "#a64a4a"
      },
      {
        id: 116,
        type: 4e3,
        reference: "",
        labels: [],
        x: 310,
        y: 184,
        x2: 310,
        y2: 194,
        color: "#a64a4a"
      },
      {
        id: 117,
        type: 9100,
        shape: "coil",
        reference: "KM1",
        labels: [
          "A1",
          "A2"
        ],
        x: 280,
        y: 194,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "A1",
            x: 280,
            y: 194,
            panel: "CONTACTOR_TERMICO:A1"
          },
          {
            terminal: "A2",
            x: 280,
            y: 212,
            panel: "CONTACTOR_TERMICO:A2"
          }
        ],
        box: [
          264,
          193,
          288,
          213
        ]
      },
      {
        id: 118,
        type: 9100,
        shape: "lamp",
        reference: "P1",
        labels: [
          "X1",
          "X2"
        ],
        x: 310,
        y: 194,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "X1",
            x: 310,
            y: 194,
            panel: "BOTONERAS:PILOTO_1"
          },
          {
            terminal: "X2",
            x: 310,
            y: 212
          }
        ],
        box: [
          294,
          193,
          319,
          213
        ]
      },
      {
        id: 119,
        type: 4e3,
        reference: "",
        labels: [],
        x: 280,
        y: 212,
        x2: 280,
        y2: 235,
        color: "#3d6fae"
      },
      {
        id: 120,
        type: 4e3,
        reference: "",
        labels: [],
        x: 310,
        y: 212,
        x2: 310,
        y2: 235,
        color: "#3d6fae",
        internal: true
      },
      {
        id: 121,
        type: 9100,
        shape: "push-no",
        reference: "S3",
        labels: [
          "3",
          "4"
        ],
        x: 375,
        y: 118,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "3",
            x: 375,
            y: 118,
            panel: "BOTONERAS:S3:3"
          },
          {
            terminal: "4",
            x: 375,
            y: 136,
            panel: "BOTONERAS:S3:4"
          }
        ],
        box: [
          351,
          117,
          383,
          137
        ]
      },
      {
        id: 122,
        type: 9100,
        shape: "contact-no",
        reference: "KM2",
        labels: [
          "13",
          "14"
        ],
        x: 405,
        y: 118,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "13",
            x: 405,
            y: 118,
            panel: "CONTACTOR_TRIFASICO:13"
          },
          {
            terminal: "14",
            x: 405,
            y: 136,
            panel: "CONTACTOR_TRIFASICO:14"
          }
        ],
        box: [
          391,
          117,
          413,
          137
        ]
      },
      {
        id: 123,
        type: 4e3,
        reference: "",
        labels: [],
        x: 375,
        y: 136,
        x2: 375,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 124,
        type: 4e3,
        reference: "",
        labels: [],
        x: 375,
        y: 146,
        x2: 390,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 125,
        type: 4e3,
        reference: "",
        labels: [],
        x: 405,
        y: 136,
        x2: 405,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 126,
        type: 4e3,
        reference: "",
        labels: [],
        x: 405,
        y: 146,
        x2: 390,
        y2: 146,
        color: "#a64a4a"
      },
      {
        id: 127,
        type: 4001,
        reference: "",
        labels: [],
        x: 390,
        y: 146,
        x2: 390,
        y2: 146
      },
      {
        id: 128,
        type: 4e3,
        reference: "",
        labels: [],
        x: 390,
        y: 146,
        x2: 390,
        y2: 156,
        color: "#a64a4a"
      },
      {
        id: 129,
        type: 9100,
        shape: "contact-nc",
        reference: "KM1",
        labels: [
          "71",
          "72"
        ],
        x: 390,
        y: 156,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "71",
            x: 390,
            y: 156,
            panel: "CONTACTOR_TERMICO:71"
          },
          {
            terminal: "72",
            x: 390,
            y: 174,
            panel: "CONTACTOR_TERMICO:72"
          }
        ],
        box: [
          376,
          155,
          398,
          175
        ]
      },
      {
        id: 130,
        type: 4e3,
        reference: "",
        labels: [],
        x: 390,
        y: 174,
        x2: 390,
        y2: 184,
        color: "#a64a4a"
      },
      {
        id: 131,
        type: 4001,
        reference: "",
        labels: [],
        x: 390,
        y: 184,
        x2: 390,
        y2: 184
      },
      {
        id: 132,
        type: 4e3,
        reference: "",
        labels: [],
        x: 390,
        y: 184,
        x2: 390,
        y2: 194,
        color: "#a64a4a"
      },
      {
        id: 133,
        type: 4e3,
        reference: "",
        labels: [],
        x: 390,
        y: 184,
        x2: 420,
        y2: 184,
        color: "#a64a4a"
      },
      {
        id: 134,
        type: 4e3,
        reference: "",
        labels: [],
        x: 420,
        y: 184,
        x2: 420,
        y2: 194,
        color: "#a64a4a"
      },
      {
        id: 135,
        type: 9100,
        shape: "coil",
        reference: "KM2",
        labels: [
          "A1",
          "A2"
        ],
        x: 390,
        y: 194,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "A1",
            x: 390,
            y: 194,
            panel: "CONTACTOR_TRIFASICO:A1"
          },
          {
            terminal: "A2",
            x: 390,
            y: 212,
            panel: "CONTACTOR_TRIFASICO:A2"
          }
        ],
        box: [
          374,
          193,
          398,
          213
        ]
      },
      {
        id: 136,
        type: 9100,
        shape: "lamp",
        reference: "P4",
        labels: [
          "X1",
          "X2"
        ],
        x: 420,
        y: 194,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "X1",
            x: 420,
            y: 194,
            panel: "BOTONERAS:PILOTO_4"
          },
          {
            terminal: "X2",
            x: 420,
            y: 212
          }
        ],
        box: [
          404,
          193,
          429,
          213
        ]
      },
      {
        id: 137,
        type: 4e3,
        reference: "",
        labels: [],
        x: 390,
        y: 212,
        x2: 390,
        y2: 235,
        color: "#3d6fae"
      },
      {
        id: 138,
        type: 4e3,
        reference: "",
        labels: [],
        x: 420,
        y: 212,
        x2: 420,
        y2: 235,
        color: "#3d6fae",
        internal: true
      },
      {
        id: 139,
        type: 4e3,
        reference: "",
        labels: [],
        x: 555,
        y: 26,
        x2: 555,
        y2: 235,
        color: "#3d6fae"
      },
      {
        id: 140,
        type: 9100,
        shape: "terminal-diamond",
        reference: "BOT",
        labels: [
          "N"
        ],
        x: 250,
        y: 235,
        x2: 0,
        y2: 0,
        ports: [
          {
            terminal: "N",
            x: 250,
            y: 235,
            panel: "BOTONERAS:N"
          }
        ],
        box: [
          247,
          232,
          253,
          238
        ],
        pins: [
          "N"
        ],
        ref: true
      },
      {
        id: 141,
        type: 4e3,
        reference: "",
        labels: [],
        x: 250,
        y: 235,
        x2: 280,
        y2: 235,
        color: "#3d6fae"
      },
      {
        id: 142,
        type: 4e3,
        reference: "",
        labels: [],
        x: 280,
        y: 235,
        x2: 310,
        y2: 235,
        color: "#3d6fae"
      },
      {
        id: 143,
        type: 4e3,
        reference: "",
        labels: [],
        x: 310,
        y: 235,
        x2: 390,
        y2: 235,
        color: "#3d6fae"
      },
      {
        id: 144,
        type: 4e3,
        reference: "",
        labels: [],
        x: 390,
        y: 235,
        x2: 420,
        y2: 235,
        color: "#3d6fae"
      },
      {
        id: 145,
        type: 4e3,
        reference: "",
        labels: [],
        x: 420,
        y: 235,
        x2: 470,
        y2: 235,
        color: "#3d6fae"
      },
      {
        id: 146,
        type: 4e3,
        reference: "",
        labels: [],
        x: 470,
        y: 235,
        x2: 520,
        y2: 235,
        color: "#3d6fae"
      },
      {
        id: 147,
        type: 4e3,
        reference: "",
        labels: [],
        x: 520,
        y: 235,
        x2: 555,
        y2: 235,
        color: "#3d6fae"
      },
      {
        id: 148,
        type: 4001,
        reference: "",
        labels: [],
        x: 280,
        y: 235,
        x2: 280,
        y2: 235
      },
      {
        id: 149,
        type: 4001,
        reference: "",
        labels: [],
        x: 310,
        y: 235,
        x2: 310,
        y2: 235
      },
      {
        id: 150,
        type: 4001,
        reference: "",
        labels: [],
        x: 390,
        y: 235,
        x2: 390,
        y2: 235
      },
      {
        id: 151,
        type: 4001,
        reference: "",
        labels: [],
        x: 420,
        y: 235,
        x2: 420,
        y2: 235
      },
      {
        id: 152,
        type: 4001,
        reference: "",
        labels: [],
        x: 470,
        y: 235,
        x2: 470,
        y2: 235
      },
      {
        id: 153,
        type: 4001,
        reference: "",
        labels: [],
        x: 520,
        y: 235,
        x2: 520,
        y2: 235
      },
      {
        id: 154,
        type: 4001,
        reference: "",
        labels: [],
        x: 555,
        y: 235,
        x2: 555,
        y2: 235
      }
    ],
    views: {
      all: {
        x: 34,
        y: 10,
        w: 545,
        h: 248
      },
      power: {
        x: 34,
        y: 14,
        w: 150,
        h: 176
      },
      control: {
        x: 196,
        y: 14,
        w: 388,
        h: 240
      }
    }
  }
};

// src/data/cadeEstrellaTemporizador.json
var cadeEstrellaTemporizador_default = { name: "ESTRELLA-TRI\xC1NGULO CON TEMPORIZADOR", source: "Redibujado al estilo de CADe_SIMU a partir del montaje con temporizador (KT1) y del dibujo \xABCAMBIO DELTA, ESTRELLA\xBB; no es una copia de un archivo .cad", origin: "lesson", frame: { left: 30, top: 12, right: 539, bottom: 270, header: 5, band: 4, columns: { first: 31, width: 63.5, letters: "ABCDEFGH" }, rows: { first: 18, height: 60, count: 4 } }, views: { all: { x: 20, y: 6, w: 535, h: 272 }, power: { x: 26, y: 8, w: 190, h: 222 }, control: { x: 238, y: 8, w: 285, h: 250 } }, splitX: 225, objects: [{ id: 1, type: 9100, shape: "terminal-round", reference: "-X", labels: ["L1", "L2", "L3", "PE"], x: 63, y: 24, x2: 0, y2: 0, ports: [{ terminal: "L1", x: 63, y: 26 }, { terminal: "L2", x: 72, y: 26 }, { terminal: "L3", x: 81, y: 26 }, { terminal: "PE", x: 90, y: 26 }], box: [54, 18, 94, 27], pins: ["L1", "L2", "L3", "PE"] }, { id: 2, type: 9100, shape: "breaker3", reference: "Q1", labels: ["1", "3", "5", "2", "4", "6"], x: 63, y: 45, x2: 0, y2: 0, ports: [{ terminal: "1", x: 63, y: 45 }, { terminal: "3", x: 72, y: 45 }, { terminal: "5", x: 81, y: 45 }, { terminal: "2", x: 63, y: 69 }, { terminal: "4", x: 72, y: 69 }, { terminal: "6", x: 81, y: 69 }], box: [44, 43, 88, 71] }, { id: 3, type: 9100, shape: "contactor3", reference: "KM1", labels: ["1", "3", "5", "2", "4", "6"], x: 63, y: 96, x2: 0, y2: 0, ports: [{ terminal: "1", x: 63, y: 96 }, { terminal: "3", x: 72, y: 96 }, { terminal: "5", x: 81, y: 96 }, { terminal: "2", x: 63, y: 114 }, { terminal: "4", x: 72, y: 114 }, { terminal: "6", x: 81, y: 114 }], box: [52, 95, 86, 115] }, { id: 4, type: 9100, shape: "thermal3", reference: "F1", labels: ["1", "3", "5", "2", "4", "6"], x: 63, y: 137, x2: 0, y2: 0, ports: [{ terminal: "1", x: 63, y: 137 }, { terminal: "3", x: 72, y: 137 }, { terminal: "5", x: 81, y: 137 }, { terminal: "2", x: 63, y: 146 }, { terminal: "4", x: 72, y: 146 }, { terminal: "6", x: 81, y: 146 }], box: [50, 134, 88, 149] }, { id: 5, type: 9100, shape: "motor", reference: "M1", labels: ["U1", "V1", "W1", "W2", "U2", "V2", "PE"], x: 72, y: 184, x2: 0, y2: 0, ports: [{ terminal: "U1", x: 63, y: 176 }, { terminal: "V1", x: 72, y: 172 }, { terminal: "W1", x: 81, y: 176 }, { terminal: "W2", x: 63, y: 192 }, { terminal: "U2", x: 72, y: 196 }, { terminal: "V2", x: 81, y: 192 }, { terminal: "PE", x: 84, y: 184 }], box: [56, 168, 92, 200] }, { id: 6, type: 9100, shape: "contactor3", reference: "KM3", labels: ["1", "3", "5", "2", "4", "6"], x: 117, y: 111, x2: 0, y2: 0, ports: [{ terminal: "1", x: 117, y: 111 }, { terminal: "3", x: 126, y: 111 }, { terminal: "5", x: 135, y: 111 }, { terminal: "2", x: 117, y: 129 }, { terminal: "4", x: 126, y: 129 }, { terminal: "6", x: 135, y: 129 }], box: [105, 110, 140, 130], pitch: 9 }, { id: 7, type: 9100, shape: "contactor3", reference: "KM2", labels: ["1", "3", "5", "2", "4", "6"], x: 165, y: 111, x2: 0, y2: 0, ports: [{ terminal: "1", x: 165, y: 111 }, { terminal: "3", x: 174, y: 111 }, { terminal: "5", x: 183, y: 111 }, { terminal: "2", x: 165, y: 129 }, { terminal: "4", x: 174, y: 129 }, { terminal: "6", x: 183, y: 129 }], box: [153, 110, 188, 130], pitch: 9 }, { id: 8, type: 4e3, reference: "", labels: [], x: 63, y: 26, x2: 63, y2: 45, color: "#2f343a" }, { id: 9, type: 4e3, reference: "", labels: [], x: 72, y: 26, x2: 72, y2: 45, color: "#2f343a" }, { id: 10, type: 4e3, reference: "", labels: [], x: 81, y: 26, x2: 81, y2: 45, color: "#2f343a" }, { id: 11, type: 4e3, reference: "", labels: [], x: 90, y: 26, x2: 90, y2: 184, color: "#2f343a", dashed: true }, { id: 12, type: 4e3, reference: "", labels: [], x: 90, y: 184, x2: 84, y2: 184, color: "#2f343a" }, { id: 13, type: 4e3, reference: "", labels: [], x: 63, y: 69, x2: 63, y2: 96, color: "#2f343a" }, { id: 14, type: 4e3, reference: "", labels: [], x: 63, y: 114, x2: 63, y2: 137, color: "#2f343a" }, { id: 15, type: 4e3, reference: "", labels: [], x: 72, y: 69, x2: 72, y2: 96, color: "#2f343a" }, { id: 16, type: 4e3, reference: "", labels: [], x: 72, y: 114, x2: 72, y2: 137, color: "#2f343a" }, { id: 17, type: 4e3, reference: "", labels: [], x: 81, y: 69, x2: 81, y2: 96, color: "#2f343a" }, { id: 18, type: 4e3, reference: "", labels: [], x: 81, y: 114, x2: 81, y2: 137, color: "#2f343a" }, { id: 19, type: 4e3, reference: "", labels: [], x: 63, y: 146, x2: 63, y2: 176, color: "#2f343a" }, { id: 20, type: 4e3, reference: "", labels: [], x: 72, y: 146, x2: 72, y2: 172, color: "#2f343a" }, { id: 21, type: 4e3, reference: "", labels: [], x: 81, y: 146, x2: 81, y2: 176, color: "#2f343a" }, { id: 22, type: 4001, reference: "", labels: [], x: 63, y: 78, x2: 63, y2: 78 }, { id: 23, type: 4001, reference: "", labels: [], x: 72, y: 87, x2: 72, y2: 87 }, { id: 24, type: 4001, reference: "", labels: [], x: 81, y: 90, x2: 81, y2: 90 }, { id: 25, type: 4e3, reference: "", labels: [], x: 63, y: 78, x2: 117, y2: 78, color: "#2f343a" }, { id: 26, type: 4e3, reference: "", labels: [], x: 117, y: 78, x2: 117, y2: 111, color: "#2f343a" }, { id: 27, type: 4e3, reference: "", labels: [], x: 72, y: 87, x2: 126, y2: 87, color: "#2f343a" }, { id: 28, type: 4e3, reference: "", labels: [], x: 126, y: 87, x2: 126, y2: 111, color: "#2f343a" }, { id: 29, type: 4e3, reference: "", labels: [], x: 81, y: 90, x2: 135, y2: 90, color: "#2f343a" }, { id: 30, type: 4e3, reference: "", labels: [], x: 135, y: 90, x2: 135, y2: 111, color: "#2f343a" }, { id: 31, type: 4e3, reference: "", labels: [], x: 165, y: 111, x2: 165, y2: 104, color: "#2f343a" }, { id: 32, type: 4e3, reference: "", labels: [], x: 174, y: 111, x2: 174, y2: 104, color: "#2f343a" }, { id: 33, type: 4e3, reference: "", labels: [], x: 183, y: 111, x2: 183, y2: 104, color: "#2f343a" }, { id: 34, type: 4e3, reference: "", labels: [], x: 165, y: 104, x2: 183, y2: 104, color: "#2f343a" }, { id: 35, type: 4001, reference: "", labels: [], x: 174, y: 104, x2: 174, y2: 104 }, { id: 36, type: 4e3, reference: "", labels: [], x: 81, y: 192, x2: 81, y2: 201, color: "#2f343a" }, { id: 37, type: 4e3, reference: "", labels: [], x: 81, y: 201, x2: 165, y2: 201, color: "#2f343a" }, { id: 38, type: 4e3, reference: "", labels: [], x: 72, y: 196, x2: 72, y2: 207, color: "#2f343a" }, { id: 39, type: 4e3, reference: "", labels: [], x: 72, y: 207, x2: 174, y2: 207, color: "#2f343a" }, { id: 40, type: 4e3, reference: "", labels: [], x: 63, y: 192, x2: 63, y2: 213, color: "#2f343a" }, { id: 41, type: 4e3, reference: "", labels: [], x: 63, y: 213, x2: 183, y2: 213, color: "#2f343a" }, { id: 42, type: 4e3, reference: "", labels: [], x: 117, y: 129, x2: 117, y2: 201, color: "#2f343a" }, { id: 43, type: 4e3, reference: "", labels: [], x: 126, y: 129, x2: 126, y2: 207, color: "#2f343a" }, { id: 44, type: 4e3, reference: "", labels: [], x: 135, y: 129, x2: 135, y2: 213, color: "#2f343a" }, { id: 45, type: 4e3, reference: "", labels: [], x: 165, y: 129, x2: 165, y2: 201, color: "#2f343a" }, { id: 46, type: 4e3, reference: "", labels: [], x: 174, y: 129, x2: 174, y2: 207, color: "#2f343a" }, { id: 47, type: 4e3, reference: "", labels: [], x: 183, y: 129, x2: 183, y2: 213, color: "#2f343a" }, { id: 48, type: 4001, reference: "", labels: [], x: 117, y: 201, x2: 117, y2: 201 }, { id: 49, type: 4001, reference: "", labels: [], x: 126, y: 207, x2: 126, y2: 207 }, { id: 50, type: 4001, reference: "", labels: [], x: 135, y: 213, x2: 135, y2: 213 }, { id: 51, type: 9100, shape: "terminal-diamond", reference: "-X", labels: ["L"], x: 339, y: 24, x2: 0, y2: 0, ports: [{ terminal: "L", x: 339, y: 26 }], box: [330, 18, 342, 28], pins: ["L"], ref: true }, { id: 52, type: 9100, shape: "terminal-diamond", reference: "", labels: ["N"], x: 351, y: 24, x2: 0, y2: 0, ports: [{ terminal: "N", x: 351, y: 26 }], box: [348, 18, 354, 28], pins: ["N"] }, { id: 53, type: 9100, shape: "breaker1", reference: "-Q", labels: ["1", "2"], x: 339, y: 42, x2: 0, y2: 0, ports: [{ terminal: "1", x: 339, y: 42 }, { terminal: "2", x: 339, y: 67.5 }], box: [315, 41, 347, 69] }, { id: 54, type: 9100, shape: "f1aux", reference: "F1", labels: ["95", "96", "97", "98"], x: 339, y: 81, x2: 0, y2: 0, ports: [{ terminal: "95", x: 339, y: 81 }, { terminal: "96", x: 339, y: 99 }, { terminal: "97", x: 352.5, y: 81 }, { terminal: "98", x: 352.5, y: 99 }], box: [321, 80, 360.5, 100] }, { id: 55, type: 9100, shape: "push-nc", reference: "SB1", labels: ["11", "12"], x: 305, y: 105, x2: 0, y2: 0, ports: [{ terminal: "11", x: 305, y: 105 }, { terminal: "12", x: 305, y: 123 }], box: [281, 104, 313, 124] }, { id: 56, type: 9100, shape: "push-no", reference: "SB2", labels: ["13", "14"], x: 305, y: 135, x2: 0, y2: 0, ports: [{ terminal: "13", x: 305, y: 135 }, { terminal: "14", x: 305, y: 153 }], box: [281, 134, 313, 154] }, { id: 57, type: 9100, shape: "contact-no", reference: "KM1", labels: ["13", "14"], x: 331, y: 135, x2: 0, y2: 0, ports: [{ terminal: "13", x: 331, y: 135 }, { terminal: "14", x: 331, y: 153 }], box: [317, 134, 339, 154] }, { id: 63, type: 9100, shape: "coil", reference: "KM1", labels: ["A1", "A2"], x: 305, y: 198, x2: 0, y2: 0, ports: [{ terminal: "A1", x: 305, y: 198 }, { terminal: "A2", x: 305, y: 216 }], box: [289, 197, 313, 217] }, { id: 70, type: 4e3, reference: "", labels: [], x: 339, y: 26, x2: 339, y2: 42, color: "#a64a4a" }, { id: 71, type: 4e3, reference: "", labels: [], x: 339, y: 67.5, x2: 339, y2: 75, color: "#a64a4a" }, { id: 72, type: 4001, reference: "", labels: [], x: 339, y: 75, x2: 339, y2: 75 }, { id: 77, type: 4e3, reference: "", labels: [], x: 339, y: 75, x2: 339, y2: 81, color: "#a64a4a" }, { id: 78, type: 4e3, reference: "", labels: [], x: 339, y: 75, x2: 352.5, y2: 75, color: "#a64a4a" }, { id: 79, type: 4e3, reference: "", labels: [], x: 352.5, y: 75, x2: 352.5, y2: 81, color: "#a64a4a" }, { id: 80, type: 4e3, reference: "", labels: [], x: 339, y: 99, x2: 305, y2: 99, color: "#a64a4a" }, { id: 81, type: 4e3, reference: "", labels: [], x: 305, y: 99, x2: 305, y2: 105, color: "#a64a4a" }, { id: 85, type: 4e3, reference: "", labels: [], x: 305, y: 123, x2: 305, y2: 129, color: "#a64a4a" }, { id: 86, type: 4001, reference: "", labels: [], x: 305, y: 129, x2: 305, y2: 129 }, { id: 87, type: 4e3, reference: "", labels: [], x: 305, y: 129, x2: 305, y2: 135, color: "#a64a4a" }, { id: 88, type: 4e3, reference: "", labels: [], x: 305, y: 153, x2: 305, y2: 156, color: "#a64a4a" }, { id: 89, type: 4001, reference: "", labels: [], x: 305, y: 156, x2: 305, y2: 156 }, { id: 90, type: 4e3, reference: "", labels: [], x: 305, y: 129, x2: 331, y2: 129, color: "#a64a4a" }, { id: 91, type: 4e3, reference: "", labels: [], x: 331, y: 129, x2: 331, y2: 135, color: "#a64a4a" }, { id: 92, type: 4e3, reference: "", labels: [], x: 331, y: 153, x2: 331, y2: 156, color: "#a64a4a" }, { id: 93, type: 4e3, reference: "", labels: [], x: 331, y: 156, x2: 305, y2: 156, color: "#a64a4a" }, { id: 94, type: 4e3, reference: "", labels: [], x: 305, y: 156, x2: 305, y2: 165, color: "#a64a4a" }, { id: 95, type: 4001, reference: "", labels: [], x: 305, y: 165, x2: 305, y2: 165 }, { id: 96, type: 4e3, reference: "", labels: [], x: 305, y: 165, x2: 305, y2: 198, color: "#a64a4a" }, { id: 97, type: 4e3, reference: "", labels: [], x: 305, y: 216, x2: 305, y2: 249, color: "#3d6fae" }, { id: 200, type: 4e3, reference: "", labels: [], x: 339, y: 75, x2: 250, y2: 75, color: "#a64a4a" }, { id: 201, type: 4e3, reference: "", labels: [], x: 352.5, y: 99, x2: 490, y2: 99, color: "#a64a4a" }, { id: 202, type: 4e3, reference: "", labels: [], x: 490, y: 99, x2: 490, y2: 166, color: "#a64a4a" }, { id: 203, type: 4e3, reference: "", labels: [], x: 490, y: 184, x2: 490, y2: 249, color: "#a64a4a" }, { id: 204, type: 9100, shape: "contact-nc", reference: "KM1", labels: ["81", "82"], x: 250, y: 90, x2: 0, y2: 0, ports: [{ terminal: "81", x: 250, y: 90 }, { terminal: "82", x: 250, y: 108 }], box: [236, 89, 258, 109] }, { id: 205, type: 4e3, reference: "", labels: [], x: 250, y: 75, x2: 250, y2: 90, color: "#a64a4a" }, { id: 206, type: 4e3, reference: "", labels: [], x: 250, y: 108, x2: 250, y2: 118, color: "#a64a4a" }, { id: 207, type: 9100, shape: "contact-nc", reference: "KM2", labels: ["81", "82"], x: 250, y: 118, x2: 0, y2: 0, ports: [{ terminal: "81", x: 250, y: 118 }, { terminal: "82", x: 250, y: 136 }], box: [236, 117, 258, 137] }, { id: 208, type: 4e3, reference: "", labels: [], x: 250, y: 136, x2: 250, y2: 146, color: "#a64a4a" }, { id: 209, type: 9100, shape: "contact-nc", reference: "KM3", labels: ["81", "82"], x: 250, y: 146, x2: 0, y2: 0, ports: [{ terminal: "81", x: 250, y: 146 }, { terminal: "82", x: 250, y: 164 }], box: [236, 145, 258, 165] }, { id: 210, type: 4e3, reference: "", labels: [], x: 250, y: 164, x2: 250, y2: 174, color: "#a64a4a" }, { id: 211, type: 9100, shape: "lamp", reference: "H2", labels: ["X1", "X2"], x: 250, y: 174, x2: 0, y2: 0, ports: [{ terminal: "X1", x: 250, y: 174 }, { terminal: "X2", x: 250, y: 192 }], box: [234, 173, 259, 193] }, { id: 212, type: 4e3, reference: "", labels: [], x: 250, y: 192, x2: 250, y2: 249, color: "#a64a4a" }, { id: 213, type: 4001, reference: "", labels: [], x: 305, y: 186, x2: 305, y2: 186 }, { id: 214, type: 4e3, reference: "", labels: [], x: 305, y: 186, x2: 272, y2: 186, color: "#a64a4a" }, { id: 215, type: 4e3, reference: "", labels: [], x: 272, y: 186, x2: 272, y2: 190, color: "#a64a4a" }, { id: 216, type: 9100, shape: "lamp", reference: "H1", labels: ["X1", "X2"], x: 272, y: 190, x2: 0, y2: 0, ports: [{ terminal: "X1", x: 272, y: 190 }, { terminal: "X2", x: 272, y: 208 }], box: [256, 189, 281, 209] }, { id: 217, type: 4e3, reference: "", labels: [], x: 272, y: 208, x2: 272, y2: 249, color: "#a64a4a" }, { id: 218, type: 9100, shape: "lamp", reference: "H3", labels: ["X1", "X2"], x: 490, y: 166, x2: 0, y2: 0, ports: [{ terminal: "X1", x: 490, y: 166 }, { terminal: "X2", x: 490, y: 184 }], box: [474, 165, 499, 185] }, { id: 219, type: 4e3, reference: "", labels: [], x: 305, y: 165, x2: 440, y2: 165, color: "#a64a4a" }, { id: 220, type: 4001, reference: "", labels: [], x: 345, y: 165, x2: 345, y2: 165 }, { id: 221, type: 4e3, reference: "", labels: [], x: 345, y: 165, x2: 345, y2: 198, color: "#a64a4a" }, { id: 222, type: 9100, shape: "coil-timer", reference: "KT1", labels: ["A1", "A2"], x: 345, y: 198, x2: 0, y2: 0, ports: [{ terminal: "A1", x: 345, y: 198 }, { terminal: "A2", x: 345, y: 216 }], box: [325, 197, 357, 217] }, { id: 223, type: 4e3, reference: "", labels: [], x: 345, y: 216, x2: 345, y2: 249, color: "#a64a4a" }, { id: 224, type: 4001, reference: "", labels: [], x: 390, y: 165, x2: 390, y2: 165 }, { id: 225, type: 4e3, reference: "", labels: [], x: 390, y: 165, x2: 390, y2: 174, color: "#a64a4a" }, { id: 226, type: 9100, shape: "contact-nc-timed", reference: "KT1", labels: ["55", "56"], x: 390, y: 174, x2: 0, y2: 0, ports: [{ terminal: "55", x: 390, y: 174 }, { terminal: "56", x: 390, y: 192 }], box: [364, 173, 398, 193] }, { id: 227, type: 4e3, reference: "", labels: [], x: 390, y: 192, x2: 390, y2: 201, color: "#a64a4a" }, { id: 228, type: 9100, shape: "contact-nc", reference: "KM3", labels: ["71", "72"], x: 390, y: 201, x2: 0, y2: 0, ports: [{ terminal: "71", x: 390, y: 201 }, { terminal: "72", x: 390, y: 219 }], box: [376, 200, 398, 220] }, { id: 229, type: 4e3, reference: "", labels: [], x: 390, y: 219, x2: 390, y2: 222, color: "#a64a4a" }, { id: 230, type: 9100, shape: "coil", reference: "KM2", labels: ["A1", "A2"], x: 390, y: 222, x2: 0, y2: 0, ports: [{ terminal: "A1", x: 390, y: 222 }, { terminal: "A2", x: 390, y: 240 }], box: [374, 221, 398, 241] }, { id: 231, type: 4e3, reference: "", labels: [], x: 390, y: 240, x2: 390, y2: 249, color: "#a64a4a" }, { id: 232, type: 4001, reference: "", labels: [], x: 440, y: 165, x2: 440, y2: 165 }, { id: 233, type: 4e3, reference: "", labels: [], x: 440, y: 165, x2: 440, y2: 174, color: "#a64a4a" }, { id: 234, type: 9100, shape: "contact-no-timed", reference: "KT1", labels: ["67", "68"], x: 440, y: 174, x2: 0, y2: 0, ports: [{ terminal: "67", x: 440, y: 174 }, { terminal: "68", x: 440, y: 192 }], box: [414, 173, 448, 193] }, { id: 235, type: 4e3, reference: "", labels: [], x: 440, y: 192, x2: 440, y2: 201, color: "#a64a4a" }, { id: 236, type: 9100, shape: "contact-nc", reference: "KM2", labels: ["71", "72"], x: 440, y: 201, x2: 0, y2: 0, ports: [{ terminal: "71", x: 440, y: 201 }, { terminal: "72", x: 440, y: 219 }], box: [426, 200, 448, 220] }, { id: 237, type: 4e3, reference: "", labels: [], x: 440, y: 219, x2: 440, y2: 222, color: "#a64a4a" }, { id: 238, type: 9100, shape: "coil", reference: "KM3", labels: ["A1", "A2"], x: 440, y: 222, x2: 0, y2: 0, ports: [{ terminal: "A1", x: 440, y: 222 }, { terminal: "A2", x: 440, y: 240 }], box: [424, 221, 448, 241] }, { id: 239, type: 4e3, reference: "", labels: [], x: 440, y: 240, x2: 440, y2: 249, color: "#a64a4a" }, { id: 240, type: 4e3, reference: "", labels: [], x: 351, y: 26, x2: 351, y2: 36, color: "#3d6fae" }, { id: 241, type: 4e3, reference: "", labels: [], x: 351, y: 36, x2: 510, y2: 36, color: "#3d6fae" }, { id: 242, type: 4e3, reference: "", labels: [], x: 510, y: 36, x2: 510, y2: 249, color: "#3d6fae" }, { id: 243, type: 4e3, reference: "", labels: [], x: 250, y: 249, x2: 510, y2: 249, color: "#3d6fae" }, { id: 244, type: 4001, reference: "", labels: [], x: 250, y: 249, x2: 250, y2: 249 }, { id: 245, type: 4001, reference: "", labels: [], x: 272, y: 249, x2: 272, y2: 249 }, { id: 246, type: 4001, reference: "", labels: [], x: 305, y: 249, x2: 305, y2: 249 }, { id: 247, type: 4001, reference: "", labels: [], x: 345, y: 249, x2: 345, y2: 249 }, { id: 248, type: 4001, reference: "", labels: [], x: 390, y: 249, x2: 390, y2: 249 }, { id: 249, type: 4001, reference: "", labels: [], x: 440, y: 249, x2: 440, y2: 249 }, { id: 250, type: 4001, reference: "", labels: [], x: 490, y: 249, x2: 490, y2: 249 }] };

// src/data/starPanelMap.ts
var K1 = "CONTACTOR_TERMICO:";
var K2 = "CONTACTOR_TRIFASICO:";
var K3 = "CONTACTOR_TRIFASICO_3:";
var BT = "BOTONERAS:";
var KT = "TEMPORIZADOR_1:";
var seq = (prefix, terminals, names) => Object.fromEntries(terminals.map((t, i) => [t, prefix + names[i]]));
var power = (prefix, outs) => ({ ...seq(prefix, ["1", "3", "5"], ["L1", "L2", "L3"]), ...seq(prefix, outs, ["T1", "T2", "T3"]) });
var common = () => ({
  2: { "2": "FUENTE:R", "4": "FUENTE:S", "6": "FUENTE:T" },
  3: seq(K1, ["1", "3", "5"], ["L1", "L2", "L3"]),
  4: seq(K1, ["2", "4", "6"], ["T1", "T2", "T3"]),
  5: { U1: "BORNERA_MOTOR:U1", V1: "BORNERA_MOTOR:V1", W1: "BORNERA_MOTOR:W1", W2: "BORNERA_MOTOR:W2", U2: "BORNERA_MOTOR:U2", V2: "BORNERA_MOTOR:V2", PE: "BORNERA_MOTOR:TP" },
  52: { N: "FUENTE:N" },
  53: { "2": "FUENTE:F" },
  54: seq(K1, ["95", "96", "97", "98"], ["95", "96", "97", "98"]),
  55: { "11": BT + "S2:1", "12": BT + "S2:2" },
  56: { "13": BT + "S1:3", "14": BT + "S1:4" },
  57: seq(K1, ["13", "14"], ["13", "14"]),
  63: seq(K1, ["A1", "A2"], ["A1", "A2"])
});
var manual = () => ({
  ...common(),
  6: power(K2, ["6", "4", "2"]),
  7: power(K3, ["2", "4", "6"]),
  58: seq(BT + "S3:", ["11", "12", "13", "14"], ["1", "2", "3", "4"]),
  59: seq(K2, ["11", "12"], ["71", "72"]),
  60: { "13": K2 + "13", "12": K2 + "14" },
  61: seq(K3, ["11", "12"], ["71", "72"]),
  62: seq(K1, ["11", "12"], ["71", "72"]),
  64: seq(K3, ["A1", "A2"], ["A1", "A2"]),
  65: seq(K2, ["A1", "A2"], ["A1", "A2"]),
  66: { X1: BT + "PILOTO_2", X2: BT + "N" },
  67: { X1: BT + "PILOTO_1", X2: BT + "N" },
  68: { X1: BT + "PILOTO_4", X2: BT + "N" },
  69: { X1: BT + "PILOTO_3", X2: BT + "N" }
});
var timer = () => ({
  ...common(),
  6: power(K3, ["6", "4", "2"]),
  7: power(K2, ["2", "4", "6"]),
  204: seq(K1, ["81", "82"], ["81", "82"]),
  207: seq(K2, ["81", "82"], ["81", "82"]),
  209: seq(K3, ["81", "82"], ["81", "82"]),
  211: { X1: BT + "PILOTO_2", X2: BT + "N" },
  216: { X1: BT + "PILOTO_1", X2: BT + "N" },
  218: { X1: BT + "PILOTO_3", X2: BT + "N" },
  222: seq(KT, ["A1", "A2"], ["A1", "A2"]),
  226: seq(KT, ["55", "56"], ["55", "56"]),
  234: seq(KT, ["67", "68"], ["67", "68"]),
  228: seq(K3, ["71", "72"], ["71", "72"]),
  236: seq(K2, ["71", "72"], ["71", "72"]),
  230: seq(K2, ["A1", "A2"], ["A1", "A2"]),
  238: seq(K3, ["A1", "A2"], ["A1", "A2"])
});
var STAR_PANELS = { estrellaManual: manual(), estrellaTimer: timer() };

// src/data/cade.ts
var WIRE_TYPES = [4e3, 4009, 4010];
var onLine = (p, w) => Math.abs((w.x2 - w.x) * (p.y - w.y) - (w.y2 - w.y) * (p.x - w.x)) < 1e-3 && p.x >= Math.min(w.x, w.x2) && p.x <= Math.max(w.x, w.x2) && p.y >= Math.min(w.y, w.y2) && p.y <= Math.max(w.y, w.y2);
function cadePorts(o) {
  const port2 = (terminal, x, y) => ({ objectId: o.id, reference: o.reference, terminal, x, y });
  if (o.ports) return o.ports.map((p) => ({ ...port2(p.terminal, p.x, p.y), ...p.panel ? { panel: p.panel } : {} }));
  if ([6009, 2001, 6007].includes(o.type)) {
    const h = o.type === 6009 ? 21 : 12;
    return [0, 1, 2].flatMap((i) => [port2(o.labels[i], o.x + i * 6, o.y), port2(o.labels[i + 3], o.x + i * 6, o.y + h)]);
  }
  if (o.type === 1001) return [0, 1, 2].flatMap((i) => [port2(o.labels[i], o.x + i * 6, o.y), port2(o.labels[i + 4], o.x + i * 6, o.y + 24)]).concat(port2("PE", o.x + 18, o.y));
  if (o.type === 3004) return [0, 1, 2].map((i) => port2(["L1", "L2", "L3"][i], o.x + i * 6, o.y));
  if ([3e3, 3001, 3002].includes(o.type)) return [port2(o.type === 3e3 ? "L" : o.type === 3001 ? "N" : "PE", o.x, o.y)];
  if (o.type === 8018) return [port2(o.labels[0], o.x, o.y), port2(o.labels[2], o.x, o.y + 12), port2(o.labels[1], o.x + 9, o.y), port2(o.labels[3], o.x + 9, o.y + 12)];
  return [port2(o.labels[0], o.x, o.y), port2(o.labels[1], o.x, o.y + (o.type === 6010 ? 21 : 12))];
}
function createCade(drawing) {
  const objects = drawing.objects;
  const WIRES = objects.filter((o) => WIRE_TYPES.includes(o.type));
  const SYMBOLS = objects.filter((o) => ![...WIRE_TYPES, 4001, 2e4].includes(o.type));
  const JUNCTIONS = objects.filter((o) => o.type === 4001);
  const PORTS = SYMBOLS.flatMap(cadePorts);
  function network(wireId) {
    const seed = WIRES.find((w) => w.id === wireId);
    if (!seed) return { wires: [], ports: [] };
    const included = /* @__PURE__ */ new Set([seed.id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const w of WIRES) {
        if (included.has(w.id)) continue;
        const joined = WIRES.filter((a) => included.has(a.id)).some((a) => onLine({ x: w.x, y: w.y }, a) || onLine({ x: w.x2, y: w.y2 }, a) || onLine({ x: a.x, y: a.y }, w) || onLine({ x: a.x2, y: a.y2 }, w) || JUNCTIONS.some((p) => onLine(p, a) && onLine(p, w)));
        if (joined) {
          included.add(w.id);
          changed = true;
        }
      }
    }
    const wires = WIRES.filter((w) => included.has(w.id));
    const unique = /* @__PURE__ */ new Map();
    for (const p of PORTS) if (wires.some((w) => onLine(p, w))) unique.set(drawing.origin ? `${p.reference}:${p.terminal}:${p.x},${p.y}` : `${p.reference}:${p.terminal}`, p);
    return { wires, ports: [...unique.values()] };
  }
  return { drawing, WIRES, SYMBOLS, JUNCTIONS, PORTS, network, ports: cadePorts };
}
var PERFECTO_CADE = createCade(cadePerfecto_default);
var CADE = cadePerfecto_default;
var CADE_WIRES = PERFECTO_CADE.WIRES;
var CADE_SYMBOLS = PERFECTO_CADE.SYMBOLS;
var CADE_JUNCTIONS = PERFECTO_CADE.JUNCTIONS;
var CADE_PORTS = PERFECTO_CADE.PORTS;
var cadeNetwork = PERFECTO_CADE.network;
var ESTRELLA_CADE = createCade(cadeEstrellaTriangulo_default);
var withPanels = (drawing, map) => ({ ...drawing, objects: drawing.objects.map((o) => o.ports && map[o.id] ? { ...o, ports: o.ports.map((p) => map[o.id][p.terminal] ? { ...p, panel: map[o.id][p.terminal] } : p) } : o) });
var manualWiring = (d) => {
  const old = d.objects.find((o) => o.id === 100 && o.type === 4e3);
  if (!old) return d;
  const w = (id, x, y, x2, y2) => ({ id, type: 4e3, reference: "", labels: [], x, y, x2, y2, color: old.color });
  return { ...d, objects: [...d.objects.filter((o) => o !== old), { id: 300, type: 4001, reference: "", labels: [], x: 331, y: 129, x2: 331, y2: 129 }, w(301, 331, 129, 366, 129), w(302, 366, 129, 366, 168), w(303, 366, 168, 344, 168), w(304, 344, 168, 344, 174)] };
};
var LESSON_CADES = {
  simple: createCade(cadeLecciones_default.simple),
  inversion: createCade(cadeLecciones_default.inversion),
  estrellaManual: createCade(withPanels(manualWiring(cadeEstrellaTriangulo_default), STAR_PANELS.estrellaManual)),
  estrellaTimer: createCade(withPanels(cadeEstrellaTemporizador_default, STAR_PANELS.estrellaTimer))
};
var CADE_DRAWINGS = [
  { id: "perfecto", title: "PERFECTO", cade: PERFECTO_CADE, guided: true },
  { id: "estrella", title: "Estrella-tri\xE1ngulo", cade: ESTRELLA_CADE, guided: false },
  { id: "simple", title: "Lecci\xF3n \xB7 Marcha y paro", cade: LESSON_CADES.simple, guided: false },
  { id: "inversion", title: "Lecci\xF3n \xB7 Inversi\xF3n de giro", cade: LESSON_CADES.inversion, guided: false },
  { id: "estrellaTimer", title: "Lecci\xF3n \xB7 Estrella-tri\xE1ngulo con temporizador", cade: LESSON_CADES.estrellaTimer, guided: false }
];
var CADE_QUESTIONS = [
  { question: "Potencia: sigue L1 hasta la entrada 1 de -Q.", wire: 103, scope: "power", hint: "El primer conductor de la columna de potencia." },
  { question: "Potencia: \xBFqu\xE9 l\xEDnea une -Q:2 con -KM1:1?", wire: 106, scope: "power", hint: "Est\xE1 entre -Q y los contactos principales de -KM1." },
  { question: "Potencia: sigue -KM1:2 hasta la protecci\xF3n -F:1.", wire: 109, scope: "power", hint: "Baja desde el contactor hasta el bloque -F." },
  { question: "Potencia: identifica el conductor que llega a U1 del motor.", wire: 112, scope: "power", hint: "El tramo de la izquierda entre -F y -M." },
  { question: "Mando: encuentra el conductor que llega al borne 95 de -F.", wire: 83, scope: "control", hint: "Es el tramo corto entre la salida de -Q y el contacto 95." },
  { question: "Mando: sigue la salida 96 hacia la parada -SB1:11.", wire: 23, scope: "control", hint: "Desde -F:96, la l\xEDnea gira a la izquierda antes de -SB1." },
  { question: "Mando: \xBFqu\xE9 l\xEDnea llega a -SB2:13 desde la salida de -SB1?", wire: 25, scope: "control", hint: "El tramo vertical que alimenta la marcha; tambi\xE9n nace la rama auxiliar." },
  { question: "Mando: identifica la entrada de la rama auxiliar -KM1:13.", wire: 41, scope: "control", hint: "Busca la derivaci\xF3n a la derecha, en paralelo con -SB2." },
  { question: "Mando: encuentra la l\xEDnea que llega a A1 de la bobina -KM1.", wire: 47, scope: "control", hint: "Baja desde la uni\xF3n de las ramas hasta la bobina." },
  { question: "Mando: sigue A2 hasta el retorno com\xFAn.", wire: 94, scope: "control", hint: "Es el tramo azul debajo de la bobina." },
  { question: "Se\xF1alizaci\xF3n: \xBFqu\xE9 l\xEDnea llega a X1 del piloto -H2?", wire: 52, scope: "control", hint: "Sigue la rama que sale del contacto 97\u201398 hacia la derecha." },
  { question: "Se\xF1alizaci\xF3n: sigue -KM1:12 hacia X1 de -H3.", wire: 90, scope: "control", hint: "Busca el contacto auxiliar a la izquierda de la parada." }
];

// src/data/panel.ts
var terminalDisplay = (t) => t.id.match(/^S[123]:([1234])$/)?.[1] || t.id.replace("PILOTO_", "P").replace(/^TP_.+$/, "TP");
var terminalLabelPosition = (t) => ({
  x: t.x + (t.labelSide === "left" ? -31 : t.labelSide === "right" ? 30 : 0),
  y: t.y + (t.labelSide === "top" ? -20 : t.labelSide === "right" ? 4 : 33)
});
var port = (id, x, y, color, note, state, labelSide = "bottom", verification = "foto") => ({ id, label: id, x, y, color, note, state, labelSide, verification });
var source = { id: "FUENTE", title: "ALIMENTACI\xD3N Y TRANSFORMADOR", subtitle: "Transformador 220 / 24 V \xB7 3 A", x: 65, y: 82, w: 585, h: 285, image: "/references/suministro.jpg", category: "alimentacion", summary: "Fuentes y puntos de alimentaci\xF3n visibles. No energizar equipos reales sin autorizaci\xF3n docente.", labelBands: [["R", "S", "T"], ["N", "F"]], terminals: [
  port("R", 237, 230, "blue", "Fase R"),
  port("S", 297, 230, "black", "Fase S"),
  port("T", 357, 230, "red", "Fase T"),
  port("N", 430, 230, "white", "Neutro / referencia: conexi\xF3n interna por confirmar", void 0, "bottom", "no_verificado"),
  port("F", 493, 230, "red", "Borne marcado F: funci\xF3n interna por confirmar", void 0, "bottom", "no_verificado"),
  port("TP", 550, 242, "green", "Tierra de protecci\xF3n")
] };
var btn = { id: "BOTONERAS", title: "LUCES PILOTO 24 V A.C. / BOTONERAS", x: 712, y: 76, w: 615, h: 300, image: "/references/botoneras.jpg", category: "botoneras", summary: "Cuatro pilotos y tres pulsadores. Pares rojos 1\u20132; pares claros 3\u20134. En el pulsador derecho las columnas est\xE1n invertidas. NA/NC por convenci\xF3n, pendiente de verificaci\xF3n.", labelBands: [1, 2, 3].flatMap((s) => [[`S${s}:1`, `S${s}:3`], [`S${s}:2`, `S${s}:4`]]), terminals: [
  ...[78, 228, 378, 530].map((x, i) => port(`PILOTO_${i + 1}`, x, 105, "red", `Conector visible bajo piloto ${i + 1}; retorno a\xFAn no verificado`, void 0, "bottom", "no_verificado")),
  ...[115, 303, 488].flatMap((cx, i) => [
    // IMG_4737 and IMG_4536: the right-hand button has its columns reversed.
    port(`S${i + 1}:1`, cx + (i === 2 ? 29 : -29), 196, "red", `Pulsador ${i + 1} \xB7 contacto 1\u20132`, "NC por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:2`, cx + (i === 2 ? 29 : -29), 250, "red", `Pulsador ${i + 1} \xB7 contacto 1\u20132`, "NC por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:3`, cx + (i === 2 ? -29 : 29), 196, "white", `Pulsador ${i + 1} \xB7 contacto 3\u20134`, "NA por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:4`, cx + (i === 2 ? -29 : 29), 250, "white", `Pulsador ${i + 1} \xB7 contacto 3\u20134`, "NA por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar")
  ]),
  port("N", 571, 132, "white", "Borne N visible del m\xF3dulo; conexi\xF3n interna no verificada", void 0, "bottom", "no_verificado"),
  port("TP_IZQ", 40, 260, "green", "Tierra de protecci\xF3n"),
  port("TP_DER", 579, 260, "green", "Tierra de protecci\xF3n")
] };
var thermal = { id: "CONTACTOR_TERMICO", title: "CONTACTOR + REL\xC9 T\xC9RMICO", subtitle: "Contactor y protecci\xF3n de sobrecarga", x: 65, y: 408, w: 585, h: 350, image: "/photos-2026-10-15/foto-6.jpg", category: "contactores", summary: "Contactor con rel\xE9 t\xE9rmico. Los n\xFAmeros de bornes est\xE1n identificados; referencia KM escrita a mano sin confirmar.", aliasEditable: true, labelBands: [["A2", "A1"], ["L1", "L2", "L3"], ["T1", "T2", "T3"], ["71", "72"], ["81", "82"], ["95", "96"], ["13", "14"], ["63", "64"], ["93", "94"], ["97", "98"]], terminals: [
  port("A2", 176, 64, "red", "Bobina, borne A2", void 0, "right"),
  port("A1", 176, 108, "white", "Bobina, borne A1", void 0, "right"),
  ...["L1", "L2", "L3"].map((id, i) => port(id, 264 + i * 77, 70, ["blue", "black", "red"][i], "Entrada de potencia", void 0, "bottom")),
  ...["T1", "T2", "T3"].map((id, i) => port(id, 264 + i * 77, 309, ["blue", "black", "red"][i], "Salida de potencia", void 0, "bottom")),
  ...["71", "72", "81", "82", "95", "96"].map((id, i) => port(id, 178 + i % 2 * 74, 164 + Math.floor(i / 2) * 54, "black", `${i >= 4 ? "Protecci\xF3n t\xE9rmica" : "Auxiliar"} \xB7 contacto ${["71\u201372", "71\u201372", "81\u201382", "81\u201382", "95\u201396", "95\u201396"][i]}`, "NC probable", "top", "convencion_por_confirmar")),
  ...["13", "14", "63", "64", "93", "94", "97", "98"].map((id, i) => port(id, 449 + i % 2 * 70, 128 + Math.floor(i / 2) * 54, "blue", `${i >= 6 ? "Protecci\xF3n t\xE9rmica" : "Auxiliar"} \xB7 contacto ${["13\u201314", "13\u201314", "63\u201364", "63\u201364", "93\u201394", "93\u201394", "97\u201398", "97\u201398"][i]}`, "NA probable", "top", "convencion_por_confirmar")),
  port("TP_IZQ", 170, 309, "green", "Tierra de protecci\xF3n"),
  port("TP_DER", 551, 309, "green", "Tierra de protecci\xF3n")
] };
var tri = { id: "CONTACTOR_TRIFASICO", title: "CONTACTOR TRIF\xC1SICO", subtitle: "Referencia escrita KM\u2026 por confirmar", x: 712, y: 408, w: 615, h: 350, image: "/photos-2026-10-15/foto-3.jpg", category: "contactores", summary: "Contactor trif\xE1sico con bobina, bornes de potencia y contactos auxiliares. Etiqueta KM manuscrita a\xFAn no legible por completo.", aliasEditable: true, labelBands: [["A2", "A1"], ["L1", "L2", "L3"], ["T1", "T2", "T3"], ["71", "72"], ["81", "82"], ["13", "14"], ["63", "64"], ["93", "94"]], terminals: [
  port("A2", 52, 65, "red", "Bobina, borne A2", void 0, "right"),
  port("A1", 52, 112, "white", "Bobina, borne A1", void 0, "right"),
  ...["L1", "L2", "L3"].map((id, i) => port(id, 184 + i * 78, 71, ["blue", "black", "red"][i], "Entrada de potencia", void 0, "bottom")),
  ...["T1", "T2", "T3"].map((id, i) => port(id, 184 + i * 78, 309, ["blue", "black", "red"][i], "Salida de potencia", void 0, "bottom")),
  ...["71", "72", "81", "82"].map((id, i) => port(id, i === 0 ? 80 : 72 + i % 2 * 65, 157 + Math.floor(i / 2) * 60, "black", `Auxiliar \xB7 contacto ${i < 2 ? "71\u201372" : "81\u201382"}`, "NC probable", "top", "convencion_por_confirmar")),
  port("95", 72, 277, "black", "Borne 95 de KM2: presencia indicada por ti. No visible en fotos 3\u20135 del 15/10/2026; presencia en este m\xF3dulo por confirmar. Posici\xF3n y color de referencia; funci\xF3n interna por confirmar.", void 0, "top", "usuario"),
  port("96", 137, 277, "black", "Borne 96 de KM2: presencia indicada por ti. No visible en fotos 3\u20135 del 15/10/2026; presencia en este m\xF3dulo por confirmar. Posici\xF3n y color de referencia; funci\xF3n interna por confirmar.", void 0, "top", "usuario"),
  ...["13", "14", "63", "64", "93", "94"].map((id, i) => port(id, 473 + i % 2 * 65, 149 + Math.floor(i / 2) * 54, "blue", `Contacto ${["13\u201314", "13\u201314", "63\u201364", "63\u201364", "93\u201394", "93\u201394"][i]}`, "NA probable", "top", "convencion_por_confirmar")),
  port("TP_IZQ", 55, 309, "green", "Tierra de protecci\xF3n"),
  port("TP_DER", 580, 309, "green", "Tierra de protecci\xF3n")
] };
function timer2(id, x, image) {
  return { id, title: "TEMPORIZADOR NEUM\xC1TICO", subtitle: "BOBINA 24 V A.C.", x, y: 787, w: 485, h: 270, image, category: "temporizadores", aliasEditable: true, summary: "Temporizador neum\xE1tico de 24 V CA. Antes de simularlo hay que confirmar el modo de retardo y su referencia.", labelBands: [["A2", "A1"], ["L1", "L2", "L3"], ["T1", "T2", "T3"], ["55", "56"], ["13", "14"], ["67", "68"]], terminals: [
    port("A2", 33, 59, "red", "Bobina A2", void 0, "right"),
    port("A1", 33, 102, "white", "Bobina A1", void 0, "right"),
    ...["L1", "L2", "L3"].map((id2, i) => port(id2, 152 + i * 63, 58, ["blue", "black", "red"][i], "Bornes superiores", void 0, "bottom")),
    ...["T1", "T2", "T3"].map((id2, i) => port(id2, 152 + i * 63, 222, ["blue", "black", "red"][i], "Bornes inferiores", void 0, "bottom")),
    port("55", 45, 169, "black", "Contacto 55\u201356, retardo no verificado", "NC probable", "top", "convencion_por_confirmar"),
    port("56", 96, 169, "black", "Contacto 55\u201356, retardo no verificado", "NC probable", "top", "convencion_por_confirmar"),
    port("13", 365, 135, "blue", "Auxiliar 13\u201314", "NA probable", "top", "convencion_por_confirmar"),
    port("14", 427, 135, "blue", "Auxiliar 13\u201314", "NA probable", "top", "convencion_por_confirmar"),
    port("67", 365, 191, "blue", "Contacto 67\u201368, retardo no verificado", "NA probable", "top", "convencion_por_confirmar"),
    port("68", 427, 191, "blue", "Contacto 67\u201368, retardo no verificado", "NA probable", "top", "convencion_por_confirmar"),
    port("TP_IZQ", 49, 224, "green", "Tierra de protecci\xF3n"),
    port("TP_DER", 452, 224, "green", "Tierra de protecci\xF3n")
  ] };
}
var motor = { id: "BORNERA_MOTOR", title: "MOTOR TRIF\xC1SICO", subtitle: "Motor con bornera U1 V1 W1 \xB7 W2 U2 V2", x: 65, y: 798, w: 715, h: 285, image: "/references/motor.jpg", category: "motor", summary: "Motor trif\xE1sico con su bornera: seis extremos de bobinado y tierra de protecci\xF3n. Estrella o tri\xE1ngulo se define con los puentes entre bornes.", labelBands: [["U1", "V1", "W1"], ["W2", "U2", "V2"]], terminals: [
  port("U1", 532, 109, "blue", "Terminal de motor U1", void 0, "top"),
  port("V1", 581, 109, "black", "Terminal de motor V1", void 0, "top"),
  port("W1", 630, 109, "red", "Terminal de motor W1", void 0, "top"),
  port("W2", 532, 176, "red", "Terminal de motor W2", void 0, "bottom"),
  port("U2", 581, 176, "blue", "Terminal de motor U2", void 0, "bottom"),
  port("V2", 630, 176, "black", "Terminal de motor V2", void 0, "bottom"),
  port("TP", 499, 144, "green", "Tierra de protecci\xF3n", void 0, "bottom")
] };
for (const m of [thermal, tri]) for (const t of m.terminals) {
  if (["71", "72", "81", "82", "95", "96"].includes(t.id)) {
    t.color = "gray";
    t.state = "NC \xB7 normalmente cerrado";
    t.verification = "usuario";
    t.note = (m === tri && ["95", "96"].includes(t.id) ? "Contacto 95\u201396: NC indicado por ti; accionamiento interno por confirmar." : t.note || "") + " Gris = normalmente cerrado, indicado por ti.";
  }
  if (["13", "14", "63", "64", "93", "94", "97", "98"].includes(t.id)) {
    t.state = "NA \xB7 normalmente abierto";
    t.verification = "usuario";
    t.note = (t.note || "") + " Azul = normalmente abierto, indicado por ti.";
  }
}
tri.labelBands.push(["95", "96"]);
source.x = 65;
source.y = 76;
btn.x = 674;
btn.y = 76;
thermal.x = 65;
thermal.y = 412;
tri.x = 674;
tri.y = 412;
var pneumatic = timer2("TEMPORIZADOR_1", 65, "/references/temporizador-1.jpg");
pneumatic.y = 798;
motor.x = 574;
motor.y = 798;
var RETIRED_MODULES = [timer2("TEMPORIZADOR_2", 831, "/references/temporizador-2.jpg")];
var MODULES = [source, btn, thermal, tri, motor, pneumatic];
var BASE_MODULE_IDS = new Set(MODULES.map((m) => m.id));
var RETIRED_TERMINAL_IDS = new Set(RETIRED_MODULES.flatMap((m) => m.terminals.map((t) => `${m.id}:${t.id}`)));
var PORT_COUNT = MODULES.reduce((n, m) => n + m.terminals.length, 0);
var terminalKey = (module, terminal) => `${module.id}:${terminal.id}`;
var TERMINALS = MODULES.flatMap((module) => module.terminals.map((terminal) => ({ key: terminalKey(module, terminal), module, terminal })));
var TERMINAL_BY_ID = new Map(TERMINALS.map((t) => [t.key, t]));
var EXTRA_KINDS = {
  tri: { label: "Contactor trif\xE1sico", hint: "Otro contactor con bobina, potencia y auxiliares (KM3, KM4\u2026)", prefix: "CONTACTOR_TRIFASICO_", first: 3 },
  timer: { label: "Temporizador neum\xE1tico", hint: "Otro temporizador con bobina 24 V y contactos de retardo", prefix: "TEMPORIZADOR_", first: 3 }
};
var MAX_EXTRA_MODULES = 8;
var extraKindOf = (id) => Object.keys(EXTRA_KINDS).find((k) => {
  const m = id.match(new RegExp(`^${EXTRA_KINDS[k].prefix}(\\d+)$`));
  return !!m && Number(m[1]) >= EXTRA_KINDS[k].first;
}) ?? null;
var isExtraModuleId = (id) => !BASE_MODULE_IDS.has(id) && extraKindOf(id) !== null;
function nextExtraNumber(kind, modules = MODULES) {
  const { prefix, first } = EXTRA_KINDS[kind];
  let n = first;
  while (modules.some((m) => m.id === `${prefix}${n}`) || kind === "timer" && RETIRED_MODULES.some((m) => m.id === `${prefix}${n}`)) n++;
  return n;
}
function buildExtraModule(kind, n) {
  const { prefix } = EXTRA_KINDS[kind], id = `${prefix}${n}`;
  if (kind === "tri") {
    const km = `KM${n}`, copy2 = structuredClone(tri);
    copy2.terminals.forEach((t) => {
      if (t.note) t.note = t.note.replace(/KM2/g, km);
    });
    return { ...copy2, id, subtitle: `Panel adicional \xB7 referencia ${km} por confirmar`, kind: "tri", extra: true, defaultAlias: km, summary: `Panel adicional de contactor trif\xE1sico (${km}). Copia los bornes del contactor trif\xE1sico del banco.` };
  }
  const copy = timer2(id, 0, "/references/temporizador-1.jpg");
  return { ...copy, subtitle: "BOBINA 24 V A.C. \xB7 panel adicional", kind: "timer", extra: true, defaultAlias: `KT${n - 1}` };
}
function registerModule(m) {
  if (MODULES.some((x) => x.id === m.id)) return false;
  MODULES.push(m);
  for (const terminal of m.terminals) {
    const entry = { key: terminalKey(m, terminal), module: m, terminal };
    TERMINALS.push(entry);
    TERMINAL_BY_ID.set(entry.key, entry);
  }
  return true;
}
function unregisterModule(id) {
  if (BASE_MODULE_IDS.has(id)) return false;
  const index = MODULES.findIndex((m) => m.id === id);
  if (index < 0) return false;
  MODULES.splice(index, 1);
  for (let i = TERMINALS.length - 1; i >= 0; i--) if (TERMINALS[i].module.id === id) {
    TERMINAL_BY_ID.delete(TERMINALS[i].key);
    TERMINALS.splice(i, 1);
  }
  return true;
}
function matchesTerminal(module, terminal, query, alias = "") {
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
  return normalize(`${module.title} ${module.id} ${alias} ${terminal.id} ${terminalKey(module, terminal)}`).includes(normalize(query));
}
var VERIFICATION_INFO = {
  foto: "Etiqueta o color reconocible en las fotograf\xEDas aportadas.",
  convencion_por_confirmar: "Interpretaci\xF3n basada en numeraci\xF3n industrial; a\xFAn requiere confirmar el estado el\xE9ctrico del equipo real.",
  no_verificado: "No se puede determinar con certeza la funci\xF3n o relaci\xF3n interna usando solamente las fotograf\xEDas.",
  usuario: "Informaci\xF3n indicada por ti; revisa la nota del borne para distinguir lo confirmado de lo pendiente."
};
var COLOR_HEX = { red: "#bd142a", blue: "#17509a", black: "#24272c", gray: "#6a747c", white: "#f5f1e7", green: "#00865b" };

// src/data/practice.ts
var BANANA_COLOR = "#145650";
var CONNECTOR_PENDING = { id: "laboratorio-pendiente", stackable: "unverified", capacity: null };
var CLASS_DIAGRAMS = [1, 2, 3].map((n) => ({ id: `clase-${n}`, name: `Fotograf\xEDa de clase ${n} \xB7 referencia sin validar`, src: `/diagrams/clase-${n}.jpg`, origin: "class_photo" }));
var emptyPractice = () => ({ version: 2, title: "Mi pr\xE1ctica INACAP", wires: [], diagram: CLASS_DIAGRAMS[0], steps: [], mode: "free", stepIndex: 0 });
var IDENTIFICATION_STEPS = [
  { terminalId: "CONTACTOR_TERMICO:95", title: "Encuentra el borne 95", explanation: "La foto muestra 95 junto a 96 en el m\xF3dulo con rel\xE9 t\xE9rmico. En el panel se representa gris NC seg\xFAn tu aclaraci\xF3n: normalmente cerrado en reposo." },
  { terminalId: "CONTACTOR_TERMICO:96", title: "Encuentra su pareja: 96", explanation: "96 est\xE1 a la derecha de 95 en la misma franja. Reconocer la pareja no equivale a unirla con un cable." },
  { terminalId: "CONTACTOR_TERMICO:97", title: "Localiza el borne 97", explanation: "97 inicia la \xFAltima fila azul de la columna derecha del m\xF3dulo t\xE9rmico; 98 est\xE1 a su derecha." },
  { terminalId: "CONTACTOR_TRIFASICO:A1", title: "Distingue A1 en el contactor trif\xE1sico", explanation: "A1 aparece en crema bajo A2. El ID del m\xF3dulo evita confundirlo con la bobina de otro dispositivo." },
  { terminalId: "BOTONERAS:S3:3", title: "Busca el borne 3 del pulsador derecho", explanation: "En el pulsador derecho, la columna crema 3\u20134 queda a la izquierda de la columna roja 1\u20132." },
  { terminalId: "TEMPORIZADOR_1:55", title: "Reconoce 55 en el temporizador 1", explanation: "55 y 56 son el par negro a la izquierda del mecanismo. El tipo de retardo no est\xE1 confirmado." },
  { terminalId: "TEMPORIZADOR_1:68", title: "Reconoce 68 en el temporizador", explanation: "68 es el borne derecho del par azul 67\u201368 del \xFAnico temporizador." },
  { terminalId: "BORNERA_MOTOR:U2", title: "Encuentra U2 en el motor", explanation: "La fila inferior es W2, U2, V2: U2 es azul y ocupa la posici\xF3n central." },
  { terminalId: "FUENTE:TP", title: "Distingue tierra de protecci\xF3n", explanation: "TP es verde en el extremo inferior derecho de la fuente. N y TP no se unen por presunci\xF3n." }
];

// src/data/panelCorrespondence.ts
var CONFIRMED_MODULE_ALIASES = { CONTACTOR_TERMICO: "KM1", CONTACTOR_TRIFASICO: "KM2" };
var cadePortKey = (p) => `${p.reference === "-Q" && p.objectId === 3 ? "-Q.potencia" : p.reference}:${p.terminal}`;
function migrateCadeBindings(bindings) {
  const next = { ...bindings };
  for (const key2 of Object.keys(next)) if (/^-Q:[3-6]$/.test(key2)) {
    const scoped = key2.replace("-Q:", "-Q.potencia:");
    if (!Object.hasOwn(next, scoped)) next[scoped] = next[key2];
    delete next[key2];
  }
  return next;
}
var DEFAULT_CADE_BINDINGS = {
  "-F:95": "CONTACTOR_TERMICO:95",
  "-F:96": "CONTACTOR_TERMICO:96",
  "-F:97": "CONTACTOR_TERMICO:97",
  "-F:98": "CONTACTOR_TERMICO:98",
  "-M:U1": "BORNERA_MOTOR:U1",
  "-M:V1": "BORNERA_MOTOR:V1",
  "-M:W1": "BORNERA_MOTOR:W1",
  "-M:W2": "BORNERA_MOTOR:W2",
  "-M:U2": "BORNERA_MOTOR:U2",
  "-M:V2": "BORNERA_MOTOR:V2",
  "-KM1:A1": "CONTACTOR_TERMICO:A1",
  "-KM1:A2": "CONTACTOR_TERMICO:A2",
  "-KM1:13": "CONTACTOR_TERMICO:13",
  "-KM1:14": "CONTACTOR_TERMICO:14",
  "-KM1:11": "CONTACTOR_TERMICO:71",
  "-KM1:12": "CONTACTOR_TERMICO:72",
  "-SB1:11": "BOTONERAS:S2:1",
  "-SB1:12": "BOTONERAS:S2:2",
  "-SB2:13": "BOTONERAS:S1:3",
  "-SB2:14": "BOTONERAS:S1:4",
  "-H1:X1": "BOTONERAS:PILOTO_1",
  "-H2:X1": "BOTONERAS:PILOTO_3",
  "-H3:X1": "BOTONERAS:PILOTO_2",
  "-H1:X2": "BOTONERAS:N",
  "-H2:X2": "BOTONERAS:N",
  "-H3:X2": "BOTONERAS:N",
  "-X:L": "FUENTE:F",
  "-X:N": "FUENTE:N",
  "-X:PE": "FUENTE:TP",
  "-M:PE": "BORNERA_MOTOR:TP",
  "-Q:1": "FUENTE:F",
  "-Q:2": "FUENTE:F",
  "-X:L1": "FUENTE:R",
  "-X:L2": "FUENTE:S",
  "-X:L3": "FUENTE:T",
  ...Object.fromEntries(["R", "S", "T"].flatMap((phase, i) => [
    [`-Q.potencia:${i * 2 + 1}`, `FUENTE:${phase}`],
    [`-Q.potencia:${i * 2 + 2}`, `FUENTE:${phase}`],
    [`-KM1:${i * 2 + 1}`, `CONTACTOR_TERMICO:L${i + 1}`],
    [`-KM1:${i * 2 + 2}`, `CONTACTOR_TERMICO:T${i + 1}`],
    [`-F:${i * 2 + 1}`, `CONTACTOR_TERMICO:T${i + 1}`],
    [`-F:${i * 2 + 2}`, `CONTACTOR_TERMICO:T${i + 1}`]
  ]))
};
function bindingConflict(key2, id, bindings) {
  return !!id && Object.entries({ ...DEFAULT_CADE_BINDINGS, ...bindings }).some(([other, value]) => other !== key2 && value === id && !(DEFAULT_CADE_BINDINGS[key2] === id && DEFAULT_CADE_BINDINGS[other] === id));
}

// src/data/layout.ts
var import_react = __toESM(require_react(), 1);
var GAP = 24;
var MIN_GAP = 8;
var MARGIN_X = 65;
var TOP_Y = 76;
var BOARD_RIGHT = 1342;
var baseIds = () => MODULES.filter((m) => !m.extra);
var baseLayout = () => Object.fromEntries(baseIds().map((m) => [m.id, { x: m.x, y: m.y }]));
function placeExtras(layout) {
  const next = { ...layout };
  for (const m of MODULES) if (m.extra && !valid(next[m.id])) next[m.id] = freeSlot(next, m);
  return next;
}
var base = () => placeExtras(baseLayout());
var DEFAULT_LAYOUT = base();
var current = base();
var modulePos = (m, layout = current) => layout[m.id] ?? { x: m.x, y: m.y };
var moduleRect = (m, layout = current) => ({ ...modulePos(m, layout), w: m.w, h: m.h });
function valid(v) {
  return !!v && typeof v === "object" && Number.isFinite(v.x) && Number.isFinite(v.y);
}
var overlaps = (a, b, pad = MIN_GAP) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
function freeSlot(layout, me, modules = MODULES) {
  const others = modules.filter((m) => m.id !== me.id && valid(layout[m.id])).map((m) => moduleRect(m, layout));
  const right = Math.max(BOARD_RIGHT, ...others.map((o) => o.x + o.w)), bottom = Math.max(TOP_Y - GAP, ...others.map((o) => o.y + o.h));
  const candidates = [{ x: MARGIN_X, y: TOP_Y }, { x: MARGIN_X, y: bottom + GAP }];
  for (const o of others) candidates.push({ x: o.x + o.w + GAP, y: o.y }, { x: o.x, y: o.y + o.h + GAP }, { x: MARGIN_X, y: o.y + o.h + GAP }, { x: o.x - GAP - me.w, y: o.y });
  const fits = candidates.filter((c) => c.x >= MARGIN_X && c.y >= TOP_Y && c.x + me.w <= right && !others.some((o) => overlaps({ ...c, w: me.w, h: me.h }, o)));
  fits.sort((a, b) => a.y + me.h - (b.y + me.h) || a.y - b.y || a.x - b.x);
  return fits[0] ?? { x: MARGIN_X, y: bottom + GAP };
}
var VIEW_ASPECT = 1680 / 1460;

// src/data/lessonIds.ts
var LESSON_IDS = ["simple", "inversion", "estrellaManual", "estrellaTimer"];

// src/data/assessmentState.ts
function readAssessment(raw, known) {
  const a = raw;
  if (!a || a.version !== 1 || typeof a.id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(a.id) || !LESSON_IDS.includes(a.lessonId) || typeof a.submitted !== "boolean" || typeof a.reflection !== "string" || a.reflection.length > 6e3 || !Array.isArray(a.answers) || a.answers.length > 500) throw new Error("La evaluaci\xF3n de la lecci\xF3n no es v\xE1lida.");
  const ids = /* @__PURE__ */ new Set();
  const answers = a.answers.map((r) => {
    if (!r || typeof r.wireId !== "string" || r.wireId.length > 100 || ids.has(r.wireId) || typeof r.from !== "string" || typeof r.to !== "string" || !known(r.from) || !known(r.to) || r.from === r.to || typeof r.text !== "string" || r.text.length > 3e3) throw new Error("Una respuesta de la lecci\xF3n no es v\xE1lida.");
    ids.add(r.wireId);
    return { wireId: r.wireId, from: r.from, to: r.to, text: r.text };
  });
  return { version: 1, id: a.id, lessonId: a.lessonId, submitted: a.submitted, reflection: a.reflection, answers };
}

// src/data/wiring.ts
var orphanExtra = (id) => typeof id === "string" && !TERMINAL_BY_ID.has(id) && isExtraModuleId(id.split(":")[0]);
function terminalPoint(id) {
  const t = TERMINAL_BY_ID.get(id);
  if (!t) return null;
  const p = modulePos(t.module);
  return { x: p.x + t.terminal.x, y: p.y + t.terminal.y };
}
function cableNodes(wires) {
  const parent = /* @__PURE__ */ new Map();
  const root = (id) => {
    if (!parent.has(id)) parent.set(id, id);
    const p = parent.get(id);
    if (p !== id) parent.set(id, root(p));
    return parent.get(id);
  };
  for (const w of wires) {
    const a = root(w.from.terminalId), b = root(w.to.terminalId);
    if (a !== b) parent.set(b, a);
  }
  const groups = /* @__PURE__ */ new Map();
  for (const id of parent.keys()) {
    const r = root(id);
    groups.set(r, [...groups.get(r) || [], id]);
  }
  return groups;
}
function connectedByCables(a, b, wires) {
  return a !== b && [...cableNodes(wires).values()].some((ids) => ids.includes(a) && ids.includes(b));
}
function networkFor(id, wires) {
  return id ? [...cableNodes(wires).values()].find((ids) => ids.includes(id)) || [] : [];
}
function createCable(from, to, wires, color = BANANA_COLOR) {
  if (!TERMINAL_BY_ID.has(from) || !TERMINAL_BY_ID.has(to) || from === to) throw new Error("Selecciona dos bornes distintos del inventario.");
  return { id: crypto.randomUUID(), from: { terminalId: from }, to: { terminalId: to }, color, route: { sag: 130 }, layer: wires.reduce((n, w) => Math.max(n, w.layer), 0) + 1 };
}
function indexCableEndpoints(wires) {
  const ordered = [...wires].sort((a, b) => a.layer - b.layer || a.id.localeCompare(b.id)), slots = /* @__PURE__ */ new Map();
  for (const w of ordered) for (const id of [w.from.terminalId, w.to.terminalId]) {
    let siblings = slots.get(id);
    if (!siblings) {
      siblings = /* @__PURE__ */ new Map();
      slots.set(id, siblings);
    }
    siblings.set(w.id, siblings.size);
  }
  return { ordered, slots };
}
function cableGeometry(wire, wires, index) {
  const endpoint = (end) => {
    const id = wire[end].terminalId;
    const point2 = terminalPoint(id);
    const position = index?.slots.get(id)?.get(wire.id) ?? wires.filter((w) => w.from.terminalId === id || w.to.terminalId === id).sort((a, b) => a.layer - b.layer || a.id.localeCompare(b.id)).findIndex((w) => w.id === wire.id);
    const stack = wire[end].stackOffset || { x: Math.max(0, position) * 8, y: Math.max(0, position) * -5 };
    const offset = end === "from" ? wire.route?.fromOffset : wire.route?.toOffset;
    return { point: point2, head: { x: point2.x + stack.x, y: point2.y + stack.y }, offset: offset || { x: 0, y: 0 } };
  };
  return { from: endpoint("from"), to: endpoint("to"), sag: wire.route?.sag ?? 130 };
}
function cablePath(from, to, sag, offsets) {
  const bottom = Math.max(from.y, to.y) + sag;
  return `M${from.x} ${from.y + 19} C${from.x + (offsets?.from?.x ?? 12)} ${bottom + (offsets?.from?.y ?? 0)} ${to.x + (offsets?.to?.x ?? -12)} ${bottom + (offsets?.to?.y ?? 0)} ${to.x} ${to.y + 19}`;
}
function readPractice(value) {
  if (!value || typeof value !== "object") throw new Error("Archivo de pr\xE1ctica no v\xE1lido.");
  const v = value;
  if (v.version !== 2 || !Array.isArray(v.wires) || !Array.isArray(v.steps)) throw new Error("Formato de pr\xE1ctica incompatible.");
  const archive = v.archive;
  const dropOrphans = (items, ends) => items.filter((item2) => !ends(item2).some(orphanExtra));
  const keepWires = dropOrphans(v.wires, (w) => [w?.from?.terminalId, w?.to?.terminalId]), keepSteps = dropOrphans(v.steps, (st) => [st?.from, st?.to]);
  if (archive && (!Array.isArray(archive.wires) || !Array.isArray(archive.steps) || !archive.bindings || typeof archive.bindings !== "object" || Array.isArray(archive.bindings))) throw new Error("El respaldo de m\xF3dulos retirados no es v\xE1lido.");
  const knownTerminal = (id) => TERMINAL_BY_ID.has(id) || RETIRED_TERMINAL_IDS.has(id);
  const finite = (n) => typeof n === "number" && Number.isFinite(n);
  const validPoint = (p) => !p || typeof p === "object" && p !== null && finite(p.x) && finite(p.y);
  const ids = /* @__PURE__ */ new Set();
  const allWires = [...keepWires, ...archive?.wires || []].map((raw) => {
    const w = raw;
    if (!w || typeof w.id !== "string" || ids.has(w.id) || !knownTerminal(w.from?.terminalId) || !knownTerminal(w.to?.terminalId) || w.from.terminalId === w.to.terminalId || !/^#[\da-f]{6}$/i.test(w.color) || !finite(w.layer) || !validPoint(w.from.stackOffset) || !validPoint(w.to.stackOffset) || !validPoint(w.route?.fromOffset) || !validPoint(w.route?.toOffset) || w.route?.sag !== void 0 && !finite(w.route.sag)) throw new Error("La pr\xE1ctica contiene un cable no v\xE1lido.");
    ids.add(w.id);
    return w;
  });
  const diagram = v.diagram;
  if (diagram && (!["class_photo", "user_image"].includes(diagram.origin) || typeof diagram.name !== "string" || typeof diagram.src !== "string" || !(/^\/diagrams\/(?:clase-[123]\.jpg|leccion-[a-z0-9-]+\.png)$/.test(diagram.src) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(diagram.src)))) throw new Error("La referencia de diagrama no es una imagen admitida.");
  const stepIds = /* @__PURE__ */ new Set();
  const allSteps = [...keepSteps, ...archive?.steps || []].map((raw) => {
    const s = raw, r = s?.region;
    if (!s || typeof s.id !== "string" || stepIds.has(s.id) || typeof s.title !== "string" || typeof s.explanation !== "string" || s.review !== "user_reviewed" || !knownTerminal(s.from) || !knownTerminal(s.to) || s.from === s.to || !r || ![r.x, r.y, r.w, r.h].every(finite) || r.x < 0 || r.y < 0 || r.w <= 0 || r.h <= 0 || r.x + r.w > 1000.1 || r.y + r.h > 1000.1) throw new Error("La pr\xE1ctica contiene un paso sin revisi\xF3n v\xE1lida.");
    if (s.path !== void 0 && (!Array.isArray(s.path) || s.path.length < 2 || s.path.length > 500 || s.path.some((p) => !p || !finite(p.x) || !finite(p.y) || p.x < 0 || p.y < 0 || p.x > 1e3 || p.y > 1e3))) throw new Error("El paso contiene un trazado no v\xE1lido.");
    stepIds.add(s.id);
    return s;
  });
  if (allSteps.length && !diagram) throw new Error("Los pasos necesitan su imagen de referencia.");
  let learning = v.learning;
  if (learning) {
    if (!["guided", "free", "exam"].includes(learning.mode) || !Number.isInteger(learning.index) || learning.index < 0 || learning.index >= 47 || ![1, 2, 3].includes(learning.assistance) || !learning.bindings || typeof learning.bindings !== "object" || Array.isArray(learning.bindings) || typeof learning.examFinished !== "boolean" || !learning.answers || typeof learning.answers !== "object" || Array.isArray(learning.answers) || Object.values(learning.answers).some((s) => typeof s !== "string" || s.length > 3e3) || Object.entries(learning.bindings).some(([key2, id]) => !key2.startsWith("-") || typeof id !== "string" || id !== "" && !knownTerminal(id))) throw new Error("El progreso o las correspondencias de PERFECTO no son v\xE1lidos.");
    learning = { ...learning, bindings: migrateCadeBindings(learning.bindings) };
    const known = new Set(CADE_PORTS.map(cadePortKey));
    if (Object.keys(learning.bindings).some((k) => !known.has(k))) throw new Error("La correspondencia no pertenece a PERFECTO.");
    const personalBindings = learning.bindings;
    if (Object.entries(personalBindings).some(([key2, id]) => bindingConflict(key2, id, personalBindings))) throw new Error("Dos bornes independientes del esquema no pueden asignarse al mismo borne f\xEDsico.");
  }
  const retired = (a, b) => RETIRED_TERMINAL_IDS.has(a) || RETIRED_TERMINAL_IDS.has(b);
  const wires = allWires.filter((w) => !retired(w.from.terminalId, w.to.terminalId)), steps = allSteps.filter((s) => !retired(s.from, s.to));
  const archivedBindings = { ...archive?.bindings || {}, ...Object.fromEntries(Object.entries(learning?.bindings || {}).filter(([, id]) => RETIRED_TERMINAL_IDS.has(id))) };
  if (Object.entries(archivedBindings).some(([key2, id]) => !CADE_PORTS.some((p) => `${p.reference}:${p.terminal}` === key2) || typeof id !== "string" || !RETIRED_TERMINAL_IDS.has(id))) throw new Error("El respaldo contiene correspondencias no v\xE1lidas.");
  const retainedArchive = { wires: allWires.filter((w) => retired(w.from.terminalId, w.to.terminalId)), steps: allSteps.filter((s) => retired(s.from, s.to)), bindings: archivedBindings };
  const migratedLearning = learning ? { ...learning, bindings: Object.fromEntries(Object.entries(learning.bindings).map(([key2, id]) => [key2, RETIRED_TERMINAL_IDS.has(id) ? "" : id])) } : void 0;
  const stepIndex = finite(v.stepIndex) ? Math.max(0, Math.floor(v.stepIndex)) : 0;
  const assessment = v.assessment === void 0 ? void 0 : readAssessment(v.assessment, (id) => TERMINAL_BY_ID.has(id));
  if (assessment && (v.mode !== "free" || v.learning !== void 0)) throw new Error("La evaluaci\xF3n debe conservar su modo de montaje libre.");
  return { ...emptyPractice(), ...assessment ? { assessment } : {}, title: typeof v.title === "string" ? v.title.slice(0, 100) : "Mi pr\xE1ctica", wires, diagram, steps, mode: ["explore", "free", "identify", "guided"].includes(String(v.mode)) ? v.mode : "free", stepIndex: retainedArchive.steps.length && v.mode === "guided" ? Math.min(stepIndex, Math.max(0, steps.length - 1)) : stepIndex, ...migratedLearning ? { learning: migratedLearning } : {}, ...retainedArchive.wires.length || retainedArchive.steps.length || Object.keys(archivedBindings).length ? { archive: retainedArchive } : {} };
}

// src/data/leccionInversion.layout.json
var leccionInversion_layout_default = {
  width: 1200,
  height: 1120,
  modules: [
    {
      id: "FUENTE",
      terminals: [
        {
          id: "R",
          x: 90,
          y: 150
        },
        {
          id: "S",
          x: 150,
          y: 150
        },
        {
          id: "T",
          x: 210,
          y: 150
        },
        {
          id: "N",
          x: 280,
          y: 150
        },
        {
          id: "F",
          x: 345,
          y: 150
        },
        {
          id: "TP",
          x: 350,
          y: 95
        }
      ]
    },
    {
      id: "BOTONERAS",
      terminals: [
        {
          id: "PILOTO_1",
          x: 500,
          y: 105
        },
        {
          id: "PILOTO_2",
          x: 650,
          y: 105
        },
        {
          id: "PILOTO_3",
          x: 800,
          y: 105
        },
        {
          id: "PILOTO_4",
          x: 950,
          y: 105
        },
        {
          id: "S1:1",
          x: 515,
          y: 200
        },
        {
          id: "S1:2",
          x: 515,
          y: 255
        },
        {
          id: "S1:3",
          x: 565,
          y: 200
        },
        {
          id: "S1:4",
          x: 565,
          y: 255
        },
        {
          id: "S2:1",
          x: 755,
          y: 200
        },
        {
          id: "S2:2",
          x: 755,
          y: 255
        },
        {
          id: "S2:3",
          x: 805,
          y: 200
        },
        {
          id: "S2:4",
          x: 805,
          y: 255
        },
        {
          id: "S3:1",
          x: 995,
          y: 200
        },
        {
          id: "S3:2",
          x: 995,
          y: 255
        },
        {
          id: "S3:3",
          x: 1045,
          y: 200
        },
        {
          id: "S3:4",
          x: 1045,
          y: 255
        },
        {
          id: "N",
          x: 1100,
          y: 125
        },
        {
          id: "TP_DER",
          x: 1100,
          y: 230
        }
      ]
    },
    {
      id: "CONTACTOR_TERMICO",
      terminals: [
        {
          id: "A2",
          x: 90,
          y: 410
        },
        {
          id: "A1",
          x: 90,
          y: 465
        },
        {
          id: "L1",
          x: 250,
          y: 410
        },
        {
          id: "L2",
          x: 310,
          y: 410
        },
        {
          id: "L3",
          x: 370,
          y: 410
        },
        {
          id: "71",
          x: 100,
          y: 540
        },
        {
          id: "72",
          x: 170,
          y: 540
        },
        {
          id: "81",
          x: 100,
          y: 600
        },
        {
          id: "82",
          x: 170,
          y: 600
        },
        {
          id: "95",
          x: 100,
          y: 660
        },
        {
          id: "96",
          x: 170,
          y: 660
        },
        {
          id: "13",
          x: 450,
          y: 470
        },
        {
          id: "14",
          x: 520,
          y: 470
        },
        {
          id: "97",
          x: 450,
          y: 550
        },
        {
          id: "98",
          x: 520,
          y: 550
        },
        {
          id: "T1",
          x: 250,
          y: 650
        },
        {
          id: "T2",
          x: 310,
          y: 650
        },
        {
          id: "T3",
          x: 370,
          y: 650
        },
        {
          id: "TP_DER",
          x: 520,
          y: 650
        }
      ]
    },
    {
      id: "CONTACTOR_TRIFASICO",
      terminals: [
        {
          id: "A2",
          x: 650,
          y: 410
        },
        {
          id: "A1",
          x: 650,
          y: 465
        },
        {
          id: "L1",
          x: 790,
          y: 410
        },
        {
          id: "L2",
          x: 860,
          y: 410
        },
        {
          id: "L3",
          x: 930,
          y: 410
        },
        {
          id: "71",
          x: 660,
          y: 540
        },
        {
          id: "72",
          x: 730,
          y: 540
        },
        {
          id: "81",
          x: 660,
          y: 600
        },
        {
          id: "82",
          x: 730,
          y: 600
        },
        {
          id: "13",
          x: 1010,
          y: 470
        },
        {
          id: "14",
          x: 1080,
          y: 470
        },
        {
          id: "T1",
          x: 790,
          y: 650
        },
        {
          id: "T2",
          x: 860,
          y: 650
        },
        {
          id: "T3",
          x: 930,
          y: 650
        },
        {
          id: "TP_IZQ",
          x: 660,
          y: 655
        },
        {
          id: "TP_DER",
          x: 1080,
          y: 650
        }
      ]
    },
    {
      id: "BORNERA_MOTOR",
      terminals: [
        {
          id: "U1",
          x: 400,
          y: 850
        },
        {
          id: "V1",
          x: 470,
          y: 850
        },
        {
          id: "W1",
          x: 540,
          y: 850
        },
        {
          id: "W2",
          x: 400,
          y: 960
        },
        {
          id: "U2",
          x: 470,
          y: 960
        },
        {
          id: "V2",
          x: 540,
          y: 960
        },
        {
          id: "TP",
          x: 330,
          y: 905
        }
      ]
    }
  ]
};

// src/data/starDeltaSources.json
var starDeltaSources_default = {
  estrellaManual: {
    title: "Estrella-tri\xE1ngulo sin temporizador",
    summary: "S1 arranca en estrella; S3 hace el cambio a tri\xE1ngulo.",
    source: "1-modo-panel-con-historial-2-.json",
    sha256: "d30b3149cd17a023dd4ef61e287ac1dcc6549550bba51e8196c6f29e774e2102",
    star: "KM3",
    delta: "KM2",
    historyTruncated: true,
    pairs: [
      [
        "FUENTE:F",
        "CONTACTOR_TERMICO:71"
      ],
      [
        "CONTACTOR_TERMICO:72",
        "BOTONERAS:PILOTO_2"
      ],
      [
        "FUENTE:F",
        "CONTACTOR_TERMICO:95"
      ],
      [
        "CONTACTOR_TERMICO:96",
        "BOTONERAS:S2:1"
      ],
      [
        "BOTONERAS:S2:2",
        "BOTONERAS:S1:3"
      ],
      [
        "BOTONERAS:S1:4",
        "CONTACTOR_TERMICO:A1"
      ],
      [
        "BOTONERAS:S2:2",
        "CONTACTOR_TERMICO:13"
      ],
      [
        "CONTACTOR_TERMICO:14",
        "BOTONERAS:S1:4"
      ],
      [
        "BOTONERAS:S1:4",
        "BOTONERAS:S3:1"
      ],
      [
        "BOTONERAS:S3:2",
        "CONTACTOR_TRIFASICO:71"
      ],
      [
        "CONTACTOR_TRIFASICO:72",
        "CONTACTOR_TRIFASICO_3:A1"
      ],
      [
        "CONTACTOR_TRIFASICO_3:A1",
        "BOTONERAS:PILOTO_1"
      ],
      [
        "BOTONERAS:S2:2",
        "BOTONERAS:S3:3"
      ],
      [
        "BOTONERAS:S3:4",
        "CONTACTOR_TRIFASICO_3:71"
      ],
      [
        "CONTACTOR_TRIFASICO_3:72",
        "CONTACTOR_TRIFASICO:A1"
      ],
      [
        "CONTACTOR_TRIFASICO:A1",
        "BOTONERAS:PILOTO_4"
      ],
      [
        "BOTONERAS:S1:4",
        "CONTACTOR_TRIFASICO:13"
      ],
      [
        "CONTACTOR_TRIFASICO:14",
        "BOTONERAS:S3:4"
      ],
      [
        "FUENTE:F",
        "CONTACTOR_TERMICO:97"
      ],
      [
        "CONTACTOR_TERMICO:98",
        "BOTONERAS:PILOTO_3"
      ],
      [
        "CONTACTOR_TERMICO:A2",
        "FUENTE:N"
      ],
      [
        "BOTONERAS:N",
        "FUENTE:N"
      ],
      [
        "CONTACTOR_TRIFASICO:A2",
        "FUENTE:N"
      ],
      [
        "CONTACTOR_TRIFASICO_3:A2",
        "FUENTE:N"
      ],
      [
        "FUENTE:R",
        "CONTACTOR_TERMICO:L1"
      ],
      [
        "FUENTE:S",
        "CONTACTOR_TERMICO:L2"
      ],
      [
        "FUENTE:T",
        "CONTACTOR_TERMICO:L3"
      ],
      [
        "CONTACTOR_TERMICO:T1",
        "BORNERA_MOTOR:U1"
      ],
      [
        "CONTACTOR_TERMICO:T2",
        "BORNERA_MOTOR:V1"
      ],
      [
        "CONTACTOR_TERMICO:T3",
        "BORNERA_MOTOR:W1"
      ],
      [
        "CONTACTOR_TERMICO:L1",
        "CONTACTOR_TRIFASICO:L1"
      ],
      [
        "CONTACTOR_TERMICO:L2",
        "CONTACTOR_TRIFASICO:L2"
      ],
      [
        "CONTACTOR_TERMICO:L3",
        "CONTACTOR_TRIFASICO:L3"
      ],
      [
        "CONTACTOR_TRIFASICO:T1",
        "BORNERA_MOTOR:W2"
      ],
      [
        "CONTACTOR_TRIFASICO:T2",
        "BORNERA_MOTOR:U2"
      ],
      [
        "CONTACTOR_TRIFASICO:T3",
        "BORNERA_MOTOR:V2"
      ],
      [
        "CONTACTOR_TRIFASICO:T1",
        "CONTACTOR_TRIFASICO_3:T3"
      ],
      [
        "CONTACTOR_TRIFASICO:T2",
        "CONTACTOR_TRIFASICO_3:T2"
      ],
      [
        "CONTACTOR_TRIFASICO:T3",
        "CONTACTOR_TRIFASICO_3:T1"
      ],
      [
        "CONTACTOR_TRIFASICO_3:L1",
        "CONTACTOR_TRIFASICO_3:L2"
      ],
      [
        "CONTACTOR_TRIFASICO_3:L3",
        "CONTACTOR_TRIFASICO_3:L2"
      ],
      [
        "FUENTE:TP",
        "BOTONERAS:TP_IZQ"
      ],
      [
        "CONTACTOR_TERMICO:TP_DER",
        "FUENTE:TP"
      ],
      [
        "CONTACTOR_TRIFASICO:TP_IZQ",
        "CONTACTOR_TERMICO:TP_DER"
      ],
      [
        "CONTACTOR_TRIFASICO:TP_DER",
        "BORNERA_MOTOR:TP"
      ],
      [
        "CONTACTOR_TRIFASICO_3:TP_IZQ",
        "CONTACTOR_TRIFASICO:TP_DER"
      ]
    ]
  },
  estrellaTimer: {
    title: "Estrella-tri\xE1ngulo con temporizador",
    summary: "S1 arranca; KT1 realiza el cambio de estrella a tri\xE1ngulo.",
    source: "2-modo-panel-con-historial-3-.json",
    sha256: "cd98794668e7182fa293d605dda462f0ceacb6b44a5be7d072e15142eab42df4",
    star: "KM2",
    delta: "KM3",
    historyTruncated: true,
    pairs: [
      [
        "FUENTE:F",
        "CONTACTOR_TERMICO:95"
      ],
      [
        "CONTACTOR_TERMICO:96",
        "BOTONERAS:S2:1"
      ],
      [
        "BOTONERAS:S2:2",
        "BOTONERAS:S1:3"
      ],
      [
        "BOTONERAS:S1:4",
        "CONTACTOR_TERMICO:A1"
      ],
      [
        "BOTONERAS:PILOTO_1",
        "CONTACTOR_TERMICO:A1"
      ],
      [
        "BOTONERAS:S2:2",
        "CONTACTOR_TERMICO:13"
      ],
      [
        "CONTACTOR_TERMICO:14",
        "BOTONERAS:S1:4"
      ],
      [
        "CONTACTOR_TERMICO:14",
        "TEMPORIZADOR_1:55"
      ],
      [
        "TEMPORIZADOR_1:56",
        "CONTACTOR_TRIFASICO_3:71"
      ],
      [
        "CONTACTOR_TRIFASICO_3:72",
        "CONTACTOR_TRIFASICO:A1"
      ],
      [
        "CONTACTOR_TERMICO:14",
        "TEMPORIZADOR_1:67"
      ],
      [
        "TEMPORIZADOR_1:68",
        "CONTACTOR_TRIFASICO:71"
      ],
      [
        "CONTACTOR_TRIFASICO:72",
        "CONTACTOR_TRIFASICO_3:A1"
      ],
      [
        "FUENTE:F",
        "CONTACTOR_TERMICO:97"
      ],
      [
        "CONTACTOR_TERMICO:98",
        "BOTONERAS:PILOTO_3"
      ],
      [
        "CONTACTOR_TERMICO:A2",
        "FUENTE:N"
      ],
      [
        "CONTACTOR_TRIFASICO:A2",
        "FUENTE:N"
      ],
      [
        "CONTACTOR_TRIFASICO_3:A2",
        "FUENTE:N"
      ],
      [
        "FUENTE:F",
        "CONTACTOR_TERMICO:81"
      ],
      [
        "CONTACTOR_TERMICO:82",
        "CONTACTOR_TRIFASICO:81"
      ],
      [
        "CONTACTOR_TRIFASICO:82",
        "CONTACTOR_TRIFASICO_3:81"
      ],
      [
        "CONTACTOR_TRIFASICO_3:82",
        "BOTONERAS:PILOTO_2"
      ],
      [
        "BOTONERAS:N",
        "FUENTE:N"
      ],
      [
        "FUENTE:R",
        "CONTACTOR_TERMICO:L1"
      ],
      [
        "FUENTE:S",
        "CONTACTOR_TERMICO:L2"
      ],
      [
        "FUENTE:T",
        "CONTACTOR_TERMICO:L3"
      ],
      [
        "CONTACTOR_TERMICO:T1",
        "BORNERA_MOTOR:U1"
      ],
      [
        "CONTACTOR_TERMICO:T2",
        "BORNERA_MOTOR:V1"
      ],
      [
        "CONTACTOR_TERMICO:T3",
        "BORNERA_MOTOR:W1"
      ],
      [
        "CONTACTOR_TERMICO:L1",
        "CONTACTOR_TRIFASICO_3:L1"
      ],
      [
        "CONTACTOR_TERMICO:L2",
        "CONTACTOR_TRIFASICO_3:L2"
      ],
      [
        "CONTACTOR_TERMICO:L3",
        "CONTACTOR_TRIFASICO_3:L3"
      ],
      [
        "CONTACTOR_TRIFASICO_3:T1",
        "BORNERA_MOTOR:W2"
      ],
      [
        "CONTACTOR_TRIFASICO_3:T2",
        "BORNERA_MOTOR:U2"
      ],
      [
        "CONTACTOR_TRIFASICO_3:T3",
        "BORNERA_MOTOR:V2"
      ],
      [
        "BORNERA_MOTOR:W2",
        "CONTACTOR_TRIFASICO:T3"
      ],
      [
        "BORNERA_MOTOR:U2",
        "CONTACTOR_TRIFASICO:T2"
      ],
      [
        "BORNERA_MOTOR:V2",
        "CONTACTOR_TRIFASICO:T1"
      ],
      [
        "CONTACTOR_TRIFASICO:L1",
        "CONTACTOR_TRIFASICO:L2"
      ],
      [
        "CONTACTOR_TRIFASICO:L3",
        "CONTACTOR_TRIFASICO:L2"
      ],
      [
        "BOTONERAS:S1:4",
        "TEMPORIZADOR_1:A1"
      ],
      [
        "TEMPORIZADOR_1:A2",
        "BOTONERAS:N"
      ]
    ]
  }
};

// src/data/starDeltaTeaching.ts
var item = (title, why, behavior, without, question, criteria) => ({ title, why, behavior, without, question, criteria });
function starDetail(id, from, to) {
  const timed = id === "estrellaTimer", s = starDeltaSources_default[id], ends = [from, to], has = (v) => ends.includes(v), match = (re) => ends.some((v) => re.test(v));
  const star = s.star, delta = s.delta, starModule = timed ? "CONTACTOR_TRIFASICO" : "CONTACTOR_TRIFASICO_3", deltaModule = timed ? "CONTACTOR_TRIFASICO_3" : "CONTACTOR_TRIFASICO";
  if (match(/:TP/)) return item("Continuidad de protecci\xF3n \xB7 TP", "Esta uni\xF3n contin\xFAa la red TP presente en el archivo sin temporizador.", "La protecci\xF3n se mantiene separada de N y de las rutas de mando y fuerza.", "Falta parte de la continuidad TP de esta referencia, aunque el modelo pudiera funcionar.", "\xBFQu\xE9 funci\xF3n cumple esta uni\xF3n TP y por qu\xE9 no debe usarse como retorno de una bobina?", ["Separar TP de N.", "Distinguir funcionamiento y continuidad de protecci\xF3n."]);
  if (match(/^CONTACTOR_.*:[LT][123]$/)) {
    if (ends.every((v) => v.startsWith(starModule + ":L"))) return item(`Punto com\xFAn de estrella \xB7 ${star}`, "Los puentes unen las tres entradas L del contactor de estrella en un mismo nodo.", "Al cerrar sus tres polos, ese nodo re\xFAne W2, U2 y V2 a trav\xE9s de las salidas T.", "Sin todos los puentes no se forma el nodo com\xFAn completo al cerrar el contactor.", "\xBFPor qu\xE9 se unen estas entradas y cu\xE1ndo quedan unidos los tres extremos del motor?", ["Identificar el nodo com\xFAn.", "Explicar que la estrella depende del cierre de " + star + "."]);
    if (match(new RegExp("^" + starModule + ":T"))) return item(`Extremo de bobinado hacia estrella \xB7 ${star}`, "Este cable lleva un extremo inferior del motor al contactor de estrella, seg\xFAn la red del archivo.", "Con " + star + " cerrado, sus tres polos llevan W2, U2 y V2 al nodo com\xFAn de sus entradas L.", "Falta uno de los recorridos que debe cerrar la conexi\xF3n estrella.", "Sigue este cable hasta el motor: \xBFc\xF3mo participa en la estrella y de qu\xE9 contactor depende?", ["Identificar W2, U2 o V2 y su recorrido.", "Relacionar el polo del contactor con el nodo com\xFAn."]);
    if (match(new RegExp("^" + deltaModule + ":[LT]"))) return item(`Rama de tri\xE1ngulo \xB7 ${delta}`, "La rama de " + delta + " toma las fases de entrada de KM1 y las lleva a W2, U2 y V2 seg\xFAn el archivo.", "Con KM1 y " + delta + " cerrados, las parejas U1\u2013W2, V1\u2013U2 y W1\u2013V2 reciben las fases de la referencia. " + star + " debe estar abierto.", "Se interrumpe uno de los recorridos necesarios para formar el tri\xE1ngulo previsto.", "\xBFQu\xE9 pareja de extremos del motor alimenta esta rama y por qu\xE9 debe estar abierto el contactor de estrella?", ["Seguir el recorrido de la fase hasta la pareja de bobinados.", "Distinguir estrella y tri\xE1ngulo e incluir el enclavamiento."]);
    return item("Fuerza principal \xB7 KM1", "KM1 recibe R, S y T y alimenta U1, V1 y W1 por sus polos principales.", "KM1 permanece activo en estrella y en tri\xE1ngulo; el cambio se hace en los otros extremos del motor.", "Falta una de las rutas de fuerza, aunque las bobinas de mando puedan activarse.", "\xBFQu\xE9 fase o extremo del motor lleva este cable y qu\xE9 papel conserva KM1 durante el cambio?", ["Distinguir mando y fuerza.", "Explicar la funci\xF3n de l\xEDnea de KM1."]);
  }
  if (has("TEMPORIZADOR_1:A1") || has("TEMPORIZADOR_1:A2")) return item("Alimentaci\xF3n del temporizador \xB7 KT1", "KT1 toma la alimentaci\xF3n del mismo nodo de marcha de KM1 y necesita un retorno a N.", "En el modelo virtual, al energizar KT1 comienza el retardo; al retirar la alimentaci\xF3n se reinicia.", "KT1 no completa su alimentaci\xF3n y sus contactos no realizan el cambio temporizado previsto.", "\xBFCu\xE1ndo empieza a contar KT1 y qu\xE9 sucede con el retardo al parar el circuito?", ["Relacionar la alimentaci\xF3n de KT1 con la marcha de KM1.", "Incluir A1, A2 y el reinicio al desenergizar."]);
  if (match(/^TEMPORIZADOR_1:(55|56|67|68)$/)) {
    const nc = match(/:(55|56)$/);
    return item(nc ? "Primera etapa \xB7 KT1 55\u201356" : "Segunda etapa \xB7 KT1 67\u201368", nc ? "La rama de estrella pasa por 55\u201356 de KT1 antes del enclavamiento con " + delta + "." : "La rama de tri\xE1ngulo pasa por 67\u201368 de KT1 antes del enclavamiento con " + star + ".", nc ? "En el modelo de retardo a la conexi\xF3n, 55\u201356 deja arrancar en estrella y abre al terminar el tiempo." : "En el mismo modelo, 67\u201368 permanece abierto durante el retardo y cierra al terminarlo.", nc ? "Se interrumpe la orden inicial de estrella. Puentear el contacto eliminar\xEDa su apertura temporizada." : "Falta la orden temporizada de tri\xE1ngulo. Un puente quitar\xEDa la espera prevista.", "\xBFQu\xE9 cambia en este contacto al terminar el retardo y c\xF3mo afecta a " + (nc ? star : delta) + "?", ["Distinguir 55\u201356 de 67\u201368.", "Relacionar la etapa temporal con el contactor correcto."]);
  }
  if (has("BOTONERAS:S3:1") || has("BOTONERAS:S3:2")) return item("Cambio manual \xB7 S3 abre la estrella", "La alimentaci\xF3n de la rama de " + star + " atraviesa el contacto NC 1\u20132 de S3.", "Al pulsar S3, 1\u20132 abre y cae " + star + ". Al soltarlo, el enclavamiento de " + delta + " impide volver a estrella mientras siga activo.", "La rama de estrella queda abierta; un puente impedir\xEDa que S3 la corte por este contacto.", "\xBFPor qu\xE9 S3 debe abrir esta rama antes de mantener el tri\xE1ngulo?", ["Relacionar el NC de S3 con la ca\xEDda de " + star + ".", "Explicar el papel del enclavamiento despu\xE9s del cambio."]);
  if (has("BOTONERAS:S3:3") || has("BOTONERAS:S3:4")) {
    if (match(/:14$/)) return item(`Retenci\xF3n del tri\xE1ngulo \xB7 ${delta}`, "El auxiliar NA 13\u201314 de " + delta + " forma una ruta en paralelo con la orden 3\u20134 de S3.", "Despu\xE9s del cambio, mantiene " + delta + " al soltar S3, mientras KM1 siga alimentando esa rama.", "Sin otra ruta equivalente, el tri\xE1ngulo depende de mantener pulsado S3.", "\xBFC\xF3mo mantiene este cable la marcha en tri\xE1ngulo despu\xE9s de soltar S3?", ["Explicar el paralelo con S3.", "Considerar el paro, KM1 y el enclavamiento."]);
    return item("Cambio manual \xB7 S3 ordena tri\xE1ngulo", "El contacto NA 3\u20134 de S3 da la orden de cambio a " + delta + " a trav\xE9s del NC de " + star + ".", "Al pulsar S3, abre la rama de estrella y cierra la orden de tri\xE1ngulo. El NC de " + star + " debe permitir el paso.", "Falta una parte de la orden manual de tri\xE1ngulo; la retenci\xF3n no sustituye la orden inicial.", "\xBFQu\xE9 dos acciones realiza S3 y c\xF3mo se evita activar estrella y tri\xE1ngulo juntos?", ["Distinguir 1\u20132 NC y 3\u20134 NA de S3.", "Explicar el enclavamiento cruzado."]);
  }
  if (match(/:(71|72)$/) && !has("CONTACTOR_TERMICO:71") && !has("CONTACTOR_TERMICO:72")) return item("Enclavamiento entre estrella y tri\xE1ngulo", "La alimentaci\xF3n de una bobina pasa por el NC 71\u201372 del contactor que realiza la otra conexi\xF3n.", "Si ese otro contactor act\xFAa, su NC abre e interrumpe esta rama; al caer vuelve a cerrar en el modelo.", "Sin el cable la rama queda interrumpida. Puentear el NC elimina esta condici\xF3n de exclusi\xF3n.", "Identifica el NC y la bobina de esta rama: \xBFqu\xE9 ocurre si el otro contactor est\xE1 activo?", ["Nombrar " + star + " como estrella y " + delta + " como tri\xE1ngulo.", "Explicar la apertura del NC contrario."]);
  if (has("BOTONERAS:N")) return item("Retorno com\xFAn de se\xF1alizaci\xF3n", "El borne N de las botoneras conecta el retorno modelado de los pilotos con el neutro de la fuente.", "Los pilotos pueden encenderse cuando su borne de se\xF1al recibe alimentaci\xF3n y este retorno est\xE1 completo.", "Los pilotos quedan sin retorno aunque sus otros bornes reciban fase.", "\xBFQu\xE9 circuitos cierra este retorno y en qu\xE9 se diferencia de TP?", ["Explicar el retorno de los pilotos.", "Separar N y TP."]);
  if (match(/:A2$/)) return item("Retorno de bobina a N", "A2 vuelve al neutro y completa el circuito de la bobina correspondiente.", "La bobina act\xFAa al recibir tensi\xF3n entre A1 y A2 y cumplirse las condiciones de su rama.", "Al faltar el retorno no basta con alimentar A1 para que act\xFAe la bobina.", "\xBFPor qu\xE9 la bobina necesita ambos extremos y qu\xE9 elementos acciona al alimentarse?", ["Identificar la bobina concreta.", "Explicar el circuito cerrado sin usar TP como retorno."]);
  if (match(/:(97|98)$/)) return item("Aviso de disparo \xB7 P3", "El aviso toma fase antes de 95\u201396 y utiliza el NA de se\xF1alizaci\xF3n 97\u201398 del t\xE9rmico.", "En el modelo, un disparo abre 95\u201396 y cierra 97\u201398; P3 puede encenderse con su retorno completo.", "Falta una parte del aviso, aunque el corte del mando puede seguir funcionando.", "\xBFC\xF3mo puede encenderse P3 cuando el t\xE9rmico corta la marcha?", ["Distinguir el corte 95\u201396 y el aviso 97\u201398.", "Situar la alimentaci\xF3n antes del corte."]);
  if (match(/:PILOTO_[14]$/)) {
    const state = timed ? "KM1 principal" : has("BOTONERAS:PILOTO_1") ? star + " estrella" : delta + " tri\xE1ngulo";
    return item("Piloto de estado \xB7 " + state, "El piloto toma alimentaci\xF3n del mismo nodo que la bobina de " + state + ".", "Con N conectado indica la alimentaci\xF3n de esa rama; no acredita por s\xED solo el giro f\xEDsico del motor.", "Se pierde esta se\xF1al, aunque la bobina pueda funcionar por su ruta propia.", "\xBFQu\xE9 estado indica este piloto en esta versi\xF3n y qu\xE9 no demuestra por s\xED solo?", ["Identificar la bobina asociada en este archivo.", "Separar se\xF1al luminosa y comprobaci\xF3n f\xEDsica."]);
  }
  if (match(/:(71|72|81|82)$/) || has("BOTONERAS:PILOTO_2")) return item("Indicaci\xF3n de reposo \xB7 P2", timed ? "P2 recibe fase a trav\xE9s de los NC 81\u201382 de KM1, KM2 y KM3 en serie." : "P2 recibe fase a trav\xE9s del NC 71\u201372 de KM1, tomado directamente de F.", "P2 puede encenderse con " + (timed ? "los tres contactores en reposo" : "KM1 en reposo") + " y el retorno N completo. Esta rama toma F antes del t\xE9rmico.", "Se pierde o se interrumpe la indicaci\xF3n de reposo, aunque las ramas de mando puedan funcionar.", "\xBFQu\xE9 estados deben tener los contactores para que P2 reciba alimentaci\xF3n en este archivo?", ["Seguir los NC presentes en esta versi\xF3n.", "Reconocer que la toma de F est\xE1 antes de 95\u201396."]);
  if (has("CONTACTOR_TERMICO:95")) return item("Protecci\xF3n del mando \xB7 95\u201396", "La alimentaci\xF3n F entra en 95 y sale por 96 hacia el paro.", "Al disparar el t\xE9rmico, su NC 95\u201396 abre y corta el mando alimentado por esta cadena.", "Falta la alimentaci\xF3n protegida; un puente evitar\xEDa la intervenci\xF3n de ese contacto.", "\xBFQu\xE9 ramas debe detener la apertura de 95\u201396 y cu\xE1les son solo se\xF1alizaci\xF3n?", ["Seguir la cadena protegida.", "Distinguirla de las se\xF1ales tomadas antes del t\xE9rmico."]);
  if (has("BOTONERAS:S2:1")) return item("Paro com\xFAn \xB7 S2", "El contacto NC 1\u20132 de S2 se coloca despu\xE9s del t\xE9rmico y antes de las ramas de marcha.", "Al pulsar S2 abre la cadena y retira la alimentaci\xF3n mantenida de KM1 y del cambio de conexi\xF3n.", "La cadena de mando queda abierta; un puente impedir\xEDa detenerla por este contacto.", "\xBFPor qu\xE9 el paro debe cortar tambi\xE9n la retenci\xF3n y el cambio estrella-tri\xE1ngulo?", ["Incluir marcha y retenci\xF3n.", "Explicar qu\xE9 ocurre con las bobinas al abrir S2."]);
  if (match(/:(13|14)$/)) return item("Retenci\xF3n de marcha \xB7 " + (has("CONTACTOR_TRIFASICO:13") ? delta : "KM1"), "El auxiliar NA 13\u201314 forma una ruta de mantenimiento, alimentada desde el nodo indicado en este archivo.", "Cuando entra su contactor, el NA cierra y mantiene la orden al soltar el pulsador que est\xE1 en paralelo.", "Sin otra ruta equivalente no queda completa esta retenci\xF3n.", "Sigue la entrada y la salida de 13\u201314: \xBFqu\xE9 pulsador evita tener que mantener presionado?", ["Identificar el contactor y el pulsador en paralelo.", "Relacionar el mantenimiento con el paro."]);
  if (has("BOTONERAS:S1:3")) return item("Orden inicial \xB7 S1", "S1 recibe la fase protegida despu\xE9s del paro y da la orden inicial de KM1.", "Al pulsar S1 cierra 3\u20134; KM1 inicia la marcha y habilita la primera etapa de estrella.", "Falta la orden inicial, aunque la rama auxiliar de retenci\xF3n est\xE9 conectada.", "\xBFQu\xE9 inicia S1 y qu\xE9 permite mantener el circuito al soltarlo?", ["Distinguir arranque y cambio de conexi\xF3n.", "Incluir el auxiliar de retenci\xF3n de KM1."]);
  return item("Alimentaci\xF3n de la bobina \xB7 KM1", "La salida de S1 llega a A1 de KM1 y al nodo de marcha del circuito.", "Con el retorno A2 completo, KM1 act\xFAa y su auxiliar NA mantiene ese nodo alimentado.", "KM1 no recibe la alimentaci\xF3n prevista y no se habilita la secuencia de marcha.", "\xBFQu\xE9 funci\xF3n tiene KM1 durante las dos etapas y c\xF3mo se mantiene su alimentaci\xF3n?", ["Identificar KM1 como contactor principal.", "Explicar la relaci\xF3n entre S1 y 13\u201314."]);
}

// src/data/lessons.ts
var K12 = "CONTACTOR_TERMICO:";
var K22 = "CONTACTOR_TRIFASICO:";
var BT2 = "BOTONERAS:";
var FU = "FUENTE:";
var MO = "BORNERA_MOTOR:";
var INVERSION = [
  // — Mando de KM1 (marcha 1) —
  [FU + "F", K12 + "95", "Fase al mando por el t\xE9rmico", "La fase F entra al mando pasando por el contacto 95\u201396 del rel\xE9 t\xE9rmico, que es NC. Si el t\xE9rmico dispara, este contacto abre y corta todo el mando."],
  [K12 + "96", BT2 + "S2:1", "Del t\xE9rmico al paro (S2)", "Desde 96 la fase va al pulsador rojo S2. Su contacto 1\u20132 es NC: el mando queda alimentado mientras no pulses el paro."],
  [BT2 + "S2:2", BT2 + "S1:3", "Del paro a marcha 1 (S1)", "S2:2 es el punto \xABprotegido por el paro\xBB: todo lo que sale de aqu\xED se apaga al pulsar S2. Ll\xE9valo al borne 3 de S1 (verde izquierdo), contacto NA 3\u20134."],
  [BT2 + "S1:4", K22 + "71", "Enclavamiento: S1 pasa por KM2", "Al pulsar S1 la fase sale por el borne 4 y debe cruzar el contacto NC 71\u201372 de KM2. Si KM2 est\xE1 activo, ese contacto abre e impide que KM1 entre al mismo tiempo."],
  [K22 + "72", K12 + "A1", "Hacia la bobina de KM1", "Pasado el enclavamiento, la fase llega al borne A1 de la bobina de KM1."],
  [BT2 + "PILOTO_1", K12 + "A1", "L\xE1mpara de KM1 (P1)", "El piloto 1 toma la fase del mismo punto que la bobina: se enciende cuando KM1 est\xE1 activo. Su retorno a N se cablea m\xE1s adelante."],
  [BT2 + "S2:2", K12 + "13", "Retenci\xF3n de KM1: entrada", "El contacto auxiliar NA 13\u201314 de KM1 hace de memoria. Su entrada 13 recibe la fase desde S2:2, despu\xE9s del paro."],
  [K12 + "14", BT2 + "S1:4", "Retenci\xF3n de KM1: salida en paralelo con S1", "14 devuelve la fase a S1:4, en paralelo con el pulsador. Cuando KM1 entra, 13\u201314 cierra y mantiene la bobina aunque sueltes S1."],
  // — Mando de KM2 (marcha 2) —
  [BT2 + "S2:2", BT2 + "S3:3", "Del paro a marcha 2 (S3)", "Misma idea para el giro contrario: la fase protegida por el paro llega al borne 3 de S3 (verde derecho)."],
  [BT2 + "S3:4", K12 + "71", "Enclavamiento: S3 pasa por KM1", "Ahora la fase de S3 cruza el contacto NC 71\u201372 de KM1: con KM1 activo, KM2 no puede entrar."],
  [K12 + "72", K22 + "A1", "Hacia la bobina de KM2", "Pasado el enclavamiento, la fase llega a A1 de la bobina de KM2."],
  [BT2 + "PILOTO_4", K22 + "A1", "L\xE1mpara de KM2 (P4)", "El piloto 4 comparte punto con la bobina de KM2: indica que KM2 (giro inverso) est\xE1 activo."],
  [BT2 + "S2:2", K22 + "13", "Retenci\xF3n de KM2: entrada", "El NA 13\u201314 de KM2 hace la retenci\xF3n del giro inverso; 13 recibe la fase desde S2:2."],
  [K22 + "14", BT2 + "S3:4", "Retenci\xF3n de KM2: salida en paralelo con S3", "14 devuelve la fase a S3:4, en paralelo con el pulsador. KM2 queda retenido hasta que pulses S2."],
  // — Retornos y señalización —
  [K12 + "A2", FU + "N", "Retorno de la bobina de KM1", "A2 va al neutro N: la bobina de 24 V CA queda entre la fase (A1) y el neutro (A2)."],
  [K22 + "A2", FU + "N", "Retorno de la bobina de KM2", "Igual que KM1: A2 de KM2 va al neutro, de modo que su bobina de 24 V CA queda entre A1 (fase) y A2 (neutro)."],
  [BT2 + "N", FU + "N", "Neutro para las l\xE1mparas", "Los pilotos retornan por el borne N de las botoneras; \xFAnelo al neutro de la fuente para cerrar sus circuitos."],
  [FU + "F", K12 + "97", "Fase al aviso de t\xE9rmico disparado", "El contacto 97\u201398 de KM1 es NA: cierra cuando el rel\xE9 t\xE9rmico dispara. Alimenta 97 con la fase."],
  [K12 + "98", BT2 + "PILOTO_3", "L\xE1mpara de t\xE9rmico disparado (P3)", "Al disparar el t\xE9rmico, 97\u201398 cierra y enciende el piloto 3 (amarillo)."],
  [K12 + "96", K12 + "81", "Fase de reposo hacia la cadena de avisos", "Desde 96 (fase si el t\xE9rmico est\xE1 bien) se arma una cadena de contactos NC: primero el 81\u201382 de KM1."],
  [K12 + "82", K22 + "81", "Cadena de reposo: de KM1 a KM2", "La fase sigue por el NC 81\u201382 de KM2. Solo llegar\xE1 al final si ninguno de los dos contactores est\xE1 activo."],
  [K22 + "82", BT2 + "PILOTO_2", "L\xE1mpara de reposo (P2)", "El piloto 2 (rojo) se enciende \xFAnicamente con KM1 y KM2 en reposo y el t\xE9rmico sano."],
  // — Fuerza —
  [FU + "R", K12 + "L1", "Fuerza: R a KM1", "Las tres fases entran al contactor de giro directo. R va a L1."],
  [FU + "S", K12 + "L2", "Fuerza: S a KM1", "La fase S (negra) va a L2. Mant\xE9n el orden R\u2013S\u2013T en L1\u2013L2\u2013L3 para que el giro directo sea el esperado."],
  [FU + "T", K12 + "L3", "Fuerza: T a KM1", "La fase T (roja) va a L3. Con las tres fases en KM1 ya solo falta que su bobina cierre los contactos."],
  [K12 + "L1", K22 + "L1", "Las mismas fases a KM2: L1", "KM2 recibe las fases en el mismo orden que KM1; el cambio de giro se hace a la salida."],
  [K12 + "L2", K22 + "L2", "Las mismas fases a KM2: L2", "La fase S tambi\xE9n llega a L2 de KM2, tomada de L2 de KM1 (la fase central no se intercambia despu\xE9s)."],
  [K12 + "L3", K22 + "L3", "Las mismas fases a KM2: L3", "La fase T llega a L3 de KM2. Con las tres fases en KM2, solo falta cruzar dos a su salida."],
  [K12 + "T1", MO + "U1", "KM1 al motor: U1", "Con KM1 el motor recibe R, S y T en U1, V1 y W1: giro directo."],
  [K12 + "T2", MO + "V1", "KM1 al motor: V1", "T2 (negro) va a V1: la fase S queda en el borne central del motor."],
  [K12 + "T3", MO + "W1", "KM1 al motor: W1", "T3 (rojo) va a W1. Con KM1 cerrado el motor recibe R\u2013S\u2013T en U1\u2013V1\u2013W1."],
  [K22 + "T1", K12 + "T3", "KM2 invierte: T1 a W1", "Para invertir el giro basta intercambiar dos fases. La salida T1 de KM2 (fase R) se une con T3 de KM1, que va a W1."],
  [K22 + "T3", K12 + "T1", "KM2 invierte: T3 a U1", "La salida T3 de KM2 (fase T) se une con T1 de KM1, que va a U1. Con KM2 activo el motor recibe T, S y R: gira al rev\xE9s."],
  [K22 + "T2", K12 + "T2", "KM2: T2 queda igual", "La fase central no se cambia: T2 de KM2 con T2 de KM1."],
  [MO + "W2", MO + "U2", "Motor en estrella (1)", "Unir W2 con U2 es la primera mitad del puente de estrella."],
  [MO + "V2", MO + "U2", "Motor en estrella (2)", "Con W2, U2 y V2 unidos las tres bobinas quedan en estrella y el motor puede girar en los dos sentidos."],
  // — Tierras de protección —
  [MO + "TP", K22 + "TP_DER", "Tierra del motor", "Las tierras de protecci\xF3n (TP, verdes) se unen entre los m\xF3dulos y terminan en la tierra de la fuente. No cambian el funcionamiento del simulador."],
  [K22 + "TP_IZQ", K12 + "TP_DER", "Tierra entre KM2 y KM1", "Contin\xFAa la cadena de tierras: la tierra izquierda de KM2 se une con la tierra derecha de KM1."],
  [K12 + "TP_DER", FU + "TP", "Tierra de KM1 a la fuente", "La cadena llega a la tierra de protecci\xF3n de la fuente."],
  [K22 + "TP_DER", K22 + "TP_IZQ", "Tierra de KM2: lado derecho", "Une las dos tierras del m\xF3dulo de KM2 entre s\xED, de modo que toda la hilera de tierras queda unida."],
  [BT2 + "TP_DER", FU + "TP", "Tierra de las botoneras", "\xDAltima conexi\xF3n: las botoneras tambi\xE9n quedan a tierra."]
];
var SIMPLE = [
  // — Mando de KM1 —
  [FU + "F", K12 + "95", "Fase al mando por el t\xE9rmico", "La fase F entra al mando pasando por el contacto 95\u201396 del rel\xE9 t\xE9rmico, que es NC. Si el t\xE9rmico dispara, este contacto abre y corta todo el mando."],
  [K12 + "96", K12 + "71", "Fase hacia el aviso de reposo", "Desde 96 (hay fase mientras el t\xE9rmico est\xE9 sano) se alimenta el contacto NC 71\u201372 de KM1. Cuando KM1 est\xE9 en reposo, ese contacto estar\xE1 cerrado."],
  [K12 + "72", BT2 + "PILOTO_2", "L\xE1mpara de reposo (P2)", "El piloto 2 (rojo) se enciende solo con KM1 en reposo: la fase llega por 71\u201372, que est\xE1 cerrado. Cuando KM1 entra, 71\u201372 abre y P2 se apaga."],
  [BT2 + "N", FU + "N", "Neutro para las l\xE1mparas", "Los pilotos retornan por el borne N de las botoneras; \xFAnelo al neutro de la fuente para cerrar sus circuitos."],
  [K12 + "96", BT2 + "S2:1", "Del t\xE9rmico al paro (S2)", "Desde 96 la fase va al pulsador rojo S2. Su contacto 1\u20132 es NC: el mando queda alimentado mientras no pulses el paro."],
  [BT2 + "S2:2", BT2 + "S1:3", "Del paro a la marcha (S1)", "S2:2 es el punto \xABprotegido por el paro\xBB: todo lo que sale de aqu\xED se apaga al pulsar S2. Ll\xE9valo al borne 3 de S1 (verde izquierdo), contacto NA 3\u20134."],
  [BT2 + "S1:4", K12 + "A1", "A la bobina de KM1", "Al pulsar S1 la fase sale por el borne 4 y llega a A1, el borne de la bobina de KM1."],
  [K12 + "A2", FU + "N", "Retorno de la bobina", "A2 va al neutro N: la bobina de 24 V CA queda entre la fase (A1) y el neutro (A2). Con S1 pulsado, KM1 ya deber\xEDa entrar."],
  [BT2 + "S2:2", K12 + "13", "Retenci\xF3n: entrada", "El contacto auxiliar NA 13\u201314 de KM1 hace de memoria. Su entrada 13 recibe la fase desde S2:2, despu\xE9s del paro."],
  [K12 + "14", BT2 + "S1:4", "Retenci\xF3n: salida en paralelo con S1", "14 devuelve la fase a S1:4, en paralelo con el pulsador. Cuando KM1 entra, 13\u201314 cierra y mantiene la bobina aunque sueltes S1; solo el paro la suelta."],
  [K12 + "A1", BT2 + "PILOTO_1", "L\xE1mpara de KM1 (P1)", "El piloto 1 toma la fase del mismo punto que la bobina: se enciende cuando KM1 est\xE1 activo."],
  [FU + "F", K12 + "97", "Fase al aviso de t\xE9rmico disparado", "El contacto 97\u201398 de KM1 es NA: cierra cuando el rel\xE9 t\xE9rmico dispara. Alimenta 97 con la fase."],
  [K12 + "98", BT2 + "PILOTO_3", "L\xE1mpara de t\xE9rmico disparado (P3)", "Al disparar el t\xE9rmico, 97\u201398 cierra y enciende el piloto 3 (amarillo)."],
  // — Fuerza —
  [FU + "R", K12 + "L1", "Fuerza: R a KM1", "Las tres fases entran al contactor. R (azul) va a L1."],
  [FU + "S", K12 + "L2", "Fuerza: S a KM1", "La fase S (negra) va a L2. Mant\xE9n el orden R\u2013S\u2013T en L1\u2013L2\u2013L3."],
  [FU + "T", K12 + "L3", "Fuerza: T a KM1", "La fase T (roja) va a L3. Con las tres fases en KM1, solo falta que su bobina cierre los contactos."],
  [K12 + "T1", MO + "U1", "KM1 al motor: U1", "Con KM1 cerrado, T1 entrega la fase R al borne U1 del motor."],
  [K12 + "T2", MO + "V1", "KM1 al motor: V1", "T2 (negro) va a V1: la fase S queda en el borne central del motor."],
  [K12 + "T3", MO + "W1", "KM1 al motor: W1", "T3 (rojo) va a W1. Con KM1 cerrado el motor recibe R\u2013S\u2013T en U1\u2013V1\u2013W1."],
  [MO + "W2", MO + "U2", "Motor en estrella (1)", "Unir W2 con U2 es la primera mitad del puente de estrella."],
  [MO + "V2", MO + "U2", "Motor en estrella (2)", "Con W2, U2 y V2 unidos las tres bobinas quedan en estrella y el motor puede girar."],
  // — Tierras de protección —
  [MO + "TP", K12 + "TP_DER", "Tierra del motor", "Las tierras de protecci\xF3n (TP, verdes) se unen entre los m\xF3dulos y terminan en la tierra de la fuente. No cambian el funcionamiento del simulador."],
  [K12 + "TP_DER", FU + "TP", "Tierra de KM1 a la fuente", "La cadena llega a la tierra de protecci\xF3n de la fuente."],
  [BT2 + "TP_DER", FU + "TP", "Tierra de las botoneras", "\xDAltima conexi\xF3n: las botoneras tambi\xE9n quedan a tierra."]
];
var point = (id) => {
  const [module, ...rest] = id.split(":"), terminal = rest.join(":"), found = leccionInversion_layout_default.modules.find((m) => m.id === module)?.terminals.find((t) => t.id === terminal);
  if (!found) throw new Error(`Terminal sin posici\xF3n en el mapa de la lecci\xF3n: ${id}`);
  return found;
};
var clamp = (v) => Math.max(0, Math.min(1e3, v));
function regionFor(from, to) {
  const a = point(from), b = point(to), pad = 62, x0 = Math.min(a.x, b.x) - pad, x1 = Math.max(a.x, b.x) + pad, y0 = Math.min(a.y, b.y) - pad, y1 = Math.max(a.y, b.y) + pad;
  const nx = (v) => clamp(v / leccionInversion_layout_default.width * 1e3), ny = (v) => clamp(v / leccionInversion_layout_default.height * 1e3);
  return { x: Math.round(nx(x0)), y: Math.round(ny(y0)), w: Math.round(nx(x1) - nx(x0)), h: Math.round(ny(y1) - ny(y0)) };
}
function buildLesson(id, schematic, title, summary, diagram, seeds) {
  return {
    id,
    schematic,
    title,
    summary,
    diagram,
    pairs: seeds.map(([from, to]) => [from, to]),
    steps: seeds.map(([from, to, stepTitle, explanation], i) => ({ id: `${id}-${String(i + 1).padStart(2, "0")}`, title: stepTitle, from, to, region: regionFor(from, to), explanation, review: "user_reviewed" }))
  };
}
var INVERSION_LESSON = buildLesson(
  "inversion",
  "inversion",
  "Lecci\xF3n \xB7 Inversi\xF3n de giro con enclavamiento",
  "Marcha 1 (KM1), marcha 2 (KM2) y paro, con enclavamiento y l\xE1mparas. Basada en el circuito armado por un compa\xF1ero.",
  { id: "leccion-inversion-giro", name: "Mapa de bornes \xB7 inversi\xF3n de giro", src: "/diagrams/leccion-inversion-giro.png", origin: "class_photo" },
  INVERSION
);
var SIMPLE_LESSON = buildLesson(
  "simple",
  "simple",
  "Lecci\xF3n \xB7 Marcha y paro con retenci\xF3n",
  "El circuito m\xE1s simple del banco: un contactor (KM1 con t\xE9rmico), marcha, paro, retenci\xF3n y l\xE1mparas. Armado por un compa\xF1ero.",
  { id: "leccion-marcha-paro", name: "Mapa de bornes \xB7 marcha y paro", src: "/diagrams/leccion-marcha-paro.png", origin: "class_photo" },
  SIMPLE
);
function buildStarLesson(id) {
  const source2 = starDeltaSources_default[id];
  const pairs = source2.pairs;
  return {
    id,
    schematic: id,
    title: `Lecci\xF3n \xB7 ${source2.title}`,
    summary: source2.summary,
    needs: ["CONTACTOR_TRIFASICO_3"],
    diagram: { id: `leccion-${id}`, name: source2.title, src: `/diagrams/leccion-${id === "estrellaManual" ? "estrella-manual" : "estrella-temporizador"}.png`, origin: "class_photo" },
    pairs,
    steps: pairs.map(([from, to], i) => {
      const detail = starDetail(id, from, to);
      return { id: `${id}-${String(i + 1).padStart(2, "0")}`, from, to, title: detail.title, explanation: detail.why, review: "user_reviewed", region: { x: 0, y: 0, w: 1e3, h: 1e3 } };
    })
  };
}
var STAR_MANUAL_LESSON = buildStarLesson("estrellaManual");
var STAR_TIMER_LESSON = buildStarLesson("estrellaTimer");
var LESSONS = { simple: SIMPLE_LESSON, inversion: INVERSION_LESSON, estrellaManual: STAR_MANUAL_LESSON, estrellaTimer: STAR_TIMER_LESSON };
var MODULE_NAMES = { FUENTE: "Fuente", BOTONERAS: "Botoneras", CONTACTOR_TERMICO: "KM1", CONTACTOR_TRIFASICO: "KM2", CONTACTOR_TRIFASICO_3: "KM3", TEMPORIZADOR_1: "KT1", BORNERA_MOTOR: "Motor" };
function terminalLabel(id) {
  const [module, ...rest] = id.split(":"), terminal = rest.join(":"), name = MODULE_NAMES[module] ?? module, pushbutton = terminal.match(/^(S[123]):([1-4])$/);
  return `${name} \xB7 ${pushbutton ? `${pushbutton[1]} borne ${pushbutton[2]}` : terminal.replace("PILOTO_", "piloto ").replace(/^TP_.+$/, "TP")}`;
}
var LESSON_MAP_RATIO = leccionInversion_layout_default.height / leccionInversion_layout_default.width;

// src/data/learning.ts
var newLearning = () => ({ mode: "free", index: 0, assistance: 1, bindings: {}, examFinished: false, answers: {} });
var portKey = cadePortKey;
var UNIQUE_PORTS = [...new Map(CADE_PORTS.filter((p) => p.terminal).map((p) => [portKey(p), p])).values()];
var LABEL_BINDINGS = DEFAULT_CADE_BINDINGS;
var visited = /* @__PURE__ */ new Set();
var geometricNets = CADE_WIRES.flatMap((w) => {
  if (visited.has(w.id)) return [];
  const net = cadeNetwork(w.id);
  net.wires.forEach((a) => visited.add(a.id));
  return [{ id: Math.min(...net.wires.map((a) => a.id)), lineIds: net.wires.map((a) => a.id), ports: net.ports }];
}).sort((a, b) => a.id - b.id);
var LEARNING_NETS = geometricNets.reduce((groups, net) => {
  const related = groups.filter((g) => g.ports.some((p) => net.ports.some((q) => portKey(p) === portKey(q))));
  const merged = [net, ...related];
  return [...groups.filter((g) => !related.includes(g)), { id: Math.min(...merged.map((n) => n.id)), lineIds: merged.flatMap((n) => n.lineIds), ports: [...new Map(merged.flatMap((n) => n.ports).map((p) => [portKey(p), p])).values()] }];
}, []).sort((a, b) => a.id - b.id);
function pairsForTerminals(terminals) {
  const parent = new Map(terminals.map((id) => [id, id])), root = (id) => parent.get(id) === id ? id : root(parent.get(id));
  const pairs = [];
  const add = (from, to) => {
    if (!parent.has(from) || !parent.has(to) || root(from) === root(to)) return;
    parent.set(root(from), root(to));
    pairs.push({ from, to });
  };
  SIMPLE_LESSON.pairs.forEach(([from, to]) => add(from, to));
  terminals.slice(1).forEach((to, i) => add(terminals[i], to));
  return pairs;
}
function mapNet(net, bindings) {
  const map = { ...LABEL_BINDINGS, ...bindings };
  const terminals = [...new Set(net.ports.map((p) => map[portKey(p)]).filter((id) => TERMINAL_BY_ID.has(id)))];
  if (net.ports.some((p) => portKey(p) === "-M:PE") && !net.ports.some((p) => Object.hasOwn(bindings, portKey(p)))) terminals.push(...["CONTACTOR_TERMICO:TP_DER", "BOTONERAS:TP_DER"].filter((id) => TERMINAL_BY_ID.has(id)));
  return { ...net, terminals, missing: net.ports.filter((p) => !TERMINAL_BY_ID.has(map[portKey(p)])), pairs: pairsForTerminals(terminals) };
}
function routeForLine(id, bindings = {}) {
  const net = LEARNING_NETS.find((n) => n.lineIds.includes(id));
  return net ? mapNet(net, bindings) : void 0;
}
function learningModel(bindings = {}) {
  const mapped = LEARNING_NETS.map((net) => mapNet(net, bindings));
  return mapped.reduce((groups, net) => {
    let merged = net, remaining = groups;
    for (; ; ) {
      const related = remaining.filter((g) => g.terminals.some((id) => merged.terminals.includes(id)));
      if (!related.length) break;
      const all = [merged, ...related];
      remaining = remaining.filter((g) => !related.includes(g));
      merged = { id: Math.min(...all.map((g) => g.id)), lineIds: all.flatMap((g) => g.lineIds), ports: all.flatMap((g) => g.ports), terminals: [...new Set(all.flatMap((g) => g.terminals))], missing: all.flatMap((g) => g.missing), pairs: [] };
    }
    merged.pairs = pairsForTerminals(merged.terminals);
    return [...remaining, merged];
  }, []).sort((a, b) => a.id - b.id);
}
var netForLine = (id, model) => model.find((n) => n.lineIds.includes(id));
function canBind(key2, id, bindings) {
  if (!UNIQUE_PORTS.some((p) => portKey(p) === key2) || id && !TERMINAL_BY_ID.has(id)) return false;
  return !bindingConflict(key2, id, bindings);
}
function shortedNodes(wires, bindings) {
  const map = { ...LABEL_BINDINGS, ...bindings };
  const sources = CADE_SYMBOLS.filter((o) => [3e3, 3001, 3002, 3004].includes(o.type));
  const sourcePorts = CADE_PORTS.filter((p) => sources.some((o) => o.id === p.objectId));
  return [...cableNodes(wires).values()].filter((ids) => {
    const potentials = new Set(sourcePorts.filter((p) => ids.includes(map[portKey(p)])).map((p) => p.terminal));
    return potentials.size > 1;
  });
}
function assessCable(wire, wires, model, bindings) {
  const component = [...cableNodes(wires).values()].find((ids) => ids.includes(wire.from.terminalId)) || [];
  if (shortedNodes(wires, bindings).some((ids) => ids.includes(wire.from.terminalId))) return "short";
  const membership = (id) => model.filter((n) => n.terminals.includes(id));
  const a = membership(wire.from.terminalId), b = membership(wire.to.terminalId);
  if (!a.length || !b.length) return "unknown";
  const known = component.filter((id) => membership(id).length);
  if (!model.some((n) => known.every((id) => n.terminals.includes(id)))) return "incorrect";
  return a.some((n) => b.includes(n)) ? "correct" : "incorrect";
}
function netComplete(net, wires, model, bindings) {
  if (net.missing.length || !net.pairs.length) return false;
  return net.pairs.every((p) => connectedByCables(p.from, p.to, wires)) && wires.filter((w) => net.terminals.includes(w.from.terminalId) || net.terminals.includes(w.to.terminalId)).every((w) => assessCable(w, wires, model, bindings) === "correct");
}
function nextPair(net, wires) {
  return net.pairs.find((p) => !connectedByCables(p.from, p.to, wires));
}
function routePairs(nets, wires) {
  return nets.flatMap((net) => net.pairs.map((pair, index) => ({ ...pair, netId: net.id, index, installed: connectedByCables(pair.from, pair.to, wires) })));
}
function explainNet(net) {
  const keys = net.ports.map(portKey);
  if (keys.includes("-M:W2")) return "El esquema re\xFAne W2, U2 y V2 en un punto com\xFAn del motor. Constr\xFAyelo con dos puentes; puedes cambiar el borne que sirve como punto de uni\xF3n.";
  if (keys.includes("-F:95")) return "Este conductor lleva la salida de Q al borne 95 de la protecci\xF3n. La l\xEDnea termina en el contacto: no sustituye el contacto 95\u201396.";
  if (keys.includes("-F:96")) return "Desde 96 el mando llega a la parada y a la rama auxiliar indicada. La bifurcaci\xF3n es un mismo nodo, aunque se dibuje en varios tramos.";
  if (keys.includes("-SB2:13")) return "La salida de la parada alimenta la marcha y el auxiliar de mantenimiento. Dos ramas nacen de un punto compartido; no son alimentaciones distintas.";
  if (keys.includes("-KM1:A1")) return "Las salidas de marcha y del auxiliar se re\xFAnen antes de A1 y del piloto H1. Une los extremos de esta red sin puentear la bobina A1\u2013A2.";
  if (keys.includes("-KM1:A2")) return "A2 y los retornos X2 de los pilotos llegan al retorno N. Los puentes pueden compartir bornes; N permanece separado de la protecci\xF3n PE.";
  if (keys.includes("-F:98")) return "La salida 98 de la protecci\xF3n llega al piloto H2. Este conductor une dispositivos; el contacto 97\u201398 permanece como un s\xEDmbolo separado.";
  if (keys.includes("-KM1:12")) return "La salida del auxiliar KM1:12 llega al piloto H3:X1. Reconoce la referencia KM1 antes de buscar el borne en el panel.";
  if (keys.some((k) => k.endsWith(":PE"))) return "Sigue la protecci\xF3n PE entre la referencia de tierra y el motor. No la confundas con el retorno N.";
  if (keys.some((k) => /^\-M:[UVW]1$/.test(k))) return "Esta fase sale de la protecci\xF3n F y llega al terminal identificado del motor. Mant\xE9n separadas las tres fases y distingue entrada de salida.";
  return "Sigue esta fase de potencia entre los dos dispositivos indicados. La l\xEDnea acaba en sus bornes; los contactos internos se leen como s\xEDmbolos, no como puentes.";
}
var drawingGraph = /* @__PURE__ */ new Map();
var pointKey = (p) => `@${p.x},${p.y}`;
var link = (a, b, line) => {
  drawingGraph.set(a, [...drawingGraph.get(a) || [], { to: b, line }]);
  drawingGraph.set(b, [...drawingGraph.get(b) || [], { to: a, line }]);
};
var points = [...CADE_PORTS, ...CADE_JUNCTIONS, ...CADE_WIRES.flatMap((w) => [{ x: w.x, y: w.y }, { x: w.x2, y: w.y2 }])];
for (const w of CADE_WIRES) {
  const on = points.filter((p) => Math.abs((w.x2 - w.x) * (p.y - w.y) - (w.y2 - w.y) * (p.x - w.x)) < 1e-3 && p.x >= Math.min(w.x, w.x2) && p.x <= Math.max(w.x, w.x2) && p.y >= Math.min(w.y, w.y2) && p.y <= Math.max(w.y, w.y2));
  const sorted = [...new Map(on.map((p) => [pointKey(p), p])).values()].sort((a, b) => Math.hypot(a.x - w.x, a.y - w.y) - Math.hypot(b.x - w.x, b.y - w.y));
  sorted.slice(1).forEach((p, i) => link(pointKey(sorted[i]), pointKey(p), w.id));
}
CADE_PORTS.forEach((p) => link(portKey(p), pointKey(p), null));
function completedDiagramLines(wires, model, bindings) {
  const inverse = new Map(Object.entries({ ...LABEL_BINDINGS, ...bindings }).filter(([, id]) => id).map(([key2, id]) => [id, key2]));
  const complete = /* @__PURE__ */ new Set(), covered = /* @__PURE__ */ new Set();
  const edgeKey = (a, b, line) => `${line}|${[a, b].sort().join("|")}`;
  for (const w of wires) {
    if (assessCable(w, wires, model, bindings) !== "correct") continue;
    const from = inverse.get(w.from.terminalId), to = inverse.get(w.to.terminalId);
    if (!from || !to) continue;
    const previous = /* @__PURE__ */ new Map(), queue = [from], seen = new Set(queue);
    for (let i = 0; i < queue.length && !seen.has(to); i++) for (const edge of drawingGraph.get(queue[i]) || []) {
      if (seen.has(edge.to)) continue;
      seen.add(edge.to);
      previous.set(edge.to, { node: queue[i], line: edge.line });
      queue.push(edge.to);
    }
    if (!seen.has(to)) continue;
    let current2 = to;
    while (current2 !== from) {
      const edge = previous.get(current2);
      if (edge.line !== null) covered.add(edgeKey(current2, edge.node, edge.line));
      current2 = edge.node;
    }
  }
  for (const line of CADE_WIRES) {
    const edges = [...drawingGraph].flatMap(([a, list]) => list.filter((e) => e.line === line.id).map((e) => edgeKey(a, e.to, line.id)));
    if (edges.length && edges.every((key2) => covered.has(key2))) complete.add(line.id);
  }
  for (const net of model) if (netComplete(net, wires, model, bindings)) net.lineIds.forEach((id) => complete.add(id));
  return [...complete];
}
var EXPLANATION_QUESTIONS = [
  "\xBFQu\xE9 diferencia hay entre un conductor y el contacto 95\u201396? \xBFPor qu\xE9 no se puentea el contacto?",
  "\xBFQu\xE9 representan las dos ramas en paralelo entre marcha y el auxiliar KM1:13\u201314?",
  "\xBFPor qu\xE9 una red con tres bornes puede construirse con dos puentes en distinto orden?",
  "\xBFQu\xE9 funci\xF3n tiene A1\u2013A2 y por qu\xE9 no debes unirlos con un cable?"
];

// src/data/lessonSchematics.ts
var LESSON_SCHEMATICS = LESSON_CADES;
var key = (p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
var onSegment = (p, a, b) => Math.abs((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) < 1e-3 && p.x >= Math.min(a.x, b.x) - 1e-3 && p.x <= Math.max(a.x, b.x) + 1e-3 && p.y >= Math.min(a.y, b.y) - 1e-3 && p.y <= Math.max(a.y, b.y) + 1e-3;
var graphs = /* @__PURE__ */ new Map();
function graphOf(cade) {
  const cached = graphs.get(cade);
  if (cached) return cached;
  const special = [...cade.JUNCTIONS.map((j) => ({ x: j.x, y: j.y })), ...cade.PORTS.map((p) => ({ x: p.x, y: p.y })), ...cade.WIRES.flatMap((w) => [{ x: w.x, y: w.y }, { x: w.x2, y: w.y2 }])];
  const edges = /* @__PURE__ */ new Map(), at = /* @__PURE__ */ new Map();
  const link2 = (a, b, wire) => {
    const ka = key(a), kb = key(b);
    if (ka === kb) return;
    at.set(ka, a);
    at.set(kb, b);
    (edges.get(ka) ?? edges.set(ka, []).get(ka)).push({ to: kb, wire });
    (edges.get(kb) ?? edges.set(kb, []).get(kb)).push({ to: ka, wire });
  };
  for (const w of cade.WIRES) {
    const a = { x: w.x, y: w.y }, b = { x: w.x2, y: w.y2 }, on = special.filter((p) => onSegment(p, a, b));
    const unique = new Map(on.map((p) => [key(p), p]));
    unique.set(key(a), a);
    unique.set(key(b), b);
    const t = (p) => b.x - a.x || b.y - a.y ? ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / ((b.x - a.x) ** 2 + (b.y - a.y) ** 2) : 0;
    const ordered = [...unique.values()].sort((p, q) => t(p) - t(q));
    for (let i = 1; i < ordered.length; i++) link2(ordered[i - 1], ordered[i], w.id);
  }
  const ports = /* @__PURE__ */ new Map();
  for (const p of cade.PORTS) if (p.panel) (ports.get(p.panel) ?? ports.set(p.panel, []).get(p.panel)).push(p);
  const g = { edges, at, ports };
  graphs.set(cade, g);
  return g;
}
function traceStep(cade, from, to) {
  const g = graphOf(cade), starts = g.ports.get(from) ?? [], goals = g.ports.get(to) ?? [];
  let best = null;
  for (const s of starts) {
    const origin = key(s), prev = /* @__PURE__ */ new Map([[origin, null]]), queue = [origin];
    while (queue.length) {
      const here = queue.shift();
      for (const e of g.edges.get(here) ?? []) if (!prev.has(e.to)) {
        prev.set(e.to, { from: here, wire: e.wire });
        queue.push(e.to);
      }
    }
    for (const goal of goals) {
      const target = key(goal);
      if (!prev.has(target)) continue;
      const wires = [];
      for (let k = target; prev.get(k); k = prev.get(k).from) wires.unshift(prev.get(k).wire);
      const unique = [...new Set(wires)];
      if (!best || unique.length < best.wires.length) best = { wires: unique, ends: [{ x: s.x, y: s.y }, { x: goal.x, y: goal.y }] };
    }
  }
  return best;
}
var traceCache = /* @__PURE__ */ new Map();
function lessonTraces(lesson) {
  let traces = traceCache.get(lesson.id);
  if (!traces) {
    const cade = LESSON_SCHEMATICS[lesson.schematic];
    traces = lesson.steps.map((s) => traceStep(cade, s.from, s.to));
    traceCache.set(lesson.id, traces);
  }
  return traces;
}
function lessonProgress(lesson, stepIndex, wires) {
  const traces = lessonTraces(lesson), active = traces[stepIndex], done = /* @__PURE__ */ new Set();
  lesson.steps.forEach((s, i) => {
    if (i !== stepIndex && traces[i] && connectedByCables(s.from, s.to, wires)) traces[i].wires.forEach((id) => done.add(id));
  });
  const activeIds = new Set(active?.wires ?? []);
  return { active: [...activeIds], done: [...done].filter((id) => !activeIds.has(id)), ends: active?.ends ?? [] };
}
function stepsForWire(lesson, wireId) {
  const traces = lessonTraces(lesson);
  return lesson.steps.filter((_, i) => traces[i]?.wires.includes(wireId));
}
function stepsForSymbol(lesson, symbolId) {
  const cade = LESSON_SCHEMATICS[lesson.schematic], keys = new Set(cade.PORTS.filter((p) => p.objectId === symbolId && p.panel).map((p) => p.panel));
  return lesson.steps.filter((s) => keys.has(s.from) || keys.has(s.to));
}
export {
  BANANA_COLOR,
  BASE_MODULE_IDS,
  CADE,
  CADE_DRAWINGS,
  CADE_JUNCTIONS,
  CADE_PORTS,
  CADE_QUESTIONS,
  CADE_SYMBOLS,
  CADE_WIRES,
  CLASS_DIAGRAMS,
  COLOR_HEX,
  CONFIRMED_MODULE_ALIASES,
  CONNECTOR_PENDING,
  DEFAULT_CADE_BINDINGS,
  ESTRELLA_CADE,
  EXPLANATION_QUESTIONS,
  EXTRA_KINDS,
  IDENTIFICATION_STEPS,
  INVERSION_LESSON,
  LABEL_BINDINGS,
  LEARNING_NETS,
  LESSONS,
  LESSON_CADES,
  LESSON_MAP_RATIO,
  LESSON_SCHEMATICS,
  MAX_EXTRA_MODULES,
  MODULES,
  PERFECTO_CADE,
  PORT_COUNT,
  RETIRED_MODULES,
  RETIRED_TERMINAL_IDS,
  SIMPLE_LESSON,
  STAR_MANUAL_LESSON,
  STAR_TIMER_LESSON,
  TERMINALS,
  TERMINAL_BY_ID,
  UNIQUE_PORTS,
  VERIFICATION_INFO,
  assessCable,
  bindingConflict,
  buildExtraModule,
  cableGeometry,
  cableNodes,
  cablePath,
  cadeNetwork,
  cadePortKey,
  cadePorts,
  canBind,
  completedDiagramLines,
  connectedByCables,
  createCable,
  createCade,
  emptyPractice,
  explainNet,
  extraKindOf,
  indexCableEndpoints,
  isExtraModuleId,
  learningModel,
  lessonProgress,
  lessonTraces,
  matchesTerminal,
  migrateCadeBindings,
  netComplete,
  netForLine,
  networkFor,
  newLearning,
  nextExtraNumber,
  nextPair,
  portKey,
  readPractice,
  registerModule,
  routeForLine,
  routePairs,
  stepsForSymbol,
  stepsForWire,
  terminalDisplay,
  terminalKey,
  terminalLabel,
  terminalLabelPosition,
  terminalPoint,
  traceStep,
  unregisterModule
};
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
