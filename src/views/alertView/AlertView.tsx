import React, { useState, useEffect } from 'react';
import './AlertView.css';
import axios from 'axios';
import Header from '../../components/header/Header';
import Table from '../../components/Table';

const AlertView: React.FC = () => {
  return (
    <div>
      <header>
        <Header />
      </header>
      <div>
        <Table />
      </div>
    </div>
  );
};

export default AlertView;
