if(!self.define){let e,s={};const a=(a,n)=>(a=new URL(a+".js",n).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(n,c)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let t={};const o=e=>a(e,i),r={module:{uri:i},exports:t,require:o};s[i]=Promise.all(n.map((e=>r[e]||o(e)))).then((e=>(c(...e),t)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"2444f7036c09a3e3a099d58839155174"},{url:"/_next/static/ahFvKkKVSsDSOAaZkPbwI/_buildManifest.js",revision:"3ea1e6bd2b55fc722a651114e662b74a"},{url:"/_next/static/ahFvKkKVSsDSOAaZkPbwI/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/203.2b4c1ee4fbe3a7cf.js",revision:"2b4c1ee4fbe3a7cf"},{url:"/_next/static/chunks/218.e907674a5b57ee84.js",revision:"e907674a5b57ee84"},{url:"/_next/static/chunks/4bd1b696-93586df7ee522d78.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/517-e96d189edfaeea15.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/575-77f667e45fa22d6f.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/app/_not-found/page-dae69bc08ec20d4e.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/app/api/mongodb/connect/route-5b1e5fc3de1976c7.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/app/api/mongodb/databases/%5BdbName%5D/collections/%5BcollName%5D/documents/route-c4cccb6b025410ab.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/app/api/mongodb/databases/%5BdbName%5D/collections/%5BcollName%5D/info/route-e9f90d25b48423ab.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/app/api/mongodb/databases/%5BdbName%5D/collections/route-cf1fda474fcd4b75.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/app/dashboard/page-bab1fd017cf2ea6c.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/app/database/%5BdbName%5D/collection/%5BcollName%5D/page-aa7b226fbb8d6766.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/app/database/%5BdbName%5D/page-a34141f00c6c815d.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/app/layout-4019bf75abbe7c1c.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/app/page-db34a6beb7f9ba36.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/app/server-status/page-9b4d94adc41adc6d.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/framework-d29117d969504448.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/main-13945350c73ca16c.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/main-app-4ac1c7dcadc0d8b5.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/pages/_app-60989c630625b0d6.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/pages/_error-3fca65cf2fb6a91b.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-cf3a58fab69ed8e4.js",revision:"ahFvKkKVSsDSOAaZkPbwI"},{url:"/_next/static/css/8aced2733e034e46.css",revision:"8aced2733e034e46"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/icons/favicon.ico",revision:"71f28242b2e4533472e8ddcb321f2b42"},{url:"/icons/icon-128x128.png",revision:"788f7a3bfcd25ec60c8ff0d085523d9e"},{url:"/icons/icon-144x144.png",revision:"e50d24f97652bda8e37b61cb5f832fe3"},{url:"/icons/icon-152x152.png",revision:"17078c956d23c533464ba98d949d4ed2"},{url:"/icons/icon-16x16.png",revision:"71f28242b2e4533472e8ddcb321f2b42"},{url:"/icons/icon-192x192.png",revision:"4d26c53eed076497a8c7068291ed65fe"},{url:"/icons/icon-32x32.png",revision:"94aa53bee429b8bf6433c931fd5e0dff"},{url:"/icons/icon-384x384.png",revision:"febd4b81c29c3a4e3e2eb293be40e8d9"},{url:"/icons/icon-512x512.png",revision:"be1ffad11d35e5ce78f67bfb61caa116"},{url:"/icons/icon-72x72.png",revision:"3597b737ecdd07473a2ca82336e70f22"},{url:"/icons/icon-96x96.png",revision:"b879523547e9ad168a1cb2e44744f7f8"},{url:"/manifest.json",revision:"9bced388ef997ce7f92dc8f4d1beb760"},{url:"/mongodb-icon.svg",revision:"22167b15f19b84222659e47ea1ef28b2"},{url:"/placeholder-logo.png",revision:"b7d4c7dd55cf683c956391f9c2ce3f5b"},{url:"/placeholder-logo.svg",revision:"1e16dc7df824652c5906a2ab44aef78c"},{url:"/placeholder-user.jpg",revision:"82c9573f1276f9683ba7d92d8a8c6edd"},{url:"/placeholder.jpg",revision:"887632fd67dd19a0d58abde79d8e2640"},{url:"/placeholder.svg",revision:"35707bd9960ba5281c72af927b79291f"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:a,state:n})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
