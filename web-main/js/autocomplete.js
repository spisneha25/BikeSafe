var service;

$(document).ready(function() {
    service = new google.maps.places.AutocompleteService();
    
});

/*$("input.txt").change(function() {
//      service.getQueryPredictions({ input: $(this).value }, callback);
    })*/

$("input.txt").focusout(function() {
        $("#autocomplete-results").slideUp();
        alert("here!");
    });