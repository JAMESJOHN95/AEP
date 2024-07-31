import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Nav } from 'react-bootstrap'
import { ServerUrl } from './Server'
import { useKey } from './Context'
import Query from './Query'



function Home({ token, setToken, clpId, setClpId }) {

    const [active, setactive] = useState('/home')               // Activate event Key used to display the details in the tab
    const [profile, setProfile] = useState([])                  // Total data count
    const [entities, setEntity] = useState({})                  // Full details of the searches profile
    const [questrade, setQuestrade] = useState([])              // Purpose data 
    const [audiance, setAudiance] = useState([])                // segment Membership data (array of objects)
    const [audianceDetails, setAudianceDetails] = useState({})  // segment membership ( map the array of objects to array with key and value)
    const [keysArray, setKeysArray] = useState([])              // list of audiances profile included in (segment id only)
    // const [allAudience, setAllAudience] = useState([])
    const [segmentData, setSegmentData] = useState([])          // Store total list of Segments(Audiance)
    const [filteredSegments, setFilteredSegments] = useState([]) // Filtered segments with the searched clpid
    const [dataset, setDataset] = useState([])
    const [postQueryFunction, setPostQueryFunction] = useState(null);



    useEffect(() => {
        getProfileIntegrity()
    }, [token])


    useEffect(() => {
        console.log('Audiance Data:', audiance);
        const newNestedObjectData = [];

        // Extracting keys from nested objects within the audiance array
        audiance.forEach(aud => {
            Object.keys(aud).forEach(key => {
                newNestedObjectData.push({
                    key: key,
                    value: aud[key]
                });
                //    console.log(`Key: ${key}, Value: `, aud[key]);
            });
        });
        setAudianceDetails(newNestedObjectData)
        const newArray = newNestedObjectData.map(item => item.key)
        setKeysArray(newArray)
    }, [audiance]);
    useEffect(() => {
        if (segmentData.length > 0) {
            const filtered = segmentData.filter(segment => keysArray.includes(segment.id));
            setFilteredSegments(filtered);
        }
    }, [segmentData, keysArray]);

    const handleClpId = () => {
        console.log("Inside handle clpid");
        console.log("Current clpid", clpId);
        fetchEntityData(clpId)
        setClpId("")
    }
    //  (1) Generate token ==========================================================================================================

    const fetchToken = async () => {
        try {
            console.log(`Attempting to fetch token from ${ServerUrl}/generate-token`);
            const response = await axios.post(`${ServerUrl}/generate-token`);
            console.log(response);
            if (response.data && response.data.token) {
                const fetchTokennew = response.data.token;
                setToken(fetchTokennew);
                return response.data.token;
            }
            else {
                console.error("No token recieved in response")
            }
        } catch (error) {
            console.error('Error fetching token:', error);
        }
    };
    console.log(token);



    console.log(audianceDetails);
    console.log(keysArray);



    //  (2) Preview last succesful sample job =========================================================================

    const getProfileIntegrity = async () => {
        if (!token) {
            return;
        }
        try {
            const response = await axios.get(`${ServerUrl}/Profile-integrity`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const profileData = response.data.data
            setProfile(profileData)
            // console.log(profileData);
        } catch (err) {
            console.log(err);
        }
    }
    console.log(profile);

    // (3) fetching the entities ======================================================================================

    const fetchEntityData = async (id) => {
        const schemaName = "_xdm.context.profile";
        const entityId = id; // "e96c453a-4e94-4e4e-a15f-039ab8241306"
        const entityIdNS = "CLPProfileD";
        const fields = "person.name,_questrade,segmentMembership"; //person.name,_questrade,segmentMembership

        // console.log(id);

        const params = new URLSearchParams();
        params.append('schema.name', schemaName);
        if (entityId) params.append('entityId', entityId);
        if (entityIdNS) params.append('entityIdNS', entityIdNS);
        if (fields) params.append('fields', fields);

        try {
            if (!token) {
                throw new Error('Access Token not found in sessionStorage');
            }

            const URL = `https://platform.adobe.io/data/core/ups/access/entities?${params.toString()}`;

            const response = await fetch(URL, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-api-key': '2383827e418049e3ad41507d03374c2f',
                    'x-gw-ims-org-id': '3C4727E253DB241C0A490D4E@AdobeOrg',
                    'x-sandbox-name': 'uatmmh'
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch entity data: ${errorText}`);
            }

            const data = await response.json();
            // console.log(data);
            const entity = Object.keys(data).map(key => ({
                id: key,
                name: data[key].entity.person.name,
                questrade: data[key].entity._questrade,
                allData: data[key],
                purposes: data[key].entity._questrade?.purposes || [],
                audianceData: data[key].entity.segmentMembership?.ups || []

                // const entity = 
                // const quest = data['G8jxBQFCb-lsRTpOlE5OoV8DmrgkEwY'].entity._questrade
            }));
            // console.log('Entity Data:', entity);

            setEntity(entity);

            setAudiance(entity.flatMap(e => e.audianceData))
            const purposes = entity.flatMap(e => e.purposes);
            console.log('Purposes:', purposes); // Log the purposes
            setQuestrade(purposes);

        }
        catch (err) {
            console.error('Error fetching entity data:', err);
        }
    };
    console.log(entities);
    console.log(questrade);
    console.log(audiance);

    const handleSelect = (eventKey) => {
        setactive(eventKey)
    }

    // (5) Get all Audience=========================================================================

    const fetchAudienceData = async () => {

        const URL = `https://platform.adobe.io/data/core/ups/segment/definitions?`

        try {
            const response = await fetch(URL, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-api-key': '2383827e418049e3ad41507d03374c2f',
                    'x-gw-ims-org-id': '3C4727E253DB241C0A490D4E@AdobeOrg',
                    'x-sandbox-name': 'uatmmh'
                }
            })

            if (!response.ok) {
                throw new error('Network is not ok')
            }

            const data = await response.json()
            setSegmentData(data.segments)
        } catch (error) {
            console.log(error);
        }
    }

    console.log(segmentData);
    console.log(filteredSegments);


    // Get  dataset Files  with the dataset id ==============================================================================

    const getAllDatasets = async () => {
        console.log("Inside Get All Dataset");
        if (!token) {
            alert("Token is not Available")
        }
        const id = "662ad916b344342c9e7034d5"    // "66a12247fae7612aeeee4210"
        const URL = `https://platform.adobe.io/data/foundation/export/datasets/${id}/preview`

        try {
            const response = await fetch(URL, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-api-key': '2383827e418049e3ad41507d03374c2f',
                    'x-gw-ims-org-id': '3C4727E253DB241C0A490D4E@AdobeOrg',
                    'x-sandbox-name': 'uatmmh'
                }
            })
            if (!response.ok) {
                alert("No able to get Data")
            }

            const data = await response.json()
            // console.log(data.data);
            setDataset(data.data)

        }
        catch (err) {
            console.log(err);
        }
    }
    console.log(dataset);

    const handleSearchButtonClick = async () => {
        try {
            await handleClpId();
            await fetchAudienceData();
            await getQueryTemplates();
            // await getAllDatasets();
            await postQueryFunction();
        } catch (error) {
            console.error('Error in handling search:', error);
            // Optionally, handle error feedback to the user
        }
    };


    // useEffect(() => {
    //     fetchData()
    //     console.log(segmentData);
    // }, [keysArray])
    // console.log(segmentData);

    // useEffect(() => {
    //     // Filter the segments based on keysArray
    //     const filtered = segmentData.filter(segment => keysArray.includes(segment.id));
    //     setFilteredSegments(filtered);
    //   }, [segmentData, keysArray]);
    //   console.log(filteredSegments);

    return (

        <>

            <div className='container text-center p-3'>
                <h1>AEP RT-CDP Dashboard</h1>
                {/* <button onClick={getProfileIntegrity}>xsd */}
                <div className='d-flex justify-content-around'>
                    <div>
                        {/* </button> */}
                        {!token ? (<button onClick={fetchToken} className='btn btn-success'  >Refresh</button>)
                            :
                            <div><h5 className='text-success'>Token Is Generated</h5></div>
                        }
                    </div>
                    <div className='d-flex'>
                        <input value={clpId} onChange={e => setClpId(e.target.value)} className='form-control' type="text" placeholder='Enter the User Id' />
                        <button onClick={handleSearchButtonClick
                        } className='btn btn-primary ms-3'>Search</button>
                    </div>
                </div>

                <div className='w-100 container p-2 border border-primary my-3  '>
                    <Nav className='d-flex text-center justify-content-around' variant="underline" defaultActiveKey="/home" onSelect={handleSelect}>
                        <Nav.Item>
                            <Nav.Link eventKey="link-0">Profile Integrity</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="link-1">Data Integrity</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="link-2">Audience Integrity</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="link-3">Journey Integrity</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="link-4">Metric Integrity</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    {active === 'link-0' && (
                        <div className='w-full overflow-scroll'>
                            <table className='table border table-responsive table-striped mt-3 p-2'>
                                <thead>
                                    <tr>
                                        <th className='text-start ps-5'>Attributes</th>
                                        <th className='text-start ps-5'>Values</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {entities.length > 0 ? entities.map((item, index) => (
                                        <React.Fragment key={index}>
                                            <tr >
                                                <td className='text-start ps-5'>First Name</td>
                                                <td className='text-start ps-5'>{item.name.firstName}</td>
                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Last Name</td>
                                                <td className='text-start ps-5'>{item.name.lastName}</td>
                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Current Age</td>
                                                <td className='text-start ps-5'>{item.questrade.currentAge}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Current Equity</td>
                                                <td className='text-start ps-5'>{item.questrade.currentEquity}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Trade Past Three Months</td>
                                                <td className='text-start ps-5'>{item.questrade.tradePastThreeMthTotal}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Email</td>
                                                <td className='text-start ps-5'>{item.questrade.email}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>First Complete Account Date</td>
                                                <td className='text-start ps-5'>{item.questrade.firstCompletedAccDate}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Lead Source</td>
                                                <td className='text-start ps-5'>{item.questrade.leadSource}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Link Token</td>
                                                <td className='text-start ps-5'>{item.questrade.linkToken}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Onetrust Identifier</td>
                                                <td className='text-start ps-5'>{item.questrade.oneTrustIdentifier}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>KYC Income</td>
                                                <td className='text-start ps-5'>{item.questrade.kycIncome}</td>

                                            </tr>

                                            <tr>
                                                <td className='text-start ps-5'>Tenure</td>
                                                <td className='text-start ps-5'>{item.questrade.tenure}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Area Average Invest </td>
                                                <td className='text-start ps-5'>{item.questrade.areaAvgInvest}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>User Id Created Date </td>
                                                <td className='text-start ps-5'>{item.questrade.userIdCreateDate}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>User Id</td>
                                                <td className='text-start ps-5'>{item.questrade.userID}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Merge Policy Id</td>
                                                <td className='text-start ps-5'>{item.allData.mergePolicy.id}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Last Modified At</td>
                                                <td className='text-start ps-5'>{item.allData.lastModifiedAt}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Master Profile Id</td>
                                                <td className='text-start ps-5'>{item.questrade.masterProfileID}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>UVVID</td>
                                                <td className='text-start ps-5'>{item.questrade.UVVID}</td>

                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>CLPID</td>
                                                <td className='text-start ps-5'>{item.questrade.clpID}</td>

                                            </tr>

                                        </React.Fragment>
                                    )) :
                                        <tr>"No Result"</tr>
                                    }

                                    {questrade.length > 0 ? questrade.map(item => (
                                        <React.Fragment className="border border-info mt-3">
                                            <tr>
                                                <td className='text-start ps-5'>Concent Date</td>
                                                <td className='text-start ps-5'>{item.consentDate}</td>
                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Concent Name</td>
                                                <td className='text-start ps-5'>{item.name}</td>
                                            </tr>
                                            <tr>
                                                <td className='text-start ps-5'>Concent Status</td>
                                                <td className='text-start ps-5'>{item.status}</td>
                                            </tr>
                                        </React.Fragment>
                                    ))
                                        :
                                        <React.Fragment><tr></tr></React.Fragment>

                                    }

                                </tbody>
                            </table>
                        </div>
                    )
                    }
                    {active === 'link-1' && (
                        <div className='w-full overflow-scroll'>
                            <table className='table table-striped table-responsive border p-2 mt-3'>
                                <thead>
                                    <tr>
                                        <th>SlNo</th>
                                        <th>Total Merged Profile</th>
                                        <th>Total Profit Count</th>
                                        <th>Last Sampled Timestamp</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {/* {profile.map((item, index) => ( */}
                                    <tr >
                                        <td></td>
                                        <td>{profile.totalRows}</td>
                                        <td>{profile.totalFragmentCount}</td>
                                        <td>{profile.lastSampledTimestamp}</td>
                                        <td>{profile.status}</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    )
                    }
                    {active === 'link-2' && (
                        <div className='w-full overflow-scroll'>
                            <table className='table table-responsive table-striped border p-2 mt-3'>
                                <thead>
                                    <tr>
                                        <th>SlNo</th>
                                        <th>Audience Id</th>
                                        <th>Audience Name</th>
                                        <th>Description</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredSegments.length > 0 ? (
                                        filteredSegments.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.id}</td>
                                                <td>{item.name}</td>
                                                <td>{item.description}</td>
                                                <td></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr></tr>
                                    )}

                                </tbody>
                            </table>
                        </div>
                    )
                    }

                    {active === 'link-3' && (
                        <div className='w-full overflow-scroll'>
                            <button onClick={getAllDatasets}>Get Journey Details</button>
                            <table className='table table-responsive table-striped border p-2 mt-3'>
                                <thead>
                                    <tr>
                                        <th>SlNo</th>
                                        <th>Journey Version Name</th>
                                        <th>ID</th>

                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dataset.length > 0 ? (
                                        dataset.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item["_experience.journeyOrchestration.stepEvents.journeyVersionName"]}</td>
                                                <td>{item["_experience.journeyOrchestration.stepEvents.journeyVersionID"]
                                                }</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr></tr>
                                    )}

                                </tbody>
                            </table>
                        </div>
                    )
                    }
                </div>
            </div>
            <Query clpId={clpId} token={token} setPostQueryFunction={setPostQueryFunction} />
        </>

    )
}

export default Home