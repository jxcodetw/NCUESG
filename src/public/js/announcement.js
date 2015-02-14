$(function() {
  $('#form-ann').form({
    level: {
      identifier: 'level',
      rules: [{
        type: 'empty',
        prompt: '請選擇一個公告層級'
      }]
    },
    title: {
      identifier: 'title',
      rules: [{
        type: 'empty',
        prompt: '公告標題不能為空'
      }]
    },
    content: {
      identifier: 'content',
      rules: [{
        type: 'empty',
        prompt: '公告內文不能為空'
      }]
    }
  });
});
