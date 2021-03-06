import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import { routes } from './router';
import cors from 'cors';

import { ErrorHandler } from './modules/error/ErrorHandler';
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { importSchema } from 'graphql-import';
import { resolvers } from './graphQL';

import { context } from './database/prismaClient';

const app = express();
const port = process.env.PORT || 4000;
app.use(express.json());

app.use(cors());

app.use(routes);

const typeDefs = importSchema(`${__dirname}/graphQL/schema.graphql`);

console.log('Current directory:', __dirname);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    context,
    graphiql: true,
    customFormatErrorFn: (error: any) => {
      const message = error.message.replace('Unexpected error value: ', '');
      return {
        message,
      };
    },
  })
);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorHandler) {
    return res.status(400).json({
      error: err,
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
  });
});

app.listen(port, () => {
  console.log('Server running on port 4000');
});
