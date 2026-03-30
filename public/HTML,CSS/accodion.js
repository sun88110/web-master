$(document).ready(function () {

  $(".accordion-header").click(function () {

    $(".accordion-content").slideUp();
    $(".arrow").removeClass("active");

    if (!$(this).next().is(":visible")) {
      $(this).next()
        .css("display", "block") 
        .hide()
        .slideDown();

      $(this).find(".arrow").addClass("active");
    }

  });

});