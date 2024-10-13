// Initialize the map and set view to fit the image
let map = L.map('map', {
    minZoom: -2,
    maxZoom: 2,
    zoomSnap: 0.1,
    crs: L.CRS.Simple,
    zoomControl: false
});

// Add custom zoom control on the right side
L.control.zoom({ position: 'topright' }).addTo(map);

// Adjust bounds to match the map image dimensions
let bounds = [[0,0], [1024,2048]];

L.imageOverlay('img/map.jpeg', bounds).addTo(map); // Use the correct path for map image
map.setView([512, 1024], 0); // Center the map with a better zoom level

// Custom icon images
const icons = {
    normal: L.icon({
        iconUrl: 'img/nativepin.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    }),
    herb: L.icon({
        iconUrl: 'img/nativeherbpin.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    }),
    animal: L.icon({
        iconUrl: 'img/nativeanimalpin.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    })
};

// Load all pins from the server
function loadPinsFromServer() {
    fetch('/pins')
        .then(response => response.json())
        .then(pins => {
            pins.forEach(pin => addMarker(pin));
        })
        .catch(err => console.error('Error loading pins:', err));
}

// Save a pin to the server
function savePinToServer(pin) {
    fetch('/pins', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pin),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Pin saved:', data);
    })
    .catch(err => console.error('Error saving pin:', err));
}

// Load pins when the page is loaded
loadPinsFromServer();

// Add a pin with a selected type
function addPin(type, latlng) {
    let title = prompt('Enter pin title:');
    if (!title) return;

    let description = prompt('Enter pin description:');
    let id = new Date().getTime(); // Unique ID for the pin

    let pin = { id, lat: latlng.lat, lng: latlng.lng, title, description, type };

    // Save pin to server
    savePinToServer(pin);

    // Add the new marker to the map
    addMarker(pin);
}

// Function to add a marker to the map
function addMarker(pin) {
    let marker = L.marker([pin.lat, pin.lng], { icon: icons[pin.type] }).addTo(map)
        .bindPopup(`<b>${pin.title}</b><br>${pin.description}<br><button onclick="confirmRemovePin(${pin.id})">Remove Pin</button>`);
    marker.pinData = pin;
}

// Confirm pin removal
function confirmRemovePin(id) {
    if (confirm('Are you sure you want to remove this pin?')) {
        removePin(id);
    }
}

// Remove pin from map and server
function removePin(id) {
    let pins = JSON.parse(localStorage.getItem('pins')) || [];
    pins = pins.filter(pin => pin.id !== id);
    savePins(pins);

    map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer.pinData && layer.pinData.id === id) {
            map.removeLayer(layer);
        }
    });
}

// Add a click event to the map to add a new pin
map.on('click', function(e) {
    let type = prompt('Enter pin type (normal, herb, animal):');
    if (type && (type === 'normal' || type === 'herb' || type === 'animal')) {
        addPin(type, e.latlng);
    }
});
