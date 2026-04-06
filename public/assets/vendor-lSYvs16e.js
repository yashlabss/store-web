try {
    let e = typeof window < "u" ? window : typeof global < "u" ? global : typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : {},
        t = new e.Error().stack;
    t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "c8a6cb50-7f59-4bae-9c94-9695ec3c5060", e._sentryDebugIdIdentifier = "sentry-dbid-c8a6cb50-7f59-4bae-9c94-9695ec3c5060")
} catch {}

function jr(e, t) {
    for (var r = 0; r < t.length; r++) {
        const n = t[r];
        if (typeof n != "string" && !Array.isArray(n)) {
            for (const a in n)
                if (a !== "default" && !(a in e)) {
                    const o = Object.getOwnPropertyDescriptor(n, a);
                    o && Object.defineProperty(e, a, o.get ? o : {
                        enumerable: !0,
                        get: () => n[a]
                    })
                }
        }
    }
    return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, {
        value: "Module"
    }))
} {
    let e = typeof window < "u" ? window : typeof global < "u" ? global : typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : {};
    e.SENTRY_RELEASE = {
        id: "47eb07332f5d47d03c0935a9fbb37226f08fc950"
    }
}
var Oi = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};

function Nr(e) {
    return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e
}

function Ui(e) {
    if (e.__esModule) return e;
    var t = e.default;
    if (typeof t == "function") {
        var r = function n() {
            return this instanceof n ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments)
        };
        r.prototype = t.prototype
    } else r = {};
    return Object.defineProperty(r, "__esModule", {
        value: !0
    }), Object.keys(e).forEach(function(n) {
        var a = Object.getOwnPropertyDescriptor(e, n);
        Object.defineProperty(r, n, a.get ? a : {
            enumerable: !0,
            get: function() {
                return e[n]
            }
        })
    }), r
}
var Ir = {
        exports: {}
    },
    M = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Bt = Symbol.for("react.transitional.element"),
    Mn = Symbol.for("react.portal"),
    On = Symbol.for("react.fragment"),
    Un = Symbol.for("react.strict_mode"),
    An = Symbol.for("react.profiler"),
    jn = Symbol.for("react.consumer"),
    Nn = Symbol.for("react.context"),
    In = Symbol.for("react.forward_ref"),
    Fn = Symbol.for("react.suspense"),
    kn = Symbol.for("react.memo"),
    Fr = Symbol.for("react.lazy"),
    Hn = Symbol.for("react.activity"),
    ur = Symbol.iterator;

function Bn(e) {
    return e === null || typeof e != "object" ? null : (e = ur && e[ur] || e["@@iterator"], typeof e == "function" ? e : null)
}
var kr = {
        isMounted: function() {
            return !1
        },
        enqueueForceUpdate: function() {},
        enqueueReplaceState: function() {},
        enqueueSetState: function() {}
    },
    Hr = Object.assign,
    Br = {};

function Ke(e, t, r) {
    this.props = e, this.context = t, this.refs = Br, this.updater = r || kr
}
Ke.prototype.isReactComponent = {};
Ke.prototype.setState = function(e, t) {
    if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, e, t, "setState")
};
Ke.prototype.forceUpdate = function(e) {
    this.updater.enqueueForceUpdate(this, e, "forceUpdate")
};

function zr() {}
zr.prototype = Ke.prototype;

function zt(e, t, r) {
    this.props = e, this.context = t, this.refs = Br, this.updater = r || kr
}
var $t = zt.prototype = new zr;
$t.constructor = zt;
Hr($t, Ke.prototype);
$t.isPureReactComponent = !0;
var cr = Array.isArray;

function Nt() {}
var $ = {
        H: null,
        A: null,
        T: null,
        S: null
    },
    $r = Object.prototype.hasOwnProperty;

function Wt(e, t, r) {
    var n = r.ref;
    return {
        $$typeof: Bt,
        type: e,
        key: t,
        ref: n !== void 0 ? n : null,
        props: r
    }
}

function zn(e, t) {
    return Wt(e.type, t, e.props)
}

function Yt(e) {
    return typeof e == "object" && e !== null && e.$$typeof === Bt
}

function $n(e) {
    var t = {
        "=": "=0",
        ":": "=2"
    };
    return "$" + e.replace(/[=:]/g, function(r) {
        return t[r]
    })
}
var fr = /\/+/g;

function Ot(e, t) {
    return typeof e == "object" && e !== null && e.key != null ? $n("" + e.key) : t.toString(36)
}

function Wn(e) {
    switch (e.status) {
        case "fulfilled":
            return e.value;
        case "rejected":
            throw e.reason;
        default:
            switch (typeof e.status == "string" ? e.then(Nt, Nt) : (e.status = "pending", e.then(function(t) {
                e.status === "pending" && (e.status = "fulfilled", e.value = t)
            }, function(t) {
                e.status === "pending" && (e.status = "rejected", e.reason = t)
            })), e.status) {
                case "fulfilled":
                    return e.value;
                case "rejected":
                    throw e.reason
            }
    }
    throw e
}

function $e(e, t, r, n, a) {
    var o = typeof e;
    (o === "undefined" || o === "boolean") && (e = null);
    var i = !1;
    if (e === null) i = !0;
    else switch (o) {
        case "bigint":
        case "string":
        case "number":
            i = !0;
            break;
        case "object":
            switch (e.$$typeof) {
                case Bt:
                case Mn:
                    i = !0;
                    break;
                case Fr:
                    return i = e._init, $e(i(e._payload), t, r, n, a)
            }
    }
    if (i) return a = a(e), i = n === "" ? "." + Ot(e, 0) : n, cr(a) ? (r = "", i != null && (r = i.replace(fr, "$&/") + "/"), $e(a, t, r, "", function(d) {
        return d
    })) : a != null && (Yt(a) && (a = zn(a, r + (a.key == null || e && e.key === a.key ? "" : ("" + a.key).replace(fr, "$&/") + "/") + i)), t.push(a)), 1;
    i = 0;
    var c = n === "" ? "." : n + ":";
    if (cr(e))
        for (var s = 0; s < e.length; s++) n = e[s], o = c + Ot(n, s), i += $e(n, t, r, o, a);
    else if (s = Bn(e), typeof s == "function")
        for (e = s.call(e), s = 0; !(n = e.next()).done;) n = n.value, o = c + Ot(n, s++), i += $e(n, t, r, o, a);
    else if (o === "object") {
        if (typeof e.then == "function") return $e(Wn(e), t, r, n, a);
        throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.")
    }
    return i
}

function Et(e, t, r) {
    if (e == null) return e;
    var n = [],
        a = 0;
    return $e(e, n, "", "", function(o) {
        return t.call(r, o, a++)
    }), n
}

function Yn(e) {
    if (e._status === -1) {
        var t = e._result;
        t = t(), t.then(function(r) {
            (e._status === 0 || e._status === -1) && (e._status = 1, e._result = r)
        }, function(r) {
            (e._status === 0 || e._status === -1) && (e._status = 2, e._result = r)
        }), e._status === -1 && (e._status = 0, e._result = t)
    }
    if (e._status === 1) return e._result.default;
    throw e._result
}
var dr = typeof reportError == "function" ? reportError : function(e) {
        if (typeof window == "object" && typeof window.ErrorEvent == "function") {
            var t = new window.ErrorEvent("error", {
                bubbles: !0,
                cancelable: !0,
                message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e),
                error: e
            });
            if (!window.dispatchEvent(t)) return
        } else if (typeof process == "object" && typeof process.emit == "function") {
            process.emit("uncaughtException", e);
            return
        }
        console.error(e)
    },
    Vn = {
        map: Et,
        forEach: function(e, t, r) {
            Et(e, function() {
                t.apply(this, arguments)
            }, r)
        },
        count: function(e) {
            var t = 0;
            return Et(e, function() {
                t++
            }), t
        },
        toArray: function(e) {
            return Et(e, function(t) {
                return t
            }) || []
        },
        only: function(e) {
            if (!Yt(e)) throw Error("React.Children.only expected to receive a single React element child.");
            return e
        }
    };
M.Activity = Hn;
M.Children = Vn;
M.Component = Ke;
M.Fragment = On;
M.Profiler = An;
M.PureComponent = zt;
M.StrictMode = Un;
M.Suspense = Fn;
M.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = $;
M.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(e) {
        return $.H.useMemoCache(e)
    }
};
M.cache = function(e) {
    return function() {
        return e.apply(null, arguments)
    }
};
M.cacheSignal = function() {
    return null
};
M.cloneElement = function(e, t, r) {
    if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
    var n = Hr({}, e.props),
        a = e.key;
    if (t != null)
        for (o in t.key !== void 0 && (a = "" + t.key), t) !$r.call(t, o) || o === "key" || o === "__self" || o === "__source" || o === "ref" && t.ref === void 0 || (n[o] = t[o]);
    var o = arguments.length - 2;
    if (o === 1) n.children = r;
    else if (1 < o) {
        for (var i = Array(o), c = 0; c < o; c++) i[c] = arguments[c + 2];
        n.children = i
    }
    return Wt(e.type, a, n)
};
M.createContext = function(e) {
    return e = {
        $$typeof: Nn,
        _currentValue: e,
        _currentValue2: e,
        _threadCount: 0,
        Provider: null,
        Consumer: null
    }, e.Provider = e, e.Consumer = {
        $$typeof: jn,
        _context: e
    }, e
};
M.createElement = function(e, t, r) {
    var n, a = {},
        o = null;
    if (t != null)
        for (n in t.key !== void 0 && (o = "" + t.key), t) $r.call(t, n) && n !== "key" && n !== "__self" && n !== "__source" && (a[n] = t[n]);
    var i = arguments.length - 2;
    if (i === 1) a.children = r;
    else if (1 < i) {
        for (var c = Array(i), s = 0; s < i; s++) c[s] = arguments[s + 2];
        a.children = c
    }
    if (e && e.defaultProps)
        for (n in i = e.defaultProps, i) a[n] === void 0 && (a[n] = i[n]);
    return Wt(e, o, a)
};
M.createRef = function() {
    return {
        current: null
    }
};
M.forwardRef = function(e) {
    return {
        $$typeof: In,
        render: e
    }
};
M.isValidElement = Yt;
M.lazy = function(e) {
    return {
        $$typeof: Fr,
        _payload: {
            _status: -1,
            _result: e
        },
        _init: Yn
    }
};
M.memo = function(e, t) {
    return {
        $$typeof: kn,
        type: e,
        compare: t === void 0 ? null : t
    }
};
M.startTransition = function(e) {
    var t = $.T,
        r = {};
    $.T = r;
    try {
        var n = e(),
            a = $.S;
        a !== null && a(r, n), typeof n == "object" && n !== null && typeof n.then == "function" && n.then(Nt, dr)
    } catch (o) {
        dr(o)
    } finally {
        t !== null && r.types !== null && (t.types = r.types), $.T = t
    }
};
M.unstable_useCacheRefresh = function() {
    return $.H.useCacheRefresh()
};
M.use = function(e) {
    return $.H.use(e)
};
M.useActionState = function(e, t, r) {
    return $.H.useActionState(e, t, r)
};
M.useCallback = function(e, t) {
    return $.H.useCallback(e, t)
};
M.useContext = function(e) {
    return $.H.useContext(e)
};
M.useDebugValue = function() {};
M.useDeferredValue = function(e, t) {
    return $.H.useDeferredValue(e, t)
};
M.useEffect = function(e, t) {
    return $.H.useEffect(e, t)
};
M.useEffectEvent = function(e) {
    return $.H.useEffectEvent(e)
};
M.useId = function() {
    return $.H.useId()
};
M.useImperativeHandle = function(e, t, r) {
    return $.H.useImperativeHandle(e, t, r)
};
M.useInsertionEffect = function(e, t) {
    return $.H.useInsertionEffect(e, t)
};
M.useLayoutEffect = function(e, t) {
    return $.H.useLayoutEffect(e, t)
};
M.useMemo = function(e, t) {
    return $.H.useMemo(e, t)
};
M.useOptimistic = function(e, t) {
    return $.H.useOptimistic(e, t)
};
M.useReducer = function(e, t, r) {
    return $.H.useReducer(e, t, r)
};
M.useRef = function(e) {
    return $.H.useRef(e)
};
M.useState = function(e) {
    return $.H.useState(e)
};
M.useSyncExternalStore = function(e, t, r) {
    return $.H.useSyncExternalStore(e, t, r)
};
M.useTransition = function() {
    return $.H.useTransition()
};
M.version = "19.2.3";
Ir.exports = M;
var v = Ir.exports;
const Kn = Nr(v),
    Gn = jr({
        __proto__: null,
        default: Kn
    }, [v]);
var Wr = {
        exports: {}
    },
    ae = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Jn = v;

function Yr(e) {
    var t = "https://react.dev/errors/" + e;
    if (1 < arguments.length) {
        t += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var r = 2; r < arguments.length; r++) t += "&args[]=" + encodeURIComponent(arguments[r])
    }
    return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
}

function Re() {}
var ne = {
        d: {
            f: Re,
            r: function() {
                throw Error(Yr(522))
            },
            D: Re,
            C: Re,
            L: Re,
            m: Re,
            X: Re,
            S: Re,
            M: Re
        },
        p: 0,
        findDOMNode: null
    },
    Xn = Symbol.for("react.portal");

function Qn(e, t, r) {
    var n = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
        $$typeof: Xn,
        key: n == null ? null : "" + n,
        children: e,
        containerInfo: t,
        implementation: r
    }
}
var it = Jn.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

function _t(e, t) {
    if (e === "font") return "";
    if (typeof t == "string") return t === "use-credentials" ? t : ""
}
ae.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ne;
ae.createPortal = function(e, t) {
    var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(Yr(299));
    return Qn(e, t, null, r)
};
ae.flushSync = function(e) {
    var t = it.T,
        r = ne.p;
    try {
        if (it.T = null, ne.p = 2, e) return e()
    } finally {
        it.T = t, ne.p = r, ne.d.f()
    }
};
ae.preconnect = function(e, t) {
    typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, ne.d.C(e, t))
};
ae.prefetchDNS = function(e) {
    typeof e == "string" && ne.d.D(e)
};
ae.preinit = function(e, t) {
    if (typeof e == "string" && t && typeof t.as == "string") {
        var r = t.as,
            n = _t(r, t.crossOrigin),
            a = typeof t.integrity == "string" ? t.integrity : void 0,
            o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
        r === "style" ? ne.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
            crossOrigin: n,
            integrity: a,
            fetchPriority: o
        }) : r === "script" && ne.d.X(e, {
            crossOrigin: n,
            integrity: a,
            fetchPriority: o,
            nonce: typeof t.nonce == "string" ? t.nonce : void 0
        })
    }
};
ae.preinitModule = function(e, t) {
    if (typeof e == "string")
        if (typeof t == "object" && t !== null) {
            if (t.as == null || t.as === "script") {
                var r = _t(t.as, t.crossOrigin);
                ne.d.M(e, {
                    crossOrigin: r,
                    integrity: typeof t.integrity == "string" ? t.integrity : void 0,
                    nonce: typeof t.nonce == "string" ? t.nonce : void 0
                })
            }
        } else t == null && ne.d.M(e)
};
ae.preload = function(e, t) {
    if (typeof e == "string" && typeof t == "object" && t !== null && typeof t.as == "string") {
        var r = t.as,
            n = _t(r, t.crossOrigin);
        ne.d.L(e, r, {
            crossOrigin: n,
            integrity: typeof t.integrity == "string" ? t.integrity : void 0,
            nonce: typeof t.nonce == "string" ? t.nonce : void 0,
            type: typeof t.type == "string" ? t.type : void 0,
            fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
            referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
            imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
            imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
            media: typeof t.media == "string" ? t.media : void 0
        })
    }
};
ae.preloadModule = function(e, t) {
    if (typeof e == "string")
        if (t) {
            var r = _t(t.as, t.crossOrigin);
            ne.d.m(e, {
                as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
                crossOrigin: r,
                integrity: typeof t.integrity == "string" ? t.integrity : void 0
            })
        } else ne.d.m(e)
};
ae.requestFormReset = function(e) {
    ne.d.r(e)
};
ae.unstable_batchedUpdates = function(e, t) {
    return e(t)
};
ae.useFormState = function(e, t, r) {
    return it.H.useFormState(e, t, r)
};
ae.useFormStatus = function() {
    return it.H.useHostTransitionStatus()
};
ae.version = "19.2.3";

function Vr() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Vr)
    } catch (e) {
        console.error(e)
    }
}
Vr(), Wr.exports = ae;
var Kr = Wr.exports;
const qn = Nr(Kr),
    Zn = jr({
        __proto__: null,
        default: qn
    }, [Kr]);
/**
 * @remix-run/router v1.23.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function Y() {
    return Y = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n])
        }
        return e
    }, Y.apply(this, arguments)
}
var q;
(function(e) {
    e.Pop = "POP", e.Push = "PUSH", e.Replace = "REPLACE"
})(q || (q = {}));
const hr = "popstate";

function ea(e) {
    e === void 0 && (e = {});

    function t(n, a) {
        let {
            pathname: o,
            search: i,
            hash: c
        } = n.location;
        return ot("", {
            pathname: o,
            search: i,
            hash: c
        }, a.state && a.state.usr || null, a.state && a.state.key || "default")
    }

    function r(n, a) {
        return typeof a == "string" ? a : je(a)
    }
    return ra(t, r, null, e)
}

function A(e, t) {
    if (e === !1 || e === null || typeof e > "u") throw new Error(t)
}

function Ye(e, t) {
    if (!e) {
        typeof console < "u" && console.warn(t);
        try {
            throw new Error(t)
        } catch {}
    }
}

function ta() {
    return Math.random().toString(36).substr(2, 8)
}

function pr(e, t) {
    return {
        usr: e.state,
        key: e.key,
        idx: t
    }
}

function ot(e, t, r, n) {
    return r === void 0 && (r = null), Y({
        pathname: typeof e == "string" ? e : e.pathname,
        search: "",
        hash: ""
    }, typeof t == "string" ? _e(t) : t, {
        state: r,
        key: t && t.key || n || ta()
    })
}

function je(e) {
    let {
        pathname: t = "/",
        search: r = "",
        hash: n = ""
    } = e;
    return r && r !== "?" && (t += r.charAt(0) === "?" ? r : "?" + r), n && n !== "#" && (t += n.charAt(0) === "#" ? n : "#" + n), t
}

function _e(e) {
    let t = {};
    if (e) {
        let r = e.indexOf("#");
        r >= 0 && (t.hash = e.substr(r), e = e.substr(0, r));
        let n = e.indexOf("?");
        n >= 0 && (t.search = e.substr(n), e = e.substr(0, n)), e && (t.pathname = e)
    }
    return t
}

function ra(e, t, r, n) {
    n === void 0 && (n = {});
    let {
        window: a = document.defaultView,
        v5Compat: o = !1
    } = n, i = a.history, c = q.Pop, s = null, d = m();
    d == null && (d = 0, i.replaceState(Y({}, i.state, {
        idx: d
    }), ""));

    function m() {
        return (i.state || {
            idx: null
        }).idx
    }

    function h() {
        c = q.Pop;
        let x = m(),
            k = x == null ? null : x - d;
        d = x, s && s({
            action: c,
            location: b.location,
            delta: k
        })
    }

    function g(x, k) {
        c = q.Push;
        let D = ot(b.location, x, k);
        d = m() + 1;
        let B = pr(D, d),
            G = b.createHref(D);
        try {
            i.pushState(B, "", G)
        } catch (J) {
            if (J instanceof DOMException && J.name === "DataCloneError") throw J;
            a.location.assign(G)
        }
        o && s && s({
            action: c,
            location: b.location,
            delta: 1
        })
    }

    function E(x, k) {
        c = q.Replace;
        let D = ot(b.location, x, k);
        d = m();
        let B = pr(D, d),
            G = b.createHref(D);
        i.replaceState(B, "", G), o && s && s({
            action: c,
            location: b.location,
            delta: 0
        })
    }

    function C(x) {
        let k = a.location.origin !== "null" ? a.location.origin : a.location.href,
            D = typeof x == "string" ? x : je(x);
        return D = D.replace(/ $/, "%20"), A(k, "No window.location.(origin|href) available to create URL for href: " + D), new URL(D, k)
    }
    let b = {
        get action() {
            return c
        },
        get location() {
            return e(a, i)
        },
        listen(x) {
            if (s) throw new Error("A history only accepts one active listener");
            return a.addEventListener(hr, h), s = x, () => {
                a.removeEventListener(hr, h), s = null
            }
        },
        createHref(x) {
            return t(a, x)
        },
        createURL: C,
        encodeLocation(x) {
            let k = C(x);
            return {
                pathname: k.pathname,
                search: k.search,
                hash: k.hash
            }
        },
        push: g,
        replace: E,
        go(x) {
            return i.go(x)
        }
    };
    return b
}
var H;
(function(e) {
    e.data = "data", e.deferred = "deferred", e.redirect = "redirect", e.error = "error"
})(H || (H = {}));
const na = new Set(["lazy", "caseSensitive", "path", "id", "index", "children"]);

function aa(e) {
    return e.index === !0
}

function bt(e, t, r, n) {
    return r === void 0 && (r = []), n === void 0 && (n = {}), e.map((a, o) => {
        let i = [...r, String(o)],
            c = typeof a.id == "string" ? a.id : i.join("-");
        if (A(a.index !== !0 || !a.children, "Cannot specify children on an index route"), A(!n[c], 'Found a route id collision on id "' + c + `".  Route id's must be globally unique within Data Router usages`), aa(a)) {
            let s = Y({}, a, t(a), {
                id: c
            });
            return n[c] = s, s
        } else {
            let s = Y({}, a, t(a), {
                id: c,
                children: void 0
            });
            return n[c] = s, a.children && (s.children = bt(a.children, t, i, n)), s
        }
    })
}

function Oe(e, t, r) {
    return r === void 0 && (r = "/"), wt(e, t, r, !1)
}

function wt(e, t, r, n) {
    let a = typeof t == "string" ? _e(t) : t,
        o = Se(a.pathname || "/", r);
    if (o == null) return null;
    let i = Gr(e);
    oa(i);
    let c = null;
    for (let s = 0; c == null && s < i.length; ++s) {
        let d = ya(o);
        c = ma(i[s], d, n)
    }
    return c
}

function ia(e, t) {
    let {
        route: r,
        pathname: n,
        params: a
    } = e;
    return {
        id: r.id,
        pathname: n,
        params: a,
        data: t[r.id],
        handle: r.handle
    }
}

function Gr(e, t, r, n) {
    t === void 0 && (t = []), r === void 0 && (r = []), n === void 0 && (n = "");
    let a = (o, i, c) => {
        let s = {
            relativePath: c === void 0 ? o.path || "" : c,
            caseSensitive: o.caseSensitive === !0,
            childrenIndex: i,
            route: o
        };
        s.relativePath.startsWith("/") && (A(s.relativePath.startsWith(n), 'Absolute route path "' + s.relativePath + '" nested under path ' + ('"' + n + '" is not valid. An absolute child route path ') + "must start with the combined path of all its parent routes."), s.relativePath = s.relativePath.slice(n.length));
        let d = ye([n, s.relativePath]),
            m = r.concat(s);
        o.children && o.children.length > 0 && (A(o.index !== !0, "Index routes must not have child routes. Please remove " + ('all child routes from route path "' + d + '".')), Gr(o.children, t, m, d)), !(o.path == null && !o.index) && t.push({
            path: d,
            score: ha(d, o.index),
            routesMeta: m
        })
    };
    return e.forEach((o, i) => {
        var c;
        if (o.path === "" || !((c = o.path) != null && c.includes("?"))) a(o, i);
        else
            for (let s of Jr(o.path)) a(o, i, s)
    }), t
}

function Jr(e) {
    let t = e.split("/");
    if (t.length === 0) return [];
    let [r, ...n] = t, a = r.endsWith("?"), o = r.replace(/\?$/, "");
    if (n.length === 0) return a ? [o, ""] : [o];
    let i = Jr(n.join("/")),
        c = [];
    return c.push(...i.map(s => s === "" ? o : [o, s].join("/"))), a && c.push(...i), c.map(s => e.startsWith("/") && s === "" ? "/" : s)
}

function oa(e) {
    e.sort((t, r) => t.score !== r.score ? r.score - t.score : pa(t.routesMeta.map(n => n.childrenIndex), r.routesMeta.map(n => n.childrenIndex)))
}
const la = /^:[\w-]+$/,
    sa = 3,
    ua = 2,
    ca = 1,
    fa = 10,
    da = -2,
    mr = e => e === "*";

function ha(e, t) {
    let r = e.split("/"),
        n = r.length;
    return r.some(mr) && (n += da), t && (n += ua), r.filter(a => !mr(a)).reduce((a, o) => a + (la.test(o) ? sa : o === "" ? ca : fa), n)
}

function pa(e, t) {
    return e.length === t.length && e.slice(0, -1).every((n, a) => n === t[a]) ? e[e.length - 1] - t[t.length - 1] : 0
}

function ma(e, t, r) {
    r === void 0 && (r = !1);
    let {
        routesMeta: n
    } = e, a = {}, o = "/", i = [];
    for (let c = 0; c < n.length; ++c) {
        let s = n[c],
            d = c === n.length - 1,
            m = o === "/" ? t : t.slice(o.length) || "/",
            h = vr({
                path: s.relativePath,
                caseSensitive: s.caseSensitive,
                end: d
            }, m),
            g = s.route;
        if (!h && d && r && !n[n.length - 1].route.index && (h = vr({
                path: s.relativePath,
                caseSensitive: s.caseSensitive,
                end: !1
            }, m)), !h) return null;
        Object.assign(a, h.params), i.push({
            params: a,
            pathname: ye([o, h.pathname]),
            pathnameBase: Ra(ye([o, h.pathnameBase])),
            route: g
        }), h.pathnameBase !== "/" && (o = ye([o, h.pathnameBase]))
    }
    return i
}

function vr(e, t) {
    typeof e == "string" && (e = {
        path: e,
        caseSensitive: !1,
        end: !0
    });
    let [r, n] = va(e.path, e.caseSensitive, e.end), a = t.match(r);
    if (!a) return null;
    let o = a[0],
        i = o.replace(/(.)\/+$/, "$1"),
        c = a.slice(1);
    return {
        params: n.reduce((d, m, h) => {
            let {
                paramName: g,
                isOptional: E
            } = m;
            if (g === "*") {
                let b = c[h] || "";
                i = o.slice(0, o.length - b.length).replace(/(.)\/+$/, "$1")
            }
            const C = c[h];
            return E && !C ? d[g] = void 0 : d[g] = (C || "").replace(/%2F/g, "/"), d
        }, {}),
        pathname: o,
        pathnameBase: i,
        pattern: e
    }
}

function va(e, t, r) {
    t === void 0 && (t = !1), r === void 0 && (r = !0), Ye(e === "*" || !e.endsWith("*") || e.endsWith("/*"), 'Route path "' + e + '" will be treated as if it were ' + ('"' + e.replace(/\*$/, "/*") + '" because the `*` character must ') + "always follow a `/` in the pattern. To get rid of this warning, " + ('please change the route path to "' + e.replace(/\*$/, "/*") + '".'));
    let n = [],
        a = "^" + e.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (i, c, s) => (n.push({
            paramName: c,
            isOptional: s != null
        }), s ? "/?([^\\/]+)?" : "/([^\\/]+)"));
    return e.endsWith("*") ? (n.push({
        paramName: "*"
    }), a += e === "*" || e === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$") : r ? a += "\\/*$" : e !== "" && e !== "/" && (a += "(?:(?=\\/|$))"), [new RegExp(a, t ? void 0 : "i"), n]
}

function ya(e) {
    try {
        return e.split("/").map(t => decodeURIComponent(t).replace(/\//g, "%2F")).join("/")
    } catch (t) {
        return Ye(!1, 'The URL path "' + e + '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent ' + ("encoding (" + t + ").")), e
    }
}

function Se(e, t) {
    if (t === "/") return e;
    if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
    let r = t.endsWith("/") ? t.length - 1 : t.length,
        n = e.charAt(r);
    return n && n !== "/" ? null : e.slice(r) || "/"
}

function ga(e, t) {
    t === void 0 && (t = "/");
    let {
        pathname: r,
        search: n = "",
        hash: a = ""
    } = typeof e == "string" ? _e(e) : e;
    return {
        pathname: r ? r.startsWith("/") ? r : Ea(r, t) : t,
        search: wa(n),
        hash: ba(a)
    }
}

function Ea(e, t) {
    let r = t.replace(/\/+$/, "").split("/");
    return e.split("/").forEach(a => {
        a === ".." ? r.length > 1 && r.pop() : a !== "." && r.push(a)
    }), r.length > 1 ? r.join("/") : "/"
}

function Ut(e, t, r, n) {
    return "Cannot include a '" + e + "' character in a manually specified " + ("`to." + t + "` field [" + JSON.stringify(n) + "].  Please separate it out to the ") + ("`to." + r + "` field. Alternatively you may provide the full path as ") + 'a string in <Link to="..."> and the router will parse it for you.'
}

function Xr(e) {
    return e.filter((t, r) => r === 0 || t.route.path && t.route.path.length > 0)
}

function Pt(e, t) {
    let r = Xr(e);
    return t ? r.map((n, a) => a === r.length - 1 ? n.pathname : n.pathnameBase) : r.map(n => n.pathnameBase)
}

function Ct(e, t, r, n) {
    n === void 0 && (n = !1);
    let a;
    typeof e == "string" ? a = _e(e) : (a = Y({}, e), A(!a.pathname || !a.pathname.includes("?"), Ut("?", "pathname", "search", a)), A(!a.pathname || !a.pathname.includes("#"), Ut("#", "pathname", "hash", a)), A(!a.search || !a.search.includes("#"), Ut("#", "search", "hash", a)));
    let o = e === "" || a.pathname === "",
        i = o ? "/" : a.pathname,
        c;
    if (i == null) c = r;
    else {
        let h = t.length - 1;
        if (!n && i.startsWith("..")) {
            let g = i.split("/");
            for (; g[0] === "..";) g.shift(), h -= 1;
            a.pathname = g.join("/")
        }
        c = h >= 0 ? t[h] : "/"
    }
    let s = ga(a, c),
        d = i && i !== "/" && i.endsWith("/"),
        m = (o || i === ".") && r.endsWith("/");
    return !s.pathname.endsWith("/") && (d || m) && (s.pathname += "/"), s
}
const ye = e => e.join("/").replace(/\/\/+/g, "/"),
    Ra = e => e.replace(/\/+$/, "").replace(/^\/*/, "/"),
    wa = e => !e || e === "?" ? "" : e.startsWith("?") ? e : "?" + e,
    ba = e => !e || e === "#" ? "" : e.startsWith("#") ? e : "#" + e;
class St {
    constructor(t, r, n, a) {
        a === void 0 && (a = !1), this.status = t, this.statusText = r || "", this.internal = a, n instanceof Error ? (this.data = n.toString(), this.error = n) : this.data = n
    }
}

function lt(e) {
    return e != null && typeof e.status == "number" && typeof e.statusText == "string" && typeof e.internal == "boolean" && "data" in e
}
const Qr = ["post", "put", "patch", "delete"],
    Sa = new Set(Qr),
    _a = ["get", ...Qr],
    Pa = new Set(_a),
    Ca = new Set([301, 302, 303, 307, 308]),
    Ta = new Set([307, 308]),
    At = {
        state: "idle",
        location: void 0,
        formMethod: void 0,
        formAction: void 0,
        formEncType: void 0,
        formData: void 0,
        json: void 0,
        text: void 0
    },
    xa = {
        state: "idle",
        data: void 0,
        formMethod: void 0,
        formAction: void 0,
        formEncType: void 0,
        formData: void 0,
        json: void 0,
        text: void 0
    },
    We = {
        state: "unblocked",
        proceed: void 0,
        reset: void 0,
        location: void 0
    },
    Vt = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
    Da = e => ({
        hasErrorBoundary: !!e.hasErrorBoundary
    }),
    qr = "remix-router-transitions";

function La(e) {
    const t = e.window ? e.window : typeof window < "u" ? window : void 0,
        r = typeof t < "u" && typeof t.document < "u" && typeof t.document.createElement < "u",
        n = !r;
    A(e.routes.length > 0, "You must provide a non-empty routes array to createRouter");
    let a;
    if (e.mapRouteProperties) a = e.mapRouteProperties;
    else if (e.detectErrorBoundary) {
        let l = e.detectErrorBoundary;
        a = u => ({
            hasErrorBoundary: l(u)
        })
    } else a = Da;
    let o = {},
        i = bt(e.routes, a, void 0, o),
        c, s = e.basename || "/",
        d = e.dataStrategy || Aa,
        m = e.patchRoutesOnNavigation,
        h = Y({
            v7_fetcherPersist: !1,
            v7_normalizeFormMethod: !1,
            v7_partialHydration: !1,
            v7_prependBasename: !1,
            v7_relativeSplatPath: !1,
            v7_skipActionErrorRevalidation: !1
        }, e.future),
        g = null,
        E = new Set,
        C = null,
        b = null,
        x = null,
        k = e.hydrationData != null,
        D = Oe(i, e.history.location, s),
        B = !1,
        G = null;
    if (D == null && !m) {
        let l = oe(404, {
                pathname: e.history.location.pathname
            }),
            {
                matches: u,
                route: f
            } = Tr(i);
        D = u, G = {
            [f.id]: l
        }
    }
    D && !e.hydrationData && mt(D, i, e.history.location.pathname).active && (D = null);
    let J;
    if (D)
        if (D.some(l => l.route.lazy)) J = !1;
        else if (!D.some(l => l.route.loader)) J = !0;
    else if (h.v7_partialHydration) {
        let l = e.hydrationData ? e.hydrationData.loaderData : null,
            u = e.hydrationData ? e.hydrationData.errors : null;
        if (u) {
            let f = D.findIndex(y => u[y.route.id] !== void 0);
            J = D.slice(0, f + 1).every(y => !Ft(y.route, l, u))
        } else J = D.every(f => !Ft(f.route, l, u))
    } else J = e.hydrationData != null;
    else if (J = !1, D = [], h.v7_partialHydration) {
        let l = mt(null, i, e.history.location.pathname);
        l.active && l.matches && (B = !0, D = l.matches)
    }
    let Ce, p = {
            historyAction: e.history.action,
            location: e.history.location,
            matches: D,
            initialized: J,
            navigation: At,
            restoreScrollPosition: e.hydrationData != null ? !1 : null,
            preventScrollReset: !1,
            revalidation: "idle",
            loaderData: e.hydrationData && e.hydrationData.loaderData || {},
            actionData: e.hydrationData && e.hydrationData.actionData || null,
            errors: e.hydrationData && e.hydrationData.errors || G,
            fetchers: new Map,
            blockers: new Map
        },
        O = q.Pop,
        W = !1,
        j, te = !1,
        X = new Map,
        le = null,
        ie = !1,
        he = !1,
        ut = [],
        ct = new Set,
        Z = new Map,
        ft = 0,
        Xe = -1,
        Ne = new Map,
        pe = new Set,
        Ie = new Map,
        Qe = new Map,
        ue = new Set,
        Te = new Map,
        xe = new Map,
        dt;

    function pn() {
        if (g = e.history.listen(l => {
                let {
                    action: u,
                    location: f,
                    delta: y
                } = l;
                if (dt) {
                    dt(), dt = void 0;
                    return
                }
                Ye(xe.size === 0 || y != null, "You are trying to use a blocker on a POP navigation to a location that was not created by @remix-run/router. This will fail silently in production. This can happen if you are navigating outside the router via `window.history.pushState`/`window.location.hash` instead of using router navigation APIs.  This can also happen if you are using createHashRouter and the user manually changes the URL.");
                let R = ir({
                    currentLocation: p.location,
                    nextLocation: f,
                    historyAction: u
                });
                if (R && y != null) {
                    let T = new Promise(L => {
                        dt = L
                    });
                    e.history.go(y * -1), pt(R, {
                        state: "blocked",
                        location: f,
                        proceed() {
                            pt(R, {
                                state: "proceeding",
                                proceed: void 0,
                                reset: void 0,
                                location: f
                            }), T.then(() => e.history.go(y))
                        },
                        reset() {
                            let L = new Map(p.blockers);
                            L.set(R, We), re({
                                blockers: L
                            })
                        }
                    });
                    return
                }
                return De(u, f)
            }), r) {
            Ga(t, X);
            let l = () => Ja(t, X);
            t.addEventListener("pagehide", l), le = () => t.removeEventListener("pagehide", l)
        }
        return p.initialized || De(q.Pop, p.location, {
            initialHydration: !0
        }), Ce
    }

    function mn() {
        g && g(), le && le(), E.clear(), j && j.abort(), p.fetchers.forEach((l, u) => ht(u)), p.blockers.forEach((l, u) => ar(u))
    }

    function vn(l) {
        return E.add(l), () => E.delete(l)
    }

    function re(l, u) {
        u === void 0 && (u = {}), p = Y({}, p, l);
        let f = [],
            y = [];
        h.v7_fetcherPersist && p.fetchers.forEach((R, T) => {
            R.state === "idle" && (ue.has(T) ? y.push(T) : f.push(T))
        }), ue.forEach(R => {
            !p.fetchers.has(R) && !Z.has(R) && y.push(R)
        }), [...E].forEach(R => R(p, {
            deletedFetchers: y,
            viewTransitionOpts: u.viewTransitionOpts,
            flushSync: u.flushSync === !0
        })), h.v7_fetcherPersist ? (f.forEach(R => p.fetchers.delete(R)), y.forEach(R => ht(R))) : y.forEach(R => ue.delete(R))
    }

    function Fe(l, u, f) {
        var y, R;
        let {
            flushSync: T
        } = f === void 0 ? {} : f, L = p.actionData != null && p.navigation.formMethod != null && ce(p.navigation.formMethod) && p.navigation.state === "loading" && ((y = l.state) == null ? void 0 : y._isRedirect) !== !0, S;
        u.actionData ? Object.keys(u.actionData).length > 0 ? S = u.actionData : S = null : L ? S = p.actionData : S = null;
        let _ = u.loaderData ? Pr(p.loaderData, u.loaderData, u.matches || [], u.errors) : p.loaderData,
            w = p.blockers;
        w.size > 0 && (w = new Map(w), w.forEach((N, ee) => w.set(ee, We)));
        let P = W === !0 || p.navigation.formMethod != null && ce(p.navigation.formMethod) && ((R = l.state) == null ? void 0 : R._isRedirect) !== !0;
        c && (i = c, c = void 0), ie || O === q.Pop || (O === q.Push ? e.history.push(l, l.state) : O === q.Replace && e.history.replace(l, l.state));
        let U;
        if (O === q.Pop) {
            let N = X.get(p.location.pathname);
            N && N.has(l.pathname) ? U = {
                currentLocation: p.location,
                nextLocation: l
            } : X.has(l.pathname) && (U = {
                currentLocation: l,
                nextLocation: p.location
            })
        } else if (te) {
            let N = X.get(p.location.pathname);
            N ? N.add(l.pathname) : (N = new Set([l.pathname]), X.set(p.location.pathname, N)), U = {
                currentLocation: p.location,
                nextLocation: l
            }
        }
        re(Y({}, u, {
            actionData: S,
            loaderData: _,
            historyAction: O,
            location: l,
            initialized: !0,
            navigation: At,
            revalidation: "idle",
            restoreScrollPosition: lr(l, u.matches || p.matches),
            preventScrollReset: P,
            blockers: w
        }), {
            viewTransitionOpts: U,
            flushSync: T === !0
        }), O = q.Pop, W = !1, te = !1, ie = !1, he = !1, ut = []
    }
    async function Qt(l, u) {
        if (typeof l == "number") {
            e.history.go(l);
            return
        }
        let f = It(p.location, p.matches, s, h.v7_prependBasename, l, h.v7_relativeSplatPath, u == null ? void 0 : u.fromRouteId, u == null ? void 0 : u.relative),
            {
                path: y,
                submission: R,
                error: T
            } = yr(h.v7_normalizeFormMethod, !1, f, u),
            L = p.location,
            S = ot(p.location, y, u && u.state);
        S = Y({}, S, e.history.encodeLocation(S));
        let _ = u && u.replace != null ? u.replace : void 0,
            w = q.Push;
        _ === !0 ? w = q.Replace : _ === !1 || R != null && ce(R.formMethod) && R.formAction === p.location.pathname + p.location.search && (w = q.Replace);
        let P = u && "preventScrollReset" in u ? u.preventScrollReset === !0 : void 0,
            U = (u && u.flushSync) === !0,
            N = ir({
                currentLocation: L,
                nextLocation: S,
                historyAction: w
            });
        if (N) {
            pt(N, {
                state: "blocked",
                location: S,
                proceed() {
                    pt(N, {
                        state: "proceeding",
                        proceed: void 0,
                        reset: void 0,
                        location: S
                    }), Qt(l, u)
                },
                reset() {
                    let ee = new Map(p.blockers);
                    ee.set(N, We), re({
                        blockers: ee
                    })
                }
            });
            return
        }
        return await De(w, S, {
            submission: R,
            pendingError: T,
            preventScrollReset: P,
            replace: u && u.replace,
            enableViewTransition: u && u.viewTransition,
            flushSync: U
        })
    }

    function yn() {
        if (xt(), re({
                revalidation: "loading"
            }), p.navigation.state !== "submitting") {
            if (p.navigation.state === "idle") {
                De(p.historyAction, p.location, {
                    startUninterruptedRevalidation: !0
                });
                return
            }
            De(O || p.historyAction, p.navigation.location, {
                overrideNavigation: p.navigation,
                enableViewTransition: te === !0
            })
        }
    }
    async function De(l, u, f) {
        j && j.abort(), j = null, O = l, ie = (f && f.startUninterruptedRevalidation) === !0, Tn(p.location, p.matches), W = (f && f.preventScrollReset) === !0, te = (f && f.enableViewTransition) === !0;
        let y = c || i,
            R = f && f.overrideNavigation,
            T = f != null && f.initialHydration && p.matches && p.matches.length > 0 && !B ? p.matches : Oe(y, u, s),
            L = (f && f.flushSync) === !0;
        if (T && p.initialized && !he && Ha(p.location, u) && !(f && f.submission && ce(f.submission.formMethod))) {
            Fe(u, {
                matches: T
            }, {
                flushSync: L
            });
            return
        }
        let S = mt(T, y, u.pathname);
        if (S.active && S.matches && (T = S.matches), !T) {
            let {
                error: z,
                notFoundMatches: F,
                route: V
            } = Dt(u.pathname);
            Fe(u, {
                matches: F,
                loaderData: {},
                errors: {
                    [V.id]: z
                }
            }, {
                flushSync: L
            });
            return
        }
        j = new AbortController;
        let _ = ze(e.history, u, j.signal, f && f.submission),
            w;
        if (f && f.pendingError) w = [Ue(T).route.id, {
            type: H.error,
            error: f.pendingError
        }];
        else if (f && f.submission && ce(f.submission.formMethod)) {
            let z = await gn(_, u, f.submission, T, S.active, {
                replace: f.replace,
                flushSync: L
            });
            if (z.shortCircuited) return;
            if (z.pendingActionResult) {
                let [F, V] = z.pendingActionResult;
                if (se(V) && lt(V.error) && V.error.status === 404) {
                    j = null, Fe(u, {
                        matches: z.matches,
                        loaderData: {},
                        errors: {
                            [F]: V.error
                        }
                    });
                    return
                }
            }
            T = z.matches || T, w = z.pendingActionResult, R = jt(u, f.submission), L = !1, S.active = !1, _ = ze(e.history, _.url, _.signal)
        }
        let {
            shortCircuited: P,
            matches: U,
            loaderData: N,
            errors: ee
        } = await En(_, u, T, S.active, R, f && f.submission, f && f.fetcherSubmission, f && f.replace, f && f.initialHydration === !0, L, w);
        P || (j = null, Fe(u, Y({
            matches: U || T
        }, Cr(w), {
            loaderData: N,
            errors: ee
        })))
    }
    async function gn(l, u, f, y, R, T) {
        T === void 0 && (T = {}), xt();
        let L = Va(u, f);
        if (re({
                navigation: L
            }, {
                flushSync: T.flushSync === !0
            }), R) {
            let w = await vt(y, u.pathname, l.signal);
            if (w.type === "aborted") return {
                shortCircuited: !0
            };
            if (w.type === "error") {
                let P = Ue(w.partialMatches).route.id;
                return {
                    matches: w.partialMatches,
                    pendingActionResult: [P, {
                        type: H.error,
                        error: w.error
                    }]
                }
            } else if (w.matches) y = w.matches;
            else {
                let {
                    notFoundMatches: P,
                    error: U,
                    route: N
                } = Dt(u.pathname);
                return {
                    matches: P,
                    pendingActionResult: [N.id, {
                        type: H.error,
                        error: U
                    }]
                }
            }
        }
        let S, _ = at(y, u);
        if (!_.route.action && !_.route.lazy) S = {
            type: H.error,
            error: oe(405, {
                method: l.method,
                pathname: u.pathname,
                routeId: _.route.id
            })
        };
        else if (S = (await qe("action", p, l, [_], y, null))[_.route.id], l.signal.aborted) return {
            shortCircuited: !0
        };
        if (Ae(S)) {
            let w;
            return T && T.replace != null ? w = T.replace : w = br(S.response.headers.get("Location"), new URL(l.url), s) === p.location.pathname + p.location.search, await Le(l, S, !0, {
                submission: f,
                replace: w
            }), {
                shortCircuited: !0
            }
        }
        if (be(S)) throw oe(400, {
            type: "defer-action"
        });
        if (se(S)) {
            let w = Ue(y, _.route.id);
            return (T && T.replace) !== !0 && (O = q.Push), {
                matches: y,
                pendingActionResult: [w.route.id, S]
            }
        }
        return {
            matches: y,
            pendingActionResult: [_.route.id, S]
        }
    }
    async function En(l, u, f, y, R, T, L, S, _, w, P) {
        let U = R || jt(u, T),
            N = T || L || Dr(U),
            ee = !ie && (!h.v7_partialHydration || !_);
        if (y) {
            if (ee) {
                let K = qt(P);
                re(Y({
                    navigation: U
                }, K !== void 0 ? {
                    actionData: K
                } : {}), {
                    flushSync: w
                })
            }
            let I = await vt(f, u.pathname, l.signal);
            if (I.type === "aborted") return {
                shortCircuited: !0
            };
            if (I.type === "error") {
                let K = Ue(I.partialMatches).route.id;
                return {
                    matches: I.partialMatches,
                    loaderData: {},
                    errors: {
                        [K]: I.error
                    }
                }
            } else if (I.matches) f = I.matches;
            else {
                let {
                    error: K,
                    notFoundMatches: He,
                    route: tt
                } = Dt(u.pathname);
                return {
                    matches: He,
                    loaderData: {},
                    errors: {
                        [tt.id]: K
                    }
                }
            }
        }
        let z = c || i,
            [F, V] = Er(e.history, p, f, N, u, h.v7_partialHydration && _ === !0, h.v7_skipActionErrorRevalidation, he, ut, ct, ue, Ie, pe, z, s, P);
        if (Lt(I => !(f && f.some(K => K.route.id === I)) || F && F.some(K => K.route.id === I)), Xe = ++ft, F.length === 0 && V.length === 0) {
            let I = rr();
            return Fe(u, Y({
                matches: f,
                loaderData: {},
                errors: P && se(P[1]) ? {
                    [P[0]]: P[1].error
                } : null
            }, Cr(P), I ? {
                fetchers: new Map(p.fetchers)
            } : {}), {
                flushSync: w
            }), {
                shortCircuited: !0
            }
        }
        if (ee) {
            let I = {};
            if (!y) {
                I.navigation = U;
                let K = qt(P);
                K !== void 0 && (I.actionData = K)
            }
            V.length > 0 && (I.fetchers = Rn(V)), re(I, {
                flushSync: w
            })
        }
        V.forEach(I => {
            Ee(I.key), I.controller && Z.set(I.key, I.controller)
        });
        let ke = () => V.forEach(I => Ee(I.key));
        j && j.signal.addEventListener("abort", ke);
        let {
            loaderResults: Ze,
            fetcherResults: ve
        } = await Zt(p, f, F, V, l);
        if (l.signal.aborted) return {
            shortCircuited: !0
        };
        j && j.signal.removeEventListener("abort", ke), V.forEach(I => Z.delete(I.key));
        let fe = Rt(Ze);
        if (fe) return await Le(l, fe.result, !0, {
            replace: S
        }), {
            shortCircuited: !0
        };
        if (fe = Rt(ve), fe) return pe.add(fe.key), await Le(l, fe.result, !0, {
            replace: S
        }), {
            shortCircuited: !0
        };
        let {
            loaderData: Mt,
            errors: et
        } = _r(p, f, Ze, P, V, ve, Te);
        Te.forEach((I, K) => {
            I.subscribe(He => {
                (He || I.done) && Te.delete(K)
            })
        }), h.v7_partialHydration && _ && p.errors && (et = Y({}, p.errors, et));
        let Me = rr(),
            yt = nr(Xe),
            gt = Me || yt || V.length > 0;
        return Y({
            matches: f,
            loaderData: Mt,
            errors: et
        }, gt ? {
            fetchers: new Map(p.fetchers)
        } : {})
    }

    function qt(l) {
        if (l && !se(l[1])) return {
            [l[0]]: l[1].data
        };
        if (p.actionData) return Object.keys(p.actionData).length === 0 ? null : p.actionData
    }

    function Rn(l) {
        return l.forEach(u => {
            let f = p.fetchers.get(u.key),
                y = rt(void 0, f ? f.data : void 0);
            p.fetchers.set(u.key, y)
        }), new Map(p.fetchers)
    }

    function wn(l, u, f, y) {
        if (n) throw new Error("router.fetch() was called during the server render, but it shouldn't be. You are likely calling a useFetcher() method in the body of your component. Try moving it to a useEffect or a callback.");
        Ee(l);
        let R = (y && y.flushSync) === !0,
            T = c || i,
            L = It(p.location, p.matches, s, h.v7_prependBasename, f, h.v7_relativeSplatPath, u, y == null ? void 0 : y.relative),
            S = Oe(T, L, s),
            _ = mt(S, T, L);
        if (_.active && _.matches && (S = _.matches), !S) {
            me(l, u, oe(404, {
                pathname: L
            }), {
                flushSync: R
            });
            return
        }
        let {
            path: w,
            submission: P,
            error: U
        } = yr(h.v7_normalizeFormMethod, !0, L, y);
        if (U) {
            me(l, u, U, {
                flushSync: R
            });
            return
        }
        let N = at(S, w),
            ee = (y && y.preventScrollReset) === !0;
        if (P && ce(P.formMethod)) {
            bn(l, u, w, N, S, _.active, R, ee, P);
            return
        }
        Ie.set(l, {
            routeId: u,
            path: w
        }), Sn(l, u, w, N, S, _.active, R, ee, P)
    }
    async function bn(l, u, f, y, R, T, L, S, _) {
        xt(), Ie.delete(l);

        function w(Q) {
            if (!Q.route.action && !Q.route.lazy) {
                let Be = oe(405, {
                    method: _.formMethod,
                    pathname: f,
                    routeId: u
                });
                return me(l, u, Be, {
                    flushSync: L
                }), !0
            }
            return !1
        }
        if (!T && w(y)) return;
        let P = p.fetchers.get(l);
        ge(l, Ka(_, P), {
            flushSync: L
        });
        let U = new AbortController,
            N = ze(e.history, f, U.signal, _);
        if (T) {
            let Q = await vt(R, new URL(N.url).pathname, N.signal, l);
            if (Q.type === "aborted") return;
            if (Q.type === "error") {
                me(l, u, Q.error, {
                    flushSync: L
                });
                return
            } else if (Q.matches) {
                if (R = Q.matches, y = at(R, f), w(y)) return
            } else {
                me(l, u, oe(404, {
                    pathname: f
                }), {
                    flushSync: L
                });
                return
            }
        }
        Z.set(l, U);
        let ee = ft,
            F = (await qe("action", p, N, [y], R, l))[y.route.id];
        if (N.signal.aborted) {
            Z.get(l) === U && Z.delete(l);
            return
        }
        if (h.v7_fetcherPersist && ue.has(l)) {
            if (Ae(F) || se(F)) {
                ge(l, we(void 0));
                return
            }
        } else {
            if (Ae(F))
                if (Z.delete(l), Xe > ee) {
                    ge(l, we(void 0));
                    return
                } else return pe.add(l), ge(l, rt(_)), Le(N, F, !1, {
                    fetcherSubmission: _,
                    preventScrollReset: S
                });
            if (se(F)) {
                me(l, u, F.error);
                return
            }
        }
        if (be(F)) throw oe(400, {
            type: "defer-action"
        });
        let V = p.navigation.location || p.location,
            ke = ze(e.history, V, U.signal),
            Ze = c || i,
            ve = p.navigation.state !== "idle" ? Oe(Ze, p.navigation.location, s) : p.matches;
        A(ve, "Didn't find any matches after fetcher action");
        let fe = ++ft;
        Ne.set(l, fe);
        let Mt = rt(_, F.data);
        p.fetchers.set(l, Mt);
        let [et, Me] = Er(e.history, p, ve, _, V, !1, h.v7_skipActionErrorRevalidation, he, ut, ct, ue, Ie, pe, Ze, s, [y.route.id, F]);
        Me.filter(Q => Q.key !== l).forEach(Q => {
            let Be = Q.key,
                sr = p.fetchers.get(Be),
                Ln = rt(void 0, sr ? sr.data : void 0);
            p.fetchers.set(Be, Ln), Ee(Be), Q.controller && Z.set(Be, Q.controller)
        }), re({
            fetchers: new Map(p.fetchers)
        });
        let yt = () => Me.forEach(Q => Ee(Q.key));
        U.signal.addEventListener("abort", yt);
        let {
            loaderResults: gt,
            fetcherResults: I
        } = await Zt(p, ve, et, Me, ke);
        if (U.signal.aborted) return;
        U.signal.removeEventListener("abort", yt), Ne.delete(l), Z.delete(l), Me.forEach(Q => Z.delete(Q.key));
        let K = Rt(gt);
        if (K) return Le(ke, K.result, !1, {
            preventScrollReset: S
        });
        if (K = Rt(I), K) return pe.add(K.key), Le(ke, K.result, !1, {
            preventScrollReset: S
        });
        let {
            loaderData: He,
            errors: tt
        } = _r(p, ve, gt, void 0, Me, I, Te);
        if (p.fetchers.has(l)) {
            let Q = we(F.data);
            p.fetchers.set(l, Q)
        }
        nr(fe), p.navigation.state === "loading" && fe > Xe ? (A(O, "Expected pending action"), j && j.abort(), Fe(p.navigation.location, {
            matches: ve,
            loaderData: He,
            errors: tt,
            fetchers: new Map(p.fetchers)
        })) : (re({
            errors: tt,
            loaderData: Pr(p.loaderData, He, ve, tt),
            fetchers: new Map(p.fetchers)
        }), he = !1)
    }
    async function Sn(l, u, f, y, R, T, L, S, _) {
        let w = p.fetchers.get(l);
        ge(l, rt(_, w ? w.data : void 0), {
            flushSync: L
        });
        let P = new AbortController,
            U = ze(e.history, f, P.signal);
        if (T) {
            let F = await vt(R, new URL(U.url).pathname, U.signal, l);
            if (F.type === "aborted") return;
            if (F.type === "error") {
                me(l, u, F.error, {
                    flushSync: L
                });
                return
            } else if (F.matches) R = F.matches, y = at(R, f);
            else {
                me(l, u, oe(404, {
                    pathname: f
                }), {
                    flushSync: L
                });
                return
            }
        }
        Z.set(l, P);
        let N = ft,
            z = (await qe("loader", p, U, [y], R, l))[y.route.id];
        if (be(z) && (z = await Kt(z, U.signal, !0) || z), Z.get(l) === P && Z.delete(l), !U.signal.aborted) {
            if (ue.has(l)) {
                ge(l, we(void 0));
                return
            }
            if (Ae(z))
                if (Xe > N) {
                    ge(l, we(void 0));
                    return
                } else {
                    pe.add(l), await Le(U, z, !1, {
                        preventScrollReset: S
                    });
                    return
                }
            if (se(z)) {
                me(l, u, z.error);
                return
            }
            A(!be(z), "Unhandled fetcher deferred data"), ge(l, we(z.data))
        }
    }
    async function Le(l, u, f, y) {
        let {
            submission: R,
            fetcherSubmission: T,
            preventScrollReset: L,
            replace: S
        } = y === void 0 ? {} : y;
        u.response.headers.has("X-Remix-Revalidate") && (he = !0);
        let _ = u.response.headers.get("Location");
        A(_, "Expected a Location header on the redirect Response"), _ = br(_, new URL(l.url), s);
        let w = ot(p.location, _, {
            _isRedirect: !0
        });
        if (r) {
            let F = !1;
            if (u.response.headers.has("X-Remix-Reload-Document")) F = !0;
            else if (Vt.test(_)) {
                const V = e.history.createURL(_);
                F = V.origin !== t.location.origin || Se(V.pathname, s) == null
            }
            if (F) {
                S ? t.location.replace(_) : t.location.assign(_);
                return
            }
        }
        j = null;
        let P = S === !0 || u.response.headers.has("X-Remix-Replace") ? q.Replace : q.Push,
            {
                formMethod: U,
                formAction: N,
                formEncType: ee
            } = p.navigation;
        !R && !T && U && N && ee && (R = Dr(p.navigation));
        let z = R || T;
        if (Ta.has(u.response.status) && z && ce(z.formMethod)) await De(P, w, {
            submission: Y({}, z, {
                formAction: _
            }),
            preventScrollReset: L || W,
            enableViewTransition: f ? te : void 0
        });
        else {
            let F = jt(w, R);
            await De(P, w, {
                overrideNavigation: F,
                fetcherSubmission: T,
                preventScrollReset: L || W,
                enableViewTransition: f ? te : void 0
            })
        }
    }
    async function qe(l, u, f, y, R, T) {
        let L, S = {};
        try {
            L = await ja(d, l, u, f, y, R, T, o, a)
        } catch (_) {
            return y.forEach(w => {
                S[w.route.id] = {
                    type: H.error,
                    error: _
                }
            }), S
        }
        for (let [_, w] of Object.entries(L))
            if (Ba(w)) {
                let P = w.result;
                S[_] = {
                    type: H.redirect,
                    response: Fa(P, f, _, R, s, h.v7_relativeSplatPath)
                }
            } else S[_] = await Ia(w);
        return S
    }
    async function Zt(l, u, f, y, R) {
        let T = l.matches,
            L = qe("loader", l, R, f, u, null),
            S = Promise.all(y.map(async P => {
                if (P.matches && P.match && P.controller) {
                    let N = (await qe("loader", l, ze(e.history, P.path, P.controller.signal), [P.match], P.matches, P.key))[P.match.route.id];
                    return {
                        [P.key]: N
                    }
                } else return Promise.resolve({
                    [P.key]: {
                        type: H.error,
                        error: oe(404, {
                            pathname: P.path
                        })
                    }
                })
            })),
            _ = await L,
            w = (await S).reduce((P, U) => Object.assign(P, U), {});
        return await Promise.all([Wa(u, _, R.signal, T, l.loaderData), Ya(u, w, y)]), {
            loaderResults: _,
            fetcherResults: w
        }
    }

    function xt() {
        he = !0, ut.push(...Lt()), Ie.forEach((l, u) => {
            Z.has(u) && ct.add(u), Ee(u)
        })
    }

    function ge(l, u, f) {
        f === void 0 && (f = {}), p.fetchers.set(l, u), re({
            fetchers: new Map(p.fetchers)
        }, {
            flushSync: (f && f.flushSync) === !0
        })
    }

    function me(l, u, f, y) {
        y === void 0 && (y = {});
        let R = Ue(p.matches, u);
        ht(l), re({
            errors: {
                [R.route.id]: f
            },
            fetchers: new Map(p.fetchers)
        }, {
            flushSync: (y && y.flushSync) === !0
        })
    }

    function er(l) {
        return Qe.set(l, (Qe.get(l) || 0) + 1), ue.has(l) && ue.delete(l), p.fetchers.get(l) || xa
    }

    function ht(l) {
        let u = p.fetchers.get(l);
        Z.has(l) && !(u && u.state === "loading" && Ne.has(l)) && Ee(l), Ie.delete(l), Ne.delete(l), pe.delete(l), h.v7_fetcherPersist && ue.delete(l), ct.delete(l), p.fetchers.delete(l)
    }

    function _n(l) {
        let u = (Qe.get(l) || 0) - 1;
        u <= 0 ? (Qe.delete(l), ue.add(l), h.v7_fetcherPersist || ht(l)) : Qe.set(l, u), re({
            fetchers: new Map(p.fetchers)
        })
    }

    function Ee(l) {
        let u = Z.get(l);
        u && (u.abort(), Z.delete(l))
    }

    function tr(l) {
        for (let u of l) {
            let f = er(u),
                y = we(f.data);
            p.fetchers.set(u, y)
        }
    }

    function rr() {
        let l = [],
            u = !1;
        for (let f of pe) {
            let y = p.fetchers.get(f);
            A(y, "Expected fetcher: " + f), y.state === "loading" && (pe.delete(f), l.push(f), u = !0)
        }
        return tr(l), u
    }

    function nr(l) {
        let u = [];
        for (let [f, y] of Ne)
            if (y < l) {
                let R = p.fetchers.get(f);
                A(R, "Expected fetcher: " + f), R.state === "loading" && (Ee(f), Ne.delete(f), u.push(f))
            }
        return tr(u), u.length > 0
    }

    function Pn(l, u) {
        let f = p.blockers.get(l) || We;
        return xe.get(l) !== u && xe.set(l, u), f
    }

    function ar(l) {
        p.blockers.delete(l), xe.delete(l)
    }

    function pt(l, u) {
        let f = p.blockers.get(l) || We;
        A(f.state === "unblocked" && u.state === "blocked" || f.state === "blocked" && u.state === "blocked" || f.state === "blocked" && u.state === "proceeding" || f.state === "blocked" && u.state === "unblocked" || f.state === "proceeding" && u.state === "unblocked", "Invalid blocker state transition: " + f.state + " -> " + u.state);
        let y = new Map(p.blockers);
        y.set(l, u), re({
            blockers: y
        })
    }

    function ir(l) {
        let {
            currentLocation: u,
            nextLocation: f,
            historyAction: y
        } = l;
        if (xe.size === 0) return;
        xe.size > 1 && Ye(!1, "A router only supports one blocker at a time");
        let R = Array.from(xe.entries()),
            [T, L] = R[R.length - 1],
            S = p.blockers.get(T);
        if (!(S && S.state === "proceeding") && L({
                currentLocation: u,
                nextLocation: f,
                historyAction: y
            })) return T
    }

    function Dt(l) {
        let u = oe(404, {
                pathname: l
            }),
            f = c || i,
            {
                matches: y,
                route: R
            } = Tr(f);
        return Lt(), {
            notFoundMatches: y,
            route: R,
            error: u
        }
    }

    function Lt(l) {
        let u = [];
        return Te.forEach((f, y) => {
            (!l || l(y)) && (f.cancel(), u.push(y), Te.delete(y))
        }), u
    }

    function Cn(l, u, f) {
        if (C = l, x = u, b = f || null, !k && p.navigation === At) {
            k = !0;
            let y = lr(p.location, p.matches);
            y != null && re({
                restoreScrollPosition: y
            })
        }
        return () => {
            C = null, x = null, b = null
        }
    }

    function or(l, u) {
        return b && b(l, u.map(y => ia(y, p.loaderData))) || l.key
    }

    function Tn(l, u) {
        if (C && x) {
            let f = or(l, u);
            C[f] = x()
        }
    }

    function lr(l, u) {
        if (C) {
            let f = or(l, u),
                y = C[f];
            if (typeof y == "number") return y
        }
        return null
    }

    function mt(l, u, f) {
        if (m)
            if (l) {
                if (Object.keys(l[0].params).length > 0) return {
                    active: !0,
                    matches: wt(u, f, s, !0)
                }
            } else return {
                active: !0,
                matches: wt(u, f, s, !0) || []
            };
        return {
            active: !1,
            matches: null
        }
    }
    async function vt(l, u, f, y) {
        if (!m) return {
            type: "success",
            matches: l
        };
        let R = l;
        for (;;) {
            let T = c == null,
                L = c || i,
                S = o;
            try {
                await m({
                    signal: f,
                    path: u,
                    matches: R,
                    fetcherKey: y,
                    patch: (P, U) => {
                        f.aborted || wr(P, U, L, S, a)
                    }
                })
            } catch (P) {
                return {
                    type: "error",
                    error: P,
                    partialMatches: R
                }
            } finally {
                T && !f.aborted && (i = [...i])
            }
            if (f.aborted) return {
                type: "aborted"
            };
            let _ = Oe(L, u, s);
            if (_) return {
                type: "success",
                matches: _
            };
            let w = wt(L, u, s, !0);
            if (!w || R.length === w.length && R.every((P, U) => P.route.id === w[U].route.id)) return {
                type: "success",
                matches: null
            };
            R = w
        }
    }

    function xn(l) {
        o = {}, c = bt(l, a, void 0, o)
    }

    function Dn(l, u) {
        let f = c == null;
        wr(l, u, c || i, o, a), f && (i = [...i], re({}))
    }
    return Ce = {
        get basename() {
            return s
        },
        get future() {
            return h
        },
        get state() {
            return p
        },
        get routes() {
            return i
        },
        get window() {
            return t
        },
        initialize: pn,
        subscribe: vn,
        enableScrollRestoration: Cn,
        navigate: Qt,
        fetch: wn,
        revalidate: yn,
        createHref: l => e.history.createHref(l),
        encodeLocation: l => e.history.encodeLocation(l),
        getFetcher: er,
        deleteFetcher: _n,
        dispose: mn,
        getBlocker: Pn,
        deleteBlocker: ar,
        patchRoutes: Dn,
        _internalFetchControllers: Z,
        _internalActiveDeferreds: Te,
        _internalSetRoutes: xn
    }, Ce
}

function Ma(e) {
    return e != null && ("formData" in e && e.formData != null || "body" in e && e.body !== void 0)
}

function It(e, t, r, n, a, o, i, c) {
    let s, d;
    if (i) {
        s = [];
        for (let h of t)
            if (s.push(h), h.route.id === i) {
                d = h;
                break
            }
    } else s = t, d = t[t.length - 1];
    let m = Ct(a || ".", Pt(s, o), Se(e.pathname, r) || e.pathname, c === "path");
    if (a == null && (m.search = e.search, m.hash = e.hash), (a == null || a === "" || a === ".") && d) {
        let h = Gt(m.search);
        if (d.route.index && !h) m.search = m.search ? m.search.replace(/^\?/, "?index&") : "?index";
        else if (!d.route.index && h) {
            let g = new URLSearchParams(m.search),
                E = g.getAll("index");
            g.delete("index"), E.filter(b => b).forEach(b => g.append("index", b));
            let C = g.toString();
            m.search = C ? "?" + C : ""
        }
    }
    return n && r !== "/" && (m.pathname = m.pathname === "/" ? r : ye([r, m.pathname])), je(m)
}

function yr(e, t, r, n) {
    if (!n || !Ma(n)) return {
        path: r
    };
    if (n.formMethod && !$a(n.formMethod)) return {
        path: r,
        error: oe(405, {
            method: n.formMethod
        })
    };
    let a = () => ({
            path: r,
            error: oe(400, {
                type: "invalid-body"
            })
        }),
        o = n.formMethod || "get",
        i = e ? o.toUpperCase() : o.toLowerCase(),
        c = tn(r);
    if (n.body !== void 0) {
        if (n.formEncType === "text/plain") {
            if (!ce(i)) return a();
            let g = typeof n.body == "string" ? n.body : n.body instanceof FormData || n.body instanceof URLSearchParams ? Array.from(n.body.entries()).reduce((E, C) => {
                let [b, x] = C;
                return "" + E + b + "=" + x + `
`
            }, "") : String(n.body);
            return {
                path: r,
                submission: {
                    formMethod: i,
                    formAction: c,
                    formEncType: n.formEncType,
                    formData: void 0,
                    json: void 0,
                    text: g
                }
            }
        } else if (n.formEncType === "application/json") {
            if (!ce(i)) return a();
            try {
                let g = typeof n.body == "string" ? JSON.parse(n.body) : n.body;
                return {
                    path: r,
                    submission: {
                        formMethod: i,
                        formAction: c,
                        formEncType: n.formEncType,
                        formData: void 0,
                        json: g,
                        text: void 0
                    }
                }
            } catch {
                return a()
            }
        }
    }
    A(typeof FormData == "function", "FormData is not available in this environment");
    let s, d;
    if (n.formData) s = kt(n.formData), d = n.formData;
    else if (n.body instanceof FormData) s = kt(n.body), d = n.body;
    else if (n.body instanceof URLSearchParams) s = n.body, d = Sr(s);
    else if (n.body == null) s = new URLSearchParams, d = new FormData;
    else try {
        s = new URLSearchParams(n.body), d = Sr(s)
    } catch {
        return a()
    }
    let m = {
        formMethod: i,
        formAction: c,
        formEncType: n && n.formEncType || "application/x-www-form-urlencoded",
        formData: d,
        json: void 0,
        text: void 0
    };
    if (ce(m.formMethod)) return {
        path: r,
        submission: m
    };
    let h = _e(r);
    return t && h.search && Gt(h.search) && s.append("index", ""), h.search = "?" + s, {
        path: je(h),
        submission: m
    }
}

function gr(e, t, r) {
    r === void 0 && (r = !1);
    let n = e.findIndex(a => a.route.id === t);
    return n >= 0 ? e.slice(0, r ? n + 1 : n) : e
}

function Er(e, t, r, n, a, o, i, c, s, d, m, h, g, E, C, b) {
    let x = b ? se(b[1]) ? b[1].error : b[1].data : void 0,
        k = e.createURL(t.location),
        D = e.createURL(a),
        B = r;
    o && t.errors ? B = gr(r, Object.keys(t.errors)[0], !0) : b && se(b[1]) && (B = gr(r, b[0]));
    let G = b ? b[1].statusCode : void 0,
        J = i && G && G >= 400,
        Ce = B.filter((O, W) => {
            let {
                route: j
            } = O;
            if (j.lazy) return !0;
            if (j.loader == null) return !1;
            if (o) return Ft(j, t.loaderData, t.errors);
            if (Oa(t.loaderData, t.matches[W], O) || s.some(le => le === O.route.id)) return !0;
            let te = t.matches[W],
                X = O;
            return Rr(O, Y({
                currentUrl: k,
                currentParams: te.params,
                nextUrl: D,
                nextParams: X.params
            }, n, {
                actionResult: x,
                actionStatus: G,
                defaultShouldRevalidate: J ? !1 : c || k.pathname + k.search === D.pathname + D.search || k.search !== D.search || Zr(te, X)
            }))
        }),
        p = [];
    return h.forEach((O, W) => {
        if (o || !r.some(ie => ie.route.id === O.routeId) || m.has(W)) return;
        let j = Oe(E, O.path, C);
        if (!j) {
            p.push({
                key: W,
                routeId: O.routeId,
                path: O.path,
                matches: null,
                match: null,
                controller: null
            });
            return
        }
        let te = t.fetchers.get(W),
            X = at(j, O.path),
            le = !1;
        g.has(W) ? le = !1 : d.has(W) ? (d.delete(W), le = !0) : te && te.state !== "idle" && te.data === void 0 ? le = c : le = Rr(X, Y({
            currentUrl: k,
            currentParams: t.matches[t.matches.length - 1].params,
            nextUrl: D,
            nextParams: r[r.length - 1].params
        }, n, {
            actionResult: x,
            actionStatus: G,
            defaultShouldRevalidate: J ? !1 : c
        })), le && p.push({
            key: W,
            routeId: O.routeId,
            path: O.path,
            matches: j,
            match: X,
            controller: new AbortController
        })
    }), [Ce, p]
}

function Ft(e, t, r) {
    if (e.lazy) return !0;
    if (!e.loader) return !1;
    let n = t != null && t[e.id] !== void 0,
        a = r != null && r[e.id] !== void 0;
    return !n && a ? !1 : typeof e.loader == "function" && e.loader.hydrate === !0 ? !0 : !n && !a
}

function Oa(e, t, r) {
    let n = !t || r.route.id !== t.route.id,
        a = e[r.route.id] === void 0;
    return n || a
}

function Zr(e, t) {
    let r = e.route.path;
    return e.pathname !== t.pathname || r != null && r.endsWith("*") && e.params["*"] !== t.params["*"]
}

function Rr(e, t) {
    if (e.route.shouldRevalidate) {
        let r = e.route.shouldRevalidate(t);
        if (typeof r == "boolean") return r
    }
    return t.defaultShouldRevalidate
}

function wr(e, t, r, n, a) {
    var o;
    let i;
    if (e) {
        let d = n[e];
        A(d, "No route found to patch children into: routeId = " + e), d.children || (d.children = []), i = d.children
    } else i = r;
    let c = t.filter(d => !i.some(m => en(d, m))),
        s = bt(c, a, [e || "_", "patch", String(((o = i) == null ? void 0 : o.length) || "0")], n);
    i.push(...s)
}

function en(e, t) {
    return "id" in e && "id" in t && e.id === t.id ? !0 : e.index === t.index && e.path === t.path && e.caseSensitive === t.caseSensitive ? (!e.children || e.children.length === 0) && (!t.children || t.children.length === 0) ? !0 : e.children.every((r, n) => {
        var a;
        return (a = t.children) == null ? void 0 : a.some(o => en(r, o))
    }) : !1
}
async function Ua(e, t, r) {
    if (!e.lazy) return;
    let n = await e.lazy();
    if (!e.lazy) return;
    let a = r[e.id];
    A(a, "No route found in manifest");
    let o = {};
    for (let i in n) {
        let s = a[i] !== void 0 && i !== "hasErrorBoundary";
        Ye(!s, 'Route "' + a.id + '" has a static property "' + i + '" defined but its lazy function is also returning a value for this property. ' + ('The lazy route property "' + i + '" will be ignored.')), !s && !na.has(i) && (o[i] = n[i])
    }
    Object.assign(a, o), Object.assign(a, Y({}, t(a), {
        lazy: void 0
    }))
}
async function Aa(e) {
    let {
        matches: t
    } = e, r = t.filter(a => a.shouldLoad);
    return (await Promise.all(r.map(a => a.resolve()))).reduce((a, o, i) => Object.assign(a, {
        [r[i].route.id]: o
    }), {})
}
async function ja(e, t, r, n, a, o, i, c, s, d) {
    let m = o.map(E => E.route.lazy ? Ua(E.route, s, c) : void 0),
        h = o.map((E, C) => {
            let b = m[C],
                x = a.some(D => D.route.id === E.route.id);
            return Y({}, E, {
                shouldLoad: x,
                resolve: async D => (D && n.method === "GET" && (E.route.lazy || E.route.loader) && (x = !0), x ? Na(t, n, E, b, D, d) : Promise.resolve({
                    type: H.data,
                    result: void 0
                }))
            })
        }),
        g = await e({
            matches: h,
            request: n,
            params: o[0].params,
            fetcherKey: i,
            context: d
        });
    try {
        await Promise.all(m)
    } catch {}
    return g
}
async function Na(e, t, r, n, a, o) {
    let i, c, s = d => {
        let m, h = new Promise((C, b) => m = b);
        c = () => m(), t.signal.addEventListener("abort", c);
        let g = C => typeof d != "function" ? Promise.reject(new Error("You cannot call the handler for a route which defines a boolean " + ('"' + e + '" [routeId: ' + r.route.id + "]"))) : d({
                request: t,
                params: r.params,
                context: o
            }, ...C !== void 0 ? [C] : []),
            E = (async () => {
                try {
                    return {
                        type: "data",
                        result: await (a ? a(b => g(b)) : g())
                    }
                } catch (C) {
                    return {
                        type: "error",
                        result: C
                    }
                }
            })();
        return Promise.race([E, h])
    };
    try {
        let d = r.route[e];
        if (n)
            if (d) {
                let m, [h] = await Promise.all([s(d).catch(g => {
                    m = g
                }), n]);
                if (m !== void 0) throw m;
                i = h
            } else if (await n, d = r.route[e], d) i = await s(d);
        else if (e === "action") {
            let m = new URL(t.url),
                h = m.pathname + m.search;
            throw oe(405, {
                method: t.method,
                pathname: h,
                routeId: r.route.id
            })
        } else return {
            type: H.data,
            result: void 0
        };
        else if (d) i = await s(d);
        else {
            let m = new URL(t.url),
                h = m.pathname + m.search;
            throw oe(404, {
                pathname: h
            })
        }
        A(i.result !== void 0, "You defined " + (e === "action" ? "an action" : "a loader") + " for route " + ('"' + r.route.id + "\" but didn't return anything from your `" + e + "` ") + "function. Please return a value or `null`.")
    } catch (d) {
        return {
            type: H.error,
            result: d
        }
    } finally {
        c && t.signal.removeEventListener("abort", c)
    }
    return i
}
async function Ia(e) {
    let {
        result: t,
        type: r
    } = e;
    if (rn(t)) {
        let h;
        try {
            let g = t.headers.get("Content-Type");
            g && /\bapplication\/json\b/.test(g) ? t.body == null ? h = null : h = await t.json() : h = await t.text()
        } catch (g) {
            return {
                type: H.error,
                error: g
            }
        }
        return r === H.error ? {
            type: H.error,
            error: new St(t.status, t.statusText, h),
            statusCode: t.status,
            headers: t.headers
        } : {
            type: H.data,
            data: h,
            statusCode: t.status,
            headers: t.headers
        }
    }
    if (r === H.error) {
        if (xr(t)) {
            var n, a;
            if (t.data instanceof Error) {
                var o, i;
                return {
                    type: H.error,
                    error: t.data,
                    statusCode: (o = t.init) == null ? void 0 : o.status,
                    headers: (i = t.init) != null && i.headers ? new Headers(t.init.headers) : void 0
                }
            }
            return {
                type: H.error,
                error: new St(((n = t.init) == null ? void 0 : n.status) || 500, void 0, t.data),
                statusCode: lt(t) ? t.status : void 0,
                headers: (a = t.init) != null && a.headers ? new Headers(t.init.headers) : void 0
            }
        }
        return {
            type: H.error,
            error: t,
            statusCode: lt(t) ? t.status : void 0
        }
    }
    if (za(t)) {
        var c, s;
        return {
            type: H.deferred,
            deferredData: t,
            statusCode: (c = t.init) == null ? void 0 : c.status,
            headers: ((s = t.init) == null ? void 0 : s.headers) && new Headers(t.init.headers)
        }
    }
    if (xr(t)) {
        var d, m;
        return {
            type: H.data,
            data: t.data,
            statusCode: (d = t.init) == null ? void 0 : d.status,
            headers: (m = t.init) != null && m.headers ? new Headers(t.init.headers) : void 0
        }
    }
    return {
        type: H.data,
        data: t
    }
}

function Fa(e, t, r, n, a, o) {
    let i = e.headers.get("Location");
    if (A(i, "Redirects returned/thrown from loaders/actions must have a Location header"), !Vt.test(i)) {
        let c = n.slice(0, n.findIndex(s => s.route.id === r) + 1);
        i = It(new URL(t.url), c, a, !0, i, o), e.headers.set("Location", i)
    }
    return e
}

function br(e, t, r) {
    if (Vt.test(e)) {
        let n = e,
            a = n.startsWith("//") ? new URL(t.protocol + n) : new URL(n),
            o = Se(a.pathname, r) != null;
        if (a.origin === t.origin && o) return a.pathname + a.search + a.hash
    }
    return e
}

function ze(e, t, r, n) {
    let a = e.createURL(tn(t)).toString(),
        o = {
            signal: r
        };
    if (n && ce(n.formMethod)) {
        let {
            formMethod: i,
            formEncType: c
        } = n;
        o.method = i.toUpperCase(), c === "application/json" ? (o.headers = new Headers({
            "Content-Type": c
        }), o.body = JSON.stringify(n.json)) : c === "text/plain" ? o.body = n.text : c === "application/x-www-form-urlencoded" && n.formData ? o.body = kt(n.formData) : o.body = n.formData
    }
    return new Request(a, o)
}

function kt(e) {
    let t = new URLSearchParams;
    for (let [r, n] of e.entries()) t.append(r, typeof n == "string" ? n : n.name);
    return t
}

function Sr(e) {
    let t = new FormData;
    for (let [r, n] of e.entries()) t.append(r, n);
    return t
}

function ka(e, t, r, n, a) {
    let o = {},
        i = null,
        c, s = !1,
        d = {},
        m = r && se(r[1]) ? r[1].error : void 0;
    return e.forEach(h => {
        if (!(h.route.id in t)) return;
        let g = h.route.id,
            E = t[g];
        if (A(!Ae(E), "Cannot handle redirect results in processLoaderData"), se(E)) {
            let C = E.error;
            m !== void 0 && (C = m, m = void 0), i = i || {}; {
                let b = Ue(e, g);
                i[b.route.id] == null && (i[b.route.id] = C)
            }
            o[g] = void 0, s || (s = !0, c = lt(E.error) ? E.error.status : 500), E.headers && (d[g] = E.headers)
        } else be(E) ? (n.set(g, E.deferredData), o[g] = E.deferredData.data, E.statusCode != null && E.statusCode !== 200 && !s && (c = E.statusCode), E.headers && (d[g] = E.headers)) : (o[g] = E.data, E.statusCode && E.statusCode !== 200 && !s && (c = E.statusCode), E.headers && (d[g] = E.headers))
    }), m !== void 0 && r && (i = {
        [r[0]]: m
    }, o[r[0]] = void 0), {
        loaderData: o,
        errors: i,
        statusCode: c || 200,
        loaderHeaders: d
    }
}

function _r(e, t, r, n, a, o, i) {
    let {
        loaderData: c,
        errors: s
    } = ka(t, r, n, i);
    return a.forEach(d => {
        let {
            key: m,
            match: h,
            controller: g
        } = d, E = o[m];
        if (A(E, "Did not find corresponding fetcher result"), !(g && g.signal.aborted))
            if (se(E)) {
                let C = Ue(e.matches, h == null ? void 0 : h.route.id);
                s && s[C.route.id] || (s = Y({}, s, {
                    [C.route.id]: E.error
                })), e.fetchers.delete(m)
            } else if (Ae(E)) A(!1, "Unhandled fetcher revalidation redirect");
        else if (be(E)) A(!1, "Unhandled fetcher deferred data");
        else {
            let C = we(E.data);
            e.fetchers.set(m, C)
        }
    }), {
        loaderData: c,
        errors: s
    }
}

function Pr(e, t, r, n) {
    let a = Y({}, t);
    for (let o of r) {
        let i = o.route.id;
        if (t.hasOwnProperty(i) ? t[i] !== void 0 && (a[i] = t[i]) : e[i] !== void 0 && o.route.loader && (a[i] = e[i]), n && n.hasOwnProperty(i)) break
    }
    return a
}

function Cr(e) {
    return e ? se(e[1]) ? {
        actionData: {}
    } : {
        actionData: {
            [e[0]]: e[1].data
        }
    } : {}
}

function Ue(e, t) {
    return (t ? e.slice(0, e.findIndex(n => n.route.id === t) + 1) : [...e]).reverse().find(n => n.route.hasErrorBoundary === !0) || e[0]
}

function Tr(e) {
    let t = e.length === 1 ? e[0] : e.find(r => r.index || !r.path || r.path === "/") || {
        id: "__shim-error-route__"
    };
    return {
        matches: [{
            params: {},
            pathname: "",
            pathnameBase: "",
            route: t
        }],
        route: t
    }
}

function oe(e, t) {
    let {
        pathname: r,
        routeId: n,
        method: a,
        type: o,
        message: i
    } = t === void 0 ? {} : t, c = "Unknown Server Error", s = "Unknown @remix-run/router error";
    return e === 400 ? (c = "Bad Request", a && r && n ? s = "You made a " + a + ' request to "' + r + '" but ' + ('did not provide a `loader` for route "' + n + '", ') + "so there is no way to handle the request." : o === "defer-action" ? s = "defer() is not supported in actions" : o === "invalid-body" && (s = "Unable to encode submission body")) : e === 403 ? (c = "Forbidden", s = 'Route "' + n + '" does not match URL "' + r + '"') : e === 404 ? (c = "Not Found", s = 'No route matches URL "' + r + '"') : e === 405 && (c = "Method Not Allowed", a && r && n ? s = "You made a " + a.toUpperCase() + ' request to "' + r + '" but ' + ('did not provide an `action` for route "' + n + '", ') + "so there is no way to handle the request." : a && (s = 'Invalid request method "' + a.toUpperCase() + '"')), new St(e || 500, c, new Error(s), !0)
}

function Rt(e) {
    let t = Object.entries(e);
    for (let r = t.length - 1; r >= 0; r--) {
        let [n, a] = t[r];
        if (Ae(a)) return {
            key: n,
            result: a
        }
    }
}

function tn(e) {
    let t = typeof e == "string" ? _e(e) : e;
    return je(Y({}, t, {
        hash: ""
    }))
}

function Ha(e, t) {
    return e.pathname !== t.pathname || e.search !== t.search ? !1 : e.hash === "" ? t.hash !== "" : e.hash === t.hash ? !0 : t.hash !== ""
}

function Ba(e) {
    return rn(e.result) && Ca.has(e.result.status)
}

function be(e) {
    return e.type === H.deferred
}

function se(e) {
    return e.type === H.error
}

function Ae(e) {
    return (e && e.type) === H.redirect
}

function xr(e) {
    return typeof e == "object" && e != null && "type" in e && "data" in e && "init" in e && e.type === "DataWithResponseInit"
}

function za(e) {
    let t = e;
    return t && typeof t == "object" && typeof t.data == "object" && typeof t.subscribe == "function" && typeof t.cancel == "function" && typeof t.resolveData == "function"
}

function rn(e) {
    return e != null && typeof e.status == "number" && typeof e.statusText == "string" && typeof e.headers == "object" && typeof e.body < "u"
}

function $a(e) {
    return Pa.has(e.toLowerCase())
}

function ce(e) {
    return Sa.has(e.toLowerCase())
}
async function Wa(e, t, r, n, a) {
    let o = Object.entries(t);
    for (let i = 0; i < o.length; i++) {
        let [c, s] = o[i], d = e.find(g => (g == null ? void 0 : g.route.id) === c);
        if (!d) continue;
        let m = n.find(g => g.route.id === d.route.id),
            h = m != null && !Zr(m, d) && (a && a[d.route.id]) !== void 0;
        be(s) && h && await Kt(s, r, !1).then(g => {
            g && (t[c] = g)
        })
    }
}
async function Ya(e, t, r) {
    for (let n = 0; n < r.length; n++) {
        let {
            key: a,
            routeId: o,
            controller: i
        } = r[n], c = t[a];
        e.find(d => (d == null ? void 0 : d.route.id) === o) && be(c) && (A(i, "Expected an AbortController for revalidating fetcher deferred result"), await Kt(c, i.signal, !0).then(d => {
            d && (t[a] = d)
        }))
    }
}
async function Kt(e, t, r) {
    if (r === void 0 && (r = !1), !await e.deferredData.resolveData(t)) {
        if (r) try {
            return {
                type: H.data,
                data: e.deferredData.unwrappedData
            }
        } catch (a) {
            return {
                type: H.error,
                error: a
            }
        }
        return {
            type: H.data,
            data: e.deferredData.data
        }
    }
}

function Gt(e) {
    return new URLSearchParams(e).getAll("index").some(t => t === "")
}

function at(e, t) {
    let r = typeof t == "string" ? _e(t).search : t.search;
    if (e[e.length - 1].route.index && Gt(r || "")) return e[e.length - 1];
    let n = Xr(e);
    return n[n.length - 1]
}

function Dr(e) {
    let {
        formMethod: t,
        formAction: r,
        formEncType: n,
        text: a,
        formData: o,
        json: i
    } = e;
    if (!(!t || !r || !n)) {
        if (a != null) return {
            formMethod: t,
            formAction: r,
            formEncType: n,
            formData: void 0,
            json: void 0,
            text: a
        };
        if (o != null) return {
            formMethod: t,
            formAction: r,
            formEncType: n,
            formData: o,
            json: void 0,
            text: void 0
        };
        if (i !== void 0) return {
            formMethod: t,
            formAction: r,
            formEncType: n,
            formData: void 0,
            json: i,
            text: void 0
        }
    }
}

function jt(e, t) {
    return t ? {
        state: "loading",
        location: e,
        formMethod: t.formMethod,
        formAction: t.formAction,
        formEncType: t.formEncType,
        formData: t.formData,
        json: t.json,
        text: t.text
    } : {
        state: "loading",
        location: e,
        formMethod: void 0,
        formAction: void 0,
        formEncType: void 0,
        formData: void 0,
        json: void 0,
        text: void 0
    }
}

function Va(e, t) {
    return {
        state: "submitting",
        location: e,
        formMethod: t.formMethod,
        formAction: t.formAction,
        formEncType: t.formEncType,
        formData: t.formData,
        json: t.json,
        text: t.text
    }
}

function rt(e, t) {
    return e ? {
        state: "loading",
        formMethod: e.formMethod,
        formAction: e.formAction,
        formEncType: e.formEncType,
        formData: e.formData,
        json: e.json,
        text: e.text,
        data: t
    } : {
        state: "loading",
        formMethod: void 0,
        formAction: void 0,
        formEncType: void 0,
        formData: void 0,
        json: void 0,
        text: void 0,
        data: t
    }
}

function Ka(e, t) {
    return {
        state: "submitting",
        formMethod: e.formMethod,
        formAction: e.formAction,
        formEncType: e.formEncType,
        formData: e.formData,
        json: e.json,
        text: e.text,
        data: t ? t.data : void 0
    }
}

function we(e) {
    return {
        state: "idle",
        formMethod: void 0,
        formAction: void 0,
        formEncType: void 0,
        formData: void 0,
        json: void 0,
        text: void 0,
        data: e
    }
}

function Ga(e, t) {
    try {
        let r = e.sessionStorage.getItem(qr);
        if (r) {
            let n = JSON.parse(r);
            for (let [a, o] of Object.entries(n || {})) o && Array.isArray(o) && t.set(a, new Set(o || []))
        }
    } catch {}
}

function Ja(e, t) {
    if (t.size > 0) {
        let r = {};
        for (let [n, a] of t) r[n] = [...a];
        try {
            e.sessionStorage.setItem(qr, JSON.stringify(r))
        } catch (n) {
            Ye(!1, "Failed to save applied view transitions in sessionStorage (" + n + ").")
        }
    }
}
/**
 * React Router v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function Ve() {
    return Ve = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n])
        }
        return e
    }, Ve.apply(this, arguments)
}
const Tt = v.createContext(null),
    nn = v.createContext(null),
    Pe = v.createContext(null),
    Jt = v.createContext(null),
    de = v.createContext({
        outlet: null,
        matches: [],
        isDataRoute: !1
    }),
    an = v.createContext(null);

function Xa(e, t) {
    let {
        relative: r
    } = t === void 0 ? {} : t;
    Ge() || A(!1);
    let {
        basename: n,
        navigator: a
    } = v.useContext(Pe), {
        hash: o,
        pathname: i,
        search: c
    } = sn(e, {
        relative: r
    }), s = i;
    return n !== "/" && (s = i === "/" ? n : ye([n, i])), a.createHref({
        pathname: s,
        search: c,
        hash: o
    })
}

function Ge() {
    return v.useContext(Jt) != null
}

function Je() {
    return Ge() || A(!1), v.useContext(Jt).location
}

function on(e) {
    v.useContext(Pe).static || v.useLayoutEffect(e)
}

function Xt() {
    let {
        isDataRoute: e
    } = v.useContext(de);
    return e ? si() : Qa()
}

function Qa() {
    Ge() || A(!1);
    let e = v.useContext(Tt),
        {
            basename: t,
            future: r,
            navigator: n
        } = v.useContext(Pe),
        {
            matches: a
        } = v.useContext(de),
        {
            pathname: o
        } = Je(),
        i = JSON.stringify(Pt(a, r.v7_relativeSplatPath)),
        c = v.useRef(!1);
    return on(() => {
        c.current = !0
    }), v.useCallback(function(d, m) {
        if (m === void 0 && (m = {}), !c.current) return;
        if (typeof d == "number") {
            n.go(d);
            return
        }
        let h = Ct(d, JSON.parse(i), o, m.relative === "path");
        e == null && t !== "/" && (h.pathname = h.pathname === "/" ? t : ye([t, h.pathname])), (m.replace ? n.replace : n.push)(h, m.state, m)
    }, [t, n, i, o, e])
}
const ln = v.createContext(null);

function Ai() {
    return v.useContext(ln)
}

function qa(e) {
    let t = v.useContext(de).outlet;
    return t && v.createElement(ln.Provider, {
        value: e
    }, t)
}

function ji() {
    let {
        matches: e
    } = v.useContext(de), t = e[e.length - 1];
    return t ? t.params : {}
}

function sn(e, t) {
    let {
        relative: r
    } = t === void 0 ? {} : t, {
        future: n
    } = v.useContext(Pe), {
        matches: a
    } = v.useContext(de), {
        pathname: o
    } = Je(), i = JSON.stringify(Pt(a, n.v7_relativeSplatPath));
    return v.useMemo(() => Ct(e, JSON.parse(i), o, r === "path"), [e, i, o, r])
}

function Za(e, t, r, n) {
    Ge() || A(!1);
    let {
        navigator: a
    } = v.useContext(Pe), {
        matches: o
    } = v.useContext(de), i = o[o.length - 1], c = i ? i.params : {};
    i && i.pathname;
    let s = i ? i.pathnameBase : "/";
    i && i.route;
    let d = Je(),
        m;
    m = d;
    let h = m.pathname || "/",
        g = h;
    if (s !== "/") {
        let b = s.replace(/^\//, "").split("/");
        g = "/" + h.replace(/^\//, "").split("/").slice(b.length).join("/")
    }
    let E = Oe(e, {
        pathname: g
    });
    return ai(E && E.map(b => Object.assign({}, b, {
        params: Object.assign({}, c, b.params),
        pathname: ye([s, a.encodeLocation ? a.encodeLocation(b.pathname).pathname : b.pathname]),
        pathnameBase: b.pathnameBase === "/" ? s : ye([s, a.encodeLocation ? a.encodeLocation(b.pathnameBase).pathname : b.pathnameBase])
    })), o, r, n)
}

function ei() {
    let e = oi(),
        t = lt(e) ? e.status + " " + e.statusText : e instanceof Error ? e.message : JSON.stringify(e),
        r = e instanceof Error ? e.stack : null,
        a = {
            padding: "0.5rem",
            backgroundColor: "rgba(200,200,200, 0.5)"
        };
    return v.createElement(v.Fragment, null, v.createElement("h2", null, "Unexpected Application Error!"), v.createElement("h3", {
        style: {
            fontStyle: "italic"
        }
    }, t), r ? v.createElement("pre", {
        style: a
    }, r) : null, null)
}
const ti = v.createElement(ei, null);
class ri extends v.Component {
    constructor(t) {
        super(t), this.state = {
            location: t.location,
            revalidation: t.revalidation,
            error: t.error
        }
    }
    static getDerivedStateFromError(t) {
        return {
            error: t
        }
    }
    static getDerivedStateFromProps(t, r) {
        return r.location !== t.location || r.revalidation !== "idle" && t.revalidation === "idle" ? {
            error: t.error,
            location: t.location,
            revalidation: t.revalidation
        } : {
            error: t.error !== void 0 ? t.error : r.error,
            location: r.location,
            revalidation: t.revalidation || r.revalidation
        }
    }
    componentDidCatch(t, r) {
        console.error("React Router caught the following error during render", t, r)
    }
    render() {
        return this.state.error !== void 0 ? v.createElement(de.Provider, {
            value: this.props.routeContext
        }, v.createElement(an.Provider, {
            value: this.state.error,
            children: this.props.component
        })) : this.props.children
    }
}

function ni(e) {
    let {
        routeContext: t,
        match: r,
        children: n
    } = e, a = v.useContext(Tt);
    return a && a.static && a.staticContext && (r.route.errorElement || r.route.ErrorBoundary) && (a.staticContext._deepestRenderedBoundaryId = r.route.id), v.createElement(de.Provider, {
        value: t
    }, n)
}

function ai(e, t, r, n) {
    var a;
    if (t === void 0 && (t = []), r === void 0 && (r = null), n === void 0 && (n = null), e == null) {
        var o;
        if (!r) return null;
        if (r.errors) e = r.matches;
        else if ((o = n) != null && o.v7_partialHydration && t.length === 0 && !r.initialized && r.matches.length > 0) e = r.matches;
        else return null
    }
    let i = e,
        c = (a = r) == null ? void 0 : a.errors;
    if (c != null) {
        let m = i.findIndex(h => h.route.id && (c == null ? void 0 : c[h.route.id]) !== void 0);
        m >= 0 || A(!1), i = i.slice(0, Math.min(i.length, m + 1))
    }
    let s = !1,
        d = -1;
    if (r && n && n.v7_partialHydration)
        for (let m = 0; m < i.length; m++) {
            let h = i[m];
            if ((h.route.HydrateFallback || h.route.hydrateFallbackElement) && (d = m), h.route.id) {
                let {
                    loaderData: g,
                    errors: E
                } = r, C = h.route.loader && g[h.route.id] === void 0 && (!E || E[h.route.id] === void 0);
                if (h.route.lazy || C) {
                    s = !0, d >= 0 ? i = i.slice(0, d + 1) : i = [i[0]];
                    break
                }
            }
        }
    return i.reduceRight((m, h, g) => {
        let E, C = !1,
            b = null,
            x = null;
        r && (E = c && h.route.id ? c[h.route.id] : void 0, b = h.route.errorElement || ti, s && (d < 0 && g === 0 ? (ui("route-fallback"), C = !0, x = null) : d === g && (C = !0, x = h.route.hydrateFallbackElement || null)));
        let k = t.concat(i.slice(0, g + 1)),
            D = () => {
                let B;
                return E ? B = b : C ? B = x : h.route.Component ? B = v.createElement(h.route.Component, null) : h.route.element ? B = h.route.element : B = m, v.createElement(ni, {
                    match: h,
                    routeContext: {
                        outlet: m,
                        matches: k,
                        isDataRoute: r != null
                    },
                    children: B
                })
            };
        return r && (h.route.ErrorBoundary || h.route.errorElement || g === 0) ? v.createElement(ri, {
            location: r.location,
            revalidation: r.revalidation,
            component: b,
            error: E,
            children: D(),
            routeContext: {
                outlet: null,
                matches: k,
                isDataRoute: !0
            }
        }) : D()
    }, null)
}
var un = function(e) {
        return e.UseBlocker = "useBlocker", e.UseRevalidator = "useRevalidator", e.UseNavigateStable = "useNavigate", e
    }(un || {}),
    cn = function(e) {
        return e.UseBlocker = "useBlocker", e.UseLoaderData = "useLoaderData", e.UseActionData = "useActionData", e.UseRouteError = "useRouteError", e.UseNavigation = "useNavigation", e.UseRouteLoaderData = "useRouteLoaderData", e.UseMatches = "useMatches", e.UseRevalidator = "useRevalidator", e.UseNavigateStable = "useNavigate", e.UseRouteId = "useRouteId", e
    }(cn || {});

function fn(e) {
    let t = v.useContext(Tt);
    return t || A(!1), t
}

function dn(e) {
    let t = v.useContext(nn);
    return t || A(!1), t
}

function ii(e) {
    let t = v.useContext(de);
    return t || A(!1), t
}

function hn(e) {
    let t = ii(),
        r = t.matches[t.matches.length - 1];
    return r.route.id || A(!1), r.route.id
}

function oi() {
    var e;
    let t = v.useContext(an),
        r = dn(),
        n = hn();
    return t !== void 0 ? t : (e = r.errors) == null ? void 0 : e[n]
}
let li = 0;

function Ni(e) {
    let {
        router: t,
        basename: r
    } = fn(un.UseBlocker), n = dn(cn.UseBlocker), [a, o] = v.useState(""), i = v.useCallback(c => {
        if (typeof e != "function") return !!e;
        if (r === "/") return e(c);
        let {
            currentLocation: s,
            nextLocation: d,
            historyAction: m
        } = c;
        return e({
            currentLocation: Ve({}, s, {
                pathname: Se(s.pathname, r) || s.pathname
            }),
            nextLocation: Ve({}, d, {
                pathname: Se(d.pathname, r) || d.pathname
            }),
            historyAction: m
        })
    }, [r, e]);
    return v.useEffect(() => {
        let c = String(++li);
        return o(c), () => t.deleteBlocker(c)
    }, [t]), v.useEffect(() => {
        a !== "" && t.getBlocker(a, i)
    }, [t, a, i]), a && n.blockers.has(a) ? n.blockers.get(a) : We
}

function si() {
    let {
        router: e
    } = fn(), t = hn(), r = v.useRef(!1);
    return on(() => {
        r.current = !0
    }), v.useCallback(function(a, o) {
        o === void 0 && (o = {}), r.current && (typeof a == "number" ? e.navigate(a) : e.navigate(a, Ve({
            fromRouteId: t
        }, o)))
    }, [e, t])
}
const Lr = {};

function ui(e, t, r) {
    Lr[e] || (Lr[e] = !0)
}

function ci(e, t) {
    e == null || e.v7_startTransition, (e == null ? void 0 : e.v7_relativeSplatPath) === void 0 && (!t || t.v7_relativeSplatPath), t && (t.v7_fetcherPersist, t.v7_normalizeFormMethod, t.v7_partialHydration, t.v7_skipActionErrorRevalidation)
}

function Ii(e) {
    let {
        to: t,
        replace: r,
        state: n,
        relative: a
    } = e;
    Ge() || A(!1);
    let {
        future: o,
        static: i
    } = v.useContext(Pe), {
        matches: c
    } = v.useContext(de), {
        pathname: s
    } = Je(), d = Xt(), m = Ct(t, Pt(c, o.v7_relativeSplatPath), s, a === "path"), h = JSON.stringify(m);
    return v.useEffect(() => d(JSON.parse(h), {
        replace: r,
        state: n,
        relative: a
    }), [d, h, a, r, n]), null
}

function Fi(e) {
    return qa(e.context)
}

function fi(e) {
    let {
        basename: t = "/",
        children: r = null,
        location: n,
        navigationType: a = q.Pop,
        navigator: o,
        static: i = !1,
        future: c
    } = e;
    Ge() && A(!1);
    let s = t.replace(/^\/*/, "/"),
        d = v.useMemo(() => ({
            basename: s,
            navigator: o,
            static: i,
            future: Ve({
                v7_relativeSplatPath: !1
            }, c)
        }), [s, c, o, i]);
    typeof n == "string" && (n = _e(n));
    let {
        pathname: m = "/",
        search: h = "",
        hash: g = "",
        state: E = null,
        key: C = "default"
    } = n, b = v.useMemo(() => {
        let x = Se(m, s);
        return x == null ? null : {
            location: {
                pathname: x,
                search: h,
                hash: g,
                state: E,
                key: C
            },
            navigationType: a
        }
    }, [s, m, h, g, E, C, a]);
    return b == null ? null : v.createElement(Pe.Provider, {
        value: d
    }, v.createElement(Jt.Provider, {
        children: r,
        value: b
    }))
}
new Promise(() => {});

function di(e) {
    let t = {
        hasErrorBoundary: e.ErrorBoundary != null || e.errorElement != null
    };
    return e.Component && Object.assign(t, {
        element: v.createElement(e.Component),
        Component: void 0
    }), e.HydrateFallback && Object.assign(t, {
        hydrateFallbackElement: v.createElement(e.HydrateFallback),
        HydrateFallback: void 0
    }), e.ErrorBoundary && Object.assign(t, {
        errorElement: v.createElement(e.ErrorBoundary),
        ErrorBoundary: void 0
    }), t
}
/**
 * React Router DOM v6.30.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function st() {
    return st = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n])
        }
        return e
    }, st.apply(this, arguments)
}

function hi(e, t) {
    if (e == null) return {};
    var r = {},
        n = Object.keys(e),
        a, o;
    for (o = 0; o < n.length; o++) a = n[o], !(t.indexOf(a) >= 0) && (r[a] = e[a]);
    return r
}

function pi(e) {
    return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
}

function mi(e, t) {
    return e.button === 0 && (!t || t === "_self") && !pi(e)
}

function Ht(e) {
    return e === void 0 && (e = ""), new URLSearchParams(typeof e == "string" || Array.isArray(e) || e instanceof URLSearchParams ? e : Object.keys(e).reduce((t, r) => {
        let n = e[r];
        return t.concat(Array.isArray(n) ? n.map(a => [r, a]) : [
            [r, n]
        ])
    }, []))
}

function vi(e, t) {
    let r = Ht(e);
    return t && t.forEach((n, a) => {
        r.has(a) || t.getAll(a).forEach(o => {
            r.append(a, o)
        })
    }), r
}
const yi = ["onClick", "relative", "reloadDocument", "replace", "state", "target", "to", "preventScrollReset", "viewTransition"],
    gi = "6";
try {
    window.__reactRouterVersion = gi
} catch {}

function ki(e, t) {
    return La({
        basename: void 0,
        future: st({}, void 0, {
            v7_prependBasename: !0
        }),
        history: ea({
            window: void 0
        }),
        hydrationData: Ei(),
        routes: e,
        mapRouteProperties: di,
        dataStrategy: void 0,
        patchRoutesOnNavigation: void 0,
        window: void 0
    }).initialize()
}

function Ei() {
    var e;
    let t = (e = window) == null ? void 0 : e.__staticRouterHydrationData;
    return t && t.errors && (t = st({}, t, {
        errors: Ri(t.errors)
    })), t
}

function Ri(e) {
    if (!e) return null;
    let t = Object.entries(e),
        r = {};
    for (let [n, a] of t)
        if (a && a.__type === "RouteErrorResponse") r[n] = new St(a.status, a.statusText, a.data, a.internal === !0);
        else if (a && a.__type === "Error") {
        if (a.__subType) {
            let o = window[a.__subType];
            if (typeof o == "function") try {
                let i = new o(a.message);
                i.stack = "", r[n] = i
            } catch {}
        }
        if (r[n] == null) {
            let o = new Error(a.message);
            o.stack = "", r[n] = o
        }
    } else r[n] = a;
    return r
}
const wi = v.createContext({
        isTransitioning: !1
    }),
    bi = v.createContext(new Map),
    Si = "startTransition",
    Mr = Gn[Si],
    _i = "flushSync",
    Or = Zn[_i];

function Pi(e) {
    Mr ? Mr(e) : e()
}

function nt(e) {
    Or ? Or(e) : e()
}
class Ci {
    constructor() {
        this.status = "pending", this.promise = new Promise((t, r) => {
            this.resolve = n => {
                this.status === "pending" && (this.status = "resolved", t(n))
            }, this.reject = n => {
                this.status === "pending" && (this.status = "rejected", r(n))
            }
        })
    }
}

function Hi(e) {
    let {
        fallbackElement: t,
        router: r,
        future: n
    } = e, [a, o] = v.useState(r.state), [i, c] = v.useState(), [s, d] = v.useState({
        isTransitioning: !1
    }), [m, h] = v.useState(), [g, E] = v.useState(), [C, b] = v.useState(), x = v.useRef(new Map), {
        v7_startTransition: k
    } = n || {}, D = v.useCallback(O => {
        k ? Pi(O) : O()
    }, [k]), B = v.useCallback((O, W) => {
        let {
            deletedFetchers: j,
            flushSync: te,
            viewTransitionOpts: X
        } = W;
        O.fetchers.forEach((ie, he) => {
            ie.data !== void 0 && x.current.set(he, ie.data)
        }), j.forEach(ie => x.current.delete(ie));
        let le = r.window == null || r.window.document == null || typeof r.window.document.startViewTransition != "function";
        if (!X || le) {
            te ? nt(() => o(O)) : D(() => o(O));
            return
        }
        if (te) {
            nt(() => {
                g && (m && m.resolve(), g.skipTransition()), d({
                    isTransitioning: !0,
                    flushSync: !0,
                    currentLocation: X.currentLocation,
                    nextLocation: X.nextLocation
                })
            });
            let ie = r.window.document.startViewTransition(() => {
                nt(() => o(O))
            });
            ie.finished.finally(() => {
                nt(() => {
                    h(void 0), E(void 0), c(void 0), d({
                        isTransitioning: !1
                    })
                })
            }), nt(() => E(ie));
            return
        }
        g ? (m && m.resolve(), g.skipTransition(), b({
            state: O,
            currentLocation: X.currentLocation,
            nextLocation: X.nextLocation
        })) : (c(O), d({
            isTransitioning: !0,
            flushSync: !1,
            currentLocation: X.currentLocation,
            nextLocation: X.nextLocation
        }))
    }, [r.window, g, m, x, D]);
    v.useLayoutEffect(() => r.subscribe(B), [r, B]), v.useEffect(() => {
        s.isTransitioning && !s.flushSync && h(new Ci)
    }, [s]), v.useEffect(() => {
        if (m && i && r.window) {
            let O = i,
                W = m.promise,
                j = r.window.document.startViewTransition(async () => {
                    D(() => o(O)), await W
                });
            j.finished.finally(() => {
                h(void 0), E(void 0), c(void 0), d({
                    isTransitioning: !1
                })
            }), E(j)
        }
    }, [D, i, m, r.window]), v.useEffect(() => {
        m && i && a.location.key === i.location.key && m.resolve()
    }, [m, g, a.location, i]), v.useEffect(() => {
        !s.isTransitioning && C && (c(C.state), d({
            isTransitioning: !0,
            flushSync: !1,
            currentLocation: C.currentLocation,
            nextLocation: C.nextLocation
        }), b(void 0))
    }, [s.isTransitioning, C]), v.useEffect(() => {}, []);
    let G = v.useMemo(() => ({
            createHref: r.createHref,
            encodeLocation: r.encodeLocation,
            go: O => r.navigate(O),
            push: (O, W, j) => r.navigate(O, {
                state: W,
                preventScrollReset: j == null ? void 0 : j.preventScrollReset
            }),
            replace: (O, W, j) => r.navigate(O, {
                replace: !0,
                state: W,
                preventScrollReset: j == null ? void 0 : j.preventScrollReset
            })
        }), [r]),
        J = r.basename || "/",
        Ce = v.useMemo(() => ({
            router: r,
            navigator: G,
            static: !1,
            basename: J
        }), [r, G, J]),
        p = v.useMemo(() => ({
            v7_relativeSplatPath: r.future.v7_relativeSplatPath
        }), [r.future.v7_relativeSplatPath]);
    return v.useEffect(() => ci(n, r.future), [n, r.future]), v.createElement(v.Fragment, null, v.createElement(Tt.Provider, {
        value: Ce
    }, v.createElement(nn.Provider, {
        value: a
    }, v.createElement(bi.Provider, {
        value: x.current
    }, v.createElement(wi.Provider, {
        value: s
    }, v.createElement(fi, {
        basename: J,
        location: a.location,
        navigationType: a.historyAction,
        navigator: G,
        future: p
    }, a.initialized || r.future.v7_partialHydration ? v.createElement(Ti, {
        routes: r.routes,
        future: r.future,
        state: a
    }) : t))))), null)
}
const Ti = v.memo(xi);

function xi(e) {
    let {
        routes: t,
        future: r,
        state: n
    } = e;
    return Za(t, void 0, n, r)
}
const Di = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u",
    Li = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
    Bi = v.forwardRef(function(t, r) {
        let {
            onClick: n,
            relative: a,
            reloadDocument: o,
            replace: i,
            state: c,
            target: s,
            to: d,
            preventScrollReset: m,
            viewTransition: h
        } = t, g = hi(t, yi), {
            basename: E
        } = v.useContext(Pe), C, b = !1;
        if (typeof d == "string" && Li.test(d) && (C = d, Di)) try {
            let B = new URL(window.location.href),
                G = d.startsWith("//") ? new URL(B.protocol + d) : new URL(d),
                J = Se(G.pathname, E);
            G.origin === B.origin && J != null ? d = J + G.search + G.hash : b = !0
        } catch {}
        let x = Xa(d, {
                relative: a
            }),
            k = Mi(d, {
                replace: i,
                state: c,
                target: s,
                preventScrollReset: m,
                relative: a,
                viewTransition: h
            });

        function D(B) {
            n && n(B), B.defaultPrevented || k(B)
        }
        return v.createElement("a", st({}, g, {
            href: C || x,
            onClick: b || o ? n : D,
            ref: r,
            target: s
        }))
    });
var Ur;
(function(e) {
    e.UseScrollRestoration = "useScrollRestoration", e.UseSubmit = "useSubmit", e.UseSubmitFetcher = "useSubmitFetcher", e.UseFetcher = "useFetcher", e.useViewTransitionState = "useViewTransitionState"
})(Ur || (Ur = {}));
var Ar;
(function(e) {
    e.UseFetcher = "useFetcher", e.UseFetchers = "useFetchers", e.UseScrollRestoration = "useScrollRestoration"
})(Ar || (Ar = {}));

function Mi(e, t) {
    let {
        target: r,
        replace: n,
        state: a,
        preventScrollReset: o,
        relative: i,
        viewTransition: c
    } = t === void 0 ? {} : t, s = Xt(), d = Je(), m = sn(e, {
        relative: i
    });
    return v.useCallback(h => {
        if (mi(h, r)) {
            h.preventDefault();
            let g = n !== void 0 ? n : je(d) === je(m);
            s(e, {
                replace: g,
                state: a,
                preventScrollReset: o,
                relative: i,
                viewTransition: c
            })
        }
    }, [d, s, m, n, a, r, e, o, i, c])
}

function zi(e) {
    let t = v.useRef(Ht(e)),
        r = v.useRef(!1),
        n = Je(),
        a = v.useMemo(() => vi(n.search, r.current ? null : t.current), [n.search]),
        o = Xt(),
        i = v.useCallback((c, s) => {
            const d = Ht(typeof c == "function" ? c(a) : c);
            r.current = !0, o("?" + d, s)
        }, [o, a]);
    return [a, i]
}
export {
    Bi as L, Ii as N, Fi as O, Kn as R, Gn as a, Kr as b, Oi as c, Xt as d, Ni as e, Je as f, zi as g, Nr as h, qn as i, Ui as j, Ai as k, oi as l, ki as m, Hi as n, v as r, ji as u
};
//# sourceMappingURL=vendor-lSYvs16e.js.map