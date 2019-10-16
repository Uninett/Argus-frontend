import React, { useState, useEffect } from 'react';
import './AlertView.css';
import axios from 'axios';
import Header from '../../components/header/Header';
import Table from '../../components/react-table/Table';
import '../../components/react-table/table.css';

const AlertView: React.FC = () => {
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

export default AlertView;
