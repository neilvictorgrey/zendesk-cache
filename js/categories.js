function getCategoryMap() {
  return {
    "202726378":"Shotgun User Guide",
    "202866127":"Shotgun Admin Guide",
    "202981388":"Shotgun Troubleshooting",
    "202726698":"Toolkit User Guide",
    "202726398":"Toolkit Admin Guide",
    "202726678":"Toolkit Developer Guide",
    "202726668":"Toolkit Integrations",
    "114093982514": "RV Overview",
    "202726418":"RV User Guide",
    /*"202704578":"RV Reference Guide",*/
    "202726408":"Studio Tools",
    "114093970474":"Shotgun Enterprise"
  };
}

function getCategoryId() {
  var pageType = getPageType();
  var pageId = getPageId();

  if (pageType === "category") {
    return pageId;
  }

  var ls = window.localStorage !== undefined;

  var categoryId = 0;
  var sectionId = 0;

  if (pageType === "section") {
    sectionId = pageId;
  }

  if (pageType === "article") {

    var articleIndex = {};
    if (ls && window.localStorage.getItem("articleIndex") !== null) {
      articleIndex = JSON.parse(window.localStorage.getItem("articleIndex"));
      if (articleIndex.hasOwnProperty(pageId.toString())) {
        return articleIndex[pageId.toString()];
      }
    }

    var articleUrl = "/api/v2/help_center/articles/" + pageId;
    $.ajax({
      url: articleUrl,
      async: false,
      success: function(result) {
      sectionId = result.article.section_id;
    }
           });

  }

  if (sectionId !== 0) {

    var sectionIndex = {};
    if (ls && window.localStorage.getItem("sectionIndex") !== null) {
      sectionIndex = JSON.parse(window.localStorage.getItem("sectionIndex"));
      if (sectionIndex.hasOwnProperty(sectionId.toString())) {
        if (pageType === "article") {
          articleIndex[pageId.toString()] = sectionIndex[sectionId.toString()];
          window.localStorage.setItem("articleIndex", JSON.stringify(articleIndex));
        }
        return sectionIndex[sectionId.toString()];
      }
    }

    var sectionUrl = "/api/v2/help_center/sections/" + sectionId;
    $.ajax({
      url: sectionUrl,
      async: false,
      success: function(result) {
      categoryId = result.section.category_id;
    }
           });

    if (pageType === "article") {
      articleIndex[pageId.toString()] = categoryId;
      window.localStorage.setItem("articleIndex", JSON.stringify(articleIndex));
    }
    sectionIndex[sectionId.toString()] = categoryId;
    window.localStorage.setItem("sectionIndex", JSON.stringify(sectionIndex));
  }

  return categoryId;
}

function createCategoryIndex() {
  var categoriesUrl = "/api/v2/help_center/categories.json";
  var categoryIndex = [];
  $.get(categoriesUrl).then(function(result) {
    result.categories.forEach(function(category) {
      categoryIndex.push(category.id);
    });
    window.sessionStorage.setItem("categoryIndex", JSON.stringify(categoryIndex));
  });
  return categoryIndex;
}

function validateCategoryAccess(categoryId) {
  var ls = window.sessionStorage !== undefined;
  var categoryIndex = [];
  if (ls !== false && window.sessionStorage.getItem("categoryIndex") !== null && window.sessionStorage.getItem("categoryIndex") !== "{}") {
    categoryIndex = window.sessionStorage.getItem("categoryIndex");
  } else {
    categoryIndex = createCategoryIndex();
  }
  if (categoryIndex.indexOf(categoryId) >= 0) {
    return true;
  }
  return false;
}

function getProductCategories(productName) {
  var categoryMap = {};
  var productMap = getProductMap();
  for (var prod in productMap) {
    if(productMap.hasOwnProperty(prod)) {
      if (categoryMap.hasOwnProperty(productMap[prod])) {
        categoryMap[productMap[prod]].push(prod);
      } else {
        categoryMap[productMap[prod]] = [prod];
      }
    }
  }
  
  /* Sort according to category index */
  var sortedCategoryProductMap = [];
  var ls = window.sessionStorage !== undefined;
  var categoryIndex = [];
  if (ls && window.sessionStorage.getItem("categoryIndex") !== null && window.sessionStorage.getItem("categoryIndex") !== "{}") {
    categoryIndex = JSON.parse(window.sessionStorage.getItem("categoryIndex"));
  } else {
    categoryIndex = createCategoryIndex();
  }
  for (i=0; i<categoryIndex.length; i++) {
    if (categoryMap[productName].indexOf(categoryIndex[i].toString()) >= 0) {
      sortedCategoryProductMap.push(categoryIndex[i].toString());
    }
  }
  
  /* Zendesk has crappy loading issues where we'll come back empty sometimes */
  if (sortedCategoryProductMap != []) {
    return sortedCategoryProductMap;
  } else {
    return categoryMap[productName];
  }
}
