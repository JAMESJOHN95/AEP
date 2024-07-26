
import React from 'react'
import { useEffect } from 'react';

function Query({ token, clpId ,setPostQueryFunction }) {

    const USER_ID = clpId;
    console.log(token);
    console.log(clpId);


    const postQuery = async () => {
        if (!token) {
            console.log("Token is Not Generated");
        }
        try {
            const response =await fetch(`https://platform.adobe.io/data/foundation/query/queries?user_id=${USER_ID}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-api-key': '2383827e418049e3ad41507d03374c2f',
                    'x-gw-ims-org-id': '3C4727E253DB241C0A490D4E@AdobeOrg',
                    'x-sandbox-name': 'uatmmh',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "dbName": "uatmmh:all",
                    "sql": "select _EXPERIENCE.JOURNEYORCHESTRATION.STEPEVENTS.PROFILEID, _EXPERIENCE.JOURNEYORCHESTRATION.STEPEVENTS.journeyVersionName, _EXPERIENCE.JOURNEYORCHESTRATION.STEPEVENTS.ACTIONNAME, _EXPERIENCE.JOURNEYORCHESTRATION.STEPEVENTS.stepstatus from journey_step_events where _EXPERIENCE.JOURNEYORCHESTRATION.STEPEVENTS.NODETYPE = 'message' and _EXPERIENCE.JOURNEYORCHESTRATION.STEPEVENTS.PROFILEID ='$user_id';",
                    "queryParameters": {
                        "user_id": `${USER_ID}`
                    },
                    "name": "Journey entity query",
                    "description": "Journey entity query via API",
                    "insertIntoParameters": {
                        "datasetName": "journey_entity_dataset"
                    }
                })
            })

            if(!response.ok){
                throw new error("Network response was not ok")
            }
            const data = await response.json();
            console.log(data);

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (setPostQueryFunction) {
          setPostQueryFunction(() => postQuery);
        }
      }, [setPostQueryFunction, clpId, token]);


    return (
        <div>



        </div>
    )
}

export default Query