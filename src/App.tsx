import React from 'react';
import AlertView from './components/alertView/AlertView';

const App: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '10%' }}>
      <h1 style={{ color: 'lightBlue' }}>Hello AAS-FRONTEND!</h1>
      <AlertView />
    </div>
  );
};

export default App;
