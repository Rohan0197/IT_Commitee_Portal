/* ============================================================
   Shared client-side validation used by both the registration
   form (pages/events.html) and the admin event form (admin/index.html).
   Plain functions - no framework needed.
   ============================================================ */

// Email needs something before @, something after it, and a dot after
// the @ (so "a@b" fails but "a@b.com" passes).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Indian mobile numbers: 10 digits, first digit 6-9.
const PHONE_REGEX = /^[6-9]\d{9}$/;

// values: { name, email, phone, rollNumber }
// returns: { name?, email?, phone?, rollNumber? } - only the fields
// that have a problem are present in the returned object.
function validateRegistration(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }

  if (!values.rollNumber.trim()) {
    errors.rollNumber = "Roll number is required.";
  }

  return errors;
}

// values: { title, description, category, date, time, venue, capacity }
function validateEvent(values) {
  const errors = {};

  if (!values.title.trim()) errors.title = "Title is required.";
  if (!values.description.trim()) errors.description = "Description is required.";
  if (!values.category.trim()) errors.category = "Category is required.";
  if (!values.date.trim()) errors.date = "Date is required.";
  if (!values.time.trim()) errors.time = "Time is required.";
  if (!values.venue.trim()) errors.venue = "Venue is required.";

  // Number("") is 0, not NaN, so blank has to be checked separately.
  const capacityNumber = Number(values.capacity);
  if (!values.capacity.trim() || Number.isNaN(capacityNumber) || capacityNumber <= 0) {
    errors.capacity = "Capacity must be a positive number.";
  }

  return errors;
}
