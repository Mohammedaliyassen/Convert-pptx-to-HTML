"use client";
import { createRoot as e } from "react-dom/client";
import t, { createContext as n, createElement as r, forwardRef as i, useCallback as a, useContext as o, useEffect as s, useRef as c, useState as l } from "react";
//#region \0rolldown/runtime.js
var u = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), d = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (e, t) => (typeof require < "u" ? require : e)[t] }) : e)(function(e) {
	if (typeof require < "u") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + e + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
}), f = {
	playerContainer: "_playerContainer_x9tbw_1",
	fullscreen: "_fullscreen_x9tbw_15",
	noSlides: "_noSlides_x9tbw_26",
	topControlBar: "_topControlBar_x9tbw_37",
	storyTitle: "_storyTitle_x9tbw_50",
	actions: "_actions_x9tbw_61",
	controlButton: "_controlButton_x9tbw_66",
	closeButton: "_closeButton_x9tbw_91",
	stageViewport: "_stageViewport_x9tbw_98",
	slideStage: "_slideStage_x9tbw_112",
	bottomControlBar: "_bottomControlBar_x9tbw_122",
	navButton: "_navButton_x9tbw_136",
	slideCounter: "_slideCounter_x9tbw_166",
	progressBarBg: "_progressBarBg_x9tbw_178",
	progressBarFill: "_progressBarFill_x9tbw_188"
}, p = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), m = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), h = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), g = (e) => {
	let t = h(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, _ = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, v = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, y = n({}), b = () => o(y), x = i(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: i, className: a = "", children: o, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: m = "currentColor", className: h = "" } = b() ?? {}, g = i ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return r("svg", {
		ref: l,
		..._,
		width: t ?? u ?? _.width,
		height: t ?? u ?? _.height,
		stroke: e ?? m,
		strokeWidth: g,
		className: p("lucide", h, a),
		...!o && !v(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => r(e, t)), ...Array.isArray(o) ? o : [o]]);
}), S = (e, t) => {
	let n = i(({ className: n, ...i }, a) => r(x, {
		ref: a,
		iconNode: t,
		className: p(`lucide-${m(g(e))}`, `lucide-${e}`, n),
		...i
	}));
	return n.displayName = g(e), n;
}, C = S("chevron-left", [["path", {
	d: "m15 18-6-6 6-6",
	key: "1wnfg3"
}]]), w = S("chevron-right", [["path", {
	d: "m9 18 6-6-6-6",
	key: "mthhwq"
}]]), T = S("maximize-2", [
	["path", {
		d: "M15 3h6v6",
		key: "1q9fwt"
	}],
	["path", {
		d: "m21 3-7 7",
		key: "1l2asr"
	}],
	["path", {
		d: "m3 21 7-7",
		key: "tjx5ai"
	}],
	["path", {
		d: "M9 21H3v-6",
		key: "wtvkvv"
	}]
]), E = S("minimize-2", [
	["path", {
		d: "m14 10 7-7",
		key: "oa77jy"
	}],
	["path", {
		d: "M20 10h-6V4",
		key: "mjg0md"
	}],
	["path", {
		d: "m3 21 7-7",
		key: "tjx5ai"
	}],
	["path", {
		d: "M4 14h6v6",
		key: "rmj7iw"
	}]
]), D = S("pause", [["rect", {
	x: "14",
	y: "3",
	width: "5",
	height: "18",
	rx: "1",
	key: "kaeet6"
}], ["rect", {
	x: "5",
	y: "3",
	width: "5",
	height: "18",
	rx: "1",
	key: "1wsw3u"
}]]), O = S("play", [["path", {
	d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
	key: "10ikf1"
}]]), k = S("x", [["path", {
	d: "M18 6 6 18",
	key: "1bl5f8"
}], ["path", {
	d: "m6 6 12 12",
	key: "d8bk6v"
}]]), A = (e) => {
	let t, n = /* @__PURE__ */ new Set(), r = (e, r) => {
		let i = typeof e == "function" ? e(t) : e;
		if (!Object.is(i, t)) {
			let e = t;
			t = r ?? (typeof i != "object" || !i) ? i : Object.assign({}, t, i), n.forEach((n) => n(t, e));
		}
	}, i = () => t, a = {
		setState: r,
		getState: i,
		getInitialState: () => o,
		subscribe: (e) => (n.add(e), () => n.delete(e))
	}, o = t = e(r, i, a);
	return a;
}, j = ((e) => e ? A(e) : A), M = (e) => e;
function N(e, n = M) {
	let r = t.useSyncExternalStore(e.subscribe, t.useCallback(() => n(e.getState()), [e, n]), t.useCallback(() => n(e.getInitialState()), [e, n]));
	return t.useDebugValue(r), r;
}
var ee = (e) => {
	let t = j(e), n = (e) => N(t, e);
	return Object.assign(n, t), n;
}, te = ((e) => e ? ee(e) : ee), ne = (e, t, n) => (r, i) => ({
	pastStates: n?.pastStates || [],
	futureStates: n?.futureStates || [],
	undo: (a = 1) => {
		if (i().pastStates.length) {
			let o = n?.partialize?.(t()) || t(), s = i().pastStates.splice(-a, a), c = s.shift();
			e(c), r({
				pastStates: i().pastStates,
				futureStates: i().futureStates.concat(n?.diff?.(o, c) || o, s.reverse())
			});
		}
	},
	redo: (a = 1) => {
		if (i().futureStates.length) {
			let o = n?.partialize?.(t()) || t(), s = i().futureStates.splice(-a, a), c = s.shift();
			e(c), r({
				pastStates: i().pastStates.concat(n?.diff?.(o, c) || o, s.reverse()),
				futureStates: i().futureStates
			});
		}
	},
	clear: () => r({
		pastStates: [],
		futureStates: []
	}),
	isTracking: !0,
	pause: () => r({ isTracking: !1 }),
	resume: () => r({ isTracking: !0 }),
	setOnSave: (e) => r({ _onSave: e }),
	_onSave: n?.onSave,
	_handleSet: (e, t, a, o) => {
		n?.limit && i().pastStates.length >= n?.limit && i().pastStates.shift(), i()._onSave?.(e, a), r({
			pastStates: i().pastStates.concat(o || e),
			futureStates: []
		});
	}
}), re = (e, t) => (n, r, i) => {
	i.temporal = j(t?.wrapTemporal?.(ne(n, r, t)) || ne(n, r, t));
	let a = t?.handleSet?.(i.temporal.getState()._handleSet) || i.temporal.getState()._handleSet, o = (e) => {
		if (!i.temporal.getState().isTracking) return;
		let n = t?.partialize?.(r()) || r(), o = t?.diff?.(e, n);
		o === null || t?.equality?.(e, n) || a(e, void 0, n, o);
	}, s = i.setState;
	return i.setState = (...e) => {
		let n = t?.partialize?.(r()) || r();
		s(...e), o(n);
	}, e((...e) => {
		let i = t?.partialize?.(r()) || r();
		n(...e), o(i);
	}, r, i);
}, ie = () => Math.random().toString(36).substring(2, 9), ae = te()(re((e, t) => ({
	story: null,
	activeSlideId: null,
	selectedElementId: null,
	zoom: 1,
	customPresets: (() => {
		try {
			let e = localStorage.getItem("story_engine_custom_presets");
			return e ? JSON.parse(e) : [];
		} catch {
			return [];
		}
	})(),
	favoritePresetIds: (() => {
		try {
			let e = localStorage.getItem("story_engine_favorite_presets");
			return e ? JSON.parse(e) : [];
		} catch {
			return [];
		}
	})(),
	loadStory: (t) => {
		e({
			story: t,
			activeSlideId: t.slides[0]?.id || null,
			selectedElementId: null,
			zoom: 1
		});
	},
	setStoryTitle: (n) => {
		let { story: r } = t();
		r && e({ story: {
			...r,
			title: n
		} });
	},
	setStorySettings: (n) => {
		let { story: r } = t();
		r && e({ story: {
			...r,
			...n
		} });
	},
	setActiveSlideId: (t) => {
		e({
			activeSlideId: t,
			selectedElementId: null
		});
	},
	setSelectedElementId: (t) => {
		e({ selectedElementId: t });
	},
	addSlide: () => {
		let { story: n } = t();
		if (!n) return;
		let r = ie(), i = {
			id: r,
			background: {
				type: "color",
				value: "#ffffff"
			},
			elements: []
		};
		e({
			story: {
				...n,
				slides: [...n.slides, i]
			},
			activeSlideId: r,
			selectedElementId: null
		});
	},
	duplicateSlide: (n) => {
		let { story: r } = t();
		if (!r) return;
		let i = r.slides.findIndex((e) => e.id === n);
		if (i === -1) return;
		let a = r.slides[i], o = ie(), s = a.elements.map((e) => ({
			...e,
			id: ie()
		})), c = {
			...a,
			id: o,
			elements: s
		}, l = [...r.slides];
		l.splice(i + 1, 0, c), e({
			story: {
				...r,
				slides: l
			},
			activeSlideId: o,
			selectedElementId: null
		});
	},
	deleteSlide: (n) => {
		let { story: r, activeSlideId: i } = t();
		if (!r || r.slides.length <= 1) return;
		let a = r.slides.findIndex((e) => e.id === n);
		if (a === -1) return;
		let o = r.slides.filter((e) => e.id !== n), s = i;
		i === n && (s = o[a === 0 ? 0 : a - 1].id), e({
			story: {
				...r,
				slides: o
			},
			activeSlideId: s,
			selectedElementId: null
		});
	},
	reorderSlides: (n) => {
		let { story: r } = t();
		if (!r) return;
		let i = new Map(r.slides.map((e) => [e.id, e])), a = n.map((e) => i.get(e)).filter((e) => !!e);
		e({ story: {
			...r,
			slides: a
		} });
	},
	updateSlideBackground: (n, r) => {
		let { story: i } = t();
		if (!i) return;
		let a = i.slides.map((e) => e.id === n ? {
			...e,
			background: r
		} : e);
		e({ story: {
			...i,
			slides: a
		} });
	},
	updateSlideAudio: (n, r) => {
		let { story: i } = t();
		if (!i) return;
		let a = i.slides.map((e) => e.id === n ? {
			...e,
			audio: r
		} : e);
		e({ story: {
			...i,
			slides: a
		} });
	},
	deleteSlideAudio: (n) => {
		let { story: r } = t();
		if (!r) return;
		let i = r.slides.map((e) => e.id === n ? {
			...e,
			audio: null
		} : e);
		e({ story: {
			...r,
			slides: i
		} });
	},
	updateSlideDuration: (n, r) => {
		let { story: i } = t();
		if (!i) return;
		let a = i.slides.map((e) => e.id === n ? {
			...e,
			duration: r
		} : e);
		e({ story: {
			...i,
			slides: a
		} });
	},
	updateAllSlidesDuration: (n) => {
		let { story: r } = t();
		if (!r) return;
		let i = r.slides.map((e) => ({
			...e,
			duration: n
		}));
		e({ story: {
			...r,
			slides: i
		} });
	},
	addElement: (n) => {
		let { story: r, activeSlideId: i } = t();
		if (!r || !i) return;
		let a = ie(), o = r.slides.map((e) => {
			if (e.id !== i) return e;
			let t = e.elements.length, r = {
				...n,
				id: a,
				zIndex: t
			};
			return {
				...e,
				elements: [...e.elements, r]
			};
		});
		e({
			story: {
				...r,
				slides: o
			},
			selectedElementId: a
		});
	},
	updateElement: (n, r) => {
		let { story: i, activeSlideId: a } = t();
		if (!i || !a) return;
		let o = i.slides.map((e) => {
			if (e.id !== a) return e;
			let t = e.elements.map((e) => e.id === n ? {
				...e,
				...r
			} : e);
			return {
				...e,
				elements: t
			};
		});
		e({ story: {
			...i,
			slides: o
		} });
	},
	deleteElement: (n) => {
		let { story: r, activeSlideId: i, selectedElementId: a } = t();
		if (!r || !i) return;
		let o = r.slides.map((e) => {
			if (e.id !== i) return e;
			let t = e.elements.filter((e) => e.id !== n).map((e, t) => ({
				...e,
				zIndex: t
			}));
			return {
				...e,
				elements: t
			};
		});
		e({
			story: {
				...r,
				slides: o
			},
			selectedElementId: a === n ? null : a
		});
	},
	bringToFront: (n) => {
		let { story: r, activeSlideId: i } = t();
		if (!r || !i) return;
		let a = r.slides.map((e) => {
			if (e.id !== i) return e;
			let t = e.elements.find((e) => e.id === n);
			if (!t) return e;
			let r = [...e.elements.filter((e) => e.id !== n), t].map((e, t) => ({
				...e,
				zIndex: t
			}));
			return {
				...e,
				elements: r
			};
		});
		e({ story: {
			...r,
			slides: a
		} });
	},
	sendToBack: (n) => {
		let { story: r, activeSlideId: i } = t();
		if (!r || !i) return;
		let a = r.slides.map((e) => {
			if (e.id !== i) return e;
			let t = e.elements.find((e) => e.id === n);
			if (!t) return e;
			let r = [t, ...e.elements.filter((e) => e.id !== n)].map((e, t) => ({
				...e,
				zIndex: t
			}));
			return {
				...e,
				elements: r
			};
		});
		e({ story: {
			...r,
			slides: a
		} });
	},
	bringForward: (n) => {
		let { story: r, activeSlideId: i } = t();
		if (!r || !i) return;
		let a = r.slides.map((e) => {
			if (e.id !== i) return e;
			let t = [...e.elements].sort((e, t) => e.zIndex - t.zIndex), r = t.findIndex((e) => e.id === n);
			if (r === -1 || r === t.length - 1) return e;
			let a = t[r];
			t[r] = t[r + 1], t[r + 1] = a;
			let o = t.map((e, t) => ({
				...e,
				zIndex: t
			}));
			return {
				...e,
				elements: o
			};
		});
		e({ story: {
			...r,
			slides: a
		} });
	},
	sendBackward: (n) => {
		let { story: r, activeSlideId: i } = t();
		if (!r || !i) return;
		let a = r.slides.map((e) => {
			if (e.id !== i) return e;
			let t = [...e.elements].sort((e, t) => e.zIndex - t.zIndex), r = t.findIndex((e) => e.id === n);
			if (r <= 0) return e;
			let a = t[r];
			t[r] = t[r - 1], t[r - 1] = a;
			let o = t.map((e, t) => ({
				...e,
				zIndex: t
			}));
			return {
				...e,
				elements: o
			};
		});
		e({ story: {
			...r,
			slides: a
		} });
	},
	saveCustomPreset: (n) => {
		let { customPresets: r } = t(), i = [...r.filter((e) => e.id !== n.id), n];
		localStorage.setItem("story_engine_custom_presets", JSON.stringify(i)), e({ customPresets: i });
	},
	deleteCustomPreset: (n) => {
		let { customPresets: r, favoritePresetIds: i } = t(), a = r.filter((e) => e.id !== n), o = i.filter((e) => e !== n);
		localStorage.setItem("story_engine_custom_presets", JSON.stringify(a)), localStorage.setItem("story_engine_favorite_presets", JSON.stringify(o)), e({
			customPresets: a,
			favoritePresetIds: o
		});
	},
	toggleFavoritePreset: (n) => {
		let { favoritePresetIds: r } = t(), i = r.includes(n) ? r.filter((e) => e !== n) : [...r, n];
		localStorage.setItem("story_engine_favorite_presets", JSON.stringify(i)), e({ favoritePresetIds: i });
	},
	setElementAnimation: (n, r) => {
		let { story: i, activeSlideId: a } = t();
		if (!i || !a) return;
		let o = i.slides.map((e) => e.id === a ? {
			...e,
			elements: e.elements.map((e) => e.id === n ? {
				...e,
				animation: r
			} : e)
		} : e);
		e({ story: {
			...i,
			slides: o
		} });
	},
	setZoom: (t) => {
		e({ zoom: t });
	}
}), {
	limit: 50,
	partialize: (e) => ({ story: e.story })
}));
//#endregion
//#region node_modules/gsap/gsap-core.js
function P(e) {
	if (e === void 0) throw ReferenceError("this hasn't been initialised - super() hasn't been called");
	return e;
}
function oe(e, t) {
	e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e.__proto__ = t;
}
var se = {
	autoSleep: 120,
	force3D: "auto",
	nullTargetWarn: 1,
	units: { lineHeight: "" }
}, ce = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, le, F, I, ue = 1e8, L = 1 / ue, de = Math.PI * 2, fe = de / 4, pe = 0, me = Math.sqrt, he = Math.cos, ge = Math.sin, R = function(e) {
	return typeof e == "string";
}, z = function(e) {
	return typeof e == "function";
}, _e = function(e) {
	return typeof e == "number";
}, ve = function(e) {
	return e === void 0;
}, ye = function(e) {
	return typeof e == "object";
}, B = function(e) {
	return e !== !1;
}, be = function() {
	return typeof window < "u";
}, xe = function(e) {
	return z(e) || R(e);
}, Se = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, V = Array.isArray, Ce = /random\([^)]+\)/g, we = /,\s*/g, Te = /(?:-?\.?\d|\.)+/gi, Ee = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, De = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, Oe = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, ke = /[+-]=-?[.\d]+/, Ae = /[^,'"\[\]\s]+/gi, je = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, H, Me, Ne, Pe, Fe = {}, Ie = {}, Le, Re = function(e) {
	return (Ie = mt(e, Fe)) && Z;
}, ze = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, Be = function(e, t) {
	return !t && console.warn(e);
}, Ve = function(e, t) {
	return e && (Fe[e] = t) && Ie && (Ie[e] = t) || Fe;
}, He = function() {
	return 0;
}, Ue = {
	suppressEvents: !0,
	isStart: !0,
	kill: !1
}, We = {
	suppressEvents: !0,
	kill: !1
}, Ge = { suppressEvents: !0 }, Ke = {}, qe = [], Je = {}, Ye, Xe = {}, Ze = {}, Qe = 30, $e = [], et = "", tt = function(e) {
	var t = e[0], n, r;
	if (ye(t) || z(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = $e.length; r-- && !$e[r].targetTest(t););
		n = $e[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new Vn(e[r], n))) || e.splice(r, 1);
	return e;
}, nt = function(e) {
	return e._gsap || tt(Xt(e))[0]._gsap;
}, rt = function(e, t, n) {
	return (n = e[t]) && z(n) ? e[t]() : ve(n) && e.getAttribute && e.getAttribute(t) || n;
}, it = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, U = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, W = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, at = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, ot = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, st = function() {
	var e = qe.length, t = qe.slice(0), n, r;
	for (Je = {}, qe.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, ct = function(e) {
	return !!(e._initted || e._startAt || e.add);
}, lt = function(e, t, n, r) {
	qe.length && !F && st(), e.render(t, n, r || !!(F && t < 0 && ct(e))), qe.length && !F && st();
}, ut = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(Ae).length < 2 ? t : R(e) ? e.trim() : e;
}, dt = function(e) {
	return e;
}, ft = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, pt = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, mt = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, ht = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = ye(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, gt = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, _t = function(e) {
	var t = e.parent || H, n = e.keyframes ? pt(V(e.keyframes)) : ft;
	if (B(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, vt = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, yt = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, bt = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, xt = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, St = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, Ct = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, wt = function(e, t, n, r) {
	return e._startAt && (F ? e._startAt.revert(We) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, Tt = function e(t) {
	return !t || t._ts && e(t.parent);
}, Et = function(e) {
	return e._repeat ? Dt(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, Dt = function(e, t) {
	var n = Math.floor(e = W(e / t));
	return e && n === e ? n - 1 : n;
}, Ot = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, kt = function(e) {
	return e._end = W(e._start + (e._tDur / Math.abs(e._ts || e._rts || L) || 0));
}, At = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = W(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), kt(e), n._dirty || St(n, e)), e;
}, jt = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = Ot(e.rawTime(), t), (!t._dur || Gt(0, t.totalDuration(), n) - t._tTime > L) && t.render(n, !0)), St(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -L;
	}
}, Mt = function(e, t, n, r) {
	return t.parent && xt(t), t._start = W((_e(n) ? n : n || e !== H ? Ht(e, n, t) : e._time) + t._delay), t._end = W(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), yt(e, t, "_first", "_last", e._sort ? "_start" : 0), It(t) || (e._recent = t), r || jt(e, t), e._ts < 0 && At(e, e._tTime), e;
}, Nt = function(e, t) {
	return (Fe.ScrollTrigger || ze("scrollTrigger", t)) && Fe.ScrollTrigger.create(t, e);
}, Pt = function(e, t, n, r, i) {
	if (Yn(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !F && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && Ye !== On.frame) return qe.push(e), e._lazy = [i, r], 1;
}, Ft = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, It = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, Lt = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && Ft(e) && !(!e._initted && It(e)) || (e._ts < 0 || e._dp._ts < 0) && !It(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = Gt(0, e._tDur, t), l = Dt(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== Dt(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || F || r || e._zTime === L || !t && e._zTime) {
		if (!e._initted && Pt(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? L : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && wt(e, t, n, !0), e._onUpdate && !n && mn(e, "onUpdate"), s && e._repeat && !n && e.parent && mn(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && xt(e, 1), !n && !F && (mn(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, Rt = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, zt = function(e, t, n, r) {
	var i = e._repeat, a = W(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : W(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && At(e, e._tTime = e._tDur * o), e.parent && kt(e), n || St(e.parent, e), e;
}, Bt = function(e) {
	return e instanceof J ? St(e) : zt(e, e._dur);
}, Vt = {
	_start: 0,
	endTime: He,
	totalDuration: He
}, Ht = function e(t, n, r) {
	var i = t.labels, a = t._recent || Vt, o = t.duration() >= ue ? a.endTime(!1) : t._dur, s, c, l;
	return R(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (V(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, Ut = function(e, t, n) {
	var r = _e(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = B(s.vars.inherit) && s.parent;
		a.immediateRender = B(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new Y(t[0], a, t[i + 1]);
}, Wt = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, Gt = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, G = function(e, t) {
	return !R(e) || !(t = je.exec(e)) ? "" : t[1];
}, Kt = function(e, t, n) {
	return Wt(n, function(n) {
		return Gt(e, t, n);
	});
}, qt = [].slice, Jt = function(e, t) {
	return e && ye(e) && "length" in e && (!t && !e.length || e.length - 1 in e && ye(e[0])) && !e.nodeType && e !== Me;
}, Yt = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return R(e) && !t || Jt(e, 1) ? (r = n).push.apply(r, Xt(e)) : n.push(e);
	}) || n;
}, Xt = function(e, t, n) {
	return I && !t && I.selector ? I.selector(e) : R(e) && !n && (Ne || !kn()) ? qt.call((t || Pe).querySelectorAll(e), 0) : V(e) ? Yt(e, n) : Jt(e) ? qt.call(e, 0) : e ? [e] : [];
}, Zt = function(e) {
	return e = Xt(e)[0] || Be("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return Xt(t, n.querySelectorAll ? n : n === e ? Be("Invalid scope") || Pe.createElement("div") : e);
	};
}, Qt = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, $t = function(e) {
	if (z(e)) return e;
	var t = ye(e) ? e : { each: e }, n = In(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
	return R(r) ? l = u = {
		center: .5,
		edges: .5,
		end: 1
	}[r] || 0 : !o && s && (l = r[0], u = r[1]), function(e, o, d) {
		var f = (d || t).length, p = a[f], m, h, g, _, v, y, b, x, S;
		if (!p) {
			if (S = t.grid === "auto" ? 0 : (t.grid || [1, ue])[1], !S) {
				for (b = -ue; b < (b = d[S++].getBoundingClientRect().left) && S < f;);
				S < f && S--;
			}
			for (p = a[f] = [], m = s ? Math.min(S, f) * l - .5 : r % S, h = S === ue ? 0 : s ? f * u / S - .5 : r / S | 0, b = 0, x = ue, y = 0; y < f; y++) g = y % S - m, _ = h - (y / S | 0), p[y] = v = c ? Math.abs(c === "y" ? _ : g) : me(g * g + _ * _), v > b && (b = v), v < x && (x = v);
			r === "random" && Qt(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = G(t.amount || t.each) || 0, n = n && f < 0 ? Fn(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, W(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, en = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = W(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (_e(n) ? 0 : G(n));
	};
}, tn = function(e, t) {
	var n = V(e), r, i;
	return !n && ye(e) && (r = n = e.radius || ue, e.values ? (e = Xt(e.values), (i = !_e(e[0])) && (r *= r)) : e = en(e.increment)), Wt(t, n ? z(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = ue, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || _e(t) ? s : s + G(t);
	} : en(e));
}, nn = function(e, t, n, r) {
	return Wt(V(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return V(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, rn = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, an = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || G(n));
	};
}, on = function(e, t, n) {
	return dn(e, t, 0, 1, n);
}, sn = function(e, t, n) {
	return Wt(n, function(n) {
		return e[~~t(n)];
	});
}, cn = function e(t, n, r) {
	var i = n - t;
	return V(t) ? sn(t, e(0, t.length), n) : Wt(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, ln = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return V(t) ? sn(t, e(0, t.length - 1), n) : Wt(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, un = function(e) {
	return e.replace(Ce, function(e) {
		var t = e.indexOf("[") + 1, n = e.substring(t || 7, t ? e.indexOf("]") : e.length - 1).split(we);
		return nn(t ? n : +n[0], t ? 0 : +n[1], +n[2] || 1e-5);
	});
}, dn = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return Wt(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, fn = function e(t, n, r, i) {
	var a = isNaN(t + n) ? 0 : function(e) {
		return (1 - e) * t + e * n;
	};
	if (!a) {
		var o = R(t), s = {}, c, l, u, d, f;
		if (r === !0 && (i = 1) && (r = null), o) t = { p: t }, n = { p: n };
		else if (V(t) && !V(n)) {
			for (u = [], d = t.length, f = d - 2, l = 1; l < d; l++) u.push(e(t[l - 1], t[l]));
			d--, a = function(e) {
				e *= d;
				var t = Math.min(f, ~~e);
				return u[t](e - t);
			}, r = n;
		} else i || (t = mt(V(t) ? [] : {}, t));
		if (!u) {
			for (c in n) Wn.call(s, t, c, "get", n[c]);
			a = function(e) {
				return ur(e, s) || (o ? t.p : t);
			};
		}
	}
	return Wt(r, a);
}, pn = function(e, t, n) {
	var r = e.labels, i = ue, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, mn = function(e, t, n) {
	var r = e.vars, i = r[t], a = I, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && qe.length && st(), o && (I = o), l = s ? i.apply(c, s) : i.call(c), I = a, l;
}, hn = function(e) {
	return xt(e), e.scrollTrigger && e.scrollTrigger.kill(!!F), e.progress() < 1 && mn(e, "onInterrupt"), e;
}, gn, _n = [], vn = function(e) {
	if (e) if (e = !e.name && e.default || e, be() || e.headless) {
		var t = e.name, n = z(e), r = t && !n && e.init ? function() {
			this._props = [];
		} : e, i = {
			init: He,
			render: ur,
			add: Wn,
			kill: fr,
			modifier: dr,
			rawVars: 0
		}, a = {
			targetTest: 0,
			get: 0,
			getSetter: or,
			aliases: {},
			register: 0
		};
		if (kn(), e !== r) {
			if (Xe[t]) return;
			ft(r, ft(gt(e, i), a)), mt(r.prototype, mt(i, gt(e, a))), Xe[r.prop = t] = r, e.targetTest && ($e.push(r), Ke[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
		}
		Ve(t, r), e.register && e.register(Z, r, X);
	} else _n.push(e);
}, K = 255, yn = {
	aqua: [
		0,
		K,
		K
	],
	lime: [
		0,
		K,
		0
	],
	silver: [
		192,
		192,
		192
	],
	black: [
		0,
		0,
		0
	],
	maroon: [
		128,
		0,
		0
	],
	teal: [
		0,
		128,
		128
	],
	blue: [
		0,
		0,
		K
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		K,
		K,
		K
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		K,
		K,
		0
	],
	orange: [
		K,
		165,
		0
	],
	gray: [
		128,
		128,
		128
	],
	purple: [
		128,
		0,
		128
	],
	green: [
		0,
		128,
		0
	],
	red: [
		K,
		0,
		0
	],
	pink: [
		K,
		192,
		203
	],
	cyan: [
		0,
		K,
		K
	],
	transparent: [
		K,
		K,
		K,
		0
	]
}, bn = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * K + .5 | 0;
}, xn = function(e, t, n) {
	var r = e ? _e(e) ? [
		e >> 16,
		e >> 8 & K,
		e & K
	] : 0 : yn.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), yn[e]) r = yn[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & K,
				r & K,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & K,
				e & K
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(Te), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = bn(s + 1 / 3, i, a), r[1] = bn(s, i, a), r[2] = bn(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(Ee), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(Te) || yn.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / K, a = r[1] / K, o = r[2] / K, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, Sn = function(e) {
	var t = [], n = [], r = -1;
	return e.split(wn).forEach(function(e) {
		var i = e.match(De) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, Cn = function(e, t, n) {
	var r = "", i = (e + r).match(wn), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = xn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = Sn(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(wn, "1").split(De), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(wn), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, wn = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in yn) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), Tn = /hsl[a]?\(/, En = function(e) {
	var t = e.join(" "), n;
	if (wn.lastIndex = 0, wn.test(t)) return n = Tn.test(t), e[1] = Cn(e[1], n), e[0] = Cn(e[0], n, Sn(e[1])), !0;
}, Dn, On = function() {
	var e = Date.now, t = 500, n = 33, r = e(), i = r, a = 1e3 / 240, o = a, s = [], c, l, u, d, f, p, m = function u(m) {
		var h = e() - i, g = m === !0, _, v, y, b;
		if ((h > t || h < 0) && (r += h - n), i += h, y = i - r, _ = y - o, (_ > 0 || g) && (b = ++d.frame, f = y - d.time * 1e3, d.time = y /= 1e3, o += _ + (_ >= a ? 4 : a - _), v = 1), g || (c = l(u)), v) for (p = 0; p < s.length; p++) s[p](y, f, b, m);
	};
	return d = {
		time: 0,
		frame: 0,
		tick: function() {
			m(!0);
		},
		deltaRatio: function(e) {
			return f / (1e3 / (e || 60));
		},
		wake: function() {
			Le && (!Ne && be() && (Me = Ne = window, Pe = Me.document || {}, Fe.gsap = Z, (Me.gsapVersions || (Me.gsapVersions = [])).push(Z.version), Re(Ie || Me.GreenSockGlobals || !Me.gsap && Me || {}), _n.forEach(vn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, Dn = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), Dn = 0, l = He;
		},
		lagSmoothing: function(e, r) {
			t = e || Infinity, n = Math.min(r || 33, t);
		},
		fps: function(e) {
			a = 1e3 / (e || 240), o = d.time * 1e3 + a;
		},
		add: function(e, t, n) {
			var r = t ? function(t, n, i, a) {
				e(t, n, i, a), d.remove(r);
			} : e;
			return d.remove(e), s[n ? "unshift" : "push"](r), kn(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), kn = function() {
	return !Dn && On.wake();
}, q = {}, An = /^[\d.\-M][\d.\-,\s]/, jn = /["']/g, Mn = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(jn, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, Nn = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, Pn = function(e) {
	var t = (e + "").split("("), n = q[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [Mn(t[1])] : Nn(e).split(",").map(ut)) : q._CE && An.test(e) ? q._CE("", e) : n;
}, Fn = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, In = function(e, t) {
	return e && (z(e) ? e : q[e] || Pn(e)) || t;
}, Ln = function(e, t, n, r) {
	n === void 0 && (n = function(e) {
		return 1 - t(1 - e);
	}), r === void 0 && (r = function(e) {
		return e < .5 ? t(e * 2) / 2 : 1 - t((1 - e) * 2) / 2;
	});
	var i = {
		easeIn: t,
		easeOut: n,
		easeInOut: r
	}, a;
	return it(e, function(e) {
		for (var t in q[e] = Fe[e] = i, q[a = e.toLowerCase()] = n, i) q[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = q[e + "." + t] = i[t];
	}), i;
}, Rn = function(e) {
	return function(t) {
		return t < .5 ? (1 - e(1 - t * 2)) / 2 : .5 + e((t - .5) * 2) / 2;
	};
}, zn = function e(t, n, r) {
	var i = n >= 1 ? n : 1, a = (r || (t ? .3 : .45)) / (n < 1 ? n : 1), o = a / de * (Math.asin(1 / i) || 0), s = function(e) {
		return e === 1 ? 1 : i * 2 ** (-10 * e) * ge((e - o) * a) + 1;
	}, c = t === "out" ? s : t === "in" ? function(e) {
		return 1 - s(1 - e);
	} : Rn(s);
	return a = de / a, c.config = function(n, r) {
		return e(t, n, r);
	}, c;
}, Bn = function e(t, n) {
	n === void 0 && (n = 1.70158);
	var r = function(e) {
		return e ? --e * e * ((n + 1) * e + n) + 1 : 0;
	}, i = t === "out" ? r : t === "in" ? function(e) {
		return 1 - r(1 - e);
	} : Rn(r);
	return i.config = function(n) {
		return e(t, n);
	}, i;
};
it("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
	var n = t < 5 ? t + 1 : t;
	Ln(e + ",Power" + (n - 1), t ? function(e) {
		return e ** +n;
	} : function(e) {
		return e;
	}, function(e) {
		return 1 - (1 - e) ** n;
	}, function(e) {
		return e < .5 ? (e * 2) ** n / 2 : 1 - ((1 - e) * 2) ** n / 2;
	});
}), q.Linear.easeNone = q.none = q.Linear.easeIn, Ln("Elastic", zn("in"), zn("out"), zn()), (function(e, t) {
	var n = 1 / t, r = 2 * n, i = 2.5 * n, a = function(a) {
		return a < n ? e * a * a : a < r ? e * (a - 1.5 / t) ** 2 + .75 : a < i ? e * (a -= 2.25 / t) * a + .9375 : e * (a - 2.625 / t) ** 2 + .984375;
	};
	Ln("Bounce", function(e) {
		return 1 - a(1 - e);
	}, a);
})(7.5625, 2.75), Ln("Expo", function(e) {
	return 2 ** (10 * (e - 1)) * e + e * e * e * e * e * e * (1 - e);
}), Ln("Circ", function(e) {
	return -(me(1 - e * e) - 1);
}), Ln("Sine", function(e) {
	return e === 1 ? 1 : -he(e * fe) + 1;
}), Ln("Back", Bn("in"), Bn("out"), Bn()), q.SteppedEase = q.steps = Fe.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - L;
	return function(e) {
		return ((r * Gt(0, a, e) | 0) + i) * n;
	};
} }, ce.ease = q["quad.out"], it("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return et += e + "," + e + "Params,";
});
var Vn = function(e, t) {
	this.id = pe++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : rt, this.set = t ? t.getSetter : or;
}, Hn = /*#__PURE__*/ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, zt(this, +e.duration, 1, 1), this.data = e.data, I && (this._ctx = I, I.data.push(this)), Dn || On.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, zt(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (kn(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (At(this, e), !n._dp || n.parent || jt(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && Mt(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === L || !this._initted && this._dur && e || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), lt(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + Et(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + Et(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? Dt(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -L ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? Ot(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -L ? 0 : this._rts, this.totalTime(Gt(-Math.abs(this._delay), this.totalDuration(), n), t !== !1), kt(this), Ct(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (kn(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== L && (this._tTime -= L)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = W(e);
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && Mt(t, this, this._start - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (B(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? Ot(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = Ge);
		var t = F;
		return F = e, ct(this) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), F = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, Bt(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, Bt(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(Ht(this, e), B(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, B(t)), this._dur || (this._zTime = -L), this;
	}, t.play = function(e, t) {
		return e != null && this.seek(e, t), this.reversed(!1).paused(!1);
	}, t.reverse = function(e, t) {
		return e != null && this.seek(e || this.totalDuration(), t), this.reversed(!0).paused(!1);
	}, t.pause = function(e, t) {
		return e != null && this.seek(e, t), this.paused(!0);
	}, t.resume = function() {
		return this.paused(!1);
	}, t.reversed = function(e) {
		return arguments.length ? (!!e !== this.reversed() && this.timeScale(-this._rts || (e ? -L : 0)), this) : this._rts < 0;
	}, t.invalidate = function() {
		return this._initted = this._act = 0, this._zTime = -L, this;
	}, t.isActive = function() {
		var e = this.parent || this._dp, t = this._start, n;
		return !!(!e || this._ts && this._initted && e.isActive() && (n = e.rawTime(!0)) >= t && n < this.endTime(!0) - L);
	}, t.eventCallback = function(e, t, n) {
		var r = this.vars;
		return arguments.length > 1 ? (t ? (r[e] = t, n && (r[e + "Params"] = n), e === "onUpdate" && (this._onUpdate = t)) : delete r[e], this) : r[e];
	}, t.then = function(e) {
		var t = this, n = t._prom;
		return new Promise(function(r) {
			var i = z(e) ? e : dt, a = function() {
				var e = t.then;
				t.then = null, n && n(), z(i) && (i = i(t)) && (i.then || i === t) && (t.then = e), r(i), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? a() : t._prom = a;
		});
	}, t.kill = function() {
		hn(this);
	}, e;
}();
ft(Hn.prototype, {
	_time: 0,
	_start: 0,
	_end: 0,
	_tTime: 0,
	_tDur: 0,
	_dirty: 0,
	_repeat: 0,
	_yoyo: !1,
	parent: null,
	_initted: !1,
	_rDelay: 0,
	_ts: 1,
	_dp: 0,
	ratio: 0,
	_zTime: -L,
	_prom: 0,
	_ps: !1,
	_rts: 1
});
var J = /*#__PURE__*/ function(e) {
	oe(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = B(t.sortChildren), H && Mt(t.parent || H, P(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && Nt(P(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return Ut(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return Ut(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return Ut(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, _t(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new Y(e, t, Ht(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return Mt(this, Y.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new Y(e, n, Ht(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, _t(n).immediateRender = B(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, _t(r).immediateRender = B(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : W(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== H && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = W(o % f), o === i ? (d = this._repeat, c = a) : (_ = W(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = Dt(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : W(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && mn(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1, _ = d), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = Rt(this, W(r), W(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !!h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && o && a && !t && !_ && (mn(this, "onStart"), this._tTime !== o)) return this;
			if (c >= r && e >= 0) for (l = this._first; l;) {
				if (u = l._next, (l._act || c >= l._start) && l._ts && m !== l) {
					if (l.parent !== this) return this.render(e, t, n);
					if (l.render(l._ts > 0 ? (c - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (c - l._start) * l._ts, t, n), c !== this._time || !this._ts && !p) {
						m = 0, u && (o += this._zTime = -L);
						break;
					}
				}
				l = u;
			}
			else {
				l = this._last;
				for (var S = e < 0 ? e : c; l;) {
					if (u = l._prev, (l._act || S <= l._end) && l._ts && m !== l) {
						if (l.parent !== this) return this.render(e, t, n);
						if (l.render(l._ts > 0 ? (S - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (S - l._start) * l._ts, t, n || F && ct(l)), c !== this._time || !this._ts && !p) {
							m = 0, u && (o += this._zTime = S ? -L : L);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -L)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, kt(this), this.render(e, t, n);
			this._onUpdate && !t && mn(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && xt(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && (mn(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (_e(t) || (t = Ht(this, t, e)), !(e instanceof Hn)) {
			if (V(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (R(e)) return this.addLabel(e, t);
			if (z(e)) e = Y.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : Mt(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -ue);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof Y ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return R(e) ? this.removeLabel(e) : z(e) ? this.killTweensOf(e) : (e.parent === this && bt(this, e), e === this._recent && (this._recent = this._last), St(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = W(On.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = Ht(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = Y.delayedCall(0, t || He, n);
		return r.data = "isPause", this._hasPause = 1, Mt(this, r, Ht(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = Ht(this, e); t;) t._start === e && t.data === "isPause" && xt(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) qn !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = Xt(e), i = this._first, a = _e(t), o; i;) i instanceof Y ? ot(i._targets, r) && (a ? (!qn || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = Ht(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = Y.to(n, ft({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || L,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && zt(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, ft({ startAt: { time: Ht(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), pn(this, Ht(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), pn(this, Ht(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + L);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		var r = this._first, i = this.labels, a;
		for (e = W(e); r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return St(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), St(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = ue, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, Mt(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += W(o / n._ts), n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			zt(n, n === H && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (H._ts && (lt(H, Ot(e, H)), Ye = On.frame), On.frame >= Qe) {
			Qe += se.autoSleep || 120;
			var t = H._first;
			if ((!t || !t._ts) && se.autoSleep && On._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || On.sleep();
			}
		}
	}, t;
}(Hn);
ft(J.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var Un = function(e, t, n, r, i, a, o) {
	var s = new X(this._pt, e, t, 0, 1, lr, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = un(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(Oe) || []; u = Oe.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? at(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = Oe.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (ke.test(r) || g) && (s.e = 0), this._pt = s, s;
}, Wn = function(e, t, n, r, i, a, o, s, c, l) {
	z(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? z(u) ? c ? e[t.indexOf("set") || !z(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = z(u) ? c ? ir : rr : nr, p;
	if (R(r) && (~r.indexOf("random(") && (r = un(r)), r.charAt(1) === "=" && (p = at(d, r) + (G(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || Jn) return !isNaN(d * r) && r !== "" ? (p = new X(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? cr : sr, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && ze(t, r), Un.call(this, e, t, d, r, f, s || se.stringFilter, c));
}, Gn = function(e, t, n, r, i) {
	if (z(e) && (e = $n(e, i, t, n, r)), !ye(e) || e.style && e.nodeType || V(e) || Se(e)) return R(e) ? $n(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = $n(e[o], i, t, n, r);
	return a;
}, Kn = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (Xe[e] && (o = new Xe[e]()).init(i, o.rawVars ? t[e] : Gn(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new X(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== gn)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, qn, Jn, Yn = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !le, b = t.timeline, x = i.easeReverse || d, S, C, w, T, E, D, O, k, A, j, M, N, ee;
	if (b && (!f || !a) && (a = "none"), t._ease = In(a, ce.ease), t._rEase = x && (In(x) || t._ease), t._from = !b && !!i.runBackwards, t._from && (t.ratio = 1), !b || f && !i.stagger) {
		if (k = g[0] ? nt(g[0]).harness : 0, N = k && i[k.prop], S = gt(i, Ke), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? We : Ue), h._lazy = 0), o) {
			if (xt(t._startAt = Y.set(g, ft({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && B(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return mn(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (F || !s && !p) && t._startAt.revert(We), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), w = ft({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && B(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, S), N && (w[k.prop] = N), xt(t._startAt = Y.set(g, w)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (F ? t._startAt.revert(We) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, L, L);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && B(c) || c && !m, C = 0; C < g.length; C++) {
			if (E = g[C], O = E._gsap || tt(g)[C]._gsap, t._ptLookup[C] = j = {}, Je[O.id] && qe.length && st(), M = v === g ? C : v.indexOf(E), k && (A = new k()).init(E, N || S, t, M, v) !== !1 && (t._pt = T = new X(t._pt, E, A.name, 0, 1, A.render, A, 0, A.priority), A._props.forEach(function(e) {
				j[e] = T;
			}), A.priority && (D = 1)), !k || N) for (w in S) Xe[w] && (A = Kn(w, S, t, M, E, v)) ? A.priority && (D = 1) : j[w] = T = Wn.call(t, E, w, "get", S[w], M, v, 0, i.stringFilter);
			t._op && t._op[C] && t.kill(E, t._op[C]), y && t._pt && (qn = t, H.killTweensOf(E, j, t.globalTime(n)), ee = !t.parent, qn = 0), t._pt && c && (Je[O.id] = 1);
		}
		D && mr(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !ee, f && n <= 0 && b.render(ue, !0, !0);
}, Xn = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return Jn = 1, e.vars[t] = "+=0", Yn(e, o), Jn = 0, s ? Be(t + " not eligible for reset. Try splitting into individual properties") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e && (u.e = U(n) + G(u.e)), u.b && (u.b = l.s + G(u.b));
}, Zn = function(e, t) {
	var n = e[0] ? nt(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = mt({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
	return i;
}, Qn = function(e, t, n, r) {
	var i = t.ease || r || "power1.inOut", a, o;
	if (V(t)) o = n[e] || (n[e] = []), t.forEach(function(e, n) {
		return o.push({
			t: n / (t.length - 1) * 100,
			v: e,
			e: i
		});
	});
	else for (a in t) o = n[a] || (n[a] = []), a === "ease" || o.push({
		t: parseFloat(e),
		v: t[a],
		e: i
	});
}, $n = function(e, t, n, r, i) {
	return z(e) ? e.call(t, n, r, i) : R(e) && ~e.indexOf("random(") ? un(e) : e;
}, er = et + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert", tr = {};
it(er + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return tr[e] = 1;
});
var Y = /*#__PURE__*/ function(e) {
	oe(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : _t(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = n.parent || H, g = (V(t) || Se(t) ? _e(t[0]) : "length" in n) ? [t] : Xt(t), _, v, y, b, x, S, C, w;
		if (a._targets = g.length ? tt(g) : Be("GSAP target " + t + " not found. https://gsap.com", !se.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || xe(s) || xe(c)) {
			n = a.vars;
			var T = n.easeReverse || n.yoyoEase;
			if (_ = a.timeline = new J({
				data: "nested",
				defaults: p || {},
				targets: h && h.data === "nested" ? h.vars.targets : g
			}), _.kill(), _.parent = _._dp = P(a), _._start = 0, u || xe(s) || xe(c)) {
				if (b = g.length, C = u && $t(u), ye(u)) for (x in u) ~er.indexOf(x) && (w ||= {}, w[x] = u[x]);
				for (v = 0; v < b; v++) y = gt(n, tr), y.stagger = 0, T && (y.easeReverse = T), w && mt(y, w), S = g[v], y.duration = +$n(s, P(a), v, S, g), y.delay = (+$n(c, P(a), v, S, g) || 0) - a._delay, !u && b === 1 && y.delay && (a._delay = c = y.delay, a._start += c, y.delay = 0), _.to(S, y, C ? C(v, S, g) : 0), _._ease = q.none;
				_.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				_t(ft(_.vars.defaults, { ease: "none" })), _._ease = In(f.ease || n.ease || "none");
				var E = 0, D, O, k;
				if (V(f)) f.forEach(function(e) {
					return _.to(g, e, ">");
				}), _.duration();
				else {
					for (x in y = {}, f) x === "ease" || x === "easeEach" || Qn(x, f[x], y, f.easeEach);
					for (x in y) for (D = y[x].sort(function(e, t) {
						return e.t - t.t;
					}), E = 0, v = 0; v < D.length; v++) O = D[v], k = {
						ease: O.e,
						duration: (O.t - (v ? D[v - 1].t : 0)) / 100 * s
					}, k[x] = O.v, _.to(g, k, E), E += k.duration;
					_.duration() < s && _.to({}, { duration: s - _.duration() });
				}
			}
			s || a.duration(s = _.duration());
		} else a.timeline = 0;
		return d === !0 && !le && (qn = P(a), H.killTweensOf(g), qn = 0), Mt(h, P(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === W(h._time) && B(l) && Tt(P(a)) && h.data !== "nested") && (a._tTime = -L, a.render(Math.max(0, -c) || 0)), m && Nt(P(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - L && !o ? i : e < L ? 0 : e, c, l, u, d, f, p, m, h;
		if (!a) Lt(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = W(s % d), s === i ? (u = this._repeat, c = a) : (f = W(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (c = a - c), f = Dt(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(W(d * u), !0).invalidate()._lock = 0);
			}
			if (!this._initted) {
				if (Pt(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
				if (r !== this._time && !(n && this.vars.repeatRefresh && u !== f)) return this;
				if (a !== this._dur) return this.render(e, t, n);
			}
			if (this._rEase) {
				var g = c < r;
				if (g !== this._inv) {
					var _ = g ? r : a - r;
					this._inv = g, this._from && (this.ratio = 1 - this.ratio), this._invRatio = this.ratio, this._invTime = r, this._invRecip = _ ? (g ? -1 : 1) / _ : 0, this._invScale = g ? -this.ratio : 1 - this.ratio, this._invEase = g ? this._rEase : this._ease;
				}
				this.ratio = m = this._invRatio + this._invScale * this._invEase((c - this._invTime) * this._invRecip);
			} else this.ratio = m = this._ease(c / a);
			if (this._from && (this.ratio = m = 1 - m), this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), !r && s && !t && !f && (mn(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && wt(this, e, t, n), mn(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && mn(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && wt(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && xt(this, 1), !t && !(o && !r) && (s || r || p) && (mn(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		Dn || On.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || Yn(this, a), o = this._ease(a / this._dur), Xn(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (At(this, 0), this.parent || yt(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? hn(this) : this.scrollTrigger && this.scrollTrigger.kill(!!F), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, qn && qn.vars.overwrite !== !0)._first || hn(this), this.parent && n !== this.timeline.totalDuration() && zt(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? Xt(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && vt(r, i)) return t === "all" && (this._pt = 0), hn(this);
		for (s = this._op = this._op || [], t !== "all" && (R(t) && (d = {}, it(t, function(e) {
			return d[e] = 1;
		}), t = d), t = Zn(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && bt(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && hn(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return Ut(1, arguments);
	}, t.delayedCall = function(e, n, r, i) {
		return new t(n, 0, {
			immediateRender: !1,
			lazy: !1,
			overwrite: !1,
			delay: e,
			onComplete: n,
			onReverseComplete: n,
			onCompleteParams: r,
			onReverseCompleteParams: r,
			callbackScope: i
		});
	}, t.fromTo = function(e, t, n) {
		return Ut(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return H.killTweensOf(e, t, n);
	}, t;
}(Hn);
ft(Y.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), it("staggerTo,staggerFrom,staggerFromTo", function(e) {
	Y[e] = function() {
		var t = new J(), n = qt.call(arguments, 0);
		return n.splice(e === "staggerFromTo" ? 5 : 4, 0, 0), t[e].apply(t, n);
	};
});
var nr = function(e, t, n) {
	return e[t] = n;
}, rr = function(e, t, n) {
	return e[t](n);
}, ir = function(e, t, n, r) {
	return e[t](r.fp, n);
}, ar = function(e, t, n) {
	return e.setAttribute(t, n);
}, or = function(e, t) {
	return z(e[t]) ? rr : ve(e[t]) && e.setAttribute ? ar : nr;
}, sr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e6) / 1e6, t);
}, cr = function(e, t) {
	return t.set(t.t, t.p, !!(t.s + t.c * e), t);
}, lr = function(e, t) {
	var n = t._pt, r = "";
	if (!e && t.b) r = t.b;
	else if (e === 1 && t.e) r = t.e;
	else {
		for (; n;) r = n.p + (n.m ? n.m(n.s + n.c * e) : Math.round((n.s + n.c * e) * 1e4) / 1e4) + r, n = n._next;
		r += t.c;
	}
	t.set(t.t, t.p, r, t);
}, ur = function(e, t) {
	for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
}, dr = function(e, t, n, r) {
	for (var i = this._pt, a; i;) a = i._next, i.p === r && i.modifier(e, t, n), i = a;
}, fr = function(e) {
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? bt(this, t, "_pt") : t.dep || (n = 1), t = r;
	return !n;
}, pr = function(e, t, n, r) {
	r.mSet(e, t, r.m.call(r.tween, n, r.mt), r);
}, mr = function(e) {
	for (var t = e._pt, n, r, i, a; t;) {
		for (n = t._next, r = i; r && r.pr > t.pr;) r = r._next;
		(t._prev = r ? r._prev : a) ? t._prev._next = t : i = t, (t._next = r) ? r._prev = t : a = t, t = n;
	}
	e._pt = i;
}, X = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a, o, s, c) {
		this.t = t, this.s = r, this.c = i, this.p = n, this.r = a || sr, this.d = o || this, this.set = s || nr, this.pr = c || 0, this._next = e, e && (e._prev = this);
	}
	var t = e.prototype;
	return t.modifier = function(e, t, n) {
		this.mSet = this.mSet || this.set, this.set = pr, this.m = e, this.mt = n, this.tween = t;
	}, e;
}();
it(et + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse", function(e) {
	return Ke[e] = 1;
}), Fe.TweenMax = Fe.TweenLite = Y, Fe.TimelineLite = Fe.TimelineMax = J, H = new J({
	sortChildren: !1,
	defaults: ce,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), se.stringFilter = En;
var hr = [], gr = {}, _r = [], vr = 0, yr = 0, br = function(e) {
	return (gr[e] || _r).map(function(e) {
		return e();
	});
}, xr = function() {
	var e = Date.now(), t = [];
	e - vr > 2 && (br("matchMediaInit"), hr.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = Me.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), br("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), vr = e, br("matchMedia"));
}, Sr = /*#__PURE__*/ function() {
	function e(e, t) {
		this.selector = t && Zt(t), this.data = [], this._r = [], this.isReverted = !1, this.id = yr++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		z(e) && (n = t, t = e, e = z);
		var r = this, i = function() {
			var e = I, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = Zt(n)), I = r, a = t.apply(r, arguments), z(a) && r._r.push(a), I = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === z ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = I;
		I = null, e(this), I = t;
	}, t.getTweens = function() {
		var t = [];
		return this.data.forEach(function(n) {
			return n instanceof e ? t.push.apply(t, n.getTweens()) : n instanceof Y && !(n.parent && n.parent.data === "nested") && t.push(n);
		}), t;
	}, t.clear = function() {
		this._r.length = this.data.length = 0;
	}, t.kill = function(e, t) {
		var n = this;
		if (e ? (function() {
			for (var t = n.getTweens(), r = n.data.length, i; r--;) i = n.data[r], i.data === "isFlip" && (i.revert(), i.getChildren(!0, !0, !1).forEach(function(e) {
				return t.splice(t.indexOf(e), 1);
			}));
			for (t.map(function(e) {
				return {
					g: e._dur || e._delay || e._sat && !e._sat.vars.immediateRender ? e.globalTime(0) : -Infinity,
					t: e
				};
			}).sort(function(e, t) {
				return t.g - e.g || -Infinity;
			}).forEach(function(t) {
				return t.t.revert(e);
			}), r = n.data.length; r--;) i = n.data[r], i instanceof J ? i.data !== "nested" && (i.scrollTrigger && i.scrollTrigger.revert(), i.kill()) : !(i instanceof Y) && i.revert && i.revert(e);
			n._r.forEach(function(t) {
				return t(e, n);
			}), n.isReverted = !0;
		})() : this.data.forEach(function(e) {
			return e.kill && e.kill();
		}), this.clear(), t) for (var r = hr.length; r--;) hr[r].id === this.id && hr.splice(r, 1);
	}, t.revert = function(e) {
		this.kill(e || {});
	}, e;
}(), Cr = /*#__PURE__*/ function() {
	function e(e) {
		this.contexts = [], this.scope = e, I && I.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		ye(e) || (e = { matches: e });
		var r = new Sr(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in I && !r.selector && (r.selector = I.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = Me.matchMedia(e[o]), a && (hr.indexOf(r) < 0 && hr.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(xr) : a.addEventListener("change", xr)));
		return s && t(r, function(e) {
			return r.add(null, e);
		}), this;
	}, t.revert = function(e) {
		this.kill(e || {});
	}, t.kill = function(e) {
		this.contexts.forEach(function(t) {
			return t.kill(e, !0);
		});
	}, e;
}(), wr = {
	registerPlugin: function() {
		[...arguments].forEach(function(e) {
			return vn(e);
		});
	},
	timeline: function(e) {
		return new J(e);
	},
	getTweensOf: function(e, t) {
		return H.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		R(e) && (e = Xt(e)[0]);
		var i = nt(e || {}).get, a = n ? dt : ut;
		return n === "native" && (n = ""), e && (t ? a((Xe[t] && Xe[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((Xe[t] && Xe[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = Xt(e), e.length > 1) {
			var r = e.map(function(e) {
				return Z.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = Xe[t], o = nt(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			gn._pt = 0, r.init(e, n ? t + n : t, gn, 0, [e]), r.render(1, r), gn._pt && ur(1, gn);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = Z.to(e, ft((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return H.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = In(e.ease, ce.ease)), ht(ce, e || {});
	},
	config: function(e) {
		return ht(se, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !Xe[e] && !Fe[e] && Be(t + " effect requires " + e + " plugin.");
		}), Ze[t] = function(e, t, r) {
			return n(Xt(e), ft(t || {}, i), r);
		}, a && (J.prototype[t] = function(e, n, r) {
			return this.add(Ze[t](e, ye(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		q[e] = In(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? In(e, t) : q;
	},
	getById: function(e) {
		return H.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new J(e), r, i;
		for (n.smoothChildTiming = B(e.smoothChildTiming), H.remove(n), n._dp = 0, n._time = n._tTime = H._time, r = H._first; r;) i = r._next, (t || !(!r._dur && r instanceof Y && r.vars.onComplete === r._targets[0])) && Mt(n, r, r._start - r._delay), r = i;
		return Mt(H, n, 0), n;
	},
	context: function(e, t) {
		return e ? new Sr(e, t) : I;
	},
	matchMedia: function(e) {
		return new Cr(e);
	},
	matchMediaRefresh: function() {
		return hr.forEach(function(e) {
			var t = e.conditions, n, r;
			for (r in t) t[r] && (t[r] = !1, n = 1);
			n && e.revert();
		}) || xr();
	},
	addEventListener: function(e, t) {
		var n = gr[e] || (gr[e] = []);
		~n.indexOf(t) || n.push(t);
	},
	removeEventListener: function(e, t) {
		var n = gr[e], r = n && n.indexOf(t);
		r >= 0 && n.splice(r, 1);
	},
	utils: {
		wrap: cn,
		wrapYoyo: ln,
		distribute: $t,
		random: nn,
		snap: tn,
		normalize: on,
		getUnit: G,
		clamp: Kt,
		splitColor: xn,
		toArray: Xt,
		selector: Zt,
		mapRange: dn,
		pipe: rn,
		unitize: an,
		interpolate: fn,
		shuffle: Qt
	},
	install: Re,
	effects: Ze,
	ticker: On,
	updateRoot: J.updateRoot,
	plugins: Xe,
	globalTimeline: H,
	core: {
		PropTween: X,
		globals: Ve,
		Tween: Y,
		Timeline: J,
		Animation: Hn,
		getCache: nt,
		_removeLinkedListItem: bt,
		reverting: function() {
			return F;
		},
		context: function(e) {
			return e && I && (I.data.push(e), e._ctx = I), I;
		},
		suppressOverwrites: function(e) {
			return le = e;
		}
	}
};
it("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return wr[e] = Y[e];
}), On.add(J.updateRoot), gn = wr.to({}, { duration: 0 });
var Tr = function(e, t) {
	for (var n = e._pt; n && n.p !== t && n.op !== t && n.fp !== t;) n = n._next;
	return n;
}, Er = function(e, t) {
	var n = e._targets, r, i, a;
	for (r in t) for (i = n.length; i--;) a = e._ptLookup[i][r], (a &&= a.d) && (a._pt && (a = Tr(a, r)), a && a.modifier && a.modifier(t[r], e, n[i], r));
}, Dr = function(e, t) {
	return {
		name: e,
		headless: 1,
		rawVars: 1,
		init: function(e, n, r) {
			r._onInit = function(e) {
				var r, i;
				if (R(n) && (r = {}, it(n, function(e) {
					return r[e] = 1;
				}), n = r), t) {
					for (i in r = {}, n) r[i] = t(n[i]);
					n = r;
				}
				Er(e, n);
			};
		}
	};
}, Z = wr.registerPlugin({
	name: "attr",
	init: function(e, t, n, r, i) {
		var a, o, s;
		for (a in this.tween = n, t) s = e.getAttribute(a) || "", o = this.add(e, "setAttribute", (s || 0) + "", t[a], r, i, 0, 0, a), o.op = a, o.b = s, this._props.push(a);
	},
	render: function(e, t) {
		for (var n = t._pt; n;) F ? n.set(n.t, n.p, n.b, n) : n.r(e, n.d), n = n._next;
	}
}, {
	name: "endArray",
	headless: 1,
	init: function(e, t) {
		for (var n = t.length; n--;) this.add(e, n, e[n] || 0, t[n], 0, 0, 0, 0, 0, 1);
	}
}, Dr("roundProps", en), Dr("modifiers"), Dr("snap", tn)) || wr;
Y.version = J.version = Z.version = "3.15.0", Le = 1, be() && kn(), q.Power0, q.Power1, q.Power2, q.Power3, q.Power4, q.Linear, q.Quad, q.Cubic, q.Quart, q.Quint, q.Strong, q.Elastic, q.Back, q.SteppedEase, q.Bounce, q.Sine, q.Expo, q.Circ;
//#endregion
//#region node_modules/gsap/CSSPlugin.js
var Or, kr, Ar, jr, Mr, Nr, Pr, Fr = function() {
	return typeof window < "u";
}, Ir = {}, Lr = 180 / Math.PI, Rr = Math.PI / 180, zr = Math.atan2, Br = 1e8, Vr = /([A-Z])/g, Hr = /(left|right|width|margin|padding|x)/i, Ur = /[\s,\(]\S/, Wr = {
	autoAlpha: "opacity,visibility",
	scale: "scaleX,scaleY",
	alpha: "opacity"
}, Gr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, Kr = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, qr = function(e, t) {
	return t.set(t.t, t.p, e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, Jr = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, Yr = function(e, t) {
	var n = t.s + t.c * e;
	t.set(t.t, t.p, ~~(n + (n < 0 ? -.5 : .5)) + t.u, t);
}, Xr = function(e, t) {
	return t.set(t.t, t.p, e ? t.e : t.b, t);
}, Zr = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : t.b, t);
}, Qr = function(e, t, n) {
	return e.style[t] = n;
}, $r = function(e, t, n) {
	return e.style.setProperty(t, n);
}, ei = function(e, t, n) {
	return e._gsap[t] = n;
}, ti = function(e, t, n) {
	return e._gsap.scaleX = e._gsap.scaleY = n;
}, ni = function(e, t, n, r, i) {
	var a = e._gsap;
	a.scaleX = a.scaleY = n, a.renderTransform(i, a);
}, ri = function(e, t, n, r, i) {
	var a = e._gsap;
	a[t] = n, a.renderTransform(i, a);
}, Q = "transform", ii = Q + "Origin", ai = function e(t, n) {
	var r = this, i = this.target, a = i.style, o = i._gsap;
	if (t in Ir && a) {
		if (this.tfm = this.tfm || {}, t !== "transform") t = Wr[t] || t, ~t.indexOf(",") ? t.split(",").forEach(function(e) {
			return r.tfm[e] = wi(i, e);
		}) : this.tfm[t] = o.x ? o[t] : wi(i, t), t === ii && (this.tfm.zOrigin = o.zOrigin);
		else return Wr.transform.split(",").forEach(function(t) {
			return e.call(r, t, n);
		});
		if (this.props.indexOf(Q) >= 0) return;
		o.svg && (this.svgo = i.getAttribute("data-svg-origin"), this.props.push(ii, n, "")), t = Q;
	}
	(a || n) && this.props.push(t, n, a[t]);
}, oi = function(e) {
	e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, si = function() {
	var e = this.props, t = this.target, n = t.style, r = t._gsap, i, a;
	for (i = 0; i < e.length; i += 3) e[i + 1] ? e[i + 1] === 2 ? t[e[i]](e[i + 2]) : t[e[i]] = e[i + 2] : e[i + 2] ? n[e[i]] = e[i + 2] : n.removeProperty(e[i].substr(0, 2) === "--" ? e[i] : e[i].replace(Vr, "-$1").toLowerCase());
	if (this.tfm) {
		for (a in this.tfm) r[a] = this.tfm[a];
		r.svg && (r.renderTransform(), t.setAttribute("data-svg-origin", this.svgo || "")), i = Pr(), (!i || !i.isStart) && !n[Q] && (oi(n), r.zOrigin && n[ii] && (n[ii] += " " + r.zOrigin + "px", r.zOrigin = 0, r.renderTransform()), r.uncache = 1);
	}
}, ci = function(e, t) {
	var n = {
		target: e,
		props: [],
		revert: si,
		save: ai
	};
	return e._gsap || Z.core.getCache(e), t && e.style && e.nodeType && t.split(",").forEach(function(e) {
		return n.save(e);
	}), n;
}, li, ui = function(e, t) {
	var n = kr.createElementNS ? kr.createElementNS((t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : kr.createElement(e);
	return n && n.style ? n : kr.createElement(e);
}, di = function e(t, n, r) {
	var i = getComputedStyle(t);
	return i[n] || i.getPropertyValue(n.replace(Vr, "-$1").toLowerCase()) || i.getPropertyValue(n) || !r && e(t, pi(n) || n, 1) || "";
}, fi = "O,Moz,ms,Ms,Webkit".split(","), pi = function(e, t, n) {
	var r = (t || Mr).style, i = 5;
	if (e in r && !n) return e;
	for (e = e.charAt(0).toUpperCase() + e.substr(1); i-- && !(fi[i] + e in r););
	return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? fi[i] : "") + e;
}, mi = function() {
	Fr() && window.document && (Or = window, kr = Or.document, Ar = kr.documentElement, Mr = ui("div") || { style: {} }, ui("div"), Q = pi(Q), ii = Q + "Origin", Mr.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", li = !!pi("perspective"), Pr = Z.core.reverting, jr = 1);
}, hi = function(e) {
	var t = e.ownerSVGElement, n = ui("svg", t && t.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), r = e.cloneNode(!0), i;
	r.style.display = "block", n.appendChild(r), Ar.appendChild(n);
	try {
		i = r.getBBox();
	} catch {}
	return n.removeChild(r), Ar.removeChild(n), i;
}, gi = function(e, t) {
	for (var n = t.length; n--;) if (e.hasAttribute(t[n])) return e.getAttribute(t[n]);
}, _i = function(e) {
	var t, n;
	try {
		t = e.getBBox();
	} catch {
		t = hi(e), n = 1;
	}
	return t && (t.width || t.height) || n || (t = hi(e)), t && !t.width && !t.x && !t.y ? {
		x: +gi(e, [
			"x",
			"cx",
			"x1"
		]) || 0,
		y: +gi(e, [
			"y",
			"cy",
			"y1"
		]) || 0,
		width: 0,
		height: 0
	} : t;
}, vi = function(e) {
	return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _i(e));
}, yi = function(e, t) {
	if (t) {
		var n = e.style, r;
		t in Ir && t !== ii && (t = Q), n.removeProperty ? (r = t.substr(0, 2), (r === "ms" || t.substr(0, 6) === "webkit") && (t = "-" + t), n.removeProperty(r === "--" ? t : t.replace(Vr, "-$1").toLowerCase())) : n.removeAttribute(t);
	}
}, bi = function(e, t, n, r, i, a) {
	var o = new X(e._pt, t, n, 0, 1, a ? Zr : Xr);
	return e._pt = o, o.b = r, o.e = i, e._props.push(n), o;
}, xi = {
	deg: 1,
	rad: 1,
	turn: 1
}, Si = {
	grid: 1,
	flex: 1
}, Ci = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = Mr.style, c = Hr.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || xi[i] || xi[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && vi(t), (p || o === "%") && (Ir[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], U(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === kr || !h.appendChild) && (h = kr.body), g = h._gsap, g && p && g.width && c && g.time === On.time && !g.uncache) return U(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : yi(t, n);
	} else (p || o === "%") && !Si[di(h, "display")] && (s.position = di(t, "position")), h === t && (s.position = "static"), h.appendChild(Mr), m = Mr[u], h.removeChild(Mr), s.position = "absolute";
	return c && p && (g = nt(h), g.time = On.time, g.width = h[u]), U(f ? m * a / d : m && a ? d / m * a : 0);
}, wi = function(e, t, n, r) {
	var i;
	return jr || mi(), t in Wr && t !== "transform" && (t = Wr[t], ~t.indexOf(",") && (t = t.split(",")[0])), Ir[t] && t !== "transform" ? (i = Ii(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : Li(di(e, ii)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = ki[t] && ki[t](e, t, n) || di(e, t) || rt(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? Ci(e, t, i, n) + n : i;
}, Ti = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = pi(t, e, 1), a = i && di(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = di(e, "borderTopColor"));
	}
	var o = new X(this._pt, e.style, t, 0, 1, lr), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r.substring(0, 6) === "var(--" && (r = di(e, r.substring(4, r.indexOf(")")))), r === "auto" && (m = e.style[t], e.style[t] = r, r = di(e, t) || r, m ? e.style[t] = m : yi(e, t)), l = [n, r], En(l), n = l[0], r = l[1], d = n.match(De) || [], b = r.match(De) || [], b.length) {
		for (; u = De.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = at(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = De.lastIndex - v.length, v || (v = v || se.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = Ci(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? Zr : Xr;
	return ke.test(r) && (o.e = 0), this._pt = o, o;
}, Ei = {
	top: "0%",
	bottom: "100%",
	left: "0%",
	right: "100%",
	center: "50%"
}, Di = function(e) {
	var t = e.split(" "), n = t[0], r = t[1] || "50%";
	return (n === "top" || n === "bottom" || r === "left" || r === "right") && (e = n, n = r, r = e), t[0] = Ei[n] || n, t[1] = Ei[r] || r, t.join(" ");
}, Oi = function(e, t) {
	if (t.tween && t.tween._time === t.tween._dur) {
		var n = t.t, r = n.style, i = t.u, a = n._gsap, o, s, c;
		if (i === "all" || i === !0) r.cssText = "", s = 1;
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], Ir[o] && (s = 1, o = o === "transformOrigin" ? ii : Q), yi(n, o);
		s && (yi(n, Q), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", Ii(n, 1), a.uncache = 1, oi(r)));
	}
}, ki = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new X(e._pt, t, n, 0, 0, Oi);
		return a.u = r, a.pr = -10, a.tween = i, e._props.push(n), 1;
	}
} }, Ai = [
	1,
	0,
	0,
	1,
	0,
	0
], ji = {}, Mi = function(e) {
	return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, Ni = function(e) {
	var t = di(e, Q);
	return Mi(t) ? Ai : t.substr(7).match(Ee).map(U);
}, Pi = function(e, t) {
	var n = e._gsap || nt(e), r = e.style, i = Ni(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? Ai : i) : (i === Ai && !e.offsetParent && e !== Ar && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, Ar.appendChild(e)), i = Ni(e), s ? r.display = s : yi(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : Ar.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, Fi = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || Pi(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== Ai && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = _i(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[ii] = "0px 0px", a && (bi(a, o, "xOrigin", c, y), bi(a, o, "yOrigin", l, b), bi(a, o, "xOffset", u, o.xOffset), bi(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, Ii = function(e, t) {
	var n = e._gsap || new Vn(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = di(e, ii) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A, j, M, N, ee, te, ne, re, ie, ae, P;
	return n.svg = !!(e.getCTM && vi(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[Q] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[Q] === "none" ? "" : s[Q])), r.scale = r.rotate = r.translate = "none"), S = Pi(e, n.svg), n.svg && (n.uncache ? (N = e.getBBox(), c = n.xOrigin - N.x + "px " + (n.yOrigin - N.y) + "px", M = "") : M = !t && e.getAttribute("data-svg-origin"), Fi(e, M || c, !!M || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== Ai && (E = S[0], D = S[1], O = S[2], k = S[3], l = A = S[4], u = j = S[5], S.length === 6 ? (f = Math.sqrt(E * E + D * D), p = Math.sqrt(k * k + O * O), m = E || D ? zr(D, E) * Lr : 0, _ = O || k ? zr(O, k) * Lr + m : 0, _ && (p *= Math.abs(Math.cos(_ * Rr))), n.svg && (l -= b - (b * E + x * O), u -= x - (b * D + x * k))) : (P = S[6], ie = S[7], te = S[8], ne = S[9], re = S[10], ae = S[11], l = S[12], u = S[13], d = S[14], C = zr(P, re), h = C * Lr, C && (w = Math.cos(-C), T = Math.sin(-C), M = A * w + te * T, N = j * w + ne * T, ee = P * w + re * T, te = A * -T + te * w, ne = j * -T + ne * w, re = P * -T + re * w, ae = ie * -T + ae * w, A = M, j = N, P = ee), C = zr(-O, re), g = C * Lr, C && (w = Math.cos(-C), T = Math.sin(-C), M = E * w - te * T, N = D * w - ne * T, ee = O * w - re * T, ae = k * T + ae * w, E = M, D = N, O = ee), C = zr(D, E), m = C * Lr, C && (w = Math.cos(C), T = Math.sin(C), M = E * w + D * T, N = A * w + j * T, D = D * w - E * T, j = j * w - A * T, E = M, A = N), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = U(Math.sqrt(E * E + D * D + O * O)), p = U(Math.sqrt(j * j + P * P)), C = zr(A, j), _ = Math.abs(C) > 2e-4 ? C * Lr : 0, y = ae ? 1 / (ae < 0 ? -ae : ae) : 0), n.svg && (M = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !Mi(di(e, Q)), M && e.setAttribute("transform", M))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = U(f), n.scaleY = U(p), n.rotation = U(m) + o, n.rotationX = U(h) + o, n.rotationY = U(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[ii] = Li(c)), n.xOffset = n.yOffset = 0, n.force3D = se.force3D, n.renderTransform = n.svg ? Wi : li ? Ui : zi, n.uncache = 0, n;
}, Li = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, Ri = function(e, t, n) {
	var r = G(t);
	return U(parseFloat(t) + parseFloat(Ci(e, "x", n + "px", r))) + r;
}, zi = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, Ui(e, t);
}, Bi = "0deg", Vi = "0px", Hi = ") ", Ui = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== Bi || l !== Bi)) {
		var x = parseFloat(l) * Rr, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * Rr, w = Math.cos(x), a = Ri(_, a, S * w * -v), o = Ri(_, o, -Math.sin(x) * -v), s = Ri(_, s, C * w * -v + v);
	}
	h !== Vi && (y += "perspective(" + h + Hi), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== Vi || o !== Vi || s !== Vi) && (y += s !== Vi || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + Hi), c !== Bi && (y += "rotate(" + c + Hi), l !== Bi && (y += "rotateY(" + l + Hi), u !== Bi && (y += "rotateX(" + u + Hi), (d !== Bi || f !== Bi) && (y += "skew(" + d + ", " + f + Hi), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + Hi), _.style[Q] = y || "translate(0, 0)";
}, Wi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= Rr, c *= Rr, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= Rr, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = U(b), x = U(x), S = U(S), C = U(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = Ci(f, "x", a, "px"), y = Ci(f, "y", o, "px")), (p || m || h || g) && (v = U(v + p - (p * b + m * S) + h), y = U(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = U(v + r / 100 * w.width), y = U(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[Q] = w);
}, Gi = function(e, t, n, r, i) {
	var a = 360, o = R(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? Lr : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * Br) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * Br) % a - ~~(s / a) * a)), e._pt = u = new X(e._pt, t, n, r, s, Kr), u.e = c, u.u = "deg", e._props.push(n), u;
}, Ki = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, qi = function(e, t, n) {
	var r = Ki({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[Q] = t, o = Ii(n, 1), yi(n, Q), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[Q], a[Q] = t, o = Ii(n, 1), a[Q] = c), Ir) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = G(c), p = G(l), u = f === p ? parseFloat(c) : Ci(n, s, c, p), d = parseFloat(l), e._pt = new X(e._pt, o, s, u, d - u, Gr), e._pt.u = p || 0, e._props.push(s));
	Ki(o, r);
};
it("padding,margin,Width,Radius", function(e, t) {
	var n = "Top", r = "Right", i = "Bottom", a = "Left", o = (t < 3 ? [
		n,
		r,
		i,
		a
	] : [
		n + a,
		n + r,
		i + r,
		i + a
	]).map(function(n) {
		return t < 2 ? e + n : "border" + n + e;
	});
	ki[t > 1 ? "border" + e : e] = function(e, t, n, r, i) {
		var a, s;
		if (arguments.length < 4) return a = o.map(function(t) {
			return wi(e, t, n);
		}), s = a.join(" "), s.split(a[0]).length === 5 ? a[0] : s;
		a = (r + "").split(" "), s = {}, o.forEach(function(e, t) {
			return s[e] = a[t] = a[t] || a[(t - 1) / 2 | 0];
		}), e.init(t, s, i);
	};
});
var Ji = {
	name: "css",
	register: mi,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w;
		for (m in jr || mi(), this.styles = this.styles || ci(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(Xe[m] && Kn(m, t, n, r, e, i)))) {
			if (f = typeof l, p = ki[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = un(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", wn.lastIndex = 0, wn.test(c) || (h = G(c), g = G(l), g ? h !== g && (c = Ci(e, m, c, g) + g) : h && (l += h)), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], R(c) && ~c.indexOf("random(") && (c = un(c)), G(c + "") || c === "auto" || (c += se.units[m] || G(wi(e, m)) || ""), (c + "").charAt(1) === "=" && (c = wi(e, m))) : c = wi(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in Wr && (m === "autoAlpha" && (d === 1 && wi(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), bi(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = Wr[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in Ir, v) {
					if (this.styles.save(m), w = l, f === "string" && l.substring(0, 6) === "var(--") {
						if (l = di(e, l.substring(4, l.indexOf(")"))), l.substring(0, 5) === "calc(") {
							var T = e.style.perspective;
							e.style.perspective = l, l = di(e, "perspective"), T ? e.style.perspective = T : yi(e, "perspective");
						}
						u = parseFloat(l);
					}
					if (y || (b = e._gsap, b.renderTransform && !t.parseTransform || Ii(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new X(this._pt, o, Q, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new X(this._pt, b, "scaleY", b.scaleY, (_ ? at(b.scaleY, _ + u) : u) - b.scaleY || 0, Gr), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(ii, 0, o[ii]), l = Di(l), b.svg ? Fi(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && bi(this, b, "zOrigin", b.zOrigin, g), bi(this, o, m, Li(c), Li(l)));
						continue;
					} else if (m === "svgOrigin") {
						Fi(e, l, 1, x, 0, this);
						continue;
					} else if (m in ji) {
						Gi(this, b, m, d, _ ? at(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						bi(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						qi(this, l, e);
						continue;
					}
				} else m in o || (m = pi(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !Ur.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = G(l) || (m in se.units ? se.units[m] : h), h !== g && (d = Ci(e, m, c, g)), this._pt = new X(this._pt, v ? b : o, m, d, (_ ? at(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? Yr : Gr), this._pt.u = g || 0, v && w !== l ? (this._pt.b = c, this._pt.e = w, this._pt.r = Jr) : h !== g && g !== "%" && (this._pt.b = c, this._pt.r = qr);
				else if (m in o) Ti.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					ze(m, l);
					continue;
				}
				v || (m in o ? C.push(m, 0, o[m]) : typeof e[m] == "function" ? C.push(m, 2, e[m]()) : C.push(m, 1, c || e[m])), a.push(m);
			}
		}
		S && mr(this);
	},
	render: function(e, t) {
		if (t.tween._time || !Pr()) for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
		else t.styles.revert();
	},
	get: wi,
	aliases: Wr,
	getSetter: function(e, t, n) {
		var r = Wr[t];
		return r && r.indexOf(",") < 0 && (t = r), t in Ir && t !== ii && (e._gsap.x || wi(e, "x")) ? n && Nr === n ? t === "scale" ? ti : ei : (Nr = n || {}) && (t === "scale" ? ni : ri) : e.style && !ve(e.style[t]) ? Qr : ~t.indexOf("-") ? $r : or(e, t);
	},
	core: {
		_removeProperty: yi,
		_getMatrix: Pi
	}
};
Z.utils.checkPrefix = pi, Z.core.getStyleSaver = ci, (function(e, t, n, r) {
	var i = it(e + "," + t + "," + n, function(e) {
		Ir[e] = 1;
	});
	it(t, function(e) {
		se.units[e] = "deg", ji[e] = 1;
	}), Wr[i[13]] = e + "," + t, it(r, function(e) {
		var t = e.split(":");
		Wr[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), it("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	se.units[e] = "px";
}), Z.registerPlugin(Ji);
//#endregion
//#region node_modules/gsap/index.js
var Yi = Z.registerPlugin(Ji) || Z;
Yi.core.Tween;
//#endregion
//#region src/story-engine/utils/animationEngine.ts
var Xi = [
	{
		id: "fade",
		name: "تلاشي (Fade In)",
		type: "builtin"
	},
	{
		id: "zoom",
		name: "تكبير (Zoom In)",
		type: "builtin"
	},
	{
		id: "slide-left",
		name: "انزلاق لليسار (Slide Left)",
		type: "builtin"
	},
	{
		id: "slide-right",
		name: "انزلاق لليمين (Slide Right)",
		type: "builtin"
	},
	{
		id: "slide-up",
		name: "انزلاق للأعلى (Slide Up)",
		type: "builtin"
	},
	{
		id: "slide-down",
		name: "انزلاق للأسفل (Slide Down)",
		type: "builtin"
	},
	{
		id: "rotate",
		name: "دوران (Rotate In)",
		type: "builtin"
	},
	{
		id: "bounce",
		name: "ارتداد (Bounce In)",
		type: "builtin"
	},
	{
		id: "flip",
		name: "انقلاب ثلاثي الأبعاد (Flip In)",
		type: "builtin"
	}
], Zi = (e, t, n, r) => {
	if (!e) return null;
	let i = typeof e.setAttrs == "function", a = n.duration, o = n.delay, s = n.repeat, c = n.ease || "power1.out", l = {}, u = {
		duration: a,
		delay: o,
		repeat: s,
		ease: c
	}, d = t.id;
	if (t.type === "builtin") switch (d) {
		case "fade":
			l = { opacity: 0 }, u = {
				...u,
				opacity: 1
			};
			break;
		case "zoom":
			l = i ? {
				scaleX: 0,
				scaleY: 0,
				opacity: 0
			} : {
				scale: 0,
				opacity: 0
			}, u = i ? {
				...u,
				scaleX: 1,
				scaleY: 1,
				opacity: 1
			} : {
				...u,
				scale: 1,
				opacity: 1
			};
			break;
		case "slide-left":
			l = i ? {
				x: e.x() - 300,
				opacity: 0
			} : {
				x: -300,
				opacity: 0
			}, u = i ? {
				...u,
				x: e.x(),
				opacity: 1
			} : {
				...u,
				x: 0,
				opacity: 1
			};
			break;
		case "slide-right":
			l = i ? {
				x: e.x() + 300,
				opacity: 0
			} : {
				x: 300,
				opacity: 0
			}, u = i ? {
				...u,
				x: e.x(),
				opacity: 1
			} : {
				...u,
				x: 0,
				opacity: 1
			};
			break;
		case "slide-up":
			l = i ? {
				y: e.y() + 300,
				opacity: 0
			} : {
				y: 300,
				opacity: 0
			}, u = i ? {
				...u,
				y: e.y(),
				opacity: 1
			} : {
				...u,
				y: 0,
				opacity: 1
			};
			break;
		case "slide-down":
			l = i ? {
				y: e.y() - 300,
				opacity: 0
			} : {
				y: -300,
				opacity: 0
			}, u = i ? {
				...u,
				y: e.y(),
				opacity: 1
			} : {
				...u,
				y: 0,
				opacity: 1
			};
			break;
		case "rotate":
			l = i ? {
				rotation: e.rotation() - 180,
				opacity: 0
			} : {
				rotate: -180,
				opacity: 0
			}, u = i ? {
				...u,
				rotation: e.rotation(),
				opacity: 1
			} : {
				...u,
				rotate: 0,
				opacity: 1
			};
			break;
		case "bounce":
			l = i ? { y: e.y() - 150 } : { y: -150 }, u = i ? {
				...u,
				y: e.y(),
				ease: "bounce.out"
			} : {
				...u,
				y: 0,
				ease: "bounce.out"
			};
			break;
		case "flip":
			l = i ? {
				rotationY: -180,
				opacity: 0
			} : {
				transformPerspective: 600,
				rotateY: -180,
				opacity: 0
			}, u = i ? {
				...u,
				rotationY: 0,
				opacity: 1
			} : {
				...u,
				rotateY: 0,
				opacity: 1
			};
			break;
		default: return null;
	}
	else if (t.type === "custom" && t.keyframes) {
		let n = t.keyframes.map((t) => {
			let n = {};
			return t.opacity !== void 0 && (n.opacity = t.opacity), t.rotation !== void 0 && (n.rotation = i ? e.rotation() + t.rotation : t.rotation), i ? (t.x !== void 0 && (n.x = e.x() + t.x), t.y !== void 0 && (n.y = e.y() + t.y), t.scaleX !== void 0 && (n.scaleX = t.scaleX), t.scaleY !== void 0 && (n.scaleY = t.scaleY)) : (t.x !== void 0 && (n.x = t.x), t.y !== void 0 && (n.y = t.y), (t.scaleX !== void 0 || t.scaleY !== void 0) && (n.scaleX = t.scaleX ?? 1, n.scaleY = t.scaleY ?? 1)), n;
		});
		u.keyframes = n;
	}
	if (i) {
		let t = e.x(), i = e.y(), a = e.rotation(), o = e.scaleX(), s = e.scaleY(), c = e.opacity(), d = {
			x: l.x === void 0 ? t : l.x,
			y: l.y === void 0 ? i : l.y,
			rotation: l.rotation === void 0 ? a : l.rotation,
			scaleX: l.scaleX === void 0 ? o : l.scaleX,
			scaleY: l.scaleY === void 0 ? s : l.scaleY,
			opacity: l.opacity === void 0 ? c : l.opacity
		};
		e.setAttrs(d), e.getLayer()?.batchDraw();
		let f = Yi.to(d, {
			...u,
			onUpdate: () => {
				e.setAttrs(d), e.getLayer()?.batchDraw();
			},
			onComplete: () => {
				e.setAttrs({
					x: t,
					y: i,
					rotation: a,
					scaleX: o,
					scaleY: s,
					opacity: c
				}), e.getLayer()?.batchDraw();
			}
		});
		return r ? (r.add(f, n.startTime), r) : f;
	}
	if (r) {
		if (t.type === "builtin") r.fromTo(e, l, u, n.startTime);
		else {
			let i = t.keyframes?.[0], a = {};
			i && (i.opacity !== void 0 && (a.opacity = i.opacity), i.rotation !== void 0 && (a.rotation = i.rotation), i.x !== void 0 && (a.x = i.x), i.y !== void 0 && (a.y = i.y), i.scaleX !== void 0 && (a.scaleX = i.scaleX, a.scaleY = i.scaleY ?? i.scaleX)), r.set(e, a, n.startTime), r.to(e, u, n.startTime);
		}
		return r;
	}
	if (t.type === "builtin") return Yi.set(e, l), Yi.to(e, u);
	{
		let n = t.keyframes?.[0], r = {};
		return n && (n.opacity !== void 0 && (r.opacity = n.opacity), n.rotation !== void 0 && (r.rotation = n.rotation), n.x !== void 0 && (r.x = n.x), n.y !== void 0 && (r.y = n.y), n.scaleX !== void 0 && (r.scaleX = n.scaleX, r.scaleY = n.scaleY ?? n.scaleX)), Yi.set(e, r), Yi.to(e, u);
	}
}, Qi = (e) => {
	if (!e || [
		"sans-serif",
		"serif",
		"monospace",
		"arial",
		"calibri",
		"tahoma",
		"times new roman",
		"helvetica"
	].includes(e.toLowerCase())) return;
	let t = e.trim(), n = `google-font-${t.toLowerCase().replace(/\s+/g, "-")}`;
	if (!document.getElementById(n)) try {
		let e = document.createElement("link");
		e.id = n, e.rel = "stylesheet", e.href = `https://fonts.googleapis.com/css2?family=${t.replace(/\s+/g, "+")}:wght@400;700&display=swap`, document.head.appendChild(e);
	} catch (e) {
		console.warn(`Failed to dynamically inject Google Font link for ${t}:`, e);
	}
}, $i = /* @__PURE__ */ u(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), ea = /* @__PURE__ */ u(((e) => {
	process.env.NODE_ENV !== "production" && (function() {
		function t(e) {
			if (e == null) return null;
			if (typeof e == "function") return e.$$typeof === k ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case v: return "Fragment";
				case b: return "Profiler";
				case y: return "StrictMode";
				case w: return "Suspense";
				case T: return "SuspenseList";
				case O: return "Activity";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case _: return "Portal";
				case S: return e.displayName || "Context";
				case x: return (e._context.displayName || "Context") + ".Consumer";
				case C:
					var n = e.render;
					return e = e.displayName, e ||= (e = n.displayName || n.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case E: return n = e.displayName || null, n === null ? t(e.type) || "Memo" : n;
				case D:
					n = e._payload, e = e._init;
					try {
						return t(e(n));
					} catch {}
			}
			return null;
		}
		function n(e) {
			return "" + e;
		}
		function r(e) {
			try {
				n(e);
				var t = !1;
			} catch {
				t = !0;
			}
			if (t) {
				t = console;
				var r = t.error, i = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
				return r.call(t, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", i), n(e);
			}
		}
		function i(e) {
			if (e === v) return "<>";
			if (typeof e == "object" && e && e.$$typeof === D) return "<...>";
			try {
				var n = t(e);
				return n ? "<" + n + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function a() {
			var e = A.A;
			return e === null ? null : e.getOwner();
		}
		function o() {
			return Error("react-stack-top-frame");
		}
		function s(e) {
			if (j.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function c(e, t) {
			function n() {
				ee || (ee = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function l() {
			var e = t(this.type);
			return te[e] || (te[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function u(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: g,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: l
			}), e._store = {}, Object.defineProperty(e._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			}), Object.defineProperty(e, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			}), Object.defineProperty(e, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: i
			}), Object.defineProperty(e, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: a
			}), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
		}
		function f(e, n, i, o, l, d) {
			var f = n.children;
			if (f !== void 0) if (o) if (M(f)) {
				for (o = 0; o < f.length; o++) p(f[o]);
				Object.freeze && Object.freeze(f);
			} else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
			else p(f);
			if (j.call(n, "key")) {
				f = t(e);
				var m = Object.keys(n).filter(function(e) {
					return e !== "key";
				});
				o = 0 < m.length ? "{key: someKey, " + m.join(": ..., ") + ": ...}" : "{key: someKey}", ie[f + o] || (m = 0 < m.length ? "{" + m.join(": ..., ") + ": ...}" : "{}", console.error("A props object containing a \"key\" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />", o, f, m, f), ie[f + o] = !0);
			}
			if (f = null, i !== void 0 && (r(i), f = "" + i), s(n) && (r(n.key), f = "" + n.key), "key" in n) for (var h in i = {}, n) h !== "key" && (i[h] = n[h]);
			else i = n;
			return f && c(i, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), u(e, f, i, a(), l, d);
		}
		function p(e) {
			m(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === D && (e._payload.status === "fulfilled" ? m(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function m(e) {
			return typeof e == "object" && !!e && e.$$typeof === g;
		}
		var h = d("react"), g = Symbol.for("react.transitional.element"), _ = Symbol.for("react.portal"), v = Symbol.for("react.fragment"), y = Symbol.for("react.strict_mode"), b = Symbol.for("react.profiler"), x = Symbol.for("react.consumer"), S = Symbol.for("react.context"), C = Symbol.for("react.forward_ref"), w = Symbol.for("react.suspense"), T = Symbol.for("react.suspense_list"), E = Symbol.for("react.memo"), D = Symbol.for("react.lazy"), O = Symbol.for("react.activity"), k = Symbol.for("react.client.reference"), A = h.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, j = Object.prototype.hasOwnProperty, M = Array.isArray, N = console.createTask ? console.createTask : function() {
			return null;
		};
		h = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var ee, te = {}, ne = h.react_stack_bottom_frame.bind(h, o)(), re = N(i(o)), ie = {};
		e.Fragment = v, e.jsx = function(e, t, n) {
			var r = 1e4 > A.recentlyCreatedOwnerStacks++;
			return f(e, t, n, !1, r ? Error("react-stack-top-frame") : ne, r ? N(i(e)) : re);
		}, e.jsxs = function(e, t, n) {
			var r = 1e4 > A.recentlyCreatedOwnerStacks++;
			return f(e, t, n, !0, r ? Error("react-stack-top-frame") : ne, r ? N(i(e)) : re);
		};
	})();
})), $ = (/* @__PURE__ */ u(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? $i() : ea();
})))(), ta = ({ story: e, onClose: t = () => {}, initialSlideId: n = null }) => {
	let r = n ? e.slides.findIndex((e) => e.id === n) : 0, [i, o] = l(r >= 0 ? r : 0), [u, d] = l(!1), [p, m] = l(!1), [h, g] = l(1), _ = c(null), v = c(null), y = c(null), b = c(null), x = c(null), S = 1200, A = e.slides[i], j = a(() => {
		if (!_.current) return;
		let e = _.current.clientWidth, t = _.current.clientHeight, n = e / S, r = t / 675;
		g(Math.min(n, r));
	}, []);
	s(() => {
		j(), window.addEventListener("resize", j);
		let e = setTimeout(j, 100);
		return () => {
			window.removeEventListener("resize", j), clearTimeout(e);
		};
	}, [j]);
	let M = a(() => {
		i < e.slides.length - 1 ? o((e) => e + 1) : d(!1);
	}, [i, e.slides.length]), N = a(() => {
		i > 0 && o((e) => e - 1);
	}, [i]);
	s(() => {
		let t = (t) => {
			t.key === "ArrowRight" ? e.direction === "rtl" ? N() : M() : t.key === "ArrowLeft" ? e.direction === "rtl" ? M() : N() : t.key === "Space" || t.code === "Space" ? (t.preventDefault(), M()) : t.key === "Escape" && p && m(!1);
		};
		return window.addEventListener("keydown", t), () => window.removeEventListener("keydown", t);
	}, [
		M,
		N,
		p,
		e.direction
	]), s(() => {
		y.current &&= (y.current.pause(), y.current.src = "", null);
		let t = e.slides[i];
		if (t && t.audio) {
			let e = new Audio(t.audio.src);
			y.current = e, u && e.play().catch((e) => {
				console.warn("Playback of slide narration blocked:", e);
			});
		}
		return () => {
			y.current && (y.current.pause(), y.current.src = "");
		};
	}, [
		i,
		e.slides,
		u
	]), s(() => {
		if (!u) {
			v.current &&= (clearTimeout(v.current), null);
			return;
		}
		let t = e.slides[i];
		if (t) {
			let n = t.audio?.duration || 0, r = t.duration === void 0 ? 4 : t.duration, a = 4;
			a = t.audio ? Math.max(4, n) : r, t.duration !== void 0 && (a = Math.max(a, t.duration));
			let o = a * 1e3;
			v.current = setTimeout(() => {
				i < e.slides.length - 1 ? M() : d(!1);
			}, o);
		}
		return () => {
			v.current && clearTimeout(v.current);
		};
	}, [
		u,
		i,
		e.slides,
		M
	]), s(() => {
		x.current &&= (x.current.kill(), null);
		let t = e.slides[i];
		if (t) {
			t.elements.forEach((e) => {
				e.type === "text" && Qi(e.fontFamily);
			});
			let e = ae.getState().customPresets || [], n = setTimeout(() => {
				let n = Yi.timeline();
				x.current = n, t.elements.forEach((t) => {
					if (t.animation) {
						let r = document.getElementById(`player-el-${t.id}`);
						if (r) {
							let i = Xi.find((e) => e.id === t.animation?.presetId) || e.find((e) => e.id === t.animation?.presetId);
							i && Zi(r, i, {
								startTime: t.animation.startTime,
								duration: t.animation.duration,
								delay: t.animation.delay,
								repeat: t.animation.repeat,
								ease: t.animation.ease
							}, n);
						}
					}
				});
			}, 50);
			return () => {
				clearTimeout(n);
			};
		}
	}, [i, e.slides]);
	let ee = () => {
		_.current && (document.fullscreenElement ? document.exitFullscreen().then(() => {
			m(!1), setTimeout(j, 100);
		}) : _.current.requestFullscreen().then(() => {
			m(!0), setTimeout(j, 100);
		}).catch((e) => {
			console.error("Error entering fullscreen:", e);
		}));
	};
	s(() => {
		let e = () => {
			m(!!document.fullscreenElement), setTimeout(j, 150);
		};
		return document.addEventListener("fullscreenchange", e), () => document.removeEventListener("fullscreenchange", e);
	}, [j]);
	let te = (e) => {
		b.current = e.touches[0].clientX;
	}, ne = (t) => {
		if (b.current === null) return;
		let n = t.changedTouches[0].clientX, r = b.current - n;
		Math.abs(r) > 50 && (r > 0 ? e.direction === "rtl" ? N() : M() : e.direction === "rtl" ? M() : N()), b.current = null;
	}, re = (e) => e.type === "color" ? { backgroundColor: e.value } : e.type === "gradient" ? { background: e.value } : e.type === "image" ? {
		backgroundImage: `url(${e.value})`,
		backgroundSize: "cover",
		backgroundPosition: "center"
	} : {}, ie = (e) => {
		if (e.hidden) return null;
		let t = {
			position: "absolute",
			left: e.x,
			top: e.y,
			width: e.width,
			height: e.type === "text" ? "auto" : e.height,
			transform: `rotate(${e.rotation || 0}deg)`,
			opacity: e.opacity,
			zIndex: e.zIndex
		};
		if (e.type === "text") {
			let n = e;
			return /* @__PURE__ */ (0, $.jsx)("div", {
				id: `player-el-${e.id}`,
				style: {
					...t,
					fontFamily: n.fontFamily,
					fontSize: `${n.fontSize}px`,
					color: n.color,
					fontWeight: n.bold ? "bold" : "normal",
					fontStyle: n.italic ? "italic" : "normal",
					textDecoration: n.underline ? "underline" : "none",
					textAlign: n.align,
					direction: n.dir,
					lineHeight: n.lineHeight || 1.25,
					whiteSpace: "pre-wrap",
					wordBreak: "normal",
					overflowWrap: "break-word"
				},
				children: n.text
			}, e.id);
		}
		if (e.type === "image") {
			let n = e;
			return /* @__PURE__ */ (0, $.jsx)("img", {
				id: `player-el-${e.id}`,
				src: n.src,
				alt: "",
				style: {
					...t,
					objectFit: "fill"
				}
			}, e.id);
		}
		return null;
	};
	if (!A) return /* @__PURE__ */ (0, $.jsx)("div", {
		className: f.noSlides,
		children: "لا توجد شرائح في هذه القصة."
	});
	let P = e.direction === "rtl";
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		ref: _,
		className: `${f.playerContainer} ${p ? f.fullscreen : ""}`,
		onTouchStart: te,
		onTouchEnd: ne,
		children: [
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: f.topControlBar,
				children: [/* @__PURE__ */ (0, $.jsx)("div", {
					className: f.storyTitle,
					children: e.title
				}), /* @__PURE__ */ (0, $.jsxs)("div", {
					className: f.actions,
					children: [
						/* @__PURE__ */ (0, $.jsx)("button", {
							className: f.controlButton,
							onClick: () => d(!u),
							children: u ? /* @__PURE__ */ (0, $.jsx)(D, { size: 18 }) : /* @__PURE__ */ (0, $.jsx)(O, { size: 18 })
						}),
						/* @__PURE__ */ (0, $.jsx)("button", {
							className: f.controlButton,
							onClick: ee,
							children: p ? /* @__PURE__ */ (0, $.jsx)(E, { size: 18 }) : /* @__PURE__ */ (0, $.jsx)(T, { size: 18 })
						}),
						t && /* @__PURE__ */ (0, $.jsx)("button", {
							className: `${f.controlButton} ${f.closeButton}`,
							onClick: t,
							children: /* @__PURE__ */ (0, $.jsx)(k, { size: 18 })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, $.jsx)("div", {
				className: f.stageViewport,
				children: /* @__PURE__ */ (0, $.jsx)("div", {
					className: f.slideStage,
					style: {
						width: S,
						height: 675,
						transform: `scale(${h})`,
						...re(A.background)
					},
					children: A.elements.sort((e, t) => e.zIndex - t.zIndex).map(ie)
				})
			}),
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: f.bottomControlBar,
				children: [
					/* @__PURE__ */ (0, $.jsx)("button", {
						className: f.navButton,
						onClick: P ? M : N,
						disabled: P ? i === e.slides.length - 1 : i === 0,
						children: /* @__PURE__ */ (0, $.jsx)(C, { size: 24 })
					}),
					/* @__PURE__ */ (0, $.jsxs)("span", {
						className: f.slideCounter,
						children: [
							i + 1,
							" / ",
							e.slides.length
						]
					}),
					/* @__PURE__ */ (0, $.jsx)("button", {
						className: f.navButton,
						onClick: P ? N : M,
						disabled: P ? i === 0 : i === e.slides.length - 1,
						children: /* @__PURE__ */ (0, $.jsx)(w, { size: 24 })
					})
				]
			}),
			/* @__PURE__ */ (0, $.jsx)("div", {
				className: f.progressBarBg,
				children: /* @__PURE__ */ (0, $.jsx)("div", {
					className: f.progressBarFill,
					style: { width: `${(i + 1) / e.slides.length * 100}%` }
				})
			})
		]
	});
};
//#endregion
//#region src/story-player-standalone.tsx
window.renderStoryPlayer = (t, n, r) => {
	let i = document.getElementById(t);
	if (!i) return console.error(`Container element with ID "${t}" not found.`), null;
	let a = e(i);
	return a.render(/* @__PURE__ */ (0, $.jsx)("div", {
		style: {
			width: "100%",
			height: "100%",
			position: "relative"
		},
		children: /* @__PURE__ */ (0, $.jsx)(ta, {
			story: n,
			onClose: r?.onClose
		})
	})), { destroy: () => {
		a.unmount();
	} };
};
//#endregion
export { ta as StoryPlayer };
