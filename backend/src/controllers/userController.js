import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import config from '../../utils/config';


export const loginRequired = async (req, res, next) => {
  try {
    // if JWT is verified (not expired)
    if (req.user) {
      // see if user is a valid user (not a deleted account)
      const validUser = await User.findOne({ email: req.user.email, userName: req.user.userName, _id: req.user._id }).lean().exec();

      // if no validUser
      if (!validUser) {
        res.status(401).json({ message: 'Unauthorized user!' });
      // if validUser is not logged in
      } else if (!validUser.isLoggedIn) {
        res.status(401).json({ message: 'Unauthorized user!' });
      // validUser and isLoggedIn
      } else {
        next();
      }

    // otherwise, if JWT is not verified, send reason
    } else {
      res.status(401).json({ message: 'Unauthorized user!' });
    }

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


export const register = async (req, res) => {
  try {
    const userNameAlreadyExists = await User.findOne({ userName: req.body.userName }).lean().exec();

    // if userName already exists
    if (userNameAlreadyExists) {
      res.status(205).json({ message: 'Username not available.' });

    // otherwise, create new User
    } else {
      // create new User from model
      const newUser = new User(req.body);

      // encrypt first password with salt
      await bcrypt.hash(req.body.password, 10)
        .then(hash => newUser.hashPassword = hash);

      // save then send response or err
      newUser.save()
        .then(user => {
          // JSON will omit properties with values of undefined
          user.hashPassword = undefined;
          res.send(user);
        })
        .catch(err => res.status(400).json({ message: err.message }));
    }

  } catch (e) {
    res.status(400).json({ message: e.message });
  }

};


export const login = async (req, res) => {
  try {
    // get user by userName
    const user = await User.findOne({ userName: req.body.userName }).lean().exec();

    // if not found
    if (!user) {
      res.status(401).json({ message: 'Authentication failed. Wrong user name or password.' });

    // if found
    } else {
      let passwordIsValid = false;

      // compare password with hashPassword
      await bcrypt.compare(req.body.password, user.hashPassword)
        .then(match => {
          // if no match, send reason
          if (!match) {
            res.status(401).json({ message: 'Authentication failed. Wrong user name or password.' });
          // otherwise, passwordIsValid
          } else {
            passwordIsValid = true;
          }
        })
        .catch(err => res.status(400).json({ message: err.message }));

      // if passwordIsValid
      if (passwordIsValid) {
        const loggedInUser = await User.findOneAndUpdate({ userName: req.body.userName }, { isLoggedIn: true }, { new: true }).lean().exec();

        if (!loggedInUser) {
          res.status(400).json({ message: 'Could not log in user.' });
        } else {
          res.send({ token: jwt.sign({ email: user.email, userName: user.userName, _id: user._id }, config.secret, {expiresIn: config.expiresIn}) });
        }
      }
    }

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


export const logout = async (req, res) => {
  try {
    // find user and log out
    const loggedOutUser = await User.findOneAndUpdate({ email: req.user.email, userName: req.user.userName, _id: req.user._id }, { isLoggedIn: false }, { new: true }).lean().exec();

    // if could not findOneAndUpdate
    if (!loggedOutUser) {
      res.status(400).json({ message: 'Could not log out user.' });
    // otherwise send loggedOutUser
    } else {
      res.send(loggedOutUser);
    }

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


export const deleteUser = async (req, res) => {
  // loginRequired function verifies active user; 401 status is here for redundancy

  try {
    // find user
    const deletedUser = await User.findOneAndRemove({ email: req.user.email, userName: req.user.userName, _id: req.user._id });

    // if not found (e.g. user was not logged out)
    if (!deletedUser) {
      res.status(401).json({ message: 'Unauthorized user!' });
    // otherwise, if user was deleted
    } else {
      deletedUser.hashPassword = undefined;
      deletedUser.isLoggedIn = false;
      res.send(deletedUser);
    }

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
