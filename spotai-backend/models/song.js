'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Song extends Model {
    static associate(models) {
      Song.belongsTo(models.Playlist, {
        foreignKey: 'playlistId',
        as: 'playlist'
      });
    }
  }
  
  Song.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: false
    },
    album: DataTypes.STRING,
    spotifyId: DataTypes.STRING,
    previewUrl: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    imageUrl: DataTypes.STRING,
    playlistId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Song',
  });
  
  return Song;
};