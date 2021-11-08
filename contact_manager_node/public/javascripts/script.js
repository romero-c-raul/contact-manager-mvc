class Model {
  constructor() {
    this.contacts = null;
    this.onContactListChanged = null;
  }

  updateContacts(contactsData) {
    this.contacts = contactsData;
    this.onContactListChanged(this.contacts);
  }

  bindOnContactListChanged(callback) {
    this.onContactListChanged = callback;
  }
}

class View {
  constructor() {
    this.root = document.querySelector('#root');
    this.contactList = document.querySelector('#contact-list');
    this.addContactButton = document.querySelector('.add-contact');
    this.listItemScript = this.generateListItemScript();
    this.formScript = this.genereateFormScript();
  }

  displayAllContacts(contactsData) {
    if (this.contactList.children.length > 0) {
      while (this.contactList.firstElementChild) {
        this.contactList.removeChild(this.contactList.firstChild);
      }
    } 

    let tempDiv = document.createElement('div');

    contactsData.forEach(contact => {
      let contactHtml = this.listItemScript({
        name: contact.full_name,
        number: contact.phone_number,
        email: contact.email,
        id: contact.id,
        tags: contact.tags,
      });

      tempDiv.innerHTML = contactHtml;
      this.contactList.appendChild(tempDiv.firstElementChild);
    });
  }

  generateListItemScript() {
    let template = document.querySelector('#list-item').innerHTML;
    let script = Handlebars.compile(template);
    return script;
  }

  hideMainPage() {
    let mainPageElements = document.querySelectorAll('.main');
    [...mainPageElements].forEach(ele => ele.style.display = 'none');
  }

  displayMainPage() {
    let mainPageElements = document.querySelectorAll('.main');
    [...mainPageElements].forEach(ele => ele.style.display = 'block');
  }

  bindDisplayAddContactForm(handler) {
    this.addContactButton.addEventListener('click', event => {
      event.preventDefault();
      this.hideMainPage();
      this.displayForm('Add Contact');

      let form = document.querySelector('form');

      form.addEventListener('submit', event => {
        event.preventDefault();

        let data = new FormData(form);
        let dataString = new URLSearchParams(data).toString();

        handler(dataString);
      });

      form.addEventListener('reset', event => {
        event.preventDefault();

        this.removeForm();
        this.displayMainPage();
      });
    });
  }

  bindDisplayEditContactForm(handler) {
    this.contactList.addEventListener('click', event => {
      let target = event.target;

      if (target.tagName === 'A' && target.className === 'edit') {
        event.preventDefault();
        this.hideMainPage();
        this.displayForm('Edit Contact');
        this.populateEditForm(target);

        let form = document.querySelector('form');
        let path = target.getAttribute('href');

        form.addEventListener('submit', event => {
          event.preventDefault();

          let data = new FormData(form);
          let dataString = new URLSearchParams(data).toString();

          handler(path, dataString);
        });

        form.addEventListener('reset', event => {
          event.preventDefault();
  
          this.removeForm();
          this.displayMainPage();
        });
      }
    });
  }

  populateEditForm(target) {
    let listItem = target.closest('li');
    let contactName = listItem.querySelector('h2').textContent;
    let contactInfo = listItem.querySelectorAll('dd');
    let contactNumber = contactInfo[0].textContent;
    let contactEmail = contactInfo[1].textContent;
    let contactTags = contactInfo[2].textContent;

    let form = document.querySelector('form');
    
    form.full_name.value = contactName;
    form.phone_number.value = contactNumber;
    form.email.value = contactEmail;
    form.tags.value = contactTags;
  }

  bindDeleteContact(handler) {
    this.contactList.addEventListener('click', event => {
      let target = event.target;

      if (target.tagName === 'A' && target.className === 'delete') {
        event.preventDefault();
        handler(target.getAttribute('href'));
      }
    });
  }

  genereateFormScript() {
    let template = document.getElementById('submission-form').innerHTML;
    let script = Handlebars.compile(template);
    return script;
  }

  displayForm(formType) {
    let tempDiv = document.createElement('div');
    let form = this.formScript({type: formType});
    tempDiv.innerHTML = form;

    this.root.appendChild(tempDiv.firstElementChild);
  }

  removeForm() {
    let form = document.querySelector('form');
    form.remove();
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.getContactsAndUpdateModel();

    this.model.bindOnContactListChanged(this.onContactListChanged);

    this.view.bindDisplayAddContactForm(this.handleAddContact);
    this.view.bindDisplayEditContactForm(this.handleEditContact);
    this.view.bindDeleteContact(this.handleDeleteContact);
  }

  getContactsAndUpdateModel() {
    fetch('/api/contacts', {
      method: "GET"
    })
    .then(response => response.json())
    .then(data => {
      this.model.updateContacts(data);
    });
  }

  handleAddContact = (contactData) => {
    fetch('/api/contacts', {
      method: 'POST',
      headers: {'Content-Type': "application/x-www-form-urlencoded"},
      body: contactData,
    })
    .then(() => {
      this.getContactsAndUpdateModel();
      this.view.removeForm();
      this.view.displayMainPage();
    });
  }

  handleDeleteContact = (path) => {
    fetch(path, {
      method: 'DELETE',
    })
    .then(() => {
      this.getContactsAndUpdateModel();
    });
  }

  handleEditContact = (path, contactData) => {
    fetch(path, {
      method: 'PUT',
      headers: {'Content-Type': "application/x-www-form-urlencoded"},
      body: contactData,
    })
    .then(() => {
      this.getContactsAndUpdateModel();
      this.view.removeForm();
      this.view.displayMainPage();
    })
  }

  onContactListChanged = (contactsData) => {
    this.view.displayAllContacts(contactsData);
  }
}

let app;

document.addEventListener('DOMContentLoaded', () => {
  app = new Controller(new Model(), new View());
});