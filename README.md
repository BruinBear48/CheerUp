Cheer Up!
=======

CheerUp is a simple web app that randomly displays (hopefully) adorable photos from imgur's /r/aww gallery.
It can be run from its gh page: http://mandeeps.github.io/CheerUp/

It should be installable in Firefox/FirefoxOS/Firefox for Android, can be added to the homescreen in iOS and Android, and saved as a hosted webapp in Chrome by dragging the crx file into the extensions page.

It's up in the Firefox Marketplace, pending their final review: https://marketplace.firefox.com/app/cheer-up/

When offline previously preloaded images will be displayed from the browser cache.

Inspired by Pocket Kitten:
http://12devsofxmas.co.uk/post/2012-12-27-day-2-lets-make-a-firefoxos-app
https://github.com/Rumyra/Pocket-Kitten

TODO
=======
* use indexedDB to store images as blobs for offline use on capable browsers
* add install support for Ubuntu Unity/Ubuntu Touch webapps
* let user choose another imgur gallery, or a set of galleries they like
* implement touch screen swipe to view new or prior image
* add support for WebActivities to let user share photos or change wallpaper without visiting imgur
* multiple text translations
* use more than 2 image size ranges to decrease data use on very low res screens
