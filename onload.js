window.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        let html = document.getElementsByTagName('html');
        html[0].setAttribute('data-bs-theme', 'dark');
    } else {
        let html = document.getElementsByTagName('html');
        html[0].setAttribute('data-bs-theme', 'light');
    }
});

window.onload = (_event) => {
    addEventListenerToAddButton();
    addEventListenerToPostRange();
    addEventListenerToShipWithinRange();
    addEventListenerToMilesSearchRange();
    checkInitData();
};

function checkInitData() {
    if (Telegram.WebApp.initData) {
        getAuthToken();
    } else {
        alert("Please open this page via Telegram bot");
        return;
    }
}

//tooltip init
const miwe = new bootstrap.Tooltip(document.getElementById('miwe'));
const noea = new bootstrap.Tooltip(document.getElementById('noea'));
const nowe = new bootstrap.Tooltip(document.getElementById('nowe'));
const sout = new bootstrap.Tooltip(document.getElementById('sout'));
const soea = new bootstrap.Tooltip(document.getElementById('soea'));
const sowe = new bootstrap.Tooltip(document.getElementById('sowe'));

//const bsOffcanvas = new bootstrap.Offcanvas('#searchFilters');

function addEventListenerToAddButton() {
    let button = document.getElementById('addLocationButton');
    button.addEventListener("click", function() {
        let input = document.getElementById('locationInput');
        if (input.value != '') {
            let locationsDiv = document.getElementById('locations');
            let cityElement = createLocation();
            locationsDiv.appendChild(cityElement);
            document.getElementById('milesRangeSearch').classList.add('d-none');
            input.value = "";

        }
    });
}

function addEventListenerToShipWithinRange() {
    let input = document.getElementById('readyToShip');
    let text = document.getElementById('readyToShipText');
    input.addEventListener("input", function() {
        if (input.value == -1) {
            text.innerHTML = 'any time';
        } else if (input.value == 0) {
            text.innerHTML = 'today';
        } else {
            text.innerHTML = input.value + ' day(s)';
        }
    });
}

function addEventListenerToPostRange() {
    let input = document.getElementById('postRange');
    let text = document.getElementById('postRangeText');
    input.addEventListener("input", function() {
        if (input.value == 0) {
            text.innerHTML = 'all time';
        } else {
            text.innerHTML = input.value + ' hour(s)';
        }
    });
}

function addEventListenerToMilesSearchRange() {
    let input = document.getElementById('searchRange');
    let text = document.getElementById('searchRangeText');
    input.addEventListener("input", function() {
        text.innerHTML = input.value + 'mi';
    });
}

function getPlaceType(placeObj) {
    if (placeObj.address_components.find(a => a.types.includes('locality')) !== undefined) {
        return 'city';
    } else {
        return 'state';
    }
}

function getPayloadData() {
    let locations = Array.from(document.querySelectorAll('#locations input')).map(loc => ({
        name: loc.getAttribute('data-name'),
        id: loc.getAttribute('data-id'),
        type: loc.getAttribute('data-type'),
        scope: loc.getAttribute('data-scope'),
        range: loc.getAttribute('data-range'),
        state: loc.getAttribute('data-state'),
        latitude: loc.getAttribute('data-latitude'),
        longitude: loc.getAttribute('data-longitude')
    }));
    let postRange = document.getElementById('postRange').value;
    let vehicleTypes = Array.from(document.querySelectorAll('#vehicleTypes input:checked')).map(c => c.value);
    let trailerType = document.getElementById('trailerType').value;
    let vehicleStatus = document.getElementById('vehicleStatus').value;
    let minVehicles = document.getElementById('minVehicles').value;
    let maxVehicles = document.getElementById('maxVehicles').value;
    let readyToShip = document.getElementById('readyToShip').value;
    let paymentType = document.getElementById('paymentType').value;
    let minTotal = document.getElementById('minTotal').value;
    let minPpm = document.getElementById('minPpm').value;
    let token = localStorage.getItem('token');
    return {
        token,
        locations,
        postRange,
        vehicleTypes,
        trailerType,
        vehicleStatus,
        minVehicles,
        maxVehicles,
        readyToShip,
        paymentType,
        minTotal,
        minPpm
    }
}

function createRegion(option) {
    let locationsDiv = document.getElementById('locations');
    let item = document.createElement('div');
    item.classList.add('input-group');
    item.innerHTML = `<button class="btn btn-outline-secondary" type="button" onclick="switchLocationType(this)">PU</button>
                    <input disabled type="text" class="form-control" data-name="${option.innerHTML}" data-type="region" data-scope="Pickup" data-range="0" data-state=${option.value} value="${option.innerHTML}">
                    <button class="btn btn-outline-secondary" type="button" onclick="removeLocation(this)">Remove</button>`;
    let region = item;
    locationsDiv.appendChild(region);
}

function createLocation() {
    let placeType = getPlaceType(place);
    let item = document.createElement('div');
    item.classList.add('input-group');
    let locationName = document.getElementById('locationInput').value;
    item.innerHTML = `<button class="btn btn-outline-secondary" type="button" onclick="switchLocationType(this)">PU</button>
                    <input disabled type="text" class="form-control" data-name="${getNameAttr(place)}" data-id="${place.place_id}" data-latitude="${place.geometry.location.lat()}" data-longitude="${place.geometry.location.lng()}" data-type="${placeType}" data-scope="Pickup" data-range="${getRangeAttr(placeType)}" data-state="${getStateAttr(place)}" value="${locationName + (placeType == 'city' && getRangeAttr(placeType) != 0 ? `, ${getRangeAttr(placeType)}mi` : '')}">
                    <button class="btn btn-outline-secondary" type="button" onclick="removeLocation(this)">Remove</button>`;
    return item;
}

function getRangeAttr(locType){
    if (locType == 'city'){
        return document.getElementById('searchRange').value;
    }
    else{
        return 0;
    }
}

function getStateAttr(loc){
    let placeType = getPlaceType(loc);
    if (placeType == 'city')
    {
        return loc.address_components.find(a => a.types.includes('administrative_area_level_1')).short_name;
    }
    else{
        return '';
    }
}

function getNameAttr(loc){
    let placeType = getPlaceType(loc);
    if (placeType == 'city')
    {
        return loc.address_components.find(a => a.types.includes('locality')).short_name;
    }
    else{
        return loc.address_components.find(a => a.types.includes('administrative_area_level_1')).short_name;
    }
}

function removeLocation(button) {
    button.parentElement.remove();
}

function switchLocationType(button) {
    if (button.innerHTML == 'PU') {
        button.nextElementSibling.setAttribute('data-scope', 'Delivery');
        button.innerHTML = 'DEL';
    }
    else {
        button.nextElementSibling.setAttribute('data-scope', 'Pickup');
        button.innerHTML = 'PU';
    }
}

async function sendPayload() {
    let minVehicles = document.getElementById('minVehicles').value;
    let maxVehicles = document.getElementById('maxVehicles').value;
    if (minVehicles > maxVehicles)
    {
        alert("Min vehicles amount cannot be greater than max vehicles amount!");
        return;
    }
    let payload = getPayloadData();
    Telegram.WebApp.sendData(JSON.stringify(payload));
}

//requests

const baseAddress = "https://7e0c-80-245-80-200.ngrok-free.app/web"
let token = '';
function getAuthToken(){
    axios.post(baseAddress + "/validate", Telegram.WebApp.initData)
    .then(function (response){
        token = response;
    });
}