import React from 'react';
import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';

const PlaylistCard = React.memo(({ playlist }) => {
  return (
    <Link
      to={`/playlists/${playlist.id}`}
      className="bg-spotify-darkgray hover:bg-spotify-gray rounded-lg p-4 transition group"
    >
      <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-spotify-gray relative">
        <img
          src={playlist.coverImage}
          alt={playlist.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-300 flex items-center justify-center">
          <div className="transform scale-0 group-hover:scale-100 transition duration-300">
            <div className="bg-spotify-green rounded-full p-3">
              <Music className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      <h3 className="text-white font-semibold mb-1 truncate">
        {playlist.title}
      </h3>
      <p className="text-spotify-lightgray text-sm mb-2">
        {playlist.songs?.length || 0} songs
      </p>
      {playlist.mood && (
        <span className="inline-block px-2 py-1 bg-spotify-green text-white text-xs rounded-full">
          {playlist.mood}
        </span>
      )}
    </Link>
  );
});

PlaylistCard.displayName = 'PlaylistCard';

export default PlaylistCard;