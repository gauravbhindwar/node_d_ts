'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const utcNow = new Date().toISOString();
    return queryInterface.bulkInsert('attendance_type_master', [
      {
        name: 'Present',
        code: 'P',
        description: 'Present at work',
        slug: 'present',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdatutc: utcNow,
        updatedatutc: utcNow,
      },
      {
        name: 'Work From Home',
        code: 'WFH',
        description: 'Working remotely',
        slug: 'work-from-home',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdatutc: utcNow,
        updatedatutc: utcNow,
      },
      {
        name: 'Half Day',
        code: 'HD',
        description: 'Half-day attendance',
        slug: 'half-day',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdatutc: utcNow,
        updatedatutc: utcNow,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('attendance_type_master', null, {});
  }
};
