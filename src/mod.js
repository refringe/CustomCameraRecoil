"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomCameraRecoil {
    constructor() {
        this.config = require("../config/config.json");
    }
    postDBLoad(container) {
        // Get the logger from the server container.
        const logger = container.resolve("WinstonLogger");
        // Check to see if the mod is enabled.
        const enabled = this.config.mod_enabled;
        if (!enabled) {
            logger.info("CustomCameraRecoil is disabled in the config file. No changes to camera recoil will be made.");
            return;
        }
        // Find out if we're logging everything.
        const debug = this.config.debug;
        // Get database from server.
        const databaseServer = container.resolve("DatabaseServer");
        // Get in-memory json found in /assets/database
        const tables = databaseServer.getTables();
        // Get a list of all items in the database.
        const items = tables.templates.items;
        // Which method are we using to modify the recoil?
        const method = this.config.camera_recoil_method;
        // Count for the logs.
        let changeCount = 0;
        // Loop through all items in the database, check to see if the camera recoil is available, and if so, change it.
        for (const item in items) {
            if (Object.prototype.hasOwnProperty.call(items[item]._props, "ShortName") &&
                Object.prototype.hasOwnProperty.call(items[item]._props, "CameraRecoil") &&
                Object.prototype.hasOwnProperty.call(items[item]._props, "weapClass")) {
                let newRecoil;
                if (method === "precise") {
                    newRecoil = this.config.precise_camera_recoil;
                }
                else if (method === "percent") {
                    // Calculate the relative percentage of the current camera recoil value.
                    // Example: 50% (increase) to 0.5 = 0.75
                    //         -50% (decrease) to 0.5 = 0.25
                    const increase = this.config.percent_camera_recoil >= 0;
                    const percentage = increase ? this.config.percent_camera_recoil : this.config.percent_camera_recoil * -1;
                    newRecoil = (percentage / 100) * items[item]._props.CameraRecoil;
                    newRecoil = increase ? (items[item]._props.CameraRecoil + newRecoil) : (items[item]._props.CameraRecoil - newRecoil);
                    // Round the new recoil value to max 4 decimal places.
                    newRecoil = Math.round(newRecoil * 10000) / 10000;
                }
                if (debug) {
                    logger.info(`CustomCameraRecoil: Weapon '${items[item]._props.ShortName}' of class '${items[item]._props.weapClass}' has had camera recoil modified from ${items[item]._props.CameraRecoil} to ${newRecoil}.`);
                }
                // No negative camera recoil values.
                items[item]._props.CameraRecoil = newRecoil;
                if (items[item]._props.CameraRecoil <= 0) {
                    items[item]._props.CameraRecoil = 0.0;
                }
                changeCount++;
            }
        }
        logger.info(`CustomCameraRecoil: Adjusted the camera recoil for ${changeCount} weapons.`);
    }
}
module.exports = { mod: new CustomCameraRecoil() };
