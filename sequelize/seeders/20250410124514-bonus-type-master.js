'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const utcNow = new Date().toISOString();

    return queryInterface.bulkInsert('bonus_type_master', [
      {
        name: 'Performance Bonus',
        code: 'PB',
        bonus_type: 'RELIQUAT',
        description: 'Awarded based on employee performance',
        slug: 'performance-bonus',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdatutc: utcNow,
        updatedatutc: utcNow,
        deletedatutc: null,
        deletedAt: null,
      },
      {
        name: 'Festival Bonus',
        code: 'FB',
        bonus_type: 'RELIQUAT',
        description: 'Given during festivals or special occasions',
        slug: 'festival-bonus',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdatutc: utcNow,
        updatedatutc: utcNow,
        deletedatutc: null,
        deletedAt: null,
      },
      {
        name: 'Retention Bonus',
        code: 'RB',
        bonus_type: 'RELIQUAT',
        description: 'Offered to retain employees for a certain term',
        slug: 'retention-bonus',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdatutc: utcNow,
        updatedatutc: utcNow,
        deletedatutc: null,
        deletedAt: null,
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('bonus_type_master', {
      code: ['PB', 'FB', 'RB'],
    }, {});
  }
};
