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

// Custom icon images with increased size
const icons = {
    normal: L.icon({
        iconUrl: 'img/nativepin.png',
        iconSize: [48, 48],  // Increased size for better visibility
        iconAnchor: [24, 48]  // Adjust anchor to keep icon aligned
    }),
    herb: L.icon({
        iconUrl: 'img/nativeherbpin.png',
        iconSize: [48, 48],  // Increased size for better visibility
        iconAnchor: [24, 48]
    }),
    animal: L.icon({
        iconUrl: 'img/nativeanimalpin.png',
        iconSize: [48, 48],  // Increased size for better visibility
        iconAnchor: [24, 48]
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

// Save a pin to the server (with optional screenshot)
function savePinToServer(pin, file) {
    const formData = new FormData();
    formData.append('pin', JSON.stringify(pin));
    if (file) {
        formData.append('screenshot', file);
    }

    fetch('/pins', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Pin saved:', data);
    })
    .catch(err => console.error('Error saving pin:', err));
}

// Load pins when the page is loaded
loadPinsFromServer();

// Add a pin with a selected type and optional screenshot
function addPin(type, latlng) {
    let title = prompt('Enter pin title:');
    if (!title) return;

    let description = prompt('Enter pin description:');
    let screenshot = document.createElement('input');
    screenshot.type = 'file';
    screenshot.accept = 'image/*';
    screenshot.click();  // Open the file dialog to upload a screenshot

    screenshot.onchange = function() {
        let file = screenshot.files[0];  // Get the uploaded file

        let id = new Date().getTime(); // Unique ID for the pin
        let pin = { id, lat: latlng.lat, lng: latlng.lng, title, description, type };

        // Save pin with optional screenshot
        savePinToServer(pin, file);

        // Add the new marker to the map
        addMarker(pin, URL.createObjectURL(file));  // Create a local URL for the uploaded image
    };
}

// Function to add a marker to the map (with optional image thumbnail)
function addMarker(pin, thumbnailUrl = null) {
    let popupContent = `<b>${pin.title}</b><br>${pin.description}`;
    
    if (thumbnailUrl) {
        popupContent += `<br><img src="${thumbnailUrl}" alt="Screenshot" class="thumbnail" style="width: 50px; height: 50px; cursor: pointer;" onclick="showFullscreenImage('${thumbnailUrl}')">`;
    }

    let marker = L.marker([pin.lat, pin.lng], { icon: icons[pin.type] }).addTo(map)
        .bindPopup(popupContent);
    marker.pinData = pin;
}

// Function to display full image in a modal
function showFullscreenImage(imageUrl) {
    const fullscreenModal = document.getElementById('fullscreenModal');
    const fullscreenImage = document.getElementById('fullscreenImage');
    fullscreenImage.src = imageUrl;
    fullscreenModal.style.display = 'flex';
}

// Close fullscreen modal when X button is clicked
document.getElementById('closeFullscreenModal').addEventListener('click', function() {
    document.getElementById('fullscreenModal').style.display = 'none';
});

// Modal functionality for selecting pin type
const modal = document.getElementById('pinModal');
const closeModalBtn = document.getElementById('closeModal');
let selectedLatLng = null;

// Show modal when user clicks on the map
map.on('click', function(e) {
    selectedLatLng = e.latlng;  // Store the clicked location
    modal.style.display = 'flex';  // Show the modal
});

// Close the modal and add the pin when user selects a pin type
document.getElementById('normalPin').addEventListener('click', function() {
    addPin('normal', selectedLatLng);
    modal.style.display = 'none';  // Hide the modal
});

document.getElementById('herbPin').addEventListener('click', function() {
    addPin('herb', selectedLatLng);
    modal.style.display = 'none';  // Hide the modal
});

document.getElementById('animalPin').addEventListener('click', function() {
    addPin('animal', selectedLatLng);
    modal.style.display = 'none';  // Hide the modal
});

// Close modal if user clicks the "X" button
closeModalBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});
