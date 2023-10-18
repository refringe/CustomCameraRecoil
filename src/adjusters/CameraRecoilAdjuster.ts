import type { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { CustomCameraRecoil } from "../CustomCameraRecoil";
import type { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";

/**
 * The `CameraRecoilAdjuster` class is responsible for orchestrating adjustments to weapons camera recoil
 * according to a predefined configuration.
 */
export class CameraRecoilAdjuster {
    /**
     * Constructor initializes the camera recoil adjustment process.
     */
    constructor() {
        this.adjustCameraRecoil();
    }

    /**
     * Main method that orchestrates the camera recoil adjustment.
     */
    public adjustCameraRecoil(): void {
        const items = this.getDatabaseItems();
        const method = CustomCameraRecoil.config.recoil.method;
        let changeCount = 0;

        // Loop through all items to adjust their camera recoil.
        for (const item in items) {
            if (this.isRecoilAdjustable(items[item])) {
                const newRecoil = this.calculateNewRecoil(items[item], method);
                this.logRecoilChange(items[item], newRecoil);
                this.updateItemRecoil(items[item], newRecoil);
                changeCount++;
            }
        }

        CustomCameraRecoil.logger.log(
            `CustomCameraRecoil: Adjusted the camera recoil for ${changeCount} weapons.`,
            "cyan"
        );
    }

    /**
     * Fetches items from the database.
     *
     * @returns {Record<string, ITemplateItem>} A record containing items.
     */
    private getDatabaseItems(): Record<string, ITemplateItem> {
        return CustomCameraRecoil.container.resolve<DatabaseServer>("DatabaseServer").getTables().templates.items;
    }

    /**
     * Checks if an item's camera recoil can be adjusted.
     *
     * @param {ITemplateItem} item - The item to check.
     * @returns {boolean} True if the item is adjustable, false otherwise.
     */
    private isRecoilAdjustable(item: ITemplateItem): boolean {
        // Using `hasOwnProperty` to ensure that the property exists directly on the object.
        return (
            Object.prototype.hasOwnProperty.call(item._props, "ShortName") &&
            Object.prototype.hasOwnProperty.call(item._props, "CameraRecoil") &&
            Object.prototype.hasOwnProperty.call(item._props, "weapClass")
        );
    }

    /**
     * Calculates the new recoil value for an item.
     *
     * @param {ITemplateItem} item - The item to adjust.
     * @param {string} method - The method to use for adjustment ("precise" or "percent").
     * @returns {number} The calculated new recoil value.
     */
    private calculateNewRecoil(item: ITemplateItem, method: string): number {
        // If method is "precise", directly return the precise value from the config.
        if (method === "precise") {
            return CustomCameraRecoil.config.recoil.precise;
        }

        // Determine if the recoil should be increased or decreased.
        const increase = CustomCameraRecoil.config.recoil.percent >= 0;

        // Use Math.abs to get the absolute value of the percentage.
        const percentage = Math.abs(CustomCameraRecoil.config.recoil.percent);

        // Calculate the new recoil based on the percentage.
        let newRecoil = (percentage / 100) * item._props.CameraRecoil;

        // Conditionally adjust the recoil based on whether it should increase or decrease.
        newRecoil = increase ? item._props.CameraRecoil + newRecoil : item._props.CameraRecoil - newRecoil;

        // Round to 4 decimal places.
        return Math.round(newRecoil * 10000) / 10000;
    }

    /**
     * Logs the change in recoil for debugging purposes.
     *
     * @param {ITemplateItem} item - The item whose recoil was adjusted.
     * @param {number} newRecoil - The new recoil value.
     */
    private logRecoilChange(item: ITemplateItem, newRecoil: number): void {
        if (CustomCameraRecoil.config.general.debug) {
            CustomCameraRecoil.logger.log(
                `CustomCameraRecoil: Weapon '${item._name}' of class '${item._props.weapClass}' has had camera recoil modified from ${item._props.CameraRecoil} to ${newRecoil}.`,
                "gray"
            );
        }
    }

    /**
     * Updates the recoil value of an item.
     *
     * @param {ITemplateItem} item - The item to update.
     * @param {number} newRecoil - The new recoil value.
     */
    private updateItemRecoil(item: ITemplateItem, newRecoil: number): void {
        // Prevent negative recoil values by setting them to zero.
        item._props.CameraRecoil = newRecoil < 0 ? 0 : newRecoil;

        // If the recoil is negative, log a debug message.
        if (newRecoil < 0 && CustomCameraRecoil.config.general.debug) {
            CustomCameraRecoil.logger.log(
                `CustomCameraRecoil: Weapon '${item._name}' of class '${item._props.weapClass}' can not have negative camera recoil. Setting to 0.`,
                "gray"
            );
        }
    }
}
