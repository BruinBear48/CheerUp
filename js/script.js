var curImg = 0;
var lastImg = 0;
var imgC = 0;
var list = [];
var lowRes = true;
const ALBUMCOUNT = 4; // "ALBUMCOUNT * ALBUMIMAGES pet photos ought to be enough for anybody!"
const ALBUMIMAGES = 56; // Specify images per album, in case Imgur changes this
var offlineList = ['img/offline1.jpg', 'img/offline2.jpg', 'img/offline3.jpg', 'img/offline4.jpg', 'img/offline5.jpg'];
var preloaded = false;
var installed = false;

// Use localStorage to check if image already loaded in cache
// http://stackoverflow.com/a/2462369
// Hope user doesn't wipe cache. 
// Should store images as blobs in indexedDB instead...
var storage = window.localStorage;
if (!storage.localStoreList) {
    storage.localStoreList = "";
}

// Switch from jQuery to Zepto, need CSS3 animations...
$.fn.slideDown = function() {
	var duration = 400;
	this.css({		
		visibility: 'hidden'
	});
	this.show();

    var distance = 0 - this.height();
    this.css({
		top: distance, 
		visibility: 'visible',
    });

    this.animate({
		top: 0
	}, duration);
};

$.fn.slideUp = function() {    
    var duration = 400;
    var distance = 0 - this.height();
    this.animate({
		top: distance
    }, duration);
};

function preLoad() {
	// preload images
	var preImg = new Array(), loaded = 0;
	for (var i = 0; i < list.length; i++) {
		preImg[i] = new Image();
		preImg[i].src = list[i];
		preImg[i].onload = function() {
			var i2 = preImg.indexOf(this);
			var imageBeingLoaded = list[i2];
			offlineList.push(imageBeingLoaded);
			loaded++;
			if (loaded == list.length) {
				whenDone();
			}
		};
	}
	return {
		done:function(f) {
			whenDone = f;
		}
	}
}

function loadImgur() {
	var albumsLoaded = 0;
	for (var i = 0; i < ALBUMCOUNT; i++) {
        $.ajax({
            dataType: "json",
            mimeType: "textPlain",
            type: "GET",
            crossDomain: true,
            url: "https://api.imgur.com/3/gallery/r/aww/top/all/" + i,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Client-ID da42354d6ffb19a");
            },

            success: function(imgur) {
				albumsLoaded++;
                for (var y = 0; y < imgur.data.length; y++) {
                    if (lowRes) {
                        list.push(imgur.data[y].link.replace(/.([^.]*)$/, 'l.$1'));
                    }
                    else {list.push(imgur.data[y].link);}
                }
                if (albumsLoaded == ALBUMCOUNT) {
					console.log('# images to show: ' + list.length)
					preLoad().done(function() {
						$('#notify').slideUp();
						//console.log('preload completed');
						preloaded = true;
						offlineList.splice(0, 5);
						//console.log(offlineList);
						storage.localStoreList = JSON.stringify(offlineList);
					});
				}
            },

            error: function(xhr, ajaxOptions, thrownError) {
				console.log('something wrong in imgur ajax' + thrownError);
				if (i > 2) {offline();}
            },
            
            complete: function() {}
		});
	}
}

function windowSize(firstRun) {
	if (window.innerWidth > 1024 || window.innerHeight > 1024) {
		if (firstRun) {lowRes = false;}
		$('.github-ribbon').text("View code on Github");
	}
	else {$('.github-ribbon').text("view code...");}
	
	if (preloaded) {$('#notify').slideUp();}
}

function imgTransition() {
    //$('#photo').fadeOut(200);
    $('#photo').hide();
    $('#photo').attr('src', curImg);
    $('#photo').fadeIn(100);
}

function pickImage() {
    /*if (preloaded) {var listUsed = list;}
	else {var listUsed = offlineList;}*/
	
	var listUsed = offlineList;	
	var x = Math.floor(Math.random()*listUsed.length);
	lastImg = curImg;
	if (listUsed[x] != lastImg) {
		curImg = listUsed[x];
		imgTransition();
	}
	else {pickImage();}
}

function setControls() {
	$('#controls').css('visibility', 'visible');	
	var canInstall = !!(navigator.mozApps && navigator.mozApps.install);
	if (canInstall) {
		var request = window.navigator.mozApps.getSelf();
		request.onsuccess = function getSelfSuccess() {
			if (request.result) {
				// already installed as Firefox webapp, hide github
				installed = true;
				$('.github-ribbon').css('visibility', 'hidden');
			}
			else {
				// not installed so show install button
				$('#B2G').css('visibility', 'visible');
			};
		};
	};
}

function offline() {
	console.log('now offline!!!');
	$('#notify').html('Working offline...<br>Click to close');
	$('#notify').slideDown();
	$('#notify').click(function() {
		$(this).slideUp();
	});
	$('.github-ribbon').hide();
	if (storage.localStoreList.length > 100) {offlineList = JSON.parse(storage.localStoreList);}
}

$(document).ready(function() {
    setControls();

    windowSize(true);
    window.onresize = function() {
		windowSize(false);
	}    

    if (navigator.onLine) {
		console.log('first run online check...');
		$('#notify').slideDown();
		loadImgur();
    }
    else {offline();}

	window.addEventListener('offline', offline);

	window.addEventListener('online', function() {
		console.log('now online');
		if (!installed) {$('.github-ribbon').css('visibility', 'visible');}
		if (!preloaded) {
			$('#notify').html('Click photos for comments once loaded.<br>Loading...');
			console.log('on event online');
			$('#notify').slideDown();
		}
		else {$('#notify').slideUp();}
		
		if (list.length < ALBUMCOUNT * ALBUMIMAGES) {loadImgur();}
	});

	$('.github-ribbon').click(function() {
		$(this).hide();
	});
    
	$('#notify').click(function() {
		$(this).slideUp();
	});

    $('#ImgurAPI').click(function() {
        pickImage();
    });

    $('#LastImg').click(function() {
        if (lastImg != 0) {
            imgC = curImg;
            curImg = lastImg;
            lastImg = imgC;                
            imgTransition();
        }
    });
    
    $('#photo').click(function() {
        if (navigator.onLine && curImg != 0 && preloaded) {
            var imgPage = curImg.replace(/.([^.]*)$/, '');
            if (lowRes) {
                imgPage = imgPage.replace(/.([^l]*)$/, '');
            }
            window.open(imgPage);
        }
    });

    $('#B2G').click(function() {
        // relative path bug - https://bugzilla.mozilla.org/show_bug.cgi?id=745928
        navigator.mozApps.install('http://mandeeps.github.io/CheerUp/manifest.webapp').onsuccess = function() {
            $('#B2G').css('visibility', 'hidden');
        };
    });
});
