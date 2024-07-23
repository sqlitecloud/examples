import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Database } from '@sqlitecloud/drivers';

const connStr = Bun.env.CONN_STR || ':memory:';

const db = new Database(connStr);

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

  type Join {
    AlbumId: Int
    Title: String
    ArtistName: String
  }

  type Query {
    albums: [Album]
    artists: [Artist]
    tracks: [Track]
    genres: [Genre]
    mediaTypes: [MediaType]
    joins: [Join]
    artist(name: String): Artist
    albumsByArtist(artistId: Int): [Album]
  }

  type Mutation {
    createArtist(name: String): Artist
    createAlbum(title: String, artistId: Int): Album
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
    artist: async (_: any, { name }: { name: string }) => {
      const res = await db.sql`SELECT * FROM artists WHERE Name LIKE ${name};`;
      if (res.length === 0) return null;
      return res[0];
    },
    albumsByArtist: async (_: any, { artistId }: { artistId: number }) => {
      return await db.sql`SELECT albums.AlbumId, albums.Title FROM albums INNER JOIN artists ON albums.ArtistId = artists.ArtistId WHERE artists.ArtistId = ${artistId}`;
    },
  },
  Mutation: {
    createArtist: async (_: any, args: { name: string }) => {
      const res =
        await db.sql`INSERT INTO artists (Name) VALUES (${args.name})`;
      if (res.changes === 0) return null;
      return { ArtistId: res.lastID, Name: args.name };
    },
    createAlbum: async (_: any, args: { title: string; artistId: number }) => {
      const res =
        await db.sql`INSERT INTO albums (Title, ArtistId) VALUES (${args.title}, ${args.artistId})`;
      if (res.changes === 0) return null;
      return {
        AlbumId: res.lastID,
        Title: args.title,
        ArtistId: args.artistId,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
