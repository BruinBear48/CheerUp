var xhr = new XMLHttpRequest();
var curImg = 0;
var lastImg = 0;
var imgC = 0;
var x;
var list = [];
var canInstall = !!(navigator.mozApps && navigator.mozApps.install);
var preImg = new Array();

function loadImgur() {
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
                    list.push(imgur.data[i].link);
                }
            }
        });
    }
    
    for (i = 0; i < list.length; i++) {
        preImg[i] = new Image();
        preImg[i].src = list[i];
    }
}

function pickImage() {
    x = Math.floor(Math.random()*list.length);
    lastImg = curImg;
    curImg = list[x];
    $('#main').hide()
    $('#main').html('<img src=' + curImg + '/>');
    $('#main').fadeIn('slow');
}

loadImgur();
$(document).ready(function() {
    if (canInstall) {
        var request = window.navigator.mozApps.getSelf();
        request.onsuccess = function getSelfSuccess() {
            if (request.result) {
                // already installed as Firefox webapp
            }
            else {
                // not installed so show install button
                $('#B2G').css('visibility', 'visible');
            };
        };
    };

    $('#ImgurAPI').click(function() {
        pickImage();
    });

    $('#LastImg').click(function() {
        if (lastImg != 0) {
            imgC = curImg;
            curImg = lastImg;
            lastImg = imgC;                
            $('#main').html('<img src=' + curImg + '/>'); 
        }
    });

    $('#B2G').click(function() {
        // relative path bug - https://bugzilla.mozilla.org/show_bug.cgi?id=745928
        navigator.mozApps.install('http://mandeeps.github.com/CheerUp/manifest.webapp').onsuccess = function() {
        //navigator.mozApps.install(window.location.href.substring(0, window.location.href.lastIndexOf('/')) + "/manifest.webapp").onsuccess = function() {
        //navigator.mozApps.install(location.protocol + "//" + location.host + "/manifest.webapp").onsuccess = function() {
            $('#B2G').css('visibility', 'hidden');
        };
    });
});
