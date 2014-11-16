var service;

$(document).ready(function() {
    service = new google.maps.places.AutocompleteService();
    
    $("input.txt").keypress(function() {
        if(this.value.length > 0) {
            service.getQueryPredictions({ input: this.value, bounds:map.getBounds() }, handleAutocompleteData);
        }
    }).focusout(function() {
        $("#autocomplete-results").slideUp();
    });
});

function handleAutocompleteData(predictions, status) {
    if (status != google.maps.places.PlacesServiceStatus.OK) {
        return;
    }
    
    var focused = $(":focus");
    
    $("#autocomplete-results").empty()
        .append(jQuery.map(predictions,function(prediction) {
            return "<div class='prediction-div'>" + prediction.terms[0].value + (prediction.terms.length > 1 ? "<span class='region'>" + prediction.terms[1].value + "</span>" : "") + "</div>";
        }))
        .slideDown();
    
    $(".prediction-div").click(function() {
        focused.val(predictions[$(".prediction-div").index(this)].description);
    });
}
