const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

app.use('/api', graphqlHttp({
    schema: buildSchema(`
        type RootQuery {

        }
        type RootMutation {

        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {},
}));

app.listen(3000);