import React from 'react';
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";

const Page = () => {
    return (
        <div>
            <h1>Dashboard</h1>

            <Card className="p-2.5">
                <p>ALERT ID</p>
                <p></p>
            </Card>

            <p className=""></p>

            <Card className="p-2.5">
                <p>ALERT IP</p>
                <p>127.0.0.1</p>
                <Button>Check users from this ip</Button>
            </Card>

            <Card className="p-2.5">
                <p>ALERT_META</p>
                <p>{'{"user":"AAA", "userId":1}'}</p>
            </Card>

            <Card className="p-2.5">
                <p>RULE</p>
                <p>[sys] opensosal</p>
            </Card>


            <p>
                <Button>
                    BAN IP
                </Button>
                <Button>
                    Freeze User login
                </Button>
                <Button>
                    Ban User login
                </Button>
                <Button>
                    Mark as resolved
                </Button>
            </p>

        </div>
    );
};

export default Page;