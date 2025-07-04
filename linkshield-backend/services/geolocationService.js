import axios from 'axios';

const getLocation = async (ip) => {
    // Handle localhost and private IPs
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        console.log('Local/private IP detected:', ip);
        
        // For production, return a generic location for local/private IPs
        return {
            country: 'Unknown',
            countryCode: 'UN',
            region: 'Unknown',
            city: 'Unknown',
            lat: 0,
            lon: 0,
            isp: 'Local Network',
            timezone: 'UTC'
        };
    }

    try {
        console.log('Fetching location for IP:', ip);
        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,timezone`, {
            timeout: 5000
        });
        
        const data = response.data;
        
        if (data.status === 'success') {
            console.log('Location data received:', data);
            return {
                country: data.country || 'Unknown',
                countryCode: data.countryCode || 'UN',
                region: data.regionName || 'Unknown',
                city: data.city || 'Unknown',
                lat: data.lat || 0,
                lon: data.lon || 0,
                isp: data.isp || 'Unknown',
                timezone: data.timezone || 'UTC'
            };
        } else {
            console.log('IP API returned error:', data.message);
            return {
                country: 'Unknown',
                countryCode: 'UN',
                region: 'Unknown',
                city: 'Unknown',
                lat: 0,
                lon: 0,
                isp: 'Unknown',
                timezone: 'UTC'
            };
        }
    } catch (error) {
        console.error('Error getting location for IP:', ip, error.message);
        return {
            country: 'Unknown',
            countryCode: 'UN',
            region: 'Unknown',
            city: 'Unknown',
            lat: 0,
            lon: 0,
            isp: 'Unknown',
            timezone: 'UTC'
        };
    }
};

export default {
    getLocation
}; 