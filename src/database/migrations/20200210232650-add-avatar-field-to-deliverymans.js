module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deliverymans', 'avatar_id', {
      type: Sequelize.INTEGER,
      references: { model: 'files', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allownull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('deliveryman', 'avatar_id');
  },
};