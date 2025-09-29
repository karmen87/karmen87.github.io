let projectData = {};
let filteredDialogIds = [];
let filteredProjectIds = [];

// Fetch project data from JSON file
fetch('projects.json')
    .then(response => response.json())
    .then(data => {
        projectData = data;
        // Any functions that need projectData to be loaded should be called from here
        setupObserver();
        createFilterButtons('graphical', ['All', 'elevation', 'butterfly view', 'dependency view', 'Design World']);
        createFilterButtons('dialogs', ['All', 'Management', 'Use Cases', 'Configurations', 'Reporting']);
        filterProjects('graphical', 'All');
        filterProjects('dialogs', 'All');
    })
    .catch(error => console.error('Error loading project data:', error));

const thumbnailWidth = 286; // 270px + 16px gap
const visibleThumbnails = 4;

const galleries = {
    graphical: {
        container: 'galleryContainer',
        counterTextElement: 'galleryCounterText',
        position: 0,
        ids: ['graph1', 'graph2', 'graph3', 'graph4', 'graph5', 'graph6', 'graph7', 'graph8', 'graph11', 'graph12', 'graph13', 'graph14', 'graph15']
    },
    dialogs: {
        container: 'dialogsGalleryContainer',
        counterTextElement: 'dialogsGalleryCounterText',
        position: 0,
        ids: ['dialog1', 'dialog7', 'dialog8', 'dialog9', 'dialog10', 'dialog11', 'dialog12', 'dialog13', 'dialog14', 'dialog15', 'dialog17', 'dialog18', 'dialog19', 'dialog20', 'dialog21', 'dialog22', 'dialog23']
    }
};

function scrollGallery(galleryName, direction) {
    const gallery = galleries[galleryName];
    const container = document.getElementById(gallery.container);
    const maxScroll = (gallery.filteredTotal - visibleThumbnails) * thumbnailWidth;

    if (direction === 'left') {
        gallery.position = Math.max(0, gallery.position - thumbnailWidth);
    } else {
        gallery.position = Math.min(maxScroll, gallery.position + thumbnailWidth);
    }

    container.scrollLeft = gallery.position;
    updateGalleryCounter(galleryName);
}

function updateGalleryCounter(galleryName) {
    const gallery = galleries[galleryName];
    const startIndex = Math.floor(gallery.position / thumbnailWidth) + 1;
    const endIndex = Math.min(startIndex + visibleThumbnails - 1, gallery.filteredTotal);
    console.log('updating counter', galleryName, gallery.filteredTotal);
    document.getElementById(gallery.counterTextElement).textContent = `${startIndex}-${endIndex} of ${gallery.filteredTotal}`;
}


// Add these variables at the start of your script
let currentProjectId = null;

// Replace your current openModal function with this
function openModal(projectId) {
    currentProjectId = projectId;
    const modal = document.getElementById('imageModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalDescription = document.getElementById('modalDescription');
    const container = document.getElementById('imageContainer');
    
    const project = projectData[projectId];
    if (!project) return;

    modalTitle.textContent = project.title;
    modalDescription.textContent = project.description;
    
    if (project.image) {
        modalImage.src = project.image;
        modalImage.alt = project.title;
        modalImage.classList.remove('hidden');
        modalImage.classList.remove('zoomed');
        container.classList.remove('zoomed');
        container.scrollLeft = 0;
        container.scrollTop = 0;
        // Reset image styles for centering
        modalImage.style.width = '';
        modalImage.style.height = '';
        modalImage.style.maxWidth = '90vw';
        modalImage.style.maxHeight = '80vh';
    }
    
    // Reset zoom when opening new image
    currentZoom = 1;
    modalImage.style.transform = `scale(${currentZoom})`;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const container = document.getElementById('imageContainer');
    
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Reset zoom and panning
    currentZoom = 1;
    modalImage.style.transform = `scale(${currentZoom})`;
    modalImage.classList.remove('zoomed');
    container.classList.remove('zoomed');
    container.scrollLeft = 0;
    container.scrollTop = 0;
}

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Function to open PDF documents
function openPDF(url) {
    window.open(url, '_blank');
}

// Add the navigation function
function navigateModal(direction) {
    event.stopPropagation();
    
    const isDialogGallery = currentProjectId.startsWith('dialog');
    const currentArray = isDialogGallery ? filteredDialogIds : filteredProjectIds;
    
    const currentIndex = currentArray.indexOf(currentProjectId);
    let nextIndex;
    
    if (direction === 'prev') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : currentArray.length - 1;
    } else {
        nextIndex = currentIndex < currentArray.length - 1 ? currentIndex + 1 : 0;
    }
    
    currentProjectId = currentArray[nextIndex];
    openModal(currentProjectId);
}

// keyboard navigation
document.addEventListener('keydown', function(e) {
    if (!document.getElementById('imageModal').classList.contains('hidden')) {
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowLeft') {
            navigateModal('prev');
        } else if (e.key === 'ArrowRight') {
            navigateModal('next');
        }
    }
});

// Update these zoom-related variables
let currentZoom = 1;
const maxZoom = 3;
const minZoom = 0.5;
const zoomStep = 0.4; // Changed from 0.3 to 0.4 for 140% initial zoom

function zoomImage(direction) {
    event.stopPropagation();
    const modalImage = document.getElementById('modalImage');
    const container = document.getElementById('imageContainer');
    const previousZoom = currentZoom;

    // Get natural size
    const naturalWidth = modalImage.naturalWidth;
    const naturalHeight = modalImage.naturalHeight;

    // Store the current center point (relative to the image) before zooming
    const scrollLeftRatio = container.scrollLeft / modalImage.offsetWidth;
    const scrollTopRatio = container.scrollTop / modalImage.offsetHeight;

    if (direction === 'in' && currentZoom < maxZoom) {
        currentZoom = Math.min(maxZoom, currentZoom + zoomStep);
    } else if (direction === 'out' && currentZoom > minZoom) {
        currentZoom = Math.max(minZoom, currentZoom - zoomStep);
    }

    if (currentZoom > 1) {
        modalImage.classList.add('zoomed');
        container.classList.add('zoomed');
        modalImage.style.width = (naturalWidth * currentZoom) + 'px';
        modalImage.style.height = (naturalHeight * currentZoom) + 'px';
        modalImage.style.maxWidth = 'none';
        modalImage.style.maxHeight = 'none';

        // Maintain the same relative scroll position after zooming
        setTimeout(() => {
            container.scrollLeft = scrollLeftRatio * modalImage.offsetWidth;
            container.scrollTop = scrollTopRatio * modalImage.offsetHeight;
        }, 0);
    } else {
        modalImage.classList.remove('zoomed');
        container.classList.remove('zoomed');
        modalImage.style.width = '';
        modalImage.style.height = '';
        modalImage.style.maxWidth = '90vw';
        modalImage.style.maxHeight = '80vh';
        container.scrollLeft = 0;
        container.scrollTop = 0;
    }
}

// Update closeModal function to reset panning
function closeModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const container = document.getElementById('imageContainer');
    
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Reset zoom and panning
    currentZoom = 1;
    modalImage.style.transform = `scale(${currentZoom})`;
    modalImage.classList.remove('zoomed');
    container.classList.remove('zoomed');
    container.scrollLeft = 0;
    container.scrollTop = 0;
}

function setupObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        item.classList.add('hidden-initial');
        observer.observe(item);
    });
}

function createFilterButtons(galleryName, categories) {
    const container = document.getElementById(`${galleryName}FilterContainer`);

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.classList.add('px-4', 'py-2', 'text-sm', 'font-medium', 'text-slate-600', 'bg-white', 'border', 'border-slate-200', 'rounded-full', 'hover:bg-slate-50', 'transition-colors', 'shadow-sm');
        button.onclick = () => filterProjects(galleryName, category);
        container.appendChild(button);
    });
}

function filterProjects(galleryName, category) {
    const gallery = galleries[galleryName];
    const container = document.getElementById(gallery.container);
    const items = container.querySelectorAll('.gallery-thumbnail');
    let count = 0;
    let filteredIds = [];

    items.forEach(item => {
        const projectId = item.getAttribute('onclick').match(/\('([^\)]+)'\)/)[1];
        const project = projectData[projectId];

        if (category === 'All' || project.category === category) {
            item.style.display = 'block';
            count++;
            filteredIds.push(projectId);
        } else {
            item.style.display = 'none';
        }
    });

    if (galleryName === 'dialogs') {
        filteredDialogIds = filteredIds;
    } else {
        filteredProjectIds = filteredIds;
    }

    gallery.filteredTotal = count;
    gallery.position = 0;
    container.scrollLeft = 0;
    updateGalleryCounter(galleryName);
}

document.addEventListener('DOMContentLoaded', function() {
// Prevent modal from closing when clicking inside it
document.querySelector('#imageModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});
});

modalImage.onload = function() {
modalImage.style.width = '';
modalImage.style.height = '';
modalImage.style.maxWidth = '90vw';
modalImage.style.maxHeight = '80vh';
currentZoom = 1;
};

// Add panning functionality
let isDragging = false;
let startX, startY, scrollLeftStart, scrollTopStart;

document.getElementById('imageContainer').addEventListener('mousedown', (e) => {
if (currentZoom > 1) {
    isDragging = true;
    startX = e.pageX;
    startY = e.pageY;
    scrollLeftStart = document.getElementById('imageContainer').scrollLeft;
    scrollTopStart = document.getElementById('imageContainer').scrollTop;
    document.getElementById('imageContainer').style.cursor = 'grabbing';
}
});

document.addEventListener('mousemove', (e) => {
if (!isDragging) return;
e.preventDefault();
const x = e.pageX;
const y = e.pageY;
const walkX = (startX - x);
const walkY = (startY - y);
document.getElementById('imageContainer').scrollLeft = scrollLeftStart + walkX;
document.getElementById('imageContainer').scrollTop = scrollTopStart + walkY;
});

document.addEventListener('mouseup', () => {
isDragging = false;
document.getElementById('imageContainer').style.cursor = currentZoom > 1 ? 'move' : 'default';
});