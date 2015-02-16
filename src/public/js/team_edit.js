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
});
