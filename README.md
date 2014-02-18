Cheer Up!
=======

CheerUp is a simple web app that randomly displays (hopefully) adorable photos from imgur's /r/aww gallery.
It can be run from its gh page: http://cheerup.mandeepshergill.com

It is installable in Firefox/FirefoxOS/Firefox for Android, can be added to the homescreen in iOS and Android, and saved as a hosted webapp in Chrome by dragging the crx file into the extensions page.

Now using webl10n for translations into Spanish, Portuguese and Polish.

It's up in the Firefox Marketplace and somehow has a good rating: https://marketplace.firefox.com/app/cheer-up/

When offline previously preloaded images will be displayed from the browser cache.

Inspired by [Pocket Kitten](https://github.com/Rumyra/Pocket-Kitten) and this [article](http://12devsofxmas.co.uk/post/2012-12-27-day-2-lets-make-a-firefoxos-app).

TODO
------
* use localForage to store image blobs for offline use instead of relying on browser cache
* add support for WebActivities to let user share photos or change wallpaper without visiting imgur
* more language translations
* use more than 2 image size ranges to decrease data use on very low res screens
* maybe use WebWorkers for background image preloading
* let user choose another imgur gallery, or a set of galleries they like
* let user define how many photos from galleries they want preloaded
* add install support for Ubuntu Unity/Ubuntu Touch webapps
* pass JSLint by not making functions within loops :)
