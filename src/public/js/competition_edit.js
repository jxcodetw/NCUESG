$(function() {
  $('#gametype').dropdown({
    on: 'hover',
    onChange: function(value) {
      if (value === undefined) {
        return;
      }
      $.ajax({
        url: '/competition/team-type',
        data: {game: value},
        type: 'POST',
        dataType: 'text',
        success: function(msg) {
          msg = $.parseJSON(msg);
          $('#options').html(msg);
          $('.options').dropdown();
          validateForm();
        }
      });
    }
  });
  validateForm();
});
function validateForm() {
  $('#form-team').form({
      gametype: {
        identifier: 'gametype',
        rules: [{
          type: 'empty',
          prompt: '請選擇一個遊戲類別'
        }]
      },
      team1: {
        identifier: 'team1',
        rules: [{
          type: 'empty',
          prompt: 'Team A不能為空'
        }]
      },
      team2: {
        identifier: 'team2',
        rules: [{
          type: 'empty',
          prompt: 'Team B不能為空'
        }]
      },
      comp_type: {
        identifier: 'comp_type',
        rules: [{
          type: 'empty',
          prompt: '賽別不能為空'
        }]
      },
      time: {
        identifier: 'time',
        rules: [{
          type: 'empty',
          prompt: 'Gametime不能為空'
        }]
      }
  });
}
