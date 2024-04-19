import { JSONSchema7 } from "json-schema";

export class ConfigSchema {
    /* eslint-disable @typescript-eslint/naming-convention */
    public static readonly schema: JSONSchema7 = {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        properties: {
            general: {
                type: "object",
                properties: {
                    enabled: {
                        type: "boolean",
                        description: "Enables the use of the mod",
                    },
                    debug: {
                        type: "boolean",
                        description: "Enables verbose logging",
                    },
                },
                required: ["enabled", "debug"],
            },
            recoil: {
                type: "object",
                properties: {
                    remove: {
                        type: "boolean",
                        description: "Removes all camera recoil from the game",
                    },
                    percent: {
                        type: "integer",
                        minimum: -99,
                        maximum: 100,
                        description: "The percentage the camera recoil value will be adjusted by.",
                    },
                },
                required: ["remove", "percent"],
            },
        },
        required: ["general", "recoil"],
    };
    /* eslint-enable @typescript-eslint/naming-convention */
}
