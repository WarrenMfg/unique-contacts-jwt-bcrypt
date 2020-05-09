import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import config from '../../utils/config';


export const loginRequired = async (req, res, next) => {
  try {
    // if JWT is verified (not expired)
    if (req.user) {
      // see if user is still an active user (not a deleted account)
      const activeUser = await User.findOne({ email: req.user.email, userName: req.user.userName, _id: req.user._id });

      // if no aciveUser, send reason (e.g. account was deleted but user was not logged out)
      if (!activeUser) {
        res.status(401).json({ message: 'Unauthorized user!' });
      // otherwise, activeUser exists, now go to route
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

  } catch (e) {
    res.status(400).json({ message: e.message });
  }

};


export const login = async (req, res) => {
  try {
    // get user by userName
    const user = await User.findOne({ userName: req.body.userName });

    // if not found
    if (!user) {
      res.status(401).json({ message: 'Authentication failed. Wrong user name or password.' });

    // if found
    } else {
      // compare password with hashPassword
      bcrypt.compare(req.body.password, user.hashPassword)
        .then(match => {
          // if match, send token
          if (match) {
            res.send({ token: jwt.sign({ email: user.email, userName: user.userName, _id: user._id }, config.secret, {expiresIn: config.expiresIn}) });
          // otherwise, send reason
          } else {
            res.status(401).json({ message: 'Authentication failed. Wrong user name or password.' });
          }
        })
        .catch(err => res.status(400).json({ message: err.message }));
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
    deletedUser.hashPassword = undefined;

    // if not found (e.g. user was not logged out)
    if (!deletedUser) {
      res.status(401).json({ message: 'Unauthorized user!' });
    // otherwise, if user was deleted
    } else {
      res.send(deletedUser);
    }

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
