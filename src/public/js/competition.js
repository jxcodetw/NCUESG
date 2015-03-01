$(function() {
  $('#gametype').dropdown({
    onChange: function(value) {
      $.ajax({
        url: '/competition/team-type',
        data: {game: value},
        type: 'POST',
        dataType: 'text',
        success: function(msg) {
          msg = $.parseJSON(msg);
          console.log(msg);
          $('#options').html(msg);
          $('.options').dropdown();
        }
      });
    }
  });
});
