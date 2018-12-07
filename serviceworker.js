var CACHE_NAME = "my-cache-v2";
var cacheUrls = [
    "/PWA_Demo/",
    "/PWA_Demo/style/main.css",
    "/PWA_Demo/assets/icons/icon512.png",
    "/PWA_Demo/assets/icons/icon192.png",
    "/PWA_Demo/assets/01.jpg",
    "/PWA_Demo/assets/02.jpg",
    "/PWA_Demo/assets/03.jpg",
    "/PWA_Demo/assets/04.jpg",
    "/PWA_Demo/assets/05.jpg",
    "/PWA_Demo/assets/06.jpg",
    "/PWA_Demo/assets/07.jpg",
    "/PWA_Demo/assets/08.jpg",
    "/PWA_Demo/assets/09.jpg",
    "/PWA_Demo/assets/10.jpg"
];

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log("Opened Cache");
                return cache.addAll(cacheUrls);
            }
        )
    );
});

self.addEventListener("activate", function(event) {
    caches.keys().then(function(cacheNames){
        cacheNames.forEach(function(name) {
            if(name !== CACHE_NAME)
                caches.delete(name);
        })
    });
});

self.addEventListener("fetch", function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

/** Advanced Caching
 *  ----------------
 *  If we want that the data a user fetches automatically is cached
 * We can do something like this:
 * 
 *  self.addEventListener("fetch", function(event) {
 *      event.respondWith(
 *          caches.match(event.request)
 *              .then(function(response) {
 *                  if (response) {
 *                      return response;
 *                  }
 *                  
 *                  var fetchRequest = event.request.clone();
 *                  return fetch(fetchRequest).then(
 *                      function(response) {
 *                          if (!response || response.status !== 200 || response.type !== "basic")
 *                              return response;
 * 
 *                          var responseToCache = response.clone();
 *                          caches.open(CACHE_NAME)
 *                              .then(function(cache) {
 *                                  cache.put(event.request, responseToCache);
 *                              });
 *
 *                          return response;
 *                      }
 *                  )
 *              }
 *          )
 *      );
 *  });
 * 
 */