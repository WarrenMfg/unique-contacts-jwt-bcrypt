import {
  addNewContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  deleteContacts
} from '../controllers/contactController';
import {
  loginRequired,
  register,
  login,
  deleteUser
} from '../controllers/userController';


const routes = app => {

  // registration
  app.route('/auth/register')
    .post(register)



  // login
  app.route('/auth/login')
    .post(login)



  // one
  app.route('/contact')
    .all(loginRequired)
    .post(addNewContact);

  app.route('/contact/:contactID')
    .all(loginRequired)
    .get(getContact)
    .put(updateContact)
    .delete(deleteContact);

  app.route('/user')
    .all(loginRequired)
    .delete(deleteContacts, deleteUser);



  // many
  app.route('/contacts')
    .all(loginRequired)
    .get(getContacts);

};

export default routes;