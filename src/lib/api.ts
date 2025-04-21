export const parse = async (resp: Response) => {
    if (!resp.ok) {
        throw new Error(`${resp.url} – ${resp.status} ${resp.statusText}`);
    }
    return resp.json();
}; 