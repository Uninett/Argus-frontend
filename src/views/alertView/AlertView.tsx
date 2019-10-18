import React from 'react';
import './AlertView.css';
import Header from '../../components/header/Header';
import Table from '../../components/react-table/Table';
import '../../components/react-table/table.css';
import { withRouter } from 'react-router-dom';
type PropType = {
  history: any;
};

const AlertView: React.FC<PropType> = props => {
  return (
    <div>
      <header>
        <Header />
      </header>
      <div className='table'>
        <Table />
      </div>
    </div>
  );
};

export default withRouter(AlertView);
