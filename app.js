const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();


app.use(bodyParser.json());

app.use('/api', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        type RootQuery {
            events: [Event!]!
        }
        type RootMutation {
            createEvent(eventInput: EventInput): Event
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
                date: new Date(args.eventInput.date)
            });
            return event.save().then(result => {
                console.log(result);
                return {...result._doc, _id: event._doc._id.toString() }
            }).catch(err => {
                console.log(err);
                throw err;
            })
        }
    },
    graphiql: true
    })
);

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-97mno.mongodb.net/test?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });

app.listen(3000);