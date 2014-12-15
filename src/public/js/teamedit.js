$(function() {
  $('#btnupdate').click(function() {
    var self = $(this);
    self.addClass('pure-button-disabled');
    $('#updateinfomsg').text('loading...');
    self.text('Updating...');
    $.ajax({
      url: '/team/updateinfo',
      type: 'POST',
      data: {
        teamId: $('#teamId').val(),
        teamName: $('#teamName').val(),
        teamIntro: $('#teamIntro').val()
      },
      success: function(res) {
        $('#btnupdate').removeClass('pure-button-disabled');
        $('#btnupdate').text('Update Info');
        if (res.ok) {
          $('#updateinfomsg').text(res.msg);
        }
      }
    });
  });
  $('#newemail').keyup(function(e) {
    if (e.keyCode == 13) {
      addMember();
    }
  });
  $('#btnnewemail').click(function() {
    addMember();
  });
});

function addMember() {
  $('#newemail').prop('disabled', true);
  $('#btnnewemail').addClass('pure-button-disabled');
  $('#btnnewemail').text('Adding...');
  $.ajax({
    url: '/team/addmember',
    type: 'POST',
    data: {
      teamId: $('#teamId').val(),
      email: $('#newemail').val(),
    },
    success: function(res) {
      $('#newemail').val('');
      $('#newemail').prop('disabled', false);
      $('#btnnewemail').removeClass('pure-button-disabled');
      $('#btnnewemail').text('Add');
      console.log(res);
    }
  });
}
