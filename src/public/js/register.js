$(function() {
  $('#form-reg').form({
    name: {
      identifier: 'name',
      rules: [{
        type: 'empty',
        prompt: 'Please enter your name'
      }]
    },
    email: {
      identifier: 'email',
      rules: [{
        type: 'empty',
        prompt: 'Please enter your email'
      }]
    },
    password: {
      identifier: 'password',
      rules: [{
        type: 'empty',
        prompt: 'Please enter your password'
      },{
        type: 'length[6]', 
        prompt: 'Your password must at least 6 characters'
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
  }, {
    onSuccess: function(e) {
      $('#loader').addClass('active');
      $('#btn-submit').addClass('loading');
      $.ajax({
        type: "POST",
        url: "/register",
        data: $('#form-reg').serialize(),
        success: function(res) {
          $('#loader').removeClass('active');
          $('#btn-submit').removeClass('loading');
          if (res.error === 1) {
            $('#btn-submit').removeClass('disabled');
          } else {
            $('#btn-submit').addClass('disabled')
            $('#btn-submit').html('Created').after($('<i class="checkmark icon"></i>'));
            setTimeout(function() {
              window.location = '/login';
            }, 2000);
          }
        },
        error: function() {
          console.log('error');
        }
      });
      e.preventDefault();
    }
  });
});
