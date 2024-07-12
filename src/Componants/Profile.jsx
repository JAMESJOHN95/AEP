import React, { useEffect, useState } from 'react'

function Profile() {

    const [profile, setProfile] = useState([])

    const getDataByBatchId = async () => {
        try {
            const accessToken = sessionStorage.getItem('accesToken');
            console.log(accessToken);
            if (!accessToken) {
                console.log("Authentication failed");
                return;
            }

            const batchId = "01J25R27Q6BF3QF00K73P179MP";
            // const date = ""
            const URL = `https://platform.adobe.io/data/foundation/export/batches/${batchId}/files?start=1&limit=10`

            const response = await fetch(URL, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-api-key': '2383827e418049e3ad41507d03374c2f',
                    'x-gw-ims-org-id': '3C4727E253DB241C0A490D4E@AdobeOrg',
                    'x-sandbox-name': 'uatmmh'
                }
            })
            if(!response.ok){
                const errorText = await response.text();
                console.log("ERROR: url not found", errorText);
            }
            const data = await response.json()
            console.log(data);

        } catch (err) {
            console.log(err);
        }
    }

//     useEffect(()=>{
// getProfileByNamespace()
//     },[])

 // Get audience details ==========================================================================================

 const getAudience = async () => {
    // const accessToken = sessionStorage.getItem('accesToken');
    if (!token) {
        console.log('Authentication Failed, No Access Token');
        return;
    }
    const SEGMENT_ID = "9a301250-1a10-4194-b3a3-2781e87c8814";
    const URL = `https://platform.adobe.io/data/core/ups/segment/definitions/${SEGMENT_ID}`

    try {
        const response = await fetch(URL, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'x-api-key': '2383827e418049e3ad41507d03374c2f',
                'x-gw-ims-org-id': '3C4727E253DB241C0A490D4E@AdobeOrg',
                'x-sandbox-name': 'uatmmh'
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch segments: ${errorText}`);
        }

        const data = await response.json();
        setAllAudience(data)
        console.log('Segments:', data);
        return data;
    } catch (error) {
        console.error('Error fetching segments:', error);
        return null;
    }
};

console.log(allAudience);

    return (
        <div>
            <button onClick={getDataByBatchId}>get</button>


        </div>
    )
}

export default Profile