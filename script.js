/* script.js */
document.addEventListener('DOMContentLoaded', function () {
    // --- Navigation ---
    const navItems = document.querySelectorAll('.nav-item');
    const authNav = document.getElementById('auth-nav');
    const mainNav = document.getElementById('main-nav');
    let currentSection = 'signup'; // Default section changed to signup

    function showSection(sectionId) {
        document.querySelectorAll('.password-manager-section, .auth-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(sectionId + '-section').style.display = 'block';
        currentSection = sectionId;
        updateNavStyles();
    }

    function updateNavStyles() {
        navItems.forEach(navItem => {
            navItem.classList.remove('active');
            if (navItem.dataset.section === currentSection) {
                navItem.classList.add('active');
            }
        });
    }

    navItems.forEach(navItem => {
        navItem.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            showSection(sectionId);
        });
    });

    // --- Authentication Toggle ---
    document.getElementById('signup-link').addEventListener('click', function(event) {
        event.preventDefault();
        authNav.style.display = 'flex';
        mainNav.style.display = 'none';
        showSection('signup');
    });

    document.getElementById('login-link').addEventListener('click', function(event) {
        event.preventDefault();
        authNav.style.display = 'flex';
        mainNav.style.display = 'none';
        showSection('login');
    });

    // --- Password Visibility Toggle ---
    document.querySelectorAll('.password-container .password-toggle, .edit-vault-box .password-container .password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '👁️' : '👁️‍🗨️'; // Using Unicode eye icon
        });
    });

    // --- Password Strength Indicator (Sign-up Form) ---
    const signupPasswordInput = document.getElementById('signup-password');
    const passwordStrengthIndicator = document.getElementById('password-strength-indicator');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');

    if (signupPasswordInput) { // Check if the element exists before adding listener
        signupPasswordInput.addEventListener('input', function() {
            let strength = 0;
            const password = signupPasswordInput.value;
            if (password.length > 0) {
                passwordStrengthIndicator.style.display = 'block'; // Show indicator when typing
            } else {
                passwordStrengthIndicator.style.display = 'none'; // Hide if no input
            }

            if (password.length >= 8) strength += 1;
            if (password.match(/[a-z]+/)) strength += 1;
            if (password.match(/[A-Z]+/)) strength += 1;
            if (password.match(/[0-9]+/)) strength += 1;
            if (password.match(/[^a-zA-Z0-9]+/)) strength += 1;

            let strengthPercentage = (strength / 5) * 100;
            strengthBar.style.width = `${strengthPercentage}%`;

            if (strengthPercentage < 25) {
                strengthText.textContent = 'Strength: Very Weak';
                strengthBar.style.backgroundColor = 'red';
            } else if (strengthPercentage < 50) {
                strengthText.textContent = 'Strength: Weak';
                strengthBar.style.backgroundColor = 'orange';
            } else if (strengthPercentage < 75) {
                strengthText.textContent = 'Strength: Medium';
                strengthBar.style.backgroundColor = 'yellow';
            } else if (strengthPercentage < 90) {
                strengthText.textContent = 'Strength: Strong';
                strengthBar.style.backgroundColor = 'green';
            } else {
                strengthText.textContent = 'Strength: Very Strong';
                strengthBar.style.backgroundColor = 'darkgreen';
            }
        });
    }


    // --- Generate Password Button ---
    const generatePasswordButton = document.getElementById('generate-password-button');
    const editGeneratePasswordButton = document.getElementById('edit-generate-password-button');


    if (generatePasswordButton) {
        generatePasswordButton.addEventListener('click', function() {
            const newPassword = generatePassword();
            document.getElementById('vault-password').value = newPassword;
        });
    }
    if (editGeneratePasswordButton) {
        editGeneratePasswordButton.addEventListener('click', function() {
            const newPassword = generatePassword();
            document.getElementById('edit-vault-password').value = newPassword;
        });
    }


    function generatePassword() {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\:;?><,./-=";
        let password = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        return password;
    }

    // --- Vault Form Submission ---
    const addVaultForm = document.getElementById('add-vault-form');
    addVaultForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const vaultTitle = document.getElementById('vault-title').value;
        const vaultUsername = document.getElementById('vault-username').value;
        const vaultEmail = document.getElementById('vault-email').value;
        const vaultPassword = document.getElementById('vault-password').value;
        const vaultPin = document.getElementById('vault-pin').value;
        const vaultImageInput = document.getElementById('vault-image'); // Get file input

        const useUsername = document.getElementById('use-username').checked;
        const useEmail = document.getElementById('use-email').checked;
        const usePinCheckbox = document.getElementById('use-pin'); // Get checkbox element

        let automaticIcon = null; // Initialize automatic icon /* REMOVED AUTOMATIC ICON LOGIC */


        const reader = new FileReader(); // FileReader for image upload
        let imageDataBase64 = null; // Variable to store base64 image data

        reader.onload = function (e) {
            imageDataBase64 = e.target.result; // Store base64 data

            const newVault = {
                title: vaultTitle,
                username: useUsername ? vaultUsername : null,
                email: useEmail ? vaultEmail : null,
                password: vaultPassword,
                pin: usePinCheckbox.checked ? vaultPin : null, // Correct PIN saving logic - using checkbox directly
                imageData: imageDataBase64, // Store image data
                automaticIcon: automaticIcon // Store automatic icon type /* REMOVED AUTOMATIC ICON LOGIC */
            };

            saveVault(newVault);
            displayVaults();
            addVaultForm.reset();

            // Reset optional fields and checkboxes after submit
            resetOptionalFields();

            // Show notification
            showNotification("Vault created successfully!", "success");
        }

        const file = vaultImageInput.files[0]; // Get the uploaded file
        if (file) {
            if (file.type.startsWith('image/') && file.size <= 20 * 1024 * 1024) { // Increased to 20MB
                if (['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].includes(file.type)) {
                    reader.readAsDataURL(file); // Read file as base64
                } else {
                    alert('Invalid image file. Please select an image file (png, jpg, jpeg, gif, webp) under 20MB.');
                    return; // Prevent form submission
                }
            } else {
                alert('Invalid image file. Please select an image file (png, jpg, jpeg, gif, webp) under 20MB.');
                return; // Prevent form submission
            }
        } else {
            reader.onload( { target: { result: null } }); // Proceed without image if no file selected
        }


    });

    // --- Remove Vault Image ---
    const removeVaultImageButton = document.getElementById('remove-vault-image');
    if (removeVaultImageButton) {
        removeVaultImageButton.addEventListener('click', function(event) {
            event.preventDefault();
            document.getElementById('vault-image').value = ''; // Clear the file input
            // Also clear the image data in the newVault object if it exists
            imageDataBase64 = null;
        });
    }

    const removeEditVaultImageButton = document.getElementById('remove-edit-vault-image');
    if (removeEditVaultImageButton) {
        removeEditVaultImageButton.addEventListener('click', function(event) {
            event.preventDefault();
            document.getElementById('edit-vault-image').value = ''; // Clear the file input
            // Also clear the image data in the edit form's vault object if it exists
            // This requires access to the vaults array and the vaultIndexToEdit
            if (vaults && vaultIndexToEdit !== null && vaults[vaultIndexToEdit]) {
                vaults[vaultIndexToEdit].imageData = null;
            }
            // Update local storage and display
            localStorage.setItem('vaults', JSON.stringify(vaults));
            displayVaults();
        });
    }

    function resetOptionalFields() {
        document.querySelectorAll('.optional-checkbox input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('.optional-field').forEach(field => {
            field.style.display = 'none';
            field.querySelectorAll('input').forEach(input => input.value = ''); // Clear input values in optional fields
        });
    }

    // --- Local Storage Vault Functions ---
    function saveVault(vault) {
        let vaults = loadVaults() || [];
        vaults.push(vault);
        localStorage.setItem('vaults', JSON.stringify(vaults));
    }

    function loadVaults() {
        const vaultsData = localStorage.getItem('vaults');
        return vaultsData ? JSON.parse(vaultsData) : [];
    }

    function displayVaults() {
        const vaults = loadVaults();
        const vaultsContainer = document.getElementById('vaults-container');
        vaultsContainer.innerHTML = ''; // Clear existing vaults

        if (vaults.length === 0) {
            vaultsContainer.innerHTML = '<p>No vaults added yet.</p>';
            return;
        }

        vaults.forEach((vault, index) => {
            const vaultItem = document.createElement('div');
            vaultItem.classList.add('vault-item');

            const vaultHeader = document.createElement('div');
            vaultHeader.classList.add('vault-header');

            // Vault Icon Container
            const iconContainer = document.createElement('div');
            iconContainer.classList.add('vault-item-icon');

            if (vault.imageData) {
                // Display uploaded image
                const img = document.createElement('img');
                img.src = vault.imageData;
                img.alt = `${vault.title} Icon`;
                img.loading = "lazy"; // Add lazy loading
                iconContainer.appendChild(img);
            } else {
                // Default icon or placeholder if no image
                iconContainer.textContent = '🔒'; // Example default icon - you can change this
            }
            vaultHeader.appendChild(iconContainer);

            const vaultTitle = document.createElement('h3');
            vaultTitle.textContent = vault.title;
            vaultHeader.appendChild(vaultTitle);

            vaultItem.appendChild(vaultHeader);

            const vaultDetails = document.createElement('div');
            vaultDetails.classList.add('vault-details');
            vaultDetails.innerHTML = `
                <p><strong>Username:</strong> ${vault.username || 'N/A'}</p>
                <p><strong>Email:</strong> ${vault.email || 'N/A'}</p>
                <p class="password-display" style="margin-bottom: 8px;">
                    <strong>Password:</strong>
                    <span class="password-dots">••••••••</span>
                    <span class="password-text" style="display:none;">${vault.password}</span>
                    <button class="action-button show-password-button" style="padding: 5px 10px; font-size: 0.8em; margin-left: 5px;">Show</button>
                </p>
                <div class="vault-actions">
                    <button class="action-button edit-button" data-index="${index}">Edit</button>
                    <button class="action-button delete-button" data-index="${index}">Delete</button>
                </div>
            `;
            vaultItem.appendChild(vaultDetails);
            vaultsContainer.appendChild(vaultItem);
        });

        attachVaultListEventListeners(); // Re-attach event listeners after re-displaying vaults
    }

    function attachVaultListEventListeners() {

        document.querySelectorAll('.show-password-button').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault(); // Prevent form submission if button is inside a form
                const vaultItem = this.closest('.vault-item');
                const passwordDots = vaultItem.querySelector('.password-dots');
                const passwordTextSpan = vaultItem.querySelector('.password-text');
                const showPasswordButton = this; // Renamed for clarity

                const vaultIndex = parseInt(this.closest('.vault-item').querySelector('.edit-button').dataset.index, 10); // Get index from edit button, parse as integer

                if (showPasswordButton.textContent === 'Show') { // Condition for "Show" action
                    if (vaultHasPin(vaultIndex)) {
                        requestPinForAction(vaultIndex, 'revealPassword', function() { // Request PIN for revealPassword action
                            passwordDots.style.display = 'none'; // Hide dots
                            passwordTextSpan.style.display = 'inline'; // Show text
                            showPasswordButton.textContent = 'Hide'; // Change button text to 'Hide'
                        });
                    } else {
                        passwordDots.style.display = 'none'; // Hide dots
                        passwordTextSpan.style.display = 'inline'; // Show text
                        showPasswordButton.textContent = 'Hide'; // Change button text to 'Hide'
                    }
                } else { // Condition for "Hide" action
                    passwordDots.style.display = 'inline'; // Show dots
                    passwordTextSpan.style.display = 'none'; // Hide text
                    showPasswordButton.textContent = 'Show'; // Change button text back to 'Show'
                }
            });
        });


        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index, 10); // Parse index as integer
                if (vaultHasPin(index)) {
                    requestPinForAction(index, 'editVault', function() { // Request PIN for editVault action
                        openEditVaultOverlay(index); // Open edit overlay after PIN verification
                    });
                } else {
                    openEditVaultOverlay(index); // Directly open edit overlay if no PIN
                }
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.dataset.index;
                if (vaultHasPin(index)) {
                    requestPinForAction(index, 'deleteVault', function() { // Request PIN for deleteVault action
                        deleteVault(index); // Proceed with deletion only after PIN is verified
                    });
                } else {
                    deleteVault(index); // Directly delete if no PIN
                }
            });
        });
    }

    function deleteVault(index) {
        let vaults = loadVaults();
        vaults.splice(index, 1);
        localStorage.setItem('vaults', JSON.stringify(vaults));
        displayVaults();
    }


    // --- PIN Request Overlay ---
    const pinRequestOverlay = document.getElementById('pin-request-overlay');
    const pinInput = document.getElementById('pin-input');
    const submitPinButton = document.getElementById('submit-pin-button');
    const cancelPinButton = document.getElementById('cancel-pin-button');
    let currentVaultIndex = null;
    let pinRequestCallback = null; // Callback function to execute after PIN submission
    let pinActionType = null; // Store action type: 'revealPassword' or 'editVault'


    function requestPinForAction(index, actionType, callback) {
        currentVaultIndex = index;
        pinRequestOverlay.style.display = 'flex';
        pinInput.value = ''; // Clear previous input
        pinInput.focus();
        pinRequestCallback = callback; // Store the callback function
        pinActionType = actionType; // Store action type

        if (actionType === 'revealPassword' && !vaultHasPin(index)) { // Immediately reveal password if no PIN is set for reveal action
            revealPassword(index);
            pinRequestOverlay.style.display = 'none'; // Hide overlay immediately
            currentVaultIndex = null;
            return; // Exit function early
        }
    }

    submitPinButton.addEventListener('click', function() {
        const enteredPin = pinInput.value;
        if (validatePin(enteredPin, currentVaultIndex)) {
            pinRequestOverlay.style.display = 'none';
            if (pinRequestCallback) {
                pinRequestCallback(); // Execute the callback function
                pinRequestCallback = null; // Clear the callback after execution
            }
            currentVaultIndex = null;
            pinActionType = null; // Clear action type
        } else {
            alert('Incorrect PIN. Please try again.');
        }
    });

    cancelPinButton.addEventListener('click', function() {
        pinRequestOverlay.style.display = 'none';
        currentVaultIndex = null;
        pinRequestCallback = null; // Clear callback on cancel
        pinActionType = null; // Clear action type
    });

    function validatePin(enteredPin, vaultIndex) {
        const vaults = loadVaults();
        const vault = vaults[vaultIndex];
        return vault && vault.pin === enteredPin; // Correct PIN validation
    }

    function vaultHasPin(vaultIndex) {
        const vaults = loadVaults();
        const vault = vaults[vaultIndex];
        return vault && vault.pin !== null && vault.pin !== ""; // Check if PIN is not null and not empty string
    }


    function revealPassword(vaultIndex) {
        const vaults = loadVaults();
        const vault = vaults[vaultIndex];
        if (vault && vault.password) {
            alert(`Password for ${vault.title}: ${vault.password}`);
        }
    }

    // --- Edit Vault Overlay ---
    const editVaultOverlay = document.getElementById('edit-vault-overlay');
    const editVaultForm = document.getElementById('edit-vault-form');
    const cancelEditButton = document.getElementById('cancel-edit-button');
    let vaultIndexToEdit = null;
    const editPinVerifySection = document.getElementById('edit-pin-verify-section');


    function openEditVaultOverlay(index) {
        vaultIndexToEdit = index;
        const vaults = loadVaults();
        const vault = vaults[index];

        if (!vault) return; // Exit if vault not found

        editVaultOverlay.style.display = 'flex'; // Show the overlay FIRST

        // Add a small delay before populating the form fields
        setTimeout(function() {
            // Populate form fields
            const editVaultTitleInput = document.getElementById('edit-vault-title');
            const editVaultUsernameInput = document.getElementById('edit-vault-username');
            const editVaultEmailInput = document.getElementById('edit-vault-email');
            const editVaultPasswordInput = document.getElementById('edit-vault-password');
            const editVaultPinInput = document.getElementById('edit-vault-pin');
            const editUsePinCheckbox = document.getElementById('edit-use-pin');
            const editVaultImageInput = document.getElementById('edit-vault-image');


            if (editVaultTitleInput) editVaultTitleInput.value = vault.title;
            if (editVaultUsernameInput) editVaultUsernameInput.value = vault.username || '';
            if (editVaultEmailInput) editVaultEmailInput.value = vault.email || '';
            if (editVaultPasswordInput) editVaultPasswordInput.value = vault.password || '';
            if (editVaultPinInput) editVaultPinInput.value = vault.pin || '';
            if (editUsePinCheckbox) editUsePinCheckbox.checked = vault.pin !== null && vault.pin !== "";
            if (editVaultImageInput) editVaultImageInput.value = ''; // Clear any previous value in edit form


            // Handle PIN verification display
            if (vault.pin) {
                editPinVerifySection.style.display = 'block';
            } else {
                editPinVerifySection.style.display = 'none';
            }
            document.getElementById('edit-pin-field').style.display = document.getElementById('edit-use-pin').checked ? 'block' : 'none';
        }, 100); // Increased delay to 100ms (you can try 200 if still issues)
    }


    editVaultForm.addEventListener('submit', function(event) {
        event.preventDefault();

        console.log("Edit Vault Form Submitted!"); // Debugging log

        const vaults = loadVaults();
        if (!vaults[vaultIndexToEdit]) {
            console.error("Vault index to edit is invalid:", vaultIndexToEdit); // Debugging log
            return;
        }

        const vault = vaults[vaultIndexToEdit]; // Get the vault to edit

        const verifyPinInput = document.getElementById('edit-verify-pin');
        let pinVerified = true; // Assume verified if no PIN or PIN change not attempted

        if (vault.pin && editPinVerifySection.style.display === 'block') {
            if (verifyPinInput.value !== vault.pin) {
                alert('Incorrect current PIN.');
                pinVerified = false;
            }
        }


        if (pinVerified) {
            const editVaultTitle = document.getElementById('edit-vault-title').value;
            const editVaultUsername = document.getElementById('edit-vault-username').value;
            const editVaultEmail = document.getElementById('edit-vault-email').value;
            const editVaultPassword = document.getElementById('edit-vault-password').value;
            const editVaultPin = document.getElementById('edit-vault-pin').value;
            const editVaultImageInput = document.getElementById('edit-vault-image'); // Get file input in edit form

            console.log("PIN Verified (or not required), proceeding with save."); // Debugging log

            const reader = new FileReader(); // FileReader for image upload in edit form
            let imageDataBase64 = vault.imageData; // Default to existing image


            reader.onload = function (e) {
                imageDataBase64 = e.target.result; // Store base64 data from edit form

                vaults[vaultIndexToEdit] = {
                    ...vault, // Keep existing data and overwrite below
                    title: editVaultTitle,
                    username: editVaultUsername,
                    email: editVaultEmail,
                    password: editVaultPassword,
                    pin: document.getElementById('edit-use-pin').checked ? editVaultPin : null,
                    imageData: imageDataBase64 // Use new or existing image data
                };

                console.log("Vault data updated:", vaults[vaultIndexToEdit]); // Debugging log

                localStorage.setItem('vaults', JSON.stringify(vaults));
                displayVaults();
                editVaultOverlay.style.display = 'none';
                vaultIndexToEdit = null;
                editVaultForm.reset(); // reset the form
                editPinVerifySection.style.display = 'none'; // Hide verify section after successful edit

                // Show notification
                showNotification("Vault changes saved successfully!", "success");
            }


            const file = editVaultImageInput.files[0]; // Get the uploaded file in edit form
            if (file) {
                if (file.type.startsWith('image/') && file.size <= 20 * 1024 * 1024) { // Increased to 20MB
                    reader.readAsDataURL(file); // Read file as base64
                } else {
                    alert('Invalid image file. Please select an image file (png, jpg, jpeg, gif) under 20MB in edit form.');
                    return; // Prevent form submission
                }
            } else {
                 reader.onload({ target: { result: vault.imageData } }); // Proceed with existing image if no new file selected in edit form
            }


        } else {
            console.log("PIN Verification Failed, edit not saved."); // Debugging log
        }


    });

    cancelEditButton.addEventListener('click', function() {
        editVaultOverlay.style.display = 'none';
        vaultIndexToEdit = null;
        editVaultForm.reset(); // Optionally reset the form on cancel as well
        editPinVerifySection.style.display = 'none'; // Hide verify section on cancel
    });

    // --- Log Out Button Functionality with Confirmation ---
    document.querySelector('.nav-item[data-section="logout"]').addEventListener('click', function(event) {
        event.preventDefault();
        if (confirm('Are you sure you want to log out?')) { // Confirmation dialog
            // Clear vaults from local storage (optional, depending on desired logout behavior)
            // localStorage.removeItem('vaults');

            // Reset navigation to authentication state
            authNav.style.display = 'flex';
            mainNav.style.display = 'none';
            showSection('signup'); // Show signup section after logout

            // Hide 'Accounts' and 'Settings' nav items
            const navListItems = mainNav.querySelectorAll('ul.nav-list li.nav-item');
            if (navListItems.length > 0) {
                navListItems[1].style.display = 'none'; // Hide 'Accounts'
                navListItems[3].style.display = 'none'; // Hide 'Settings'
            }

            displayVaults(); // Re-display vaults (will be empty if localStorage was cleared, or show existing if not)
        } else {
            // User cancelled logout, do nothing or provide feedback
            alert('Logout cancelled.'); // Optional: provide feedback that logout was cancelled
        }
    });


    document.getElementById('edit-use-pin').addEventListener('change', function() {
        document.getElementById('edit-pin-field').style.display = this.checked ? 'block' : 'none';
        if (vaults[vaultIndexToEdit] && vaults[vaultIndexToEdit].pin) {
            editPinVerifySection.style.display = this.checked ? 'block' : 'none'; // Show verify pin only if vault had pin and use pin is checked again
        } else {
             editPinVerifySection.style.display = 'none'; // Hide verify pin if vault had no pin or use pin is unchecked
        }

    });


    // --- Optional Fields Visibility ---
    document.querySelectorAll('.optional-checkbox input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const fieldId = this.id.substring(4); // e.g., remove 'use-' from 'use-username' to get 'username'
            const field = document.getElementById(fieldId + '-field');
            field.style.display = this.checked ? 'block' : 'none';
        });
    });

    // --- Login Form Submission ---  // ADDED LOGIN FORM SUBMISSION and NAVIGATION ITEMS VISIBILITY
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        authNav.style.display = 'none'; // Hide auth navigation
        mainNav.style.display = 'flex'; // Show main navigation
        showSection('vault'); // Go to vault section

        // Make 'Accounts' and 'Settings' nav items visible
        const navListItems = mainNav.querySelectorAll('ul.nav-list li.nav-item');
        if (navListItems.length > 0) {
            navListItems[1].style.display = 'block'; // Show 'Accounts' - it's the 2nd item (index 1)
            navListItems[3].style.display = 'block'; // Show 'Settings' - it's the 4th item (index 3)
        }
    });


    // --- Initial Display ---
    mainNav.style.display = 'none'; // Hide main nav initially
    authNav.style.display = 'flex'; // Show auth nav initially
    showSection('signup'); // Show signup section by default
    displayVaults(); // Display any saved vaults on load

    // --- Notification Function ---
    function showNotification(message, type) {
        const notificationDiv = document.createElement('div');
        notificationDiv.classList.add('notification');
        notificationDiv.classList.add(type); // 'success' or 'error'
        notificationDiv.textContent = message;
        document.body.appendChild(notificationDiv);

        // Remove the notification after a few seconds
        setTimeout(() => {
            notificationDiv.remove();
        }, 3000);
    }
});
