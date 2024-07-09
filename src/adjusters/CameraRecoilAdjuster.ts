import type { DatabaseServer } from "@spt/servers/DatabaseServer";
import type { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import { DependencyContainer } from "tsyringe";
import { Configuration } from "../types";

/**
 * The `CameraRecoilAdjuster` class is responsible for orchestrating adjustments to weapons camera recoil
 * according to a predefined configuration.
 */
export class CameraRecoilAdjuster {
    private container: DependencyContainer;
    private logger: ILogger;
    private config: Configuration;

    /**
     * Constructs a new instance of the `CameraRecoilAdjuster` class.
     */
    constructor(container: DependencyContainer, config: Configuration) {
        this.container = container;
        this.logger = this.container.resolve<ILogger>("WinstonLogger");
        this.config = config;
    }

    /**
     * Main method that orchestrates the camera recoil adjustment.
     */
    public adjustCameraRecoil(): void {
        const items = this.getDatabaseItems();
        let changeCount = 0;

        // Loop through all items to adjust their camera recoil.
        for (const item in items) {
            const currentItem = items[item];

            if (!this.isRecoilAdjustable(currentItem)) {
                continue;
            }

            this.updateAndLogRecoil(currentItem, "CameraSnap", currentItem._props.CameraSnap);
            this.updateAndLogRecoil(
                currentItem,
                "CameraToWeaponAngleSpeedRange",
                currentItem._props.CameraToWeaponAngleSpeedRange
            );
            this.updateAndLogRecoil(currentItem, "CameraToWeaponAngleStep", currentItem._props.CameraToWeaponAngleStep);
            this.updateAndLogRecoil(currentItem, "RecoilCamera", currentItem._props.RecoilCamera);

            changeCount++;
        }

        this.logger.log(`CustomCameraRecoil: Adjusted the camera recoil for ${changeCount} weapons.`, "cyan");
    }

    /**
     * Updates and logs a single recoil property.
     */
    private updateAndLogRecoil(
        item: ITemplateItem,
        propName: string,
        value: number | { x: number; y: number; z: number }
    ): void {
        if (typeof value === "number") {
            const oldValue = item._props[propName];
            item._props[propName] = this.calculateNewRecoil(value);
            this.logRecoilChange(item, propName, oldValue, item._props[propName]);
        } else {
            for (const axis of Object.keys(value)) {
                const axisPropName = `${propName} ${axis.toUpperCase()}`;
                const oldValue = item._props[propName][axis];
                item._props[propName][axis] = this.calculateNewRecoil(value[axis]);
                this.logRecoilChange(item, axisPropName, oldValue, item._props[propName][axis]);
            }
        }
    }

    /**
     * Logs the change in recoil property for debugging purposes.
     */
    private logRecoilChange(item: ITemplateItem, propName: string, oldValue: number, newValue: number): void {
        if (this.config.general.debug) {
            this.logger.log(
                `CustomCameraRecoil: Weapon '${item._name}' of class '${item._props.weapClass}' property '${propName}' has been modified from ${oldValue} to ${newValue}.`,
                "gray"
            );
        }
    }

    /**
     * Fetches items from the database.
     *
     * @returns {Record<string, ITemplateItem>} A record containing items.
     */
    private getDatabaseItems(): Record<string, ITemplateItem> {
        return this.container.resolve<DatabaseServer>("DatabaseServer").getTables().templates.items;
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
            Object.prototype.hasOwnProperty.call(item._props, "CameraSnap") &&
            Object.prototype.hasOwnProperty.call(item._props, "CameraToWeaponAngleSpeedRange") &&
            Object.prototype.hasOwnProperty.call(item._props, "CameraToWeaponAngleStep") &&
            Object.prototype.hasOwnProperty.call(item._props, "RecoilCamera") &&
            Object.prototype.hasOwnProperty.call(item._props, "weapClass")
        );
    }

    /**
     * Calculates the new recoil value for an item.
     *
     * @param {number} currentRecoilValue - The current recoil value.
     * @returns {number} The calculated new recoil value.
     */
    private calculateNewRecoil(currentRecoilValue: number): number {
        // If method is to remove then return 0.
        if (this.config.recoil.remove === true) {
            return 0;
        }

        return this.calculateRelativePercentage(this.config.recoil.percent, currentRecoilValue);
    }

    /**
     * Adjust a number by a relative percentage.
     * Example: 50 = 50% increase (0.5 changed to 0.75)
     *         -50 = 50% decrease (0.5 changed to 0.25)
     *
     * @param percentage The relative percentage to adjust value by.
     * @param value The number to adjust.
     * @returns number
     */
    private calculateRelativePercentage(percentage: number, value: number): number {
        const increase = percentage >= 0;
        const differencePercentage = increase ? percentage : percentage * -1;
        const difference = (differencePercentage / 100) * value;
        let adjustedValue = increase ? value + difference : value - difference;

        // Round the new value to max 4 decimal places.
        adjustedValue = Number((adjustedValue * 10000).toFixed(0)) / 10000;

        // If the value is less than 0, return 0.
        return adjustedValue > 0 ? adjustedValue : 0;
    }
}
