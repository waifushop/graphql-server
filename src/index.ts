import { readdir } from 'fs';
import { resolve as resolvePath } from 'path';
import * as Express from 'express';
import * as ExpressGraphQL from 'express-graphql';
import { GraphQLSchema } from 'graphql';

/**
 * Returns an Express server hosting GraphQL endpoints matching each input
 * filename.
 *
 * @param graphiql Whether to enable a GraphiQL endpoint for debugging.
 * @param path The path to import schemas from. The GraphQL schema must be the
 * default export.
 * @returns The Express instance which can be immediately ran on a port.
 */
export default async function server(graphiql: boolean, path: string): Promise<Express.Express> {
    const filepaths = await new Promise<string[]>((resolve, reject) => {
        readdir(path, (err, files) => {
            if(err) reject(err);
            resolve(files.map(file => resolvePath(path, file)));
        });
    });

    const app = Express();

    for (const filepath of filepaths) {
        const schema: GraphQLSchema = (await import(filepath)).default;
        const name = filepath.split('.')[0].toLowerCase();

        app.use(`/${name}`, ExpressGraphQL({
            graphiql,
            schema,
        }));
    }

    return app;
}
