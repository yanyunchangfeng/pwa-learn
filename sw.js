const CACHE_NAME = 'cache-v3';

self.addEventListener('install',event => {
   console.log('install',event);
//    event.waitUntil(new Promise(resolve => setTimeout(resolve,5000)));
//    event.waitUntil(self.skipWaiting()); //强制停止旧的sw 启用新的sw
event.waitUntil(caches.open(CACHE_NAME).then(cache =>{
    cache.addAll([
        '/',
        './index.css'
    ])
}))
   //   注意只要内容有一丝丝不同，浏览器就会认为这是两个不同的版本 新的版本会被安装下载 但不会立即生效  
});
self.addEventListener('activate',event => {

    console.log('activate',event)
    // event.waitUntil(self.clients.claim()) //clients 是指sw控制的所有页面 这个方法让页面在首次加载后同样受到sw的控制 默认情况下首次是不受控制的
    event.waitUntil(caches.keys().then(cacheNames => {
        console.log(cacheNames)
        return Promise.all(cacheNames.map( cacheName => {
            if(cacheName !== CACHE_NAME){
                return caches.delete(cacheName)
            }
        }))
    }))
});
self.addEventListener('fetch', event => {
  console.log('fetch', event)
  //fetch 是用来捕获资源请求的
  event.respondWith(caches.open(CACHE_NAME).then(cache => {
        console.log(cache, 'cache')
        return cache.match(event.request).then(response =>{
            if(response){
                return response;
            }
            return fetch(event.request).then(response => {
                cache.put(event.request,response.clone()); // response 是流式的 只能读取一次 所以要clone 一份 
                return response;
            });
        })
  }))
});