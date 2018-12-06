var CACHE_NAME = "my-cache-v1";
var cacheUrls = [
    "/",
    "/style/main.css",
    "/assets/icons/icon512.png",
    "/assets/icons/icon192.png",
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