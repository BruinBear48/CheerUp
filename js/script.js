(function() {
  var curImg = 0;
  var lastImg = 0;
  var imgC = 0;
  var list = [];
  var lowRes = true;
  var ALBUM_COUNT = 2; // ALBUM_COUNT * ALBUM_IMAGES pet photos should be enough for anybody!
  var ALBUM_IMAGES = 56; // Specify images per album, in case Imgur changes this
  var offlineList = ['img/offline1.jpg', 'img/offline2.jpg', 'img/offline3.jpg',
   'img/offline4.jpg', 'img/offline5.jpg'];
  var preloaded = false;
  var installed = false;
  //var url = "https://api.imgur.com/3/gallery/r/aww/top/all/"; // maybe let users select gallery at some point?
  
  var storage = window.localStorage;
    // Use localStorage to check if images previously downloaded into cache
    // http://stackoverflow.com/a/2462369
    // Better to store blobs in indexedDB instead, implement someday
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
      visibility: 'visible'
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
  
  // Preload images for smoother transitions, offline capability
  function preLoad() {
    var preImg = [], loaded = 0, count = list.length;
    for (var i = 0; i < count; i++) {
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
    var errCount = 0;
    for (var i = 0; i < ALBUM_COUNT; i++) {
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
          if (albumsLoaded == ALBUM_COUNT) {
            console.log('# images to show: ' + list.length)
            preLoad().done(function() {
              $('#notify').slideUp();
              preloaded = true;
              offlineList.splice(0, 5);
              storage.localStoreList = JSON.stringify(offlineList);
            });
          }
        },
  
        error: function(xhr, ajaxOptions, thrownError) {
          errCount++;
          console.log('something wrong in imgur ajax: ' + thrownError);
          // use cached images if available
          if (storage.localStoreList.length > ALBUM_IMAGES) {
            offlineList = JSON.parse(storage.localStoreList);
          }
          // If not enough albums loaded rerun ajax requests
          if (errCount > 2) {
            // rerun requests after delay
            window.setTimeout('if (navigator.onLine) {loadImgur();}', 30000);
          }
        }
      });
    }
  }
  
  function imgTransition() {
    // animate new photo display
    $('#photo').hide();
    $('#photo').attr('src', curImg);
    $('#photo').fadeIn(100);
  }
  
  function pickImage() {
    // choose image to display, can't be same as one just shown
    var listUsed = offlineList;
    var x = Math.floor(Math.random()*listUsed.length);
    lastImg = curImg;
    if (listUsed[x] != lastImg) {
      curImg = listUsed[x];
      imgTransition();
    }
    else {pickImage();}
  }
  
  function viewLastImage() {
    if (lastImg != 0) {
      imgC = curImg;
      curImg = lastImg;
      lastImg = imgC;
      imgTransition();
    }
  }
  
  function visitImgur() {
    if (navigator.onLine && curImg != 0 && preloaded) {
      var imgPage = curImg.replace(/.([^.]*)$/, '');
      if (lowRes) {
        imgPage = imgPage.replace(/.([^l]*)$/, '');
      }
      window.open(imgPage, '_blank');
    }
  }
  
  function setControls() {
    $('#controls').css('visibility', 'visible');
    var canInstall = !!(navigator.mozApps && navigator.mozApps.install);
    if (canInstall) {
      var request = window.navigator.mozApps.getSelf();
      request.onsuccess = function getSelfSuccess() {
        if (request.result) {
          // already installed as Firefox webapp, hide github link
          installed = true;
          $('.github-ribbon').hide();
        }
        else {
          // not installed so show install button
          $('#B2G').css('display', 'inline');
        }
      };
    }
  }
  
  function offline() {
    console.log('now offline!!!');
    $('#notify').html('Working offline...<br>Click to close');
    $('#notify').slideDown();
    $('.github-ribbon').css('display', 'none');
    if (storage.localStoreList.length > ALBUM_IMAGES) {
      offlineList = JSON.parse(storage.localStoreList);
    }
  }
  
  function online() {
    console.log('now online');
    if (!installed) {$('.github-ribbon').css('display', 'block');}
    if (!preloaded) {
      $('#notify').html('Click photos for comments once loaded.<br>Loading...');
      $('#notify').slideDown();
    }
    else {$('#notify').slideUp();}
  
    if (list.length < ALBUM_COUNT * ALBUM_IMAGES) {
      console.log('online, but not all images loaded so running loadImgur');
      loadImgur();
    }
  }
  
  function installerFF() {
    // https://hacks.mozilla.org/2012/11/hacking-firefox-os/
    var base = location.href.split('#')[0];
    base = base.replace('index.html', '');
    var mozillaInstallUrl = base + '/manifest.webapp';
    navigator.mozApps.install(mozillaInstallUrl).onsuccess = function() {
      $('#B2G').css('display', 'none');
    };
  }
  
  function windowSize(firstRun) {
    if (window.innerWidth > 1024 || window.innerHeight > 1024) {
      // only load higher res images if browser has > 1024px available
      if (firstRun) {lowRes = false;}
      $('.github-ribbon').text("View code on Github");
    }
    else {$('.github-ribbon').text("view code...");}
  
    if (preloaded) {$('#notify').slideUp();}
  }
  
  $(document).ready(function() {
    setControls();
    windowSize(true);
    window.onresize = function() {
      windowSize(false);
    }
  
    $('.github-ribbon').click(function() {
      $(this).hide();
    });
    $('#notify').click(function() {
      $(this).slideUp();
    });
  
    if (navigator.onLine) {
      console.log('first run online check...');
      $('#notify').slideDown();
      loadImgur();
    }
    else {offline();}
  
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    $('#ImgurAPI').click(pickImage);
    $('#LastImg').click(viewLastImage);
    $('#photo').click(visitImgur);
    $('#B2G').click(installerFF);
  });
})();  
