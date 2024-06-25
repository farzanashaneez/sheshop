// script.js

document.addEventListener('DOMContentLoaded', function () {
    // JavaScript to dynamically set the height of .child based on .container's height
    var containerHeight = document.querySelector('.etsy-container').clientHeight;
    document.querySelector('.fixedcontainer').style.height = (containerHeight) + 'px';
});
//.etsy-search

document.addEventListener('DOMContentLoaded', function () {
    function setMainContainerWidth() {
        var fixedContainerWidth = document.querySelector('.fixedcontainer').offsetWidth;
        var mainContainer = document.querySelector('.etsy-search');
        
        // Set the width of the main container based on fixed container's width and margins

        mainContainer.style.marginLeft = '10px'; // Adjust the left margin based on your design
       // mainContainer.style.marginRight = `calc(100% - ${fixedContainerWidth + 40}px)`;
               mainContainer.style.marginRight = `130px`;

    }

    // Call the function on window resize
    window.addEventListener('resize', setMainContainerWidth);

    // Initial call to set the width on page load
    setMainContainerWidth();
});


var textElement = document.getElementsByClassName("interactive-text");
textElement.addEventListener("mouseover", changeColor);
    function changeColor() {
        textElement.style.color = "red"; // Set the desired text color
      }
function toggleDiv(){
var toggleElement=document.getElementById("moreCategory");
toggleElement.classList.toggle("d-none");
}