$(function() {
  var lolAnim = new countUp("lolTeamsCount", 0, $('#lolTeamsCount').attr('data-max'));
  var hsAnim = new countUp("hsTeamsCount", 0, $('#hsTeamsCount').attr('data-max'));
  var sc2Anim = new countUp("sc2TeamsCount", 0, $('#sc2TeamsCount').attr('data-max'));
  var avaAnim = new countUp("avaTeamsCount", 0, $('#avaTeamsCount').attr('data-max'));
  var userAnim = new countUp("userCount", 0, $('#userCount').attr('data-max'));
  setTimeout(function() {
    $('.statistic').transition('scale');
    setTimeout(function() {
      lolAnim.start();
      hsAnim.start();
      sc2Anim.start();
      avaAnim.start();
      userAnim.start();
    }, 500);
  }, 1000);
});
