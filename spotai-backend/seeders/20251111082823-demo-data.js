'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Note: In production, create user via Google OAuth
    // This is just for testing
    
    const users = await queryInterface.bulkInsert('Users', [{
      googleId: 'demo123',
      email: 'demo@example.com',
      name: 'Demo User',
      picture: 'https://via.placeholder.com/150',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    const userId = users[0].id;

    const playlists = await queryInterface.bulkInsert('Playlists', [{
      title: 'Chill Vibes',
      description: 'Relax and unwind',
      mood: 'Chill',
      coverImage: 'https://via.placeholder.com/300x300/1DB954/ffffff?text=Chill',
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      title: 'Workout Energy',
      description: 'High energy workout playlist',
      mood: 'Energetic',
      coverImage: 'https://via.placeholder.com/300x300/FF0000/ffffff?text=Energy',
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    await queryInterface.bulkInsert('Songs', [{
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: 200000,
      imageUrl: 'https://via.placeholder.com/300',
      playlistId: playlists[0].id,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      title: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      duration: 203000,
      imageUrl: 'https://via.placeholder.com/300',
      playlistId: playlists[0].id,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Songs', null, {});
    await queryInterface.bulkDelete('Playlists', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};