var menuState;
var ign;

var btnMenu = document.getElementById('btn-settings');

if (btnMenu != null) {
  btnMenu.addEventListener('focus', function() {
    ign = true;
    document.getElementById('submenu').style.visibility = 'visible';
  });

  btnMenu.addEventListener('blur', function() {
    setTimeout(function() {
      document.getElementById('submenu').style.visibility = 'hidden';
    }, 500);
  });

  btnMenu.addEventListener('click', function(e) {
    e.preventDefault();
    if (ign) {
      ign = false;
      menuState = true;
      return;
    }
    menuState = !menuState;
    if (menuState) {
      document.getElementById('submenu').style.visibility = 'visible';
    } else {
      document.getElementById('submenu').style.visibility = 'hidden';
    }
  });
}
