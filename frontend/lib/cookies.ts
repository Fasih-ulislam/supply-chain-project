// Cookie utility functions
export const setCookie = (name: string, value: string, days: number = 365) => {
    try {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;

        // Build cookie string with all necessary attributes
        const cookieParts = [
            `${name}=${encodeURIComponent(value)}`,
            expires,
            'path=/',
            'SameSite=Lax'
        ];

        // Only add Secure in production (HTTPS)
        if (window.location.protocol === 'https:') {
            cookieParts.push('Secure');
        }

        const cookieString = cookieParts.join(';');
        document.cookie = cookieString;

        // Verify cookie was set
        const verification = getCookie(name);
        if (verification !== value) {
            console.warn(`Cookie ${name} might not have been set correctly`);
        }
    } catch (error) {
        console.error('Error setting cookie:', error);
    }
};

export const getCookie = (name: string): string | null => {
    try {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(nameEQ) === 0) {
                const value = cookie.substring(nameEQ.length, cookie.length);
                return decodeURIComponent(value);
            }
        }
    } catch (error) {
        console.error('Error reading cookie:', error);
    }
    return null;
};

export const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const hasConsent = (): boolean => {
    return getCookie('cookieConsent') !== null;
};

export const getConsentValue = (): string | null => {
    return getCookie('cookieConsent');
};
