## Application Structure
  - The framework used to build this application will be MVC
  - The Model represents a local representation of our contacts
    - Here, we will have an array of objects as our part of our Model's state. These objects represent the contact itself, while the properties represent the information about that specific contact
  - The View is concerned with our output, which is what we look at on the website
    - This is the interface through which the user can perform actions such as add, remove, edit, and filter contacts
  - The Controller helps us interface between both. In the Controller we will perform AJAX requests. These AJAX requests will be used to update the model

## Application Workflow
  - For example, when the page first loads:
    - Event listener defined on the View gets triggered
    - This event listener calls a method in the Controller class
    - The Controller performs an AJAX requests 
      - The Controller is interacting with the API to obtain the contact information
    - Once the response is received, a method will be called in the Model class
      - For example, maybe we were getting all the contacts, so we need to update the Model's state to reflect all the contacts that were returned by the API
    - Once the model is updated, a method will be called, that will call a controller method, that will call a view method that will update our output

## Building The Application
  ### 1. Initial Page

  #### Objective
  - In this step, our main focus is to render unto the page the contacts that are already in existance
  - This will include writing some HTML for creating a contact as well as search bar
  - Using the API to obtain all the contacts that already exist
  - Update the model
  - Render the output according to the newest version of our model

  #### Steps
  - On the constructor method in `View`, define a property that points to the contacts `div`
  <!-- - Define a method on `View` called `bindInitialPageLoad`
    - This method will add an event listener that will get called when the DOM is constructed -->
    - This method will take a handler called `getAllContacts`, this handler will be defined in the `Controller` and will perform an AJAX request to obtain all the contacts from the API
  - Method `getAllContacts` will perform an AJAX request, and upon receiving a response, will update the state of the `Model`.
    - The `Model` will update its `contacts` property, which will point to an array of objects that reflects the contacts provided by the API
    - Once the `contacts` property is updated, the function (which is a property of model) `onContactListChanged` will be called
  - Method `bindOnContactListChanged` will be defined in the `Model`
    - This method will take a callback, and this callback will be set as a property of `Model`
  - Method `onContactListChanged` will be defined in the `Controller`
    - This method will call a method on the `View` called `displayAllContacts`
  - Method `displayAllContacts` will take an an array of objects
    - Use the array of objects to generate the HTML of each contact
      - We will do this with Handlebars
    - We will find the `div#contacts` and add the elements that represent all the contacts
  - Handlebars template will be defined in script tag on index file

  ### 2. Adding a Contact

  #### Objective
    - Implement functionality that allows user to add a contact and render it on the screen
    - When clicking on add a contact, we need to display a form that we will use to submit the contact info

  #### Steps
    - Define a form on a template that will be stored in the `index` file
      - This form will have three input fields, a submit button, and a cancel button 
      - This template will have a variable name, since it will be used to either add a contact or edit a contact
    - Hide elements with class `main` and append the template to `div#root`
    - Write a method `bindAddContact` that will register an event listener for the `add contact` button
      - When clicking on `Add contact`, the elements with class `main` will be hidden
        - We will use Handlebars to render the form that we need
        - Append that form to the end of `div#root`
      - Add an event listener for the submit button
        - This event listener will call the handler when submit is pressed
        - Data will be collected from the form
          - Data must either be in json or query string
        - Data is then passed to the handler `handleAddContact`
          - This handler will perform a post request
          - `Model` contacts property will be updated
          - Main page with all contacts will be shown again
      - An event listener for `reset` event will also be added
        - When a `reset` event happens, the form will be removed and the main page will re-appear
    
  ### 3. Removing a Contact
    #### Objective
      - Implement functionality that allows us to remove a contact
      - When clicking on remove contact, we must submit a `DELETE` request, update our `Model`'s `contacts` property, and re-render the page

    #### Steps
      - Modify the template to make it so the delete anchor's `href` property has the following path: `/api/contacts/:id`
      - Define a method `bindDeleteContact` on `View`
        - This method will register an event listener on `ul#contact-list` that will only fire if the target was an anchor element with the `delete` class
        - Will take a method `handleDeleteContact` as an argument, it will get called when the anchor element is pressed
      - Method `handleDeleteContact` will be defined on `Controller`. This method will submit the post request using the path obtained from the target

  ### 4. Edit a Contact
    #### Objective
      - Implement functionality to edit contacts
      - We need to add an event listener for the `Edit Contact` anchor element. 
        - This event listener will bring up the edit form, with the previous information already filled out, a method will be called from the `Controller` class to submit a `PUT` request, then the contacts will be re-rendered

    #### Steps
      - Define method `bindDisplayEditContactForm` that will hide the main page and display the contact form. This method will take a callback `handleEditContact`
        - An event listener will be added to the contact list, that will fire if anchor elements with class `edit` are clicked
        - After clicking `Edit` the form will be displayed, with the fields filled in
        - A `submit` event listener will be added. This event listener will fire the callback, and the callback will perform a `PUT` request
        - Page will be updated to reflect up to date contact info

  ### 5. Implement Search Function (On `Model`, name only)
    #### Objective
      - Implement a function on the `Model` that takes in a string as an argument, and returns the first contact that starts with the given string

    #### Steps
      - Method takes a string as an argument
      - We will use `filter` to iterate through each contact in `contacts` property in `Model`
        - For each contact, we will return `true` if the `name` starts with the given string
      - Return filtered contacts

  ### 6. Implement event listeners for search function
    #### Objective
      - Implement event listeners on `View` that listen to a keypress that occurs on the search bar `input.search`
    
    #### Steps
      - Define a method in `View` called `bindSearchFunction`
        - This method will add an event listener to `input.search` that will call the handler `handleSearchFunction` when a `keyup` event is experienced
      - `handleSearchFunction` will make use of the `Model` method `findMatchingContactNames`. This method returns a collection of contacts that matched our search string
        - Then the `Model` method `onContactListChanged` is called to tell the `View` to update our website

  ### 7. Filter Elements by Tags
    #### Objective
      - Implement functionality that shows all tags on the main page. When a tag is clicked, all elements with that tag will be shown. Only one tag can be clicked at a time
    #### Steps
      - Write a method that, when contacts are updated, a list of tags from those contacts is generated (no duplicates)
      - Add event listeners that fire when you click on one of the checkbox buttons
      - Every time we mark a checkbox we check all the checkboxes to see which ones are checked
      - We will filter out the contacts whose tags all match the ones that were checked
      