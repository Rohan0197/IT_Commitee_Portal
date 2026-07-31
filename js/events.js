/* ============================================================
   Logic for pages/events.html: loads events from Firestore, renders
   them as cards, and handles the search/filter + registration modal.
   Everything here is plain DOM manipulation - no framework, so every
   render() call rebuilds the grid's HTML from scratch from whatever
   is currently in `allEvents`.
   ============================================================ */

let allEvents = []; // whatever we last got from Firestore
let currentEventForRegistration = null;

const eventsGrid = document.getElementById("eventsGrid");
const eventsStatus = document.getElementById("eventsStatus");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

// Fill the category dropdown from the shared list in categories.js.
EVENT_CATEGORIES.forEach(function (category) {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  categoryFilter.appendChild(option);
});

function getCategoryStyle(category) {
  if (category === "Technical") return "background:#e0f2fe;color:#075985;";
  if (category === "Cultural") return "background:#ffe4e6;color:#9f1239;";
  if (category === "Workshop") return "background:#d1fae5;color:#065f46;";
  if (category === "Guest Lecture") return "background:#ede9fe;color:#5b21b6;";
  if (category === "Competition") return "background:#fef3c7;color:#92400e;";
  if (category === "Seminar") return "background:#ccfbf1;color:#115e59;";
  return "";
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Builds one event card's HTML. Using a template string here instead of
// individual createElement calls - simpler to read for a small card.
function eventCardHtml(event) {
  return (
    '<article class="event-card">' +
    '<div class="event-card-top">' +
    "<h3>" + event.title + "</h3>" +
    '<span class="badge" style="' + getCategoryStyle(event.category) + '">' + event.category + "</span>" +
    "</div>" +
    '<p class="description">' + event.description + "</p>" +
    '<div class="event-meta">' +
    "<div><strong>Date:</strong> <span>" + formatDate(event.date) + "</span></div>" +
    "<div><strong>Time:</strong> <span>" + event.time + "</span></div>" +
    "<div><strong>Venue:</strong> <span>" + event.venue + "</span></div>" +
    "</div>" +
    '<button class="btn btn-navy register-btn" data-event-id="' + event.id + '">Register</button>' +
    "</article>"
  );
}

// Re-draws the grid based on allEvents + whatever is currently typed/selected.
function renderEvents() {
  if (!isFirebaseConfigured) {
    eventsStatus.innerHTML =
      '<p class="notice notice-warning">Firebase isn\'t configured yet. Add your project keys to js/firebase-config.js to load events.</p>';
    eventsGrid.innerHTML = "";
    return;
  }

  const search = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filtered = allEvents.filter(function (event) {
    const matchesCategory = category === "All" || event.category === category;
    const matchesSearch = event.title.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    eventsStatus.innerHTML = '<p class="empty-state">No events match your search.</p>';
    eventsGrid.innerHTML = "";
    return;
  }

  eventsStatus.innerHTML = "";
  eventsGrid.innerHTML = filtered.map(eventCardHtml).join("");

  // Cards are rebuilt every render, so the click listeners have to be
  // re-attached every time too.
  document.querySelectorAll(".register-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      openRegistrationModal(button.getAttribute("data-event-id"));
    });
  });
}

searchInput.addEventListener("input", renderEvents);
categoryFilter.addEventListener("change", renderEvents);

// onSnapshot keeps a live connection open, so any event an admin adds,
// edits or deletes shows up here immediately without a page refresh.
if (isFirebaseConfigured) {
  db.collection("events")
    .orderBy("date", "asc")
    .onSnapshot(
      function (snapshot) {
        allEvents = snapshot.docs.map(function (doc) {
          return Object.assign({ id: doc.id }, doc.data());
        });
        renderEvents();
      },
      function (error) {
        eventsStatus.innerHTML = '<p class="notice notice-warning">Could not load events: ' + error.message + "</p>";
      }
    );
} else {
  renderEvents();
}

/* ── Registration modal ── */

const registrationModal = document.getElementById("registrationModal");
const registrationForm = document.getElementById("registrationForm");
const registrationSuccess = document.getElementById("registrationSuccess");

function openRegistrationModal(eventId) {
  currentEventForRegistration = allEvents.find(function (e) {
    return e.id === eventId;
  });
  if (!currentEventForRegistration) return;

  document.getElementById("regEventTitle").textContent = "Register for " + currentEventForRegistration.title;
  document.getElementById("regEventMeta").textContent =
    currentEventForRegistration.date + " · " + currentEventForRegistration.time + " · " + currentEventForRegistration.venue;

  registrationForm.reset();
  registrationForm.style.display = "block";
  registrationSuccess.style.display = "none";
  clearRegistrationErrors();
  registrationModal.classList.remove("hidden");
}

function closeRegistrationModal() {
  registrationModal.classList.add("hidden");
}

document.getElementById("closeRegistrationModal").addEventListener("click", closeRegistrationModal);
document.getElementById("registrationDoneBtn").addEventListener("click", closeRegistrationModal);

// Clicking the dark backdrop closes the modal, but clicking inside the
// modal itself shouldn't - stopPropagation on the inner box handles that.
registrationModal.addEventListener("click", closeRegistrationModal);
registrationModal.querySelector(".modal").addEventListener("click", function (e) {
  e.stopPropagation();
});

function clearRegistrationErrors() {
  ["Name", "Email", "Phone", "Roll"].forEach(function (field) {
    document.getElementById("reg" + field + "Error").textContent = "";
  });
  document.getElementById("registrationFormError").innerHTML = "";
}

registrationForm.addEventListener("submit", function (e) {
  e.preventDefault();
  clearRegistrationErrors();

  const values = {
    name: document.getElementById("regName").value,
    email: document.getElementById("regEmail").value,
    phone: document.getElementById("regPhone").value,
    rollNumber: document.getElementById("regRoll").value,
  };

  const errors = validateRegistration(values);
  if (Object.keys(errors).length > 0) {
    if (errors.name) document.getElementById("regNameError").textContent = errors.name;
    if (errors.email) document.getElementById("regEmailError").textContent = errors.email;
    if (errors.phone) document.getElementById("regPhoneError").textContent = errors.phone;
    if (errors.rollNumber) document.getElementById("regRollError").textContent = errors.rollNumber;
    return;
  }

  if (!isFirebaseConfigured) {
    document.getElementById("registrationFormError").innerHTML =
      '<p class="notice notice-error">Registration storage isn\'t configured yet.</p>';
    return;
  }

  const submitBtn = document.getElementById("registrationSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  db.collection("registrations")
    .add({
      eventId: currentEventForRegistration.id,
      eventTitle: currentEventForRegistration.title,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      rollNumber: values.rollNumber.trim(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(function () {
      registrationForm.style.display = "none";
      registrationSuccess.style.display = "block";
    })
    .catch(function (error) {
      document.getElementById("registrationFormError").innerHTML =
        '<p class="notice notice-error">' + error.message + "</p>";
    })
    .finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit registration";
    });
});
