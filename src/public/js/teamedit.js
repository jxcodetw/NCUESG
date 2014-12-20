$(function() {
  $('#btnupdate').click(function() {
    var self = $(this);
    self.addClass('pure-button-disabled');
    $('#updateinfomsg').text('loading...');
    self.text('Updating...');
    $('#updateinfomsg').hide();
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
        $('#updateinfomsg').text(res.msg);
        if (res.ok == true) {
          $('#updateinfomsg').css({'color':'green'});
        } else {
          $('#updateinfomsg').css({'color':'red'});
        }
        $('#updateinfomsg').fadeIn('slow');
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
  $('#addmembermsg').hide();
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
      $('#addmembermsg').text(res.msg);
      if (res.ok == true) {
        $('#addmembermsg').css({'color':'green'});
        $(res.row).insertBefore('#newmemberrow');
      } else {
        $('#addmembermsg').css({'color':'red'});
      }
      $('#addmembermsg').fadeIn('slow');
    }
  });
}
