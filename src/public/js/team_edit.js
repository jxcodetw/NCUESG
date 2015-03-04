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

  for(var i=0;i<9;++i) {
    $('.ui.checkbox[tryout-row='+i+']').checkbox('attach events', '.checkall[tryout-row='+i+']', 'check');
    $('.ui.checkbox[tryout-row='+i+']').checkbox('attach events', '.uncheckall[tryout-row='+i+']', 'uncheck');
  }
  for(var i=0;i<5;++i) {
    $('.ui.checkbox[inter-row='+i+']').checkbox('attach events', '.checkall[inter-row='+i+']', 'check');
    $('.ui.checkbox[inter-row='+i+']').checkbox('attach events', '.uncheckall[inter-row='+i+']', 'uncheck');
  }
  
  $('#btn-add').click(function() {
    addMember();
  });
  bindBtn();
});

function addMember() {
  $('#addmsg').addClass('hidden');
  $('#newemail').prop('disabled', true);
  $('#btn-add').addClass('disabled loading').text('新增中...');
  $.ajax({
    url: '/team/' + $('#teamId').val() + '/addmember',
    type: 'POST',
    data: {
      email: $('#newemail').val(),
    },
    success: function(res) {
      $('#addmsg').removeClass('hidden');
      $('#errormsg').text(res.msg);
      $('#newemail').val('');
      $('#newemail').prop('disabled', false);
      $('#btn-add').removeClass('disabled loading').text('新增隊員');
      console.log(res);
      if (res.ok == true) {
        $('#addmsg').removeClass('error').addClass('success');
        var toInsert = $('<tr><td class="collapsing">' + res.addedUser.name + 
          '</td><td>' + res.addedUser.email +
          '</td><td class="right aligned collapsing"><div class="ui icon red remove button" target="' +
          res.addedUser.id + '"><i class="trash icon"></i></div></td>');
        $('#table-member').append(toInsert);
        bindBtn();
      } else {
        $('#addmsg').removeClass('success').addClass('error');
      }
    }
  });
}

function bindBtn() {
  $('.remove.button').unbind('click').click(function(e) {
    var self = $(this);
    $.ajax({
      url: '/team/' + $('#teamId').val() + '/kick',
      type: 'POST',
      data: {
        target: $(this).attr('target')
      },
      success: function(res) {
        console.log(res);
        $('#addmsg').removeClass('hidden');
        $('#errormsg').text(res.msg);
        if (res.ok == true) {
          $('#addmsg').removeClass('error').addClass('success');
          self.parent().parent().remove();
        } else {
          $('#addmsg').removeClass('success').addClass('error');
        }
      }
    });
  });
}

function PreviewImage() {
  var oFReader = new FileReader();
  oFReader.readAsDataURL(document.getElementById("uploadImage").files[0]);
  oFReader.onload = function (oFREvent) {
    document.getElementById("uploadPreview").src = oFREvent.target.result;
  };
};
