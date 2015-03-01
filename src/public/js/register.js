$(function() {
  $('#form-reg').form({
    name: {
      identifier: 'name',
      rules: [{
        type: 'empty',
        prompt: '請輸入姓名'
      }]
    },
    email: {
      identifier: 'email',
      rules: [{
        type: 'empty',
        prompt: '請輸入電子郵件'
      }]
    },
    password: {
      identifier: 'password',
      rules: [{
        type: 'empty',
        prompt: '請輸入密碼'
      },{
        type: 'length[6]', 
        prompt: '密碼必須至少六個字'
      }]
    },
    password2: {
      identifier: 'password2',
      rules: [{
        type: 'match[password]',
        prompt: '第二次輸入的密碼須一致'
      }]
    },
    phone : {
      identifier: 'phone',
      rules: [{
        type: 'empty',
        prompt: '請輸入手機號碼'
      }]
    },
    department : {
      identifier: 'department',
      rules: [{
        type: 'empty',
        prompt: '請選擇系所'
      }]
    },
    grade : {
      identifier: 'grade',
      rules: [{
        type: 'empty',
        prompt: '請選擇年級'
      }]
    }
  });
});
