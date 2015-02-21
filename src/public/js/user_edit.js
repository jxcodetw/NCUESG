$(function() {
  $('#form-user').form({
    name: {
      identifier: 'name',
      rules: [{
        type: 'empty',
        prompt: 'Please enter your name'
      }]
    },
    password2: {
      identifier: 'password2',
      rules: [{
        type: 'match[password]',
        prompt: 'two passwords must equal'
      }]
    },
    phone : {
      identifier: 'phone',
      rules: [{
        type: 'empty',
        prompt: 'Please enter your phone'
      }]
    },
    student_number : {
      identifier: 'student_number',
      rules: [{
        type: 'empty',
        prompt: 'Please enter your student number'
      }]
    },
    department : {
      identifier: 'department',
      rules: [{
        type: 'empty',
        prompt: 'Please select a department'
      }]
    },
    grade : {
      identifier: 'grade',
      rules: [{
        type: 'empty',
        prompt: 'Please select a grade'
      }]
    }
  });
});
