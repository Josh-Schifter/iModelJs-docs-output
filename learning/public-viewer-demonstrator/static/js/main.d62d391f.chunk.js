(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{334:function(e,t,o){},336:function(e,t,o){o(337),e.exports=o(341)},341:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(2),i=o(66),s=o(346),a=o(3),l=o(779);o(792),s.SimpleViewerApp.startup();s.SimpleViewerApp.viewManager.onViewOpen.addListener(async e=>{if(!e.view.is3d())return;e.view.viewFlags.renderMode=6;const t=a.ColorDef.from(166,221,255);e.view.displayStyle.backgroundColor.setFrom(t),e.view.viewFlags.constructions=!1,e.resetUndo();const o=await e.iModel.executeQuery("SELECT ECInstanceId as id, CodeValue as code, UserLabel as label FROM BisCore.SpatialCategory");for(let n=0;n<o.length;++n)"S-SLAB-CONC"===(o[n].label?o[n].label:o[n].code)&&e.view.changeCategoryDisplay(o[n].id,!1)}),s.SimpleViewerApp.ready.then(e=>{i.render(n.createElement(l.default,{rpcConfig:e}),document.getElementById("root"))})},346:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(56),i=o(93),s=o(44),a=o(168),l=o(776),c=o(777);l.default();const r=c.default();t.SimpleViewerApp=class SimpleViewerApp extends n.IModelApp{static get ready(){return this._isReady}static onStartup(){const e=new Array;e.push(n.IModelApp.i18n.registerNamespace("SimpleViewer").readFinished),e.push(s.UiCore.initialize(this.i18n)),e.push(a.UiComponents.initialize(this.i18n)),i.Presentation.initialize({activeLocale:n.IModelApp.i18n.languageList()[0]}),this._isReady=Promise.all(e).then(()=>r)}}},378:function(e,t){},380:function(e,t){},776:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(0);t.default=function(){n.Logger.initialize((e,t,o)=>console.log("Error: "+t+(o?" "+JSON.stringify(o()):"")),(e,t,o)=>console.log("Warning: "+t+(o?" "+JSON.stringify(o()):"")),(e,t,o)=>console.log("Info: "+t+(o?" "+JSON.stringify(o()):"")))}},777:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(3),i=o(778);t.default=function(){const e=i.default();let t;const o={info:{title:"navigator-backend",version:"v1.0"},uriPrefix:"https://connect-imodelsf.bentley.com/iModelJSOrchestrator/iModelRouterService/"};if(t=n.BentleyCloudRpcManager.initializeClient(o,e),void 0===o.uriPrefix||!o.uriPrefix.includes("connect-imodelsf.bentley.com"))for(const i of t.interfaces())n.RpcOperation.forEach(i,e=>e.policy.token=(e=>new n.IModelToken("test","test","test","test")));return t}},778:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(3),i=o(37);t.default=function(){return[n.IModelReadRpcInterface,n.StandaloneIModelRpcInterface,n.IModelTileRpcInterface,i.PresentationRpcInterface]}},779:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(2),i=o(56),s=o(276),a=o(93),l=o(780);o(788),o(790);const c=o(46),r=o(3),d={imodel:void 0,viewDefinitionId:void 0,accessToken:void 0};t.default=class App extends n.Component{constructor(e,t){super(e,t),this.state=d,this._rpcConfiguration=this.props.rpcConfig}componentDidMount(){a.Presentation.selection.selectionChange.addListener(this.onSelectionChanged),(async()=>{let e;try{const t="97a67f36-8efa-499c-a6ed-a8e07f38a410",o="998b4696-a672-4f85-bea1-8e35e0852452",n="93b6c5340d2cc99534afeb97d03227ce75c7734a",a=()=>fetch("https://connect-imodelsf.bentley.com/iModelJSOrchestrator/iModelRouterService/proxyrequest").then(e=>e.text()).catch(e=>{console.warn(e)}),l="Token "+await a(),u=c.AccessToken.fromTokenString(l),p=r.IModelVersion.asOfChangeSet(n);this._rpcConfiguration.applicationAuthorizationValue=u.toTokenString(),s.RealityModelTileClient.setToken(u),e=await i.IModelConnection.open(u,o,t,1,p),this.setState({imodel:e,accessToken:u})}catch(e){this.setState(d)}this.onIModelSelected(e)})()}componentWillUnmount(){a.Presentation.selection.selectionChange.removeListener(this.onSelectionChanged)}onSelectionChanged(e,t){const o=t.getSelection(e.imodel,e.level);o.isEmpty?console.log("========== Selection cleared =========="):(console.log("========== Selection change ==========="),0!==o.instanceKeys.size&&(console.log("ECInstances:"),o.instanceKeys.forEach((e,t)=>{console.log(`${t}: [${[...e].join(",")}]`)})),0!==o.nodeKeys.size&&(console.log("Nodes:"),o.nodeKeys.forEach(e=>console.log(JSON.stringify(e)))),console.log("======================================="))}async getFirstViewDefinitionId(e){const t=["BisCore:SpatialViewDefinition","BisCore:DrawingViewDefinition"],o=(await e.views.queryProps({})).filter(e=>-1!==t.indexOf(e.classFullName));if(0===o.length)throw new Error("No valid view definitions in imodel");return o[0].id}async onIModelSelected(e){if(e)try{const t=e?await this.getFirstViewDefinitionId(e):void 0;this.setState({viewDefinitionId:t})}catch(t){e.close(this.state.accessToken),this.setState(d)}else this.setState(d)}renderIModelComponents(e,t){return n.createElement("div",{className:"Content"},n.createElement("div",{className:"top-left"},n.createElement(l.default,{imodel:e,rulesetId:"Default",viewDefinitionId:t})))}render(){let e;return this.state.imodel&&this.state.viewDefinitionId&&(e=this.renderIModelComponents(this.state.imodel,this.state.viewDefinitionId)),n.createElement("div",{className:"App"},e)}}},780:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(2),i=o(168),s=o(781),a=o(785),l=o(787),c=s.withUnifiedSelection(i.ViewportComponent);t.default=class SimpleViewportComponent extends n.Component{render(){return n.createElement("div",null,n.createElement(c,{imodel:this.props.imodel,rulesetId:this.props.rulesetId,viewDefinitionId:this.props.viewDefinitionId}),n.createElement(a.default,null),n.createElement(l.default,null))}}},785:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(2),i=o(56);o(334);const s=()=>{const e=document.getElementsByClassName("toolbar")[0].getElementsByClassName("toolbar-button");for(let t=0;t<e.length;++t)e[t].classList.remove("active-button")},a=e=>{s(),"DIV"!==e.parentElement.tagName?e.parentElement.classList.add("active-button"):e.classList.add("active-button"),c()},l=()=>{const e=document.getElementsByClassName("active-bar");for(;e[0];)e[0].parentNode.removeChild(e[0])},c=()=>{l();const e=document.getElementsByClassName("toolbar")[0].getElementsByClassName("active-button")[0],t=document.createElement("div");t.className="active-bar",e.appendChild(t)},r=e=>{i.IModelApp.tools.run(i.ZoomViewTool.toolId,i.IModelApp.viewManager.selectedView),a(e.target)},d=e=>{i.IModelApp.tools.run(i.PanViewTool.toolId,i.IModelApp.viewManager.selectedView),a(e.target)},u=e=>{i.IModelApp.tools.run(i.RotateViewTool.toolId,i.IModelApp.viewManager.selectedView),a(e.target)},p=()=>{s(),l(),i.IModelApp.tools.run(i.FitViewTool.toolId,i.IModelApp.viewManager.selectedView)},m=()=>{window.open(".")};t.default=(()=>{window.oncontextmenu=(()=>{s(),l()}),i.IModelApp.tools.unRegister("Select"),i.IModelApp.accuSnap.onNoMotion=(()=>{});const e=[];return window.frameElement&&e.push(n.createElement("a",{key:5,onClick:m,className:"toolbar-button a-full-screen"},n.createElement("span",{className:"icon icon-window-full-screen"}))),e.push(n.createElement("a",{key:1,onClick:p,className:"toolbar-button"},n.createElement("span",{className:"icon icon-fit-to-view"}))),e.push(n.createElement("a",{key:2,onClick:e=>r(e),className:"toolbar-button"},n.createElement("span",{className:"icon icon-zoom"}))),e.push(n.createElement("a",{key:3,onClick:e=>d(e),className:"toolbar-button"},n.createElement("span",{className:"icon icon-hand-2"}))),e.push(n.createElement("a",{key:4,onClick:e=>u(e),className:"toolbar-button"},n.createElement("span",{className:"icon icon-gyroscope"}))),n.createElement("div",{className:"toolbar"},e)})},787:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(2);o(334);t.default=(()=>{return n.createElement("img",{className:"imjs-watermark",src:"./assets/watermark-01.svg"})})},790:function(e,t,o){},792:function(e,t,o){}},[[336,2,1]]]);
//# sourceMappingURL=main.d62d391f.chunk.js.map