const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

app.use('/api', graphqlHttp({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }
        type RootMutation {
            createEvent(name: String): Sting
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return ['Cooking Night', 'Movie Tuesday', 'Little Timmy Birthday Party'];
        },
        createEvent: (args) => {
            const eventName = args.name;
            return eventName;
        }

    },
}));

app.listen(3000);