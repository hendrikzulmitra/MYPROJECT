import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import api from '../../config/api';
import toast from 'react-hot-toast';

const CreatePlaylist = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mood: '',
    coverImage: ''
  });

  const moods = ['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic', 'Party', 'Focus', 'Melancholic'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a playlist title');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/playlists', formData);
      toast.success('Playlist created successfully!');
      navigate(`/playlists/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-spotify-lightgray hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">Create New Playlist</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-spotify-darkgray rounded-lg p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Playlist Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="My Awesome Playlist"
              className="w-full bg-spotify-black text-white px-4 py-3 rounded-lg border border-spotify-gray focus:border-spotify-green focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your playlist..."
              rows={4}
              className="w-full bg-spotify-black text-white px-4 py-3 rounded-lg border border-spotify-gray focus:border-spotify-green focus:outline-none resize-none"
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Mood (Optional)
            </label>
            <select
              name="mood"
              value={formData.mood}
              onChange={handleChange}
              className="w-full bg-spotify-black text-white px-4 py-3 rounded-lg border border-spotify-gray focus:border-spotify-green focus:outline-none"
            >
              <option value="">Select a mood</option>
              {moods.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-spotify-black text-white px-4 py-3 rounded-lg border border-spotify-gray focus:border-spotify-green focus:outline-none"
            />
            <p className="text-spotify-lightgray text-sm mt-2">
              Leave empty for default cover
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spotify-green hover:bg-green-600 text-white font-semibold py-3 rounded-full transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Playlist
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePlaylist;