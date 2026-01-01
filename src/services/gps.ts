export async function getAdress(lat: number, long: number) {  
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`);
    const data = await response.json();
    return data;
}