const moment = require("moment");
const request = require('supertest');
const {Rental} = require('../../models/rental');
const {Movie} = require('../../models/movie');
const {User} = require('../../models/user');
const mongoose = require("mongoose");

// const { iteratee } = require('lodash');

describe('/api/returns', () => {
    let server; 
    let customerId; 
    let movieId;
    let rental;
    let movie;
    let token;
    

    const exec = () => {
        return request(server)
          .post('/api/returns')
          .set('x-auth-token', token)
          .send({ customerId, movieId });
      };

    beforeAll(() => jest.setTimeout(90 * 1000));
    
    beforeEach(async() => {
        // jest.setTimeout(2000);
        server = require('../../server');

        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: { name: '12345'},
            numberInStock: 10
        });
        await movie.save();

        rental = new Rental({
            customer: {
                id: customerId,
                name: '12345',
                phone: '12345'
            },
            movie: {
                id: movieId,
                title: '12345',
                dailyRentalRate: 2
            },
        });
        await rental.save();
    }) 

    // after each function clean up the database and terminate the server
    afterEach(async () => {
        await server.close();
        await Rental.deleteMany({});
        await Movie.deleteMany({});
        // jest.useRealTimers();
    });

    it('should be 401 if client is not logged in', async() => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should be 400 if customerId is not provided', async() => {
        customerId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should be 400 if movieId is not provided', async() => {
        movieId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    // it('should be 404 if no rental found', async() => {
    //     movieId = '';
    //     customerId = '';

    //     const res = await exec();

    //     expect(res.status).toBe(400);
    // });

    it('should be 404 if no rental found for the customer/movie', async() => {
       await Rental.deleteMany({});

        const res = await exec();

        expect(res.status).toBe(404);
    });

    it('should return 400 if return is already processed', async() => {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if we have a valid request', async() => {
        const res = await exec();

        expect(res.status).toBe(200);
    });

    it('should set the returnDate if input is valid', async() => {
        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned
        expect(diff).toBeLessThan(10 * 1000);
    });

    it('should calculate the rental fee if input is valid', async() => {

        //check for how long a movie has been out be $14
        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();

        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14);
    });

    // it('should increase the movie stock if input is valid', async() => {
    //     const res = await exec();

    //     const movieInDb = await Movie.findById(movieId);
    //     expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    // });

    it('should returns the rentals if input is valid', async() => {
        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);

        expect(Object.keys(res.body)).toEqual(expect.arrayContaining([
            'dateOut', 'dateReturned', 'customer', 'movie', 'rentalFee']));
    });
});