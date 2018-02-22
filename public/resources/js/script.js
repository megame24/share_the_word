$(function(){
  $(function(){
      $('.navbar').affix({
        offset: {
          /* Affix the navbar after scroll below header */
          top: $(".top").outerHeight(true)}
      });
  });
  
  $('.js--waypoint').waypoint(function(direction){
      if(direction=='down'){
          $('.nav-filler').css('display', 'block');
      } else {
          $('.nav-filler').css('display', 'none');
      }
   });
   
   $('.js--delete').on('click', function(){
     $('[name="image?"]').attr('value', 'false');
   });
   
   $('.js--check-all').on('click', function(){
     if ($('[type="file"]').get(0).files.length === 0 && $('[name="image?"]').val() == 'false') {
        $('[name="image?"]').attr('value', 'false');
    } else if ($('[type="file"]').get(0).files.length === 0 && $('[name="image?"]').val() == 'true') {
      $('[name="image?"]').attr('value', 'retain');
    } else {
      $('[name="image?"]').attr('value', 'true');
    }
   });
});