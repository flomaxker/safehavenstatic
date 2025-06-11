'use strict';
// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', async () => {
    await loadHeader();
    await loadFooter();

    // --- Call initialization functions ---
    initializeMobileNavigation();
    initializeSmoothScrolling();
    initializeScrollAnimations();
    initializeScrollProgressBar();
    initializeUpdateBanner();
    initializeActiveNavLinkHighlighting(); // For index.html
    initializeTestimonialCarousel();
    initializeContactForm();
    initializeFeelingsFlags(); // For feelings-flags.html
    initializeGroningenChecklist(); // For integration-checklist.html
    initializeFAQAccordion(); // For parent FAQs on about page
    initializeImageConnectors(); // Draw playful lines between images
});

// --- Reusable Header Loader ---
async function loadHeader() {
    const headerElement = document.querySelector('header.header');
    if (headerElement) {
        try {
            const response = await fetch('header.html');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const headerHtml = await response.text();
            headerElement.outerHTML = headerHtml;
            highlightActivePageLink();
        } catch (error) {
            console.error('Could not load header: ', error);
        }
    }
}

// --- Reusable Footer Loader ---
async function loadFooter() {
    const footerElement = document.querySelector('footer.footer');
    if (footerElement) {
        try {
            const response = await fetch('footer.html'); // Assumes footer.html is in the root
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const footerHtml = await response.text();
            footerElement.innerHTML = footerHtml;

            // Set Current Year in Footer - This needs to run *after* the footer HTML is loaded
            const yearSpan = footerElement.querySelector('#current-year'); // Query within the newly loaded footer
            if (yearSpan) {
                yearSpan.textContent = new Date().getFullYear();
            }
        } catch (error) {
            console.error("Could not load footer: ", error);
            if (footerElement) {
                footerElement.innerHTML = "<div class='container'><p style='text-align:center; padding: 20px; color: #9ca3af;'>Footer could not be loaded.</p></div>";
            }
        }
    }
}

// --- Highlight Active Link for Sub Pages ---
function highlightActivePageLink() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    if (path === '' || path === 'index.html') return;
    document.querySelectorAll('#nav-menu .nav-link').forEach(link => {
        const hrefPath = (link.getAttribute('href') || '').split('#')[0];
        if (hrefPath === path) {
            link.classList.add('active');
        }
    });
}


// --- Mobile Navigation Toggle ---
function initializeMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        document.addEventListener('click', e => {
            const isClickInsideNav = navMenu.contains(e.target);
            const isClickOnToggle = navToggle.contains(e.target);

            if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
}

// --- Smooth Scrolling & Mobile Menu Close for Nav Links & Hero Button ---
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    const heroButton = document.querySelector('.hero .btn-primary[href="#contact"]');
    const navMenu = document.getElementById('nav-menu'); // For closing mobile menu
    const navToggle = document.getElementById('nav-toggle'); // For resetting icon
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;

    const handleLinkClick = (e, linkElement) => {
        const targetHref = linkElement.getAttribute('href');
        const isIndexPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '';

        if (targetHref && targetHref.includes('#') && (targetHref.startsWith('#') || (isIndexPage && targetHref.startsWith('index.html#')))) {
            const targetId = targetHref.substring(targetHref.indexOf('#'));

            if (isIndexPage && targetId.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const targetPosition = targetElement.offsetTop - headerHeight - 10;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }
        }

        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (navToggle) {
                const icon = navToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => handleLinkClick(e, link));
    });

    if (heroButton) {
        heroButton.addEventListener('click', (e) => handleLinkClick(e, heroButton));
    }
}

// --- Scroll Animations (Intersection Observer) ---
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
    if (animatedElements.length === 0) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0 });

        animatedElements.forEach(el => {
            if (isElementInViewport(el)) {
                el.classList.add('visible');
            } else {
                observer.observe(el);
            }
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        animatedElements.forEach(el => { el.classList.add('visible'); });
    }
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.bottom >= 0 && rect.top <= (window.innerHeight || document.documentElement.clientHeight);
}

// --- Scroll Progress Bar ---
function initializeScrollProgressBar() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    const updateProgress = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
    };

    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    updateProgress();
}

// --- Update Banner ---
function initializeUpdateBanner() {
    const banner = document.getElementById('update-banner');
    if (!banner) return;

    const closeBtn = banner.querySelector('.banner-close');
    const root = document.documentElement;

    const setOffset = () => {
        const height = banner.offsetHeight;
        root.style.setProperty('--banner-height', banner.style.display === 'none' ? '0px' : `${height}px`);
    };

    setOffset();
    window.addEventListener('resize', setOffset);

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            banner.style.display = 'none';
            setOffset();
        });
    }
}

// --- Active Nav Link Highlighting on Scroll (for index.html only) ---
function initializeActiveNavLinkHighlighting() {
    const isIndexPageForNav = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '';
    if (!isIndexPageForNav) return;

    const sections = document.querySelectorAll('main section[id]');
    const navLinksForHighlight = document.querySelectorAll('#nav-menu a.nav-link[href^="#"], #nav-menu a.nav-link[href^="index.html#"]');
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;

    if (sections.length === 0 || navLinksForHighlight.length === 0) return;

    const setActiveLink = () => {
        let currentSectionId = '';
        const scrollY = window.pageYOffset;
        const buffer = headerHeight + 50;

        const homeSection = document.getElementById('home');
        if (homeSection && scrollY < (homeSection.offsetTop + homeSection.offsetHeight - buffer)) {
            currentSectionId = 'home';
        } else {
            sections.forEach(section => {
                const sectionTop = section.offsetTop - buffer;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (sectionId !== 'home' && scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    currentSectionId = sectionId;
                }
            });
        }

        if (!currentSectionId && (window.innerHeight + scrollY) >= document.body.offsetHeight - 150) {
            currentSectionId = 'contact';
        }

        if (!currentSectionId && scrollY < buffer) {
            currentSectionId = 'home';
        }

        navLinksForHighlight.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            const linkHrefId = linkHref ? linkHref.substring(linkHref.indexOf('#') + 1) : null;
            if (linkHrefId && linkHrefId === currentSectionId) {
                link.classList.add('active');
            }
        });
    };

    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(setActiveLink, 150);
    });
    setActiveLink(); // Initial check
}

// --- Testimonial Carousel Logic ---
function initializeTestimonialCarousel() {
    const track = document.querySelector('.testimonial-track');
    const nextButton = document.querySelector('.carousel-btn.next');
    const prevButton = document.querySelector('.carousel-btn.prev');

    if (!track || !nextButton || !prevButton) return;

    const cards = Array.from(track.children);
    if (cards.length === 0) {
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        return;
    }

    let currentIndex = 0;
    const cardCount = cards.length;

    const updateCarousel = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateButtons();
    };

    const updateButtons = () => {
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === cardCount - 1;
    };

    const moveToCard = (index) => {
        currentIndex = Math.max(0, Math.min(index, cardCount - 1));
        updateCarousel();
    };

    nextButton.addEventListener('click', () => moveToCard(currentIndex + 1));
    prevButton.addEventListener('click', () => moveToCard(currentIndex - 1));

    updateCarousel(); // Initial setup
}

// --- Contact Form AJAX Submission ---
function initializeContactForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');

    if (!form || !feedback) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        feedback.textContent = 'Sending...';
        feedback.style.color = 'var(--color-white)';

        const nameInput = form.querySelector('[name="name"]');
        const emailInput = form.querySelector('[name="email"]');
        const messageInput = form.querySelector('[name="message"]');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';
        let errors = [];

        if (!name) errors.push("Name is required.");
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Valid email is required.");
        if (!message) errors.push("Message is required.");

        if (errors.length > 0) {
            feedback.textContent = errors.join(' ');
            feedback.style.color = '#f87171';
            return;
        }

        fetch('contact-handler.php', {
            method: 'POST',
            body: new FormData(form)
        })
        .then(response => {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json().then(data => {
                    if (!response.ok) {
                        throw data;
                    }
                    return data;
                });
            } else {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text || `Server error: ${response.status}`);
                    });
                }
                return response.text();
            }
        })
        .then(data => {
            if (data && data.success) {
                feedback.textContent = 'Thanks for your message! I\'ll be in touch soon.';
                feedback.style.color = 'var(--color-secondary)';
                form.classList.add('sent');
                feedback.classList.add('sent');
                setTimeout(() => {
                    form.classList.remove('sent');
                    feedback.classList.remove('sent');
                    feedback.textContent = '';
                    form.reset();
                }, 1500);
            } else if (data && data.errors) {
                feedback.textContent = data.errors.join(' ');
                feedback.style.color = '#f87171';
            } else {
                feedback.textContent = 'An error occurred. Please try again.';
                feedback.style.color = '#f87171';
            }
        })
        .catch((error) => {
            console.error('Form Submission Error:', error);
            let errorMessage = "Submission failed. Please try WhatsApp/Email.";
            if (error.message) {
                 errorMessage = `Submission failed: ${error.message}. Please try WhatsApp/Email.`;
            } else if (error.errors && Array.isArray(error.errors)) {
                 errorMessage = `Submission failed: ${error.errors.join(' ')}. Please try WhatsApp/Email.`;
            }
            feedback.textContent = errorMessage;
            feedback.style.color = '#f87171';
        });
    });
}


// --- Feelings Flags Logic (feelings-flags.html) ---
function initializeFeelingsFlags() {
    const feelingsContainer = document.querySelector('.flags-container');
    const feelingDisplayArea = document.getElementById('selected-feeling-display');

    if (!feelingsContainer || !feelingDisplayArea) return;

    const dutchWordEl = feelingDisplayArea.querySelector('#display-dutch-word');
    const dutchPhraseEl = feelingDisplayArea.querySelector('#display-dutch-phrase');
    const childMessageEl = feelingDisplayArea.querySelector('#display-child-message');
    const parentTipContainerEl = feelingDisplayArea.querySelector('#display-parent-tip');
    const parentTipH4El = parentTipContainerEl ? parentTipContainerEl.querySelector('h4') : null;
    const parentTipPEl = parentTipContainerEl ? parentTipContainerEl.querySelector('p') : null;

    const allFeelingFlags = feelingsContainer.querySelectorAll('.feeling-flag');

    feelingsContainer.addEventListener('click', (event) => {
        const clickedFlag = event.target.closest('.feeling-flag');
        if (!clickedFlag) return;

        allFeelingFlags.forEach(flag => flag.classList.remove('selected'));
        clickedFlag.classList.add('selected');

        const feelingName = clickedFlag.dataset.feeling || '';
        const dutchWord = clickedFlag.dataset.dutch || '';
        const dutchPhrase = clickedFlag.dataset.dutchPhrase || '';
        const childMessage = clickedFlag.dataset.childMessage || '';
        const parentTip = clickedFlag.dataset.parentTip || '';

        if (dutchWordEl) dutchWordEl.textContent = dutchWord;
        if (dutchPhraseEl) dutchPhraseEl.textContent = dutchPhrase;
        if (childMessageEl) childMessageEl.innerHTML = childMessage;

        if (parentTipH4El) parentTipH4El.textContent = feelingName ? `Tip for Parents when your child feels ${feelingName.toLowerCase()}:` : 'Tip for Parents:';
        if (parentTipPEl) parentTipPEl.textContent = parentTip;

        feelingDisplayArea.classList.remove('hidden-display');

        setTimeout(() => {
            const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
            const targetPosition = feelingDisplayArea.offsetTop - headerHeight - 20;
            window.scrollTo({
                top: targetPosition >= 0 ? targetPosition : 0,
                behavior: 'smooth'
            });
        }, 100);
    });
}


// --- Groningen Checklist Logic (integration-checklist.html) ---
function initializeGroningenChecklist() {
    const checklistPageContainer = document.getElementById('page-checklist'); // Assuming the body has this ID
    if (!checklistPageContainer) { // Check if we are on the checklist page
        // console.log("Not on checklist page, skipping checklist init.");
        return;
    }

    const checklistContainer = document.querySelector('.checklist-container');
    // Select progress bar and text from the document, not within checklistContainer
    const progressBar = document.querySelector('.progress-bar-container .progress-bar');
    const progressText = document.querySelector('.progress-bar-container .progress-text');


    if (!checklistContainer || !progressBar || !progressText) {
        // console.error("Checklist elements not found!");
        return;
    }

    const checklistItems = checklistContainer.querySelectorAll('.checklist-item');
    const totalItems = checklistItems.length;
    const storagePrefix = 'groningenChecklist_';

    if (totalItems === 0) {
        // console.log("No checklist items found.");
        return;
    }

    const updateProgress = () => {
        const checkedInputs = checklistContainer.querySelectorAll('input[type="checkbox"]:checked');
        const checkedItemsCount = checkedInputs.length;
        const percentage = totalItems > 0 ? (checkedItemsCount / totalItems) * 100 : 0;
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${checkedItemsCount} / ${totalItems} Completed (${Math.round(percentage)}%)`;
    };

    const handleCheckboxChange = (checkbox) => {
        const itemElement = checkbox.closest('.checklist-item');
        if (!itemElement) return;

        const itemId = itemElement.getAttribute('data-item-id');
        const detailsElement = itemElement.querySelector('.checklist-details');

        if (checkbox.checked) {
            itemElement.classList.add('checked');
            if (detailsElement) detailsElement.style.display = 'block';
            if (itemId) localStorage.setItem(storagePrefix + itemId, 'checked');
        } else {
            itemElement.classList.remove('checked');
            if (detailsElement) detailsElement.style.display = 'none';
            if (itemId) localStorage.removeItem(storagePrefix + itemId);
        }
        updateProgress();
    };

    checklistItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const detailsElement = item.querySelector('.checklist-details');
        const itemId = item.getAttribute('data-item-id');

        if (checkbox && itemId) {
            if (localStorage.getItem(storagePrefix + itemId) === 'checked') {
                checkbox.checked = true;
                item.classList.add('checked');
                if (detailsElement) detailsElement.style.display = 'block';
            } else {
                checkbox.checked = false;
                item.classList.remove('checked');
                if (detailsElement) detailsElement.style.display = 'none';
            }
            checkbox.addEventListener('change', (event) => {
                handleCheckboxChange(event.target);
            });
        }
    });
    updateProgress(); // Initial update
}

// --- FAQ Accordion Logic (about.html) ---
function initializeFAQAccordion() {
    const faqCards = document.querySelectorAll('.faq-card');
    if (!faqCards.length) return;

    faqCards.forEach(card => {
        const question = card.querySelector('.faq-question');
        if (!question) return;
        question.addEventListener('click', () => {
            card.classList.toggle('open');
        });
    });
}

// --- Image Connector Lines ---
function initializeImageConnectors() {
    const svg = document.getElementById('image-connectors');
    const images = document.querySelectorAll('.content-image img');
    if (!svg || images.length < 2) return;

    const radius = 20;
    const draw = () => {
        svg.setAttribute('height', document.body.scrollHeight);
        svg.innerHTML = '';

        images.forEach((img, index) => {
            if (index === images.length - 1) return;
            const startRect = img.getBoundingClientRect();
            const endRect = images[index + 1].getBoundingClientRect();

            const startX = startRect.left + startRect.width / 2 + window.scrollX;
            const startY = startRect.bottom + window.scrollY;
            const endX = endRect.left + endRect.width / 2 + window.scrollX;
            const endY = endRect.top + window.scrollY;

            const midY = startY + (endY - startY) / 2;

            let d;
            if (index % 2 === 0) {
                const dir = endX > startX ? 1 : -1;
                d = `M ${startX} ${startY} L ${startX} ${midY - radius}` +
                    ` Q ${startX} ${midY} ${startX + dir * radius} ${midY}` +
                    ` L ${endX - dir * radius} ${midY}` +
                    ` Q ${endX} ${midY} ${endX} ${midY + radius}` +
                    ` L ${endX} ${endY}`;
            } else {
                const offset = 30;
                const midX = (startX + endX) / 2;
                const dir1 = midX > startX ? 1 : -1;
                const dir2 = endX > midX ? 1 : -1;
                d =
                    `M ${startX} ${startY}` +
                    ` L ${startX} ${midY - offset - radius}` +
                    ` Q ${startX} ${midY - offset} ${startX + dir1 * radius} ${midY - offset}` +
                    ` L ${midX - dir1 * radius} ${midY - offset}` +
                    ` Q ${midX} ${midY - offset} ${midX} ${midY - offset + radius}` +
                    ` L ${midX} ${midY + offset - radius}` +
                    ` Q ${midX} ${midY + offset} ${midX + dir2 * radius} ${midY + offset}` +
                    ` L ${endX - dir2 * radius} ${midY + offset}` +
                    ` Q ${endX} ${midY + offset} ${endX} ${midY + offset + radius}` +
                    ` L ${endX} ${endY}`;
            }

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('class', 'connector-line');
            svg.appendChild(path);
        });
    };
    // Expose draw function globally so other scripts can trigger a redraw
    window.drawImageConnectors = draw;

    const readiness = Array.from(images, img => ({
        loaded: img.complete,
        animated: img.closest('.content-image')?.classList.contains('visible') || false
    }));

    const checkAndDraw = (index) => {
        if (index === 0) return; // First image has no preceding connector
        const state = readiness[index];
        if (state.loaded && state.animated) {
            draw();
        }
    };

    images.forEach((img, index) => {
        const container = img.closest('.content-image');
        if (!container) return;

        if (!readiness[index].loaded) {
            img.addEventListener('load', () => {
                readiness[index].loaded = true;
                checkAndDraw(index);
            }, { once: true });
        }

        if (!readiness[index].animated) {
            container.addEventListener('transitionend', (e) => {
                if (e.propertyName === 'transform') {
                    readiness[index].animated = true;
                    checkAndDraw(index);
                }
            }, { once: true });

            if (container.classList.contains('visible')) {
                readiness[index].animated = true;
                checkAndDraw(index);
            }
        } else {
            checkAndDraw(index);
        }
    });

    // Final draw after all images and animations (fallback)
    window.addEventListener('load', () => {
        draw();
    });
    // Recalculate once assets like fonts/images have loaded for reduced motion
    window.addEventListener('resize', draw);
    let scrollScheduled = false;
    window.addEventListener('scroll', () => {
        if (scrollScheduled) return;
        scrollScheduled = true;
        requestAnimationFrame(() => {
            draw();
            scrollScheduled = false;
        });
    });
}
