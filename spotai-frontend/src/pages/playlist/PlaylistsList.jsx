import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Music, Search } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import api from '../../config/api';
import toast from 'react-hot-toast';

const PlaylistsList = () => {
  const [playlists, setPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPlaylists();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = playlists.filter(
        (playlist) =>
          playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          playlist.mood?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlaylists(filtered);
    } else {
      setFilteredPlaylists(playlists);
    }
  }, [searchQuery, playlists]);

  const fetchPlaylists = async () => {
    try {
      const response = await api.get('/playlists');
      setPlaylists(response.data);
      setFilteredPlaylists(response.data);
    } catch (error) {
      toast.error('Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-green"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Playlists</h1>
            <p className="text-spotify-lightgray">
              {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
            </p>
          </div>
          <Link
            to="/playlists/create"
            className="flex items-center gap-2 bg-spotify-green hover:bg-green-600 text-white px-6 py-3 rounded-full transition"
          >
            <Plus className="w-5 h-5" />
            Create Playlist
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-spotify-lightgray w-5 h-5" />
          <input
            type="text"
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-spotify-darkgray text-white pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green"
          />
        </div>
      </div>

      {filteredPlaylists.length === 0 ? (
        <div className="text-center py-16 bg-spotify-darkgray rounded-lg">
          <Music className="w-16 h-16 text-spotify-gray mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? 'No playlists found' : 'No playlists yet'}
          </h3>
          <p className="text-spotify-lightgray mb-6">
            {searchQuery
              ? 'Try a different search term'
              : 'Create your first playlist to get started'}
          </p>
          {!searchQuery && (
            <Link
              to="/playlists/create"
              className="inline-flex items-center gap-2 bg-spotify-green hover:bg-green-600 text-white px-6 py-3 rounded-full transition"
            >
              <Plus className="w-5 h-5" />
              Create Playlist
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlaylists.map((playlist) => (
            <Link
              key={playlist.id}
              to={`/playlists/${playlist.id}`}
              className="bg-spotify-darkgray hover:bg-spotify-gray rounded-lg p-4 transition group"
            >
              <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-spotify-gray relative">
                <img
                  src={playlist.coverImage}
                  alt={playlist.title}
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
          ))}
        </div>
      )}
    </Layout>
  );
};

export default PlaylistsList;