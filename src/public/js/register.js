$(function() {
  $('#form-reg').form({
    name: {
      identifier: 'name',
      rules: [{
        type: 'empty',
        prompt: 'Please enter your name'
      }]
    }
  }, {
    onSuccess: function(e) {
      //$('#loader').addClass('active');
      console.log('hello');
      e.preventDefault();
      return;
      $.ajax({
        type: "POST",
        url: "/register",
        data: $('#form-reg').serialize()
      });
    }
  });
});
