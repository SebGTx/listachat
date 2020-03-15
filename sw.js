/* version v0.0.20 */
var cacheName = 'listachat-pwa';
var filesToCache = [
  './',
  './index.php',
  './css/bootstrap.min.css',
  './css/style.css',
  './img/listachat-icon-32.png',
  './js/vue.min.js',
  './js/jquery-3.4.1.min.js',
  './js/bootstrap.bundle.min.js',
  './js/main.js'
];

/* Create the DB */
/*function createDB() {
  idb.open('listachat', 1, function(upgradeDB) {
    var store = upgradeDB.createObjectStore('articles', {
      keyPath: 'id'
    });
    store.put({id: 123, name: 'coke', price: 10.99, quantity: 200});
    store.put({id: 321, name: 'pepsi', price: 8.99, quantity: 100});
    store.put({id: 222, name: 'water', price: 11.99, quantity: 300});
  });
}*/

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    }) 
  );
});
