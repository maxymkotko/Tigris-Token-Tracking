$(document).ready(function(){


  $("#select_box2 > .dropdownbox").click(function(e) {
    $(".dropdown_select").slideUp(1), $(this).next().is(":visible") || $(this).next().slideDown(1),
    e.stopPropagation()
    $(this).toggleClass('text_change')
    $(".dropdown_select > li").click(function(){
      $(".dropdownbox.text_change > p").text($(this).text());
      $("#select_box2 .dropdown_select").css('display', 'none');
      $(".dropdownbox").removeClass('text_change');
    });

  });

  $("#select_box1 .dropdownbox").click(function(){
    $("#select_box1 .dropdown_select").toggleClass("showMenu");
    $("#select_box1 .dropdown_select > li").click(function(){
      //$("#select_box1 .dropdownbox > p").text($(this).text());
      $("#select_box1 .dropdown_select").removeClass("showMenu");
    });
  });

  $('.bar').click(function() {
    $('.custom_col_2.show_menu').toggleClass('open');
  });


  $('.messager > button, .ask_popup > button').click( function() {
    $('.ask_popup').toggleClass('show');
  });

  // Tabs
  // Tabs
  $(".ls_tab ul li a").click(function() {
    $(".ls_tab ul li a").removeClass("active");
    $(this).addClass("active");

    // $(".ls_content > .tab_active").removeClass("tab_active").fadeOut(0);
    // $(this.rel).fadeIn(0).addClass("tab_active");
  }); 



  $('.menu ul li a').click(function(){
    $('.menu ul li a').removeClass('active');
    $(this).addClass('active');
  });

  var toTop = $('.scroll > button');
  // logic
  toTop.on('click', function() {
    $('html, body').animate({
      scrollTop: $('html, body').offset().top,
    });
  });



  
});