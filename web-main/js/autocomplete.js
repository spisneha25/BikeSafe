var service;

$(document).ready(function() {
    service = new google.maps.places.AutocompleteService();
    
    $("input.txt").keypress(function() {
        console.log(this.value);
        service.getQueryPredictions({ input: this.value }, handleAutocompleteData);
    }).focusout(function() {
        $("#autocomplete-results").slideUp();
    });
});

function handleAutocompleteData(predictions, status) {
    if (status != google.maps.places.PlacesServiceStatus.OK) {
        alert(status);
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
