parcelRequire=function(e){var r="function"==typeof parcelRequire&&parcelRequire,n="function"==typeof require&&require,i={};function u(e,u){if(e in i)return i[e];var t="function"==typeof parcelRequire&&parcelRequire;if(!u&&t)return t(e,!0);if(r)return r(e,!0);if(n&&"string"==typeof e)return n(e);var o=new Error("Cannot find module '"+e+"'");throw o.code="MODULE_NOT_FOUND",o}return u.register=function(e,r){i[e]=r},i=e(u),u.modules=i,u}(function (require) {var c={};function k(e){for(var r,a=/\+/g,$=/([^&=]+)=?([^&]*)/g,o=function(e){return decodeURIComponent(e.replace(a," "))},p={};r=$.exec(e);)p[o(r[1])]=o(r[2]);return p}Object.defineProperty(c,"__esModule",{value:!0});var m=k;function l(e){var r=[];for(var a in e)e.hasOwnProperty(a)&&r.push(encodeURIComponent(a)+"="+encodeURIComponent(e[a]));return r.join("&")}c.deparam=m;var g=l;c.param=g;var d={};Object.defineProperty(d,"__esModule",{value:!0});var a=document.currentScript;void 0===a&&(a=document.querySelector("script[src^=\"https://imodeljs.github.io/iModelJs-docs-output/scripts/utterances/client.js\"],script[src^=\"http://builds.bentley.com/prgbuilds/AzureBuilds/iModelJsDocs/public/scripts/utterances/client.js\"],script[src^=\"http://localhost:8081/scripts/utterances/client.js\"],script[src^=\"http://localhost:4000/client.js\"]"));for(var b={},e=0;e<a.attributes.length;e++){var j=a.attributes.item(e);b[j.name]=j.value}var i=document.querySelector("link[rel='canonical']");b.url=i?i.href:location.origin+location.pathname+location.search,b.origin=location.origin,b.pathname=location.pathname.substr(1).replace(/\.\w+$/,""),b.title=document.title;var f=document.querySelector("meta[name='description']");b.description=f?f.content:"";var h=document.querySelector("meta[property='og:title'],meta[name='og:title']");b["og:title"]=h?h.content:"",document.head.insertAdjacentHTML("afterbegin","<style>\n    .utterances {\n      position: relative;\n      box-sizing: border-box;\n      width: 100%;\n      max-width: 760px;\n      margin-left: auto;\n      margin-right: auto;\n    }\n    .utterances-frame {\n      position: absolute;\n      left: 0;\n      right: 0;\n      width: 1px;\n      min-width: 100%;\n      max-width: 100%;\n      height: 100%;\n      border: 0;\n    }\n  </style>");var n=a.src.match(/^https:\/\/imodeljs\.github\.io\/iModelJs-docs-output|http:\/\/builds\.bentley\.com\/prgbuilds\/AzureBuilds\/iModelJsDocs\/builds\/\d+|http:\/\/builds\.bentley\.com\/prgbuilds\/AzureBuilds\/iModelJsDocs\/public|http:\/\/localhost:\d+/)[0],o=a.src.match(/^https:\/\/imodeljs\.github\.io|http:\/\/builds\.bentley\.com|http:\/\/localhost:\d+/)[0],p=n+"/scripts/utterances/utterances.html";a.insertAdjacentHTML("afterend","<div class=\"utterances\">\n    <iframe class=\"utterances-frame\" title=\"Comments\" scrolling=\"no\" src=\""+p+"?"+g(b)+"\"></iframe>\n  </div>");var q=a.nextElementSibling;a.parentElement.removeChild(a),addEventListener("message",function(t){if(t.origin===o){var r=t.data;r&&"resize"===r.type&&r.height&&(q.style.height=r.height+"px")}});if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=d}else if(typeof define==="function"&&define.amd){define(function(){return d})}return{"D53L":d,"ieWq":c};});