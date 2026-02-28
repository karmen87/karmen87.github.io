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
        createFilterButtons('graphical', ['All', 'elevation', 'butterfly view', 'dependency view', 'design world']);
        createFilterButtons('dialogs', ['All', 'management', 'use cases', 'configurations', 'reporting']);
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
        button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
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

        if (category === 'All' || (project.category && project.category.toLowerCase() === category.toLowerCase())) {
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

// Add panning functionality
let isDragging = false;
let startX, startY, scrollLeftStart, scrollTopStart;

document.addEventListener('DOMContentLoaded', function() {
    // Prevent modal from closing when clicking inside it
    const imageModal = document.querySelector('#imageModal');
    if (imageModal) {
        imageModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }

    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        modalImage.onload = function() {
            modalImage.style.width = '';
            modalImage.style.height = '';
            modalImage.style.maxWidth = '90vw';
            modalImage.style.maxHeight = '80vh';
            currentZoom = 1;
        };
    }

    const imageContainer = document.getElementById('imageContainer');
    if (imageContainer) {
        imageContainer.addEventListener('mousedown', (e) => {
            if (currentZoom > 1) {
                isDragging = true;
                startX = e.pageX;
                startY = e.pageY;
                scrollLeftStart = imageContainer.scrollLeft;
                scrollTopStart = imageContainer.scrollTop;
                imageContainer.style.cursor = 'grabbing';
            }
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX;
        const y = e.pageY;
        const walkX = (startX - x);
        const walkY = (startY - y);
        if (imageContainer) {
            imageContainer.scrollLeft = scrollLeftStart + walkX;
            imageContainer.scrollTop = scrollTopStart + walkY;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        if (imageContainer) {
            imageContainer.style.cursor = currentZoom > 1 ? 'move' : 'default';
        }
    });

    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // Resume dropdown toggle
    const resumeButton = document.getElementById('resume-dropdown-button');
    const resumeDropdown = document.getElementById('resume-dropdown');

    if (resumeButton && resumeDropdown) {
        resumeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            resumeDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!resumeButton.contains(e.target) && !resumeDropdown.contains(e.target)) {
                resumeDropdown.classList.add('hidden');
            }
        });

        // Close dropdown after clicking a resume link
        const resumeLinks = resumeDropdown.querySelectorAll('a');
        resumeLinks.forEach(link => {
            link.addEventListener('click', function() {
                resumeDropdown.classList.add('hidden');
            });
        });
    }

    // Skills accordion functionality with auto-close
    const accordionButtons = document.querySelectorAll('.skill-accordion-btn');
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const arrow = this.querySelector('svg');
            const isCurrentlyOpen = !content.classList.contains('hidden');

            // Close all other accordions
            accordionButtons.forEach(otherButton => {
                if (otherButton !== button) {
                    const otherTargetId = otherButton.getAttribute('data-target');
                    const otherContent = document.getElementById(otherTargetId);
                    const otherArrow = otherButton.querySelector('svg');

                    otherContent.classList.add('hidden');
                    otherArrow.style.transform = 'rotate(0deg)';
                }
            });

            // Toggle current accordion
            if (isCurrentlyOpen) {
                content.classList.add('hidden');
                arrow.style.transform = 'rotate(0deg)';
            } else {
                content.classList.remove('hidden');
                arrow.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Back to top button functionality
    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.add('opacity-0', 'invisible');
                backToTopButton.classList.remove('opacity-100', 'visible');
            }
        });

        // Scroll to top when clicked
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Work Experience Modal Functions
const workExperienceData = {
    crypto: {
        title: "Cryptocurrency Trading & DeFi Consultant",
        company: "Predictor",
        period: "2022 - Present",
        location: "Remote",
        description: "Develop algorithmic trading bots and cryptocurrency trading infrastructure for personal trading operations.",
        bullets: [
            "Developed algorithmic trading bots for cryptocurrency futures and perpetuals on MEXC exchange",
            "Built automated trading strategies using Hummingbot framework for cryptocurrency markets",
            "Operated personal cryptocurrency mining infrastructure as part of Predictor trading operations",
            "Monitored trading systems 24/7 with team ensuring execution reliability and system uptime",
            "Co-authored whitepaper content for power perpetuals DeFi protocol (project discontinued in initial phase)",
            "Conducted research and analysis on DeFi protocol risks, vulnerabilities, and trading strategies",
            "Implemented risk management systems for cryptocurrency trading operations",
            "Analyzed on-chain data and cryptocurrency market trends for trading decisions"
        ]
    },
    planetirm: {
        title: "Product Owner",
        company: "Planet IRM",
        period: "Jul 2015 - Jun 2023",
        location: "Remote",
        description: "Product Owner for Planet IRM NexGen, enterprise cloud-based infrastructure management platform serving Fortune 500 companies and U.S. Department of Defense agencies.",
        sections: [
            {
                heading: "Product Development & Technical Leadership:",
                bullets: [
                    "Designed 125+ UI/UX mockups in Balsamiq defining feature specifications for front-end and back-end development teams",
                    "Worked with Object Model data architecture framework describing object structure, relations, and properties",
                    "Collaborated with 10-15 engineers across multiple time zones on system architecture and technical implementation",
                    "Attended almost all engineering and architecture meetings to understand technical implementation deeply",
                    "Participated in database design conversations and data modeling discussions with engineering teams",
                    "Contributed to technical architecture discussions for cloud platform migration"
                ]
            },
            {
                heading: "Technical Documentation & Specifications:",
                bullets: [
                    "Authored 1,800+ pages of comprehensive technical documentation across 28 product versions",
                    "Created detailed technical specifications and design documents used by development teams for feature implementation",
                    "Documented complex system architecture, REST API integrations, and deployment workflows",
                    "Created detailed release notes (30+ pages each) documenting features, bug fixes, and system changes",
                    "Researched and proposed API documentation approach using Swagger/OpenAPI specification"
                ]
            },
            {
                heading: "Integration & Quality Assurance:",
                bullets: [
                    "Created mockups and documented integration features with third-party enterprise systems (Fluke Networks LinkWare Live, BMC Helix ITSM, ServiceNow)",
                    "Attended integration design meetings with engineering teams and external partners",
                    "Conducted acceptance testing and quality validation for new features",
                    "Established version control processes for documentation using Dr.Explain, GitBook, and Wikipages"
                ]
            },
            {
                heading: "Stakeholder Collaboration:",
                bullets: [
                    "Worked closely with CTO and stakeholders on product strategy and feature prioritization",
                    "Served as primary product contact for enterprise clients and government agencies",
                    "Improved user self-service capabilities through comprehensive documentation"
                ]
            }
        ]
    },
    i3annotate: {
        title: "Software Project Manager",
        company: "i3Annotate",
        period: "Mar 2017 - Dec 2018",
        location: "Remote",
        description: "Led Agile development of multi-platform touchscreen annotation application for business and education from prototype to production release.",
        bullets: [
            "Led 6-person development team (contractors and direct reports) through full project lifecycle",
            "Managed hiring, performance reviews, and team coordination",
            "Defined project scope, milestones, and resource allocation",
            "Managed dependencies and stakeholder expectations",
            "Established testing workflows and validation processes across iOS, Android, Windows, and Mac platforms",
            "Served as primary liaison between technical teams, non-technical departments, and clients",
            "Managed Agile ceremonies including sprint planning, daily standups, retrospectives, and release planning",
            "Tracked and reported project metrics, risks, and progress to executive stakeholders",
            "Delivered project on-time and within budget"
        ]
    },
    tradfi: {
        title: "Traditional Finance Trading Consultant",
        company: "Predictor",
        period: "2016 - 2020",
        location: "Remote",
        description: "Built algorithmic trading infrastructure for traditional financial markets.",
        bullets: [
            "Developed algorithmic trading infrastructure for traditional financial markets",
            "Built market data processing pipelines and order execution systems",
            "Implemented risk management and monitoring systems for trading operations",
            "Created data analysis tools for trading strategy backtesting and optimization",
            "Developed real-time market data processing systems",
            "Built automated trading strategies and signal generation systems"
        ]
    },
    neos: {
        title: "Software Developer",
        company: "Neos",
        period: "Jul 2011 - Jul 2015",
        location: "Remote",
        description: "Developed algorithmic trading systems, SCADA infrastructure, and ERP solutions.",
        bullets: [
            "Built Python-based algorithmic trading infrastructure and market data processing systems for financial markets",
            "Developed real-time data pipelines for market data ingestion, processing, and analysis",
            "Implemented trading signals and order execution systems",
            "Developed SCADA system components for public lighting infrastructure management",
            "Created data pipelines for real-time market data processing",
            "Implemented SQL databases and optimized query performance for trading systems",
            "Developed ERP system modules for business process automation"
        ]
    }
};

function openWorkExperience(id) {
    const data = workExperienceData[id];
    if (!data) return;

    const modal = document.getElementById('workExperienceModal');
    const content = document.getElementById('workExperienceContent');

    let html = `
        <h2 class="text-3xl font-bold text-slate-900 mb-2">${data.title}</h2>
        <p class="text-xl text-slate-600 mb-1">${data.company}</p>
        <p class="text-lg text-slate-500 mb-4">${data.period} | ${data.location}</p>
        <p class="text-slate-700 mb-6 text-lg">${data.description}</p>
    `;

    if (data.sections) {
        // For Planet IRM with multiple sections
        data.sections.forEach(section => {
            html += `
                <h3 class="text-xl font-semibold text-slate-900 mt-6 mb-3">${section.heading}</h3>
                <ul class="list-disc list-outside ml-6 space-y-2">
            `;
            section.bullets.forEach(bullet => {
                html += `<li class="text-slate-700">${bullet}</li>`;
            });
            html += `</ul>`;
        });
    } else if (data.bullets) {
        // For other positions with simple bullet lists
        html += `<ul class="list-disc list-outside ml-6 space-y-2">`;
        data.bullets.forEach(bullet => {
            html += `<li class="text-slate-700">${bullet}</li>`;
        });
        html += `</ul>`;
    }

    content.innerHTML = html;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeWorkExperience() {
    const modal = document.getElementById('workExperienceModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('workExperienceModal');
        if (!modal.classList.contains('hidden')) {
            closeWorkExperience();
        }
    }
});