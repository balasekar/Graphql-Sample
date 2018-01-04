var express = require('express');
var graphqlHTTP = require('express-graphql');
var {
buildSchema
} = require('graphql');

var schema = buildSchema(`
input MessageInput {
	content : String
	author  : String
}

type Message {
	id: ID!
	content: String
	author: String
}

type Query {
	getMessage(id: ID!) : Message
}

type Mutation{
	createMessage(input: MessageInput) : Message
	updateMessage(id: ID!, input: MessageInput) : Message
}
`);

class Message {
constructor(id, {
    content,
    author
}) {
    this.id = id;
    this.content = content;
    this.author = author;
}
}

var fakeDatabase = {};

var root = {
getMessage: ({
    id
}) => {
    if (!fakeDatabase[id]) {
        throw new Error('no message exists with id: ' + id);
    }
    return new Message(id, fakeDatabase[id]);
},
createMessage: ({
    input
}) => {
    var id = require('crypto').randomBytes(10).toString('hex');

    fakeDatabase[id] = input;
    return new Message(id, input);
},
updateMessage: ({
    id,
    input
}) => {
    if (!fakeDatabase[id]) {
        throw new Error('no message exists with id: ' + id);
    }

    fakeDatabase[id] = input;
    return new Message(id, input);
}
}
var app = express();
app.use('/graphql', graphqlHTTP({
schema: schema,
rootValue: root,
graphiql: true,
}));
app.listen(4000, () => {
console.log('Running a GraphQL API server at localhost:4000/graphql');
});
