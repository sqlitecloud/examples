import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Database } from '@sqlitecloud/drivers';

const connStr = Bun.env.CONN_STR || ':memory:';

const db = new Database(connStr)

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  type Album {
    AlbumId: Int
    Title: String
    ArtistId: Int
  }

  type Artist {
    ArtistId: Int
    Name: String
  }

  type Track {
    TrackId: Int
    Name: String
    AlbumId: Int
    MediaTypeId: Int
    GenreId: Int
    Composer: String
    Milliseconds: Int
    Bytes: Int
    UnitPrice: Float
  }

  type Genre {
    GenreId: Int
    Name: String
  }

  type MediaType {
    MediaTypeId: Int
    Name: String
  }

  type Query {
    albums: [Album],
    artists: [Artist],
    tracks: [Track],
    genres: [Genre],
    mediaTypes: [MediaType]
  }
`;

const resolvers = {
  Query: {
    albums: async () => {
      return await db.sql`SELECT * FROM albums`;
    },
    artists: async () => {
      return await db.sql`SELECT * FROM artists`;
    },
    tracks: async () => {
      return await db.sql`SELECT * FROM tracks`;
    },
    genres: async () => {
      return await db.sql`SELECT * FROM genres`;
    },
    mediaTypes: async () => {
      return await db.sql`SELECT * FROM media_types`;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
  
console.log(`🚀  Server ready at: ${url}`);