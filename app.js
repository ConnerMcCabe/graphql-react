const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();


app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        type User {
            _id: ID!  
            email: String!
            password: String
        }
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        input UserInput {
            email: String!
            password: String!
        }
        type RootQuery {
            events: [Event!]!
        }
        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): Event
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find().then(events => {
                return events.map(event => {
                    return { ...event._doc, _id: event._doc._id.toString() };
                })
            })
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.description,
                price: +args.price,
                date: new Date(args.eventInput.date),
                creator: 'tester'
            });
            let createdEvent;
            return event
                .save()
                .then(result => {
                    createdEvent = {...result._doc, _id: event._doc._id.toString() };
                    return User.findById('tester')
                
            })
            .then(user => {
                if (!user) {
                    throw new Error('User not found.');
                } 
                user.createEvents.push(event);
                return user.save();
            }) 
            .then(result => {
                return createdEvent;
            })   
            .catch(err => {
                console.log(err);
                throw err;
            })
        },
        createUser: args => {
            return User.findOne({email: args.userInput.email}).then(user => {
                if (user) {
                    throw new Error('User already exists.');
                }
            });
            return bcrypt
            .hash(args.userInput.password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    });
                    return user.save();
                })
                .then(result => {
                    return { ...result._doc, password: null, _id: result.id };
                })
                .catch(err => {
                throw err
            })
            
        }
    },
    graphiql: true
    })
);


mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}
        @cluster0-97mno.mongodb.net/test?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });

app.listen(3000);