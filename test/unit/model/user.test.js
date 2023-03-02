const { User } = require('../../../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');

describe('user.generateAuthtoken', () => {
    it('should return a valid JWT', () => {
        const payload = {
            _id: new mongoose.Types.ObjectId().toHexString(), 
            isAdmin: true
        };
        
        const user = new User(payload);
        const token = user.generateAuthToken();

        //decord the token to get user 
        const decorded = jwt.verify(token, config.get('jwtPrivateKey'));
        expect(decorded).toMatchObject(payload);
    });
})