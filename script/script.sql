-- ALTER TABLE employee_contract
-- ADD COLUMN fonction VARCHAR(255),
-- ADD COLUMN "employeeName" VARCHAR(255),
-- ADD COLUMN "address" VARCHAR(255),
-- ADD COLUMN "birthDate" TIMESTAMP,
-- ADD COLUMN "monthlySalary" INTEGER,
-- ADD COLUMN "contractTagline" VARCHAR(255),
-- ADD COLUMN "probationPeriod" INTEGER,
-- ADD COLUMN "utcstartDate" VARCHAR(50),
-- ADD COLUMN "utcendDate" VARCHAR(50),
-- ADD COLUMN "clientContractNumber" VARCHAR(255);

-- ALTER TABLE user_client ADD COLUMN "segmentId" INTEGER;

-- CREATE TABLE IF NOT EXISTS global_settings (
--     "id" SERIAL PRIMARY KEY,
--     "timezone_utc" VARCHAR(50),
--     "dateformat" VARCHAR(50),
--     "timeformat" VARCHAR(50),
--     "currency" VARCHAR(50),
--     "updatedatutc" VARCHAR(50),
--     "createdatutc" VARCHAR(50),
--     "deletedatutc" VARCHAR(50)
-- );

-- ALTER TABLE client
-- ADD COLUMN startdateatutc VARCHAR(50),
-- ADD COLUMN enddateatutc VARCHAR(50),
-- ADD COLUMN "taxAmount" INTEGER,
-- ADD COLUMN "clienttype" VARCHAR(255),
-- ADD COLUMN "parentClientId" INTEGER,
-- ADD COlUMN "clientName" VARCHAR(100),
-- ADD COLUMN "clientEmail" VARCHAR(100);

-- ALTER TABLE client_timesheet_start_day
-- ADD COLUMN dateatutc VARCHAR(50);

-- ALTER TABLE employee
-- ADD COLUMN "utcstartDate" VARCHAR(50),
-- ADD COLUMN "utcmedicalCheckDate" VARCHAR(50),
-- ADD COLUMN "utcmedicalCheckExpiry" VARCHAR(50),
-- ADD COLUMN "utcdOB" VARCHAR(50),
-- ADD COLUMN "employeeType" VARCHAR(50),
-- ADD COLUMN "utccontractSignedDate" VARCHAR(50),
-- ADD COLUMN "utccontractEndDate" VARCHAR(50),
-- ADD COLUMN "ribNumber" INTEGER,
-- ADD COLUMN "bankId" INTEGER;

-- ALTER TABLE reliquat_adjustment
-- ADD COLUMN "utcstartDate" VARCHAR(50);

-- ALTER TABLE reliquat_payment
-- ADD COLUMN "utcstartDate" VARCHAR(50);  

-- ALTER TABLE medical_request
-- ADD COLUMN "utcmedicalDate" VARCHAR(50);

-- ALTER TABLE requests
-- ADD COLUMN "utcdeliveryDate" VARCHAR(50);

-- ALTER TABLE transport_driver
-- ADD COLUMN "utcexperienceStart" VARCHAR(50),
-- ADD COLUMN "utccompanyStart" VARCHAR(50);

-- ALTER TABLE transport_request
-- ADD COLUMN "utcstartDate" VARCHAR(50),
-- ADD COLUMN "utcdestinationDate" VARCHAR(50);

-- ALTER TABLE employee_leave
-- ADD COLUMN "utcstartDate" VARCHAR(50),
-- ADD COLUMN "utcendDate" VARCHAR(50);

-- ALTER TABLE reliquat_calculation
-- ADD COLUMN "monthly_earned" DOUBLE PRECISION,
-- ADD COLUMN "monthly_reliquat" DOUBLE PRECISION,
-- ADD COLUMN "monthly_calc_equation" VARCHAR(255),
-- ADD COLUMN "monthly_calc_formula" VARCHAR(255),
-- ADD COLUMN "utcstartDate" VARCHAR(50),
-- ADD COLUMN "utcendDate" VARCHAR(50);

-- ALTER TABLE medical_type
-- ADD COLUMN "chargeable" VARCHAR(50);

-- ALTER TABLE timesheet
-- ADD COLUMN "requestedUserId" INTEGER,
-- ADD COLUMN "requestedDate" VARCHAR(50);

-- ALTER TABLE login_user
-- ADD COLUMN "timezone_utc" VARCHAR(50),
-- ADD COLUMN "dateformat" VARCHAR(50),
-- ADD COLUMN "timeformat" VARCHAR(50),
-- ADD COLUMN "language" VARCHAR(50),
-- ADD COLUMN "currency" VARCHAR(50),
-- ADD COLUMN "logintimeutc" VARCHAR(50),
-- ADD COLUMN "logouttimeutc" VARCHAR(50);

-- ALTER TABLE history
-- ADD COLUMN "systemUtilisationTime" VARCHAR(50),
-- ADD COLUMN "lastlogintime" VARCHAR(50),
-- ADD COLUMN "lastlogouttime" VARCHAR(50),
-- ADD COLUMN "userId" INTEGER,
-- ADD COLUMN "activity" VARCHAR(50),
-- ADD COLUMN "custom_message" TEXT,
-- ADD COLUMN "moduleName" VARCHAR(50);

-- ALTER TABLE role
-- ADD COLUMN "slug_name" VARCHAR(50);

-- CREATE TABLE increment_requests (
--     "id" SERIAL PRIMARY KEY, -- Auto-incrementing primary key
--     "employeeId" INT NOT NULL, -- Employee ID, assuming it is an integer
--     "employeeName" VARCHAR(255) NOT NULL, -- Employee Name, assuming it's a string
--     "clientId" INT NOT NULL, -- Client ID, assuming it is an integer
--     "status" VARCHAR(50) NOT NULL, -- Status of the increment request
--     "roleId" INT NOT NULL, -- Role ID, assuming it is an integer
--     "salaryIncrement" DECIMAL(10, 2) NOT NULL, -- Salary increment, assuming it has decimal points
--     "bonusIncrement" DECIMAL(10, 2) NOT NULL, -- Bonus increment, assuming it has decimal points
--     "salaryDescription" TEXT, -- Description of salary increment
--     "bonusDescription" TEXT, -- Description of bonus increment
--     "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Time of creation
--     "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Time of the last update
--     "updatedatutc" VARCHAR(50), -- Time of the last update in UTC
--     "createdatutc" VARCHAR(50), -- Time of creation in UTC
--     "createdBy" INT, -- The ID of the user who created the record
--     "updatedBy" INT, -- The ID of the user who last updated the record
--     "deletedAt" TIMESTAMP, -- Time of deletion if the record is soft-deleted
--     "deletedatutc" VARCHAR(50) -- Time of deletion in UTC if the record is soft-deleted
-- );

-- ALTER TABLE increment_requests
-- ADD COLUMN "currentSalary" DECIMAL(10, 2),
-- ADD COLUMN "managerRequestedDate" VARCHAR(50),
-- ADD COLUMN "managerId" INTEGER,
-- ADD COlUMN "managerStatus" VARCHAR(50),
-- ADD COLUMN "salaryIncrementPercent" NUMERIC NOT NULL DEFAULT 0,
-- ADD COLUMN "bonusIncrementPercent" NUMERIC NOT NULL DEFAULT 0,
-- ADD COLUMN "currentBonus" NUMERIC NOT NULL DEFAULT 0;

-- ALTER TABLE increment_requests
-- ALTER COLUMN "salaryDescription" DROP NOT NULL,
-- ALTER COLUMN "bonusDescription" DROP NOT NULL,
-- ALTER COLUMN "currentBonus" DROP NOT NULL;

-- DO $$
-- DECLARE
--     table_name text;
-- BEGIN
--     FOR table_name IN
--         SELECT tablename
--         FROM pg_tables
--         WHERE schemaname = 'public'
--     LOOP
--         EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS createdatutc VARCHAR(50);', table_name);
--     END LOOP;
-- END $$;

-- DO $$
-- DECLARE
--     table_name text;
-- BEGIN
--     FOR table_name IN
--         SELECT tablename
--         FROM pg_tables
--         WHERE schemaname = 'public'
--     LOOP
--         EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updatedatutc VARCHAR(50);', table_name);
--     END LOOP;
-- END $$;

-- DO $$
-- DECLARE
--     table_name text;
-- BEGIN
--     FOR table_name IN
--         SELECT tablename
--         FROM pg_tables
--         WHERE schemaname = 'public'
--     LOOP
--         EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS deletedatutc VARCHAR(50);', table_name);
--     END LOOP;
-- END $$;

-- CREATE TABLE IF NOT EXISTS employee_status_requests (
--     "id" SERIAL PRIMARY KEY,
--     "clientId" INT REFERENCES client(id) ON DELETE SET NULL,
--     "employeeId" INT REFERENCES employee(id) ON DELETE SET NULL,
--     "requestBy" VARCHAR(255) NOT NULL,
--     "requestDate" VARCHAR(255) NOT NULL,
--     "roleId" INT REFERENCES role(id) ON DELETE SET NULL,
--     "reason" VARCHAR(255),
--     "requestType" VARCHAR(50) NOT NULL CHECK ("requestType" IN ('TERMINATION', 'REACTIVATION')),
--     "status" VARCHAR(50) DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED')),
--     "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     "createdBy" INT REFERENCES users(id) ON DELETE SET NULL,
--     "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     "updatedBy" INT REFERENCES users(id) ON DELETE SET NULL,
--     "deletedAt" TIMESTAMP WITH TIME ZONE,
--     "updatedatutc" VARCHAR(50),
--     "createdatutc" VARCHAR(50),
--     "deletedatutc" VARCHAR(50)
-- );

-- ALTER TABLE account_po
-- ADD COLUMN "poSummaryUrl" VARCHAR(255),
-- ADD COLUMN "managerId" INTEGER,
-- ADD COLUMN currency VARCHAR(50);

-- CREATE TABLE IF NOT EXISTS po_summary_excel_url (
--     "id" SERIAL PRIMARY KEY,  -- Auto-incrementing ID
--     "clientId" INTEGER NOT NULL,  -- Client ID (number)
--     "startDate" VARCHAR(255) NOT NULL,  -- Start date as string
--     "endDate" VARCHAR(255) NOT NULL,  -- End date as string
--     "segment" INTEGER NOT NULL,  -- Segment (number)
--     "subSegment" INTEGER NOT NULL,  -- Sub-segment (number)
--     "poSummaryUrl" VARCHAR(255) NOT NULL,  -- URL string
--     "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp with timezone for creation
--     "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp with timezone for updates
--     "deletedAt" TIMESTAMPTZ,  -- Nullable for soft deletion
--     "updatedatutc" VARCHAR(50),  -- UTC timestamp for updates in ISO format
--     "createdatutc" VARCHAR(50),  -- UTC timestamp for creation in ISO format
--     "deletedatutc" VARCHAR(50)  -- UTC timestamp for deletion in ISO format
-- );

-- ALTER TABLE contact
-- ALTER COLUMN "address1" DROP NOT NULL,
-- ALTER COLUMN "city" DROP NOT NULL,
-- ALTER COLUMN "region" DROP NOT NULL,
-- ALTER COLUMN "postalCode" DROP NOT NULL,
-- ALTER COLUMN "country" DROP NOT NULL;

-- UPDATE client AS t
-- SET clienttype = subquery.new_value1
-- FROM (
--     VALUES 
--         (15, 'client'),
--         (34, 'client'),
--         (36, 'client'),
--         (41, 'client'),
--         (55, 'client')
-- ) AS subquery(id, new_value1)
-- WHERE t.id = subquery.id;

-- CREATE TABLE IF NOT EXISTS leave_type_master (
--     "id" SERIAL PRIMARY KEY,  -- Auto-incrementing ID
--     "name" VARCHAR(255), 
--     "code" VARCHAR(255), 
--     "description" VARCHAR(255), 
--     "payment_type" VARCHAR(50),
--     "slug" VARCHAR(50),
--     "createdBy" INTEGER,
--     "updatedBy" INTEGER, 
--     "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
--     "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
--     "deletedAt" TIMESTAMPTZ, 
--     "updatedatutc" VARCHAR(50),  -- UTC timestamp for updates in ISO format
--     "createdatutc" VARCHAR(50),  -- UTC timestamp for creation in ISO format
--     "deletedatutc" VARCHAR(50)  -- UTC timestamp for deletion in ISO format
-- );

-- CREATE TABLE IF NOT EXISTS bonus_type_master (
--     "id" SERIAL PRIMARY KEY,  -- Auto-incrementing ID
--     "name" VARCHAR(255), 
--     "code" VARCHAR(255), 
--     "description" VARCHAR(255), 
--     "payment_type" VARCHAR(50),
--     "slug" VARCHAR(50),
--     "createdBy" INTEGER,
--     "updatedBy" INTEGER, 
--     "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
--     "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
--     "deletedAt" TIMESTAMPTZ, 
--     "updatedatutc" VARCHAR(50),  -- UTC timestamp for updates in ISO format
--     "createdatutc" VARCHAR(50),  -- UTC timestamp for creation in ISO format
--     "deletedatutc" VARCHAR(50)  -- UTC timestamp for deletion in ISO format
-- );

-- CREATE TABLE IF NOT EXISTS attendance_type_master (
--     "id" SERIAL PRIMARY KEY,  -- Auto-incrementing ID
--     "name" VARCHAR(255), 
--     "code" VARCHAR(255), 
--     "description" VARCHAR(255), 
--     "slug" VARCHAR(50),
--     "createdBy" INTEGER,
--     "updatedBy" INTEGER, 
--     "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
--     "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
--     "deletedAt" TIMESTAMPTZ, 
--     "updatedatutc" VARCHAR(50),  -- UTC timestamp for updates in ISO format
--     "createdatutc" VARCHAR(50),  -- UTC timestamp for creation in ISO format
--     "deletedatutc" VARCHAR(50)  -- UTC timestamp for deletion in ISO format
-- );

-- CREATE TABLE IF NOT EXISTS holidays_master (
--     "id" SERIAL PRIMARY KEY,  -- Auto-incrementing ID
--     "name" VARCHAR(255), 
--     "label" VARCHAR(50),
--     "code" VARCHAR(255), 
--     "description" VARCHAR(255), 
--     "payment_type" VARCHAR(50),
--     "slug" VARCHAR(50),
--     "createdBy" INTEGER,
--     "updatedBy" INTEGER, 
--     "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
--     "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
--     "deletedAt" TIMESTAMPTZ, 
--     "updatedatutc" VARCHAR(50),  -- UTC timestamp for updates in ISO format
--     "createdatutc" VARCHAR(50),  -- UTC timestamp for creation in ISO format
--     "deletedatutc" VARCHAR(50)  -- UTC timestamp for deletion in ISO format
-- );

--  CREATE TABLE IF NOT EXISTS client_attendance (
--     "id" SERIAL PRIMARY KEY,  -- Auto-incrementing ID
--     "clientId" INTEGER NOT NULL,  -- Client ID (number)
--     "status_type" VARCHAR(50),
--     "statusId" INTEGER NOT NULL, 
--     "status_code" VARCHAR(50),
--     "dates" text[],
--     "bonus_type" VARCHAR(50),
--     "reliquatValue" VARCHAR(50),
--     "conditions" TEXT,
--     "payment_type" VARCHAR(50),
--     "employee_type" VARCHAR(50),
--     "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp with timezone for creation
--     "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp with timezone for updates
--     "deletedAt" TIMESTAMPTZ,  -- Nullable for soft deletion
--     "updatedatutc" VARCHAR(50),  -- UTC timestamp for updates in ISO format
--     "createdatutc" VARCHAR(50),  -- UTC timestamp for creation in ISO format
--     "deletedatutc" VARCHAR(50)  -- UTC timestamp for deletion in ISO format
-- );

-- CREATE TABLE IF NOT EXISTS segment_manager (
--     "id" SERIAL PRIMARY KEY,
--     "segmentId" INTEGER,
--     "loginUserId" INTEGER,
--     "clientId" INTEGER,
--     "isActive" BOOLEAN DEFAULT true,
--     "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp with timezone for creation
--     "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp with timezone for updates
--     "deletedAt" TIMESTAMPTZ,  -- Nullable for soft deletion
--     "updatedatutc" VARCHAR(50),  -- UTC timestamp for updates in ISO format
--     "createdatutc" VARCHAR(50),  -- UTC timestamp for creation in ISO format
--     "deletedatutc" VARCHAR(50)  -- UTC timestamp for deletion in ISO format
-- );

-- CREATE TABLE IF NOT EXISTS banks (
--     "id" SERIAL PRIMARY KEY,
--     "bankName" VARCHAR(255),
--     "ribNumber" INTEGER,
--     "loginUserId" INTEGER,
--     "isActive" BOOLEAN DEFAULT true,
--     "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp with timezone for creation
--     "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp with timezone for updates
--     "deletedAt" TIMESTAMPTZ,  -- Nullable for soft deletion
--     "updatedatutc" VARCHAR(50),  -- UTC timestamp for updates in ISO format
--     "createdatutc" VARCHAR(50),  -- UTC timestamp for creation in ISO format
--     "deletedatutc" VARCHAR(50)  -- UTC timestamp for deletion in ISO format
-- );

-- Update contract_template
-- set "contractName" = 'LRED_Algerian_Contract'
-- where id = 7;

-- Update contract_template
-- set "contractName" = 'LRED_Algerian_Avenant'
-- where id = 5;

-- ALTER TABLE timesheet_schedule
-- ADD COLUMN "statusId" INTEGER;

-- ALTER TABLE rotation
-- ADD COLUMN "country" VARCHAR(255),
-- ADD COLUMN "annualHolidays" INTEGER,
-- ADD COLUMN "overtimeBonusType" VARCHAR(255),
-- ADD COLUMN "overtimeHours" INTEGER;

-- ALTER TABLE employee_file
-- ADD COLUMN "clientId" INTEGER;

-- UPDATE employee
-- SET "employeeType" = CASE
--     WHEN rotation."isResident" = TRUE THEN 'Resident'
--     ELSE 'Rotation'
-- END
-- FROM rotation
-- WHERE employee."rotationId" = rotation.id;
