// import fs from "fs";
// import path from "path";
// import { ModelCtor, Sequelize } from "sequelize-typescript";
// import { DATABASE_URL } from "../config";

// let db: Sequelize;

// const initSequelize = () => {
//   const _basename = path.basename(module.filename);
//   console.log("DATABASE_URL --------->", DATABASE_URL)
//   const sequelize = new Sequelize(DATABASE_URL, {
//     dialect: "postgres",
//     // dialectOptions: {
//     //   ssl: {
//     //     require: true,
//     //     rejectUnauthorized: false
//     //   }
//     // },
//     // logging: NODE_ENV === "development" && console.log,
//     logging: false,
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//   });

//   const _models = fs
//     .readdirSync(__dirname)
//     .filter((file: string) => {
//       return (
//         file !== _basename &&
//         file !== "interfaces" &&
//         !file.endsWith(".d.ts") &&
//         (file.slice(-3) === ".js" || file.slice(-3) === ".ts")
//       );
//     })
//     .map((file: string) => {
//       const model: ModelCtor = require(path.join(__dirname, file))?.default;
//       return model;
//     });

//   sequelize.addModels(_models);
//   sequelize
//   .authenticate()
//   .then(async () => {    
//     // const scriptPath = fs.readFileSync(path.join(__dirname, "../../script/script.sql"), 'utf8');
    
//     // await sequelize.query(scriptPath);
//     // await sequelize.sync({ alter: true });
//     sequelize.sync()
//     console.log('Migrations ran successfully.');
//     await sequelize.query(`
//       -- Step 1: Delete related rows from request_document
//       DELETE FROM "request_document"
//       WHERE "requestId" IN (
//           SELECT id FROM "requests"
//           WHERE id NOT IN (
//               SELECT MIN(id)
//               FROM "requests"
//               GROUP BY "contractNumber"
//           )
//       );

//       -- Step 2: Delete duplicate requests
//       DELETE FROM "requests"
//       WHERE id NOT IN (
//           SELECT MIN(id)
//           FROM "requests"
//           GROUP BY "contractNumber"
//       );

//       -- Step 3: Set dbKey to NULL for Duplicates in timesheet
//       UPDATE "timesheet"
//       SET "dbKey" = NULL
//       WHERE id NOT IN (
//           SELECT MIN(id)
//           FROM "timesheet"
//           GROUP BY "dbKey"
//       );

//       -- Step 4: Remove duplicate timesheet_schedule records
//       WITH duplicate_cte AS (
//           SELECT id
//           FROM (
//               SELECT id, 
//                      ROW_NUMBER() OVER (PARTITION BY "dbKey" ORDER BY id) AS row_num
//               FROM "timesheet_schedule"
//           ) AS subquery
//           WHERE row_num > 1
//       )
//       DELETE FROM "timesheet_schedule"
//       WHERE id IN (SELECT id FROM duplicate_cte);
//     `);

//     console.log("Duplicate records removed successfully.");
//   })
//   .catch((err) => {
//     console.error('Unable to connect to the database:', err);
//   });
//   return sequelize;
// };

// if (!db) {
//   db = initSequelize();
// }

// export default db;


import fs from "fs";
import path from "path";
import { ModelCtor, Sequelize } from "sequelize-typescript";
import { DATABASE_URL, NODE_ENV } from "../config";

let db: Sequelize;

/**
 * Initializes and configures Sequelize instance
 */
const initSequelize = (): Sequelize => {
  console.log(`[${new Date().toISOString()}] Initializing Sequelize...`);
  const sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    logging: NODE_ENV === "development" ? console.log : false,
    ssl: {
      require: true,
      rejectUnauthorized: false, // Use false in dev; set true with proper certs in prod
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

  // Dynamically import all models in this directory
  const basename = path.basename(__filename);
  const models = fs
    .readdirSync(__dirname)
    .filter(
      (file) =>
        file !== basename &&
        file !== "interfaces" &&
        !file.endsWith(".d.ts") &&
        (file.endsWith(".ts") || file.endsWith(".js"))
    )
    .map((file) => {
      const model: ModelCtor = require(path.join(__dirname, file))?.default;
      return model;
    });

  sequelize.addModels(models);

  return sequelize;
};

/**
 * Runs optional destructive queries for cleaning duplicates.
 * Call only in special cases.
 */
const runDataCleanupQueries = async (sequelize: Sequelize) => {
  console.log(`[${new Date().toISOString()}] Running cleanup queries...`);
  await sequelize.query(`
    -- Step 1: Delete related rows from request_document
    DELETE FROM "request_document"
    WHERE "requestId" IN (
        SELECT id FROM "requests"
        WHERE id NOT IN (
            SELECT MIN(id)
            FROM "requests"
            GROUP BY "contractNumber"
        )
    );

    -- Step 2: Delete duplicate requests
    DELETE FROM "requests"
    WHERE id NOT IN (
        SELECT MIN(id)
        FROM "requests"
        GROUP BY "contractNumber"
    );

    -- Step 3: Set dbKey to NULL for Duplicates in timesheet
    UPDATE "timesheet"
    SET "dbKey" = NULL
    WHERE id NOT IN (
        SELECT MIN(id)
        FROM "timesheet"
        GROUP BY "dbKey"
    );

    -- Step 4: Remove duplicate timesheet_schedule records
    WITH duplicate_cte AS (
        SELECT id
        FROM (
            SELECT id, 
                   ROW_NUMBER() OVER (PARTITION BY "dbKey" ORDER BY id) AS row_num
            FROM "timesheet_schedule"
        ) AS subquery
        WHERE row_num > 1
    )
    DELETE FROM "timesheet_schedule"
    WHERE id IN (SELECT id FROM duplicate_cte);
  `);
  console.log(`[${new Date().toISOString()}] Duplicate cleanup complete.`);
};

/**
 * Initializes DB connection, syncs models, and optionally runs cleanup
 */
const connectToDatabase = async () => {
  db = initSequelize();

  try {
    await db.authenticate();
    console.log(`[${new Date().toISOString()}] ✅ Database connected`);

    // Environment-controlled sync
    if (process.env.SHOULD_SYNC === "true") {
      await db.sync(); // or use { alter: true } or { force: true } if needed
      console.log(`[${new Date().toISOString()}] ✅ Models synced`);
    }

    // Environment-controlled destructive query
    if (process.env.RUN_CLEANUP === "true") {
      await runDataCleanupQueries(db);
    }
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
  }
};

if (!db) {
  connectToDatabase();
}

export default db;
