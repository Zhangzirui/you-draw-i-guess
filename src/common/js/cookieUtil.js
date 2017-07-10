let cookieUtil = {
    set: function (name, value, expires, path, domain, secure) {
        let cooieText = `${encodeURI(name)}=${encodeURI(value)}`;
        if (expires instanceof Date) {
            cooieText += `; expires=${expires.toGMTString()}`;
        }
        if (path) {
            cooieText += `; path=${path}`;
        }
        if (domain) {
            cooieText += `; domain=${domain}`;
        }
        if (secure) {
            cooieText += `; secure`;
        }
        document.cookie = cooieText;
    },
    get: function (name) {
        let cookieName = encodeURI(name) + '=',
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = null;
        if (cookieStart !== -1) {
            let cookieEnd = document.cookie.indexOf(';', cookieStart);
            if (cookieEnd === -1) {
                cookieEnd = document.cookie.length;
            }
            cookieValue = decodeURI(document.cookie.slice(cookieStart + cookieName.length, cookieEnd));
        }
        return cookieValue;
    },
    unset: function (name, path, domain, secure) {
        this.set(name, '', new Date(0), path, domain, secure);
    }
};

export default cookieUtil;
