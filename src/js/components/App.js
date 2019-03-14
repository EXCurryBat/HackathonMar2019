import React from 'react';
import { Grid } from 'semantic-ui-react';
import Toolbar from './Toolbar';
import MapModule from './Map';
import SidePanel from './SidePanel';
import InfoDialog from './InfoDialog';
import WelcomeDialog from './WelcomeDialog';

const App = () => {
    return (
        <div className="App" style={{'overflow': 'hidden'}}>
            <Toolbar />
            <Grid>
                <Grid.Column width={3}>
                    <SidePanel />
                </Grid.Column>
                <Grid.Column width={13}>
                    <MapModule />
                </Grid.Column>
            </Grid>
            <InfoDialog />
            <WelcomeDialog />
        </div>
    );
};

export default App;