import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Music, Sparkles, TrendingUp } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { fetchPlaylists } from '../../store/playlistSlice';

const Dashboard = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { items: playlists, loading, stats } = useSelector((state) => state.playlists);

  useEffect(() => {
    dispatch(fetchPlaylists());
  }, [dispatch]);

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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-spotify-lightgray">    
          Manage your playlists and discover new music with AI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-spotify-darkgray to-spotify-gray rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-spotify-lightgray text-sm mb-1">Total Playlists</p>
              <p className="text-3xl font-bold text-white">{stats.totalPlaylists}</p>
            </div>
            <Music className="w-12 h-12 text-spotify-green opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-spotify-darkgray to-spotify-gray rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-spotify-lightgray text-sm mb-1">Total Songs</p>
              <p className="text-3xl font-bold text-white">{stats.totalSongs}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-spotify-green to-green-600 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm mb-1">AI Features</p>
              <p className="text-3xl font-bold text-white">Active</p>
            </div>
            <Sparkles className="w-12 h-12 text-white opacity-50" />
          </div>
        </div>
      </div>

      {/* Recent Playlists */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
        <Link
          to="/playlists/create"
          className="flex items-center gap-2 bg-spotify-green hover:bg-green-600 text-white px-4 py-2 rounded-full transition"
        >
          <Plus className="w-5 h-5" />
          Create Playlist
        </Link>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-16 bg-spotify-darkgray rounded-lg">
          <Music className="w-16 h-16 text-spotify-gray mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
          <p className="text-spotify-lightgray mb-6">
            Create your first playlist to get started
          </p>
          <Link
            to="/playlists/create"
            className="inline-flex items-center gap-2 bg-spotify-green hover:bg-green-600 text-white px-6 py-3 rounded-full transition"
          >
            <Plus className="w-5 h-5" />
            Create Your First Playlist
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              to={`/playlists/${playlist.id}`}
              className="bg-spotify-darkgray hover:bg-spotify-gray rounded-lg p-4 transition group"
            >
              <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-spotify-gray">
                <img
                  src={playlist.coverImage}
                  alt={playlist.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <h3 className="text-white font-semibold mb-1 truncate">
                {playlist.title}
              </h3>
              <p className="text-spotify-lightgray text-sm truncate">
                {playlist.songs?.length || 0} songs
              </p>
              {playlist.mood && (
                <span className="inline-block mt-2 px-2 py-1 bg-spotify-green text-white text-xs rounded-full">
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

export default Dashboard;