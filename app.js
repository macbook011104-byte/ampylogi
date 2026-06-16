/* ==========================================================================
   AMPY LOGI - Frontend Interactions, Calculator, Themes & AI Chatbot
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Menu Toggler
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav');

    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            nav.classList.toggle('open');
        });

        // Close menu when clicking navigation links (mobile UX)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                nav.classList.remove('open');
            });
        });
    }

    // 2. Theme Switcher (Dark Mode / Light Mode)
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeToggleBtnMobile = document.getElementById('themeToggleMobile');
    
    const setTheme = (isLight) => {
        if (isLight) {
            document.body.classList.add('light-mode');
            if (themeToggleBtn) themeToggleBtn.innerHTML = '☀️';
            if (themeToggleBtnMobile) themeToggleBtnMobile.innerHTML = '☀️';
            localStorage.setItem('ampy_theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            if (themeToggleBtn) themeToggleBtn.innerHTML = '🌙';
            if (themeToggleBtnMobile) themeToggleBtnMobile.innerHTML = '🌙';
            localStorage.setItem('ampy_theme', 'dark');
        }
    };

    // Initialize Theme from localStorage
    const savedTheme = localStorage.getItem('ampy_theme');
    
    // Default to Light (White Theme) if no preference is saved yet
    if (savedTheme === 'dark') {
        setTheme(false);
    } else {
        setTheme(true);
    }


    // Click listeners
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = document.body.classList.contains('light-mode');
            setTheme(!isLight);
        });
    }
    if (themeToggleBtnMobile) {
        themeToggleBtnMobile.addEventListener('click', () => {
            const isLight = document.body.classList.contains('light-mode');
            setTheme(!isLight);
        });
    }


    // 3. Services Interactive Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');

            const targetTabId = btn.getAttribute('data-tab');
            const targetPanel = document.getElementById(targetTabId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // 4. Stats Count-Up Animation (on scroll intersection)
    const statsSection = document.getElementById('stats');
    const statNums = document.querySelectorAll('.stat-num');
    let animated = false;

    const startCountUp = () => {
        statNums.forEach(num => {
            const target = parseInt(num.getAttribute('data-target'), 10);
            const duration = 1500; // ms
            const stepTime = 30; // ms
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    num.textContent = target + '+';
                    clearInterval(timer);
                } else {
                    num.textContent = Math.floor(current) + '+';
                }
            }, stepTime);
        });
    };

    if ('IntersectionObserver' in window && statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    startCountUp();
                    animated = true;
                }
            });
        }, { threshold: 0.3 });

        statsObserver.observe(statsSection);
    } else {
        setTimeout(startCountUp, 500);
    }


    // 5. Bill Number Custom Tracking Simulator
    const trackBtn = document.getElementById('trackBtn');
    const billInput = document.getElementById('billNumberInput');
    
    // Elements to update
    const trackId = document.getElementById('trackId');
    const trackRoute = document.getElementById('trackRoute');
    const trackStatus = document.getElementById('trackStatus');
    const trackerProgress = document.getElementById('trackerProgress');
    
    // Checkpoint nodes
    const cpPickup = document.getElementById('cp-pickup');
    const cpSorting = document.getElementById('cp-sorting');
    const cpTransit = document.getElementById('transitCheckpoint');
    const cpDelivery = document.getElementById('cp-delivery');

    // Database of mock tracking records
    const trackingDb = {
        'AL-1001': {
            id: 'AL-1001-MUM',
            route: 'Bengaluru ➔ Mumbai',
            status: 'In Transit',
            progress: '75%',
            checkpoints: { pickup: true, sorting: true, transit: 'transit', delivery: false }
        },
        'AL-2002': {
            id: 'AL-2002-DEL',
            route: 'Chennai ➔ New Delhi',
            status: 'Delivered',
            progress: '100%',
            checkpoints: { pickup: true, sorting: true, transit: 'active', delivery: true }
        },
        'AL-3003': {
            id: 'AL-3003-HYD',
            route: 'Kolkata ➔ Hyderabad',
            status: 'Packaging Scheduled',
            progress: '25%',
            checkpoints: { pickup: true, sorting: false, transit: false, delivery: false }
        }
    };

    const updateTrackerVisual = (record) => {
        trackId.textContent = record.id;
        trackRoute.textContent = record.route;
        trackStatus.textContent = record.status;
        trackerProgress.style.width = record.progress;

        // Reset check points
        [cpPickup, cpSorting, cpTransit, cpDelivery].forEach(cp => {
            cp.className = 'checkpoint';
        });

        // Set states
        if (record.checkpoints.pickup) cpPickup.classList.add('active');
        if (record.checkpoints.sorting) cpSorting.classList.add('active');
        
        if (record.checkpoints.transit === 'transit') {
            cpTransit.classList.add('transit');
        } else if (record.checkpoints.transit === 'active') {
            cpTransit.classList.add('active');
        }
        
        if (record.checkpoints.delivery) cpDelivery.classList.add('active');
    };

    if (trackBtn && billInput) {
        trackBtn.addEventListener('click', () => {
            const query = billInput.value.trim().toUpperCase();
            if (!query) {
                alert('Please enter a Bill Number first.');
                return;
            }

            if (trackingDb[query]) {
                updateTrackerVisual(trackingDb[query]);
            } else {
                // Return "Not Found" state
                trackId.textContent = 'NOT FOUND';
                trackRoute.textContent = 'Unknown Route';
                trackStatus.textContent = 'Invalid ID';
                trackerProgress.style.width = '0%';
                [cpPickup, cpSorting, cpTransit, cpDelivery].forEach(cp => {
                    cp.className = 'checkpoint';
                });
                alert('Order ID not found! Try AL-1001 or AL-2002.');
            }
        });
    }

    // Default simulation loops if no search is active
    let progress = 50;
    const simInterval = setInterval(() => {
        // Only loop mock simulation if search box is empty to prevent overriding customer input
        if (billInput && billInput.value === '') {
            progress += 5;
            if (progress > 100) {
                progress = 25;
                cpTransit.className = 'checkpoint';
            } else if (progress >= 75) {
                cpTransit.className = 'checkpoint active';
            } else if (progress >= 50) {
                cpTransit.className = 'checkpoint transit';
            }
            trackerProgress.style.width = `${progress}%`;
        }
    }, 2000);



    // 7. FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQs
                faqItems.forEach(i => i.classList.remove('active'));
                
                // Toggle active on clicked one
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });


    // 8. Help Section - Tab switcher for Client, Vendor, and General Contact forms
    const queryTabBtns = document.querySelectorAll('.query-tab-btn');
    const queryForms = document.querySelectorAll('.query-form-panel');
    const formStatus = document.getElementById('formStatus');

    queryTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            queryTabBtns.forEach(b => b.classList.remove('active'));
            queryForms.forEach(f => f.classList.remove('active'));

            btn.classList.add('active');
            
            const targetFormId = btn.getAttribute('data-form');
            const targetForm = document.getElementById(targetFormId);
            if (targetForm) {
                targetForm.classList.add('active');
            }
            // Clear status
            if (formStatus) {
                formStatus.textContent = '';
                formStatus.className = 'form-status';
            }
        });
    });

    // 9. Help Section - AJAX Form Submissions
    const handleFormSubmit = (formId, getPayload) => {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const spinner = form.querySelector('.formSpinner');
            const submitBtn = form.querySelector('.querySubmitBtn');

            if (formStatus) {
                formStatus.textContent = '';
                formStatus.className = 'form-status';
            }
            if (spinner) spinner.style.display = 'inline-block';
            if (submitBtn) submitBtn.disabled = true;

            const payload = getPayload(form);

            try {
                // Dynamic endpoint routing (relative path allows local and online environments to work seamlessly)
                const response = await fetch('/api/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok) {
                    if (formStatus) {
                        formStatus.textContent = result.message || 'Query submitted successfully!';
                        formStatus.classList.add('success');
                    }
                    form.reset();
                } else {
                    if (formStatus) {
                        formStatus.textContent = result.error || 'Failed to submit query.';
                        formStatus.classList.add('error');
                    }
                }
            } catch (err) {
                console.error(err);
                if (formStatus) {
                    formStatus.textContent = 'Query logged locally! (Local server offline, fallback saving active).';
                    formStatus.classList.add('success');
                }
                
                // Save offline locally in localStorage
                const offline = JSON.parse(localStorage.getItem('ampy_offline_queries') || '[]');
                offline.push({ ...payload, timestamp: new Date().toISOString() });
                localStorage.setItem('ampy_offline_queries', JSON.stringify(offline));
                form.reset();
            } finally {
                if (spinner) spinner.style.display = 'none';
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    };

    // Attach listeners
    handleFormSubmit('clientQueryForm', (form) => {
        return {
            category: form.querySelector('#clientCategory').value,
            name: form.querySelector('#clientName').value.trim(),
            email: form.querySelector('#clientEmail').value.trim(),
            message: form.querySelector('#clientMessage').value.trim()
        };
    });

    handleFormSubmit('vendorQueryForm', (form) => {
        const vendorName = form.querySelector('#vendorCompanyName').value.trim();
        const contactName = form.querySelector('#vendorContactName').value.trim();
        const phone = form.querySelector('#vendorPhone').value.trim();
        const email = form.querySelector('#vendorEmail').value.trim();
        const vehicle = form.querySelector('#vendorVehicle').value.trim();
        const city = form.querySelector('#vendorCity').value.trim();
        const message = form.querySelector('#vendorMessage').value.trim();

        return {
            category: 'B2V',
            name: `${contactName} (${vendorName})`,
            email: email,
            message: `[VENDOR REGISTRATION]\nPhone: ${phone}\nVehicle: ${vehicle || 'N/A'}\nCity: ${city}\nNotes: ${message}`
        };
    });


    // 10. Interactive Offerings Modal Details
    const offeringCards = document.querySelectorAll('.offering-card');
    const detailsModal = document.getElementById('detailsModal');
    const modalClose = document.getElementById('modalClose');
    const modalTitle = document.getElementById('modalTitle');
    const modalIconContainer = document.getElementById('modalIconContainer');
    const modalBody = document.getElementById('modalBody');

    const offeringsData = {
        'b2b': {
            title: 'B2B Corporate Logistics',
            iconClass: 'icon-b2b',
            description: 'Standardized corporate logistics operations designed to scale your enterprise distribution and relocate office resources safely.',
            features: [
                { title: 'Employee Shifting Programs', desc: 'Managed door-to-door shifting packages for corporate team relocations.' },
                { title: 'Office & Infrastructure Migration', desc: 'Secure packing and moving of servers, workstations, office files, and furniture.' },
                { title: 'B2B Distribution Channels', desc: 'Coordinated freight movements serving FMCG, Electronics, Pharma, and Solar equipment industries.' },
                { title: 'Dedicated SLAs & Account Managers', desc: 'Single-point billing accountability, digital invoice tracking, and contract compliance.' }
            ]
        },
        'b2c': {
            title: 'B2C Household Shifting',
            iconClass: 'icon-b2c',
            description: 'Safe, stress-free household relocation services featuring pre-screened packers and transparent price quotes.',
            features: [
                { title: 'Local & Intercity Shifting', desc: 'Dependable moving crews equipped for relocations within the same city or across states.' },
                { title: 'Premium Multi-Layer Packaging', desc: 'Using thick bubble wraps, foam rolls, and wooden crates for delicate goods.' },
                { title: 'Vehicle Carrier Transit', desc: 'Dedicated closed container carriers for moving two-wheelers and family cars safely.' },
                { title: 'End-to-End Managed Execution', desc: 'Active order monitoring from loading to final unpacking with damage support policies.' }
            ]
        },
        'b2v': {
            title: 'B2V Vendor Operations',
            iconClass: 'icon-b2v',
            description: 'Empowering local transport drivers, packing operators, and loaders with regular demand flow and modern logistics technology.',
            features: [
                { title: 'Consistent Load Matching', desc: 'Minimize empty return trips with automated notifications for shifting requests along your routes.' },
                { title: 'Fast Settlement Cycles', desc: 'Enjoy reliable, scheduled payouts and transparent transaction processing.' },
                { title: 'Technology Enablement', desc: 'Access mobile app tracking, dispatch planners, and digital proof-of-delivery tools.' },
                { title: 'Rigorous Network Verification', desc: 'Join an elite aggregate network of background-verified logistics agencies in India.' }
            ]
        }
    };

    if (offeringCards.length > 0 && detailsModal) {
        offeringCards.forEach(card => {
            card.addEventListener('click', () => {
                const type = card.getAttribute('data-offering');
                const data = offeringsData[type];
                
                if (data) {
                    modalTitle.textContent = data.title;
                    const cardIconSvg = card.querySelector('.offering-icon').innerHTML;
                    modalIconContainer.className = `modal-icon-container ${data.iconClass}`;
                    modalIconContainer.innerHTML = cardIconSvg;
                    
                    let bodyHtml = `<p>${data.description}</p>`;
                    bodyHtml += `<ul class="modal-features-list">`;
                    data.features.forEach(f => {
                        bodyHtml += `
                            <li>
                                <span class="modal-check">✓</span>
                                <div>
                                    <h5>${f.title}</h5>
                                    <p>${f.desc}</p>
                                </div>
                            </li>
                        `;
                    });
                    bodyHtml += `</ul>`;
                    modalBody.innerHTML = bodyHtml;
                    detailsModal.classList.add('open');
                }
            });
        });
    }

    const closeModal = () => {
        if (detailsModal) {
            detailsModal.classList.remove('open');
        }
    };

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (detailsModal) {
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) {
                closeModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

