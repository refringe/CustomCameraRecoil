export interface Configuration {
    general: GeneralSettings;
    recoil: RecoilSettings;
}

export interface GeneralSettings {
    enabled: boolean;
    debug: boolean;
}

export interface RecoilSettings {
    remove: boolean;
    percent: number;
}
