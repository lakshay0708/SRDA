const enquiryForm = document.querySelector('#enquiry-form');
const submitButton = enquiryForm.querySelector('button');
const feedback = document.querySelector('#form-feedback');
const email = 'srdaassociates@gmail.com';

submitButton.disabled = false;

enquiryForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.querySelector('#name').value.trim();
  const phone = document.querySelector('#phone').value.trim();
  const topic = document.querySelector('#topic').value;
  const message = document.querySelector('#message').value.trim();

  feedback.hidden = false;
  if (!name || !message) {
    feedback.textContent = 'Please enter your name and a short message.';
    document.querySelector(name ? '#message' : '#name').focus();
    return;
  }

  const body = [
    'Hello SRDA Associates,',
    '',
    message,
    '',
    'Name: ' + name,
    phone ? 'Phone: ' + phone : '',
  ].filter((line, index) => line || index < 5).join('\r\n');
  const subject = encodeURIComponent('General enquiry: ' + topic);
  const draft = 'mailto:' + email + '?subject=' + subject + '&body=' + encodeURIComponent(body);

  feedback.textContent = 'Send the draft from your email app. If it does not open, email ' + email + ' directly.';
  window.location.href = draft;
});
