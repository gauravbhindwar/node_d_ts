'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const utcNow = new Date().toISOString();

    return queryInterface.bulkInsert('holidays_master', [
      {
        name: 'New Year',
        label: 'New Year Holiday',
        code: 'NY',
        description: 'Holiday to celebrate New Year',
        slug: 'new-year',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdatutc: utcNow,
        updatedatutc: utcNow,
        deletedatutc: null,
        deletedAt: null,
      },
      {
        name: 'Independence Day',
        label: 'National Holiday',
        code: 'IND',
        description: 'National independence celebration',
        slug: 'independence-day',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdatutc: utcNow,
        updatedatutc: utcNow,
        deletedatutc: null,
        deletedAt: null,
      },
      {
        name: 'Diwali',
        label: 'Festival of Lights',
        code: 'DWL',
        description: 'Major Indian festival',
        slug: 'diwali',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdatutc: utcNow,
        updatedatutc: utcNow,
        deletedatutc: null,
        deletedAt: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('holidays_master', {
      code: ['NY', 'IND', 'DWL'],
    }, {});
  },
};
