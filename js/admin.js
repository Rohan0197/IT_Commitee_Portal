/* ============================================================
   Logic for admin/index.html: shows one of four screens depending on
   state (not configured / checking / login / dashboard), handles
   sign in/out, and the add/edit/delete flow for events.
   ============================================================ */

const notConfiguredScreen = document.getElementById("notConfiguredScreen");
const checkingScreen = document.getElementById("checkingScreen");
const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");

let currentEvents = [];
let stopEventsListener = null;

function showScreen(name) {
  notConfiguredScreen.style.display = name === "not-configured" ? "block" : "none";
  checkingScreen.style.display = name === "checking" ? "block" : "none";
  loginScreen.style.display = name === "login" ? "block" : "none";
  dashboardScreen.style.display = name === "dashboard" ? "block" : "none";
}

if (!isFirebaseConfigured) {
  showScreen("not-configured");
} else {
  showScreen("checking");

  // onAuthStateChanged fires once Firebase has checked browser storage
  // for an existing login, and again any time sign-in/sign-out happens.
  auth.onAuthStateChanged(function (user) {
    if (user) {
      document.getElementById("signedInAs").textContent = "Signed in as " + user.email;
      showScreen("dashboard");
      startEventsListener();
    } else {
      if (stopEventsListener) stopEventsListener();
      showScreen("login");
    }
  });
}

/* ── Login ── */

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorBox = document.getElementById("loginError");
  const submitBtn = document.getElementById("loginSubmitBtn");

  errorBox.innerHTML = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in...";

  auth
    .signInWithEmailAndPassword(email, password)
    .catch(function (error) {
      errorBox.innerHTML = '<p class="notice notice-error">' + error.message + "</p>";
    })
    .finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign in";
    });
});

document.getElementById("signOutBtn").addEventListener("click", function () {
  auth.signOut();
});

/* ── Events table ── */

function startEventsListener() {
  stopEventsListener = db
    .collection("events")
    .orderBy("date", "asc")
    .onSnapshot(function (snapshot) {
      currentEvents = snapshot.docs.map(function (doc) {
        return Object.assign({ id: doc.id }, doc.data());
      });
      renderEventsTable();
    });
}

function renderEventsTable() {
  const tbody = document.getElementById("eventsTableBody");
  const noEventsNote = document.getElementById("noEventsNote");

  if (currentEvents.length === 0) {
    tbody.innerHTML = "";
    noEventsNote.style.display = "block";
    return;
  }
  noEventsNote.style.display = "none";

  tbody.innerHTML = currentEvents
    .map(function (event) {
      return (
        "<tr>" +
        "<td>" + event.title + "</td>" +
        "<td>" + event.category + "</td>" +
        "<td>" + event.date + "</td>" +
        "<td>" + event.venue + "</td>" +
        '<td><div class="row-actions">' +
        '<button class="btn-small btn-edit" data-edit-id="' + event.id + '">Edit</button>' +
        '<button class="btn-small btn-delete" data-delete-id="' + event.id + '">Delete</button>' +
        "</div></td>" +
        "</tr>"
      );
    })
    .join("");

  document.querySelectorAll("[data-edit-id]").forEach(function (button) {
    button.addEventListener("click", function () {
      openEventForm(button.getAttribute("data-edit-id"));
    });
  });

  document.querySelectorAll("[data-delete-id]").forEach(function (button) {
    button.addEventListener("click", function () {
      deleteEvent(button.getAttribute("data-delete-id"));
    });
  });
}

function deleteEvent(eventId) {
  const event = currentEvents.find(function (e) {
    return e.id === eventId;
  });
  if (!event) return;

  const confirmed = window.confirm('Delete "' + event.title + '"? This cannot be undone.');
  if (!confirmed) return;

  db.collection("events").doc(eventId).delete();
}

/* ── Add / edit event form (shared modal) ── */

const eventFormModal = document.getElementById("eventFormModal");
const eventForm = document.getElementById("eventForm");
const eventCategorySelect = document.getElementById("eventCategory");

EVENT_CATEGORIES.forEach(function (category) {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  eventCategorySelect.appendChild(option);
});

function clearEventFormErrors() {
  ["Title", "Description", "Capacity", "Date", "Time", "Venue"].forEach(function (field) {
    document.getElementById("event" + field + "Error").textContent = "";
  });
  document.getElementById("eventFormError").innerHTML = "";
}

// eventId is undefined when adding a new event, or a Firestore doc id
// when editing an existing one - that's how the form knows which mode it's in.
function openEventForm(eventId) {
  clearEventFormErrors();
  document.getElementById("eventId").value = eventId || "";

  if (eventId) {
    const event = currentEvents.find(function (e) {
      return e.id === eventId;
    });
    document.getElementById("eventFormTitle").textContent = "Edit event";
    document.getElementById("eventTitle").value = event.title;
    document.getElementById("eventDescription").value = event.description;
    document.getElementById("eventCategory").value = event.category;
    document.getElementById("eventDate").value = event.date;
    document.getElementById("eventTime").value = event.time;
    document.getElementById("eventVenue").value = event.venue;
    document.getElementById("eventCapacity").value = event.capacity;
  } else {
    document.getElementById("eventFormTitle").textContent = "Add event";
    eventForm.reset();
  }

  eventFormModal.classList.remove("hidden");
}

function closeEventForm() {
  eventFormModal.classList.add("hidden");
}

document.getElementById("addEventBtn").addEventListener("click", function () {
  openEventForm(null);
});
document.getElementById("closeEventFormModal").addEventListener("click", closeEventForm);
document.getElementById("cancelEventFormBtn").addEventListener("click", closeEventForm);
eventFormModal.addEventListener("click", closeEventForm);
eventFormModal.querySelector(".modal").addEventListener("click", function (e) {
  e.stopPropagation();
});

eventForm.addEventListener("submit", function (e) {
  e.preventDefault();
  clearEventFormErrors();

  const values = {
    title: document.getElementById("eventTitle").value,
    description: document.getElementById("eventDescription").value,
    category: document.getElementById("eventCategory").value,
    date: document.getElementById("eventDate").value,
    time: document.getElementById("eventTime").value,
    venue: document.getElementById("eventVenue").value,
    capacity: document.getElementById("eventCapacity").value,
  };

  const errors = validateEvent(values);
  if (Object.keys(errors).length > 0) {
    Object.keys(errors).forEach(function (field) {
      const el = document.getElementById("event" + field.charAt(0).toUpperCase() + field.slice(1) + "Error");
      if (el) el.textContent = errors[field];
    });
    return;
  }

  const eventId = document.getElementById("eventId").value;
  const submitBtn = document.getElementById("eventFormSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  const data = {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category,
    date: values.date,
    time: values.time.trim(),
    venue: values.venue.trim(),
    capacity: Number(values.capacity),
  };

  const savePromise = eventId
    ? db.collection("events").doc(eventId).update(data)
    : db.collection("events").add(Object.assign({}, data, { createdAt: firebase.firestore.FieldValue.serverTimestamp() }));

  savePromise
    .then(closeEventForm)
    .catch(function (error) {
      document.getElementById("eventFormError").innerHTML = '<p class="notice notice-error">' + error.message + "</p>";
    })
    .finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save";
    });
});
