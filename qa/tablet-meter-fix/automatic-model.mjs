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

// src/data/panelRuntime.ts
var newClock = () => ({ seconds: 0, wall: null, paused: true });
function advanceClock(old, wall, running) {
  const dt = running && !old.paused && old.wall !== null ? Math.max(0, Math.min(0.25, (wall - old.wall) / 1e3)) : 0;
  return { clock: { seconds: old.seconds + dt, wall, paused: !running }, dt };
}
function advanceTimers(old, coils, ids, now, duration) {
  const next = {};
  for (const id of ids) {
    if (!coils[id]) continue;
    const previous = old[id], t = previous && (previous.done || previous.duration === duration) ? previous : { start: now, duration, done: false };
    next[id] = { ...t, done: t.done || now - t.start >= t.duration - 1e-9 };
  }
  return next;
}
var DEFAULT_THERMAL = { enabled: true, amps: 6, tripClass: 10, coolingSeconds: 180, resetLevel: 0.65 };
var coldThermal = () => ({ heat: 0, tripped: false, reason: null, secondsToTrip: null });
function advanceThermal(state, amps, settings, dt) {
  const target = settings.enabled ? (Math.max(0, amps) / Math.max(0.1, settings.amps) / 1.15) ** 2 : 0;
  const tau = target > state.heat ? settings.tripClass * 0.75 / -Math.log(1 - (1.15 / 7.2) ** 2) : settings.coolingSeconds;
  const heat = Math.max(0, state.heat * Math.exp(-dt / tau) + target * (1 - Math.exp(-dt / tau)));
  const trip = state.tripped || settings.enabled && heat >= 1, secondsToTrip = !trip && target > 1 ? Math.max(0, -tau * Math.log((target - 1) / (target - heat))) : null;
  return { heat, tripped: trip, reason: trip ? state.reason ?? "sobrecarga" : null, secondsToTrip };
}
var openPowerContacts = () => ({ positions: {}, requested: {}, pending: {}, lastConnection: null, gapUntil: 0, lastMake: null });
function advancePowerContacts(old, requested, connection, now, delays) {
  const positions = { ...old.positions }, pending = { ...old.pending };
  let gapUntil = old.gapUntil, lastMake = old.lastMake;
  const swapping = old.lastConnection !== null && connection !== null && old.lastConnection !== connection;
  if (swapping) gapUntil = now + (delays.dropMs + delays.gapMs) / 1e3;
  for (const [id, on] of Object.entries(requested)) if (on !== !!old.requested[id]) pending[id] = { closed: on, at: now + (on ? delays.pickupMs : delays.dropMs) / 1e3 };
  if (swapping) {
    for (const p of Object.values(pending)) if (p.closed) p.at = Math.max(p.at, gapUntil);
  }
  for (const [id, p] of Object.entries(pending)) if (now >= p.at - 1e-9) {
    if (p.closed && !positions[id]) lastMake = now;
    positions[id] = p.closed;
    delete pending[id];
  }
  return { positions, requested: { ...requested }, pending, lastConnection: connection ?? old.lastConnection, gapUntil, lastMake };
}

// src/data/panel.ts
var port = (id, x, y, color, note, state, labelSide = "bottom", verification = "foto") => ({ id, label: id, x, y, color, note, state, labelSide, verification });
var source = { id: "FUENTE", title: "ALIMENTACI\xD3N Y TRANSFORMADOR", subtitle: "Transformador 220 / 24 V \xB7 3 A", x: 65, y: 82, w: 585, h: 285, image: "/references/suministro.jpg", category: "alimentacion", summary: "Fuentes y puntos de alimentaci\xF3n visibles. No energizar equipos reales sin autorizaci\xF3n docente.", labelBands: [["R", "S", "T"], ["N", "F"]], terminals: [
  port("R", 237, 230, "blue", "Fase R"),
  port("S", 297, 230, "black", "Fase S"),
  port("T", 357, 230, "red", "Fase T"),
  port("N", 430, 230, "white", "Neutro / referencia: conexi\xF3n interna por confirmar", void 0, "bottom", "no_verificado"),
  port("F", 493, 230, "red", "Borne marcado F: funci\xF3n interna por confirmar", void 0, "bottom", "no_verificado"),
  port("TP", 550, 242, "green", "Tierra de protecci\xF3n")
] };
var btn = { id: "BOTONERAS", title: "LUCES PILOTO 24 V A.C. / BOTONERAS", x: 712, y: 76, w: 615, h: 300, image: "/references/botoneras.jpg", category: "botoneras", summary: "Cuatro pilotos y tres pulsadores. Pares rojos 1\u20132; pares claros 3\u20134. NA/NC por convenci\xF3n, pendiente de verificaci\xF3n.", labelBands: [1, 2, 3].flatMap((s) => [[`S${s}:1`, `S${s}:3`], [`S${s}:2`, `S${s}:4`]]), terminals: [
  ...[78, 228, 378, 530].map((x, i) => port(`PILOTO_${i + 1}`, x, 105, "red", `Conector visible bajo piloto ${i + 1}; retorno a\xFAn no verificado`, void 0, "bottom", "no_verificado")),
  ...[115, 303, 488].flatMap((cx, i) => [
    // Los tres pulsadores se leen de izquierda a derecha: rojos 1–2 a la izquierda y claros 3–4 a la derecha. (Las fotos IMG_4737 e IMG_4536 muestran el derecho con las columnas invertidas; se normaliza a petición del autor.)
    port(`S${i + 1}:1`, cx - 29, 196, "red", `Pulsador ${i + 1} \xB7 contacto 1\u20132`, "NC por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:2`, cx - 29, 250, "red", `Pulsador ${i + 1} \xB7 contacto 1\u20132`, "NC por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:3`, cx + 29, 196, "white", `Pulsador ${i + 1} \xB7 contacto 3\u20134`, "NA por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:4`, cx + 29, 250, "white", `Pulsador ${i + 1} \xB7 contacto 3\u20134`, "NA por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar")
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
    const entry2 = { key: terminalKey(m, terminal), module: m, terminal };
    TERMINALS.push(entry2);
    TERMINAL_BY_ID.set(entry2.key, entry2);
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

// src/data/twoContactorSource.json
var twoContactorSource_default = {
  source: "modo-panel-dos-contactores-original.json",
  sha256: "aec6c2de15663dd8273f6785b9303cd01e46881fcf3732399f92b61ec84b4676",
  receivedTitle: "Ejemplo virtual \xB7 Estrella-tri\xE1ngulo \xB7 2 contactores + conjunto temporizado",
  receivedDiagram: {
    id: "leccion-estrellaTimer",
    name: "Estrella-tri\xE1ngulo con temporizador",
    src: "/diagrams/leccion-estrella-temporizador.png",
    origin: "class_photo"
  },
  receivedStepCount: 42,
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
      "BOTONERAS:S3:3"
    ],
    [
      "BOTONERAS:S3:3",
      "TEMPORIZADOR_1:13"
    ],
    [
      "BOTONERAS:S3:4",
      "TEMPORIZADOR_1:14"
    ],
    [
      "TEMPORIZADOR_1:14",
      "TEMPORIZADOR_1:A1"
    ],
    [
      "TEMPORIZADOR_1:A2",
      "FUENTE:N"
    ],
    [
      "TEMPORIZADOR_1:14",
      "TEMPORIZADOR_1:55"
    ],
    [
      "TEMPORIZADOR_1:56",
      "CONTACTOR_TERMICO:71"
    ],
    [
      "CONTACTOR_TERMICO:72",
      "CONTACTOR_TRIFASICO:A1"
    ],
    [
      "CONTACTOR_TRIFASICO:A2",
      "FUENTE:N"
    ],
    [
      "TEMPORIZADOR_1:14",
      "TEMPORIZADOR_1:67"
    ],
    [
      "TEMPORIZADOR_1:68",
      "CONTACTOR_TRIFASICO:71"
    ],
    [
      "CONTACTOR_TRIFASICO:72",
      "CONTACTOR_TERMICO:A1"
    ],
    [
      "CONTACTOR_TERMICO:A2",
      "FUENTE:N"
    ],
    [
      "FUENTE:S",
      "TEMPORIZADOR_1:L2"
    ],
    [
      "FUENTE:T",
      "TEMPORIZADOR_1:L3"
    ],
    [
      "TEMPORIZADOR_1:T1",
      "BORNERA_MOTOR:U1"
    ],
    [
      "TEMPORIZADOR_1:T2",
      "BORNERA_MOTOR:V1"
    ],
    [
      "TEMPORIZADOR_1:T3",
      "BORNERA_MOTOR:W1"
    ],
    [
      "BORNERA_MOTOR:W2",
      "CONTACTOR_TRIFASICO:L1"
    ],
    [
      "BORNERA_MOTOR:U2",
      "CONTACTOR_TRIFASICO:L2"
    ],
    [
      "BORNERA_MOTOR:V2",
      "CONTACTOR_TRIFASICO:L3"
    ],
    [
      "CONTACTOR_TRIFASICO:T1",
      "CONTACTOR_TRIFASICO:T2"
    ],
    [
      "CONTACTOR_TRIFASICO:T2",
      "CONTACTOR_TRIFASICO:T3"
    ],
    [
      "BORNERA_MOTOR:U1",
      "CONTACTOR_TERMICO:L1"
    ],
    [
      "BORNERA_MOTOR:V1",
      "CONTACTOR_TERMICO:L2"
    ],
    [
      "BORNERA_MOTOR:W1",
      "CONTACTOR_TERMICO:L3"
    ],
    [
      "CONTACTOR_TERMICO:T1",
      "BORNERA_MOTOR:W2"
    ],
    [
      "CONTACTOR_TERMICO:T2",
      "BORNERA_MOTOR:U2"
    ],
    [
      "CONTACTOR_TERMICO:T3",
      "BORNERA_MOTOR:V2"
    ],
    [
      "FUENTE:N",
      "BOTONERAS:N"
    ],
    [
      "CONTACTOR_TRIFASICO:A1",
      "BOTONERAS:PILOTO_1"
    ],
    [
      "CONTACTOR_TERMICO:A1",
      "BOTONERAS:PILOTO_4"
    ],
    [
      "FUENTE:R",
      "TEMPORIZADOR_1:L1"
    ],
    [
      "CONTACTOR_TERMICO:97",
      "FUENTE:F"
    ],
    [
      "CONTACTOR_TERMICO:98",
      "BOTONERAS:PILOTO_3"
    ]
  ]
};

// src/data/twoContactorOrder.ts
var TWO_CONTACTOR_STEP_ORDER = [
  0,
  1,
  2,
  5,
  6,
  31,
  3,
  4,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  37,
  38,
  39,
  35,
  36,
  32,
  33,
  34,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30
];

// src/data/twoContactorTeaching.ts
var onS1 = (id) => id.replace("BOTONERAS:S3:", "BOTONERAS:S1:");
var TWO_CONTACTOR_ADDED_PAIRS = [
  ["FUENTE:F", "CONTACTOR_TERMICO:81"],
  ["CONTACTOR_TERMICO:82", "CONTACTOR_TRIFASICO:81"],
  ["CONTACTOR_TRIFASICO:82", "BOTONERAS:PILOTO_2"]
];
var ADJUSTED = {
  3: ["BOTONERAS:S2:2", "TEMPORIZADOR_1:13"],
  4: ["TEMPORIZADOR_1:14", "BOTONERAS:S1:4"],
  5: ["BOTONERAS:S1:4", "TEMPORIZADOR_1:A1"],
  7: ["BOTONERAS:S1:4", "TEMPORIZADOR_1:55"],
  11: ["BOTONERAS:S1:4", "TEMPORIZADOR_1:67"],
  25: ["TEMPORIZADOR_1:L1", "CONTACTOR_TERMICO:L1"],
  26: ["TEMPORIZADOR_1:L2", "CONTACTOR_TERMICO:L2"],
  27: ["TEMPORIZADOR_1:L3", "CONTACTOR_TERMICO:L3"],
  31: ["BOTONERAS:N", "FUENTE:N"],
  35: ["FUENTE:F", "CONTACTOR_TERMICO:97"]
};
var bySource = [...twoContactorSource_default.pairs.map(([a3, b], i) => ADJUSTED[i] ?? [onS1(a3), onS1(b)]), ...TWO_CONTACTOR_ADDED_PAIRS];
var TWO_CONTACTOR_PAIRS = TWO_CONTACTOR_STEP_ORDER.map((i) => bySource[i]);
var entry = (title, why, behavior, without, question, criteria) => ({ title, why, behavior, without, question, criteria });
var control = [
  entry("Protecci\xF3n del mando \xB7 F a 95", "F alimenta la entrada 95 del rel\xE9 t\xE9rmico, que en el banco est\xE1 en el m\xF3dulo \xABContactor + rel\xE9 t\xE9rmico\xBB (KM1, el contactor de tri\xE1ngulo). El t\xE9rmico es una protecci\xF3n, no otro contactor.", "Con el t\xE9rmico sano, 95\u201396 permite alimentar el mando; TEST abre 95\u201396 y corta esta cadena.", "El mando no recibe alimentaci\xF3n por la ruta protegida.", "\xBFQu\xE9 diferencia hay entre el contactor KM1 y su rel\xE9 t\xE9rmico, y qu\xE9 cambia al disparar este \xFAltimo?", ["Distinguir contactor y rel\xE9 t\xE9rmico.", "Explicar la apertura de 95\u201396."]),
  entry("Del t\xE9rmico al paro \xB7 96 a S2:1", "La salida 96 lleva la fase protegida al NC del pulsador rojo S2.", "El paro queda en serie con la marcha S1 y con la retenci\xF3n de KT1.", "La cadena de marcha y retenci\xF3n queda sin alimentaci\xF3n.", "\xBFPor qu\xE9 el paro debe recibir fase despu\xE9s de 95\u201396?", ["Seguir F \u2192 95\u201396 \u2192 S2.", "Relacionar el disparo t\xE9rmico con la p\xE9rdida de mando."]),
  entry("Salida del paro a marcha \xB7 S1", "S2:2 alimenta el borne 3 del pulsador verde izquierdo S1. En este archivo S1 da marcha; S3 no se utiliza.", "Pulsar S1 cierra 3\u20134, siempre que S2 y el t\xE9rmico permitan el paso.", "S1 no puede dar la orden inicial por esta rama.", "\xBFQu\xE9 pulsador inicia este montaje y por qu\xE9 no se debe seguir aqu\xED la orden S1 de la otra lecci\xF3n?", ["Identificar S1 como marcha y S2 como paro.", "Reconocer que los pasos heredados no describ\xEDan estos cables."]),
  entry("Retenci\xF3n de KT1 \xB7 entrada 13", "El auxiliar 13\u201314 de KT1, el contactor principal, recibe fase directamente de la salida del paro, S2:2, igual que S1:3: las dos ramas de marcha cuelgan despu\xE9s del paro.", "Cuando act\xFAa KT1 su NA 13\u201314 cierra y ofrece una ruta en paralelo con S1.", "Sin esta entrada no se alimenta la rama de retenci\xF3n.", "\xBFQu\xE9 dos ramas reciben fase despu\xE9s de S2 y c\xF3mo conserva el paro su prioridad?", ["Explicar el paralelo S1 / KT1 13\u201314.", "Situar ambas ramas despu\xE9s del paro."]),
  entry("Retenci\xF3n de KT1 \xB7 salida 14", "S1:4 se une con KT1:14; las dos rutas de marcha llegan al mismo nodo.", "Despu\xE9s de dar marcha, el auxiliar mantiene ese nodo alimentado al soltar S1.", "Sin otra ruta equivalente, el conjunto depender\xEDa de mantener S1 pulsado.", "\xBFC\xF3mo sigue alimentado KT1 cuando sueltas el pulsador verde izquierdo?", ["Seguir la ruta de retenci\xF3n 13\u201314.", "Distinguir contacto auxiliar y pulsador."]),
  entry("Bobina de KT1 \xB7 A1", "El nodo de marcha y retenci\xF3n alimenta A1 de KT1, el contactor principal. En el banco es el m\xF3dulo \xABTemporizador neum\xE1tico\xBB: el cabezal de retardo KT1 va montado sobre este contactor.", "En el modelo KT1 cierra sus tres polos de l\xEDnea y empieza el retardo de KT1; los contactos temporizados 55\u201356 y 67\u201368 de KT1 realizan el cambio.", "No se acciona el contactor principal ni comienza el retardo.", "\xBFQu\xE9 funciones cumplen KT1 y KT1 al alimentarse esta bobina en este montaje?", ["Identificar bobina, polos de fuerza y retardo.", "No confundir KT1 (contactor) con KT1 (su retardo) ni con KM2."]),
  entry("Retorno de KT1 \xB7 A2 a N", "A2 completa el circuito de la bobina de KT1 con el neutro de mando.", "La bobina necesita tensi\xF3n entre A1 y A2 para actuar y para que KT1 cuente el tiempo.", "Alimentar A1 sin retorno no completa el circuito de la bobina.", "\xBFPor qu\xE9 necesita KT1 un retorno a N y por qu\xE9 no se sustituye por TP?", ["Explicar circuito cerrado A1\u2013A2.", "Distinguir N y TP."]),
  entry("Alimentaci\xF3n de la etapa estrella \xB7 KT1 55", "El nodo de marcha y retenci\xF3n (S1:4, unido a KT1:14) alimenta la entrada 55 del contacto temporizado NC de KT1.", "KT1 55\u201356 permite la primera etapa mientras transcurre el retardo.", "La rama inicial de estrella no recibe fase por esta ruta.", "\xBFPor qu\xE9 esta rama se alimenta desde el nodo retenido y no directamente desde F?", ["Relacionar la etapa con la marcha retenida.", "Identificar 55\u201356 como contacto inicial del retardo KT1."]),
  entry("Salida temporizada de estrella \xB7 56 a KM1:71", "La salida 56 pasa por el NC 71\u201372 de KM1 (el contactor de tri\xE1ngulo) antes de llegar a KM2, el de estrella.", "Durante el tiempo, KT1 55\u201356 permite la estrella si KM1 de tri\xE1ngulo est\xE1 abierto. Al terminar abre.", "KM2 no recibe la orden inicial por esta rama.", "\xBFQu\xE9 dos condiciones deben permitir el paso para activar KM2 en estrella?", ["Nombrar KT1 55\u201356 y KM1 71\u201372.", "Explicar temporizaci\xF3n y enclavamiento."]),
  entry("Enclavamiento de estrella \xB7 KM1:72 a KM2:A1", "La salida del NC de KM1 alimenta la bobina de KM2, que en este archivo hace estrella.", "Si act\xFAa KM1, su 71\u201372 abre e impide mantener la rama de KM2.", "Queda interrumpida la alimentaci\xF3n de la bobina de estrella.", "\xBFQu\xE9 contactor hace estrella y cu\xE1l debe estar abierto para que pueda entrar?", ["Identificar KM2 como estrella.", "Explicar el NC de KM1 en la rama contraria."]),
  entry("Retorno de KM2 \xB7 A2 a N", "La bobina del contactor de estrella (KM2) completa su retorno a N.", "KM2 act\xFAa cuando su rama temporizada alimenta A1 y A2 dispone de retorno.", "La bobina de estrella queda sin circuito cerrado.", "Sigue el recorrido completo desde F hasta el retorno de KM2: \xBFqu\xE9 condiciones encuentras?", ["Incluir t\xE9rmico, paro, retenci\xF3n, retardo KT1 y enclavamiento.", "Terminar en A2 y N."]),
  entry("Alimentaci\xF3n de la etapa tri\xE1ngulo \xB7 KT1 67", "El mismo nodo retenido alimenta 67 del contacto temporizado NA de KT1.", "KT1 67\u201368 espera abierto y cierra cuando termina el retardo.", "La rama de tri\xE1ngulo no recibe su alimentaci\xF3n prevista.", "\xBFEn qu\xE9 se diferencian 55\u201356 y 67\u201368 durante y despu\xE9s del tiempo?", ["Describir el NC inicial y el NA final.", "Relacionar ambos con una \xFAnica marcha de KT1."]),
  entry("Salida temporizada de tri\xE1ngulo \xB7 68 a KM2:71", "La salida 68 pasa por el NC 71\u201372 de KM2 antes de alimentar KM1.", "Al terminar el retardo, la orden llega a tri\xE1ngulo cuando KM2 de estrella ha ca\xEDdo y su NC permite el paso.", "No llega la orden temporizada de tri\xE1ngulo por esta rama.", "\xBFPor qu\xE9 KT1 67\u201368 no alimenta directamente la bobina de KM1?", ["Explicar el enclavamiento por KM2.", "Describir la exclusi\xF3n entre estrella y tri\xE1ngulo."]),
  entry("Enclavamiento de tri\xE1ngulo \xB7 KM2:72 a KM1:A1", "El NC de KM2 entrega la orden a KM1, el contactor con rel\xE9 t\xE9rmico que aqu\xED realiza tri\xE1ngulo.", "KM1 cierra sus polos para formar U1\u2013W2, V1\u2013U2 y W1\u2013V2; KM2 debe estar abierto.", "No act\xFAa el contactor que completa tri\xE1ngulo.", "\xBFPor qu\xE9 KM1 y KM2 no deben cerrar juntos en este esquema?", ["Relacionar polos y conexi\xF3n de bobinados.", "Explicar la funci\xF3n de los NC cruzados."]),
  entry("Retorno de KM1 \xB7 A2 a N", "La bobina del contactor de tri\xE1ngulo completa su retorno a N.", "KM1 puede actuar tras el tiempo si se cumplen marcha, protecci\xF3n y enclavamiento.", "La orden sobre A1 no completa por s\xED sola el circuito de KM1.", "\xBFQu\xE9 recorrido alimenta KM1 despu\xE9s del retardo y c\xF3mo se detiene?", ["Incluir KT1 67\u201368 y KM2 71\u201372.", "Explicar paro S2 y corte por 95\u201396."])
];
var power = (i) => {
  const [from, to] = bySource[i];
  if (from.startsWith("FUENTE:")) return entry(`Fuerza \xB7 fase ${from.split(":")[1]} a KT1`, "Esta fase entra en un polo de l\xEDnea de KT1, el contactor principal (m\xF3dulo \xABTemporizador neum\xE1tico\xBB), tal como est\xE1 cableado en el archivo.", "Al actuar KT1, su polo L\u2013T deja pasar esta fase hacia U1, V1 o W1.", "Queda una fase de fuerza sin su recorrido previsto; las bobinas pueden actuar aunque el motor no tenga alimentaci\xF3n completa.", "\xBFQu\xE9 polo de KT1 lleva esta fase al motor y qu\xE9 diferencia hay entre mando y fuerza?", ["Seguir entrada L y salida T correspondientes.", "No deducir giro solo del estado de una bobina."]);
  if (from.startsWith("TEMPORIZADOR_1:T")) return entry("De KT1 al motor \xB7 " + to.split(":")[1], "Los polos de l\xEDnea de KT1 alimentan los extremos U1, V1 y W1 del motor.", "Esta alimentaci\xF3n permanece durante estrella y tri\xE1ngulo; el cambio se realiza en los otros extremos de las bobinas.", "Falta una de las alimentaciones principales de los bobinados.", "\xBFPor qu\xE9 esta conexi\xF3n permanece igual durante las dos etapas?", ["Identificar el extremo del motor.", "Distinguir alimentaci\xF3n de l\xEDnea y cambio de conexi\xF3n."]);
  if (to.startsWith("CONTACTOR_TRIFASICO:L")) return entry(`Extremo del motor hacia KM2 \xB7 estrella \xB7 ${from.split(":")[1]}`, "Un extremo W2, U2 o V2 va a una entrada L de KM2, el contactor de estrella. En este archivo el puente com\xFAn se hace en las salidas T.", "Al cerrar KM2, cada polo une su extremo de motor con el nodo com\xFAn T1\u2013T2\u2013T3.", "Queda incompleto el recorrido de uno de los extremos hacia el punto estrella.", "Sigue este extremo: \xBFc\xF3mo llega al nodo com\xFAn cuando act\xFAa KM2?", ["Situar W2, U2 o V2.", "Identificar el puente en T, no en L."]);
  if (from.startsWith("CONTACTOR_TRIFASICO:T")) return entry(`Puente del punto estrella \xB7 KM2 \xB7 ${from.split(":")[1]}\u2013${to.split(":")[1]}`, "Los puentes unen T1, T2 y T3 de KM2 en un nodo com\xFAn.", "Con KM2 cerrado quedan reunidos W2, U2 y V2. Con KM2 abierto los puentes no unen por s\xED solos esos extremos del motor.", "Sin todos los puentes falta parte del punto estrella.", "\xBFPor qu\xE9 los puentes en T forman estrella solo cuando cierran los polos de KM2?", ["Identificar T1\u2013T2\u2013T3 como nodo com\xFAn.", "Relacionar el puente con los polos L\u2013T."]);
  return entry(`Rama de tri\xE1ngulo \xB7 KM1 \xB7 ${from.split(":")[1]} a ${to.split(":")[1]}`, "KM1 toma R, S y T por L1, L2 y L3 (las mismas entradas de KT1) y las lleva a W2, U2 y V2 por T1, T2 y T3 del m\xF3dulo con t\xE9rmico.", "Con KM1 cerrado, R llega a W2, S a U2 y T a V2 y, con U1, V1 y W1 alimentados por KT1, se forman U1\u2013W2, V1\u2013U2 y W1\u2013V2. KM2 de estrella debe estar abierto.", "Falta uno de los recorridos de la conexi\xF3n tri\xE1ngulo.", "\xBFQu\xE9 pareja de extremos se une por este polo de KM1 y por qu\xE9 debe estar abierto KM2?", ["Seguir L\u2013T y la pareja de extremos del motor.", "Distinguir el rel\xE9 t\xE9rmico de un tercer contactor."]);
};
var extras = {
  25: entry("Tri\xE1ngulo \xB7 L1 de KT1 a L1 de KM1", "KM1 (tri\xE1ngulo) toma la fase R antes del contactor principal: su L1 se une a la L1 de KT1, que es la misma entrada de R. Es la derivaci\xF3n hacia el contactor 2 (tri\xE1ngulo) de la figura N\xBA2 de la gu\xEDa.", "Al cerrar KM1, la fase R sale por su polo L1\u2013T1 hacia W2.", "KM1 no recibe la fase R y el tri\xE1ngulo queda incompleto.", "\xBFPor qu\xE9 KM1 se alimenta de la entrada de KT1 y no de los bornes del motor?", ["Seguir R \u2192 L1 de KT1 \u2192 L1 de KM1.", "Relacionarlo con la derivaci\xF3n de la figura N\xBA2."]),
  26: entry("Tri\xE1ngulo \xB7 L2 de KT1 a L2 de KM1", "La fase S llega a L2 de KT1 y se deriva a L2 de KM1, tambi\xE9n antes del contactor principal.", "Al cerrar KM1, la fase S sale por su polo L2\u2013T2 hacia U2.", "KM1 no recibe la fase S y el tri\xE1ngulo queda incompleto.", "\xBFQu\xE9 fase se lleva por este cable y hacia qu\xE9 extremo del motor sale por KM1?", ["Seguir S \u2192 L2 de KT1 \u2192 L2 de KM1.", "Distinguir esta derivaci\xF3n de la alimentaci\xF3n del motor."]),
  27: entry("Tri\xE1ngulo \xB7 L3 de KT1 a L3 de KM1", "La fase T llega a L3 de KT1 y se deriva a L3 de KM1, antes del contactor principal.", "Al cerrar KM1, la fase T sale por su polo L3\u2013T3 hacia V2.", "KM1 no recibe la fase T y el tri\xE1ngulo queda incompleto.", "\xBFPor qu\xE9 las tres derivaciones de KM1 salen de L1, L2 y L3 de KT1?", ["Seguir T \u2192 L3 de KT1 \u2192 L3 de KM1.", "Comprobar que cada fase llega a su extremo distinto del motor."]),
  31: entry("Neutro com\xFAn de los pilotos", "BOTONERAS:N conecta el retorno modelado de los pilotos a N de la fuente.", "Las se\xF1ales pueden encenderse cuando su rama recibe fase y este retorno est\xE1 completo.", "Los pilotos quedan sin retorno aunque el mando pueda funcionar.", "\xBFQu\xE9 circuitos cierra este cable y por qu\xE9 no se une N a TP?", ["Identificar el retorno com\xFAn de pilotos.", "Separar neutro y protecci\xF3n."]),
  32: entry("Piloto P1 \xB7 estrella", "P1 recibe la misma alimentaci\xF3n de mando que A1 de KM2.", "Indica la orden sobre la bobina de estrella, con el retorno de pilotos conectado.", "Se pierde la se\xF1al verde de estrella; esto no prueba por s\xED solo un fallo del circuito de fuerza.", "\xBFQu\xE9 indica P1 y por qu\xE9 no demuestra por s\xED solo que gira un motor f\xEDsico?", ["Relacionar P1 con KM2.", "Distinguir se\xF1al de mando y giro."]),
  33: entry("Piloto P4 \xB7 tri\xE1ngulo", "P4 toma la se\xF1al de A1 de KM1, el contactor que hace tri\xE1ngulo en este montaje.", "Se enciende con la orden de tri\xE1ngulo tras el retardo, si dispone del retorno com\xFAn.", "Se pierde esta indicaci\xF3n de tri\xE1ngulo aunque la bobina pueda actuar.", "\xBFPor qu\xE9 P4 se conecta a KM1:A1 y P1 a KM2:A1?", ["Relacionar cada piloto con su etapa.", "No trasladar los papeles de la lecci\xF3n de tres contactores."]),
  35: entry("Alimentaci\xF3n del aviso t\xE9rmico \xB7 97", "El NA 97\u201398 toma fase directamente de F, antes del corte 95\u201396.", "As\xED el aviso puede seguir recibiendo alimentaci\xF3n cuando el t\xE9rmico interrumpe el mando.", "No se alimenta el circuito de alarma por esta ruta.", "\xBFPor qu\xE9 97 se alimenta antes del contacto que abre al dispararse?", ["Distinguir aviso y corte de mando.", "Seguir F \u2192 97\u201398."]),
  36: entry("Aviso de disparo \xB7 98 a P3", "La salida 98 alimenta el piloto amarillo P3.", "En el modelo, TEST abre 95\u201396 y cierra 97\u201398: cae el mando y se enciende P3 con N conectado.", "Falta el aviso luminoso de disparo aunque pueda cortarse el mando.", "\xBFQu\xE9 diferencias observar\xEDas entre un paro por S2 y un disparo t\xE9rmico?", ["Comparar S2 y TEST.", "Identificar 95\u201396 de corte y 97\u201398 de se\xF1al."]),
  37: entry("Piloto rojo \xB7 F a KM1:81", "F alimenta el NC 81\u201382 de KM1 (el contactor de tri\xE1ngulo), el primer contacto de la cadena del piloto rojo \xABmotor detenido\xBB. Toma fase directamente de F, antes del corte 95\u201396.", "Con KM1 en reposo, 81\u201382 est\xE1 cerrado y deja pasar la fase hacia KM2.", "La cadena del piloto rojo no recibe fase.", "\xBFPor qu\xE9 el piloto rojo se alimenta desde F y no despu\xE9s de 95\u201396?", ["Seguir F \u2192 81\u201382.", "Distinguir se\xF1alizaci\xF3n y mando."]),
  38: entry("Piloto rojo \xB7 KM1:82 a KM2:81", "La salida 82 de KM1 entra al NC 81\u201382 de KM2: el rojo solo puede encenderse si KM1 y KM2 est\xE1n en reposo. En la gu\xEDa el piloto rojo pasa por un NC de KT1, el principal; aqu\xED KT1 es el contactor del m\xF3dulo temporizador y no tiene un NC instant\xE1neo libre, por eso se usan los NC 81\u201382 de los contactores de tri\xE1ngulo y de estrella en serie, que adem\xE1s hacen que se apague en estrella y en tri\xE1ngulo.", "Si act\xFAa estrella (KM2) o tri\xE1ngulo (KM1), su NC abre y corta la cadena.", "La cadena queda interrumpida y el rojo no se enciende nunca.", "\xBFQu\xE9 contactores deben estar en reposo para que se encienda el piloto rojo?", ["Nombrar KM1 81\u201382 y KM2 81\u201382 en serie.", "Relacionarlos con tri\xE1ngulo y estrella."]),
  39: entry("Piloto rojo P2 \xB7 KM2:82 a P2", "La salida 82 de KM2 alimenta el piloto rojo P2 \xABmotor detenido\xBB; su retorno es el com\xFAn N de los pilotos.", "Se enciende en reposo, se apaga en estrella y en tri\xE1ngulo y vuelve a encenderse con el disparo t\xE9rmico, junto con P3.", "Falta el aviso luminoso de motor detenido que pide la gu\xEDa (puntos 6, 9 y 10).", "\xBFPor qu\xE9 el rojo sigue encendido con TEST aunque el mando se corte?", ["Relacionar P2 con el reposo de KM1 y KM2.", "Distinguir el rojo de P3 amarillo."])
};
var TWO_CONTACTOR_DETAILS = TWO_CONTACTOR_STEP_ORDER.map((i) => control[i] ?? extras[i] ?? power(i));

// src/data/twoContactorNames.ts
var TWO_CONTACTOR_MODULE_NAMES = {};
var labelScopeFor = (id) => id && /dosContactores|twoContactors/i.test(id) ? "dosContactores" : void 0;
function twoContactorModuleName(module, terminal = "") {
  return TWO_CONTACTOR_MODULE_NAMES[module];
}

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
    title: `Lecci\xF3n \xB7 ${source2.title} \xB7 3 contactores`,
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
var TWO_CONTACTOR_LESSON = {
  id: "estrellaDosContactores",
  schematic: "estrellaDosContactores",
  title: "Lecci\xF3n \xB7 Estrella-tri\xE1ngulo \xB7 2 contactores",
  summary: "Con los nombres del banco: KT1 es el contactor principal (m\xF3dulo temporizador neum\xE1tico), KM1 el de tri\xE1ngulo (m\xF3dulo con rel\xE9 t\xE9rmico), KM2 el de estrella (m\xF3dulo trif\xE1sico); KT1 tambi\xE9n da el retardo. S1 da marcha; S2 para; el piloto rojo indica motor detenido. 40 cables, paso a paso desde el banco vac\xEDo.",
  diagram: { id: "leccion-estrellaDosContactores", name: twoContactorSource_default.receivedDiagram.name, src: twoContactorSource_default.receivedDiagram.src, origin: "class_photo" },
  pairs: TWO_CONTACTOR_PAIRS.map(([a3, b]) => [a3, b]),
  steps: TWO_CONTACTOR_PAIRS.map(([from, to], i) => ({ id: `estrellaDosContactores-${String(i + 1).padStart(2, "0")}`, from, to, title: TWO_CONTACTOR_DETAILS[i].title, explanation: TWO_CONTACTOR_DETAILS[i].why, review: "user_reviewed", region: { x: 0, y: 0, w: 1e3, h: 1e3 } }))
};
var LESSONS = { simple: SIMPLE_LESSON, inversion: INVERSION_LESSON, estrellaManual: STAR_MANUAL_LESSON, estrellaTimer: STAR_TIMER_LESSON, estrellaDosContactores: TWO_CONTACTOR_LESSON };
var MODULE_NAMES = { FUENTE: "Fuente", BOTONERAS: "Botoneras", CONTACTOR_TERMICO: "KM1", CONTACTOR_TRIFASICO: "KM2", CONTACTOR_TRIFASICO_3: "KM3", TEMPORIZADOR_1: "KT1", BORNERA_MOTOR: "Motor" };
function terminalLabel(id, scope) {
  const [module, ...rest] = id.split(":"), terminal = rest.join(":"), name = (scope === "dosContactores" ? twoContactorModuleName(module, terminal) : void 0) ?? MODULE_NAMES[module] ?? module, pushbutton = terminal.match(/^(S[123]):([1-4])$/);
  return `${name} \xB7 ${pushbutton ? `${pushbutton[1]} borne ${pushbutton[2]}` : terminal.replace("PILOTO_", "piloto ").replace(/^TP_.+$/, "TP")}`;
}
var LESSON_MAP_RATIO = leccionInversion_layout_default.height / leccionInversion_layout_default.width;

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

// src/data/panelFaults.ts
var OPEN_OHMS = 1e4;
var COIL_VOLTS = 24;
var PICKUP_FRACTION = 0.85;
var DROPOUT_FRACTION = 0.5;
var pairKey = (a3, b) => a3 < b ? a3 + "|" + b : b + "|" + a3;
var faultsOf = (input) => input?.faults ?? [];
var hasFault = (faults, kind) => faults.some((f) => f.kind === kind);
function effectiveWires(wires, faults) {
  if (!faults.length) return { ideal: wires, resistive: [] };
  const open = /* @__PURE__ */ new Set(), ohms = /* @__PURE__ */ new Map();
  for (const f of faults) {
    if (f.kind === "wire-open") open.add(f.wire);
    else if (f.kind === "wire-resistive") {
      if (f.ohms >= OPEN_OHMS) open.add(f.wire);
      else ohms.set(f.wire, Math.max(0.01, f.ohms));
    }
  }
  const resistive = [];
  const ideal = wires.filter((w) => {
    if (open.has(w.id)) return false;
    const r = ohms.get(w.id);
    if (r === void 0) return true;
    resistive.push({ id: w.id, a: w.from.terminalId, b: w.to.terminalId, ohms: r });
    return false;
  });
  return { ideal, resistive };
}
function applyContactFaults(pairs, faults) {
  const open = /* @__PURE__ */ new Set(), welded = [];
  for (const f of faults) {
    if (f.kind === "contact-open") open.add(pairKey(f.a, f.b));
    else if (f.kind === "contact-welded") welded.push([f.a, f.b]);
  }
  if (!open.size && !welded.length) return pairs;
  const kept = pairs.filter(([a3, b]) => !open.has(pairKey(a3, b))), have = new Set(kept.map(([a3, b]) => pairKey(a3, b)));
  for (const [a3, b] of welded) if (!have.has(pairKey(a3, b))) {
    kept.push([a3, b]);
    have.add(pairKey(a3, b));
  }
  return kept;
}
var contactOhms = (faults) => new Map(faults.flatMap((f) => f.kind === "contact-resistive" ? [[pairKey(f.a, f.b), Math.max(0.02, f.ohms)]] : []));
var needsNumericControl = (faults) => faults.some((f) => f.kind === "wire-resistive" || f.kind === "contact-resistive" || f.kind === "control-low");
var controlSourceVolts = (faults) => {
  const low = faults.find((f) => f.kind === "control-low");
  return low && low.kind === "control-low" ? Math.max(0, low.volts) : COIL_VOLTS;
};
var coilHolds = (volts, wasClosed) => volts != null && volts >= COIL_VOLTS * (wasClosed ? DROPOUT_FRACTION : PICKUP_FRACTION);
function openWindingAdmittance(y, open) {
  const yo = y[open][open];
  return y.map((row, j) => row.map((value, k) => {
    if (j === open || k === open) return { re: 0, im: 0 };
    const t = multiply(multiply(y[j][open], y[open][k]), divide({ re: 1, im: 0 }, yo));
    return { re: value.re - t.re, im: value.im - t.im };
  }));
}

// src/data/panelFaultControl.ts
function controlVoltages(wires, input, relays, timed) {
  const net = panelElectrical(wires, input, relays, timed);
  return {
    relay: Object.fromEntries(relayIds().map((id) => [id, net.voltage(`${id}:A1`, `${id}:A2`)])),
    pilot: [1, 2, 3, 4].map((n) => net.voltage(`BOTONERAS:PILOTO_${n}`, "BOTONERAS:N"))
  };
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
    if (input.powerContacts ? !!input.powerContacts[id] : closed) for (const i of [1, 2, 3]) pairs.push([`${id}:L${i}`, `${id}:T${i}`]);
  }
  for (const id of timerIds()) {
    const on = !!relays[id], done = on && timed.includes(id);
    if (input.powerContacts ? !!input.powerContacts[id] : on) for (const i of [1, 2, 3]) pairs.push([`${id}:L${i}`, `${id}:T${i}`]);
    if (on) pairs.push([`${id}:13`, `${id}:14`]);
    pairs.push(done ? [`${id}:67`, `${id}:68`] : [`${id}:55`, `${id}:56`]);
  }
  pairs.push(input.thermalTripped ? ["CONTACTOR_TERMICO:97", "CONTACTOR_TERMICO:98"] : ["CONTACTOR_TERMICO:95", "CONTACTOR_TERMICO:96"]);
  return applyContactFaults(pairs, faultsOf(input));
}
function graph(wires, pairs, faults = []) {
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
  const eff = effectiveWires(wires, faults);
  eff.ideal.forEach((w) => join(w.from.terminalId, w.to.terminalId));
  eff.resistive.forEach((w) => join(w.a, w.b));
  pairs.forEach(([a3, b]) => join(a3, b));
  const phase = root("FUENTE:F"), neutral = root("FUENTE:N"), phases = ["FUENTE:R", "FUENTE:S", "FUENTE:T"].map(root);
  const voltage = (a3, b) => phase !== neutral && (root(a3) === phase && root(b) === neutral || root(a3) === neutral && root(b) === phase);
  return { root, phase, neutral, phases, voltage };
}
function solveControl(wires, input, previous = OFF_RELAYS(), timed = []) {
  const off = (fault = null) => ({ powered: false, fault, relays: OFF_RELAYS(), pilots: [false, false, false, false], liveTerminals: [], liveWireIds: [], closedContacts: [] });
  if (!input.enabled || !input.plugged || !input.breakers.every(Boolean)) return off();
  let relays = { ...previous };
  const seen = /* @__PURE__ */ new Set(), faults = faultsOf(input);
  for (let i = 0; i < 16; i++) {
    const ids = relayIds(), signature = ids.map((id) => Number(!!relays[id])).join("");
    if (seen.has(signature)) return off("unstable");
    seen.add(signature);
    const contacts = simulationContacts(input, relays, timed), g = graph(wires, contacts, faults);
    if (g.phase === g.neutral) return off("short");
    const next = Object.fromEntries(ids.map((id) => [id, g.voltage(`${id}:A1`, `${id}:A2`)]));
    let lamps = null;
    if (faults.length) {
      for (const f of faults) if (f.kind === "coil-open") next[f.relay] = false;
      if (needsNumericControl(faults)) {
        const v = controlVoltages(wires, input, relays, timed);
        lamps = v.pilot;
        for (const id of ids) if (next[id]) next[id] = coilHolds(v.relay[id], !!relays[id]);
      }
    }
    if (ids.every((id) => next[id] === !!relays[id])) {
      const pilots = [1, 2, 3, 4].map((n) => g.voltage(`BOTONERAS:PILOTO_${n}`, "BOTONERAS:N") && !faults.some((f) => f.kind === "pilot-burnt" && f.n === n) && (!lamps || coilHolds(lamps[n - 1], true)));
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
  const faults = faultsOf(input), g = graph(wires, simulationContacts(input, relays, timed), faults), [r, s, t] = g.phases;
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
  const direction = (SEQUENCES.includes(lines.join("")) ? 1 : -1) * (hasFault(faults, "sequence-reversed") ? -1 : 1);
  const star = same("U2", "V2") && same("V2", "W2") && ends.every((e) => e === null);
  const delta = same("U1", "W2") && same("V1", "U2") && same("W1", "V2");
  const openWinding = faults.find((f) => f.kind === "winding-open");
  if (openWinding && openWinding.kind === "winding-open" && (star || delta)) return { motor: { status: "fault", connection: star ? "star" : "delta", direction, speed: 0, message: `Devanado ${openWinding.phase}1\u2013${openWinding.phase}2 abierto: el motor zumba, no gira y las otras dos bobinas se recalientan.`, lines }, live };
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
var stoppedMotion = () => ({ rpm: 0, torqueNm: 0, slip: 1, phaseVolts: 0, stalled: false });
function advanceMotor(motion, m, phaseVolts, powered, direction, dt) {
  if (m.motorMode !== "induction") return stoppedMotion();
  const eq = motorEquivalent({ ...m, rotorRpm: motion.rpm, motorDirection: direction }), p = m.motorParameters ?? MOTOR_EQUIVALENT;
  const rotorAmps = (m.positiveVolts ?? phaseVolts) * Math.hypot(eq.rotorRatio.re, eq.rotorRatio.im), omegaSync = eq.syncRpm * Math.PI / 30;
  const neg = motorEquivalent({ ...m, rotorRpm: motion.rpm, motorDirection: direction }, 2 - eq.slip);
  const negativeAmps = (m.negativeVolts ?? 0) * Math.hypot(neg.rotorRatio.re, neg.rotorRatio.im);
  const torque = powered ? 3 * p.rotorOhms * (rotorAmps * rotorAmps / eq.slip - negativeAmps * negativeAmps / (2 - eq.slip)) / omegaSync : 0;
  const omega = motion.rpm * Math.PI / 30, load = Math.max(0, Math.min(40, m.loadTorqueNm ?? 4));
  const sign = Math.abs(omega) > 0.01 ? Math.sign(omega) : direction;
  const acceleration = (direction * torque - sign * load - p.friction * omega) / p.inertia;
  let next = omega + acceleration * Math.max(0, Math.min(0.05, dt));
  if (!powered && Math.sign(next) !== Math.sign(omega)) next = 0;
  if (powered && Math.abs(omega) < 0.01 && direction * next < 0) next = 0;
  next = Math.max(-omegaSync * 0.999, Math.min(omegaSync * 0.999, next));
  return { rpm: next * 30 / Math.PI, torqueNm: torque, slip: eq.slip, phaseVolts: powered ? phaseVolts : 0, stalled: powered && Math.abs(next) < omegaSync * 0.05 && torque < load };
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

// src/data/machinePreparation.ts
var EXAMPLE_RATING = { deltaVolts: 380, starVolts: 660, lineAmps: 10, source: "Ejemplo did\xE1ctico; no corresponde a la placa del laboratorio" };
function readMotorRating(raw) {
  const r = raw;
  if (!r || ![r.deltaVolts, r.starVolts, r.lineAmps].every(Number.isFinite) || r.deltaVolts < 24 || r.starVolts > 1200 || r.lineAmps <= 0 || r.lineAmps > 200 || Math.abs(r.starVolts / r.deltaVolts - Math.sqrt(3)) > 0.12 || typeof r.source !== "string" || !r.source.trim() || r.source.length > 1e3) throw Error("Placa inv\xE1lida: revisa las tensiones \u0394/Y, corriente y referencia.");
  return { deltaVolts: r.deltaVolts, starVolts: r.starVolts, lineAmps: r.lineAmps, source: r.source };
}
function ratingCompatibility(r, line, connection) {
  const limit = connection === "delta" ? r.deltaVolts : r.starVolts, ok = line <= limit * 1.1;
  return { ok, message: ok ? "Tensi\xF3n compatible con el ejemplo de placa." : `Tensi\xF3n incompatible: ${line} V en ${connection === "delta" ? "\u0394" : "Y"} supera la tensi\xF3n nominal ${limit} V. Desenergiza y revisa la placa.`, windingVolts: connection === "delta" ? line : line / Math.sqrt(3) };
}

// src/data/panelElectrical.ts
var DEFAULT_PANEL_METER_MODEL = { nameplate: { ...EXAMPLE_RATING }, lineVolts: 380, supplyVariationPct: 0, supplyVariationEnabled: false, coilOhms: 240, pilotOhms: 480, windingOhms: 100, motorMode: "induction", frequencyHz: 50, loadTorqueNm: 4, lineOhms: 0.15 };
function supplyLineVolts(model) {
  if (!model.supplyVariationEnabled) return model.lineVolts;
  const seconds = model.simulationSeconds;
  if (seconds === void 0 || !Number.isFinite(seconds)) return model.lineVolts;
  const t = Math.max(0, seconds), amount = Math.max(0, Math.min(1, model.supplyVariationPct ?? 0)) / 100;
  return model.lineVolts * (1 + amount * (0.65 * Math.sin(2 * Math.PI * t / 7.3) + 0.35 * Math.sin(2 * Math.PI * t / 2.1)));
}
var AMMETER_RATED = 10;
var AMMETER_MAX = 20;
var MA_MAX = 0.6;
var jackLimit = (jack) => jack === "ma" ? MA_MAX : AMMETER_MAX;
function panelElectrical(wires, input, relays, timed, model = DEFAULT_PANEL_METER_MODEL, meter2) {
  const parent = new Map(TERMINALS.map((t) => [t.key, t.key]));
  const root = (id) => {
    const p = parent.get(id);
    if (!p) return id;
    if (p !== id) parent.set(id, root(p));
    return parent.get(id);
  };
  const join = (a3, b) => parent.set(root(a3), root(b));
  const faults = faultsOf(input), eff = effectiveWires(wires, faults), series = [...eff.resistive];
  for (const w of eff.ideal) join(w.from.terminalId, w.to.terminalId);
  const contacts = simulationContacts(input, relays, timed), contactR = contactOhms(faults);
  for (const [a3, b] of contacts) {
    const r = contactR.get(pairKey(a3, b));
    if (r === void 0) join(a3, b);
    else series.push({ id: "contact-" + pairKey(a3, b), a: a3, b, ohms: r });
  }
  const ports = {};
  const branches = [], load = (id, a3, b, resistance, reactance = 0) => {
    ports[id] = [a3, b];
    a3 = root(a3);
    b = root(b);
    if (a3 !== b) branches.push({ id, a: a3, b, resistance, reactance });
  };
  const openCoil = new Set(faults.flatMap((f) => f.kind === "coil-open" ? [f.relay] : [])), burnt = new Set(faults.flatMap((f) => f.kind === "pilot-burnt" ? [f.n] : []));
  for (const id of relayIds()) if (!openCoil.has(id)) load(id, `${id}:A1`, `${id}:A2`, model.coilOhms);
  for (let n = 1; n <= 4; n++) if (!burnt.has(n)) load(`pilot-${n}`, `BOTONERAS:PILOTO_${n}`, "BOTONERAS:N", model.pilotOhms);
  for (const sr of series) load(sr.id, sr.a, sr.b, sr.ohms);
  const motor2 = model.motorMode === "induction" ? motorEquivalent(model).impedance : { re: model.windingOhms, im: 0 };
  const openWinding = faults.find((f) => f.kind === "winding-open"), openIndex = openWinding && openWinding.kind === "winding-open" ? ["U", "V", "W"].indexOf(openWinding.phase) : -1;
  for (const p of ["U", "V", "W"]) if (openIndex < 0 || p !== ["U", "V", "W"][openIndex]) load(`winding-${p}`, `BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`, motor2.re, motor2.im);
  if (meter2) load("ammeter", meter2.red, meter2.black, 0.1);
  const energized = input.enabled && input.plugged, control2 = energized && input.breakers.every(Boolean), force = energized && input.forceBreaker;
  const source2 = [
    { id: "FUENTE:F", re: control2 ? controlSourceVolts(faults) : 0, im: 0, family: "control" },
    { id: "FUENTE:N", re: 0, im: 0, family: "control" },
    ...["R", "S", "T"].filter((p) => model.openPhase !== p).map((p) => {
      const i = ["R", "S", "T"].indexOf(p), k = hasFault(faults, "sequence-reversed") ? [0, 2, 1][i] : i, v = force ? supplyLineVolts(model) * (model.phaseScale?.[i] ?? 1) / Math.sqrt(3) : 0;
      return { id: (model.lineOhms ?? 0) > 0 ? `__SUPPLY_${p}` : `FUENTE:${p}`, re: v * Math.cos(-k * 2 * Math.PI / 3), im: v * Math.sin(-k * 2 * Math.PI / 3), family: "force" };
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
  const coupled = model.motorMode === "induction" && connection ? [{ ids: ["winding-U", "winding-V", "winding-W"], ports: ["U", "V", "W"].map((p) => [root(`BORNERA_MOTOR:${p}1`), root(`BORNERA_MOTOR:${p}2`)]), admittance: openIndex >= 0 ? openWindingAdmittance(motorAdmittance(model), openIndex) : motorAdmittance(model) }] : [];
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
    eff.ideal.forEach((w) => edge(w.from.terminalId, w.to.terminalId));
    contacts.forEach(([a3, b], i) => {
      if (i !== index && !contactR.has(pairKey(a3, b))) edge(a3, b);
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
  const wirePhasor = (id) => {
    const wire = wires.find((w) => w.id === id);
    if (!wire) return null;
    const graph2 = /* @__PURE__ */ new Map(), edge = (a3, b) => {
      if (!graph2.has(a3)) graph2.set(a3, /* @__PURE__ */ new Set());
      if (!graph2.has(b)) graph2.set(b, /* @__PURE__ */ new Set());
      graph2.get(a3).add(b);
      graph2.get(b).add(a3);
    };
    eff.ideal.forEach((w) => {
      if (w.id !== id) edge(w.from.terminalId, w.to.terminalId);
    });
    contacts.forEach(([a3, b]) => {
      if (!contactR.has(pairKey(a3, b))) edge(a3, b);
    });
    const region = (id2) => {
      const seen = /* @__PURE__ */ new Set([id2]), q = [id2];
      for (let i = 0; i < q.length; i++) for (const next of graph2.get(q[i]) ?? []) if (!seen.has(next)) {
        seen.add(next);
        q.push(next);
      }
      return seen;
    };
    let side = region(wire.to.terminalId), sign = 1;
    if (side.has(wire.from.terminalId)) return null;
    if (source2.some((s) => side.has(s.id))) {
      side = region(wire.from.terminalId);
      sign = -1;
    }
    return Object.entries(ports).reduce((sum2, [id2, [a3, b]]) => {
      const z = solved.amps[id2] ?? { re: 0, im: 0 }, k = (Number(side.has(a3)) - Number(side.has(b))) * sign;
      return { re: sum2.re + k * z.re, im: sum2.im + k * z.im };
    }, { re: 0, im: 0 });
  };
  const wireClampAmps = (ids) => {
    const readings = ids.map(wirePhasor);
    return readings.some((v) => v === null) ? null : switchingRms(readings.reduce((sum2, z) => ({ re: sum2.re + z.re, im: sum2.im + z.im }), { re: 0, im: 0 }), model);
  };
  return { root, branches, current: current2, voltage, fault, lineAmps, wireClampAmps, clampAmps: (phases) => switchingRms(phases.reduce((v, p) => ({ re: v.re + (linePhasors[p]?.re ?? 0), im: v.im + (linePhasors[p]?.im ?? 0) }), { re: 0, im: 0 }), model), thermalAmps: thermalPoles.map((p) => p.amps), thermalBypassed: thermalPoles.some((p) => p.bypassed), connection, positiveVolts, negativeVolts, unbalancePct: positiveVolts > 1 ? 100 * negativeVolts / positiveVolts : 0 };
}
function panelAmmeterBridge(wires, input, relays, timed, model, meter2) {
  if (!meter2 || ![meter2.red, meter2.black].every((id) => TERMINALS.some((t) => t.key === id))) return null;
  const solved = panelElectrical(wires, input, relays, timed, model, meter2);
  if (solved.fault || solved.current > (meter2.limit ?? AMMETER_MAX) || solved.root(meter2.red) === solved.root(meter2.black)) return null;
  const nodes = /* @__PURE__ */ new Set([solved.root(meter2.red), solved.root(meter2.black)]);
  if (["F", "N", "R", "S", "T"].filter((p) => nodes.has(solved.root(`FUENTE:${p}`))).length > 1) return null;
  return { id: "panel-ammeter-bridge", from: { terminalId: meter2.red }, to: { terminalId: meter2.black }, color: "#bd3035", layer: 0 };
}

// src/data/panelCalibration.ts
var CALIBRATION_KEY = "modo:panel:calibration:v1";
var resistanceKey = (a3, b) => [a3, b].sort().join("|");
var defaultCalibration = () => ({ version: 1, name: "Banco did\xE1ctico \xB7 par\xE1metros de ejemplo", reference: "Sin datos f\xEDsicos del laboratorio", model: { ...DEFAULT_PANEL_METER_MODEL, motorParameters: { ...MOTOR_EQUIVALENT } }, thermal: { ...DEFAULT_THERMAL }, contacts: { pickupMs: 40, dropMs: 25, gapMs: 80 }, resistanceMode: "model", resistances: {} });
var MOTOR_FIELDS = [{ key: "statorOhms", label: "Resistencia del estator (\u03A9)", min: 0.05, max: 1e3 }, { key: "rotorOhms", label: "Resistencia del rotor referida (\u03A9)", min: 0.05, max: 1e3 }, { key: "statorX50", label: "Reactancia del estator a 50 Hz (\u03A9)", min: 0.01, max: 2e3 }, { key: "rotorX50", label: "Reactancia del rotor a 50 Hz (\u03A9)", min: 0.01, max: 2e3 }, { key: "magnetizingX50", label: "Reactancia magnetizante a 50 Hz (\u03A9)", min: 1, max: 1e4 }, { key: "poles", label: "N\xFAmero de polos", min: 2, max: 12 }, { key: "inertia", label: "Inercia (kg\xB7m\xB2)", min: 5e-3, max: 10 }, { key: "friction", label: "Rozamiento (N\xB7m\xB7s/rad)", min: 0, max: 1 }];
var obj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
var num = (v, min, max) => typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
function readCalibration(raw) {
  if (!obj(raw) || raw.version !== 1 || typeof raw.name !== "string" || raw.name.length > 160 || typeof raw.reference !== "string" || raw.reference.length > 2e3 || !obj(raw.model) || !obj(raw.thermal) || !obj(raw.contacts) || !obj(raw.resistances)) throw Error("Perfil incompatible. El guardado anterior se conserva.");
  const d = defaultCalibration(), m = raw.model, t = raw.thermal, c = raw.contacts, p = m.motorParameters;
  if (!obj(p) || MOTOR_FIELDS.some((f) => !num(p[f.key], f.min, f.max)) || !Number.isInteger(p.poles) || Number(p.poles) % 2 !== 0) throw Error("Par\xE1metros del motor inv\xE1lidos.");
  for (const [key, min, max] of [["lineVolts", 24, 690], ["frequencyHz", 20, 70], ["coilOhms", 1, 1e6], ["pilotOhms", 1, 1e6], ["windingOhms", 0.05, 1e5], ["lineOhms", 0, 10], ["loadTorqueNm", 0, 40]]) if (!num(m[key], min, max)) throw Error("Valor fuera de rango: " + key);
  if (m.supplyVariationEnabled !== void 0 && typeof m.supplyVariationEnabled !== "boolean") throw Error("Activaci\xF3n de perturbaci\xF3n de red inv\xE1lida.");
  if (m.supplyVariationPct !== void 0 && !num(m.supplyVariationPct, 0, 1)) throw Error("Variaci\xF3n de red fuera de rango (0\u20131 %).");
  if (m.motorMode !== "induction" || !num(t.amps, 0.1, 200) || ![5, 10, 20, 30].includes(Number(t.tripClass)) || t.enabled !== true || !num(t.coolingSeconds, 10, 3600) || !num(t.resetLevel, 0.1, 0.9) || !num(c.pickupMs, 0, 500) || !num(c.dropMs, 0, 500) || !num(c.gapMs, 20, 1e3) || !["model", "provided"].includes(String(raw.resistanceMode))) throw Error("Protecci\xF3n o tiempos inv\xE1lidos.");
  const resistances = {};
  if (Object.keys(raw.resistances).length > 100) throw Error("Demasiadas resistencias.");
  for (const [key, r] of Object.entries(raw.resistances)) {
    if (!/^[A-Z0-9_:]+\|[A-Z0-9_:]+$/.test(key) || !obj(r) || !num(r.ohms, 1e-3, 1e7) || typeof r.reference !== "string" || !r.reference.trim() || r.reference.length > 1e3) throw Error("Resistencia sin valor o referencia v\xE1lida.");
    resistances[key] = { ohms: Number(r.ohms), reference: r.reference };
  }
  const model = { ...d.model };
  for (const key of ["lineVolts", "frequencyHz", "coilOhms", "pilotOhms", "windingOhms", "lineOhms", "loadTorqueNm", "motorMode"]) model[key] = m[key];
  model.supplyVariationEnabled = m.supplyVariationEnabled === true;
  model.supplyVariationPct = m.supplyVariationPct === void 0 ? d.model.supplyVariationPct : Number(m.supplyVariationPct);
  model.nameplate = m.nameplate === void 0 ? d.model.nameplate : readMotorRating(m.nameplate);
  model.motorParameters = Object.fromEntries(MOTOR_FIELDS.map((f) => [f.key, p[f.key]]));
  return { version: 1, name: raw.name, reference: raw.reference, model, thermal: { enabled: t.enabled, amps: Number(t.amps), tripClass: Number(t.tripClass), coolingSeconds: Number(t.coolingSeconds), resetLevel: Number(t.resetLevel) }, contacts: { pickupMs: Number(c.pickupMs), dropMs: Number(c.dropMs), gapMs: Number(c.gapMs) }, resistanceMode: raw.resistanceMode, resistances };
}

// src/lab/units.ts
function formatReading(kind, value) {
  const abs = Math.abs(value), fixed = (n, d) => (Math.abs(n) < 10 ** -d / 2 ? 0 : n).toFixed(d).replace(".", ",");
  const ranges = kind === "voltage" ? [[6, 1, 3, "V"], [60, 1, 2, "V"], [600, 1, 1, "V"], [1e3, 1, 0, "V"]] : kind === "current" ? [[6, 1, 3, "A"], [10, 1, 2, "A"], [20, 1, 2, "A"]] : [[600, 1, 1, "\u03A9"], [6e3, 1e3, 3, "k\u03A9"], [6e4, 1e3, 2, "k\u03A9"], [6e5, 1e3, 1, "k\u03A9"], [6e6, 1e6, 3, "M\u03A9"], [5e7, 1e6, 2, "M\u03A9"]];
  for (let i = 0; i < ranges.length; i++) {
    const [limit, factor, d, unit] = ranges[i];
    const rounded = Number((abs / factor).toFixed(d)) * factor, last = i === ranges.length - 1;
    if (last ? abs <= limit : rounded < limit) return { text: fixed(value / factor, d), unit };
  }
  return { text: "OL", unit: "" };
}

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

// src/data/panelMeter.ts
function readPanelMeter(wires, input, result, timed, mode, red, black, model = DEFAULT_PANEL_METER_MODEL, redJack = "vo", fuse = {}) {
  const kind = mode === "V" ? "voltage" : mode === "A" ? "current" : mode === "C" ? "continuity" : "resistance", answer = (text, note2, value2) => ({ text, note: note2, value: value2, kind });
  if (mode === "OFF") return answer("", "Selecciona V~, A~, \u03A9 o continuidad.");
  if (mode === "A" && redJack === "vo") return answer("USA A Y COM", "Conecta el cable rojo a A (o a mA \xB5A para corrientes peque\xF1as) y el negro a COM. Abre una rama del circuito e inserta las puntas en sus dos extremos.");
  if (mode === "A" && redJack !== "vo" && fuse[redJack]) return answer("FUSIBLE", "Se quem\xF3 el fusible de esta entrada: " + (redJack === "ma" ? "0,44 A" : "11 A") + ". C\xE1mbialo con el bot\xF3n \xABFusible\xBB junto al mult\xEDmetro para volver a medir corriente.");
  if (mode !== "A" && redJack !== "vo") return answer("USA V \u03A9", "Vuelve a conectar el cable rojo a V \u03A9 para medir tensi\xF3n, resistencia o continuidad.");
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
  const faults = faultsOf(input), eff = effectiveWires(wires, faults), contactR = contactOhms(faults);
  const edgeList = [...eff.ideal.map((w) => ({ a: w.from.terminalId, b: w.to.terminalId, r: 0.01 })), ...eff.resistive.map((w) => ({ a: w.a, b: w.b, r: 0.01 + w.ohms })), ...contacts.map(([a3, b]) => ({ a: a3, b, r: contactR.get(pairKey(a3, b)) ?? 0.02 }))], edges = edgeList.map((e) => [e.a, e.b]);
  edges.forEach(([a3, b]) => join(a3, b));
  if (mode === "R" || mode === "C") {
    if (energized) return answer("DESENERGIZA", "Desconecta el enchufe virtual antes de medir \u03A9 o continuidad, tambi\xE9n si los interruptores est\xE1n abiertos.");
    if (root(red) === root(black)) {
      const branches = edgeList.map((e, i) => ({ id: String(i), a: e.a, b: e.b, resistance: e.r })).filter((b) => root(b.a) === root(red)), r = red === black ? 0 : (() => {
        const solved2 = solveDC(branches, { [red]: 1, [black]: 0 });
        return solved2.fault ? 0 : 1 / Math.abs(branches.reduce((sum2, b) => b.a === red ? sum2 + (solved2.amps[b.id] ?? 0) : b.b === red ? sum2 - (solved2.amps[b.id] ?? 0) : sum2, 0));
      })();
      const value2 = 0.4 + (Number.isFinite(r) ? r : 0);
      return answer(`${value2.toFixed(1).replace(".", ",")} \u03A9`, "Modelo de prueba: 0,2 \u03A9 por punta, 0,01 \u03A9 por cable y 0,02 \u03A9 por contacto cerrado; valores did\xE1cticos.", value2);
    }
  }
  const openCoil = new Set(faults.flatMap((f) => f.kind === "coil-open" ? [f.relay] : [])), openWinding = new Set(faults.flatMap((f) => f.kind === "winding-open" ? [f.phase] : [])), burnt = new Set(faults.flatMap((f) => f.kind === "pilot-burnt" ? [f.n] : []));
  const loadDefs = [...["U", "V", "W"].filter((p) => !openWinding.has(p)).map((p) => ({ a: `BORNERA_MOTOR:${p}1`, b: `BORNERA_MOTOR:${p}2`, def: "winding" })), ...relayIds().filter((id) => !openCoil.has(id)).map((id) => ({ a: `${id}:A1`, b: `${id}:A2`, def: "coil" })), ...[1, 2, 3, 4].filter((n) => !burnt.has(n)).map((n) => ({ a: `BOTONERAS:PILOTO_${n}`, b: "BOTONERAS:N", def: "pilot" })), ...faults.flatMap((f) => f.kind === "insulation" ? [{ a: f.terminal, b: "BORNERA_MOTOR:TP", def: f.ohms, fixed: f.ohms }] : [])];
  const loads = loadDefs.map((d) => [d.a, d.b]), loadGraph = /* @__PURE__ */ new Map();
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
      const def = loadDefs[i], datum = model.providedResistances?.[resistanceKey(a3, b)], ohms = def.fixed !== void 0 ? def.fixed : model.resistanceMode === "model" ? datum?.ohms ?? (def.def === "winding" ? (model.motorParameters ?? MOTOR_EQUIVALENT).statorOhms : def.def === "coil" ? model.coilOhms : model.pilotOhms) : datum?.ohms;
      if (ohms === void 0) {
        if (reachable(red).has(root(a3)) || reachable(red).has(root(b))) unknown.push(a3 + "\u2013" + b);
        return [];
      }
      return [{ id: "load-" + i, a: a3, b, resistance: ohms }];
    });
    if (unknown.length) return answer("SIN DATOS", "Hay resistencias pendientes de referencia en este circuito. A\xEDsla el componente o completa los datos aportados.");
    const branches = [...edgeList.map((e, i) => ({ id: "path-" + i, a: e.a, b: e.b, resistance: e.r })), ...dcLoads], solved2 = solveDC(branches, { [red]: 1, [black]: 0 });
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
    if (solved.current > jackLimit(redJack)) return answer("SOBRECARGA", redJack === "ma" ? "La entrada mA \xB5A supera 600 mA: se quemar\xEDa su fusible. Revisa que el tester est\xE9 en serie y no entre dos fuentes." : "La entrada A supera 20 A: se quemar\xEDa su fusible de 11 A. Revisa que el tester est\xE9 en serie y no entre dos fuentes.");
    if (redJack === "ma") {
      const ma = solved.current * 1e3, t = ma.toFixed(ma < 40 ? 2 : 1).replace(".", ",");
      return answer(`${t} mA`, note + " El tester cierra la rama con una carga de 0,1 \u03A9.", solved.current);
    }
    const shown2 = formatReading("current", solved.current);
    return answer(`${shown2.text} ${shown2.unit}`, note + " El tester cierra la rama con una carga de 0,1 \u03A9.", solved.current);
  }
  const value = solved.voltage(red, black);
  if (value === null) return answer("SIN REFERENCIA", "Punto flotante o fuentes aisladas entre s\xED. Usa dos puntos de mando o dos puntos de fuerza; TP no es el retorno de medida.");
  const shown = formatReading("voltage", value);
  return answer(`${shown.text} ${shown.unit}`, note, value);
}
function meterHazard(input, result, mode, red, black, redJack, reading) {
  const energized = input.enabled && input.plugged, placed = !!red && !!black;
  if (mode === "OFF") return null;
  if (result.fault && energized) return { level: "danger", title: "Cortocircuito en el banco", text: "Hay una falla en el montaje. Abre FUERZA y CONTROL, desenchufa y revisa los cables antes de medir." };
  if ((mode === "R" || mode === "C") && energized && placed) return { level: "danger", title: "No midas \u03A9 ni continuidad con tensi\xF3n", text: "El circuito est\xE1 energizado: en un tester real esto quema el fusible o da\xF1a el instrumento. Desenchufa y abre FUERZA y CONTROL antes de medir." };
  if (mode !== "A" && redJack !== "vo" && placed && energized) return { level: "danger", title: redJack === "ma" ? "Cable rojo en la entrada mA \xB5A" : "Cable rojo en la entrada A", text: "Las entradas de corriente son un cortocircuito casi directo: queman su fusible (" + (redJack === "ma" ? "0,44 A" : "11 A") + "). Pasa el cable rojo a V \u03A9 para medir tensi\xF3n, \u03A9 o continuidad." };
  if (mode === "A" && redJack === "vo" && placed && energized) return { level: "warn", title: "Funci\xF3n A con el cable rojo en V \u03A9", text: "Para medir corriente el rojo va en A y el tester en serie. As\xED no mide y puede inducir errores." };
  if (mode === "A" && redJack !== "vo" && placed && energized && reading.text === "ABRE LA RAMA") return { level: "warn", title: "A\xFAn no pasa corriente por el tester", text: "Para medir corriente, la corriente tiene que pasar por el tester. Aqu\xED las puntas est\xE1n unidas por un cable o contacto y la corriente sigue su camino sin entrar. Retira un extremo del cable y conecta el tester en ese corte." };
  if (mode === "A" && redJack !== "vo" && placed && energized && reading.text === "SOBRECARGA") return { level: "danger", title: "Haz que la corriente pase por el tester", text: "Entre dos puntos con tensi\xF3n el tester act\xFAa como un cortocircuito. Desenchufa, abre una rama del circuito y conecta el tester en ese hueco para que la corriente lo atraviese." };
  if (mode === "A" && redJack === "a10" && placed && energized && typeof reading.value === "number" && reading.value > AMMETER_RATED) return { level: "warn", title: "Sobre 10 A en la entrada A", text: "El tester aguanta hasta 20 A solo 30 segundos. Anota la lectura r\xE1pido y vuelve a abrir la rama; sobre 20 A se quema el fusible." };
  if (mode === "V" && placed && energized && typeof reading.value === "number" && Math.abs(reading.value) > 50) return { level: "warn", title: "Tensi\xF3n peligrosa", text: "M\xE1s de 50 V: riesgo de choque el\xE9ctrico. Usa puntas aisladas, una sola mano y no toques partes met\xE1licas." };
  return null;
}

// src/data/measurementProfiles.ts
var ACTIVITY_PROFILES = {
  manual: { title: "Circuito de la gu\xEDa \xB7 manual", detail: "KM1 principal, KM3 estrella y KM2 tri\xE1ngulo. S1 inicia, S3 cambia y S2 detiene; equivalen a SB2, SB3 y SB1 del profesor." },
  matias: { title: "Proyecto de Mat\xEDas \xB7 autom\xE1tico", detail: "45 cables originales. KT1 es principal, KM1 estrella y KM2 tri\xE1ngulo. S1 inicia y el temporizador cambia la conexi\xF3n. Para estudiar, el retardo se prepara en 60 s." },
  twoContactors: { title: "Panel de dos contactores \xB7 autom\xE1tico", detail: "40 cables: los 37 del montaje recibido m\xE1s los 3 del piloto rojo. KT1 (temporizador neum\xE1tico) es el contactor principal: por \xE9l entran R, S y T; KM1 (contactor + rel\xE9 t\xE9rmico) hace el tri\xE1ngulo y KM2 (contactor trif\xE1sico) hace la estrella. S1 inicia, S2 detiene y S3 no interviene. P1 indica estrella, P4 tri\xE1ngulo, P3 disparo y P2 (rojo) motor detenido." }
};
function activityRoles(profile) {
  return {
    main: profile === "manual" ? "CONTACTOR_TERMICO" : "TEMPORIZADOR_1",
    star: profile === "manual" ? "CONTACTOR_TRIFASICO_3" : profile === "twoContactors" ? "CONTACTOR_TRIFASICO" : "CONTACTOR_TERMICO",
    delta: profile === "twoContactors" ? "CONTACTOR_TERMICO" : "CONTACTOR_TRIFASICO",
    start: profile === "twoContactors" ? "S1" : "S1",
    automatic: profile !== "manual",
    restPilot: true
  };
}

// src/data/activityTrace.ts
function validActionProof(v) {
  const p = v;
  return !!p && p.version === 1 && Number.isInteger(p.eventId) && p.eventId > 0 && Number.isFinite(p.seconds) && p.seconds >= 0 && ["press", "test", "thermalReset", "timer"].includes(p.kind) && (p.control === void 0 || typeof p.control === "string" && p.control.length < 80) && typeof p.from === "string" && p.from.length < 50 && typeof p.to === "string" && p.to.length < 50;
}
var validConditions = (v) => {
  const c = v;
  return !!c && [c.simulationSeconds, c.lineVolts, c.frequencyHz, c.relayAmps].every(Number.isFinite) && c.simulationSeconds >= 0 && c.lineVolts > 0 && c.frequencyHz > 0 && c.relayAmps > 0 && typeof c.profile === "string" && c.profile.length <= 160 && [null, "star", "delta"].includes(c.connection);
};

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

// src/data/practice.ts
var BANANA_COLOR = "#145650";
var CLASS_DIAGRAMS = [1, 2, 3].map((n) => ({ id: `clase-${n}`, name: `Fotograf\xEDa de clase ${n} \xB7 referencia sin validar`, src: `/diagrams/clase-${n}.jpg`, origin: "class_photo" }));
var emptyPractice = () => ({ version: 2, title: "Mi pr\xE1ctica INACAP", wires: [], diagram: CLASS_DIAGRAMS[0], steps: [], mode: "free", stepIndex: 0 });

// src/data/meterActivity.ts
var isForceTerminal = (id) => /^FUENTE:[RST]$|^BORNERA_MOTOR:|:[LT][123]$|:TP/.test(id);
var isForceWire = (w) => isForceTerminal(w.from.terminalId) || isForceTerminal(w.to.terminalId);
function activityDocument(profile, scope = "full") {
  const wires = [];
  if (profile !== "matias") for (const [from, to] of (profile === "twoContactors" ? LESSONS.estrellaDosContactores : LESSONS.estrellaManual).pairs) wires.push({ id: crypto.randomUUID(), from: { terminalId: from }, to: { terminalId: to }, color: BANANA_COLOR, route: { sag: 130 }, layer: wires.length + 1 });
  else wires.push(...structuredClone(activity2Matias_default.wires));
  return { ...emptyPractice(), title: `Actividad 2 \xB7 mediciones \xB7 ${profile === "twoContactors" ? "panel de dos contactores" : profile === "manual" ? "gu\xEDa manual" : "Mat\xEDas"}`, wires: scope === "control" ? wires.filter((w) => !isForceWire(w)) : wires, diagram: profile === "twoContactors" ? LESSONS.estrellaDosContactores.diagram : profile === "manual" ? LESSONS.estrellaManual.diagram : emptyPractice().diagram };
}
function matchesActivity(profile, wires, scope = "full") {
  const reference = profile !== "matias" ? (profile === "twoContactors" ? LESSONS.estrellaDosContactores : LESSONS.estrellaManual).pairs.map(([from, to]) => ({ from: { terminalId: from }, to: { terminalId: to } })) : activity2Matias_default.wires;
  const ids = [.../* @__PURE__ */ new Set([...TERMINALS.map((t) => t.key), ...reference.flatMap((w) => [w.from.terminalId, w.to.terminalId])])], known = new Set(ids);
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
  return partition(wires) === partition(reference);
}
var meter = (id, title, page, point2, stage, mode, red, black, why, table, expected) => ({ id, title, page, point: point2, stage, mode, red, black, why, table, expected, kind: "meter", task: `Selecciona ${mode === "V" ? "V~" : mode === "R" ? "\u03A9" : "continuidad"}. Coloca las puntas en los dos bornes indicados y escribe lo que lees.` });
var ACTIVITY_STEPS = [
  meter("thermal", "Continuidad del t\xE9rmico", 4, "4 y 11", "cold", "C", "CONTACTOR_TERMICO:95", "CONTACTOR_TERMICO:96", "Antes de energizar, comprueba el contacto NC 95\u201396 en reposo. El tono y la baja resistencia indican un camino cerrado.", void 0, "low"),
  meter("stop", "Continuidad del paro", 4, "4", "cold", "C", "BOTONERAS:S2:1", "BOTONERAS:S2:2", "SB1 del dibujo es S2 en el banco. Su par NC 1\u20132 est\xE1 cerrado en reposo.", void 0, "low"),
  meter("start-open", "Reconocer un auxiliar NA libre", 4, "Preparaci\xF3n adicional", "cold", "C", "CONTACTOR_TRIFASICO:63", "CONTACTOR_TRIFASICO:64", "El auxiliar NA de reserva 63\u201364 de KM2 est\xE1 sin cablear en ambos montajes y abierto en reposo. As\xED evitas confundir el contacto abierto con rutas paralelas del circuito: OL no significa un fallo del instrumento.", void 0, "open"),
  meter("contact-ohms", "Resistencia de un contacto cerrado", 4, "Preparaci\xF3n adicional", "cold", "R", "CONTACTOR_TERMICO:95", "CONTACTOR_TERMICO:96", "Pr\xE1ctica adicional de \u03A9: la gu\xEDa pide continuidad, no una tabla de resistencias. El modelo incluye 0,2 \u03A9 por punta y 0,02 \u03A9 por contacto; no es una resistencia real de placa.", void 0, "low"),
  meter("control-volts", "Voltaje de alimentaci\xF3n del mando", 5, "5", "control", "V", "FUENTE:F", "FUENTE:N", "En el banco virtual el secundario F\u2013N es de 24 V~. La gu\xEDa usa alimentaci\xF3n monof\xE1sica; no confundas estos 24 V did\xE1cticos con su red monof\xE1sica."),
  { id: "control-rest", title: "Mando \xB7 piloto de motor detenido", page: 6, point: "6", stage: "control-rest", kind: "action", why: "La gu\xEDa comprueba primero el circuito de mando, sin habilitar fuerza. El piloto rojo P2 debe indicar reposo.", task: "Mant\xE9n FUERZA en OFF. Con el mando alimentado y sin pulsar marcha, observa P2 rojo encendido." },
  { id: "control-star", title: "Mando \xB7 orden de partir en estrella", page: 6, point: "7", stage: "control-star", kind: "action", why: "En el esquema del profesor, SB2 activa KM1 y KM3. Se apaga el rojo y se enciende el verde de estrella; con FUERZA en OFF el motor a\xFAn no gira.", task: "Sin encender FUERZA (d\xE9jala en OFF), pulsa y suelta S1 (SB2 del profesor). Comprueba que las bobinas de estrella reciben energ\xEDa y que se enciende el piloto verde de estrella." },
  { id: "control-delta", title: "Mando \xB7 orden de conexi\xF3n tri\xE1ngulo", page: 7, point: "8", stage: "control-delta", kind: "action", why: "En la gu\xEDa, KM1 se mantiene, KM3 cae y entra KM2. La se\xF1al pasa del verde de estrella al de tri\xE1ngulo, todav\xEDa sin fuerza.", task: "En el manual pulsa S3 (SB3). En la variante opcional de Mat\xEDas espera el temporizador. Mant\xE9n FUERZA en OFF." },
  { id: "control-trip", title: "Mando \xB7 prueba TEST del t\xE9rmico", page: 7, point: "9", stage: "control-trip", kind: "action", why: "El profesor comprueba el disparo antes de montar fuerza: caen las bobinas, se apagan los verdes y se encienden amarillo y rojo.", task: "Pulsa TEST (bot\xF3n de los controles). Verifica que las bobinas quedan sin energ\xEDa y que se encienden los dos pilotos de aviso." },
  { id: "control-reset", title: "Mando \xB7 RESET y vuelta al reposo", page: 7, point: "10", stage: "control-reset", kind: "action", why: "RESET apaga el amarillo y mantiene el rojo. Rearmar no es una nueva orden de marcha.", task: "Pulsa RESET (el mismo bot\xF3n de los controles, ahora dice \xABRESET\xBB). Comprueba que solo el piloto rojo queda encendido y que las bobinas siguen sin energ\xEDa." },
  meter("force-continuity", "Fuerza \xB7 comprobar continuidad antes de energizar", 8, "11", "cold", "C", "FUENTE:R", "CONTACTOR_TERMICO:L1", "Con las alimentaciones desconectadas, comprueba el cable desde R a la entrada L1 del contactor principal. No confundas este cable con el polo interno L1\u2013T1.", void 0, "low"),
  ...[["R", "S"], ["R", "T"], ["S", "T"]].map(([a3, b]) => meter(`line-${a3}${b}`, `Voltaje entre fases ${a3}\u2013${b}`, 8, "12", "supply", "V", `FUENTE:${a3}`, `FUENTE:${b}`, "Las dos puntas van entre fases, en paralelo. No uses TP ni el N del mando como referencia de fuerza. El modelo parte de 380 V entre fases.", "Tabla 1")),
  { id: "powered-rest", title: "Fuerza y mando \xB7 motor detenido", page: 8, point: "13", stage: "powered-rest", kind: "action", why: "Despu\xE9s de medir la alimentaci\xF3n trif\xE1sica, el profesor vuelve a habilitar el mando y verifica el piloto rojo antes de arrancar.", task: "Mant\xE9n FUERZA en ON, vuelve a poner ambos CONTROL en ON y verifica P2 rojo y el motor detenido." },
  { id: "start-star", title: "Poner el motor en estrella", page: 8, point: "14", stage: "star", kind: "action", why: "Reconoce primero qu\xE9 contactores act\xFAan. La lectura siguiente solo es v\xE1lida cuando el motor est\xE1 en estrella.", task: "Conecta la corriente virtual y pon FUERZA y los dos CONTROL en ON. Pulsa y suelta S1 (SB2 en la gu\xEDa)." },
  ...["U", "V", "W"].map((p) => meter(`star-${p}`, `Estrella \xB7 devanado ${p}1\u2013${p}2`, 9, "15", "star", "V", `BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`, "Mide entre los dos extremos de una misma bobina, no entre dos bornes superiores. En el modelo equilibrado esperas V de l\xEDnea / \u221A3.", "Tabla 3")),
  ...["R", "S", "T"].map((phase) => ({ id: `star-current-${phase}`, title: `Estrella \xB7 corriente de l\xEDnea ${phase}`, page: 9, point: "16", stage: "star", kind: "clamp", phase, table: "Tabla 4", why: "La gu\xEDa pide amper\xEDmetro de tenazas: abraza un solo conductor de entrada, antes de sus derivaciones. No conectes un mult\xEDmetro en A entre fases.", task: "En la pinza virtual, elige el conductor de entrada solicitado y registra su lectura." })),
  { id: "change-delta", title: "Cambiar a tri\xE1ngulo", page: 9, point: "17", stage: "delta", kind: "action", why: "La gu\xEDa manual mantiene KM1, desactiva KM3 y activa KM2. En Mat\xEDas, KT1 permanece y el temporizador cambia de KM1 a KM2.", task: "En el montaje manual pulsa y suelta S3 (SB3). En Mat\xEDas, espera a que el temporizador cambie solo (puedes bajarlo a 2 segundos en \xABControles\xBB)." },
  ...["U", "V", "W"].map((p) => meter(`delta-${p}`, `Tri\xE1ngulo \xB7 devanado ${p}1\u2013${p}2`, 10, "18", "delta", "V", `BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`, "Conserva la medici\xF3n entre los extremos de la misma bobina. En tri\xE1ngulo cada devanado queda entre dos fases y recibe la tensi\xF3n de l\xEDnea.", "Tabla 5")),
  ...["R", "S", "T"].map((phase) => ({ id: `delta-current-${phase}`, title: `Tri\xE1ngulo \xB7 corriente de l\xEDnea ${phase}`, page: 10, point: "19", stage: "delta", kind: "clamp", phase, table: "Tabla 6", why: "Vuelve a medir el mismo conductor de entrada, antes de las bifurcaciones. Compara con la corriente que registraste en estrella.", task: "Selecciona una sola fase en la pinza virtual y anota la corriente." })),
  { id: "compare", title: "Comparar estrella y tri\xE1ngulo", page: 10, point: "20", stage: "delta", kind: "compare", why: "Usa tus tablas para explicar c\xF3mo cambia la tensi\xF3n de cada bobina y la corriente de entrada. El motor de inducci\xF3n cambia su corriente con velocidad, carga y conexi\xF3n. Registra en qu\xE9 condici\xF3n hiciste cada medici\xF3n.", task: "Mira tus tablas: en estrella cada bobina recibe unos 220 V y en tri\xE1ngulo unos 380 V. Anota cu\xE1ntas veces mayor es la tensi\xF3n (V\u0394 / VY) y cu\xE1ntas veces mayor es la corriente (I\u0394 / IY). En t\xE9rminos t\xE9cnicos: VY \u2248 VL/\u221A3 y V\u0394 \u2248 VL. La relaci\xF3n 3 solo corresponde a la misma impedancia y tensi\xF3n de red; no es universal entre dos estados de marcha." },
  { id: "overload", title: "Comprobar la sobrecarga virtual", page: 11, point: "21", stage: "trip", kind: "action", why: "TEST abre 95\u201396, corta el mando y debe detener el motor. El contacto 97\u201398 se\xF1aliza el disparo.", task: "Activa TEST del t\xE9rmico y observa la parada y el aviso de sobrecarga." },
  { id: "reset", title: "Rearmar el rel\xE9 t\xE9rmico", page: 12, point: "22", stage: "reset", kind: "action", why: "RESET elimina el estado de disparo, pero no debe arrancar el motor por s\xED mismo.", task: "Rearma el t\xE9rmico y verifica que el motor permanezca detenido." },
  { id: "shutdown", title: "Desenergizar el banco", page: 12, point: "23\u201324", stage: "off", kind: "action", why: "Guarda los resultados para revisi\xF3n docente y deja el banco sin alimentaci\xF3n. La revisi\xF3n del profesor se registra por separado en el cuaderno de entrega.", task: "Pon FUERZA y ambos CONTROL en OFF y desconecta el enchufe virtual. Descarga tus resultados en la pesta\xF1a Resultados." },
  { id: "dismantle", title: "Desmontar y ordenar el panel", page: 12, point: "25", stage: "off", kind: "action", why: "La gu\xEDa termina desconectando los elementos. Tus mediciones se conservan al retirar los cables. Deshacer recupera el circuito.", task: "Con el banco sin alimentaci\xF3n, retira todos los cables o usa \xABDesmontar circuito\xBB. Despu\xE9s comprueba el cierre." }
];
function activityStep(profile, index) {
  const step = ACTIVITY_STEPS[index];
  if (profile === "twoContactors") {
    const changes = {
      "start-open": { why: "El auxiliar NA 63\u201364 de KM2, el contactor de estrella, queda libre en los 40 cables de este montaje y est\xE1 abierto en reposo. Comprueba OL sin confundirlo con una falla del instrumento." },
      "control-rest": { title: "Mando \xB7 reposo del montaje de dos contactores", why: "KT1, KM1 y KM2 est\xE1n desactivados: los contactos NC 81\u201382 de KM1 y KM2 dejan pasar la fase al piloto rojo P2. En reposo solo P2 est\xE1 encendido.", task: "Alimenta solo el mando, con FUERZA en OFF. Comprueba que las bobinas no tienen energ\xEDa y que solo la l\xE1mpara roja P2 est\xE1 encendida." },
      "control-star": { why: "S1 alimenta y retiene KT1, el contactor principal. El contacto temporizado KT1 55\u201356 da la orden a KM2, que conecta estrella; P1 indica esa orden. Con FUERZA en OFF el motor todav\xEDa no gira.", task: "Con FUERZA en OFF, pulsa y suelta S1. Comprueba que KT1 y KM2 reciben energ\xEDa, que KM1 no, que P1 (verde) se enciende y que P2 (rojo) se apaga." },
      "control-delta": { why: "KT1 se mantiene y el retardo KT1 abre estrella KM2 y ordena tri\xE1ngulo KM1. P1 se apaga y P4 se enciende; FUERZA sigue en OFF.", task: "Espera a que el temporizador cambie solo (o b\xE1jalo a 2 segundos en \xABControles\xBB). Comprueba que KT1 y KM1 reciben energ\xEDa, que KM2 no y que P4 (verde de tri\xE1ngulo) se enciende." },
      "control-trip": { why: "TEST abre 95\u201396 y desactiva las bobinas. El contacto 97\u201398 enciende P3 amarillo y, con KM1 y KM2 en reposo, vuelve a encenderse el rojo P2: la gu\xEDa pide las dos l\xE1mparas.", task: "Pulsa TEST: deben caer KT1, KM1 y KM2, apagarse P1/P4 y encenderse P3 amarillo y P2 rojo." },
      "control-reset": { why: "RESET rearma el t\xE9rmico y apaga P3. No da marcha: queda encendido solo el rojo P2 de reposo.", task: "Pulsa RESET en los controles. Comprueba que las bobinas no tienen energ\xEDa y que solo queda encendida la l\xE1mpara roja P2." },
      "force-continuity": { black: "TEMPORIZADOR_1:L1", why: "El cable de entrada R llega a L1 de KT1, el contactor principal. Comprueba ese conductor sin confundirlo con el polo interno L1\u2013T1.", task: "Desenchufa y pon FUERZA y los dos CONTROL en OFF. Mide continuidad entre R y KT1:L1." },
      "powered-rest": { why: "Con las alimentaciones habilitadas, el montaje permanece detenido hasta dar marcha con S1. Solo est\xE1 encendido el piloto rojo P2 (motor detenido).", task: "Pon FUERZA y ambos CONTROL en ON, sin pulsar marcha. Comprueba que el motor sigue detenido, que las bobinas no tienen energ\xEDa y que solo P2 rojo est\xE1 encendido." },
      "start-star": { why: "En este montaje S1 inicia KT1 y KM2 (estrella). KM1 permanece desactivado hasta el cambio temporizado.", task: "Conecta la corriente y pon FUERZA y los dos CONTROL en ON. Pulsa y suelta S1; comprueba la retenci\xF3n en estrella." },
      "change-delta": { why: "El retardo KT1 mantiene KT1, desactiva KM2 (estrella) y activa KM1 (tri\xE1ngulo).", task: "Espera a que el temporizador cambie solo de estrella a tri\xE1ngulo (o b\xE1jalo a 2 segundos en \xABControles\xBB). Comprueba que estrella queda sin energ\xEDa y tri\xE1ngulo con energ\xEDa." },
      "overload": { why: "TEST abre 95\u201396 y corta el mando. P3 se\xF1aliza el disparo mediante 97\u201398 y P2 rojo indica motor detenido.", task: "Desde tri\xE1ngulo, pulsa TEST y comprueba la parada y que se encienden P3 amarillo y P2 rojo." }
    };
    return { ...step, ...changes[step.id] };
  }
  if (step.id !== "force-continuity") return step;
  return { ...step, task: "Desenchufa y pon ambos CONTROL y FUERZA en OFF. " + step.task, ...profile === "matias" ? { black: "TEMPORIZADOR_1:L1", why: "En el proyecto opcional de Mat\xEDas el conjunto KT1 es el contactor principal. Desconecta las alimentaciones y comprueba el cable R \u2192 KT1:L1." } : {} };
}
function checkActivity(step, c) {
  const fail = (message) => ({ ready: false, message });
  if (step.id === "dismantle") {
    if (c.input.plugged || c.input.forceBreaker || c.input.breakers.some(Boolean)) return fail("Desconecta toda la alimentaci\xF3n antes de desmontar.");
    return c.wires.length ? fail("Retira los cables para dejar el panel desmontado. Tus resultados se conservan.") : { ready: true, message: "Panel sin alimentaci\xF3n y sin cables; cierre virtual comprobado." };
  }
  const has = (x, y) => c.wires.some((w) => {
    const p = [w.from.terminalId, w.to.terminalId];
    return p.includes(x) && p.includes(y);
  });
  const legacy = c.profile === "twoContactors" && (has("BORNERA_MOTOR:U1", "CONTACTOR_TERMICO:L1") || has("BOTONERAS:S1:3", "TEMPORIZADOR_1:13") || c.wires.length >= 37 && !c.wires.some((w) => [w.from.terminalId, w.to.terminalId].includes("BOTONERAS:PILOTO_2")));
  if (!matchesActivity(c.profile, c.wires, ACTIVITY_STEPS.findIndex((s) => s.id === step.id) < 10 ? "control" : "full") && legacy) return fail("Este montaje se guard\xF3 con el cableado anterior de dos contactores. Ahora sigue la gu\xEDa del profesor y tiene 40 cables: se agrega el piloto rojo y KM2 toma L1, L2 y L3 de KM1. Vuelve al inicio de la lecci\xF3n y pulsa \xABContinuar\xBB: carga el cableado nuevo y conserva tus mediciones.");
  if (!matchesActivity(c.profile, c.wires, ACTIVITY_STEPS.findIndex((s) => s.id === step.id) < 10 ? "control" : "full")) return fail(c.profile === "manual" && c.wires.some((w) => [w.from.terminalId, w.to.terminalId].includes("BOTONERAS:S2:2") && [w.from.terminalId, w.to.terminalId].includes("BOTONERAS:S3:3")) ? "Referencia antigua: la entrada NA S3:3 debe alimentarse desde S1:4, despu\xE9s de la partida (figura 1, p\xE1g. 5). Desenergiza el banco virtual y corrige ese cable, o prepara el montaje actualizado; tus mediciones se conservan." : "El cableado ya no coincide con la pr\xE1ctica elegida. Revisa las conexiones; Deshacer conserva tu trabajo anterior.");
  const energized = c.input.enabled && c.input.plugged;
  if (["star", "delta"].includes(step.stage) && c.model.nameplate && !ratingCompatibility(c.model.nameplate, c.model.lineVolts, step.stage === "delta" ? "delta" : "star").ok) return fail(ratingCompatibility(c.model.nameplate, c.model.lineVolts, step.stage === "delta" ? "delta" : "star").message);
  if (step.stage === "cold" && energized) return fail("Desconecta el enchufe virtual antes de medir continuidad o resistencia. Abrir solo los interruptores no basta.");
  if (step.stage.startsWith("control") && (!energized || !c.input.breakers.every(Boolean))) return fail("Conecta la corriente virtual y pon CONTROL 1 y CONTROL 2 en ON.");
  if (step.stage.startsWith("control") && c.input.forceBreaker) return fail("En esta parte el profesor comprueba solo el mando: pon FUERZA en OFF.");
  if (step.id === "force-continuity" && (c.input.forceBreaker || c.input.breakers.some(Boolean))) return fail("Desenchufa y pon FUERZA y los dos CONTROL en OFF antes de comprobar fuerza.");
  const pilots = (values) => c.result.pilots.every((v, i) => v === values[i]), allOff = Object.values(c.result.relays).every((v) => !v), roles = activityRoles(c.profile), { main, star, delta } = roles;
  if (["control-rest", "control-reset", "powered-rest"].includes(step.stage) && (!allOff || c.input.thermalTripped || !pilots([false, roles.restPilot, false, false]))) return fail(roles.restPilot ? "Se esperan bobinas desactivadas, t\xE9rmico rearmado y solo el piloto rojo encendido." : "Se esperan bobinas desactivadas y pilotos apagados. P2 no est\xE1 cableado en este montaje.");
  if (step.stage === "powered-rest" && (!energized || !c.input.forceBreaker || !c.input.breakers.every(Boolean))) return fail("Pon FUERZA y ambos CONTROL en ON para verificar el reposo antes de arrancar.");
  if (step.stage === "control-star" && (!c.result.relays[main] || !c.result.relays[star] || c.result.relays[delta] || !pilots([true, false, false, false]))) return fail(`Pulsa ${roles.start}: deben entrar el conjunto principal y estrella, con P1 encendido.`);
  if (step.stage === "control-delta" && (!c.result.relays[main] || !c.result.relays[delta] || c.result.relays[star] || !pilots([false, false, false, true]))) return fail("Se espera principal + tri\xE1ngulo, con estrella desactivada y su verde apagado.");
  if (step.stage === "control-trip" && (!c.input.thermalTripped || !allOff || !pilots([false, roles.restPilot, true, false]))) return fail(roles.restPilot ? "Activa TEST y comprueba bobinas desactivadas, rojo y amarillo encendidos." : "Activa TEST: bobinas desactivadas y solo P3 amarillo encendido.");
  if (["trip", "reset"].includes(step.stage) && (!energized || !c.input.forceBreaker || !c.input.breakers.every(Boolean))) return fail("Mant\xE9n mando y fuerza alimentados para comprobar el t\xE9rmico. Cortar la alimentaci\xF3n no sustituye TEST o RESET.");
  if (step.kind === "action" && c.input.pressed.length) return fail("Suelta los pulsadores antes de comprobar el estado.");
  if (["supply", "star", "delta"].includes(step.stage) && (!energized || !c.input.forceBreaker)) return fail("Conecta la corriente virtual y pon FUERZA en ON.");
  if (step.stage === "supply" && c.result.motor.status !== "off") return fail("Det\xE9n el motor con S2 antes de comprobar la alimentaci\xF3n.");
  if ((step.stage === "star" || step.stage === "delta") && (c.input.thermalTripped || !c.input.breakers.every(Boolean) || c.result.motor.status !== "running" || c.result.motor.connection !== step.stage)) return fail(step.stage === "star" ? `El motor debe estar en estrella. Si ya cambi\xF3, det\xE9n con S2 y vuelve a iniciar con ${roles.start}.` : roles.automatic ? "El motor debe estar en tri\xE1ngulo. Espera el cambio autom\xE1tico del temporizador." : "El motor debe estar en tri\xE1ngulo. Pulsa S3 para cambiar desde estrella.");
  if (step.stage === "trip" && (!c.input.thermalTripped || !allOff || !pilots([false, roles.restPilot, true, false]) || c.result.motor.status !== "off")) return fail(roles.restPilot ? "Activa TEST: el t\xE9rmico debe estar disparado y el motor detenido." : "Activa TEST: bobinas y motor detenidos, con solamente P3 encendido.");
  if (step.stage === "reset" && (c.input.thermalTripped || !allOff || !pilots([false, roles.restPilot, false, false]) || c.result.motor.status !== "off")) return fail("Rearma el t\xE9rmico y deja el motor detenido.");
  if (step.stage === "off" && (c.input.plugged || c.input.forceBreaker || c.input.breakers.some(Boolean))) return fail("Pon FUERZA y los dos CONTROL en OFF y desenchufa la corriente virtual.");
  if (c.result.fault) return fail("La simulaci\xF3n informa una falla. Revisa el montaje antes de registrar.");
  if (step.kind === "meter") {
    if (c.mode !== step.mode) return fail(`Selecciona ${step.mode === "V" ? "V~" : step.mode === "R" ? "\u03A9" : "continuidad"} en el selector del mult\xEDmetro.`);
    if (c.redJack !== "vo") return fail("Conecta el cable rojo a V \u03A9 y el negro a COM.");
    if (c.frozen) return fail("Quita HOLD y cualquier retenci\xF3n de la pantalla para observar la lectura actual.");
    if (!(c.probes[0] === step.red && c.probes[1] === step.black || c.probes[1] === step.red && c.probes[0] === step.black)) return fail("Las puntas todav\xEDa no est\xE1n en los dos bornes pedidos. Consulta \xABD\xF3nde poner las puntas\xBB.");
    const reading = readPanelMeter(c.wires, c.input, c.result, c.timed, c.mode, ...c.probes, c.model, c.redJack);
    if (reading.value === void 0) return { ...fail(reading.note), reading };
    if (step.expected === "open" && reading.value !== null) return { ...fail("Se esperaba un contacto abierto (OL). Suelta el pulsador de marcha."), reading };
    if (step.expected === "low" && (reading.value === null || reading.value > 2)) return { ...fail("Se esperaba baja resistencia en este contacto cerrado."), reading };
    return { ready: true, message: "Puntas, funci\xF3n y estado correctos. Escribe la lectura que observas.", reading };
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
var PILOT_NAMES = ["verde de estrella", "rojo de motor detenido", "amarillo de sobrecarga", "verde de tri\xE1ngulo"];
function stepChecklist(step, c) {
  const items = [], add = (label, ok, hint) => items.push({ label, ok, hint }), i = c.input, energized = i.enabled && i.plugged, controls = i.breakers.every(Boolean), noControls = !i.breakers.some(Boolean);
  const roles = activityRoles(c.profile), scope = labelScopeFor(c.profile), coil = (id) => terminalLabel(id + ":A1", scope).split(" \xB7 ")[0], relays = c.result.relays, lamps = c.result.pilots, list = (names) => names.length > 1 ? names.slice(0, -1).join(", ") + " y " + names[names.length - 1] : names[0];
  const coils = (on, off) => {
    if (on.length) add(`${list(on.map(coil))}: ${on.length > 1 ? "bobinas con energ\xEDa" : "bobina con energ\xEDa"}`, on.every((id) => relays[id]), "En el panel, cada contactor muestra \xABACTIVO\xBB y el temporizador cuenta \xABFALTAN \u2026 s\xBB y luego \xABTEMPORIZADO\xBB.");
    if (off.length) add(`${list(off.map(coil))}: ${off.length > 1 ? "sin energ\xEDa" : "sin energ\xEDa"}`, off.every((id) => !relays[id]), "El contactor muestra \xABREPOSO\xBB.");
  };
  const pilots = (want) => {
    want.forEach((on, k) => {
      if (on) add(`Piloto P${k + 1} (${PILOT_NAMES[k]}) encendido`, lamps[k], "Las l\xE1mparas est\xE1n en el m\xF3dulo Luces piloto.");
    });
    const dark = want.map((on, k) => on ? -1 : k).filter((k) => k >= 0);
    add(dark.length === 4 ? "Ninguna l\xE1mpara piloto encendida" : `L\xE1mparas ${list(dark.map((k) => "P" + (k + 1)))} apagadas`, dark.every((k) => !lamps[k]));
  };
  const all = [roles.main, roles.star, roles.delta], rest = [false, roles.restPilot, false, false];
  if (step.id !== "dismantle" && !matchesActivity(c.profile, c.wires, ACTIVITY_STEPS.findIndex((s) => s.id === step.id) < 10 ? "control" : "full")) add("Los cables no coinciden con los de la pr\xE1ctica", false, "Pulsa \xABDeshacer\xBB para recuperar tu \xFAltimo cable correcto.");
  if (["star", "delta"].includes(step.stage) && c.model.nameplate) {
    const fit = ratingCompatibility(c.model.nameplate, c.model.lineVolts, step.stage === "delta" ? "delta" : "star");
    if (!fit.ok) add(fit.message, false);
  }
  if (c.result.fault) add("La simulaci\xF3n avisa de una falla", false, "Revisa los cables antes de seguir.");
  if (step.stage === "cold") {
    add("Banco desenchufado", !energized, "Bot\xF3n \xABDesenchufar\xBB de abajo.");
    if (step.id === "force-continuity") {
      add("FUERZA en OFF", !i.forceBreaker);
      add("CONTROL 1 y CONTROL 2 en OFF", noControls);
    }
  }
  if (step.stage === "off") {
    add("Banco desenchufado", !i.plugged, "Bot\xF3n \xABDesenchufar\xBB de abajo.");
    add("FUERZA en OFF", !i.forceBreaker);
    add("CONTROL 1 y CONTROL 2 en OFF", noControls);
    if (step.id === "dismantle") add("Todos los cables retirados", !c.wires.length);
  }
  if (step.stage.startsWith("control")) {
    add("Banco enchufado", energized, "Bot\xF3n \xABConectar corriente\xBB de abajo.");
    add("CONTROL 1 y CONTROL 2 en ON", controls);
    add("FUERZA en OFF", !i.forceBreaker, "En esta parte solo se prueba el mando (24 V). FUERZA alimenta el motor y todav\xEDa no se usa.");
  }
  if (["supply", "star", "delta", "powered-rest", "trip", "reset"].includes(step.stage)) {
    add("Banco enchufado", energized, "Bot\xF3n \xABConectar corriente\xBB de abajo.");
    add("FUERZA en ON", i.forceBreaker, "FUERZA alimenta el motor (380 V).");
    if (step.stage !== "supply") add("CONTROL 1 y CONTROL 2 en ON", controls);
  }
  if (["control-rest", "control-reset", "powered-rest", "reset"].includes(step.stage)) {
    add("Rel\xE9 t\xE9rmico sin disparo", !i.thermalTripped, "Si salta, se rearma con RESET.");
    coils([], all);
    pilots(rest);
  }
  if (step.stage === "control-star") {
    coils([roles.main, roles.star], [roles.delta]);
    pilots([true, false, false, false]);
  }
  if (step.stage === "control-delta") {
    coils([roles.main, roles.delta], [roles.star]);
    pilots([false, false, false, true]);
  }
  if (step.stage === "control-trip" || step.stage === "trip") {
    add("Rel\xE9 t\xE9rmico disparado", i.thermalTripped, "Se dispara con el bot\xF3n TEST de abajo.");
    coils([], all);
    pilots([false, roles.restPilot, true, false]);
  }
  if (["supply", "trip", "reset"].includes(step.stage)) add("Motor detenido", c.result.motor.status === "off");
  if (step.stage === "star" || step.stage === "delta") add(`Motor girando en ${step.stage === "star" ? "estrella" : "tri\xE1ngulo"}`, c.result.motor.status === "running" && c.result.motor.connection === step.stage, "El m\xF3dulo Motor muestra \xABESTRELLA\xBB o \xABTRI\xC1NGULO\xBB con sus rpm.");
  if (step.kind === "action" && step.stage !== "off") add("Sin pulsadores mantenidos", !i.pressed.length, "Pulsa y suelta: no mantengas S1 apretado.");
  if (step.kind === "meter") {
    add(`Funci\xF3n \xAB${step.mode === "V" ? "V~" : step.mode === "R" ? "\u03A9" : "Continuidad"}\xBB elegida en el mult\xEDmetro`, c.mode === step.mode, step.mode === "C" ? "Es la funci\xF3n del s\xEDmbolo \u2022))." : void 0);
    add("Cable rojo en la entrada V \u03A9 del mult\xEDmetro (el negro en COM)", c.redJack === "vo");
    if (c.frozen) add("Pantalla sin HOLD", false, "Pulsa HOLD de nuevo para soltar la lectura.");
    add(`Una punta en ${terminalLabel(step.red, scope)} y la otra en ${terminalLabel(step.black, scope)}`, c.probes.includes(step.red) && c.probes.includes(step.black), "El bot\xF3n \xABVer estos bornes en el panel\xBB te los muestra.");
  }
  if (step.kind === "clamp") add(`Pinza abrazando solo el cable de entrada de la fase ${step.phase}`, c.clamp === step.phase, "Usa los botones \xABPinza en R / S / T\xBB de esta ventana.");
  return items;
}
function observedMatches(text, value) {
  if (value === null) return text.trim().toUpperCase() === "OL";
  const entered = Number(text.trim().replace(",", "."));
  return text.trim() !== "" && Number.isFinite(entered) && Math.abs(entered - value) <= Math.max(0.06, Math.abs(value) * 0.025);
}
var LEGACY_ACTIVITY_KEY = "modo-meter-activity2-v1";
var ACTIVITY_KEY = "modo-meter-two-contactors-v1";
var newActivity = (profile) => ({ version: 1, profile, index: 0, records: [], reflection: "", complete: false });
function readActivity(raw) {
  if (!raw || typeof raw !== "object") return null;
  const v = raw;
  if (v.version !== 1 || !["manual", "matias", "twoContactors"].includes(v.profile) || !Number.isInteger(v.index) || v.index < 0 || v.index >= ACTIVITY_STEPS.length || typeof v.complete !== "boolean" || typeof v.reflection !== "string" || v.reflection.length > 5e3 || !Array.isArray(v.records) || v.records.length > ACTIVITY_STEPS.length) return null;
  if (v.analysis && (v.analysis.voltage !== void 0 && (typeof v.analysis.voltage !== "string" || v.analysis.voltage.length > 30) || v.analysis.current !== void 0 && (typeof v.analysis.current !== "string" || v.analysis.current.length > 30))) return null;
  if (v.records.some((r) => !r || r.rpm !== void 0 && !Number.isFinite(r.rpm) || r.loadTorqueNm !== void 0 && (!Number.isFinite(r.loadTorqueNm) || r.loadTorqueNm < 0 || r.loadTorqueNm > 40) || r.motorMode !== void 0 && !["induction", "resistive"].includes(r.motorMode))) return null;
  if (v.records.some((r) => r && (r.conditions !== void 0 && !validConditions(r.conditions) || r.action !== void 0 && !validActionProof(r.action) || r.displayUnit !== void 0 && (typeof r.displayUnit !== "string" || r.displayUnit.length > 10) || r.capturedAt !== void 0 && (typeof r.capturedAt !== "string" || r.capturedAt.length > 50)))) return null;
  if (v.records.some((r) => !r || !ACTIVITY_STEPS.some((s) => s.id === r.id) || typeof r.observed !== "string" || r.observed.length > 80 || typeof r.text !== "string" || r.text.length > 120 || r.value !== null && !Number.isFinite(r.value) || typeof r.at !== "string")) return null;
  const firstMissing = ACTIVITY_STEPS.findIndex((s) => !v.records.some((r) => r.id === s.id));
  return v.complete && firstMissing >= 0 ? { ...v, index: firstMissing, complete: false } : v;
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
  AMMETER_MAX,
  AMMETER_RATED,
  CALIBRATION_KEY,
  DEFAULT_LAYOUT,
  DEFAULT_PANEL_METER_MODEL,
  DEFAULT_THERMAL,
  EXTRAS_KEY,
  GAP,
  IDLE_MOTOR,
  KEY,
  LEGACY_ACTIVITY_KEY,
  MARGIN_X,
  MAX_X,
  MAX_Y,
  MA_MAX,
  MIN_GAP,
  MOTOR_EQUIVALENT,
  MOTOR_FIELDS,
  OFF_RELAYS,
  RAIL_OFFSET,
  SIMULATION_EXAMPLES,
  SNAP,
  TOP_Y,
  VIEW_ASPECT,
  activityDocument,
  activityRoles,
  activityStep,
  addExtraModule,
  advanceClock,
  advanceMotor,
  advancePowerContacts,
  advanceThermal,
  advanceTimers,
  boardFrame,
  checkActivity,
  clampFree,
  coldThermal,
  contactorIds,
  defaultCalibration,
  dropModule,
  emptySimulation,
  extraModules,
  fitView,
  freeSlot,
  getLayout,
  isForceTerminal,
  isForceWire,
  jackLimit,
  loadExtraModules,
  loadLayout,
  matchesActivity,
  meterHazard,
  modulePos,
  moduleRect,
  motorAdmittance,
  motorEquivalent,
  motorFrequency,
  newActivity,
  newClock,
  observedMatches,
  openPowerContacts,
  overlaps,
  panelAmmeterBridge,
  panelElectrical,
  railRows,
  readActivity,
  readCalibration,
  readPanelMeter,
  relayIds,
  removeExtraModule,
  resetLayout,
  resistanceKey,
  sameRelays,
  sequences,
  setModulePos,
  simulationContacts,
  snapModule,
  solveSimulation,
  stepChecklist,
  stoppedMotion,
  supplyLineVolts,
  switchingRms,
  timerIds,
  useLayout,
  useModules
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
