import {
    r as y,
    R as X,
    a as Nn,
    b as qe
} from "./vendor-lSYvs16e.js";
try {
    let t = typeof window < "u" ? window : typeof global < "u" ? global : typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : {},
        e = new t.Error().stack;
    e && (t._sentryDebugIds = t._sentryDebugIds || {}, t._sentryDebugIds[e] = "9e186f07-aef3-4d4d-8ffa-49fd9a057124", t._sentryDebugIdIdentifier = "sentry-dbid-9e186f07-aef3-4d4d-8ffa-49fd9a057124")
} catch {}
var $n = {
        exports: {}
    },
    me = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var wo = Symbol.for("react.transitional.element"),
    To = Symbol.for("react.fragment");

function Bn(t, e, n) {
    var o = null;
    if (n !== void 0 && (o = "" + n), e.key !== void 0 && (o = "" + e.key), "key" in e) {
        n = {};
        for (var r in e) r !== "key" && (n[r] = e[r])
    } else n = e;
    return e = n.ref, {
        $$typeof: wo,
        type: t,
        key: o,
        ref: e !== void 0 ? e : null,
        props: n
    }
}
me.Fragment = To;
me.jsx = Bn;
me.jsxs = Bn;
$n.exports = me;
var dt = $n.exports;

function Wn(t) {
    var e, n, o = "";
    if (typeof t == "string" || typeof t == "number") o += t;
    else if (typeof t == "object")
        if (Array.isArray(t)) {
            var r = t.length;
            for (e = 0; e < r; e++) t[e] && (n = Wn(t[e])) && (o && (o += " "), o += n)
        } else
            for (n in t) t[n] && (o && (o += " "), o += n);
    return o
}

function Pt() {
    for (var t, e, n = 0, o = "", r = arguments.length; n < r; n++)(t = arguments[n]) && (e = Wn(t)) && (o && (o += " "), o += e);
    return o
}

function _o(t) {
    if (typeof document > "u") return;
    let e = document.head || document.getElementsByTagName("head")[0],
        n = document.createElement("style");
    n.type = "text/css", e.firstChild ? e.insertBefore(n, e.firstChild) : e.appendChild(n), n.styleSheet ? n.styleSheet.cssText = t : n.appendChild(document.createTextNode(t))
}
_o(`:root{--toastify-color-light: #fff;--toastify-color-dark: #121212;--toastify-color-info: #3498db;--toastify-color-success: #07bc0c;--toastify-color-warning: #f1c40f;--toastify-color-error: hsl(6, 78%, 57%);--toastify-color-transparent: rgba(255, 255, 255, .7);--toastify-icon-color-info: var(--toastify-color-info);--toastify-icon-color-success: var(--toastify-color-success);--toastify-icon-color-warning: var(--toastify-color-warning);--toastify-icon-color-error: var(--toastify-color-error);--toastify-container-width: fit-content;--toastify-toast-width: 320px;--toastify-toast-offset: 16px;--toastify-toast-top: max(var(--toastify-toast-offset), env(safe-area-inset-top));--toastify-toast-right: max(var(--toastify-toast-offset), env(safe-area-inset-right));--toastify-toast-left: max(var(--toastify-toast-offset), env(safe-area-inset-left));--toastify-toast-bottom: max(var(--toastify-toast-offset), env(safe-area-inset-bottom));--toastify-toast-background: #fff;--toastify-toast-padding: 14px;--toastify-toast-min-height: 64px;--toastify-toast-max-height: 800px;--toastify-toast-bd-radius: 6px;--toastify-toast-shadow: 0px 4px 12px rgba(0, 0, 0, .1);--toastify-font-family: sans-serif;--toastify-z-index: 9999;--toastify-text-color-light: #757575;--toastify-text-color-dark: #fff;--toastify-text-color-info: #fff;--toastify-text-color-success: #fff;--toastify-text-color-warning: #fff;--toastify-text-color-error: #fff;--toastify-spinner-color: #616161;--toastify-spinner-color-empty-area: #e0e0e0;--toastify-color-progress-light: linear-gradient(to right, #4cd964, #5ac8fa, #007aff, #34aadc, #5856d6, #ff2d55);--toastify-color-progress-dark: #bb86fc;--toastify-color-progress-info: var(--toastify-color-info);--toastify-color-progress-success: var(--toastify-color-success);--toastify-color-progress-warning: var(--toastify-color-warning);--toastify-color-progress-error: var(--toastify-color-error);--toastify-color-progress-bgo: .2}.Toastify__toast-container{z-index:var(--toastify-z-index);-webkit-transform:translate3d(0,0,var(--toastify-z-index));position:fixed;width:var(--toastify-container-width);box-sizing:border-box;color:#fff;display:flex;flex-direction:column}.Toastify__toast-container--top-left{top:var(--toastify-toast-top);left:var(--toastify-toast-left)}.Toastify__toast-container--top-center{top:var(--toastify-toast-top);left:50%;transform:translate(-50%);align-items:center}.Toastify__toast-container--top-right{top:var(--toastify-toast-top);right:var(--toastify-toast-right);align-items:end}.Toastify__toast-container--bottom-left{bottom:var(--toastify-toast-bottom);left:var(--toastify-toast-left)}.Toastify__toast-container--bottom-center{bottom:var(--toastify-toast-bottom);left:50%;transform:translate(-50%);align-items:center}.Toastify__toast-container--bottom-right{bottom:var(--toastify-toast-bottom);right:var(--toastify-toast-right);align-items:end}.Toastify__toast{--y: 0;position:relative;touch-action:none;width:var(--toastify-toast-width);min-height:var(--toastify-toast-min-height);box-sizing:border-box;margin-bottom:1rem;padding:var(--toastify-toast-padding);border-radius:var(--toastify-toast-bd-radius);box-shadow:var(--toastify-toast-shadow);max-height:var(--toastify-toast-max-height);font-family:var(--toastify-font-family);z-index:0;display:flex;flex:1 auto;align-items:center;word-break:break-word}@media only screen and (max-width: 480px){.Toastify__toast-container{width:100vw;left:env(safe-area-inset-left);margin:0}.Toastify__toast-container--top-left,.Toastify__toast-container--top-center,.Toastify__toast-container--top-right{top:env(safe-area-inset-top);transform:translate(0)}.Toastify__toast-container--bottom-left,.Toastify__toast-container--bottom-center,.Toastify__toast-container--bottom-right{bottom:env(safe-area-inset-bottom);transform:translate(0)}.Toastify__toast-container--rtl{right:env(safe-area-inset-right);left:initial}.Toastify__toast{--toastify-toast-width: 100%;margin-bottom:0;border-radius:0}}.Toastify__toast-container[data-stacked=true]{width:var(--toastify-toast-width)}.Toastify__toast--stacked{position:absolute;width:100%;transform:translate3d(0,var(--y),0) scale(var(--s));transition:transform .3s}.Toastify__toast--stacked[data-collapsed] .Toastify__toast-body,.Toastify__toast--stacked[data-collapsed] .Toastify__close-button{transition:opacity .1s}.Toastify__toast--stacked[data-collapsed=false]{overflow:visible}.Toastify__toast--stacked[data-collapsed=true]:not(:last-child)>*{opacity:0}.Toastify__toast--stacked:after{content:"";position:absolute;left:0;right:0;height:calc(var(--g) * 1px);bottom:100%}.Toastify__toast--stacked[data-pos=top]{top:0}.Toastify__toast--stacked[data-pos=bot]{bottom:0}.Toastify__toast--stacked[data-pos=bot].Toastify__toast--stacked:before{transform-origin:top}.Toastify__toast--stacked[data-pos=top].Toastify__toast--stacked:before{transform-origin:bottom}.Toastify__toast--stacked:before{content:"";position:absolute;left:0;right:0;bottom:0;height:100%;transform:scaleY(3);z-index:-1}.Toastify__toast--rtl{direction:rtl}.Toastify__toast--close-on-click{cursor:pointer}.Toastify__toast-icon{margin-inline-end:10px;width:22px;flex-shrink:0;display:flex}.Toastify--animate{animation-fill-mode:both;animation-duration:.5s}.Toastify--animate-icon{animation-fill-mode:both;animation-duration:.3s}.Toastify__toast-theme--dark{background:var(--toastify-color-dark);color:var(--toastify-text-color-dark)}.Toastify__toast-theme--light,.Toastify__toast-theme--colored.Toastify__toast--default{background:var(--toastify-color-light);color:var(--toastify-text-color-light)}.Toastify__toast-theme--colored.Toastify__toast--info{color:var(--toastify-text-color-info);background:var(--toastify-color-info)}.Toastify__toast-theme--colored.Toastify__toast--success{color:var(--toastify-text-color-success);background:var(--toastify-color-success)}.Toastify__toast-theme--colored.Toastify__toast--warning{color:var(--toastify-text-color-warning);background:var(--toastify-color-warning)}.Toastify__toast-theme--colored.Toastify__toast--error{color:var(--toastify-text-color-error);background:var(--toastify-color-error)}.Toastify__progress-bar-theme--light{background:var(--toastify-color-progress-light)}.Toastify__progress-bar-theme--dark{background:var(--toastify-color-progress-dark)}.Toastify__progress-bar--info{background:var(--toastify-color-progress-info)}.Toastify__progress-bar--success{background:var(--toastify-color-progress-success)}.Toastify__progress-bar--warning{background:var(--toastify-color-progress-warning)}.Toastify__progress-bar--error{background:var(--toastify-color-progress-error)}.Toastify__progress-bar-theme--colored.Toastify__progress-bar--info,.Toastify__progress-bar-theme--colored.Toastify__progress-bar--success,.Toastify__progress-bar-theme--colored.Toastify__progress-bar--warning,.Toastify__progress-bar-theme--colored.Toastify__progress-bar--error{background:var(--toastify-color-transparent)}.Toastify__close-button{color:#fff;position:absolute;top:6px;right:6px;background:transparent;outline:none;border:none;padding:0;cursor:pointer;opacity:.7;transition:.3s ease;z-index:1}.Toastify__toast--rtl .Toastify__close-button{left:6px;right:unset}.Toastify__close-button--light{color:#000;opacity:.3}.Toastify__close-button>svg{fill:currentColor;height:16px;width:14px}.Toastify__close-button:hover,.Toastify__close-button:focus{opacity:1}@keyframes Toastify__trackProgress{0%{transform:scaleX(1)}to{transform:scaleX(0)}}.Toastify__progress-bar{position:absolute;bottom:0;left:0;width:100%;height:100%;z-index:1;opacity:.7;transform-origin:left}.Toastify__progress-bar--animated{animation:Toastify__trackProgress linear 1 forwards}.Toastify__progress-bar--controlled{transition:transform .2s}.Toastify__progress-bar--rtl{right:0;left:initial;transform-origin:right;border-bottom-left-radius:initial}.Toastify__progress-bar--wrp{position:absolute;overflow:hidden;bottom:0;left:0;width:100%;height:5px;border-bottom-left-radius:var(--toastify-toast-bd-radius);border-bottom-right-radius:var(--toastify-toast-bd-radius)}.Toastify__progress-bar--wrp[data-hidden=true]{opacity:0}.Toastify__progress-bar--bg{opacity:var(--toastify-color-progress-bgo);width:100%;height:100%}.Toastify__spinner{width:20px;height:20px;box-sizing:border-box;border:2px solid;border-radius:100%;border-color:var(--toastify-spinner-color-empty-area);border-right-color:var(--toastify-spinner-color);animation:Toastify__spin .65s linear infinite}@keyframes Toastify__bounceInRight{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate3d(3000px,0,0)}60%{opacity:1;transform:translate3d(-25px,0,0)}75%{transform:translate3d(10px,0,0)}90%{transform:translate3d(-5px,0,0)}to{transform:none}}@keyframes Toastify__bounceOutRight{20%{opacity:1;transform:translate3d(-20px,var(--y),0)}to{opacity:0;transform:translate3d(2000px,var(--y),0)}}@keyframes Toastify__bounceInLeft{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate3d(-3000px,0,0)}60%{opacity:1;transform:translate3d(25px,0,0)}75%{transform:translate3d(-10px,0,0)}90%{transform:translate3d(5px,0,0)}to{transform:none}}@keyframes Toastify__bounceOutLeft{20%{opacity:1;transform:translate3d(20px,var(--y),0)}to{opacity:0;transform:translate3d(-2000px,var(--y),0)}}@keyframes Toastify__bounceInUp{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate3d(0,3000px,0)}60%{opacity:1;transform:translate3d(0,-20px,0)}75%{transform:translate3d(0,10px,0)}90%{transform:translate3d(0,-5px,0)}to{transform:translateZ(0)}}@keyframes Toastify__bounceOutUp{20%{transform:translate3d(0,calc(var(--y) - 10px),0)}40%,45%{opacity:1;transform:translate3d(0,calc(var(--y) + 20px),0)}to{opacity:0;transform:translate3d(0,-2000px,0)}}@keyframes Toastify__bounceInDown{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate3d(0,-3000px,0)}60%{opacity:1;transform:translate3d(0,25px,0)}75%{transform:translate3d(0,-10px,0)}90%{transform:translate3d(0,5px,0)}to{transform:none}}@keyframes Toastify__bounceOutDown{20%{transform:translate3d(0,calc(var(--y) - 10px),0)}40%,45%{opacity:1;transform:translate3d(0,calc(var(--y) + 20px),0)}to{opacity:0;transform:translate3d(0,2000px,0)}}.Toastify__bounce-enter--top-left,.Toastify__bounce-enter--bottom-left{animation-name:Toastify__bounceInLeft}.Toastify__bounce-enter--top-right,.Toastify__bounce-enter--bottom-right{animation-name:Toastify__bounceInRight}.Toastify__bounce-enter--top-center{animation-name:Toastify__bounceInDown}.Toastify__bounce-enter--bottom-center{animation-name:Toastify__bounceInUp}.Toastify__bounce-exit--top-left,.Toastify__bounce-exit--bottom-left{animation-name:Toastify__bounceOutLeft}.Toastify__bounce-exit--top-right,.Toastify__bounce-exit--bottom-right{animation-name:Toastify__bounceOutRight}.Toastify__bounce-exit--top-center{animation-name:Toastify__bounceOutUp}.Toastify__bounce-exit--bottom-center{animation-name:Toastify__bounceOutDown}@keyframes Toastify__zoomIn{0%{opacity:0;transform:scale3d(.3,.3,.3)}50%{opacity:1}}@keyframes Toastify__zoomOut{0%{opacity:1}50%{opacity:0;transform:translate3d(0,var(--y),0) scale3d(.3,.3,.3)}to{opacity:0}}.Toastify__zoom-enter{animation-name:Toastify__zoomIn}.Toastify__zoom-exit{animation-name:Toastify__zoomOut}@keyframes Toastify__flipIn{0%{transform:perspective(400px) rotateX(90deg);animation-timing-function:ease-in;opacity:0}40%{transform:perspective(400px) rotateX(-20deg);animation-timing-function:ease-in}60%{transform:perspective(400px) rotateX(10deg);opacity:1}80%{transform:perspective(400px) rotateX(-5deg)}to{transform:perspective(400px)}}@keyframes Toastify__flipOut{0%{transform:translate3d(0,var(--y),0) perspective(400px)}30%{transform:translate3d(0,var(--y),0) perspective(400px) rotateX(-20deg);opacity:1}to{transform:translate3d(0,var(--y),0) perspective(400px) rotateX(90deg);opacity:0}}.Toastify__flip-enter{animation-name:Toastify__flipIn}.Toastify__flip-exit{animation-name:Toastify__flipOut}@keyframes Toastify__slideInRight{0%{transform:translate3d(110%,0,0);visibility:visible}to{transform:translate3d(0,var(--y),0)}}@keyframes Toastify__slideInLeft{0%{transform:translate3d(-110%,0,0);visibility:visible}to{transform:translate3d(0,var(--y),0)}}@keyframes Toastify__slideInUp{0%{transform:translate3d(0,110%,0);visibility:visible}to{transform:translate3d(0,var(--y),0)}}@keyframes Toastify__slideInDown{0%{transform:translate3d(0,-110%,0);visibility:visible}to{transform:translate3d(0,var(--y),0)}}@keyframes Toastify__slideOutRight{0%{transform:translate3d(0,var(--y),0)}to{visibility:hidden;transform:translate3d(110%,var(--y),0)}}@keyframes Toastify__slideOutLeft{0%{transform:translate3d(0,var(--y),0)}to{visibility:hidden;transform:translate3d(-110%,var(--y),0)}}@keyframes Toastify__slideOutDown{0%{transform:translate3d(0,var(--y),0)}to{visibility:hidden;transform:translate3d(0,500px,0)}}@keyframes Toastify__slideOutUp{0%{transform:translate3d(0,var(--y),0)}to{visibility:hidden;transform:translate3d(0,-500px,0)}}.Toastify__slide-enter--top-left,.Toastify__slide-enter--bottom-left{animation-name:Toastify__slideInLeft}.Toastify__slide-enter--top-right,.Toastify__slide-enter--bottom-right{animation-name:Toastify__slideInRight}.Toastify__slide-enter--top-center{animation-name:Toastify__slideInDown}.Toastify__slide-enter--bottom-center{animation-name:Toastify__slideInUp}.Toastify__slide-exit--top-left,.Toastify__slide-exit--bottom-left{animation-name:Toastify__slideOutLeft;animation-timing-function:ease-in;animation-duration:.3s}.Toastify__slide-exit--top-right,.Toastify__slide-exit--bottom-right{animation-name:Toastify__slideOutRight;animation-timing-function:ease-in;animation-duration:.3s}.Toastify__slide-exit--top-center{animation-name:Toastify__slideOutUp;animation-timing-function:ease-in;animation-duration:.3s}.Toastify__slide-exit--bottom-center{animation-name:Toastify__slideOutDown;animation-timing-function:ease-in;animation-duration:.3s}@keyframes Toastify__spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}
`);
var Kt = t => typeof t == "number" && !isNaN(t),
    Dt = t => typeof t == "string",
    Tt = t => typeof t == "function",
    Eo = t => Dt(t) || Kt(t),
    Me = t => Dt(t) || Tt(t) ? t : null,
    Ro = (t, e) => t === !1 || Kt(t) && t > 0 ? t : e,
    Fe = t => y.isValidElement(t) || Dt(t) || Tt(t) || Kt(t);

function Co(t, e, n = 300) {
    let {
        scrollHeight: o,
        style: r
    } = t;
    requestAnimationFrame(() => {
        r.minHeight = "initial", r.height = o + "px", r.transition = `all ${n}ms`, requestAnimationFrame(() => {
            r.height = "0", r.padding = "0", r.margin = "0", setTimeout(e, n)
        })
    })
}

function So({
    enter: t,
    exit: e,
    appendPosition: n = !1,
    collapse: o = !0,
    collapseDuration: r = 300
}) {
    return function({
        children: s,
        position: i,
        preventExitTransition: a,
        done: l,
        nodeRef: c,
        isIn: u,
        playToast: p
    }) {
        let h = n ? `${t}--${i}` : t,
            f = n ? `${e}--${i}` : e,
            b = y.useRef(0);
        return y.useLayoutEffect(() => {
            let d = c.current,
                v = h.split(" "),
                x = m => {
                    m.target === c.current && (p(), d.removeEventListener("animationend", x), d.removeEventListener("animationcancel", x), b.current === 0 && m.type !== "animationcancel" && d.classList.remove(...v))
                };
            d.classList.add(...v), d.addEventListener("animationend", x), d.addEventListener("animationcancel", x)
        }, []), y.useEffect(() => {
            let d = c.current,
                v = () => {
                    d.removeEventListener("animationend", v), o ? Co(d, l, r) : l()
                };
            u || (a ? v() : (b.current = 1, d.className += ` ${f}`, d.addEventListener("animationend", v)))
        }, [u]), X.createElement(X.Fragment, null, s)
    }
}

function on(t, e) {
    return {
        content: zn(t.content, t.props),
        containerId: t.props.containerId,
        id: t.props.toastId,
        theme: t.props.theme,
        type: t.props.type,
        data: t.props.data || {},
        isLoading: t.props.isLoading,
        icon: t.props.icon,
        reason: t.removalReason,
        status: e
    }
}

function zn(t, e, n = !1) {
    return y.isValidElement(t) && !Dt(t.type) ? y.cloneElement(t, {
        closeToast: e.closeToast,
        toastProps: e,
        data: e.data,
        isPaused: n
    }) : Tt(t) ? t({
        closeToast: e.closeToast,
        toastProps: e,
        data: e.data,
        isPaused: n
    }) : t
}

function ko({
    closeToast: t,
    theme: e,
    ariaLabel: n = "close"
}) {
    return X.createElement("button", {
        className: `Toastify__close-button Toastify__close-button--${e}`,
        type: "button",
        onClick: o => {
            o.stopPropagation(), t(!0)
        },
        "aria-label": n
    }, X.createElement("svg", {
        "aria-hidden": "true",
        viewBox: "0 0 14 16"
    }, X.createElement("path", {
        fillRule: "evenodd",
        d: "M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z"
    })))
}

function Io({
    delay: t,
    isRunning: e,
    closeToast: n,
    type: o = "default",
    hide: r,
    className: s,
    controlledProgress: i,
    progress: a,
    rtl: l,
    isIn: c,
    theme: u
}) {
    let p = r || i && a === 0,
        h = {
            animationDuration: `${t}ms`,
            animationPlayState: e ? "running" : "paused"
        };
    i && (h.transform = `scaleX(${a})`);
    let f = Pt("Toastify__progress-bar", i ? "Toastify__progress-bar--controlled" : "Toastify__progress-bar--animated", `Toastify__progress-bar-theme--${u}`, `Toastify__progress-bar--${o}`, {
            "Toastify__progress-bar--rtl": l
        }),
        b = Tt(s) ? s({
            rtl: l,
            type: o,
            defaultClassName: f
        }) : Pt(f, s),
        d = {
            [i && a >= 1 ? "onTransitionEnd" : "onAnimationEnd"]: i && a < 1 ? null : () => {
                c && n()
            }
        };
    return X.createElement("div", {
        className: "Toastify__progress-bar--wrp",
        "data-hidden": p
    }, X.createElement("div", {
        className: `Toastify__progress-bar--bg Toastify__progress-bar-theme--${u} Toastify__progress-bar--${o}`
    }), X.createElement("div", {
        role: "progressbar",
        "aria-hidden": p ? "true" : "false",
        "aria-label": "notification timer",
        className: b,
        style: h,
        ...d
    }))
}
var Ao = 1,
    Vn = () => `${Ao++}`;

function Oo(t, e, n) {
    let o = 1,
        r = 0,
        s = [],
        i = [],
        a = e,
        l = new Map,
        c = new Set,
        u = m => (c.add(m), () => c.delete(m)),
        p = () => {
            i = Array.from(l.values()), c.forEach(m => m())
        },
        h = ({
            containerId: m,
            toastId: g,
            updateId: T
        }) => {
            let E = m ? m !== t : t !== 1,
                A = l.has(g) && T == null;
            return E || A
        },
        f = (m, g) => {
            l.forEach(T => {
                var E;
                (g == null || g === T.props.toastId) && ((E = T.toggle) == null || E.call(T, m))
            })
        },
        b = m => {
            var g, T;
            (T = (g = m.props) == null ? void 0 : g.onClose) == null || T.call(g, m.removalReason), m.isActive = !1
        },
        d = m => {
            if (m == null) l.forEach(b);
            else {
                let g = l.get(m);
                g && b(g)
            }
            p()
        },
        v = () => {
            r -= s.length, s = []
        },
        x = m => {
            var g, T;
            let {
                toastId: E,
                updateId: A
            } = m.props, _ = A == null;
            m.staleId && l.delete(m.staleId), m.isActive = !0, l.set(E, m), p(), n(on(m, _ ? "added" : "updated")), _ && ((T = (g = m.props).onOpen) == null || T.call(g))
        };
    return {
        id: t,
        props: a,
        observe: u,
        toggle: f,
        removeToast: d,
        toasts: l,
        clearQueue: v,
        buildToast: (m, g) => {
            if (h(g)) return;
            let {
                toastId: T,
                updateId: E,
                data: A,
                staleId: _,
                delay: I
            } = g, P = E == null;
            P && r++;
            let k = { ...a,
                style: a.toastStyle,
                key: o++,
                ...Object.fromEntries(Object.entries(g).filter(([N, M]) => M != null)),
                toastId: T,
                updateId: E,
                data: A,
                isIn: !1,
                className: Me(g.className || a.toastClassName),
                progressClassName: Me(g.progressClassName || a.progressClassName),
                autoClose: g.isLoading ? !1 : Ro(g.autoClose, a.autoClose),
                closeToast(N) {
                    l.get(T).removalReason = N, d(T)
                },
                deleteToast() {
                    let N = l.get(T);
                    if (N != null) {
                        if (n(on(N, "removed")), l.delete(T), r--, r < 0 && (r = 0), s.length > 0) {
                            x(s.shift());
                            return
                        }
                        p()
                    }
                }
            };
            k.closeButton = a.closeButton, g.closeButton === !1 || Fe(g.closeButton) ? k.closeButton = g.closeButton : g.closeButton === !0 && (k.closeButton = Fe(a.closeButton) ? a.closeButton : !0);
            let O = {
                content: m,
                props: k,
                staleId: _
            };
            a.limit && a.limit > 0 && r > a.limit && P ? s.push(O) : Kt(I) ? setTimeout(() => {
                x(O)
            }, I) : x(O)
        },
        setProps(m) {
            a = m
        },
        setToggle: (m, g) => {
            let T = l.get(m);
            T && (T.toggle = g)
        },
        isToastActive: m => {
            var g;
            return (g = l.get(m)) == null ? void 0 : g.isActive
        },
        getSnapshot: () => i
    }
}
var et = new Map,
    Ut = [],
    Ne = new Set,
    Lo = t => Ne.forEach(e => e(t)),
    Hn = () => et.size > 0;

function Po() {
    Ut.forEach(t => Xn(t.content, t.options)), Ut = []
}
var Do = (t, {
    containerId: e
}) => {
    var n;
    return (n = et.get(e || 1)) == null ? void 0 : n.toasts.get(t)
};

function jn(t, e) {
    var n;
    if (e) return !!((n = et.get(e)) != null && n.isToastActive(t));
    let o = !1;
    return et.forEach(r => {
        r.isToastActive(t) && (o = !0)
    }), o
}

function Mo(t) {
    if (!Hn()) {
        Ut = Ut.filter(e => t != null && e.options.toastId !== t);
        return
    }
    if (t == null || Eo(t)) et.forEach(e => {
        e.removeToast(t)
    });
    else if (t && ("containerId" in t || "id" in t)) {
        let e = et.get(t.containerId);
        e ? e.removeToast(t.id) : et.forEach(n => {
            n.removeToast(t.id)
        })
    }
}
var Fo = (t = {}) => {
    et.forEach(e => {
        e.props.limit && (!t.containerId || e.id === t.containerId) && e.clearQueue()
    })
};

function Xn(t, e) {
    Fe(t) && (Hn() || Ut.push({
        content: t,
        options: e
    }), et.forEach(n => {
        n.buildToast(t, e)
    }))
}

function No(t) {
    var e;
    (e = et.get(t.containerId || 1)) == null || e.setToggle(t.id, t.fn)
}

function qn(t, e) {
    et.forEach(n => {
        (e == null || !(e != null && e.containerId) || (e == null ? void 0 : e.containerId) === n.id) && n.toggle(t, e == null ? void 0 : e.id)
    })
}

function $o(t) {
    let e = t.containerId || 1;
    return {
        subscribe(n) {
            let o = Oo(e, t, Lo);
            et.set(e, o);
            let r = o.observe(n);
            return Po(), () => {
                r(), et.delete(e)
            }
        },
        setProps(n) {
            var o;
            (o = et.get(e)) == null || o.setProps(n)
        },
        getSnapshot() {
            var n;
            return (n = et.get(e)) == null ? void 0 : n.getSnapshot()
        }
    }
}

function Bo(t) {
    return Ne.add(t), () => {
        Ne.delete(t)
    }
}

function Wo(t) {
    return t && (Dt(t.toastId) || Kt(t.toastId)) ? t.toastId : Vn()
}

function Gt(t, e) {
    return Xn(t, e), e.toastId
}

function pe(t, e) {
    return { ...e,
        type: e && e.type || t,
        toastId: Wo(e)
    }
}

function ge(t) {
    return (e, n) => Gt(e, pe(t, n))
}

function j(t, e) {
    return Gt(t, pe("default", e))
}
j.loading = (t, e) => Gt(t, pe("default", {
    isLoading: !0,
    autoClose: !1,
    closeOnClick: !1,
    closeButton: !1,
    draggable: !1,
    ...e
}));

function zo(t, {
    pending: e,
    error: n,
    success: o
}, r) {
    let s;
    e && (s = Dt(e) ? j.loading(e, r) : j.loading(e.render, { ...r,
        ...e
    }));
    let i = {
            isLoading: null,
            autoClose: null,
            closeOnClick: null,
            closeButton: null,
            draggable: null
        },
        a = (c, u, p) => {
            if (u == null) {
                j.dismiss(s);
                return
            }
            let h = {
                    type: c,
                    ...i,
                    ...r,
                    data: p
                },
                f = Dt(u) ? {
                    render: u
                } : u;
            return s ? j.update(s, { ...h,
                ...f
            }) : j(f.render, { ...h,
                ...f
            }), p
        },
        l = Tt(t) ? t() : t;
    return l.then(c => a("success", o, c)).catch(c => a("error", n, c)), l
}
j.promise = zo;
j.success = ge("success");
j.info = ge("info");
j.error = ge("error");
j.warning = ge("warning");
j.warn = j.warning;
j.dark = (t, e) => Gt(t, pe("default", {
    theme: "dark",
    ...e
}));

function Vo(t) {
    Mo(t)
}
j.dismiss = Vo;
j.clearWaitingQueue = Fo;
j.isActive = jn;
j.update = (t, e = {}) => {
    let n = Do(t, e);
    if (n) {
        let {
            props: o,
            content: r
        } = n, s = {
            delay: 100,
            ...o,
            ...e,
            toastId: e.toastId || t,
            updateId: Vn()
        };
        s.toastId !== t && (s.staleId = t);
        let i = s.render || r;
        delete s.render, Gt(i, s)
    }
};
j.done = t => {
    j.update(t, {
        progress: 1
    })
};
j.onChange = Bo;
j.play = t => qn(!0, t);
j.pause = t => qn(!1, t);

function Ho(t) {
    var e;
    let {
        subscribe: n,
        getSnapshot: o,
        setProps: r
    } = y.useRef($o(t)).current;
    r(t);
    let s = (e = y.useSyncExternalStore(n, o, o)) == null ? void 0 : e.slice();

    function i(a) {
        if (!s) return [];
        let l = new Map;
        return t.newestOnTop && s.reverse(), s.forEach(c => {
            let {
                position: u
            } = c.props;
            l.has(u) || l.set(u, []), l.get(u).push(c)
        }), Array.from(l, c => a(c[0], c[1]))
    }
    return {
        getToastToRender: i,
        isToastActive: jn,
        count: s == null ? void 0 : s.length
    }
}

function jo(t) {
    let [e, n] = y.useState(!1), [o, r] = y.useState(!1), s = y.useRef(null), i = y.useRef({
        start: 0,
        delta: 0,
        removalDistance: 0,
        canCloseOnClick: !0,
        canDrag: !1,
        didMove: !1
    }).current, {
        autoClose: a,
        pauseOnHover: l,
        closeToast: c,
        onClick: u,
        closeOnClick: p
    } = t;
    No({
        id: t.toastId,
        containerId: t.containerId,
        fn: n
    }), y.useEffect(() => {
        if (t.pauseOnFocusLoss) return h(), () => {
            f()
        }
    }, [t.pauseOnFocusLoss]);

    function h() {
        document.hasFocus() || x(), window.addEventListener("focus", v), window.addEventListener("blur", x)
    }

    function f() {
        window.removeEventListener("focus", v), window.removeEventListener("blur", x)
    }

    function b(_) {
        if (t.draggable === !0 || t.draggable === _.pointerType) {
            m();
            let I = s.current;
            i.canCloseOnClick = !0, i.canDrag = !0, I.style.transition = "none", t.draggableDirection === "x" ? (i.start = _.clientX, i.removalDistance = I.offsetWidth * (t.draggablePercent / 100)) : (i.start = _.clientY, i.removalDistance = I.offsetHeight * (t.draggablePercent === 80 ? t.draggablePercent * 1.5 : t.draggablePercent) / 100)
        }
    }

    function d(_) {
        let {
            top: I,
            bottom: P,
            left: k,
            right: O
        } = s.current.getBoundingClientRect();
        _.nativeEvent.type !== "touchend" && t.pauseOnHover && _.clientX >= k && _.clientX <= O && _.clientY >= I && _.clientY <= P ? x() : v()
    }

    function v() {
        n(!0)
    }

    function x() {
        n(!1)
    }

    function m() {
        i.didMove = !1, document.addEventListener("pointermove", T), document.addEventListener("pointerup", E)
    }

    function g() {
        document.removeEventListener("pointermove", T), document.removeEventListener("pointerup", E)
    }

    function T(_) {
        let I = s.current;
        if (i.canDrag && I) {
            i.didMove = !0, e && x(), t.draggableDirection === "x" ? i.delta = _.clientX - i.start : i.delta = _.clientY - i.start, i.start !== _.clientX && (i.canCloseOnClick = !1);
            let P = t.draggableDirection === "x" ? `${i.delta}px, var(--y)` : `0, calc(${i.delta}px + var(--y))`;
            I.style.transform = `translate3d(${P},0)`, I.style.opacity = `${1-Math.abs(i.delta/i.removalDistance)}`
        }
    }

    function E() {
        g();
        let _ = s.current;
        if (i.canDrag && i.didMove && _) {
            if (i.canDrag = !1, Math.abs(i.delta) > i.removalDistance) {
                r(!0), t.closeToast(!0), t.collapseAll();
                return
            }
            _.style.transition = "transform 0.2s, opacity 0.2s", _.style.removeProperty("transform"), _.style.removeProperty("opacity")
        }
    }
    let A = {
        onPointerDown: b,
        onPointerUp: d
    };
    return a && l && (A.onMouseEnter = x, t.stacked || (A.onMouseLeave = v)), p && (A.onClick = _ => {
        u && u(_), i.canCloseOnClick && c(!0)
    }), {
        playToast: v,
        pauseToast: x,
        isRunning: e,
        preventExitTransition: o,
        toastRef: s,
        eventHandlers: A
    }
}
var Xo = typeof window < "u" ? y.useLayoutEffect : y.useEffect,
    ye = ({
        theme: t,
        type: e,
        isLoading: n,
        ...o
    }) => X.createElement("svg", {
        viewBox: "0 0 24 24",
        width: "100%",
        height: "100%",
        fill: t === "colored" ? "currentColor" : `var(--toastify-icon-color-${e})`,
        ...o
    });

function qo(t) {
    return X.createElement(ye, { ...t
    }, X.createElement("path", {
        d: "M23.32 17.191L15.438 2.184C14.728.833 13.416 0 11.996 0c-1.42 0-2.733.833-3.443 2.184L.533 17.448a4.744 4.744 0 000 4.368C1.243 23.167 2.555 24 3.975 24h16.05C22.22 24 24 22.044 24 19.632c0-.904-.251-1.746-.68-2.44zm-9.622 1.46c0 1.033-.724 1.823-1.698 1.823s-1.698-.79-1.698-1.822v-.043c0-1.028.724-1.822 1.698-1.822s1.698.79 1.698 1.822v.043zm.039-12.285l-.84 8.06c-.057.581-.408.943-.897.943-.49 0-.84-.367-.896-.942l-.84-8.065c-.057-.624.25-1.095.779-1.095h1.91c.528.005.84.476.784 1.1z"
    }))
}

function Uo(t) {
    return X.createElement(ye, { ...t
    }, X.createElement("path", {
        d: "M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm.25 5a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm2.25 13.5h-4a1 1 0 010-2h.75a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-.75a1 1 0 010-2h1a2 2 0 012 2v4.75a.25.25 0 00.25.25h.75a1 1 0 110 2z"
    }))
}

function Yo(t) {
    return X.createElement(ye, { ...t
    }, X.createElement("path", {
        d: "M12 0a12 12 0 1012 12A12.014 12.014 0 0012 0zm6.927 8.2l-6.845 9.289a1.011 1.011 0 01-1.43.188l-4.888-3.908a1 1 0 111.25-1.562l4.076 3.261 6.227-8.451a1 1 0 111.61 1.183z"
    }))
}

function Ko(t) {
    return X.createElement(ye, { ...t
    }, X.createElement("path", {
        d: "M11.983 0a12.206 12.206 0 00-8.51 3.653A11.8 11.8 0 000 12.207 11.779 11.779 0 0011.8 24h.214A12.111 12.111 0 0024 11.791 11.766 11.766 0 0011.983 0zM10.5 16.542a1.476 1.476 0 011.449-1.53h.027a1.527 1.527 0 011.523 1.47 1.475 1.475 0 01-1.449 1.53h-.027a1.529 1.529 0 01-1.523-1.47zM11 12.5v-6a1 1 0 012 0v6a1 1 0 11-2 0z"
    }))
}

function Go() {
    return X.createElement("div", {
        className: "Toastify__spinner"
    })
}
var $e = {
        info: Uo,
        warning: qo,
        success: Yo,
        error: Ko,
        spinner: Go
    },
    Zo = t => t in $e;

function Qo({
    theme: t,
    type: e,
    isLoading: n,
    icon: o
}) {
    let r = null,
        s = {
            theme: t,
            type: e
        };
    return o === !1 || (Tt(o) ? r = o({ ...s,
        isLoading: n
    }) : y.isValidElement(o) ? r = y.cloneElement(o, s) : n ? r = $e.spinner() : Zo(e) && (r = $e[e](s))), r
}
var Jo = t => {
        let {
            isRunning: e,
            preventExitTransition: n,
            toastRef: o,
            eventHandlers: r,
            playToast: s
        } = jo(t), {
            closeButton: i,
            children: a,
            autoClose: l,
            onClick: c,
            type: u,
            hideProgressBar: p,
            closeToast: h,
            transition: f,
            position: b,
            className: d,
            style: v,
            progressClassName: x,
            updateId: m,
            role: g,
            progress: T,
            rtl: E,
            toastId: A,
            deleteToast: _,
            isIn: I,
            isLoading: P,
            closeOnClick: k,
            theme: O,
            ariaLabel: N
        } = t, M = Pt("Toastify__toast", `Toastify__toast-theme--${O}`, `Toastify__toast--${u}`, {
            "Toastify__toast--rtl": E
        }, {
            "Toastify__toast--close-on-click": k
        }), R = Tt(d) ? d({
            rtl: E,
            position: b,
            type: u,
            defaultClassName: M
        }) : Pt(M, d), C = Qo(t), F = !!T || !l, S = {
            closeToast: h,
            type: u,
            theme: O
        }, w = null;
        return i === !1 || (Tt(i) ? w = i(S) : y.isValidElement(i) ? w = y.cloneElement(i, S) : w = ko(S)), X.createElement(f, {
            isIn: I,
            done: _,
            position: b,
            preventExitTransition: n,
            nodeRef: o,
            playToast: s
        }, X.createElement("div", {
            id: A,
            tabIndex: 0,
            onClick: c,
            "data-in": I,
            className: R,
            ...r,
            style: v,
            ref: o,
            ...I && {
                role: g,
                "aria-label": N
            }
        }, C != null && X.createElement("div", {
            className: Pt("Toastify__toast-icon", {
                "Toastify--animate-icon Toastify__zoom-enter": !P
            })
        }, C), zn(a, t, !e), w, !t.customProgressBar && X.createElement(Io, { ...m && !F ? {
                key: `p-${m}`
            } : {},
            rtl: E,
            theme: O,
            delay: l,
            isRunning: e,
            isIn: I,
            closeToast: h,
            hide: p,
            type: u,
            className: x,
            controlledProgress: F,
            progress: T || 0
        })))
    },
    tr = (t, e = !1) => ({
        enter: `Toastify--animate Toastify__${t}-enter`,
        exit: `Toastify--animate Toastify__${t}-exit`,
        appendPosition: e
    }),
    er = So(tr("bounce", !0)),
    nr = {
        position: "top-right",
        transition: er,
        autoClose: 5e3,
        closeButton: !0,
        pauseOnHover: !0,
        pauseOnFocusLoss: !0,
        draggable: "touch",
        draggablePercent: 80,
        draggableDirection: "x",
        role: "alert",
        theme: "light",
        "aria-label": "Notifications Alt+T",
        hotKeys: t => t.altKey && t.code === "KeyT"
    };

function ri(t) {
    let e = { ...nr,
            ...t
        },
        n = t.stacked,
        [o, r] = y.useState(!0),
        s = y.useRef(null),
        {
            getToastToRender: i,
            isToastActive: a,
            count: l
        } = Ho(e),
        {
            className: c,
            style: u,
            rtl: p,
            containerId: h,
            hotKeys: f
        } = e;

    function b(v) {
        let x = Pt("Toastify__toast-container", `Toastify__toast-container--${v}`, {
            "Toastify__toast-container--rtl": p
        });
        return Tt(c) ? c({
            position: v,
            rtl: p,
            defaultClassName: x
        }) : Pt(x, Me(c))
    }

    function d() {
        n && (r(!0), j.play())
    }
    return Xo(() => {
        var v;
        if (n) {
            let x = s.current.querySelectorAll('[data-in="true"]'),
                m = 12,
                g = (v = e.position) == null ? void 0 : v.includes("top"),
                T = 0,
                E = 0;
            Array.from(x).reverse().forEach((A, _) => {
                let I = A;
                I.classList.add("Toastify__toast--stacked"), _ > 0 && (I.dataset.collapsed = `${o}`), I.dataset.pos || (I.dataset.pos = g ? "top" : "bot");
                let P = T * (o ? .2 : 1) + (o ? 0 : m * _);
                I.style.setProperty("--y", `${g?P:P*-1}px`), I.style.setProperty("--g", `${m}`), I.style.setProperty("--s", `${1-(o?E:0)}`), T += I.offsetHeight, E += .025
            })
        }
    }, [o, l, n]), y.useEffect(() => {
        function v(x) {
            var m;
            let g = s.current;
            f(x) && ((m = g.querySelector('[tabIndex="0"]')) == null || m.focus(), r(!1), j.pause()), x.key === "Escape" && (document.activeElement === g || g != null && g.contains(document.activeElement)) && (r(!0), j.play())
        }
        return document.addEventListener("keydown", v), () => {
            document.removeEventListener("keydown", v)
        }
    }, [f]), X.createElement("section", {
        ref: s,
        className: "Toastify",
        id: h,
        onMouseEnter: () => {
            n && (r(!1), j.pause())
        },
        onMouseLeave: d,
        "aria-live": "polite",
        "aria-atomic": "false",
        "aria-relevant": "additions text",
        "aria-label": e["aria-label"]
    }, i((v, x) => {
        let m = x.length ? { ...u
        } : { ...u,
            pointerEvents: "none"
        };
        return X.createElement("div", {
            tabIndex: -1,
            className: b(v),
            "data-stacked": n,
            style: m,
            key: `c-${v}`
        }, x.map(({
            content: g,
            props: T
        }) => X.createElement(Jo, { ...T,
            stacked: n,
            collapseAll: d,
            isIn: a(T.toastId, T.containerId),
            key: `t-${T.key}`
        }, g)))
    }))
}

function ve() {
    return typeof window < "u"
}

function Ot(t) {
    return Ue(t) ? (t.nodeName || "").toLowerCase() : "#document"
}

function st(t) {
    var e;
    return (t == null || (e = t.ownerDocument) == null ? void 0 : e.defaultView) || window
}

function ht(t) {
    var e;
    return (e = (Ue(t) ? t.ownerDocument : t.document) || window.document) == null ? void 0 : e.documentElement
}

function Ue(t) {
    return ve() ? t instanceof Node || t instanceof st(t).Node : !1
}

function U(t) {
    return ve() ? t instanceof Element || t instanceof st(t).Element : !1
}

function K(t) {
    return ve() ? t instanceof HTMLElement || t instanceof st(t).HTMLElement : !1
}

function Be(t) {
    return !ve() || typeof ShadowRoot > "u" ? !1 : t instanceof ShadowRoot || t instanceof st(t).ShadowRoot
}
const or = new Set(["inline", "contents"]);

function Zt(t) {
    const {
        overflow: e,
        overflowX: n,
        overflowY: o,
        display: r
    } = ct(t);
    return /auto|scroll|overlay|hidden|clip/.test(e + o + n) && !or.has(r)
}
const rr = new Set(["table", "td", "th"]);

function sr(t) {
    return rr.has(Ot(t))
}
const ir = [":popover-open", ":modal"];

function he(t) {
    return ir.some(e => {
        try {
            return t.matches(e)
        } catch {
            return !1
        }
    })
}
const ar = ["transform", "translate", "scale", "rotate", "perspective"],
    lr = ["transform", "translate", "scale", "rotate", "perspective", "filter"],
    cr = ["paint", "layout", "strict", "content"];

function Ye(t) {
    const e = be(),
        n = U(t) ? ct(t) : t;
    return ar.some(o => n[o] ? n[o] !== "none" : !1) || (n.containerType ? n.containerType !== "normal" : !1) || !e && (n.backdropFilter ? n.backdropFilter !== "none" : !1) || !e && (n.filter ? n.filter !== "none" : !1) || lr.some(o => (n.willChange || "").includes(o)) || cr.some(o => (n.contain || "").includes(o))
}

function ur(t) {
    let e = _t(t);
    for (; K(e) && !wt(e);) {
        if (Ye(e)) return e;
        if (he(e)) return null;
        e = _t(e)
    }
    return null
}

function be() {
    return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none")
}
const fr = new Set(["html", "body", "#document"]);

function wt(t) {
    return fr.has(Ot(t))
}

function ct(t) {
    return st(t).getComputedStyle(t)
}

function xe(t) {
    return U(t) ? {
        scrollLeft: t.scrollLeft,
        scrollTop: t.scrollTop
    } : {
        scrollLeft: t.scrollX,
        scrollTop: t.scrollY
    }
}

function _t(t) {
    if (Ot(t) === "html") return t;
    const e = t.assignedSlot || t.parentNode || Be(t) && t.host || ht(t);
    return Be(e) ? e.host : e
}

function Un(t) {
    const e = _t(t);
    return wt(e) ? t.ownerDocument ? t.ownerDocument.body : t.body : K(e) && Zt(e) ? e : Un(e)
}

function At(t, e, n) {
    var o;
    e === void 0 && (e = []), n === void 0 && (n = !0);
    const r = Un(t),
        s = r === ((o = t.ownerDocument) == null ? void 0 : o.body),
        i = st(r);
    if (s) {
        const a = We(i);
        return e.concat(i, i.visualViewport || [], Zt(r) ? r : [], a && n ? At(a) : [])
    }
    return e.concat(r, At(r, [], n))
}

function We(t) {
    return t.parent && Object.getPrototypeOf(t.parent) ? t.frameElement : null
}
const Yn = ["top", "right", "bottom", "left"],
    rn = ["start", "end"],
    sn = Yn.reduce((t, e) => t.concat(e, e + "-" + rn[0], e + "-" + rn[1]), []),
    gt = Math.min,
    Q = Math.max,
    se = Math.round,
    ee = Math.floor,
    vt = t => ({
        x: t,
        y: t
    }),
    dr = {
        left: "right",
        right: "left",
        bottom: "top",
        top: "bottom"
    },
    mr = {
        start: "end",
        end: "start"
    };

function ze(t, e, n) {
    return Q(t, gt(e, n))
}

function Et(t, e) {
    return typeof t == "function" ? t(e) : t
}

function ut(t) {
    return t.split("-")[0]
}

function pt(t) {
    return t.split("-")[1]
}

function Kn(t) {
    return t === "x" ? "y" : "x"
}

function Ke(t) {
    return t === "y" ? "height" : "width"
}
const pr = new Set(["top", "bottom"]);

function yt(t) {
    return pr.has(ut(t)) ? "y" : "x"
}

function Ge(t) {
    return Kn(yt(t))
}

function Gn(t, e, n) {
    n === void 0 && (n = !1);
    const o = pt(t),
        r = Ge(t),
        s = Ke(r);
    let i = r === "x" ? o === (n ? "end" : "start") ? "right" : "left" : o === "start" ? "bottom" : "top";
    return e.reference[s] > e.floating[s] && (i = ae(i)), [i, ae(i)]
}

function gr(t) {
    const e = ae(t);
    return [ie(t), e, ie(e)]
}

function ie(t) {
    return t.replace(/start|end/g, e => mr[e])
}
const an = ["left", "right"],
    ln = ["right", "left"],
    yr = ["top", "bottom"],
    vr = ["bottom", "top"];

function hr(t, e, n) {
    switch (t) {
        case "top":
        case "bottom":
            return n ? e ? ln : an : e ? an : ln;
        case "left":
        case "right":
            return e ? yr : vr;
        default:
            return []
    }
}

function br(t, e, n, o) {
    const r = pt(t);
    let s = hr(ut(t), n === "start", o);
    return r && (s = s.map(i => i + "-" + r), e && (s = s.concat(s.map(ie)))), s
}

function ae(t) {
    return t.replace(/left|right|bottom|top/g, e => dr[e])
}

function xr(t) {
    return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        ...t
    }
}

function Ze(t) {
    return typeof t != "number" ? xr(t) : {
        top: t,
        right: t,
        bottom: t,
        left: t
    }
}

function Vt(t) {
    const {
        x: e,
        y: n,
        width: o,
        height: r
    } = t;
    return {
        width: o,
        height: r,
        top: n,
        left: e,
        right: e + o,
        bottom: n + r,
        x: e,
        y: n
    }
}
/*!
 * tabbable 6.2.0
 * @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
 */
var wr = ["input:not([inert])", "select:not([inert])", "textarea:not([inert])", "a[href]:not([inert])", "button:not([inert])", "[tabindex]:not(slot):not([inert])", "audio[controls]:not([inert])", "video[controls]:not([inert])", '[contenteditable]:not([contenteditable="false"]):not([inert])', "details>summary:first-of-type:not([inert])", "details:not([inert])"],
    le = wr.join(","),
    Zn = typeof Element > "u",
    Ht = Zn ? function() {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector,
    ce = !Zn && Element.prototype.getRootNode ? function(t) {
        var e;
        return t == null || (e = t.getRootNode) === null || e === void 0 ? void 0 : e.call(t)
    } : function(t) {
        return t == null ? void 0 : t.ownerDocument
    },
    ue = function t(e, n) {
        var o;
        n === void 0 && (n = !0);
        var r = e == null || (o = e.getAttribute) === null || o === void 0 ? void 0 : o.call(e, "inert"),
            s = r === "" || r === "true",
            i = s || n && e && t(e.parentNode);
        return i
    },
    Tr = function(e) {
        var n, o = e == null || (n = e.getAttribute) === null || n === void 0 ? void 0 : n.call(e, "contenteditable");
        return o === "" || o === "true"
    },
    Qn = function(e, n, o) {
        if (ue(e)) return [];
        var r = Array.prototype.slice.apply(e.querySelectorAll(le));
        return n && Ht.call(e, le) && r.unshift(e), r = r.filter(o), r
    },
    Jn = function t(e, n, o) {
        for (var r = [], s = Array.from(e); s.length;) {
            var i = s.shift();
            if (!ue(i, !1))
                if (i.tagName === "SLOT") {
                    var a = i.assignedElements(),
                        l = a.length ? a : i.children,
                        c = t(l, !0, o);
                    o.flatten ? r.push.apply(r, c) : r.push({
                        scopeParent: i,
                        candidates: c
                    })
                } else {
                    var u = Ht.call(i, le);
                    u && o.filter(i) && (n || !e.includes(i)) && r.push(i);
                    var p = i.shadowRoot || typeof o.getShadowRoot == "function" && o.getShadowRoot(i),
                        h = !ue(p, !1) && (!o.shadowRootFilter || o.shadowRootFilter(i));
                    if (p && h) {
                        var f = t(p === !0 ? i.children : p.children, !0, o);
                        o.flatten ? r.push.apply(r, f) : r.push({
                            scopeParent: i,
                            candidates: f
                        })
                    } else s.unshift.apply(s, i.children)
                }
        }
        return r
    },
    to = function(e) {
        return !isNaN(parseInt(e.getAttribute("tabindex"), 10))
    },
    eo = function(e) {
        if (!e) throw new Error("No node provided");
        return e.tabIndex < 0 && (/^(AUDIO|VIDEO|DETAILS)$/.test(e.tagName) || Tr(e)) && !to(e) ? 0 : e.tabIndex
    },
    _r = function(e, n) {
        var o = eo(e);
        return o < 0 && n && !to(e) ? 0 : o
    },
    Er = function(e, n) {
        return e.tabIndex === n.tabIndex ? e.documentOrder - n.documentOrder : e.tabIndex - n.tabIndex
    },
    no = function(e) {
        return e.tagName === "INPUT"
    },
    Rr = function(e) {
        return no(e) && e.type === "hidden"
    },
    Cr = function(e) {
        var n = e.tagName === "DETAILS" && Array.prototype.slice.apply(e.children).some(function(o) {
            return o.tagName === "SUMMARY"
        });
        return n
    },
    Sr = function(e, n) {
        for (var o = 0; o < e.length; o++)
            if (e[o].checked && e[o].form === n) return e[o]
    },
    kr = function(e) {
        if (!e.name) return !0;
        var n = e.form || ce(e),
            o = function(a) {
                return n.querySelectorAll('input[type="radio"][name="' + a + '"]')
            },
            r;
        if (typeof window < "u" && typeof window.CSS < "u" && typeof window.CSS.escape == "function") r = o(window.CSS.escape(e.name));
        else try {
            r = o(e.name)
        } catch (i) {
            return console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s", i.message), !1
        }
        var s = Sr(r, e.form);
        return !s || s === e
    },
    Ir = function(e) {
        return no(e) && e.type === "radio"
    },
    Ar = function(e) {
        return Ir(e) && !kr(e)
    },
    Or = function(e) {
        var n, o = e && ce(e),
            r = (n = o) === null || n === void 0 ? void 0 : n.host,
            s = !1;
        if (o && o !== e) {
            var i, a, l;
            for (s = !!((i = r) !== null && i !== void 0 && (a = i.ownerDocument) !== null && a !== void 0 && a.contains(r) || e != null && (l = e.ownerDocument) !== null && l !== void 0 && l.contains(e)); !s && r;) {
                var c, u, p;
                o = ce(r), r = (c = o) === null || c === void 0 ? void 0 : c.host, s = !!((u = r) !== null && u !== void 0 && (p = u.ownerDocument) !== null && p !== void 0 && p.contains(r))
            }
        }
        return s
    },
    cn = function(e) {
        var n = e.getBoundingClientRect(),
            o = n.width,
            r = n.height;
        return o === 0 && r === 0
    },
    Lr = function(e, n) {
        var o = n.displayCheck,
            r = n.getShadowRoot;
        if (getComputedStyle(e).visibility === "hidden") return !0;
        var s = Ht.call(e, "details>summary:first-of-type"),
            i = s ? e.parentElement : e;
        if (Ht.call(i, "details:not([open]) *")) return !0;
        if (!o || o === "full" || o === "legacy-full") {
            if (typeof r == "function") {
                for (var a = e; e;) {
                    var l = e.parentElement,
                        c = ce(e);
                    if (l && !l.shadowRoot && r(l) === !0) return cn(e);
                    e.assignedSlot ? e = e.assignedSlot : !l && c !== e.ownerDocument ? e = c.host : e = l
                }
                e = a
            }
            if (Or(e)) return !e.getClientRects().length;
            if (o !== "legacy-full") return !0
        } else if (o === "non-zero-area") return cn(e);
        return !1
    },
    Pr = function(e) {
        if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName))
            for (var n = e.parentElement; n;) {
                if (n.tagName === "FIELDSET" && n.disabled) {
                    for (var o = 0; o < n.children.length; o++) {
                        var r = n.children.item(o);
                        if (r.tagName === "LEGEND") return Ht.call(n, "fieldset[disabled] *") ? !0 : !r.contains(e)
                    }
                    return !0
                }
                n = n.parentElement
            }
        return !1
    },
    Ve = function(e, n) {
        return !(n.disabled || ue(n) || Rr(n) || Lr(n, e) || Cr(n) || Pr(n))
    },
    He = function(e, n) {
        return !(Ar(n) || eo(n) < 0 || !Ve(e, n))
    },
    Dr = function(e) {
        var n = parseInt(e.getAttribute("tabindex"), 10);
        return !!(isNaN(n) || n >= 0)
    },
    Mr = function t(e) {
        var n = [],
            o = [];
        return e.forEach(function(r, s) {
            var i = !!r.scopeParent,
                a = i ? r.scopeParent : r,
                l = _r(a, i),
                c = i ? t(r.candidates) : a;
            l === 0 ? i ? n.push.apply(n, c) : n.push(a) : o.push({
                documentOrder: s,
                tabIndex: l,
                item: r,
                isScope: i,
                content: c
            })
        }), o.sort(Er).reduce(function(r, s) {
            return s.isScope ? r.push.apply(r, s.content) : r.push(s.content), r
        }, []).concat(n)
    },
    we = function(e, n) {
        n = n || {};
        var o;
        return n.getShadowRoot ? o = Jn([e], n.includeContainer, {
            filter: He.bind(null, n),
            flatten: !1,
            getShadowRoot: n.getShadowRoot,
            shadowRootFilter: Dr
        }) : o = Qn(e, n.includeContainer, He.bind(null, n)), Mr(o)
    },
    Fr = function(e, n) {
        n = n || {};
        var o;
        return n.getShadowRoot ? o = Jn([e], n.includeContainer, {
            filter: Ve.bind(null, n),
            flatten: !0,
            getShadowRoot: n.getShadowRoot
        }) : o = Qn(e, n.includeContainer, Ve.bind(null, n)), o
    },
    oo = function(e, n) {
        if (n = n || {}, !e) throw new Error("No node provided");
        return Ht.call(e, le) === !1 ? !1 : He(n, e)
    };

function Nr() {
    const t = navigator.userAgentData;
    return t != null && t.platform ? t.platform : navigator.platform
}

function ro() {
    const t = navigator.userAgentData;
    return t && Array.isArray(t.brands) ? t.brands.map(e => {
        let {
            brand: n,
            version: o
        } = e;
        return n + "/" + o
    }).join(" ") : navigator.userAgent
}

function $r() {
    return /apple/i.test(navigator.vendor)
}

function je() {
    const t = /android/i;
    return t.test(Nr()) || t.test(ro())
}

function Br() {
    return ro().includes("jsdom/")
}
const un = "data-floating-ui-focusable",
    Wr = "input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])";

function $t(t) {
    let e = t.activeElement;
    for (;
        ((n = e) == null || (n = n.shadowRoot) == null ? void 0 : n.activeElement) != null;) {
        var n;
        e = e.shadowRoot.activeElement
    }
    return e
}

function nt(t, e) {
    if (!t || !e) return !1;
    const n = e.getRootNode == null ? void 0 : e.getRootNode();
    if (t.contains(e)) return !0;
    if (n && Be(n)) {
        let o = e;
        for (; o;) {
            if (t === o) return !0;
            o = o.parentNode || o.host
        }
    }
    return !1
}

function kt(t) {
    return "composedPath" in t ? t.composedPath()[0] : t.target
}

function Se(t, e) {
    if (e == null) return !1;
    if ("composedPath" in t) return t.composedPath().includes(e);
    const n = t;
    return n.target != null && e.contains(n.target)
}

function zr(t) {
    return t.matches("html,body")
}

function tt(t) {
    return (t == null ? void 0 : t.ownerDocument) || document
}

function so(t) {
    return K(t) && t.matches(Wr)
}

function fn(t) {
    return t ? t.getAttribute("role") === "combobox" && so(t) : !1
}

function Xe(t) {
    return t ? t.hasAttribute(un) ? t : t.querySelector("[" + un + "]") || t : null
}

function Bt(t, e, n) {
    return n === void 0 && (n = !0), t.filter(r => {
        var s;
        return r.parentId === e && (!n || ((s = r.context) == null ? void 0 : s.open))
    }).flatMap(r => [r, ...Bt(t, r.id, n)])
}

function dn(t, e) {
    var n;
    let o = [],
        r = (n = t.find(s => s.id === e)) == null ? void 0 : n.parentId;
    for (; r;) {
        const s = t.find(i => i.id === r);
        r = s == null ? void 0 : s.parentId, s && (o = o.concat(s))
    }
    return o
}

function ke(t) {
    t.preventDefault(), t.stopPropagation()
}

function Vr(t) {
    return "nativeEvent" in t
}

function Hr(t) {
    return t.mozInputSource === 0 && t.isTrusted ? !0 : je() && t.pointerType ? t.type === "click" && t.buttons === 1 : t.detail === 0 && !t.pointerType
}

function jr(t) {
    return Br() ? !1 : !je() && t.width === 0 && t.height === 0 || je() && t.width === 1 && t.height === 1 && t.pressure === 0 && t.detail === 0 && t.pointerType === "mouse" || t.width < 1 && t.height < 1 && t.pressure === 0 && t.detail === 0 && t.pointerType === "touch"
}

function Yt(t, e) {
    const n = ["mouse", "pen"];
    return e || n.push("", void 0), n.includes(t)
}
var Xr = typeof document < "u",
    qr = function() {},
    J = Xr ? y.useLayoutEffect : qr;
const Ur = { ...Nn
};

function mt(t) {
    const e = y.useRef(t);
    return J(() => {
        e.current = t
    }), e
}
const Yr = Ur.useInsertionEffect,
    Kr = Yr || (t => t());

function ot(t) {
    const e = y.useRef(() => {});
    return Kr(() => {
        e.current = t
    }), y.useCallback(function() {
        for (var n = arguments.length, o = new Array(n), r = 0; r < n; r++) o[r] = arguments[r];
        return e.current == null ? void 0 : e.current(...o)
    }, [])
}
const Qt = () => ({
    getShadowRoot: !0,
    displayCheck: typeof ResizeObserver == "function" && ResizeObserver.toString().includes("[native code]") ? "full" : "none"
});

function io(t, e) {
    const n = we(t, Qt()),
        o = n.length;
    if (o === 0) return;
    const r = $t(tt(t)),
        s = n.indexOf(r),
        i = s === -1 ? e === 1 ? 0 : o - 1 : s + e;
    return n[i]
}

function ao(t) {
    return io(tt(t).body, 1) || t
}

function lo(t) {
    return io(tt(t).body, -1) || t
}

function qt(t, e) {
    const n = e || t.currentTarget,
        o = t.relatedTarget;
    return !o || !nt(n, o)
}

function Gr(t) {
    we(t, Qt()).forEach(n => {
        n.dataset.tabindex = n.getAttribute("tabindex") || "", n.setAttribute("tabindex", "-1")
    })
}

function mn(t) {
    t.querySelectorAll("[data-tabindex]").forEach(n => {
        const o = n.dataset.tabindex;
        delete n.dataset.tabindex, o ? n.setAttribute("tabindex", o) : n.removeAttribute("tabindex")
    })
}

function pn(t, e, n) {
    let {
        reference: o,
        floating: r
    } = t;
    const s = yt(e),
        i = Ge(e),
        a = Ke(i),
        l = ut(e),
        c = s === "y",
        u = o.x + o.width / 2 - r.width / 2,
        p = o.y + o.height / 2 - r.height / 2,
        h = o[a] / 2 - r[a] / 2;
    let f;
    switch (l) {
        case "top":
            f = {
                x: u,
                y: o.y - r.height
            };
            break;
        case "bottom":
            f = {
                x: u,
                y: o.y + o.height
            };
            break;
        case "right":
            f = {
                x: o.x + o.width,
                y: p
            };
            break;
        case "left":
            f = {
                x: o.x - r.width,
                y: p
            };
            break;
        default:
            f = {
                x: o.x,
                y: o.y
            }
    }
    switch (pt(e)) {
        case "start":
            f[i] -= h * (n && c ? -1 : 1);
            break;
        case "end":
            f[i] += h * (n && c ? -1 : 1);
            break
    }
    return f
}
const Zr = async (t, e, n) => {
    const {
        placement: o = "bottom",
        strategy: r = "absolute",
        middleware: s = [],
        platform: i
    } = n, a = s.filter(Boolean), l = await (i.isRTL == null ? void 0 : i.isRTL(e));
    let c = await i.getElementRects({
            reference: t,
            floating: e,
            strategy: r
        }),
        {
            x: u,
            y: p
        } = pn(c, o, l),
        h = o,
        f = {},
        b = 0;
    for (let d = 0; d < a.length; d++) {
        const {
            name: v,
            fn: x
        } = a[d], {
            x: m,
            y: g,
            data: T,
            reset: E
        } = await x({
            x: u,
            y: p,
            initialPlacement: o,
            placement: h,
            strategy: r,
            middlewareData: f,
            rects: c,
            platform: i,
            elements: {
                reference: t,
                floating: e
            }
        });
        u = m ? ? u, p = g ? ? p, f = { ...f,
            [v]: { ...f[v],
                ...T
            }
        }, E && b <= 50 && (b++, typeof E == "object" && (E.placement && (h = E.placement), E.rects && (c = E.rects === !0 ? await i.getElementRects({
            reference: t,
            floating: e,
            strategy: r
        }) : E.rects), {
            x: u,
            y: p
        } = pn(c, h, l)), d = -1)
    }
    return {
        x: u,
        y: p,
        placement: h,
        strategy: r,
        middlewareData: f
    }
};
async function jt(t, e) {
    var n;
    e === void 0 && (e = {});
    const {
        x: o,
        y: r,
        platform: s,
        rects: i,
        elements: a,
        strategy: l
    } = t, {
        boundary: c = "clippingAncestors",
        rootBoundary: u = "viewport",
        elementContext: p = "floating",
        altBoundary: h = !1,
        padding: f = 0
    } = Et(e, t), b = Ze(f), v = a[h ? p === "floating" ? "reference" : "floating" : p], x = Vt(await s.getClippingRect({
        element: (n = await (s.isElement == null ? void 0 : s.isElement(v))) == null || n ? v : v.contextElement || await (s.getDocumentElement == null ? void 0 : s.getDocumentElement(a.floating)),
        boundary: c,
        rootBoundary: u,
        strategy: l
    })), m = p === "floating" ? {
        x: o,
        y: r,
        width: i.floating.width,
        height: i.floating.height
    } : i.reference, g = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(a.floating)), T = await (s.isElement == null ? void 0 : s.isElement(g)) ? await (s.getScale == null ? void 0 : s.getScale(g)) || {
        x: 1,
        y: 1
    } : {
        x: 1,
        y: 1
    }, E = Vt(s.convertOffsetParentRelativeRectToViewportRelativeRect ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
        elements: a,
        rect: m,
        offsetParent: g,
        strategy: l
    }) : m);
    return {
        top: (x.top - E.top + b.top) / T.y,
        bottom: (E.bottom - x.bottom + b.bottom) / T.y,
        left: (x.left - E.left + b.left) / T.x,
        right: (E.right - x.right + b.right) / T.x
    }
}
const Qr = t => ({
    name: "arrow",
    options: t,
    async fn(e) {
        const {
            x: n,
            y: o,
            placement: r,
            rects: s,
            platform: i,
            elements: a,
            middlewareData: l
        } = e, {
            element: c,
            padding: u = 0
        } = Et(t, e) || {};
        if (c == null) return {};
        const p = Ze(u),
            h = {
                x: n,
                y: o
            },
            f = Ge(r),
            b = Ke(f),
            d = await i.getDimensions(c),
            v = f === "y",
            x = v ? "top" : "left",
            m = v ? "bottom" : "right",
            g = v ? "clientHeight" : "clientWidth",
            T = s.reference[b] + s.reference[f] - h[f] - s.floating[b],
            E = h[f] - s.reference[f],
            A = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(c));
        let _ = A ? A[g] : 0;
        (!_ || !await (i.isElement == null ? void 0 : i.isElement(A))) && (_ = a.floating[g] || s.floating[b]);
        const I = T / 2 - E / 2,
            P = _ / 2 - d[b] / 2 - 1,
            k = gt(p[x], P),
            O = gt(p[m], P),
            N = k,
            M = _ - d[b] - O,
            R = _ / 2 - d[b] / 2 + I,
            C = ze(N, R, M),
            F = !l.arrow && pt(r) != null && R !== C && s.reference[b] / 2 - (R < N ? k : O) - d[b] / 2 < 0,
            S = F ? R < N ? R - N : R - M : 0;
        return {
            [f]: h[f] + S,
            data: {
                [f]: C,
                centerOffset: R - C - S,
                ...F && {
                    alignmentOffset: S
                }
            },
            reset: F
        }
    }
});

function Jr(t, e, n) {
    return (t ? [...n.filter(r => pt(r) === t), ...n.filter(r => pt(r) !== t)] : n.filter(r => ut(r) === r)).filter(r => t ? pt(r) === t || (e ? ie(r) !== r : !1) : !0)
}
const ts = function(t) {
        return t === void 0 && (t = {}), {
            name: "autoPlacement",
            options: t,
            async fn(e) {
                var n, o, r;
                const {
                    rects: s,
                    middlewareData: i,
                    placement: a,
                    platform: l,
                    elements: c
                } = e, {
                    crossAxis: u = !1,
                    alignment: p,
                    allowedPlacements: h = sn,
                    autoAlignment: f = !0,
                    ...b
                } = Et(t, e), d = p !== void 0 || h === sn ? Jr(p || null, f, h) : h, v = await jt(e, b), x = ((n = i.autoPlacement) == null ? void 0 : n.index) || 0, m = d[x];
                if (m == null) return {};
                const g = Gn(m, s, await (l.isRTL == null ? void 0 : l.isRTL(c.floating)));
                if (a !== m) return {
                    reset: {
                        placement: d[0]
                    }
                };
                const T = [v[ut(m)], v[g[0]], v[g[1]]],
                    E = [...((o = i.autoPlacement) == null ? void 0 : o.overflows) || [], {
                        placement: m,
                        overflows: T
                    }],
                    A = d[x + 1];
                if (A) return {
                    data: {
                        index: x + 1,
                        overflows: E
                    },
                    reset: {
                        placement: A
                    }
                };
                const _ = E.map(k => {
                        const O = pt(k.placement);
                        return [k.placement, O && u ? k.overflows.slice(0, 2).reduce((N, M) => N + M, 0) : k.overflows[0], k.overflows]
                    }).sort((k, O) => k[1] - O[1]),
                    P = ((r = _.filter(k => k[2].slice(0, pt(k[0]) ? 2 : 3).every(O => O <= 0))[0]) == null ? void 0 : r[0]) || _[0][0];
                return P !== a ? {
                    data: {
                        index: x + 1,
                        overflows: E
                    },
                    reset: {
                        placement: P
                    }
                } : {}
            }
        }
    },
    es = function(t) {
        return t === void 0 && (t = {}), {
            name: "flip",
            options: t,
            async fn(e) {
                var n, o;
                const {
                    placement: r,
                    middlewareData: s,
                    rects: i,
                    initialPlacement: a,
                    platform: l,
                    elements: c
                } = e, {
                    mainAxis: u = !0,
                    crossAxis: p = !0,
                    fallbackPlacements: h,
                    fallbackStrategy: f = "bestFit",
                    fallbackAxisSideDirection: b = "none",
                    flipAlignment: d = !0,
                    ...v
                } = Et(t, e);
                if ((n = s.arrow) != null && n.alignmentOffset) return {};
                const x = ut(r),
                    m = yt(a),
                    g = ut(a) === a,
                    T = await (l.isRTL == null ? void 0 : l.isRTL(c.floating)),
                    E = h || (g || !d ? [ae(a)] : gr(a)),
                    A = b !== "none";
                !h && A && E.push(...br(a, d, b, T));
                const _ = [a, ...E],
                    I = await jt(e, v),
                    P = [];
                let k = ((o = s.flip) == null ? void 0 : o.overflows) || [];
                if (u && P.push(I[x]), p) {
                    const R = Gn(r, i, T);
                    P.push(I[R[0]], I[R[1]])
                }
                if (k = [...k, {
                        placement: r,
                        overflows: P
                    }], !P.every(R => R <= 0)) {
                    var O, N;
                    const R = (((O = s.flip) == null ? void 0 : O.index) || 0) + 1,
                        C = _[R];
                    if (C && (!(p === "alignment" ? m !== yt(C) : !1) || k.every(w => yt(w.placement) === m ? w.overflows[0] > 0 : !0))) return {
                        data: {
                            index: R,
                            overflows: k
                        },
                        reset: {
                            placement: C
                        }
                    };
                    let F = (N = k.filter(S => S.overflows[0] <= 0).sort((S, w) => S.overflows[1] - w.overflows[1])[0]) == null ? void 0 : N.placement;
                    if (!F) switch (f) {
                        case "bestFit":
                            {
                                var M;
                                const S = (M = k.filter(w => {
                                    if (A) {
                                        const L = yt(w.placement);
                                        return L === m || L === "y"
                                    }
                                    return !0
                                }).map(w => [w.placement, w.overflows.filter(L => L > 0).reduce((L, $) => L + $, 0)]).sort((w, L) => w[1] - L[1])[0]) == null ? void 0 : M[0];S && (F = S);
                                break
                            }
                        case "initialPlacement":
                            F = a;
                            break
                    }
                    if (r !== F) return {
                        reset: {
                            placement: F
                        }
                    }
                }
                return {}
            }
        }
    };

function gn(t, e) {
    return {
        top: t.top - e.height,
        right: t.right - e.width,
        bottom: t.bottom - e.height,
        left: t.left - e.width
    }
}

function yn(t) {
    return Yn.some(e => t[e] >= 0)
}
const ns = function(t) {
    return t === void 0 && (t = {}), {
        name: "hide",
        options: t,
        async fn(e) {
            const {
                rects: n
            } = e, {
                strategy: o = "referenceHidden",
                ...r
            } = Et(t, e);
            switch (o) {
                case "referenceHidden":
                    {
                        const s = await jt(e, { ...r,
                                elementContext: "reference"
                            }),
                            i = gn(s, n.reference);
                        return {
                            data: {
                                referenceHiddenOffsets: i,
                                referenceHidden: yn(i)
                            }
                        }
                    }
                case "escaped":
                    {
                        const s = await jt(e, { ...r,
                                altBoundary: !0
                            }),
                            i = gn(s, n.floating);
                        return {
                            data: {
                                escapedOffsets: i,
                                escaped: yn(i)
                            }
                        }
                    }
                default:
                    return {}
            }
        }
    }
};

function co(t) {
    const e = gt(...t.map(s => s.left)),
        n = gt(...t.map(s => s.top)),
        o = Q(...t.map(s => s.right)),
        r = Q(...t.map(s => s.bottom));
    return {
        x: e,
        y: n,
        width: o - e,
        height: r - n
    }
}

function os(t) {
    const e = t.slice().sort((r, s) => r.y - s.y),
        n = [];
    let o = null;
    for (let r = 0; r < e.length; r++) {
        const s = e[r];
        !o || s.y - o.y > o.height / 2 ? n.push([s]) : n[n.length - 1].push(s), o = s
    }
    return n.map(r => Vt(co(r)))
}
const rs = function(t) {
        return t === void 0 && (t = {}), {
            name: "inline",
            options: t,
            async fn(e) {
                const {
                    placement: n,
                    elements: o,
                    rects: r,
                    platform: s,
                    strategy: i
                } = e, {
                    padding: a = 2,
                    x: l,
                    y: c
                } = Et(t, e), u = Array.from(await (s.getClientRects == null ? void 0 : s.getClientRects(o.reference)) || []), p = os(u), h = Vt(co(u)), f = Ze(a);

                function b() {
                    if (p.length === 2 && p[0].left > p[1].right && l != null && c != null) return p.find(v => l > v.left - f.left && l < v.right + f.right && c > v.top - f.top && c < v.bottom + f.bottom) || h;
                    if (p.length >= 2) {
                        if (yt(n) === "y") {
                            const k = p[0],
                                O = p[p.length - 1],
                                N = ut(n) === "top",
                                M = k.top,
                                R = O.bottom,
                                C = N ? k.left : O.left,
                                F = N ? k.right : O.right,
                                S = F - C,
                                w = R - M;
                            return {
                                top: M,
                                bottom: R,
                                left: C,
                                right: F,
                                width: S,
                                height: w,
                                x: C,
                                y: M
                            }
                        }
                        const v = ut(n) === "left",
                            x = Q(...p.map(k => k.right)),
                            m = gt(...p.map(k => k.left)),
                            g = p.filter(k => v ? k.left === m : k.right === x),
                            T = g[0].top,
                            E = g[g.length - 1].bottom,
                            A = m,
                            _ = x,
                            I = _ - A,
                            P = E - T;
                        return {
                            top: T,
                            bottom: E,
                            left: A,
                            right: _,
                            width: I,
                            height: P,
                            x: A,
                            y: T
                        }
                    }
                    return h
                }
                const d = await s.getElementRects({
                    reference: {
                        getBoundingClientRect: b
                    },
                    floating: o.floating,
                    strategy: i
                });
                return r.reference.x !== d.reference.x || r.reference.y !== d.reference.y || r.reference.width !== d.reference.width || r.reference.height !== d.reference.height ? {
                    reset: {
                        rects: d
                    }
                } : {}
            }
        }
    },
    ss = new Set(["left", "top"]);
async function is(t, e) {
    const {
        placement: n,
        platform: o,
        elements: r
    } = t, s = await (o.isRTL == null ? void 0 : o.isRTL(r.floating)), i = ut(n), a = pt(n), l = yt(n) === "y", c = ss.has(i) ? -1 : 1, u = s && l ? -1 : 1, p = Et(e, t);
    let {
        mainAxis: h,
        crossAxis: f,
        alignmentAxis: b
    } = typeof p == "number" ? {
        mainAxis: p,
        crossAxis: 0,
        alignmentAxis: null
    } : {
        mainAxis: p.mainAxis || 0,
        crossAxis: p.crossAxis || 0,
        alignmentAxis: p.alignmentAxis
    };
    return a && typeof b == "number" && (f = a === "end" ? b * -1 : b), l ? {
        x: f * u,
        y: h * c
    } : {
        x: h * c,
        y: f * u
    }
}
const as = function(t) {
        return t === void 0 && (t = 0), {
            name: "offset",
            options: t,
            async fn(e) {
                var n, o;
                const {
                    x: r,
                    y: s,
                    placement: i,
                    middlewareData: a
                } = e, l = await is(e, t);
                return i === ((n = a.offset) == null ? void 0 : n.placement) && (o = a.arrow) != null && o.alignmentOffset ? {} : {
                    x: r + l.x,
                    y: s + l.y,
                    data: { ...l,
                        placement: i
                    }
                }
            }
        }
    },
    ls = function(t) {
        return t === void 0 && (t = {}), {
            name: "shift",
            options: t,
            async fn(e) {
                const {
                    x: n,
                    y: o,
                    placement: r
                } = e, {
                    mainAxis: s = !0,
                    crossAxis: i = !1,
                    limiter: a = {
                        fn: v => {
                            let {
                                x,
                                y: m
                            } = v;
                            return {
                                x,
                                y: m
                            }
                        }
                    },
                    ...l
                } = Et(t, e), c = {
                    x: n,
                    y: o
                }, u = await jt(e, l), p = yt(ut(r)), h = Kn(p);
                let f = c[h],
                    b = c[p];
                if (s) {
                    const v = h === "y" ? "top" : "left",
                        x = h === "y" ? "bottom" : "right",
                        m = f + u[v],
                        g = f - u[x];
                    f = ze(m, f, g)
                }
                if (i) {
                    const v = p === "y" ? "top" : "left",
                        x = p === "y" ? "bottom" : "right",
                        m = b + u[v],
                        g = b - u[x];
                    b = ze(m, b, g)
                }
                const d = a.fn({ ...e,
                    [h]: f,
                    [p]: b
                });
                return { ...d,
                    data: {
                        x: d.x - n,
                        y: d.y - o,
                        enabled: {
                            [h]: s,
                            [p]: i
                        }
                    }
                }
            }
        }
    },
    cs = function(t) {
        return t === void 0 && (t = {}), {
            name: "size",
            options: t,
            async fn(e) {
                var n, o;
                const {
                    placement: r,
                    rects: s,
                    platform: i,
                    elements: a
                } = e, {
                    apply: l = () => {},
                    ...c
                } = Et(t, e), u = await jt(e, c), p = ut(r), h = pt(r), f = yt(r) === "y", {
                    width: b,
                    height: d
                } = s.floating;
                let v, x;
                p === "top" || p === "bottom" ? (v = p, x = h === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (x = p, v = h === "end" ? "top" : "bottom");
                const m = d - u.top - u.bottom,
                    g = b - u.left - u.right,
                    T = gt(d - u[v], m),
                    E = gt(b - u[x], g),
                    A = !e.middlewareData.shift;
                let _ = T,
                    I = E;
                if ((n = e.middlewareData.shift) != null && n.enabled.x && (I = g), (o = e.middlewareData.shift) != null && o.enabled.y && (_ = m), A && !h) {
                    const k = Q(u.left, 0),
                        O = Q(u.right, 0),
                        N = Q(u.top, 0),
                        M = Q(u.bottom, 0);
                    f ? I = b - 2 * (k !== 0 || O !== 0 ? k + O : Q(u.left, u.right)) : _ = d - 2 * (N !== 0 || M !== 0 ? N + M : Q(u.top, u.bottom))
                }
                await l({ ...e,
                    availableWidth: I,
                    availableHeight: _
                });
                const P = await i.getDimensions(a.floating);
                return b !== P.width || d !== P.height ? {
                    reset: {
                        rects: !0
                    }
                } : {}
            }
        }
    };

function uo(t) {
    const e = ct(t);
    let n = parseFloat(e.width) || 0,
        o = parseFloat(e.height) || 0;
    const r = K(t),
        s = r ? t.offsetWidth : n,
        i = r ? t.offsetHeight : o,
        a = se(n) !== s || se(o) !== i;
    return a && (n = s, o = i), {
        width: n,
        height: o,
        $: a
    }
}

function Qe(t) {
    return U(t) ? t : t.contextElement
}

function Wt(t) {
    const e = Qe(t);
    if (!K(e)) return vt(1);
    const n = e.getBoundingClientRect(),
        {
            width: o,
            height: r,
            $: s
        } = uo(e);
    let i = (s ? se(n.width) : n.width) / o,
        a = (s ? se(n.height) : n.height) / r;
    return (!i || !Number.isFinite(i)) && (i = 1), (!a || !Number.isFinite(a)) && (a = 1), {
        x: i,
        y: a
    }
}
const us = vt(0);

function fo(t) {
    const e = st(t);
    return !be() || !e.visualViewport ? us : {
        x: e.visualViewport.offsetLeft,
        y: e.visualViewport.offsetTop
    }
}

function fs(t, e, n) {
    return e === void 0 && (e = !1), !n || e && n !== st(t) ? !1 : e
}

function Mt(t, e, n, o) {
    e === void 0 && (e = !1), n === void 0 && (n = !1);
    const r = t.getBoundingClientRect(),
        s = Qe(t);
    let i = vt(1);
    e && (o ? U(o) && (i = Wt(o)) : i = Wt(t));
    const a = fs(s, n, o) ? fo(s) : vt(0);
    let l = (r.left + a.x) / i.x,
        c = (r.top + a.y) / i.y,
        u = r.width / i.x,
        p = r.height / i.y;
    if (s) {
        const h = st(s),
            f = o && U(o) ? st(o) : o;
        let b = h,
            d = We(b);
        for (; d && o && f !== b;) {
            const v = Wt(d),
                x = d.getBoundingClientRect(),
                m = ct(d),
                g = x.left + (d.clientLeft + parseFloat(m.paddingLeft)) * v.x,
                T = x.top + (d.clientTop + parseFloat(m.paddingTop)) * v.y;
            l *= v.x, c *= v.y, u *= v.x, p *= v.y, l += g, c += T, b = st(d), d = We(b)
        }
    }
    return Vt({
        width: u,
        height: p,
        x: l,
        y: c
    })
}

function Te(t, e) {
    const n = xe(t).scrollLeft;
    return e ? e.left + n : Mt(ht(t)).left + n
}

function mo(t, e) {
    const n = t.getBoundingClientRect(),
        o = n.left + e.scrollLeft - Te(t, n),
        r = n.top + e.scrollTop;
    return {
        x: o,
        y: r
    }
}

function ds(t) {
    let {
        elements: e,
        rect: n,
        offsetParent: o,
        strategy: r
    } = t;
    const s = r === "fixed",
        i = ht(o),
        a = e ? he(e.floating) : !1;
    if (o === i || a && s) return n;
    let l = {
            scrollLeft: 0,
            scrollTop: 0
        },
        c = vt(1);
    const u = vt(0),
        p = K(o);
    if ((p || !p && !s) && ((Ot(o) !== "body" || Zt(i)) && (l = xe(o)), K(o))) {
        const f = Mt(o);
        c = Wt(o), u.x = f.x + o.clientLeft, u.y = f.y + o.clientTop
    }
    const h = i && !p && !s ? mo(i, l) : vt(0);
    return {
        width: n.width * c.x,
        height: n.height * c.y,
        x: n.x * c.x - l.scrollLeft * c.x + u.x + h.x,
        y: n.y * c.y - l.scrollTop * c.y + u.y + h.y
    }
}

function ms(t) {
    return Array.from(t.getClientRects())
}

function ps(t) {
    const e = ht(t),
        n = xe(t),
        o = t.ownerDocument.body,
        r = Q(e.scrollWidth, e.clientWidth, o.scrollWidth, o.clientWidth),
        s = Q(e.scrollHeight, e.clientHeight, o.scrollHeight, o.clientHeight);
    let i = -n.scrollLeft + Te(t);
    const a = -n.scrollTop;
    return ct(o).direction === "rtl" && (i += Q(e.clientWidth, o.clientWidth) - r), {
        width: r,
        height: s,
        x: i,
        y: a
    }
}
const vn = 25;

function gs(t, e) {
    const n = st(t),
        o = ht(t),
        r = n.visualViewport;
    let s = o.clientWidth,
        i = o.clientHeight,
        a = 0,
        l = 0;
    if (r) {
        s = r.width, i = r.height;
        const u = be();
        (!u || u && e === "fixed") && (a = r.offsetLeft, l = r.offsetTop)
    }
    const c = Te(o);
    if (c <= 0) {
        const u = o.ownerDocument,
            p = u.body,
            h = getComputedStyle(p),
            f = u.compatMode === "CSS1Compat" && parseFloat(h.marginLeft) + parseFloat(h.marginRight) || 0,
            b = Math.abs(o.clientWidth - p.clientWidth - f);
        b <= vn && (s -= b)
    } else c <= vn && (s += c);
    return {
        width: s,
        height: i,
        x: a,
        y: l
    }
}
const ys = new Set(["absolute", "fixed"]);

function vs(t, e) {
    const n = Mt(t, !0, e === "fixed"),
        o = n.top + t.clientTop,
        r = n.left + t.clientLeft,
        s = K(t) ? Wt(t) : vt(1),
        i = t.clientWidth * s.x,
        a = t.clientHeight * s.y,
        l = r * s.x,
        c = o * s.y;
    return {
        width: i,
        height: a,
        x: l,
        y: c
    }
}

function hn(t, e, n) {
    let o;
    if (e === "viewport") o = gs(t, n);
    else if (e === "document") o = ps(ht(t));
    else if (U(e)) o = vs(e, n);
    else {
        const r = fo(t);
        o = {
            x: e.x - r.x,
            y: e.y - r.y,
            width: e.width,
            height: e.height
        }
    }
    return Vt(o)
}

function po(t, e) {
    const n = _t(t);
    return n === e || !U(n) || wt(n) ? !1 : ct(n).position === "fixed" || po(n, e)
}

function hs(t, e) {
    const n = e.get(t);
    if (n) return n;
    let o = At(t, [], !1).filter(a => U(a) && Ot(a) !== "body"),
        r = null;
    const s = ct(t).position === "fixed";
    let i = s ? _t(t) : t;
    for (; U(i) && !wt(i);) {
        const a = ct(i),
            l = Ye(i);
        !l && a.position === "fixed" && (r = null), (s ? !l && !r : !l && a.position === "static" && !!r && ys.has(r.position) || Zt(i) && !l && po(t, i)) ? o = o.filter(u => u !== i) : r = a, i = _t(i)
    }
    return e.set(t, o), o
}

function bs(t) {
    let {
        element: e,
        boundary: n,
        rootBoundary: o,
        strategy: r
    } = t;
    const i = [...n === "clippingAncestors" ? he(e) ? [] : hs(e, this._c) : [].concat(n), o],
        a = i[0],
        l = i.reduce((c, u) => {
            const p = hn(e, u, r);
            return c.top = Q(p.top, c.top), c.right = gt(p.right, c.right), c.bottom = gt(p.bottom, c.bottom), c.left = Q(p.left, c.left), c
        }, hn(e, a, r));
    return {
        width: l.right - l.left,
        height: l.bottom - l.top,
        x: l.left,
        y: l.top
    }
}

function xs(t) {
    const {
        width: e,
        height: n
    } = uo(t);
    return {
        width: e,
        height: n
    }
}

function ws(t, e, n) {
    const o = K(e),
        r = ht(e),
        s = n === "fixed",
        i = Mt(t, !0, s, e);
    let a = {
        scrollLeft: 0,
        scrollTop: 0
    };
    const l = vt(0);

    function c() {
        l.x = Te(r)
    }
    if (o || !o && !s)
        if ((Ot(e) !== "body" || Zt(r)) && (a = xe(e)), o) {
            const f = Mt(e, !0, s, e);
            l.x = f.x + e.clientLeft, l.y = f.y + e.clientTop
        } else r && c();
    s && !o && r && c();
    const u = r && !o && !s ? mo(r, a) : vt(0),
        p = i.left + a.scrollLeft - l.x - u.x,
        h = i.top + a.scrollTop - l.y - u.y;
    return {
        x: p,
        y: h,
        width: i.width,
        height: i.height
    }
}

function Ie(t) {
    return ct(t).position === "static"
}

function bn(t, e) {
    if (!K(t) || ct(t).position === "fixed") return null;
    if (e) return e(t);
    let n = t.offsetParent;
    return ht(t) === n && (n = n.ownerDocument.body), n
}

function go(t, e) {
    const n = st(t);
    if (he(t)) return n;
    if (!K(t)) {
        let r = _t(t);
        for (; r && !wt(r);) {
            if (U(r) && !Ie(r)) return r;
            r = _t(r)
        }
        return n
    }
    let o = bn(t, e);
    for (; o && sr(o) && Ie(o);) o = bn(o, e);
    return o && wt(o) && Ie(o) && !Ye(o) ? n : o || ur(t) || n
}
const Ts = async function(t) {
    const e = this.getOffsetParent || go,
        n = this.getDimensions,
        o = await n(t.floating);
    return {
        reference: ws(t.reference, await e(t.floating), t.strategy),
        floating: {
            x: 0,
            y: 0,
            width: o.width,
            height: o.height
        }
    }
};

function _s(t) {
    return ct(t).direction === "rtl"
}
const Es = {
    convertOffsetParentRelativeRectToViewportRelativeRect: ds,
    getDocumentElement: ht,
    getClippingRect: bs,
    getOffsetParent: go,
    getElementRects: Ts,
    getClientRects: ms,
    getDimensions: xs,
    getScale: Wt,
    isElement: U,
    isRTL: _s
};

function yo(t, e) {
    return t.x === e.x && t.y === e.y && t.width === e.width && t.height === e.height
}

function Rs(t, e) {
    let n = null,
        o;
    const r = ht(t);

    function s() {
        var a;
        clearTimeout(o), (a = n) == null || a.disconnect(), n = null
    }

    function i(a, l) {
        a === void 0 && (a = !1), l === void 0 && (l = 1), s();
        const c = t.getBoundingClientRect(),
            {
                left: u,
                top: p,
                width: h,
                height: f
            } = c;
        if (a || e(), !h || !f) return;
        const b = ee(p),
            d = ee(r.clientWidth - (u + h)),
            v = ee(r.clientHeight - (p + f)),
            x = ee(u),
            g = {
                rootMargin: -b + "px " + -d + "px " + -v + "px " + -x + "px",
                threshold: Q(0, gt(1, l)) || 1
            };
        let T = !0;

        function E(A) {
            const _ = A[0].intersectionRatio;
            if (_ !== l) {
                if (!T) return i();
                _ ? i(!1, _) : o = setTimeout(() => {
                    i(!1, 1e-7)
                }, 1e3)
            }
            _ === 1 && !yo(c, t.getBoundingClientRect()) && i(), T = !1
        }
        try {
            n = new IntersectionObserver(E, { ...g,
                root: r.ownerDocument
            })
        } catch {
            n = new IntersectionObserver(E, g)
        }
        n.observe(t)
    }
    return i(!0), s
}

function si(t, e, n, o) {
    o === void 0 && (o = {});
    const {
        ancestorScroll: r = !0,
        ancestorResize: s = !0,
        elementResize: i = typeof ResizeObserver == "function",
        layoutShift: a = typeof IntersectionObserver == "function",
        animationFrame: l = !1
    } = o, c = Qe(t), u = r || s ? [...c ? At(c) : [], ...At(e)] : [];
    u.forEach(x => {
        r && x.addEventListener("scroll", n, {
            passive: !0
        }), s && x.addEventListener("resize", n)
    });
    const p = c && a ? Rs(c, n) : null;
    let h = -1,
        f = null;
    i && (f = new ResizeObserver(x => {
        let [m] = x;
        m && m.target === c && f && (f.unobserve(e), cancelAnimationFrame(h), h = requestAnimationFrame(() => {
            var g;
            (g = f) == null || g.observe(e)
        })), n()
    }), c && !l && f.observe(c), f.observe(e));
    let b, d = l ? Mt(t) : null;
    l && v();

    function v() {
        const x = Mt(t);
        d && !yo(d, x) && n(), d = x, b = requestAnimationFrame(v)
    }
    return n(), () => {
        var x;
        u.forEach(m => {
            r && m.removeEventListener("scroll", n), s && m.removeEventListener("resize", n)
        }), p == null || p(), (x = f) == null || x.disconnect(), f = null, l && cancelAnimationFrame(b)
    }
}
const Cs = as,
    ii = ts,
    Ss = ls,
    ks = es,
    ai = cs,
    li = ns,
    ci = Qr,
    ui = rs,
    Is = (t, e, n) => {
        const o = new Map,
            r = {
                platform: Es,
                ...n
            },
            s = { ...r.platform,
                _c: o
            };
        return Zr(t, e, { ...r,
            platform: s
        })
    };
var As = typeof document < "u",
    Os = function() {},
    re = As ? y.useLayoutEffect : Os;

function fe(t, e) {
    if (t === e) return !0;
    if (typeof t != typeof e) return !1;
    if (typeof t == "function" && t.toString() === e.toString()) return !0;
    let n, o, r;
    if (t && e && typeof t == "object") {
        if (Array.isArray(t)) {
            if (n = t.length, n !== e.length) return !1;
            for (o = n; o-- !== 0;)
                if (!fe(t[o], e[o])) return !1;
            return !0
        }
        if (r = Object.keys(t), n = r.length, n !== Object.keys(e).length) return !1;
        for (o = n; o-- !== 0;)
            if (!{}.hasOwnProperty.call(e, r[o])) return !1;
        for (o = n; o-- !== 0;) {
            const s = r[o];
            if (!(s === "_owner" && t.$$typeof) && !fe(t[s], e[s])) return !1
        }
        return !0
    }
    return t !== t && e !== e
}

function vo(t) {
    return typeof window > "u" ? 1 : (t.ownerDocument.defaultView || window).devicePixelRatio || 1
}

function xn(t, e) {
    const n = vo(t);
    return Math.round(e * n) / n
}

function Ae(t) {
    const e = y.useRef(t);
    return re(() => {
        e.current = t
    }), e
}

function Ls(t) {
    t === void 0 && (t = {});
    const {
        placement: e = "bottom",
        strategy: n = "absolute",
        middleware: o = [],
        platform: r,
        elements: {
            reference: s,
            floating: i
        } = {},
        transform: a = !0,
        whileElementsMounted: l,
        open: c
    } = t, [u, p] = y.useState({
        x: 0,
        y: 0,
        strategy: n,
        placement: e,
        middlewareData: {},
        isPositioned: !1
    }), [h, f] = y.useState(o);
    fe(h, o) || f(o);
    const [b, d] = y.useState(null), [v, x] = y.useState(null), m = y.useCallback(w => {
        w !== A.current && (A.current = w, d(w))
    }, []), g = y.useCallback(w => {
        w !== _.current && (_.current = w, x(w))
    }, []), T = s || b, E = i || v, A = y.useRef(null), _ = y.useRef(null), I = y.useRef(u), P = l != null, k = Ae(l), O = Ae(r), N = Ae(c), M = y.useCallback(() => {
        if (!A.current || !_.current) return;
        const w = {
            placement: e,
            strategy: n,
            middleware: h
        };
        O.current && (w.platform = O.current), Is(A.current, _.current, w).then(L => {
            const $ = { ...L,
                isPositioned: N.current !== !1
            };
            R.current && !fe(I.current, $) && (I.current = $, qe.flushSync(() => {
                p($)
            }))
        })
    }, [h, e, n, O, N]);
    re(() => {
        c === !1 && I.current.isPositioned && (I.current.isPositioned = !1, p(w => ({ ...w,
            isPositioned: !1
        })))
    }, [c]);
    const R = y.useRef(!1);
    re(() => (R.current = !0, () => {
        R.current = !1
    }), []), re(() => {
        if (T && (A.current = T), E && (_.current = E), T && E) {
            if (k.current) return k.current(T, E, M);
            M()
        }
    }, [T, E, M, k, P]);
    const C = y.useMemo(() => ({
            reference: A,
            floating: _,
            setReference: m,
            setFloating: g
        }), [m, g]),
        F = y.useMemo(() => ({
            reference: T,
            floating: E
        }), [T, E]),
        S = y.useMemo(() => {
            const w = {
                position: n,
                left: 0,
                top: 0
            };
            if (!F.floating) return w;
            const L = xn(F.floating, u.x),
                $ = xn(F.floating, u.y);
            return a ? { ...w,
                transform: "translate(" + L + "px, " + $ + "px)",
                ...vo(F.floating) >= 1.5 && {
                    willChange: "transform"
                }
            } : {
                position: n,
                left: L,
                top: $
            }
        }, [n, a, F.floating, u.x, u.y]);
    return y.useMemo(() => ({ ...u,
        update: M,
        refs: C,
        elements: F,
        floatingStyles: S
    }), [u, M, C, F, S])
}
const fi = (t, e) => ({ ...Cs(t),
        options: [t, e]
    }),
    di = (t, e) => ({ ...Ss(t),
        options: [t, e]
    }),
    mi = (t, e) => ({ ...ks(t),
        options: [t, e]
    }),
    Ps = "data-floating-ui-focusable",
    wn = "active",
    Tn = "selected",
    Ds = { ...Nn
    };
let _n = !1,
    Ms = 0;
const En = () => "floating-ui-" + Math.random().toString(36).slice(2, 6) + Ms++;

function Fs() {
    const [t, e] = y.useState(() => _n ? En() : void 0);
    return J(() => {
        t == null && e(En())
    }, []), y.useEffect(() => {
        _n = !0
    }, []), t
}
const Ns = Ds.useId,
    Je = Ns || Fs;

function $s() {
    const t = new Map;
    return {
        emit(e, n) {
            var o;
            (o = t.get(e)) == null || o.forEach(r => r(n))
        },
        on(e, n) {
            t.has(e) || t.set(e, new Set), t.get(e).add(n)
        },
        off(e, n) {
            var o;
            (o = t.get(e)) == null || o.delete(n)
        }
    }
}
const Bs = y.createContext(null),
    Ws = y.createContext(null),
    tn = () => {
        var t;
        return ((t = y.useContext(Bs)) == null ? void 0 : t.id) || null
    },
    _e = () => y.useContext(Ws);

function Xt(t) {
    return "data-floating-ui-" + t
}

function lt(t) {
    t.current !== -1 && (clearTimeout(t.current), t.current = -1)
}
const Rn = Xt("safe-polygon");

function Oe(t, e, n) {
    if (n && !Yt(n)) return 0;
    if (typeof t == "number") return t;
    if (typeof t == "function") {
        const o = t();
        return typeof o == "number" ? o : o == null ? void 0 : o[e]
    }
    return t == null ? void 0 : t[e]
}

function Le(t) {
    return typeof t == "function" ? t() : t
}

function pi(t, e) {
    e === void 0 && (e = {});
    const {
        open: n,
        onOpenChange: o,
        dataRef: r,
        events: s,
        elements: i
    } = t, {
        enabled: a = !0,
        delay: l = 0,
        handleClose: c = null,
        mouseOnly: u = !1,
        restMs: p = 0,
        move: h = !0
    } = e, f = _e(), b = tn(), d = mt(c), v = mt(l), x = mt(n), m = mt(p), g = y.useRef(), T = y.useRef(-1), E = y.useRef(), A = y.useRef(-1), _ = y.useRef(!0), I = y.useRef(!1), P = y.useRef(() => {}), k = y.useRef(!1), O = ot(() => {
        var S;
        const w = (S = r.current.openEvent) == null ? void 0 : S.type;
        return (w == null ? void 0 : w.includes("mouse")) && w !== "mousedown"
    });
    y.useEffect(() => {
        if (!a) return;

        function S(w) {
            let {
                open: L
            } = w;
            L || (lt(T), lt(A), _.current = !0, k.current = !1)
        }
        return s.on("openchange", S), () => {
            s.off("openchange", S)
        }
    }, [a, s]), y.useEffect(() => {
        if (!a || !d.current || !n) return;

        function S(L) {
            O() && o(!1, L, "hover")
        }
        const w = tt(i.floating).documentElement;
        return w.addEventListener("mouseleave", S), () => {
            w.removeEventListener("mouseleave", S)
        }
    }, [i.floating, n, o, a, d, O]);
    const N = y.useCallback(function(S, w, L) {
            w === void 0 && (w = !0), L === void 0 && (L = "hover");
            const $ = Oe(v.current, "close", g.current);
            $ && !E.current ? (lt(T), T.current = window.setTimeout(() => o(!1, S, L), $)) : w && (lt(T), o(!1, S, L))
        }, [v, o]),
        M = ot(() => {
            P.current(), E.current = void 0
        }),
        R = ot(() => {
            if (I.current) {
                const S = tt(i.floating).body;
                S.style.pointerEvents = "", S.removeAttribute(Rn), I.current = !1
            }
        }),
        C = ot(() => r.current.openEvent ? ["click", "mousedown"].includes(r.current.openEvent.type) : !1);
    y.useEffect(() => {
        if (!a) return;

        function S(W) {
            if (lt(T), _.current = !1, u && !Yt(g.current) || Le(m.current) > 0 && !Oe(v.current, "open")) return;
            const D = Oe(v.current, "open", g.current);
            D ? T.current = window.setTimeout(() => {
                x.current || o(!0, W, "hover")
            }, D) : n || o(!0, W, "hover")
        }

        function w(W) {
            if (C()) {
                R();
                return
            }
            P.current();
            const D = tt(i.floating);
            if (lt(A), k.current = !1, d.current && r.current.floatingContext) {
                n || lt(T), E.current = d.current({ ...r.current.floatingContext,
                    tree: f,
                    x: W.clientX,
                    y: W.clientY,
                    onClose() {
                        R(), M(), C() || N(W, !0, "safe-polygon")
                    }
                });
                const q = E.current;
                D.addEventListener("mousemove", q), P.current = () => {
                    D.removeEventListener("mousemove", q)
                };
                return
            }(g.current === "touch" ? !nt(i.floating, W.relatedTarget) : !0) && N(W)
        }

        function L(W) {
            C() || r.current.floatingContext && (d.current == null || d.current({ ...r.current.floatingContext,
                tree: f,
                x: W.clientX,
                y: W.clientY,
                onClose() {
                    R(), M(), C() || N(W)
                }
            })(W))
        }

        function $() {
            lt(T)
        }

        function G(W) {
            C() || N(W, !1)
        }
        if (U(i.domReference)) {
            const W = i.domReference,
                D = i.floating;
            return n && W.addEventListener("mouseleave", L), h && W.addEventListener("mousemove", S, {
                once: !0
            }), W.addEventListener("mouseenter", S), W.addEventListener("mouseleave", w), D && (D.addEventListener("mouseleave", L), D.addEventListener("mouseenter", $), D.addEventListener("mouseleave", G)), () => {
                n && W.removeEventListener("mouseleave", L), h && W.removeEventListener("mousemove", S), W.removeEventListener("mouseenter", S), W.removeEventListener("mouseleave", w), D && (D.removeEventListener("mouseleave", L), D.removeEventListener("mouseenter", $), D.removeEventListener("mouseleave", G))
            }
        }
    }, [i, a, t, u, h, N, M, R, o, n, x, f, v, d, r, C, m]), J(() => {
        var S;
        if (a && n && (S = d.current) != null && (S = S.__options) != null && S.blockPointerEvents && O()) {
            I.current = !0;
            const L = i.floating;
            if (U(i.domReference) && L) {
                var w;
                const $ = tt(i.floating).body;
                $.setAttribute(Rn, "");
                const G = i.domReference,
                    W = f == null || (w = f.nodesRef.current.find(D => D.id === b)) == null || (w = w.context) == null ? void 0 : w.elements.floating;
                return W && (W.style.pointerEvents = ""), $.style.pointerEvents = "none", G.style.pointerEvents = "auto", L.style.pointerEvents = "auto", () => {
                    $.style.pointerEvents = "", G.style.pointerEvents = "", L.style.pointerEvents = ""
                }
            }
        }
    }, [a, n, b, i, f, d, O]), J(() => {
        n || (g.current = void 0, k.current = !1, M(), R())
    }, [n, M, R]), y.useEffect(() => () => {
        M(), lt(T), lt(A), R()
    }, [a, i.domReference, M, R]);
    const F = y.useMemo(() => {
        function S(w) {
            g.current = w.pointerType
        }
        return {
            onPointerDown: S,
            onPointerEnter: S,
            onMouseMove(w) {
                const {
                    nativeEvent: L
                } = w;

                function $() {
                    !_.current && !x.current && o(!0, L, "hover")
                }
                u && !Yt(g.current) || n || Le(m.current) === 0 || k.current && w.movementX ** 2 + w.movementY ** 2 < 2 || (lt(A), g.current === "touch" ? $() : (k.current = !0, A.current = window.setTimeout($, Le(m.current))))
            }
        }
    }, [u, o, n, x, m]);
    return y.useMemo(() => a ? {
        reference: F
    } : {}, [a, F])
}
let Cn = 0;

function Ft(t, e) {
    e === void 0 && (e = {});
    const {
        preventScroll: n = !1,
        cancelPrevious: o = !0,
        sync: r = !1
    } = e;
    o && cancelAnimationFrame(Cn);
    const s = () => t == null ? void 0 : t.focus({
        preventScroll: n
    });
    r ? s() : Cn = requestAnimationFrame(s)
}

function zs(t) {
    return (t == null ? void 0 : t.ownerDocument) || document
}
const zt = {
    inert: new WeakMap,
    "aria-hidden": new WeakMap,
    none: new WeakMap
};

function Sn(t) {
    return t === "inert" ? zt.inert : t === "aria-hidden" ? zt["aria-hidden"] : zt.none
}
let ne = new WeakSet,
    oe = {},
    Pe = 0;
const Vs = () => typeof HTMLElement < "u" && "inert" in HTMLElement.prototype,
    ho = t => t && (t.host || ho(t.parentNode)),
    Hs = (t, e) => e.map(n => {
        if (t.contains(n)) return n;
        const o = ho(n);
        return t.contains(o) ? o : null
    }).filter(n => n != null);

function js(t, e, n, o) {
    const r = "data-floating-ui-inert",
        s = o ? "inert" : n ? "aria-hidden" : null,
        i = Hs(e, t),
        a = new Set,
        l = new Set(i),
        c = [];
    oe[r] || (oe[r] = new WeakMap);
    const u = oe[r];
    i.forEach(p), h(e), a.clear();

    function p(f) {
        !f || a.has(f) || (a.add(f), f.parentNode && p(f.parentNode))
    }

    function h(f) {
        !f || l.has(f) || [].forEach.call(f.children, b => {
            if (Ot(b) !== "script")
                if (a.has(b)) h(b);
                else {
                    const d = s ? b.getAttribute(s) : null,
                        v = d !== null && d !== "false",
                        x = Sn(s),
                        m = (x.get(b) || 0) + 1,
                        g = (u.get(b) || 0) + 1;
                    x.set(b, m), u.set(b, g), c.push(b), m === 1 && v && ne.add(b), g === 1 && b.setAttribute(r, ""), !v && s && b.setAttribute(s, s === "inert" ? "" : "true")
                }
        })
    }
    return Pe++, () => {
        c.forEach(f => {
            const b = Sn(s),
                v = (b.get(f) || 0) - 1,
                x = (u.get(f) || 0) - 1;
            b.set(f, v), u.set(f, x), v || (!ne.has(f) && s && f.removeAttribute(s), ne.delete(f)), x || f.removeAttribute(r)
        }), Pe--, Pe || (zt.inert = new WeakMap, zt["aria-hidden"] = new WeakMap, zt.none = new WeakMap, ne = new WeakSet, oe = {})
    }
}

function kn(t, e, n) {
    e === void 0 && (e = !1), n === void 0 && (n = !1);
    const o = zs(t[0]).body;
    return js(t.concat(Array.from(o.querySelectorAll('[aria-live],[role="status"],output'))), o, e, n)
}
const Ee = {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: 0,
        position: "fixed",
        whiteSpace: "nowrap",
        width: "1px",
        top: 0,
        left: 0
    },
    de = y.forwardRef(function(e, n) {
        const [o, r] = y.useState();
        J(() => {
            $r() && r("button")
        }, []);
        const s = {
            ref: n,
            tabIndex: 0,
            role: o,
            "aria-hidden": o ? void 0 : !0,
            [Xt("focus-guard")]: "",
            style: Ee
        };
        return dt.jsx("span", { ...e,
            ...s
        })
    }),
    bo = y.createContext(null),
    In = Xt("portal");

function Xs(t) {
    t === void 0 && (t = {});
    const {
        id: e,
        root: n
    } = t, o = Je(), r = xo(), [s, i] = y.useState(null), a = y.useRef(null);
    return J(() => () => {
        s == null || s.remove(), queueMicrotask(() => {
            a.current = null
        })
    }, [s]), J(() => {
        if (!o || a.current) return;
        const l = e ? document.getElementById(e) : null;
        if (!l) return;
        const c = document.createElement("div");
        c.id = o, c.setAttribute(In, ""), l.appendChild(c), a.current = c, i(c)
    }, [e, o]), J(() => {
        if (n === null || !o || a.current) return;
        let l = n || (r == null ? void 0 : r.portalNode);
        l && !Ue(l) && (l = l.current), l = l || document.body;
        let c = null;
        e && (c = document.createElement("div"), c.id = e, l.appendChild(c));
        const u = document.createElement("div");
        u.id = o, u.setAttribute(In, ""), l = c || l, l.appendChild(u), a.current = u, i(u)
    }, [e, n, o, r]), s
}

function gi(t) {
    const {
        children: e,
        id: n,
        root: o,
        preserveTabOrder: r = !0
    } = t, s = Xs({
        id: n,
        root: o
    }), [i, a] = y.useState(null), l = y.useRef(null), c = y.useRef(null), u = y.useRef(null), p = y.useRef(null), h = i == null ? void 0 : i.modal, f = i == null ? void 0 : i.open, b = !!i && !i.modal && i.open && r && !!(o || s);
    return y.useEffect(() => {
        if (!s || !r || h) return;

        function d(v) {
            s && qt(v) && (v.type === "focusin" ? mn : Gr)(s)
        }
        return s.addEventListener("focusin", d, !0), s.addEventListener("focusout", d, !0), () => {
            s.removeEventListener("focusin", d, !0), s.removeEventListener("focusout", d, !0)
        }
    }, [s, r, h]), y.useEffect(() => {
        s && (f || mn(s))
    }, [f, s]), dt.jsxs(bo.Provider, {
        value: y.useMemo(() => ({
            preserveTabOrder: r,
            beforeOutsideRef: l,
            afterOutsideRef: c,
            beforeInsideRef: u,
            afterInsideRef: p,
            portalNode: s,
            setFocusManagerState: a
        }), [r, s]),
        children: [b && s && dt.jsx(de, {
            "data-type": "outside",
            ref: l,
            onFocus: d => {
                if (qt(d, s)) {
                    var v;
                    (v = u.current) == null || v.focus()
                } else {
                    const x = i ? i.domReference : null,
                        m = lo(x);
                    m == null || m.focus()
                }
            }
        }), b && s && dt.jsx("span", {
            "aria-owns": s.id,
            style: Ee
        }), s && qe.createPortal(e, s), b && s && dt.jsx(de, {
            "data-type": "outside",
            ref: c,
            onFocus: d => {
                if (qt(d, s)) {
                    var v;
                    (v = p.current) == null || v.focus()
                } else {
                    const x = i ? i.domReference : null,
                        m = ao(x);
                    m == null || m.focus(), i != null && i.closeOnFocusOut && (i == null || i.onOpenChange(!1, d.nativeEvent, "focus-out"))
                }
            }
        })]
    })
}
const xo = () => y.useContext(bo);

function An(t) {
    return y.useMemo(() => e => {
        t.forEach(n => {
            n && (n.current = e)
        })
    }, t)
}
const qs = 20;
let It = [];

function en() {
    It = It.filter(t => t.isConnected)
}

function Us(t) {
    en(), t && Ot(t) !== "body" && (It.push(t), It.length > qs && (It = It.slice(-20)))
}

function On() {
    return en(), It[It.length - 1]
}

function Ys(t) {
    const e = Qt();
    return oo(t, e) ? t : we(t, e)[0] || t
}

function Ln(t, e) {
    var n;
    if (!e.current.includes("floating") && !((n = t.getAttribute("role")) != null && n.includes("dialog"))) return;
    const o = Qt(),
        s = Fr(t, o).filter(a => {
            const l = a.getAttribute("data-tabindex") || "";
            return oo(a, o) || a.hasAttribute("data-tabindex") && !l.startsWith("-")
        }),
        i = t.getAttribute("tabindex");
    e.current.includes("floating") || s.length === 0 ? i !== "0" && t.setAttribute("tabindex", "0") : (i !== "-1" || t.hasAttribute("data-tabindex") && t.getAttribute("data-tabindex") !== "-1") && (t.setAttribute("tabindex", "-1"), t.setAttribute("data-tabindex", "-1"))
}
const Ks = y.forwardRef(function(e, n) {
    return dt.jsx("button", { ...e,
        type: "button",
        ref: n,
        tabIndex: -1,
        style: Ee
    })
});

function yi(t) {
    const {
        context: e,
        children: n,
        disabled: o = !1,
        order: r = ["content"],
        guards: s = !0,
        initialFocus: i = 0,
        returnFocus: a = !0,
        restoreFocus: l = !1,
        modal: c = !0,
        visuallyHiddenDismiss: u = !1,
        closeOnFocusOut: p = !0,
        outsideElementsInert: h = !1,
        getInsideElements: f = () => []
    } = t, {
        open: b,
        onOpenChange: d,
        events: v,
        dataRef: x,
        elements: {
            domReference: m,
            floating: g
        }
    } = e, T = ot(() => {
        var B;
        return (B = x.current.floatingContext) == null ? void 0 : B.nodeId
    }), E = ot(f), A = typeof i == "number" && i < 0, _ = fn(m) && A, I = Vs(), P = I ? s : !0, k = !P || I && h, O = mt(r), N = mt(i), M = mt(a), R = _e(), C = xo(), F = y.useRef(null), S = y.useRef(null), w = y.useRef(!1), L = y.useRef(!1), $ = y.useRef(-1), G = y.useRef(-1), W = C != null, D = Xe(g), ft = ot(function(B) {
        return B === void 0 && (B = D), B ? we(B, Qt()) : []
    }), q = ot(B => {
        const V = ft(B);
        return O.current.map(z => m && z === "reference" ? m : D && z === "floating" ? D : V).filter(Boolean).flat()
    });
    y.useEffect(() => {
        if (o || !c) return;

        function B(z) {
            if (z.key === "Tab") {
                nt(D, $t(tt(D))) && ft().length === 0 && !_ && ke(z);
                const Y = q(),
                    Z = kt(z);
                O.current[0] === "reference" && Z === m && (ke(z), z.shiftKey ? Ft(Y[Y.length - 1]) : Ft(Y[1])), O.current[1] === "floating" && Z === D && z.shiftKey && (ke(z), Ft(Y[0]))
            }
        }
        const V = tt(D);
        return V.addEventListener("keydown", B), () => {
            V.removeEventListener("keydown", B)
        }
    }, [o, m, D, c, O, _, ft, q]), y.useEffect(() => {
        if (o || !g) return;

        function B(V) {
            const z = kt(V),
                Z = ft().indexOf(z);
            Z !== -1 && ($.current = Z)
        }
        return g.addEventListener("focusin", B), () => {
            g.removeEventListener("focusin", B)
        }
    }, [o, g, ft]), y.useEffect(() => {
        if (o || !p) return;

        function B() {
            L.current = !0, setTimeout(() => {
                L.current = !1
            })
        }

        function V(Z) {
            const H = Z.relatedTarget,
                bt = Z.currentTarget,
                at = kt(Z);
            queueMicrotask(() => {
                const rt = T(),
                    Lt = !(nt(m, H) || nt(g, H) || nt(H, g) || nt(C == null ? void 0 : C.portalNode, H) || H != null && H.hasAttribute(Xt("focus-guard")) || R && (Bt(R.nodesRef.current, rt).find(Ct => {
                        var xt, St;
                        return nt((xt = Ct.context) == null ? void 0 : xt.elements.floating, H) || nt((St = Ct.context) == null ? void 0 : St.elements.domReference, H)
                    }) || dn(R.nodesRef.current, rt).find(Ct => {
                        var xt, St, nn;
                        return [(xt = Ct.context) == null ? void 0 : xt.elements.floating, Xe((St = Ct.context) == null ? void 0 : St.elements.floating)].includes(H) || ((nn = Ct.context) == null ? void 0 : nn.elements.domReference) === H
                    })));
                if (bt === m && D && Ln(D, O), l && bt !== m && !(at != null && at.isConnected) && $t(tt(D)) === tt(D).body) {
                    K(D) && D.focus();
                    const Ct = $.current,
                        xt = ft(),
                        St = xt[Ct] || xt[xt.length - 1] || D;
                    K(St) && St.focus()
                }
                if (x.current.insideReactTree) {
                    x.current.insideReactTree = !1;
                    return
                }(_ || !c) && H && Lt && !L.current && H !== On() && (w.current = !0, d(!1, Z, "focus-out"))
            })
        }
        const z = !!(!R && C);

        function Y() {
            lt(G), x.current.insideReactTree = !0, G.current = window.setTimeout(() => {
                x.current.insideReactTree = !1
            })
        }
        if (g && K(m)) return m.addEventListener("focusout", V), m.addEventListener("pointerdown", B), g.addEventListener("focusout", V), z && g.addEventListener("focusout", Y, !0), () => {
            m.removeEventListener("focusout", V), m.removeEventListener("pointerdown", B), g.removeEventListener("focusout", V), z && g.removeEventListener("focusout", Y, !0)
        }
    }, [o, m, g, D, c, R, C, d, p, l, ft, _, T, O, x]);
    const it = y.useRef(null),
        Rt = y.useRef(null),
        Re = An([it, C == null ? void 0 : C.beforeInsideRef]),
        Ce = An([Rt, C == null ? void 0 : C.afterInsideRef]);
    y.useEffect(() => {
        var B, V;
        if (o || !g) return;
        const z = Array.from((C == null || (B = C.portalNode) == null ? void 0 : B.querySelectorAll("[" + Xt("portal") + "]")) || []),
            Z = (V = (R ? dn(R.nodesRef.current, T()) : []).find(at => {
                var rt;
                return fn(((rt = at.context) == null ? void 0 : rt.elements.domReference) || null)
            })) == null || (V = V.context) == null ? void 0 : V.elements.domReference,
            H = [g, Z, ...z, ...E(), F.current, S.current, it.current, Rt.current, C == null ? void 0 : C.beforeOutsideRef.current, C == null ? void 0 : C.afterOutsideRef.current, O.current.includes("reference") || _ ? m : null].filter(at => at != null),
            bt = c || _ ? kn(H, !k, k) : kn(H);
        return () => {
            bt()
        }
    }, [o, m, g, c, O, C, _, P, k, R, T, E]), J(() => {
        if (o || !K(D)) return;
        const B = tt(D),
            V = $t(B);
        queueMicrotask(() => {
            const z = q(D),
                Y = N.current,
                Z = (typeof Y == "number" ? z[Y] : Y.current) || D,
                H = nt(D, V);
            !A && !H && b && Ft(Z, {
                preventScroll: Z === D
            })
        })
    }, [o, b, D, A, q, N]), J(() => {
        if (o || !D) return;
        const B = tt(D),
            V = $t(B);
        Us(V);

        function z(H) {
            let {
                reason: bt,
                event: at,
                nested: rt
            } = H;
            if (["hover", "safe-polygon"].includes(bt) && at.type === "mouseleave" && (w.current = !0), bt === "outside-press")
                if (rt) w.current = !1;
                else if (Hr(at) || jr(at)) w.current = !1;
            else {
                let Lt = !1;
                document.createElement("div").focus({
                    get preventScroll() {
                        return Lt = !0, !1
                    }
                }), Lt ? w.current = !1 : w.current = !0
            }
        }
        v.on("openchange", z);
        const Y = B.createElement("span");
        Y.setAttribute("tabindex", "-1"), Y.setAttribute("aria-hidden", "true"), Object.assign(Y.style, Ee), W && m && m.insertAdjacentElement("afterend", Y);

        function Z() {
            if (typeof M.current == "boolean") {
                const H = m || On();
                return H && H.isConnected ? H : Y
            }
            return M.current.current || Y
        }
        return () => {
            v.off("openchange", z);
            const H = $t(B),
                bt = nt(g, H) || R && Bt(R.nodesRef.current, T(), !1).some(rt => {
                    var Lt;
                    return nt((Lt = rt.context) == null ? void 0 : Lt.elements.floating, H)
                }),
                at = Z();
            queueMicrotask(() => {
                const rt = Ys(at);
                M.current && !w.current && K(rt) && (!(rt !== H && H !== B.body) || bt) && rt.focus({
                    preventScroll: !0
                }), Y.remove()
            })
        }
    }, [o, g, D, M, x, v, R, W, m, T]), y.useEffect(() => (queueMicrotask(() => {
        w.current = !1
    }), () => {
        queueMicrotask(en)
    }), [o]), J(() => {
        if (!o && C) return C.setFocusManagerState({
            modal: c,
            closeOnFocusOut: p,
            open: b,
            onOpenChange: d,
            domReference: m
        }), () => {
            C.setFocusManagerState(null)
        }
    }, [o, C, c, b, d, p, m]), J(() => {
        o || D && Ln(D, O)
    }, [o, D, O]);

    function Jt(B) {
        return o || !u || !c ? null : dt.jsx(Ks, {
            ref: B === "start" ? F : S,
            onClick: V => d(!1, V.nativeEvent),
            children: typeof u == "string" ? u : "Dismiss"
        })
    }
    const te = !o && P && (c ? !_ : !0) && (W || c);
    return dt.jsxs(dt.Fragment, {
        children: [te && dt.jsx(de, {
            "data-type": "inside",
            ref: Re,
            onFocus: B => {
                if (c) {
                    const z = q();
                    Ft(r[0] === "reference" ? z[0] : z[z.length - 1])
                } else if (C != null && C.preserveTabOrder && C.portalNode)
                    if (w.current = !1, qt(B, C.portalNode)) {
                        const z = ao(m);
                        z == null || z.focus()
                    } else {
                        var V;
                        (V = C.beforeOutsideRef.current) == null || V.focus()
                    }
            }
        }), !_ && Jt("start"), n, Jt("end"), te && dt.jsx(de, {
            "data-type": "inside",
            ref: Ce,
            onFocus: B => {
                if (c) Ft(q()[0]);
                else if (C != null && C.preserveTabOrder && C.portalNode)
                    if (p && (w.current = !0), qt(B, C.portalNode)) {
                        const z = lo(m);
                        z == null || z.focus()
                    } else {
                        var V;
                        (V = C.afterOutsideRef.current) == null || V.focus()
                    }
            }
        })]
    })
}

function Pn(t) {
    return K(t.target) && t.target.tagName === "BUTTON"
}

function Gs(t) {
    return K(t.target) && t.target.tagName === "A"
}

function Dn(t) {
    return so(t)
}

function vi(t, e) {
    e === void 0 && (e = {});
    const {
        open: n,
        onOpenChange: o,
        dataRef: r,
        elements: {
            domReference: s
        }
    } = t, {
        enabled: i = !0,
        event: a = "click",
        toggle: l = !0,
        ignoreMouse: c = !1,
        keyboardHandlers: u = !0,
        stickIfOpen: p = !0
    } = e, h = y.useRef(), f = y.useRef(!1), b = y.useMemo(() => ({
        onPointerDown(d) {
            h.current = d.pointerType
        },
        onMouseDown(d) {
            const v = h.current;
            d.button === 0 && a !== "click" && (Yt(v, !0) && c || (n && l && (!(r.current.openEvent && p) || r.current.openEvent.type === "mousedown") ? o(!1, d.nativeEvent, "click") : (d.preventDefault(), o(!0, d.nativeEvent, "click"))))
        },
        onClick(d) {
            const v = h.current;
            if (a === "mousedown" && h.current) {
                h.current = void 0;
                return
            }
            Yt(v, !0) && c || (n && l && (!(r.current.openEvent && p) || r.current.openEvent.type === "click") ? o(!1, d.nativeEvent, "click") : o(!0, d.nativeEvent, "click"))
        },
        onKeyDown(d) {
            h.current = void 0, !(d.defaultPrevented || !u || Pn(d)) && (d.key === " " && !Dn(s) && (d.preventDefault(), f.current = !0), !Gs(d) && d.key === "Enter" && o(!(n && l), d.nativeEvent, "click"))
        },
        onKeyUp(d) {
            d.defaultPrevented || !u || Pn(d) || Dn(s) || d.key === " " && f.current && (f.current = !1, o(!(n && l), d.nativeEvent, "click"))
        }
    }), [r, s, a, c, u, o, n, p, l]);
    return y.useMemo(() => i ? {
        reference: b
    } : {}, [i, b])
}
const Zs = {
        pointerdown: "onPointerDown",
        mousedown: "onMouseDown",
        click: "onClick"
    },
    Qs = {
        pointerdown: "onPointerDownCapture",
        mousedown: "onMouseDownCapture",
        click: "onClickCapture"
    },
    Mn = t => {
        var e, n;
        return {
            escapeKey: typeof t == "boolean" ? t : (e = t == null ? void 0 : t.escapeKey) != null ? e : !1,
            outsidePress: typeof t == "boolean" ? t : (n = t == null ? void 0 : t.outsidePress) != null ? n : !0
        }
    };

function hi(t, e) {
    e === void 0 && (e = {});
    const {
        open: n,
        onOpenChange: o,
        elements: r,
        dataRef: s
    } = t, {
        enabled: i = !0,
        escapeKey: a = !0,
        outsidePress: l = !0,
        outsidePressEvent: c = "pointerdown",
        referencePress: u = !1,
        referencePressEvent: p = "pointerdown",
        ancestorScroll: h = !1,
        bubbles: f,
        capture: b
    } = e, d = _e(), v = ot(typeof l == "function" ? l : () => !1), x = typeof l == "function" ? v : l, m = y.useRef(!1), {
        escapeKey: g,
        outsidePress: T
    } = Mn(f), {
        escapeKey: E,
        outsidePress: A
    } = Mn(b), _ = y.useRef(!1), I = ot(R => {
        var C;
        if (!n || !i || !a || R.key !== "Escape" || _.current) return;
        const F = (C = s.current.floatingContext) == null ? void 0 : C.nodeId,
            S = d ? Bt(d.nodesRef.current, F) : [];
        if (!g && (R.stopPropagation(), S.length > 0)) {
            let w = !0;
            if (S.forEach(L => {
                    var $;
                    if (($ = L.context) != null && $.open && !L.context.dataRef.current.__escapeKeyBubbles) {
                        w = !1;
                        return
                    }
                }), !w) return
        }
        o(!1, Vr(R) ? R.nativeEvent : R, "escape-key")
    }), P = ot(R => {
        var C;
        const F = () => {
            var S;
            I(R), (S = kt(R)) == null || S.removeEventListener("keydown", F)
        };
        (C = kt(R)) == null || C.addEventListener("keydown", F)
    }), k = ot(R => {
        var C;
        const F = s.current.insideReactTree;
        s.current.insideReactTree = !1;
        const S = m.current;
        if (m.current = !1, c === "click" && S || F || typeof x == "function" && !x(R)) return;
        const w = kt(R),
            L = "[" + Xt("inert") + "]",
            $ = tt(r.floating).querySelectorAll(L);
        let G = U(w) ? w : null;
        for (; G && !wt(G);) {
            const q = _t(G);
            if (wt(q) || !U(q)) break;
            G = q
        }
        if ($.length && U(w) && !zr(w) && !nt(w, r.floating) && Array.from($).every(q => !nt(G, q))) return;
        if (K(w) && M) {
            const q = wt(w),
                it = ct(w),
                Rt = /auto|scroll/,
                Re = q || Rt.test(it.overflowX),
                Ce = q || Rt.test(it.overflowY),
                Jt = Re && w.clientWidth > 0 && w.scrollWidth > w.clientWidth,
                te = Ce && w.clientHeight > 0 && w.scrollHeight > w.clientHeight,
                B = it.direction === "rtl",
                V = te && (B ? R.offsetX <= w.offsetWidth - w.clientWidth : R.offsetX > w.clientWidth),
                z = Jt && R.offsetY > w.clientHeight;
            if (V || z) return
        }
        const W = (C = s.current.floatingContext) == null ? void 0 : C.nodeId,
            D = d && Bt(d.nodesRef.current, W).some(q => {
                var it;
                return Se(R, (it = q.context) == null ? void 0 : it.elements.floating)
            });
        if (Se(R, r.floating) || Se(R, r.domReference) || D) return;
        const ft = d ? Bt(d.nodesRef.current, W) : [];
        if (ft.length > 0) {
            let q = !0;
            if (ft.forEach(it => {
                    var Rt;
                    if ((Rt = it.context) != null && Rt.open && !it.context.dataRef.current.__outsidePressBubbles) {
                        q = !1;
                        return
                    }
                }), !q) return
        }
        o(!1, R, "outside-press")
    }), O = ot(R => {
        var C;
        const F = () => {
            var S;
            k(R), (S = kt(R)) == null || S.removeEventListener(c, F)
        };
        (C = kt(R)) == null || C.addEventListener(c, F)
    });
    y.useEffect(() => {
        if (!n || !i) return;
        s.current.__escapeKeyBubbles = g, s.current.__outsidePressBubbles = T;
        let R = -1;

        function C($) {
            o(!1, $, "ancestor-scroll")
        }

        function F() {
            window.clearTimeout(R), _.current = !0
        }

        function S() {
            R = window.setTimeout(() => {
                _.current = !1
            }, be() ? 5 : 0)
        }
        const w = tt(r.floating);
        a && (w.addEventListener("keydown", E ? P : I, E), w.addEventListener("compositionstart", F), w.addEventListener("compositionend", S)), x && w.addEventListener(c, A ? O : k, A);
        let L = [];
        return h && (U(r.domReference) && (L = At(r.domReference)), U(r.floating) && (L = L.concat(At(r.floating))), !U(r.reference) && r.reference && r.reference.contextElement && (L = L.concat(At(r.reference.contextElement)))), L = L.filter($ => {
            var G;
            return $ !== ((G = w.defaultView) == null ? void 0 : G.visualViewport)
        }), L.forEach($ => {
            $.addEventListener("scroll", C, {
                passive: !0
            })
        }), () => {
            a && (w.removeEventListener("keydown", E ? P : I, E), w.removeEventListener("compositionstart", F), w.removeEventListener("compositionend", S)), x && w.removeEventListener(c, A ? O : k, A), L.forEach($ => {
                $.removeEventListener("scroll", C)
            }), window.clearTimeout(R)
        }
    }, [s, r, a, x, c, n, o, h, i, g, T, I, E, P, k, A, O]), y.useEffect(() => {
        s.current.insideReactTree = !1
    }, [s, x, c]);
    const N = y.useMemo(() => ({
            onKeyDown: I,
            ...u && {
                [Zs[p]]: R => {
                    o(!1, R.nativeEvent, "reference-press")
                },
                ...p !== "click" && {
                    onClick(R) {
                        o(!1, R.nativeEvent, "reference-press")
                    }
                }
            }
        }), [I, o, u, p]),
        M = y.useMemo(() => ({
            onKeyDown: I,
            onMouseDown() {
                m.current = !0
            },
            onMouseUp() {
                m.current = !0
            },
            [Qs[c]]: () => {
                s.current.insideReactTree = !0
            }
        }), [I, c, s]);
    return y.useMemo(() => i ? {
        reference: N,
        floating: M
    } : {}, [i, N, M])
}

function Js(t) {
    const {
        open: e = !1,
        onOpenChange: n,
        elements: o
    } = t, r = Je(), s = y.useRef({}), [i] = y.useState(() => $s()), a = tn() != null, [l, c] = y.useState(o.reference), u = ot((f, b, d) => {
        s.current.openEvent = f ? b : void 0, i.emit("openchange", {
            open: f,
            event: b,
            reason: d,
            nested: a
        }), n == null || n(f, b, d)
    }), p = y.useMemo(() => ({
        setPositionReference: c
    }), []), h = y.useMemo(() => ({
        reference: l || o.reference || null,
        floating: o.floating || null,
        domReference: o.reference
    }), [l, o.reference, o.floating]);
    return y.useMemo(() => ({
        dataRef: s,
        open: e,
        onOpenChange: u,
        elements: h,
        events: i,
        floatingId: r,
        refs: p
    }), [e, u, h, i, r, p])
}

function bi(t) {
    t === void 0 && (t = {});
    const {
        nodeId: e
    } = t, n = Js({ ...t,
        elements: {
            reference: null,
            floating: null,
            ...t.elements
        }
    }), o = t.rootContext || n, r = o.elements, [s, i] = y.useState(null), [a, l] = y.useState(null), u = (r == null ? void 0 : r.domReference) || s, p = y.useRef(null), h = _e();
    J(() => {
        u && (p.current = u)
    }, [u]);
    const f = Ls({ ...t,
            elements: { ...r,
                ...a && {
                    reference: a
                }
            }
        }),
        b = y.useCallback(g => {
            const T = U(g) ? {
                getBoundingClientRect: () => g.getBoundingClientRect(),
                getClientRects: () => g.getClientRects(),
                contextElement: g
            } : g;
            l(T), f.refs.setReference(T)
        }, [f.refs]),
        d = y.useCallback(g => {
            (U(g) || g === null) && (p.current = g, i(g)), (U(f.refs.reference.current) || f.refs.reference.current === null || g !== null && !U(g)) && f.refs.setReference(g)
        }, [f.refs]),
        v = y.useMemo(() => ({ ...f.refs,
            setReference: d,
            setPositionReference: b,
            domReference: p
        }), [f.refs, d, b]),
        x = y.useMemo(() => ({ ...f.elements,
            domReference: u
        }), [f.elements, u]),
        m = y.useMemo(() => ({ ...f,
            ...o,
            refs: v,
            elements: x,
            nodeId: e
        }), [f, v, x, e, o]);
    return J(() => {
        o.dataRef.current.floatingContext = m;
        const g = h == null ? void 0 : h.nodesRef.current.find(T => T.id === e);
        g && (g.context = m)
    }), y.useMemo(() => ({ ...f,
        context: m,
        refs: v,
        elements: x
    }), [f, v, x, m])
}

function De(t, e, n) {
    const o = new Map,
        r = n === "item";
    let s = t;
    if (r && t) {
        const {
            [wn]: i, [Tn]: a, ...l
        } = t;
        s = l
    }
    return { ...n === "floating" && {
            tabIndex: -1,
            [Ps]: ""
        },
        ...s,
        ...e.map(i => {
            const a = i ? i[n] : null;
            return typeof a == "function" ? t ? a(t) : null : a
        }).concat(t).reduce((i, a) => (a && Object.entries(a).forEach(l => {
            let [c, u] = l;
            if (!(r && [wn, Tn].includes(c)))
                if (c.indexOf("on") === 0) {
                    if (o.has(c) || o.set(c, []), typeof u == "function") {
                        var p;
                        (p = o.get(c)) == null || p.push(u), i[c] = function() {
                            for (var h, f = arguments.length, b = new Array(f), d = 0; d < f; d++) b[d] = arguments[d];
                            return (h = o.get(c)) == null ? void 0 : h.map(v => v(...b)).find(v => v !== void 0)
                        }
                    }
                } else i[c] = u
        }), i), {})
    }
}

function xi(t) {
    t === void 0 && (t = []);
    const e = t.map(a => a == null ? void 0 : a.reference),
        n = t.map(a => a == null ? void 0 : a.floating),
        o = t.map(a => a == null ? void 0 : a.item),
        r = y.useCallback(a => De(a, t, "reference"), e),
        s = y.useCallback(a => De(a, t, "floating"), n),
        i = y.useCallback(a => De(a, t, "item"), o);
    return y.useMemo(() => ({
        getReferenceProps: r,
        getFloatingProps: s,
        getItemProps: i
    }), [r, s, i])
}
const ti = new Map([
    ["select", "listbox"],
    ["combobox", "listbox"],
    ["label", !1]
]);

function wi(t, e) {
    var n, o;
    e === void 0 && (e = {});
    const {
        open: r,
        elements: s,
        floatingId: i
    } = t, {
        enabled: a = !0,
        role: l = "dialog"
    } = e, c = Je(), u = ((n = s.domReference) == null ? void 0 : n.id) || c, p = y.useMemo(() => {
        var m;
        return ((m = Xe(s.floating)) == null ? void 0 : m.id) || i
    }, [s.floating, i]), h = (o = ti.get(l)) != null ? o : l, b = tn() != null, d = y.useMemo(() => h === "tooltip" || l === "label" ? {
        ["aria-" + (l === "label" ? "labelledby" : "describedby")]: r ? p : void 0
    } : {
        "aria-expanded": r ? "true" : "false",
        "aria-haspopup": h === "alertdialog" ? "dialog" : h,
        "aria-controls": r ? p : void 0,
        ...h === "listbox" && {
            role: "combobox"
        },
        ...h === "menu" && {
            id: u
        },
        ...h === "menu" && b && {
            role: "menuitem"
        },
        ...l === "select" && {
            "aria-autocomplete": "none"
        },
        ...l === "combobox" && {
            "aria-autocomplete": "list"
        }
    }, [h, p, b, r, u, l]), v = y.useMemo(() => {
        const m = {
            id: p,
            ...h && {
                role: h
            }
        };
        return h === "tooltip" || l === "label" ? m : { ...m,
            ...h === "menu" && {
                "aria-labelledby": u
            }
        }
    }, [h, p, u, l]), x = y.useCallback(m => {
        let {
            active: g,
            selected: T
        } = m;
        const E = {
            role: "option",
            ...g && {
                id: p + "-fui-option"
            }
        };
        switch (l) {
            case "select":
            case "combobox":
                return { ...E,
                    "aria-selected": T
                }
        }
        return {}
    }, [p, l]);
    return y.useMemo(() => a ? {
        reference: d,
        floating: v,
        item: x
    } : {}, [a, d, v, x])
}
const Fn = t => t.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (e, n) => (n ? "-" : "") + e.toLowerCase());

function Nt(t, e) {
    return typeof t == "function" ? t(e) : t
}

function ei(t, e) {
    const [n, o] = y.useState(t);
    return t && !n && o(!0), y.useEffect(() => {
        if (!t && n) {
            const r = setTimeout(() => o(!1), e);
            return () => clearTimeout(r)
        }
    }, [t, n, e]), n
}

function ni(t, e) {
    e === void 0 && (e = {});
    const {
        open: n,
        elements: {
            floating: o
        }
    } = t, {
        duration: r = 250
    } = e, i = (typeof r == "number" ? r : r.close) || 0, [a, l] = y.useState("unmounted"), c = ei(n, i);
    return !c && a === "close" && l("unmounted"), J(() => {
        if (o) {
            if (n) {
                l("initial");
                const u = requestAnimationFrame(() => {
                    qe.flushSync(() => {
                        l("open")
                    })
                });
                return () => {
                    cancelAnimationFrame(u)
                }
            }
            l("close")
        }
    }, [n, o]), {
        isMounted: c,
        status: a
    }
}

function Ti(t, e) {
    e === void 0 && (e = {});
    const {
        initial: n = {
            opacity: 0
        },
        open: o,
        close: r,
        common: s,
        duration: i = 250
    } = e, a = t.placement, l = a.split("-")[0], c = y.useMemo(() => ({
        side: l,
        placement: a
    }), [l, a]), u = typeof i == "number", p = (u ? i : i.open) || 0, h = (u ? i : i.close) || 0, [f, b] = y.useState(() => ({ ...Nt(s, c),
        ...Nt(n, c)
    })), {
        isMounted: d,
        status: v
    } = ni(t, {
        duration: i
    }), x = mt(n), m = mt(o), g = mt(r), T = mt(s);
    return J(() => {
        const E = Nt(x.current, c),
            A = Nt(g.current, c),
            _ = Nt(T.current, c),
            I = Nt(m.current, c) || Object.keys(E).reduce((P, k) => (P[k] = "", P), {});
        if (v === "initial" && b(P => ({
                transitionProperty: P.transitionProperty,
                ..._,
                ...E
            })), v === "open" && b({
                transitionProperty: Object.keys(I).map(Fn).join(","),
                transitionDuration: p + "ms",
                ..._,
                ...I
            }), v === "close") {
            const P = A || E;
            b({
                transitionProperty: Object.keys(P).map(Fn).join(","),
                transitionDuration: h + "ms",
                ..._,
                ...P
            })
        }
    }, [h, g, x, m, T, p, v, c]), {
        isMounted: d,
        styles: f
    }
}
export {
    gi as F, ri as L, vi as a, hi as b, Pt as c, pi as d, wi as e, xi as f, Ti as g, si as h, mi as i, dt as j, yi as k, ks as l, Ss as m, Cs as n, fi as o, ci as p, ai as q, ii as r, di as s, li as t, bi as u, ui as v, Is as w, j as y
};
//# sourceMappingURL=ui-CkVVRg_C.js.map