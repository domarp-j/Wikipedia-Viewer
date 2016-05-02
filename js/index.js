/*jQuery 2.2.2*/
/*MediaWiki API*/

/* MediaWiki - Get up to first 10 search results - example url (jsonfm format rather than json for viewability in browser) - 
https://en.wikipedia.org/w/api.php?action=query&list=search&format=jsonfm&prop=extracts&srsearch=Stack_Overflow */

/* MediaWiki - Get title & first sentence - example url (jsonfm format rather than json for viewability in browser) - 
https://en.wikipedia.org/w/api.php?format=jsonfm&action=query&prop=extracts&indexpageids&exsentences=&explaintext=&titles=Stack_Overflow */

// Replace spaces with underscores, for use in URL
function addUnderscores(searchInput) {
  return searchInput.replace(/\s/g, '_')
}

// Clear out results box/element with specific index
function clearResults(index) {
  document.getElementById("searchResultTitle" + (index + 1)).innerHTML = "";
  document.getElementById("searchResultExtract" + (index + 1)).innerHTML = "";
}

// Collect title & extract (first sentence) for each search result 
function showResults(searchResultsJSON, index) {
  searchResultsJSON = addUnderscores(searchResultsJSON);
  $.ajax({ // Send MediaWiki API request for article data, in JSON format
      type: "GET",
      dataType: "jsonp",
      url: "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&indexpageids&exsentences=&explaintext=&titles=" + searchResultsJSON
    })
    .done(function(result) {
      var pageID = result.query.pageids;
      var title = result.query.pages[pageID].title;
      var extract = result.query.pages[pageID].extract;
      document.getElementById("searchResultTitle" + (index + 1)).innerHTML = title;
      document.getElementById("searchResultExtract" + (index + 1)).innerHTML = extract;
      document.getElementById("searchResultLink" + (index + 1)).href = "https://en.wikipedia.org/wiki/" + addUnderscores(title);
      $("#searchResult" + (index + 1)).fadeIn(500);
    })
    .fail(function() {
      alert("Failed to obtain article details JSON...")
    });
}

// Get search results and update page
function getSearchResults(searchInput) {
  for (var i = 0; i < 10; i++) clearResults(i);
  $(".search-result").hide();
  $.ajax({ // Send MediaWiki API request for search results data, in JSON format
      type: "GET",
      dataType: "jsonp",
      url: "https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&prop=extracts&srsearch=" + addUnderscores(searchInput)
    })
    .done(function(searchResultsJSON) {
      var totalHits = searchResultsJSON.query.searchinfo.totalhits;
      if (totalHits == 0) 
        document.getElementById("searchBar").value = "No entries found for \"" + searchInput + "\".";
      else {
        var numResults = totalHits < 10 ? totalHits : 10; // cannot exceed 10 search results
        for (var i = 0; i < numResults; i++)
          showResults(searchResultsJSON.query.search[i].title, i); // avoids "closure" problem 
      }
    })
    .fail(function() {
      alert("Failed to obtain search results JSON for " + searchInput);
    });
}

// Move body up when search is performed
function shiftBodyUp() {
  $("body").animate({
    marginTop: "30px"
  }, 300)
}

// Run search functions
function initiateSearch() {
  var searchInput = document.getElementById("searchBar").value;
  if (searchInput) {
    getSearchResults(searchInput);
    shiftBodyUp();
  }
}

// Main - run when page loads
$(document).ready(function() {
  $(".search-result").hide(); // Initially hide all search boxes
  $("#searchButton").click(function() { // Conduct search when searchButton is clicked 
    initiateSearch();
  });
  $(document).keypress(function(key) { // Conduct search when Enter key is pressed
    if (key.which == 13) 
      initiateSearch();
  });
});
