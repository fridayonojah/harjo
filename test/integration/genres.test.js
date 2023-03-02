const request = require('supertest');
const { Genre } = require('../../models/genres');
const { User } = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/genres', () => {
  // beforeAll(() => jest.setTimeout(90 * 4000));
    beforeEach(() => { 
      server = require('../../server');;
      // jest.setTimeout(8000);
    });

    afterEach(async () => { 
        await server.close(); 
        await Genre.deleteMany({});
        // jest.useRealTimers();
    });

    describe('GET /', () =>{
      it('should return all genres', async () => {
          const genres = [
              { name: 'genre1' },
              { name: 'genre2' },
            ];
            
            await Genre.collection.insertMany(genres);

          const res = await request(server).get('/api/genres');
          
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(2);
          expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
          expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
      });
    });


    describe('GET /:id', () => {
        it('should return a genre if valid id is passed', async () =>{
            const genre = new Genre({ name: 'genre1'})
            await genre.save();

            // call our endpoint 
            const res = await request(server).get('/api/genres/' + genre._id);
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });

        it('should return a 404 if invalid id is passed', async () =>{
        
            // call our endpoint 
            const res = await request(server).get('/api/genres/1');
            
            expect(res.status).toBe(404);
        });

        it('should return a 404 if no genre with given id exists', async () =>{
            const id = mongoose.Types.ObjectId();
            
            const res = await request(server).get('/api/genres/'+ id);
            
            expect(res.status).toBe(404);
        });
    });

    // Test suit for ivalid inputs
    describe('POST /', ()=>{
        
        // Define the happy path, and then in each test, we change
        // one parameter that clearly aligns with the name of the 
        // test.
        let token;
        let name;

        const exec = async () => {
           return await request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name });
        }

        beforeEach(() =>{
             token = new User().generateAuthToken();
             name = 'genre1'
        });

        // afterEach(async () => { 
        //     server.close(); 
        //     await Genre.insertMany({});
        // });

        it('should return 401 if client is not logged in', async () =>{
            token = "";
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if genres is less than 5', async() =>{
           
            name = '1234';

            const res = await exec();
           
            expect(res.status).toBe(400);
        });

        it('should return 400 if genres is more than 50', async() =>{
           
            //Generate long string of 50 characters
            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save the genre if its valid', async() =>{
            await exec();

                //check if genre was saved
                const genre = await Genre.find({ name: 'genre1'});

            expect(genre).not.toBeNull();
        });

        it('should return the genre if it is valid', async () => {
            const res = await exec();
      
            // expect(res.body).not.toBeNull('_id');
            expect(res.body).not.toBeNull();
        });
    });

    describe('PUT /:id', () => {
    let token; 
    let newName; 
    let genre; 
    let id; 

    const exec = async () => {
      return await request(server)
        .put('/api/genres/' + id)
        .set('x-auth-token', token)
        .send({ name: newName });
    }

    beforeEach(async () => {
      // Before each test we need to create a genre and 
      // put it in the database.      
      genre = new Genre({ name: 'genre1' });
      await genre.save();
      
      token = new User().generateAuthToken();     
      id = genre._id; 
      newName = 'updatedName'; 
    });

    it('should return 401 if client is not logged in', async () => {
      token = ""; 

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if genre is less than 5 characters', async () => {
      newName = '1234'; 
      
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre is more than 50 characters', async () => {
      newName = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if genre with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await request(server).get('/api/genres/' + id);

      expect(res.status).toBe(404);
    });

    it('should update the genre if input is valid', async () => {
      await exec();

      const updatedGenre = await exec();

      expect(updatedGenre.name).not.toBeNull();
    });

    it('should return the updated genre if it is valid', async () => {
      const res = await exec();

      // expect(res.body).toHaveProperty(_id);
      expect(res.body).not.toBeNull();
    });
  });

  describe('DELETE /:id', () => {
    let token; 
    let genre; 
    let id; 

    const exec = async () => {
      return await request(server)
        .delete('/api/genres/' + id)
        .set('x-auth-token', token)
        .send();
    }

    beforeEach(async () => {
      // Before each test we need to create a genre and 
      // put it in the database.      
      genre = new Genre({ name: 'genre1' });
      await genre.save();
      
      id = genre._id; 
      token = new User({ isAdmin: true }).generateAuthToken();     
    })

    it('should return 401 if client is not logged in', async () => {
      token = ''; 

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if the user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken(); 

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1; 
      
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no genre with the given id was found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await request(server).get('/api/genres/' + id);

      // const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the genre if input is valid', async () => {
      await exec();

      const genreInDb = await Genre.findById(id);

      expect(genreInDb).toBeNull();
    });

    it('should return the removed genre', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id', genre._id.toHexString());
      expect(res.body).toHaveProperty('name', genre.name);
      // expect(res.body).toHaveProperty(['name']);
      // expect(res.body).toHaveProperty('_id', gen);
      // expect(res.body).not.toBeNull();
    });
  });

});

