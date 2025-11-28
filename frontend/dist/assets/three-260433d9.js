import{r as y,c as x}from"./vendor-cd5a2cc5.js";var j={exports:{}},d={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var D=y,V=Symbol.for("react.element"),k=Symbol.for("react.fragment"),I=Object.prototype.hasOwnProperty,L=D.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,P={key:!0,ref:!0,__self:!0,__source:!0};function O(r,e,o){var u,t={},n=null,a=null;o!==void 0&&(n=""+o),e.key!==void 0&&(n=""+e.key),e.ref!==void 0&&(a=e.ref);for(u in e)I.call(e,u)&&!P.hasOwnProperty(u)&&(t[u]=e[u]);if(r&&r.defaultProps)for(u in e=r.defaultProps,e)t[u]===void 0&&(t[u]=e[u]);return{$$typeof:V,type:r,key:n,ref:a,props:t,_owner:L.current}}d.Fragment=k;d.jsx=O;d.jsxs=O;j.exports=d;var ee=j.exports,b={},h=x;b.createRoot=h.createRoot,b.hydrateRoot=h.hydrateRoot;var $={exports:{}},w={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var i=y;function g(r,e){return r===e&&(r!==0||1/r===1/e)||r!==r&&e!==e}var z=typeof Object.is=="function"?Object.is:g,C=i.useState,M=i.useEffect,N=i.useLayoutEffect,T=i.useDebugValue;function U(r,e){var o=e(),u=C({inst:{value:o,getSnapshot:e}}),t=u[0].inst,n=u[1];return N(function(){t.value=o,t.getSnapshot=e,p(t)&&n({inst:t})},[r,o,e]),M(function(){return p(t)&&n({inst:t}),r(function(){p(t)&&n({inst:t})})},[r]),T(o),o}function p(r){var e=r.getSnapshot;r=r.value;try{var o=e();return!z(r,o)}catch{return!0}}function F(r,e){return e()}var G=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?F:U;w.useSyncExternalStore=i.useSyncExternalStore!==void 0?i.useSyncExternalStore:G;$.exports=w;var W=$.exports,A={};/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var m=y,B=W;function J(r,e){return r===e&&(r!==0||1/r===1/e)||r!==r&&e!==e}var Y=typeof Object.is=="function"?Object.is:J,H=B.useSyncExternalStore,K=m.useRef,Q=m.useEffect,X=m.useMemo,Z=m.useDebugValue;A.useSyncExternalStoreWithSelector=function(r,e,o,u,t){var n=K(null);if(n.current===null){var a={hasValue:!1,value:null};n.current=a}else a=n.current;n=X(function(){function E(f){if(!_){if(_=!0,l=f,f=u(f),t!==void 0&&a.hasValue){var c=a.value;if(t(c,f))return v=c}return v=f}if(c=v,Y(l,f))return c;var R=u(f);return t!==void 0&&t(c,R)?(l=f,c):(l=f,v=R)}var _=!1,l,v,S=o===void 0?null:o;return[function(){return E(e())},S===null?void 0:function(){return E(S())}]},[e,o,u,t]);var s=H(r,n[0],n[1]);return Q(function(){a.hasValue=!0,a.value=s},[s]),Z(s),s};export{b as c,ee as j};
//# sourceMappingURL=three-260433d9.js.map
