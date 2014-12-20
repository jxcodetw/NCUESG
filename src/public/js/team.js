$(function() {
  $('#tab-nav-1').click(function() {
    $('#panel-1').show();
    $('#panel-2').hide();
    $('#panel-3').hide();
    $('#panel-4').hide();
  });
  $('#tab-nav-2').click(function() {
    $('#panel-1').hide();
    $('#panel-2').show();
    $('#panel-3').hide();
    $('#panel-4').hide();
  });
  $('#tab-nav-3').click(function() {
    $('#panel-1').hide();
    $('#panel-2').hide();
    $('#panel-3').show();
    $('#panel-4').hide();
  });
  $('#tab-nav-4').click(function() {
    $('#panel-1').hide();
    $('#panel-2').hide();
    $('#panel-3').hide();
    $('#panel-4').show();
  });
});
