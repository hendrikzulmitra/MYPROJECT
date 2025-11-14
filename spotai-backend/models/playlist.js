'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      Playlist.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Playlist.hasMany(models.Song, {
        foreignKey: 'playlistId',
        as: 'songs'
      });
    }
  }
  
  Playlist.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    aiDescription: DataTypes.TEXT,
    mood: DataTypes.STRING,
    coverImage: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Playlist',
  });
  
  return Playlist;
};