// I don't know what I'm doing!
var xhr = new XMLHttpRequest();
var imgSrc = 0;
var lastImg = 0;

function loadImgur() {
// Got help from https://github.com/crsrusl/imgurGallery/blob/master/app.js
    $.ajax({
        dataType: "json",
        mimeType: "textPlain", // Firefox 19 not working without this
        type: "GET",
        crossDomain:true,
        url: "https://api.imgur.com/3/gallery/r/aww/top/0/all",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Client-ID da42354d6ffb19a");
        },
        success: function(imgur) {
            var limit = imgur.data.length;
            var x = Math.floor(Math.random()*limit);    

            if (imgSrc != 0) {lastImg = imgSrc;}

            imgSrc = imgur.data[x].id;
            imgSrc = "" + imgSrc;

            $('#main').html('<img src="http://i.imgur.com/' + imgSrc + '.jpg"/>');
        }
    });
}

$(document).ready(function() {
    loadImgur();
    $('#ImgurAPI').click(function() {
        loadImgur();
    });
    
    $('#LastImg').click(function() {
        if (lastImg != 0) {
            $('#main').html('<img src="http://i.imgur.com/' + lastImg + '.jpg"/>');
            imgSrc = 0;
        }
    });
    
});
