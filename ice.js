/* SETTINGS          */
var l = '';     //google login or email (in quotation marks)
var p = ''; //google password (in quotation marks)
var area = 'https://www.ingress.com/intel?ll=35.682398,139.693909&z=11'; //link to your location (in quotation marks)
var minlevel = 1; //minimal portal level, only portals with level >= (higher or equal than) this will be displayed, set to 1 to display all available portals (without quotation marks)
var maxlevel = 8; //highest portal level, only portals with level <= (lower or equal than) this will be displayed, set to 8 to display all (without quotation marks)
var v = 30;     //Delay between capturing screenshots in seconds (without quotation marks)
var width = 900;   //Picture width (without quotation marks)
var height = 500; //Picture height (without quotation marks)
var folder = './'; //Folder where to save screenshots, with / (or \) on the end. '.' means current folder.
/* SGNITTES       */

/* Ingress ICE by Nikitakun (https://github.com/nibogd/ingress-ice), distributed under the MIT License
 * 
 * DO NOT EDIT BELOW THIS LINE IF YOU DON'T KNOW JAVASCRIPT
 */

var page = require('webpage').create();
var system = require('system');
var twostep = 0;
var val, message, Le;
v = 1000*v;

var Version = '1.4.0';

page.viewportSize = {
   width: width + 42,
   height: height + 167
};

function getDateTime() {
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    var dateTime = year+'-'+month+'-'+day+'--'+hour+'-'+minute+'-'+second;   
    return dateTime;
};

function setminmax(min, max) {
  //console.log("Setting portals level range from " + min + " to " + max);
  var minAvailable = page.evaluate(function () { return document.querySelectorAll('.level_notch.selected')[0]});
  var maxAvailable = page.evaluate(function () { return document.querySelectorAll('.level_notch.selected')[1]});
  if (parseInt(minAvailable.id[10], 10)>min) {
      console.log('The minimal portal level is too low, using default. Consider setting it higher.');
  } else {
    var rect = page.evaluate(function() {
        return document.querySelectorAll('.level_notch.selected')[0].getBoundingClientRect();
    });
    page.sendEvent('click', rect.left + rect.width / 2, rect.top + rect.height / 2);
    //page.render('debug0.png');
    var rect1 = page.evaluate(function(min) {
        return document.querySelector('#level_low' + min).getBoundingClientRect();
    }, min);
    page.sendEvent('click', rect1.left + rect1.width / 2, rect1.top + rect1.height / 2);
    //page.render('debug1.png');
  };
  
  var rect2 = page.evaluate(function() {
    return document.querySelectorAll('.level_notch.selected')[1].getBoundingClientRect();
  });
  page.sendEvent('click', rect2.left + rect2.width / 2, rect2.top + rect2.height / 2);
  //page.render('debug2.png');
  var rect3 = page.evaluate(function(min) {
    return document.querySelector('#level_high' + min).getBoundingClientRect();
  }, max);
  page.sendEvent('click', rect3.left + rect3.width / 2, rect3.top + rect3.height / 2);
  page.evaluate(function () {document.querySelector('#filters_container').style.display = 'none'}); 
  //page.render('debug.png');
};

function s() {
  console.log('Capturing screen from ' + getDateTime() + '...');
  page.render(folder + 'ice-' + getDateTime() + '.png');
};

function quit(err) {
 if (err) {
  console.log('\nICE crashed. Reason: ' + err + ' :('); //nice XD
  } else {
   console.log('Quit');
  };

 phantom.exit();
};
if (!l | !p) {
 quit('you haven\'t entered your login and/or password');
};
if ((minlevel < 0 | minlevel > 8) | (maxlevel < 0 | maxlevel > 8) | (!minlevel | !maxlevel)) {
 quit('the lowest and/or highest portal levels were not set or were set wrong');
};
if (minlevel>maxlevel) {
    quit('lowest portal level is higher than highest. Isn\'t that impossible?!');
};
if (!area | area == 0) {
 quit('you forgot to set the location link, didn\'t you?');
};

console.log('     _____ )   ___      _____) \n    (, /  (__/_____)  /        \n      /     /         )__      \n  ___/__   /        /          \n(__ /     (______) (_____)  v' + Version + ' (https://github.com/nibogd/ingress-ice)\n\nConnecting...');


window.setTimeout(function () {page.open('https://www.ingress.com/intel', function (status) {
 
 if (status !== 'success') {quit('cannot connect to remote server')};

 var inglink = page.evaluate(function () {
   return document.getElementsByTagName('a')[0].href; 
 });
 
 console.log('Logging in...');
 page.open(inglink, function () {
   
   page.evaluate(function (l) {
     document.getElementById('Email').value = l;
   }, l);

   page.evaluate(function (p) {
     document.getElementById('Passwd').value = p;
   }, p);

   page.evaluate(function () {
     document.querySelector("input#signIn").click();
   });

   page.evaluate(function () {
     document.getElementById('gaia_loginform').submit(); // Not using POST because the URI may change 
   });

   window.setTimeout(function () {
       console.log('URI is now ' + page.url.substring(0,40) + '... .\nVerifying login...');

       if (page.url.substring(0,40) == 'https://accounts.google.com/ServiceLogin') {quit('login failed: wrong email and/or password')};
       
       if (page.url.substring(0,40) == 'https://appengine.google.com/_ah/loginfo') {
          console.log('Accepting appEngine request...');
          page.evaluate(function () {
            document.getElementById('persist_checkbox').checked = true;
            document.getElementsByTagName('form').submit();
          });
       };

       if (page.url.substring(0,40) == 'https://accounts.google.com/SecondFactor') {
          console.log('Using two-step verification, please enter your code:');
          twostep = system.stdin.readLine();
       };
   
       if (twostep) {
          page.evaluate(function (code) {
            document.getElementById('smsUserPin').value = code;
          }, twostep);
          page.evaluate(function () {
            document.getElementById('gaia_secondfactorform').submit();
          });
       };
        window.setTimeout(function () {
          page.open(area, function () {
           console.log('Authenticated successfully, starting screenshotting portals in range between levels '+ minlevel + ' and '+ maxlevel + ' every ' + v\1000 + 's...');
            setInterval(function () {
              page.evaluate(function () {
               //document.querySelector('#filters_container').style.display = 'none';
               document.querySelector('#comm').style.display = 'none';
               document.querySelector('#player_stats').style.display = 'none';
               document.querySelector('#game_stats').style.display = 'none';
               document.querySelector('#geotools').style.display = 'none';
               document.querySelector('#header').style.display = 'none';
               document.querySelector('#snapcontrol').style.display = 'none';
               document.querySelectorAll('.img_snap')[0].style.display = 'none';
              });
              setminmax(minlevel,maxlevel);
  
              page.evaluate(function () {
               var hide = document.querySelectorAll('.gmnoprint');
               for (index = 0; index < hide.length; ++index) {
                 hide[index].style.display = 'none';
              }});
              
              window.setTimeout(function () {
              var mySelector = "#map_canvas";
              var elementBounds = page.evaluate(function(selector) {
                var clipRect = document.querySelector(selector).getBoundingClientRect();
                return {
                  top:     clipRect.top,
                  left:     clipRect.left,
                  width:  clipRect.width,
                  height: clipRect.height
                };
               }, mySelector);
              var oldClipRect = page.clipRect;
              page.clipRect = elementBounds;

             s();

             page.reload();
              }, v/2);
            }, v);
          });
        }, 10000);
   },5000);

 });
});
}, 5000);
