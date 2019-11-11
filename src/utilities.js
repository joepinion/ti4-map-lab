export function compareByID(a, b) {
    if(a.id > b.id) {
        return 1;
    } else if(a.id < b.id) {
        return -1;
    }
    return 0;
}

export function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

