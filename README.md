# PWA Demo

This is a very simple Progressive Web Application that lists some images of kittens and puppies. It was created to show the basic structure of a PWA for my presentation on them. The basic ServiceWorker caches all files, as I don't expect any changes to them.

## Further Information
⚠️ This demo uses the experimental Caching API. [As of writing this readme it is not compatible with Internet Explorer, Edge on Mobile or Safari (both Desktop and Mobile)](https://developer.mozilla.org/en-US/docs/Web/API/Cache#Browser_compatibility).

Since we store only a very small amount of data we could instead use the [WebStorage API  (especially Window.localStorage )](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API), as it is supported by a wider range of Browsers. Another way of storing data could be by using the [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), however since it's meant to be used for storage of a significant amount of structured data it seems excessive.

## Problems I ran into when creating the PWA
#### ServiceWorker
###### PWA Mini Info Bar not showing up
Saving the `serviceworker.js` in a seperate folder (e.g. `.../scripts/serviceworker.js`) lead to the serviceworker being registered successfully, **however** it's scope was set to `.../scripts`. When calling the `navigator.serviceWorker.register()` function and passing both the filepath of the service worker and `{scope: "..."}` it raised this Exception.
> TypeError: Failed to execute 'fetch' on 'ServiceWorkerGlobalScope': 'only-if-cached' can be set only with 'same-origin' mode

 After a bit more researching I learned, that that either the `serviceworker.js` should be put at the root of the application or you could  edit the HTTP Request, with the later being highly discouraged for obvious reasons. This means that the same-origin policy enforced in the caching api sees `https://some.site` and `https://some.site/directory/` as two different origins.
 
 > The "only-if-cached" mode can only be used if the request's mode is "same-origin". Cached redirects will be followed if the request's redirect property is "follow" and the redirects do not violate the "same-origin" mode. (https://developer.mozilla.org/en-US/docs/Web/API/Request/cache)
 
When testing the application I found out that the data I specified was saved to the Cache **by the service worker**, however on reload it could no longer access the data. If cached files were returned it was only due to the browser, which left me confused for quite a while. This however also explained why sometimes offline functionality didn't work for some testers. After the `serviceworker.js` file was moved and references have been fixed, the PWA could be used offline without any problems. Also the Mini Info Bar asking the user to install the app would finally show up.

Note: This exception still got raised when trying to run an audit with Lighthouse. The audit however is successful.

###### Scope Of Application
When trying to add files for caching I thought, that I could add a relative path from the current directory the `serviceworker.js` file was stored in. However it turns out, that the path for caching actually starts at the base url.
This means that when you store your `index.html` and `serviceworker.js` in a subdirectory of your homepage (like I did), that you have to explicitly prepend the directory. When you store the afore mentioned files in a directory called `pwa`  and you want to cache `https://some.site/pwa/some-file.extension` you have to add `/pwa/some-file.extension`, even if your `start_url` and `scope` clearly state `pwa` as your root directory.

###### Cache
When I first got the cache to work correctly I quickly noticed that the cache-first version has it's drawbacks, as you will always get served the cached version of your `index.html`. I found on the internet, that the cache is valid for atleast 24 hours, upon which the service worker will try to find any changes to the PWA. In some cases this is okay, but since this was my first time working with PWAs and Caching I found these things really helpful:

The ServiceWorker is invalidated when even only one byte of it is changed when registering a updated version. I noticed that this wouldn't happen for me. I figured that it had something to do with the caching. I had two potential fixes. 
- If the user is online and there is atleast one service worker &rarr; remove the service worker and register it normally.
- When a serviceworker is successfully registered call `ServiceWorkerRegistration.update()` as it bypasses browser cache.

Since you have to specify a name for your cache and updating it probably means renaming the cache, here a helpful method to remove any old caches without waiting for it to expire:
```js
    caches.keys().then(function(cacheNames){
        cacheNames.forEach(function(name) {
            if(name !== CACHE_NAME)
                caches.delete(name);
        })
    });
```
I call this after the `activate` event is fired, as it notifies me that an older version of the service worker should no longer be running.

###### Updating the ServiceWorker
I stated earlier that we can update the ServiceWorker by calling the `update()` method. However this wasn't the case for me. I saw that a new ServiceWorker was actually being installed, however it never got activated. I noticed, that you have to completely change the URL once (go to google and come back for example) after that the new ServiceWorker is activated with the old one being discarded.

#### manifest.webmanifest
###### File Extension
The Google Developer still only list a `manifest.json` file as a requirement for a PWA. However when looking at the [W3C specification](https://w3c.github.io/manifest/#media-type-registration) they also allow a `.webmanifest` file extension. While the content of both files is the same I think it would be better to use the later extension, as I think that they could potentially drop the json extension when PWAs become more widespread. Though I also imagine that browsers will keep the support for json manifests, if that should ever happen.
###### `theme_color`
As it turns out if you want to set the theme color that can be used as background color for the chrome (the area around the url) of the browser (not to be confused with the Google Chrome browser) it is not enough to specify a `theme_color` in the manifest file. You have to add `<meta name="theme-color" content="#000"/>` to your `index.html`.
###### `scope` and `start_url`
Something that really bugged me is the `scope` in the manifest. When I first started out I thought that it was ubiquitous for the whole PWA. What I mean by that is, that I thought that the scope of the Service Worker is extracted from the scope. However as it turns out `scope` and `start_url` have nothing to do with the Service Worker. They merely set boundaries for the PWA so if the user should open a link that is no longer part of the scope, it will display a normal browser interface.
I learned that `scope` actually *is not* required by the manifest and defaults to the directory the manifest is stored in.
This is weird, as when you store your PWA in a subdirectory (at least that's what I noticed) if your `start_url` doesn't start with the part that's saved in `scope` then the scope gets invalidated. Another weird thing I noticed is that when the `scope` is not defined and the `start_url` is set to `""` then the PWA can be added to the homescreen, *but* it shows the webmanifest file. I don't know if that's intentional.
