var curImg = 0;
var lastImg = 0;
var imgC = 0;
var list = [];
var canInstall = !!(navigator.mozApps && navigator.mozApps.install);
var lowRes = false;
var albumCount = 2; // 112 images at 56 per album
var offlineList = ['img/offline1.jpg', 'img/offline2.jpg', 'img/offline3.jpg', 'img/offline4.jpg', 'img/offline5.jpg'];

var dbCache = new IDBStore({
	storeName: 'cache',
	dbVersion: 1,
	keyPath: 'id',
	autoIncrement: true,
	onStoreReady: function(){console.log('indexedDB available');}
});

function preLoad() {
	// preload images
	var preImg = new Array(), loaded = 0;
	for (var i = 0; i < list.length; i++) {
		preImg[i] = new Image();
		preImg[i].src = list[i];
		preImg[i].onload = function() {
			loaded++;
			if (loaded == list.length) {
				whenDone();
			}
		}
		//if (preImg.length == list.length) {console.log('preload run');}
	}
	return {
		done:function(f) {
			whenDone = f;
		}
	}
}

function loadImgur() {
	for (var i = 0; i < albumCount; i++) {
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
                for (var y = 0; y < imgur.data.length; y++) {
                    if (lowRes) {
                        list.push(imgur.data[y].link.replace(/.([^.]*)$/, 'l.$1'));
                    }
                    else {list.push(imgur.data[y].link);}
                }
                if (i == albumCount) {
					console.log('# images to show: ' + list.length)
					preLoad().done(function() {
						$('#loading').remove();
						setControls();
						console.log('preload completed');
						//for (var i = 0; i < list.length; i++) {
							//saveImage(preImg[i], list[i]);
						//}
					});
				}
            },

            error: function(xhr, ajaxOptions, thrownError) {
				console.log('something wrong in imgur ajax' + thrownError);
                //if (thrownError) {
					//console.log(thrownError);
					//$('.github-ribbon').hide();
					//$('#main').html('<b>Could not get photos from imgur.com, please try later</b>');
				//}
            },
            
            complete: function() {}
		});
	}
}

function windowSize() {
	if (window.innerWidth <= 640 && window.innerHeight <= 640) {
		lowRes = true;
		$('.github-ribbon').text("view code...");
	}
	else {$('.github-ribbon').text("View code on Github");}
}

function imgTransition() {
    $('#photo').fadeOut(30);
    $('#photo').attr('src', curImg);
    $('#photo').fadeIn(750);
}

function pickImage() {
    var x = Math.floor(Math.random()*list.length);
    lastImg = curImg;
    if (list[x] != lastImg) {
		curImg = list[x];
		imgTransition();
	}
	else {pickImage();}
}

function setControls() {
	$('#controls').css('visibility', 'visible');	
	if (canInstall) {
		var request = window.navigator.mozApps.getSelf();
		request.onsuccess = function getSelfSuccess() {
			if (request.result) {
				// already installed as Firefox webapp, hide github
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
	var offlineMessage = document.createElement('p');
	var offlineText = document.createTextNode('This app needs internet access');
	offlineMessage.appendChild(offlineText);
	$('#main').prepend(offlineMessage);
	$('.github-ribbon').css('visibility', 'hidden');
	$('#controls').css('visibility', 'hidden');
	var offImg = 0;	
	timer = setInterval(function() {
		if (offImg < 4) {offImg++;}
		else {offImg = 0;}
		curImg = offlineList[offImg];
		imgTransition();
	}, 3000);
}

$(document).ready(function() {
    if (navigator.onLine) {
		loadImgur();
    }
    else {offline();}

	window.addEventListener('offline', offline);

	window.addEventListener('online', function() {
		console.log('now online');
		if ($('p').length) {$('p').remove();}
		$('.github-ribbon').css('visibility', 'visible');
		$('#controls').css('visibility', 'visible');	
		clearInterval(timer);
		if (list.length < 10) {loadImgur();}
	});
    
    windowSize();
    window.onresize = function() {
		windowSize();
	}
	
    
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
        if (navigator.onLine && curImg != 0) {
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
