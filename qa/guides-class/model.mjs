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
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
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
    function ReactElement(type, key, props) {
      var refProp = props.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
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
    function escape(key) {
      var escaperLookup = { "=": "=0", ":": "=2" };
      return "$" + key.replace(/[=:]/g, function(match) {
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
      var props = assign({}, element.props), key = element.key;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
      var propName = arguments.length - 2;
      if (1 === propName) props.children = children;
      else if (1 < propName) {
        for (var childArray = Array(propName), i = 0; i < propName; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      return ReactElement(element.type, key, props);
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
      var propName, props = {}, key = null;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
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
      return ReactElement(type, key, props);
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
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
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
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
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
        var props = assign({}, element.props), key = element.key, owner = element._owner;
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
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
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
          key,
          props,
          owner,
          element._debugStack,
          element._debugTask
        );
        for (key = 2; key < arguments.length; key++)
          validateChildKeys(arguments[key]);
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
        var key = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)
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
        key && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        (propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++) ? (childArray = Error.stackTraceLimit, Error.stackTraceLimit = 10, childrenLength = Error("react-stack-top-frame"), Error.stackTraceLimit = childArray) : childrenLength = unknownOwnerDebugStack;
        return ReactElement(
          type,
          key,
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

// src/data/activity2Matias.json
var activity2Matias_default = {
  title: "Ejemplo virtual \xB7 Arranque estrella-tri\xE1ngulo con temporizador",
  wires: [
    {
      id: "cce54ab9-4f71-4c06-bfe6-5faa4ba14ab6",
      from: {
        terminalId: "FUENTE:F"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:95"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 1
    },
    {
      id: "90ad760e-5a45-40ee-ba70-8762e1935559",
      from: {
        terminalId: "CONTACTOR_TERMICO:96"
      },
      to: {
        terminalId: "BOTONERAS:S2:1"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 2
    },
    {
      id: "ec1a558f-35c0-41a4-8305-568fc4874ca4",
      from: {
        terminalId: "BOTONERAS:S2:2"
      },
      to: {
        terminalId: "BOTONERAS:S1:3"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 3
    },
    {
      id: "06ee4d18-2fdf-449b-be29-c645297972be",
      from: {
        terminalId: "BOTONERAS:S1:4"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:A1"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 4
    },
    {
      id: "3241a752-925f-4ef8-94da-e6b05ce70c21",
      from: {
        terminalId: "TEMPORIZADOR_1:A2"
      },
      to: {
        terminalId: "FUENTE:N"
      },
      color: "#2978c8",
      route: {
        sag: 130
      },
      layer: 5
    },
    {
      id: "5100b61d-1ac4-4b75-8d83-f7b1b1c3c2f0",
      from: {
        terminalId: "BOTONERAS:S2:2"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:13"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 7
    },
    {
      id: "f3bbad2c-05ee-48fe-af37-78254cd70a92",
      from: {
        terminalId: "TEMPORIZADOR_1:14"
      },
      to: {
        terminalId: "BOTONERAS:S1:4"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 8
    },
    {
      id: "f454b964-02f9-4e33-9374-00deae41d2f3",
      from: {
        terminalId: "BOTONERAS:S1:4"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:55"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 9
    },
    {
      id: "6e80c1cb-ffa3-4158-bfd7-98f3aa44934f",
      from: {
        terminalId: "TEMPORIZADOR_1:56"
      },
      to: {
        terminalId: "CONTACTOR_TRIFASICO:71"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 10
    },
    {
      id: "e180980d-ce8b-4490-8a4e-65338f01f929",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:72"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:A1"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 11
    },
    {
      id: "779250c0-c67e-4dd0-a3c9-5be31308196b",
      from: {
        terminalId: "CONTACTOR_TERMICO:A2"
      },
      to: {
        terminalId: "FUENTE:N"
      },
      color: "#2978c8",
      route: {
        sag: 130
      },
      layer: 12
    },
    {
      id: "dee86745-f7b3-47f0-8175-73f5ac01f546",
      from: {
        terminalId: "BOTONERAS:S1:4"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:67"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 13
    },
    {
      id: "57e9fcfa-22e4-449e-89aa-265d000ef691",
      from: {
        terminalId: "TEMPORIZADOR_1:68"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:71"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 14
    },
    {
      id: "a9f54ed8-e362-4fa9-b0b7-de2c3c5ca582",
      from: {
        terminalId: "CONTACTOR_TERMICO:72"
      },
      to: {
        terminalId: "CONTACTOR_TRIFASICO:A1"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 15
    },
    {
      id: "e545aa2c-fc9b-4db9-a908-72115e5e342b",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:A2"
      },
      to: {
        terminalId: "FUENTE:N"
      },
      color: "#2978c8",
      route: {
        sag: 130
      },
      layer: 16
    },
    {
      id: "95a76639-014b-4769-a742-89fe605013ad",
      from: {
        terminalId: "BOTONERAS:N"
      },
      to: {
        terminalId: "FUENTE:N"
      },
      color: "#2978c8",
      route: {
        sag: 130
      },
      layer: 17
    },
    {
      id: "939d360a-33a1-44b3-a712-a3a99f88a2e0",
      from: {
        terminalId: "FUENTE:R"
      },
      to: {
        terminalId: "CONTACTOR_TRIFASICO:L1"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 18
    },
    {
      id: "b46e148f-d522-4e35-a0d5-1e3fe3a23474",
      from: {
        terminalId: "FUENTE:S"
      },
      to: {
        terminalId: "CONTACTOR_TRIFASICO:L2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 19
    },
    {
      id: "c791ebf2-b72a-4184-8159-8fc31270794d",
      from: {
        terminalId: "FUENTE:T"
      },
      to: {
        terminalId: "CONTACTOR_TRIFASICO:L3"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 20
    },
    {
      id: "ecc8b2e5-95ec-4396-bc8b-b74f0424e17c",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:T1"
      },
      to: {
        terminalId: "BORNERA_MOTOR:W2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 21
    },
    {
      id: "f1925e3e-9c54-438d-96e6-e0575f308bdc",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:T2"
      },
      to: {
        terminalId: "BORNERA_MOTOR:U2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 22
    },
    {
      id: "daf89e3f-e776-4593-ad8e-87c22b89847c",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:T3"
      },
      to: {
        terminalId: "BORNERA_MOTOR:V2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 23
    },
    {
      id: "8db2bb10-3d50-42fb-afb8-2b0995aed07b",
      from: {
        terminalId: "FUENTE:R"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:L1"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 24
    },
    {
      id: "af86409f-7b50-41e9-883a-25c239896357",
      from: {
        terminalId: "FUENTE:S"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:L2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 25
    },
    {
      id: "aa59b0e6-07b8-4c3a-8fb3-fa84852f6437",
      from: {
        terminalId: "FUENTE:T"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:L3"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 26
    },
    {
      id: "ac8b750f-de15-4014-bf26-0c10cf219385",
      from: {
        terminalId: "TEMPORIZADOR_1:T1"
      },
      to: {
        terminalId: "BORNERA_MOTOR:U1"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 27
    },
    {
      id: "27cad97c-1f58-4280-9f8e-08b43b922944",
      from: {
        terminalId: "TEMPORIZADOR_1:T2"
      },
      to: {
        terminalId: "BORNERA_MOTOR:V1"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 28
    },
    {
      id: "8bb21bdf-2623-4292-9536-4ebc7645d47d",
      from: {
        terminalId: "TEMPORIZADOR_1:T3"
      },
      to: {
        terminalId: "BORNERA_MOTOR:W1"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 29
    },
    {
      id: "b0c3ab15-8f7e-4637-af9b-d0f3efff3a87",
      from: {
        terminalId: "CONTACTOR_TERMICO:L1"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:L2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 30
    },
    {
      id: "58425b64-8d58-4b5f-b8ac-6d4971d0c417",
      from: {
        terminalId: "CONTACTOR_TERMICO:L3"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:L2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 31
    },
    {
      id: "53c6f415-b194-4c2e-bebb-bf692dc4302d",
      from: {
        terminalId: "CONTACTOR_TERMICO:T1"
      },
      to: {
        terminalId: "BORNERA_MOTOR:V2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 32
    },
    {
      id: "4570c9e7-a50a-4a76-bd10-a194784a9d82",
      from: {
        terminalId: "CONTACTOR_TERMICO:T2"
      },
      to: {
        terminalId: "BORNERA_MOTOR:U2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 33
    },
    {
      id: "114094af-6573-4afd-a819-14c9a52617e9",
      from: {
        terminalId: "CONTACTOR_TERMICO:T3"
      },
      to: {
        terminalId: "BORNERA_MOTOR:W2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 34
    },
    {
      id: "c4c842ad-0724-4a63-b05d-21d9cdfd2d58",
      from: {
        terminalId: "BOTONERAS:PILOTO_2"
      },
      to: {
        terminalId: "CONTACTOR_TRIFASICO:82"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 35
    },
    {
      id: "b5cb3367-8960-47a9-83e4-bfe70b4a93d0",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:81"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:82"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 36
    },
    {
      id: "f3aea82f-9b65-4073-b084-0314867160b7",
      from: {
        terminalId: "CONTACTOR_TERMICO:81"
      },
      to: {
        terminalId: "FUENTE:F"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 37
    },
    {
      id: "cf9d2be1-28c5-4a00-82b9-3ffc19bdebe9",
      from: {
        terminalId: "FUENTE:F"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:97"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 50
    },
    {
      id: "f9e898d9-d58d-421e-850f-522ecbd8a534",
      from: {
        terminalId: "CONTACTOR_TERMICO:98"
      },
      to: {
        terminalId: "BOTONERAS:PILOTO_3"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 51
    },
    {
      id: "38aeee8d-d557-461f-8483-4238b2f9e158",
      from: {
        terminalId: "TEMPORIZADOR_1:TP_DER"
      },
      to: {
        terminalId: "FUENTE:TP"
      },
      color: "#32834b",
      route: {
        sag: 130
      },
      layer: 53
    },
    {
      id: "2e154c3e-ce17-4f7e-8738-0882039e5dfa",
      from: {
        terminalId: "BORNERA_MOTOR:TP"
      },
      to: {
        terminalId: "FUENTE:TP"
      },
      color: "#32834b",
      route: {
        sag: 130
      },
      layer: 54
    },
    {
      id: "c114d2e2-eb46-4a11-9f25-9c7b33d94a94",
      from: {
        terminalId: "CONTACTOR_TERMICO:TP_DER"
      },
      to: {
        terminalId: "FUENTE:TP"
      },
      color: "#32834b",
      route: {
        sag: 130
      },
      layer: 55
    },
    {
      id: "b0141501-a8d4-46f4-914c-cf7c11be9ea3",
      from: {
        terminalId: "BOTONERAS:TP_IZQ"
      },
      to: {
        terminalId: "FUENTE:TP"
      },
      color: "#32834b",
      route: {
        sag: 130
      },
      layer: 56
    },
    {
      id: "e570ce0a-0cc2-405d-81de-1a5bdef8186b",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:TP_IZQ"
      },
      to: {
        terminalId: "FUENTE:TP"
      },
      color: "#32834b",
      route: {
        sag: 130
      },
      layer: 57
    },
    {
      id: "608ec287-76d3-4ea6-8c22-9f323dcad985",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:A1"
      },
      to: {
        terminalId: "BOTONERAS:PILOTO_4"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 58
    },
    {
      id: "7bddfeb1-d1ae-45cb-a830-eb67d8074d3c",
      from: {
        terminalId: "CONTACTOR_TERMICO:A1"
      },
      to: {
        terminalId: "BOTONERAS:PILOTO_1"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 59
    }
  ]
};

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
    if (!timed && has("BOTONERAS:S3:3")) return item("Permiso de cambio \xB7 despu\xE9s de la partida", "El NA 3\u20134 de S3 toma la alimentaci\xF3n de S1:4, despu\xE9s de la partida y del auxiliar de retenci\xF3n de KM1, como SB3 en la figura 1 de la gu\xEDa.", "Pulsar S3 desde reposo no alimenta KM1 ni KM2. Primero S1 inicia estrella y luego S3 solicita tri\xE1ngulo.", "Falta la orden de cambio; tomarla antes de S1 permitir\xEDa una partida directa en tri\xE1ngulo que no corresponde a este esquema.", "\xBFPor qu\xE9 SB3 se alimenta despu\xE9s de SB2 y qu\xE9 ocurre si lo pulsas con el banco en reposo?", ["Seguir la salida de S1 y la retenci\xF3n de KM1.", "Distinguir partida y cambio de conexi\xF3n."]);
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
var K1 = "CONTACTOR_TERMICO:";
var K2 = "CONTACTOR_TRIFASICO:";
var BT = "BOTONERAS:";
var FU = "FUENTE:";
var MO = "BORNERA_MOTOR:";
var INVERSION = [
  // — Mando de KM1 (marcha 1) —
  [FU + "F", K1 + "95", "Fase al mando por el t\xE9rmico", "La fase F entra al mando pasando por el contacto 95\u201396 del rel\xE9 t\xE9rmico, que es NC. Si el t\xE9rmico dispara, este contacto abre y corta todo el mando."],
  [K1 + "96", BT + "S2:1", "Del t\xE9rmico al paro (S2)", "Desde 96 la fase va al pulsador rojo S2. Su contacto 1\u20132 es NC: el mando queda alimentado mientras no pulses el paro."],
  [BT + "S2:2", BT + "S1:3", "Del paro a marcha 1 (S1)", "S2:2 es el punto \xABprotegido por el paro\xBB: todo lo que sale de aqu\xED se apaga al pulsar S2. Ll\xE9valo al borne 3 de S1 (verde izquierdo), contacto NA 3\u20134."],
  [BT + "S1:4", K2 + "71", "Enclavamiento: S1 pasa por KM2", "Al pulsar S1 la fase sale por el borne 4 y debe cruzar el contacto NC 71\u201372 de KM2. Si KM2 est\xE1 activo, ese contacto abre e impide que KM1 entre al mismo tiempo."],
  [K2 + "72", K1 + "A1", "Hacia la bobina de KM1", "Pasado el enclavamiento, la fase llega al borne A1 de la bobina de KM1."],
  [BT + "PILOTO_1", K1 + "A1", "L\xE1mpara de KM1 (P1)", "El piloto 1 toma la fase del mismo punto que la bobina: se enciende cuando KM1 est\xE1 activo. Su retorno a N se cablea m\xE1s adelante."],
  [BT + "S2:2", K1 + "13", "Retenci\xF3n de KM1: entrada", "El contacto auxiliar NA 13\u201314 de KM1 hace de memoria. Su entrada 13 recibe la fase desde S2:2, despu\xE9s del paro."],
  [K1 + "14", BT + "S1:4", "Retenci\xF3n de KM1: salida en paralelo con S1", "14 devuelve la fase a S1:4, en paralelo con el pulsador. Cuando KM1 entra, 13\u201314 cierra y mantiene la bobina aunque sueltes S1."],
  // — Mando de KM2 (marcha 2) —
  [BT + "S2:2", BT + "S3:3", "Del paro a marcha 2 (S3)", "Misma idea para el giro contrario: la fase protegida por el paro llega al borne 3 de S3 (verde derecho)."],
  [BT + "S3:4", K1 + "71", "Enclavamiento: S3 pasa por KM1", "Ahora la fase de S3 cruza el contacto NC 71\u201372 de KM1: con KM1 activo, KM2 no puede entrar."],
  [K1 + "72", K2 + "A1", "Hacia la bobina de KM2", "Pasado el enclavamiento, la fase llega a A1 de la bobina de KM2."],
  [BT + "PILOTO_4", K2 + "A1", "L\xE1mpara de KM2 (P4)", "El piloto 4 comparte punto con la bobina de KM2: indica que KM2 (giro inverso) est\xE1 activo."],
  [BT + "S2:2", K2 + "13", "Retenci\xF3n de KM2: entrada", "El NA 13\u201314 de KM2 hace la retenci\xF3n del giro inverso; 13 recibe la fase desde S2:2."],
  [K2 + "14", BT + "S3:4", "Retenci\xF3n de KM2: salida en paralelo con S3", "14 devuelve la fase a S3:4, en paralelo con el pulsador. KM2 queda retenido hasta que pulses S2."],
  // — Retornos y señalización —
  [K1 + "A2", FU + "N", "Retorno de la bobina de KM1", "A2 va al neutro N: la bobina de 24 V CA queda entre la fase (A1) y el neutro (A2)."],
  [K2 + "A2", FU + "N", "Retorno de la bobina de KM2", "Igual que KM1: A2 de KM2 va al neutro, de modo que su bobina de 24 V CA queda entre A1 (fase) y A2 (neutro)."],
  [BT + "N", FU + "N", "Neutro para las l\xE1mparas", "Los pilotos retornan por el borne N de las botoneras; \xFAnelo al neutro de la fuente para cerrar sus circuitos."],
  [FU + "F", K1 + "97", "Fase al aviso de t\xE9rmico disparado", "El contacto 97\u201398 de KM1 es NA: cierra cuando el rel\xE9 t\xE9rmico dispara. Alimenta 97 con la fase."],
  [K1 + "98", BT + "PILOTO_3", "L\xE1mpara de t\xE9rmico disparado (P3)", "Al disparar el t\xE9rmico, 97\u201398 cierra y enciende el piloto 3 (amarillo)."],
  [K1 + "96", K1 + "81", "Fase de reposo hacia la cadena de avisos", "Desde 96 (fase si el t\xE9rmico est\xE1 bien) se arma una cadena de contactos NC: primero el 81\u201382 de KM1."],
  [K1 + "82", K2 + "81", "Cadena de reposo: de KM1 a KM2", "La fase sigue por el NC 81\u201382 de KM2. Solo llegar\xE1 al final si ninguno de los dos contactores est\xE1 activo."],
  [K2 + "82", BT + "PILOTO_2", "L\xE1mpara de reposo (P2)", "El piloto 2 (rojo) se enciende \xFAnicamente con KM1 y KM2 en reposo y el t\xE9rmico sano."],
  // — Fuerza —
  [FU + "R", K1 + "L1", "Fuerza: R a KM1", "Las tres fases entran al contactor de giro directo. R va a L1."],
  [FU + "S", K1 + "L2", "Fuerza: S a KM1", "La fase S (negra) va a L2. Mant\xE9n el orden R\u2013S\u2013T en L1\u2013L2\u2013L3 para que el giro directo sea el esperado."],
  [FU + "T", K1 + "L3", "Fuerza: T a KM1", "La fase T (roja) va a L3. Con las tres fases en KM1 ya solo falta que su bobina cierre los contactos."],
  [K1 + "L1", K2 + "L1", "Las mismas fases a KM2: L1", "KM2 recibe las fases en el mismo orden que KM1; el cambio de giro se hace a la salida."],
  [K1 + "L2", K2 + "L2", "Las mismas fases a KM2: L2", "La fase S tambi\xE9n llega a L2 de KM2, tomada de L2 de KM1 (la fase central no se intercambia despu\xE9s)."],
  [K1 + "L3", K2 + "L3", "Las mismas fases a KM2: L3", "La fase T llega a L3 de KM2. Con las tres fases en KM2, solo falta cruzar dos a su salida."],
  [K1 + "T1", MO + "U1", "KM1 al motor: U1", "Con KM1 el motor recibe R, S y T en U1, V1 y W1: giro directo."],
  [K1 + "T2", MO + "V1", "KM1 al motor: V1", "T2 (negro) va a V1: la fase S queda en el borne central del motor."],
  [K1 + "T3", MO + "W1", "KM1 al motor: W1", "T3 (rojo) va a W1. Con KM1 cerrado el motor recibe R\u2013S\u2013T en U1\u2013V1\u2013W1."],
  [K2 + "T1", K1 + "T3", "KM2 invierte: T1 a W1", "Para invertir el giro basta intercambiar dos fases. La salida T1 de KM2 (fase R) se une con T3 de KM1, que va a W1."],
  [K2 + "T3", K1 + "T1", "KM2 invierte: T3 a U1", "La salida T3 de KM2 (fase T) se une con T1 de KM1, que va a U1. Con KM2 activo el motor recibe T, S y R: gira al rev\xE9s."],
  [K2 + "T2", K1 + "T2", "KM2: T2 queda igual", "La fase central no se cambia: T2 de KM2 con T2 de KM1."],
  [MO + "W2", MO + "U2", "Motor en estrella (1)", "Unir W2 con U2 es la primera mitad del puente de estrella."],
  [MO + "V2", MO + "U2", "Motor en estrella (2)", "Con W2, U2 y V2 unidos las tres bobinas quedan en estrella y el motor puede girar en los dos sentidos."],
  // — Tierras de protección —
  [MO + "TP", K2 + "TP_DER", "Tierra del motor", "Las tierras de protecci\xF3n (TP, verdes) se unen entre los m\xF3dulos y terminan en la tierra de la fuente. No cambian el funcionamiento del simulador."],
  [K2 + "TP_IZQ", K1 + "TP_DER", "Tierra entre KM2 y KM1", "Contin\xFAa la cadena de tierras: la tierra izquierda de KM2 se une con la tierra derecha de KM1."],
  [K1 + "TP_DER", FU + "TP", "Tierra de KM1 a la fuente", "La cadena llega a la tierra de protecci\xF3n de la fuente."],
  [K2 + "TP_DER", K2 + "TP_IZQ", "Tierra de KM2: lado derecho", "Une las dos tierras del m\xF3dulo de KM2 entre s\xED, de modo que toda la hilera de tierras queda unida."],
  [BT + "TP_DER", FU + "TP", "Tierra de las botoneras", "\xDAltima conexi\xF3n: las botoneras tambi\xE9n quedan a tierra."]
];
var SIMPLE = [
  // — Mando de KM1 —
  [FU + "F", K1 + "95", "Fase al mando por el t\xE9rmico", "La fase F entra al mando pasando por el contacto 95\u201396 del rel\xE9 t\xE9rmico, que es NC. Si el t\xE9rmico dispara, este contacto abre y corta todo el mando."],
  [K1 + "96", K1 + "71", "Fase hacia el aviso de reposo", "Desde 96 (hay fase mientras el t\xE9rmico est\xE9 sano) se alimenta el contacto NC 71\u201372 de KM1. Cuando KM1 est\xE9 en reposo, ese contacto estar\xE1 cerrado."],
  [K1 + "72", BT + "PILOTO_2", "L\xE1mpara de reposo (P2)", "El piloto 2 (rojo) se enciende solo con KM1 en reposo: la fase llega por 71\u201372, que est\xE1 cerrado. Cuando KM1 entra, 71\u201372 abre y P2 se apaga."],
  [BT + "N", FU + "N", "Neutro para las l\xE1mparas", "Los pilotos retornan por el borne N de las botoneras; \xFAnelo al neutro de la fuente para cerrar sus circuitos."],
  [K1 + "96", BT + "S2:1", "Del t\xE9rmico al paro (S2)", "Desde 96 la fase va al pulsador rojo S2. Su contacto 1\u20132 es NC: el mando queda alimentado mientras no pulses el paro."],
  [BT + "S2:2", BT + "S1:3", "Del paro a la marcha (S1)", "S2:2 es el punto \xABprotegido por el paro\xBB: todo lo que sale de aqu\xED se apaga al pulsar S2. Ll\xE9valo al borne 3 de S1 (verde izquierdo), contacto NA 3\u20134."],
  [BT + "S1:4", K1 + "A1", "A la bobina de KM1", "Al pulsar S1 la fase sale por el borne 4 y llega a A1, el borne de la bobina de KM1."],
  [K1 + "A2", FU + "N", "Retorno de la bobina", "A2 va al neutro N: la bobina de 24 V CA queda entre la fase (A1) y el neutro (A2). Con S1 pulsado, KM1 ya deber\xEDa entrar."],
  [BT + "S2:2", K1 + "13", "Retenci\xF3n: entrada", "El contacto auxiliar NA 13\u201314 de KM1 hace de memoria. Su entrada 13 recibe la fase desde S2:2, despu\xE9s del paro."],
  [K1 + "14", BT + "S1:4", "Retenci\xF3n: salida en paralelo con S1", "14 devuelve la fase a S1:4, en paralelo con el pulsador. Cuando KM1 entra, 13\u201314 cierra y mantiene la bobina aunque sueltes S1; solo el paro la suelta."],
  [K1 + "A1", BT + "PILOTO_1", "L\xE1mpara de KM1 (P1)", "El piloto 1 toma la fase del mismo punto que la bobina: se enciende cuando KM1 est\xE1 activo."],
  [FU + "F", K1 + "97", "Fase al aviso de t\xE9rmico disparado", "El contacto 97\u201398 de KM1 es NA: cierra cuando el rel\xE9 t\xE9rmico dispara. Alimenta 97 con la fase."],
  [K1 + "98", BT + "PILOTO_3", "L\xE1mpara de t\xE9rmico disparado (P3)", "Al disparar el t\xE9rmico, 97\u201398 cierra y enciende el piloto 3 (amarillo)."],
  // — Fuerza —
  [FU + "R", K1 + "L1", "Fuerza: R a KM1", "Las tres fases entran al contactor. R (azul) va a L1."],
  [FU + "S", K1 + "L2", "Fuerza: S a KM1", "La fase S (negra) va a L2. Mant\xE9n el orden R\u2013S\u2013T en L1\u2013L2\u2013L3."],
  [FU + "T", K1 + "L3", "Fuerza: T a KM1", "La fase T (roja) va a L3. Con las tres fases en KM1, solo falta que su bobina cierre los contactos."],
  [K1 + "T1", MO + "U1", "KM1 al motor: U1", "Con KM1 cerrado, T1 entrega la fase R al borne U1 del motor."],
  [K1 + "T2", MO + "V1", "KM1 al motor: V1", "T2 (negro) va a V1: la fase S queda en el borne central del motor."],
  [K1 + "T3", MO + "W1", "KM1 al motor: W1", "T3 (rojo) va a W1. Con KM1 cerrado el motor recibe R\u2013S\u2013T en U1\u2013V1\u2013W1."],
  [MO + "W2", MO + "U2", "Motor en estrella (1)", "Unir W2 con U2 es la primera mitad del puente de estrella."],
  [MO + "V2", MO + "U2", "Motor en estrella (2)", "Con W2, U2 y V2 unidos las tres bobinas quedan en estrella y el motor puede girar."],
  // — Tierras de protección —
  [MO + "TP", K1 + "TP_DER", "Tierra del motor", "Las tierras de protecci\xF3n (TP, verdes) se unen entre los m\xF3dulos y terminan en la tierra de la fuente. No cambian el funcionamiento del simulador."],
  [K1 + "TP_DER", FU + "TP", "Tierra de KM1 a la fuente", "La cadena llega a la tierra de protecci\xF3n de la fuente."],
  [BT + "TP_DER", FU + "TP", "Tierra de las botoneras", "\xDAltima conexi\xF3n: las botoneras tambi\xE9n quedan a tierra."]
];
var point = (id) => {
  const [module, ...rest] = id.split(":"), terminal = rest.join(":"), found = leccionInversion_layout_default.modules.find((m) => m.id === module)?.terminals.find((t) => t.id === terminal);
  if (!found) throw new Error(`Terminal sin posici\xF3n en el mapa de la lecci\xF3n: ${id}`);
  return found;
};
var clamp = (v) => Math.max(0, Math.min(1e3, v));
function regionFor(from, to) {
  const a3 = point(from), b = point(to), pad = 62, x0 = Math.min(a3.x, b.x) - pad, x1 = Math.max(a3.x, b.x) + pad, y0 = Math.min(a3.y, b.y) - pad, y1 = Math.max(a3.y, b.y) + pad;
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
  const pairs = source2.pairs.map(([from, to]) => [id === "estrellaManual" && from === "BOTONERAS:S2:2" && to === "BOTONERAS:S3:3" ? "BOTONERAS:S1:4" : from, to]);
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
var LESSON_MAP_RATIO = leccionInversion_layout_default.height / leccionInversion_layout_default.width;

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
function timer(id, x, image) {
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
var pneumatic = timer("TEMPORIZADOR_1", 65, "/references/temporizador-1.jpg");
pneumatic.y = 798;
motor.x = 574;
motor.y = 798;
var RETIRED_MODULES = [timer("TEMPORIZADOR_2", 831, "/references/temporizador-2.jpg")];
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
  const copy = timer(id, 0, "/references/temporizador-1.jpg");
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

// src/data/machinePreparation.ts
var EXAMPLE_RATING = { deltaVolts: 380, starVolts: 660, lineAmps: 10, source: "Ejemplo did\xE1ctico; no corresponde a la placa del laboratorio" };
function ratingCompatibility(r, line, connection) {
  const limit = connection === "delta" ? r.deltaVolts : r.starVolts, ok = line <= limit * 1.1;
  return { ok, message: ok ? "Tensi\xF3n compatible con el ejemplo de placa." : `Tensi\xF3n incompatible: ${line} V en ${connection === "delta" ? "\u0394" : "Y"} supera la tensi\xF3n nominal ${limit} V. Desenergiza y revisa la placa.`, windingVolts: connection === "delta" ? line : line / Math.sqrt(3) };
}
var relaySetting = (nominal, location) => nominal / (location === "inside" ? Math.sqrt(3) : 1);
var MACHINE_PREP_KEY = "modo:machines:preparation:v1";
var newMachinePreparation = () => ({ version: 1, starVoltage: "", deltaVoltage: "", compatible: "", incompatible: "", location: "inside", setting: "", range: "", device: "", diagram: { wires: [], positions: {}, explanation: "" } });
function preparationChecks(p) {
  const n = (v) => Number(v.replace(",", "."));
  return { plate: Math.abs(n(p.starVoltage) - 380 / Math.sqrt(3)) < 1 && Math.abs(n(p.deltaVoltage) - 380) < 1 && p.compatible === "yes" && p.incompatible === "star", protection: Math.abs(n(p.setting) - relaySetting(10, p.location)) < 0.08 && p.range.split("-").length === 2 && n(p.range.split("-")[0]) <= relaySetting(10, p.location) && n(p.range.split("-")[1]) >= relaySetting(10, p.location) && p.device === "thermal" };
}
function readMachinePreparation(raw) {
  if (!raw) return newMachinePreparation();
  const p = JSON.parse(raw), fields = ["starVoltage", "deltaVoltage", "compatible", "incompatible", "setting", "range", "device"];
  if (p?.version !== 1 || fields.some((k) => typeof p[k] !== "string" || p[k].length > 80) || !["inside", "line"].includes(p.location) || !p.diagram || typeof p.diagram.explanation !== "string" || p.diagram.explanation.length > 5e3 || !Array.isArray(p.diagram.wires) || p.diagram.wires.length > 250 || p.diagram.wires.some((w) => !w || typeof w.id !== "string" || w.id.length > 100 || ![w.from?.terminalId, w.to?.terminalId].every((id) => typeof id === "string" && /^[A-Z0-9_:]+$/.test(id))) || !p.diagram.positions || Object.entries(p.diagram.positions).some(([id, v]) => !/^\d+$/.test(id) || !Number.isFinite(v.x) || !Number.isFinite(v.y) || Math.abs(v.x) > 2e3 || Math.abs(v.y) > 2e3)) throw Error("La preparaci\xF3n anterior se conserva porque no se pudo leer.");
  return p;
}

// src/data/practice.ts
var BANANA_COLOR = "#145650";
var CLASS_DIAGRAMS = [1, 2, 3].map((n) => ({ id: `clase-${n}`, name: `Fotograf\xEDa de clase ${n} \xB7 referencia sin validar`, src: `/diagrams/clase-${n}.jpg`, origin: "class_photo" }));
var emptyPractice = () => ({ version: 2, title: "Mi pr\xE1ctica INACAP", wires: [], diagram: CLASS_DIAGRAMS[0], steps: [], mode: "free", stepIndex: 0 });

// src/lab/units.ts
function formatReading(kind, value) {
  const abs = Math.abs(value), fixed = (n, d) => (Math.abs(n) < 10 ** -d / 2 ? 0 : n).toFixed(d).replace(".", ",");
  const ranges = kind === "voltage" ? [[6, 1, 3, "V"], [60, 1, 2, "V"], [600, 1, 1, "V"], [1e3, 1, 0, "V"]] : kind === "current" ? [[6, 1, 3, "A"], [10, 1, 2, "A"]] : [[600, 1, 1, "\u03A9"], [6e3, 1e3, 3, "k\u03A9"], [6e4, 1e3, 2, "k\u03A9"], [6e5, 1e3, 1, "k\u03A9"], [6e6, 1e6, 3, "M\u03A9"], [5e7, 1e6, 2, "M\u03A9"]];
  for (let i = 0; i < ranges.length; i++) {
    const [limit, factor, d, unit] = ranges[i];
    const rounded = Number((abs / factor).toFixed(d)) * factor, last = i === ranges.length - 1;
    if (last ? abs <= limit : rounded < limit) return { text: fixed(value / factor, d), unit };
  }
  return { text: "OL", unit: "" };
}

// src/data/simulation.ts
var contactorIds = () => MODULES.filter((m) => m.category === "contactores").map((m) => m.id);
var timerIds = () => MODULES.filter((m) => m.category === "temporizadores").map((m) => m.id);
var relayIds = () => [...contactorIds(), ...timerIds()];
var OFF_RELAYS = () => Object.fromEntries(relayIds().map((id) => [id, false]));
var sameRelays = (a3, b) => relayIds().every((id) => !!a3[id] === !!b[id]);
var emptySimulation = () => ({ enabled: false, plugged: false, forceBreaker: false, breakers: [false, false], pressed: [], thermalTripped: false });
var IDLE_MOTOR = { status: "off", connection: null, direction: 1, speed: 0, message: "Sin tensi\xF3n de fuerza.", lines: [null, null, null] };
function simulationContacts(input, relays, timed = []) {
  const pairs = [];
  for (const s of ["S1", "S2", "S3"]) pairs.push(input.pressed.includes(s) ? [`BOTONERAS:${s}:3`, `BOTONERAS:${s}:4`] : [`BOTONERAS:${s}:1`, `BOTONERAS:${s}:2`]);
  for (const id of contactorIds()) {
    const closed = !!relays[id];
    for (const [a3, b] of closed ? [["13", "14"], ["63", "64"], ["93", "94"]] : [["71", "72"], ["81", "82"]]) pairs.push([`${id}:${a3}`, `${id}:${b}`]);
    if (input.powerContacts?.[id] ?? closed) for (const i of [1, 2, 3]) pairs.push([`${id}:L${i}`, `${id}:T${i}`]);
  }
  for (const id of timerIds()) {
    const on = !!relays[id], done = on && timed.includes(id);
    if (input.powerContacts?.[id] ?? on) for (const i of [1, 2, 3]) pairs.push([`${id}:L${i}`, `${id}:T${i}`]);
    if (on) pairs.push([`${id}:13`, `${id}:14`]);
    pairs.push(done ? [`${id}:67`, `${id}:68`] : [`${id}:55`, `${id}:56`]);
  }
  pairs.push(input.thermalTripped ? ["CONTACTOR_TERMICO:97", "CONTACTOR_TERMICO:98"] : ["CONTACTOR_TERMICO:95", "CONTACTOR_TERMICO:96"]);
  return pairs;
}
function graph(wires, pairs) {
  const parent = new Map(TERMINALS.map((t) => [t.key, t.key]));
  const root = (id) => {
    const p = parent.get(id);
    if (!p) return id;
    if (p !== id) parent.set(id, root(p));
    return parent.get(id);
  };
  const join = (a3, b) => {
    if (parent.has(a3) && parent.has(b)) parent.set(root(b), root(a3));
  };
  wires.forEach((w) => join(w.from.terminalId, w.to.terminalId));
  pairs.forEach(([a3, b]) => join(a3, b));
  const phase = root("FUENTE:F"), neutral = root("FUENTE:N"), phases = ["FUENTE:R", "FUENTE:S", "FUENTE:T"].map(root);
  const voltage = (a3, b) => phase !== neutral && (root(a3) === phase && root(b) === neutral || root(a3) === neutral && root(b) === phase);
  return { root, phase, neutral, phases, voltage };
}
function solveControl(wires, input, previous = OFF_RELAYS(), timed = []) {
  const off = (fault = null) => ({ powered: false, fault, relays: OFF_RELAYS(), pilots: [false, false, false, false], liveTerminals: [], liveWireIds: [], closedContacts: [] });
  if (!input.enabled || !input.plugged || !input.breakers.every(Boolean)) return off();
  let relays = { ...previous };
  const seen = /* @__PURE__ */ new Set();
  for (let i = 0; i < 16; i++) {
    const ids = relayIds(), signature = ids.map((id) => Number(!!relays[id])).join("");
    if (seen.has(signature)) return off("unstable");
    seen.add(signature);
    const contacts = simulationContacts(input, relays, timed), g = graph(wires, contacts);
    if (g.phase === g.neutral) return off("short");
    const next = Object.fromEntries(ids.map((id) => [id, g.voltage(`${id}:A1`, `${id}:A2`)]));
    if (ids.every((id) => next[id] === !!relays[id])) {
      const pilots = [1, 2, 3, 4].map((n) => g.voltage(`BOTONERAS:PILOTO_${n}`, "BOTONERAS:N"));
      const liveTerminals = TERMINALS.filter((t) => g.root(t.key) === g.phase).map((t) => t.key);
      return { powered: true, fault: null, relays, pilots, liveTerminals, liveWireIds: wires.filter((w) => liveTerminals.includes(w.from.terminalId)).map((w) => w.id), closedContacts: contacts };
    }
    relays = next;
  }
  return off("unstable");
}
var MOTOR = "BORNERA_MOTOR:";
var SEQUENCES = ["RST", "STR", "TRS"];
function solveMotor(wires, input, relays, timed = []) {
  const idle = (message, status = "off") => ({ motor: { ...IDLE_MOTOR, status, message }, live: [] });
  if (!input.enabled) return idle("Simulaci\xF3n detenida.");
  if (!input.plugged) return idle("Enchufa la corriente virtual en el m\xF3dulo de alimentaci\xF3n.");
  if (!input.forceBreaker) return idle("Cierra el interruptor FUERZA para energizar R, S y T.");
  const g = graph(wires, simulationContacts(input, relays, timed)), [r, s, t] = g.phases;
  if ((/* @__PURE__ */ new Set([r, s, t])).size < 3) return { ...idle("Cortocircuito entre fases: alg\xFAn cable une R, S o T. Ret\xEDralo.", "fault"), short: true };
  const label = (id) => {
    const x = g.root(MOTOR + id);
    return x === r ? "R" : x === s ? "S" : x === t ? "T" : null;
  };
  const live = TERMINALS.filter((x) => [r, s, t].includes(g.root(x.key))).map((x) => x.key);
  const lines = ["U1", "V1", "W1"].map(label), ends = ["U2", "V2", "W2"].map(label);
  const same = (a3, b) => g.root(MOTOR + a3) === g.root(MOTOR + b);
  const fed = lines.filter(Boolean).length;
  if (!fed && !ends.some(Boolean)) return { motor: { ...IDLE_MOTOR, message: "El motor no recibe tensi\xF3n: lleva R, S y T al contactor y su salida a U1, V1 y W1." }, live };
  if (fed < 3) return { motor: { ...IDLE_MOTOR, status: "fault", lines, message: `Falta una fase: solo ${fed} de los 3 bornes U1, V1 y W1 reciben tensi\xF3n.` }, live };
  if (new Set(lines).size < 3) return { motor: { ...IDLE_MOTOR, status: "fault", lines, message: "Dos bornes reciben la misma fase: el motor necesita R, S y T distintas." }, live };
  const direction = SEQUENCES.includes(lines.join("")) ? 1 : -1;
  const star = same("U2", "V2") && same("V2", "W2") && ends.every((e) => e === null);
  const delta = same("U1", "W2") && same("V1", "U2") && same("W1", "V2");
  if (star) return { motor: { status: "running", connection: "star", direction, speed: 0.55, message: "Girando en estrella: cada bobina recibe tensi\xF3n reducida.", lines }, live };
  if (delta) return { motor: { status: "running", connection: "delta", direction, speed: 1, message: "Girando en tri\xE1ngulo: cada bobina recibe la tensi\xF3n de l\xEDnea.", lines }, live };
  return { motor: { ...IDLE_MOTOR, status: "fault", lines, message: "Bobinas sin cerrar: une W2-U2-V2 (estrella) o U1-W2, V1-U2 y W1-V2 (tri\xE1ngulo)." }, live };
}
function solveSimulation(wires, input, previous = OFF_RELAYS(), timed = []) {
  const base2 = solveControl(wires, input, previous, timed), force = solveMotor(wires, input, base2.relays, timed);
  if (force.short) return { ...base2, powered: false, fault: "phase-short", relays: OFF_RELAYS(), pilots: [false, false, false, false], liveTerminals: [], liveWireIds: [], closedContacts: [], motor: force.motor };
  if (!force.live.length) return { ...base2, motor: force.motor };
  const liveTerminals = [.../* @__PURE__ */ new Set([...base2.liveTerminals, ...force.live])];
  return { ...base2, motor: force.motor, liveTerminals, liveWireIds: wires.filter((w) => liveTerminals.includes(w.from.terminalId)).map((w) => w.id) };
}
var SIMULATION_EXAMPLES = {
  lamp: { title: "Piloto con pulsador", pairs: [["FUENTE:F", "BOTONERAS:S3:3"], ["BOTONERAS:S3:4", "BOTONERAS:PILOTO_4"], ["FUENTE:N", "BOTONERAS:N"]] },
  hold: { title: "Marcha, mantenimiento y parada", pairs: [
    ["FUENTE:F", "CONTACTOR_TERMICO:95"],
    ["CONTACTOR_TERMICO:96", "BOTONERAS:S2:1"],
    ["BOTONERAS:S2:2", "BOTONERAS:S3:3"],
    ["BOTONERAS:S3:3", "CONTACTOR_TERMICO:13"],
    ["BOTONERAS:S3:4", "CONTACTOR_TERMICO:14"],
    ["CONTACTOR_TERMICO:14", "CONTACTOR_TERMICO:A1"],
    ["CONTACTOR_TERMICO:A1", "BOTONERAS:PILOTO_4"],
    ["CONTACTOR_TERMICO:A2", "FUENTE:N"],
    ["FUENTE:N", "BOTONERAS:N"],
    ["CONTACTOR_TERMICO:96", "CONTACTOR_TERMICO:71"],
    ["CONTACTOR_TERMICO:72", "BOTONERAS:PILOTO_2"],
    ["FUENTE:F", "CONTACTOR_TERMICO:97"],
    ["CONTACTOR_TERMICO:98", "BOTONERAS:PILOTO_3"]
  ] },
  motor: { title: "Arranque del motor con KM1", pairs: [
    ["FUENTE:F", "CONTACTOR_TERMICO:95"],
    ["CONTACTOR_TERMICO:96", "BOTONERAS:S2:1"],
    ["BOTONERAS:S2:2", "BOTONERAS:S3:3"],
    ["BOTONERAS:S3:3", "CONTACTOR_TERMICO:13"],
    ["BOTONERAS:S3:4", "CONTACTOR_TERMICO:14"],
    ["CONTACTOR_TERMICO:14", "CONTACTOR_TERMICO:A1"],
    ["CONTACTOR_TERMICO:A2", "FUENTE:N"],
    ["FUENTE:N", "BOTONERAS:N"],
    ["FUENTE:R", "CONTACTOR_TERMICO:L1"],
    ["FUENTE:S", "CONTACTOR_TERMICO:L2"],
    ["FUENTE:T", "CONTACTOR_TERMICO:L3"],
    ["CONTACTOR_TERMICO:T1", "BORNERA_MOTOR:U1"],
    ["CONTACTOR_TERMICO:T2", "BORNERA_MOTOR:V1"],
    ["CONTACTOR_TERMICO:T3", "BORNERA_MOTOR:W1"],
    ["BORNERA_MOTOR:W2", "BORNERA_MOTOR:U2"],
    ["BORNERA_MOTOR:U2", "BORNERA_MOTOR:V2"]
  ] },
  motorRev: { title: "Motor con giro invertido (dos fases cruzadas)", pairs: [
    ["FUENTE:F", "CONTACTOR_TERMICO:95"],
    ["CONTACTOR_TERMICO:96", "BOTONERAS:S2:1"],
    ["BOTONERAS:S2:2", "BOTONERAS:S3:3"],
    ["BOTONERAS:S3:3", "CONTACTOR_TERMICO:13"],
    ["BOTONERAS:S3:4", "CONTACTOR_TERMICO:14"],
    ["CONTACTOR_TERMICO:14", "CONTACTOR_TERMICO:A1"],
    ["CONTACTOR_TERMICO:A2", "FUENTE:N"],
    ["FUENTE:N", "BOTONERAS:N"],
    ["FUENTE:R", "CONTACTOR_TERMICO:L1"],
    ["FUENTE:S", "CONTACTOR_TERMICO:L2"],
    ["FUENTE:T", "CONTACTOR_TERMICO:L3"],
    ["CONTACTOR_TERMICO:T1", "BORNERA_MOTOR:V1"],
    ["CONTACTOR_TERMICO:T2", "BORNERA_MOTOR:U1"],
    ["CONTACTOR_TERMICO:T3", "BORNERA_MOTOR:W1"],
    ["BORNERA_MOTOR:W2", "BORNERA_MOTOR:U2"],
    ["BORNERA_MOTOR:U2", "BORNERA_MOTOR:V2"]
  ] },
  simple: { title: "Marcha y paro con retenci\xF3n (el m\xE1s simple, de un compa\xF1ero)", pairs: SIMPLE_LESSON.pairs },
  inversion: { title: "Inversi\xF3n de giro con enclavamiento y paro (circuito de un compa\xF1ero)", pairs: INVERSION_LESSON.pairs },
  starDelta: { title: "Estrella-tri\xE1ngulo \xB7 2 contactores + conjunto temporizado", pairs: [
    // KT1 is the line contactor with pneumatic block. KM2 = star; KM1 = delta.
    ["FUENTE:F", "CONTACTOR_TERMICO:95"],
    ["CONTACTOR_TERMICO:96", "BOTONERAS:S2:1"],
    ["BOTONERAS:S2:2", "BOTONERAS:S3:3"],
    ["BOTONERAS:S3:3", "TEMPORIZADOR_1:13"],
    ["BOTONERAS:S3:4", "TEMPORIZADOR_1:14"],
    ["TEMPORIZADOR_1:14", "TEMPORIZADOR_1:A1"],
    ["TEMPORIZADOR_1:A2", "FUENTE:N"],
    ["TEMPORIZADOR_1:14", "TEMPORIZADOR_1:55"],
    ["TEMPORIZADOR_1:56", "CONTACTOR_TERMICO:71"],
    ["CONTACTOR_TERMICO:72", "CONTACTOR_TRIFASICO:A1"],
    ["CONTACTOR_TRIFASICO:A2", "FUENTE:N"],
    ["TEMPORIZADOR_1:14", "TEMPORIZADOR_1:67"],
    ["TEMPORIZADOR_1:68", "CONTACTOR_TRIFASICO:71"],
    ["CONTACTOR_TRIFASICO:72", "CONTACTOR_TERMICO:A1"],
    ["CONTACTOR_TERMICO:A2", "FUENTE:N"],
    ["FUENTE:R", "TEMPORIZADOR_1:L1"],
    ["FUENTE:S", "TEMPORIZADOR_1:L2"],
    ["FUENTE:T", "TEMPORIZADOR_1:L3"],
    ["TEMPORIZADOR_1:T1", "BORNERA_MOTOR:U1"],
    ["TEMPORIZADOR_1:T2", "BORNERA_MOTOR:V1"],
    ["TEMPORIZADOR_1:T3", "BORNERA_MOTOR:W1"],
    ["BORNERA_MOTOR:W2", "CONTACTOR_TRIFASICO:L1"],
    ["BORNERA_MOTOR:U2", "CONTACTOR_TRIFASICO:L2"],
    ["BORNERA_MOTOR:V2", "CONTACTOR_TRIFASICO:L3"],
    ["CONTACTOR_TRIFASICO:T1", "CONTACTOR_TRIFASICO:T2"],
    ["CONTACTOR_TRIFASICO:T2", "CONTACTOR_TRIFASICO:T3"],
    ["BORNERA_MOTOR:U1", "CONTACTOR_TERMICO:L1"],
    ["BORNERA_MOTOR:V1", "CONTACTOR_TERMICO:L2"],
    ["BORNERA_MOTOR:W1", "CONTACTOR_TERMICO:L3"],
    ["CONTACTOR_TERMICO:T1", "BORNERA_MOTOR:W2"],
    ["CONTACTOR_TERMICO:T2", "BORNERA_MOTOR:U2"],
    ["CONTACTOR_TERMICO:T3", "BORNERA_MOTOR:V2"],
    ["FUENTE:N", "BOTONERAS:N"],
    ["CONTACTOR_TRIFASICO:A1", "BOTONERAS:PILOTO_1"],
    ["CONTACTOR_TERMICO:A1", "BOTONERAS:PILOTO_4"]
  ] },
  starDeltaThree: { title: "Estrella-tri\xE1ngulo \xB7 3 contactores + temporizador separado", needs: ["CONTACTOR_TRIFASICO_3"], pairs: [
    // Mando: F → térmico → parada → marcha con retención en KM1. KM1:14 alimenta al temporizador y a los dos contactores de conmutación.
    ["FUENTE:F", "CONTACTOR_TERMICO:95"],
    ["CONTACTOR_TERMICO:96", "BOTONERAS:S2:1"],
    ["BOTONERAS:S2:2", "BOTONERAS:S3:3"],
    ["BOTONERAS:S3:3", "CONTACTOR_TERMICO:13"],
    ["BOTONERAS:S3:4", "CONTACTOR_TERMICO:14"],
    ["CONTACTOR_TERMICO:14", "CONTACTOR_TERMICO:A1"],
    ["CONTACTOR_TERMICO:A2", "FUENTE:N"],
    ["FUENTE:N", "BOTONERAS:N"],
    ["CONTACTOR_TERMICO:14", "TEMPORIZADOR_1:A1"],
    ["TEMPORIZADOR_1:A2", "FUENTE:N"],
    // Estrella (KM3): KT 55-56 (cae al terminar el retardo) y enclavamiento con KM2 71-72
    ["CONTACTOR_TERMICO:14", "TEMPORIZADOR_1:55"],
    ["TEMPORIZADOR_1:56", "CONTACTOR_TRIFASICO:71"],
    ["CONTACTOR_TRIFASICO:72", "CONTACTOR_TRIFASICO_3:A1"],
    ["CONTACTOR_TRIFASICO_3:A2", "FUENTE:N"],
    // Triángulo (KM2): KT 67-68 (cierra al terminar) y enclavamiento con KM3 71-72
    ["CONTACTOR_TERMICO:14", "TEMPORIZADOR_1:67"],
    ["TEMPORIZADOR_1:68", "CONTACTOR_TRIFASICO_3:71"],
    ["CONTACTOR_TRIFASICO_3:72", "CONTACTOR_TRIFASICO:A1"],
    ["CONTACTOR_TRIFASICO:A2", "FUENTE:N"],
    // Fuerza: KM1 alimenta U1 V1 W1
    ["FUENTE:R", "CONTACTOR_TERMICO:L1"],
    ["FUENTE:S", "CONTACTOR_TERMICO:L2"],
    ["FUENTE:T", "CONTACTOR_TERMICO:L3"],
    ["CONTACTOR_TERMICO:T1", "BORNERA_MOTOR:U1"],
    ["CONTACTOR_TERMICO:T2", "BORNERA_MOTOR:V1"],
    ["CONTACTOR_TERMICO:T3", "BORNERA_MOTOR:W1"],
    // Triángulo: KM2 une U1-W2, V1-U2, W1-V2
    ["BORNERA_MOTOR:U1", "CONTACTOR_TRIFASICO:L1"],
    ["BORNERA_MOTOR:V1", "CONTACTOR_TRIFASICO:L2"],
    ["BORNERA_MOTOR:W1", "CONTACTOR_TRIFASICO:L3"],
    ["CONTACTOR_TRIFASICO:T1", "BORNERA_MOTOR:W2"],
    ["CONTACTOR_TRIFASICO:T2", "BORNERA_MOTOR:U2"],
    ["CONTACTOR_TRIFASICO:T3", "BORNERA_MOTOR:V2"],
    // Estrella: KM3 cierra W2-U2-V2 entre sí
    ["BORNERA_MOTOR:W2", "CONTACTOR_TRIFASICO_3:L1"],
    ["BORNERA_MOTOR:U2", "CONTACTOR_TRIFASICO_3:L2"],
    ["BORNERA_MOTOR:V2", "CONTACTOR_TRIFASICO_3:L3"],
    ["CONTACTOR_TRIFASICO_3:T1", "CONTACTOR_TRIFASICO_3:T2"],
    ["CONTACTOR_TRIFASICO_3:T2", "CONTACTOR_TRIFASICO_3:T3"]
  ] },
  motorDelta: { title: "Motor en tri\xE1ngulo", pairs: [
    ["FUENTE:F", "CONTACTOR_TERMICO:95"],
    ["CONTACTOR_TERMICO:96", "BOTONERAS:S2:1"],
    ["BOTONERAS:S2:2", "BOTONERAS:S3:3"],
    ["BOTONERAS:S3:3", "CONTACTOR_TERMICO:13"],
    ["BOTONERAS:S3:4", "CONTACTOR_TERMICO:14"],
    ["CONTACTOR_TERMICO:14", "CONTACTOR_TERMICO:A1"],
    ["CONTACTOR_TERMICO:A2", "FUENTE:N"],
    ["FUENTE:N", "BOTONERAS:N"],
    ["FUENTE:R", "CONTACTOR_TERMICO:L1"],
    ["FUENTE:S", "CONTACTOR_TERMICO:L2"],
    ["FUENTE:T", "CONTACTOR_TERMICO:L3"],
    ["CONTACTOR_TERMICO:T1", "BORNERA_MOTOR:U1"],
    ["CONTACTOR_TERMICO:T2", "BORNERA_MOTOR:V1"],
    ["CONTACTOR_TERMICO:T3", "BORNERA_MOTOR:W1"],
    ["BORNERA_MOTOR:U1", "BORNERA_MOTOR:W2"],
    ["BORNERA_MOTOR:V1", "BORNERA_MOTOR:U2"],
    ["BORNERA_MOTOR:W1", "BORNERA_MOTOR:V2"]
  ] }
};

// src/lab/model.ts
var HOLES = [];
for (let col = 1; col <= 30; col++) {
  const x = 55 + (col - 1) * 24;
  for (const [row, y] of [["top+", 62], ["top-", 86], ["bottom+", 386], ["bottom-", 410]]) HOLES.push({ id: `${row}:${col}`, x, y, group: `${row}:${col <= 15 ? "left" : "right"}` });
  for (const [i, row] of [..."abcdefghij"].entries()) HOLES.push({ id: `${row}:${col}`, x, y: 135 + i * 20 + (i >= 5 ? 35 : 0), group: `${i < 5 ? "upper" : "lower"}:${col}` });
}
var HOLE_BY_ID = new Map(HOLES.map((h) => [h.id, h]));

// src/lab/dc.ts
function junctionCurrent(v, resistance, j) {
  const rs = Math.max(resistance, 1e-6), is = j.saturation, vt = j.nvt;
  if (v <= 0) {
    const ex = Math.exp(Math.max(-40, v / vt));
    return { current: is * (ex - 1), conductance: Math.max(1e-12, is * ex / vt) };
  }
  let lo = 0, hi = v / rs;
  for (let k = 0; k < 64; k++) {
    const mid = (lo + hi) / 2;
    if (vt * Math.log1p(mid / is) + mid * rs > v) hi = mid;
    else lo = mid;
  }
  const current2 = (lo + hi) / 2;
  return { current: current2, conductance: 1 / (rs + vt / (current2 + is)) };
}
var BJT_VBE = 0.7;
var BJT_RB = 10;
var BJT_VCE_SAT = 0.2;
var BJT_RCE = 2;
function solveDC(branches, fixed, transistors = []) {
  const adjacency = /* @__PURE__ */ new Map();
  const link = (x, y) => {
    if (!adjacency.has(x)) adjacency.set(x, /* @__PURE__ */ new Set());
    if (!adjacency.has(y)) adjacency.set(y, /* @__PURE__ */ new Set());
    adjacency.get(x).add(y);
    adjacency.get(y).add(x);
  };
  for (const b of branches) link(b.a, b.b);
  for (const t of transistors) {
    link(t.b, t.e);
    link(t.c, t.e);
  }
  const reachable = new Set(Object.keys(fixed)), queue = [...reachable];
  for (let i = 0; i < queue.length; i++) for (const next of adjacency.get(queue[i]) ?? []) if (!reachable.has(next)) {
    reachable.add(next);
    queue.push(next);
  }
  const nodes = [...reachable].filter((id) => !(id in fixed)), lookup = new Map(nodes.map((id, i) => [id, i]));
  const floating = [...adjacency.keys()].filter((id) => !reachable.has(id));
  const failure = (fault) => ({ volts: {}, amps: {}, floating, fault, bjts: {} });
  let volts = { ...fixed };
  let converged = false;
  if (nodes.length > 500) return failure("La red supera la capacidad de c\xE1lculo de esta versi\xF3n.");
  const active = transistors.filter((t) => reachable.has(t.b) && reachable.has(t.e) && t.b !== t.e);
  const regions = new Map(active.map((t) => [t.id, "corte"]));
  const gminNodes = new Set(active.flatMap((t) => [t.b, t.c, t.e]).filter((id) => lookup.has(id)));
  for (let iteration = 0; iteration < 120; iteration++) {
    const matrix = nodes.map(() => new Float64Array(nodes.length + 1));
    const add = (row, col, coefficient) => {
      const i = lookup.get(row);
      if (i === void 0) return;
      const j = lookup.get(col);
      if (j !== void 0) matrix[i][j] += coefficient;
      else matrix[i][nodes.length] -= coefficient * (fixed[col] ?? 0);
    };
    const rhs = (row, value) => {
      const i = lookup.get(row);
      if (i !== void 0) matrix[i][nodes.length] += value;
    };
    for (const branch of branches) {
      if (!reachable.has(branch.a) || !reachable.has(branch.b) || branch.a === branch.b) continue;
      const conducting = branch.drop === void 0 || (volts[branch.a] ?? 0) - (volts[branch.b] ?? 0) > branch.drop;
      const v = (volts[branch.a] ?? 0) - (volts[branch.b] ?? 0), nonlinear = branch.junction ? junctionCurrent(v, branch.resistance, branch.junction) : null;
      const conductance = nonlinear?.conductance ?? (conducting ? 1 / branch.resistance : 1e-8);
      const drop = nonlinear ? v - nonlinear.current / conductance : conducting ? branch.drop ?? 0 : 0;
      for (const [a3, b, sign] of [[branch.a, branch.b, 1], [branch.b, branch.a, -1]]) {
        const i = lookup.get(a3);
        if (i === void 0) continue;
        matrix[i][i] += conductance;
        const j = lookup.get(b);
        if (j !== void 0) matrix[i][j] -= conductance;
        else matrix[i][nodes.length] += conductance * fixed[b];
        matrix[i][nodes.length] += sign * conductance * drop;
      }
    }
    let regionChanged = false;
    for (const t of active) {
      const s = t.pnp ? -1 : 1, vb = volts[t.b] ?? 0, ve = volts[t.e] ?? 0, vc = volts[t.c] ?? ve, vbe = s * (vb - ve), vce = s * (vc - ve), on = vbe > BJT_VBE, before = regions.get(t.id);
      let region = before;
      if (!on) region = "corte";
      else if (before === "corte") region = "activa";
      else if (before === "activa" && vce < BJT_VCE_SAT) region = "saturaci\xF3n";
      else if (before === "saturaci\xF3n" && (vce - BJT_VCE_SAT) / BJT_RCE > t.beta * (vbe - BJT_VBE) / BJT_RB) region = "activa";
      if (region !== before) {
        regionChanged = true;
        regions.set(t.id, region);
      }
      const gb = on ? 1 / BJT_RB : 1e-8, db = on ? BJT_VBE : 0;
      add(t.b, t.b, gb);
      add(t.b, t.e, -gb);
      rhs(t.b, s * gb * db);
      add(t.e, t.e, gb);
      add(t.e, t.b, -gb);
      rhs(t.e, -s * gb * db);
      if (!reachable.has(t.c)) continue;
      if (region === "corte") {
        add(t.c, t.c, 1e-8);
        add(t.c, t.e, -1e-8);
        add(t.e, t.e, 1e-8);
        add(t.e, t.c, -1e-8);
      } else if (region === "activa") {
        const k = t.beta / BJT_RB;
        add(t.c, t.b, k);
        add(t.c, t.e, -k);
        rhs(t.c, s * k * BJT_VBE);
        add(t.e, t.b, -k);
        add(t.e, t.e, k);
        rhs(t.e, -s * k * BJT_VBE);
        add(t.c, t.c, 1e-8);
        add(t.c, t.e, -1e-8);
        add(t.e, t.e, 1e-8);
        add(t.e, t.c, -1e-8);
      } else {
        const g = 1 / BJT_RCE;
        add(t.c, t.c, g);
        add(t.c, t.e, -g);
        rhs(t.c, s * g * BJT_VCE_SAT);
        add(t.e, t.e, g);
        add(t.e, t.c, -g);
        rhs(t.e, -s * g * BJT_VCE_SAT);
      }
    }
    for (const id of gminNodes) {
      const i = lookup.get(id);
      matrix[i][i] += 1e-7;
    }
    for (let col = 0; col < nodes.length; col++) {
      let pivot = col;
      for (let row = col + 1; row < nodes.length; row++) if (Math.abs(matrix[row][col]) > Math.abs(matrix[pivot][col])) pivot = row;
      if (Math.abs(matrix[pivot][col]) < 1e-14) return failure("No se puede resolver esta red: revisa conexiones y referencia de tensi\xF3n.");
      [matrix[pivot], matrix[col]] = [matrix[col], matrix[pivot]];
      const divisor = matrix[col][col];
      for (let j = col; j <= nodes.length; j++) matrix[col][j] /= divisor;
      for (let row = 0; row < nodes.length; row++) if (row !== col) {
        const scale = matrix[row][col];
        if (scale === 0) continue;
        for (let j = col; j <= nodes.length; j++) matrix[row][j] -= scale * matrix[col][j];
      }
    }
    const next = { ...fixed };
    nodes.forEach((id, i) => {
      next[id] = matrix[i][nodes.length];
    });
    if (!regionChanged && nodes.every((id) => Math.abs((volts[id] ?? 0) - next[id]) < 1e-8)) {
      volts = next;
      converged = true;
      break;
    }
    volts = branches.some((b) => b.junction) ? Object.fromEntries(Object.entries(next).map(([id, value]) => [id, id in fixed ? value : (volts[id] ?? 0) * 0.4 + value * 0.6])) : next;
  }
  if (!converged && nodes.length) return failure(transistors.length ? "El modelo del transistor no converge en este montaje. Revisa la resistencia de base y las conexiones." : "El modelo de diodo no converge en este montaje. Revisa polaridad y resistencia.");
  let floatingAll = floating;
  if (active.length) {
    const live = new Set(Object.keys(fixed)), edges = /* @__PURE__ */ new Map(), join = (x, y) => {
      if (!edges.has(x)) edges.set(x, /* @__PURE__ */ new Set());
      if (!edges.has(y)) edges.set(y, /* @__PURE__ */ new Set());
      edges.get(x).add(y);
      edges.get(y).add(x);
    };
    for (const b of branches) join(b.a, b.b);
    for (const t of transistors) {
      if ((regions.get(t.id) ?? "corte") !== "corte") {
        join(t.b, t.e);
        join(t.c, t.e);
      }
    }
    const pending = [...live];
    for (let i = 0; i < pending.length; i++) for (const next of edges.get(pending[i]) ?? []) if (!live.has(next)) {
      live.add(next);
      pending.push(next);
    }
    const lost = Object.keys(volts).filter((id) => !live.has(id) && !(id in fixed));
    if (lost.length) {
      volts = { ...volts };
      for (const id of lost) delete volts[id];
      floatingAll = [.../* @__PURE__ */ new Set([...floating, ...lost])];
    }
  }
  const amps = {}, bjts = {};
  for (const b of branches) if (volts[b.a] !== void 0 && volts[b.b] !== void 0) amps[b.id] = b.junction ? junctionCurrent(volts[b.a] - volts[b.b], b.resistance, b.junction).current : b.drop === void 0 ? (volts[b.a] - volts[b.b]) / b.resistance : Math.max(0, (volts[b.a] - volts[b.b] - b.drop) / b.resistance);
  for (const t of transistors) {
    const region = regions.get(t.id) ?? "corte", vb = volts[t.b], ve = volts[t.e], vc = volts[t.c];
    if (vb === void 0 || ve === void 0) {
      bjts[t.id] = { ib: 0, ic: 0, vbe: 0, vce: 0, region: "corte" };
      amps[t.id] = 0;
      continue;
    }
    const sg = t.pnp ? -1 : 1, vbe = sg * (vb - ve), vce = sg * ((vc ?? ve) - ve), ib = region === "corte" ? 0 : Math.max(0, (vbe - BJT_VBE) / BJT_RB), ic = region === "corte" ? 0 : region === "activa" ? t.beta * ib : Math.max(0, (vce - BJT_VCE_SAT) / BJT_RCE);
    bjts[t.id] = { ib, ic, vbe, vce, region };
    amps[t.id] = ic;
  }
  return { volts, amps, floating: floatingAll, fault: null, bjts };
}

// src/data/panelAC.ts
var multiply = (a3, b) => ({ re: a3.re * b.re - a3.im * b.im, im: a3.re * b.im + a3.im * b.re });
var divide = (a3, b) => {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a3.re * b.re + a3.im * b.im) / d, im: (a3.im * b.re - a3.re * b.im) / d };
};
function solvePanelAC(branches, fixed, coupled = []) {
  const graph2 = /* @__PURE__ */ new Map();
  for (const b of branches) {
    if (!graph2.has(b.a)) graph2.set(b.a, /* @__PURE__ */ new Set());
    if (!graph2.has(b.b)) graph2.set(b.b, /* @__PURE__ */ new Set());
    graph2.get(b.a).add(b.b);
    graph2.get(b.b).add(b.a);
  }
  for (const load of coupled) {
    const ids = load.ports.flat();
    for (const a3 of ids) {
      if (!graph2.has(a3)) graph2.set(a3, /* @__PURE__ */ new Set());
      for (const b of ids) if (a3 !== b) graph2.get(a3).add(b);
    }
  }
  const reached = new Set(Object.keys(fixed)), queue = [...reached];
  for (let i = 0; i < queue.length; i++) for (const id of graph2.get(queue[i]) ?? []) if (!reached.has(id)) {
    reached.add(id);
    queue.push(id);
  }
  const nodes = [...reached].filter((id) => !(id in fixed)), index = new Map(nodes.map((id, i) => [id, i])), n = nodes.length;
  const volts = { ...fixed }, amps = {}, floating = [...graph2.keys()].filter((id) => !reached.has(id));
  const fail = (fault) => ({ volts: { ...fixed }, amps: {}, floating, fault });
  if (n > 256) return fail("La red AC supera el l\xEDmite del simulador.");
  const re = nodes.map(() => new Float64Array(n + 1)), im = nodes.map(() => new Float64Array(n + 1));
  const add = (row, col, g) => {
    const i = index.get(row);
    if (i === void 0) return;
    const j = index.get(col);
    if (j !== void 0) {
      re[i][j] += g.re;
      im[i][j] += g.im;
    } else {
      const z = multiply(g, fixed[col] ?? { re: 0, im: 0 });
      re[i][n] -= z.re;
      im[i][n] -= z.im;
    }
  };
  for (const b of branches) {
    if (b.a === b.b || !reached.has(b.a)) continue;
    const z = { re: b.resistance, im: b.reactance ?? 0 };
    if (!Number.isFinite(z.re) || !Number.isFinite(z.im) || Math.hypot(z.re, z.im) < 1e-9) return fail("Impedancia AC inv\xE1lida.");
    const y = divide({ re: 1, im: 0 }, z), neg = { re: -y.re, im: -y.im };
    add(b.a, b.a, y);
    add(b.b, b.b, y);
    add(b.a, b.b, neg);
    add(b.b, b.a, neg);
  }
  for (const load of coupled) for (let i = 0; i < load.ports.length; i++) for (let j = 0; j < load.ports.length; j++) {
    const [a3, b] = load.ports[i], [c, d] = load.ports[j], y = load.admittance[i][j], neg = { re: -y.re, im: -y.im };
    add(a3, c, y);
    add(a3, d, neg);
    add(b, c, neg);
    add(b, d, y);
  }
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) if (Math.hypot(re[row][col], im[row][col]) > Math.hypot(re[pivot][col], im[pivot][col])) pivot = row;
    if (Math.hypot(re[pivot][col], im[pivot][col]) < 1e-12) return fail("Red AC sin referencia suficiente.");
    [re[col], re[pivot]] = [re[pivot], re[col]];
    [im[col], im[pivot]] = [im[pivot], im[col]];
    const p = { re: re[col][col], im: im[col][col] };
    for (let j = col; j <= n; j++) {
      const z = divide({ re: re[col][j], im: im[col][j] }, p);
      re[col][j] = z.re;
      im[col][j] = z.im;
    }
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const g = { re: re[row][col], im: im[row][col] };
      for (let j = col; j <= n; j++) {
        const z = multiply(g, { re: re[col][j], im: im[col][j] });
        re[row][j] -= z.re;
        im[row][j] -= z.im;
      }
    }
  }
  for (let i = 0; i < n; i++) volts[nodes[i]] = { re: re[i][n], im: im[i][n] };
  for (const b of branches) {
    const a3 = volts[b.a], z = volts[b.b];
    amps[b.id] = a3 && z ? divide({ re: a3.re - z.re, im: a3.im - z.im }, { re: b.resistance, im: b.reactance ?? 0 }) : { re: 0, im: 0 };
  }
  for (const load of coupled) {
    const v = load.ports.map(([a3, b]) => ({ re: (volts[a3]?.re ?? 0) - (volts[b]?.re ?? 0), im: (volts[a3]?.im ?? 0) - (volts[b]?.im ?? 0) }));
    for (let i = 0; i < v.length; i++) amps[load.ids[i]] = load.admittance[i].reduce((sum2, y, j) => {
      const x = multiply(y, v[j]);
      return { re: sum2.re + x.re, im: sum2.im + x.im };
    }, { re: 0, im: 0 });
  }
  if (Object.values(volts).some((v) => !Number.isFinite(v.re) || !Number.isFinite(v.im))) return fail("El c\xE1lculo AC no converge.");
  return { volts, amps, floating, fault: null };
}

// src/data/panelMotorDynamics.ts
var MOTOR_EQUIVALENT = { statorOhms: 4, rotorOhms: 3, statorX50: 7, rotorX50: 7, magnetizingX50: 180, poles: 4, inertia: 0.18, friction: 5e-3 };
var motorFrequency = (m) => Math.max(20, Math.min(70, m.frequencyHz ?? 50));
function motorEquivalent(m, slipOverride) {
  const p = m.motorParameters ?? MOTOR_EQUIVALENT, f = motorFrequency(m), syncRpm = 120 * f / p.poles, dir = m.motorDirection ?? 1;
  const slip = Math.max(1e-3, Math.min(1.999, slipOverride ?? 1 - (m.rotorRpm ?? 0) / (dir * syncRpm))), zrot = { re: p.rotorOhms / slip, im: p.rotorX50 * f / 50 }, zmag = { re: 0, im: p.magnetizingX50 * f / 50 };
  const parallel = divide(multiply(zrot, zmag), { re: zrot.re + zmag.re, im: zrot.im + zmag.im }), impedance = { re: p.statorOhms + parallel.re, im: p.statorX50 * f / 50 + parallel.im };
  const rotorRatio = divide(divide(parallel, impedance), zrot);
  return { impedance, slip, syncRpm, rotorRatio };
}

// src/data/panelSequences.ts
var a = { re: -0.5, im: Math.sqrt(3) / 2 };
var a2 = { re: -0.5, im: -Math.sqrt(3) / 2 };
var sum = (z) => ({ re: z.reduce((s, v) => s + v.re, 0) / 3, im: z.reduce((s, v) => s + v.im, 0) / 3 });
function sequences(v) {
  return { zero: sum(v), positive: sum([v[0], multiply(a, v[1]), multiply(a2, v[2])]), negative: sum([v[0], multiply(a2, v[1]), multiply(a, v[2])]) };
}
var restore = (z, p, n) => [{ re: z.re + p.re + n.re, im: z.im + p.im + n.im }, ...[[a2, a], [a, a2]].map(([x, y]) => {
  const px = multiply(x, p), ny = multiply(y, n);
  return { re: z.re + px.re + ny.re, im: z.im + px.im + ny.im };
})];
function motorAdmittance(model) {
  const eq = motorEquivalent(model), neg = motorEquivalent(model, 2 - eq.slip), forward = divide({ re: 1, im: 0 }, eq.impedance), backward = divide({ re: 1, im: 0 }, neg.impedance), dir = model.motorDirection ?? 1;
  const cols = [0, 1, 2].map((j) => {
    const seq = sequences([0, 1, 2].map((i) => ({ re: i === j ? 1 : 0, im: 0 })));
    return restore(multiply(seq.zero, forward), multiply(seq.positive, dir === 1 ? forward : backward), multiply(seq.negative, dir === 1 ? backward : forward));
  });
  return [0, 1, 2].map((i) => [0, 1, 2].map((j) => cols[j][i]));
}
function switchingRms(current2, model) {
  const rms = Math.hypot(current2.re, current2.im), age = (model.simulationSeconds ?? 0) - (model.lastMakeSeconds ?? -10);
  if (model.lastMakeSeconds == null || age < 0 || age > 0.2 || model.motorMode !== "induction") return rms;
  const omega = 2 * Math.PI * motorFrequency(model), z = motorEquivalent(model).impedance, tau = Math.max(5e-4, Math.min(0.08, Math.abs(z.im) / (omega * Math.max(0.05, z.re)))), close = omega * model.lastMakeSeconds, offset = -Math.SQRT2 * (current2.re * Math.cos(close) - current2.im * Math.sin(close));
  let squares = 0;
  for (let i = 0; i < 64; i++) {
    const t = age + (i + 0.5) / 64 / motorFrequency(model), phase = omega * (model.lastMakeSeconds + t), sample = Math.SQRT2 * (current2.re * Math.cos(phase) - current2.im * Math.sin(phase)) + offset * Math.exp(-t / tau);
    squares += sample * sample;
  }
  return Math.sqrt(squares / 64);
}

// src/data/panelElectrical.ts
var DEFAULT_PANEL_METER_MODEL = { nameplate: { ...EXAMPLE_RATING }, lineVolts: 380, coilOhms: 240, pilotOhms: 480, windingOhms: 100, motorMode: "induction", frequencyHz: 50, loadTorqueNm: 4, lineOhms: 0.15 };
function panelElectrical(wires, input, relays, timed, model = DEFAULT_PANEL_METER_MODEL, meter2) {
  const parent = new Map(TERMINALS.map((t) => [t.key, t.key]));
  const root = (id) => {
    const p = parent.get(id);
    if (!p) return id;
    if (p !== id) parent.set(id, root(p));
    return parent.get(id);
  };
  const join = (a3, b) => parent.set(root(a3), root(b));
  for (const w of wires) join(w.from.terminalId, w.to.terminalId);
  const contacts = simulationContacts(input, relays, timed);
  for (const [a3, b] of contacts) join(a3, b);
  const ports = {};
  const branches = [], load = (id, a3, b, resistance, reactance = 0) => {
    ports[id] = [a3, b];
    a3 = root(a3);
    b = root(b);
    if (a3 !== b) branches.push({ id, a: a3, b, resistance, reactance });
  };
  for (const id of relayIds()) load(id, `${id}:A1`, `${id}:A2`, model.coilOhms);
  for (let n = 1; n <= 4; n++) load(`pilot-${n}`, `BOTONERAS:PILOTO_${n}`, "BOTONERAS:N", model.pilotOhms);
  const motor2 = model.motorMode === "induction" ? motorEquivalent(model).impedance : { re: model.windingOhms, im: 0 };
  for (const p of ["U", "V", "W"]) load(`winding-${p}`, `BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`, motor2.re, motor2.im);
  if (meter2) load("ammeter", meter2.red, meter2.black, 0.1);
  const energized = input.enabled && input.plugged, control = energized && input.breakers.every(Boolean), force = energized && input.forceBreaker;
  const source2 = [
    { id: "FUENTE:F", re: control ? 24 : 0, im: 0, family: "control" },
    { id: "FUENTE:N", re: 0, im: 0, family: "control" },
    ...["R", "S", "T"].filter((p) => model.openPhase !== p).map((p) => {
      const i = ["R", "S", "T"].indexOf(p), v = force ? model.lineVolts * (model.phaseScale?.[i] ?? 1) / Math.sqrt(3) : 0;
      return { id: (model.lineOhms ?? 0) > 0 ? `__SUPPLY_${p}` : `FUENTE:${p}`, re: v * Math.cos(-i * 2 * Math.PI / 3), im: v * Math.sin(-i * 2 * Math.PI / 3), family: "force" };
    })
  ];
  if ((model.lineOhms ?? 0) > 0) {
    for (const phase of ["R", "S", "T"]) if (model.openPhase !== phase) load(`supply-${phase}`, `__SUPPLY_${phase}`, `FUENTE:${phase}`, model.lineOhms);
  }
  const fixedRe = {}, fixedIm = {}, families = /* @__PURE__ */ new Map();
  let fault = null;
  for (const s of source2) {
    const r = root(s.id);
    if (r in fixedRe && Math.hypot(fixedRe[r] - s.re, fixedIm[r] - s.im) > 1e-6) fault = "Cortocircuito entre fuentes de tensi\xF3n.";
    fixedRe[r] = s.re;
    fixedIm[r] = s.im;
    if (!families.has(r)) families.set(r, /* @__PURE__ */ new Set());
    families.get(r).add(s.family);
  }
  for (let i = 0; i < branches.length + 1; i++) {
    let changed = false;
    for (const b of branches) {
      const both = /* @__PURE__ */ new Set([...families.get(b.a) ?? [], ...families.get(b.b) ?? []]);
      for (const id of [b.a, b.b]) if (both.size > (families.get(id)?.size ?? 0)) {
        families.set(id, new Set(both));
        changed = true;
      }
    }
    if (!changed) break;
  }
  if ([...families.values()].some((f) => f.size > 1)) fault = "Mando y fuerza unidos: revisa la separaci\xF3n de las fuentes.";
  const same = (a3, b) => root(`BORNERA_MOTOR:${a3}`) === root(`BORNERA_MOTOR:${b}`), connection = same("U2", "V2") && same("V2", "W2") ? "star" : same("U1", "W2") && same("V1", "U2") && same("W1", "V2") ? "delta" : null;
  const coupled = model.motorMode === "induction" && connection ? [{ ids: ["winding-U", "winding-V", "winding-W"], ports: ["U", "V", "W"].map((p) => [root(`BORNERA_MOTOR:${p}1`), root(`BORNERA_MOTOR:${p}2`)]), admittance: motorAdmittance(model) }] : [];
  const solved = solvePanelAC(coupled.length ? branches.filter((b) => !b.id.startsWith("winding-")) : branches, Object.fromEntries(Object.keys(fixedRe).map((id) => [id, { re: fixedRe[id], im: fixedIm[id] }])), coupled);
  fault ??= solved.fault;
  const current2 = meter2 && root(meter2.red) === root(meter2.black) ? 0 : switchingRms(solved.amps.ammeter ?? { re: 0, im: 0 }, model);
  const phasor = (a3, b) => {
    const va = solved.volts[root(a3)], vb = solved.volts[root(b)];
    return va && vb ? { re: va.re - vb.re, im: va.im - vb.im } : { re: 0, im: 0 };
  };
  const voltage = (a3, b) => {
    a3 = root(a3);
    b = root(b);
    if (a3 === b) return 0;
    const fa = families.get(a3), fb = families.get(b);
    if (!fa?.size || !fb?.size || [...fa].some((f) => !fb.has(f))) return null;
    if (solved.volts[a3] === void 0 || solved.volts[b] === void 0) return null;
    return Math.hypot(solved.volts[a3].re - solved.volts[b].re, solved.volts[a3].im - solved.volts[b].im);
  };
  const linePhasors = {};
  const lineAmps = Object.fromEntries(["R", "S", "T"].map((phase) => {
    const node = root(`FUENTE:${phase}`), sum2 = (part) => branches.filter((b) => !b.id.startsWith("supply-")).reduce((total, b) => total + (b.a === node ? solved.amps[b.id]?.[part] ?? 0 : b.b === node ? -(solved.amps[b.id]?.[part] ?? 0) : 0), 0);
    linePhasors[phase] = { re: sum2("re"), im: sum2("im") };
    return [phase, switchingRms(linePhasors[phase], model)];
  }));
  const conductorCurrent = (from, to) => {
    const index = contacts.findIndex(([a3, b]) => a3 === from && b === to || a3 === to && b === from);
    if (index < 0) return { amps: 0, bypassed: false };
    const graph2 = /* @__PURE__ */ new Map(), edge = (a3, b) => {
      if (!graph2.has(a3)) graph2.set(a3, /* @__PURE__ */ new Set());
      if (!graph2.has(b)) graph2.set(b, /* @__PURE__ */ new Set());
      graph2.get(a3).add(b);
      graph2.get(b).add(a3);
    };
    wires.forEach((w) => edge(w.from.terminalId, w.to.terminalId));
    contacts.forEach(([a3, b], i) => {
      if (i !== index) edge(a3, b);
    });
    const region = (id) => {
      const seen = /* @__PURE__ */ new Set([id]), queue = [id];
      for (let i = 0; i < queue.length; i++) for (const next of graph2.get(queue[i]) ?? []) if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
      return seen;
    };
    let side = region(to);
    if (side.has(from)) return { amps: 0, bypassed: true };
    if (source2.some((v) => side.has(v.id))) side = region(from);
    const current3 = Object.entries(ports).reduce((sum2, [id, [a3, b]]) => {
      const z = solved.amps[id] ?? { re: 0, im: 0 }, sign = Number(side.has(a3)) - Number(side.has(b));
      return { re: sum2.re + sign * z.re, im: sum2.im + sign * z.im };
    }, { re: 0, im: 0 });
    return { amps: switchingRms(current3, model), bypassed: false };
  };
  const thermalPoles = [1, 2, 3].map((i) => conductorCurrent(`CONTACTOR_TERMICO:L${i}`, `CONTACTOR_TERMICO:T${i}`));
  const sequence = sequences(["U", "V", "W"].map((p) => phasor(`BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`))), positive = model.motorDirection === -1 ? sequence.negative : sequence.positive, negative = model.motorDirection === -1 ? sequence.positive : sequence.negative;
  const positiveVolts = Math.hypot(positive.re, positive.im), negativeVolts = Math.hypot(negative.re, negative.im);
  return { root, branches, current: current2, voltage, fault, lineAmps, clampAmps: (phases) => switchingRms(phases.reduce((v, p) => ({ re: v.re + (linePhasors[p]?.re ?? 0), im: v.im + (linePhasors[p]?.im ?? 0) }), { re: 0, im: 0 }), model), thermalAmps: thermalPoles.map((p) => p.amps), thermalBypassed: thermalPoles.some((p) => p.bypassed), connection, positiveVolts, negativeVolts, unbalancePct: positiveVolts > 1 ? 100 * negativeVolts / positiveVolts : 0 };
}

// src/data/panelCalibration.ts
var resistanceKey = (a3, b) => [a3, b].sort().join("|");

// src/data/panelMeter.ts
function readPanelMeter(wires, input, result, timed, mode, red, black, model = DEFAULT_PANEL_METER_MODEL, redJack = "vo") {
  const kind = mode === "V" ? "voltage" : mode === "A" ? "current" : mode === "C" ? "continuity" : "resistance", answer = (text, note2, value2) => ({ text, note: note2, value: value2, kind });
  if (mode === "OFF") return answer("", "Selecciona V~, A~, \u03A9 o continuidad.");
  if (mode === "A" && redJack !== "a10") return answer("USA A Y COM", "Conecta el cable rojo a A y el negro a COM. Abre una rama del circuito e inserta las puntas en sus dos extremos.");
  if (mode !== "A" && redJack === "a10") return answer("USA V \u03A9", "Vuelve a conectar el cable rojo a V \u03A9 para medir tensi\xF3n, resistencia o continuidad.");
  if (!red || !black || ![red, black].every((id) => TERMINALS.some((t) => t.key === id))) return answer("Pon las puntas", "Arrastra cada punta a un borne real del panel.");
  const energized = input.enabled && input.plugged, contacts = simulationContacts(input, result.relays, timed), parent = /* @__PURE__ */ new Map();
  const root = (x) => {
    const p = parent.get(x);
    if (!p) {
      parent.set(x, x);
      return x;
    }
    if (p !== x) parent.set(x, root(p));
    return parent.get(x);
  }, join = (a3, b) => parent.set(root(a3), root(b));
  const edges = [...wires.map((w) => [w.from.terminalId, w.to.terminalId]), ...contacts];
  edges.forEach(([a3, b]) => join(a3, b));
  if (mode === "R" || mode === "C") {
    if (energized) return answer("DESENERGIZA", "Desconecta el enchufe virtual antes de medir \u03A9 o continuidad, tambi\xE9n si los interruptores est\xE1n abiertos.");
    if (root(red) === root(black)) {
      const branches = edges.map(([a3, b], i) => ({ id: String(i), a: a3, b, resistance: i < wires.length ? 0.01 : 0.02 })).filter((b) => root(b.a) === root(red)), r = red === black ? 0 : (() => {
        const solved2 = solveDC(branches, { [red]: 1, [black]: 0 });
        return solved2.fault ? 0 : 1 / Math.abs(branches.reduce((sum2, b) => b.a === red ? sum2 + (solved2.amps[b.id] ?? 0) : b.b === red ? sum2 - (solved2.amps[b.id] ?? 0) : sum2, 0));
      })();
      const value2 = 0.4 + (Number.isFinite(r) ? r : 0);
      return answer(`${value2.toFixed(1).replace(".", ",")} \u03A9`, "Modelo de prueba: 0,2 \u03A9 por punta, 0,01 \u03A9 por cable y 0,02 \u03A9 por contacto cerrado; valores did\xE1cticos.", value2);
    }
  }
  const loads = [...["U", "V", "W"].map((p) => [`BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`]), ...relayIds().map((id) => [`${id}:A1`, `${id}:A2`]), ...[1, 2, 3, 4].map((n) => [`BOTONERAS:PILOTO_${n}`, "BOTONERAS:N"])], loadGraph = /* @__PURE__ */ new Map();
  loads.forEach(([a3, b]) => {
    a3 = root(a3);
    b = root(b);
    if (a3 === b) return;
    if (!loadGraph.has(a3)) loadGraph.set(a3, /* @__PURE__ */ new Set());
    if (!loadGraph.has(b)) loadGraph.set(b, /* @__PURE__ */ new Set());
    loadGraph.get(a3).add(b);
    loadGraph.get(b).add(a3);
  });
  const reachable = (start) => {
    const origin = root(start), seen = /* @__PURE__ */ new Set([origin]), queue = [origin];
    while (queue.length) {
      const a3 = queue.pop();
      for (const b of loadGraph.get(a3) ?? []) if (!seen.has(b)) {
        seen.add(b);
        queue.push(b);
      }
    }
    return seen;
  };
  if (mode === "R" || mode === "C") {
    if (!reachable(red).has(root(black))) return answer("OL", "No hay camino por cables, contactos o cargas modeladas.", null);
    if (!model.resistanceMode) return answer("SIN DATOS", "Resistencia f\xEDsica sin documentar. Elige expl\xEDcitamente un perfil did\xE1ctico o aporta una medici\xF3n de referencia.");
    const unknown = [], dcLoads = loads.flatMap(([a3, b], i) => {
      const datum = model.providedResistances?.[resistanceKey(a3, b)], ohms = model.resistanceMode === "model" ? datum?.ohms ?? (i < 3 ? (model.motorParameters ?? MOTOR_EQUIVALENT).statorOhms : i < 3 + relayIds().length ? model.coilOhms : model.pilotOhms) : datum?.ohms;
      if (ohms === void 0) {
        if (reachable(red).has(root(a3)) || reachable(red).has(root(b))) unknown.push(a3 + "\u2013" + b);
        return [];
      }
      return [{ id: "load-" + i, a: a3, b, resistance: ohms }];
    });
    if (unknown.length) return answer("SIN DATOS", "Hay resistencias pendientes de referencia en este circuito. A\xEDsla el componente o completa los datos aportados.");
    const branches = [...edges.map(([a3, b], i) => ({ id: "path-" + i, a: a3, b, resistance: i < wires.length ? 0.01 : 0.02 })), ...dcLoads], solved2 = solveDC(branches, { [red]: 1, [black]: 0 });
    if (solved2.fault) return answer("SIN DATOS", solved2.fault);
    const amps = Math.abs(branches.reduce((sum2, b) => sum2 + (b.a === red ? solved2.amps[b.id] ?? 0 : b.b === red ? -(solved2.amps[b.id] ?? 0) : 0), 0));
    if (amps < 1e-12) return answer("OL", "Circuito abierto para la corriente de prueba.", null);
    const value2 = 0.4 + 1 / amps, shown2 = formatReading("resistance", value2);
    return answer(`${shown2.text} ${shown2.unit}`, model.resistanceMode === "model" ? "\u03A9 del perfil did\xE1ctico, incluidos caminos en paralelo y 0,2 \u03A9 por punta. No es una resistencia medida del equipo f\xEDsico." : "\u03A9 calculados con datos aportados por el usuario y 0,2 \u03A9 por punta; la validaci\xF3n f\xEDsica sigue pendiente.", value2);
  }
  if (!energized) return answer(mode === "A" ? "0,000 A" : "0,000 V", "Fuente virtual desconectada. Esta lectura pertenece al modelo, no verifica el equipo f\xEDsico.", 0);
  if (result.fault) return answer("REVISAR", "Resuelve la falla de la simulaci\xF3n antes de medir.");
  const solved = panelElectrical(wires, input, result.relays, timed, model, mode === "A" ? { red, black } : void 0);
  if (solved.fault) return answer(mode === "A" ? "REVISAR SERIE" : "REVISAR", solved.fault);
  const note = (model.motorMode === "induction" ? `Inducci\xF3n RMS: ${Math.round(model.rotorRpm ?? 0)} rpm, carga ${model.loadTorqueNm ?? 4} N\xB7m. ` : "Equivalente resistivo. ") + `Modelo did\xE1ctico: mando 24 V~, fuerza ${model.lineVolts} V~ entre fases; bobina ${model.coilOhms} \u03A9, piloto ${model.pilotOhms} \u03A9 y ${model.motorMode === "induction" ? "devanados con impedancia de inducci\xF3n" : `devanado ${model.windingOhms} \u03A9 resistivo`}. Valores ajustables, no datos de placa.`;
  if (mode === "A") {
    if (root(red) === root(black)) return answer("ABRE LA RAMA", "Las puntas est\xE1n unidas por un cable o contacto. Retira un extremo del cable e intercala el tester en ese corte.");
    if (solved.current > 10) return answer("SOBRECARGA", "La entrada A supera 10 A: circuito virtual abierto. Revisa que el tester est\xE9 en serie y no entre dos fuentes.");
    const shown2 = formatReading("current", solved.current);
    return answer(`${shown2.text} ${shown2.unit}`, note + " El tester cierra la rama con una carga de 0,1 \u03A9.", solved.current);
  }
  const value = solved.voltage(red, black);
  if (value === null) return answer("SIN REFERENCIA", "Punto flotante o fuentes aisladas entre s\xED. Usa dos puntos de mando o dos puntos de fuerza; TP no es el retorno de medida.");
  const shown = formatReading("voltage", value);
  return answer(`${shown.text} ${shown.unit}`, note, value);
}

// src/data/meterActivity.ts
var ACTIVITY_PROFILES = { manual: { title: "Circuito de la gu\xEDa \xB7 manual", detail: "KM1 principal, KM3 estrella y KM2 tri\xE1ngulo. S1 inicia, S3 cambia y S2 detiene; equivalen a SB2, SB3 y SB1 del profesor." }, matias: { title: "Proyecto de Mat\xEDas \xB7 autom\xE1tico", detail: "45 cables originales. KT1 es principal, KM1 estrella y KM2 tri\xE1ngulo. S1 inicia y el temporizador cambia la conexi\xF3n. Para estudiar, el retardo se prepara en 60 s." } };
var isForceTerminal = (id) => /^FUENTE:[RST]$|^BORNERA_MOTOR:|:[LT][123]$|:TP/.test(id);
var isForceWire = (w) => isForceTerminal(w.from.terminalId) || isForceTerminal(w.to.terminalId);
function activityDocument(profile, scope = "full") {
  const wires = [];
  if (profile === "manual") for (const [from, to] of LESSONS.estrellaManual.pairs) wires.push({ id: crypto.randomUUID(), from: { terminalId: from }, to: { terminalId: to }, color: BANANA_COLOR, route: { sag: 130 }, layer: wires.length + 1 });
  else wires.push(...structuredClone(activity2Matias_default.wires));
  return { ...emptyPractice(), title: `Actividad 2 \xB7 mediciones \xB7 ${profile === "manual" ? "gu\xEDa manual" : "Mat\xEDas"}`, wires: scope === "control" ? wires.filter((w) => !isForceWire(w)) : wires, diagram: profile === "manual" ? LESSONS.estrellaManual.diagram : emptyPractice().diagram };
}
function matchesActivity(profile, wires, scope = "full") {
  const reference2 = profile === "manual" ? LESSONS.estrellaManual.pairs.map(([from, to]) => ({ from: { terminalId: from }, to: { terminalId: to } })) : activity2Matias_default.wires;
  const ids = [.../* @__PURE__ */ new Set([...TERMINALS.map((t) => t.key), ...reference2.flatMap((w) => [w.from.terminalId, w.to.terminalId])])], known = new Set(ids);
  if (wires.some((w) => !known.has(w.from.terminalId) || !known.has(w.to.terminalId))) return false;
  const domain = scope === "control" ? ids.filter((id) => !isForceTerminal(id)) : ids;
  if (scope === "control" && wires.some((w) => isForceTerminal(w.from.terminalId) !== isForceTerminal(w.to.terminalId))) return false;
  const partition = (ws) => {
    const parent = new Map(ids.map((id) => [id, id]));
    const root = (id) => {
      const p = parent.get(id);
      if (p !== id) parent.set(id, root(p));
      return parent.get(id);
    };
    ws.forEach((w) => parent.set(root(w.from.terminalId), root(w.to.terminalId)));
    const groups = /* @__PURE__ */ new Map();
    domain.forEach((id) => {
      const key = root(id);
      groups.set(key, [...groups.get(key) ?? [], id]);
    });
    return [...groups.values()].map((g) => g.sort().join("|")).sort().join(";");
  };
  return partition(wires) === partition(reference2);
}
var meter = (id, title, page, point2, stage, mode, red, black, why, table, expected) => ({ id, title, page, point: point2, stage, mode, red, black, why, table, expected, kind: "meter", task: `Selecciona ${mode === "V" ? "V~" : mode === "R" ? "\u03A9" : "continuidad"}. Coloca las puntas en los dos bornes indicados y escribe lo que lees.` });
var ACTIVITY_STEPS = [
  meter("thermal", "Continuidad del t\xE9rmico", 4, "4 y 11", "cold", "C", "CONTACTOR_TERMICO:95", "CONTACTOR_TERMICO:96", "Antes de energizar, comprueba el contacto NC 95\u201396 en reposo. El tono y la baja resistencia indican un camino cerrado.", void 0, "low"),
  meter("stop", "Continuidad del paro", 4, "4", "cold", "C", "BOTONERAS:S2:1", "BOTONERAS:S2:2", "SB1 del dibujo es S2 en el banco. Su par NC 1\u20132 est\xE1 cerrado en reposo.", void 0, "low"),
  meter("start-open", "Reconocer un auxiliar NA libre", 4, "Preparaci\xF3n adicional", "cold", "C", "CONTACTOR_TRIFASICO:63", "CONTACTOR_TRIFASICO:64", "El auxiliar NA de reserva 63\u201364 de KM2 est\xE1 sin cablear en ambos montajes y abierto en reposo. As\xED evitas confundir el contacto abierto con rutas paralelas del circuito: OL no significa un fallo del instrumento.", void 0, "open"),
  meter("contact-ohms", "Resistencia de un contacto cerrado", 4, "Preparaci\xF3n adicional", "cold", "R", "CONTACTOR_TERMICO:95", "CONTACTOR_TERMICO:96", "Pr\xE1ctica adicional de \u03A9: la gu\xEDa pide continuidad, no una tabla de resistencias. El modelo incluye 0,2 \u03A9 por punta y 0,02 \u03A9 por contacto; no es una resistencia real de placa.", void 0, "low"),
  meter("control-volts", "Voltaje de alimentaci\xF3n del mando", 5, "5", "control", "V", "FUENTE:F", "FUENTE:N", "En el banco virtual el secundario F\u2013N es de 24 V~. La gu\xEDa usa alimentaci\xF3n monof\xE1sica; no confundas estos 24 V did\xE1cticos con su red monof\xE1sica."),
  { id: "control-rest", title: "Mando \xB7 piloto de motor detenido", page: 6, point: "6", stage: "control-rest", kind: "action", why: "La gu\xEDa comprueba primero el circuito de mando, sin habilitar fuerza. El piloto rojo P2 debe indicar reposo.", task: "Mant\xE9n FUERZA abierta. Con el mando alimentado y sin pulsar marcha, observa P2 rojo encendido." },
  { id: "control-star", title: "Mando \xB7 orden de partir en estrella", page: 6, point: "7", stage: "control-star", kind: "action", why: "En el esquema del profesor, SB2 activa KM1 y KM3. Se apaga el rojo y se enciende el verde de estrella; con FUERZA abierta el motor a\xFAn no gira.", task: "Sin cerrar FUERZA, pulsa y suelta S1 (SB2 del profesor). Comprueba las bobinas y el piloto de estrella." },
  { id: "control-delta", title: "Mando \xB7 orden de conexi\xF3n tri\xE1ngulo", page: 7, point: "8", stage: "control-delta", kind: "action", why: "En la gu\xEDa, KM1 se mantiene, KM3 cae y entra KM2. La se\xF1al pasa del verde de estrella al de tri\xE1ngulo, todav\xEDa sin fuerza.", task: "En el manual pulsa S3 (SB3). En la variante opcional de Mat\xEDas espera el temporizador. Mant\xE9n FUERZA abierta." },
  { id: "control-trip", title: "Mando \xB7 prueba TEST del t\xE9rmico", page: 7, point: "9", stage: "control-trip", kind: "action", why: "El profesor comprueba el disparo antes de montar fuerza: caen las bobinas, se apagan los verdes y se encienden amarillo y rojo.", task: "Pulsa TEST del t\xE9rmico y verifica el corte de las bobinas y los dos pilotos de aviso." },
  { id: "control-reset", title: "Mando \xB7 RESET y vuelta al reposo", page: 7, point: "10", stage: "control-reset", kind: "action", why: "RESET apaga el amarillo y mantiene el rojo. Rearmar no es una nueva orden de marcha.", task: "Rearma el t\xE9rmico. Comprueba que solo el piloto rojo queda encendido y las bobinas siguen desactivadas." },
  meter("force-continuity", "Fuerza \xB7 comprobar continuidad antes de energizar", 8, "11", "cold", "C", "FUENTE:R", "CONTACTOR_TERMICO:L1", "Con las alimentaciones desconectadas, comprueba el cable desde R a la entrada L1 del contactor principal. No confundas este cable con el polo interno L1\u2013T1.", void 0, "low"),
  ...[["R", "S"], ["R", "T"], ["S", "T"]].map(([a3, b]) => meter(`line-${a3}${b}`, `Voltaje entre fases ${a3}\u2013${b}`, 8, "12", "supply", "V", `FUENTE:${a3}`, `FUENTE:${b}`, "Las dos puntas van entre fases, en paralelo. No uses TP ni el N del mando como referencia de fuerza. El modelo parte de 380 V entre fases.", "Tabla 1")),
  { id: "powered-rest", title: "Fuerza y mando \xB7 motor detenido", page: 8, point: "13", stage: "powered-rest", kind: "action", why: "Despu\xE9s de medir la alimentaci\xF3n trif\xE1sica, el profesor vuelve a habilitar el mando y verifica el piloto rojo antes de arrancar.", task: "Mant\xE9n FUERZA cerrada, vuelve a cerrar ambos CONTROL y verifica P2 rojo y el motor detenido." },
  { id: "start-star", title: "Poner el motor en estrella", page: 8, point: "14", stage: "star", kind: "action", why: "Reconoce primero qu\xE9 contactores act\xFAan. La lectura siguiente solo es v\xE1lida cuando el motor est\xE1 en estrella.", task: "Conecta la corriente virtual, cierra FUERZA y los dos CONTROL. Pulsa y suelta S1 (SB2 en la gu\xEDa)." },
  ...["U", "V", "W"].map((p) => meter(`star-${p}`, `Estrella \xB7 devanado ${p}1\u2013${p}2`, 9, "15", "star", "V", `BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`, "Mide entre los dos extremos de una misma bobina, no entre dos bornes superiores. En el modelo equilibrado esperas V de l\xEDnea / \u221A3.", "Tabla 3")),
  ...["R", "S", "T"].map((phase) => ({ id: `star-current-${phase}`, title: `Estrella \xB7 corriente de l\xEDnea ${phase}`, page: 9, point: "16", stage: "star", kind: "clamp", phase, table: "Tabla 4", why: "La gu\xEDa pide amper\xEDmetro de tenazas: abraza un solo conductor de entrada, antes de sus derivaciones. No conectes un mult\xEDmetro en A entre fases.", task: "En la pinza virtual, elige el conductor de entrada solicitado y registra su lectura." })),
  { id: "change-delta", title: "Cambiar a tri\xE1ngulo", page: 9, point: "17", stage: "delta", kind: "action", why: "La gu\xEDa manual mantiene KM1, desactiva KM3 y activa KM2. En Mat\xEDas, KT1 permanece y el temporizador cambia de KM1 a KM2.", task: "En el montaje manual pulsa y suelta S3 (SB3). En Mat\xEDas, reduce el retardo del temporizador y espera el cambio autom\xE1tico." },
  ...["U", "V", "W"].map((p) => meter(`delta-${p}`, `Tri\xE1ngulo \xB7 devanado ${p}1\u2013${p}2`, 10, "18", "delta", "V", `BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`, "Conserva la medici\xF3n entre los extremos de la misma bobina. En tri\xE1ngulo cada devanado queda entre dos fases y recibe la tensi\xF3n de l\xEDnea.", "Tabla 5")),
  ...["R", "S", "T"].map((phase) => ({ id: `delta-current-${phase}`, title: `Tri\xE1ngulo \xB7 corriente de l\xEDnea ${phase}`, page: 10, point: "19", stage: "delta", kind: "clamp", phase, table: "Tabla 6", why: "Vuelve a medir el mismo conductor de entrada, antes de las bifurcaciones. Compara con la corriente que registraste en estrella.", task: "Selecciona una sola fase en la pinza virtual y anota la corriente." })),
  { id: "compare", title: "Comparar estrella y tri\xE1ngulo", page: 10, point: "20", stage: "delta", kind: "compare", why: "Usa tus tablas para explicar c\xF3mo cambia la tensi\xF3n de cada bobina y la corriente de entrada. El motor de inducci\xF3n cambia su corriente con velocidad, carga y conexi\xF3n. Registra en qu\xE9 condici\xF3n hiciste cada medici\xF3n.", task: "Explica la relaci\xF3n VY \u2248 VL/\u221A3 y V\u0394 \u2248 VL. Calcula I\u0394/IY con tus datos. La relaci\xF3n 3 solo corresponde a la misma impedancia y tensi\xF3n de red; no es universal entre dos estados de marcha." },
  { id: "overload", title: "Comprobar la sobrecarga virtual", page: 11, point: "21", stage: "trip", kind: "action", why: "TEST abre 95\u201396, corta el mando y debe detener el motor. El contacto 97\u201398 se\xF1aliza el disparo.", task: "Activa TEST del t\xE9rmico y observa la parada y el aviso de sobrecarga." },
  { id: "reset", title: "Rearmar el rel\xE9 t\xE9rmico", page: 12, point: "22", stage: "reset", kind: "action", why: "RESET elimina el estado de disparo, pero no debe arrancar el motor por s\xED mismo.", task: "Rearma el t\xE9rmico y verifica que el motor permanezca detenido." },
  { id: "shutdown", title: "Desenergizar el banco", page: 12, point: "23\u201324", stage: "off", kind: "action", why: "Guarda los resultados para revisi\xF3n docente y deja el banco sin alimentaci\xF3n. La revisi\xF3n del profesor se registra por separado en el cuaderno de entrega.", task: "Abre FUERZA y ambos CONTROL y desconecta el enchufe virtual. Descarga tus resultados en la pesta\xF1a Resultados." },
  { id: "dismantle", title: "Desmontar y ordenar el panel", page: 12, point: "25", stage: "off", kind: "action", why: "La gu\xEDa termina desconectando los elementos. Tus mediciones se conservan al retirar los cables. Deshacer recupera el circuito.", task: "Con el banco sin alimentaci\xF3n, retira todos los cables o usa \xABDesmontar circuito\xBB. Despu\xE9s comprueba el cierre." }
];
function activityStep(profile, index) {
  const step = ACTIVITY_STEPS[index];
  if (step.id !== "force-continuity") return step;
  return { ...step, task: "Desenchufa, abre ambos CONTROL y FUERZA. " + step.task, ...profile === "matias" ? { black: "TEMPORIZADOR_1:L1", why: "En el proyecto opcional de Mat\xEDas el conjunto KT1 es el contactor principal. Desconecta las alimentaciones y comprueba el cable R \u2192 KT1:L1." } : {} };
}
function checkActivity(step, c) {
  const fail = (message) => ({ ready: false, message });
  if (step.id === "dismantle") {
    if (c.input.plugged || c.input.forceBreaker || c.input.breakers.some(Boolean)) return fail("Desconecta toda la alimentaci\xF3n antes de desmontar.");
    return c.wires.length ? fail("Retira los cables para dejar el panel desmontado. Tus resultados se conservan.") : { ready: true, message: "Panel sin alimentaci\xF3n y sin cables; cierre virtual comprobado." };
  }
  if (!matchesActivity(c.profile, c.wires, ACTIVITY_STEPS.findIndex((s) => s.id === step.id) < 10 ? "control" : "full")) return fail(c.profile === "manual" && c.wires.some((w) => [w.from.terminalId, w.to.terminalId].includes("BOTONERAS:S2:2") && [w.from.terminalId, w.to.terminalId].includes("BOTONERAS:S3:3")) ? "Referencia antigua: la entrada NA S3:3 debe alimentarse desde S1:4, despu\xE9s de la partida (figura 1, p\xE1g. 5). Desenergiza el banco virtual y corrige ese cable, o prepara el montaje actualizado; tus mediciones se conservan." : "El cableado ya no coincide con la pr\xE1ctica elegida. Revisa las conexiones; Deshacer conserva tu trabajo anterior.");
  const energized = c.input.enabled && c.input.plugged;
  if (["star", "delta"].includes(step.stage) && c.model.nameplate && !ratingCompatibility(c.model.nameplate, c.model.lineVolts, step.stage === "delta" ? "delta" : "star").ok) return fail(ratingCompatibility(c.model.nameplate, c.model.lineVolts, step.stage === "delta" ? "delta" : "star").message);
  if (step.stage === "cold" && energized) return fail("Desconecta el enchufe virtual antes de medir continuidad o resistencia. Abrir solo los interruptores no basta.");
  if (step.stage.startsWith("control") && (!energized || !c.input.breakers.every(Boolean))) return fail("Conecta la corriente virtual y cierra ambos interruptores CONTROL.");
  if (step.stage.startsWith("control") && c.input.forceBreaker) return fail("En esta parte el profesor comprueba solo el mando: abre FUERZA.");
  if (step.id === "force-continuity" && (c.input.forceBreaker || c.input.breakers.some(Boolean))) return fail("Desenchufa y abre FUERZA y los dos CONTROL antes de comprobar fuerza.");
  const allOff = Object.values(c.result.relays).every((v) => !v), main = c.profile === "manual" ? "CONTACTOR_TERMICO" : "TEMPORIZADOR_1", star = c.profile === "manual" ? "CONTACTOR_TRIFASICO_3" : "CONTACTOR_TERMICO";
  if (["control-rest", "control-reset", "powered-rest"].includes(step.stage) && (!allOff || c.input.thermalTripped || !c.result.pilots[1] || c.result.pilots[2])) return fail("Se esperan bobinas desactivadas, t\xE9rmico rearmado y solo el piloto rojo encendido.");
  if (step.stage === "powered-rest" && (!energized || !c.input.forceBreaker || !c.input.breakers.every(Boolean))) return fail("Conecta fuerza y ambos interruptores CONTROL para verificar el reposo antes de arrancar.");
  if (step.stage === "control-star" && (!c.result.relays[main] || !c.result.relays[star] || c.result.relays.CONTACTOR_TRIFASICO || !c.result.pilots[0] || c.result.pilots[1] || c.result.pilots[3])) return fail("Pulsa S1: deben entrar principal y estrella, con verde de estrella encendido y rojo apagado.");
  if (step.stage === "control-delta" && (!c.result.relays[main] || !c.result.relays.CONTACTOR_TRIFASICO || c.result.relays[star] || !c.result.pilots[3] || c.result.pilots[0] || c.result.pilots[1])) return fail("Se espera principal + tri\xE1ngulo, con estrella desactivada y su verde apagado.");
  if (step.stage === "control-trip" && (!c.input.thermalTripped || !allOff || !c.result.pilots[1] || !c.result.pilots[2])) return fail("Activa TEST y comprueba bobinas desactivadas, rojo y amarillo encendidos.");
  if (["supply", "star", "delta"].includes(step.stage) && (!energized || !c.input.forceBreaker)) return fail("Conecta la corriente virtual y cierra FUERZA.");
  if (step.stage === "supply" && c.result.motor.status !== "off") return fail("Det\xE9n el motor con S2 antes de comprobar la alimentaci\xF3n.");
  if ((step.stage === "star" || step.stage === "delta") && (c.result.motor.status !== "running" || c.result.motor.connection !== step.stage)) return fail(step.stage === "star" ? "El motor debe estar en estrella. Si el temporizador ya cambi\xF3, det\xE9n con S2 y vuelve a iniciar con S1." : "El motor debe estar en tri\xE1ngulo. Cambia con S3 en manual o espera al temporizador de Mat\xEDas.");
  if (step.stage === "trip" && (!c.input.thermalTripped || c.result.motor.status !== "off")) return fail("Activa TEST: el t\xE9rmico debe estar disparado y el motor detenido.");
  if (step.stage === "reset" && (c.input.thermalTripped || c.result.motor.status !== "off")) return fail("Rearma el t\xE9rmico y deja el motor detenido.");
  if (step.stage === "off" && (c.input.plugged || c.input.forceBreaker || c.input.breakers.some(Boolean))) return fail("Abre FUERZA y los dos CONTROL y desenchufa la corriente virtual.");
  if (c.result.fault) return fail("La simulaci\xF3n informa una falla. Revisa el montaje antes de registrar.");
  if (step.kind === "meter") {
    if (c.mode !== step.mode) return fail(`Selecciona ${step.mode === "V" ? "V~" : step.mode === "R" ? "\u03A9" : "continuidad"} en el selector del mult\xEDmetro.`);
    if (c.redJack !== "vo") return fail("Conecta el cable rojo a V \u03A9 y el negro a COM.");
    if (c.frozen) return fail("Quita HOLD y cualquier retenci\xF3n de la pantalla para observar la lectura actual.");
    if (!(c.probes[0] === step.red && c.probes[1] === step.black || c.probes[1] === step.red && c.probes[0] === step.black)) return fail("Las puntas todav\xEDa no est\xE1n en los dos bornes pedidos. Consulta \xABD\xF3nde poner las puntas\xBB.");
    const reading2 = readPanelMeter(c.wires, c.input, c.result, c.timed, c.mode, ...c.probes, c.model, c.redJack);
    if (reading2.value === void 0) return { ...fail(reading2.note), reading: reading2 };
    if (step.expected === "open" && reading2.value !== null) return { ...fail("Se esperaba un contacto abierto (OL). Suelta el pulsador de marcha."), reading: reading2 };
    if (step.expected === "low" && (reading2.value === null || reading2.value > 2)) return { ...fail("Se esperaba baja resistencia en este contacto cerrado."), reading: reading2 };
    return { ready: true, message: "Puntas, funci\xF3n y estado correctos. Escribe la lectura que observas.", reading: reading2 };
  }
  if (step.kind === "clamp") {
    if (c.clamp !== step.phase) return fail(`Selecciona solo el conductor de entrada ${step.phase} en la pinza virtual.`);
    const solved = panelElectrical(c.wires, c.input, c.result.relays, c.timed, c.model);
    if (solved.fault) return fail(solved.fault);
    const value = solved.lineAmps[step.phase];
    return { ready: true, message: "Pinza en la entrada de la fase solicitada, antes de las derivaciones.", reading: { value, text: `${value.toFixed(3).replace(".", ",")} A`, kind: "current", note: c.model.motorMode === "induction" ? `Corriente RMS de inducci\xF3n a ${Math.round(c.model.rotorRpm ?? 0)} rpm; carga ${c.model.loadTorqueNm ?? 4} N\xB7m. Par\xE1metros did\xE1cticos.` : "Corriente RMS del equivalente resistivo did\xE1ctico." } };
  }
  return { ready: true, message: "Estado verificado en el banco virtual." };
}
function observedMatches(text, value) {
  if (value === null) return text.trim().toUpperCase() === "OL";
  const entered = Number(text.trim().replace(",", "."));
  return text.trim() !== "" && Number.isFinite(entered) && Math.abs(entered - value) <= Math.max(0.06, Math.abs(value) * 0.025);
}
var ACTIVITY_KEY = "modo-meter-activity2-v1";
var newActivity = (profile) => ({ version: 1, profile, index: 0, records: [], reflection: "", complete: false });
function readActivity(raw) {
  if (!raw || typeof raw !== "object") return null;
  const v = raw;
  if (v.version !== 1 || !["manual", "matias"].includes(v.profile) || !Number.isInteger(v.index) || v.index < 0 || v.index >= ACTIVITY_STEPS.length || typeof v.complete !== "boolean" || typeof v.reflection !== "string" || v.reflection.length > 5e3 || !Array.isArray(v.records) || v.records.length > ACTIVITY_STEPS.length) return null;
  if (v.analysis && (v.analysis.voltage !== void 0 && (typeof v.analysis.voltage !== "string" || v.analysis.voltage.length > 30) || v.analysis.current !== void 0 && (typeof v.analysis.current !== "string" || v.analysis.current.length > 30))) return null;
  if (v.records.some((r) => !r || r.rpm !== void 0 && !Number.isFinite(r.rpm) || r.loadTorqueNm !== void 0 && (!Number.isFinite(r.loadTorqueNm) || r.loadTorqueNm < 0 || r.loadTorqueNm > 40) || r.motorMode !== void 0 && !["induction", "resistive"].includes(r.motorMode))) return null;
  if (v.records.some((r) => !r || !ACTIVITY_STEPS.some((s) => s.id === r.id) || typeof r.observed !== "string" || r.observed.length > 80 || typeof r.text !== "string" || r.text.length > 120 || r.value !== null && !Number.isFinite(r.value) || typeof r.at !== "string")) return null;
  const firstMissing = ACTIVITY_STEPS.findIndex((s) => !v.records.some((r) => r.id === s.id));
  return v.complete && firstMissing >= 0 ? { ...v, index: firstMissing, complete: false } : v;
}

// src/data/machineReport.ts
var esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function machineMeasurementsHtml(p, prep = newMachinePreparation(), svg = "") {
  const val = (id) => p.records.find((r) => r.id === id)?.value, ratio = (a3, b) => {
    const x = val(a3), y = val(b);
    return typeof x === "number" && typeof y === "number" && y !== 0 ? (x / y).toFixed(3) : "Pendiente";
  }, checks = preparationChecks(prep);
  return `<h2>Resultados virtuales \xB7 ${esc(p.profile)}</h2><p>${p.complete ? "Recorrido virtual finalizado" : "Recorrido pendiente"}. Modelo did\xE1ctico; datos f\xEDsicos y revisi\xF3n docente pendientes.</p>${["Tabla 1", "Tabla 3", "Tabla 4", "Tabla 5", "Tabla 6"].map((table) => `<h3>${table}</h3><table><thead><tr><th>Medici\xF3n</th><th>Lectura</th><th>rpm</th><th>Carga N\xB7m</th><th>Fecha</th></tr></thead><tbody>${ACTIVITY_STEPS.filter((s) => s.table === table).map((s) => {
    const r = p.records.find((r2) => r2.id === s.id);
    return `<tr><td>${esc(s.title)}</td><td>${r ? esc(r.text) : "Pendiente"}</td><td>${esc(r?.rpm)}</td><td>${esc(r?.loadTorqueNm)}</td><td>${esc(r?.at)}</td></tr>`;
  }).join("")}</tbody></table>`).join("")}<h2>Comparaci\xF3n matem\xE1tica</h2><p>V\u0394/VY = ${ratio("delta-U", "star-U")} \xB7 respuesta del estudiante: ${esc(p.analysis?.voltage || "Pendiente")}.</p><p>I\u0394/IY = ${ratio("delta-current-R", "star-current-R")} \xB7 respuesta del estudiante: ${esc(p.analysis?.current || "Pendiente")}.</p><p>VY \u2248 VL/\u221A3; V\u0394 \u2248 VL. La relaci\xF3n de corrientes depende de las condiciones de giro y carga registradas.</p><p>${esc(p.reflection || "Explicaci\xF3n pendiente")}</p><h2>Placa y protecci\xF3n \xB7 ejercicios de ejemplo</h2><p>Placa: ${checks.plate ? "respuestas comprobadas" : "pendiente"} \xB7 bobina Y: ${esc(prep.starVoltage)} V \xB7 bobina \u0394: ${esc(prep.deltaVoltage)} V.</p><p>Protecci\xF3n: ${checks.protection ? "c\xE1lculo comprobado" : "pendiente"} \xB7 ubicaci\xF3n: ${esc(prep.location)} \xB7 Ir: ${esc(prep.setting)} A \xB7 rango de ejemplo: ${esc(prep.range)} A.</p><h2>Esquema del estudiante</h2>${svg ? `<figure>${svg}<figcaption>Esquema generado desde los conductores guardados por el estudiante.</figcaption></figure>` : ""}<p>${esc(prep.diagram.explanation || "Explicaci\xF3n pendiente")}</p><details><summary>${prep.diagram.wires.length} conductores guardados</summary><ul>${prep.diagram.wires.map((w) => `<li>${esc(w.from.terminalId)} \u2192 ${esc(w.to.terminalId)}</li>`).join("")}</ul></details><p>Fuente: Actividad 2 UA2, Control de M\xE1quinas El\xE9ctricas Rotativas, 13 p\xE1ginas. La gu\xEDa numera las tablas 1, 3, 4, 5 y 6.</p>`;
}

// src/lab/temperature/physics.ts
var TERMINALS2 = [
  { id: "tc+", label: "Termocupla +", sensor: "tc" },
  { id: "tc-", label: "Termocupla \u2212", sensor: "tc" },
  { id: "pt1", label: "Pt100 \xB7 hilo rojo 1", sensor: "pt" },
  { id: "pt2", label: "Pt100 \xB7 hilo rojo 2", sensor: "pt" },
  { id: "pt3", label: "Pt100 \xB7 hilo blanco 3", sensor: "pt" },
  { id: "pt4", label: "Pt100 \xB7 hilo blanco 4", sensor: "pt" },
  { id: "tx+", label: "Salida del transmisor +", sensor: "tx" },
  { id: "tx-", label: "Salida del transmisor \u2212", sensor: "tx" }
];
var terminalSensor = (t) => TERMINALS2.find((x) => x.id === t).sensor;
var ptSide = (t) => t === "pt1" || t === "pt2" ? "red" : t === "pt3" || t === "pt4" ? "white" : null;
var K_NEG = [0, 0.039450128025, 23622373598e-15, -32858906784e-17, -49904828777e-19, -67509059173e-21, -57410327428e-23, -31088872894e-25, -10451609365e-27, -19889266878e-30, -16322697486e-33];
var K_POS = [-0.017600413686, 0.038921204975, 18558770032e-15, -99457592874e-18, 31840945719e-20, -56072844889e-23, 56075059059e-26, -32020720003e-29, 97151147152e-33, -12104721275e-36];
var J_ALL = [0, 0.050381187815, 3047583693e-14, -8568106572e-17, 1332293174e-19, -17022405966e-23, 20954753418e-26, -12538395336e-29, 15631725697e-33];
var horner = (c, t) => {
  let s = 0;
  for (let i = c.length - 1; i >= 0; i--) s = s * t + c[i];
  return s;
};
function tcEmf(type, celsius) {
  if (type === "J") return horner(J_ALL, celsius);
  if (celsius < 0) return horner(K_NEG, celsius);
  return horner(K_POS, celsius) + 0.1185976 * Math.exp(-1183432e-10 * (celsius - 126.9686) ** 2);
}
function tcTemperature(type, mv) {
  let lo = -100, hi = 760;
  if (mv <= tcEmf(type, lo)) return lo;
  if (mv >= tcEmf(type, hi)) return hi;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (tcEmf(type, mid) < mv) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
function ptOhms(celsius) {
  const R0 = 100, A = 39083e-7, B = -5775e-10, C = -4183e-15;
  return celsius >= 0 ? R0 * (1 + A * celsius + B * celsius * celsius) : R0 * (1 + A * celsius + B * celsius * celsius + C * (celsius - 100) * celsius ** 3);
}
var AMBIENT_MIN = 5;
var AMBIENT_MAX = 40;
var SET_MAX = 150;
var TX_OUT_MAX = 10;
var defaultSettings = () => ({ ptWires: 3, ambient: 22, tcType: "K", setpoint: 22, txType: "K", txMin: 0, txMax: 100, txConnected: false, txPowered: false, mode: "off", red: null, black: null, inWell: { tc: false, pt: false } });
function normalizeSettings(s) {
  s = { ...s, ptLeadOhms: Math.max(0, Math.min(10, s.ptLeadOhms ?? 0)) };
  if (s.ptWires === 4) return s;
  return { ...s, red: s.red === "pt4" ? null : s.red, black: s.black === "pt4" ? null : s.black };
}
var startTemps = (s) => ({ bath: s.ambient, tc: s.ambient, pt: s.ambient });
var TAU = { bath: 3, tc: 1, pt: 2, out: 5 };
function stepTemps(s, t, dt) {
  const approach = (cur, target, tau) => target + (cur - target) * Math.exp(-dt / tau);
  const bath = approach(t.bath, s.setpoint, TAU.bath);
  return { bath, tc: approach(t.tc, s.inWell.tc ? bath : s.ambient, s.inWell.tc ? TAU.tc : TAU.out), pt: approach(t.pt, s.inWell.pt ? bath : s.ambient, s.inWell.pt ? TAU.pt : TAU.out) };
}
var settledTemps = (s) => ({ bath: s.setpoint, tc: s.inWell.tc ? s.setpoint : s.ambient, pt: s.inWell.pt ? s.setpoint : s.ambient });
var STABLE_BAND = 0.2;
function isStable(s, t, sensor) {
  const probe = sensor === "pt" ? "pt" : "tc";
  return s.inWell[probe] && Math.abs(t.bath - s.setpoint) < STABLE_BAND && Math.abs(t[probe] - t.bath) < STABLE_BAND;
}
function txTemperature(s, t) {
  const measured = tcEmf(s.tcType, t.tc) - tcEmf(s.tcType, s.ambient);
  return tcTemperature(s.txType, measured + tcEmf(s.txType, s.ambient));
}
function txVolts(s, t) {
  if (!s.txPowered || !s.txConnected || s.txMax <= s.txMin) return 0;
  const v = TX_OUT_MAX * (txTemperature(s, t) - s.txMin) / (s.txMax - s.txMin);
  return Math.min(TX_OUT_MAX, Math.max(0, v));
}
function reference(s, sensor, celsius) {
  if (sensor === "pt") return ptOhms(celsius);
  if (sensor === "tc") return tcEmf(s.tcType, celsius) - tcEmf(s.tcType, s.ambient);
  const v = TX_OUT_MAX * (celsius - s.txMin) / (s.txMax - s.txMin);
  return s.txMax <= s.txMin ? 0 : Math.min(TX_OUT_MAX, Math.max(0, v));
}
var reading = (r) => ({ value: null, unit: "", sensor: null, meaningful: false, note: "", ...r });
function readMeter(s, t) {
  if (s.mode === "off") return reading({ state: "off", note: "El mult\xEDmetro est\xE1 apagado. Elige mV, \u03A9 o V." });
  if (!s.red || !s.black) return reading({ state: "open", note: "Conecta las dos puntas a los bornes del sensor." });
  const a3 = terminalSensor(s.red), b = terminalSensor(s.black);
  if (s.red === s.black) return reading({ state: "ok", value: 0, unit: s.mode === "ohm" ? "\u03A9" : s.mode === "V" ? "V" : "mV", note: "Las dos puntas est\xE1n en el mismo borne: no mides nada." });
  if (a3 !== b) return reading({ state: "open", note: "Las puntas est\xE1n en sensores distintos: el circuito queda abierto." });
  if (a3 === "tc") {
    const mv = (tcEmf(s.tcType, t.tc) - tcEmf(s.tcType, s.ambient)) * (s.red === "tc+" ? 1 : -1);
    if (s.mode === "mV") return reading({ state: "ok", value: mv, unit: "mV", sensor: "tc", meaningful: true, note: `Tensi\xF3n de la termocupla ${s.tcType} con la uni\xF3n de referencia a la temperatura ambiente.` });
    if (s.mode === "V") return reading({ state: "ok", value: mv / 1e3, unit: "V", sensor: "tc", note: "Es una se\xF1al de milivoltios: en la escala de voltios casi no se ve. Usa mV." });
    return reading({ state: "ok", value: 0, unit: "\u03A9", sensor: "tc", note: "Una termocupla es casi un conductor: su resistencia no informa la temperatura. Usa mV." });
  }
  if (a3 === "pt") {
    if (s.mode !== "ohm") return reading({ state: "ok", value: 0, unit: s.mode === "V" ? "V" : "mV", sensor: "pt", note: "El Pt100 no genera tensi\xF3n: es una resistencia. Usa \u03A9." });
    if (ptSide(s.red) === ptSide(s.black)) return reading({ state: "ok", value: 2 * (s.ptLeadOhms ?? 0), unit: "\u03A9", sensor: "pt", note: `Los dos hilos ${ptSide(s.red) === "red" ? "rojos" : "blancos"} van unidos al mismo extremo del elemento: solo mides los dos hilos de cable del mismo lado. Mide entre un hilo rojo y uno blanco.` });
    return reading({ state: "ok", value: ptOhms(t.pt) + 2 * (s.ptLeadOhms ?? 0), unit: "\u03A9", sensor: "pt", meaningful: true, note: `Resistencia del Pt100 entre un hilo rojo y uno blanco (${s.ptWires} hilos). El DMM usa dos puntas: suma los dos hilos del lazo; tener una sonda de 3/4 hilos no compensa autom\xE1ticamente.` });
  }
  if (s.mode === "V") {
    const v = txVolts(s, t) * (s.red === "tx+" ? 1 : -1);
    const note = !s.txPowered ? "El transmisor no est\xE1 alimentado: su salida vale 0 V." : !s.txConnected ? "El transmisor no recibe la termocupla: su salida vale 0 V." : s.txType !== s.tcType ? `El transmisor est\xE1 configurado para tipo ${s.txType} y la termocupla es ${s.tcType}: la lectura es incorrecta.` : "Salida en tensi\xF3n del transmisor.";
    return reading({ state: "ok", value: v, unit: "V", sensor: "tx", meaningful: s.txPowered && s.txConnected, note });
  }
  return reading({ state: "open", note: s.mode === "mV" ? "Sobrerango: la salida del transmisor es de voltios. Usa V." : "No midas resistencia en una salida energizada. Usa V." });
}

// src/lab/temperature/state.ts
function matchesTempSeries(r, s) {
  return Math.abs(r.ambient - s.ambient) < 0.05 && (r.sensor === "pt" ? Math.abs((r.ptLeadOhms ?? 0) - (s.ptLeadOhms ?? 0)) < 1e-9 : r.tcType === s.tcType && (r.sensor !== "tx" || r.txType === s.txType && r.txMin === s.txMin && r.txMax === s.txMax));
}
var benchKey = (id) => `modo:temperature:bench:${id || "free"}:v1`;
var progressKey = (id) => `modo:temperature:progress:${id}:v1`;
var isTerminal = (v) => v === null || ["tc+", "tc-", "pt1", "pt2", "pt3", "pt4", "tx+", "tx-"].includes(v);
var num = (v, lo, hi) => typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;
function parseBench(raw) {
  const data = JSON.parse(raw);
  if (typeof data !== "object" || data === null || data.version !== 1) throw new Error("Guardado incompatible");
  const { settings: s, records } = data;
  const w = s?.inWell;
  const wires = s?.ptWires === void 0 ? 3 : s?.ptWires;
  const ok = s && (wires === 3 || wires === 4) && num(s.ambient, AMBIENT_MIN, AMBIENT_MAX) && (s.tcType === "K" || s.tcType === "J") && (s.txType === "K" || s.txType === "J") && num(s.setpoint, AMBIENT_MIN, SET_MAX) && num(s.txMin, -50, 400) && num(s.txMax, -50, 400) && typeof s.txConnected === "boolean" && typeof s.txPowered === "boolean" && ["off", "mV", "ohm", "V"].includes(s.mode) && isTerminal(s.red) && isTerminal(s.black) && !!w && typeof w.tc === "boolean" && typeof w.pt === "boolean";
  if (!ok || s.ptLeadOhms !== void 0 && !num(s.ptLeadOhms, 0, 10)) throw new Error("Guardado incompatible");
  if (!Array.isArray(records) || records.length > 500) throw new Error("Guardado incompatible");
  for (const r of records) {
    if (r.txType !== void 0 && r.txType !== "K" && r.txType !== "J" || r.txMin !== void 0 && !num(r.txMin, -50, 400) || r.txMax !== void 0 && !num(r.txMax, -50, 400)) throw new Error("Configuraci\xF3n de medici\xF3n incompatible");
    if (typeof r !== "object" || r === null || typeof r.id !== "string" || r.id.length > 60 || r.source !== "simulada" && r.source !== "real" || !["tc", "pt", "tx"].includes(r.sensor) || !(r.tcType === null || r.tcType === "K" || r.tcType === "J") || !num(r.temp, -100, 800) || !num(r.value, -1e6, 1e6) || !["mV", "\u03A9", "V"].includes(r.unit) || !num(r.ambient, -50, 100) || !num(r.at, 0, Number.MAX_SAFE_INTEGER) || r.setpoint !== void 0 && !num(r.setpoint, -100, 800) || r.bath !== void 0 && !num(r.bath, -100, 800) || r.trial !== void 0 && (!Number.isInteger(r.trial) || !num(r.trial, 1, 500)) || r.ptLeadOhms !== void 0 && !num(r.ptLeadOhms, 0, 10) || r.transcribed !== void 0 && typeof r.transcribed !== "boolean") throw new Error("Guardado incompatible");
  }
  const migrated = { ...s, ptWires: wires };
  if (s.ptWires === void 0 && (migrated.red === "pt2" || migrated.black === "pt2")) {
    if (migrated.red === "pt2") migrated.red = "pt3";
    if (migrated.black === "pt2") migrated.black = "pt3";
  }
  return { settings: normalizeSettings(migrated), records };
}

// src/study/guideWorkbookData.ts
var workbookKey = (kind) => `modo:guide-workbook:${kind}:v1`;
var blankWorkbook = () => ({ version: 1, fields: {}, checks: {} });
function readWorkbook(raw) {
  if (!raw) return blankWorkbook();
  const v = JSON.parse(raw);
  if (v?.version !== 1 || !v.fields || !v.checks || Object.entries(v.fields).some(([k, x]) => !/^\w[\w-]{0,80}$/.test(k) || ["__proto__", "constructor", "prototype"].includes(k) || typeof x !== "string" || x.length > 2e4) || Object.entries(v.checks).some(([k, x]) => !/^\w[\w-]{0,80}$/.test(k) || ["__proto__", "constructor", "prototype"].includes(k) || typeof x !== "boolean")) throw Error("No se pudo leer el cuaderno anterior; se conserva.");
  return v;
}
var escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function downloadGuide(name, body, type) {
  const url = URL.createObjectURL(new Blob([body], { type })), a3 = document.createElement("a");
  a3.href = url;
  a3.download = name;
  a3.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function guideTemperatureRecords() {
  return [2, 3].flatMap((i) => {
    const raw = localStorage.getItem(benchKey(`temperatura-experiencia-${i}`));
    return raw ? parseBench(raw).records : [];
  });
}
var guideTitle = (k) => k === "temperature" ? "Laboratorio 2 \xB7 Sensores de temperatura (G03)" : "Actividad 2 \xB7 Unidad 2 \xB7 Partida estrella\u2013tri\xE1ngulo";
function guideChart(records, name) {
  if (!records.length) return "";
  const min = Math.min(...records.map((r) => r.value)), span = Math.max(...records.map((r) => r.value)) - min || 1;
  const pts = records.toSorted((a3, b) => a3.temp - b.temp).map((r) => `${45 + r.temp / 150 * 530},${210 - (r.value - min) / span * 170}`);
  return `<figure><figcaption>${escapeHtml(name)} \xB7 ${escapeHtml(records[0].unit)} frente a \xB0C</figcaption><svg viewBox="0 0 620 250" role="img" aria-label="${escapeHtml(name)}"><path d="M45 20V210H590" fill="none" stroke="#777"/><text x="45" y="235">0 \xB0C</text><text x="555" y="235">150 \xB0C</text><text x="2" y="25">${escapeHtml(Math.max(...records.map((r) => r.value)).toFixed(3))}</text><text x="2" y="210">${escapeHtml(min.toFixed(3))}</text><polyline points="${pts.join(" ")}" fill="none" stroke="#145650" stroke-width="2"/>${pts.map((p) => {
    const [x, y] = p.split(",");
    return `<circle cx="${x}" cy="${y}" r="4" fill="#145650"/>`;
  }).join("")}</svg></figure>`;
}
function temperatureSeries(records) {
  const groups = /* @__PURE__ */ new Map();
  for (const r of records) {
    const key = `${r.source} \xB7 ${r.sensor === "pt" ? "Pt100" : r.sensor === "tc" ? `TC ${r.tcType}` : `TX ${r.tcType}/${r.txType ?? "?"} ${r.txMin ?? "?"}\u2013${r.txMax ?? "?"} \xB0C`} \xB7 ambiente ${r.ambient} \xB0C \xB7 hilos ${r.ptLeadOhms ?? 0} \u03A9`;
    groups.set(key, [...groups.get(key) ?? [], r]);
  }
  return [...groups];
}
function reportHtml(kind, w, labels, presentation = false, diagramSvg = "") {
  const records = kind === "temperature" ? guideTemperatureRecords() : [];
  let measurements = "";
  if (kind === "machines") {
    const raw = localStorage.getItem("modo-meter-activity2-v1");
    if (raw) {
      const p = readActivity(JSON.parse(raw));
      if (p) measurements = machineMeasurementsHtml(p, readMachinePreparation(localStorage.getItem(MACHINE_PREP_KEY)), diagramSvg);
    }
  }
  const source2 = kind === "temperature" ? "/estudio/instrumentacion/guia-temperatura-g03.docx" : "/activities/actividad-2-unidad-2.pdf";
  return `<!doctype html><html lang="es"><meta charset="utf-8"><title>${escapeHtml(guideTitle(kind))}</title><style>body{font:16px system-ui;max-width:960px;margin:40px auto;padding:20px;color:#172b28}h1,h2{color:#145650}section{break-inside:avoid;white-space:pre-wrap;margin:25px 0}table{border-collapse:collapse;width:100%}td,th{border:1px solid #aaa;padding:8px;text-align:left}figure{break-inside:avoid}svg{width:100%;max-height:330px}${presentation ? "section,figure{min-height:65vh;border-bottom:2px solid #ddd;padding:30px 0;font-size:24px}" : ""}@media print{button{display:none}body{margin:0}}</style><button onclick="window.print()">Imprimir / Guardar PDF</button><h1>${escapeHtml(guideTitle(kind))}</h1><p>Borrador del estudiante \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("es-CL")} \xB7 estados presenciales declarados, sin certificaci\xF3n docente.</p>${Object.entries(labels).map(([id, label]) => `<section><h2>${escapeHtml(label)}</h2>${escapeHtml(w.fields[id] || "Pendiente de completar")}</section>`).join("")}<h2>Seguimiento</h2><ul>${Object.entries(w.checks).map(([id, yes]) => `<li>${escapeHtml(labels[id] ?? id)}: ${yes ? "declarado realizado" : "pendiente"}</li>`).join("")}</ul>${measurements}${temperatureSeries(records).map(([name, rows]) => guideChart(rows, name) + `<table><tr><th>Temperatura \xB0C</th><th>Valor</th><th>Unidad</th><th>Origen</th></tr>${rows.map((r) => `<tr><td>${r.temp.toFixed(2)}</td><td>${r.value}</td><td>${escapeHtml(r.unit)}</td><td>${escapeHtml(r.source)}</td></tr>`).join("")}</table>`).join("")}<p>Fuente docente: ${escapeHtml(source2)}. Las series con rango desconocido se conservan para consulta y requieren confirmar sus condiciones. Las mediciones reales y simuladas se identifican por separado.</p></html>`;
}

// src/study/guideSpreadsheet.ts
var ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
var rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
var xml = (s) => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + s;
function crc32(bytes) {
  let crc = 4294967295;
  for (const b of bytes) {
    crc ^= b;
    for (let j = 0; j < 8; j++) crc = crc >>> 1 ^ (crc & 1 ? 3988292384 : 0);
  }
  return (crc ^ 4294967295) >>> 0;
}
function zip(files) {
  const enc = new TextEncoder(), chunks = [], central = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const n = enc.encode(name), data = enc.encode(text), crc = crc32(data), head = new Uint8Array(30 + n.length), h = new DataView(head.buffer);
    h.setUint32(0, 67324752, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 2048, true);
    h.setUint16(12, 33, true);
    h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true);
    h.setUint32(22, data.length, true);
    h.setUint16(26, n.length, true);
    head.set(n, 30);
    chunks.push(head, data);
    const c = new Uint8Array(46 + n.length), v = new DataView(c.buffer);
    v.setUint32(0, 33639248, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 20, true);
    v.setUint16(8, 2048, true);
    v.setUint16(14, 33, true);
    v.setUint32(16, crc, true);
    v.setUint32(20, data.length, true);
    v.setUint32(24, data.length, true);
    v.setUint16(28, n.length, true);
    v.setUint32(42, offset, true);
    c.set(n, 46);
    central.push(c);
    offset += head.length + data.length;
  }
  const size = central.reduce((n, c) => n + c.length, 0), end = new Uint8Array(22), e = new DataView(end.buffer);
  e.setUint32(0, 101010256, true);
  e.setUint16(8, central.length, true);
  e.setUint16(10, central.length, true);
  e.setUint32(12, size, true);
  e.setUint32(16, offset, true);
  const out = new Uint8Array(offset + size + 22);
  let at = 0;
  for (const a3 of [...chunks, ...central, end]) {
    out.set(a3, at);
    at += a3.length;
  }
  return out;
}
var cell = (col, row, value) => typeof value === "number" && Number.isFinite(value) ? `<c r="${col}${row}"><v>${value}</v></c>` : `<c r="${col}${row}" t="inlineStr"><is><t>${escapeHtml(value)}</t></is></c>`;
var relationships = (items) => xml(`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items.map((x, i) => `<Relationship Id="rId${i + 1}" Type="${rel}/${x.type}" Target="${x.target}"/>`).join("")}</Relationships>`);
function buildGuideSpreadsheet(input) {
  const groups = input.length ? input : [["TC \xB7 completar", []], ["Pt100 \xB7 completar", []], ["Transmisor \xB7 completar", []]];
  const f = {}, types = [];
  f["_rels/.rels"] = relationships([{ type: "officeDocument", target: "xl/workbook.xml" }]);
  f["xl/workbook.xml"] = xml(`<workbook xmlns="${ns}" xmlns:r="${rel}"><sheets>${groups.map((_, i) => `<sheet name="Serie ${i + 1}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`);
  f["xl/_rels/workbook.xml.rels"] = relationships(groups.map((_, i) => ({ type: "worksheet", target: `worksheets/sheet${i + 1}.xml` })));
  groups.forEach(([name, records], i) => {
    const n = i + 1, rows = records.toSorted((a3, b) => a3.temp - b.temp), data = rows.length ? rows.map((r) => [r.temp, r.value, r.unit, r.source, r.tcType ?? "", r.ambient, r.txType ?? "", r.txMin ?? "", r.txMax ?? "", r.ptLeadOhms ?? 0]) : [22, 50, 75, 100].map((t) => [t, "", "", "Completar con mediciones", "", "", "", "", "", ""]);
    const last = data.length + 3;
    f[`xl/worksheets/sheet${n}.xml`] = xml(`<worksheet xmlns="${ns}" xmlns:r="${rel}"><cols><col min="1" max="10" width="22" customWidth="1"/></cols><sheetData><row r="1">${cell("A", 1, name)}</row><row r="2">${cell("A", 2, "Conservar origen y configuraci\xF3n. Cada serie tiene su propio gr\xE1fico.")}</row><row r="3">${["Temperatura \xB0C", "Valor", "Unidad", "Origen", "Tipo TC", "Ambiente \xB0C", "Tipo TX", "Rango m\xEDnimo \xB0C", "Rango m\xE1ximo \xB0C", "Hilo Pt100 \u03A9"].map((v, j) => cell(String.fromCharCode(65 + j), 3, v)).join("")}</row>${data.map((r, j) => `<row r="${j + 4}">${r.map((v, k) => cell(String.fromCharCode(65 + k), j + 4, v)).join("")}</row>`).join("")}</sheetData><drawing r:id="rId1"/></worksheet>`);
    f[`xl/worksheets/_rels/sheet${n}.xml.rels`] = relationships([{ type: "drawing", target: `../drawings/drawing${n}.xml` }]);
    f[`xl/drawings/drawing${n}.xml`] = xml(`<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><xdr:twoCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${last + 2}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>9</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${last + 22}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${n}" name="Curva ${n}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="${rel}" r:id="rId1"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor></xdr:wsDr>`);
    f[`xl/drawings/_rels/drawing${n}.xml.rels`] = relationships([{ type: "chart", target: `../charts/chart${n}.xml` }]);
    const ref = (col) => `'Serie ${n}'!$${col}$4:$${col}$${last}`, cache = (col) => `<c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${rows.length}"/>${rows.map((r, j) => `<c:pt idx="${j}"><c:v>${col === 0 ? r.temp : r.value}</c:v></c:pt>`).join("")}</c:numCache>`;
    f[`xl/charts/chart${n}.xml`] = xml(`<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><c:chart><c:autoTitleDeleted val="1"/><c:plotArea><c:layout/><c:scatterChart><c:scatterStyle val="lineMarker"/><c:ser><c:idx val="0"/><c:order val="0"/><c:tx><c:v>${escapeHtml(name)}</c:v></c:tx><c:marker><c:symbol val="circle"/><c:size val="5"/></c:marker><c:xVal><c:numRef><c:f>${ref("A")}</c:f>${cache(0)}</c:numRef></c:xVal><c:yVal><c:numRef><c:f>${ref("B")}</c:f>${cache(1)}</c:numRef></c:yVal><c:smooth val="0"/></c:ser><c:axId val="1"/><c:axId val="2"/></c:scatterChart>${[1, 2].map((id) => `<c:valAx><c:axId val="${id}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:axPos val="${id === 1 ? "b" : "l"}"/><c:numFmt formatCode="General" sourceLinked="1"/><c:tickLblPos val="nextTo"/><c:crossAx val="${id === 1 ? 2 : 1}"/><c:crosses val="autoZero"/><c:crossBetween val="midCat"/></c:valAx>`).join("")}</c:plotArea><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart></c:chartSpace>`);
    for (const [path, type] of [[`worksheets/sheet${n}.xml`, "spreadsheetml.worksheet"], [`drawings/drawing${n}.xml`, "drawing"], [`charts/chart${n}.xml`, "drawingml.chart"]]) types.push(`<Override PartName="/xl/${path}" ContentType="application/vnd.openxmlformats-officedocument.${type}+xml"/>`);
  });
  f["[Content_Types].xml"] = xml(`<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${types.join("")}</Types>`);
  return zip(f);
}
function exportGuideSpreadsheet(groups) {
  downloadGuide("temperatura-curvas.xlsx", buildGuideSpreadsheet(groups).buffer, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}

// src/learning/temperatureLessons.ts
var POINTS = (ambient) => [ambient, 50, 75, 100];
var hasPoints = (c, sensor) => POINTS(c.settings.ambient).every((t) => c.records.some((r) => r.source === "simulada" && r.sensor === sensor && matchesTempSeries(r, c.settings) && Math.abs(r.temp - t) <= 0.6));
var SOURCE = "/estudio/instrumentacion/guia-temperatura-g03.docx";
var needPoints = "Registra antes los puntos: temperatura ambiente, 50, 75 y 100 \xB0C.";
var temperatureLessons = [
  {
    id: "temperatura-experiencia-1",
    materialId: "instrumentacion-g03-exp1",
    title: "Temperatura \xB7 Experiencia 1: investigar y explicar",
    experience: 1,
    unit: 2,
    source: SOURCE,
    bench: false,
    intro: "Antes de medir, aclara qu\xE9 es cada sensor, c\xF3mo funciona y qu\xE9 se\xF1al entrega. Estas preguntas siguen los puntos de investigaci\xF3n de la gu\xEDa.",
    concept: "Una termocupla y un Pt100 miden temperatura, pero de formas distintas: la primera genera una tensi\xF3n muy peque\xF1a y el segundo cambia su resistencia. Las dos var\xEDan de forma continua, no a saltos.",
    steps: [
      { title: "Se\xF1ales continuas y discretas", text: "La gu\xEDa pide definir la naturaleza de termocuplas y RTD.", success: "Correcto.", quiz: { question: "\xBFC\xF3mo es la se\xF1al de una termocupla o de un Pt100?", options: ["Discreta: solo existe encendido o apagado", "Continua (anal\xF3gica): cambia de forma gradual con la temperatura", "Digital: ya viene codificada en bits"], answer: 1, explanation: "Ambas var\xEDan de forma continua con la temperatura. Una se\xF1al discreta solo toma estados separados, como un detector de presencia con salida todo o nada.", concept: "senal-continua" } },
      { title: "Principio de la termocupla", text: "Define el principio de funcionamiento de una termocupla.", success: "Correcto.", quiz: { question: "\xBFC\xF3mo funciona una termocupla?", options: ["La resistencia de un metal aumenta con la temperatura", "Dos metales distintos unidos generan una tensi\xF3n peque\xF1a que depende de la diferencia de temperatura (efecto Seebeck)", "Un l\xEDquido se dilata y mueve una aguja"], answer: 1, explanation: "El efecto Seebeck produce milivoltios entre la uni\xF3n caliente y la referencia. Por eso una termocupla necesita conocer la temperatura de su uni\xF3n de referencia.", concept: "seebeck" } },
      { title: "Principio del Pt100", text: "Define el principio de funcionamiento de una RTD (Pt100).", success: "Correcto.", quiz: { question: "\xBFC\xF3mo funciona un Pt100?", options: ["Genera una tensi\xF3n propia al calentarse", "Cambia su temperatura seg\xFAn la corriente que lo atraviesa", "Su resistencia el\xE9ctrica aumenta de forma regular al subir la temperatura"], answer: 2, explanation: "El platino cambia su resistencia con la temperatura. Hay que medir esa resistencia (con una corriente peque\xF1a) para conocer la temperatura.", concept: "pt100-principio" } },
      { title: "Tipo de salida de cada sensor", text: "Define el tipo de salida de la termocupla y del Pt100.", success: "Correcto.", quiz: { question: "\xBFQu\xE9 magnitud entrega cada uno?", options: ["Termocupla: ohmios \xB7 Pt100: milivoltios", "Termocupla: milivoltios \xB7 Pt100: ohmios", "Los dos entregan una corriente de 4\u201320 mA directamente"], answer: 1, explanation: "La termocupla entrega una tensi\xF3n en milivoltios y el Pt100 una resistencia en ohmios. El 4\u201320 mA o 0\u201310 V aparece reci\xE9n en un transmisor.", concept: "salidas" } },
      { title: "Qu\xE9 significa \xAB100\xBB en Pt100", text: "Interpreta el nombre del sensor.", success: "Correcto.", quiz: { question: "\xBFQu\xE9 indica el 100 de Pt100?", options: ["Que mide hasta 100 \xB0C", "Que tiene 100 \u03A9 a 0 \xB0C", "Que entrega 100 mV a 100 \xB0C"], answer: 1, explanation: "Pt es platino y 100 es su resistencia a 0 \xB0C. Por eso a temperatura ambiente se espera algo m\xE1s de 100 \u03A9.", concept: "pt100-valor" } }
    ]
  },
  {
    id: "temperatura-experiencia-2",
    materialId: "instrumentacion-g03-exp2",
    title: "Temperatura \xB7 Experiencia 2: medir y comparar sensores",
    experience: 2,
    unit: 2,
    source: SOURCE,
    bench: true,
    intro: "Mide una termocupla (K o J, a tu elecci\xF3n) y un Pt100 a temperatura ambiente, 50, 75 y 100 \xB0C, y compara sus curvas. Los datos de esta pr\xE1ctica son simulados; en el laboratorio los reemplazas por tus mediciones reales.",
    concept: "La termocupla se mide en milivoltios (funci\xF3n mV) y el Pt100 en ohmios (funci\xF3n \u03A9). El horno de pozo seco necesita unos segundos para estabilizarse: lee solo cuando el banco avise que la sonda lleg\xF3 a la temperatura.",
    review: { concept: "funcion-medida", question: "\xBFPor qu\xE9 el Pt100 se mide en ohmios y la termocupla en milivoltios?", options: ["Porque el Pt100 es una resistencia y la termocupla genera una tensi\xF3n", "Porque el mult\xEDmetro solo mide ohmios en el horno", "Porque son lo mismo con otro nombre"], answer: 0, explanation: "El Pt100 cambia su resistencia con la temperatura; la termocupla genera una tensi\xF3n peque\xF1a por el efecto Seebeck. Medir con la funci\xF3n equivocada no informa la temperatura." },
    steps: [
      { title: "Introduce las dos sondas en el pozo", text: "Arrastra hacia abajo el control de cada sonda para insertarla, o toca \xABinsertar\xBB. Ambas deben quedar dentro del pozo.", success: "Las dos sondas est\xE1n en el pozo.", check: (c) => c.settings.inWell.tc && c.settings.inWell.pt },
      { title: "Mide la termocupla en milivoltios", text: "Elige la funci\xF3n mV en el mult\xEDmetro y conecta la punta roja al hilo + y la negra al hilo \u2212 de la termocupla. Cambia el tipo (K o J) si quieres comparar.", success: "Est\xE1s leyendo la tensi\xF3n de la termocupla con la funci\xF3n correcta.", concept: "funcion-medida", check: (c) => c.reading.state === "ok" && c.reading.sensor === "tc" && c.reading.meaningful },
      { title: "Registra los cuatro puntos de la termocupla", text: "Fija el horno en ambiente, 50, 75 y 100 \xB0C. En cada punto espera la estabilizaci\xF3n, toca su casilla en la libreta G03, lee la pantalla y transcribe el valor en mV. La uni\xF3n de referencia queda a la temperatura ambiente.", success: "Tienes los cuatro puntos de la termocupla.", concept: "cuatro-puntos", check: (c) => hasPoints(c, "tc") },
      { title: "Mide el Pt100 en ohmios", text: "Cambia el mult\xEDmetro a \u03A9 y conecta una punta a un hilo rojo y la otra a un hilo blanco del Pt100.", success: "Est\xE1s midiendo la resistencia del Pt100.", concept: "hilos-pt100", check: (c) => c.reading.state === "ok" && c.reading.sensor === "pt" && c.reading.meaningful },
      { title: "Registra los cuatro puntos del Pt100", text: "Repite ambiente, 50, 75 y 100 \xB0C usando los botones del horno. Lee \u03A9 en el instrumento y transcribe cada lectura en la casilla Pt100 de la libreta. Luego compara con las referencias.", success: "Tienes los cuatro puntos del Pt100.", concept: "cuatro-puntos", check: (c) => hasPoints(c, "pt") },
      {
        title: "Calcula la sensibilidad del Pt100",
        text: "Con tus datos, calcula cu\xE1ntos ohmios cambia el Pt100 por cada grado entre la temperatura ambiente y 100 \xB0C.",
        success: "La sensibilidad coincide con tus datos.",
        concept: "sensibilidad",
        ask: {
          prompt: "Sensibilidad media del Pt100 entre ambiente y 100 \xB0C",
          unit: "\u03A9/\xB0C",
          tolerance: 0.01,
          missing: needPoints,
          expected: (c) => {
            const pts = c.records.filter((r) => r.source === "simulada" && r.sensor === "pt" && matchesTempSeries(r, c.settings));
            const lo = pts.filter((r) => Math.abs(r.temp - c.settings.ambient) <= 0.6).at(-1), hi = pts.filter((r) => Math.abs(r.temp - 100) <= 0.6).at(-1);
            return lo && hi ? (hi.value - lo.value) / (hi.temp - lo.temp) : null;
          }
        }
      }
    ]
  },
  {
    id: "temperatura-experiencia-3",
    materialId: "instrumentacion-g03-exp3",
    title: "Temperatura \xB7 Experiencia 3: medir mediante transmisor",
    experience: 3,
    unit: 2,
    source: SOURCE,
    bench: true,
    intro: "Conecta la termocupla de la experiencia anterior a un transmisor con salida en tensi\xF3n y construye otra curva: temperatura, salida de la termocupla y salida del transmisor en los mismos cuatro puntos.",
    concept: "Un transmisor convierte los milivoltios de la termocupla en una se\xF1al normalizada, por ejemplo 0\u201310 V. El rango de temperatura que corresponde a esa salida lo configuras t\xFA: la gu\xEDa propone 0\u201310 V como ejemplo y no fija el rango de entrada.",
    review: { concept: "transmisor-tipo", question: "Si el transmisor est\xE1 configurado para una termocupla tipo J y el sensor es tipo K, \xBFqu\xE9 ocurre?", options: ["Nada: ambos tipos son iguales", "La salida es incorrecta, porque interpreta los milivoltios con la tabla equivocada", "El transmisor se apaga solo"], answer: 1, explanation: "Cada tipo de termocupla tiene su propia tabla de milivoltios por grado. Un tipo mal configurado produce una temperatura err\xF3nea aunque todo est\xE9 conectado." },
    steps: [
      { title: "Conecta la termocupla al transmisor y alim\xE9ntalo", text: "Conecta los hilos sobre el transmisor y opera el interruptor de la fuente sobre el banco. Introduce la termocupla en el pozo.", success: "El transmisor recibe la termocupla y est\xE1 alimentado.", concept: "transmisor-conexion", check: (c) => c.settings.txConnected && c.settings.txPowered },
      { title: "Configura el transmisor", text: "Selecciona el mismo tipo de termocupla que usas y define un rango de temperatura para la salida de 0 a 10 V (por ejemplo, de 0 a 100 \xB0C o el que prefieras).", success: "El tipo coincide con la termocupla y el rango es v\xE1lido.", concept: "transmisor-tipo", check: (c) => c.settings.txType === c.settings.tcType && c.settings.txMax - c.settings.txMin >= 50 },
      { title: "Mide la salida del transmisor", text: "Elige la funci\xF3n V del mult\xEDmetro y conecta las puntas a la salida + y \u2212 del transmisor.", success: "Est\xE1s midiendo la tensi\xF3n de salida del transmisor.", concept: "transmisor-conexion", check: (c) => c.reading.state === "ok" && c.reading.sensor === "tx" && c.reading.meaningful },
      { title: "Registra los cuatro puntos de ambos sensores", text: "En ambiente, 50, 75 y 100 \xB0C registra la salida de la termocupla (mV) y la del transmisor (V). Gira el selector y mueve las puntas entre una lectura y otra. Transcribe cada valor en su casilla de la libreta G03.", success: "Tienes la curva de la termocupla y la del transmisor.", concept: "cuatro-puntos", check: (c) => hasPoints(c, "tc") && hasPoints(c, "tx") },
      {
        title: "Predice una salida con tu rango",
        text: "Con el rango que configuraste, calcula qu\xE9 tensi\xF3n deber\xEDa entregar el transmisor a 75 \xB0C y comp\xE1rala con tu registro.",
        success: "Tu c\xE1lculo coincide con el rango configurado.",
        concept: "transmisor-rango",
        ask: {
          prompt: "Tensi\xF3n esperada a 75 \xB0C",
          unit: "V",
          tolerance: 0.05,
          missing: "Configura primero un rango v\xE1lido en el transmisor.",
          expected: (c) => {
            const { txMin, txMax } = c.settings;
            return txMax > txMin ? Math.min(10, Math.max(0, 10 * (75 - txMin) / (txMax - txMin))) : null;
          }
        }
      }
    ]
  }
];
for (const lesson of temperatureLessons.filter((l) => l.bench)) {
  const sensors = lesson.experience === 2 ? ["tc", "pt"] : ["tc", "tx"];
  lesson.steps.push(
    { title: "Revisar las curvas y referencias", text: "Abre cada curva con los botones de este paso. Observa las unidades y compara tus puntos con la referencia de tabla. Las series de otras configuraciones se conservan por separado.", success: "Has abierto las curvas de esta experiencia.", concept: "cuatro-puntos", resource: "curves", check: (c) => sensors.every((s) => c.viewed?.includes("curve:" + s)) },
    { title: "Explicar los resultados", text: lesson.experience === 2 ? "En \xABMis observaciones\xBB, compara el comportamiento de la termocupla y del Pt100. Explica qu\xE9 magnitud cambia, sus unidades y qu\xE9 observas respecto a la tabla." : "En \xABMis observaciones\xBB, explica c\xF3mo los milivoltios de la termocupla se convierten a voltios. Indica el rango elegido y justifica tu resultado a 75 \xB0C.", success: "Tu explicaci\xF3n qued\xF3 registrada para revisi\xF3n; no se califica autom\xE1ticamente.", concept: "sensibilidad", check: (c) => (c.notes?.trim().length ?? 0) >= 35 },
    { title: "Preparar la planilla de la gu\xEDa", text: "Descarga la planilla Excel con tus mediciones y gr\xE1ficos. Cada tipo de sensor, origen y configuraci\xF3n tiene una serie separada. Puedes completarla y revisarla en clase.", success: "Planilla generada con los registros de esta experiencia.", concept: "cuatro-puntos", resource: "spreadsheet", check: (c) => !!c.viewed?.includes("spreadsheet") && sensors.every((s) => hasPoints(c, s)) }
  );
}
var temperatureLesson = (id) => temperatureLessons.find((l) => l.id === id);
var temperatureLessonByMaterial = (id) => temperatureLessons.find((l) => l.materialId === id);
var tempStudyUrl = (lesson, step = 0) => `/estudio?curso=s2-3&clase=${lesson.materialId}&paso=${step}`;
var tempLabUrl = (lesson) => `/laboratorio?tool=temperature&leccion=${lesson.id}`;
var newTempProgress = () => ({ version: 1, step: 0, completed: [], notes: "", reviewed: false });
function readTempProgress(lesson) {
  const raw = localStorage.getItem(progressKey(lesson.id));
  if (!raw) return newTempProgress();
  const p = JSON.parse(raw);
  if (typeof p === "object" && p !== null && "viewed" in p && (!Array.isArray(p.viewed) || p.viewed.length > 30 || p.viewed.some((v) => typeof v !== "string" || v.length > 80))) throw new Error("Avance de recursos incompatible");
  if (typeof p !== "object" || p === null || !("version" in p) || p.version !== 1 || !("step" in p) || !Number.isInteger(p.step) || Number(p.step) < 0 || Number(p.step) >= lesson.steps.length || !("completed" in p) || !Array.isArray(p.completed) || p.completed.some((i) => !Number.isInteger(i) || i < 0 || i >= lesson.steps.length) || !("notes" in p) || typeof p.notes !== "string" || p.notes.length > 2e4 || !("reviewed" in p) || typeof p.reviewed !== "boolean") throw new Error("No se pudo leer el avance anterior.");
  return p;
}

// src/data/layout.ts
var import_react = __toESM(require_react(), 1);
var GAP = 24;
var MIN_GAP = 8;
var MARGIN_X = 65;
var TOP_Y = 76;
var RAIL_OFFSET = 34;
var SNAP = 56;
var MAX_X = 4e3;
var MAX_Y = 4e3;
var KEY = "panellab.layout.v1";
var EXTRAS_KEY = "panellab.extras.v1";
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
var listeners = /* @__PURE__ */ new Set();
var emit = () => listeners.forEach((l) => l());
var getLayout = () => current;
var modulePos = (m, layout = current) => layout[m.id] ?? { x: m.x, y: m.y };
var moduleRect = (m, layout = current) => ({ ...modulePos(m, layout), w: m.w, h: m.h });
function valid(v) {
  return !!v && typeof v === "object" && Number.isFinite(v.x) && Number.isFinite(v.y);
}
function setModulePos(id, pos, persist = false) {
  current = { ...current, [id]: pos };
  emit();
  if (persist) save();
}
function resetLayout() {
  current = base();
  emit();
  try {
    localStorage.removeItem(KEY);
  } catch {
  }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
  }
}
function saveExtras() {
  try {
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(MODULES.filter((m) => m.extra).map((m) => m.id)));
  } catch {
  }
}
var version = 0;
var moduleListeners = /* @__PURE__ */ new Set();
var bump = () => {
  version++;
  moduleListeners.forEach((l) => l());
};
var useModules = () => {
  (0, import_react.useSyncExternalStore)((cb) => {
    moduleListeners.add(cb);
    return () => {
      moduleListeners.delete(cb);
    };
  }, () => version, () => 0);
  return MODULES;
};
var extraModules = () => MODULES.filter((m) => m.extra);
function addExtraModule(kind) {
  if (extraModules().length >= MAX_EXTRA_MODULES) return null;
  const m = buildExtraModule(kind, nextExtraNumber(kind));
  if (!registerModule(m)) return null;
  current = { ...current, [m.id]: freeSlot(current, m) };
  saveExtras();
  save();
  bump();
  emit();
  return m;
}
function removeExtraModule(id) {
  if (!unregisterModule(id)) return false;
  const { [id]: _removed, ...rest } = current;
  current = rest;
  saveExtras();
  save();
  bump();
  emit();
  return true;
}
function loadExtraModules() {
  try {
    const raw = JSON.parse(localStorage.getItem(EXTRAS_KEY) || "null");
    if (!Array.isArray(raw)) return;
    let changed = false;
    for (const id of raw.slice(0, MAX_EXTRA_MODULES)) {
      if (typeof id !== "string" || !isExtraModuleId(id)) continue;
      const kind = extraKindOf(id);
      if (!kind) continue;
      if (registerModule(buildExtraModule(kind, Number(id.match(/(\d+)$/)[1])))) changed = true;
    }
    if (changed) {
      current = placeExtras(current);
      bump();
      emit();
    }
  } catch {
  }
}
function loadLayout() {
  loadExtraModules();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!raw || typeof raw !== "object") {
      current = base();
      emit();
      return;
    }
    const next = baseLayout();
    for (const m of MODULES) if (valid(raw[m.id])) next[m.id] = { x: raw[m.id].x, y: raw[m.id].y };
    const placed = placeExtras(next);
    if (MODULES.some((a3, i) => MODULES.slice(i + 1).some((b) => overlaps(moduleRect(a3, placed), moduleRect(b, placed), MIN_GAP - 1)))) {
      current = base();
      emit();
      return;
    }
    current = placed;
    emit();
  } catch {
  }
}
var useLayout = () => (0, import_react.useSyncExternalStore)((cb) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}, getLayout, () => DEFAULT_LAYOUT);
var overlaps = (a3, b, pad = MIN_GAP) => a3.x < b.x + b.w + pad && b.x < a3.x + a3.w + pad && a3.y < b.y + b.h + pad && b.y < a3.y + a3.h + pad;
var nearest = (value, candidates, threshold = SNAP) => {
  let best = null, bestDistance = threshold + 1;
  for (const c of candidates) {
    const d = Math.abs(c - value);
    if (d < bestDistance) {
      best = c;
      bestDistance = d;
    }
  }
  return best;
};
var clampPos = (p) => ({ x: Math.min(MAX_X, Math.max(MARGIN_X, Math.round(p.x))), y: Math.min(MAX_Y, Math.max(TOP_Y, Math.round(p.y))) });
function freeSlot(layout, me, modules = MODULES) {
  const others = modules.filter((m) => m.id !== me.id && valid(layout[m.id])).map((m) => moduleRect(m, layout));
  const right = Math.max(BOARD_RIGHT, ...others.map((o) => o.x + o.w)), bottom = Math.max(TOP_Y - GAP, ...others.map((o) => o.y + o.h));
  const candidates = [{ x: MARGIN_X, y: TOP_Y }, { x: MARGIN_X, y: bottom + GAP }];
  for (const o of others) candidates.push({ x: o.x + o.w + GAP, y: o.y }, { x: o.x, y: o.y + o.h + GAP }, { x: MARGIN_X, y: o.y + o.h + GAP }, { x: o.x - GAP - me.w, y: o.y });
  const fits = candidates.filter((c) => c.x >= MARGIN_X && c.y >= TOP_Y && c.x + me.w <= right && !others.some((o) => overlaps({ ...c, w: me.w, h: me.h }, o)));
  fits.sort((a3, b) => a3.y + me.h - (b.y + me.h) || a3.y - b.y || a3.x - b.x);
  return fits[0] ?? { x: MARGIN_X, y: bottom + GAP };
}
function dockedTo(r, others) {
  const tol = 2;
  for (const { id, rect: o } of others) {
    const sideBySide = Math.abs(r.x - (o.x + o.w + GAP)) <= tol || Math.abs(r.x + r.w + GAP - o.x) <= tol, rowsMeet = r.y < o.y + o.h && o.y < r.y + r.h;
    const stacked = Math.abs(r.y - (o.y + o.h + GAP)) <= tol || Math.abs(r.y + r.h + GAP - o.y) <= tol, columnsMeet = r.x < o.x + o.w && o.x < r.x + r.w;
    if (sideBySide && rowsMeet || stacked && columnsMeet) return id;
  }
  return null;
}
function snapModule(layout, id, desired, modules = MODULES) {
  const me = modules.find((m) => m.id === id);
  if (!me) return null;
  const entries = modules.filter((m) => m.id !== id && valid(layout[m.id])).map((m) => ({ id: m.id, rect: moduleRect(m, layout) }));
  const others = entries.map((e) => e.rect);
  const fits = (p) => !others.some((o) => overlaps({ ...p, w: me.w, h: me.h }, o));
  const d = clampPos(desired);
  const xs = [MARGIN_X, ...others.flatMap((o) => [o.x + o.w + GAP, o.x - GAP - me.w, o.x, o.x + o.w - me.w])].filter((x) => x >= MARGIN_X);
  const ys = [TOP_Y, ...others.flatMap((o) => [o.y + o.h + GAP, o.y - GAP - me.h, o.y, o.y + o.h - me.h])].filter((y) => y >= TOP_Y);
  const sx = nearest(d.x, xs), sy = nearest(d.y, ys);
  let pos = { x: sx ?? d.x, y: sy ?? d.y }, snapped = sx != null || sy != null;
  if (!fits(pos)) {
    const slots = [], alignY = nearest(d.y, ys, SNAP * 3) ?? d.y, alignX = nearest(d.x, xs, SNAP * 3) ?? d.x;
    for (const o of others) {
      for (const y of [o.y, o.y + o.h - me.h, alignY]) slots.push({ x: o.x + o.w + GAP, y }, { x: o.x - GAP - me.w, y });
      for (const x of [o.x, o.x + o.w - me.w, alignX]) slots.push({ x, y: o.y + o.h + GAP }, { x, y: o.y - GAP - me.h });
    }
    const clear = (p) => !others.some((o) => overlaps({ ...p, w: me.w, h: me.h }, o, GAP - 2));
    const free = slots.map(clampPos).filter(clear);
    free.sort((a3, b) => Math.hypot(a3.x - d.x, a3.y - d.y) - Math.hypot(b.x - d.x, b.y - d.y));
    pos = free[0] ?? freeSlot(layout, me, modules);
    snapped = true;
  }
  const rect = { ...pos, w: me.w, h: me.h }, target = dockedTo(rect, entries);
  return { pos, guides: { ...xs.includes(pos.x) ? { x: pos.x } : {}, ...ys.includes(pos.y) ? { y: pos.y } : {} }, target, snapped };
}
function railRows(layout, modules = MODULES) {
  const rows = [];
  for (const r of modules.map((m) => moduleRect(m, layout)).sort((a3, b) => a3.y - b.y)) {
    const row = rows.find((x) => Math.abs(x.top - r.y) <= SNAP);
    if (row) {
      row.top = Math.min(row.top, r.y);
      row.bottom = Math.max(row.bottom, r.y + r.h);
    } else rows.push({ top: r.y, bottom: r.y + r.h });
  }
  return rows.map((r) => ({ ...r, rail: r.top - RAIL_OFFSET }));
}
function boardFrame(layout, modules = MODULES) {
  const rects = modules.map((m) => moduleRect(m, layout));
  const right = Math.max(...rects.map((r) => r.x + r.w)), bottom = Math.max(...rects.map((r) => r.y + r.h));
  const rows = railRows(layout, modules), railBottom = bottom + 46;
  return { x: 29, y: 28, w: right + 48 - 29, h: railBottom + 27 + 20 - 28, rows, railBottom, right: right + 48, bottom: railBottom + 47 };
}
var VIEW_ASPECT = 1680 / 1460;
function fitView(layout = current, modules = MODULES) {
  const f = boardFrame(layout, modules), padL = 270, padR = 130, padTop = 150, padBottom = 130;
  const w0 = f.w + padL + padR, h0 = f.h + padTop + padBottom, w = Math.max(w0, h0 * VIEW_ASPECT), h = w / VIEW_ASPECT;
  return { x: f.x - padL - (w - w0) / 2, y: f.y - padTop - (h - h0) / 2, w, h };
}
var clampFree = (p) => ({ x: Math.min(MAX_X, Math.max(MARGIN_X, p.x)), y: Math.min(MAX_Y, Math.max(TOP_Y, p.y)) });
var area = (r) => r.w * r.h;
var intersection = (a3, b) => Math.max(0, Math.min(a3.x + a3.w, b.x + b.w) - Math.max(a3.x, b.x)) * Math.max(0, Math.min(a3.y + a3.h, b.y + b.h) - Math.max(a3.y, b.y));
function dropModule(layout, id, desired, origin, modules = MODULES) {
  const me = modules.find((m) => m.id === id);
  if (!me) return null;
  const base2 = snapModule(layout, id, desired, modules);
  if (!base2) return null;
  const dock = { pos: base2.pos, moves: { [id]: base2.pos }, kind: base2.snapped ? "dock" : "free", swapWith: null, guides: base2.guides, target: base2.target, snapped: base2.snapped };
  const free = { ...clampFree(desired), w: me.w, h: me.h };
  let best = null;
  for (const m of modules) {
    if (m.id === id || !valid(layout[m.id])) continue;
    const rect = moduleRect(m, layout), inter = intersection(free, rect), center = { x: free.x + free.w / 2, y: free.y + free.h / 2 };
    const inside = center.x > rect.x && center.x < rect.x + rect.w && center.y > rect.y && center.y < rect.y + rect.h;
    if (!inside && inter < 0.3 * Math.min(area(free), area(rect))) continue;
    if (!best || inter > best.score) best = { m, rect, score: inter };
  }
  if (!best) return dock;
  const other = best.m, B = best.rect, A = { ...origin, w: me.w, h: me.h };
  const rest = modules.filter((m) => m.id !== id && m.id !== other.id && valid(layout[m.id])).map((m) => moduleRect(m, layout));
  const ok = (a3, b) => {
    const ra = { ...a3, w: A.w, h: A.h }, rb = { ...b, w: B.w, h: B.h };
    return a3.x >= MARGIN_X && a3.y >= TOP_Y && b.x >= MARGIN_X && b.y >= TOP_Y && !overlaps(ra, rb, GAP - 2) && !rest.some((r) => overlaps(ra, r) || overlaps(rb, r));
  };
  const candidates = [];
  const sameRow = A.y < B.y + B.h && B.y < A.y + A.h, sameColumn = A.x < B.x + B.w && B.x < A.x + A.w;
  if (sameRow) {
    const left = Math.min(A.x, B.x);
    candidates.push(B.x > A.x ? { b: { x: left, y: A.y }, a: { x: left + B.w + GAP, y: B.y } } : { a: { x: left, y: B.y }, b: { x: left + A.w + GAP, y: A.y } });
  } else if (sameColumn) {
    const top = Math.min(A.y, B.y);
    candidates.push(B.y > A.y ? { b: { x: A.x, y: top }, a: { x: B.x, y: top + B.h + GAP } } : { a: { x: B.x, y: top }, b: { x: A.x, y: top + A.h + GAP } });
  }
  candidates.push({ a: { x: B.x, y: B.y }, b: { x: A.x, y: A.y } });
  for (const c of candidates) if (ok(c.a, c.b)) return { pos: c.a, moves: { [id]: c.a, [other.id]: c.b }, kind: "swap", swapWith: other.id, guides: {}, target: other.id, snapped: true };
  return dock;
}
export {
  ACTIVITY_KEY,
  ACTIVITY_PROFILES,
  ACTIVITY_STEPS,
  AMBIENT_MAX,
  AMBIENT_MIN,
  BASE_MODULE_IDS,
  COLOR_HEX,
  DEFAULT_LAYOUT,
  EXTRAS_KEY,
  EXTRA_KINDS,
  GAP,
  IDLE_MOTOR,
  KEY,
  MARGIN_X,
  MAX_EXTRA_MODULES,
  MAX_X,
  MAX_Y,
  MIN_GAP,
  MODULES,
  OFF_RELAYS,
  PORT_COUNT,
  RAIL_OFFSET,
  RETIRED_MODULES,
  RETIRED_TERMINAL_IDS,
  SET_MAX,
  SIMULATION_EXAMPLES,
  SNAP,
  STABLE_BAND,
  TAU,
  TERMINAL_BY_ID,
  TOP_Y,
  TX_OUT_MAX,
  VERIFICATION_INFO,
  VIEW_ASPECT,
  activityDocument,
  activityStep,
  addExtraModule,
  blankWorkbook,
  boardFrame,
  buildExtraModule,
  buildGuideSpreadsheet,
  checkActivity,
  clampFree,
  contactorIds,
  defaultSettings,
  downloadGuide,
  dropModule,
  emptySimulation,
  escapeHtml,
  exportGuideSpreadsheet,
  extraKindOf,
  extraModules,
  fitView,
  freeSlot,
  getLayout,
  guideChart,
  guideTemperatureRecords,
  guideTitle,
  isExtraModuleId,
  isForceTerminal,
  isForceWire,
  isStable,
  loadExtraModules,
  loadLayout,
  matchesActivity,
  matchesTerminal,
  modulePos,
  moduleRect,
  newActivity,
  newTempProgress,
  nextExtraNumber,
  normalizeSettings,
  observedMatches,
  overlaps,
  ptOhms,
  ptSide,
  railRows,
  readActivity,
  readMeter,
  readTempProgress,
  readWorkbook,
  reference,
  registerModule,
  relayIds,
  removeExtraModule,
  reportHtml,
  resetLayout,
  sameRelays,
  setModulePos,
  settledTemps,
  simulationContacts,
  snapModule,
  solveSimulation,
  startTemps,
  stepTemps,
  tcEmf,
  tcTemperature,
  tempLabUrl,
  tempStudyUrl,
  temperatureLesson,
  temperatureLessonByMaterial,
  temperatureLessons,
  temperatureSeries,
  terminalDisplay,
  terminalKey,
  terminalLabelPosition,
  terminalSensor,
  timerIds,
  txTemperature,
  txVolts,
  unregisterModule,
  useLayout,
  useModules,
  workbookKey
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
