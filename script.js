// I don't know what I'm doing! Hopefully I'll learn. Or not. "Failure is always an option."
var xhr = new XMLHttpRequest();
var imgSrc;

$(document).ready(function() {
    $('#ImgurAPI').click(function() {
// got help from https://github.com/crsrusl/imgurGallery/blob/master/app.js
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

                imgSrc = imgur.data[x].id;
                imgSrc = "" + imgSrc;

                $('#main').html('<img src="http://i.imgur.com/' + imgSrc + '.jpg"/>');
            }
        });
    });
});
