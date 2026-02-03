import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  robots: router({
    // Public procedures for searching and viewing robots
    list: publicProcedure.query(async () => {
      const { getAllRobots } = await import("./db");
      return getAllRobots();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getRobotById } = await import("./db");
        return getRobotById(input.id);
      }),

    search: publicProcedure
      .input(
        z.object({
          type: z.string().optional(),
          minPayload: z.number().optional(),
          maxPayload: z.number().optional(),
          minReach: z.number().optional(),
          maxReach: z.number().optional(),
          rosCompatible: z.boolean().optional(),
          driveSystem: z.string().optional(),
          minArmDof: z.number().optional(),
          forceSensor: z.boolean().optional(),
        })
      )
      .query(async ({ input }) => {
        const { searchRobots } = await import("./db");
        return searchRobots(input);
      }),

    naturalLanguageQuery: publicProcedure
      .input(z.object({ query: z.string() }))
      .mutation(async ({ input }) => {
        const { searchRobots, getAllRobots } = await import("./db");
        const { OpenAI } = await import("openai");

        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        // Use LLM to parse natural language query into structured filters
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a robot query assistant. Parse the user's natural language query into structured search filters.
              
              Available filters:
              - type: "mobile_manipulator" | "mobile_base" | "manipulator_arm"
              - minPayload: number (in kg)
              - maxPayload: number (in kg)
              - minReach: number (in mm)
              - maxReach: number (in mm)
              - rosCompatible: boolean
              - driveSystem: string
              - minArmDof: number (degrees of freedom)
              - forceSensor: boolean
              
              Return ONLY a JSON object with the applicable filters. If no specific filters can be extracted, return an empty object {}.
              Do not include explanations or markdown formatting.`,
            },
            {
              role: "user",
              content: input.query,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "robot_filters",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  minPayload: { type: "number" },
                  maxPayload: { type: "number" },
                  minReach: { type: "number" },
                  maxReach: { type: "number" },
                  rosCompatible: { type: "boolean" },
                  driveSystem: { type: "string" },
                  minArmDof: { type: "number" },
                  forceSensor: { type: "boolean" },
                },
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        const filterStr = typeof content === "string" ? content : "{}";
        const filters = JSON.parse(filterStr);

        // Search robots using the extracted filters
        const results = await searchRobots(filters);

        return {
          filters,
          results,
          explanation: `Found ${results.length} robot(s) matching your query.`,
        };
      }),

    // Protected procedures for admin operations
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          manufacturer: z.string().optional(),
          type: z.enum(["mobile_manipulator", "mobile_base", "manipulator_arm"]),
          length: z.number().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
          weight: z.number().optional(),
          usablePayload: z.number().optional(),
          functions: z.string().optional(),
          reach: z.number().optional(),
          driveSystem: z.string().optional(),
          certifications: z.string().optional(),
          rosCompatible: z.number().optional(),
          rosDistros: z.string().optional(),
          sdkAvailable: z.number().optional(),
          apiAvailable: z.number().optional(),
          operationTime: z.number().optional(),
          batteryLife: z.number().optional(),
          maxSpeed: z.number().optional(),
          forceSensor: z.number().optional(),
          eoatCompatibility: z.string().optional(),
          armPayload: z.number().optional(),
          armReach: z.number().optional(),
          armDof: z.number().optional(),
          websiteUrl: z.string().optional(),
          remarks: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createRobot } = await import("./db");
        return createRobot({ ...input, createdBy: ctx.user.id });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          manufacturer: z.string().optional(),
          type: z.enum(["mobile_manipulator", "mobile_base", "manipulator_arm"]).optional(),
          length: z.number().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
          weight: z.number().optional(),
          usablePayload: z.number().optional(),
          functions: z.string().optional(),
          reach: z.number().optional(),
          driveSystem: z.string().optional(),
          certifications: z.string().optional(),
          rosCompatible: z.number().optional(),
          rosDistros: z.string().optional(),
          sdkAvailable: z.number().optional(),
          apiAvailable: z.number().optional(),
          operationTime: z.number().optional(),
          batteryLife: z.number().optional(),
          maxSpeed: z.number().optional(),
          forceSensor: z.number().optional(),
          eoatCompatibility: z.string().optional(),
          armPayload: z.number().optional(),
          armReach: z.number().optional(),
          armDof: z.number().optional(),
          websiteUrl: z.string().optional(),
          remarks: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updateRobot } = await import("./db");
        const { id, ...data } = input;
        return updateRobot(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteRobot } = await import("./db");
        await deleteRobot(input.id);
        return { success: true };
      }),

    bulkUpload: protectedProcedure
      .input(
        z.object({
          robots: z.array(
            z.object({
              name: z.string(),
              manufacturer: z.string().optional(),
              type: z.enum(["mobile_manipulator", "mobile_base", "manipulator_arm"]),
              length: z.number().optional(),
              width: z.number().optional(),
              height: z.number().optional(),
              weight: z.number().optional(),
              usablePayload: z.number().optional(),
              functions: z.string().optional(),
              reach: z.number().optional(),
              driveSystem: z.string().optional(),
              certifications: z.string().optional(),
              rosCompatible: z.number().optional(),
              rosDistros: z.string().optional(),
              sdkAvailable: z.number().optional(),
              apiAvailable: z.number().optional(),
              operationTime: z.number().optional(),
              batteryLife: z.number().optional(),
              maxSpeed: z.number().optional(),
              forceSensor: z.number().optional(),
              eoatCompatibility: z.string().optional(),
              armPayload: z.number().optional(),
              armReach: z.number().optional(),
              armDof: z.number().optional(),
              websiteUrl: z.string().optional(),
              remarks: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createRobot } = await import("./db");
        const results = [];
        const errors = [];

        for (const robot of input.robots) {
          try {
            const created = await createRobot({ ...robot, createdBy: ctx.user.id });
            results.push(created);
          } catch (error) {
            errors.push({
              robot: robot.name,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        return {
          success: results.length,
          failed: errors.length,
          errors,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
