$(function() {
  $('#form-team').form({
    regcode: {
      identifier: 'regcode',
      rules: [{
        type: 'empty',
        prompt: '啟動碼不能為空'
      }]
    },
    gametype: {
      identifier: 'gametype',
      rules: [{
        type: 'empty',
        prompt: '請選擇一個遊戲類別'
      }]
    },
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
});
