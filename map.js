var place = null;

function initMap() {
    const input = document.getElementById("locationInput");
    const options = {
        fields: ["place_id", "formatted_address", "name", "address_components", "geometry"],
        strictBounds: false,
        language: "en",
        types: ["(regions)"],
        componentRestrictions: { country: "us" }
    };

    const autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.addListener("place_changed", () => {
        place = autocomplete.getPlace();
        if (getPlaceType(place) == 'city') {
            document.getElementById('milesRangeSearch').classList.remove('d-none');
        } else {
            document.getElementById('milesRangeSearch').classList.add('d-none');
        }
    });
}

window.initMap = initMap;