const sideLinks = document.querySelectorAll(
  ".sidebar .side-menu li a:not(.logout)"
);

sideLinks.forEach((item) => {
  const li = item.parentElement;
  item.addEventListener("click", () => {
    sideLinks.forEach((i) => {
      i.parentElement.classList.remove("active");
    });
    li.classList.add("active");
  });
});

const menuBar = document.querySelector(".content nav .bx.bx-menu");
const sideBar = document.querySelector(".sidebar");

menuBar.addEventListener("click", () => {
  sideBar.classList.toggle("close");
});

const searchBtn = document.querySelector(
  ".content nav form .form-input button"
);
const searchBtnIcon = document.querySelector(
  ".content nav form .form-input button .bx"
);
const searchForm = document.querySelector(".content nav form");

searchBtn.addEventListener("click", function (e) {
  if (window.innerWidth < 576) {
    e.preventDefault;
    searchForm.classList.toggle("show");
    if (searchForm.classList.contains("show")) {
      searchBtnIcon.classList.replace("bx-search", "bx-x");
    } else {
      searchBtnIcon.classList.replace("bx-x", "bx-search");
    }
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
    sideBar.classList.add("close");
  } else {
    sideBar.classList.remove("close");
  }
  if (window.innerWidth > 576) {
    searchBtnIcon.classList.replace("bx-x", "bx-search");
    searchForm.classList.remove("show");
  }
});

const toggler = document.getElementById("theme-toggle");

// category css
document.addEventListener("DOMContentLoaded", function () {
  // category html
  const rows = document.querySelectorAll(".catRow");
  console.log(rows);
  if (rows.length > 0) {
   
    rows.forEach((row, index) => {
      console.log(row, index);
      row.addEventListener("click", () => {
        const categoryId = row.getAttribute('data-id');
        window.location.href = `/admin/categories/update/${categoryId}`;
      
      });
    });


  }
  //----------product html
  const productrows = document.querySelectorAll(".prodRow");
  if (productrows.length > 0) {
  

    productrows.forEach((row, index) => {
     
      row.addEventListener("click", () => {
      
       const productId = row.getAttribute('data-id');
        window.location.href = `/admin/products/update/${productId}`;
    
      });
    });

    productDetails.addEventListener("click", (event) => {
      if (event.target === productDetails) {
        const catAction = document.getElementById("catType");
        catAction.textContent = "Edit product";
        productDetails.style.display = "none";
      }
    });
  }
});
//add category
const plusIconCat = document.getElementById("plusIconCat");
if (plusIconCat != null)
  plusIconCat.addEventListener("click", function () {
   
    window.location.href = `/admin/categories/add`;

  });

// add product
const plusIconProd = document.getElementById("plusIconProd");
if (plusIconProd != null)
  plusIconProd.addEventListener("click", function () {
    window.location.href = `/admin/products/add`;

  });

 