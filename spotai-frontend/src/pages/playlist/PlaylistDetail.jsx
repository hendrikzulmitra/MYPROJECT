import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Plus, Search, Sparkles, 
  Music2, Play, Pause, X, Save
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import api from '../../config/api';
import toast from 'react-hot-toast';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  const [showSpotifySearch, setShowSpotifySearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    mood: ''
  });

  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    album: ''
  });

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const getPreviewUrl = (song) => {
    // support multiple server shapes: previewUrl (camel), preview_url (snake), preview
    return song?.previewUrl || song?.preview_url || song?.preview || null;
  };

  const fetchPlaylist = async () => {
    try {
      const response = await api.get(`/playlists/${id}`);
      // normalize songs so frontend always uses previewUrl
      const data = response.data;
      const normalizedSongs = (data.songs || []).map((s) => ({
        ...s,
        previewUrl: getPreviewUrl(s)
      }));
      setPlaylist({ ...data, songs: normalizedSongs });
      setEditData({
        title: data.title,
        description: data.description || '',
        mood: data.mood || ''
      });
      // console.log('Fetched playlist', { ...data, songs: normalizedSongs });
    } catch (error) {
      toast.error('Failed to fetch playlist');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlaylist = async () => {
    try {
      await api.put(`/playlists/${id}`, editData);
      toast.success('Playlist updated!');
      setEditMode(false);
      fetchPlaylist();
    } catch (error) {
      toast.error('Failed to update playlist');
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      await api.delete(`/playlists/${id}`);
      toast.success('Playlist deleted!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete playlist');
    }
  };

  const handleAddManualSong = async (e) => {
    e.preventDefault();
    
    try {
      await api.post(`/songs/playlist/${id}`, newSong);
      toast.success('Song added!');
      setShowAddSong(false);
      setNewSong({ title: '', artist: '', album: '' });
      fetchPlaylist();
    } catch (error) {
      toast.error('Failed to add song');
    }
  };

  const handleSearchSpotify = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await api.get(`/spotify/search?q=${searchQuery}&limit=10`);
      setSearchResults(response.data);
    } catch (error) {
      toast.error('Failed to search Spotify');
    } finally {
      setSearching(false);
    }
  };

  const handleAddSpotifySong = async (track) => {
    try {
      await api.post(`/songs/playlist/${id}`, {
        title: track.title,
        artist: track.artist,
        album: track.album,
        spotifyId: track.spotifyId,
        previewUrl: track.previewUrl,
        duration: track.duration,
        imageUrl: track.imageUrl
      });
      toast.success('Song added from Spotify!');
      setShowSpotifySearch(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchPlaylist();
    } catch (error) {
      toast.error('Failed to add song');
    }
  };

  const handleDeleteSong = async (songId) => {
    try {
      await api.delete(`/songs/${songId}`);
      toast.success('Song removed!');
      fetchPlaylist();
    } catch (error) {
      toast.error('Failed to remove song');
    }
  };

  // Song edit state and handlers
  const [editingSongId, setEditingSongId] = useState(null);
  const [editingSongData, setEditingSongData] = useState({ title: '', artist: '', album: '' });

  // Audio playback state
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentPlayingId(null);
    };
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playPreview = (song) => {
    const audio = audioRef.current;
    const preview = getPreviewUrl(song);
    if (!preview) return;

    // If clicking the same song toggle play/pause
    if (currentPlayingId === song.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch((e) => console.error(e));
        setIsPlaying(true);
      }
      return;
    }

    // New song: set src and play
    audio.src = preview;
    audio.currentTime = 0;
    audio.play().catch((e) => console.error(e));
    setCurrentPlayingId(song.id);
    setIsPlaying(true);
  };

  const stopPreview = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentPlayingId(null);
  };

  const handleStartEditSong = (song) => {
    setEditingSongId(song.id);
    setEditingSongData({ title: song.title || '', artist: song.artist || '', album: song.album || '' });
  };

  const handleCancelEditSong = () => {
    setEditingSongId(null);
    setEditingSongData({ title: '', artist: '', album: '' });
  };

  const handleSaveSongEdit = async (songId) => {
    try {
      await api.put(`/songs/${songId}`, editingSongData);
      toast.success('Song updated!');
      setEditingSongId(null);
      fetchPlaylist();
    } catch (error) {
      toast.error('Failed to update song');
    }
  };

  const handleGenerateDescription = async () => {
    if (playlist.songs.length === 0) {
      toast.error('Add some songs first!');
      return;
    }

    try {
      toast.loading('Generating AI description...', { id: 'ai-desc' });
      const response = await api.post(`/ai/playlist/${id}/description`);
      toast.success('AI description generated!', { id: 'ai-desc' });
      setPlaylist({ ...playlist, aiDescription: response.data.description });
    } catch (error) {
      toast.error('Failed to generate description', { id: 'ai-desc' });
    }
  };

  const handleAnalyzeMood = async () => {
    if (playlist.songs.length === 0) {
      toast.error('Add some songs first!');
      return;
    }

    try {
      toast.loading('Analyzing mood...', { id: 'ai-mood' });
      const response = await api.post(`/ai/playlist/${id}/mood`);
      toast.success(`Mood detected: ${response.data.mood}`, { id: 'ai-mood' });
      setPlaylist({ ...playlist, mood: response.data.mood });
      setEditData({ ...editData, mood: response.data.mood });
    } catch (error) {
      toast.error('Failed to analyze mood', { id: 'ai-mood' });
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-spotify-lightgray hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

        {/* Playlist Header */}
        <div className="bg-gradient-to-b from-spotify-darkgray to-spotify-black rounded-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover Image */}
            <div className="w-full md:w-64 aspect-square rounded-lg overflow-hidden shadow-2xl flex-shrink-0">
              <img
                src={playlist.coverImage}
                alt={playlist.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-end">
              <p className="text-spotify-lightgray text-sm mb-2">PLAYLIST</p>
              
              {editMode ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="text-4xl md:text-5xl font-bold text-white bg-transparent border-b-2 border-spotify-green focus:outline-none mb-4"
                />
              ) : (
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {playlist.title}
                </h1>
              )}

              {editMode ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="text-spotify-lightgray bg-spotify-darkgray p-2 rounded mb-4 focus:outline-none focus:border-spotify-green border border-transparent"
                  rows={2}
                  placeholder="Add a description..."
                />
              ) : (
                <p className="text-spotify-lightgray mb-4">
                  {playlist.description || 'No description'}
                </p>
              )}

              {playlist.aiDescription && (
                <div className="bg-spotify-darkgray p-4 rounded-lg mb-4 border border-spotify-green">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-spotify-green" />
                    <span className="text-spotify-green font-semibold text-sm">AI Description</span>
                  </div>
                  <p className="text-white text-sm">{playlist.aiDescription}</p>
                </div>
              )}

              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-white font-semibold">
                  {playlist.songs?.length || 0} songs
                </span>
                {playlist.mood && (
                  <span className="px-3 py-1 bg-spotify-green text-white rounded-full text-sm">
                    {playlist.mood}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                {editMode ? (
                  <>
                    <button
                      onClick={handleUpdatePlaylist}
                      className="flex items-center gap-2 bg-spotify-green hover:bg-green-600 text-white px-4 py-2 rounded-full transition"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex items-center gap-2 bg-spotify-gray hover:bg-spotify-lightgray text-white px-4 py-2 rounded-full transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 bg-spotify-darkgray hover:bg-spotify-gray text-white px-4 py-2 rounded-full transition"
                    >
                      <Edit className="w-5 h-5" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeletePlaylist}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </button>
                    <button
                      onClick={handleGenerateDescription}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition"
                    >
                      <Sparkles className="w-5 h-5" />
                      AI Description
                    </button>
                    <button
                      onClick={handleAnalyzeMood}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition"
                    >
                      <Sparkles className="w-5 h-5" />
                      Analyze Mood
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Song Section */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setShowAddSong(!showAddSong)}
            className="flex items-center gap-2 bg-spotify-green hover:bg-green-600 text-white px-4 py-2 rounded-full transition"
          >
            <Plus className="w-5 h-5" />
            Add Song Manually
          </button>
          <button
            onClick={() => setShowSpotifySearch(!showSpotifySearch)}
            className="flex items-center gap-2 bg-spotify-darkgray hover:bg-spotify-gray text-white px-4 py-2 rounded-full transition"
          >
            <Search className="w-5 h-5" />
            Search Spotify
          </button>
        </div>

        {/* Manual Add Song Form */}
        {showAddSong && (
          <div className="bg-spotify-darkgray rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Song Manually</h3>
            <form onSubmit={handleAddManualSong} className="space-y-4">
              <input
                type="text"
                placeholder="Song Title *"
                value={newSong.title}
                onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                className="w-full bg-spotify-black text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green"
                required
              />
              <input
                type="text"
                placeholder="Artist *"
                value={newSong.artist}
                onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                className="w-full bg-spotify-black text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green"
                required
              />
              <input
                type="text"
                placeholder="Album (optional)"
                value={newSong.album}
                onChange={(e) => setNewSong({ ...newSong, album: e.target.value })}
                className="w-full bg-spotify-black text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-spotify-green hover:bg-green-600 text-white px-6 py-2 rounded-full transition"
                >
                  Add Song
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSong(false)}
                  className="bg-spotify-gray hover:bg-spotify-lightgray text-white px-6 py-2 rounded-full transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Spotify Search */}
        {showSpotifySearch && (
          <div className="bg-spotify-darkgray rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Search Spotify</h3>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                placeholder="Search for songs, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSpotify()}
                className="flex-1 bg-spotify-black text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
              <button
                onClick={handleSearchSpotify}
                disabled={searching}
                className="bg-spotify-green hover:bg-green-600 text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((track, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 bg-spotify-black p-3 rounded-lg hover:bg-spotify-gray transition"
                  >
                    <img
                      src={track.imageUrl || 'https://via.placeholder.com/50'}
                      alt={track.title}
                      className="w-12 h-12 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{track.title}</p>
                      <p className="text-spotify-lightgray text-sm truncate">{track.artist}</p>
                    </div>
                    <button
                      onClick={() => handleAddSpotifySong(track)}
                      className="bg-spotify-green hover:bg-green-600 text-white px-4 py-2 rounded-full transition flex-shrink-0"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Songs List */}
        <div className="bg-spotify-darkgray rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Songs</h2>
          
          {playlist.songs?.length === 0 ? (
            <div className="text-center py-12">
              <Music2 className="w-16 h-16 text-spotify-gray mx-auto mb-4" />
              <p className="text-spotify-lightgray">No songs yet. Add some music!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlist.songs?.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-spotify-black transition group"
                >
                  <span className="text-spotify-lightgray w-8 text-center">
                    {index + 1}
                  </span>
                  
                  {song.imageUrl && (
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className="w-12 h-12 rounded"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    {editingSongId === song.id ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={editingSongData.title}
                          onChange={(e) => setEditingSongData({ ...editingSongData, title: e.target.value })}
                          className="w-full bg-spotify-black text-white px-2 py-1 rounded focus:outline-none"
                        />
                        <input
                          type="text"
                          value={editingSongData.artist}
                          onChange={(e) => setEditingSongData({ ...editingSongData, artist: e.target.value })}
                          className="w-full bg-spotify-black text-white px-2 py-1 rounded focus:outline-none"
                        />
                        <input
                          type="text"
                          value={editingSongData.album}
                          onChange={(e) => setEditingSongData({ ...editingSongData, album: e.target.value })}
                          className="w-full bg-spotify-black text-white px-2 py-1 rounded focus:outline-none"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-white font-semibold truncate">{song.title}</p>
                        <p className="text-spotify-lightgray text-sm truncate">{song.artist}</p>
                      </>
                    )}
                  </div>

                  {editingSongId === song.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveSongEdit(song.id)}
                        className="bg-spotify-green hover:bg-green-600 text-white px-4 py-2 rounded-full transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditSong}
                        className="bg-spotify-gray hover:bg-spotify-lightgray text-white px-4 py-2 rounded-full transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const preview = getPreviewUrl(song);
                          if (!preview) {
                            toast('Preview not available for this song');
                            return;
                          }
                          playPreview(song);
                        }}
                        className={`text-spotify-green hover:text-green-400 transition flex items-center justify-center w-8 h-8 rounded-full ${!getPreviewUrl(song) ? 'opacity-50 cursor-not-allowed' : ''} ${currentPlayingId===song.id && isPlaying ? 'bg-spotify-green/20' : ''}`}
                        title={getPreviewUrl(song) ? (currentPlayingId===song.id && isPlaying ? 'Pause preview' : 'Play preview') : 'Preview not available'}
                        aria-disabled={!getPreviewUrl(song)}
                      >
                        {currentPlayingId===song.id && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={() => handleStartEditSong(song)}
                        className="text-spotify-lightgray hover:text-white opacity-0 group-hover:opacity-100 transition"
                        title="Edit song"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDeleteSong(song.id)}
                        className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PlaylistDetail;