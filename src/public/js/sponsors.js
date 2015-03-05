var percentage = 0;
var pic = 1;
setInterval(function() {
  percentage += 0.1;
  if (percentage >= 100) {
    percentage = 0;
    pic += 1;
    if (pic >= 5) {
      pic = 1;
    }
    document.getElementById('button-' + pic).checked = true;
  }
  document.getElementById('progress').style.width = percentage + '%';
}, 5);

