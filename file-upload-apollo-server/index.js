const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress } = require('apollo-server-express');
const { GraphQLUpload, graphqlUploadExpress } = require('graphql-upload');
const { makeExecutableSchema } = require('graphql-tools');
const cors = require('cors');
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './files/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({ storage: storage });
var upload = multer({ dest: './files/' });

const typeDefs = `
scalar Upload
type File {
    filename: String!
    mimetype: String!
    filesize: Int!
  }
  type Query { hello: String! }
  type Mutation {
      uploadFile(file:Upload!): Boolean!
  }
`;

const resolvers = {
    Upload: GraphQLUpload,
    Query: { hello: () => "hello" },
    Mutation: {
        uploadFile: async (parent, args) => {
            return await args.file.then(file => {
                const { filename, mimetype, filesize, createReadStream } = file;
                const stream = createReadStream();
                console.log(filename);
                return true;
            })
        }
    }
};

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const app = express();
app.use(cors());

app.use('/graphql',
    bodyParser.json(),
    upload.any(),
    // graphqlUploadExpress('./upload', { maxFileSize: 10000000, maxFiles: 10 }),
    graphqlExpress({ schema }));

app.listen(5000, () => {
    console.log('Go to http://localhost:5000/graphiql to run queries!');
});