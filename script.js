var curImg = 0;
var lastImg = 0;
var imgC = 0;
var list = [];
var canInstall = !!(navigator.mozApps && navigator.mozApps.install);
var lowRes = false;

function loadImgur() {
    if (window.innerWidth <= 640 && window.innerHeight <= 640) {
        lowRes = true;
    }

    for (i = 0; i < 7; i++) {
        $.ajax({
            dataType: "json",
            mimeType: "textPlain",
            type: "GET",
            crossDomain:true,
            url: "https://api.imgur.com/3/gallery/r/aww/top/all/" + i,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Client-ID da42354d6ffb19a");
            },

            success: function(imgur) {
                for (i = 0; i < imgur.data.length; i++) {
                    if (lowRes) {
                        list.push(imgur.data[i].link.replace(/.([^.]*)$/, 'l.$1'));
                    }
                    else {list.push(imgur.data[i].link);}
                }

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
            },

            error: function(xhr, ajaxOptions, thrownError) {
                if (thrownError) {
					$('.github-ribbon').hide();
					$('#main').html('<b>Could not get photos from imgur.com, please try later</b>');
				}
            }
        });
    }

    var preImg = new Array();
    for (i = 0; i < list.length; i++) {
        preImg[i] = new Image();
        preImg[i].src = list[i];
    }
}

function imgTransition() {
    $('img').fadeOut(30);
    $('img').attr('src', curImg);
    $('img').fadeIn(750);
}

function pickImage() {
    var x = Math.floor(Math.random()*list.length);
    lastImg = curImg;
    curImg = list[x];
    imgTransition();
}


$(document).ready(function() {
    if (navigator.onLine == false) {$('#main').html('<b>This program requires internet access</b>');}

    loadImgur();
    
    if (lowRes) {$('.github-ribbon').text("view code...");}
    


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
    
    $('img').click(function() {
        if (curImg != 0) {
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
        //navigator.mozApps.install(window.location.href.substring(0, window.location.href.lastIndexOf('/')) + "/manifest.webapp").onsuccess = function() {
        //navigator.mozApps.install(location.protocol + "//" + location.host + "/manifest.webapp").onsuccess = function() {
            $('#B2G').css('visibility', 'hidden');
        };
    });
});
