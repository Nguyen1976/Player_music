const PLAYER_STORAGE_KEY = 'PLAYER';

export function getConfig() {
    return JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {};
}

export function setConfig(key, value) {
    const config = getConfig();
    config[key] = value;

    try {
        const configString = JSON.stringify(config);
        localStorage.setItem(PLAYER_STORAGE_KEY, configString);
    } catch (error) {
        console.error('Lỗi khi lưu cấu hình vào localStorage:', error);
    }
}