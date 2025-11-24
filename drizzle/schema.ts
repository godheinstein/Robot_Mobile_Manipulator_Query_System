import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Robot types enum for categorizing different robot platforms
 */
export const robotTypeEnum = mysqlEnum("robot_type", [
  "mobile_manipulator",
  "mobile_base",
  "manipulator_arm"
]);

/**
 * Main robots table containing all robot specifications
 * Fields are nullable to support different robot types with varying applicable criteria
 */
export const robots = mysqlTable("robots", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic Information
  name: varchar("name", { length: 255 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 255 }),
  type: robotTypeEnum.notNull(),
  
  // Physical Specifications
  length: int("length"), // in mm
  width: int("width"), // in mm
  height: int("height"), // in mm
  weight: int("weight"), // in kg
  usablePayload: int("usable_payload"), // in kg
  
  // Functional Specifications
  functions: text("functions"), // comma-separated or JSON
  reach: int("reach"), // in mm
  driveSystem: varchar("drive_system", { length: 255 }),
  
  // Certifications
  certifications: text("certifications"), // comma-separated (cleanroom, ISO, etc.)
  
  // Integration
  rosCompatible: int("ros_compatible").default(0), // boolean: 0 or 1
  rosDistros: text("ros_distros"), // comma-separated list of compatible ROS distros
  sdkAvailable: int("sdk_available").default(0), // boolean: 0 or 1
  apiAvailable: int("api_available").default(0), // boolean: 0 or 1
  
  // Performance
  operationTime: int("operation_time"), // in minutes
  batteryLife: int("battery_life"), // in minutes
  maxSpeed: int("max_speed"), // in mm/s
  
  // Arm-Specific Criteria (only applicable for manipulator_arm and mobile_manipulator)
  forceSensor: int("force_sensor").default(0), // boolean: 0 or 1
  eoatCompatibility: text("eoat_compatibility"), // End-of-Arm Tooling compatibility
  armPayload: int("arm_payload"), // in kg
  armReach: int("arm_reach"), // in mm
  armDof: int("arm_dof"), // Degrees of Freedom
  
  // Additional Information
  remarks: text("remarks"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  createdBy: int("created_by").references(() => users.id),
});

export type Robot = typeof robots.$inferSelect;
export type InsertRobot = typeof robots.$inferInsert;