const express = require('express');
const bodyParser = require('body-parser');
const {
    graphqlExpress,
    graphiqlExpress
} = require('apollo-server-express');
import schema from './graphql/schema';
// const schema = require('./graphql/schema');
const { 
    execute, 
    subscribe } = require('graphql');
const {
    createServer
} = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const cors = require('cors');

const connectMongo = require('./mongo-connector');

const PORT = process.env.GRAPHQL_PORT || 3003;

const start = async() => {

    const mongo = await connectMongo();
    var app = express();
    const buildOptions = async(req, res) => {
        return {
            context: {
                mongo
            },
            schema,
        };
    };

    app.use('/graphql', cors(), bodyParser.json(), graphqlExpress(buildOptions));
    app.use('/graphiql', graphiqlExpress({
        endpointURL: '/graphql',
        subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
    }));

    const server = createServer(app);
    server.listen(PORT, () => {
        SubscriptionServer.create(
            { execute, subscribe, schema },
            { server, path: '/subscriptions' },
        );
        console.log(`Pokedéx GraphQL server running on port ${PORT}.`)
    });

};

start();
