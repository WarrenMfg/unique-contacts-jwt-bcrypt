import {
  addNewContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  deleteContacts,
  deleteContactsBeforeDeleteUser
} from '../controllers/contactController';
import {
  loginRequired,
  register,
  login,
  logout,
  deleteUser
} from '../controllers/userController';


const routes = app => {

  // registration
  app.route('/auth/register')
    .post(register)



  // login
  app.route('/auth/login')
    .post(login)



  // logout
  app.route('/auth/logout')
    .all(loginRequired)
    .put(logout);



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
    .delete(deleteContactsBeforeDeleteUser, deleteUser);



  // many
  app.route('/contacts')
    .all(loginRequired)
    .get(getContacts)
    .delete(deleteContacts);

};

export default routes;