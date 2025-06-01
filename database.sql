CREATE TABLE increment_requests (
    "id" SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    "employeeId" INT NOT NULL, -- Employee ID, assuming it is an integer
    "employeeName" VARCHAR(255) NOT NULL, -- Employee Name, assuming it's a string
    "clientId" INT NOT NULL, -- Client ID, assuming it is an integer
    "status" VARCHAR(50) NOT NULL, -- Status of the increment request
    "roleId" INT NOT NULL, -- Role ID, assuming it is an integer
    "salaryIncrement" DECIMAL(10, 2) NOT NULL, -- Salary increment, assuming it has decimal points
    "bonusIncrement" DECIMAL(10, 2) NOT NULL, -- Bonus increment, assuming it has decimal points
    "salaryDescription" TEXT, -- Description of salary increment
    "bonusDescription" TEXT, -- Description of bonus increment
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Time of creation
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Time of the last update
    "updatedatutc" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Time of the last update in UTC
    "createdatutc" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Time of creation in UTC
    "createdBy" INT, -- The ID of the user who created the record
    "updatedBy" INT, -- The ID of the user who last updated the record
    "deletedAt" TIMESTAMP, -- Time of deletion if the record is soft-deleted
    "deletedatutc" TIMESTAMP -- Time of deletion in UTC if the record is soft-deleted
);
