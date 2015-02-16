$(function() {
  $('#form-team').form({
    name: {
      identifier: 'name',
      rules: [{
        type: 'empty',
        prompt: '隊伍名稱不能為空'
      }]
    },
    intro: {
      identifier: 'intro',
      rules: [{
        type: 'empty',
        prompt: '隊伍介紹不能為空'
      }]
    }
  });
  
  $('#newemail').keyup(function(e) {
    if (e.keyCode == 13) {
      addMember();
    }
  });
  $('#btn-add').click(function() {
    addMember();
  });
});

function addMember() {
  var toInsert = $('<tr><td class="collapsing">' + res.addedUser.name + 
      '</td><td>' + res.addedUser.email +
      '</td><td class="right aligned collapsing"><a class="ui icon button" href="' +
      res.addedUser.id + '"><i class="trash icon"></i></a></td>');
  $('#table-member').append(toInsert);
  return;
  $('#newemail').prop('disabled', true);
  $('#btn-add').addClass('disabled loading').text('新增中...');
  $.ajax({
    url: '/team/' + $('#teamId').val() + '/addmember',
    type: 'POST',
    data: {
      email: $('#newemail').val(),
    },
    success: function(res) {
      $('#newemail').val('');
      $('#newemail').prop('disabled', false);
      $('#btn-add').removeClass('disabled loading').text('新增隊員');
      console.log(res);
      if (res.ok == true) {
      }
    }
  });
}
