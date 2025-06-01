'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const utcNow = new Date().toISOString();
    return queryInterface.bulkInsert('leave_type_master', [
      {
        name: 'Sick Leave',
        code: 'SL',
        description: 'Leave for sickness or medical issues',
        slug: 'sick-leave',
        payment_type: 'UNPAID',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdatutc: utcNow,
        updatedatutc: utcNow,
        deletedatutc: null,
        deletedAt: null,
      },
      {
        name: 'Paid Leave',
        code: 'PL',
        description: 'Paid time off',
        slug: 'paid-leave',
        payment_type: 'PAID',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdatutc: utcNow,
        updatedatutc: utcNow,
        deletedatutc: null,
        deletedAt: null,
      },
      {
        name: 'Casual Leave',
        code: 'CL',
        description: 'Casual leave for personal reasons',
        slug: 'casual-leave',
        payment_type: 'UNPAID',
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
    return queryInterface.bulkDelete('leave_type_master', {
      code: ['SL', 'PL', 'CL']
    }, {});
  }
};
