import React from 'react';

const Page = () => {
    return (
        <div>
            Dashboard

            <div className="p-2.5">
                <p>CPU MGMT</p>
                <p>50%</p>
            </div>

            <p className=""></p>

            <div className="p-2.5">
                <p>RAM MGMT</p>
                <p>50%</p>
            </div>

            <div className="p-2.5">
                <p>AGENT CPU</p>
                <p>50%</p>
            </div>

            <div className="p-2.5">
                <p>SEC MODE</p>
                <p>DEGRADED</p>
            </div>

            <div className="p-2.5">
                <p>TIME</p>
                <p>23:78:09</p>
            </div>


            <div className="p-2.5">
                <h3> Last alerts</h3>
                <table>
                    <tr>
                        <th>Alert</th>
                        <th>Time</th>
                        <th>Rule</th>
                        <th>Action</th>
                    </tr>
                    <tr>
                        <td>User XX Cred usage</td>
                        <td>16:09:09</td>
                        <td>[sys] bad-signature</td>
                        <td>CHECK</td>
                    </tr>
                    <tr>
                        <td>Dublicate X-ID</td>
                        <td>16:09:09</td>
                        <td>[sys] id-dub</td>
                        <td>CHECK</td>
                    </tr>
                </table>

            </div>

        </div>
    );
};

export default Page;